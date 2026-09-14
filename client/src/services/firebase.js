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

// Real configuration for AntiinterviewCoach
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBzUdUpKRSR1aKmyJTcfKxRczP1XmBnW-c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "antiinterviewcoach.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "antiinterviewcoach",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "antiinterviewcoach.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "781594878734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:781594878734:web:d87e6ca593653ee048ed5f"
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
