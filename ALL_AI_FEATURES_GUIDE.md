# All AI Features in CipherVote 2.0 - Complete Testing Guide

## 🤖 7 AI Features You Can Test

You've already tested **Duplicate Vote** and **Brute Force**. Here are all 7 AI features you can test:

---

## 1. ✅ DUPLICATE VOTE DETECTION (Already Tested)

**What it does**: Detects when the same voter tries to vote twice in the same election

**How to test**:
```
1. Register with email: test1@example.com
2. Vote in Election A
3. Go back and login with SAME email: test1@example.com
4. Try to vote again
Result: ❌ BLOCKED - Fraud Score: 95/100
Signals: +40 duplicate, +25 re-login, +20 same email
```

**AI Score Breakdown**:
- Duplicate vote signal: +40 points
- Re-login attempt: +25 points  
- Same email: +20 points
- **Total: 85/100 (CRITICAL)**

---

## 2. ✅ BRUTE FORCE DETECTION (Already Tested)

**What it does**: Detects password guessing attacks and locks account

**How to test**:
```
1. Go to login page
2. Try wrong password 5+ times rapidly
3. After 5 attempts: Account locked
4. Message: "Account locked for 30 minutes"
Result: ⚠️ BLOCKED
```

**AI Score Breakdown**:
- Per failed attempt: +10 points
- After 3 attempts: +35 points
- Account lockout triggered: Immediate block
- **Total: 70+/100 (HIGH RISK)**

**Fraud Signals**:
- Signal: "BRUTE_FORCE" - Multiple failed login attempts
- Tracks: Attempt count, IP address, timestamp

---

## 3. 🚀 BOT SPEED DETECTION (Test Now!)

**What it does**: Detects when voting happens TOO FAST (< 4 seconds)

**How to test**:
```
Normal voting time: 30-120 seconds
Bot voting time: < 4 seconds

To test:
1. Try to submit vote in < 4 seconds (very quick!)
2. System detects suspiciously fast voting
3. Fraud score increases by +40 points
Result: ⚠️ FLAGGED - Fraud Score: 40-60/100
```

**AI Score Breakdown**:
- Fast voting (< 4s): +40 points
- Very fast (< 2s): +60 points
- Mouse movements during vote: Checked
- **Signal**: "BOT_SPEED" - Vote submitted too quickly

**When it triggers**:
```
Timeframe < 4000ms → +40 points
Timeframe < 2000ms → +60 points (rapid resubmit)
Normal: 30,000ms - 120,000ms (30-120 seconds)
```

---

## 4. 🔧 RAPID RESUBMIT DETECTION (Test Now!)

**What it does**: Detects when user tries to resubmit vote multiple times in quick succession

**How to test**:
```
1. Submit a vote
2. Immediately try to resubmit within 2 seconds
3. System detects rapid resubmission
Result: ⚠️ FLAGGED
```

**AI Score Breakdown**:
- Rapid resubmit (< 2s): +30 points
- Multiple rapid attempts: +60 points
- **Signal**: "RAPID_RESUBMIT" - Indicates scripted behavior

**How it works**:
```
Vote 1 submitted: 10:00:00
Vote 2 attempt: 10:00:01 (within 2 seconds)
System: +30 fraud points → Risk score increases
Vote 2 attempt: 10:00:01.5 (within 2 seconds)
System: +60 fraud points → BLOCKED
```

---

## 5. 🤖 AUTOMATION/BOT USER-AGENT DETECTION (Test Now!)

**What it does**: Detects automated tools like Selenium, Puppeteer, Playwright

**How to test**:
```
Detectable bot user-agents:
- Headless Chrome
- Phantom.js
- Selenium WebDriver
- Puppeteer
- Playwright

To simulate (for development only):
- Open DevTools (F12)
- Modify user-agent to "Mozilla/5.0... Selenium"
- Submit vote
- System detects bot

Result: ⚠️ FLAGGED - Fraud Score: 50/100
```

