// (2026-07-13) Consolidated Parent JS (auth + dashboard); was 2 files
import { Logger, UI, Permissions, Validation, Format, Storage, Network, Device } from '../js/utils.js';
import { auth, db, firebaseConfig } from '../js/firebase-config.js';
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword, confirmPasswordReset } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, onSnapshot, collection, query, where, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
// (2026-07-13) Import real-time shared vault listener; was one-shot fetch only
import { getUserProfile, getAcceptedLinksForGuardian, getAllLinksForGuardian, subscribeToGuardianLinks, getAllUsers, getStudentBootstrapProfile, subscribeToStudentLocation, subscribeToStudentAttendance, logAttendance, getAttendanceHistory, getGADPosts, getAllEmergencyPosts, readLocalEmergencyPosts, getUserEmergencyPosts, getGuardianSharedEmergencyPosts, subscribeToGuardianSharedEmergencyPosts, findStudentUidByStudentId, createGuardianLinkRequest, respondToGuardianLink, removeGuardianLink, updateGuardianLinkStudentId, toggleLikeGADPost, sendAccountNotification, subscribeToAccountNotifications, markAccountNotificationRead, sendChatMessage, subscribeToMessagesByThread, deleteChatMessage, markThreadMessagesSeen, subscribeToAdminPresence, updateUserPresence, sendGuardianLocationReminder, subscribeToCampusMapConfig, subscribeToStudentSOS, deleteCurrentUserAccount, findUserByEmail, syncGuardianLinksForGuardian, saveUserProfile, saveAdminUserPassword, getAdminUserPassword, startUserPresenceHeartbeat } from '../js/db.js';
import { login, signUp, forgotPassword, getFriendlyAuthMessage } from '../js/auth.js';
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import '../js/install-sw.js';
// (2026-07-13) Import Messenger-style GAD popover & back button helper; was modal
import { initGadMessengerUI } from '../js/gad-messenger-ui.js';

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

        // (2026-07-13) Instant tap-lock & auto-reenable for all guardian buttons; was none
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            // (2026-07-13) Exclude navbar buttons from tap-lock disable; was hiding icons
            if (!btn || btn.disabled || btn.classList.contains('is-busy') || btn.dataset.noTapLock === '1' || btn.classList.contains('nav-item') || btn.hasAttribute('data-nav')) return;
            setTimeout(() => {
                if (btn.disabled || btn.classList.contains('is-busy')) return;
                btn.disabled = true;
                btn.dataset.tapLocked = '1';
                setTimeout(() => {
                    if (btn.dataset.tapLocked === '1' && !btn.classList.contains('is-busy')) {
                        btn.disabled = false;
                        delete btn.dataset.tapLocked;
                    }
                }, 420);
            }, 0);
        }, true);

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
                    // (2026-07-13) Cache guardian role on login; was missing role key
                    if (loggedInUser?.uid) {
                        localStorage.setItem('securo_session_token', loggedInUser.uid);
                    }
                    localStorage.setItem('securo_user_role', 'guardian');
                    sessionStorage.setItem('securo_authenticated', '1');
                    window.history.replaceState({}, '', 'parent.html'); window.switchParentMode('dashboard'); if (auth.currentUser) { window.location.reload(); }
                    return;
                }

                // (2026-07-13) Remove full name check during guardian signup; moved to onboarding
                const confirmPassword = document.getElementById('confirmPasswordSignup').value;
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
                    // (2026-07-13) Register guardian without name; prompt simple onboarding next
                    const email = emailInput.value.trim();
                    const password = document.getElementById('passwordInput').value;
                    const confirmPassword = document.getElementById('confirmPasswordSignup').value;

                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
                    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
                    if (password !== confirmPassword) throw new Error('Passwords do not match.');

                    const user = await signUp(email, password);
                    await saveUserProfile(user.uid, {
                        name: '',
                        email,
                        role: 'guardian',
                        onboardingCompleted: false
                    });
                    // (2026-07-13) Save admin password on register; was profile only save
                    await saveAdminUserPassword(user.uid, email, password);
                    // (2026-07-13) Cache guardian role on signup; was missing role key
                    localStorage.setItem('securo_session_token', user.uid);
                    localStorage.setItem('securo_user_role', 'guardian');
                    sessionStorage.setItem('securo_authenticated', '1');
                    sessionStorage.setItem('securo_just_registered', '1');

                    try {
                        const raw = localStorage.getItem('securo_user_directory');
                        const dir = raw ? JSON.parse(raw) : {};
                        dir[user.uid] = { ...(dir[user.uid] || {}), name: '', email, role: 'guardian', onboardingCompleted: false, updatedAt: new Date().toISOString() };
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

        // (2026-07-13) Add static sosMarker separate from live marker; was live only
        let map, studentMarker, sosMarker, polyline;
        let activeSosAlert = null;
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
            // (2026-07-13) Lazy fast tiles: idle updates, small buffer; prev: default opts
            const fastTileOpts = { updateWhenIdle: true, updateWhenZooming: false, keepBuffer: 2 };
            const baseMapLayers = {
                "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { ...fastTileOpts, maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
                "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { ...fastTileOpts, maxZoom: 19 }),
                "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { ...fastTileOpts, maxZoom: 20 })
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

        // (2026-07-13) Pin static SOS press point without live tracking; was missing
        function clearSosMarker() {
            activeSosAlert = null;
            if (sosMarker && map) {
                map.removeLayer(sosMarker);
                sosMarker = null;
            }
        }

        function renderSosLocationPin(alert) {
            activeSosAlert = alert || null;
            const lat = Number(alert?.location?.lat);
            const lng = Number(alert?.location?.lng);
            const hasValidCoords = !Number.isNaN(lat) && !Number.isNaN(lng) && !(lat === 0 && lng === 0);
            if (!map || !hasValidCoords) {
                if (sosMarker && map) {
                    map.removeLayer(sosMarker);
                    sosMarker = null;
                }
                return;
            }
            const pos = [lat, lng];
            const childName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || alert.userName || 'Your child';
            const timeStr = alert.timestamp?.toDate?.() ? alert.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now';
            const locText = alert.location?.address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            const isOutside = alert.location?.outOfBounds === true || alert.location?.isInside === false || !isPointInPolygon(pos, getCampusGeofencePolygon());
            const popupHtml = `
                <div style="padding:4px; min-width:170px;">
                    <strong style="color:#d11f34; font-size:0.88rem; display:block;">🚨 SOS Pressed Location</strong>
                    <div style="font-size:0.8rem; font-weight:700; margin-top:3px;">${escapeHtml(childName)}</div>
                    <div style="font-size:0.74rem; color:#64748b; margin-top:2px;"><strong>Time:</strong> ${escapeHtml(timeStr)}</div>
                    <div style="font-size:0.74rem; color:#64748b; margin-top:2px;"><strong>Location:</strong> ${escapeHtml(locText)}</div>
                    ${isOutside ? '<div style="font-size:0.72rem; color:#b91c1c; font-weight:700; margin-top:4px;">Outside Campus · Static SOS point only (live tracking disabled)</div>' : ''}
                </div>
            `;
            if (!sosMarker) {
                const sosIcon = L.divIcon({
                    className: 'guardian-sos-pin',
                    html: `<div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:28px;height:28px;background:rgba(209,31,52,0.32);border-radius:50%;"></div><div style="width:16px;height:16px;background:#d11f34;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(209,31,52,0.7);"></div></div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });
                sosMarker = L.marker(pos, { icon: sosIcon }).addTo(map);
            } else {
                sosMarker.setLatLng(pos);
            }
            sosMarker.bindPopup(popupHtml);
        }

        window.focusGuardianSosLocation = (lat, lng, locText = '', timeStr = '') => {
            const nLat = Number(lat);
            const nLng = Number(lng);
            if (Number.isNaN(nLat) || Number.isNaN(nLng) || (nLat === 0 && nLng === 0)) return;
            setActiveView('map');
            const notifDrop = document.getElementById('guardianNotifDropdown');
            if (notifDrop) notifDrop.style.display = 'none';
            if (!map) initMap();
            renderSosLocationPin({
                ...(activeSosAlert || {}),
                location: { ...(activeSosAlert?.location || {}), lat: nLat, lng: nLng, address: locText || activeSosAlert?.location?.address },
                timestamp: activeSosAlert?.timestamp || (timeStr ? new Date() : null)
            });
            if (map) {
                map.setView([nLat, nLng], 18);
                setTimeout(() => {
                    map.invalidateSize();
                    sosMarker?.openPopup();
                }, 120);
            }
        };

        // (2026-07-13) Allow outside_campus state without error banner; was lat check
        function getLocationUnavailableReason(loc) {
            if (!loc) {
                return "We have not received your child's live location yet. Ask them to turn on location services.";
            }

            if (loc.sharingEnabled === false) {
                return loc.sharingMessage || "Your child has location sharing turned off. They need to enable it before you can see live tracking.";
            }

            if (loc.isInside === false || loc.sharingState === 'outside_campus') {
                return "";
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

        // (2026-07-13) Persist shown prompt IDs across reloads; was memory Set
        const _notifiedAccountEventIds = new Set((() => {
            try { return JSON.parse(localStorage.getItem('securo_guardian_notified_ids') || '[]'); } catch (_) { return []; }
        })());
        let _isInitialGuardianNotifSnapshot = true;
        const markNotifiedAccountEvent = (id) => {
            if (!id) return;
            _notifiedAccountEventIds.add(id);
            try {
                localStorage.setItem('securo_guardian_notified_ids', JSON.stringify(Array.from(_notifiedAccountEventIds).slice(-100)));
            } catch (_) {}
        };
        // (2026-07-13) Distinct notification-style SOS chime & audio unlock; was 5s sawtooth
        let _guardianAudioCtx = null;
        let _lastSosChimeAt = 0;
        const ensureGuardianAudioCtx = () => {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            if (!_guardianAudioCtx || _guardianAudioCtx.state === 'closed') {
                _guardianAudioCtx = new AudioCtx();
            }
            if (_guardianAudioCtx.state === 'suspended') {
                _guardianAudioCtx.resume().catch(() => {});
            }
            return _guardianAudioCtx;
        };
        const unlockGuardianAudio = () => { ensureGuardianAudioCtx(); };
        ['pointerdown', 'touchstart', 'keydown'].forEach((evt) => {
            window.addEventListener(evt, unlockGuardianAudio, { passive: true, once: true });
        });

        function playGuardianSosNotificationTone() {
            const nowMs = Date.now();
            if (nowMs - _lastSosChimeAt < 4000) return;
            _lastSosChimeAt = nowMs;
            try {
                const audioCtx = ensureGuardianAudioCtx();
                if (!audioCtx) return;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 2800;
                filter.connect(audioCtx.destination);

                // Two crisp 3-note rising warning bursts: urgent notification, not harsh siren
                const notes = [
                    { t: 0.00, f: 880.0, d: 0.16, vol: 0.24 },
                    { t: 0.16, f: 1108.7, d: 0.16, vol: 0.26 },
                    { t: 0.32, f: 1318.5, d: 0.26, vol: 0.28 },
                    { t: 0.74, f: 880.0, d: 0.16, vol: 0.24 },
                    { t: 0.90, f: 1108.7, d: 0.16, vol: 0.26 },
                    { t: 1.06, f: 1318.5, d: 0.42, vol: 0.28 }
                ];
                const start = audioCtx.currentTime + 0.02;
                notes.forEach((n) => {
                    const osc = audioCtx.createOscillator();
                    const overtone = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const overGain = audioCtx.createGain();

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(n.f, start + n.t);
                    overtone.type = 'sine';
                    overtone.frequency.setValueAtTime(n.f * 2, start + n.t);

                    gain.gain.setValueAtTime(0.0001, start + n.t);
                    gain.gain.linearRampToValueAtTime(n.vol, start + n.t + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + n.t + n.d);

                    overGain.gain.setValueAtTime(0.0001, start + n.t);
                    overGain.gain.linearRampToValueAtTime(n.vol * 0.22, start + n.t + 0.015);
                    overGain.gain.exponentialRampToValueAtTime(0.001, start + n.t + n.d * 0.85);

                    osc.connect(gain);
                    overtone.connect(overGain);
                    gain.connect(filter);
                    overGain.connect(filter);

                    osc.start(start + n.t);
                    osc.stop(start + n.t + n.d + 0.02);
                    overtone.start(start + n.t);
                    overtone.stop(start + n.t + n.d + 0.02);
                });
            } catch (e) {}
        }

        function playGuardianSoftNotifTone() {
            try {
                const audioCtx = ensureGuardianAudioCtx();
                if (!audioCtx) return;
                const start = audioCtx.currentTime + 0.02;
                [{ t: 0, f: 659.25, d: 0.14 }, { t: 0.14, f: 880, d: 0.22 }].forEach((n) => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(n.f, start + n.t);
                    gain.gain.setValueAtTime(0.0001, start + n.t);
                    gain.gain.linearRampToValueAtTime(0.16, start + n.t + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.001, start + n.t + n.d);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(start + n.t);
                    osc.stop(start + n.t + n.d + 0.02);
                });
            } catch (e) {}
        }

        async function triggerDevicePushNotification(title, body, options = {}) {
            const isSosAlert = options.type === 'sos' || /sos/i.test(String(title || ''));
            if (isSosAlert) {
                try {
                    if (window.Capacitor?.Plugins?.Haptics) {
                        window.Capacitor.Plugins.Haptics.vibrate({ duration: 600 }).catch(() => {});
                    } else if (navigator.vibrate) {
                        navigator.vibrate([220, 110, 220, 110, 320]);
                    }
                } catch (e) {}
                playGuardianSosNotificationTone();
            } else if (options.urgent) {
                try {
                    if (navigator.vibrate) navigator.vibrate([160, 100, 160]);
                } catch (e) {}
                playGuardianSoftNotifTone();
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

            // (2026-07-13) Hide cancelled student invites not in pendingList; was lingering
            const activePendingIds = new Set((pendingList || []).map(l => String(l?.id || '')).filter(Boolean));
            const cleanNotifications = (notifications || []).filter(n => {
                if ((n?.type === 'student_guardian_request' || n?.type === 'guardian_request') && !n?.resolvedStatus) {
                    const rId = String(n?.requestId || '');
                    if (!rId || !activePendingIds.has(rId)) {
                        return false;
                    }
                }
                return true;
            });
            const unreadTotal = cleanNotifications.filter(n => !n.isRead).length;
            const activeTab = window._guardianNotifFilter === 'unread' ? 'unread' : 'all';
            const filteredNotifs = activeTab === 'unread' ? cleanNotifications.filter(n => !n.isRead) : cleanNotifications;

            // (2026-07-13) Flat divider rows matching student notifs; was boxed cards
            const filterBarHtml = `
                <div class="guardian-notif-filter-bar" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 16px 8px; border-bottom:1px solid rgba(15,23,42,0.06);">
                    <div style="display:flex; gap:6px;">
                        <button type="button" class="guardian-notif-tab-btn" data-filter="all" style="padding:5px 12px; border-radius:999px; border:none; font-size:0.76rem; font-weight:700; cursor:pointer; background:${activeTab === 'all' ? '#ffe4e6' : '#f1f5f9'}; color:${activeTab === 'all' ? '#e11d48' : '#475569'};">All</button>
                        <button type="button" class="guardian-notif-tab-btn" data-filter="unread" style="padding:5px 12px; border-radius:999px; border:none; font-size:0.76rem; font-weight:700; cursor:pointer; background:${activeTab === 'unread' ? '#ffe4e6' : '#f1f5f9'}; color:${activeTab === 'unread' ? '#e11d48' : '#475569'};">Unread${unreadTotal ? ` (${unreadTotal})` : ''}</button>
                    </div>
                    ${unreadTotal > 0 ? `<button type="button" class="guardian-mark-all-read-btn" style="border:none; background:transparent; color:#e11d48; font-size:0.75rem; font-weight:700; cursor:pointer; padding:4px 6px;">Mark all read</button>` : ''}
                </div>
            `;

            const notifsHtml = filteredNotifs.length
                ? filteredNotifs.slice(0, 25).map(item => `
                    <div class="guardian-notif-entry" data-notif-id="${item.id}" data-is-read="${item.isRead ? '1' : '0'}" style="display:flex; align-items:flex-start; gap:12px; padding:14px 18px; border-bottom:1px solid rgba(15,23,42,0.05); cursor:pointer; background:${item.isRead ? '#ffffff' : 'rgba(244, 63, 94, 0.06)'}; transition:background 0.2s;">
                        <div style="width:36px; height:36px; border-radius:10px; background:${item.isRead ? '#fff1f2' : '#ffe4e6'}; color:#e11d48; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <span class="material-symbols-outlined" style="font-size:20px;">${getGuardianNotificationIcon(item.type)}</span>
                        </div>
                        <div style="flex:1; min-width:0;">
                            <strong style="font-size:0.85rem; color:var(--ink); font-weight:${item.isRead ? '600' : '800'}; display:block; margin-bottom:2px;">${escapeHtml(item.title || "Notification")}</strong>
                            <div style="font-size:0.76rem; color:${item.isRead ? 'var(--muted)' : '#1e293b'}; line-height:1.35;">${escapeHtml(item.message || "")}</div>
                            <div style="font-size:0.72rem; color:${item.isRead ? 'var(--muted)' : '#e11d48'}; font-weight:${item.isRead ? '500' : '700'}; margin-top:5px;">${escapeHtml(formatNotificationTime(item.createdAt))}</div>
                        </div>
                        ${item.isRead ? '' : '<span class="notif-unread-dot" style="width:9px; height:9px; border-radius:50%; background:#e11d48; flex-shrink:0; margin-top:6px;" title="Unread"></span>'}
                    </div>
                `).join('')
                : `<div style="text-align:center; padding:40px 20px; color:#94a3b8; font-size:0.82rem; font-weight:600;">${activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</div>`;

            listEl.innerHTML = pendingHtml + filterBarHtml + notifsHtml;

            listEl.querySelectorAll('.guardian-notif-tab-btn').forEach(tabBtn => {
                tabBtn.onclick = (e) => {
                    e.stopPropagation();
                    window._guardianNotifFilter = tabBtn.dataset.filter || 'all';
                    renderGuardianAllDropdownNotifications();
                };
            });
            const markAllBtn = listEl.querySelector('.guardian-mark-all-read-btn');
            if (markAllBtn) {
                markAllBtn.onclick = async (e) => {
                    e.stopPropagation();
                    const unreadItems = (window._guardianAccountNotifications || []).filter(n => n?.id && !n.isRead);
                    unreadItems.forEach(n => { n.isRead = true; });
                    renderGuardianAllDropdownNotifications();
                    updateGuardianNotifBadge();
                    await Promise.all(unreadItems.map(n => markAccountNotificationRead(n.id).catch(() => { })));
                };
            }
            listEl.querySelectorAll('.guardian-notif-entry').forEach(card => {
                card.onclick = async (e) => {
                    e.stopPropagation();
                    const nid = card.dataset.notifId;
                    const target = (window._guardianAccountNotifications || []).find(n => String(n.id) === String(nid));
                    if (target && !target.isRead) {
                        target.isRead = true;
                        renderGuardianAllDropdownNotifications();
                        updateGuardianNotifBadge();
                        markAccountNotificationRead(nid).catch(() => { });
                    }
                };
            });

            // (2026-07-13) Guard duplicate clicks & spin buttons on response; was unlocked
            if (!window._activeParentLinkRespIds) window._activeParentLinkRespIds = new Set();
            listEl.querySelectorAll('.guardian-dropdown-accept-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const linkId = btn.dataset.linkId;
                    if (!linkId || window._activeParentLinkRespIds.has(linkId)) return;
                    window._activeParentLinkRespIds.add(linkId);
                    const studentUid = btn.dataset.studentUid;
                    const studentName = btn.dataset.studentName;
                    const decBtn = btn.parentElement ? btn.parentElement.querySelector('.guardian-dropdown-decline-btn') : null;
                    setButtonBusy(btn, true);
                    if (decBtn) decBtn.disabled = true;
                    try {
                        await respondToGuardianLink(linkId, 'accepted', studentUid, { name: studentName });
                        const acceptedPending = (window._guardianPendingLinks || []).find(l => l.id === linkId);
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== linkId);
                        localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks));
                        // (2026-07-13) Optimistically show newly accepted child chip; was delayed
                        const optimisticLink = {
                            ...(acceptedPending || {}),
                            id: linkId,
                            studentUid,
                            studentName: studentName || acceptedPending?.studentName || 'Child',
                            status: 'accepted'
                        };
                        const prevAccepted = (window._guardianAcceptedLinks || []).filter(l => l.id !== linkId && (!studentUid || l.studentUid !== studentUid));
                        window._guardianAcceptedLinks = [...prevAccepted, optimisticLink];
                        if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                        selectStudent(optimisticLink, optimisticLink.studentName);
                        renderStudentSelector(window._guardianAcceptedLinks);
                        renderGuardianAllDropdownNotifications();
                        showGuardianRealtimePrompt("Child Connected", `You are now linked to ${studentName}.`);
                    } catch (err) {
                        setButtonBusy(btn, false);
                        if (decBtn) decBtn.disabled = false;
                        showToast(err.message || "Failed to accept", "error");
                    } finally {
                        window._activeParentLinkRespIds.delete(linkId);
                    }
                };
            });
            listEl.querySelectorAll('.guardian-dropdown-decline-btn').forEach(btn => {
                btn.onclick = async (e) => {
                    e.stopPropagation();
                    const linkId = btn.dataset.linkId;
                    if (!linkId || window._activeParentLinkRespIds.has(linkId)) return;
                    window._activeParentLinkRespIds.add(linkId);
                    const studentUid = btn.dataset.studentUid;
                    const studentName = btn.dataset.studentName;
                    const accBtn = btn.parentElement ? btn.parentElement.querySelector('.guardian-dropdown-accept-btn') : null;
                    setButtonBusy(btn, true);
                    if (accBtn) accBtn.disabled = true;
                    try {
                        await respondToGuardianLink(linkId, 'rejected', studentUid, { name: studentName });
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== linkId);
                        localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks));
                        renderGuardianAllDropdownNotifications();
                        showGuardianRealtimePrompt("Request Declined", `You declined the link request for ${studentName}.`);
                        if (auth.currentUser) initDashboard(auth.currentUser);
                    } catch (err) {
                        setButtonBusy(btn, false);
                        if (accBtn) accBtn.disabled = false;
                        showToast(err.message || "Failed to decline", "error");
                    } finally {
                        window._activeParentLinkRespIds.delete(linkId);
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

        // (2026-07-13) Defer toasts until all modals close; was overlapping open modals
        const _guardianPendingToastQueue = [];
        let _guardianModalPollTimer = null;
        function isAnyGuardianModalOpen() {
            const activeOverlay = document.querySelector('.modal-overlay.active, .status-modal.active');
            if (activeOverlay) return true;
            const otp = document.getElementById('guardianOtpModal');
            if (otp && getComputedStyle(otp).display !== 'none') return true;
            const terms = document.getElementById('guardianTermsModal');
            if (terms && getComputedStyle(terms).display !== 'none') return true;
            return false;
        }
        function waitForGuardianModalsClosed(fn) {
            if (!isAnyGuardianModalOpen()) {
                fn();
                return;
            }
            _guardianPendingToastQueue.push(fn);
            if (!_guardianModalPollTimer) {
                _guardianModalPollTimer = setInterval(() => {
                    if (!isAnyGuardianModalOpen()) {
                        clearInterval(_guardianModalPollTimer);
                        _guardianModalPollTimer = null;
                        while (_guardianPendingToastQueue.length > 0) {
                            const nextFn = _guardianPendingToastQueue.shift();
                            try { nextFn(); } catch (_) {}
                        }
                    }
                }, 150);
            }
        }

        // (2026-07-13) Bottom realtime toast with swipe/tap; was top:20px
        function showGuardianRealtimePrompt(title, message) {
            if (isAnyGuardianModalOpen()) {
                const existing = document.getElementById('guardianRealtimePrompt');
                if (existing) existing.remove();
                waitForGuardianModalsClosed(() => showGuardianRealtimePrompt(title, message));
                return;
            }
            const existing = document.getElementById('guardianRealtimePrompt');
            if (existing) existing.remove();

            const toast = document.createElement('div');
            toast.id = 'guardianRealtimePrompt';
            toast.className = 'guardian-realtime-toast';
            toast.style.cssText = 'position:fixed; bottom:calc(88px + env(safe-area-inset-bottom, 0px)); left:16px; right:16px; max-width:440px; margin:0 auto; background:white; padding:16px; border-radius:18px; box-shadow:0 12px 36px rgba(0,0,0,0.18); border:1.5px solid #f43f5e; z-index:9999; display:flex; align-items:center; gap:12px; cursor:grab; touch-action:none; user-select:none; transition:transform 0.25s ease, opacity 0.25s ease;';
            toast.innerHTML = `
                <div style="width:40px; height:40px; border-radius:12px; background:#fff1f2; color:#f43f5e; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <span class="material-symbols-outlined">notifications_active</span>
                </div>
                <div style="flex:1; min-width:0;">
                    <strong style="font-size:0.88rem; color:#0f172a; display:block;">${escapeHtml(title)}</strong>
                    <span style="font-size:0.78rem; color:#64748b; line-height:1.3; display:block; margin-top:2px;">${escapeHtml(message)}</span>
                </div>
                <button type="button" class="guardian-toast-close" aria-label="Dismiss" style="width:28px; height:28px; border-radius:8px; border:none; background:rgba(15,23,42,0.06); color:#64748b; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0;">
                    <span class="material-symbols-outlined" style="font-size:16px;">close</span>
                </button>
            `;

            let dismissed = false;
            let autoTimer = null;
            const dismissToast = (tx = 0, ty = 30) => {
                if (dismissed) return;
                dismissed = true;
                if (autoTimer) clearTimeout(autoTimer);
                toast.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
                toast.style.transform = `translate(${tx}px, ${ty}px)`;
                toast.style.opacity = '0';
                setTimeout(() => { if (toast.parentNode) toast.remove(); }, 260);
            };

            let startX = 0, startY = 0, curX = 0, curY = 0, dragging = false, didSwipe = false;

            const onDragStart = (x, y) => {
                dragging = true;
                didSwipe = false;
                startX = x;
                startY = y;
                curX = 0;
                curY = 0;
                toast.style.transition = 'none';
                toast.style.cursor = 'grabbing';
            };
            const onDragMove = (x, y) => {
                if (!dragging || dismissed) return;
                curX = x - startX;
                curY = Math.max(0, y - startY);
                if (Math.abs(curX) > 8 || Math.abs(curY) > 8) didSwipe = true;
                const progress = Math.min(1, Math.max(Math.abs(curX) / 140, Math.abs(curY) / 80));
                toast.style.transform = `translate(${curX}px, ${curY}px)`;
                toast.style.opacity = String(Math.max(0.15, 1 - progress * 0.85));
            };
            const onDragEnd = () => {
                if (!dragging || dismissed) return;
                dragging = false;
                toast.style.cursor = 'grab';
                if (Math.abs(curX) > 65) {
                    dismissToast(curX > 0 ? window.innerWidth : -window.innerWidth, curY);
                } else if (curY > 35) {
                    dismissToast(curX, 120);
                } else {
                    toast.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
                    toast.style.transform = 'translate(0, 0)';
                    toast.style.opacity = '1';
                }
            };

            toast.addEventListener('pointerdown', (e) => {
                if (e.target.closest('button')) return;
                toast.setPointerCapture?.(e.pointerId);
                onDragStart(e.clientX, e.clientY);
            });
            toast.addEventListener('pointermove', (e) => onDragMove(e.clientX, e.clientY));
            toast.addEventListener('pointerup', onDragEnd);
            toast.addEventListener('pointercancel', onDragEnd);

            toast.onclick = (e) => {
                if (e.target.closest('.guardian-toast-close')) {
                    e.stopPropagation();
                    dismissToast(0, 24);
                    return;
                }
                if (didSwipe) return;
                const drop = document.getElementById('guardianNotifDropdown');
                if (drop) drop.style.display = 'block';
                dismissToast(0, 24);
            };
            document.body.appendChild(toast);
            autoTimer = setTimeout(() => dismissToast(0, 24), 6000);
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

            // (2026-07-13) Skip popup replay on initial reload; was popping every load
            const isInitialBatch = _isInitialGuardianNotifSnapshot;
            _isInitialGuardianNotifSnapshot = false;
            notifications.forEach((item) => {
                if (!item.isRead && !_notifiedAccountEventIds.has(item.id)) {
                    markNotifiedAccountEvent(item.id);
                    const isSosItem = item.type === 'sos' || item.priority === 'urgent' || /sos/i.test(String(item.title || ''));
                    const createdMs = item.createdAt?.toDate?.()?.getTime?.() || (item.createdAt?.seconds ? item.createdAt.seconds * 1000 : new Date(item.createdAt || 0).getTime());
                    const isFreshSos = isSosItem && createdMs > 0 && (Date.now() - createdMs) <= 120000;
                    if (isInitialBatch && !isFreshSos) return;
                    // (2026-07-13) Forward SOS type & urgency for chime; was empty options
                    triggerBrowserNotification(item.title || "Campus Update", item.message || "", {
                        type: isSosItem ? 'sos' : (item.type || 'info'),
                        urgent: isSosItem
                    });
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
            // (2026-07-13) Reflect student-initiated invite text; was always waiting
            if (lastSeen) {
                lastSeen.textContent = link.requestedBy === 'student'
                    ? `${childDisplayName} invited you to connect`
                    : `Waiting for ${childDisplayName} to approve`;
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
                                    // (2026-07-13) Optimistically render accepted child on bar; was delayed
                                    const optimisticLink = { ...link, studentName: childDisplayName || link.studentName || 'Child', status: 'accepted' };
                                    const prevAccepted = (window._guardianAcceptedLinks || []).filter(l => l.id !== link.id && (!link.studentUid || l.studentUid !== link.studentUid));
                                    window._guardianAcceptedLinks = [...prevAccepted, optimisticLink];
                                    if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                                    selectStudent(optimisticLink, optimisticLink.studentName);
                                    renderStudentSelector(window._guardianAcceptedLinks);
                                    renderGuardianAllDropdownNotifications();
                                    showToast("Child connected successfully");
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

        // (2026-07-13) Hide campus chip if child offline/no event; was fake inside
        function updateGuardianTrackingChip() {
            const banner = document.getElementById('guardianTrackingStatusBanner');
            const icon = document.getElementById('guardianTrackingStatusIcon');
            const copy = document.getElementById('guardianTrackingStatusCopy');
            if (!banner || !icon || !copy) return;

            if (!linkedChildrenData || linkedChildrenData.length === 0) {
                banner.style.display = 'none';
                return;
            }

            const currentChild = (activeLink?.studentUid && linkedChildrenData.find(c => c.id === activeLink.studentUid))
                || linkedChildrenData[activeChildStatusIndex % linkedChildrenData.length];
            if (!currentChild || currentChild.isOnline === false || typeof currentChild.isInside !== 'boolean' || !currentChild.timestamp) {
                banner.style.display = 'none';
                return;
            }

            banner.style.display = 'inline-flex';
            const isInside = currentChild.isInside === true;
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
            // (2026-07-13) Init map before data awaits for fast load; prev: after fetches
            try {
                initMap();
                if (map) requestAnimationFrame(() => map.invalidateSize(false));
            } catch (_) {}
            // (2026-07-13) Request push notification permissions on init; was deferred
            if (window.Capacitor?.Plugins?.LocalNotifications) {
                window.Capacitor.Plugins.LocalNotifications.requestPermissions().catch(() => {});
            } else if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission().catch(() => {});
            }
            try {
                // (2026-07-13) Render fallback guardian name immediately; prev: waited on DB
                updateGuardianProfileUI(user.displayName || (user.email ? user.email.split('@')[0] : 'Guardian'));
                if (notificationUnsub) notificationUnsub();
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

                    // (2026-07-13) Focus newly connected child immediately on bar; was accepted[0]
                    let newlyAcceptedLink = null;
                    allLiveLinks.forEach(l => {
                        if (l.status === 'pending' && l.requestedBy === 'student') {
                            const invKey = 'pending_student_invite_' + l.id;
                            if (!_notifiedAccountEventIds.has(invKey)) {
                                markNotifiedAccountEvent(invKey);
                                showGuardianRealtimePrompt("Child Link Request", `${l.studentName || "Your child"} invited you to connect as their guardian.`);
                            }
                        } else if (l.status === 'accepted') {
                            if (!_notifiedAccountEventIds.has(l.id)) {
                                markNotifiedAccountEvent(l.id);
                                if (!_isInitialGuardianLinkSnapshot) {
                                    newlyAcceptedLink = l;
                                    showGuardianRealtimePrompt("Child Connected", `${l.studentName || "Your child"} has linked to your guardian account.`);
                                }
                            }
                        } else if (l.status === 'rejected' || l.status === 'declined') {
                            const decKey = 'declined_' + l.id;
                            if (!_notifiedAccountEventIds.has(decKey)) {
                                markNotifiedAccountEvent(decKey);
                                // (2026-07-13) Skip declined popup on initial load; was replaying
                                if (!_isInitialGuardianLinkSnapshot) {
                                    showGuardianRealtimePrompt("Child Link Declined", `${l.studentName || "Your child"} declined your link request.`);
                                    showToast("Link request declined by child.", "error");
                                }
                            }
                        }
                    });
                    _isInitialGuardianLinkSnapshot = false;
                    window._guardianAcceptedLinks = accepted;
                    if (accepted.length > 0) {
                        if (studentSelectorBar) studentSelectorBar.style.display = 'flex';
                        const addBtn = document.getElementById('addStudentBtn');
                        if (addBtn) addBtn.style.display = accepted.length < 5 ? 'flex' : 'none';
                        setPendingGuardianState(null);
                        const targetLink = (newlyAcceptedLink && accepted.find(a => a.id === newlyAcceptedLink.id))
                            || (activeLink && accepted.find(a => a.id === activeLink.id))
                            || accepted[0];
                        selectStudent(targetLink);
                        renderStudentSelector(accepted);
                    } else if (pending.length > 0) {
                        renderStudentSelector(accepted);
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
                        // (2026-07-13) Prompt Link Child modal immediately on empty snapshot; was delayed
                        if (!window.__securoParentLinkPromptShown) {
                            window.__securoParentLinkPromptShown = true;
                            document.getElementById('linkModal')?.classList.add('active');
                        }
                    }
                    updateGuardianNotifBadge();
                }, user.email);

                // (2026-07-13) Run profile reconciliation in background; prev: blocked links
                (async () => {
                    try {
                        guardianProfile = await getUserProfile(user.uid);
                        const currentAuthEmail = (user.email || '').toLowerCase().trim();
                        const profileEmailNorm = (guardianProfile?.email || '').toLowerCase().trim();

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
                        if (!guardianProfile || guardianProfile.role !== 'guardian') {
                            guardianProfile = { ...(guardianProfile || {}), uid: user.uid, role: 'guardian', email: user.email || guardianProfile?.email || '' };
                            await saveUserProfile(user.uid, {
                                name: guardianProfile.name || '',
                                email: user.email || guardianProfile.email || '',
                                role: 'guardian'
                            }).catch(() => {});
                        }
                        updateGuardianProfileUI(guardianProfile?.name);

                        // (2026-07-13) Simple Parent onboarding (photo + first/last name); was none
                        const gRawName = String(guardianProfile?.name || '').trim();
                        const gLower = gRawName.toLowerCase();
                        const gEmailPref = (user.email || '').split('@')[0].toLowerCase();
                        const hasRealGuardianName = Boolean(
                            gRawName && gRawName.length >= 2
                            && gLower !== 'guardian' && gLower !== 'parent' && gLower !== 'user'
                            && gLower !== gEmailPref
                        );
                        if (!hasRealGuardianName || guardianProfile?.onboardingCompleted === false) {
                            openParentProfileOnboarding(user, guardianProfile);
                        }

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
                    } catch (_) {}
                })();

                // (2026-07-13) Sync links in background without blocking map/UI; was awaited
                syncGuardianLinksForGuardian(user.uid, { email: user.email, name: user.name }).catch(() => {});
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

                    // (2026-07-13) Load child history in background; prev: blocking await
                    Promise.all(links.map(async (link) => {
                        const name = await resolveChildDisplayName(link);
                        let isInside = null;
                        let ts = null;
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
                            isOnline: false,
                            timestamp: ts
                        };
                    })).then((data) => {
                        linkedChildrenData = data;
                        updateGuardianTrackingChip();
                        setupChildStatusRotation();
                    }).catch(() => {});
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
                        const firstPending = pendingLinks[0];
                        const isChildInvite = firstPending.requestedBy === 'student';
                        document.getElementById('addStudentBtn').style.display = 'none';
                        // (2026-07-13) Match toast & copy to invite sender; was child approval
                        showToast(isChildInvite ? "You have a child link invitation." : "Waiting for child approval...");
                        setPendingGuardianState(firstPending);
                        document.getElementById('vaultEmpty').style.display = 'block';
                        document.getElementById('vaultEmpty').querySelector('h3').textContent = isChildInvite ? 'Accept invite to unlock Vault' : 'Vault unlocks after approval';
                        document.getElementById('vaultEmpty').querySelector('p').textContent = isChildInvite
                            ? 'Accept your child\'s invitation to view shared vault media here.'
                            : 'Your child needs to accept your invitation before shared vault media appears here.';
                        document.getElementById('alertsEmpty').style.display = 'block';
                        document.getElementById('alertsEmpty').querySelector('h3').textContent = isChildInvite ? 'Accept invite to view Safety feed' : 'Safety feed pending approval';
                        document.getElementById('alertsEmpty').querySelector('p').textContent = isChildInvite
                            ? 'Accept your child\'s invitation to receive emergency alerts and attendance updates.'
                            : 'Emergency alerts and attendance updates will appear after your child approves your request.';
                    } else {
                        setPendingGuardianState(null);
                        if (studentStatusCard) studentStatusCard.style.display = 'none';
                        document.getElementById('addStudentBtn').style.display = 'flex';
                        renderStudentSelector([]);
                        // (2026-07-13) Prompt each load while unlinked; prev: once per session
                        if (!window.__securoParentLinkPromptShown) {
                            window.__securoParentLinkPromptShown = true;
                            document.getElementById('linkModal')?.classList.add('active');
                        }
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

        // (2026-07-13) Mark guardian offline & clear storage on logout; was online
        document.getElementById('logoutBtn').onclick = async () => {
            const curUid = guardianProfile?.uid || auth.currentUser?.uid;
            if (typeof setGuardianWatchingPresence === 'function') await setGuardianWatchingPresence(false);
            if (curUid) await updateUserPresence(curUid, false).catch(() => {});
            await auth.signOut();
            localStorage.removeItem('securo_session_token');
            localStorage.removeItem('securo_user_role');
            sessionStorage.removeItem('securo_authenticated');
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

        // (2026-07-13) Close only; re-prompts on next load; prev: session dismiss flag
        const closeLinkModal = () => {
            document.getElementById('linkModal').classList.remove('active');
        };
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

            // (2026-07-13) Capture link fields before await; was null after snapshot
            const cancelledId = pendingGuardianLink.id;
            const cancelledSid = pendingGuardianLink.studentId;
            const cancelledUid = pendingGuardianLink.studentUid;
            const button = document.getElementById('cancelPendingRequestBtn');
            try {
                setButtonBusy(button, true);
                await removeGuardianLink(cancelledId, {
                    guardianId: auth.currentUser?.uid,
                    guardianEmail: auth.currentUser?.email,
                    studentId: cancelledSid,
                    studentUid: cancelledUid
                });
                pendingGuardianLink = null;
                window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => l.id !== cancelledId && (!cancelledSid || String(l.studentId) !== String(cancelledSid)) && (!cancelledUid || l.studentUid !== cancelledUid));
                try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                renderGuardianAllDropdownNotifications();
                const pendingCard = document.getElementById('pendingStateCard');
                if (pendingCard) {
                    pendingCard.classList.remove('active');
                    pendingCard.style.display = 'none';
                }
                const sidInput = document.getElementById('studentIdInput');
                if (sidInput) sidInput.value = '';
                showToast("Pending request cancelled.");
                const addBtn = document.getElementById('addStudentBtn');
                if (addBtn) addBtn.style.display = 'flex';
                const linkModalEl = document.getElementById('linkModal');
                if (linkModalEl) linkModalEl.classList.add('active');
                if (auth.currentUser) await initDashboard(auth.currentUser);
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

        // (2026-07-13) Dual-mode guardian GAD chat, alias, unread badge, delete & presence
        let _guardianNamedMsgs = [];
        let _guardianAnonMsgs = [];
        let _guardianNamedUnsub = null;
        let _guardianAnonUnsub = null;
        let _guardianAdminPresenceUnsub = null;
        let _guardianActiveChatMode = null; // 'named' | 'anonymous'

        const getGuardianThreadId = (uid, mode) => {
            const participant = mode === 'anonymous' ? `${uid}__anon` : uid;
            return [participant, "system_admin_securo"].sort().join("_");
        };
        const getGuardianReadTs = (tid) => parseInt(localStorage.getItem(`securo_msg_read_ts_${tid}`) || '0', 10) || 0;
        const setGuardianReadTs = (tid, ts = Date.now()) => {
            try { localStorage.setItem(`securo_msg_read_ts_${tid}`, String(ts)); } catch (_) {}
        };
        const getGuardianAnonAlias = (uid) => {
            if (!uid) return '';
            const local = (localStorage.getItem(`securo_anon_alias_${uid}`) || '').trim();
            return local || (guardianProfile?.anonAlias || '').trim();
        };
        const saveGuardianAnonAlias = async (uid, alias) => {
            const clean = String(alias || '').trim();
            if (!uid || !clean) return '';
            try { localStorage.setItem(`securo_anon_alias_${uid}`, clean); } catch (_) {}
            if (guardianProfile) guardianProfile.anonAlias = clean;
            try { await saveUserProfile(uid, { anonAlias: clean }); } catch (_) {}
            return clean;
        };
        const guardianMsgToMs = (val) => {
            if (!val) return 0;
            if (typeof val === 'number') return val;
            if (val.seconds) return val.seconds * 1000;
            if (typeof val.toDate === 'function') return val.toDate().getTime();
            const parsed = new Date(val).getTime();
            return Number.isNaN(parsed) ? 0 : parsed;
        };
        const countGuardianUnreadAdminMsgs = (msgs, tid, myUid) => {
            const lastRead = getGuardianReadTs(tid);
            return (msgs || []).filter((m) => {
                if (!m || m.deleted) return false;
                const isFromAdmin = m.senderRole === 'admin' || m.senderId === 'system_admin_securo' || (m.senderId && m.senderId !== myUid && m.senderUid !== myUid);
                if (!isFromAdmin) return false;
                const ts = guardianMsgToMs(m.timestamp) || guardianMsgToMs(m.localTime) || guardianMsgToMs(m.createdAt);
                return ts > lastRead;
            }).length;
        };

        function updateGuardianUnreadMsgBadges() {
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            if (!uid) return;
            const namedTid = getGuardianThreadId(uid, 'named');
            const anonTid = getGuardianThreadId(uid, 'anonymous');
            const overlay = document.getElementById('guardianChatOverlay');
            const chooser = document.getElementById('guardianModeChooser');
            const inActiveChat = Boolean(overlay?.classList.contains('active') && !chooser?.classList.contains('active'));
            if (inActiveChat && _guardianActiveChatMode === 'named') {
                setGuardianReadTs(namedTid, Date.now());
                markThreadMessagesSeen(namedTid, 'guardian').catch(() => {});
            } else if (inActiveChat && _guardianActiveChatMode === 'anonymous') {
                setGuardianReadTs(anonTid, Date.now());
                markThreadMessagesSeen(anonTid, 'guardian').catch(() => {});
            }
            const namedUnread = countGuardianUnreadAdminMsgs(_guardianNamedMsgs, namedTid, uid);
            const anonUnread = countGuardianUnreadAdminMsgs(_guardianAnonMsgs, anonTid, uid);
            const totalUnread = namedUnread + anonUnread;
            const headerBadge = document.getElementById('headerGuardianMsgBadge');
            const namedBadge = document.getElementById('guardianNamedUnreadBadge');
            const anonBadge = document.getElementById('guardianAnonUnreadBadge');
            if (headerBadge) {
                headerBadge.textContent = totalUnread > 99 ? '99+' : (totalUnread > 0 ? String(totalUnread) : '');
                headerBadge.classList.toggle('has-unread', totalUnread > 0);
            }
            if (namedBadge) {
                namedBadge.textContent = namedUnread > 0 ? String(namedUnread) : '';
                namedBadge.classList.toggle('has-unread', namedUnread > 0);
            }
            if (anonBadge) {
                anonBadge.textContent = anonUnread > 0 ? String(anonUnread) : '';
                anonBadge.classList.toggle('has-unread', anonUnread > 0);
            }
        }

        function updateGuardianAdminPresenceUI(isOnline) {
            const dot = document.getElementById('guardianAdminPresenceDot');
            const txt = document.getElementById('guardianAdminPresenceText');
            if (dot) dot.classList.toggle('is-online', !!isOnline);
            if (txt) txt.textContent = isOnline ? 'Online' : 'Offline';
        }

        function initGuardianMessagingWatchers(uid) {
            if (!uid) return;
            if (_guardianNamedUnsub) _guardianNamedUnsub();
            if (_guardianAnonUnsub) _guardianAnonUnsub();
            if (_guardianAdminPresenceUnsub) _guardianAdminPresenceUnsub();

            _guardianNamedUnsub = subscribeToMessagesByThread(getGuardianThreadId(uid, 'named'), (msgs) => {
                _guardianNamedMsgs = Array.isArray(msgs) ? msgs : [];
                updateGuardianUnreadMsgBadges();
                if (_guardianActiveChatMode === 'named') renderGuardianSupportMessages(_guardianNamedMsgs);
            });
            _guardianAnonUnsub = subscribeToMessagesByThread(getGuardianThreadId(uid, 'anonymous'), (msgs) => {
                _guardianAnonMsgs = Array.isArray(msgs) ? msgs : [];
                updateGuardianUnreadMsgBadges();
                if (_guardianActiveChatMode === 'anonymous') renderGuardianSupportMessages(_guardianAnonMsgs);
            });
            _guardianAdminPresenceUnsub = subscribeToAdminPresence(updateGuardianAdminPresenceUI);
        }

        function getGuardianSupportThreadState() {
            const adminId = "system_admin_securo";
            const uid = guardianProfile?.uid || auth.currentUser?.uid || "";
            const isAnon = _guardianActiveChatMode === 'anonymous';
            return {
                adminId,
                isAnonymous: isAnon,
                participantId: isAnon ? `${uid}__anon` : uid,
                threadId: getGuardianThreadId(uid, isAnon ? 'anonymous' : 'named')
            };
        }

        function renderGuardianSupportMessages(messages = []) {
            const container = document.getElementById('guardianChatMessages');
            if (!container) return;
            const myUid = guardianProfile?.uid || auth.currentUser?.uid || "";
            const isAnon = _guardianActiveChatMode === 'anonymous';
            const alias = getGuardianAnonAlias(myUid);
            const activeTid = myUid ? getGuardianThreadId(myUid, isAnon ? 'anonymous' : 'named') : '';

            container.innerHTML = '';
            const cleanMsgs = (messages || []).filter(m => m && !m.deleted);
            if (!cleanMsgs.length) {
                const greeting = isAnon
                    ? `Hello${alias ? ' ' + escapeHtml(alias) : ''}! You are messaging GAD anonymously. Your real name is hidden in this conversation.`
                    : 'Hello! You can message GAD support here anytime.';
                container.innerHTML = `<div class="chat-message received">${greeting}<span class="chat-time">Just now</span></div>`;
                return;
            }

            [...cleanMsgs]
                .sort((a, b) => {
                    const timeA = a.timestamp?.toDate?.() || new Date(a.localTime || 0);
                    const timeB = b.timestamp?.toDate?.() || new Date(b.localTime || 0);
                    return timeA - timeB;
                })
                .forEach((msg) => {
                    const isSent = msg.senderId === myUid || msg.senderUid === myUid;
                    const date = msg.timestamp?.toDate?.() || new Date(msg.localTime || Date.now());
                    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const row = document.createElement('div');
                    row.className = `guardian-msg-row ${isSent ? 'sent' : 'received'}`;
                    const item = document.createElement('div');
                    item.className = `chat-message ${isSent ? 'sent' : 'received'}`;
                    item.innerHTML = `${escapeHtml(msg.text || '')}<span class="chat-time">${timeStr}</span>`;
                    if (isSent && msg.id) {
                        const delBtn = document.createElement('button');
                        delBtn.type = 'button';
                        delBtn.className = 'gad-msg-del-btn';
                        delBtn.title = 'Delete message';
                        delBtn.setAttribute('aria-label', 'Delete message');
                        delBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
                        delBtn.addEventListener('click', async (ev) => {
                            ev.stopPropagation();
                            // (2026-07-13) Use styled modal for message delete; was window.confirm
                            if (!(await UI.showModal('Delete Message', 'Delete this message permanently?', { type: 'error', showCancel: true, confirmText: 'Delete' }))) return;
                            await deleteChatMessage(msg.id, activeTid);
                        });
                        row.appendChild(delBtn);
                    }
                    row.appendChild(item);
                    container.appendChild(row);
                });

            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }

        function showGuardianModeChooser() {
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            const realName = guardianProfile?.name || auth.currentUser?.displayName || 'Your Name';
            const savedAlias = getGuardianAnonAlias(uid);
            const namedLbl = document.getElementById('guardianNamedPreviewLabel');
            const anonLbl = document.getElementById('guardianAnonPreviewLabel');
            const chooser = document.getElementById('guardianModeChooser');
            const aliasPanel = document.getElementById('guardianAliasSetupPanel');
            const aliasErr = document.getElementById('guardianAliasError');
            const msgBox = document.getElementById('guardianChatMessages');
            const inputArea = document.getElementById('guardianChatInputArea');
            const switchBtn = document.getElementById('guardianSwitchModeBtn');
            const modeChip = document.getElementById('guardianActiveModeBadge');

            if (namedLbl) namedLbl.textContent = `Continue as ${realName}`;
            if (anonLbl) anonLbl.textContent = savedAlias ? `Continue as "${savedAlias}" (Alias)` : 'Choose a custom anonymous name';
            if (aliasPanel) aliasPanel.classList.remove('active');
            if (aliasErr) aliasErr.textContent = '';
            if (chooser) chooser.classList.add('active');
            if (msgBox) msgBox.style.display = 'none';
            if (inputArea) inputArea.style.display = 'none';
            if (switchBtn) switchBtn.classList.remove('visible');
            if (modeChip) modeChip.classList.remove('visible');
            guardianMessengerUI?.setChatHeaderState('chooser');
            updateGuardianUnreadMsgBadges();
        }

        function enterGuardianChatMode(mode) {
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            if (!uid) return;
            _guardianActiveChatMode = mode;
            const tid = getGuardianThreadId(uid, mode);
            currentGuardianSupportThreadId = tid;
            setGuardianReadTs(tid, Date.now());
            markThreadMessagesSeen(tid, 'guardian').catch(() => {});
            updateGuardianUnreadMsgBadges();

            const chooser = document.getElementById('guardianModeChooser');
            const aliasPanel = document.getElementById('guardianAliasSetupPanel');
            const msgBox = document.getElementById('guardianChatMessages');
            const inputArea = document.getElementById('guardianChatInputArea');
            const switchBtn = document.getElementById('guardianSwitchModeBtn');
            const modeChip = document.getElementById('guardianActiveModeBadge');

            if (chooser) chooser.classList.remove('active');
            if (aliasPanel) aliasPanel.classList.remove('active');
            if (msgBox) {
                msgBox.style.display = '';
                msgBox.classList.remove('gad-anim-in');
                void msgBox.offsetWidth;
                msgBox.classList.add('gad-anim-in');
            }
            if (inputArea) inputArea.style.display = '';
            if (switchBtn) switchBtn.classList.add('visible');
            if (modeChip) {
                const alias = getGuardianAnonAlias(uid);
                modeChip.textContent = mode === 'anonymous' ? `Alias: ${alias}` : 'Named';
                modeChip.classList.add('visible');
            }
            guardianMessengerUI?.setChatHeaderState(mode);
            renderGuardianSupportMessages(mode === 'anonymous' ? _guardianAnonMsgs : _guardianNamedMsgs);
            setTimeout(() => document.getElementById('guardianChatInput')?.focus(), 180);
        }

        function openGuardianSupportChat() {
            const overlay = document.getElementById('guardianChatOverlay');
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            if (!overlay || !uid) return;
            overlay.classList.add('active');
            if (!_guardianNamedUnsub || !_guardianAnonUnsub) initGuardianMessagingWatchers(uid);
            showGuardianModeChooser();
        }

        function closeGuardianSupportChat() {
            const overlay = document.getElementById('guardianChatOverlay');
            overlay?.classList.remove('active');
        }

        async function sendGuardianSupportMessage() {
            const input = document.getElementById('guardianChatInput');
            const text = input?.value?.trim();
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            if (!text || !uid) return;

            const supportState = getGuardianSupportThreadState();
            currentGuardianSupportThreadId = supportState.threadId;
            input.value = '';
            const isAnon = supportState.isAnonymous;
            const displayName = isAnon ? (getGuardianAnonAlias(uid) || 'Anonymous Parent') : (guardianProfile?.name || 'Parent');

            try {
                await sendChatMessage(uid, supportState.adminId, text, displayName, {
                    threadId: currentGuardianSupportThreadId,
                    supportMode: 'gad_support',
                    senderRole: 'guardian',
                    recipientRole: 'admin',
                    isAnonymous: isAnon,
                    anonymousAlias: isAnon ? displayName : '',
                    clientName: displayName,
                    senderLabel: displayName,
                    ownerId: uid
                });
                setGuardianReadTs(currentGuardianSupportThreadId, Date.now());
            } catch (error) {
                console.warn("Guardian support message failed:", error);
                showToast("Could not send your message right now.", "error");
            }
        }

        document.getElementById('guardianChooseNamedBtn')?.addEventListener('click', () => enterGuardianChatMode('named'));
        document.getElementById('guardianChooseAnonBtn')?.addEventListener('click', () => {
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            const savedAlias = getGuardianAnonAlias(uid);
            if (savedAlias) {
                enterGuardianChatMode('anonymous');
            } else {
                const aliasPanel = document.getElementById('guardianAliasSetupPanel');
                const aliasInput = document.getElementById('guardianAliasInput');
                if (aliasPanel) aliasPanel.classList.add('active');
                if (aliasInput) { aliasInput.value = ''; aliasInput.focus(); }
            }
        });
        document.getElementById('guardianSaveAliasBtn')?.addEventListener('click', async () => {
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            const aliasInput = document.getElementById('guardianAliasInput');
            const aliasErr = document.getElementById('guardianAliasError');
            const val = (aliasInput?.value || '').trim();
            if (val.length < 2) {
                if (aliasErr) aliasErr.textContent = 'Please enter a name (at least 2 characters).';
                return;
            }
            if (aliasErr) aliasErr.textContent = '';
            await saveGuardianAnonAlias(uid, val);
            enterGuardianChatMode('anonymous');
        });
        document.getElementById('guardianAliasInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); document.getElementById('guardianSaveAliasBtn')?.click(); }
        });
        document.getElementById('guardianSwitchModeBtn')?.addEventListener('click', showGuardianModeChooser);
        // (2026-07-13) Messenger-style header popup & top-left back button; was modal jump
        const guardianMessengerUI = initGadMessengerUI({
            role: 'parent',
            headerBtnId: 'headerGuardianMsgBtn',
            chatHeaderLeftSelector: '#guardianChatOverlay .chat-header > div:first-child',
            chatHeaderActionsSelector: '#guardianChatOverlay .gad-header-actions',
            getUid: () => guardianProfile?.uid || auth.currentUser?.uid,
            getRealName: () => guardianProfile?.name || auth.currentUser?.displayName || 'Parent',
            getAlias: (uid) => getGuardianAnonAlias(uid),
            saveAlias: (uid, val) => saveGuardianAnonAlias(uid, val),
            getUnreadCounts: () => ({
                named: Number(document.getElementById('guardianNamedUnreadBadge')?.textContent || 0) || 0,
                anon: Number(document.getElementById('guardianAnonUnreadBadge')?.textContent || 0) || 0
            }),
            isAdminOnline: () => Boolean(document.getElementById('guardianAdminPresenceDot')?.classList.contains('is-online')),
            openMode: (mode) => {
                const overlay = document.getElementById('guardianChatOverlay');
                const uid = guardianProfile?.uid || auth.currentUser?.uid;
                if (!overlay || !uid) return;
                overlay.classList.add('active');
                if (!_guardianNamedUnsub || !_guardianAnonUnsub) initGuardianMessagingWatchers(uid);
                enterGuardianChatMode(mode);
            },
            onBackToChooser: () => showGuardianModeChooser()
        });

        document.getElementById('headerGuardianMsgBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = guardianProfile?.uid || auth.currentUser?.uid;
            if (uid && (!_guardianNamedUnsub || !_guardianAnonUnsub)) initGuardianMessagingWatchers(uid);
            guardianMessengerUI.togglePopover(document.getElementById('headerGuardianMsgBtn'));
        });
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
        // (2026-07-13) Paint child chips synchronously & scroll active; was async wait
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

            // (2026-07-13) Show empty dashed chip when no children linked; was blank
            bar.innerHTML = '';
            if (!preliminary.length) {
                const emptyChip = document.createElement('div');
                emptyChip.className = 'selector-chip guardian-empty-child-chip';
                emptyChip.style.cssText = 'background:rgba(255,255,255,0.88); border:1px dashed rgba(244,63,94,0.32); color:#64748b; font-weight:600; display:inline-flex; align-items:center; gap:6px; cursor:pointer;';
                emptyChip.title = 'Tap to link a child';
                emptyChip.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; color:var(--primary);">family_restroom</span><span>No children linked yet</span>';
                emptyChip.onclick = () => document.getElementById('linkModal')?.classList.add('active');
                bar.appendChild(emptyChip);
                return;
            }

            const chipEntries = [];
            let activeChipEl = null;
            for (const link of preliminary) {
                const initialName = (link.studentName && String(link.studentName).trim())
                    || (link.studentId ? `Student ${link.studentId}` : 'Child');
                const chip = document.createElement('div');
                const isActive = activeLink?.id === link.id;
                chip.className = 'selector-chip' + (isActive ? ' active' : '');
                chip.dataset.linkId = link.id || '';
                chip.textContent = initialName;
                chip.title = `Hold to remove ${initialName}`;
                chip.style.userSelect = 'none';
                if (isActive) activeChipEl = chip;

                let displayNameRef = initialName;
                let holdTimer = null;
                let isLongPress = false;

                const startHold = () => {
                    isLongPress = false;
                    holdTimer = setTimeout(async () => {
                        isLongPress = true;
                        // (2026-07-13) Use styled modal for child removal; was native confirm
                        if (await UI.showModal('Remove Child', `Remove child ${displayNameRef}? You can link or invite them again anytime.`, { type: 'warning', showCancel: true, confirmText: 'Remove' })) {
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
                    selectStudent(link, displayNameRef);
                };
                bar.appendChild(chip);
                chipEntries.push({
                    link,
                    chip,
                    setName: (n) => {
                        displayNameRef = n;
                        chip.textContent = n;
                        chip.title = `Hold to remove ${n}`;
                    }
                });
            }

            if (activeChipEl && typeof activeChipEl.scrollIntoView === 'function') {
                activeChipEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
            }

            // Resolve generic/missing names in parallel without blocking initial paint
            Promise.all(chipEntries.map(async (entry) => {
                const raw = (entry.link.studentName || '').trim().toLowerCase();
                if (raw && !raw.startsWith('student') && raw !== 'child') return;
                const resolved = await resolveChildDisplayName(entry.link).catch(() => null);
                if (currentToken !== _renderStudentSelectorToken || !resolved) return;
                entry.setName(resolved);
            })).catch(() => {});
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
            // (2026-07-13) Clear previous child's SOS pin on switch; was lingering
            clearSosMarker();
            // (2026-07-13) Avoid redundant waiting alert card; was stacking on card
            renderLocationAlert("");
            document.getElementById('lastSeen').textContent = "Waiting for location...";
            document.getElementById('statusDot').style.background = 'var(--red)';
            startMonitoring(link.studentUid);
            loadSharedVault(link.studentUid, link.studentId, displayName);
        }

        // (2026-07-13) Real-time shared vault sync on parent visibility toggle; was one-shot
        let _sharedVaultUnsub = null;
        function renderSharedVaultPosts(posts) {
            const container = document.getElementById('sharedVaultGrid');
            const empty = document.getElementById('vaultEmpty');
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

            const formatTime12 = (d) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
            const formatDateShort = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

            if (!container) return;
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
        }

        async function loadSharedVault(studentUid, studentId = null, childName = null) {
            const loadToken = ++_vaultLoadToken;
            if (_sharedVaultUnsub) { try { _sharedVaultUnsub(); } catch (_) {} _sharedVaultUnsub = null; }
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
                renderSharedVaultPosts(posts);

                if (targetUid || targetSid) {
                    _sharedVaultUnsub = subscribeToGuardianSharedEmergencyPosts(targetUid, targetSid, (livePosts) => {
                        if (loadToken !== _vaultLoadToken) return;
                        renderSharedVaultPosts(livePosts);
                    });
                }
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

            // (2026-07-13) Chime immediately on linked child SOS press; was photo + 24h lock
            let _isInitialSosSnapshot = true;
            const alertedSosKey = `securo_guardian_alerted_sos_${studentUid}`;
            const alertedSosIds = new Set((() => {
                try { return JSON.parse(localStorage.getItem(alertedSosKey) || '[]'); } catch (_) { return []; }
            })());
            const markAlertedSosId = (id) => {
                if (!id) return;
                alertedSosIds.add(id);
                try { localStorage.setItem(alertedSosKey, JSON.stringify(Array.from(alertedSosIds).slice(-50))); } catch (_) {}
            };

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
                const isFirstBatch = _isInitialSosSnapshot;
                _isInitialSosSnapshot = false;

                if (activeAlerts.length > 0) {
                    const alert = activeAlerts[0];
                    const alertTsMs = alert.timestamp?.toDate?.()?.getTime?.() || (alert.timestamp?.seconds ? alert.timestamp.seconds * 1000 : new Date(alert.timestamp || 0).getTime());
                    const alertKey = String(alert.id || `${studentUid}_${alertTsMs || 'active'}`);
                    const sName = document.getElementById('activeStudentName')?.textContent?.trim() || activeLink?.studentName || alert.userName || alert.studentName || 'Your child';
                    const sTime = alert.timestamp?.toDate?.() ? alert.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now';
                    const sLoc = alert.location?.address || (alert.location?.lat ? `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}` : 'Campus Grounds');
                    const sType = (alert.emergencyType || 'SOS Emergency').toUpperCase();

                    if (!alertedSosIds.has(alertKey)) {
                        markAlertedSosId(alertKey);
                        const isRecentPress = !alertTsMs || (Date.now() - alertTsMs) <= 120000;
                        if (!isFirstBatch || isRecentPress) {
                            triggerDevicePushNotification(`SOS Alert: ${sName}`, `${sName} pressed SOS at ${sLoc}. Tap to view location.`, { urgent: true, type: 'sos' });
                            showGuardianRealtimePrompt(`SOS Alert: ${sName}`, `${sName} pressed the SOS button at ${sLoc}.`);
                        }
                    }
                    if (text) {
                        text.innerHTML = `<strong>${sName}</strong> · <strong>Status:</strong> ${alert.status?.toUpperCase() || 'ACTIVE'}<br><strong>Time:</strong> ${sTime} · <strong>Type:</strong> ${sType}<br><strong>Location:</strong> ${sLoc}`;
                    }
                    // (2026-07-13) Render static SOS pin & jump on click; was pan without pin
                    renderSosLocationPin(alert);
                    const btn = document.getElementById('viewSosLocationBtn');
                    const hasValidSosCoords = typeof alert.location?.lat === 'number' && typeof alert.location?.lng === 'number' && !(alert.location.lat === 0 && alert.location.lng === 0);
                    if (btn && hasValidSosCoords) {
                        btn.onclick = () => {
                            window.focusGuardianSosLocation(alert.location.lat, alert.location.lng, sLoc, sTime);
                        };
                    }
                    if (card) card.style.display = 'block';
                    updateGuardianNotifBadge();
                } else {
                    clearSosMarker();
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
                // (2026-07-13) Hide campus banner & alert when offline; was stale green
                renderLocationAlert("");
                const offlineChild = linkedChildrenData.find(c => c.id === activeLink.studentUid);
                if (offlineChild) offlineChild.isOnline = false;
                updateGuardianTrackingChip();
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
                    // (2026-07-13) Mark online & alert only on boolean change; was null fire
                    currentChild.isOnline = true;
                    currentChild.isInside = isInside;
                    currentChild.timestamp = loc.updatedAt?.toDate ? loc.updatedAt.toDate().getTime() : Date.now();
                    updateGuardianTrackingChip();
                    if (typeof prevInside === 'boolean' && prevInside !== isInside) {
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
                // (2026-07-13) Keep live tracking blocked outside campus; note SOS pin
                const hasSosPin = !!(activeSosAlert?.location?.lat && activeSosAlert?.location?.lng && !(activeSosAlert.location.lat === 0 && activeSosAlert.location.lng === 0));
                document.getElementById('lastSeen').innerHTML = hasSosPin
                    ? `<span style="color:#d11f34; font-weight:700;">Outside Campus</span> · Live tracking paused · SOS location pinned`
                    : `<span style="color:#d11f34; font-weight:700;">Outside Campus</span> · Tracking paused (Privacy)`;
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
                const hasCoordinates = !!(typeof log.location?.lat === 'number' && typeof log.location?.lng === 'number' && !(log.location.lat === 0 && log.location.lng === 0));
                const safeLocAttr = escapeHtml(locText).replace(/'/g, '&#39;');
                const safeTimeAttr = escapeHtml(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })).replace(/'/g, '&#39;');

                // (2026-07-13) Focus static SOS pin via module helper; was broken onclick
                return `
                    <div class="alert-item ${isSOS ? 'alert-item-sos' : ''}" style="${isSOS ? 'background:rgba(255,235,238,0.7); border:1px solid rgba(239,68,68,0.25);' + (hasCoordinates ? ' cursor:pointer;' : '') : ''}" ${isSOS && hasCoordinates ? `onclick="window.focusGuardianSosLocation(${log.location.lat}, ${log.location.lng}, '${safeLocAttr}', '${safeTimeAttr}')"` : ''}>
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

        // (2026-07-13) Fallback to auth uid for guardian post like; was profile only
        function renderPost(post) {
            const feed = document.getElementById('gadPostsFeed');
            const activeUid = guardianProfile?.uid || auth.currentUser?.uid || "";
            const likeCount = typeof post.likes === "number" ? post.likes : (Array.isArray(post.likedBy) ? post.likedBy.length : 0);
            const isLiked = !!(activeUid && Array.isArray(post.likedBy) && post.likedBy.includes(activeUid));
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

        // (2026-07-13) Fallback to auth uid & guard result on like; was profile only
        document.getElementById('gadPostsFeed').addEventListener("click", async (event) => {
            const likeButton = event.target.closest("[data-like-post]");
            const activeUid = guardianProfile?.uid || auth.currentUser?.uid || "";
            if (!likeButton || !activeUid) return;

            const postId = likeButton.dataset.likePost;
            const postIndex = currentGadPosts.findIndex((post) => String(post.id) === String(postId));
            if (postIndex < 0) return;

            try {
                if (String(postId).startsWith("fallback-")) {
                    const post = currentGadPosts[postIndex];
                    const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
                    const likedIndex = likedBy.indexOf(activeUid);
                    if (likedIndex >= 0) likedBy.splice(likedIndex, 1);
                    else likedBy.push(activeUid);
                    currentGadPosts[postIndex] = { ...post, likedBy, likes: likedBy.length };
                } else {
                    const result = await toggleLikeGADPost(postId, activeUid);
                    const existingLikedBy = Array.isArray(currentGadPosts[postIndex].likedBy) ? currentGadPosts[postIndex].likedBy : [];
                    const nextLiked = !!result?.isLiked;
                    const nextLikedBy = nextLiked
                        ? Array.from(new Set([...existingLikedBy, activeUid]))
                        : existingLikedBy.filter(id => id !== activeUid);
                    currentGadPosts[postIndex] = {
                        ...currentGadPosts[postIndex],
                        likes: typeof result?.likes === "number" ? result.likes : nextLikedBy.length,
                        likedBy: nextLikedBy
                    };
                }

                document.getElementById('gadPostsFeed').innerHTML = "";
                currentGadPosts.forEach(post => renderPost(post));
            } catch (error) {
                console.warn("Like toggle failed:", error);
            }
        });

        function showToast(msg, type = 'success') {
            // (2026-07-13) Queue toast until active modal closes; was showing under modal
            if (typeof isAnyGuardianModalOpen === 'function' && isAnyGuardianModalOpen()) {
                waitForGuardianModalsClosed(() => showToast(msg, type));
                return;
            }
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
        // (2026-07-13) Pre-show dashboard & map if cached session; prev: waited on auth
        try {
            const initReqView = new URLSearchParams(window.location.search).get('view');
            if (initReqView !== 'auth' && (localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated'))) {
                window.switchParentMode('dashboard');
                initMap();
                if (map) requestAnimationFrame(() => map.invalidateSize(false));
            }
        } catch (_) {}

        // (2026-07-13) Keep logged-in guardian on dashboard even on Back; was ?view=auth
        const lockGuardianHistory = () => {
            try {
                if (window.location.search.includes('view=auth')) {
                    window.history.replaceState({ securoLocked: true }, '', 'parent.html');
                }
                window.history.pushState({ securoLocked: true }, '', window.location.href);
            } catch (_) { }
        };

        onAuthStateChanged(auth, (user) => {
            const reqView = new URLSearchParams(window.location.search).get('view');
            // (2026-07-13) Broadcast live guardian presence heartbeat; was partial
            if (user) {
                if (reqView === 'auth') {
                    try { window.history.replaceState({ securoLocked: true }, '', 'parent.html'); } catch (_) { }
                }
                lockGuardianHistory();
                window.switchParentMode('dashboard');
                initDashboard(user);
                startUserPresenceHeartbeat(user.uid);
                // (2026-07-13) Start live GAD unread & admin presence watchers; was modal only
                initGuardianMessagingWatchers(user.uid);
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
                if (e.data?.type === 'guardian_link_created' || e.data?.type === 'guardian_link_updated' || e.data?.type === 'guardian_link_removed' || e.data?.type === 'guardian_link_responded') {
                    if (e.data?.type === 'guardian_link_removed') {
                        const delSet = new Set([e.data.linkId, ...(e.data.deletedIds || [])].filter(Boolean).map(String));
                        window._guardianPendingLinks = (window._guardianPendingLinks || []).filter(l => !delSet.has(String(l?.id || '')));
                        try { localStorage.setItem('securo_guardian_pending_links', JSON.stringify(window._guardianPendingLinks)); } catch (_) {}
                        renderGuardianAllDropdownNotifications();
                    }
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
        // (2026-07-13) Prevent browser Back button from logging out parent; was popstate
        window.addEventListener('popstate', () => {
            handleGuardianUniversalBackClose();
            if (auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1') {
                try {
                    if (window.location.search.includes('view=auth')) {
                        window.history.replaceState({ securoLocked: true }, '', 'parent.html');
                    }
                    window.history.pushState({ securoLocked: true }, '', window.location.href);
                    window.switchParentMode('dashboard');
                } catch (_) { }
            }
        });
        window.addEventListener('pageshow', (e) => {
            if (e.persisted && (auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1')) {
                lockGuardianHistory();
                window.switchParentMode('dashboard');
            }
        });

        // (2026-07-13) Simple Parent onboarding modal (photo + first/last name); was none
        function openParentProfileOnboarding(user, existingProfile = null) {
            if (!user?.uid || document.getElementById('parentProfileOnboardingModal')) return;
            const modal = document.createElement('div');
            modal.id = 'parentProfileOnboardingModal';
            modal.style.cssText = 'position:fixed;inset:0;z-index:10040;background:rgba(23,20,40,0.65);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:Outfit,system-ui,sans-serif;';
            const existingPhoto = existingProfile?.photoURL || existingProfile?.avatar || '';
            modal.innerHTML = `
                <div style="width:100%;max-width:380px;background:#ffffff;border-radius:26px;padding:28px 24px 24px;box-shadow:0 24px 60px rgba(23,20,40,0.28);text-align:center;">
                    <h3 style="margin:0 0 6px;font-family:Sora,sans-serif;font-size:1.3rem;font-weight:800;color:#181428;">Complete Your Profile</h3>
                    <p style="margin:0 0 18px;font-size:0.86rem;color:#64748b;line-height:1.45;">Add your name and an optional profile photo so your child can recognize you.</p>
                    <label for="parentOnboardPhotoInput" style="display:inline-flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;margin-bottom:18px;">
                        <div id="parentOnboardAvatarPreview" style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#ffe4e9,#fecdd6);border:2px dashed #f43f5e;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#e11d48;">
                            ${existingPhoto ? `<img src="${existingPhoto}" style="width:100%;height:100%;object-fit:cover;">` : '<span class="material-symbols-outlined" style="font-size:34px;">add_a_photo</span>'}
                        </div>
                        <span style="font-size:0.78rem;font-weight:700;color:#e11d48;">Upload Profile Photo (Optional)</span>
                        <input type="file" id="parentOnboardPhotoInput" accept="image/*" style="display:none;">
                    </label>
                    <div style="display:flex;flex-direction:column;gap:12px;text-align:left;margin-bottom:14px;">
                        <div>
                            <label for="parentOnboardFirstName" style="display:block;font-size:0.78rem;font-weight:700;color:#334155;margin-bottom:5px;">First Name</label>
                            <input type="text" id="parentOnboardFirstName" placeholder="e.g. Maria" autocomplete="given-name" style="width:100%;height:46px;padding:0 14px;border-radius:13px;border:1.5px solid #e2e8f0;font-size:0.92rem;font-family:inherit;outline:none;box-sizing:border-box;">
                        </div>
                        <div>
                            <label for="parentOnboardLastName" style="display:block;font-size:0.78rem;font-weight:700;color:#334155;margin-bottom:5px;">Last Name</label>
                            <input type="text" id="parentOnboardLastName" placeholder="e.g. Santos" autocomplete="family-name" style="width:100%;height:46px;padding:0 14px;border-radius:13px;border:1.5px solid #e2e8f0;font-size:0.92rem;font-family:inherit;outline:none;box-sizing:border-box;">
                        </div>
                    </div>
                    <div id="parentOnboardError" style="min-height:18px;font-size:0.78rem;font-weight:600;color:#dc2626;margin-bottom:10px;"></div>
                    <button type="button" id="parentOnboardSaveBtn" style="width:100%;height:48px;border:none;border-radius:14px;background:linear-gradient(135deg,#f43f5e,#e11d48);color:#ffffff;font-family:inherit;font-size:0.95rem;font-weight:700;cursor:pointer;box-shadow:0 10px 22px rgba(225,29,72,0.28);">Save & Continue</button>
                </div>
            `;
            document.body.appendChild(modal);

            let selectedPhotoDataUrl = existingPhoto;
            const photoInput = modal.querySelector('#parentOnboardPhotoInput');
            const avatarPreview = modal.querySelector('#parentOnboardAvatarPreview');
            const firstInput = modal.querySelector('#parentOnboardFirstName');
            const lastInput = modal.querySelector('#parentOnboardLastName');
            const errEl = modal.querySelector('#parentOnboardError');
            const saveBtn = modal.querySelector('#parentOnboardSaveBtn');

            if (photoInput) {
                photoInput.addEventListener('change', (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const size = 240;
                            canvas.width = size;
                            canvas.height = size;
                            const ctx = canvas.getContext('2d');
                            const minSide = Math.min(img.width, img.height);
                            const sx = (img.width - minSide) / 2;
                            const sy = (img.height - minSide) / 2;
                            ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
                            selectedPhotoDataUrl = canvas.toDataURL('image/jpeg', 0.82);
                            if (avatarPreview) avatarPreview.innerHTML = `<img src="${selectedPhotoDataUrl}" style="width:100%;height:100%;object-fit:cover;">`;
                        };
                        img.src = reader.result;
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    const first = (firstInput?.value || '').trim();
                    const last = (lastInput?.value || '').trim();
                    if (first.length < 2 || last.length < 2) {
                        if (errEl) errEl.textContent = 'Please enter both your first name and last name.';
                        return;
                    }
                    if (errEl) errEl.textContent = '';
                    const fullName = `${first} ${last}`;
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Saving...';
                    try {
                        const payload = {
                            name: fullName,
                            firstName: first,
                            lastName: last,
                            email: user.email || existingProfile?.email || '',
                            role: 'guardian',
                            onboardingCompleted: true,
                            ...(selectedPhotoDataUrl ? { photoURL: selectedPhotoDataUrl, avatar: selectedPhotoDataUrl } : {})
                        };
                        await saveUserProfile(user.uid, payload);
                        guardianProfile = { ...(guardianProfile || {}), ...payload, uid: user.uid };
                        sessionStorage.removeItem('securo_just_registered');
                        updateGuardianProfileUI(fullName);
                        modal.remove();
                        showToast('Profile Saved', `Welcome, ${fullName}!`, 'success');
                    } catch (err) {
                        if (errEl) errEl.textContent = err?.message || 'Could not save profile. Please try again.';
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Save & Continue';
                    }
                });
            }
        }
