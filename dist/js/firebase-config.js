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

// (2026-07-13) Isolate admin Firebase app from student/parent tabs; was shared default
const resolveFirebaseAppName = () => {
  try {
    const path = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname.toLowerCase() : '';
    if (path.includes('/admin/')) {
      sessionStorage.setItem('securo_portal_app', 'securo-admin');
      return 'securo-admin';
    }
    if (path.includes('/student/') || path.includes('/parent/') || path.includes('/staff/')) {
      sessionStorage.setItem('securo_portal_app', '[DEFAULT]');
      return '[DEFAULT]';
    }
    if (path.includes('/public/') && sessionStorage.getItem('securo_portal_app') === 'securo-admin') {
      return 'securo-admin';
    }
  } catch (_) {}
  return '[DEFAULT]';
};
const appName = resolveFirebaseAppName();
const app = appName === '[DEFAULT]' ? initializeApp(firebaseConfig) : initializeApp(firebaseConfig, appName);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics = null;
try { analytics = getAnalytics(app); } catch (_) {}

export { auth, db, storage, analytics, app, firebaseConfig };
