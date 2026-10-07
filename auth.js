/**
 * Authentication Logic v2.0
 * Date: 2026-10-06
 * Description: Handles user authentication using Firebase Auth with unified validation
 */

import { auth } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { getEmailByStudentId, logAuditEvent } from './db.js';
import { Validation, Logger } from './utils.js';

const googleProvider = new GoogleAuthProvider();

// Synthetic email generation for ID-based accounts
export const studentIdToEmail = (studentId) => {
    const cleaned = String(studentId).replace(/\D/g, '');
    return `student.${cleaned}@securo.app`;
};

export const staffIdToEmail = (staffId) => {
    const cleaned = String(staffId).replace(/\D/g, '');
    return `staff.${cleaned}@securo.app`;
};

export const roleIdToEmail = (idNumber, role = "student") => {
    const normalizedRole = String(role || "student").trim().toLowerCase();
    return normalizedRole === "staff" ? staffIdToEmail(idNumber) : studentIdToEmail(idNumber);
};

export const getPreferredAuthRole = () => {
    const savedRole = String(localStorage.getItem('securo_preferred_role') || 'student').trim().toLowerCase();
    return savedRole === 'staff' ? 'staff' : 'student';
};

// Extract student ID from synthetic email
export const extractStudentIdFromEmail = (email) => {
    const match = String(email || '').match(/^student\.(\d+)@securo\.app$/);
    return match ? match[1] : null;
};

export const getFriendlyAuthMessage = (error, mode = "login", roleLabel = "account") => {
    const code = String(error?.code || error?.message || "").toLowerCase();
    const role = String(roleLabel || "account").trim().toLowerCase();

    if (code.includes("auth/invalid-credential") || code.includes("auth/user-not-found")) {
        return mode === "login" 
            ? `No account found with this ${role} ID. Please register first or check your ID.`
            : `Incorrect ${role} ID or password.`;
    }
    if (code.includes("auth/wrong-password")) {
        return `Incorrect password. Please try again or use "Forgot Password".`;
    }
    if (code.includes("auth/email-already-in-use")) {
        return `This ${role} account already exists. Please sign in instead.`;
    }
    if (code.includes("auth/invalid-email")) {
        return "Please enter a valid email address.";
    }
    if (code.includes("auth/weak-password")) {
        return "Password must be at least 8 characters.";
    }
    if (code.includes("auth/missing-password")) {
        return "Please enter your password.";
    }
    if (code.includes("auth/missing-email")) {
        return "Please enter your email address.";
    }
    if (code.includes("auth/too-many-requests")) {
        return "Too many attempts. Please try again in a few minutes.";
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
    return "Could not sign in right now. Please try again.";
};

/**
 * Login user with either Email or Student ID
 * @param {string} identifier (Email or Student ID)
 * @param {string} password 
 * @param {string} roleOverride - Optional role override
 */
export const login = async (identifier, password, roleOverride = getPreferredAuthRole()) => {
    try {
        // Validate inputs
        if (!identifier || !password) {
            throw new Error("Please enter your ID/email and password");
        }

        const cleanIdentifier = String(identifier).trim();
        let email = cleanIdentifier;
        
        // Detect identifier type and convert to email if needed
        const studentIdValidation = Validation.studentId(cleanIdentifier);
        if (studentIdValidation.valid) {
            // It's a valid student ID - convert to synthetic email
            const numericId = cleanIdentifier.replace(/\D/g, '');
            email = roleIdToEmail(numericId, roleOverride);
            Logger.info('Auth', `Student ID login: ${cleanIdentifier} → ${email}`);
        } else {
            // Try as email
            const emailValidation = Validation.email(cleanIdentifier);
            if (emailValidation.valid) {
                email = emailValidation.value;
            } else {
                // Check if it's a legacy format in database
                const foundEmail = await getEmailByStudentId(cleanIdentifier).catch(() => null);
                if (foundEmail) {
                    email = foundEmail;
                } else {
                    throw new Error("Invalid student ID or email format");
                }
            }
        }

        // Attempt login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Log successful login
        logAuditEvent({
            userId: userCredential.user.uid,
            action: 'login',
            details: { method: 'password', identifier: cleanIdentifier },
            timestamp: new Date()
        }).catch(err => Logger.warn('Auth', 'Audit log failed', err));

        return userCredential.user;
    } catch (error) {
        Logger.error('Auth', 'Login failed', { identifier, error: error.message });
        throw error;
    }
};

/**
 * Login using Google Account
 */
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        
        // Log successful Google login
        logAuditEvent({
            userId: result.user.uid,
            action: 'login',
            details: { method: 'google', email: result.user.email },
            timestamp: new Date()
        }).catch(err => Logger.warn('Auth', 'Audit log failed', err));
        
        return result.user;
    } catch (error) {
        Logger.error('Auth', 'Google login failed', error);
        throw error;
    }
};

