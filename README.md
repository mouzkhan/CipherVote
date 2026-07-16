# CipherVote 2.0 — Secure Online Voting Platform with AI Fraud Detection

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-Academic%20Project-blue.svg)

## 📋 Executive Summary

**CipherVote 2.0** is a secure online voting platform designed as a final year project. It provides multi-organization voting management (Voting-as-a-Service) with AI-powered fraud detection for duplicate votes and brute force attacks.

### Key Statistics
- **10,000+** lines of code
- **165 files** committed to GitHub
- **VaaS platform** with organization management
- **AI fraud detection** for duplicate votes and brute force attacks

---

## 🎯 Project Creator

### M Mouz Ishaq
**Full-Stack Developer**

- 📧 **Email**: [mouzk41@gmail.com](mailto:mouzk41@gmail.com)
- 💻 **GitHub**: [@mouzkhan](https://github.com/mouzkhan)
- 🔗 **LinkedIn**: [Mouz Ishaq](https://linkedin.com/in/mouzishaq)

**Specializations**: Full-stack web development, React, Node.js, MongoDB

---

## ✨ Implemented Features

### 1. **Voting-as-a-Service (VaaS)** ✅ TESTED
- Multi-organization platform
- Organization registration with admin accounts
- Organization login system
- Scalable plan system (Free, Basic, Professional, Enterprise)
- Organization dashboard
- API key generation
- Usage tracking

### 2. **AI-Powered Fraud Detection** ✅ TESTED
- **Duplicate Vote Detection**: Prevents same voter from voting twice (95/100 fraud score)
- **Brute Force Detection**: Blocks accounts after 5 failed login attempts (70/100 fraud score)
- Real-time fraud alerts with explanations
- Fraud score calculation
- Security event logging

### 3. **Election Management** ✅ WORKING
- Create and manage elections
- Add candidates
- Set voting periods
- Election invitations
- Vote counting
- Results display

### 4. **Voter System** ✅ WORKING
- Voter registration via invitation
- Email and password authentication
- Secure vote submission
- Vote confirmation

### 5. **Security Features** ✅ WORKING
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- Secure session management

### 6. **Responsive Design** ✅ WORKING
- Mobile-friendly interface
- Desktop optimized layouts
- Tablet support
- Modern UI with gradients and animations

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  React + React Router + Firebase Auth                        │
│  • Responsive UI                                             │
│  • Real-time Updates                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  API GATEWAY LAYER                           │
│  Express.js + CORS + Rate Limiting                           │
│  • REST Endpoints (30+)                                      │
│  • Request Validation                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                            │
│  Fraud Detection Engine                                      │
│  • Duplicate Detection                                       │
│  • Brute Force Detection                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  DATA LAYER                                  │
│  MongoDB + Mongoose                                          │
│  • 12 Collections                                            │
│  • Indexed Queries                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Firebase Auth** - Authentication (optional)
- **CSS3** - Responsive design

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcrypt** - Password hashing

### Security
- **bcrypt** - Password hashing
- **CORS** - Cross-origin protection
- **Rate Limiting** - Attack prevention
- **Input Validation** - Security hardening

---

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js 16+
- MongoDB 4.4+
- npm or yarn
```

### Installation

```bash
# Clone repository
git clone https://github.com/mouzkhan/CipherVote.git
cd ciphervote

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Setup environment (optional - works without .env)
cp server/.env.example server/.env

# Start MongoDB
mongod

# Start backend server (Terminal 1)
cd server
npm run dev

# Start frontend (Terminal 2)
npm start

# Open browser
http://localhost:3000
```

---

## 📚 Documentation

### Documentation Files

1. **`README.md`** (This file) - Quick start guide
2. **`SOFTWARE_DOCUMENTATION.md`** - Technical documentation
3. **`VIVA_PRESENTATION.md`** - Presentation slides
4. **`COMPLETE_PROJECT_ARCHITECTURE.md`** - System architecture
5. **`SETUP_AND_TESTING.md`** - Testing guide
6. **`AI_FEATURES_SUMMARY.md`** - AI features overview

---

## 🔐 Security Features

### Implemented Security
- ✅ Password hashing (bcrypt with 10 rounds)
- ✅ Duplicate vote prevention (email-based tracking)
- ✅ Brute force protection (5-attempt limit, 30-min lockout)
- ✅ Rate limiting (80 requests/minute per IP)
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Secure session management

### Privacy Protection
- ✅ Passwords never stored in plain text
- ✅ Email-based voter tracking
- ✅ Organization data isolation

---

## 🧪 Testing Status

### Tested Features ✅
- ✅ Organization registration
- ✅ Organization login
- ✅ Election creation
- ✅ Voter registration
- ✅ Vote submission
- ✅ Duplicate vote detection (VERIFIED WORKING)
- ✅ Brute force detection (VERIFIED WORKING)
- ✅ Fraud alert display

### Not Fully Tested ⚠️
- ⚠️ Face recognition (framework in place, not tested)
- ⚠️ Bot detection (code exists, not validated)
- ⚠️ Behavioral biometrics (not tested)
- ⚠️ Advanced analytics (basic implementation only)

---

## 📱 Responsive Design

### Supported Devices
- ✅ Mobile phones (320px+)
- ✅ Tablets (768px+)
- ✅ Laptops (1024px+)
- ✅ Desktop (1200px+)

---

## 🔧 Configuration

### Backend Environment Variables (server/.env)
```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ciphervote
NODE_ENV=development
```

**Note**: System works without .env file using default values.

---

## 📞 Support & Contact

- **Email**: [mouzk41@gmail.com](mailto:mouzk41@gmail.com)
- **GitHub**: [https://github.com/mouzkhan/CipherVote](https://github.com/mouzkhan/CipherVote)
- **GitHub Issues**: Report bugs on the repository

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Libraries**: React, Node.js, Express, MongoDB, Mongoose, bcrypt
- **Icons**: Emoji-based icons for simplicity
- **Inspiration**: Modern voting platforms and e-democracy initiatives

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Files** | 165 |
| **Lines of Code** | 51,407 |
| **API Endpoints** | 30+ |
| **Database Collections** | 12 |
| **React Pages** | 30+ |
| **Tested Features** | 8 |
| **Fraud Detection Types** | 2 (working) |

---

## 🎯 Use Cases

### Perfect For:
- University student elections
- Small organization voting
- Club/society elections
- Proof of concept demonstrations
- Academic projects

### Not Recommended For:
- Government elections (not production-ready)
- Large-scale deployments (not stress-tested)
- High-security requirements (basic security only)

---

## ⚠️ Limitations & Disclaimers

### Current Limitations:
- No blockchain integration
- Basic encryption only (bcrypt for passwords)
- Limited fraud detection (only duplicate votes and brute force)
- Face recognition not fully tested
- No production deployment
- Not independently audited
- Basic error handling
- Limited scalability testing

### This is an Academic Project:
- Built for learning and demonstration
- Not production-ready
- Requires further testing for real-world use
- Security has not been professionally audited

---

## 🗺️ Future Improvements (If Continued)

- Enhanced fraud detection algorithms
- Full biometric testing
- Production deployment guide
- Security audit
- Load testing
- More comprehensive error handling
- Admin panel enhancements
- Email notifications
- Two-factor authentication

---

## 📅 Version History

### v2.0.0 (Current - July 2026)
- VaaS platform with organization management
- AI fraud detection (duplicate + brute force)
- Mobile responsive design
- Organization login system

---

## ✨ What Actually Works

✅ **Multi-Organization Platform**: Organizations can register and manage elections  
✅ **Fraud Detection**: Duplicate votes and brute force attacks are detected  
✅ **Voter Management**: Registration, login, and voting flow works  
✅ **Election Management**: Create elections, add candidates, collect votes  
✅ **Responsive Design**: Works on mobile, tablet, and desktop  
✅ **Real-time Alerts**: Fraud alerts display with explanations  

---

## 📞 Quick Links

- 🐛 [Report Issues](https://github.com/mouzkhan/CipherVote/issues)
- 📬 [Email Creator](mailto:mouzk41@gmail.com)
- 💻 [GitHub Repository](https://github.com/mouzkhan/CipherVote)

---

**CipherVote 2.0 © 2026 by M Mouz Ishaq**

*Secure Multi-Organization Voting Platform with AI Fraud Detection*

Final Year Project • Computer Science • Academic Demonstration

---

*Last Updated: July 16, 2026*  
*Status: Academic Project*  
*Tested Features: VaaS, Duplicate Detection, Brute Force Detection*
