/**
 * Face Verification Utility — CipherVote Biometric Layer
 *
 * Uses face-api.js (Tensorflow.js based) to provide:
 *   1. Face detection & presence check
 *   2. Liveness detection via Eye Aspect Ratio (EAR) blink analysis
 *   3. Face descriptor extraction for registration/matching
 *   4. Match scoring between registered descriptor and live scan
 *
 * Research basis:
 *   - Soukupová & Čech (2016). Real-Time Eye Blink Detection using Facial Landmarks.
 *   - Dlib 68-point facial landmark model (King, 2009) via face-api.js port.
 *
 * Privacy note: Face descriptors are 128-dimensional float vectors.
 * The original image is NEVER stored — only the descriptor (which cannot
 * be reversed back into a face image). This satisfies GDPR-style biometric
 * data minimization principles.
 */

import * as faceapi from "face-api.js";

let modelsLoaded = false;

const MODEL_URL = `${process.env.PUBLIC_URL || ""}/models`;

/**
 * Load all required neural network models once.
 * Subsequent calls are no-ops.
 */
export async function loadModels() {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (err) {
    console.warn("Face model loading failed:", err);
    throw err;
  }
}

/**
 * Tiny detector options — fast enough for real-time (~30ms per frame).
 */
const DETECTOR_OPTIONS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

/**
 * Detect a single face in a video element.
 * Returns full detection with landmarks + descriptor, or null if no face found.
 */
export async function detectFace(videoEl) {
  const detection = await faceapi
    .detectSingleFace(videoEl, DETECTOR_OPTIONS)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection || null;
}

/**
 * Eye Aspect Ratio (EAR) — Soukupová & Čech (2016).
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Falls below ~0.21 during a blink.
 *
 * Landmark indices (0-indexed from face-api 68-point model):
 *   Left eye:  36-41
 *   Right eye: 42-47
 */
function euclidean(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function eyeAspectRatio(eye) {
  const a = euclidean(eye[1], eye[5]);
  const b = euclidean(eye[2], eye[4]);
  const c = euclidean(eye[0], eye[3]);
  return (a + b) / (2.0 * c);
}

export function computeEAR(landmarks) {
  const pts = landmarks.positions;
  const leftEye  = pts.slice(36, 42);
  const rightEye = pts.slice(42, 48);
  return (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;
}

// Threshold increased for better detection - 0.25 is more lenient
// Original 0.21 was too strict for many users
export const EAR_BLINK_THRESHOLD = 0.25; // below this = eyes closed

// Minimum frames eyes must be closed to count as a blink
export const BLINK_FRAMES_MIN = 2;

/**
 * Extract a 128-d descriptor array from a video frame.
 * Returns Float32Array or null.
 */
export async function extractDescriptor(videoEl) {
  try {
    const detection = await detectFace(videoEl);
    if (!detection) return null;
    return detection.descriptor || null; // Float32Array(128)
  } catch (err) {
    console.warn("Face descriptor extraction failed:", err);
    return null;
  }
}

/**
 * Compare two descriptors using Euclidean distance.
 * face-api.js convention: distance < 0.6 = same person.
 * We use 0.5 for higher security in a voting context.
 */
export function compareDescriptors(desc1, desc2) {
  const distance = faceapi.euclideanDistance(desc1, desc2);
  const match    = distance < 0.50;
  const confidence = Math.max(0, Math.round((1 - distance / 0.5) * 100));
  return { distance: +distance.toFixed(4), match, confidence };
}

/**
 * Serialize a Float32Array descriptor to a plain array for storage in
 * Firebase/MongoDB (JSON-serializable).
 */
export function serializeDescriptor(descriptor) {
  return Array.from(descriptor);
}

/**
 * Deserialize stored array back to Float32Array for comparison.
 */
export function deserializeDescriptor(arr) {
  return new Float32Array(arr);
}
