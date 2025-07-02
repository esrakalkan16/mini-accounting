import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUD3yn7qRKONyz1kVepElWVgtNLq23sW0",
  authDomain: "mini-accounting-42dc2.firebaseapp.com",
  projectId: "mini-accounting-42dc2",
  storageBucket: "mini-accounting-42dc2.firebasestorage.app",
  messagingSenderId: "117405423847",
  appId: "1:117405423847:web:183f47f2932561706e2a42",
  measurementId: "G-2YEL1BH8NF"
};

// Firebase app'i başlat
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth instance'ı oluştur
const auth = getAuth(app);

// Firestore instance'ı oluştur
const db = getFirestore(app);

// Auth yapılandırmasını kontrol et
console.log('Firebase Auth initialized:', {
  projectId: app.options.projectId,
  authDomain: app.options.authDomain,
  apiKey: app.options.apiKey ? 'Set' : 'Not set'
});

export { auth, db };  