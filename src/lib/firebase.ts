import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC83IMkwKv5ccfFY-VNo6JHFaYNL5eNhcE",
  authDomain: "make-ugc.firebaseapp.com",
  projectId: "make-ugc",
  storageBucket: "make-ugc.firebasestorage.app",
  messagingSenderId: "492432990316",
  appId: "1:492432990316:web:20d78e8c683bf4f0863849",
  measurementId: "G-1RB5785XV3"
};

const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
};
export type { User };
