// (2026-07-13) Consolidated public & landing JS; was per-page inline scripts
import { auth } from '../js/firebase-config.js';
import { getEmergencyPostById, getUserProfile, saveUserProfile, saveUserDirectoryMarker, isStudentIdTaken, getEmailByStudentId, saveAdminUserPassword, findStudentUidByStudentId, getLinksForStudent, sendAccountNotification, updateUserProfile, getAllLinksForGuardian, getAllUsers, getStudentBootstrapProfile, createGuardianLinkFromStudent, findUserByEmail, removeGuardianLink, deleteCurrentUserAccount } from '../js/db.js';
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { Logger, Validation, UI, Permissions, Format, Storage, Network, Device } from '../js/utils.js';
import { login, signUp, checkAuth, forgotPassword, roleIdToEmail, getPreferredAuthRole, getFriendlyAuthMessage, logout } from '../js/auth.js';
import '../js/install-sw.js';

// (2026-07-13) Use root-absolute .html dashboard paths in native APK; was relative
function isNativeCapacitorApk() {
    return Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
        window.location.protocol.startsWith('capacitor:') ||
        !!window.cordova;
}

function getRoleDashboardUrl(roleOverride) {
    const role = (roleOverride || localStorage.getItem('securo_user_role') || localStorage.getItem('securo_preferred_role') || 'student').toLowerCase();
    const isRoot = document.body?.dataset?.page === 'landing';
    const p = isNativeCapacitorApk() ? '/' : (isRoot ? '' : '../');
    if (role === 'admin') return p + 'admin/admin.html';
    if (role === 'guardian' || role === 'parent') return p + 'parent/parent.html';
    if (role === 'staff') return p + 'staff/staff.html';
    return p + 'student/student.html';
}
window.getRoleDashboardUrl = getRoleDashboardUrl;

window.goBack = function () {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        const isRoot = document.body?.dataset?.page === 'landing';
        window.location.href = isRoot ? 'index.html' : '../index.html';
    }
};

