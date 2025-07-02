// src/config/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config'in doğru, burada aynen kalabilir
const firebaseConfig = {
  apiKey: "AIzaSyC56lc7FmQ2d_X9THdAyfgyKRyhTK59-9o",
  authDomain: "karhesabi-21f0d.firebaseapp.com",
  projectId: "karhesabi-21f0d",
  storageBucket: "karhesabi-21f0d.firebasestorage.app",
  messagingSenderId: "630891852098",
  appId: "1:630891852098:web:55ce8785c448e9d14718db",
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Gerekli servisleri dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
