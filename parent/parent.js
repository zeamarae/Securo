// (2026-07-13) Consolidated Parent JS (auth + dashboard); was 2 files
import { Logger, UI, Permissions, Validation, Format, Storage, Network, Device } from '../js/utils.js';
import { auth, db, firebaseConfig } from '../js/firebase-config.js';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword, confirmPasswordReset } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, onSnapshot, collection, query, where, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
// (2026-07-13) Import findStudentUid & guardian vault query; was missing
import { getUserProfile, getAcceptedLinksForGuardian, getAllLinksForGuardian, subscribeToGuardianLinks, getAllUsers, getStudentBootstrapProfile, subscribeToStudentLocation, subscribeToStudentAttendance, logAttendance, getAttendanceHistory, getGADPosts, getAllEmergencyPosts, readLocalEmergencyPosts, getUserEmergencyPosts, getGuardianSharedEmergencyPosts, findStudentUidByStudentId, createGuardianLinkRequest, respondToGuardianLink, removeGuardianLink, updateGuardianLinkStudentId, toggleLikeGADPost, sendAccountNotification, subscribeToAccountNotifications, sendChatMessage, subscribeToMessagesByThread, sendGuardianLocationReminder, subscribeToCampusMapConfig, subscribeToStudentSOS, deleteCurrentUserAccount, findUserByEmail, syncGuardianLinksForGuardian, saveUserProfile, saveAdminUserPassword, getAdminUserPassword } from '../js/db.js';
import { login, signUp, forgotPassword, getFriendlyAuthMessage } from '../js/auth.js';
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import '../js/install-sw.js';

// (2026-07-13) Reset all modals on parent mode switch; was lingering
window.switchParentMode = function(mode) {
    const authSec = document.getElementById('parentAuthSection');
    const dashShell = document.getElementById('parentDashboardShell');
    if (authSec) authSec.classList.toggle('is-hidden', mode !== 'auth');
    if (dashShell) dashShell.classList.toggle('is-hidden', mode !== 'dashboard');
    ['guardianOtpModal', 'guardianTermsModal', 'guardianNotifDropdown'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    ['linkModal', 'vaultViewerModal', 'deleteAccountModal', 'guardianChatOverlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
};

(function() {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'auth') window.switchParentMode('auth');
})();

// --- Guardian Auth & Password Reset Module ---
(function initParentAuthModule() {
// (2026-07-13) Import Firebase secondary auth helpers; was basic auth
        // (2026-07-13) Import getAdminUserPassword; was not imported

        const mainAuthForm = document.getElementById('guardianAuthForm');
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const errorMsg = document.getElementById('errorMsg');
        const toastStack = document.getElementById('toastStack');
        const emailInput = document.getElementById('emailInput');
        let isLoginMode = true;

        // (2026-07-13) Add password eye toggle; was password input without toggle
        document.querySelectorAll('[data-password-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.passwordTarget);
                if (!target) return;
                const isPass = target.type === 'password';
                target.type = isPass ? 'text' : 'password';
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = isPass ? 'visibility_off' : 'visibility';
            });
        });

        const showToast = (title, message, type = 'info') => {
            const icon = type === 'error' ? 'error' : type === 'success' ? 'check_circle' : 'info';
            const toast = document.createElement('div');
            toast.className = `toast-card ${type}`;
            toast.innerHTML = `
                <div class="toast-icon">
                    <span class="material-symbols-outlined">${icon}</span>
                </div>
                <div class="toast-copy">
                    <strong>${title}</strong>
                    <span>${message}</span>
                </div>
            `;
            toastStack.appendChild(toast);
            setTimeout(() => toast.remove(), 3200);
        };

        function setButtonBusy(button, isBusy = true) {
            if (!button) return;
            button.classList.toggle('is-busy', isBusy);
            button.disabled = isBusy;
        }

        const setMode = (mode) => {
            isLoginMode = mode === 'login';
            loginTab.classList.toggle('active', isLoginMode);
            signupTab.classList.toggle('active', !isLoginMode);

            document.querySelectorAll('.signup-only').forEach((el) => {
                el.style.display = isLoginMode ? 'none' : 'block';
                const field = el.querySelector('input');
                if (field) {
                    if (isLoginMode) field.removeAttribute('required');
                    else field.setAttribute('required', 'required');
                }
            });
            document.querySelectorAll('.login-only').forEach((el) => {
                el.style.display = isLoginMode ? 'block' : 'none';
            });

            emailInput.setAttribute('required', 'required');
            btnText.textContent = isLoginMode ? 'Enter Guardian Hub' : 'Create Guardian Account';
            errorMsg.textContent = '';
            // (2026-07-13) Blank register inputs on switch; was persistent inputs
            if (!isLoginMode) {
                const fn = document.getElementById('fullNameSignup');
                if (fn) fn.value = '';
                if (emailInput) emailInput.value = '';
                const pwd = document.getElementById('passwordInput');
                if (pwd) pwd.value = '';
                const cpwd = document.getElementById('confirmPasswordSignup');
                if (cpwd) cpwd.value = '';
            }
        };

        loginTab.addEventListener('click', () => setMode('login'));
        signupTab.addEventListener('click', () => setMode('signup'));

        // (2026-07-13) Password reset link modal handler; was 3-step OTP flow
        const openOtpModalBtn = document.getElementById('openOtpModalBtn');
        const guardianOtpModal = document.getElementById('guardianOtpModal');
        const closeOtpModalBtn = document.getElementById('closeOtpModalBtn');
        const resetRequestView = document.getElementById('resetRequestView');
        const resetSentView = document.getElementById('resetSentView');
        const resetNewPasswordView = document.getElementById('resetNewPasswordView');
        const resetEmailInput = document.getElementById('resetEmailInput');
        const sendResetLinkBtn = document.getElementById('sendResetLinkBtn');
        const resetEmailError = document.getElementById('resetEmailError');
        const resetTargetEmailDisplay = document.getElementById('resetTargetEmailDisplay');
        const backToSignInBtn = document.getElementById('backToSignInBtn');
        const resendResetLinkBtn = document.getElementById('resendResetLinkBtn');
        const modalNewPassword = document.getElementById('modalNewPassword');
        const modalConfirmPassword = document.getElementById('modalConfirmPassword');
        const newPasswordError = document.getElementById('newPasswordError');
        const saveNewPasswordBtn = document.getElementById('saveNewPasswordBtn');

        const openResetModal = () => {
            const currentVal = emailInput.value.trim();
            if (currentVal && resetEmailInput) resetEmailInput.value = currentVal;
            if (resetEmailError) resetEmailError.textContent = '';
            if (resetRequestView) resetRequestView.style.display = 'block';
            if (resetSentView) resetSentView.style.display = 'none';
            if (resetNewPasswordView) resetNewPasswordView.style.display = 'none';
            if (guardianOtpModal) guardianOtpModal.style.display = 'flex';
        };

        const closeResetModal = () => {
            if (guardianOtpModal) guardianOtpModal.style.display = 'none';
        };

        openOtpModalBtn?.addEventListener('click', openResetModal);
        closeOtpModalBtn?.addEventListener('click', closeResetModal);
        guardianOtpModal?.addEventListener('click', (e) => {
            if (e.target === guardianOtpModal) closeResetModal();
        });

        const handleSendResetLink = async () => {
            if (resetEmailError) resetEmailError.textContent = '';
            let email = (resetEmailInput?.value || '').trim().toLowerCase();
            if (email.includes('@') && !email.includes('.')) {
                if (email.endsWith('@gmail')) email += '.com';
            }
            if (!email || !email.includes('@')) {
                if (resetEmailError) resetEmailError.textContent = 'Please enter a valid guardian Gmail address.';
                return;
            }

            setButtonBusy(sendResetLinkBtn, true);
            if (resendResetLinkBtn) setButtonBusy(resendResetLinkBtn, true);
            try {
                await forgotPassword(email);
                if (resetTargetEmailDisplay) resetTargetEmailDisplay.textContent = email;
                if (resetRequestView) resetRequestView.style.display = 'none';
                if (resetSentView) resetSentView.style.display = 'block';
                showToast('Reset Link Sent', `Password reset link sent to ${email}.`, 'success');
            } catch (err) {
                const message = getFriendlyAuthMessage(err, 'reset', 'guardian');
                if (resetEmailError) resetEmailError.textContent = message;
                showToast('Reset Failed', message, 'error');
            } finally {
                setButtonBusy(sendResetLinkBtn, false);
                if (resendResetLinkBtn) setButtonBusy(resendResetLinkBtn, false);
            }
        };

        sendResetLinkBtn?.addEventListener('click', handleSendResetLink);
        resendResetLinkBtn?.addEventListener('click', handleSendResetLink);

        backToSignInBtn?.addEventListener('click', () => {
            closeResetModal();
            const email = (resetEmailInput?.value || '').trim();
            if (email && emailInput) {
                emailInput.value = email;
                setMode('login');
                const pwd = document.getElementById('passwordInput');
                if (pwd) pwd.focus();
            }
        });

        saveNewPasswordBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            if (newPasswordError) newPasswordError.textContent = '';
            const newPassword = (modalNewPassword?.value || '');
            const confirmPassword = (modalConfirmPassword?.value || '');

            if (newPassword.length < 8) {
                newPasswordError.textContent = 'New password must be at least 8 characters.';
                return;
            }
            if (newPassword !== confirmPassword) {
                newPasswordError.textContent = 'New password and confirm password do not match.';
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const oobCode = urlParams.get('oobCode');
            if (!oobCode) {
                newPasswordError.textContent = 'Reset code missing. Please use the link from your email.';
                return;
            }

            setButtonBusy(saveNewPasswordBtn, true);
            try {
                await confirmPasswordReset(auth, oobCode, newPassword);
                showToast('Password Changed', 'Password reset successfully! Please sign in.', 'success');
                closeResetModal();
                setMode('login');
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);
            } catch (err) {
                const message = getFriendlyAuthMessage(err, 'reset', 'guardian');
                newPasswordError.textContent = message;
                showToast('Reset Error', message, 'error');
            } finally {
                setButtonBusy(saveNewPasswordBtn, false);
            }
        });

        mainAuthForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorMsg.textContent = '';
            setButtonBusy(submitBtn, true);

            try {
                let email = emailInput.value.trim().replace(/\s+/g, '');
                if (email.includes('@') && !email.includes('.')) {
                    if (email.endsWith('@gmail')) email += '.com';
                }
                const password = document.getElementById('passwordInput').value;

                if (isLoginMode) {
                    if (!email || !password) {
                        throw new Error('Please enter your guardian email and password.');
                    }
                    // (2026-07-13) Pass guardian role and sanitize email on login; was omitted
                    const loggedInUser = await login(email, password, 'guardian');
                    if (loggedInUser?.uid) {
                        localStorage.setItem('securo_session_token', loggedInUser.uid);
                    }
                    sessionStorage.setItem('securo_authenticated', '1');
                    window.history.replaceState({}, '', 'parent.html'); window.switchParentMode('dashboard'); if (auth.currentUser) { window.location.reload(); }
                    return;
                }

                const name = document.getElementById('fullNameSignup').value.trim();
                const confirmPassword = document.getElementById('confirmPasswordSignup').value;

                if (name.length < 3) {
                    throw new Error('Please enter your full name.');
                }
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    throw new Error('Please enter a valid email address.');
                }
                if (password.length < 8) {
                    throw new Error('Password must be at least 8 characters.');
                }
                if (password !== confirmPassword) {
                    throw new Error('Passwords do not match.');
                }

                let emailTaken = false;
                try {
                    const raw = localStorage.getItem('securo_user_directory');
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        emailTaken = Object.values(parsed).some(u => String(u.email || '').toLowerCase() === email.toLowerCase());
                    }
                } catch (_) {}
                if (emailTaken) {
                    throw new Error('That guardian email is already registered. Please sign in.');
                }

                setButtonBusy(submitBtn, false);
                // (2026-07-13) Open terms modal on register; was direct submit signup
                const guardianTermsModal = document.getElementById('guardianTermsModal');
                if (guardianTermsModal) guardianTermsModal.style.display = 'flex';
            } catch (error) {
                const message = getFriendlyAuthMessage(error, isLoginMode ? 'login' : 'signup', 'guardian');
                errorMsg.textContent = message;
                showToast(isLoginMode ? 'Login failed' : 'Registration failed', message, 'error');
                setButtonBusy(submitBtn, false);
            }
        });

        // (2026-07-13) Register guardian on Terms agree; prev: direct form signup
        const guardianTermsModal = document.getElementById('guardianTermsModal');
        const declineGuardianTermsBtn = document.getElementById('declineGuardianTermsBtn');
        const agreeGuardianTermsBtn = document.getElementById('agreeGuardianTermsBtn');
        const closeGuardianTermsModalBtn = document.getElementById('closeGuardianTermsModalBtn');

        const closeGuardianTerms = () => {
            if (guardianTermsModal) guardianTermsModal.style.display = 'none';
        };

        // (2026-07-13) Show decline terms error; was silent modal dismissal
        const handleGuardianTermsDecline = () => {
            closeGuardianTerms();
            const declineMsg = "Can't proceed without agreeing to the terms and conditions.";
            errorMsg.textContent = declineMsg;
            showToast("Terms Required", declineMsg, "error");
        };

        if (declineGuardianTermsBtn) declineGuardianTermsBtn.addEventListener('click', handleGuardianTermsDecline);
        if (closeGuardianTermsModalBtn) closeGuardianTermsModalBtn.addEventListener('click', handleGuardianTermsDecline);
        if (guardianTermsModal) {
            guardianTermsModal.addEventListener('click', (e) => {
                if (e.target === guardianTermsModal) handleGuardianTermsDecline();
            });
        }

        if (agreeGuardianTermsBtn) {
            agreeGuardianTermsBtn.addEventListener('click', async () => {
                setButtonBusy(agreeGuardianTermsBtn, true);
                try {
                    const email = emailInput.value.trim();
                    const password = document.getElementById('passwordInput').value;
                    const name = document.getElementById('fullNameSignup').value.trim();
                    const confirmPassword = document.getElementById('confirmPasswordSignup').value;

                    if (name.length < 3) throw new Error('Please enter your full name.');
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
                    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
                    if (password !== confirmPassword) throw new Error('Passwords do not match.');

                    const user = await signUp(email, password);
                    await saveUserProfile(user.uid, {
                        name,
                        email,
                        role: 'guardian'
                    });
                    // (2026-07-13) Save admin password on register; was profile only save
                    await saveAdminUserPassword(user.uid, email, password);
                    localStorage.setItem('securo_session_token', user.uid);
                    sessionStorage.setItem('securo_authenticated', '1');

                    try {
                        const raw = localStorage.getItem('securo_user_directory');
                        const dir = raw ? JSON.parse(raw) : {};
                        dir[user.uid] = { ...(dir[user.uid] || {}), name, email, role: 'guardian', updatedAt: new Date().toISOString() };
                        localStorage.setItem('securo_user_directory', JSON.stringify(dir));
                    } catch (_) {}

                    closeGuardianTerms();
                    showToast('Account created', 'Your guardian account is ready. Add your child’s Student ID next in the dashboard.', 'success');
                    setTimeout(() => {
                        window.history.replaceState({}, '', 'parent.html'); window.switchParentMode('dashboard'); if (auth.currentUser) { window.location.reload(); }
                    }, 1200);
                } catch (error) {
                    const message = getFriendlyAuthMessage(error, 'signup', 'guardian');
                    errorMsg.textContent = message;
                    showToast('Registration failed', message, 'error');
                    closeGuardianTerms();
                } finally {
                    setButtonBusy(agreeGuardianTermsBtn, false);
                }
            });
        }
        // (2026-07-13) Auto-open password reset modal from email link; was unhandled
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'resetPassword' || urlParams.get('oobCode')) {
            openResetModal();
            if (resetRequestView) resetRequestView.style.display = 'none';
            if (resetSentView) resetSentView.style.display = 'none';
            if (resetNewPasswordView) resetNewPasswordView.style.display = 'block';
        }
})();

