import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAbMIWf8uq3dCrdAA--2gVHy2p88TYlVFs",
  authDomain: "cloud-b7c71.firebaseapp.com",
  projectId: "cloud-b7c71",
  storageBucket: "cloud-b7c71.appspot.com",
  messagingSenderId: "535763561760",
  appId: "1:535763561760:web:2836216037604ab9fcfb45",
};

firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;

/**
 * Firestore collection references used across the app.
 *
 * Collections:
 *   elections/       — election metadata (title, candidates, status, dates)
 *   votes/           — one doc per vote (anonymised receipt + chain data)
 *   audit_ledger/    — append-only chain of vote hashes (public audit)
 *   security_events/ — fraud detection logs (admin only)
 *   voters/          — per-voter record: hasVoted, electionId (prevents double vote)
 */
export const Collections = {
  ELECTIONS: "elections",
  VOTES: "votes",
  AUDIT_LEDGER: "audit_ledger",
  SECURITY_EVENTS: "security_events",
  VOTERS: "voters",
  BIOMETRIC_PROFILES: "biometric_profiles", // stores 128-d face descriptors (no images)
};

/** Admin UID email — in production this would be a Firestore role claim */
export const ADMIN_EMAIL = "admin@gmail.com";