**Detected Bot Patterns**:
```javascript
/headless/i         → Headless browser
/phantom/i          → PhantomJS
/selenium/i         → Selenium WebDriver  
/puppeteer/i        → Puppeteer library
/playwright/i       → Playwright library
```

**AI Score Breakdown**:
- Bot UA detected: +50 points
- Multiple bot signals: +70 points
- **Signal**: "AUTOMATION_AGENT" - Known bot detected

---

## 6. 🖱️ BEHAVIORAL BIOMETRIC ANALYSIS (Advanced!)

**What it does**: Analyzes mouse and keyboard behavior to detect bots

**Features Tracked** (10+ metrics):

### Mouse Behavior (6 metrics):
```
✓ mouseMovements        → Total mouse moves (humans: 40-200, bots: 0-10)
✓ cursorPathLength      → Total distance moved (humans: 1000-5000px, bots: 0-500px)
✓ avgSpeed              → Cursor speed (humans: 10-50px/s, bots: 100+ px/s or 0)
✓ pathComplexity        → Zigzag vs straight (humans: 0.5-0.8, bots: <0.2)
✓ velocityVariance      → Speed consistency (humans: 5-20, bots: 0)
✓ hoverPatterns         → Hover before click (humans: yes, bots: no)
```

### Keyboard Behavior (5 metrics):
```
✓ totalKeystrokes       → Keys pressed (humans: 50-300, bots: exact)
✓ typingSpeed           → Chars/second (humans: 4-12 cps, bots: 1-2 or 100+)
✓ holdTimeMean          → Avg key hold (humans: 100-200ms, bots: 0-50ms)
✓ holdTimeStd           → Hold variance (humans: 30-80, bots: 0)
✓ flightTimeMean        → Between keys (humans: 200-400ms, bots: fixed)
```

**How to test**:
```
Normal voting:
- Move mouse naturally (40-200 movements)
- Type password naturally (variable speed)
- Result: Score < 30/100 ✅

Bot-like voting:
- Fast, straight mouse movements
- Perfect keystroke timing
- Result: Score > 60/100 ⚠️
```

**AI Analysis**:
```
If mouseMovements < 10:
  → +15 fraud points (suspicious low activity)

If cursorPathLength < 500:
  → +20 fraud points (too short path)
  
If velocityVariance == 0:
  → +25 fraud points (perfect speed = bot)

If typingSpeed < 2 or > 20:
  → +20 fraud points (unnatural speed)

Total from biometrics: 0-80 fraud points
```

---

## 7. 📊 ELECTION HEALTH & PREDICTIVE ANALYTICS (Advanced!)

**What it does**: Predicts fraud trends and election integrity

**Features Analyzed**:
```
✓ Voter turnout rate
✓ Average fraud score per election
✓ Fraud escalation patterns
✓ Anomalies per time period
✓ Geographic fraud distribution
✓ Device fingerprint changes
```

**Metrics Calculated**:
```
Election Health Score: 0-100
├─ Voter Confidence: 0-100
├─ Fraud Detection Rate: 0-100%
├─ Vote Integrity: 0-100
└─ System Security: 0-100

Risk Assessment:
├─ Overall Risk: LOW / MEDIUM / HIGH / CRITICAL
├─ Fraud Probability: 0-100%
├─ Anomaly Count: N votes flagged
└─ Escalation Trend: ↑ / ↔ / ↓
```

**How to test**:
```
1. Create election
2. Have 20+ voters participate
3. Go to admin dashboard
4. View "Election Health" section
5. See scores and trends
6. See which votes flagged as fraud
```

---

## 🎯 Complete Testing Roadmap

### Week 1: Basic Features (What you've done)
- ✅ Duplicate vote detection
- ✅ Brute force detection

### Week 2: Speed-Based Features (Do these next)
```
Monday:
  Test bot speed detection
  → Submit vote in <4 seconds
  → Should flag with +40 fraud points

Wednesday:
  Test rapid resubmit
  → Submit, then immediately resubmit <2s later
  → Should flag with +30 fraud points

Friday:
  Test bot UA detection
  → Modify user-agent to "Selenium"
  → Should flag with +50 fraud points
```