// --- Guardian Dashboard Main Module ---
// (2026-07-13) Extracted unified parent script; was inline module
// Core utilities and offline support
        // (2026-07-13) Fix install-sw path to js/ folder; was broken root path
        
        // (2026-07-13) Add Firestore & findUserByEmail imports; was auth only

        let map, studentMarker, polyline;
        let activeLink = null;
        let attendanceUnsub = null;
        let locationUnsub = null;
        // (2026-07-13) Add sosUnsub for active SOS listener; was missing
        let sosUnsub = null;
        let guardianProfile = null;
        let currentSharedVaultItems = [];
        let latestStudentLocation = null;
        let notificationUnsub = null;
        let guardianLinksLiveUnsub = null;
        let pendingGuardianLink = null;
        let guardianSupportUnsub = null;
        let currentGuardianSupportThreadId = null;

        // (2026-07-13) Support desktop nav tab selectors; was mobile .nav-item only
        const navItems = document.querySelectorAll('.nav-item, .desktop-nav-item');
        const views = document.querySelectorAll('.view');
        const studentSelectorBar = document.getElementById('studentSelectorBar');
        const vaultViewerModal = document.getElementById('vaultViewerModal');
        const vaultViewerMedia = document.getElementById('vaultViewerMedia');
        const vaultViewerMeta = document.getElementById('vaultViewerMeta');
        const closeVaultViewerBtn = document.getElementById('closeVaultViewerBtn');
        const downloadVaultViewerBtn = document.getElementById('downloadVaultViewerBtn');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const target = item.dataset.nav;
                console.log("Navigating to:", target);
                setActiveView(target);
            });
        });

        // (2026-07-13) Support all view tab refreshes; was map/vault/gad only
        function setActiveView(viewId) {
            navItems.forEach(i => i.classList.toggle('active', i.dataset.nav === viewId));
            views.forEach(v => v.classList.toggle('active', v.id === `${viewId}View`));
            if (viewId === 'map') {
                initMap();
                if (map) setTimeout(() => map.invalidateSize(), 300);
            }
            // (2026-07-13) Load vault with UID, studentId & name; was UID only
            if (viewId === 'vault') {
                loadSharedVault(activeLink?.studentUid, activeLink?.studentId, document.getElementById('activeStudentName')?.textContent);
            }
            // (2026-07-13) Render combined safety alerts; was attendance only
            if (viewId === 'alerts') renderAlerts();
            if (viewId === 'gad') loadGADPosts();
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        // (2026-07-13) Define CAMPUS_CENTER and geofence polygon for guardian map; was missing
        const CAMPUS_CENTER = [11.26659, 124.00872];
        const DEFAULT_CAMPUS_GEOFENCE_POLYGON = [
            [11.26805, 124.00780],
            [11.26820, 124.00902],
            [11.26760, 124.00900],
            [11.26755, 124.00965],
            [11.26522, 124.00930],
            [11.26538, 124.00755]
        ];
        const CAMPUS_GEOFENCE_POLYGON = DEFAULT_CAMPUS_GEOFENCE_POLYGON;

        let activeGuardianGeofencePolygon = null;

        function getCampusGeofencePolygon() {
            try {
                const stored = localStorage.getItem('securo_custom_geofence');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length >= 3) {
                        activeGuardianGeofencePolygon = parsed;
                        return parsed;
                    }
                }
            } catch (e) {}
            if (activeGuardianGeofencePolygon && Array.isArray(activeGuardianGeofencePolygon) && activeGuardianGeofencePolygon.length >= 3) {
                return activeGuardianGeofencePolygon;
            }
            return DEFAULT_CAMPUS_GEOFENCE_POLYGON;
        }

        // (2026-07-13) Set exact 9 campus facilities matching adminGeofenceModalMap; was 7 facilities
        const DEFAULT_CAMPUS_BUILDINGS = [
            { name: "Guard House", coords: [11.26785, 124.00865], icon: "security", desc: "24/7 campus security dispatch and visitor verification." },
            { name: "Medical Clinic", coords: [11.26780, 124.00895], icon: "medical_services", desc: "First-aid, medical triage, and emergency response clinic." },
            { name: "Admin Building", coords: [11.26735, 124.00835], icon: "account_balance", desc: "Administrative offices and student services." },
            { name: "Main Gate", coords: [11.26735, 124.00865], icon: "door_front", desc: "Primary entry for students & staff" },
            { name: "HM Building", coords: [11.26715, 124.00870], icon: "restaurant", desc: "Hospitality Management laboratories and culinary suites." },
            { name: "Educ Building", coords: [11.26705, 124.00910], icon: "school", desc: "College of Education lecture rooms and dean's office." },
            { name: "Engineering Complex", coords: [11.26680, 124.00925], icon: "precision_manufacturing", desc: "Engineering & Industrial Technology workshops." },
            { name: "University Gym", coords: [11.26740, 124.00935], icon: "fitness_center", desc: "Campus sports arena and assembly gymnasium." },
            { name: "Campus Library", coords: [11.26620, 124.00895], icon: "local_library", desc: "Learning commons, digital archives, and quiet study hall." }
        ];

        function getActiveCampusBuildings() {
            try {
                const stored = localStorage.getItem('securo_campus_buildings');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}
            return DEFAULT_CAMPUS_BUILDINGS.map(b => ({ ...b, coords: [...b.coords] }));
        }

        let CAMPUS_BUILDINGS = getActiveCampusBuildings();
        let guardianBuildingMarkersLayer = null;
        // (2026-07-13) Hoist guardianGeofencePolygonLayer declaration; was declared after subscriber
        let guardianGeofencePolygonLayer = null;

        // (2026-07-13) Clean icon-only markers with hover/tap details; was wide text cards
        function renderGuardianCampusMarkers() {
            if (!map) return;
            if (!guardianBuildingMarkersLayer) {
                guardianBuildingMarkersLayer = L.layerGroup().addTo(map);
            } else {
                guardianBuildingMarkersLayer.clearLayers();
            }

            CAMPUS_BUILDINGS.forEach(b => {
                const icon = L.divIcon({
                    className: 'campus-facility-icon-marker',
                    html: `<div style="background:white; border-radius:50%; width:30px; height:30px; box-shadow:0 3px 10px rgba(24,20,40,0.16); border:2px solid #f43f5e; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span class="material-symbols-outlined" style="font-size:16px; color:#f43f5e;">${b.icon || 'location_on'}</span></div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });
                // (2026-07-13) Single clean popup on marker click; was duplicate tooltip + popup
                const m = L.marker(b.coords, { icon }).addTo(guardianBuildingMarkersLayer);
                m.bindPopup(`<strong>${b.name}</strong><br><small>${b.desc || ''}</small>`);
            });
        }

        // (2026-07-13) Subscribe to real-time campus map configuration for guardian view; was static markers
        subscribeToCampusMapConfig((config) => {
            if (config?.geofence && Array.isArray(config.geofence) && config.geofence.length >= 3) {
                activeGuardianGeofencePolygon = config.geofence;
                if (guardianGeofencePolygonLayer && map) {
                    guardianGeofencePolygonLayer.setLatLngs(config.geofence);
                }
            }
            if (config?.buildings && Array.isArray(config.buildings)) {
                CAMPUS_BUILDINGS = config.buildings;
                renderGuardianCampusMarkers();
            }
        });

        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'securo_custom_geofence') {
                activeGuardianGeofencePolygon = null;
                const updated = getCampusGeofencePolygon();
                if (guardianGeofencePolygonLayer && map) {
                    guardianGeofencePolygonLayer.setLatLngs(updated);
                }
            }
            if (!e.key || e.key === 'securo_campus_buildings') {
                CAMPUS_BUILDINGS = getActiveCampusBuildings();
                renderGuardianCampusMarkers();
            }
        });

        function isPointInPolygon(point, vs) {
            const x = point[0], y = point[1];
            let inside = false;
            for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
                const xi = vs[i][0], yi = vs[i][1];
                const xj = vs[j][0], yj = vs[j][1];
                const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        }

        // --- Map Initialization ---
        function initMap() {
            if (map) return;
            map = L.map('map', {
                zoomControl: false,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                wheelPxPerZoomLevel: 140
            }).setView(CAMPUS_CENTER, 17);
            // (2026-07-13) Use OSM tiles; was broken CartoDB tiles requiring API key
            const baseMapLayers = {
                "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
                "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
                "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
                "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 })
            };
            baseMapLayers["Streets"].addTo(map);

            // Campus Geofence Visual Polygon
            guardianGeofencePolygonLayer = L.polygon(getCampusGeofencePolygon(), {
                color: '#e11d48',
                weight: 3,
                dashArray: '5, 6',
                fillColor: '#f43f5e',
                fillOpacity: 0.1
            }).addTo(map);

            renderGuardianCampusMarkers();

            // (2026-07-13) Wire map control buttons matching student view; was L.control only
            let areGuardianMarkersVisible = true;
            document.getElementById('map-toggle-markers')?.addEventListener('click', () => {
                areGuardianMarkersVisible = !areGuardianMarkersVisible;
                const btn = document.getElementById('map-toggle-markers');
                if (guardianBuildingMarkersLayer) {
                    if (areGuardianMarkersVisible) {
                        if (!map.hasLayer(guardianBuildingMarkersLayer)) map.addLayer(guardianBuildingMarkersLayer);
                        if (btn) {
                            btn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
                            btn.title = 'Hide Campus Markers';
                            btn.style.opacity = '1';
                        }
                    } else {
                        if (map.hasLayer(guardianBuildingMarkersLayer)) map.removeLayer(guardianBuildingMarkersLayer);
                        if (btn) {
                            btn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
                            btn.title = 'Show Campus Markers';
                            btn.style.opacity = '0.6';
                        }
                    }
                }
            });

            const mapLayersBtn = document.getElementById('map-layers-btn');
            if (mapLayersBtn) {
                const layerKeys = Object.keys(baseMapLayers);
                let currentLayerIdx = 0;
                mapLayersBtn.onclick = () => {
                    const prevKey = layerKeys[currentLayerIdx];
                    const prevLayer = baseMapLayers[prevKey];
                    currentLayerIdx = (currentLayerIdx + 1) % layerKeys.length;
                    const nextKey = layerKeys[currentLayerIdx];
                    const nextLayer = baseMapLayers[nextKey];

                    if (map.hasLayer(prevLayer)) map.removeLayer(prevLayer);
                    nextLayer.addTo(map);
                    map.invalidateSize(false);
                    if (typeof showToast === 'function') {
                        showToast(`${nextKey}`);
                    }
                };
            }

            document.getElementById('map-locate')?.addEventListener('click', () => {
                document.getElementById('locateBtn')?.click();
            });

            document.getElementById('map-recenter-campus')?.addEventListener('click', () => {
                if (map) map.flyTo(CAMPUS_CENTER, 17, { duration: 1.2 });
            });

            document.getElementById('map-zoom-in')?.addEventListener('click', () => map?.zoomIn(0.5));
            document.getElementById('map-zoom-out')?.addEventListener('click', () => map?.zoomOut(0.5));
        }

        function clearStudentMarker() {
            if (studentMarker && map) {
                map.removeLayer(studentMarker);
                studentMarker = null;
            }
        }

        function getLocationUnavailableReason(loc) {
            if (!loc) {
                return "We have not received your child's live location yet. Ask them to turn on location services.";
            }

            if (loc.sharingEnabled === false) {
                return loc.sharingMessage || "Your child has location sharing turned off. They need to enable it before you can see live tracking.";
            }

            if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
                return "Your child's device has not shared a live location yet. Ask them to turn on location services.";
            }

            const updatedAt = loc.updatedAt?.toDate?.();
            if (updatedAt && (Date.now() - updatedAt.getTime()) > 5 * 60 * 1000) {
                return "Your child's live location has not updated recently. Ask them to turn on location services again.";
            }

            return "";
        }

        // (2026-07-13) Include account notifications in badge count; was static cards
        function updateGuardianNotifBadge() {
            const badge = document.getElementById('guardianNotifBadge');
            const sosCard = document.getElementById('sosEmergencyCard');
            const locCard = document.getElementById('locationAlertCard');
            const pendingNotifCard = document.getElementById('pendingNotifCard');
            const empty = document.getElementById('guardianDropdownEmptyState');
            const hasSos = sosCard && getComputedStyle(sosCard).display !== 'none';
            const hasLoc = locCard && locCard.classList.contains('active');
            const hasPending = pendingNotifCard && getComputedStyle(pendingNotifCard).display !== 'none';
            const unreadItems = (window._guardianAccountNotifications || []).filter(n => !n.isRead);
            const hasAlerts = hasSos || hasLoc || hasPending || unreadItems.length > 0;
            if (badge) {
                badge.style.display = hasAlerts ? 'block' : 'none';
                badge.style.background = (hasSos || unreadItems.length > 0) ? '#e11d48' : hasPending ? '#e11d48' : '#f59e0b';
            }
            if (empty) {
                empty.style.display = hasAlerts ? 'none' : 'block';
            }
        }

        function renderLocationAlert(reason = "") {
            const card = document.getElementById('locationAlertCard');
            const text = document.getElementById('locationAlertText');
            const locateBtn = document.getElementById('locateBtn');
            if (!card || !text) return;

            if (reason) {
                card.classList.add('active');
                text.textContent = reason;
                if (locateBtn) locateBtn.disabled = true;
                updateGuardianNotifBadge();
                return;
            }

            card.classList.remove('active');
            if (locateBtn) locateBtn.disabled = false;
            updateGuardianNotifBadge();
        }

        function formatNotificationTime(value) {
            const date = value?.toDate?.() || (value ? new Date(value) : null);
            return date ? date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        // (2026-07-13) Return emergency icon for SOS; was fallback info
        function getGuardianNotificationIcon(type) {
            if (type === 'sos') return 'emergency';
            if (type === 'campus_entry') return 'login';
            if (type === 'campus_exit') return 'logout';
            if (type === 'location_request_sent') return 'notifications_active';
            if (type === 'student_guardian_request') return 'family_restroom';
            if (type === 'guardian_request_accepted') return 'check_circle';
            if (type === 'guardian_request_declined') return 'cancel';
            return 'info';
        }

        const _notifiedAccountEventIds = new Set();
        // (2026-07-13) 5s audible alarm and haptics for parent; was 2.4s siren
        async function triggerDevicePushNotification(title, body, options = {}) {
            if (options.urgent || options.type === 'sos') {
                try {
                    if (window.Capacitor?.Plugins?.Haptics) {
                        window.Capacitor.Plugins.Haptics.vibrate({ duration: 5000 }).catch(() => {});
                    } else if (navigator.vibrate) {
                        navigator.vibrate([800, 250, 800, 250, 800, 250, 800, 250, 800]);
                    }
                } catch (e) {}
                try {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) {
                        const audioCtx = new AudioCtx();
                        if (audioCtx.state === 'suspended') audioCtx.resume();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = "sawtooth";
                        const now = audioCtx.currentTime;
                        for (let t = 0; t < 5.0; t += 0.5) {
                            const freq = (Math.floor(t / 0.5) % 2 === 0) ? 960 : 1380;
                            osc.frequency.setValueAtTime(freq, now + t);
                        }
                        gain.gain.setValueAtTime(0.85, now);
                        gain.gain.setValueAtTime(0.85, now + 4.8);
                        gain.gain.exponentialRampToValueAtTime(0.01, now + 5.0);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(now);
                        osc.stop(now + 5.0);
                    }
                } catch (e) {}
            }
            try {
                if (window.Capacitor?.Plugins?.LocalNotifications) {
                    const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
                    await LocalNotifications.requestPermissions().catch(() => { });
                    await LocalNotifications.schedule({
                        notifications: [
                            {
                                title,
                                body,
                                id: Math.floor(Date.now() % 100000) + Math.floor(Math.random() * 1000),
                                schedule: { at: new Date(Date.now() + 100) },
                                smallIcon: "ic_stat_securo",
                                largeIcon: "../assets/images/logo.png",
                                iconColor: options.urgent ? "#e11d48" : "#5b21b6",
                                sound: options.urgent ? "alarm.mp3" : null,
                                actionTypeId: "",
                                extra: options
                            }
                        ]
                    });
                    return;
                }
            } catch (e) {
                console.warn("Capacitor notification error:", e);
            }

            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    try {
                        new Notification(title, { body, icon: "../assets/images/logo.png", badge: "../assets/images/logo.png" });
                    } catch (e) { }
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            try {
                                new Notification(title, { body, icon: "../assets/images/logo.png", badge: "../assets/images/logo.png" });
                            } catch (e) {}
                        }
                    });
                }
            }
        }
        const triggerBrowserNotification = triggerDevicePushNotification;

        // (2026-07-13) Save & render pending invites in dropdown; was disappearing
        function renderGuardianAllDropdownNotifications() {
            const listEl = document.getElementById('guardianAccountNotifList');
            if (!listEl) return;
            const pendingList = window._guardianPendingLinks || [];
            const notifications = window._guardianAccountNotifications || [];

            let pendingHtml = '';
            pendingList.forEach(link => {
                const childName = link.studentName || (link.studentId ? `Student (${link.studentId})` : 'Child');
                if (link.requestedBy === 'student') {
                    pendingHtml += `
                        <div class="location-alert-card active" style="margin:0; background:#fff1f2; border:1px solid #fda4af;">
                            <div class="location-alert-icon" style="background:#fee2e2; color:#e11d48;">
                                <span class="material-symbols-outlined">family_restroom</span>
                            </div>
                            <div style="flex:1; min-width:0;">
                                <strong style="font-size:0.84rem; color:var(--ink); font-weight:800; display:block;">Child Link Request</strong>
                                <div style="font-size:0.75rem; color:var(--muted); line-height:1.35; margin-top:1px;">${escapeHtml(childName)} invited you as parent/guardian.</div>
                                <div style="display:flex; gap:6px; margin-top:8px;">
                                    <button type="button" class="btn btn-primary guardian-dropdown-accept-btn" data-link-id="${link.id}" data-student-uid="${link.studentUid || ''}" data-student-name="${escapeHtml(childName)}" style="flex:1; padding:6px 10px; font-size:0.75rem; border-radius:8px; font-weight:700; cursor:pointer;">Accept</button>
                                    <button type="button" class="btn guardian-dropdown-decline-btn" data-link-id="${link.id}" data-student-uid="${link.studentUid || ''}" data-student-name="${escapeHtml(childName)}" style="flex:1; padding:6px 10px; font-size:0.75rem; border-radius:8px; border:1px solid #e2e8f0; font-weight:600; cursor:pointer;">Decline</button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    pendingHtml += `
                        <div class="location-alert-card active" style="margin:0; background:#fff5f7; border:1px solid rgba(244,63,94,0.18);">
                            <div class="location-alert-icon" style="background:#fee2e2; color:#e11d48;">
                                <span class="material-symbols-outlined">hourglass_top</span>
                            </div>
                            <div style="flex:1; min-width:0;">
                                <strong style="font-size:0.84rem; color:var(--ink); font-weight:800; display:block;">Parent Request Pending</strong>
                                <div style="font-size:0.75rem; color:var(--muted); line-height:1.35; margin-top:1px;">Waiting for ${escapeHtml(childName)}${link.studentId ? ` (ID: ${link.studentId})` : ''} to accept.</div>
                                <div style="display:flex; gap:6px; margin-top:8px;">
                                    <button type="button" class="btn guardian-dropdown-cancel-btn" data-link-id="${link.id}" data-student-id="${link.studentId || ''}" data-student-uid="${link.studentUid || ''}" style="width:100%; padding:6px 10px; font-size:0.75rem; border-radius:8px; border:1px solid #e2e8f0; font-weight:600; cursor:pointer;">Cancel Request</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            const notifsHtml = notifications.slice(0, 25).map(item => `
                <div class="location-alert-card active" style="margin:0; background:${item.isRead ? '#f8fafc' : '#fff1f2'}; border:1px solid ${item.isRead ? '#e2e8f0' : '#fda4af'};">
                    <div class="location-alert-icon" style="background:${item.isRead ? '#f1f5f9' : '#fee2e2'}; color:${item.isRead ? '#64748b' : '#e11d48'};">
                        <span class="material-symbols-outlined">${getGuardianNotificationIcon(item.type)}</span>
                    </div>
                    <div style="flex:1; min-width:0;">
                        <strong style="font-size:0.84rem; color:var(--ink); font-weight:800; display:block;">${escapeHtml(item.title || "Notification")}</strong>
                        <div style="font-size:0.75rem; color:var(--muted); line-height:1.35; margin-top:1px;">${escapeHtml(item.message || "")}</div>
                        <div style="font-size:0.7rem; color:#94a3b8; margin-top:4px;">${escapeHtml(formatNotificationTime(item.createdAt))}</div>
                    </div>
                </div>
            `).join('');

            listEl.innerHTML = pendingHtml + notifsHtml;

            // (2026-07-13) Disable and spin link buttons on response; was no loading state
            listEl.querySelectorAll('.guardian-dropdown-accept-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const linkId = btn.dataset.linkId;
                    const studentUid = btn.dataset.studentUid;
                    const studentName = btn.dataset.studentName;
                    const decBtn = btn.parentElement ? btn.parentElement.querySelector('.guardian-dropdown-decline-btn') : null;
                    setButtonBusy(btn, true);
                    if (decBtn) decBtn.disabled = true;
                    try {
                        await respondToGuardianLink(linkId, 'accepted', studentUid, { name: studentName });
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== linkId);
                        localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks));
                        renderGuardianAllDropdownNotifications();
                        showToast("Connected to " + studentName);
                        if (auth.currentUser) initDashboard(auth.currentUser);
                    } catch (err) {
                        setButtonBusy(btn, false);
                        if (decBtn) decBtn.disabled = false;
                        showToast(err.message || "Failed to accept", "error");
                    }
                };
            });
            listEl.querySelectorAll('.guardian-dropdown-decline-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const linkId = btn.dataset.linkId;
                    const studentUid = btn.dataset.studentUid;
                    const studentName = btn.dataset.studentName;
                    const accBtn = btn.parentElement ? btn.parentElement.querySelector('.guardian-dropdown-accept-btn') : null;
                    setButtonBusy(btn, true);
                    if (accBtn) accBtn.disabled = true;
                    try {
                        // (2026-07-13) Pass student profile on decline to notify; was ID-only reject
                        await respondToGuardianLink(linkId, 'rejected', studentUid, { name: studentName });
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== linkId);
                        localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks));
                        renderGuardianAllDropdownNotifications();
                        showToast("Request declined");
                        if (auth.currentUser) initDashboard(auth.currentUser);
                    } catch (err) {
                        setButtonBusy(btn, false);
                        if (accBtn) accBtn.disabled = false;
                        showToast(err.message || "Failed to decline", "error");
                    }
                };
            });
            listEl.querySelectorAll('.guardian-dropdown-cancel-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const linkId = btn.dataset.linkId;
                    const studentId = btn.dataset.studentId;
                    const studentUid = btn.dataset.studentUid;
                    setButtonBusy(btn, true);
                    try {
                        // (2026-07-13) Pass student profile to remove link & clear cache; was id only
                        await removeGuardianLink(linkId, {
                            guardianId: auth.currentUser?.uid,
                            guardianEmail: auth.currentUser?.email,
                            studentId: studentId,
                            studentUid: studentUid
                        });
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== linkId && (!studentId || String(l.studentId) !== String(studentId)) && (!studentUid || l.studentUid !== studentUid));
                        try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                        renderGuardianAllDropdownNotifications();
                        showToast("Request cancelled");
                        if (auth.currentUser) initDashboard(auth.currentUser);
                    } catch (err) {
                        setButtonBusy(btn, false);
                        showToast(err.message || "Failed to cancel", "error");
                    }
                };
            });
            updateGuardianNotifBadge();
        }

        const renderGuardianDropdownNotifications = renderGuardianAllDropdownNotifications;
        // (2026-07-13) Restore guardian pending links offline; was memory-only
        try {
            const cachedPending = JSON.parse(localStorage.getItem('securo_guardian_pending_links') || '[]');
            if (Array.isArray(cachedPending) && cachedPending.length > 0) {
                window._guardianPendingLinks = cachedPending;
                renderGuardianAllDropdownNotifications();
            }
        } catch (_) {}

        function showGuardianRealtimePrompt(title, message) {
            const existing = document.getElementById('guardianRealtimePrompt');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.id = 'guardianRealtimePrompt';
            toast.style.cssText = 'position:fixed; top:20px; left:20px; right:20px; background:white; padding:16px; border-radius:18px; box-shadow:0 12px 36px rgba(0,0,0,0.18); border:1px solid #f43f5e; z-index:9999; display:flex; align-items:center; gap:12px; cursor:pointer;';
            toast.innerHTML = `
                <div style="width:40px; height:40px; border-radius:12px; background:#fff1f2; color:#f43f5e; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <span class="material-symbols-outlined">notifications_active</span>
                </div>
                <div style="flex:1; min-width:0;">
                    <strong style="font-size:0.88rem; color:#0f172a; display:block;">${escapeHtml(title)}</strong>
                    <span style="font-size:0.78rem; color:#64748b; line-height:1.3; display:block; margin-top:2px;">${escapeHtml(message)}</span>
                </div>
            `;
            toast.onclick = () => {
                const drop = document.getElementById('guardianNotifDropdown');
                if (drop) drop.style.display = 'block';
                toast.remove();
            };
            document.body.appendChild(toast);
            setTimeout(() => { if (toast && toast.parentNode) toast.remove(); }, 8000);
        }

        function renderGuardianNotificationHistory(notifications = []) {
            window._guardianAccountNotifications = notifications;
            const container = document.getElementById('notificationHistory');
            const empty = document.getElementById('notificationHistoryEmpty');

            if (container && empty) {
                if (!notifications.length) {
                    container.innerHTML = '';
                    empty.style.display = 'block';
                } else {
                    empty.style.display = 'none';
                    container.innerHTML = notifications.map((item) => `
                        <div class="notification-item ${item.isRead ? '' : 'unread'}">
                            <div class="notification-item-icon">
                                <span class="material-symbols-outlined">${getGuardianNotificationIcon(item.type)}</span>
                            </div>
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; gap:12px;">
                                    <div style="font-weight:800;">${escapeHtml(item.title)}</div>
                                    <div style="font-size:0.75rem; color:var(--muted); font-weight:700;">${escapeHtml(formatNotificationTime(item.createdAt))}</div>
                                </div>
                                <div style="font-size:0.84rem; color:var(--muted); line-height:1.5; margin-top:4px;">${escapeHtml(item.message)}</div>
                            </div>
                        </div>
                    `).join('');
                }
            }

            renderGuardianDropdownNotifications(notifications);

            notifications.forEach((item) => {
                if (!item.isRead && !_notifiedAccountEventIds.has(item.id)) {
                    _notifiedAccountEventIds.add(item.id);
                    triggerBrowserNotification(item.title || "Campus Update", item.message || "");
                    showGuardianRealtimePrompt(item.title || "New Notification", item.message || "");
                    // (2026-07-13) Refresh dashboard on declined notification; was accepted only
                    if (item.type === "student_guardian_request" || item.type === "guardian_request_accepted" || item.type === "guardian_request_declined") {
                        if (auth.currentUser) initDashboard(auth.currentUser);
                    }
                }
            });

            updateGuardianNotifBadge();
        }

        // (2026-07-13) Show requested child info in pending state; was anonymous
        async function setPendingGuardianState(link = null) {
            pendingGuardianLink = link;
            const pendingCard = document.getElementById('pendingStateCard');
            const pendingCopy = document.getElementById('pendingStateCopy');
            const pendingMeta = document.getElementById('pendingStudentMeta');
            const locateBtn = document.getElementById('locateBtn');
            const requestLocationBtn = document.getElementById('requestLocationBtn');
            const studentAvatar = document.getElementById('studentAvatar');
            const activeStudentName = document.getElementById('activeStudentName');
            const lastSeen = document.getElementById('lastSeen');
            const statusDot = document.getElementById('statusDot');
            const cancelPendingRequestBtn = document.getElementById('cancelPendingRequestBtn');
            const editPendingRequestBtn = document.getElementById('editPendingRequestBtn');
            const pendingNotifCard = document.getElementById('pendingNotifCard');
            const pendingNotifText = document.getElementById('pendingNotifText');

            if (!link) {
                pendingCard?.classList.remove('active');
                if (pendingNotifCard) pendingNotifCard.style.display = 'none';
                updateGuardianNotifBadge();
                const studentStatusCard = document.querySelector('.student-status-card');
                if (studentStatusCard && !activeLink) studentStatusCard.style.display = 'none';
                if (locateBtn) locateBtn.style.display = 'flex';
                if (cancelPendingRequestBtn) cancelPendingRequestBtn.style.display = 'none';
                if (editPendingRequestBtn) editPendingRequestBtn.style.display = 'none';
                return;
            }

            // (2026-07-13) Hide child card when unlinked or pending; was display flex
            const studentStatusCard = document.querySelector('.student-status-card');
            if (studentStatusCard && !activeLink) studentStatusCard.style.display = 'none';

            let childDisplayName = link.studentName || '';
            if (typeof resolveChildDisplayName === 'function') {
                try {
                    const resolved = await resolveChildDisplayName(link);
                    if (resolved && !isGenericChildName(resolved)) {
                        childDisplayName = resolved;
                    }
                } catch (e) {}
            }
            if (!childDisplayName) {
                childDisplayName = link.studentId ? `Student (${link.studentId})` : 'Child';
            }

            let initials = '⏳';
            if (childDisplayName && !childDisplayName.startsWith('Student') && childDisplayName !== 'Child') {
                const parts = childDisplayName.trim().split(/\s+/);
                initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
            }

            if (pendingCard && !pendingCard.dataset.dismissed) {
                pendingCard.classList.add('active');
            }
            // (2026-07-13) Hide duplicate pending card in dropdown; was duplicate display
            if (pendingNotifCard) {
                pendingNotifCard.style.display = 'none';
            }
            updateGuardianNotifBadge();

            if (locateBtn) locateBtn.style.display = 'none';
            if (requestLocationBtn) requestLocationBtn.style.display = 'none';
            if (activeStudentName) {
                activeStudentName.textContent = `${childDisplayName} (Pending)`;
            }
            if (lastSeen) {
                lastSeen.textContent = `Waiting for ${childDisplayName} to approve`;
            }
            if (statusDot) statusDot.style.background = '#f59e0b';
            if (studentAvatar) studentAvatar.textContent = 'â³';
            // (2026-07-13) Set pending card title & chip dynamically; was static title
            const pendingTitle = document.getElementById('pendingStateTitle');
            const pendingNotifMetaChip = document.getElementById('pendingNotifMetaChip');
            if (link.requestedBy === 'student') {
                if (pendingTitle) pendingTitle.textContent = 'Child Link Request';
                if (pendingNotifMetaChip) pendingNotifMetaChip.style.display = 'none';
                if (pendingCopy) {
                    pendingCopy.textContent = `${childDisplayName} has invited you as their parent or guardian. Please accept or decline below.`;
                }
                if (pendingMeta) {
                    pendingMeta.innerHTML = `
                        <div style="display:flex; gap:8px; margin-top:8px; width:100%;">
                            <button id="cardAcceptBtn_${link.id}" class="btn btn-primary" style="flex:1; padding:8px 12px; border-radius:10px; font-weight:700; cursor:pointer;">Accept Link</button>
                            <button id="cardDeclineBtn_${link.id}" class="btn" style="flex:1; padding:8px 12px; border-radius:10px; border:1px solid #e2e8f0; font-weight:600; cursor:pointer;">Decline</button>
                        </div>
                    `;
                    // (2026-07-13) Spin & disable card buttons on click; was no loading feedback
                    setTimeout(() => {
                        const acc = document.getElementById(`cardAcceptBtn_${link.id}`);
                        const dec = document.getElementById(`cardDeclineBtn_${link.id}`);
                        if (acc) {
                            acc.onclick = async () => {
                                setButtonBusy(acc, true);
                                if (dec) dec.disabled = true;
                                try {
                                    await respondToGuardianLink(link.id, 'accepted', link.studentUid, { name: childDisplayName });
                                    window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== link.id);
                                    try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                                    renderGuardianAllDropdownNotifications();
                                    showToast("Child connected successfully");
                                    initDashboard(auth.currentUser);
                                } catch (e) {
                                    setButtonBusy(acc, false);
                                    if (dec) dec.disabled = false;
                                    showToast(e.message || "Failed to accept child", "error");
                                }
                            };
                        }
                        if (dec) {
                            dec.onclick = async () => {
                                setButtonBusy(dec, true);
                                if (acc) acc.disabled = true;
                                try {
                                    // (2026-07-13) Pass student profile on reject to notify student; was ID only
                                    await respondToGuardianLink(link.id, 'rejected', link.studentUid, { name: childDisplayName });
                                    window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== link.id);
                                    try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                                    renderGuardianAllDropdownNotifications();
                                    showToast("Invitation declined");
                                    initDashboard(auth.currentUser);
                                } catch (e) {
                                    setButtonBusy(dec, false);
                                    if (acc) acc.disabled = false;
                                    showToast(e.message || "Failed to decline", "error");
                                }
                            };
                        }
                    }, 50);
                }
                if (cancelPendingRequestBtn) cancelPendingRequestBtn.style.display = 'none';
                if (editPendingRequestBtn) editPendingRequestBtn.style.display = 'none';
            } else {
                if (pendingTitle) pendingTitle.textContent = 'Parent request pending approval';
                if (pendingNotifMetaChip) pendingNotifMetaChip.style.display = 'flex';
                if (pendingCopy) {
                    pendingCopy.textContent = `${link.studentId ? `Your invitation for Student ID ${link.studentId} is waiting for your child to accept.` : 'Your invitation is waiting for your child to accept.'} Once approved, this dashboard will unlock live tracking and updates automatically.`;
                }
                if (pendingMeta) {
                    pendingMeta.innerHTML = `
                        <span class="material-symbols-outlined" style="font-size:18px;">badge</span>
                        <span>${link.studentId ? `Requested student ID: ${link.studentId}` : 'Requested student ID pending'}</span>
                    `;
                }
                if (cancelPendingRequestBtn) cancelPendingRequestBtn.style.display = 'inline-flex';
                if (editPendingRequestBtn) editPendingRequestBtn.style.display = 'inline-flex';
            }

            renderLocationAlert("");
            clearStudentMarker();
            latestStudentLocation = null;
        }

        // --- Data Loading ---
        let linkedChildrenData = [];
        let activeChildStatusIndex = 0;
        let childStatusRotationTimer = null;

        function formatChildCampusEventTime(ts) {
            if (!ts) ts = Date.now();
            const d = new Date(ts);
            const now = new Date();

            let hours = d.getHours();
            const minutes = d.getMinutes();
            const ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minStr = minutes > 0 ? `:${minutes < 10 ? '0' : ''}${minutes}` : '';
            const timeStr = `${hours}${minStr}${ampm}`;

            const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const diffDays = Math.round((nowDate - dDate) / (1000 * 60 * 60 * 24));

            let dayStr = 'today';
            if (diffDays === 1) {
                dayStr = 'yesterday';
            } else if (diffDays > 1) {
                dayStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            }
            return `${timeStr} ${dayStr}`;
        }

        function updateGuardianTrackingChip() {
            const banner = document.getElementById('guardianTrackingStatusBanner');
            const icon = document.getElementById('guardianTrackingStatusIcon');
            const copy = document.getElementById('guardianTrackingStatusCopy');
            if (!banner || !icon || !copy) return;

            if (!linkedChildrenData || linkedChildrenData.length === 0) {
                banner.style.display = 'none';
                return;
            }

            banner.style.display = 'inline-flex';
            const currentChild = linkedChildrenData[activeChildStatusIndex % linkedChildrenData.length];
            if (!currentChild) return;

            const isInside = currentChild.isInside !== false;
            banner.classList.toggle('is-inside', isInside);
            banner.classList.toggle('is-outside', !isInside);
            icon.textContent = isInside ? 'login' : 'logout';

            const timeFormatted = formatChildCampusEventTime(currentChild.timestamp);
            const text = isInside
                ? `${currentChild.name} went inside the campus at ${timeFormatted}`
                : `${currentChild.name} went out the campus at ${timeFormatted}`;
            copy.textContent = text;
            banner.title = `${text}. Campus geofence status.`;
        }

        function setupChildStatusRotation() {
            if (childStatusRotationTimer) {
                clearInterval(childStatusRotationTimer);
                childStatusRotationTimer = null;
            }
            if (linkedChildrenData.length > 1) {
                childStatusRotationTimer = setInterval(() => {
                    activeChildStatusIndex = (activeChildStatusIndex + 1) % linkedChildrenData.length;
                    updateGuardianTrackingChip();
                }, 10 * 60 * 1000);
            }
        }

        let guardianProfileUnsub = null;

        function updateGuardianProfileUI(rawName) {
            const fallback = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Guardian';
            const name = (rawName || guardianProfile?.name || fallback).trim();
            const initials = name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0])
                .join('')
                .toUpperCase() || 'P';
            const initEl = document.getElementById('userInitials');
            const dropEl = document.getElementById('dropdownName');
            if (initEl) initEl.textContent = initials;
            if (dropEl) dropEl.textContent = name;
        }

        // (2026-07-13) Resolve guardian name & initials live; was uid only
        async function initDashboard(user) {
            console.log("Initializing dashboard for:", user.email);
            // (2026-07-13) Request push notification permissions on init; was deferred
            if (window.Capacitor?.Plugins?.LocalNotifications) {
                window.Capacitor.Plugins.LocalNotifications.requestPermissions().catch(() => {});
            } else if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission().catch(() => {});
            }
            try {
                guardianProfile = await getUserProfile(user.uid);
                const currentAuthEmail = (user.email || '').toLowerCase().trim();
                const profileEmailNorm = (guardianProfile?.email || '').toLowerCase().trim();

                // (2026-07-13) Fix mismatched guardian profile on login; was stale email
                if (currentAuthEmail && profileEmailNorm && currentAuthEmail !== profileEmailNorm) {
                    const matchedUser = await findUserByEmail(currentAuthEmail);
                    const fixedName = matchedUser?.name || user.displayName || currentAuthEmail.split('@')[0];
                    guardianProfile = {
                        ...(guardianProfile || {}),
                        ...(matchedUser || {}),
                        email: currentAuthEmail,
                        name: fixedName,
                        role: 'guardian'
                    };
                    await saveUserProfile(user.uid, {
                        email: currentAuthEmail,
                        name: fixedName,
                        role: 'guardian'
                    }).catch(() => {});
                }

                const emailPrefix = (user.email || '').split('@')[0].toLowerCase();
                if (!guardianProfile?.name || guardianProfile.name.toLowerCase() === emailPrefix) {
                    const byEmail = await findUserByEmail(user.email);
                    if (byEmail?.name) {
                        guardianProfile = { ...(guardianProfile || {}), ...byEmail };
                    }
                }
                if (guardianProfile) guardianProfile.uid = user.uid;
                // (2026-07-13) Ensure guardian role in Firestore for rules; was unchecked
                if (!guardianProfile || guardianProfile.role !== 'guardian') {
                    guardianProfile = { ...(guardianProfile || {}), uid: user.uid, role: 'guardian', email: user.email || guardianProfile?.email || '' };
                    await saveUserProfile(user.uid, {
                        name: guardianProfile.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Guardian'),
                        email: user.email || guardianProfile.email || '',
                        role: 'guardian'
                    }).catch(() => {});
                }
                console.log("Guardian Profile:", guardianProfile);
                updateGuardianProfileUI(guardianProfile?.name);

                if (!guardianProfileUnsub) {
                    const normEmail = (user.email || '').toLowerCase().trim();
                    const handleProfileSnap = (data) => {
                        if (data?.name) {
                            if (!guardianProfile) guardianProfile = { uid: user.uid };
                            guardianProfile.name = data.name;
                            updateGuardianProfileUI(data.name);
                        }
                    };
                    try {
                        guardianProfileUnsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
                            if (snap.exists()) handleProfileSnap(snap.data());
                        }, () => {});
                    } catch (e) {}
                    if (normEmail) {
                        try {
                            const eq = query(collection(db, "users"), where("email", "==", normEmail));
                            onSnapshot(eq, (snap) => {
                                if (!snap.empty) handleProfileSnap(snap.docs[0].data());
                            }, () => {});
                        } catch (e) {}
                    }
                }

                if (notificationUnsub) notificationUnsub();
                // (2026-07-13) Subscribe guardian notifs by UID and email; was UID only
                notificationUnsub = subscribeToAccountNotifications(user.uid, renderGuardianNotificationHistory, user.email);

                if (guardianLinksLiveUnsub) guardianLinksLiveUnsub();
                let _isInitialGuardianLinkSnapshot = true;
                // (2026-07-13) Deduplicate live accepted links by child; was UID-only key
                guardianLinksLiveUnsub = subscribeToGuardianLinks(user.uid, (allLiveLinks) => {
                    const seenUids = new Set();
                    const seenIds = new Set();
                    const seenNames = new Set();
                    const accepted = (allLiveLinks || []).filter(l => {
                        if (l.status !== 'accepted') return false;
                        const uid = (l.studentUid || '').trim();
                        const sid = (l.studentId ? String(l.studentId) : '').trim();
                        const name = (l.studentName || '').trim().toLowerCase();
                        if (uid && seenUids.has(uid)) return false;
                        if (sid && seenIds.has(sid)) return false;
                        if (name && !name.startsWith('student') && name !== 'child' && seenNames.has(name)) return false;
                        if (uid) seenUids.add(uid);
                        if (sid) seenIds.add(sid);
                        if (name && !name.startsWith('student') && name !== 'child') seenNames.add(name);
                        return true;
                    });
                    const pending = (allLiveLinks || []).filter(l => l.status === 'pending');
                    // (2026-07-13) Persist pending links in dropdown; was modal & disappearing
                    window._guardianPendingLinks = pending;
                    try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(pending)); } catch (_) {}
                    renderGuardianAllDropdownNotifications();

                    // (2026-07-13) Hide child status & silence stale toast; was stuck card
                    allLiveLinks.forEach(l => {
                        if (l.status === 'accepted') {
                            if (!_notifiedAccountEventIds.has(l.id)) {
                                _notifiedAccountEventIds.add(l.id);
                                if (!_isInitialGuardianLinkSnapshot) {
                                    showGuardianRealtimePrompt("Child Connected", `${l.studentName || "Your child"} has linked to your guardian account.`);
                                }
                            }
                        } else if (l.status === 'rejected' || l.status === 'declined') {
                            const decKey = 'declined_' + l.id;
                            if (!_notifiedAccountEventIds.has(decKey)) {
                                _notifiedAccountEventIds.add(decKey);
                                showGuardianRealtimePrompt("Child Link Declined", `${l.studentName || "Your child"} declined your link request.`);
                                showToast("Link request declined by child.", "error");
                            }
                        }
                    });
                    _isInitialGuardianLinkSnapshot = false;
                    renderStudentSelector(accepted);
                    if (accepted.length > 0) {
                        if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                        setPendingGuardianState(null);
                        selectStudent(accepted[0]);
                    } else if (pending.length > 0) {
                        // (2026-07-13) Hide child card & reset link when pending; was retained
                        activeLink = null;
                        if (locationUnsub) { locationUnsub(); locationUnsub = null; }
                        if (attendanceUnsub) { attendanceUnsub(); attendanceUnsub = null; }
                        if (sosUnsub) { sosUnsub(); sosUnsub = null; }
                        clearStudentMarker();
                        const studentStatusCard = document.querySelector('.student-status-card');
                        if (studentStatusCard) studentStatusCard.style.display = 'none';
                        setPendingGuardianState(pending[0]);
                    } else {
                        // (2026-07-13) Clear active link & hide child card if empty; was visible
                        activeLink = null;
                        if (locationUnsub) { locationUnsub(); locationUnsub = null; }
                        if (attendanceUnsub) { attendanceUnsub(); attendanceUnsub = null; }
                        if (sosUnsub) { sosUnsub(); sosUnsub = null; }
                        clearStudentMarker();
                        setPendingGuardianState(null);
                        const studentStatusCard = document.querySelector('.student-status-card');
                        if (studentStatusCard) studentStatusCard.style.display = 'none';
                        const addBtn = document.getElementById('addStudentBtn');
                        if (addBtn) addBtn.style.display = 'flex';
                    }
                    updateGuardianNotifBadge();
                }, user.email);

                // (2026-07-13) Sync and load links by UID and email; was UID-only query
                await syncGuardianLinksForGuardian(user.uid, { email: user.email, name: user.name }).catch(() => {});
                const links = await getAcceptedLinksForGuardian(user.uid, user.email);
                console.log("Accepted Links:", links.length);
                renderStudentSelector(links);

                if (links.length > 0) {
                    if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                    const addBtn = document.getElementById('addStudentBtn');
                    if (addBtn) addBtn.style.display = links.length < 5 ? 'flex' : 'none';
                    setPendingGuardianState(null);
                    document.getElementById('requestLocationBtn').style.display = 'inline-flex';
                    selectStudent(links[0]);

                    linkedChildrenData = await Promise.all(links.map(async (link) => {
                        const name = await resolveChildDisplayName(link);
                        let isInside = true;
                        let ts = Date.now();
                        try {
                            const hist = await getAttendanceHistory(link.studentUid);
                            if (hist && hist.length > 0) {
                                const latest = hist[0];
                                isInside = latest.type === 'in';
                                if (latest.timestamp?.toDate) {
                                    ts = latest.timestamp.toDate().getTime();
                                } else if (latest.timestamp) {
                                    ts = new Date(latest.timestamp).getTime();
                                }
                            }
                        } catch (e) {}
                        return {
                            id: link.studentUid,
                            name: name,
                            isInside: isInside,
                            timestamp: ts
                        };
                    }));
                    updateGuardianTrackingChip();
                    setupChildStatusRotation();
                } else {
                    // (2026-07-13) Reset active child & hide child card when unlinked; was retained
                    activeLink = null;
                    if (locationUnsub) { locationUnsub(); locationUnsub = null; }
                    if (attendanceUnsub) { attendanceUnsub(); attendanceUnsub = null; }
                    if (sosUnsub) { sosUnsub(); sosUnsub = null; }
                    clearStudentMarker();
                    const studentStatusCard = document.querySelector('.student-status-card');
                    if (studentStatusCard) studentStatusCard.style.display = 'none';
                    if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                    const allLinks = await getAllLinksForGuardian(user.uid, user.email);
                    console.log("All Links (inc pending):", allLinks.length);

                    initMap();
                    const banner = document.getElementById('guardianTrackingStatusBanner');
                    if (banner) banner.style.display = 'none';

                    // (2026-07-13) Filter strictly pending links; was allLinks[0] fallback
                    const pendingLinks = (allLinks || []).filter((link) => link.status === 'pending');
                    if (pendingLinks.length > 0) {
                        document.getElementById('addStudentBtn').style.display = 'none';
                        showToast("Waiting for child approval...");
                        setPendingGuardianState(pendingLinks[0]);
                        document.getElementById('vaultEmpty').style.display = 'block';
                        document.getElementById('vaultEmpty').querySelector('h3').textContent = 'Vault unlocks after approval';
                        document.getElementById('vaultEmpty').querySelector('p').textContent = 'Your child needs to accept your invitation before shared vault media appears here.';
                        document.getElementById('alertsEmpty').style.display = 'block';
                        document.getElementById('alertsEmpty').querySelector('h3').textContent = 'Safety feed pending approval';
                        document.getElementById('alertsEmpty').querySelector('p').textContent = 'Emergency alerts and attendance updates will appear after your child approves your request.';
                    } else {
                        setPendingGuardianState(null);
                        if (studentStatusCard) studentStatusCard.style.display = 'none';
                        document.getElementById('addStudentBtn').style.display = 'flex';
                    }
                }
            } catch (err) {
                console.warn("Dashboard init failed:", err);
                showToast("Failed to load data. Please refresh.", "error");
                if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                document.getElementById('addStudentBtn').style.display = 'flex';
                const banner = document.getElementById('guardianTrackingStatusBanner');
                if (banner) banner.style.display = 'none';
            }
        }

        // Profile Handlers
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        profileBtn.onclick = (e) => {
            e.stopPropagation();
            const guardianNotifDropdown = document.getElementById('guardianNotifDropdown');
            if (guardianNotifDropdown) guardianNotifDropdown.style.display = 'none';
            profileDropdown.classList.toggle('active');
        };

        // (2026-07-13) Wire notification dropdown toggle & badge sync; was missing
        const guardianNotifBell = document.getElementById('guardianNotifBell');
        const guardianNotifDropdown = document.getElementById('guardianNotifDropdown');
        const closeGuardianNotifDropdown = document.getElementById('closeGuardianNotifDropdown');

        if (guardianNotifBell && guardianNotifDropdown) {
            guardianNotifBell.onclick = (e) => {
                e.stopPropagation();
                profileDropdown?.classList.remove('active');
                const isShown = getComputedStyle(guardianNotifDropdown).display === 'block';
                guardianNotifDropdown.style.display = isShown ? 'none' : 'block';
            };
            closeGuardianNotifDropdown?.addEventListener('click', (e) => {
                e.stopPropagation();
                guardianNotifDropdown.style.display = 'none';
            });
            guardianNotifDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('active');
            if (guardianNotifDropdown) guardianNotifDropdown.style.display = 'none';
        });

        document.getElementById('logoutBtn').onclick = async () => {
            if (typeof setGuardianWatchingPresence === 'function') await setGuardianWatchingPresence(false);
            await auth.signOut();
            window.switchParentMode('auth');
        };

        // (2026-07-13) Wire guardian account deletion with password; was missing
        const deleteAccountModal = document.getElementById('deleteAccountModal');
        const deleteGuardianAccountBtn = document.getElementById('deleteGuardianAccountBtn');
        const cancelDeleteAccountBtn = document.getElementById('cancelDeleteAccountBtn');
        const confirmDeleteAccountBtn = document.getElementById('confirmDeleteAccountBtn');
        const deleteAccountPassword = document.getElementById('deleteAccountPassword');

        // (2026-07-13) Add password eye toggle; was password input without toggle
        document.querySelectorAll('[data-password-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.passwordTarget);
                if (!target) return;
                const isPass = target.type === 'password';
                target.type = isPass ? 'text' : 'password';
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = isPass ? 'visibility_off' : 'visibility';
            });
        });

        deleteGuardianAccountBtn?.addEventListener('click', () => {
            profileDropdown?.classList.remove('active');
            if (deleteAccountPassword) deleteAccountPassword.value = '';
            deleteAccountModal?.classList.add('active');
        });

        cancelDeleteAccountBtn?.addEventListener('click', () => {
            deleteAccountModal?.classList.remove('active');
        });

        confirmDeleteAccountBtn?.addEventListener('click', async () => {
            const pwd = deleteAccountPassword?.value?.trim() || '';
            setButtonBusy(confirmDeleteAccountBtn, true);
            try {
                await deleteCurrentUserAccount(pwd);
                showToast("Account deleted successfully.");
                window.switchParentMode('auth');
            } catch (err) {
                console.warn("Guardian account deletion failed:", err);
                showToast(err.message || "Failed to delete account. Check password.", "error");
            } finally {
                setButtonBusy(confirmDeleteAccountBtn, false);
            }
        });

        // Modal Handlers
        const closeLinkModal = () => document.getElementById('linkModal').classList.remove('active');
        document.getElementById('addStudentBtn').onclick = () => {
            document.getElementById('linkModal').classList.add('active');
        };
        document.getElementById('closeLinkModalBtn').onclick = closeLinkModal;

        function setButtonBusy(button, isBusy = true) {
            if (!button) return;
            button.classList.toggle('is-busy', isBusy);
            button.disabled = isBusy;
        }

        function isGenericChildName(name) {
            const normalized = String(name || '').trim().toLowerCase();
            return !normalized || [
                'student',
                'linked child',
                'linked student',
                'securo user'
            ].includes(normalized);
        }

        // (2026-07-13) Prioritize live student profile by ID; was stale link
        async function resolveChildDisplayName(link) {
            let liveName = '';
            if (link?.studentUid) {
                try {
                    const profile = await getUserProfile(link.studentUid);
                    if (profile?.name && !isGenericChildName(profile.name)) {
                        liveName = profile.name;
                    }
                } catch (e) {}
            }
            if (!liveName && link?.studentId) {
                try {
                    const users = await getAllUsers();
                    const matched = users.find((user) => String(user.studentId || '').trim() === String(link.studentId).trim());
                    if (matched?.name && !isGenericChildName(matched.name)) {
                        liveName = matched.name;
                    }
                } catch (e) {}
            }
            if (!liveName && link?.studentId) {
                try {
                    const localUsers = (() => {
                        try { return JSON.parse(localStorage.getItem('securo_users_local') || '[]'); } catch (e) { return []; }
                    })();
                    const matched = localUsers.find((user) => String(user.studentId || '').trim() === String(link.studentId).trim());
                    if (matched?.name && !isGenericChildName(matched.name)) {
                        liveName = matched.name;
                    }
                } catch (e) {}
            }
            const finalName = liveName || (!isGenericChildName(link?.studentName) ? link.studentName : '') || link?.studentId || 'Linked Child';
            if (liveName && link?.id && link.studentName !== liveName) {
                try {
                    updateDoc(doc(db, "guardian_links", link.id), {
                        studentName: liveName,
                        lastSyncedAt: serverTimestamp()
                    }).catch(() => {});
                } catch (e) {}
            }
            return finalName;
        }

        document.getElementById('studentIdInput').addEventListener('input', (event) => {
            event.target.value = event.target.value.replace(/\D/g, '').slice(0, 7);
        });

        document.getElementById('sendRequestBtn').onclick = async () => {
            const sendRequestBtn = document.getElementById('sendRequestBtn');
            const sid = document.getElementById('studentIdInput').value.trim();
            if (sid.length !== 7) {
                showToast("Please enter a valid 7-digit ID", "error");
                return;
            }
            try {
                setButtonBusy(sendRequestBtn, true);
                // (2026-07-13) Dispatch link request with resolved student UID; was ID only
                if (pendingGuardianLink?.id && pendingGuardianLink.status === 'pending' && pendingGuardianLink.studentId !== sid) {
                    try { await removeGuardianLink(pendingGuardianLink.id); } catch (_) {}
                }
                // (2026-07-13) Explicitly set requestedBy to guardian; was unassigned
                const linkData = {
                    guardianId: auth.currentUser.uid,
                    studentId: sid,
                    requestedBy: 'guardian',
                    guardianName: guardianProfile?.name || auth.currentUser.displayName || auth.currentUser.email,
                    guardianEmail: auth.currentUser.email
                };
                console.log("Sending link request:", linkData);
                await createGuardianLinkRequest(linkData);
                showToast("Request sent! Waiting for your child to accept.");
                closeLinkModal();
                initDashboard(auth.currentUser); // Refresh
            } catch (err) {
                showToast(err.message, "error");
            } finally {
                setButtonBusy(sendRequestBtn, false);
            }
        };

        document.getElementById('cancelPendingRequestBtn')?.addEventListener('click', async () => {
            if (!pendingGuardianLink?.id && !pendingGuardianLink?.studentId) return;

            const button = document.getElementById('cancelPendingRequestBtn');
            try {
                setButtonBusy(button, true);
                // (2026-07-13) Pass student profile to remove link & clear cache; was id only
                await removeGuardianLink(pendingGuardianLink.id, {
                    guardianId: auth.currentUser?.uid,
                    guardianEmail: auth.currentUser?.email,
                    studentId: pendingGuardianLink.studentId,
                    studentUid: pendingGuardianLink.studentUid
                });
                const cancelledId = pendingGuardianLink.id;
                const cancelledSid = pendingGuardianLink.studentId;
                const cancelledUid = pendingGuardianLink.studentUid;
                pendingGuardianLink = null;
                window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== cancelledId && (!cancelledSid || String(l.studentId) !== String(cancelledSid)) && (!cancelledUid || l.studentUid !== cancelledUid));
                try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                renderGuardianAllDropdownNotifications();
                document.getElementById('studentIdInput').value = '';
                showToast("Pending request cancelled.");
                document.getElementById('addStudentBtn').style.display = 'flex';
                document.getElementById('linkModal').classList.add('active');
                await initDashboard(auth.currentUser);
            } catch (error) {
                console.warn("Cancel pending request failed:", error);
                showToast("Could not cancel that request right now.", "error");
            } finally {
                setButtonBusy(button, false);
            }
        });

        document.getElementById('editPendingRequestBtn')?.addEventListener('click', async () => {
            if (pendingGuardianLink?.studentId) {
                document.getElementById('studentIdInput').value = pendingGuardianLink.studentId;
            }
            document.getElementById('linkModal').classList.add('active');
        });

        // (2026-07-13) Close pending card & open from notifs; was non-dismissible card
        document.getElementById('closePendingCardBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const pendingCard = document.getElementById('pendingStateCard');
            if (pendingCard) {
                pendingCard.classList.remove('active');
                pendingCard.dataset.dismissed = 'true';
            }
        });
        document.getElementById('viewPendingRequestBtn')?.addEventListener('click', () => {
            const pendingCard = document.getElementById('pendingStateCard');
            if (pendingCard) {
                delete pendingCard.dataset.dismissed;
                pendingCard.classList.add('active');
            }
            if (guardianNotifDropdown) guardianNotifDropdown.style.display = 'none';
        });
        document.querySelector('.student-status-card')?.addEventListener('click', () => {
            if (pendingGuardianLink) {
                const pendingCard = document.getElementById('pendingStateCard');
                if (pendingCard) {
                    delete pendingCard.dataset.dismissed;
                    pendingCard.classList.toggle('active');
                }
            }
        });

        function getGuardianSupportThreadState() {
            const adminId = "system_admin_securo";
            return {
                adminId,
                participantId: guardianProfile?.uid || auth.currentUser?.uid || "",
                threadId: [guardianProfile?.uid || auth.currentUser?.uid || "", adminId].sort().join("_")
            };
        }

        function renderGuardianSupportMessages(messages = []) {
            const container = document.getElementById('guardianChatMessages');
            if (!container) return;

            container.innerHTML = '';
            if (!messages.length) {
                container.innerHTML = '<div class="chat-message received">Hello! You can message GAD support here anytime.<span class="chat-time">Just now</span></div>';
                return;
            }

            [...messages]
                .sort((a, b) => {
                    const timeA = a.timestamp?.toDate?.() || new Date(a.localTime || 0);
                    const timeB = b.timestamp?.toDate?.() || new Date(b.localTime || 0);
                    return timeA - timeB;
                })
                .forEach((msg) => {
                    const isSent = msg.senderId === (guardianProfile?.uid || auth.currentUser?.uid);
                    const date = msg.timestamp?.toDate?.() || new Date(msg.localTime || Date.now());
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const item = document.createElement('div');
                    item.className = `chat-message ${isSent ? 'sent' : 'received'}`;
                    item.innerHTML = `${escapeHtml(msg.text || '')}<span class="chat-time">${timeStr}</span>`;
                    container.appendChild(item);
                });

            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }

        function openGuardianSupportChat() {
            const overlay = document.getElementById('guardianChatOverlay');
            if (!overlay || !guardianProfile?.uid) return;
            overlay.classList.add('active');

            const supportState = getGuardianSupportThreadState();
            currentGuardianSupportThreadId = supportState.threadId;
            if (guardianSupportUnsub) guardianSupportUnsub();
            guardianSupportUnsub = subscribeToMessagesByThread(currentGuardianSupportThreadId, renderGuardianSupportMessages);

            setTimeout(() => document.getElementById('guardianChatInput')?.focus(), 200);
        }

        function closeGuardianSupportChat() {
            const overlay = document.getElementById('guardianChatOverlay');
            overlay?.classList.remove('active');
            if (guardianSupportUnsub) {
                guardianSupportUnsub();
                guardianSupportUnsub = null;
            }
        }

        async function sendGuardianSupportMessage() {
            const input = document.getElementById('guardianChatInput');
            const text = input?.value?.trim();
            if (!text || !guardianProfile?.uid) return;

            const supportState = getGuardianSupportThreadState();
            currentGuardianSupportThreadId = supportState.threadId;
            input.value = '';

            try {
                // (2026-07-13) Set senderRole to guardian; was omitted
                await sendChatMessage(guardianProfile.uid, supportState.adminId, text, guardianProfile.name || 'Guardian', {
                    threadId: currentGuardianSupportThreadId,
                    supportMode: 'gad_support',
                    senderRole: 'guardian',
                    senderLabel: guardianProfile.name || 'Guardian',
                    ownerId: guardianProfile.uid
                });
            } catch (error) {
                console.warn("Guardian support message failed:", error);
                showToast("Could not send your message right now.", "error");
            }
        }

        document.getElementById('openGuardianSupportBtn')?.addEventListener('click', openGuardianSupportChat);
        document.getElementById('closeGuardianChatBtn')?.addEventListener('click', closeGuardianSupportChat);
        document.getElementById('guardianSendChatBtn')?.addEventListener('click', sendGuardianSupportMessage);
        document.getElementById('guardianChatInput')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendGuardianSupportMessage();
            }
        });
        document.getElementById('guardianChatOverlay')?.addEventListener('click', (event) => {
            if (event.target.id === 'guardianChatOverlay') {
                closeGuardianSupportChat();
            }
        });

        let _renderStudentSelectorToken = 0;
        // (2026-07-13) Deduplicate student selector chips by child name; was duplicates
        async function renderStudentSelector(links) {
            const currentToken = ++_renderStudentSelectorToken;
            const bar = document.getElementById('studentSelector');
            if (!bar) return;

            const seenUids = new Set();
            const seenIds = new Set();
            const seenRawNames = new Set();
            const preliminary = [];

            for (const l of (links || [])) {
                const uid = (l.studentUid || '').trim();
                const sid = (l.studentId ? String(l.studentId) : '').trim();
                const name = (l.studentName || '').trim().toLowerCase();
                if (uid && seenUids.has(uid)) continue;
                if (sid && seenIds.has(sid)) continue;
                if (name && !name.startsWith('student') && name !== 'child' && seenRawNames.has(name)) continue;
                if (uid) seenUids.add(uid);
                if (sid) seenIds.add(sid);
                if (name && !name.startsWith('student') && name !== 'child') seenRawNames.add(name);
                preliminary.push(l);
            }

            const resolvedList = [];
            const seenResolvedNames = new Set();
            for (const link of preliminary) {
                const resolvedName = await resolveChildDisplayName(link);
                if (currentToken !== _renderStudentSelectorToken) return;
                const norm = (resolvedName || '').trim().toLowerCase();
                if (norm && seenResolvedNames.has(norm)) continue;
                if (norm) seenResolvedNames.add(norm);
                resolvedList.push({ link, resolvedName });
            }

            if (currentToken !== _renderStudentSelectorToken) return;
            // (2026-07-13) Guard against duplicate student chips in selector bar; was duplicate append
            bar.innerHTML = '';
            for (const { link, resolvedName } of resolvedList) {
                const normName = (resolvedName || '').trim().toLowerCase();
                const existing = [...bar.querySelectorAll('.selector-chip')].some(c => (c.textContent || '').trim().toLowerCase() === normName);
                if (existing) continue;
                const chip = document.createElement('div');
                chip.className = 'selector-chip' + (activeLink?.id === link.id ? ' active' : '');
                chip.textContent = resolvedName;
                chip.title = `Hold to remove ${resolvedName}`;
                chip.style.userSelect = 'none';

                let holdTimer = null;
                let isLongPress = false;

                const startHold = () => {
                    isLongPress = false;
                    holdTimer = setTimeout(async () => {
                        isLongPress = true;
                        if (confirm(`Remove child ${resolvedName}? You can link or invite them again anytime.`)) {
                            try {
                                // (2026-07-13) Pass guardian & student pair to remove all matching links
                                await removeGuardianLink(link.id, {
                                    guardianId: auth.currentUser?.uid,
                                    guardianEmail: auth.currentUser?.email,
                                    studentId: link.studentId,
                                    studentUid: link.studentUid
                                });
                                showToast("Child removed successfully.");
                                if (auth.currentUser) initDashboard(auth.currentUser);
                            } catch (e) {
                                showToast("Failed to remove child.", "error");
                            }
                        }
                    }, 700);
                };

                const cancelHold = () => {
                    if (holdTimer) {
                        clearTimeout(holdTimer);
                        holdTimer = null;
                    }
                };

                chip.addEventListener('pointerdown', startHold);
                chip.addEventListener('pointerup', cancelHold);
                chip.addEventListener('pointerleave', cancelHold);
                chip.addEventListener('pointercancel', cancelHold);
                chip.addEventListener('contextmenu', (e) => e.preventDefault());

                chip.onclick = (e) => {
                    if (isLongPress) {
                        e.preventDefault();
                        isLongPress = false;
                        return;
                    }
                    selectStudent(link, resolvedName);
                };
                bar.appendChild(chip);
            }
        }

        // (2026-07-13) Fast child switch with shimmer skeletons; was slow multi-fetch
        let _vaultLoadToken = 0;

        function renderVaultSkeleton(count = 6) {
            const container = document.getElementById('sharedVaultGrid');
            const empty = document.getElementById('vaultEmpty');
            if (empty) empty.style.display = 'none';
            if (!container) return;
            container.innerHTML = Array.from({ length: count }, () => `
                <div class="vault-skeleton-tile" aria-hidden="true">
                    <div class="vault-skeleton-badge"></div>
                    <div class="vault-skeleton-meta"></div>
                </div>
            `).join('');
        }

        function renderAlertsSkeleton(count = 3) {
            const container = document.getElementById('alertHistory');
            const empty = document.getElementById('alertsEmpty');
            if (empty) empty.style.display = 'none';
            if (!container) return;
            container.innerHTML = Array.from({ length: count }, () => '<div class="alert-skeleton-card" aria-hidden="true"></div>').join('');
        }

        async function selectStudent(link, fetchedName = null) {
            activeLink = link;
            const initialLabel = fetchedName || link?.studentName || 'Loading...';
            document.querySelectorAll('.selector-chip').forEach(c => c.classList.toggle('active', c.textContent === initialLabel));
            renderVaultSkeleton(6);
            renderAlertsSkeleton(3);

            const displayName = fetchedName || await resolveChildDisplayName(link);
            if (activeLink !== link) return;
            const studentStatusCard = document.querySelector('.student-status-card');
            if (studentStatusCard) studentStatusCard.style.display = 'flex';

            document.getElementById('activeStudentName').textContent = displayName;
            const studentAvatar = document.getElementById('studentAvatar');
            if (studentAvatar) {
                studentAvatar.textContent = displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase() || '?';
            }
            document.querySelectorAll('.selector-chip').forEach(c => c.classList.toggle('active', c.textContent === displayName));

            initMap();
            latestStudentLocation = null;
            clearStudentMarker();
            renderLocationAlert("Waiting for your child's live location...");
            document.getElementById('lastSeen').textContent = "Waiting for location...";
            document.getElementById('statusDot').style.background = 'var(--red)';
            startMonitoring(link.studentUid);
            loadSharedVault(link.studentUid, link.studentId, displayName);
        }

        // (2026-07-13) Single cached vault query with shimmer loader; was 4-step scan
        async function loadSharedVault(studentUid, studentId = null, childName = null) {
            const loadToken = ++_vaultLoadToken;
            const container = document.getElementById('sharedVaultGrid');
            const empty = document.getElementById('vaultEmpty');
            renderVaultSkeleton(6);
            const shimmerStart = Date.now();

            try {
                const targetName = (childName || document.getElementById('activeStudentName')?.textContent || activeLink?.studentName || '').trim();
                let targetUid = studentUid || activeLink?.studentUid;
                const targetSid = studentId || activeLink?.studentId;

                if (!targetUid && targetSid) {
                    const studentRecord = await findStudentUidByStudentId(targetSid).catch(() => null);
                    if (studentRecord?.uid) targetUid = studentRecord.uid;
                }

                const posts = await getGuardianSharedEmergencyPosts(targetUid, targetSid, targetName).catch(() => []);
                const elapsed = Date.now() - shimmerStart;
                if (elapsed < 240) {
                    await new Promise((r) => setTimeout(r, 240 - elapsed));
                }
                if (loadToken !== _vaultLoadToken) return;

                const sharedItems = [];
                const seenSrc = new Set();
                (posts || []).forEach(post => {
                    if (post.guardianVisible !== false && Array.isArray(post.attachments)) {
                        post.attachments.forEach(att => {
                            if ((att?.kind === 'image' || att?.kind === 'video') && att.src) {
                                const sig = att.src.length > 160 ? `${att.src.slice(0, 60)}_${att.src.slice(-60)}` : att.src;
                                if (!seenSrc.has(sig)) {
                                    seenSrc.add(sig);
                                    sharedItems.push({
                                        ...att,
                                        timestamp: post.timestamp || post.createdAt,
                                        location: post.location
                                    });
                                }
                            }
                        });
                    }
                });

                currentSharedVaultItems = sharedItems.sort((a, b) => {
                    const aTime = a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
                    const bTime = b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
                    return bTime - aTime;
                });

                if (currentSharedVaultItems.length === 0) {
                    if (container) container.innerHTML = '';
                    if (empty) empty.style.display = 'block';
                    return;
                }
                if (empty) empty.style.display = 'none';

                const _blobUrlMap = new Map();
                function getPlayableVideoUrl(src) {
                    if (!src || typeof src !== 'string' || !src.startsWith('data:video/')) return src || '';
                    if (_blobUrlMap.has(src)) return _blobUrlMap.get(src);
                    try {
                        const parts = src.split(',');
                        if (parts.length < 2) return src;
                        const mimeMatch = parts[0].match(/:(.*?);/);
                        const mime = mimeMatch ? mimeMatch[1] : 'video/mp4';
                        const binary = atob(parts[1]);
                        const len = binary.length;
                        const buffer = new Uint8Array(len);
                        for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
                        const blob = new Blob([buffer], { type: mime });
                        const url = URL.createObjectURL(blob);
                        _blobUrlMap.set(src, url);
                        return url;
                    } catch (e) {
                        return src;
                    }
                }

                // (2026-07-13) Render 3-column vault tiles matching student; was col-6 cards
                const formatTime12 = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
                const formatDateShort = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

                container.innerHTML = currentSharedVaultItems.map((item, index) => {
                    const date = item.timestamp?.toDate ? item.timestamp.toDate() : (item.timestamp ? new Date(item.timestamp) : new Date());
                    const isVideo = item.kind === 'video';
                    const icon = isVideo ? 'videocam' : 'image';
                    const playableUrl = isVideo ? getPlayableVideoUrl(item.src) : '';
                    const preview = isVideo
                        ? (item.thumbnail
                            ? `<img class="vault-preview" src="${item.thumbnail}" alt="Video thumbnail">
                               <div class="vault-video-badge"><span class="material-symbols-outlined">play_arrow</span></div>`
                            : `<div class="vault-preview" style="background:linear-gradient(135deg, #181528, #2a1f47); overflow:hidden;">
                                   <video class="vault-preview" src="${playableUrl}" muted playsinline webkit-playsinline preload="metadata" style="pointer-events:none;"></video>
                                   <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.5));"></div>
                                   <div class="vault-video-badge"><span class="material-symbols-outlined">play_arrow</span></div>
                               </div>`)
                        : `<img class="vault-preview" src="${item.src}" alt="${item.label || 'Vault image'}">`;

                    return `
                        <article class="vault-tile" data-vault-index="${index}">
                            <button class="download-btn" type="button" data-download-index="${index}" aria-label="Download media">
                                <span class="material-symbols-outlined">download</span>
                            </button>
                            <div class="tile-corner"><span class="material-symbols-outlined">${icon}</span></div>
                            ${preview}
                            <div class="tile-meta">${formatDateShort(date)} ${formatTime12(date)}</div>
                        </article>
                    `;
                }).join('');

                container.querySelectorAll('[data-vault-index]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const item = currentSharedVaultItems[Number(button.dataset.vaultIndex)];
                        if (item) openGuardianVaultViewer(item);
                    });
                });

                container.querySelectorAll('[data-download-index]').forEach((button) => {
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                        const item = currentSharedVaultItems[Number(button.dataset.downloadIndex)];
                        if (item) downloadFile(item.src, getGuardianVaultFilename(item));
                    });
                });
            } catch (err) {
                console.warn("Vault loading failed:", err);
            }
        }

        function getGuardianVaultFilename(item) {
            const date = item?.timestamp?.toDate?.() || new Date();
            const extension = item?.kind === 'video' ? 'mp4' : 'jpg';
            return `securo_vault_${item?.kind || 'media'}_${date.getTime()}.${extension}`;
        }

        function openGuardianVaultViewer(item) {
            if (!item || !vaultViewerModal || !vaultViewerMedia) return;
            const date = item.timestamp?.toDate?.() || new Date();
            // (2026-07-13) Fix mojibake symbol in vault viewer header; was corrupted string
            vaultViewerMeta.textContent = `${item.kind === 'video' ? 'Video' : 'Image'} \u2022 ${date.toLocaleString()}`;
            if (item.kind === 'video') {
                const playableSrc = typeof getPlayableVideoUrl === 'function' ? getPlayableVideoUrl(item.src) : item.src;
                vaultViewerMedia.innerHTML = `
                    <div style="position:relative; width:100%; min-height:240px; max-height:62vh; background:#0c0a17; display:flex; align-items:center; justify-content:center; border-radius:20px; overflow:hidden;">
                        <video src="${playableSrc}" controls playsinline webkit-playsinline style="width:100%; max-height:62vh; background:#0c0a17; object-fit:contain; border-radius:20px; display:block;"></video>
                    </div>
                `;
                const v = vaultViewerMedia.querySelector('video');
                if (v) { v.play().catch(() => {}); }
            } else {
                vaultViewerMedia.innerHTML = `<img src="${item.src}" alt="${item.label || 'Vault image'}">`;
            }
            downloadVaultViewerBtn.onclick = () => downloadFile(item.src, getGuardianVaultFilename(item));
            vaultViewerModal.classList.add('active');
        }

        let monitoredStudentAttendance = [];
        // (2026-07-13) Track student SOS records; was attendance only
        let monitoredStudentSos = [];
        let childAutoAttendanceBusy = false;
        let lastChildAutoAttendanceTime = 0;

        // (2026-07-13) Auto time out only when child outside campus; was auto timing in
        async function processChildAutoAttendance(studentUid, loc, isInside) {
            if (!studentUid || childAutoAttendanceBusy) return;
            if (isInside) return; // Do not auto time in; student must time in inside campus
            const currentTimedIn = monitoredStudentAttendance[0]?.type === 'in';
            if (!currentTimedIn) return;
            if (Date.now() - lastChildAutoAttendanceTime < 15000) return;

            const recent = monitoredStudentAttendance[0];
            if (recent && recent.type === 'out') {
                const recentTs = recent.timestamp?.toDate ? recent.timestamp.toDate().getTime() : new Date(recent.timestamp || recent.clientTimestamp || 0).getTime();
                if (Date.now() - recentTs < 30000) return;
            }

            childAutoAttendanceBusy = true;
            lastChildAutoAttendanceTime = Date.now();
            try {
                const lat = loc?.lat || CAMPUS_CENTER[0];
                const lng = loc?.lng || CAMPUS_CENTER[1];
                await logAttendance(studentUid, 'out', {
                    lat,
                    lng,
                    address: 'Outside Campus Bounds (Auto Time Out)',
                    auto: true
                });
                const childName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || 'Child';
                showToast(`Auto Time Out recorded for ${childName}.`);
            } catch (err) {
                console.warn("Child auto attendance error:", err);
            } finally {
                childAutoAttendanceBusy = false;
            }
        }

        function startMonitoring(studentUid) {
            if (locationUnsub) locationUnsub();
            if (attendanceUnsub) attendanceUnsub();
            if (sosUnsub) sosUnsub();

            locationUnsub = subscribeToStudentLocation(studentUid, (loc) => {
                updateStudentMap(loc);
            });

            let _initialAttendanceLoaded = false;
            let _lastNotifiedAttendanceId = null;
            // (2026-07-13) Push alerts for student time-in, time-out, SOS; was silent
            attendanceUnsub = subscribeToStudentAttendance(studentUid, (logs) => {
                monitoredStudentAttendance = Array.isArray(logs) ? logs : [];
                renderAlerts();
                if (monitoredStudentAttendance.length > 0) {
                    const latest = monitoredStudentAttendance[0];
                    const latestId = latest.id || `${latest.type}_${latest.clientTimestamp || ''}_${latest.timestamp?.seconds || ''}`;
                    if (!_initialAttendanceLoaded) {
                        _initialAttendanceLoaded = true;
                        _lastNotifiedAttendanceId = latestId;
                    } else if (latestId !== _lastNotifiedAttendanceId) {
                        _lastNotifiedAttendanceId = latestId;
                        const cName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || 'Your child';
                        const isTimeIn = latest.type === 'in';
                        const title = isTimeIn ? `Campus Ingress: ${cName}` : `Campus Egress: ${cName}`;
                        const locText = latest.location?.address || 'Campus Grounds';
                        const body = isTimeIn
                            ? `${cName} has timed in at ${locText}.`
                            : `${cName} has timed out from ${locText}.`;
                        triggerDevicePushNotification(title, body, { type: latest.type });
                    }
                }
            });

            let _lastNotifiedSosId = null;
            // (2026-07-13) 5s alarm on 1+ picture within 24h limit; was alarm on SOS trigger
            sosUnsub = subscribeToStudentSOS(studentUid, async (sosLogs) => {
                monitoredStudentSos = Array.isArray(sosLogs) ? sosLogs : [];
                renderAlerts();

                const card = document.getElementById('sosEmergencyCard');
                const text = document.getElementById('sosEmergencyText');
                const FORTY_EIGHT_HOURS = 48 * 60 * 60 * 1000;
                const activeAlerts = monitoredStudentSos.filter(s => {
                    const ts = s.timestamp?.toDate?.() || (s.timestamp ? new Date(s.timestamp) : null);
                    return s.status === 'active' && ts && (Date.now() - ts.getTime()) <= FORTY_EIGHT_HOURS;
                });
                if (activeAlerts.length > 0) {
                    const alert = activeAlerts[0];
                    let hasReportedPhoto = Boolean(
                        alert.hasPhoto ||
                        (Array.isArray(alert.photos) && alert.photos.length > 0) ||
                        alert.photoUrl ||
                        alert.lastPhoto ||
                        (Array.isArray(alert.evidence) && alert.evidence.some(e => e?.kind === 'image' || e?.type === 'image')) ||
                        (Array.isArray(alert.attachments) && alert.attachments.some(a => a?.kind === 'image'))
                    );

                    // (2026-07-13) Alarm if photo within 4 hours; was 24h photo search only
                    const FOUR_HOURS = 4 * 60 * 60 * 1000;
                    if (!hasReportedPhoto) {
                        try {
                            const raw = localStorage.getItem(`securo_student_sos_photo_${studentUid}`);
                            if (raw) {
                                const parsed = JSON.parse(raw);
                                if (parsed?.hasPhoto && (Date.now() - (parsed.timestamp || 0)) <= FOUR_HOURS) {
                                    hasReportedPhoto = true;
                                }
                            }
                        } catch (e) {}
                    }

                    if (!hasReportedPhoto && Array.isArray(currentSharedVaultItems)) {
                        const now = Date.now();
                        hasReportedPhoto = currentSharedVaultItems.some(i => {
                            const vTime = i.timestamp?.seconds ? i.timestamp.seconds * 1000 : 0;
                            return (i.kind === 'image' || i.type === 'image') && vTime > 0 && (now - vTime) <= FOUR_HOURS;
                        });
                    }

                    if (!hasReportedPhoto && typeof getUserEmergencyPosts === 'function') {
                        try {
                            const studentPosts = await getUserEmergencyPosts(studentUid).catch(() => []);
                            const now = Date.now();
                            hasReportedPhoto = studentPosts.some(p => {
                                const pTime = p.createdAt?.seconds ? (p.createdAt.seconds * 1000) : (p.timestamp?.seconds ? p.timestamp.seconds * 1000 : new Date(p.createdAt || 0).getTime());
                                const isWithin4Hours = !isNaN(pTime) && pTime > 0 ? (now - pTime) <= FOUR_HOURS : false;
                                return isWithin4Hours && Array.isArray(p.attachments) && p.attachments.some(a => a?.kind === 'image');
                            });
                        } catch (e) {}
                    }

                    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
                    const lastAlarmKey = `securo_last_sos_alarm_${studentUid}`;
                    const lastAlarmTime = parseInt(localStorage.getItem(lastAlarmKey) || '0', 10);
                    const hasAlarmedIn24Hours = (Date.now() - lastAlarmTime) < TWENTY_FOUR_HOURS;

                    if (hasReportedPhoto && !hasAlarmedIn24Hours) {
                        localStorage.setItem(lastAlarmKey, String(Date.now()));
                        const sName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || alert.userName || alert.studentName || 'Your child';
                        const sLoc = alert.location?.address || (alert.location?.lat ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : 'Campus Grounds');
                        triggerDevicePushNotification(`EMERGENCY SOS: ${sName}`, `CRITICAL ALERT: ${sName} reported emergency photo evidence at ${sLoc}! Open Securo immediately to view.`, { urgent: true, type: 'sos' });
                    }
                    const sName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || alert.userName || alert.studentName || 'Your child';
                    const sTime = alert.timestamp?.toDate?.() ? alert.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now';
                    const sLoc = alert.location?.address || (alert.location?.lat ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : 'Campus Grounds');
                    const sType = (alert.emergencyType || 'SOS Emergency').toUpperCase();
                    if (text) {
                        text.innerHTML = `<strong>${sName}</strong> · <strong>Status:</strong> ${alert.status?.toUpperCase() || 'ACTIVE'}<br><strong>Time:</strong> ${sTime} · <strong>Type:</strong> ${sType}<br><strong>Location:</strong> ${sLoc}`;
                    }
                    const btn = document.getElementById('viewSosLocationBtn');
                    if (btn && alert.location?.lat && alert.location?.lng) {
                        btn.onclick = () => {
                            setActiveView('map');
                            const notifDrop = document.getElementById('guardianNotifDropdown');
                            if (notifDrop) notifDrop.style.display = 'none';
                            if (map) map.setView([alert.location.lat, alert.location.lng], 18);
                        };
                    }
                    if (card) card.style.display = 'block';
                    updateGuardianNotifBadge();
                } else {
                    if (card) card.style.display = 'none';
                    updateGuardianNotifBadge();
                }
            });
        }

        // (2026-07-13) Disallow tracking if unlinked or offline; was active map only
        function updateStudentMap(loc) {
            if (!map || !activeLink) return;
            const locTime = loc?.updatedAt?.toDate ? loc.updatedAt.toDate().getTime() : (loc?.timestamp ? new Date(loc.timestamp).getTime() : 0);
            const isInactiveSession = !loc || loc.isOnline === false || loc.sharingEnabled === false || loc.sharingState === 'logged_out' || (locTime > 0 && Date.now() - locTime > 150000);
            if (isInactiveSession) {
                latestStudentLocation = null;
                clearStudentMarker();
                document.getElementById('lastSeen').innerHTML = `<span style="color:#64748b; font-weight:700;">Student Offline / Signed Out</span> · Tracking stopped`;
                document.getElementById('statusDot').style.background = '#94a3b8';
                const locateBtn = document.getElementById('locateBtn');
                if (locateBtn) locateBtn.disabled = true;
                return;
            }

            const unavailableReason = getLocationUnavailableReason(loc);
            renderLocationAlert(unavailableReason);

            if (unavailableReason) {
                latestStudentLocation = null;
                clearStudentMarker();
                document.getElementById('lastSeen').textContent = "Location unavailable";
                document.getElementById('statusDot').style.background = 'var(--red)';
                return;
            }

            const isInside = (loc && loc.isInside !== false && typeof loc.lat === 'number' && typeof loc.lng === 'number')
                ? isPointInPolygon([loc.lat, loc.lng], getCampusGeofencePolygon())
                : false;

            // (2026-07-13) Update child chip status and color live; was card only
            if (activeLink?.studentUid) {
                processChildAutoAttendance(activeLink.studentUid, loc, isInside);
                const currentChild = linkedChildrenData.find(c => c.id === activeLink.studentUid);
                if (currentChild) {
                    const prevInside = currentChild.isInside;
                    currentChild.isInside = isInside;
                    currentChild.timestamp = loc.updatedAt?.toDate ? loc.updatedAt.toDate().getTime() : Date.now();
                    updateGuardianTrackingChip();
                    if (prevInside !== undefined && prevInside !== isInside) {
                        const cName = currentChild.name || 'Your child';
                        const gTitle = isInside ? `Campus Entry: ${cName}` : `Campus Exit: ${cName}`;
                        const gBody = isInside ? `${cName} entered CTU campus grounds.` : `${cName} exited CTU campus grounds. Tracking is paused for privacy.`;
                        triggerDevicePushNotification(gTitle, gBody, { urgent: !isInside, type: 'geofence' });
                    }
                }
            }

            const locateBtn = document.getElementById('locateBtn');
            if (!isInside) {
                latestStudentLocation = null;
                clearStudentMarker();
                if (locateBtn) locateBtn.disabled = true;

                const time = loc.updatedAt?.toDate() || new Date();
                const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                document.getElementById('lastSeen').innerHTML = `<span style="color:#d11f34; font-weight:700;">Outside Campus</span> · Tracking paused (Privacy)`;
                document.getElementById('statusDot').style.background = 'var(--red)';
                return;
            }

            latestStudentLocation = loc;
            const pos = [loc.lat, loc.lng];
            if (locateBtn) locateBtn.disabled = false;

            if (!studentMarker) {
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="width:22px;height:22px;background:#0f9b67;border:3px solid white;border-radius:50%;box-shadow:0 0 20px rgba(15,155,103,0.5);"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });
                studentMarker = L.marker(pos, { icon }).addTo(map);
            } else {
                studentMarker.setLatLng(pos);
            }

            map.panTo(pos);
            const time = loc.updatedAt?.toDate() || new Date();
            const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('lastSeen').innerHTML = `<span style="color:#0f9b67; font-weight:700;">Inside Campus</span> · Active ${timeStr}`;
            document.getElementById('statusDot').style.background = 'var(--green)';
        }

        document.getElementById('requestLocationBtn')?.addEventListener('click', async () => {
            if (!activeLink?.studentUid || !guardianProfile?.uid) {
                showToast("Link a child first before sending a location request.", "error");
                return;
            }

            const button = document.getElementById('requestLocationBtn');
            const childName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink.studentName || 'your child';

            try {
                setButtonBusy(button, true);
                await sendGuardianLocationReminder(activeLink.id, {
                    guardianId: guardianProfile.uid,
                    guardianName: guardianProfile.name || "",
                    studentId: activeLink.studentId || "",
                    message: `${guardianProfile.name || "Your parent or guardian"} asked you to turn on location sharing so live tracking can continue.`
                });

                await sendAccountNotification({
                    userId: guardianProfile.uid,
                    type: "location_request_sent",
                    title: "Location request sent",
                    message: `We sent ${childName} a reminder to turn on location sharing.`,
                    sourceUserId: activeLink.studentUid,
                    sourceName: childName,
                    studentId: activeLink.studentId || "",
                    metadata: {
                        linkId: activeLink.id || ""
                    }
                }).catch(() => {});

                showToast("Location reminder sent to your child.");
            } catch (error) {
                showToast("Could not send the location reminder right now.", "error");
            } finally {
                setButtonBusy(button, false);
            }
        });

        document.getElementById('locateBtn')?.addEventListener('click', () => {
            if (!map || !latestStudentLocation?.lat || !latestStudentLocation?.lng) {
                showToast("Live location not available yet.", "error");
                return;
            }

            map.flyTo([latestStudentLocation.lat, latestStudentLocation.lng], Math.max(map.getZoom(), 18), {
                duration: 1.2
            });
        });

        function closeGuardianVaultViewer() {
            if (!vaultViewerModal) return;
            const v = vaultViewerMedia?.querySelector('video');
            if (v) { v.pause(); v.src = ''; }
            vaultViewerModal.classList.remove('active');
            vaultViewerMedia.innerHTML = '';
            downloadVaultViewerBtn.onclick = null;
        }

        // (2026-07-13) Render merged SOS & attendance logs; was attendance only
        function renderAlerts(passedLogs) {
            const container = document.getElementById('alertHistory');
            const empty = document.getElementById('alertsEmpty');
            if (!container || !empty) return;

            const sosItems = (Array.isArray(monitoredStudentSos) ? monitoredStudentSos : []).map(s => ({
                ...s,
                type: 'sos',
                isSosRecord: true
            }));

            const attendanceItems = Array.isArray(passedLogs) ? passedLogs : (Array.isArray(monitoredStudentAttendance) ? monitoredStudentAttendance : []);

            const filteredAttendance = attendanceItems.filter(a => {
                if (a.type !== 'sos') return true;
                return !sosItems.some(s => s.id === a.id || (s.timestamp?.seconds && a.timestamp?.seconds && Math.abs(s.timestamp.seconds - a.timestamp.seconds) < 5));
            });

            const allEvents = [...sosItems, ...filteredAttendance].filter(l => l.type === 'sos' || l.type === 'in' || l.type === 'out');

            allEvents.sort((a, b) => {
                const getMillis = (item) => {
                    if (item.timestamp?.toDate) return item.timestamp.toDate().getTime();
                    if (item.timestamp?.seconds) return item.timestamp.seconds * 1000;
                    if (item.timestamp) return new Date(item.timestamp).getTime();
                    if (item.clientTimestamp) return new Date(item.clientTimestamp).getTime();
                    return 0;
                };
                return getMillis(b) - getMillis(a);
            });

            if (allEvents.length === 0) {
                container.innerHTML = '';
                empty.style.display = 'block';
                return;
            }

            empty.style.display = 'none';
            container.innerHTML = allEvents.map(log => {
                let date = new Date();
                if (log.timestamp?.toDate) date = log.timestamp.toDate();
                else if (log.timestamp?.seconds) date = new Date(log.timestamp.seconds * 1000);
                else if (log.timestamp) date = new Date(log.timestamp);
                else if (log.clientTimestamp) date = new Date(log.clientTimestamp);

                const isSOS = log.type === 'sos';
                const locText = log.location?.address || (log.location?.lat ? `${log.location.lat.toFixed(4)}, ${log.location.lng.toFixed(4)}` : 'Campus Location');
                const sosStatus = (log.status || 'Active').toUpperCase();
                const isResolved = sosStatus === 'RESOLVED';
                const hasCoordinates = !!(log.location?.lat && log.location?.lng);

                return `
                    <div class="alert-item ${isSOS ? 'alert-item-sos' : ''}" style="${isSOS ? 'background:rgba(255,235,238,0.7); border:1px solid rgba(239,68,68,0.25);' + (hasCoordinates ? ' cursor:pointer;' : '') : ''}" ${isSOS && hasCoordinates ? `onclick="if(typeof setActiveView==='function'){setActiveView('map'); if(map) map.setView([${log.location.lat}, ${log.location.lng}], 18);}"` : ''}>
                        <div class="alert-icon ${isSOS ? 'icon-sos' : 'icon-attendance'}">
                            <span class="material-symbols-outlined">${isSOS ? 'emergency' : (log.type === 'in' ? 'login' : 'logout')}</span>
                        </div>
                        <div style="flex:1;">
                            <div style="font-weight:700; ${isSOS ? 'color:var(--red); display:flex; align-items:center; gap:6px; flex-wrap:wrap;' : ''}">
                                ${isSOS ? `<span>EMERGENCY ALERT</span><span style="font-size:0.65rem; background:${isResolved ? '#6b7280' : 'var(--red)'}; color:#fff; padding:1px 6px; border-radius:10px; font-weight:800;">${escapeHtml(sosStatus)}</span>` : (log.type === 'in' ? 'Timed In' : 'Timed Out')}
                            </div>
                            <div style="font-size:0.8rem; color:var(--muted); margin-top:2px;">${escapeHtml(locText)}</div>
                        </div>
                        <div style="font-size:0.75rem; font-weight:700; color:var(--muted); text-align:right;">
                            <div>${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            <div style="font-size:0.7rem; font-weight:500;">${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function loadStudentLogs(studentUid) {
            const logs = await getAttendanceHistory(studentUid);
            const container = document.getElementById('attendanceHistory');
            const empty = document.getElementById('logsEmpty');

            if (logs.length === 0) {
                container.innerHTML = '';
                empty.style.display = 'block';
                return;
            }

            empty.style.display = 'none';
            container.innerHTML = logs.map(log => {
                const date = log.timestamp?.toDate() || new Date();
                return `
                    <div class="card" style="padding:16px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                            <span style="font-weight:800; color:var(--primary); font-size:0.85rem;">${log.type.toUpperCase()}</span>
                            <span style="font-size:0.8rem; color:var(--muted); font-weight:600;">${date.toLocaleDateString()}</span>
                        </div>
                        <div style="font-weight:700; font-size:0.9rem;">${log.location?.address || 'Campus'}</div>
                        <div style="font-size:0.75rem; color:var(--muted); margin-top:4px;">Recorded at ${date.toLocaleTimeString()}</div>
                    </div>
                `;
            }).join('');
        }

        const fallbackGadPosts = [
            {
                id: "fallback-1",
                author: "GAD Office Official",
                content: "The quarterly diversity report is now available in the Vault. Students and guardians may review the latest inclusion metrics and campus support initiatives.",
                image: "",
                email: "gad-office@securo.local",
                timestamp: "May 2, 4:15 PM",
                likes: 256,
                likedBy: []
            },
            {
                id: "fallback-2",
                author: "GAD Office Official",
                content: "New wellness support channels are now available through the SOS page. During emergencies, students can quickly post voice, photo, video, or gallery evidence for faster response.",
                image: "",
                email: "gad-office@securo.local",
                timestamp: "May 1, 10:20 AM",
                likes: 89,
                likedBy: []
            }
        ];

        let currentGadPosts = [];

        async function loadGADPosts() {
            const feed = document.getElementById('gadPostsFeed');
            try {
                const posts = await getGADPosts();
                feed.innerHTML = "";
                const safePosts = Array.isArray(posts) && posts.length ? posts : fallbackGadPosts;
                currentGadPosts = safePosts.map(post => ({ ...post, likedBy: Array.isArray(post.likedBy) ? [...post.likedBy] : [] }));
                currentGadPosts.forEach(post => renderPost(post));
            } catch (error) {
                console.warn("Error loading posts:", error);
                feed.innerHTML = "";
                currentGadPosts = fallbackGadPosts.map(post => ({ ...post, likedBy: Array.isArray(post.likedBy) ? [...post.likedBy] : [] }));
                currentGadPosts.forEach(post => renderPost(post));
            }
        }

        function formatGadAuthor(author) {
            return (author || "GAD Office").replace(/\s+official$/i, "");
        }

        function renderPost(post) {
            const feed = document.getElementById('gadPostsFeed');
            const likeCount = typeof post.likes === "number" ? post.likes : (Array.isArray(post.likedBy) ? post.likedBy.length : 0);
            const isLiked = !!(guardianProfile?.uid && Array.isArray(post.likedBy) && post.likedBy.includes(guardianProfile.uid));
            const postHtml = `
                <article class="card feed-card" id="post-${post.id}">
                    <div class="feed-head">
                        <div style="display: flex; gap: 15px;">
                            <div class="icon-badge">
                                <span class="material-symbols-outlined" style="font-size: 26px;">verified_user</span>
                            </div>
                            <div class="feed-meta">
                                <strong>${formatGadAuthor(post.author)}</strong>
                                <span>${post.timestamp}</span>
                            </div>
                        </div>
                        <div class="eyebrow">Official</div>
                    </div>
                    <p style="font-size: 1rem; line-height: 1.6; margin-bottom: ${post.image ? "20px" : "0"}; color: #3a364d;">${post.content}</p>
                    ${post.image ? `<img src="${post.image}" style="width: 100%; max-height: 380px; object-fit: cover; border-radius: 18px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom:15px;">` : ""}
                    <button class="like-action ${isLiked ? "is-liked" : ""}" type="button" data-like-post="${post.id}">
                        <span class="material-symbols-outlined">${isLiked ? "favorite" : "favorite_border"}</span>
                        <span>${likeCount} ${likeCount === 1 ? "Like" : "Likes"}</span>
                    </button>
                </article>
            `;
            feed.insertAdjacentHTML('beforeend', postHtml);
        }

        document.getElementById('gadPostsFeed').addEventListener("click", async (event) => {
            const likeButton = event.target.closest("[data-like-post]");
            if (!likeButton || !guardianProfile?.uid) return;

            const postId = likeButton.dataset.likePost;
            const postIndex = currentGadPosts.findIndex((post) => String(post.id) === String(postId));
            if (postIndex < 0) return;

            try {
                if (String(postId).startsWith("fallback-")) {
                    const post = currentGadPosts[postIndex];
                    const likedBy = [...post.likedBy];
                    const likedIndex = likedBy.indexOf(guardianProfile.uid);
                    if (likedIndex >= 0) likedBy.splice(likedIndex, 1);
                    else likedBy.push(guardianProfile.uid);
                    currentGadPosts[postIndex] = { ...post, likedBy, likes: likedBy.length };
                } else {
                    const result = await toggleLikeGADPost(postId, guardianProfile.uid);
                    currentGadPosts[postIndex] = {
                        ...currentGadPosts[postIndex],
                        likes: result.likes,
                        likedBy: result.isLiked
                            ? Array.from(new Set([...currentGadPosts[postIndex].likedBy, guardianProfile.uid]))
                            : currentGadPosts[postIndex].likedBy.filter(id => id !== guardianProfile.uid)
                    };
                }

                document.getElementById('gadPostsFeed').innerHTML = "";
                currentGadPosts.forEach(post => renderPost(post));
            } catch (error) {
                console.warn("Like toggle failed:", error);
            }
        });

        function showToast(msg, type = 'success') {
            const toast = document.getElementById("toastNotify");
            if (!toast) return;
            const msgEl = document.getElementById("toastMsg");
            if (msgEl) msgEl.textContent = msg;

            toast.classList.add("active");
            setTimeout(() => {
                toast.classList.remove("active");
            }, 3000);
        }

        window.downloadFile = (url, filename) => {
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast("Downloading file...");
        };

        closeVaultViewerBtn?.addEventListener('click', closeGuardianVaultViewer);
        vaultViewerModal?.addEventListener('click', (event) => {
            if (event.target === vaultViewerModal) {
                closeGuardianVaultViewer();
            }
        });

        // (2026-07-13) Live presence heartbeat for watching indicator; was static
        let guardianPresenceInterval = null;
        async function setGuardianWatchingPresence(isWatching) {
            try {
                const uid = auth.currentUser?.uid;
                if (!uid) return;
                await updateDoc(doc(db, "users", uid), {
                    isWatching: Boolean(isWatching),
                    lastActiveAt: serverTimestamp()
                });
            } catch (_) {}
        }

        // --- Auth Hub ---
        onAuthStateChanged(auth, (user) => {
            const reqView = new URLSearchParams(window.location.search).get('view');
            if (user && reqView !== 'auth') {
                window.switchParentMode('dashboard');
                initDashboard(user);
                setGuardianWatchingPresence(true);
                if (guardianPresenceInterval) clearInterval(guardianPresenceInterval);
                guardianPresenceInterval = setInterval(() => {
                    if (document.visibilityState === 'visible') {
                        setGuardianWatchingPresence(true);
                    }
                }, 30000);
            } else {
                // (2026-07-13) Show auth section when signed out; was empty dashboard
                window.switchParentMode('auth');
                if (guardianPresenceInterval) clearInterval(guardianPresenceInterval);
            }
        });

        // (2026-07-13) Listen to BroadcastChannel for realtime sync; was none
        try {
            const ch = new BroadcastChannel('securo_users_channel');
            ch.onmessage = (e) => {
                if (e.data?.type === 'guardian_link_created' || e.data?.type === 'guardian_link_updated') {
                    if (auth.currentUser) initDashboard(auth.currentUser);
                }
            };
        } catch (_) {}

        document.addEventListener('visibilitychange', () => {
            setGuardianWatchingPresence(document.visibilityState === 'visible');
        });

        window.addEventListener('pagehide', () => {
            setGuardianWatchingPresence(false);
        });

        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);

        // (2026-07-13) Handle universal back button to close modals; was exiting app
        function handleGuardianUniversalBackClose() {
            const chatOverlay = document.getElementById('guardianChatOverlay');
            if (chatOverlay && chatOverlay.classList.contains('active')) {
                closeGuardianSupportChat();
                return true;
            }
            const vaultModal = document.getElementById('vaultViewerModal');
            if (vaultModal && vaultModal.classList.contains('active')) {
                closeGuardianVaultViewer();
                return true;
            }
            const linkModal = document.getElementById('linkModal');
            if (linkModal && linkModal.classList.contains('active')) {
                closeLinkModal();
                return true;
            }
            const deleteModal = document.getElementById('deleteAccountModal');
            if (deleteModal && deleteModal.classList.contains('active')) {
                deleteModal.classList.remove('active');
                return true;
            }
            const profileDropdown = document.getElementById('profileDropdown');
            if (profileDropdown && profileDropdown.classList.contains('active')) {
                profileDropdown.classList.remove('active');
                return true;
            }
            const notifDropdown = document.getElementById('guardianNotifDropdown');
            if (notifDropdown && getComputedStyle(notifDropdown).display !== 'none') {
                notifDropdown.style.display = 'none';
                return true;
            }
            const activeModal = document.querySelector('.modal.active, .overlay.active, .status-modal.active, [role="dialog"].active');
            if (activeModal && activeModal !== document.body) {
                const modalClose = activeModal.querySelector('.btn-close, .modal-close, [data-dismiss], .close-btn');
                if (modalClose) modalClose.click();
                else activeModal.classList.remove('active');
                return true;
            }
            if (typeof activeView !== 'undefined' && activeView !== 'map') {
                if (typeof setActiveView === 'function') {
                    setActiveView('map');
                    return true;
                }
            }
            return false;
        }

        try {
            const AppPlugin = window.Capacitor?.Plugins?.App;
            if (AppPlugin?.addListener) {
                AppPlugin.addListener('backButton', ({ canGoBack }) => {
                    const handled = handleGuardianUniversalBackClose();
                    if (!handled) {
                        if (canGoBack) window.history.back();
                        else if (AppPlugin.exitApp) AppPlugin.exitApp();
                    }
                });
            }
        } catch (e) {
            console.warn("Capacitor backButton setup failed:", e);
        }
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') handleGuardianUniversalBackClose();
        });
        window.addEventListener('popstate', () => {
            handleGuardianUniversalBackClose();
        });
