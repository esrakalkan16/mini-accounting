import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth ve Firestore instance'larını oluştur
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };  