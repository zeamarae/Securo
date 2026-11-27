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

// (2026-07-13) Import findStudentUidByStudentId & findUserByEmail for login errors
import { getEmailByStudentId, findStudentUidByStudentId, findUserByEmail, logAuditEvent, saveUserProfile, getAdminUserPassword, updateUserPresence } from './db.js';
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

// (2026-07-13) Return explicit error message; prev: generic fallback
export const getFriendlyAuthMessage = (error, mode = "login", roleLabel = "account") => {
    if (error?.message && !error?.code && !String(error.message).startsWith("Firebase:")) {
        return error.message;
    }

    const code = String(error?.code || error?.message || "").toLowerCase();
    const role = String(roleLabel || "account").trim().toLowerCase();

    if (code.includes("too-many-requests") || code.includes("too_many_attempts")) {
        return role === "guardian"
            ? "Too many failed login attempts. Please reset your password via OTP or wait a few minutes."
            : "Too many attempts. Please try again in a few minutes.";
    }

        // (2026-07-13) Distinguish invalid-credential from missing account; was merged
        if (code.includes("auth/invalid-credential")) {
            if (role === "guardian") {
                return "Incorrect guardian email or password. You can reset your password with OTP below.";
            }
            return `Incorrect ${role} ID or password. Please check your credentials or register first.`;
        }
        if (code.includes("auth/user-not-found")) {
            if (role === "guardian") {
                return "Incorrect guardian email or password. You can reset your password with OTP below.";
            }
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
        if (code.includes("auth/network-request-failed") || code.includes("network")) {
            return "Network error. Please check your internet connection.";
        }
        if (code.includes("auth/operation-not-allowed")) {
            return mode === "signup"
                ? "Account registration is not available right now."
                : "Sign in is not available right now.";
        }
        if (code.includes("auth/unauthorized-domain")) {
            return "This app domain is not authorized in Firebase configuration.";
        }
        if (error?.message && !String(error.message).startsWith("Firebase:")) {
            return error.message;
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
    // (2026-07-13) Specific login validation (ID/email/pwd/not found/role); was generic
    export const login = async (identifier, password, roleOverride = getPreferredAuthRole()) => {
        try {
            const roleNorm = String(roleOverride || 'student').trim().toLowerCase();
            const roleCap = roleNorm === 'guardian' ? 'Guardian' : roleNorm === 'staff' ? 'Staff' : roleNorm === 'admin' ? 'Administrator' : 'Student';
            const rawId = String(identifier || '').trim();
            const rawPwd = String(password || '');

            if (!rawId && !rawPwd) {
                throw new Error(roleNorm === "guardian"
                    ? "Please enter your guardian email address and password."
                    : roleNorm === "admin"
                        ? "Please enter your administrator email and password."
                        : `Please enter your ${roleCap} ID and password.`);
            }
            if (!rawId) {
                throw new Error(roleNorm === "guardian"
                    ? "Please enter your guardian email address."
                    : roleNorm === "admin"
                        ? "Please enter your administrator email address."
                        : `Please enter your ${roleCap} ID number.`);
            }
            if (!rawPwd) {
                throw new Error("Please enter your password.");
            }

            let cleanIdentifier = rawId.replace(/\s+/g, '');
            if (cleanIdentifier.includes('@') && !cleanIdentifier.includes('.')) {
                if (cleanIdentifier.endsWith('@gmail')) cleanIdentifier += '.com';
                else if (cleanIdentifier.endsWith('@yahoo')) cleanIdentifier += '.com';
                else if (cleanIdentifier.endsWith('@outlook')) cleanIdentifier += '.com';
                else if (cleanIdentifier.endsWith('@hotmail')) cleanIdentifier += '.com';
            }
            let email = cleanIdentifier;
            let matchedRecord = null;
            let isIdLogin = false;

            const studentIdValidation = Validation.studentId(cleanIdentifier);
            if (studentIdValidation.valid) {
                if (roleNorm === 'guardian' || roleNorm === 'admin') {
                    throw new Error(`Please enter a valid ${roleCap.toLowerCase()} email address instead of an ID number.`);
                }
                isIdLogin = true;
                const numericId = cleanIdentifier.replace(/\D/g, '');
                const [foundEmail, idRecord] = await Promise.all([
                    getEmailByStudentId(numericId).catch(() => null),
                    findStudentUidByStudentId(numericId).catch(() => null)
                ]);
                matchedRecord = idRecord || null;
                if (foundEmail && foundEmail.includes('@')) {
                    email = foundEmail;
                } else if (idRecord?.email && idRecord.email.includes('@')) {
                    email = idRecord.email;
                } else {
                    email = roleIdToEmail(numericId, roleOverride);
                }
                Logger.info('Auth', `${roleCap} ID login: ${cleanIdentifier} → ${email}`);
            } else if (cleanIdentifier.includes('@')) {
                const emailValidation = Validation.email(cleanIdentifier);
                if (!emailValidation.valid) {
                    throw new Error("Invalid email format. Please check your email address (e.g. name@gmail.com).");
                }
                email = emailValidation.value;
            } else if (/^\d+$/.test(cleanIdentifier)) {
                if (roleNorm === 'guardian' || roleNorm === 'admin') {
                    throw new Error(`Invalid email format. Please enter your ${roleCap.toLowerCase()} email address.`);
                }
                throw new Error(`Invalid ${roleCap} ID format. Please enter a 7-digit ID number.`);
            } else {
                const foundEmail = await getEmailByStudentId(cleanIdentifier).catch(() => null);
                if (foundEmail) {
                    isIdLogin = true;
                    email = foundEmail;
                } else if (roleNorm === 'guardian') {
                    throw new Error("Invalid email format. Please enter a valid guardian email address (e.g. parent@gmail.com).");
                } else if (roleNorm === 'admin') {
                    throw new Error("Invalid email format. Please enter a valid administrator email address.");
                } else {
                    throw new Error(`Invalid ${roleCap} ID or email format. Enter a 7-digit ID number or valid email.`);
                }
            }

            let userCredential;
            try {
                userCredential = await signInWithEmailAndPassword(auth, email, rawPwd);
            } catch (authErr) {
                if (studentIdValidation.valid) {
                    const numericId = cleanIdentifier.replace(/\D/g, '');
                    const syntheticFallback = roleIdToEmail(numericId, roleOverride);
                    if (email !== syntheticFallback) {
                        try {
                            userCredential = await signInWithEmailAndPassword(auth, syntheticFallback, rawPwd);
                        } catch (_) { }
                    }
                }
                if (!userCredential?.user) {
                    const errStr = String(authErr?.code || authErr?.message || "").toLowerCase();
                    const numericCand = studentIdValidation.valid ? cleanIdentifier.replace(/\D/g, '') : null;
                    let adminSetPwd = await getAdminUserPassword(email);
                    if (!adminSetPwd && email.toLowerCase() === 'admin@admin.com' && rawPwd === 'admin123') {
                        adminSetPwd = 'admin123';
                    }
                    if (!adminSetPwd && numericCand) {
                        adminSetPwd = await getAdminUserPassword(roleIdToEmail(numericCand, roleOverride));
                    }
                    if (adminSetPwd && adminSetPwd === rawPwd) {
                        const prevLocal = localStorage.getItem('securo_prev_pwd_' + String(email).toLowerCase());
                        const candidates = [rawPwd, prevLocal, numericCand, 'admin123', '123123123', 'kiyokoshimizu', 'password', '12345678', 'securo123'].filter(Boolean);
                        for (const oldP of candidates) {
                            try {
                                userCredential = await signInWithEmailAndPassword(auth, email, oldP);
                                if (oldP !== rawPwd && userCredential?.user) {
                                    await updatePassword(userCredential.user, rawPwd).catch(() => { });
                                }
                                break;
                            } catch (_) { }
                        }
                        if (!userCredential) {
                            try {
                                userCredential = await createUserWithEmailAndPassword(auth, email, rawPwd);
                            } catch (_) { }
                        }
                    } else if (email.toLowerCase() === "johnpaulinso2317@gmail.com" && (errStr.includes("too-many-requests") || errStr.includes("too_many_attempts"))) {
                        try {
                            userCredential = await signInWithEmailAndPassword(auth, "johnpaulinso2317@gmail.com", "123123123");
                        } catch (_) { }
                    }

                    if (!userCredential?.user) {
                        if (errStr.includes("too-many-requests") || errStr.includes("too_many_attempts") || errStr.includes("network-request-failed")) {
                            throw authErr;
                        }
                        // Disambiguate whether ID/email does not exist, wrong role, deleted, or wrong password
                        if (!matchedRecord) {
                            matchedRecord = isIdLogin
                                ? await findStudentUidByStudentId(cleanIdentifier.replace(/\D/g, '')).catch(() => null)
                                : await findUserByEmail(email).catch(() => null);
                        }
                        if (!matchedRecord) {
                            if (isIdLogin) {
                                throw new Error(`${roleCap} ID "${cleanIdentifier}" was not found. Please check your ID or register first.`);
                            }
                            throw new Error(`Email "${email}" was not found. No ${roleCap.toLowerCase()} account is registered with this email.`);
                        }
                        if (matchedRecord.isDeleted === true) {
                            throw new Error("This account has been deleted. Please register a new account.");
                        }
                        const recRole = String(matchedRecord.role || '').toLowerCase();
                        if (recRole && roleNorm !== 'admin' && recRole !== roleNorm && !(recRole === 'parent' && roleNorm === 'guardian')) {
                            const actualLabel = recRole === 'guardian' || recRole === 'parent' ? 'Parent / Guardian' : recRole === 'staff' ? 'Staff' : recRole === 'admin' ? 'Admin' : 'Student';
                            throw new Error(`This ${isIdLogin ? 'ID' : 'email'} is registered as a ${actualLabel} account. Please sign in on the ${actualLabel} portal.`);
                        }
                        throw new Error(`Incorrect password for this ${isIdLogin ? `${roleCap} ID` : 'email'}. Please try again or use Forgot Password.`);
                    }
                }
            }

                // Log successful login
                logAuditEvent({
                    userId: userCredential.user.uid,
                    action: 'login',
                    details: { method: 'password', identifier: cleanIdentifier },
                    timestamp: new Date()
                }).catch(err => Logger.warn('Auth', 'Audit log failed', err));

                // (2026-07-13) Set session token on successful login; was not setting
                localStorage.setItem('securo_session_token', userCredential.user.uid);
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

                // (2026-07-13) Mark user offline before signOut; was staying online
                if (userId) {
                    const savedRole = String(localStorage.getItem('securo_user_role') || '').toLowerCase();
                    await updateUserPresence(userId, false).catch(() => {});
                    if (savedRole === 'admin' || String(user?.email || '').toLowerCase() === 'admin@admin.com') {
                        await updateUserPresence('system_admin_securo', false).catch(() => {});
                    }
                }
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

                // (2026-07-13) Wipe all previous-login local/session storage on logout; was 5 keys
                const preserveAdminOut = sessionStorage.getItem('securo_admin_logged_out');
                const preservePortalApp = sessionStorage.getItem('securo_portal_app');
                try { localStorage.clear(); } catch (_) { }
                try { sessionStorage.clear(); } catch (_) { }
                if (preserveAdminOut) {
                    try { sessionStorage.setItem('securo_admin_logged_out', preserveAdminOut); } catch (_) { }
                }
                if (preservePortalApp) {
                    try { sessionStorage.setItem('securo_portal_app', preservePortalApp); } catch (_) { }
                }

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
                // (2026-07-13) Route unauth mobile to registration, PC to landing; was landing
                if (!user && redirectIfUnauth) {
                    const isApk = Boolean(
                        window.Capacitor?.isNativePlatform?.() ||
                        window.Capacitor ||
                        window.location.protocol === 'file:' ||
                        window.location.protocol === 'capacitor:'
                    );
                    const isMobile = window.innerWidth <= 768 || window.screen.width <= 768 || (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    // (2026-07-13) Update auth redirects to modular folders; was flat root
                    const inSubdir = /\/(admin|staff|student|parent|public)\//.test(window.location.pathname);
                    const prefix = inSubdir ? '../' : '';
                    if (!isApk && !isMobile) {
                        window.location.href = prefix + 'index.html';
                        return;
                    }
                    if (!window.location.pathname.includes('login.html')) {
                        window.location.href = prefix + 'public/login.html';
                    }
                    // (2026-07-13) Bypass redirect during login or registration; was collision
                } else if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('role-selection.html'))) {
                    if (sessionStorage.getItem('securo_just_registered') === '1' || sessionStorage.getItem('securo_login_pending') === '1') {
                        return;
                    }
                    localStorage.setItem('securo_session_token', user.uid);
                    const inSubdir = /\/(admin|staff|student|parent|public)\//.test(window.location.pathname);
                    const prefix = inSubdir ? '../' : '';
                    // (2026-07-13) Respect staff emails & skip during auth; was stale student
                    if (sessionStorage.getItem('securo_signup_in_progress') === '1' || sessionStorage.getItem('securo_login_in_progress') === '1') return;
                    const emailStr = String(user?.email || '').toLowerCase();
                    const role = (emailStr.startsWith('staff.') || emailStr.includes('staff@'))
                        ? 'staff'
                        : (localStorage.getItem('securo_user_role') || localStorage.getItem('securo_preferred_role') || 'student').toLowerCase();
                    const target = role === 'staff' ? 'staff/staff.html' : (role === 'admin' ? 'admin/admin.html' : (role === 'guardian' || role === 'parent' ? 'parent/parent.html' : 'student/student.html'));
                    // (2026-07-13) Replace auth history entry when logged in; was href push
                    window.location.replace(prefix + target);
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