/**
 * Register a new user with validation
 * @param {string} email 
 * @param {string} password 
 * @param {object} options - Additional validation options
 */
export const signUp = async (email, password, options = {}) => {
    try {
        // Validate email
        const emailValidation = Validation.email(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }

        // Validate password
        const passwordValidation = Validation.password(password, { minLength: 8 });
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }

        // Warn on weak passwords
        if (passwordValidation.strength === 'weak') {
            Logger.warn('Auth', 'Weak password used during signup');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, emailValidation.value, password);
        
        // Log successful registration
        logAuditEvent({
            userId: userCredential.user.uid,
            action: 'signup',
            details: { 
                method: 'email', 
                email: emailValidation.value,
                passwordStrength: passwordValidation.strength
            },
            timestamp: new Date()
        }).catch(err => Logger.warn('Auth', 'Audit log failed', err));

        return userCredential.user;
    } catch (error) {
        Logger.error('Auth', 'Signup failed', { email, error: error.message });
        throw error;
    }
};

/**
 * Logout the current user
 */
export const logout = async () => {
    try {
        const user = auth.currentUser;
        const userId = user?.uid;
        
        await signOut(auth);
        
        // Log logout
        if (userId) {
            logAuditEvent({
                userId,
                action: 'logout',
                details: { timestamp: new Date() },
                timestamp: new Date()
            }).catch(err => Logger.warn('Auth', 'Audit log failed', err));
        }
        
        // Clear sensitive data from storage
        localStorage.removeItem('securo_session_token');
        
        Logger.info('Auth', 'User logged out successfully');
    } catch (error) {
        Logger.error('Auth', 'Logout failed', error);
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
 * Send password reset email with validation
 * @param {string} email 
 */
export const forgotPassword = async (email) => {
    try {
        // Validate email first
        const emailValidation = Validation.email(email);
        if (!emailValidation.valid) {
            throw new Error(emailValidation.error);
        }

        await sendPasswordResetEmail(auth, emailValidation.value);
        
        Logger.info('Auth', 'Password reset email sent', { email: emailValidation.value });
    } catch (error) {
        Logger.error('Auth', 'Password reset failed', { email, error: error.message });
        throw error;
    }
};

/**
 * Change user password (requires current password)
 * @param {string} currentPassword 
 * @param {string} newPassword 
 */
export const changePassword = async (currentPassword, newPassword) => {
    try {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error("No authenticated user found");
        }

        // Validate new password
        const passwordValidation = Validation.password(newPassword, { minLength: 8 });
        if (!passwordValidation.valid) {
            throw new Error(passwordValidation.error);
        }

        // Reauthenticate first
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update password
        await updatePassword(user, newPassword);

        // Log password change
        logAuditEvent({
            userId: user.uid,
            action: 'password_change',
            details: { 
                passwordStrength: passwordValidation.strength,
                timestamp: new Date()
            },
            timestamp: new Date()
        }).catch(err => Logger.warn('Auth', 'Audit log failed', err));

        Logger.info('Auth', 'Password changed successfully');
    } catch (error) {
        Logger.error('Auth', 'Password change failed', error);
        
        if (error.code === 'auth/wrong-password') {
            throw new Error('Current password is incorrect');
        }
        throw error;
    }
};