const PAGE_CONTROLLERS = {
    'landing': async function () {
        (function () {
            const isNativeApk = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
                window.location.protocol.startsWith('capacitor:') ||
                !!window.cordova;
            if (isNativeApk) {
                const isLoggedIn = Boolean(localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1');
                // (2026-07-13) Use root-absolute path in native APK; was relative
                window.location.replace(isLoggedIn ? getRoleDashboardUrl() : '/public/role-selection.html');
            }
        })();

        // (2026-07-13) Use Vite-resolved landing image URLs; was relative strings
        const _landingImgs = (typeof window !== 'undefined' && window.__SECURO_LANDING_IMAGES) || {};
        const PREVIEWS = {
            map: {
                src: _landingImgs.map || '/assets/images/student_map.png',
                text: 'Parent Watching Active: Mommy Mafe Ramil'
            },
            sos: {
                src: _landingImgs.sos || '/assets/images/student_sos.png',
                text: 'SOS Armed: 5-Second Cancel Countdown'
            },
            vault: {
                src: _landingImgs.vault || '/assets/images/student_vault.png',
                text: 'Evidence Vault: Encrypted Locker'
            },
            attendance: {
                src: _landingImgs.attendance || '/assets/images/student_attendance.png',
                text: 'Campus Geofence: Ingress / Egress Logged'
            },
            gad: {
                src: _landingImgs.gad || '/assets/images/student_gad.png',
                text: 'GAD Desk: Real-Time Confidential Chat'
            },
            guardian: {
                src: _landingImgs.guardian || '/assets/images/guardian_dashboard.png',
                text: 'Guardian View: Real-Time Child Radar'
            }
        };

        function switchPreview(key, buttonEl) {
            const data = PREVIEWS[key];
            if (!data) return;

            // Update pills
            document.querySelectorAll('.trailer-pill').forEach(btn => btn.classList.remove('active'));
            if (buttonEl) buttonEl.classList.add('active');

            // Smooth image transition
            const img = document.getElementById('previewScreenImg');
            const pillText = document.getElementById('previewStatusText');

            if (img) {
                img.style.opacity = '0.3';
                img.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    img.src = data.src;
                    img.style.opacity = '1';
                    img.style.transform = 'scale(1)';
                }, 180);
            }

            if (pillText) {
                pillText.textContent = data.text;
            }
        }

        // (2026-07-13) Incremental slow smooth scroll; was default browser scroll
        let scrollAnimationId = null;
        function slowScrollTo(targetY) {
            if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
            const startY = window.pageYOffset || document.documentElement.scrollTop;
            const distance = targetY - startY;
            if (Math.abs(distance) < 2) return;
            const duration = Math.min(2200, Math.max(1000, Math.abs(distance) * 0.7));
            const startTime = performance.now();
            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
            function step(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                window.scrollTo(0, startY + (distance * easeInOutCubic(progress)));
                if (progress < 1) {
                    scrollAnimationId = requestAnimationFrame(step);
                } else {
                    scrollAnimationId = null;
                }
            }
            scrollAnimationId = requestAnimationFrame(step);
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    const navHeight = 84;
                    const targetPosition = Math.max(0, targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight);
                    // (2026-07-13) Trigger slow incremental smooth scroll; was missing call
                    slowScrollTo(targetPosition);
                    if (history.replaceState) {
                        history.replaceState(null, null, targetId);
                    }
                }
            });
        });

        // (2026-07-13) Mobile nav accordion toggle & active sync; was no mobile nav
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileNavAccordion = document.getElementById('mobileNavAccordion');
        const mobileNavIcon = document.getElementById('mobileNavIcon');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

        if (mobileNavToggle && mobileNavAccordion) {
            mobileNavToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = mobileNavAccordion.classList.toggle('open');
                if (mobileNavIcon) mobileNavIcon.textContent = isOpen ? 'close' : 'menu';
                mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
            });

            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileNavAccordion.classList.remove('open');
                    if (mobileNavIcon) mobileNavIcon.textContent = 'menu';
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                });
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar-main')) {
                    mobileNavAccordion.classList.remove('open');
                    if (mobileNavIcon) mobileNavIcon.textContent = 'menu';
                    mobileNavToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // (2026-07-13) Sync active nav link on scroll; was unmonitored scroll
        const landingSections = document.querySelectorAll('section[id], header[id]');
        const landingNavLinks = document.querySelectorAll('.nav-links a');
        function updateActiveNav() {
            let currentSec = '#hero';
            const scrollPos = window.pageYOffset + 140;
            const nearBottom = (window.innerHeight + window.pageYOffset) >= (document.documentElement.scrollHeight - 60);
            // (2026-07-13) Bottom scroll target is about-us; was roles
            if (nearBottom) {
                currentSec = '#about-us';
            } else {
                landingSections.forEach(sec => {
                    const top = sec.offsetTop;
                    const height = sec.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        currentSec = '#' + sec.getAttribute('id');
                    }
                });
            }
            landingNavLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === currentSec);
            });
            mobileNavLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === currentSec);
            });
        }
        window.addEventListener('scroll', updateActiveNav, { passive: true });
        updateActiveNav();

        /* (2026-07-13) Load Securo animation when entering portals; was direct href */
        function enterPortal(url, role) {
            if (role) {
                localStorage.setItem('securo_preferred_role', role);
                sessionStorage.setItem('securo_from_role_selection', '1');
            }
            if (window.showSecuroPreloader) {
                window.showSecuroPreloader(url);
            } else {
                window.location.href = url;
            }
        }
        if (typeof enterPortal === 'function') window.enterPortal = enterPortal;
        if (typeof switchPreview === 'function') window.switchPreview = switchPreview;
    },
    'about': async function () {
        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);
    },
    'terms': async function () {
        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '../index.html';
            }
        }
        if (typeof goBack === 'function') window.goBack = goBack;
    },
    'hotlines': async function () {
        let toastTimer = null;

        function copyHotline(rawNumber, btnElement) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(rawNumber).then(() => {
                    handleSuccess(rawNumber, btnElement);
                }).catch(() => {
                    execFallbackCopy(rawNumber, btnElement);
                });
            } else {
                execFallbackCopy(rawNumber, btnElement);
            }
        }

        function execFallbackCopy(text, btnElement) {
            const input = document.createElement('input');
            input.value = text;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            try {
                document.execCommand('copy');
                handleSuccess(text, btnElement);
            } catch (err) {
                console.warn('Clipboard copy failed:', err);
            }
            document.body.removeChild(input);
        }

        function handleSuccess(numberStr, btn) {
            const indicator = btn.querySelector('.copy-pill-indicator');
            const originalHtml = indicator ? indicator.innerHTML : 'Copy';
            btn.classList.add('copied');
            if (indicator) {
                indicator.innerHTML = '<span class="material-symbols-outlined" style="font-size:13px;">check_circle</span> Copied!';
            }

            const toast = document.getElementById('hotlineToast');
            const toastMsg = document.getElementById('toastMsg');
            if (toast && toastMsg) {
                toastMsg.textContent = `Copied ${numberStr} to clipboard`;
                toast.classList.add('show');
                clearTimeout(toastTimer);
                toastTimer = setTimeout(() => {
                    toast.classList.remove('show');
                }, 2200);
            }

            setTimeout(() => {
                btn.classList.remove('copied');
                if (indicator) indicator.innerHTML = originalHtml;
            }, 1800);
        }
        if (typeof copyHotline === 'function') window.copyHotline = copyHotline;
    },
    'incident': async function () {
        const ADMIN_STUDENT_ID = '12312312';
        const toastStack = document.getElementById('toastStack');
        const incidentTitle = document.getElementById('incidentTitle');
        const incidentCopy = document.getElementById('incidentCopy');
        const incidentId = document.getElementById('incidentId');
        const incidentUser = document.getElementById('incidentUser');
        const incidentTime = document.getElementById('incidentTime');
        const incidentStatus = document.getElementById('incidentStatus');
        const incidentLocation = document.getElementById('incidentLocation');
        const attachmentGrid = document.getElementById('attachmentGrid');

        const params = new URLSearchParams(window.location.search);
        const reportId = params.get('id');

        const showToast = (title, message, type = 'info') => {
            const icon = type === 'error' ? 'error' : 'info';
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
            window.setTimeout(() => toast.remove(), 3200);
        };

        function formatCreatedAt(value) {
            const date = value?.toDate?.() || (value ? new Date(value) : null);
            return date?.toLocaleString?.([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) || 'Unknown time';
        }

        function renderAttachments(attachments) {
            if (!attachments.length) {
                attachmentGrid.innerHTML = '<div class="empty-state">No attachments available for this incident.</div>';
                return;
            }

            attachmentGrid.innerHTML = attachments.map((attachment) => `
                <article class="attachment-card">
                    ${attachment.kind === 'image' ? `<img src="${attachment.src}" alt="${attachment.label || 'Incident image'}">` : ''}
                    ${attachment.kind === 'video' ? `<video src="${attachment.src}" controls preload="metadata"></video>` : ''}
                    ${attachment.kind === 'audio' ? `<audio src="${attachment.src}" controls preload="metadata"></audio>` : ''}
                    <div class="attachment-copy">
                        <strong>${attachment.label || 'Attachment'}</strong>
                        <span>${attachment.kind === 'video' ? 'Video evidence' : attachment.kind === 'audio' ? 'Audio evidence' : 'Image evidence'}</span>
                    </div>
                </article>
            `).join('');
        }

        async function loadIncidentReport() {
            if (!reportId) {
                incidentTitle.textContent = 'Report not found';
                incidentCopy.textContent = 'This incident link is missing a report id.';
                attachmentGrid.innerHTML = '<div class="empty-state">No report id was provided.</div>';
                return;
            }

            const report = await getEmergencyPostById(reportId);
            if (!report) {
                incidentTitle.textContent = 'Report not found';
                incidentCopy.textContent = 'We could not find a matching incident report.';
                attachmentGrid.innerHTML = '<div class="empty-state">This incident may have been removed or never synced.</div>';
                return;
            }

            incidentTitle.textContent = `${report.userName || 'Guardian User'} Incident Report`;
            incidentCopy.textContent = `Review report ${report.id} and all submitted emergency evidence.`;
            incidentId.textContent = report.id || '--';
            incidentUser.textContent = report.studentId ? `${report.userName || 'Guardian User'} · ID ${report.studentId}` : (report.userName || 'Guardian User');
            incidentTime.textContent = formatCreatedAt(report.createdAt);
            incidentStatus.textContent = report.status || 'Posted';
            incidentLocation.textContent = report.location?.address || 'Location unavailable';
            renderAttachments(report.attachments || []);
        }

        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                showToast("Access denied", "Please sign in before opening incident reports.", "error");
                window.setTimeout(() => {
                    window.location.href = '../public/login.html';
                }, 900);
                return;
            }

            try {
                const profile = await getUserProfile(user.uid);
                const studentId = profile?.studentId || (user.email?.match(/^student\.(\d{8})@securo\.app$/)?.[1] || '');
                if (studentId !== ADMIN_STUDENT_ID) {
                    showToast("Access denied", "Only student ID 12312312 can open incident reports.", "error");
                    window.setTimeout(() => {
                        window.location.href = '../admin/admin.html';
                    }, 900);
                    return;
                }

                await loadIncidentReport();
            } catch (error) {
                // (2026-10-07) Replace console.error with Logger; was bare console.error
                Logger.error("IncidentReport", "Incident report load failed", error);
                showToast("Load failed", error.message || "Unable to open the incident report right now.", "error");
            }
        });

        // (2026-10-07) Wire Print Dossier and Export JSON buttons; were orphaned
        let _cachedReport = null;

        const _origLoad = loadIncidentReport;
        // Patch loadIncidentReport to cache the loaded report for export
        loadIncidentReport = async function () {
            if (!reportId) {
                incidentTitle.textContent = 'Report not found';
                incidentCopy.textContent = 'This incident link is missing a report id.';
                attachmentGrid.innerHTML = '<div class="empty-state">No report id was provided.</div>';
                return;
            }
            const report = await getEmergencyPostById(reportId);
            if (!report) {
                incidentTitle.textContent = 'Report not found';
                incidentCopy.textContent = 'We could not find a matching incident report.';
                attachmentGrid.innerHTML = '<div class="empty-state">This incident may have been removed or never synced.</div>';
                return;
            }
            _cachedReport = report;
            incidentTitle.textContent = `${report.userName || 'Guardian User'} Incident Report`;
            incidentCopy.textContent = `Review report ${report.id} and all submitted emergency evidence.`;
            incidentId.textContent = report.id || '--';
            incidentUser.textContent = report.studentId ? `${report.userName || 'Guardian User'} · ID ${report.studentId}` : (report.userName || 'Guardian User');
            incidentTime.textContent = formatCreatedAt(report.createdAt);
            incidentStatus.textContent = report.status || 'Posted';
            incidentLocation.textContent = report.location?.address || 'Location unavailable';
            renderAttachments(report.attachments || []);
        };

        document.getElementById('btnPrintOfficialReport')?.addEventListener('click', () => {
            window.print();
        });

        document.getElementById('btnExportOfficialJson')?.addEventListener('click', () => {
            if (!_cachedReport) {
                showToast('Not Ready', 'Report data is still loading. Please wait a moment.', 'error');
                return;
            }
            const exportData = {
                reportId: _cachedReport.id || reportId,
                user: incidentUser.textContent,
                timestamp: incidentTime.textContent,
                status: incidentStatus.textContent,
                location: incidentLocation.textContent,
                attachments: (_cachedReport.attachments || []).map(a => ({
                    label: a.label || 'Attachment',
                    kind: a.kind || 'unknown',
                    src: a.src || ''
                })),
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `incident_report_${_cachedReport.id || reportId || Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Exported', 'Incident report downloaded as JSON.', 'info');
        });
    },
    'role-selection': async function () {
        /* (2026-07-13) Store preferred and user role; was preferred role only */
        function selectRole(role) {
            localStorage.setItem('securo_preferred_role', role);
            localStorage.setItem('securo_user_role', role);
            sessionStorage.setItem('securo_from_role_selection', '1');
            const target = (role === 'student' || role === 'staff') ? '../public/login.html' : '../parent/parent.html?view=auth';
            if (window.showSecuroPreloader) {
                window.showSecuroPreloader(target);
            } else {
                window.location.href = target;
            }
        }

        // (2026-07-13) Keep logged-in users out of role-selection on Back; was open
        const bounceIfAlreadySignedIn = () => {
            const hasSession = Boolean(auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1');
            if (hasSession) {
                window.location.replace(getRoleDashboardUrl());
                return true;
            }
            return false;
        };
        if (bounceIfAlreadySignedIn()) return;
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) bounceIfAlreadySignedIn();
        });
        checkAuth(false);

        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);
        if (typeof selectRole === 'function') window.selectRole = selectRole;
    },
    'login': async function () {
        // (2026-07-13) Import student password reset helpers from db; was basic
        // (2026-07-13) Fix install-sw path to js/ folder; was broken root path

        // (2026-07-13) Bounce logged-in users back to portal on Back; was showing login
        sessionStorage.removeItem('securo_from_role_selection');
        const bounceLoggedInFromLogin = () => {
            const inOnboarding = document.getElementById('onboardingModal')?.classList.contains('active');
            const isRegistering = sessionStorage.getItem('securo_signup_in_progress') === '1';
            if (inOnboarding || isRegistering) return false;
            const hasSession = Boolean(auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1');
            if (hasSession && sessionStorage.getItem('securo_login_pending') !== '1' && sessionStorage.getItem('securo_just_registered') !== '1') {
                window.location.replace(getRoleDashboardUrl());
                return true;
            }
            return false;
        };
        if (bounceLoggedInFromLogin()) return;
        window.addEventListener('pageshow', (e) => {
            if (e.persisted) bounceLoggedInFromLogin();
        });
        checkAuth(false);

        // (2026-07-13) Always start on login first; prev: auto-redirect permissions

        const mainAuthForm = document.getElementById('mainAuthForm');
        const loginTab = document.getElementById('loginTab');
        const signupTab = document.getElementById('signupTab');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const errorMsg = document.getElementById('errorMsg');
        const profileModal = document.getElementById('profileModal');
        const toastStack = document.getElementById('toastStack');
        const identifierInput = document.getElementById('identifier');
        const signupIdInput = document.getElementById('studentIdSignup');
        const modalStudentIdInput = document.getElementById('modalStudentId');
        const LOCAL_USERS_KEY = 'securo_users_local';
        const preferredRole = getPreferredAuthRole();
        const isStaffRole = preferredRole === 'staff';

        // Onboarding Screen Elements
        const onboardingModal = document.getElementById('onboardingModal');
        const onboardingForm = document.getElementById('onboardingForm');
        const onboardingFirstName = document.getElementById('onboardingFirstName');
        const onboardingLastName = document.getElementById('onboardingLastName');
        const onboardingYear = document.getElementById('onboardingYear');
        const onboardingSection = document.getElementById('onboardingSection');
        const onboardingAvatarInitials = document.getElementById('onboardingAvatarInitials');
        const onboardingAvatarImg = document.getElementById('onboardingAvatarImg');
        const onboardingTakeCamBtn = document.getElementById('onboardingTakeCamBtn');
        const onboardingChooseGalleryBtn = document.getElementById('onboardingChooseGalleryBtn');
        const onboardingRemovePhotoBtn = document.getElementById('onboardingRemovePhotoBtn');
        const onboardingGalleryInput = document.getElementById('onboardingGalleryInput');
        const onboardingCameraStage = document.getElementById('onboardingCameraStage');
        const onboardingCameraVideo = document.getElementById('onboardingCameraVideo');
        const onboardingCancelCamBtn = document.getElementById('onboardingCancelCamBtn');
        const onboardingSnapCamBtn = document.getElementById('onboardingSnapCamBtn');
        const onboardingFlipCamBtn = document.getElementById('onboardingFlipCamBtn');
        const onboardingCanvas = document.getElementById('onboardingCanvas');
        const onboardingErrorMsg = document.getElementById('onboardingErrorMsg');
        const onboardingSubmitBtn = document.getElementById('onboardingSubmitBtn');

        // (2026-07-13) OTP-like jump to section & backspace to year; prev: no navigation
        if (onboardingYear) {
            onboardingYear.addEventListener('focus', () => onboardingYear.select());
            onboardingYear.addEventListener('keydown', (e) => {
                if (/^[1-5]$/.test(e.key)) {
                    onboardingYear.value = e.key;
                    e.preventDefault();
                    if (onboardingSection) {
                        onboardingSection.focus();
                        onboardingSection.select();
                    }
                }
            });
            onboardingYear.addEventListener('input', () => {
                onboardingYear.value = onboardingYear.value.replace(/[^1-5]/g, '').slice(0, 1);
                if (onboardingYear.value && onboardingSection) {
                    onboardingSection.focus();
                    onboardingSection.select();
                }
            });
        }

        if (onboardingSection) {
            onboardingSection.addEventListener('input', () => {
                onboardingSection.value = onboardingSection.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
            });
            onboardingSection.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && (!onboardingSection.value || (onboardingSection.selectionStart === 0 && onboardingSection.selectionEnd === 0))) {
                    if (onboardingYear) {
                        onboardingYear.focus();
                        onboardingYear.select();
                    }
                }
            });
        }

        let onboardingUserContext = null;
        let onboardingPhotoData = '';
        let cameraStream = null;
        let currentFacingMode = 'user';

        const saveLocalUserDirectoryEntry = (userId, profile) => {
            try {
                const raw = localStorage.getItem(LOCAL_USERS_KEY);
                const users = raw ? JSON.parse(raw) : [];
                const safeUsers = Array.isArray(users) ? users : [];
                const nextUser = {
                    id: userId,
                    ...profile,
                    updatedAt: new Date().toISOString(),
                    isLocalFallback: true
                };
                const existingIndex = safeUsers.findIndex((user) => String(user.id) === String(userId));
                if (existingIndex >= 0) {
                    safeUsers[existingIndex] = { ...safeUsers[existingIndex], ...nextUser };
                } else {
                    safeUsers.unshift(nextUser);
                }
                localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(safeUsers));
            } catch (error) {
                console.warn('Failed to save local user directory entry:', error);
            }
        };

        let isLoginMode = true;

        const loginTitle = document.querySelector('.brand-name');
        const subtitle = document.getElementById('brandSubtitle');
        const identifierLabel = document.getElementById('identifierLabel');
        const signupIdLabel = document.getElementById('signupIdLabel');

        const roleLabel = isStaffRole ? 'Staff' : 'Student';

        function setButtonBusy(button, isBusy = true) {
            if (!button) return;
            button.classList.toggle('is-busy', isBusy);
            button.disabled = isBusy;
        }

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
            window.setTimeout(() => {
                toast.remove();
            }, 3200);
        };

        const normalizeStudentIdInput = (input) => {
            if (!input) return;
            input.addEventListener('input', () => {
                input.value = input.value.replace(/\D/g, '').slice(0, 7);
            });
        };

        [identifierInput, signupIdInput, modalStudentIdInput].forEach(normalizeStudentIdInput);

        // Toggle between Login and Signup (Date: 2026-05-01)
        const setMode = (mode) => {
            isLoginMode = mode === 'login';
            loginTab.classList.toggle('active', isLoginMode);
            signupTab.classList.toggle('active', !isLoginMode);

            // (2026-07-13) Set all signup fields required in signup mode; was optional
            document.querySelectorAll('.signup-only').forEach(el => {
                el.style.display = isLoginMode ? 'none' : 'block';
                const field = el.querySelector('input');
                if (field) {
                    if (isLoginMode) {
                        field.removeAttribute('required');
                    } else {
                        field.setAttribute('required', 'required');
                    }
                }
            });

            document.getElementById('identifierGroup').style.display = isLoginMode ? 'block' : 'none';
            if (isLoginMode) {
                document.getElementById('identifier').setAttribute('required', 'required');
            } else {
                document.getElementById('identifier').removeAttribute('required');
            }
            document.getElementById('forgotPassword').style.display = isLoginMode ? 'inline' : 'none';
            btnText.textContent = isLoginMode ? `Enter ${roleLabel} Hub` : `Register ${roleLabel} Account`;
            errorMsg.textContent = '';
            // (2026-07-13) Enforce required email in register mode; was not required attr
            const signupEmailEl = document.getElementById('studentEmailSignup');
            if (signupEmailEl) signupEmailEl.required = !isLoginMode;
            // (2026-07-13) Clear register inputs on mode switch; was unmanaged inputs
            if (!isLoginMode) {
                if (signupIdInput) signupIdInput.value = '';
                if (signupEmailEl) signupEmailEl.value = '';
                const pwd = document.getElementById('password');
                if (pwd) pwd.value = '';
                const cpwd = document.getElementById('confirmPasswordSignup');
                if (cpwd) cpwd.value = '';
            }
        };

        // (2026-07-13) Apply blue staff theme on html and body; was html inline var only
        document.documentElement.classList.toggle('role-staff', isStaffRole);
        document.body.classList.toggle('role-staff', isStaffRole);
        if (isStaffRole) {
            document.documentElement.style.setProperty('--primary', '#2563eb');
            document.documentElement.style.setProperty('--primary-strong', '#1d4ed8');
            document.documentElement.style.setProperty('--primary-soft', '#eff6ff');
            document.body.style.setProperty('--primary', '#2563eb');
            document.body.style.setProperty('--primary-strong', '#1d4ed8');
            document.body.style.setProperty('--primary-soft', '#eff6ff');
        }
        if (localStorage.getItem('securo_terms_agreed') === 'true') {
            const termsBox = document.getElementById('termsCheckbox');
            if (termsBox) termsBox.checked = true;
        }

        if (loginTitle) loginTitle.textContent = isStaffRole ? 'Securo Staff' : 'Securo';
        if (subtitle) subtitle.textContent = isStaffRole ? 'Staff access portal' : 'Student access portal';
        if (identifierLabel) identifierLabel.textContent = `${roleLabel} ID Number`;
        if (signupIdLabel) signupIdLabel.textContent = `${roleLabel} ID Number`;
        // (2026-07-13) Set descriptive ID placeholders; was cleared to empty string
        if (signupIdInput) signupIdInput.placeholder = `Enter 7-digit ${roleLabel} ID`;
        if (identifierInput) identifierInput.placeholder = `Enter 7-digit ${roleLabel} ID`;

        loginTab.addEventListener('click', () => setMode('login'));
        signupTab.addEventListener('click', () => setMode('signup'));

        // (2026-07-13) Initialize login mode on boot to clear hidden required; was uncalled
        const authUrlParams = new URLSearchParams(window.location.search);
        if (authUrlParams.get('mode') === 'register' || window.location.hash === '#register') {
            setMode('signup');
        } else {
            setMode('login');
        }

        // (2026-07-13) 3-step OTP reset to student or linked parent email; was link
        const studentResetModal = document.getElementById('studentResetModal');
        const studentResetIdInput = document.getElementById('studentResetIdInput');
        const studentResetError = document.getElementById('studentResetError');
        const studentResetSendBtn = document.getElementById('studentResetSendBtn');
        const studentRequestAdminResetBtn = document.getElementById('studentRequestAdminResetBtn');
        const studentResetFormView = document.getElementById('studentResetFormView');
        const studentResetOtpView = document.getElementById('studentResetOtpView');
        const studentResetNewPwdView = document.getElementById('studentResetNewPwdView');
        const studentResetTargetEmail = document.getElementById('studentResetTargetEmail');
        const studentResetRecipientHint = document.getElementById('studentResetRecipientHint');
        const studentResetOtpInput = document.getElementById('studentResetOtpInput');
        const studentResetOtpError = document.getElementById('studentResetOtpError');
        const studentResetVerifyOtpBtn = document.getElementById('studentResetVerifyOtpBtn');
        const studentResetResendOtpBtn = document.getElementById('studentResetResendOtpBtn');
        const studentResetNewPwdInput = document.getElementById('studentResetNewPwdInput');
        const studentResetConfirmPwdInput = document.getElementById('studentResetConfirmPwdInput');
        const studentResetNewPwdError = document.getElementById('studentResetNewPwdError');
        const studentResetSavePwdBtn = document.getElementById('studentResetSavePwdBtn');
        const closeStudentResetModalBtn = document.getElementById('closeStudentResetModalBtn');

        let pendingStudentReset = null;

        function maskStudentEmail(email) {
            if (!email || !email.includes('@')) return email;
            const [name, domain] = email.split('@');
            if (name.length <= 2) return `${name[0]}*@${domain}`;
            const stars = '*'.repeat(Math.max(name.length - 2, 3));
            return `${name[0]}${stars}${name[name.length - 1]}@${domain}`;
        }

        function isRealEmail(em) {
            const v = String(em || '').trim().toLowerCase();
            return Boolean(v && v.includes('@') && v.includes('.') && !v.endsWith('@securo.app'));
        }

        const showResetStep = (step) => {
            if (studentResetFormView) studentResetFormView.style.display = step === 1 ? 'block' : 'none';
            if (studentResetOtpView) studentResetOtpView.style.display = step === 2 ? 'block' : 'none';
            if (studentResetNewPwdView) studentResetNewPwdView.style.display = step === 3 ? 'block' : 'none';
        };

        const openStudentResetModal = () => {
            if (!studentResetModal) return;
            pendingStudentReset = null;
            const currentId = identifierInput.value.trim().replace(/\D/g, '');
            if (studentResetIdInput) studentResetIdInput.value = currentId;
            if (studentResetError) studentResetError.textContent = '';
            if (studentResetOtpError) studentResetOtpError.textContent = '';
            if (studentResetNewPwdError) studentResetNewPwdError.textContent = '';
            if (studentResetOtpInput) studentResetOtpInput.value = '';
            if (studentResetNewPwdInput) studentResetNewPwdInput.value = '';
            if (studentResetConfirmPwdInput) studentResetConfirmPwdInput.value = '';
            showResetStep(1);
            studentResetModal.classList.add('active');
            setTimeout(() => studentResetIdInput?.focus(), 150);
        };

        const closeStudentResetModal = () => {
            if (studentResetModal) studentResetModal.classList.remove('active');
        };

        closeStudentResetModalBtn?.addEventListener('click', closeStudentResetModal);

        document.getElementById('forgotPassword').addEventListener('click', (e) => {
            e.preventDefault();
            openStudentResetModal();
        });

        async function dispatchStudentOtp(sid, triggerBtn) {
            if (studentResetError) studentResetError.textContent = '';
            if (studentResetOtpError) studentResetOtpError.textContent = '';
            if (!/^\d{7}$/.test(sid)) {
                if (studentResetError) studentResetError.textContent = 'Please enter a valid 7-digit Student ID.';
                return;
            }

            setButtonBusy(triggerBtn, true);
            try {
                const studentRec = await findStudentUidByStudentId(sid).catch(() => null);
                const directEmail = await getEmailByStudentId(sid).catch(() => null);

                if (!studentRec && !directEmail) {
                    if (studentResetError) studentResetError.textContent = `No registered student account found for ID #${sid}.`;
                    return;
                }

                const studentUid = studentRec?.uid || studentRec?.id || '';
                const studentName = studentRec?.name || `Student #${sid}`;
                const studentAuthEmail = studentRec?.authEmail || (studentRec?.email && studentRec.email.includes('@') ? studentRec.email : (directEmail || roleIdToEmail(sid, 'student')));

                // (2026-07-13) Send OTP to student email, or linked parent if none; was sid reversed
                let recipientEmail = isRealEmail(studentRec?.email) ? studentRec.email.trim() : (isRealEmail(studentRec?.recoveryEmail) ? studentRec.recoveryEmail.trim() : (isRealEmail(directEmail) ? directEmail.trim() : ''));
                let isParentRecipient = false;
                let linkedParentUid = '';

                // Fallback to linked parent's email if student has no registered email
                if (!recipientEmail) {
                    const links = await getLinksForStudent(sid, studentUid).catch(() => []);
                    const orderedLinks = [
                        ...(links || []).filter(l => l.status === 'accepted'),
                        ...(links || []).filter(l => l.status !== 'accepted')
                    ];
                    for (const link of orderedLinks) {
                        const gUid = link.guardianId || link.guardianUid || '';
                        if (isRealEmail(link.guardianEmail)) {
                            recipientEmail = link.guardianEmail.trim();
                            isParentRecipient = true;
                            linkedParentUid = gUid;
                            break;
                        }
                        if (gUid) {
                            const gProf = await getUserProfile(gUid).catch(() => null);
                            if (isRealEmail(gProf?.email)) {
                                recipientEmail = gProf.email.trim();
                                isParentRecipient = true;
                                linkedParentUid = gUid;
                                break;
                            }
                        }
                    }
                    if (!recipientEmail) {
                        try {
                            const rawDir = localStorage.getItem('securo_user_directory');
                            if (rawDir) {
                                const dir = JSON.parse(rawDir);
                                for (const u of Object.values(dir)) {
                                    if ((u.role === 'guardian' || u.role === 'parent') && isRealEmail(u.email)) {
                                        if (String(u.linkedStudentId || '') === String(sid) || String(u.wardStudentId || '') === String(sid)) {
                                            recipientEmail = u.email.trim();
                                            isParentRecipient = true;
                                            linkedParentUid = u.uid || '';
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (_) { }
                    }
                }

                if (!recipientEmail) {
                    if (studentResetError) {
                        studentResetError.textContent = `No registered email or linked parent email found for Student #${sid}. Please request an admin reset below.`;
                    }
                    return;
                }

                const otpCode = String(Math.floor(100000 + Math.random() * 900000));
                pendingStudentReset = {
                    code: otpCode,
                    expiresAt: Date.now() + 10 * 60 * 1000,
                    sid,
                    studentUid,
                    studentName,
                    studentAuthEmail,
                    recipientEmail,
                    isParentRecipient,
                    linkedParentUid
                };

                const subject = isParentRecipient
                    ? `Securo Alert: Your Child (${studentName} - #${sid}) Is Changing Their Password`
                    : 'Securo Student Password Reset Verification Code (OTP)';
                const bodyMsg = isParentRecipient
                    ? `Hello Parent/Guardian,\n\nThis email notifies you that your child ${studentName} (Student ID: ${sid}) is changing their Securo account password.\n\nVerification OTP Code: ${otpCode}\n\nThis code expires in 10 minutes. Share this code only if you authorized your child's password change.`
                    : `Hello ${studentName},\n\nYour Securo password reset verification OTP code is: ${otpCode}\n\nThis code expires in 10 minutes.`;

                // Dispatch OTP email via FormSubmit AJAX with bounded timeout
                try {
                    const ctrl = new AbortController();
                    const tId = setTimeout(() => ctrl.abort(), 8000);
                    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                        body: JSON.stringify({ _subject: subject, _captcha: 'false', message: bodyMsg }),
                        signal: ctrl.signal
                    }).catch(() => null);
                    clearTimeout(tId);
                } catch (_) { }

                // Notify linked parent inside Guardian Dashboard as well when parent receives OTP
                if (isParentRecipient && linkedParentUid) {
                    sendAccountNotification({
                        userId: linkedParentUid,
                        recipientUid: linkedParentUid,
                        type: 'child_password_reset_otp',
                        title: 'Child Password Change Alert',
                        message: `Your child ${studentName} (#${sid}) is changing their password. OTP Code: ${otpCode}`,
                        relatedId: sid,
                        sourceUserId: studentUid || sid,
                        sourceName: studentName,
                        priority: 'high'
                    }).catch(() => { });
                }

                if (studentResetTargetEmail) studentResetTargetEmail.textContent = maskStudentEmail(recipientEmail);
                if (studentResetRecipientHint) {
                    studentResetRecipientHint.textContent = isParentRecipient
                        ? 'No student email on file. An OTP and password-change alert have been sent to your linked parent email:'
                        : 'A 6-digit OTP verification code has been sent to your registered email:';
                }
                showResetStep(2);
                showToast('OTP Sent', isParentRecipient ? 'OTP and alert sent to your linked parent email.' : 'OTP code sent to your registered email.', 'success');
                setTimeout(() => studentResetOtpInput?.focus(), 120);
            } catch (err) {
                console.warn('Student OTP dispatch failed:', err);
                if (studentResetError) studentResetError.textContent = err?.message || 'Could not send OTP. Please try again.';
            } finally {
                setButtonBusy(triggerBtn, false);
            }
        }

        studentResetSendBtn?.addEventListener('click', () => {
            const sid = studentResetIdInput.value.trim().replace(/\D/g, '');
            dispatchStudentOtp(sid, studentResetSendBtn);
        });

        studentResetResendOtpBtn?.addEventListener('click', () => {
            if (!pendingStudentReset?.sid) return;
            dispatchStudentOtp(pendingStudentReset.sid, studentResetResendOtpBtn);
        });

        studentResetVerifyOtpBtn?.addEventListener('click', () => {
            if (studentResetOtpError) studentResetOtpError.textContent = '';
            const entered = (studentResetOtpInput?.value || '').trim().replace(/\D/g, '');
            if (!pendingStudentReset) {
                if (studentResetOtpError) studentResetOtpError.textContent = 'Session expired. Please request a new OTP.';
                return;
            }
            if (Date.now() > pendingStudentReset.expiresAt) {
                if (studentResetOtpError) studentResetOtpError.textContent = 'OTP code has expired. Please click Resend OTP.';
                return;
            }
            if (entered.length !== 6 || entered !== pendingStudentReset.code) {
                if (studentResetOtpError) studentResetOtpError.textContent = 'Invalid OTP code. Please check the email and try again.';
                return;
            }
            showResetStep(3);
            setTimeout(() => studentResetNewPwdInput?.focus(), 120);
        });

        studentResetSavePwdBtn?.addEventListener('click', async () => {
            if (studentResetNewPwdError) studentResetNewPwdError.textContent = '';
            const newPwd = studentResetNewPwdInput?.value || '';
            const confirmPwd = studentResetConfirmPwdInput?.value || '';
            if (newPwd.length < 8) {
                if (studentResetNewPwdError) studentResetNewPwdError.textContent = 'Password must be at least 8 characters.';
                return;
            }
            if (newPwd !== confirmPwd) {
                if (studentResetNewPwdError) studentResetNewPwdError.textContent = 'New password and confirm password do not match.';
                return;
            }
            if (!pendingStudentReset) {
                if (studentResetNewPwdError) studentResetNewPwdError.textContent = 'Reset session expired. Please start again.';
                return;
            }

            setButtonBusy(studentResetSavePwdBtn, true);
            try {
                const { sid, studentUid, studentAuthEmail, recipientEmail, isParentRecipient } = pendingStudentReset;
                await saveAdminUserPassword(studentUid, studentAuthEmail, newPwd);
                if (!isParentRecipient && recipientEmail && recipientEmail.toLowerCase() !== studentAuthEmail.toLowerCase()) {
                    await saveAdminUserPassword(studentUid, recipientEmail, newPwd);
                }

                const loggedIn = await login(sid, newPwd, 'student');
                if (loggedIn?.uid) {
                    localStorage.setItem('securo_session_token', loggedIn.uid);
                    localStorage.setItem('securo_user_role', 'student');
                    sessionStorage.setItem('securo_authenticated', '1');
                }
                closeStudentResetModal();
                showToast('Password Updated', 'Signing you in with your new password...', 'success');
                // (2026-07-13) Replace history on password reset login; was href push
                setTimeout(() => { window.location.replace(getRoleDashboardUrl('student')); }, 500);
            } catch (err) {
                console.warn('Student password update failed:', err);
                if (studentResetNewPwdError) studentResetNewPwdError.textContent = err?.message || 'Could not update password. Please try again.';
            } finally {
                setButtonBusy(studentResetSavePwdBtn, false);
            }
        });

        studentRequestAdminResetBtn?.addEventListener('click', async () => {
            const sid = studentResetIdInput.value.trim().replace(/\D/g, '') || identifierInput.value.trim().replace(/\D/g, '');
            if (!/^\d{7}$/.test(sid)) {
                studentResetError.textContent = 'Please enter your 7-digit Student ID first.';
                return;
            }
            setButtonBusy(studentRequestAdminResetBtn, true);
            try {
                await sendAccountNotification({
                    userId: 'admin',
                    recipientUid: 'admin',
                    type: 'password_reset_request',
                    title: 'Student Password Reset Request',
                    message: `Student #${sid} requested a password reset from the login screen.`,
                    relatedId: sid,
                    sourceUserId: sid,
                    sourceName: `Student #${sid}`,
                    priority: 'high'
                });
                showToast('Request Dispatched', `Campus Command Desk notified for Student #${sid}.`, 'success');
                closeStudentResetModal();
            } catch (e) {
                showToast('Notification sent', 'Admin notified for assistance.', 'info');
                closeStudentResetModal();
            } finally {
                setButtonBusy(studentRequestAdminResetBtn, false);
            }
        });

        // (2026-07-13) Add password eye toggle; was password input without toggle
        const togglePasswordBtn = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');
        togglePasswordBtn?.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });
        const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
        const confirmPasswordInput = document.getElementById('confirmPasswordSignup');
        toggleConfirmPasswordBtn?.addEventListener('click', () => {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            toggleConfirmPasswordBtn.querySelector('span').textContent = type === 'password' ? 'visibility' : 'visibility_off';
        });

        // Dynamic Onboarding Avatar Initials sync
        function updateOnboardingInitials() {
            const fn = onboardingFirstName.value.trim();
            const ln = onboardingLastName.value.trim();
            let initials = '';
            if (fn && ln) {
                initials = (fn[0] + ln[0]).toUpperCase();
            } else if (fn) {
                initials = fn.slice(0, 2).toUpperCase();
            } else if (ln) {
                initials = ln.slice(0, 2).toUpperCase();
            } else {
                initials = roleLabel === 'Staff' ? 'SF' : 'ST';
            }
            onboardingAvatarInitials.textContent = initials;
        }

        onboardingFirstName.addEventListener('input', updateOnboardingInitials);
        onboardingLastName.addEventListener('input', updateOnboardingInitials);

        function setOnboardingPhoto(dataUrl) {
            onboardingPhotoData = dataUrl || '';
            if (dataUrl) {
                onboardingAvatarImg.src = dataUrl;
                onboardingAvatarImg.style.display = 'block';
                onboardingAvatarInitials.style.display = 'none';
                onboardingRemovePhotoBtn.style.display = 'inline-flex';
            } else {
                onboardingAvatarImg.src = '';
                onboardingAvatarImg.style.display = 'none';
                onboardingAvatarInitials.style.display = 'block';
                onboardingRemovePhotoBtn.style.display = 'none';
            }
        }

        onboardingRemovePhotoBtn.addEventListener('click', () => {
            setOnboardingPhoto('');
            showToast("Photo cleared", "Your name initials will be used as your avatar.", "info");
        });

        // Gallery File Selection
        onboardingChooseGalleryBtn.addEventListener('click', () => {
            stopOnboardingCamera();
            onboardingGalleryInput.click();
        });

        onboardingGalleryInput.addEventListener('change', () => {
            const file = onboardingGalleryInput.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                setOnboardingPhoto(e.target?.result);
                showToast("Photo loaded", "Profile picture selected from gallery.", "success");
            };
            reader.readAsDataURL(file);
        });

        // Live Camera Capture Logic
        async function startOnboardingCamera() {
            try {
                stopOnboardingCamera();
                cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: currentFacingMode, width: { ideal: 640 }, height: { ideal: 640 } },
                    audio: false
                });
                onboardingCameraVideo.srcObject = cameraStream;
                onboardingCameraStage.style.display = 'flex';
            } catch (err) {
                console.warn("Camera access failed:", err);
                showToast("Camera error", "Could not access device camera. You can upload from gallery instead.", "error");
            }
        }

        function stopOnboardingCamera() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
            }
            if (onboardingCameraVideo) onboardingCameraVideo.srcObject = null;
            if (onboardingCameraStage) onboardingCameraStage.style.display = 'none';
        }

        onboardingTakeCamBtn.addEventListener('click', () => {
            startOnboardingCamera();
        });

        onboardingCancelCamBtn.addEventListener('click', () => {
            stopOnboardingCamera();
        });

        onboardingFlipCamBtn.addEventListener('click', () => {
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            startOnboardingCamera();
        });

        onboardingSnapCamBtn.addEventListener('click', () => {
            if (!cameraStream || !onboardingCameraVideo.videoWidth) return;
            const size = Math.min(onboardingCameraVideo.videoWidth, onboardingCameraVideo.videoHeight);
            onboardingCanvas.width = 400;
            onboardingCanvas.height = 400;
            const ctx = onboardingCanvas.getContext('2d');
            const sx = (onboardingCameraVideo.videoWidth - size) / 2;
            const sy = (onboardingCameraVideo.videoHeight - size) / 2;
            ctx.drawImage(onboardingCameraVideo, sx, sy, size, size, 0, 0, 400, 400);
            const dataUrl = onboardingCanvas.toDataURL('image/jpeg', 0.88);
            setOnboardingPhoto(dataUrl);
            stopOnboardingCamera();
            showToast("Photo captured", "Profile picture updated from camera.", "success");
        });

        // (2026-07-13) Show Department & hide Section for staff onboarding; was hidden
        function openOnboardingModal(userContext) {
            onboardingUserContext = userContext;
            onboardingErrorMsg.textContent = '';
            const isStaff = (userContext?.role || preferredRole) === 'staff';
            const yearSecGroup = document.getElementById('onboardingYearSectionGroup');
            const deptGroup = document.getElementById('onboardingDepartmentGroup');
            if (yearSecGroup) yearSecGroup.style.display = isStaff ? 'none' : 'block';
            if (deptGroup) deptGroup.style.display = isStaff ? 'block' : 'none';
            if (onboardingYear) onboardingYear.required = !isStaff;
            if (onboardingSection) onboardingSection.required = !isStaff;
            const subtitleEl = document.querySelector('#onboardingModal .onboarding-subtitle');
            if (subtitleEl) {
                subtitleEl.textContent = isStaff
                    ? 'Complete your staff profile to access your campus dashboard and safety tools.'
                    : 'Complete your student identity to access your campus dashboard and safety tools.';
            }
            updateOnboardingInitials();
            onboardingModal.classList.add('active');
            onboardingFirstName.focus();
        }

        // Onboarding Form Submit
        onboardingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            onboardingErrorMsg.textContent = '';
            const firstName = onboardingFirstName.value.trim();
            const lastName = onboardingLastName.value.trim();

            if (firstName.length < 2) {
                onboardingErrorMsg.textContent = "Please enter your valid first name.";
                return;
            }
            if (lastName.length < 2) {
                onboardingErrorMsg.textContent = "Please enter your valid last name.";
                return;
            }

            // (2026-07-13) Save staff department with empty section; was section Staff
            const isStaff = (onboardingUserContext?.role || preferredRole) === 'staff';
            const department = isStaff ? (document.getElementById('onboardingDepartment')?.value?.trim() || '') : '';
            let section = '';
            if (!isStaff) {
                const year = onboardingYear.value.trim();
                const sectionLetter = onboardingSection.value.trim().toUpperCase();
                if (!/^[1-5]$/.test(year)) {
                    onboardingErrorMsg.textContent = "Year level must be a number from 1 to 5.";
                    return;
                }
                if (sectionLetter.length < 1 || sectionLetter.length > 4) {
                    onboardingErrorMsg.textContent = "Section must be 1–4 letters (e.g. A, BSIT).";
                    return;
                }
                section = `${year}-${sectionLetter}`;
            }

            const fullName = `${firstName} ${lastName}`;
            const initials = (firstName[0] + lastName[0]).toUpperCase();
            setButtonBusy(onboardingSubmitBtn, true);

            try {
                const uid = onboardingUserContext?.uid || auth.currentUser?.uid;
                const studentId = onboardingUserContext?.studentId || '';
                // (2026-07-13) Keep recovery email separate from authEmail; was overwriting
                const rawEmail = onboardingUserContext?.email ?? '';
                const email = rawEmail && !rawEmail.endsWith('@securo.app') ? rawEmail : '';
                const authEmail = auth.currentUser?.email || roleIdToEmail(studentId, preferredRole);
                const role = onboardingUserContext?.role || preferredRole;

                const profilePayload = {
                    studentId,
                    firstName,
                    lastName,
                    name: fullName,
                    initials,
                    section,
                    department,
                    photoURL: onboardingPhotoData || '',
                    avatar: onboardingPhotoData || '',
                    email,
                    recoveryEmail: email,
                    authEmail,
                    role,
                    onboardingCompleted: true,
                    updatedAt: new Date().toISOString()
                };

                saveLocalUserDirectoryEntry(uid, profilePayload);
                await saveUserProfile(uid, profilePayload);
                await saveUserDirectoryMarker(uid, profilePayload);
                try { localStorage.setItem('securo_user_role', role); } catch (_) { }

                stopOnboardingCamera();
                setButtonBusy(onboardingSubmitBtn, false);

                // Only show guardian invite for student role (not staff/admin)
                if (role === 'student') {
                    showGuardianInviteModal(studentId, firstName);
                } else {
                    showToast("Profile ready", `Welcome, ${firstName}! Entering your Securo Hub...`, "success");
                    window.setTimeout(() => { window.location.href = getRoleDashboardUrl(role); }, 700);
                }
            } catch (err) {
                console.warn("Onboarding save failed:", err);
                onboardingErrorMsg.textContent = "Failed to save profile. Please try again.";
                setButtonBusy(onboardingSubmitBtn, false);
            }
        });

        // Guardian Invite Modal Logic
        const guardianInviteModal = document.getElementById('guardianInviteModal');
        const guardianInviteLinkEl = document.getElementById('guardianInviteLink');
        const copyGuardianLinkBtn = document.getElementById('copyGuardianLinkBtn');
        const copyBtnText = document.getElementById('copyBtnText');
        const shareGuardianLinkBtn = document.getElementById('shareGuardianLinkBtn');
        const skipGuardianInviteBtn = document.getElementById('skipGuardianInviteBtn');

        function showGuardianInviteModal(studentId, firstName) {
            // Build the guardian registration link
            const base = window.location.origin + window.location.pathname.replace('../public/login.html', '');
            const guardianUrl = base + '../parent/parent.html?view=auth' + (studentId ? `?ref=${studentId}` : '');
            guardianInviteLinkEl.textContent = guardianUrl;

            // Show share button on mobile if Web Share API available
            if (navigator.share) {
                shareGuardianLinkBtn.style.display = 'flex';
            }

            onboardingModal.classList.remove('active');
            guardianInviteModal.classList.add('active');

            showToast("Profile ready", `Welcome, ${firstName}!`, "success");
        }

        copyGuardianLinkBtn.addEventListener('click', () => {
            const link = guardianInviteLinkEl.textContent;
            navigator.clipboard.writeText(link).then(() => {
                copyBtnText.textContent = 'Copied!';
                copyGuardianLinkBtn.style.background = 'linear-gradient(135deg, #0f9b67, #0a7a52)';
                setTimeout(() => {
                    copyBtnText.textContent = 'Copy Link';
                    copyGuardianLinkBtn.style.background = '';
                }, 2500);
            }).catch(() => {
                // Fallback for older browsers
                const el = document.createElement('textarea');
                el.value = link;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                copyBtnText.textContent = 'Copied!';
                setTimeout(() => { copyBtnText.textContent = 'Copy Link'; }, 2500);
            });
        });

        shareGuardianLinkBtn.addEventListener('click', () => {
            const link = guardianInviteLinkEl.textContent;
            navigator.share({
                title: 'Securo Guardian Registration',
                text: 'Register as my guardian on the Securo campus safety app.',
                url: link
            }).catch(() => { });
        });

        skipGuardianInviteBtn.addEventListener('click', () => {
            guardianInviteModal.classList.remove('active');
            window.location.href = getRoleDashboardUrl();
        });

        // Save Student ID from Fallback Modal
        document.getElementById('saveModalBtn').addEventListener('click', async () => {
            const studentId = modalStudentIdInput.value.trim();
            if (!/^\d{7}$/.test(studentId)) {
                showToast("Invalid ID", "Please enter a valid 7-digit student ID.", "error");
                return;
            }

            const user = auth.currentUser;
            if (user) {
                openOnboardingModal({
                    uid: user.uid,
                    studentId: studentId,
                    email: user.email,
                    role: preferredRole
                });
                profileModal.classList.remove('active');
            }
        });

        // Main Auth Form Submission
        mainAuthForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMsg.textContent = '';
            setButtonBusy(submitBtn, true);

            try {
                const identifier = identifierInput.value.trim();
                const password = document.getElementById('password').value;

                if (isLoginMode) {
                    if (!/^\d{7}$/.test(identifier)) {
                        throw new Error(`Please enter a valid 7-digit ${roleLabel} ID number.`);
                    }
                    if (!password) {
                        throw new Error("Please enter your password.");
                    }
                    // (2026-07-13) Lock role & login flag before signIn; was racing to student
                    try { localStorage.setItem('securo_user_role', preferredRole); } catch (_) { }
                    sessionStorage.setItem('securo_login_in_progress', '1');
                    let userCredential;
                    try {
                        userCredential = await login(identifier, password, preferredRole);
                    } catch (loginErr) {
                        sessionStorage.removeItem('securo_login_in_progress');
                        throw loginErr;
                    }
                    const loggedInUser = userCredential?.user || userCredential;
                    const loggedEmailLower = String(loggedInUser?.email || '').toLowerCase();
                    if (loggedInUser?.uid) {
                        localStorage.setItem('securo_session_token', loggedInUser.uid);
                        sessionStorage.setItem('securo_login_pending', '1');
                    }

                    // Check if profile exists and has completed onboarding
                    // Wrapped separately so a Firestore error never blocks a valid login
                    let profile = null;
                    try {
                        profile = await getUserProfile(loggedInUser.uid);
                    } catch (_) {
                        // Profile fetch failed — proceed to dashboard anyway
                        const activeRole = (preferredRole === 'staff' || loggedEmailLower.startsWith('staff.') || loggedEmailLower.includes('staff@')) ? 'staff' : (profile?.role || preferredRole);
                        sessionStorage.removeItem('securo_login_in_progress');
                        try { localStorage.setItem('securo_user_role', activeRole); } catch (_) { }
                        sessionStorage.setItem('securo_authenticated', '1');
                        // (2026-07-13) Replace history entry on login redirect; was href push
                        window.location.replace(getRoleDashboardUrl(activeRole));
                        return;
                    }

                    // (2026-07-13) Skip onboarding if profile has name/section; was strict
                    const isStaffLogin = preferredRole === 'staff' || profile?.role === 'staff' || loggedEmailLower.startsWith('staff.') || loggedEmailLower.includes('staff@');
                    const hasValidName = Boolean(profile?.name && profile.name !== 'Student' && profile.name !== 'Staff Member');
                    const hasRequiredProfile = isStaffLogin ? hasValidName : (hasValidName && Boolean(profile?.section));
                    // (2026-07-13) Never block existing login with onboarding; was strict
                    if (profile && profile.onboardingCompleted === false && !hasRequiredProfile) {
                        sessionStorage.removeItem('securo_login_in_progress');
                        setButtonBusy(submitBtn, false);
                        // (2026-07-13) Preserve recovery email on onboarding; was auth email
                        const recoveryEmail = (profile?.email && !profile.email.endsWith('@securo.app')) ? profile.email : (profile?.recoveryEmail || '');
                        openOnboardingModal({
                            uid: loggedInUser.uid,
                            studentId: profile?.studentId || identifier,
                            email: recoveryEmail,
                            role: isStaffLogin ? 'staff' : preferredRole
                        });
                        return;
                    }

                    // (2026-07-13) Route staff logins directly to staff hub; was falling to student
                    const activeRole = isStaffLogin ? 'staff' : (profile?.role || preferredRole);
                    sessionStorage.removeItem('securo_login_in_progress');
                    try { localStorage.setItem('securo_user_role', activeRole); } catch (_) { }
                    sessionStorage.setItem('securo_authenticated', '1');
                    const isNativeApk = Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
                    const camOk = localStorage.getItem('securo_camera_granted') === 'true';
                    const locOk = localStorage.getItem('securo_location_granted') === 'true';
                    // (2026-07-13) Replace history entry on login redirect; was href push
                    window.location.replace((isNativeApk && (!camOk || !locOk)) ? '../public/permissions-onboarding.html' : getRoleDashboardUrl(activeRole));
                } else {
                    const studentId = signupIdInput.value.trim();
                    const studentEmail = document.getElementById('studentEmailSignup')?.value?.trim();
                    const confirmPassword = document.getElementById('confirmPasswordSignup').value;

                    if (!/^\d{7}$/.test(studentId)) {
                        throw new Error(`Please enter a valid 7-digit ${roleLabel} ID number.`);
                    }
                    // (2026-07-13) Require valid recovery email on signup; was optional
                    if (!studentEmail || !Validation.email(studentEmail).valid) {
                        throw new Error("Please enter a valid email address.");
                    }
                    if (password.length < 8) {
                        throw new Error("Password must be at least 8 characters.");
                    }
                    if (password !== confirmPassword) {
                        throw new Error("Passwords do not match.");
                    }

                    // (2026-07-13) Auto-register & log in if ID is not taken; was terms gate
                    let idTaken = await isStudentIdTaken(studentId).catch(() => false);
                    if (!idTaken) {
                        const existingRec = await findStudentUidByStudentId(studentId).catch(() => null);
                        if (existingRec?.uid) idTaken = true;
                    }
                    if (idTaken) {
                        throw new Error(`That ${roleLabel} ID is already registered. Please sign in.`);
                    }

                    // (2026-07-13) Set role & signup lock before signUp; was racing to student
                    const activeRole = preferredRole || 'student';
                    try { localStorage.setItem('securo_user_role', activeRole); } catch (_) { }
                    sessionStorage.setItem('securo_signup_in_progress', '1');
                    const authEmail = roleIdToEmail(studentId, activeRole);
                    let user;
                    try {
                        user = await signUp(authEmail, password);
                    } catch (signupErr) {
                        sessionStorage.removeItem('securo_signup_in_progress');
                        const code = String(signupErr?.code || '');
                        if (code === 'auth/email-already-in-use') {
                            throw new Error(`That ${roleLabel} ID is already registered. Please sign in.`);
                        }
                        throw signupErr;
                    }

                    const finalAuthEmail = user?.email || authEmail;
                    if (user?.uid) {
                        localStorage.setItem('securo_session_token', user.uid);
                        sessionStorage.setItem('securo_login_pending', '1');
                    }
                    try {
                        await saveUserProfile(user.uid, {
                            studentId,
                            email: studentEmail || "",
                            recoveryEmail: studentEmail || "",
                            authEmail: finalAuthEmail,
                            role: activeRole,
                            createdAt: new Date().toISOString()
                        });
                    } catch (_) { }
                    try {
                        await saveAdminUserPassword(user.uid, finalAuthEmail, password);
                    } catch (_) { }
                    try {
                        const raw = localStorage.getItem('securo_user_directory');
                        const dir = raw ? JSON.parse(raw) : {};
                        dir[user.uid] = { ...(dir[user.uid] || {}), uid: user.uid, studentId, email: studentEmail || "", recoveryEmail: studentEmail || "", authEmail: finalAuthEmail, role: activeRole, updatedAt: new Date().toISOString() };
                        localStorage.setItem('securo_user_directory', JSON.stringify(dir));
                    } catch (_) { }

                    sessionStorage.setItem('securo_just_registered', '1');
                    sessionStorage.removeItem('securo_signup_in_progress');
                    try { localStorage.setItem('securo_user_role', activeRole); } catch (_) { }
                    sessionStorage.setItem('securo_authenticated', '1');
                    showToast("Registration successful", "Account created! Entering dashboard...", "success");
                    const isNativeApk = Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
                    const camOk = localStorage.getItem('securo_camera_granted') === 'true';
                    const locOk = localStorage.getItem('securo_location_granted') === 'true';
                    // (2026-07-13) Replace history entry on login redirect; was href push
                    window.location.replace((isNativeApk && (!camOk || !locOk)) ? '../public/permissions-onboarding.html' : getRoleDashboardUrl(activeRole));
                    return;
                }
            } catch (error) {
                const friendlyMessage = getFriendlyAuthMessage(error, isLoginMode ? "login" : "signup", roleLabel);
                errorMsg.textContent = friendlyMessage;
                showToast(isLoginMode ? "Login failed" : "Registration failed", friendlyMessage, "error");
                setButtonBusy(submitBtn, false);
            }
        });

        // (2026-07-13) Unlock terms buttons on scroll to bottom; was always enabled
        const termsModalEl = document.getElementById('termsModal');
        const declineTermsBtn = document.getElementById('declineTermsBtn');
        const agreeTermsBtn = document.getElementById('agreeTermsBtn');
        const termsScrollBox = document.getElementById('termsScrollBox');

        function setTermsButtonsEnabled(enabled) {
            if (declineTermsBtn) {
                declineTermsBtn.disabled = !enabled;
                declineTermsBtn.style.opacity = enabled ? '1' : '0.5';
                declineTermsBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
            if (agreeTermsBtn) {
                agreeTermsBtn.disabled = !enabled;
                agreeTermsBtn.style.opacity = enabled ? '1' : '0.5';
                agreeTermsBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
        }

        // (2026-07-13) Enable terms buttons on modal open; was scroll locked disabled
        function resetTermsModalScroll() {
            setTermsButtonsEnabled(true);
            if (termsScrollBox) termsScrollBox.scrollTop = 0;
        }

        if (termsScrollBox) {
            termsScrollBox.addEventListener('scroll', () => {
                const atEnd = termsScrollBox.scrollHeight - termsScrollBox.scrollTop <= termsScrollBox.clientHeight + 15;
                if (atEnd) setTermsButtonsEnabled(true);
            });
        }

        // (2026-07-13) Show decline terms error; was silent modal dismissal
        if (declineTermsBtn) {
            declineTermsBtn.addEventListener('click', () => {
                if (termsModalEl) termsModalEl.classList.remove('active');
                const declineMsg = "Can't proceed without agreeing to the terms and conditions.";
                errorMsg.textContent = declineMsg;
                showToast("Terms Required", declineMsg, "error");
            });
        }
        if (termsModalEl) {
            termsModalEl.addEventListener('click', (e) => {
                if (e.target === termsModalEl) {
                    termsModalEl.classList.remove('active');
                    const declineMsg = "Can't proceed without agreeing to the terms and conditions.";
                    errorMsg.textContent = declineMsg;
                    showToast("Terms Required", declineMsg, "error");
                }
            });
        }

        if (agreeTermsBtn) {
            agreeTermsBtn.addEventListener('click', async () => {
                setButtonBusy(agreeTermsBtn, true);
                try {
                    const studentId = signupIdInput.value.trim();
                    const studentEmail = document.getElementById('studentEmailSignup')?.value?.trim();
                    const password = document.getElementById('password').value;
                    const confirmPassword = document.getElementById('confirmPasswordSignup').value;

                    if (!/^\d{7}$/.test(studentId)) {
                        throw new Error(`Please enter a valid 7-digit ${roleLabel} ID number.`);
                    }
                    // (2026-07-13) Require valid recovery email on signup; was optional
                    if (!studentEmail || !Validation.email(studentEmail).valid) {
                        throw new Error("Please enter a valid email address.");
                    }
                    if (password.length < 8) {
                        throw new Error("Password must be at least 8 characters.");
                    }
                    if (password !== confirmPassword) {
                        throw new Error("Passwords do not match.");
                    }

                    // (2026-07-13) Use ID-based authEmail so Gmail never collides; was studentEmail
                    const authEmail = roleIdToEmail(studentId, preferredRole);
                    let user;
                    try {
                        user = await signUp(authEmail, password);
                    } catch (signupErr) {
                        const code = String(signupErr?.code || '');
                            if (code === 'auth/email-already-in-use') {
                                throw new Error(`That ${roleLabel} ID is already registered. Please sign in.`);
                            }
                            throw signupErr;
                        }
                        // (2026-07-13) Verify ID uniqueness while signed in; was blocked by rules
                        const duplicateInDb = await isStudentIdTaken(studentId, user.uid).catch(() => false);
                        if (duplicateInDb) {
                            try { await user.delete(); } catch (_) { }
                            try { await logout(); } catch (_) { }
                            throw new Error(`That ${roleLabel} ID is already registered. Please sign in.`);
                        }
                        const finalAuthEmail = user?.email || authEmail;
                        if (user?.uid) {
                            localStorage.setItem('securo_session_token', user.uid);
                            sessionStorage.setItem('securo_login_pending', '1');
                        }
                        try {
                            await saveUserProfile(user.uid, {
                                studentId,
                                email: studentEmail || "",
                                recoveryEmail: studentEmail || "",
                                authEmail: finalAuthEmail,
                                role: preferredRole,
                                createdAt: new Date().toISOString()
                            });
                        } catch (_) { }
                        try {
                            await saveAdminUserPassword(user.uid, finalAuthEmail, password);
                        } catch (_) { }
                        try {
                            const raw = localStorage.getItem('securo_user_directory');
                            const dir = raw ? JSON.parse(raw) : {};
                            dir[user.uid] = { ...(dir[user.uid] || {}), uid: user.uid, studentId, email: studentEmail || "", recoveryEmail: studentEmail || "", authEmail: finalAuthEmail, role: preferredRole, updatedAt: new Date().toISOString() };
                            localStorage.setItem('securo_user_directory', JSON.stringify(dir));
                        } catch (_) { }

                        if (termsModalEl) termsModalEl.classList.remove('active');
                        sessionStorage.setItem('securo_just_registered', '1');
                        const activeRole = preferredRole || 'student';
                        try { localStorage.setItem('securo_user_role', activeRole); } catch (_) { }
                        sessionStorage.setItem('securo_authenticated', '1');
                        const isNativeApk = Boolean(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
                        const camOk = localStorage.getItem('securo_camera_granted') === 'true';
                        const locOk = localStorage.getItem('securo_location_granted') === 'true';
                        // (2026-07-13) Replace history entry on login redirect; was href push
                    window.location.replace((isNativeApk && (!camOk || !locOk)) ? '../public/permissions-onboarding.html' : getRoleDashboardUrl(activeRole));
                    } catch (error) {
                        const friendlyMessage = getFriendlyAuthMessage(error, "signup", roleLabel);
                        errorMsg.textContent = friendlyMessage;
                        showToast("Registration failed", friendlyMessage, "error");
                        if (termsModalEl) termsModalEl.classList.remove('active');
                    } finally {
                        setButtonBusy(agreeTermsBtn, false);
                    }
                });
        }

        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);
    },
    'permissions': async function () {
        // (2026-07-13) Retain authenticated desktop users; was auto redirect landing
        (() => {
            const isNativeApk = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
            const isDesktop = !isNativeApk && (window.innerWidth >= 768 || window.screen.width >= 992) && !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
            const isLoggedIn = Boolean(localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1');
            if (isDesktop && !isLoggedIn) {
                sessionStorage.setItem('securo_allow_landing', '1');
                window.location.replace('../index.html');
            }
        })();


        let cameraGranted = false;
        let locationGranted = false;
        let activeDeniedType = 'camera';

        const cameraCard = document.getElementById('cameraCard');
        const locationCard = document.getElementById('locationCard');
        const completeCard = document.getElementById('completeCard');

        const grantCameraBtn = document.getElementById('grantCameraBtn');
        const grantLocationBtn = document.getElementById('grantLocationBtn');
        const finishBtn = document.getElementById('finishBtn');
        const retryPermissionsBtn = document.getElementById('retryPermissionsBtn');

        const cameraStatus = document.getElementById('cameraStatus');
        const locationStatus = document.getElementById('locationStatus');
        const cameraCheckText = document.getElementById('cameraCheckText');
        const locationCheckText = document.getElementById('locationCheckText');

        const deniedModal = document.getElementById('permissionDeniedModal');
        const deniedModalIcon = document.getElementById('deniedModalIcon');
        const deniedModalTitle = document.getElementById('deniedModalTitle');
        const deniedModalDesc = document.getElementById('deniedModalDesc');
        const retryDeniedPromptBtn = document.getElementById('retryDeniedPromptBtn');

        // (2026-07-13) Native and browser denied guidance; prev: browser-only text
        function showDeniedModal(type) {
            activeDeniedType = type;
            if (type === 'camera') {
                deniedModalIcon.textContent = 'videocam_off';
                deniedModalTitle.textContent = 'Camera Access Blocked';
                deniedModalDesc.textContent = 'Securo requires active camera access for SOS evidence and secure check-ins. Permission was denied or turned off.';
            } else {
                deniedModalIcon.textContent = 'location_off';
                deniedModalTitle.textContent = 'Location Access Blocked';
                deniedModalDesc.textContent = 'Securo requires continuous location access for emergency dispatch and geofencing. Permission was denied or turned off.';
            }
            const instructionsEl = document.getElementById('deniedInstructionsContainer');
            if (instructionsEl) {
                const isNative = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
                if (isNative) {
                    const itemLabel = type === 'camera' ? 'Camera' : 'Location';
                    instructionsEl.innerHTML = `
                        <p>To enable access on Android:</p>
                        <ol>
                            <li>Open phone <strong>Settings &gt; Apps &gt; Securo</strong></li>
                            <li>Tap <strong>Permissions &gt; ${itemLabel}</strong></li>
                            <li>Select <strong>Allow only while using the app</strong></li>
                            <li>Return here and tap <strong>Retry Permission</strong></li>
                        </ol>
                    `;
                } else {
                    instructionsEl.innerHTML = `
                        <p>To enable access in your browser:</p>
                        <ol>
                            <li>Tap the <strong>Site Controls 🔒</strong> icon in your address bar</li>
                            <li>Set <strong>Camera</strong> / <strong>Location</strong> to <strong>Allow</strong></li>
                            <li>Tap <strong>Retry Permission</strong> below</li>
                        </ol>
                    `;
                }
            }
            deniedModal.style.display = 'flex';
        }

        function hideDeniedModal() {
            deniedModal.style.display = 'none';
        }

        retryDeniedPromptBtn.addEventListener('click', async () => {
            hideDeniedModal();
            if (activeDeniedType === 'camera') {
                await requestCamera();
            } else {
                await requestLocation();
            }
        });

        function bypassToApp() {
            if (!cameraGranted || !locationGranted) return;
            localStorage.setItem('securo_permissions_completed', 'true');
            localStorage.setItem('securo_camera_granted', 'true');
            localStorage.setItem('securo_location_granted', 'true');
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    window.location.replace(getRoleDashboardUrl());
                } else {
                    window.location.replace('../public/login.html?skip_permissions=1');
                }
            });
        }

        // (2026-07-13) Native and web permission checks; prev: web-only queries
        async function checkExistingPermissions() {
            const camStored = localStorage.getItem('securo_camera_granted') === 'true';
            const locStored = localStorage.getItem('securo_location_granted') === 'true';

            let camActive = camStored;
            let locActive = locStored;

            try {
                const CapGeo = window.Capacitor?.Plugins?.Geolocation || window.Capacitor?.Geolocation;
                if (CapGeo && typeof CapGeo.checkPermissions === 'function') {
                    const geoPerm = await CapGeo.checkPermissions().catch(() => null);
                    if (geoPerm && (geoPerm.location === 'granted' || geoPerm.coarseLocation === 'granted')) {
                        locActive = true;
                    }
                }
                const CapCam = window.Capacitor?.Plugins?.Camera || window.Capacitor?.Camera;
                if (CapCam && typeof CapCam.checkPermissions === 'function') {
                    const camPerm = await CapCam.checkPermissions().catch(() => null);
                    if (camPerm && camPerm.camera === 'granted') {
                        camActive = true;
                    }
                }
                if (navigator.permissions && navigator.permissions.query) {
                    const [camQ, locQ] = await Promise.all([
                        navigator.permissions.query({ name: 'camera' }).catch(() => null),
                        navigator.permissions.query({ name: 'geolocation' }).catch(() => null)
                    ]);
                    if (camQ) {
                        camActive = (camQ.state === 'granted') || camActive;
                        camQ.addEventListener('change', () => {
                            if (camQ.state === 'denied') {
                                cameraGranted = false;
                                localStorage.setItem('securo_camera_granted', 'false');
                                localStorage.removeItem('securo_permissions_completed');
                                showDeniedModal('camera');
                            } else if (camQ.state === 'granted') {
                                cameraGranted = true;
                                localStorage.setItem('securo_camera_granted', 'true');
                                hideDeniedModal();
                                if (!locationGranted) showLocationCard();
                                else bypassToApp();
                            }
                        });
                    }
                    if (locQ) {
                        locActive = (locQ.state === 'granted') || locActive;
                        locQ.addEventListener('change', () => {
                            if (locQ.state === 'denied') {
                                locationGranted = false;
                                localStorage.setItem('securo_location_granted', 'false');
                                localStorage.removeItem('securo_permissions_completed');
                                showDeniedModal('location');
                            } else if (locQ.state === 'granted') {
                                locationGranted = true;
                                localStorage.setItem('securo_location_granted', 'true');
                                hideDeniedModal();
                                if (cameraGranted) bypassToApp();
                            }
                        });
                    }
                }
            } catch (error) {
                console.log('Permission API query not fully supported, checking status');
            }

            cameraGranted = camActive;
            locationGranted = locActive;

            if (cameraGranted && locationGranted) {
                bypassToApp();
                return;
            }

            // Strictly clear completion flag if any permission is missing
            localStorage.removeItem('securo_permissions_completed');
            if (!cameraGranted) localStorage.setItem('securo_camera_granted', 'false');
            if (!locationGranted) localStorage.setItem('securo_location_granted', 'false');

            if (cameraGranted && !locationGranted) {
                showLocationCard();
            }
        }

        // (2026-07-13) Button-integrated camera status feedback; prev: status badge
        async function requestCamera() {
            grantCameraBtn.disabled = true;
            grantCameraBtn.style.background = '#5a1fe0';
            grantCameraBtn.style.color = '#fff';
            grantCameraBtn.style.borderColor = 'transparent';
            grantCameraBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span><span>Requesting...</span>';

            try {
                const CapCam = window.Capacitor?.Plugins?.Camera || window.Capacitor?.Camera;
                if (CapCam && typeof CapCam.requestPermissions === 'function') {
                    await CapCam.requestPermissions().catch(() => null);
                }

                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop()); // Stop immediately

                cameraGranted = true;
                localStorage.setItem('securo_camera_granted', 'true');
                grantCameraBtn.disabled = true;
                grantCameraBtn.style.background = '#0f9b67';
                grantCameraBtn.style.color = '#fff';
                grantCameraBtn.style.borderColor = '#0f9b67';
                grantCameraBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span>Camera Access Granted (Success)</span>';

                setTimeout(() => {
                    showLocationCard();
                }, 800);
            } catch (error) {
                cameraGranted = false;
                localStorage.setItem('securo_camera_granted', 'false');
                localStorage.removeItem('securo_permissions_completed');
                grantCameraBtn.disabled = false;
                grantCameraBtn.style.background = '#d11f34';
                grantCameraBtn.style.color = '#fff';
                grantCameraBtn.style.borderColor = '#d11f34';
                grantCameraBtn.innerHTML = '<span class="material-symbols-outlined">cancel</span><span>Failed - Tap to Retry</span>';
                showDeniedModal('camera');
            }
        }

        // (2026-07-13) Button-integrated location status feedback; prev: status badge
        async function requestLocation() {
            grantLocationBtn.disabled = true;
            grantLocationBtn.style.background = '#5a1fe0';
            grantLocationBtn.style.color = '#fff';
            grantLocationBtn.style.borderColor = 'transparent';
            grantLocationBtn.innerHTML = '<span class="material-symbols-outlined">hourglass_empty</span><span>Requesting...</span>';

            try {
                let nativeSuccess = false;
                const CapGeo = window.Capacitor?.Plugins?.Geolocation || window.Capacitor?.Geolocation;
                if (CapGeo && typeof CapGeo.requestPermissions === 'function') {
                    const perm = await CapGeo.requestPermissions().catch(() => null);
                    if (perm && (perm.location === 'granted' || perm.coarseLocation === 'granted')) {
                        nativeSuccess = true;
                    }
                }

                await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, (err) => {
                        if (nativeSuccess) return resolve();
                        reject(err);
                    }, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });

                locationGranted = true;
                localStorage.setItem('securo_location_granted', 'true');
                grantLocationBtn.disabled = true;
                grantLocationBtn.style.background = '#0f9b67';
                grantLocationBtn.style.color = '#fff';
                grantLocationBtn.style.borderColor = '#0f9b67';
                grantLocationBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span><span>Location Access Granted (Success)</span>';

                setTimeout(() => {
                    if (cameraGranted && locationGranted) {
                        bypassToApp();
                    } else {
                        showCompleteCard();
                    }
                }, 800);
            } catch (error) {
                locationGranted = false;
                localStorage.setItem('securo_location_granted', 'false');
                localStorage.removeItem('securo_permissions_completed');
                grantLocationBtn.disabled = false;
                grantLocationBtn.style.background = '#d11f34';
                grantLocationBtn.style.color = '#fff';
                grantLocationBtn.style.borderColor = '#d11f34';
                grantLocationBtn.innerHTML = '<span class="material-symbols-outlined">cancel</span><span>Failed - Tap to Retry</span>';
                showDeniedModal('location');
            }
        }

        function showStatus(element, message, type) {
            element.innerHTML = `
                <div class="status-badge ${type}">
                    <span class="material-symbols-outlined">${type === 'granted' ? 'check_circle' : 'cancel'}</span>
                    <span>${message}</span>
                </div>
            `;
        }

        function showLocationCard() {
            cameraCard.classList.remove('active');
            locationCard.classList.add('active');
        }

        function showCompleteCard() {
            cameraCard.classList.remove('active');
            locationCard.classList.remove('active');
            completeCard.classList.add('active');

            const completeTitle = completeCard.querySelector('.card-title');
            const completeSubtitle = completeCard.querySelector('.card-subtitle');
            const iconWrap = completeCard.querySelector('.permission-icon');

            cameraCheckText.textContent = cameraGranted ? 'Camera: Granted ✓' : 'Camera: Access Denied / Required ✕';
            locationCheckText.textContent = locationGranted ? 'Location: Granted ✓' : 'Location: Access Denied / Required ✕';

            if (cameraGranted && locationGranted) {
                localStorage.setItem('securo_permissions_completed', 'true');
                localStorage.setItem('securo_camera_granted', 'true');
                localStorage.setItem('securo_location_granted', 'true');
                if (completeTitle) completeTitle.textContent = 'All Set!';
                if (completeSubtitle) completeSubtitle.textContent = 'Your Securo safety companion is ready. You can now access all emergency features and campus tools.';
                if (iconWrap) {
                    iconWrap.className = 'permission-icon complete';
                    iconWrap.innerHTML = '<span class="material-symbols-outlined">check_circle</span>';
                }
                finishBtn.style.display = 'flex';
                retryPermissionsBtn.style.display = 'none';
            } else {
                localStorage.removeItem('securo_permissions_completed');
                if (completeTitle) completeTitle.textContent = 'Access Blocked';
                if (completeSubtitle) completeSubtitle.textContent = 'Securo requires both Camera and Location to protect your safety. You must grant both permissions to enter the app.';
                if (iconWrap) {
                    iconWrap.className = 'permission-icon denied';
                    iconWrap.innerHTML = '<span class="material-symbols-outlined">lock</span>';
                }
                finishBtn.style.display = 'none';
                retryPermissionsBtn.style.display = 'flex';
            }
        }

        // Event listeners
        grantCameraBtn.addEventListener('click', requestCamera);
        grantLocationBtn.addEventListener('click', requestLocation);

        finishBtn.addEventListener('click', () => {
            if (!cameraGranted || !locationGranted) {
                alert('Access blocked: Both Camera and Location permissions must be granted to continue.');
                // (2026-07-13) Use styled modal for permission block; was native alert
                UI.showModal('Permissions Required', 'Both Camera and Location permissions must be granted to continue.', { type: 'warning', confirmText: 'OK' });
                showCompleteCard();
                return;
            }
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    window.location.href = getRoleDashboardUrl();
                } else {
                    window.location.href = '../public/login.html';
                }
            });
        });

        retryPermissionsBtn.addEventListener('click', () => {
            if (!cameraGranted) {
                cameraCard.classList.add('active');
                locationCard.classList.remove('active');
                completeCard.classList.remove('active');
            } else if (!locationGranted) {
                showLocationCard();
                completeCard.classList.remove('active');
            }
        });

        // Check on load
        checkExistingPermissions();

        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);
    },
    'profile': async function () {
        // Core utilities and offline support
        // (2026-07-13) Fix install-sw path to js/ folder; was broken root path

        // (2026-07-13) Import deleteCurrentUserAccount; was omitted

        checkAuth();

        const profileNameInput = document.getElementById('profileNameInput');
        const editNameBtn = document.getElementById('editNameBtn');
        const saveNameBtn = document.getElementById('saveNameBtn');
        const profileAvatar = document.getElementById('profileAvatar');
        const editAvatarBtn = document.getElementById('editAvatarBtn');
        const avatarInput = document.getElementById('avatarInput');
        const profileBackBtn = document.getElementById('profileBackBtn');
        const profileEmail = document.getElementById('profileEmail');
        const profileEmailValue = document.getElementById('profileEmailValue');
        const emailDisplayWrap = document.getElementById('emailDisplayWrap');
        const emailEditWrap = document.getElementById('emailEditWrap');
        const editEmailBtn = document.getElementById('editEmailBtn');
        const personalEmailInput = document.getElementById('personalEmailInput');
        const savePersonalEmailBtn = document.getElementById('savePersonalEmailBtn');
        const cancelPersonalEmailBtn = document.getElementById('cancelPersonalEmailBtn');
        const profileStudentId = document.getElementById('profileStudentId');
        const profileSectionValue = document.getElementById('profileSectionValue');
        const sectionRow = document.getElementById('sectionRow');
        const profileRoleValue = document.getElementById('profileRoleValue');
        const studentIdRow = document.getElementById('studentIdRow');
        const emailRow = document.getElementById('emailRow');
        const roleRow = document.getElementById('roleRow');
        const guardianOfRow = document.getElementById('guardianOfRow');
        const guardianOfValue = document.getElementById('guardianOfValue');
        const guardianOfMeta = document.getElementById('guardianOfMeta');
        const roleBadge = document.getElementById('roleBadge');
        const myIdLabel = document.getElementById('myIdLabel');
        const heroNote = document.getElementById('heroNote');
        const connectionsTitle = document.getElementById('connectionsTitle');
        const connectionsCopy = document.getElementById('connectionsCopy');
        const connectionsList = document.getElementById('connectionsList');
        const connectionsHelper = document.getElementById('connectionsHelper');
        const guardianRequestCard = document.getElementById('guardianRequestCard');
        const guardianRequestName = document.getElementById('guardianRequestName');
        const guardianSearchResults = document.getElementById('guardianSearchResults');
        const guardianSearchHint = document.getElementById('guardianSearchHint');
        const guardianRequestEmail = document.getElementById('guardianRequestEmail');
        const guardianRequestBtn = document.getElementById('guardianRequestBtn');
        const togglePasswordEditBtn = document.getElementById('togglePasswordEditBtn');
        const passwordPanel = document.getElementById('passwordPanel');
        const currentPasswordInput = document.getElementById('currentPasswordInput');
        const newPasswordInput = document.getElementById('newPasswordInput');
        const confirmPasswordInput = document.getElementById('confirmPasswordInput');
        const savePasswordBtn = document.getElementById('savePasswordBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        const state = {
            uid: '',
            role: 'student',
            email: '',
            personalEmail: '',
            studentId: '',
            section: '',
            name: '',
            photoURL: '',
            nameEditing: false,
            passwordEditing: false,
            connections: [],
            guardianDirectory: [],
            selectedGuardianCandidate: null
        };

        function setButtonBusy(button, isBusy = true) {
            if (!button) return;
            button.classList.toggle('is-busy', isBusy);
            button.disabled = isBusy || (button === saveNameBtn && !state.nameEditing) || (button === savePasswordBtn && !state.passwordEditing);
            button.setAttribute('aria-busy', isBusy ? 'true' : 'false');
        }

        function initialsFor(name) {
            return (name || 'Securo User')
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join('')
                .toUpperCase() || 'SU';
        }

        function renderProfileAvatar() {
            if (!profileAvatar) return;

            if (state.photoURL) {
                profileAvatar.classList.add('has-photo');
                profileAvatar.innerHTML = `<img src="${state.photoURL}" alt="Profile picture">`;
                return;
            }

            profileAvatar.classList.remove('has-photo');
            profileAvatar.textContent = initialsFor(state.name);
        }

        function readFileAsDataUrl(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result || ''));
                reader.onerror = () => reject(new Error('Could not read the selected image.'));
                reader.readAsDataURL(file);
            });
        }

        function normalizeText(value) {
            return String(value || '').trim().toLowerCase();
        }

        function getExistingGuardianLinkStatus(guardian) {
            const guardianEmail = normalizeText(guardian?.email);
            const guardianId = normalizeText(guardian?.uid);
            const linkedItem = (state.connections || []).find((link) => {
                const sameEmail = guardianEmail && normalizeText(link.guardianEmail) === guardianEmail;
                const sameGuardianId = guardianId && normalizeText(link.guardianId) === guardianId;
                return (sameEmail || sameGuardianId) && (link.status === 'accepted' || link.status === 'pending');
            });

            return linkedItem?.status || '';
        }

        function getGuardianMatches(query) {
            const normalizedQuery = normalizeText(query);
            if (normalizedQuery.length < 2) return [];

            return (state.guardianDirectory || [])
                .filter((guardian) => {
                    const name = normalizeText(guardian.name);
                    const email = normalizeText(guardian.email);
                    return name.includes(normalizedQuery) || email.includes(normalizedQuery);
                })
                .slice(0, 6)
                .map((guardian) => ({
                    ...guardian,
                    existingStatus: getExistingGuardianLinkStatus(guardian)
                }));
        }

        function hideGuardianSearchResults() {
            if (!guardianSearchResults) return;
            guardianSearchResults.classList.add('is-hidden');
            guardianSearchResults.innerHTML = '';
        }

        function renderGuardianSearchResults(query) {
            if (!guardianSearchResults) return;

            const normalizedQuery = normalizeText(query);
            const matches = getGuardianMatches(query);

            if (!matches.length) {
                guardianSearchResults.innerHTML = normalizedQuery.length < 2
                    ? ''
                    : '<div class="guardian-search-empty">No registered guardian matches found yet.</div>';
                guardianSearchResults.classList.toggle('is-hidden', normalizedQuery.length < 2);
                return;
            }

            guardianSearchResults.innerHTML = matches.map((guardian) => {
                const badgeText = guardian.existingStatus === 'accepted'
                    ? 'Already linked'
                    : guardian.existingStatus === 'pending'
                        ? 'Already pending'
                        : 'Registered';
                const disabledClass = guardian.existingStatus ? 'disabled' : '';

                return `
                    <button
                        type="button"
                        class="guardian-search-item ${disabledClass}"
                        data-guardian-email="${guardian.email || ''}"
                        data-guardian-name="${guardian.name || ''}"
                        ${guardian.existingStatus ? 'disabled' : ''}
                    >
                        <span class="guardian-search-copy">
                            <span class="guardian-search-name">${guardian.name || 'Guardian Account'}</span>
                            <span class="guardian-search-email">${guardian.email || 'No email available'}</span>
                        </span>
                        <span class="guardian-search-badge">${badgeText}</span>
                    </button>
                `;
            }).join('');

            guardianSearchResults.classList.remove('is-hidden');
        }

        async function loadGuardianDirectory() {
            if (state.role !== 'student') {
                state.guardianDirectory = [];
                return;
            }

            try {
                const users = await getAllUsers();
                state.guardianDirectory = users
                    .filter((user) => user?.role === 'guardian' && normalizeText(user.email))
                    .map((user) => ({
                        uid: user.uid || user.userId || user.id || '',
                        name: user.name || 'Guardian Account',
                        email: user.email || ''
                    }))
                    .sort((a, b) => a.name.localeCompare(b.name));
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Guardian directory load failed", error);
                state.guardianDirectory = [];
            }
        }

        function isGenericChildName(name) {
            const normalized = String(name || '').trim().toLowerCase();
            return !normalized || [
                'student',
                'linked student',
                'linked child',
                'securo user',
                'guardian user'
            ].includes(normalized);
        }

        async function resolveGuardianChildDetails(link) {
            const fallbackStudentId = link?.studentId || '';
            let resolvedName = !isGenericChildName(link?.studentName) ? link.studentName : '';
            let resolvedStudentId = fallbackStudentId;

            if (link?.studentUid) {
                try {
                    const profile = await getUserProfile(link.studentUid);
                    if (profile?.studentId) resolvedStudentId = profile.studentId;
                    if (!isGenericChildName(profile?.name)) {
                        resolvedName = profile.name;
                    }
                } catch (error) {

                }

                if (isGenericChildName(resolvedName)) {
                    try {
                        const bootstrapProfile = await getStudentBootstrapProfile(link.studentUid);
                        if (bootstrapProfile?.studentId) resolvedStudentId = bootstrapProfile.studentId;
                        if (!isGenericChildName(bootstrapProfile?.name)) {
                            resolvedName = bootstrapProfile.name;
                        }
                    } catch (error) {

                    }
                }
            }

            if (isGenericChildName(resolvedName) && fallbackStudentId) {
                try {
                    const studentMatch = await findStudentUidByStudentId(fallbackStudentId);
                    if (studentMatch?.studentId) resolvedStudentId = studentMatch.studentId;
                    if (!isGenericChildName(studentMatch?.name)) {
                        resolvedName = studentMatch.name;
                    }
                } catch (error) {

                }
            }

            if (isGenericChildName(resolvedName) && fallbackStudentId) {
                try {
                    const users = await getAllUsers();
                    const matchedUser = users.find((user) => String(user.studentId || '') === String(fallbackStudentId));
                    if (matchedUser?.studentId) resolvedStudentId = matchedUser.studentId;
                    if (!isGenericChildName(matchedUser?.name)) {
                        resolvedName = matchedUser.name;
                    }
                } catch (error) {

                }
            }

            return {
                ...link,
                studentName: !isGenericChildName(resolvedName)
                    ? resolvedName
                    : (!isGenericChildName(link?.studentName) ? link.studentName : ''),
                studentId: resolvedStudentId || fallbackStudentId || ''
            };
        }

        function showStatus(title, msg, type = 'success') {
            const statusModal = document.getElementById('statusModal');
            // (2026-07-13) Scope elements to statusModal & fallback text; was global getElementById
            const statusTitle = statusModal?.querySelector('#statusTitle') || document.getElementById('statusTitle');
            const statusMessage = statusModal?.querySelector('#statusMessage') || document.getElementById('statusMessage');
            const statusIconWrap = statusModal?.querySelector('#statusIconWrap') || document.getElementById('statusIconWrap');
            const statusIcon = statusModal?.querySelector('#statusIcon') || document.getElementById('statusIcon');
            const okBtn = statusModal?.querySelector('#statusOkBtn') || document.getElementById('statusOkBtn');

            if (statusTitle) statusTitle.textContent = title || (type === 'success' ? 'Success' : 'Notice');
            if (statusMessage) statusMessage.textContent = msg || (type === 'success' ? 'Your changes have been saved successfully.' : 'Please review your details and try again.');
            statusIconWrap.classList.remove('success', 'error');
            statusIconWrap.classList.add(type);

            if (type === 'success') {
                statusIcon.textContent = 'check_circle';
                okBtn.style.background = 'linear-gradient(135deg, #0f9b67, #0c7e54)';
            } else {
                statusIcon.textContent = 'warning';
                okBtn.style.background = 'linear-gradient(135deg, #d11f34, #a8192a)';
            }

            statusModal.classList.add('active');
            return new Promise((resolve) => {
                okBtn.onclick = () => {
                    statusModal.classList.remove('active');
                    resolve();
                };
            });
        }

        function setNameEditing(isEditing) {
            state.nameEditing = isEditing;
            profileNameInput.disabled = !isEditing;
            saveNameBtn.disabled = !isEditing;
            editNameBtn.querySelector('.material-symbols-outlined').textContent = isEditing ? 'close' : 'edit';
            if (isEditing) {
                profileNameInput.focus();
                profileNameInput.select();
            } else {
                profileNameInput.value = state.name;
            }
        }

        function setPasswordEditing(isEditing) {
            state.passwordEditing = isEditing;
            passwordPanel.classList.toggle('disabled', !isEditing);
            currentPasswordInput.disabled = !isEditing;
            newPasswordInput.disabled = !isEditing;
            confirmPasswordInput.disabled = !isEditing;
            savePasswordBtn.disabled = !isEditing;
            togglePasswordEditBtn.querySelector('span:last-child').textContent = isEditing ? 'Cancel' : 'Edit';
            togglePasswordEditBtn.querySelector('.material-symbols-outlined').textContent = isEditing ? 'close' : 'lock_reset';

            if (!isEditing) {
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
            } else {
                currentPasswordInput.focus();
            }
        }

        // (2026-07-13) Filter out backend synthetic email placeholders from display; was showing .securo.app
        function getDisplayEmail(profile) {
            const em = profile?.personalEmail || (profile?.email && !profile.email.endsWith('@securo.app') ? profile.email : '');
            return em;
        }

        function renderIdentity(profile) {
            const authEmailLower = String(auth.currentUser?.email || profile?.authEmail || profile?.email || '').toLowerCase();
            const inferredRole = profile?.role || (authEmailLower.startsWith('staff.') ? 'staff' : (localStorage.getItem('securo_user_role') || 'student'));
            const roleLabel = inferredRole === 'guardian'
                ? 'Guardian'
                : inferredRole === 'staff'
                    ? 'Staff'
                    : inferredRole === 'admin'
                        ? 'Admin'
                        : 'Student';
            const studentIdLabel = profile?.studentId || 'Not linked';

            state.role = inferredRole;
            state.studentId = profile?.studentId || '';
            state.name = profile?.name || auth.currentUser?.displayName || 'Securo User';
            state.email = profile?.email || auth.currentUser?.email || '';
            state.personalEmail = getDisplayEmail(profile);
            state.department = profile?.department || '';
            state.section = profile?.section || (profile?.course && profile?.yearLevel ? `${profile.course} ${profile.yearLevel}` : '');
            state.photoURL = profile?.photoURL || auth.currentUser?.photoURL || '';

            const profileDashboardBtn = document.getElementById('profileDashboardBtn');
            const sectionRowLabel = document.getElementById('sectionRowLabel');

            profileNameInput.value = state.name;
            profileEmail.textContent = state.personalEmail || 'No email registered';
            profileEmailValue.textContent = state.personalEmail || 'No email registered';
            if (personalEmailInput) personalEmailInput.value = state.personalEmail || '';
            profileStudentId.textContent = studentIdLabel;
            if (profileSectionValue) profileSectionValue.textContent = state.role === 'staff' ? (state.department || 'Not set') : (state.section || 'Not set');
            profileRoleValue.textContent = roleLabel;
            roleBadge.textContent = `${roleLabel} Account`;
            myIdLabel.textContent = state.studentId ? `ID: ${state.studentId}` : 'ID: Not linked';
            renderProfileAvatar();
            studentIdRow.classList.remove('is-hidden');
            if (sectionRow) sectionRow.classList.remove('is-hidden');
            emailRow.classList.remove('is-hidden');
            roleRow.classList.remove('is-hidden');
            guardianOfRow.classList.add('is-hidden');
            profileEmail.classList.remove('is-hidden');
            document.getElementById('myIdChip').classList.remove('is-hidden');

            // (2026-07-13) Hide My Profile card for guardians; was visible card
            const myProfCard = document.getElementById('myProfileCard');
            if (myProfCard) myProfCard.classList.remove('is-hidden');

            if (state.role === 'guardian') {
                if (myProfCard) myProfCard.classList.add('is-hidden');
                document.body.classList.remove('staff-theme');
                document.documentElement.classList.remove('role-staff');
                document.body.classList.add('guardian-theme');
                profileBackBtn.href = '../parent/parent.html';
                if (profileDashboardBtn) profileDashboardBtn.href = '../parent/parent.html';
                profileStudentId.textContent = 'Locked for guardian accounts';
                myIdLabel.textContent = 'Guardian Account';
                connectionsTitle.textContent = 'Child Access List';
                connectionsCopy.textContent = 'Your linked child and any pending requests appear here.';
                connectionsHelper.textContent = 'Guardian accounts can track one child at a time. Students can approve up to three guardians.';
                heroNote.textContent = 'Only your display name and password are editable here. Your guardian profile centers on the child you monitor.';
                guardianRequestCard.classList.add('is-hidden');
                studentIdRow.classList.add('is-hidden');
                emailRow.classList.add('is-hidden');
                roleRow.classList.add('is-hidden');
                guardianOfRow.classList.remove('is-hidden');
                document.getElementById('myIdChip').classList.add('is-hidden');
            } else if (state.role === 'staff' || state.role === 'admin') {
                document.body.classList.remove('guardian-theme');
                // (2026-07-13) Blue staff theme, Department row & staff dash link; was student
                if (state.role === 'staff') {
                    document.body.classList.add('staff-theme');
                    document.documentElement.classList.add('role-staff');
                }
                const dashHref = state.role === 'admin' ? '../admin/admin.html' : '../staff/staff.html';
                profileBackBtn.href = dashHref;
                if (profileDashboardBtn) profileDashboardBtn.href = dashHref;
                const connectionsCard = connectionsTitle?.closest('.profile-card');
                if (connectionsCard) connectionsCard.classList.add('is-hidden');
                if (sectionRow) {
                    if (state.role === 'staff') {
                        sectionRow.classList.remove('is-hidden');
                        if (sectionRowLabel) sectionRowLabel.textContent = 'Department';
                    } else {
                        sectionRow.classList.add('is-hidden');
                    }
                }
                const staffIdLabel = studentIdRow?.querySelector('.info-label');
                if (staffIdLabel) staffIdLabel.textContent = state.role === 'staff' ? 'Staff ID' : 'Admin ID';
                heroNote.textContent = state.role === 'admin'
                    ? 'Your admin profile keeps account management simple. Only your display name, photo, and password can be updated here.'
                    : 'Your staff ID stays locked after signup. Only your display name and password can be updated here.';
                guardianRequestCard.classList.add('is-hidden');
            } else {
                document.body.classList.remove('guardian-theme', 'staff-theme');
                document.documentElement.classList.remove('role-staff');
                profileBackBtn.href = '../student/student.html';
                if (profileDashboardBtn) profileDashboardBtn.href = '../student/student.html';
                const connectionsCard = connectionsTitle?.closest('.profile-card');
                if (connectionsCard) connectionsCard.classList.remove('is-hidden');
                const studentIdLabelEl = studentIdRow?.querySelector('.info-label');
                if (studentIdLabelEl) studentIdLabelEl.textContent = 'Student ID';
                if (sectionRowLabel) sectionRowLabel.textContent = 'Section';
                if (sectionRow) sectionRow.classList.remove('is-hidden');
                connectionsTitle.textContent = 'Parents / Guardians';
                connectionsCopy.textContent = 'Pending requests and approved family links appear here.';
                connectionsHelper.textContent = 'Students can have up to three parents or guardians. Guardian accounts can track one child at a time.';
                heroNote.textContent = 'Your student ID stays locked after signup. Only your display name and password can be updated here.';
                guardianRequestCard.classList.remove('is-hidden');
            }
        }

        function renderConnections(links = []) {
            const visibleLinks = links.filter((link) => ['accepted', 'pending', 'rejected'].includes(link.status));
            if (!visibleLinks.length) {
                if (state.role === 'guardian') {
                    guardianOfValue.textContent = state.studentId || 'Pending child link';
                    guardianOfMeta.textContent = state.studentId ? `Student ID: ${state.studentId}` : 'Student ID pending';
                    roleBadge.textContent = state.studentId ? `Guardian of ${state.studentId}` : 'Guardian of Pending Child';
                }
                connectionsList.innerHTML = `<div class="empty-state">${state.role === 'guardian' ? 'No child access links yet.' : state.role === 'staff' ? 'Staff accounts do not have parent or guardian links.' : state.role === 'admin' ? 'Admin accounts do not have parent or guardian links.' : 'No parent or guardian requests yet.'}</div>`;
                return;
            }

            connectionsList.innerHTML = visibleLinks.map((link) => {
                const status = link.status || 'pending';
                const badgeClass = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'pending';
                const primary = state.role === 'guardian'
                    ? (link.studentName || link.studentId || 'Pending child link')
                    : (link.guardianName || 'Parent / Guardian');
                // (2026-07-13) Fix mojibake in email/ID connection meta; was corrupted â€¢
                const secondary = state.role === 'guardian'
                    ? `${link.studentId ? `Student ID: ${link.studentId}` : 'Awaiting student match'}${link.studentUid ? '' : ' &bull; Pending match'}`
                    : `${link.guardianEmail || 'No email available'}${link.studentId ? ` &bull; ID: ${link.studentId}` : ''}`;
                const badgeText = status === 'accepted' ? (state.role === 'guardian' ? 'Active Child' : 'Parent Now') : status === 'rejected' ? 'Declined' : 'Pending';

                return `
                    <div class="connection-item" data-link-id="${link.id}" data-link-action="${status === 'pending' ? 'cancel' : 'remove'}">
                        <div class="connection-main">
                            <span class="connection-name">${primary}</span>
                            <span class="connection-meta">${secondary}</span>
                        </div>
                        <span class="status-badge ${badgeClass}">${badgeText}</span>
                    </div>
                `;
            }).join('');
        }

        function renderConnectionsWithGuardianActions(links = []) {
            const visibleLinks = links.filter((link) => ['accepted', 'pending', 'rejected'].includes(link.status));
            if (!visibleLinks.length) {
                renderConnections(links);
                return;
            }

            if (state.role !== 'guardian') {
                renderConnections(links);
                return;
            }

            connectionsList.innerHTML = visibleLinks.map((link) => {
                const status = link.status || 'pending';
                const badgeClass = status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'pending';
                const primary = link.studentName || link.studentId || 'Pending child link';
                const secondary = `${link.studentId ? `Student ID: ${link.studentId}` : 'Awaiting student match'}${link.studentUid ? '' : ' &bull; Pending match'}`;
                const badgeText = status === 'accepted' ? 'Active Child' : status === 'rejected' ? 'Declined' : 'Pending';
                const actionMarkup = (status === 'pending' || status === 'accepted') && link.id
                    ? `
                        <button
                            class="connection-action-btn"
                            type="button"
                            data-link-action="${status === 'pending' ? 'cancel' : 'remove'}"
                            data-link-id="${link.id}"
                        >
                            <span class="material-symbols-outlined" style="font-size:16px;">${status === 'pending' ? 'close' : 'person_remove'}</span>
                            <span>${status === 'pending' ? 'Cancel Request' : 'Remove Child'}</span>
                        </button>
                    `
                    : '';

                return `
                    <div class="connection-item">
                        <div class="connection-main">
                            <span class="connection-name">${primary}</span>
                            <span class="connection-meta">${secondary}</span>
                        </div>
                        <div class="connection-side">
                            <span class="status-badge ${badgeClass}">${badgeText}</span>
                            ${actionMarkup}
                        </div>
                    </div>
                `;
            }).join('');
        }

        async function loadConnections() {
            if (!state.uid) return;
            connectionsList.innerHTML = '<div class="empty-state">Loading connections...</div>';
            try {
                if (state.role === 'guardian') {
                    // (2026-07-13) Pass guardian email to loadConnections; was UID-only query
                    const links = await getAllLinksForGuardian(state.uid, state.email);
                    const visibleLinks = await Promise.all(
                        links
                            .filter((link) => link.status === 'accepted' || link.status === 'pending')
                            .map((link) => resolveGuardianChildDetails(link))
                    );
                    const primaryLink = visibleLinks.find((link) => link.status === 'accepted') || visibleLinks[0];
                    const childLabel = primaryLink?.studentName || primaryLink?.studentId || 'Pending child link';
                    guardianOfValue.textContent = childLabel;
                    guardianOfMeta.textContent = primaryLink?.studentId ? `Student ID: ${primaryLink.studentId}` : 'Student ID pending';
                    roleBadge.textContent = `Guardian of ${childLabel}`;
                    state.connections = visibleLinks;
                    renderConnectionsWithGuardianActions(visibleLinks);
                } else if (state.role === 'student') {
                    const links = await getLinksForStudent(state.studentId, state.uid);
                    state.connections = links;
                    renderConnections(links);
                } else {
                    state.connections = [];
                    renderConnections([]);
                }
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Connection load failed", error);
                state.connections = [];
                connectionsList.innerHTML = '<div class="empty-state">Could not load guardian information right now.</div>';
            }
        }

        guardianRequestName?.addEventListener('input', () => {
            state.selectedGuardianCandidate = null;
            guardianSearchHint.textContent = 'Search registered guardian names, then tap a result to fill the correct email.';
            renderGuardianSearchResults(guardianRequestName.value);
        });

        guardianRequestEmail?.addEventListener('input', () => {
            const candidate = state.selectedGuardianCandidate;
            if (!candidate) return;
            const matchesCandidateEmail = normalizeText(guardianRequestEmail.value) === normalizeText(candidate.email);
            const matchesCandidateName = normalizeText(guardianRequestName.value) === normalizeText(candidate.name);
            if (!matchesCandidateEmail || !matchesCandidateName) {
                state.selectedGuardianCandidate = null;
            }
        });

        guardianRequestName?.addEventListener('focus', () => {
            renderGuardianSearchResults(guardianRequestName.value);
        });

        guardianRequestName?.addEventListener('blur', () => {
            setTimeout(() => hideGuardianSearchResults(), 120);
        });

        guardianSearchResults?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-guardian-email][data-guardian-name]');
            if (!button || button.disabled) return;

            guardianRequestName.value = button.dataset.guardianName || '';
            guardianRequestEmail.value = button.dataset.guardianEmail || '';
            state.selectedGuardianCandidate = (state.guardianDirectory || []).find((guardian) =>
                normalizeText(guardian.email) === normalizeText(button.dataset.guardianEmail) &&
                normalizeText(guardian.name) === normalizeText(button.dataset.guardianName)
            ) || null;
            guardianSearchHint.textContent = 'Selected registered guardian account. You can send the request now.';
            hideGuardianSearchResults();
        });

        document.querySelectorAll('[data-password-target]').forEach((button) => {
            button.addEventListener('click', () => {
                const input = document.getElementById(button.dataset.passwordTarget || '');
                if (!input) return;

                const shouldShow = input.type === 'password';
                input.type = shouldShow ? 'text' : 'password';
                button.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
                const icon = button.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = shouldShow ? 'visibility_off' : 'visibility';
            });
        });

        editAvatarBtn?.addEventListener('click', () => {
            avatarInput?.click();
        });

        avatarInput?.addEventListener('change', async () => {
            const file = avatarInput.files?.[0];
            if (!file || !state.uid) return;

            if (!file.type.startsWith('image/')) {
                await showStatus('Invalid Image', 'Choose a valid image file for your profile picture.', 'error');
                avatarInput.value = '';
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                await showStatus('Image Too Large', 'Choose an image smaller than 2 MB.', 'error');
                avatarInput.value = '';
                return;
            }

            setButtonBusy(editAvatarBtn, true);
            try {
                const photoURL = await readFileAsDataUrl(file);
                await updateUserProfile(state.uid, { photoURL });
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { photoURL }).catch(() => { });
                }
                state.photoURL = photoURL;
                renderProfileAvatar();
                await showStatus('Profile Updated', 'Your profile picture has been updated.');
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Avatar update failed", error);
                await showStatus('Update Failed', error.message || 'Could not update your profile picture.', 'error');
            } finally {
                avatarInput.value = '';
                setButtonBusy(editAvatarBtn, false);
            }
        });

        editNameBtn.addEventListener('click', () => {
            setNameEditing(!state.nameEditing);
        });

        saveNameBtn.addEventListener('click', async () => {
            const newName = profileNameInput.value.trim();
            if (!newName) {
                await showStatus('Name Required', 'Please enter your name before saving.', 'error');
                return;
            }

            setButtonBusy(saveNameBtn, true);
            try {
                await updateUserProfile(state.uid, { name: newName });
                if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: newName }).catch(() => { });
                }
                state.name = newName;
                renderProfileAvatar();
                setNameEditing(false);
                await showStatus('Profile Updated', 'Your display name has been updated.');
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Name update failed", error);
                await showStatus('Update Failed', error.message || 'Could not update your profile name.', 'error');
            } finally {
                setButtonBusy(saveNameBtn, false);
                saveNameBtn.disabled = !state.nameEditing;
            }
        });

        // (2026-07-13) Handle personal email editing and saving; was static display
        editEmailBtn?.addEventListener('click', () => {
            if (emailDisplayWrap) emailDisplayWrap.style.display = 'none';
            if (emailEditWrap) emailEditWrap.style.display = 'flex';
            if (personalEmailInput) personalEmailInput.focus();
        });

        cancelPersonalEmailBtn?.addEventListener('click', () => {
            if (personalEmailInput) personalEmailInput.value = state.personalEmail || '';
            if (emailEditWrap) emailEditWrap.style.display = 'none';
            if (emailDisplayWrap) emailDisplayWrap.style.display = 'flex';
        });

        savePersonalEmailBtn?.addEventListener('click', async () => {
            const raw = personalEmailInput ? personalEmailInput.value.trim().toLowerCase() : '';
            if (!raw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
                await showStatus('Invalid Email', 'Please enter a valid email address.', 'error');
                return;
            }
            setButtonBusy(savePersonalEmailBtn, true);
            try {
                await updateUserProfile(state.uid, { personalEmail: raw });
                state.personalEmail = raw;
                if (profileEmail) profileEmail.textContent = raw;
                if (profileEmailValue) profileEmailValue.textContent = raw;
                if (emailEditWrap) emailEditWrap.style.display = 'none';
                if (emailDisplayWrap) emailDisplayWrap.style.display = 'flex';
                await showStatus('Email Saved', 'Your personal email address has been saved.');
            } catch (err) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Email save failed", err);
                await showStatus('Save Failed', err.message || 'Could not save email right now.', 'error');
            } finally {
                setButtonBusy(savePersonalEmailBtn, false);
            }
        });

        togglePasswordEditBtn.addEventListener('click', () => {
            setPasswordEditing(!state.passwordEditing);
        });

        savePasswordBtn.addEventListener('click', async () => {
            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();

            if (!currentPassword) {
                await showStatus('Current Password Required', 'Enter your current password before changing it.', 'error');
                return;
            }

            if (newPassword.length < 8) {
                await showStatus('Weak Password', 'Use at least 8 characters for the new password.', 'error');
                return;
            }

            if (currentPassword === newPassword) {
                await showStatus('Choose a New Password', 'Your new password must be different from your current password.', 'error');
                return;
            }

            if (newPassword !== confirmPassword) {
                await showStatus('Password Mismatch', 'The confirmation password does not match.', 'error');
                return;
            }

            setButtonBusy(savePasswordBtn, true);
            try {
                if (!auth.currentUser?.email) {
                    throw new Error('Your account email is missing. Please sign in again, then retry.');
                }

                const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
                await reauthenticateWithCredential(auth.currentUser, credential);
                await updatePassword(auth.currentUser, newPassword);
                setPasswordEditing(false);
                await showStatus('Password Updated', 'Your password has been changed successfully.');
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Password update failed", error);
                const message = error.code === 'auth/wrong-password'
                    ? 'The current password you entered is incorrect.'
                    : error.code === 'auth/invalid-credential'
                        ? 'The current password is incorrect. Please try again.'
                        : error.code === 'auth/requires-recent-login'
                            ? 'Please sign in again, then return here to change your password.'
                            : (error.message || 'Could not update the password right now.');
                await showStatus('Password Update Failed', message, 'error');
            } finally {
                setButtonBusy(savePasswordBtn, false);
                savePasswordBtn.disabled = !state.passwordEditing;
            }
        });

        logoutBtn.addEventListener('click', async () => {
            setButtonBusy(logoutBtn, true);
            try {
                await logout();
                window.location.href = '../public/login.html';
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Logout failed", error);
                setButtonBusy(logoutBtn, false);
                await showStatus('Logout Failed', error.message || 'Could not sign out right now.', 'error');
            }
        });

        guardianRequestBtn?.addEventListener('click', async () => {
            const guardianName = guardianRequestName.value.trim();
            const guardianEmail = guardianRequestEmail.value.trim().toLowerCase();

            if (state.role === 'guardian') {
                await showStatus('Unavailable', 'Only student accounts can request a parent or guardian link.', 'error');
                return;
            }
            if (guardianName.length < 3) {
                await showStatus('Name Required', 'Enter the full name of your parent or guardian.', 'error');
                return;
            }
            if (!guardianEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
                await showStatus('Email Required', 'Enter the registered guardian email address.', 'error');
                return;
            }

            setButtonBusy(guardianRequestBtn, true);
            try {
                const selectedCandidate = state.selectedGuardianCandidate;
                const candidateStillMatches = selectedCandidate &&
                    normalizeText(selectedCandidate.email) === guardianEmail &&
                    normalizeText(selectedCandidate.name) === guardianName.toLowerCase();

                const guardianAccount = candidateStillMatches
                    ? selectedCandidate
                    : await findUserByEmail(guardianEmail);
                if (!guardianAccount?.uid) {
                    throw new Error('No registered guardian account was found with that email.');
                }

                // (2026-07-13) Adopt registered guardian name when email matches; was strict exact string rejection
                const resolvedGuardianName = guardianAccount.name || guardianName;

                const duplicateLink = (state.connections || []).find((link) => {
                    const sameEmail = String(link.guardianEmail || '').trim().toLowerCase() === guardianEmail;
                    const sameGuardianId = guardianAccount.uid && guardianAccount.uid === link.guardianId;
                    return (sameEmail || sameGuardianId) && (link.status === 'accepted' || link.status === 'pending');
                });
                if (duplicateLink) {
                    throw new Error(
                        duplicateLink.status === 'accepted'
                            ? 'That parent or guardian is already linked to your account.'
                            : 'A request for that parent or guardian is already pending.'
                    );
                }

                await createGuardianLinkFromStudent({
                    studentUid: state.uid,
                    studentId: state.studentId,
                    studentName: state.name,
                    guardianEmail: guardianAccount.email || guardianEmail,
                    guardianName: guardianAccount.name || guardianName
                });

                guardianRequestName.value = '';
                guardianRequestEmail.value = '';
                state.selectedGuardianCandidate = null;
                guardianSearchHint.textContent = 'Search registered guardian names, then tap a result to fill the correct email.';
                await loadConnections();
                await showStatus('Request Sent', 'Your parent or guardian has been linked and notified on their account.');
            } catch (error) {
                await showStatus('Request Failed', error.message || 'Could not link that guardian account right now.', 'error');
            } finally {
                setButtonBusy(guardianRequestBtn, false);
            }
        });

        connectionsList?.addEventListener('click', async (event) => {
            const actionButton = event.target.closest('[data-link-action][data-link-id]');
            if (!actionButton || state.role !== 'guardian') return;

            const linkId = actionButton.dataset.linkId || '';
            const action = actionButton.dataset.linkAction || '';
            if (!linkId || !action) return;

            const link = (state.connections || []).find((entry) => String(entry.id) === String(linkId));
            const childLabel = link?.studentName || link?.studentId || 'this child request';

            setButtonBusy(actionButton, true);
            try {
                await removeGuardianLink(linkId);
                await loadConnections();
                await showStatus(
                    action === 'cancel' ? 'Request Cancelled' : 'Child Removed',
                    action === 'cancel'
                        ? `Your request for ${childLabel} has been cancelled.`
                        : `${childLabel} has been removed from your guardian profile.`
                );
            } catch (error) {
                await showStatus(
                    action === 'cancel' ? 'Cancel Failed' : 'Remove Failed',
                    error.message || 'Could not update this child link right now.',
                    'error'
                );
            } finally {
                setButtonBusy(actionButton, false);
            }
        });

        // (2026-07-13) Wire account deletion modal handlers; was unhandled
        const deleteModal = document.getElementById('deleteAccountModal');
        const openDeleteModalBtn = document.getElementById('openDeleteModalBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const deletePasswordInput = document.getElementById('deletePasswordConfirmInput');

        openDeleteModalBtn?.addEventListener('click', () => {
            if (deletePasswordInput) deletePasswordInput.value = '';
            if (deleteModal) deleteModal.classList.add('active');
        });

        cancelDeleteBtn?.addEventListener('click', () => {
            if (deleteModal) deleteModal.classList.remove('active');
        });

        confirmDeleteBtn?.addEventListener('click', async () => {
            const pwd = deletePasswordInput?.value?.trim() || '';
            setButtonBusy(confirmDeleteBtn, true);
            try {
                await deleteCurrentUserAccount(pwd);
                if (deleteModal) deleteModal.classList.remove('active');
                await showStatus('Account Deleted', 'Your account has been permanently erased.');
                // (2026-07-13) Redirect deleted account to role-selection; was student login
                const nextUrl = isNativeCapacitorApk()
                    ? '/public/role-selection.html'
                    : ((window.location.protocol === 'http:' || window.location.protocol === 'https:') ? '/role-selection/' : '../public/role-selection.html');
                setTimeout(() => {
                    window.location.replace(nextUrl);
                }, 900);
            } catch (err) {
                await showStatus('Deletion Failed', err.message || 'Could not delete account. Check password.', 'error');
            } finally {
                setButtonBusy(confirmDeleteBtn, false);
            }
        });

        // Guardian Context Menu Logic
        const guardianContextMenu = document.getElementById('guardianContextMenu');
        const cancelGuardianBtn = document.getElementById('cancelGuardianBtn');
        let currentContextLinkId = null;
        let currentContextLinkAction = null;

        document.addEventListener('click', () => {
            if (guardianContextMenu) guardianContextMenu.classList.add('is-hidden');
        });

        connectionsList?.addEventListener('contextmenu', (event) => {
            if (state.role === 'guardian') return; // Guardian has buttons
            const item = event.target.closest('.connection-item[data-link-id]');
            if (!item) return;

            event.preventDefault();
            currentContextLinkId = item.dataset.linkId;
            currentContextLinkAction = item.dataset.linkAction || 'remove';

            const btnText = currentContextLinkAction === 'cancel' ? 'Cancel Request' : 'Remove Guardian';
            cancelGuardianBtn.querySelector('span:last-child').textContent = btnText;

            guardianContextMenu.style.left = `${event.clientX}px`;
            guardianContextMenu.style.top = `${event.clientY}px`;
            guardianContextMenu.classList.remove('is-hidden');
        });

        cancelGuardianBtn?.addEventListener('click', async () => {
            if (!currentContextLinkId) return;
            const linkId = currentContextLinkId;
            const action = currentContextLinkAction;

            const link = (state.connections || []).find((entry) => String(entry.id) === String(linkId));
            const label = link?.guardianName || 'this guardian';

            setButtonBusy(cancelGuardianBtn, true);
            try {
                await removeGuardianLink(linkId);
                await loadConnections();
                await showStatus(
                    action === 'cancel' ? 'Request Cancelled' : 'Guardian Removed',
                    action === 'cancel'
                        ? `Your request for ${label} has been cancelled.`
                        : `${label} has been removed from your profile.`
                );
            } catch (error) {
                await showStatus(
                    action === 'cancel' ? 'Cancel Failed' : 'Remove Failed',
                    error.message || 'Could not update this guardian link right now.',
                    'error'
                );
            } finally {
                setButtonBusy(cancelGuardianBtn, false);
                guardianContextMenu.classList.add('is-hidden');
            }
        });

        onAuthStateChanged(auth, async (user) => {
            if (!user) return;
            state.uid = user.uid;

            try {
                let profile = await getUserProfile(user.uid);
                const currentAuthEmail = (user.email || '').toLowerCase().trim();
                const profileEmailNorm = (profile?.email || '').toLowerCase().trim();

                // (2026-07-13) Fix mismatched guardian profile on login; was stale email
                if (currentAuthEmail && profileEmailNorm && currentAuthEmail !== profileEmailNorm) {
                    const matchedUser = await findUserByEmail(currentAuthEmail);
                    const fixedName = matchedUser?.name || user.displayName || currentAuthEmail.split('@')[0];
                    profile = {
                        ...(profile || {}),
                        ...(matchedUser || {}),
                        email: currentAuthEmail,
                        name: fixedName,
                        role: matchedUser?.role || profile?.role || 'guardian'
                    };
                    await updateUserProfile(user.uid, {
                        email: currentAuthEmail,
                        name: fixedName,
                        role: profile.role
                    }).catch(() => { });
                }

                if ((profile?.role || '') === 'admin' || user.email === 'admin@admin.com') {
                    window.location.replace('../admin/admin.html');
                    return;
                }
                renderIdentity({
                    ...profile,
                    email: currentAuthEmail || profile?.email || '',
                    name: profile?.name || user.displayName || 'Securo User'
                });
                setNameEditing(false);
                setPasswordEditing(false);
                await loadGuardianDirectory();
                await loadConnections();
            } catch (error) {
                // (2026-10-07) Replace console.warn with Logger; was bare console.warn
                Logger.warn("Profile", "Profile load failed", error);
                await showStatus('Profile Error', 'Could not load your profile details right now.', 'error');
            }
        });

        // (2026-07-13) Prevent image drag across entire application; was draggable
        window.addEventListener('dragstart', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        }, false);
    },
    'settings': async function () {
        // Core utilities and offline support
        // (2026-07-13) Fix install-sw path to js/ folder; was broken root path

        // (2026-07-13) Import deleteCurrentUserAccount; was getUserProfile only

        checkAuth();

        const settingsUserMeta = document.getElementById('settingsUserMeta');
        const settingsBackBtn = document.getElementById('settingsBackBtn');
        const dashboardShortcut = document.getElementById('dashboardShortcut');
        const guardianShareRow = document.getElementById('guardianShareRow');

        const controls = {
            notificationSounds: document.getElementById('notifSoundsToggle'),
            anonymousSupportDefault: document.getElementById('anonymousSupportToggle'),
            guardianMediaDefault: document.getElementById('guardianMediaToggle'),
            locationReminders: document.getElementById('locationReminderToggle')
        };

        const defaultSettings = {
            notificationSounds: true,
            anonymousSupportDefault: true,
            guardianMediaDefault: true,
            locationReminders: true
        };

        function getSettingsStorageKey(uid) {
            return `securo_settings_${uid || 'guest'}`;
        }

        function loadSettings(uid) {
            try {
                const raw = localStorage.getItem(getSettingsStorageKey(uid));
                const parsed = raw ? JSON.parse(raw) : {};
                return { ...defaultSettings, ...parsed };
            } catch {
                return { ...defaultSettings };
            }
        }

        function saveSettings(uid) {
            const payload = {
                notificationSounds: controls.notificationSounds?.checked !== false,
                anonymousSupportDefault: controls.anonymousSupportDefault?.checked !== false,
                guardianMediaDefault: controls.guardianMediaDefault?.checked !== false,
                locationReminders: controls.locationReminders?.checked !== false
            };
            localStorage.setItem(getSettingsStorageKey(uid), JSON.stringify(payload));
        }

        function bindSettings(uid) {
            const settings = loadSettings(uid);
            Object.entries(controls).forEach(([key, element]) => {
                if (!element) return;
                element.checked = settings[key] !== false;
                element.addEventListener('change', () => saveSettings(uid), { passive: true });
            });
        }

        // (2026-07-13) Wire delete account modal in settings; was missing
        const openDeleteAccountBtn = document.getElementById('openDeleteAccountBtn');
        const deleteAccountModal = document.getElementById('deleteAccountModal');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const deletePasswordInput = document.getElementById('deletePasswordInput');

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

        openDeleteAccountBtn?.addEventListener('click', () => {
            if (deletePasswordInput) deletePasswordInput.value = '';
            if (deleteAccountModal) deleteAccountModal.style.display = 'flex';
        });

        cancelDeleteBtn?.addEventListener('click', () => {
            if (deleteAccountModal) deleteAccountModal.style.display = 'none';
        });

        confirmDeleteBtn?.addEventListener('click', async () => {
            const pwd = deletePasswordInput?.value?.trim() || '';
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.textContent = 'Deleting...';
            try {
                await deleteCurrentUserAccount(pwd);
                alert('Your account has been permanently deleted.');
                window.location.replace('../public/login.html');
                // (2026-07-13) Use styled modals for settings account delete; was alert
                await UI.showModal('Account Deleted', 'Your account has been permanently deleted.', { type: 'success', confirmText: 'OK' });
                const nextUrl = isNativeCapacitorApk()
                    ? '/public/role-selection.html'
                    : ((window.location.protocol === 'http:' || window.location.protocol === 'https:') ? '/role-selection/' : '../public/role-selection.html');
                window.location.replace(nextUrl);
            } catch (err) {
                alert(err.message || 'Could not delete account. Please verify password.');
                await UI.showModal('Deletion Failed', err.message || 'Could not delete account. Please verify your password.', { type: 'error', confirmText: 'OK' });
                confirmDeleteBtn.disabled = false;
                confirmDeleteBtn.textContent = 'Confirm Delete';
            }
        });

        onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const profile = await getUserProfile(user.uid).catch(() => null);
            const role = profile?.role || (user.email?.startsWith('staff.') ? 'staff' : 'student');
            const name = profile?.name || user.displayName || 'Securo User';
            const idLabel = profile?.studentId || (role === 'guardian' ? 'Guardian Account' : role === 'admin' ? 'Administrator' : 'ID not linked');

            settingsUserMeta.textContent = `${name} • ${role === 'guardian' ? 'Guardian' : role === 'staff' ? 'Staff' : role === 'admin' ? 'Admin' : 'Student'} • ${idLabel}`;

            if (role === 'admin' || user.email === 'admin@admin.com') {
                document.body.classList.remove('guardian-theme', 'staff-theme');
                document.documentElement.classList.remove('role-staff');
                settingsBackBtn.href = '../admin/admin.html';
                dashboardShortcut.href = '../admin/admin.html';
                guardianShareRow.style.display = 'none';
            } else if (role === 'guardian') {
                document.body.classList.remove('staff-theme');
                document.documentElement.classList.remove('role-staff');
                document.body.classList.add('guardian-theme');
                settingsBackBtn.href = '../parent/parent.html';
                dashboardShortcut.href = '../parent/parent.html';
                guardianShareRow.style.display = 'none';
            } else if (role === 'staff') {
                // (2026-07-13) Blue staff settings & hide parent share row; was student
                document.body.classList.remove('guardian-theme');
                document.body.classList.add('staff-theme');
                document.documentElement.classList.add('role-staff');
                settingsBackBtn.href = '../staff/staff.html';
                dashboardShortcut.href = '../staff/staff.html';
                if (guardianShareRow) guardianShareRow.style.display = 'none';
            } else {
                document.body.classList.remove('guardian-theme', 'staff-theme');
                document.documentElement.classList.remove('role-staff');
                settingsBackBtn.href = getRoleDashboardUrl(role);
                dashboardShortcut.href = getRoleDashboardUrl(role);
                if (guardianShareRow) guardianShareRow.style.display = 'flex';
            }

            bindSettings(user.uid);
        });
    }
};

const activePage = document.body?.dataset?.page;
if (activePage && PAGE_CONTROLLERS[activePage]) {
    PAGE_CONTROLLERS[activePage]();
}
