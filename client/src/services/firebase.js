// Firebase Client Configuration for AntiinterviewCoach
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  addDoc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';

// Firebase Client Configuration (Loaded securely from local environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "antiinterviewcoach.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "antiinterviewcoach",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "antiinterviewcoach.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
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

const getCandidateCleanName = (user) => {
  const raw = user?.name || user?.displayName || localStorage.getItem('candidate_name');
  if (raw && !/^(candidate|ananya|demo|user)$/i.test(raw.trim())) {
    return raw.trim();
  }
  if (user?.email) {
    const prefix = user.email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'User';
};

/**
 * Save Interview Evaluation Session in Firestore for Admin Console Tracking
 */
export const saveInterviewSessionToFirestore = async (user, sessionData) => {
  if (!db) return null;
  try {
    const candidateUid = user?.uid || user?.id || 'anonymous_user';
    const candidateEmail = user?.email || localStorage.getItem('candidate_email') || '';
    const candidateName = getCandidateCleanName(user);

    const payload = {
      userId: candidateUid,
      candidateEmail,
      candidateName,
      role: sessionData.role || 'Full Stack Engineer',
      difficulty: sessionData.difficulty || 'Senior',
      overallScore: sessionData.overallScore || 85,
      technicalScore: sessionData.technical || sessionData.technicalScore || 88,
      communicationScore: sessionData.communication || sessionData.communicationScore || 85,
      nonVerbalScore: sessionData.nonVerbalScore || 88,
      confidenceScore: sessionData.confidence || sessionData.confidenceScore || 86,
      strengths: sessionData.strengths || [],
      improvements: sessionData.improvements || [],
      starAnalysis: sessionData.starAnalysis || null,
      questionCount: sessionData.questionCount || 1,
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString()
    };

    // 1. Add to 'interviews' collection
    const docRef = await addDoc(collection(db, 'interviews'), payload);

    // 2. Update user profile aggregated stats in 'users' collection
    if (candidateUid && candidateUid !== 'anonymous_candidate') {
      try {
        const userRef = doc(db, 'users', candidateUid);
        await setDoc(userRef, {
          stats: {
            totalInterviews: increment(1),
            latestInterviewScore: sessionData.overallScore || 85,
            lastInterviewAt: serverTimestamp()
          }
        }, { merge: true });
      } catch (uErr) {
        // ignore profile stat update notice
      }
    }

    console.log('✅ Interview logged to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn('⚠️ Firestore saveInterviewSession warning:', err.message);
    return null;
  }
};

/**
 * Save Coding Arena Submission to Firestore for Admin Console Tracking
 */
export const saveCodingSubmissionToFirestore = async (user, submissionData) => {
  if (!db) return null;
  try {
    const candidateUid = user?.uid || user?.id || 'anonymous_user';
    const candidateEmail = user?.email || localStorage.getItem('candidate_email') || '';
    const candidateName = getCandidateCleanName(user);

    const payload = {
      userId: candidateUid,
      candidateEmail,
      candidateName,
      challengeId: submissionData.challengeId || 'unknown-challenge',
      challengeTitle: submissionData.challengeTitle || 'Algorithm Challenge',
      branch: submissionData.branch || 'Software Engineering',
      language: submissionData.language || 'javascript',
      score: submissionData.score || 80,
      testsPassed: submissionData.testsPassed || 'Passed',
      codeSnippet: (submissionData.code || '').slice(0, 4000), // capped for Firestore limits
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString()
    };

    // 1. Add to 'coding_submissions' collection
    const docRef = await addDoc(collection(db, 'coding_submissions'), payload);

    // 2. Update user stats in 'users' collection
    if (candidateUid && candidateUid !== 'anonymous_user') {
      try {
        const userRef = doc(db, 'users', candidateUid);
        await setDoc(userRef, {
          stats: {
            totalCodingChallenges: increment(1),
            latestCodingScore: submissionData.score || 80,
            lastCodingAt: serverTimestamp()
          }
        }, { merge: true });
      } catch (uErr) {
        // ignore
      }
    }

    console.log('✅ Coding submission logged to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn('⚠️ Firestore saveCodingSubmission warning:', err.message);
    return null;
  }
};

/**
 * Save Resume Analysis Scan in Firestore for Admin Console Tracking
 */
export const saveResumeAnalysisToFirestore = async (user, analysisData) => {
  if (!db) return null;
  try {
    const candidateUid = user?.uid || user?.id || 'anonymous_user';
    const candidateEmail = user?.email || localStorage.getItem('candidate_email') || '';
    const candidateName = getCandidateCleanName(user);

    const payload = {
      userId: candidateUid,
      candidateEmail,
      candidateName,
      fileName: analysisData.fileName || 'Resume.pdf',
      targetRole: analysisData.role || analysisData.targetRole || 'Software Engineer',
      atsScore: analysisData.atsScore || 75,
      skillsIdentified: analysisData.skills || [],
      missingKeywords: analysisData.missingKeywords || [],
      createdAt: serverTimestamp(),
      createdDate: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'resume_analyses'), payload);

    if (candidateUid && candidateUid !== 'anonymous_candidate') {
      try {
        const userRef = doc(db, 'users', candidateUid);
        await setDoc(userRef, {
          stats: {
            latestAtsScore: analysisData.atsScore || 75,
            lastResumeAnalyzedAt: serverTimestamp()
          }
        }, { merge: true });
      } catch (uErr) {
        // ignore
      }
    }

    console.log('✅ Resume analysis logged to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (err) {
    console.warn('⚠️ Firestore saveResumeAnalysis warning:', err.message);
    return null;
  }
};

/**
 * Save Mentor Chat Log in Firestore for Admin Console Tracking
 */
export const saveMentorChatToFirestore = async (user, chatData) => {
  if (!db) return null;
  try {
    const candidateUid = user?.uid || user?.id || 'anonymous_candidate';
    const candidateEmail = user?.email || localStorage.getItem('candidate_email') || 'candidate@antiinterview.app';

    const payload = {
      userId: candidateUid,
      candidateEmail,
      personality: chatData.personality || 'supportive',
      userMessage: chatData.userMessage || '',
      aiReply: (chatData.aiReply || '').slice(0, 3000),
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'mentor_chats'), payload);
  } catch (err) {
    console.warn('⚠️ Firestore saveMentorChat warning:', err.message);
  }
};

export { app, auth, db, googleProvider, isFirebaseConfigured };
