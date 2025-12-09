// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

// Firebase Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// Firestore
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Storage
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";


// Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDjSQQV6gJs3yysB24LzMWxT62_Cz0GBfg",
    authDomain: "persnalfinancetracker.firebaseapp.com",
    projectId: "persnalfinancetracker",
    storageBucket: "persnalfinancetracker.firebasestorage.app",
    messagingSenderId: "103969625034",
    appId: "1:103969625034:web:ccb03f423b9eb12499b533"
  };

// Init Firebase
export const app = initializeApp(firebaseConfig);

// Init Authentication
export const auth = getAuth(app);

// Init Firestore
export const db = getFirestore(app);

// Init Storage
export const storage = getStorage(app);

// Export Firestore + Storage helper functions
export {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  ref,
  uploadBytes,
  getDownloadURL
};

console.log("Firebase Initialized:", app.name);
