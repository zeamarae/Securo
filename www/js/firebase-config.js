/**
 * Firebase Configuration
 * Date: 2026-05-01
 * Description: Initializes Firebase for Securo app using the user's actual credentials.
 */

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// Your web app's Firebase configuration (Date: 2026-05-01)
const firebaseConfig = {
  apiKey: "AIzaSyDy_xxkjgMXivwPqQV8nUm1qsVQFbcRpSA",
  authDomain: "securo-a3c9c.firebaseapp.com",
  projectId: "securo-a3c9c",
  storageBucket: "securo-a3c9c.firebasestorage.app",
  messagingSenderId: "595397427101",
  appId: "1:595397427101:web:79757e82cbd5c48643f974",
  measurementId: "G-C9J26BV4GE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics, app, firebaseConfig };
