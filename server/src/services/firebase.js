import admin from 'firebase-admin';

let firebaseInitialized = false;
let firestoreDb = null;

export const initFirebase = () => {
  if (firebaseInitialized) return { admin, firestoreDb };

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      firestoreDb = admin.firestore();
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized with Service Account Key');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      firestoreDb = admin.firestore();
      firebaseInitialized = true;
      console.log(`🔥 Firebase Admin SDK initialized with Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      console.log('ℹ️ Firebase running in local emulation/sync mode (set FIREBASE_PROJECT_ID or FIREBASE_SERVICE_ACCOUNT_KEY in .env for production Firebase)');
    }
  } catch (err) {
    console.warn('⚠️ Firebase Admin initialization notice:', err.message);
  }

  return { admin, firestoreDb };
};

export const syncUserToFirestore = async (user, profile = {}) => {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection('users').doc(user.id).set({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      targetRole: profile.targetRole || 'Full Stack Engineer',
      experience: profile.experience || 'Senior',
      techStack: profile.techStack || '',
      emailVerified: user.emailVerified || false,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Synced user ${user.email} to Cloud Firestore`);
  } catch (err) {
    console.error('Firestore user sync error:', err.message);
  }
};

export const syncInterviewToFirestore = async (session, feedback) => {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection('interview_sessions').doc(session.id).set({
      ...session,
      feedback: feedback || null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`✓ Synced interview ${session.id} to Cloud Firestore`);
  } catch (err) {
    console.error('Firestore interview sync error:', err.message);
  }
};

initFirebase();
