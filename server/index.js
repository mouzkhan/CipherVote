require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const Election     = require("./models/Election");
const Vote         = require("./models/Vote");
const AuditEntry   = require("./models/AuditEntry");
const { Voter, VoterRegistration, VoteRecord } = require("./models/Voter");
const SecurityEvent = require("./models/SecurityEvent");
const Organization = require("./models/Organization");
const PLANS        = require("./models/ServicePlan");
const BiometricProfile = require("./models/BiometricProfile");
const FraudTrainingData = require("./models/FraudTrainingData");
const MLModel = require("./models/MLModel");
const fraudDetector = require("./ml/fraudDetector");

// Helper: generate a random API key for VaaS tenants
function generateApiKey() {
  return "cv_" + require("crypto").randomBytes(24).toString("hex");
}

// ML Model Inference (cached for performance)
let currentModel = null;

async function getCachedModel() {
  if (!currentModel) {
    currentModel = await MLModel.findOne({ isActive: true, isDeprecated: false })
      .sort({ version: -1 })
      .exec();
  }
  return currentModel;
}

// Helper: generate unique invitation code for elections
function generateInvitationCode() {
  return require("crypto").randomBytes(6).toString("hex").toUpperCase();
}

const app = express();
const rateLimitMap = new Map();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const uploadPath = path.join(__dirname, "../public/uploads");
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.random().toString(36).substring(2, 9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

const fallbackStore = {
  elections: [],
  votes: [],
  auditEntries: [],
  voters: [],
  voterRegistrations: [],
  biometricProfiles: [],
  securityEvents: [],
  organizations: [],
};

function isDbReady() {
  return mongoose.connection.readyState === 1;
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const bucket = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60000 };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60000;
  }
  bucket.count += 1;
  rateLimitMap.set(ip, bucket);
  if (bucket.count > 80) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
  next();
}