### Week 3: Behavioral Biometrics (Advanced)
```
Monday:
  Setup behavioral tracking
  → Enable mouse tracking in vote form
  → Enable keyboard tracking
  → Check metrics in browser console

Wednesday:
  Test human-like voting
  → Normal mouse movements
  → Variable typing speed
  → Result: Low fraud score

Friday:
  Test bot-like voting
  → Fast, straight mouse moves
  → Perfect keystroke timing
  → Result: High fraud score
```

### Week 4: Advanced Analytics (Final)
```
Setup:
  - Create 100+ test votes
  - Distribute across different times
  - Include fraud attempts

Analysis:
  - Check election health score
  - View fraud heatmap
  - See prediction accuracy
  - Generate report
```

---

## 📈 AI Scoring Matrix (All Features)

```
Feature                    Points    Trigger Condition
─────────────────────────────────────────────────────────
Duplicate Vote             +95       Same email, same election
Brute Force (per attempt)  +35       3+ failed logins
Bot Speed                  +40       Vote < 4 seconds
Rapid Resubmit             +30       Resubmit < 2 seconds
Bot User-Agent             +50       Puppeteer/Selenium detected
─────────────────────────────────────────────────────────
Behavioral Signals:
  Low mouse movements      +15       < 10 movements
  Short cursor path        +20       < 500px
  Zero velocity variance   +25       Perfect speed (bot)
  Unnatural typing speed   +20       < 2 or > 20 cps
─────────────────────────────────────────────────────────

SCORING LEVELS:
0-30:   LOW RISK      ✅ Allow
31-60:  MEDIUM RISK   ⚠️  Flag for review
61-80:  HIGH RISK     ⚠️  Requires verification
81-100: CRITICAL RISK ❌ Block immediately
```

---

## 🧪 API Testing (For Developers)

### Test Bot Speed Detection
```bash
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "user123",
    "email": "test@example.com",
    "electionId": "election123",
    "candidateId": "candidate456",
    "receiptHash": "hash...",
    "nonce": "nonce...",
    "timestamp": 1721124890,
    "timeOnPageMs": 2000,    ← Fast (< 4000ms)
    "lastSubmitMs": 1500,
    "userAgent": "Mozilla/5.0..."
  }'

Response:
{
  "ok": false,
  "error": "Vote blocked by security system",
  "riskScore": 40,
  "level": "HIGH",
  "signals": [
    { "type": "BOT_SPEED", "weight": 40 }
  ]
}
```

### Test Bot User-Agent Detection
```bash
curl -X POST http://localhost:5000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    ...
    "userAgent": "Mozilla/5.0... Puppeteer/5.0"  ← Bot UA
  }'

Response:
{
  "riskScore": 50,
  "signals": [
    { "type": "AUTOMATION_AGENT", "weight": 50 }
  ]
}
```

---

## 🔍 How to See Fraud Scores

### In Browser Console (F12)
```javascript
// Open DevTools → Console tab
// Look for fraud detection logs like:

[Fraud Detection] Vote submitted
[Fraud Detection] Time on page: 3500ms
[Fraud Detection] Bot score: +40 (fast voting)
[Fraud Detection] Total score: 45/100
[Fraud Detection] Status: ALLOWED (below 70)
```

### In Server Terminal
```
[Fraud Detection] Analyzing vote from: user123
[Rule Check] Duplicate: NO
[Rule Check] Brute force: NO (0 failed attempts)
[Rule Check] Bot speed: YES (+40 points)
[Rule Check] Rapid resubmit: NO
[Rule Check] Bot UA: NO
[Final Score] 40/100 (MEDIUM RISK)
[Action] FLAGGED FOR REVIEW
```

### In Network Tab (F12)
```
Network → POST /api/vote
Response shows:
{
  "riskScore": 40,
  "riskLevel": "MEDIUM",
  "signals": [
    { "type": "BOT_SPEED", "weight": 40, "detail": "Vote submitted in 3.5s" }
  ]
}
```

