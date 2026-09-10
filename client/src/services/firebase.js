// Firebase Client Configuration for AntiinterviewCoach
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Default / fallback configuration (can be overridden with Vite env variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAntiInterviewCoachKey2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "antiinterviewcoach.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "antiinterviewcoach",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "antiinterviewcoach.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103948572910",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103948572910:web:8a9b0c1d2e3f4g"
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isFirebaseConfigured = false;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  isFirebaseConfigured = true;
  console.log('🔥 Firebase Client initialized with project:', firebaseConfig.projectId);
} catch (err) {
  console.warn('⚠️ Firebase Client initialization notice:', err.message);
}

/**
 * Save or update user document in Firestore 'users' collection
 */
export const saveUserToFirestore = async (uid, data) => {
  if (!db || !uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const payload = {
      ...data,
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn('⚠️ Firestore saveUser warning:', err.message);
    return false;
  }
};

/**
 * Retrieve user document from Firestore
 */
export const getUserFromFirestore = async (uid) => {
  if (!db || !uid) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('⚠️ Firestore getUser warning:', err.message);
    return null;
  }
};

/**
 * Update candidate last login timestamp in Firestore
 */
export const recordUserLoginInFirestore = async (uid, email) => {
  if (!db || !uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      email,
      lastLoginAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('⚠️ Firestore recordUserLogin warning:', err.message);
  }
};

/**
 * Update candidate email verification status in Firestore
 */
export const recordVerificationStatusInFirestore = async (uid, emailVerified) => {
  if (!db || !uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      emailVerified,
      verifiedAt: emailVerified ? serverTimestamp() : null
    });
  } catch (err) {
    console.warn('⚠️ Firestore recordVerificationStatus warning:', err.message);
  }
};

export { app, auth, db, googleProvider, isFirebaseConfigured };
