/**
 * Authentication Logic
 * Date: 2026-05-01
 * Description: Handles user authentication using Firebase Auth.
 */

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getEmailByStudentId } from './db.js';

const googleProvider = new GoogleAuthProvider();

export const studentIdToEmail = (studentId) => `student.${studentId}@securo.app`;
export const staffIdToEmail = (staffId) => `staff.${staffId}@securo.app`;
export const roleIdToEmail = (idNumber, role = "student") => {
    const normalizedRole = String(role || "student").trim().toLowerCase();
    return normalizedRole === "staff" ? staffIdToEmail(idNumber) : studentIdToEmail(idNumber);
};
export const getPreferredAuthRole = () => {
    const savedRole = String(localStorage.getItem('securo_preferred_role') || 'student').trim().toLowerCase();
    return savedRole === 'staff' ? 'staff' : 'student';
};

export const getFriendlyAuthMessage = (error, mode = "login", roleLabel = "account") => {
    const code = String(error?.code || error?.message || "").toLowerCase();
    const role = String(roleLabel || "account").trim().toLowerCase();

    if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/user-not-found")) {
        return `Incorrect ${role} ID or password. Please try again.`;
    }
    if (code.includes("auth/email-already-in-use")) {
        return `This ${role} account already exists.`;
    }
    if (code.includes("auth/invalid-email")) {
        return "Please enter a valid email address.";
    }
    if (code.includes("auth/weak-password")) {
        return "Password must be at least 6 characters.";
    }
    if (code.includes("auth/missing-password")) {
        return "Please enter your password.";
    }
    if (code.includes("auth/missing-email")) {
        return "Please enter your email address.";
    }
    if (code.includes("auth/too-many-requests")) {
        return "Too many attempts. Please try again in a moment.";
    }
    if (code.includes("auth/network-request-failed")) {
        return "Network error. Please check your internet connection.";
    }
    if (code.includes("auth/operation-not-allowed")) {
        return mode === "signup"
            ? "Account registration is not available right now."
            : "Sign in is not available right now.";
    }
    if (mode === "signup") {
        return "Could not create your account right now.";
    }
    if (mode === "reset") {
        return "Could not send reset instructions right now.";
    }
    return "Could not sign in right now.";
};

/**
 * Login user with either Email or Student ID
 * @param {string} identifier (Email or Student ID)
 * @param {string} password 
 */
export const login = async (identifier, password, roleOverride = getPreferredAuthRole()) => {
    try {
        let email = identifier;
        
        // Check if identifier is a Student ID (supports legacy YYYY-XXXXX or 7-digit format)
        if (/^\d{7}$/.test(identifier)) {
            email = roleIdToEmail(identifier, roleOverride);
        } else if (identifier.includes('-')) {
            const foundEmail = await getEmailByStudentId(identifier);
            if (foundEmail) {
                email = foundEmail;
            } else {
                throw new Error("Incorrect student ID or password.");
            }
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

/**
 * Login using Google Account
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        throw error;
    }
};

/**
 * Register a new user
 * @param {string} email 
 * @param {string} password 
 */
export const signUp = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

/**
 * Logout the current user
 */
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

/**
 * Check if user is authenticated and redirect if necessary
 */
export const checkAuth = (redirectIfUnauth = true) => {
    onAuthStateChanged(auth, (user) => {
        if (!user && redirectIfUnauth) {
            window.location.href = 'role-selection.html';
        } else if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('role-selection.html'))) {
            // Redirect logged-in users to index.html
            window.location.href = 'index.html';
        }
    });
};

/**
 * Send password reset email
 * @param {string} email 
 */
export const forgotPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        throw error;
    }
};
