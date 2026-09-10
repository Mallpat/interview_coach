import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  saveUserToFirestore, 
  getUserFromFirestore, 
  recordUserLoginInFirestore,
  recordVerificationStatusInFirestore 
} from '../services/firebase';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const isInvalidOrAnanya = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (!trimmed) return false;
  return /ananya/i.test(trimmed);
};

export const getSavedCandidateName = () => {
  try {
    const saved = localStorage.getItem('candidate_name');
    if (saved && saved.trim() && !isInvalidOrAnanya(saved)) return saved.trim();
  } catch (e) {}
  return '';
};

const DEFAULT_PROFILE = {
  fullName: '',
  targetRole: 'Full Stack Engineer',
  experience: 'Senior (5+ yrs)',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
  targetCompany: 'Top Tier Tech'
};

export const AuthProvider = ({ children }) => {
  const [candidateName, setCandidateNameState] = useState(getSavedCandidateName);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const setCandidateName = (name) => {
    if (name === undefined || name === null) return;
    setCandidateNameState(name);
    try {
      localStorage.setItem('candidate_name', name);
      window.dispatchEvent(new CustomEvent('candidate_name_updated', { detail: name }));
    } catch (e) {}
    setProfile(prev => ({ ...prev, fullName: name }));
    setUser(prev => prev ? { ...prev, name: name } : { name });
  };

  // Clear any legacy mock 'Ananya' name and sync cross-component updates
  useEffect(() => {
    try {
      const stored = localStorage.getItem('candidate_name');
      if (stored && isInvalidOrAnanya(stored)) {
        localStorage.removeItem('candidate_name');
        setCandidateNameState('');
      }
    } catch (e) {}

    const handleUpdate = (e) => {
      const newName = e?.detail || localStorage.getItem('candidate_name');
      if (newName !== undefined && newName !== null && !isInvalidOrAnanya(newName) && newName !== candidateName) {
        setCandidateNameState(newName);
        setProfile(prev => ({ ...prev, fullName: newName }));
        setUser(prev => prev ? { ...prev, name: newName } : { name: newName });
      }
    };

    window.addEventListener('candidate_name_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('candidate_name_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Sync with Firebase Auth state on mount and keep session alive
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userData = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Candidate',
            email: firebaseUser.email,
            emailVerified: firebaseUser.emailVerified,
            avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
          };
          setUser(userData);

          // Get token and store for API authorization
          try {
            const token = await firebaseUser.getIdToken();
            localStorage.setItem('coach_token', token);
          } catch (e) {
            // ignore token error
          }

          // Fetch stored profile from Firestore if available
          const firestoreDoc = await getUserFromFirestore(firebaseUser.uid);
          if (firestoreDoc?.profile) {
            setProfile(firestoreDoc.profile);
          } else if (firestoreDoc?.fullName) {
            setProfile(prev => ({
              ...prev,
              fullName: firestoreDoc.fullName,
              targetRole: firestoreDoc.targetRole || prev.targetRole
            }));
          }
        } else {
          // User is signed out
          setUser(null);
          localStorage.removeItem('coach_token');
        }
      } catch (err) {
        console.warn('Auth state sync notice:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in with Email & Password
   */
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Record login in Firestore
      await recordUserLoginInFirestore(firebaseUser.uid, firebaseUser.email);

      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      };
      setUser(userData);

      // Load Firestore profile if existing
      const firestoreDoc = await getUserFromFirestore(firebaseUser.uid);
      if (firestoreDoc?.profile) {
        setProfile(firestoreDoc.profile);
      }

      return userData;
    } catch (err) {
      console.error('Firebase login error:', err);
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with Email, Password, Name & optional resume
   */
  const register = async (email, password, fullName, resumeInfo = null) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!auth) throw new Error('Firebase Auth is not initialized');

      // 1. Create account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Set Display Name in Firebase Auth
      if (fullName) {
        await updateFirebaseProfile(firebaseUser, { displayName: fullName });
      }

      // 3. Send automated verification email via Firebase
      try {
        await sendEmailVerification(firebaseUser);
        console.log('✉️ Firebase verification email dispatched to:', email);
      } catch (emailErr) {
        console.warn('⚠️ Verification email dispatch notice:', emailErr.message);
      }

      // 4. Create initial Candidate Document in Firestore
      const initialProfile = {
        fullName: fullName || email.split('@')[0],
        targetRole: 'Full Stack Engineer',
        experience: 'Mid-Senior',
        skills: ['React', 'Node.js', 'System Design'],
        targetCompany: 'Top Tier Tech'
      };

      await saveUserToFirestore(firebaseUser.uid, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        fullName: fullName || email.split('@')[0],
        emailVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        provider: 'password',
        profile: initialProfile,
        resumeName: resumeInfo?.name || null
      });

      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: fullName || email.split('@')[0],
        email: firebaseUser.email,
        emailVerified: false,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      };

      setUser(userData);
      setProfile(initialProfile);

      return userData;
    } catch (err) {
      console.error('Firebase register error:', err);
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 1-Click Sign in / Sign up with Google
   */
  const loginWithGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      if (!auth || !googleProvider) throw new Error('Firebase Google Auth is not configured');

      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;

      // Sync Firestore profile
      const existingDoc = await getUserFromFirestore(firebaseUser.uid);
      if (!existingDoc) {
        await saveUserToFirestore(firebaseUser.uid, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || 'Candidate',
          emailVerified: true, // Google accounts are pre-verified
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          provider: 'google.com',
          profile: {
            fullName: firebaseUser.displayName || 'Candidate',
            targetRole: 'Full Stack Engineer',
            skills: ['React', 'Node.js'],
            targetCompany: 'Top Tier Tech'
          }
        });
      } else {
        await recordUserLoginInFirestore(firebaseUser.uid, firebaseUser.email);
      }

      const userData = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email,
        email: firebaseUser.email,
        emailVerified: true,
        avatarUrl: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
      };

      setUser(userData);
      if (existingDoc?.profile) setProfile(existingDoc.profile);

      return userData;
    } catch (err) {
      console.error('Google Sign In error:', err);
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend Firebase verification email to current user
   */
  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) throw new Error('No user is currently signed in');
    await sendEmailVerification(auth.currentUser);
    return true;
  };

  /**
   * Reload current user to check if email was verified
   */
  const checkEmailVerificationStatus = async () => {
    if (!auth?.currentUser) return false;
    await reload(auth.currentUser);
    const isVerified = auth.currentUser.emailVerified;
    if (isVerified) {
      await recordVerificationStatusInFirestore(auth.currentUser.uid, true);
      setUser(prev => prev ? { ...prev, emailVerified: true } : prev);
    }
    return isVerified;
  };

  /**
   * Password Reset Email
   */
  const resetPassword = async (email) => {
    if (!auth) throw new Error('Firebase Auth not available');
    await sendPasswordResetEmail(auth, email);
    return true;
  };

  /**
   * Log out
   */
  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      localStorage.removeItem('coach_token');
      localStorage.removeItem('candidate_name');
      setUser(null);
      setCandidateNameState('');
      setProfile(DEFAULT_PROFILE);
    }
  };

  /**
   * Update Candidate Profile in State & Firestore
   */
  const updateCandidateProfile = async (newProfile) => {
    if (newProfile.fullName) {
      try {
        localStorage.setItem('candidate_name', newProfile.fullName);
      } catch (e) {}
      setUser(prev => prev ? { ...prev, name: newProfile.fullName } : { name: newProfile.fullName });
    }
    setProfile(prev => ({ ...prev, ...newProfile }));

    // Persist to Firestore if user is authenticated
    if (user?.uid) {
      await saveUserToFirestore(user.uid, {
        profile: { ...profile, ...newProfile }
      });
    }

    // Also notify local backend if reachable
    try {
      await api.updateProfile(newProfile);
    } catch (err) {
      // safe fallback
    }

    return newProfile;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      authError,
      candidateName,
      setCandidateName,
      login,
      register,
      loginWithGoogle,
      resendVerificationEmail,
      checkEmailVerificationStatus,
      resetPassword,
      logout,
      updateProfile: updateCandidateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
