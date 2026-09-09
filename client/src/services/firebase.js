// Firebase Client Configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default / fallback configuration (can be overridden with Vite env variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoInterviewCoachFirebaseKey2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "interview-coach-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "interview-coach-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "interview-coach-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103948572910",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103948572910:web:8a9b0c1d2e3f4g"
};

let app = null;
let auth = null;
let db = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('🔥 Firebase Client initialized with project:', firebaseConfig.projectId);
} catch (err) {
  console.warn('⚠️ Firebase Client initialization:', err.message);
}

export { app, auth, db };
