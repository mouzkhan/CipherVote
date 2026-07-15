/**
 * Download face-api.js models from official CDN
 * Run with: node scripts/download-face-models.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Ensure directory exists
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

const MODELS = [
  // Tiny Face Detector (fast, lightweight)
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: `${BASE_URL}/tiny_face_detector_model-weights_manifest.json`
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: `${BASE_URL}/tiny_face_detector_model-shard1`
  },
  // Face Landmark 68 points
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: `${BASE_URL}/face_landmark_68_model-weights_manifest.json`
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: `${BASE_URL}/face_landmark_68_model-shard1`
  },
  // Face Recognition
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: `${BASE_URL}/face_recognition_model-weights_manifest.json`
  },
  {
    name: 'face_recognition_model-shard1',
    url: `${BASE_URL}/face_recognition_model-shard1`
  },
  {
    name: 'face_recognition_model-shard2',
    url: `${BASE_URL}/face_recognition_model-shard2`
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded: ${path.basename(dest)}`);
            resolve();
          });
        }).on('error', (err) => {
          fs.unlink(dest, () => {});
          reject(err);
        });
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(dest)}`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('📦 Downloading face-api.js models...\n');
  
  for (const model of MODELS) {
    const dest = path.join(MODELS_DIR, model.name);
    
    // Check if already exists
    if (fs.existsSync(dest)) {
      const stats = fs.statSync(dest);
      if (stats.size > 1000) { // File has reasonable size
        console.log(`⏭  Already exists: ${model.name}`);
        continue;
      } else {
        console.log(`⚠️  File too small, re-downloading: ${model.name}`);
        fs.unlinkSync(dest);
      }
    }
    
    try {
      await downloadFile(model.url, dest);
    } catch (err) {
      console.error(`❌ Failed to download ${model.name}:`, err.message);
    }
  }
  
  console.log('\n✅ All face-api models ready in public/models/');
  
  // Print file sizes
  console.log('\nFile sizes:');
  const files = fs.readdirSync(MODELS_DIR);
  for (const file of files) {
    const stats = fs.statSync(path.join(MODELS_DIR, file));
    console.log(`  ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
  }
}

main().catch(console.error);