// Enhanced CORS configuration for mobile and all origins
const corsOptions = {
  origin: function(origin, callback) {
    // Allow all origins (development + production)
    // In production, you might want to restrict this to your frontend domain
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(rateLimit);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ciphervote";

mongoose.connect(MONGO_URI)
  .then(() => console.log(`✅ MongoDB connected: ${MONGO_URI}`))
  .catch((err) => {
    console.warn("⚠️ MongoDB connection failed, continuing in fallback mode:", err.message);
  });

// ── Elections ──────────────────────────────────────────────────

app.get("/api/elections", async (req, res) => {
  try {
    if (!isDbReady()) {
      const filter = req.query.status ? { status: req.query.status } : {};
      const filterOrg = req.query.organizationId 
        ? { organizationId: req.query.organizationId } 
        : {};
      const elections = fallbackStore.elections.filter((entry) => {
        if (filter.status && entry.status !== filter.status) return false;
        if (filterOrg.organizationId && entry.organizationId !== filterOrg.organizationId) return false;
        return true;
      });
      return res.json(elections);
    }
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.organizationId) query.organizationId = req.query.organizationId;
    const elections = await Election.find(query).sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/elections", async (req, res) => {
  try {
    if (!isDbReady()) {
      const el = { ...req.body, _id: makeId("election"), invitationCode: generateInvitationCode(), createdAt: Date.now() };
      fallbackStore.elections.unshift(el);
      return res.json(el);
    }
    const electionData = {
      ...req.body,
      invitationCode: generateInvitationCode(),
    };
    const el = await Election.create(electionData);
    res.json(el);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.patch("/api/elections/:id", async (req, res) => {
  try {
    const el = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!el) return res.status(404).json({ error: "Not found" });
    res.json(el);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete("/api/elections/:id", async (req, res) => {
  try {
    await Election.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Election by invitation code ───────────────────────────────
app.get("/api/elections/by-code/:code", async (req, res) => {
  try {
    if (!isDbReady()) {
      const election = fallbackStore.elections.find((e) => e.invitationCode === req.params.code);
      if (!election) return res.status(404).json({ error: "Election not found" });
      return res.json(election);
    }
    const election = await Election.findOne({ invitationCode: req.params.code });
    if (!election) return res.status(404).json({ error: "Election not found" });
    res.json(election);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── File upload for candidate photos ───────────────────────────
app.post("/api/upload/candidate-photo", (req, res) => {
  const uploadSingle = upload.single("photo");
  
  uploadSingle(req, res, function (err) {
    if (err) {
      console.error("Upload error:", err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({ photoUrl });
  });
});

// ── Organization dashboard analytics ───────────────────────────
app.get("/api/organizations/:orgId/dashboard", async (req, res) => {
  try {
    const { orgId } = req.params;
    
    if (!isDbReady()) {
      const orgElections = fallbackStore.elections.filter((e) => e.organizationId === orgId);
      const totalElections = orgElections.length;
      const activeElections = orgElections.filter((e) => e.status === "active").length;
      const upcomingElections = orgElections.filter((e) => e.status === "draft").length;
      const completedElections = orgElections.filter((e) => e.status === "closed").length;
      const totalVotes = orgElections.reduce((sum, e) => sum + (e.totalVotes || 0), 0);
      const registeredVoters = fallbackStore.voterRegistrations.filter(
        (r) => orgElections.some((e) => e._id === r.electionId)
      ).length;
      
      return res.json({
        totalElections,
        activeElections,
        upcomingElections,
        completedElections,
        registeredVoters,
        votesCast: totalVotes,
        recentElections: orgElections.slice(0, 5),
      });
    }
    
    const orgElections = await Election.find({ organizationId: orgId });
    const totalElections = orgElections.length;
    const activeElections = orgElections.filter((e) => e.status === "active").length;
    const upcomingElections = orgElections.filter((e) => e.status === "draft").length;
    const completedElections = orgElections.filter((e) => e.status === "closed").length;
    const totalVotes = orgElections.reduce((sum, e) => sum + (e.totalVotes || 0), 0);
    
    const electionIds = orgElections.map((e) => e._id.toString());
    const registeredVoters = await VoterRegistration.countDocuments({
      electionId: { $in: electionIds },
    });
    
    res.json({
      totalElections,
      activeElections,
      upcomingElections,
      completedElections,
      registeredVoters,
      votesCast: totalVotes,
      recentElections: await Election.find({ organizationId: orgId })
        .sort({ createdAt: -1 })
        .limit(5),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Election results ───────────────────────────────────────────
app.get("/api/elections/:id/results", async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ error: "Election not found" });
    
    // Only show results if election is closed or if organization requests it
    const results = election.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      photo: candidate.photo,
      description: candidate.description,
      position: candidate.position,
      votes: candidate.votes || 0,
      percentage: election.totalVotes > 0 
        ? ((candidate.votes || 0) / election.totalVotes * 100).toFixed(2) 
        : 0,
    })).sort((a, b) => b.votes - a.votes);
    
    const winner = results.length > 0 ? results[0] : null;
    const totalVotes = election.totalVotes || 0;
    
    res.json({
      electionId: election._id,
      electionTitle: election.title,
      status: election.status,
      totalVotes,
      candidates: results,
      winner: election.status === "closed" ? winner : null,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Voter registration via invitation link ───────────────────────
app.post("/api/voters/register-by-invitation", async (req, res) => {
  try {
    const { electionId, fullName, email, phone, nationalId, password } = req.body;
    if (!electionId || !fullName || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    if (!isDbReady()) {
      const existing = fallbackStore.voterRegistrations.find(
        (r) => r.electionId === electionId && r.email === email
      );
      if (existing) return res.status(409).json({ error: "Already registered for this election" });
      
      const registration = {
        _id: makeId("voterreg"),
        electionId,
        fullName,
        email,
        phone: phone || "",
        nationalId: nationalId || "",
        password: password, // Store password for authentication
        biometricVerified: false,
        hasVoted: false,
        registeredAt: Date.now(),
      };
      fallbackStore.voterRegistrations.push(registration);
      return res.json({ ok: true, registration });
    }
    
    const existing = await VoterRegistration.findOne({ electionId, email });
    if (existing) return res.status(409).json({ error: "Already registered for this election" });
    
    const registration = await VoterRegistration.create({
      electionId,
      fullName,
      email,
      phone: phone || "",
      nationalId: nationalId || "",
      password: password, // Store password for authentication
      biometricVerified: false,
      hasVoted: false,
    });
    res.json({ ok: true, registration });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Verify voter credentials (for AI fraud detection testing) ───────────────────────
app.post("/api/voters/verify-credentials", async (req, res) => {
  try {
    const { electionId, email, password } = req.body;
    if (!electionId || !email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    if (!isDbReady()) {
      const voter = fallbackStore.voterRegistrations.find(
        (r) => r.electionId === electionId && r.email === email
      );
      
      if (!voter) {
        return res.status(401).json({ valid: false, error: "Voter not found" });
      }

      // Simple password check (in production, use bcrypt)
      if (voter.password !== password) {
        return res.status(401).json({ valid: false, error: "Invalid password" });
      }

      return res.json({ valid: true, voter });
    }

    const voter = await VoterRegistration.findOne({ electionId, email });
    if (!voter) {
      return res.status(401).json({ valid: false, error: "Voter not found" });
    }

    if (voter.password !== password) {
      return res.status(401).json({ valid: false, error: "Invalid password" });
    }

    res.json({ valid: true, voter });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Voter login (for re-login and duplicate vote detection) ─────────────────────
app.post("/api/voters/login", async (req, res) => {
  try {
    const { electionId, email, password, userAgent } = req.body;
    if (!electionId || !email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    if (!isDbReady()) {
      const voter = fallbackStore.voterRegistrations.find(
        (r) => r.electionId === electionId && r.email === email
      );
      
      if (!voter) {
        return res.status(401).json({ valid: false, error: "Voter not found" });
      }

      // Password validation
      if (voter.password !== password) {
        return res.status(401).json({ valid: false, error: "Invalid password" });
      }

      // Check if already voted
      const voteRecord = fallbackStore.votes.find(
        (v) => v.electionId === electionId && v.email === email
      );

      if (voteRecord) {
        // Duplicate vote detected - call fraud detector
        const fraudScore = 85; // High fraud score for duplicate voting
        const fraudData = {
          alreadyVoted: true,
          fraudDetected: true,
          riskScore: fraudScore,
          riskLevel: "CRITICAL",
          reason: "Duplicate vote detected - voter has already cast a vote in this election",
          detectionSignals: [
            { signal: "DUPLICATE_VOTE", points: 40 },
            { signal: "RE_LOGIN_ATTEMPT", points: 25 },
            { signal: "SAME_EMAIL", points: 20 }
          ],
          votedAt: voteRecord.votedAt,
          blockedAt: Date.now()
        };

        return res.status(403).json({
          valid: false,
          fraudDetected: true,
          fraudData: fraudData,
          error: "Vote blocked - duplicate voting detected"
        });
      }

      return res.json({ valid: true, voter, fraudDetected: false });
    }

    const voter = await VoterRegistration.findOne({ electionId, email });
    if (!voter) {
      return res.status(401).json({ valid: false, error: "Voter not found" });
    }

    // Password validation (in production, use bcrypt)
    if (voter.password !== password) {
      return res.status(401).json({ valid: false, error: "Invalid password" });
    }

    // Check if already voted using Vote model
    const voteRecord = await Vote.findOne({ electionId, email });

    if (voteRecord) {
      // Duplicate vote detected - call fraud detector
      const fraudScore = 85;
      const fraudData = {
        alreadyVoted: true,
        fraudDetected: true,
        riskScore: fraudScore,
        riskLevel: "CRITICAL",
        reason: "Duplicate vote detected - voter has already cast a vote in this election",
        detectionSignals: [
          { signal: "DUPLICATE_VOTE", points: 40 },
          { signal: "RE_LOGIN_ATTEMPT", points: 25 },
          { signal: "SAME_EMAIL", points: 20 }
        ],
        votedAt: voteRecord.timestamp,
        blockedAt: Date.now()
      };

      // Log security event
      await SecurityEvent.create({
        email,
        electionId,
        score: fraudScore,
        level: "CRITICAL",
        blocked: true,
        signals: ["DUPLICATE_VOTE", "RE_LOGIN_ATTEMPT"],
        timestamp: Date.now()
      });

      return res.status(403).json({
        valid: false,
        fraudDetected: true,
        fraudData: fraudData,
        error: "Vote blocked - duplicate voting detected"
      });
    }

    res.json({ 
      valid: true, 
      voter: {
        fullName: voter.fullName,
        email: voter.email,
        _id: voter._id
      },
      fraudDetected: false 
    });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Check voter vote status (for duplicate vote detection) ───────────────────────
app.post("/api/voters/check-vote-status", async (req, res) => {
  try {
    const { electionId, email } = req.body;
    if (!electionId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!isDbReady()) {
      const voteRecord = fallbackStore.votes.find(
        (v) => v.electionId === electionId && v.email === email
      );

      return res.json({
        hasVoted: !!voteRecord,
        votedAt: voteRecord?.votedAt || null,
        voteHash: voteRecord?.voteHash || null,
      });
    }

    const voteRecord = await Vote.findOne({ electionId, email });

    res.json({
      hasVoted: !!voteRecord,
      votedAt: voteRecord?.timestamp || null,
      voteHash: voteRecord?.voteHash || null,
    });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Voter registration and eligibility ───────────────────────
app.post("/api/voters/register", async (req, res) => {
  try {
    const payload = req.body || {};
    if (!isDbReady()) {
      const existingByEmail = fallbackStore.voterRegistrations.find((entry) => entry.email === payload.email);
      const existingByNationalId = fallbackStore.voterRegistrations.find((entry) => entry.nationalId === payload.nationalId);
      if (existingByEmail) return res.status(409).json({ error: "A registration with this email already exists." });
      if (existingByNationalId) return res.status(409).json({ error: "A registration with this national ID already exists." });
      const registration = {
        _id: makeId("voterreg"),
        uid: payload.uid || "anonymous",
        fullName: payload.fullName,
        nationalId: payload.nationalId,
        email: payload.email,
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth || "",
        address: payload.address || "",
        gender: payload.gender || "",
        organization: payload.organization || "",
        department: payload.department || "",
        studentId: payload.studentId || "",
        status: "pending",
        createdAt: Date.now(),
      };
      fallbackStore.voterRegistrations.push(registration);
      return res.json({ ok: true, registration });
    }
    const existingByEmail = await VoterRegistration.findOne({ email: payload.email });
    const existingByNationalId = await VoterRegistration.findOne({ nationalId: payload.nationalId });

    if (existingByEmail) return res.status(409).json({ error: "A registration with this email already exists." });
    if (existingByNationalId) return res.status(409).json({ error: "A registration with this national ID already exists." });

    const registration = await VoterRegistration.create({
      uid: payload.uid || "anonymous",
      fullName: payload.fullName,
      nationalId: payload.nationalId,
      email: payload.email,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth || "",
      address: payload.address || "",
      gender: payload.gender || "",
      organization: payload.organization || "",
      department: payload.department || "",
      studentId: payload.studentId || "",
      status: "pending",
    });

    res.json({ ok: true, registration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/voters/:uid", async (req, res) => {
  try {
    if (!isDbReady()) {
      const registration = fallbackStore.voterRegistrations.find((entry) => entry.uid === req.params.uid);
      if (!registration) return res.status(404).json({ error: "Registration not found." });
      return res.json(registration);
    }
    const registration = await VoterRegistration.findOne({ uid: req.params.uid });
    if (!registration) return res.status(404).json({ error: "Registration not found." });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/voters/:uid/eligibility/:electionId", async (req, res) => {
  try {
    const registration = await VoterRegistration.findOne({ uid: req.params.uid });
    const election = await Election.findById(req.params.electionId);
    const voted = await Voter.findOne({ uid: req.params.uid, electionId: req.params.electionId });

    if (!registration) return res.status(404).json({ error: "Registration not found." });
    if (!election) return res.status(404).json({ error: "Election not found." });

    res.json({
      eligible: registration.status === "verified" && election.status === "active" && !voted,
      status: registration.status,
      alreadyVoted: !!voted,
      electionOpen: election.status === "active",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Vote submission (atomic) ───────────────────────────────────

app.post("/api/vote", async (req, res) => {
  const { uid, electionId, candidateId, receiptHash, nonce, timestamp, riskScore, riskLevel } = req.body;

  if (!uid || !electionId || !candidateId || !receiptHash) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1. Check not already voted
    const existing = await Voter.findOne({ uid, electionId });
    if (existing) return res.status(409).json({ error: "Already voted in this election" });

    // 2. Fetch election
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: "Election not found" });
    if (election.status !== "active") return res.status(403).json({ error: "Election is closed" });

    // 3. Get previous chain entry
    const lastEntry = await AuditEntry.findOne({ electionId }).sort({ sequenceNumber: -1 });
    const previousHash = lastEntry ? lastEntry.chainHash : "0".repeat(64);
    const sequenceNumber = lastEntry ? lastEntry.sequenceNumber + 1 : 0;

    // 4. Compute chain hash server-side (mirrors client logic)
    const crypto = require("crypto");
    const chainHash = crypto.createHash("sha256").update(`${previousHash}:${receiptHash}`).digest("hex");

    // 5. Hybrid fraud detection
    const behavioralData = {
      mouseMovements: req.body.mouseMovements || 0,
      cursorPathLength: req.body.cursorPathLength || 0,
      typingSpeed: req.body.typingSpeed || 0,
      holdTimeMean: req.body.holdTimeMean || 0,
      flightTimeMean: req.body.flightTimeMean || 0
    };

    const context = {
      failedLogins: req.body.failedLogins || 0,
      timeOnPageMs: req.body.timeOnPageMs || 9999,
      lastSubmitMs: req.body.lastSubmitMs || 9999,
      userAgent: req.body.userAgent || "",
      hasVotedBefore: req.body.hasVotedBefore || false
    };

    const hybridScore = await fraudDetector.computeHybridScore(context, behavioralData);

    // 6. Write vote, ledger entry, voter record, security event in parallel
    const candidateIdx = election.candidates.findIndex((c) => c.id === candidateId);
    if (candidateIdx === -1) return res.status(400).json({ error: "Invalid candidate" });

    // Create security event with full explanation
    const securityEvent = await SecurityEvent.create({
      uid,
      electionId,
      score: hybridScore.score,
      level: hybridScore.level,
      blocked: hybridScore.blocked,
      signals: hybridScore.signals.map(s => s.type),
      shapExplanations: hybridScore.shapExplanation.explanations,
      mlConfidence: hybridScore.mlConfidence,
      modelVersion: hybridScore.modelVersion,
      timestamp
    });

    if (hybridScore.blocked) {
      return res.status(403).json({
        error: "Vote blocked by security system",
        riskScore: hybridScore.score,
        level: hybridScore.level,
        explanation: hybridScore.shapExplanation.explanations.map(e => e.explanation).join("; ")
      });
    }

    await Promise.all([
      Vote.create({ 
        electionId, 
        email: req.body.email || uid, // Include email for duplicate vote detection
        receiptHash, 
        nonce, 
        timestamp, 
        riskScore: hybridScore.score,
        riskLevel: hybridScore.level,
        hybridScore: hybridScore.score,
        mlConfidence: hybridScore.mlConfidence,
        modelVersion: hybridScore.modelVersion
      }),
      AuditEntry.create({ sequenceNumber, electionId, voteReceiptHash: receiptHash, previousHash, chainHash, recordedAt: timestamp }),
      Voter.create({ uid, electionId, votedAt: timestamp, receiptHash }),
      // Store training data for adaptive learning (without label yet)
      FraudTrainingData.create({
        predictionId: securityEvent._id.toString(),
        uid,
        electionId,
        failedLogins: context.failedLogins,
        timeOnPageMs: context.timeOnPageMs,
        lastSubmitMs: context.lastSubmitMs,
        userAgent: context.userAgent,
        hasVotedBefore: context.hasVotedBefore ? 1 : 0,
        mouseMovements: behavioralData.mouseMovements,
        cursorPathLength: behavioralData.cursorPathLength,
        typingSpeed: behavioralData.typingSpeed,
        holdTimeMean: behavioralData.holdTimeMean,
        flightTimeMean: behavioralData.flightTimeMean,
        ruleScore: hybridScore.ruleScore,
        mlConfidence: hybridScore.mlConfidence,
        hybridScore: hybridScore.score,
        timestamp,
        modelVersion: hybridScore.modelVersion
      })
    ]);

    // 7. Increment tally
    election.candidates[candidateIdx].votes += 1;
    election.totalVotes += 1;
    await election.save();

    res.json({ 
      ok: true, 
      sequenceNumber, 
      chainHash,
      riskScore: hybridScore.score,
      riskLevel: hybridScore.level,
      mlConfidence: hybridScore.mlConfidence,
      modelVersion: hybridScore.modelVersion,
      explanation: hybridScore.shapExplanation.explanations
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Duplicate vote detected" });
    res.status(500).json({ error: err.message });
  }
});

// ── Voter status ───────────────────────────────────────────────

app.get("/api/voter/:uid/:electionId", async (req, res) => {
  try {
    const v = await Voter.findOne({ uid: req.params.uid, electionId: req.params.electionId });
    res.json({ hasVoted: !!v, receiptHash: v?.receiptHash });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Audit ledger ───────────────────────────────────────────────

app.get("/api/audit/:electionId", async (req, res) => {
  try {
    const entries = await AuditEntry.find({ electionId: req.params.electionId }).sort({ sequenceNumber: 1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/audit/:electionId/verify/:receiptHash", async (req, res) => {
  try {
    const entry = await AuditEntry.findOne({ electionId: req.params.electionId, voteReceiptHash: req.params.receiptHash });
    res.json({ found: !!entry, entry });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Security events ────────────────────────────────────────────

app.post("/api/security", async (req, res) => {
  try {
    await SecurityEvent.create({ ...req.body, signals: req.body.signals?.map((s) => s.type) || [] });
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get("/api/security", async (req, res) => {
  try {
    const events = await SecurityEvent.find().sort({ timestamp: -1 }).limit(200);
    const total   = await SecurityEvent.countDocuments();
    const high    = await SecurityEvent.countDocuments({ level: "HIGH" });
    const blocked = await SecurityEvent.countDocuments({ blocked: true });
    res.json({ events, summary: { total, high, blocked, medium: total - high } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Biometric profiles ───────────────────────────────────────────

app.post("/api/biometric/profile", async (req, res) => {
  try {
    const { uid, descriptor } = req.body;
    if (!uid || !descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: "Invalid biometric data" });
    }
    const profile = await BiometricProfile.findOneAndUpdate(
      { uid },
      { uid, descriptor, enrolledAt: Date.now(), version: 1 },
      { upsert: true, new: true }
    );
    res.json({ ok: true, profile });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get("/api/biometric/profile/:uid", async (req, res) => {
  try {
    const profile = await BiometricProfile.findOne({ uid: req.params.uid });
    if (!profile) return res.json({ descriptor: null, exists: false });
    res.json({ descriptor: profile.descriptor, exists: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ML Model Management ───────────────────────────────────────

// Get all models
app.get("/api/ml/models", async (req, res) => {
  try {
    const models = await MLModel.find().sort({ version: -1 });
    res.json(models);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Train new model
app.post("/api/ml/train", async (req, res) => {
  try {
    const model = await fraudDetector.trainModel();
    if (!model) {
      return res.status(400).json({ error: "Not enough labeled data for training" });
    }
    res.json({ ok: true, modelId: model._id, version: model.version });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activate model
app.patch("/api/ml/models/:id/activate", async (req, res) => {
  try {
    const model = await MLModel.activate(req.params.id);
    res.json({ ok: true, model });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Evaluate model
app.get("/api/ml/models/:id/evaluate", async (req, res) => {
  try {
    const result = await fraudDetector.evaluateModel(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Adaptive Learning (Feedback Loop) ─────────────────────────

// Submit fraud prediction feedback
app.post("/api/ml/feedback", async (req, res) => {
  try {
    const { predictionId, uid, electionId, label, notes } = req.body;
    
    if (!predictionId || !label) {
      return res.status(400).json({ error: "predictionId and label are required" });
    }
    
    const feedback = await FraudTrainingData.findOne({ predictionId });
    
    if (!feedback) {
      return res.status(404).json({ error: "Prediction not found" });
    }
    
    // Update feedback
    feedback.isFraud = label === "true_positive" ? true : false;
    feedback.labelAddedAt = Date.now();
    feedback.labelAddedBy = req.user?.uid || "admin";
    feedback.labelNotes = notes || "";
    
    await feedback.save();
    
    res.json({ ok: true, feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get feedback statistics
app.get("/api/ml/feedback/stats", async (req, res) => {
  try {
    const total = await FraudTrainingData.countDocuments({ isFraud: { $ne: null } });
    const labeled = await FraudTrainingData.countDocuments({ isFraud: { $ne: null } });
    const truePositives = await FraudTrainingData.countDocuments({ isFraud: true });
    const falsePositives = await FraudTrainingData.countDocuments({ isFraud: false });
    
    res.json({
      totalLabeled: labeled,
      truePositives,
      falsePositives,
      percentage: labeled > 0 ? Math.round((labeled / Math.max(total, labeled)) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health / admin summary ────────────────────────────────────

app.get("/api/health", (_, res) => res.json({ status: "ok", db: isDbReady() ? "connected" : "fallback" }));

app.get("/api/admin/summary", async (_, res) => {
  try {
    const [elections, registrations, biometrics, securityEvents, votes] = await Promise.all([
      Election.countDocuments(),
      VoterRegistration.countDocuments(),
      BiometricProfile.countDocuments(),
      SecurityEvent.countDocuments(),
      Vote.countDocuments(),
    ]);
    res.json({
      elections,
      registrations,
      verifiedRegistrations: await VoterRegistration.countDocuments({ status: "verified" }),
      biometrics,
      securityEvents,
      votes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── VaaS: Voting as a Service ───────────────────────────────────

// Get all service plans (public)
app.get("/api/plans", (_, res) => res.json(PLANS));

// Register an organization (tenant)
app.post("/api/organizations/register", async (req, res) => {
  const { name, type, country, city, contactEmail, plan, verification } = req.body;
  
  // Validate required fields
  if (!name || !contactEmail) {
    return res.status(400).json({ error: "Name and contact email are required" });
  }

  const normalizedName = String(name || '').trim();
  const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const selectedPlan = PLANS[plan] || PLANS.free;

  try {
    const verificationPayload = verification || {};
    const verificationStatus = verificationPayload.status || "pending";

    if (!isDbReady()) {
      const duplicate = fallbackStore.organizations.some((org) => {
        const storedName = String(org.name || '').trim().toLowerCase();
        return storedName === normalizedName.toLowerCase() || org.slug === slug;
      });
      if (duplicate) {
        return res.status(409).json({ error: "An organization with this name already exists." });
      }
      const org = {
        _id: makeId("org"),
        name,
        slug,
        type,
        country: country || "Pakistan",
        city: city || "",
        contactEmail,
        apiKey: generateApiKey(),
        plan: plan || "free",
        status: verificationStatus,
        verification: verificationPayload,
        maxElections: selectedPlan.maxElections,
        maxVoters: selectedPlan.maxVoters,
        createdAt: Date.now(),
      };
      fallbackStore.organizations.push(org);
      return res.json({ ok: true, organizationId: org._id, slug: org.slug, apiKey: org.apiKey, plan: selectedPlan.name, status: org.status, organization: { id: org._id, status: org.status, verificationStatus: verificationPayload.status || 'pending' } });
    }

    // Check for duplicate in MongoDB
    const existingOrg = await Organization.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } },
        { slug: slug }
      ]
    });
    
    if (existingOrg) {
      return res.status(409).json({ error: "An organization with this name already exists" });
    }

    const org = await Organization.create({
      name, slug, type, country: country || "Pakistan", city: city || "",
      contactEmail, apiKey: generateApiKey(), plan: plan || "free",
      status: verificationStatus,
      verification: verificationPayload,
      maxElections: selectedPlan.maxElections,
      maxVoters: selectedPlan.maxVoters,
    });
    res.json({ ok: true, organizationId: org._id, slug: org.slug, apiKey: org.apiKey, plan: selectedPlan.name, status: org.status, organization: { id: org._id, status: org.status, verificationStatus: org.verification?.status || 'pending' } });
  } catch (err) {
    console.error("Organization registration failed:", err.message);
    if (err.code === 11000) return res.status(409).json({ error: "An organization with this name already exists" });
    res.status(400).json({ error: err.message });
  }
});

// Get all organizations (admin only in production — open for demo)
app.get("/api/organizations", async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.json(fallbackStore.organizations.map((entry) => ({ ...entry, apiKey: undefined })));
    }
    const orgs = await Organization.find().sort({ createdAt: -1 }).select("-apiKey");
    res.json(orgs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve/suspend an org
app.patch("/api/organizations/:id", async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-apiKey");
    if (!org) return res.status(404).json({ error: "Not found" });
    res.json(org);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CipherVote API running on http://localhost:${PORT}`));
