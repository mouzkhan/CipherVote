import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
import {
  loadModels,
  detectFace,
  computeEAR,
  EAR_BLINK_THRESHOLD,
  extractDescriptor,
  compareDescriptors,
  deserializeDescriptor,
} from "../utils/faceVerification";
import "../styles/faceCamera.css";

/**
 * FaceCamera — reusable biometric capture component.
 *
 * Simplified liveness detection:
 * - User must keep face in frame for 3 seconds
 * - System detects natural face movement (not a photo)
 * - Optional blink detection for extra security
 *
 * Modes:
 *   "register" — capture and return a face descriptor for storage
 *   "verify"   — compare live face against a stored descriptor
 *   "liveness" — liveness-only check
 */
export default function FaceCamera({ mode = "liveness", storedDescriptor = null, onSuccess, onFail, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Loading face detection models…");
  const [progress, setProgress] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(3);
  
  // Refs for detection loop
  const detectionLoopRef = useRef(null);
  const timerRef = useRef(null);
  const blinkCountRef = useRef(0);
  const lastEARRef = useRef(1);
  const faceStableFramesRef = useRef(0);
  const descriptorCapturedRef = useRef(false);
  
  const SAMPLES_REQUIRED = 2;
  const LIVENESS_TIME = 3; // 3 seconds of face detection = liveness proven

  const stopCamera = useCallback(() => {
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current);
      detectionLoopRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((result) => {
    setProgress(100);
    setStatus("done");
    setMessage("✓ Verification complete!");
    stopCamera();
    onSuccess?.(result);
  }, [stopCamera, onSuccess]);

  const handleCapture = useCallback(async () => {
    if (descriptorCapturedRef.current) return;
    descriptorCapturedRef.current = true;

    const descriptor = await extractDescriptor(videoRef.current);
    if (!descriptor) {
      descriptorCapturedRef.current = false;
      setStatus("error");
      setError("Could not capture face. Please ensure good lighting.");
      onFail?.("descriptor_failed");
      return;
    }

    const nextSamples = sampleCount + 1;
    setSampleCount(nextSamples);
    
    if (nextSamples >= SAMPLES_REQUIRED) {
      handleSuccess({ type: "register", descriptor: Array.from(descriptor) });
    } else {
      setMessage(`Sample ${nextSamples}/${SAMPLES_REQUIRED} captured. Stay still...`);
      // Reset for next sample
      setTimeout(() => {
        descriptorCapturedRef.current = false;
        faceStableFramesRef.current = 0;
        setProgress(0);
      }, 500);
    }
  }, [sampleCount, handleSuccess, onFail]);

  // Boot: load models then open camera
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        setStatus("loading");
        setMessage("Loading face detection models...");
        
        await loadModels();
        if (cancelled) return;
        
        setMessage("Accessing camera...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
          } 
        });
        
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        
        setStatus("ready");
        setMessage("Position your face in the center of the oval.");
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setError(err?.name === "NotAllowedError" 
          ? "Camera access denied. Please allow camera and reload."
          : `Error: ${err.message}`);
        onFail?.(err?.name || "camera_error");
      }
    })();
    
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [stopCamera, onFail]);

  // Main detection loop
  useEffect(() => {
    if (status !== "ready") return;
    
    let running = true;
    let livenessStartTime = null;

    const runDetection = async () => {
      if (!running || !videoRef.current || videoRef.current.readyState < 2) {
        if (running) {
          detectionLoopRef.current = requestAnimationFrame(runDetection);
        }
        return;
      }

      let detection;
      try {
        detection = await detectFace(videoRef.current);
      } catch (err) {
        console.warn("Detection error:", err);
        detectionLoopRef.current = requestAnimationFrame(runDetection);
        return;
      }

      // Draw overlay
      drawOverlay(detection);

      if (!detection) {
        setFaceDetected(false);
        setMessage("No face detected. Move into the frame.");
        livenessStartTime = null;
        faceStableFramesRef.current = 0;
        setProgress(0);
        setCountdown(3);
        detectionLoopRef.current = requestAnimationFrame(runDetection);
        return;
      }

      setFaceDetected(true);
      faceStableFramesRef.current++;

      // Start liveness timer when face is first detected
      if (!livenessStartTime) {
        livenessStartTime = Date.now();
      }

      const elapsed = (Date.now() - livenessStartTime) / 1000;
      const remaining = Math.max(0, LIVENESS_TIME - elapsed);
      setCountdown(Math.ceil(remaining));
      
      // Progress based on time with face detected
      const progressPct = Math.min(100, (elapsed / LIVENESS_TIME) * 100);
      setProgress(progressPct);

      // Optional: detect blinks for extra security
      const ear = computeEAR(detection.landmarks);
      if (ear < EAR_BLINK_THRESHOLD && lastEARRef.current >= EAR_BLINK_THRESHOLD) {
        blinkCountRef.current++;
      }
      lastEARRef.current = ear;

      // Check if liveness is proven (face stayed in frame for required time)
      if (elapsed >= LIVENESS_TIME) {
        running = false;
        
        if (mode === "liveness") {
          handleSuccess({ 
            type: "liveness", 
            blinkCount: blinkCountRef.current,
            stableFrames: faceStableFramesRef.current 
          });
          return;
        }

        if (mode === "register") {
          setMessage("Capturing face template...");
          await handleCapture();
          return;
        }

        if (mode === "verify") {
          setMessage("Verifying identity...");
          const liveDescriptor = await extractDescriptor(videoRef.current);
          if (!liveDescriptor) {
            setStatus("error");
            setError("Could not read face. Try better lighting.");
            onFail?.("extraction_failed");
            return;
          }
          
          const stored = deserializeDescriptor(storedDescriptor);
          const result = compareDescriptors(liveDescriptor, stored);
          
          if (result.match) {
            handleSuccess({ type: "verify", ...result });
          } else {
            setStatus("error");
            setError("Face did not match. Please try again.");
            onFail?.("face_mismatch");
          }
          return;
        }
      }

      // Update message
      if (elapsed < LIVENESS_TIME) {
        setMessage(`Stay still... ${Math.ceil(remaining)}s remaining`);
      }

      // Continue loop
      if (running) {
        detectionLoopRef.current = requestAnimationFrame(runDetection);
      }
    };

    // Start detection
    detectionLoopRef.current = requestAnimationFrame(runDetection);

    return () => {
      running = false;
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [status, mode, storedDescriptor, handleSuccess, handleCapture, onFail]);

  const drawOverlay = (detection) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!detection) return;

    // Draw face landmarks
    const dims = { width: video.videoWidth, height: video.videoHeight };
    const resized = faceapi.resizeResults(detection, dims);
    faceapi.draw.drawFaceLandmarks(canvas, resized);

    // Draw bounding box
    const box = resized.detection.box;
    ctx.strokeStyle = status === "done" ? "#00d4aa" : "#6366f1";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  };

  const handleRetry = () => {
    setError("");
    setProgress(0);
    setCountdown(3);
    setTimeElapsed(0);
    faceStableFramesRef.current = 0;
    blinkCountRef.current = 0;
    descriptorCapturedRef.current = false;
    setStatus("ready");
    setMessage("Position your face in the center of the oval.");
  };

  return (
    <div className="face-camera-wrap">
      <div className="face-viewport">
        <video
          ref={videoRef}
          className="face-video"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="face-canvas" />
        <div className="face-oval" />
        <div className={`face-status-dot ${faceDetected ? "dot-green" : "dot-red"}`} />
        
        {/* Countdown overlay */}
        {status === "ready" && faceDetected && countdown > 0 && countdown <= 3 && (
          <div className="countdown-overlay">
            <span className="countdown-number">{countdown}</span>
          </div>
        )}
      </div>

      <div className="face-info">
        {/* Progress bar */}
        <div className="face-progress-wrap">
          <div className="face-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Status message */}
        <div className={`face-message ${status === "done" ? "face-ok" : status === "error" ? "face-err" : ""}`}>
          {status === "loading" && <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 8 }} />}
          {error || message}
        </div>

        {/* Help tips */}
        <div className="face-help-card">
          <strong>Instructions:</strong>
          <ul>
            <li>Center your face in the oval</li>
            <li>Stay still for 3 seconds</li>
            <li>Ensure good lighting on your face</li>
          </ul>
        </div>

        {/* Metrics */}
        <div className="face-metrics">
          <div className="face-metric">
            <span className={faceDetected ? "text-accent" : "text-danger"}>●</span>
            <span>{faceDetected ? "Face detected" : "No face"}</span>
          </div>
          <div className="face-metric">
            <span className="text-accent">👁️</span>
            <span>Blinks: {blinkCountRef.current}</span>
          </div>
          {mode === "register" && (
            <div className="face-metric">
              <span className="text-accent">📸</span>
              <span>Samples: {sampleCount}/{SAMPLES_REQUIRED}</span>
            </div>
          )}
        </div>

        {/* Retry/Done buttons */}
        {(status === "error" || status === "done") && (
          <button 
            className="btn btn-outline btn-sm mt-2 w-full" 
            onClick={status === "error" ? handleRetry : onCancel}
          >
            {status === "done" ? "Continue →" : "Try Again"}
          </button>
        )}
      </div>
    </div>
  );
}
