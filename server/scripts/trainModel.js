/**
 * Model Training Script — Train XGBoost model for fraud detection
 * 
 * Usage:
 *   node scripts/trainModel.js
 * 
 * The script:
 * 1. Fetches labeled training data from MongoDB
 * 2. Extracts features and labels
 * 3. Trains XGBoost model
 * 4. Evaluates model performance
 * 5. Saves model to database
 */

const mongoose = require("mongoose");
const FraudTrainingData = require("../models/FraudTrainingData");
const MLModel = require("../models/MLModel");
const fraudDetector = require("../ml/fraudDetector");

require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ciphervote";

async function trainModel() {
  console.log("=".repeat(60));
  console.log("CipherVote ML Model Training");
  console.log("=".repeat(60));
  
  // Connect to MongoDB
  console.log("\n📦 Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
  
  // Check for labeled data
  console.log("\n📊 Checking labeled training data...");
  const labeledCount = await FraudTrainingData.countDocuments({ 
    isFraud: { $ne: null } 
  });
  
  console.log(`Found ${labeledCount} labeled samples`);
  
  if (labeledCount < 100) {
    console.log("\n⚠️  Not enough labeled data for training.");
    console.log(`Minimum required: 100 samples`);
    console.log(`Current labeled samples: ${labeledCount}`);
    console.log("\n📝 To train a model:");
    console.log("1. Use the AI Security Dashboard");
    console.log("2. Review flagged fraud predictions");
    console.log("3. Label predictions as true_positive or false_positive");
    console.log("4. Collect at least 100 labeled samples");
    console.log("5. Run this script again");
    
    process.exit(0);
  }
  
  console.log("\n🚀 Training XGBoost model...");
  
  try {
    const model = await fraudDetector.trainModel();
    
    if (!model) {
      console.log("\n⚠️  Training failed. Check logs for details.");
      process.exit(1);
    }
    
    console.log("\n✅ Model trained successfully!");
    console.log(`   Version: ${model.version}`);
    console.log(`   Training data size: ${model.trainingDataSize}`);
    console.log(`   Accuracy: ${model.accuracy}`);
    console.log(`   Precision: ${model.precision}`);
    console.log(`   Recall: ${model.recall}`);
    console.log(`   F1 Score: ${model.f1Score}`);
    console.log(`   ROC AUC: ${model.rocAuc}`);
    
    // Offer to activate the model
    console.log("\n🎯 Activate this model? (y/n)");
    console.log("   Note: This will deactivate all other versions.");
    
  } catch (err) {
    console.error("\n❌ Training failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Training complete!");
  }
}

// Run training
trainModel();