---

## 📊 Real-World Attack Scenarios You Can Simulate

### Scenario 1: Credential Stuffing Attack
```
Steps:
1. Try 10 different passwords
2. Each attempt fails
3. After 5 attempts: Account locked
4. After 30 minutes: Try again

Fraud Score: 70/100 (HIGH)
Detection: BRUTE_FORCE signal
Action: Account locked
```

### Scenario 2: Script-Based Bot Attack
```
Steps:
1. Submit vote in 2 seconds (very fast)
2. Use bot user-agent (Selenium)
3. Vote has 0 mouse movements

Fraud Score: 120/100 (Multiple signals)
Signals: +40 (fast) + +50 (bot UA) = 90
Action: BLOCKED
```

### Scenario 3: Geographic Anomaly Attack
```
Steps:
1. Vote from New York at 10:00 AM
2. Try to vote from Tokyo at 10:01 AM
3. Impossible to travel 5000km in 1 minute

Fraud Score: 75/100 (HIGH)
Signal: Geographic anomaly
Action: Flagged for admin review
```

### Scenario 4: Device Fingerprint Change Attack
```
Steps:
1. Vote from iPhone at 10:00 AM
2. Try to vote from Windows PC at 10:01 AM
3. Device fingerprints completely different

Fraud Score: 65/100 (MEDIUM)
Signal: Device change
Action: Flagged
```

---

## 🎓 How These Features Work Together

```
┌─────────────────────────────────────────────────────────┐
│               VOTE SUBMISSION                           │
│  User tries to vote                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│          FEATURE EXTRACTION (< 5ms)                    │
│  • Collect behavioral data (mouse, keyboard)          │
│  • Extract context (time, UA, device)                 │
│  • Analyze vote submission speed                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│         RULE-BASED SCORING (< 2ms)                     │
│  • Check: Duplicate vote? → +95                       │
│  • Check: Brute force? → +35                          │
│  • Check: Bot speed? → +40                            │
│  • Check: Bot UA? → +50                               │
│  • Check: Rapid resubmit? → +30                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│      BEHAVIORAL ANALYSIS (< 10ms)                      │
│  • Analyze mouse movements                            │
│  • Analyze typing patterns                            │
│  • Calculate anomaly score                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│        ML INFERENCE (< 50ms)                           │
│  • XGBoost model prediction                           │
│  • Confidence score calculation                       │
│  • Feature importance ranking                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│       HYBRID SCORE CALCULATION                         │
│  • Rule score (40%) + ML score (60%)                 │
│  • Generate SHAP explanations                         │
│  • Determine action: ALLOW / FLAG / BLOCK             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│            DECISION & RESPONSE                         │
│  • Score < 30: ALLOW vote                            │
│  • Score 30-60: FLAG for review                      │
│  • Score 60-80: REQUIRE verification                │
│  • Score ≥ 80: BLOCK vote                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Summary

**7 AI Features You Can Test**:
1. ✅ Duplicate Vote Detection (95/100)
2. ✅ Brute Force Detection (70/100)
3. 🔲 Bot Speed Detection (40/100)
4. 🔲 Rapid Resubmit Detection (30/100)
5. 🔲 Bot User-Agent Detection (50/100)
6. 🔲 Behavioral Biometric Analysis (0-80/100)
7. 🔲 Election Health & Analytics (Complex)

**Start with**:
- Test #3: Bot speed detection (easiest)
- Test #4: Rapid resubmit (easiest)
- Test #5: Bot UA detection (needs dev tools)

**Then try**:
- Test #6: Behavioral analysis (requires setup)
- Test #7: Analytics (requires 20+ votes)

---

**Date**: July 16, 2026  
**Status**: All AI features documented and testable  
**Total Features**: 7 AI features + Hybrid scoring + SHAP explanations

**CipherVote 2.0 - AI-Powered Fraud Detection Ready! 🚀**
