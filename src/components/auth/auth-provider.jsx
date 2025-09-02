
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in via Firebase session. Fetch their profile from Firestore.
        const usersRef = collection(db, "users");
        // We query by email because that's the reliable field we get initially.
        const q = query(usersRef, where("email", "==", firebaseUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
        } else {
            // This case might happen if a user exists in Auth but not in Firestore.
            // For this app's logic, we treat them as not fully logged in.
            setUser(null); 
        }
      } else {
        // User is signed out.
        setUser(null);
      }
      setLoading(false);
    });

     return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", firebaseUser.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = { uid: firebaseUser.uid, ...userDoc.data() };
            setUser(userData);
            setLoading(false);
            return userData;
        } else {
             throw new Error("User profile not found in database.");
        }
    } catch(error) {
        setLoading(false);
        console.error("Firebase Auth Error:", error.code, error.message);
        throw new Error("Invalid credentials or user not found.");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch(e) {
      console.error("Error signing out from Firebase", e);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      // We throw the error so the UI layer can decide what message to show.
      throw new Error(error.code);
    }
  };

  const value = { user, loading, login, logout, resetPassword };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
