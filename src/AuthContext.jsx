import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize or update user document in Firestore
  const initializeUserDocument = async (firebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userRef, {
        userId: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        storiesCreated: [],
        bookmarkedStories: [],
        likedStories: [],
        stats: {
          storiesCount: 0,
          countriesVisited: [],
          citiesVisited: []
        },
        createdAt: serverTimestamp(),
        onboardingCompleted: false
      });
    } else {
      // Update existing user info (in case profile changed)
      await setDoc(userRef, {
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      }, { merge: true });
    }

    // Fetch and return complete user data
    const updatedUserDoc = await getDoc(userRef);
    return { ...firebaseUser, firestoreData: updatedUserDoc.data() };
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const userWithData = await initializeUserDocument(result.user);
      return userWithData;
    } catch (err) {
      setError(err.message);
      console.error('Sign in error:', err);
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      await firebaseSignOut(auth);
    } catch (err) {
      setError(err.message);
      console.error('Sign out error:', err);
      throw err;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userWithData = await initializeUserDocument(firebaseUser);
          setUser(userWithData);
        } catch (err) {
          console.error('Error initializing user:', err);
          setError(err.message);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
