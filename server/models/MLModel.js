const mongoose = require("mongoose");

/**
 * MLModel — Stores trained ML models with metadata for versioning.
 * Supports model A/B testing and rollback.
 */
const MLModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  version: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["xgboost", "randomforest", "lightgbm", "isolationforest", "logisticregression"],
    default: "xgboost"
  },
  
  // Model metadata
  description: { type: String },
  trainingConfig: { type: Object },
  featureList: [{ type: String }],
  
  // Performance metrics
  accuracy: { type: Number },
  precision: { type: Number },
  recall: { type: Number },
  f1Score: { type: Number },
  rocAuc: { type: Number },
  confusionMatrix: { type: Object },
  
  // Training data stats
  trainingDataSize: { type: Number },
  lastTrained: { type: Number },
  
  // Model weights (serialized)
  // In production, these would be stored in files or object storage
  modelWeights: { type: Object },
  
  // Status
  isActive: { type: Boolean, default: false },
  deploymentDate: { type: Number },
  
  // Deprecation
  isDeprecated: { type: Boolean, default: false },
  deprecatedAt: { type: Number }
}, {
  timestamps: true
});

// Indexes
MLModelSchema.index({ name: 1, version: -1 }, { unique: true });
MLModelSchema.index({ isActive: 1 });
MLModelSchema.index({ isDeprecated: 1 });

// Method: Set model as active (deactivating others)
MLModelSchema.statics.activate = async function(modelId) {
  // Deactivate all other models of same name
  await this.updateMany(
    { name: modelId.name, type: modelId.type },
    { isActive: false }
  );
  
  // Activate this model
  return this.findByIdAndUpdate(modelId, { isActive: true, deploymentDate: Date.now() }, { new: true });
};

module.exports = mongoose.model("MLModel", MLModelSchema);
