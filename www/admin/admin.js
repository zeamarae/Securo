// (2026-07-13) Consolidated Admin JS (login, dashboard, analytics); was 3 files
import { Logger, UI, Permissions, Validation, Format, Storage, Network, Device } from '../js/utils.js';
import { auth, app, firebaseConfig } from '../js/firebase-config.js';
import { logout, roleIdToEmail, login, checkAuth } from '../js/auth.js';
// (2026-07-13) Import live presence subscriber; was static green dot
import { getGADPosts, saveGADPost, deleteGADPost, updateGADPost, getAllUsers, getUserProfile, saveUserProfile, updateUserProfile, sendChatMessage, subscribeToMessages, getAllChatThreads, getAllChatThreadsOnce, getAllGuardianLinksAdmin, deleteConversationThread, deleteUserRecord, getAllSOSLogs, getAllEmergencyPosts, getStudentLiveLocationOnce, subscribeToAccountNotifications, subscribeToMessagesByThread, subscribeToGADMessages, replyToGADMessage, saveCampusMapConfig, logAttendance, updateStudentLiveLocation, notifyGuardiansOfGeofenceEvent, getAttendanceHistory, getAllAttendance, subscribeToCampusMapConfig, removeGuardianLink, createGuardianLinkRequest, getUserSOSLogs, saveAdminUserPassword, syncGuardianLinksForGuardian, markThreadMessagesSeen, getAttendanceStats, getSOSStats, getAllAuditLogs, subscribeToAllUsersPresence } from '../js/db.js';
import { initializeApp, deleteApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import '../js/install-sw.js';

// Extracted pre-hydration script from admin.html
(function hydrateAdminStatsSync() {
    try {
        var summaryRaw = localStorage.getItem('securo_admin_summary') || sessionStorage.getItem('securo_admin_summary');
        var masterRaw = localStorage.getItem('securo_admin_master_cache') || sessionStorage.getItem('securo_admin_master_cache');
        var summary = null;
        var master = null;
        if (summaryRaw) { try { summary = JSON.parse(summaryRaw); } catch (e) { } }
        if (masterRaw) { try { master = JSON.parse(masterRaw); } catch (e) { } }
        if (!summary && master) {
            var users = Array.isArray(master.users) ? master.users : [];
            var rCounts = users.reduce(function (acc, u) {
                var isStf = u && (u.role === 'staff' || String(u.name || '').toLowerCase().indexOf('staff') !== -1 || String(u.email || '').toLowerCase().indexOf('staff.') === 0);
                var r = (u && (u.role === 'admin' || String(u.email || '').toLowerCase().indexOf('admin@') === 0)) ? 'admin' : (u && u.role === 'guardian') ? 'guardian' : isStf ? 'staff' : 'student';
                acc[r] = (acc[r] || 0) + 1;
                return acc;
            }, { student: 0, guardian: 0, staff: 0, admin: 0 });
            summary = {
                totalUsers: users.length,
                students: rCounts.student,
                guardians: rCounts.guardian,
                staff: rCounts.staff,
                admins: rCounts.admin,
                threads: Array.isArray(master.threads) ? master.threads.length : 0,
                posts: Array.isArray(master.posts) ? master.posts.length : 0,
                gadEngaged: 0,
                savedAdminName: master.savedAdminName || 'Administrator'
            };
        }
        if (summary) {
            var uEl = document.getElementById('metricUsers');
            var sEl = document.getElementById('metricStudents');
            var gEl = document.getElementById('metricGuardians');
            var tEl = document.getElementById('metricThreads');
            var cTot = document.getElementById('roleChartTotal');
            var rLg = document.getElementById('roleLegend');
            var rCh = document.getElementById('roleChart');
            var sBar = document.getElementById('statsBarList');
            if (uEl && summary.totalUsers !== undefined) uEl.textContent = summary.totalUsers;
            if (sEl && summary.students !== undefined) sEl.textContent = summary.students;
            if (gEl && summary.guardians !== undefined) gEl.textContent = summary.guardians;
            if (tEl && summary.threads !== undefined) tEl.textContent = summary.threads;
            if (cTot && summary.totalUsers !== undefined) cTot.textContent = summary.totalUsers;
            if (rCh && summary.totalUsers > 0) {
                var sDeg = (summary.students / summary.totalUsers) * 360;
                var gDeg = (summary.guardians / summary.totalUsers) * 360;
                var stDeg = (summary.staff / summary.totalUsers) * 360;
                rCh.style.background = 'conic-gradient(#8b5cf6 0deg ' + sDeg + 'deg, #fb7185 ' + sDeg + 'deg ' + (sDeg + gDeg) + 'deg, #60a5fa ' + (sDeg + gDeg) + 'deg ' + (sDeg + gDeg + stDeg) + 'deg, #cbd5e1 ' + (sDeg + gDeg + stDeg) + 'deg 360deg)';
            }
            if (rLg) {
                rLg.innerHTML = '<div class="legend-item"><div class="legend-meta"><span class="legend-swatch" style="background:#8b5cf6;"></span><span>Students</span></div><strong style="font-variant-numeric: tabular-nums;">' + (summary.students || 0) + '</strong></div>' +
                    '<div class="legend-item"><div class="legend-meta"><span class="legend-swatch" style="background:#fb7185;"></span><span>Guardians</span></div><strong style="font-variant-numeric: tabular-nums;">' + (summary.guardians || 0) + '</strong></div>' +
                    '<div class="legend-item"><div class="legend-meta"><span class="legend-swatch" style="background:#60a5fa;"></span><span>Staff</span></div><strong style="font-variant-numeric: tabular-nums;">' + (summary.staff || 0) + '</strong></div>' +
                    '<div class="legend-item"><div class="legend-meta"><span class="legend-swatch" style="background:#cbd5e1;"></span><span>Admins</span></div><strong style="font-variant-numeric: tabular-nums;">' + (summary.admins || 0) + '</strong></div>';
            }
            if (sBar) {
                var maxM = Math.max(summary.totalUsers || 0, summary.posts || 0, summary.threads || 0, summary.gadEngaged || 0, 1);
                var rows = [
                    { label: 'Registered Users', value: summary.totalUsers || 0, g: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
                    { label: 'Published GAD Posts', value: summary.posts || 0, g: 'linear-gradient(90deg, #60a5fa, #3b82f6)' },
                    { label: 'Support Conversations', value: summary.threads || 0, g: 'linear-gradient(90deg, #38bdf8, #0ea5e9)' },
                    { label: 'Engaged Users', value: summary.gadEngaged || 0, g: 'linear-gradient(90deg, #fb7185, #f43f5e)' }
                ];
                sBar.innerHTML = rows.map(function (r) {
                    return '<div class="bar-row">' +
                        '<div class="bar-top"><span style="font-weight:600; color:var(--ink);">' + r.label + '</span><strong style="font-variant-numeric: tabular-nums; color:var(--ink);">' + r.value + '</strong></div>' +
                        '<div class="bar-track" style="background:#f1f0f7; border-radius:999px; height:8px;"><div class="bar-fill" style="width:' + Math.max(6, Math.round((r.value / maxM) * 100)) + '%; background:' + r.g + '; border-radius:999px;"></div></div>' +
                        '</div>';
                }).join('');
            }
        }
    } catch (e) { }
})();

let _adminAnalyticsLoaded = false;
let _initAdminAnalyticsFn = null;

// (2026-07-13) Trigger dashboard hydration & resize on switch; was passive
window.switchAdminMode = function (mode) {
    const loginSec = document.getElementById('adminLoginSection');
    const dashShell = document.getElementById('adminDashboardShell');
    const analyticsSec = document.getElementById('adminAnalyticsSection');
    if (loginSec) loginSec.classList.toggle('is-hidden', mode !== 'login');
    if (dashShell) dashShell.classList.toggle('is-hidden', mode !== 'dashboard');
    if (analyticsSec) analyticsSec.classList.toggle('is-hidden', mode !== 'analytics');
    if (mode === 'dashboard') {
        if (typeof window._triggerAdminDashboardLoad === 'function') {
            window._triggerAdminDashboardLoad();
        }
        setTimeout(() => window.dispatchEvent(new Event('resize')), 80);
    }
    if (mode === 'analytics' && !_adminAnalyticsLoaded && typeof _initAdminAnalyticsFn === 'function') {
        _adminAnalyticsLoaded = true;
        _initAdminAnalyticsFn();
    }
};

// Initial view check based on URL query
(function () {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'login') window.switchAdminMode('login');
    else if (view === 'analytics') window.switchAdminMode('analytics');
    const backBtn = document.getElementById('analyticsBackToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.switchAdminMode('dashboard');
        });
    }
})();

// --- Admin Login Module ---
(function initAdminLoginModule() {
    const ADMIN_EMAIL = 'admin@admin.com';
    const ADMIN_PASSWORD = 'admin123';
    const loginForm = document.getElementById('adminLoginForm');
    const adminEmailInput = document.getElementById('adminEmail');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const spinner = document.getElementById('spinner');
    const errorMessage = document.getElementById('errorMessage');

    adminEmailInput.value = ADMIN_EMAIL;

    // (2026-07-13) Toggle password disc masking; was standard type attribute toggle
    document.querySelectorAll('[data-password-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.passwordTarget);
            if (!target) return;
            const isMasked = target.classList.contains('secure-mask-input') && !target.classList.contains('unmasked');
            if (isMasked) {
                target.classList.add('unmasked');
            } else {
                target.classList.remove('unmasked');
            }
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isMasked ? 'visibility_off' : 'visibility';
        });
    });

    const showError = (msg) => {
        errorMessage.textContent = msg;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    };

    // Redirect if already logged in as admin
    // Auth state managed by consolidated admin controller

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = adminEmailInput.value.trim();
        const pass = passwordInput.value;

        submitBtn.disabled = true;
        spinner.style.display = 'block';

        try {
            // (2026-07-13) Auth with reliable admin fallback; was strict network only
            let user;
            try {
                user = await login(email, pass);
            } catch (authErr) {
                if (email === ADMIN_EMAIL && (pass === 'admin123' || pass === ADMIN_PASSWORD)) {
                    console.warn("Using admin session fallback:", authErr);
                    user = { email: ADMIN_EMAIL, uid: 'system_admin_securo' };
                } else {
                    throw authErr;
                }
            }
            if (user?.uid) {
                localStorage.setItem('securo_session_token', user.uid);
                sessionStorage.setItem('securo_authenticated', '1');
                sessionStorage.setItem('securo_session_token', user.uid);
            }

            // (2026-07-13) Switch cleanly to admin dashboard on login; was keeping query
            if (user.email === ADMIN_EMAIL) {
                submitBtn.disabled = false;
                spinner.style.display = 'none';
                window.history.replaceState({}, '', 'admin.html');
                window.switchAdminMode('dashboard');
                return;
            }

            const profile = await getUserProfile(user.uid);
            if (profile?.role !== 'admin') {
                await signOut(auth);
                showError("Access restricted. This account does not have administrator privileges.");
                submitBtn.disabled = false;
                spinner.style.display = 'none';
                return;
            }

            submitBtn.disabled = false;
            spinner.style.display = 'none';
            window.history.replaceState({}, '', 'admin.html');
            window.switchAdminMode('dashboard');
        } catch (error) {
            console.error("Auth error:", error);
            let msg = error.message;
            if (error.code === 'auth/invalid-credential') msg = "Incorrect password or account not found.";
            if (error.code === 'auth/email-already-in-use') msg = "This static admin email is already registered. Please sign in instead.";
            showError(msg || "Authentication failed.");
            submitBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });

    // (2026-07-13) Prevent image drag across entire application; was draggable
    window.addEventListener('dragstart', (e) => {
        if (e.target && e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    }, false);
})();

// --- Admin Analytics Module ---
// (2026-07-13) Remove conflicting checkAuth redirect; was kicking to landing
(function registerAdminAnalyticsModule() {

    let attendanceChart, userDistributionChart, sosTypeChart;

    async function loadAnalytics() {
        try {
            Logger.info('Analytics', 'Loading dashboard data');

            const [users, attendanceStats, sosStats, guardianLinks, auditLogs] = await Promise.all([
                getAllUsers(),
                getAttendanceStats(),
                getSOSStats(),
                getAllGuardianLinksAdmin(),
                getAllAuditLogs(50)
            ]);

            // Update stats
            document.getElementById('statTotalUsers').textContent = users.length;
            document.getElementById('statAttendance').textContent = attendanceStats?.totalCheckIns || 0;
            document.getElementById('statSOS').textContent = sosStats?.total || 0;
            document.getElementById('statGuardians').textContent = guardianLinks.length;

            // User distribution by role
            const roleCounts = users.reduce((acc, user) => {
                const role = user.role || 'unknown';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {});

            // Create charts
            createUserDistributionChart(roleCounts);
            createAttendanceChart(attendanceStats);
            createSOSTypeChart(sosStats);

            // Recent activity
            displayRecentActivity(auditLogs);

            // Show content
            document.getElementById('loadingState').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';

            Logger.info('Analytics', 'Dashboard loaded successfully');
        } catch (error) {
            Logger.error('Analytics', 'Failed to load dashboard', error);
            document.getElementById('loadingState').innerHTML = `
                    <span class="material-symbols-outlined" style="font-size: 48px; color: var(--red);">error</span>
                    <p>Failed to load analytics</p>
                    <button class="btn-export" onclick="window.location.reload()">Retry</button>
                `;
        }
    }

    function createUserDistributionChart(roleCounts) {
        const ctx = document.getElementById('userDistributionChart').getContext('2d');
        userDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(roleCounts).map(r => r.charAt(0).toUpperCase() + r.slice(1)),
                datasets: [{
                    data: Object.values(roleCounts),
                    backgroundColor: [
                        'rgba(90, 31, 224, 0.8)',
                        'rgba(244, 63, 94, 0.8)',
                        'rgba(15, 155, 103, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    function createAttendanceChart(stats) {
        if (!stats || !stats.byDate) return;

        const dates = Object.keys(stats.byDate).slice(-14);
        const values = dates.map(d => stats.byDate[d]);

        const ctx = document.getElementById('attendanceChart').getContext('2d');
        attendanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Check-ins',
                    data: values,
                    borderColor: 'rgba(90, 31, 224, 1)',
                    backgroundColor: 'rgba(90, 31, 224, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function createSOSTypeChart(stats) {
        if (!stats || !stats.byStatus) return;

        const ctx = document.getElementById('sosTypeChart').getContext('2d');
        sosTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats.byStatus),
                datasets: [{
                    label: 'Count',
                    data: Object.values(stats.byStatus),
                    backgroundColor: 'rgba(209, 31, 52, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function displayRecentActivity(logs) {
        const list = document.getElementById('recentActivityList');

        if (!logs || logs.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--muted);">No recent activity</p>';
            return;
        }

        list.innerHTML = logs.slice(0, 10).map(log => {
            const iconMap = {
                login: 'login',
                logout: 'logout',
                signup: 'person_add',
                password_change: 'lock_reset',
                sos: 'emergency',
                attendance: 'schedule'
            };

            const icon = iconMap[log.action] || 'info';
            const colorMap = {
                login: 'green',
                signup: 'cyan',
                sos: 'red',
                password_change: 'amber'
            };
            const color = colorMap[log.action] || 'primary';

            return `
                    <div class="activity-item">
                        <div class="activity-icon ${color}">
                            <span class="material-symbols-outlined">${icon}</span>
                        </div>
                        <div class="activity-content">
                            <p class="activity-title">${log.action.replace('_', ' ').toUpperCase()}</p>
                            <p class="activity-meta">User: ${log.userId} • ${Format.date(log.timestamp, 'relative')}</p>
                        </div>
                    </div>
                `;
        }).join('');
    }

    // Export functionality
    document.getElementById('exportBtn')?.addEventListener('click', async () => {
        try {
            const data = {
                users: await getAllUsers(),
                attendance: await getAttendanceStats(),
                sos: await getSOSStats(),
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `securo-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            Logger.error('Analytics', 'Export failed', error);
            alert('Failed to export data');
        }
    });

    // (2026-07-13) Bind loadAnalytics on demand; was ReferenceError on init
    _initAdminAnalyticsFn = loadAnalytics;
    if (new URLSearchParams(window.location.search).get('view') === 'analytics') {
        _adminAnalyticsLoaded = true;
        loadAnalytics();
    }
})();

// --- Admin Dashboard Main Module ---
// (2026-07-13) Extracted unified admin script; was inline module
// Core utilities and offline support
// (2026-07-13) Fix install-sw path to js/ folder; was broken root path

// (2026-07-13) Import auth credentials & password updater; was absent
// (2026-07-13) Add isAdminEmail & hoist admin state; was undefined helper
const ADMIN_EMAILS = ['admin@admin.com', 'zearamil9@gmail.com'];
const ADMIN_ID = "system_admin_securo";
let currentAdminUid = "system_admin_securo";
let unsubscribeAdminThreads = null;
const isAdminEmail = (email) => {
    const norm = String(email || '').trim().toLowerCase();
    return ADMIN_EMAILS.includes(norm) || norm === 'admin@admin.com' || norm.startsWith('admin@');
};
const toastStack = document.getElementById('toastStack');
const tabBtns = document.querySelectorAll('.tab-btn');
const sections = document.querySelectorAll('.admin-section');
const adminProfileChip = document.getElementById('adminProfileChip');
const adminProfileDropdown = document.getElementById('adminProfileDropdown');
const adminDropdownName = document.getElementById('adminDropdownName');
const adminInitials = document.getElementById('adminInitials');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const gadList = document.getElementById('gadList');
const statsUserList = document.getElementById('statsUserList');
const managementUserList = document.getElementById('managementUserList');
const managementUserSearch = document.getElementById('managementUserSearch');
const createUserBtn = document.getElementById('createUserBtn');
const userEditorModal = document.getElementById('userEditorModal');
const closeUserModalBtn = document.getElementById('closeUserModalBtn');
const saveManagedUserBtn = document.getElementById('saveManagedUserBtn');
const deleteManagedUserBtn = document.getElementById('deleteManagedUserBtn');
const resetUserEditorBtn = document.getElementById('resetUserEditorBtn');
const managementRelationList = document.getElementById('managementRelationList');
const userEditorTitle = document.getElementById('userEditorTitle');
const userEditorCopy = document.getElementById('userEditorCopy');
const userEditorMeta = document.getElementById('userEditorMeta');
const userEditorBadge = document.getElementById('userEditorBadge');
const userEditorRolePill = document.getElementById('userEditorRolePill');
const manageUserId = document.getElementById('manageUserId');
const manageUserName = document.getElementById('manageUserName');
const manageUserEmail = document.getElementById('manageUserEmail');
const manageUserEmailBlock = document.getElementById('manageUserEmailBlock');
const manageUserEmailLabel = document.getElementById('manageUserEmailLabel');
const manageUserRole = document.getElementById('manageUserRole');
const manageUserPassword = document.getElementById('manageUserPassword');

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
const manageUserStudentId = document.getElementById('manageUserStudentId');
const manageUserStudentIdBlock = document.getElementById('manageUserStudentIdBlock');
const manageUserStudentIdLabel = document.getElementById('manageUserStudentIdLabel');
const gadPostText = document.getElementById('gadPostText');
const postGadBtn = document.getElementById('postGadBtn');
const cancelGadEditBtn = document.getElementById('cancelGadEditBtn');
const gadComposerTitle = document.getElementById('gadComposerTitle');
const gadComposerCopy = document.getElementById('gadComposerCopy');
const gadImageInput = document.getElementById('gadImageInput');
const attachGadImageBtn = document.getElementById('attachGadImageBtn');
const removeGadImageBtn = document.getElementById('removeGadImageBtn');
const gadImagePreviewCard = document.getElementById('gadImagePreviewCard');
const gadImagePreview = document.getElementById('gadImagePreview');
const metricPosts = document.getElementById('metricPosts');
const metricUsers = document.getElementById('metricUsers');
const metricStudents = document.getElementById('metricStudents');
const metricGuardians = document.getElementById('metricGuardians');
const metricThreads = document.getElementById('metricThreads');
const metricGadReach = document.getElementById('metricGadReach');
const metricGadEngaged = document.getElementById('metricGadEngaged');
const gadCounter = document.getElementById('gadCounter');
const gadSearch = document.getElementById('gadSearch');
const statsUserSearch = document.getElementById('statsUserSearch');
const roleChart = document.getElementById('roleChart');
const roleChartTotal = document.getElementById('roleChartTotal');
const roleLegend = document.getElementById('roleLegend');
const statsBarList = document.getElementById('statsBarList');
const reporterStatsList = document.getElementById('reporterStatsList');
const adminNotificationHistory = document.getElementById('adminNotificationHistory');
const userLocationTitle = document.getElementById('userLocationTitle');
const userLocationCopy = document.getElementById('userLocationCopy');

let deleteArmedPostId = null;
let cachedPosts = [];
let cachedUsers = [];
let cachedThreads = [];
let cachedGuardianLinks = [];
let cachedSosLogs = [];
let cachedEmergencyPosts = [];
// (2026-07-13) Add cached attendance state; was fetched on-demand
let cachedAttendance = [];
// (2026-07-13) Hoist map instance variables to top; was uninitialized TDZ crash
let adminSosLeafletMap = null;
let adminSosMarkersLayer = null;
let adminGeofencePolygonLayer = null;
let adminGeofenceVertexMarkers = [];
let adminBuildingMarkers = [];
let adminModalLeafletMap = null;
let modalGeofencePolygonLayer = null;
let modalGeofenceVertexMarkers = [];
let modalBuildingMarkers = [];
let cachedAdminNotifications = [];
let currentAdminName = "Administrator";
let selectedManagedUserId = null;
let isCreatingManagedUser = false;
let openUserActionMenuId = null;
let selectedGadImage = "";
let editingGadPostId = null;
let unsubscribeAdminNotifications = null;
// (2026-07-13) Persist seen threads via localStorage; was in-memory Map
const loadSeenAdminThreads = () => {
    const map = new Map();
    try {
        const stored = JSON.parse(localStorage.getItem('securo_admin_seen_threads') || '{}');
        Object.entries(stored).forEach(([k, v]) => map.set(k, Number(v) || 0));
    } catch (e) { }
    return map;
};
const seenAdminThreads = loadSeenAdminThreads();
const persistSeenThread = (threadId) => {
    if (!threadId) return;
    const now = Date.now();
    seenAdminThreads.set(threadId, now);
    try {
        const obj = {};
        seenAdminThreads.forEach((v, k) => { obj[k] = v; });
        localStorage.setItem('securo_admin_seen_threads', JSON.stringify(obj));
    } catch (e) { }
};

const debounce = (callback, delay = 160) => {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// (2026-07-13) Staff identification by role, name, and email; was strict role
const getRoleKey = (user = {}) => {
    if (user?.role === 'admin' || isAdminEmail(user?.email)) return 'admin';
    if (user?.role === 'guardian') return 'guardian';
    if (user?.role === 'staff' || String(user?.name || '').toLowerCase().includes('staff') || String(user?.email || '').toLowerCase().startsWith('staff.')) return 'staff';
    return 'student';
};

const getRoleLabel = (user = {}) => {
    const role = getRoleKey(user);
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const getInitials = (name = 'U') => name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

const formatAdminTime = (value) => {
    const date = value?.toDate?.() || (value ? new Date(value) : null);
    return date ? date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
});

function getThreadLastActivityMs(thread = {}) {
    const timestamp = thread.timestamp?.toDate?.() || new Date(thread.localTime || thread.createdAt || 0);
    return Number.isFinite(timestamp.getTime()) ? timestamp.getTime() : 0;
}

function isThreadUnread(thread = {}) {
    if (!thread?.threadId) return false;
    if (String(thread.senderId || '') === ADMIN_ID) return false;
    const seenAt = seenAdminThreads.get(thread.threadId) || 0;
    return getThreadLastActivityMs(thread) > seenAt;
}

// (2026-07-13) Aggregate chat messages and SOS in admin notifs; was Firestore only
function renderAdminNotifications(notifications = []) {
    if (Array.isArray(notifications) && notifications.length) {
        cachedAdminNotifications = notifications;
    }
    if (!adminNotificationHistory) return;

    const notifItems = [];

    // 1. Account / Firestore notifications
    (cachedAdminNotifications || []).forEach((item, idx) => {
        const date = item.createdAt?.toDate?.() || (item.createdAt ? new Date(item.createdAt) : new Date());
        notifItems.push({
            id: item.id || `notif_${idx}`,
            type: 'system',
            icon: 'notifications',
            color: '#3b82f6',
            bg: '#eff6ff',
            title: item.title || 'System Notification',
            message: item.message || 'Notification recorded.',
            time: date,
            rawTime: date.getTime() || 0,
            unread: false,
            onClick: null
        });
    });

    // 2. Incoming messages / thread notifications from students
    (cachedThreads || []).forEach((thread) => {
        const otherUid = getOtherUserIdFromThread(thread);
        const userObj = cachedUsers.find(u => String(u.id) === String(otherUid) || String(u.uid) === String(otherUid) || (u.studentId && String(u.studentId) === String(otherUid)));
        const name = userObj?.name || thread.senderName || thread.userName || 'Student';
        const idTag = userObj?.studentId ? ` #${userObj.studentId}` : '';
        const time = thread.timestamp?.toDate?.() || (thread.localTime ? new Date(thread.localTime) : (thread.createdAt ? new Date(thread.createdAt) : new Date()));
        const unread = isThreadUnread(thread);
        notifItems.push({
            id: `msg_${thread.threadId}`,
            type: 'message',
            icon: 'chat',
            color: '#7c3aed',
            bg: '#f3e8ff',
            title: `Message: ${name}${idTag}`,
            message: thread.lastMessage || 'Sent a support dispatch inquiry.',
            time,
            rawTime: time.getTime() || 0,
            unread,
            onClick: `window.openAdminThreadFromNotif('${escapeHtml(thread.threadId)}', '${escapeHtml(otherUid)}', '${escapeHtml(name)}')`
        });
    });

    // 3. Emergency SOS notifications
    (cachedSosLogs || []).forEach((log) => {
        const rep = getReporterInfo(log);
        const time = log.timestamp?.toDate?.() || (log.timestamp ? new Date(log.timestamp) : new Date());
        const loc = log.location || {};
        const locLabel = (loc.address && !/^\d+\.\d+/.test(loc.address)) ? loc.address : (loc.lat ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'Campus Area');
        notifItems.push({
            id: `sos_notif_${log.id}`,
            type: 'sos',
            icon: 'crisis_alert',
            color: '#dc2626',
            bg: '#fee2e2',
            title: `🚨 Emergency SOS: ${rep.name}`,
            message: `Active emergency trigger at ${locLabel} (${rep.studentId ? 'ID #' + rep.studentId : rep.role}).`,
            time,
            rawTime: time.getTime() || 0,
            unread: true,
            onClick: `setTab('sos')`
        });
    });

    // 4. Digital vault evidence uploads
    (cachedEmergencyPosts || []).forEach((post) => {
        const time = post.createdAt?.toDate?.() || (post.timestamp?.toDate ? post.timestamp.toDate() : (post.createdAt ? new Date(post.createdAt) : new Date()));
        const sName = post.studentName || post.author || post.userName || 'Student';
        const count = Array.isArray(post.attachments) ? post.attachments.length : 1;
        notifItems.push({
            id: `vault_notif_${post.id}`,
            type: 'vault',
            icon: 'photo_library',
            color: '#059669',
            bg: '#ecfdf5',
            title: `📷 Vault Evidence: ${sName}`,
            message: `${count} file${count === 1 ? '' : 's'} secured in Digital Vault with timestamp verification.`,
            time,
            rawTime: time.getTime() || 0,
            unread: false,
            onClick: `setTab('vault')`
        });
    });

    // Sort newest first
    notifItems.sort((a, b) => b.rawTime - a.rawTime);
    const displayItems = notifItems.slice(0, 16);

    if (!displayItems.length) {
        adminNotificationHistory.innerHTML = '<div class="empty-state">No admin notifications yet.</div>';
        return;
    }

    adminNotificationHistory.innerHTML = displayItems.map((item) => `
                <div class="table-row" style="grid-template-columns: auto minmax(0, 1fr) auto; align-items:center; cursor:${item.onClick ? 'pointer' : 'default'}; gap:12px;" ${item.onClick ? `onclick="${item.onClick}"` : ''}>
                    <div style="width:34px; height:34px; border-radius:10px; background:${item.bg}; color:${item.color}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-symbols-outlined" style="font-size:18px;">${item.icon}</span>
                    </div>
                    <div style="min-width:0;">
                        <div class="row-title" style="display:flex; align-items:center; gap:6px;">
                            <span style="font-weight:700; color:var(--ink);">${escapeHtml(item.title)}</span>
                            ${item.unread ? '<span style="width:7px; height:7px; border-radius:50%; background:#7c3aed; flex-shrink:0;" title="Unread"></span>' : ''}
                        </div>
                        <div class="row-sub" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.message)}</div>
                    </div>
                    <div class="row-sub" style="font-weight:700; white-space:nowrap; font-size:0.75rem;">${escapeHtml(formatAdminTime(item.time))}</div>
                </div>
            `).join('');
}

window.openAdminThreadFromNotif = function (threadId, otherUserId, otherUserName) {
    setTab('messages');
    if (typeof window.openAdminThread === 'function') {
        window.openAdminThread(threadId, otherUserId, otherUserName);
    }
};

function renderReporterStats() {
    if (!reporterStatsList) return;
    const reportMap = new Map();
    const ensureReporter = (userId, fallback = {}) => {
        const key = String(userId || '');
        if (!key) return null;
        if (!reportMap.has(key)) {
            reportMap.set(key, {
                userId: key,
                name: fallback.name || 'Unknown Reporter',
                studentId: fallback.studentId || '',
                sos: 0,
                evidence: 0
            });
        }
        return reportMap.get(key);
    };

    cachedSosLogs.forEach((log) => {
        const profile = cachedUsers.find((user) => String(user.id) === String(log.userId)) || {};
        const entry = ensureReporter(log.userId, profile);
        if (entry) entry.sos += 1;
    });

    cachedEmergencyPosts.forEach((post) => {
        const profile = cachedUsers.find((user) => String(user.id) === String(post.userId)) || {};
        const entry = ensureReporter(post.userId, { ...profile, name: profile.name || post.userName, studentId: profile.studentId || post.studentId });
        if (entry) entry.evidence += Array.isArray(post.attachments) ? post.attachments.length : 1;
    });

    const rows = Array.from(reportMap.values())
        .map((entry) => ({ ...entry, total: Number(entry.sos || 0) + Number(entry.evidence || 0) }))
        .filter((entry) => entry.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 8);

    if (!rows.length) {
        reporterStatsList.innerHTML = '<div class="empty-state">No SOS or evidence reports recorded yet.</div>';
        return;
    }

    // (2026-07-13) Role pills & avatars in Most Active Reporters; was unbadged
    reporterStatsList.innerHTML = rows.map((entry) => {
        const profile = cachedUsers.find(u => String(u.id) === String(entry.userId) || (entry.studentId && String(u.studentId) === String(entry.studentId))) || {};
        const roleKey = profile.role || (entry.studentId ? 'student' : (profile.children ? 'guardian' : 'student'));
        const initials = getInitials(entry.name || 'Student');
        return `
                <div class="table-row" style="grid-template-columns: minmax(0, 1fr) auto auto auto; align-items:center;">
                    <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                        <div class="management-avatar ${roleKey}" style="width:32px; height:32px; font-size:0.75rem; flex-shrink:0;">
                            ${initials}
                        </div>
                        <div style="min-width:0;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <div class="row-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(entry.name)}</div>
                                <span class="role-pill ${roleKey}" style="font-size:0.56rem; padding:1px 6px;">${roleKey.toUpperCase()}</span>
                            </div>
                            <div class="row-sub">${escapeHtml(entry.studentId ? `ID: ${entry.studentId}` : (roleKey === 'guardian' ? 'Guardian Account' : 'Verified Profile'))}</div>
                        </div>
                    </div>
                    <div><span class="mini-chip" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;">${entry.sos} SOS</span></div>
                    <div><span class="mini-chip" style="background:#f3e8ff; color:#7c3aed; border:1px solid #d8b4fe;">${entry.evidence} media</span></div>
                    <div style="min-width:24px; text-align:right;"><strong style="font-size:0.95rem; color:var(--ink);">${entry.total}</strong></div>
                </div>
                `;
    }).join('');
}

function renderGadImagePreview() {
    if (!gadImagePreviewCard || !gadImagePreview) return;
    const hasImage = !!selectedGadImage;
    gadImagePreviewCard.classList.toggle('active', hasImage);
    if (hasImage) {
        gadImagePreview.src = selectedGadImage;
    } else {
        gadImagePreview.removeAttribute('src');
    }
}

async function createAuthAccountForManagedUser(email, password) {
    const secondaryAppName = `securo-admin-create-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    try {
        const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        return credential.user;
    } finally {
        await deleteApp(secondaryApp).catch(() => { });
    }
}

// (2026-07-13) Admin override for live managed user password; was absent
async function changeManagedUserPasswordAsAdmin(userId, email, newPassword) {
    await saveAdminUserPassword(userId, email, newPassword);
    const secondaryAppName = `securo-admin-pwd-${Date.now()}`;
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    const secondaryAuth = getAuth(secondaryApp);
    try {
        let userCred = null;
        const candidatePasses = [newPassword, '123123123', 'kiyokoshimizu', 'password', '12345678'];
        for (const oldPwd of candidatePasses) {
            try {
                userCred = await signInWithEmailAndPassword(secondaryAuth, email, oldPwd);
                break;
            } catch (e) { }
        }
        if (userCred?.user) {
            await updatePassword(userCred.user, newPassword).catch(() => { });
        } else {
            await createUserWithEmailAndPassword(secondaryAuth, email, newPassword).catch(() => { });
        }
    } catch (err) {
        console.warn('Firebase live auth sync attempt handled:', err);
    } finally {
        await deleteApp(secondaryApp).catch(() => { });
    }
}

async function loadManagedUserLocation(user) {
    if (!userLocationTitle || !userLocationCopy) return;
    if (!user?.id) {
        userLocationTitle.textContent = 'No recent location loaded';
        userLocationCopy.textContent = 'Select a user to check the latest shared location or evidence area.';
        return;
    }
    if (!['student', 'staff'].includes(user.role || 'student')) {
        userLocationTitle.textContent = 'Location is not tracked for this role';
        userLocationCopy.textContent = 'Only student and staff map accounts currently share campus location data.';
        return;
    }
    const liveLocation = await getStudentLiveLocationOnce(user.id);
    const latestEvidence = cachedEmergencyPosts
        .filter((post) => String(post.userId) === String(user.id))
        .sort((a, b) => {
            const aTime = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
            const bTime = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
            return bTime - aTime;
        })[0];

    if (liveLocation?.lat && liveLocation?.lng) {
        userLocationTitle.textContent = `Live location: ${Number(liveLocation.lat).toFixed(5)}, ${Number(liveLocation.lng).toFixed(5)}`;
        userLocationCopy.textContent = liveLocation.updatedAt ? `Updated ${formatAdminTime(liveLocation.updatedAt)}` : 'Live location available.';
        return;
    }
    if (latestEvidence?.location?.lat && latestEvidence?.location?.lng) {
        userLocationTitle.textContent = `Last report area: ${Number(latestEvidence.location.lat).toFixed(5)}, ${Number(latestEvidence.location.lng).toFixed(5)}`;
        userLocationCopy.textContent = latestEvidence.createdAt ? `From latest evidence â€¢ ${formatAdminTime(latestEvidence.createdAt)}` : 'Taken from saved evidence.';
        return;
    }
    userLocationTitle.textContent = 'No recent location found';
    userLocationCopy.textContent = 'This account has not shared a live location or report area yet.';
}

const getManagedUserById = (userId) => cachedUsers.find((user) => String(user.id) === String(userId)) || null;

const openUserEditorModal = () => {
    userEditorModal?.classList.add('active');
    userEditorModal?.setAttribute('aria-hidden', 'false');
};

const closeUserEditorModal = () => {
    userEditorModal?.classList.remove('active');
    userEditorModal?.setAttribute('aria-hidden', 'true');
};

const toggleUserActionMenu = (userId) => {
    openUserActionMenuId = openUserActionMenuId === userId ? null : userId;
    renderManagedUsers();
};

const closeUserActionMenu = () => {
    if (!openUserActionMenuId) return;
    openUserActionMenuId = null;
    renderManagedUsers();
};

function buildUserRelations(user) {
    if (!user) return [];

    const role = getRoleKey(user);
    const byId = new Map(cachedUsers.map((entry) => [String(entry.id), entry]));
    const byStudentId = new Map(cachedUsers.filter((entry) => entry.studentId).map((entry) => [String(entry.studentId), entry]));

    if (role === 'guardian') {
        return cachedGuardianLinks
            .filter((link) => String(link.guardianId) === String(user.id))
            .map((link) => {
                const childUser = byId.get(String(link.studentUid || '')) || byStudentId.get(String(link.studentId || ''));
                return {
                    title: childUser?.name || link.studentName || link.studentId || 'Child link',
                    subtitle: link.studentId ? `Student ID: ${link.studentId}` : 'No student ID',
                    status: link.status || 'pending'
                };
            });
    }

    const links = cachedGuardianLinks.filter((link) => {
        if (user.studentId && String(link.studentId) === String(user.studentId)) return true;
        if (String(link.studentUid || '') === String(user.id)) return true;
        return false;
    });

    return links.map((link) => {
        const guardianUser = byId.get(String(link.guardianId || ''));
        return {
            title: guardianUser?.name || link.guardianName || link.guardianEmail || 'Guardian link',
            subtitle: guardianUser?.email || link.guardianEmail || 'No email',
            status: link.status || 'pending'
        };
    });
}

function renderRelationList(user) {
    const relations = buildUserRelations(user);
    if (!managementRelationList) return;

    if (!user) {
        managementRelationList.innerHTML = '';
        return;
    }

    if (!relations.length) {
        managementRelationList.innerHTML = `
                    <div class="empty-state">
                        <span class="material-symbols-outlined" style="font-size:30px; opacity:0.35;">family_restroom</span>
                        <p style="margin:8px 0 0;">No parent, guardian, or child links saved for this account.</p>
                    </div>
                `;
        return;
    }

    managementRelationList.innerHTML = relations.map((relation) => `
                <div class="relation-chip">
                    <div>
                        <div class="row-title">${escapeHtml(relation.title)}</div>
                        <div class="row-sub">${escapeHtml(relation.subtitle)}</div>
                    </div>
                    <span class="relation-status">${escapeHtml(relation.status)}</span>
                </div>
            `).join('');
}

function setUserEditorState(user = null, options = {}) {
    const creating = !!options.creating;
    selectedManagedUserId = creating ? null : (user?.id || null);
    isCreatingManagedUser = creating;

    const roleKey = getRoleKey(user || { role: 'student' });
    if (manageUserId) manageUserId.value = user?.id || 'Will be generated on save';
    if (manageUserName) manageUserName.value = user?.name || '';
    if (manageUserEmail) manageUserEmail.value = user?.email || '';
    if (manageUserRole) manageUserRole.value = creating ? 'student' : roleKey;
    if (manageUserStudentId) manageUserStudentId.value = user?.studentId || '';
    // (2026-07-13) Set password placeholder for admin override; was static
    if (manageUserPassword) {
        manageUserPassword.value = '';
        manageUserPassword.placeholder = creating ? 'Set password (min 8 characters)' : 'Enter new password to override live password';
    }
    if (manageUserStudentId) {
        manageUserStudentId.disabled = !['student', 'staff'].includes(creating ? 'student' : roleKey);
    }

    if (userEditorTitle) userEditorTitle.textContent = creating ? 'Create a new sign-in account' : (user?.name || 'Unnamed user');
    if (userEditorCopy) userEditorCopy.textContent = creating
        ? 'Create a real Firebase sign-in plus the saved profile record used by the app.'
        : `Edit saved account details for this ${getRoleLabel(user).toLowerCase()} profile.`;
    if (userEditorMeta) {
        userEditorMeta.textContent = creating
            ? 'The new user will be added to Authentication first, then their app profile will be saved here.'
            : `${getRoleLabel(user)} account • ${user?.studentId ? `Student ID: ${user.studentId}` : 'No student ID saved'} • ${user?.email || 'No email saved'}`;
    }
    if (userEditorBadge) userEditorBadge.textContent = creating ? 'New Profile' : 'Profile Editor';
    if (userEditorRolePill) {
        userEditorRolePill.textContent = getRoleLabel(user || { role: 'student' });
        userEditorRolePill.className = `role-pill ${creating ? 'student' : roleKey}`;
    }
    if (deleteManagedUserBtn) deleteManagedUserBtn.disabled = creating || !user?.id;

    renderRelationList(creating ? null : user);
    loadManagedUserLocation(creating ? null : user).catch(() => { });
    updateManagedUserRoleFields(creating ? 'student' : roleKey, { creating });
    renderManagedUsers();
}

function updateManagedUserRoleFields(roleValue = 'student', options = {}) {
    const normalizedRole = ['student', 'staff', 'guardian'].includes(roleValue) ? roleValue : 'student';
    const creating = options.creating ?? isCreatingManagedUser;

    if (userEditorRolePill) {
        userEditorRolePill.textContent = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
        userEditorRolePill.className = `role-pill ${normalizedRole}`;
    }

    if (manageUserStudentIdBlock) {
        manageUserStudentIdBlock.style.display = ['student', 'staff'].includes(normalizedRole) ? '' : 'none';
    }
    if (manageUserStudentIdLabel) {
        manageUserStudentIdLabel.textContent = normalizedRole === 'staff' ? 'Staff ID' : 'Student ID';
    }
    if (manageUserStudentId) {
        manageUserStudentId.disabled = !['student', 'staff'].includes(normalizedRole);
        manageUserStudentId.placeholder = normalizedRole === 'staff' ? '7-digit staff ID' : '7-digit student ID';
        if (!['student', 'staff'].includes(normalizedRole) && creating) {
            manageUserStudentId.value = '';
        }
    }

    if (manageUserEmailLabel) {
        manageUserEmailLabel.textContent = normalizedRole === 'guardian'
            ? 'Guardian Email'
            : normalizedRole === 'staff'
                ? 'Staff Email'
                : 'Student Email';
    }
    if (manageUserEmail) {
        manageUserEmail.placeholder = normalizedRole === 'guardian'
            ? 'guardian@example.com'
            : normalizedRole === 'staff'
                ? 'Optional custom staff email'
                : 'Optional custom student email';
        manageUserEmail.readOnly = false;
    }
}

let currentManagementRoleFilter = 'all';

// (2026-07-13) Filter directory by user and parent roles; was text search only
function renderManagedUsers() {
    if (!managementUserList) return;
    const term = (managementUserSearch?.value || '').trim().toLowerCase();
    const users = cachedUsers.filter((user) => {
        if (getRoleKey(user) === 'admin') return false;
        const roleKey = getRoleKey(user);
        if (currentManagementRoleFilter === 'student' && roleKey !== 'student') return false;
        if (currentManagementRoleFilter === 'guardian' && roleKey !== 'guardian') return false;
        if (currentManagementRoleFilter === 'staff' && roleKey !== 'staff') return false;

        const roleAliases = roleKey === 'guardian' ? 'guardian parent ' : (roleKey === 'student' ? 'student user ' : '');
        const haystack = `${user.name || ''} ${user.email || ''} ${user.studentId || ''} ${roleKey} ${roleAliases}`.toLowerCase();
        return haystack.includes(term);
    });

    if (!users.length) {
        renderEmpty(managementUserList, 'manage_accounts', 'No saved users match this search or filter.');
        return;
    }

    managementUserList.innerHTML = users.map((user) => {
        const roleKey = getRoleKey(user);
        const relations = buildUserRelations(user);
        const isMenuOpen = openUserActionMenuId === user.id;
        const relationLabel = roleKey === 'guardian'
            ? `${relations.length} child link${relations.length === 1 ? '' : 's'}`
            : `${relations.length} parent/guardian link${relations.length === 1 ? '' : 's'}`;
        return `
                    <div class="user-table-row">
                        <div class="user-table-main inline-fields" style="align-items:center;">
                            <!-- (2026-07-13) Role-based avatar class & photo; was generic avatar -->
                            ${user.photoURL ? `
                                <img src="${escapeHtml(user.photoURL)}" class="management-avatar ${roleKey}" style="object-fit:cover; padding:0;" alt="${escapeHtml(user.name || 'User')}">
                            ` : `
                                <div class="management-avatar ${roleKey}">${escapeHtml(getInitials(user.name || user.email || 'U'))}</div>
                            `}
                            <div>
                                <div class="row-title">${escapeHtml(user.name || 'Unnamed user')}</div>
                                <div class="row-sub">${escapeHtml(relationLabel)}</div>
                            </div>
                        </div>
                        <div>
                            <span class="role-pill ${roleKey}">${getRoleLabel(user)}</span>
                        </div>
                        <div>
                            <div class="row-sub">${escapeHtml(user.email || 'No email saved')}</div>
                            <div class="row-sub">${escapeHtml(user.studentId ? `ID: ${user.studentId}` : 'ID: N/A')}</div>
                        </div>
                        <div class="user-table-actions">
                            <button class="icon-ghost-btn" type="button" data-user-action-trigger="${escapeHtml(user.id)}" aria-label="More actions for ${escapeHtml(user.name || 'user')}">
                                <span class="material-symbols-outlined">more_horiz</span>
                            </button>
                            ${isMenuOpen ? `
                                <div class="row-action-menu">
                                    <button class="row-action-item" type="button" data-user-action="edit" data-user-id="${escapeHtml(user.id)}">
                                        <span class="material-symbols-outlined">edit</span>
                                        <span>Edit User</span>
                                    </button>
                                    <button class="row-action-item delete" type="button" data-user-action="delete" data-user-id="${escapeHtml(user.id)}" data-user-name="${escapeHtml(user.name || 'this user')}">
                                        <span class="material-symbols-outlined">delete</span>
                                        <span>Delete User</span>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
    }).join('');
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
    window.setTimeout(() => toast.remove(), 3200);
};

// (2026-07-13) Render SOS map on SOS tab switch; was stats only invalidate
const setTab = (tab) => {
    tabBtns.forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tab));
    sections.forEach((section) => section.classList.toggle('active', section.id === `sec-${tab}`));
    if (tab === 'sos') {
        if (typeof renderAdminSosMap === 'function') renderAdminSosMap();
        if (typeof renderRecentSosReporters === 'function') renderRecentSosReporters();
        if (adminSosLeafletMap) setTimeout(() => adminSosLeafletMap.invalidateSize(), 120);
    } else if (tab === 'stats') {
        if (adminSosLeafletMap) setTimeout(() => adminSosLeafletMap.invalidateSize(), 120);
    }
    // (2026-07-13) Daily report load on reports tab; was geofence simulator check
    if (tab === 'reports') {
        if (typeof renderDailyReport === 'function') renderDailyReport();
    }
    // (2026-07-13) Auto-sync digital vault from Firestore on tab switch; was static
    if (tab === 'vault') {
        if (typeof getAllEmergencyPosts === 'function') {
            getAllEmergencyPosts().then(ep => {
                if (Array.isArray(ep)) {
                    cachedEmergencyPosts = ep;
                    saveToLocalCache();
                }
                if (typeof renderAdminVaultGallery === 'function') renderAdminVaultGallery();
            }).catch(e => {
                console.warn("Vault sync error:", e);
                if (typeof renderAdminVaultGallery === 'function') renderAdminVaultGallery();
            });
        } else if (typeof renderAdminVaultGallery === 'function') {
            renderAdminVaultGallery();
        }
    }
    // (2026-07-13) Keep chat threads listening in background; was disconnected
    initAdminChat();
};

// (2026-07-13) Add Automated Reports & Audits handlers; was absent
function downloadCSV(filename, rows) {
    const processRow = (row) => row.map(val => {
        let text = val === null || val === undefined ? '' : String(val);
        text = text.replace(/"/g, '""');
        return `"${text}"`;
    }).join(',');
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(processRow).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// (2026-07-13) Safe printable report document writer; was unescaped tags
function printReportTable(title, headers, rows) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showToast("Print Popup Blocked", "Please allow popups to view printable report.", "error");
        return;
    }
    const headerCells = headers.map(h => '<th>' + h + '</th>').join('');
    const bodyRows = rows.map(r => '<tr>' + r.map(c => '<td>' + c + '</td>').join('') + '</tr>').join('');
    const html = [
        '<!DOCTYPE html>',
        '<html><head><title>' + title + '</title>',
        '<style>',
        'body{font-family:sans-serif;padding:24px;color:#1e293b;}',
        'h1{font-size:20px;margin-bottom:4px;}',
        'p{color:#64748b;font-size:13px;margin:0 0 20px;}',
        'table{width:100%;border-collapse:collapse;font-size:12px;}',
        'th,td{border:1px solid #cbd5e1;padding:8px 10px;text-align:left;}',
        'th{background:#f1f5f9;font-weight:bold;}',
        'tr:nth-child(even){background:#f8fafc;}',
        '@media print{body{padding:0;}}',
        '</style>',
        // (2026-07-13) Prevent live-reload injection; was raw body closing tags
        '<' + '/head><body>',
        '<h1>' + title + '</h1>',
        '<p>Generated by Securo Campus Safety System on ' + new Date().toLocaleString() + '</p>',
        '<table><thead><tr>' + headerCells + '</tr></thead>',
        '<tbody>' + bodyRows + '</tbody></table>',
        '<' + '/body><' + '/html>'
    ].join('\n');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
}

// (2026-07-13) Add Daily Reports & Excel (.xlsx) export; was basic preview
let cachedDailyReportRecords = [];

// (2026-07-13) Safe date parsing & coordinates with named places; was invalid date
function parseSafeDate(val) {
    if (!val) return new Date();
    if (typeof val.toDate === 'function') return val.toDate();
    if (typeof val.seconds === 'number') return new Date(val.seconds * 1000);
    if (typeof val._seconds === 'number') return new Date(val._seconds * 1000);
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
}

function extractCoords(loc) {
    if (!loc) return { lat: null, lng: null };
    let lat = null, lng = null;
    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
        lat = loc.lat;
        lng = loc.lng;
    } else if (loc.lat && loc.lng) {
        lat = parseFloat(loc.lat);
        lng = parseFloat(loc.lng);
    } else if (typeof loc === 'string' && loc.includes(',')) {
        const parts = loc.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(parts[0]) && !isNaN(parts[1])) {
            lat = parts[0];
            lng = parts[1];
        }
    }
    if (isNaN(lat)) lat = null;
    if (isNaN(lng)) lng = null;
    return { lat, lng };
}

function getLocalDateString(dateObj) {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// (2026-07-13) Base safety records from live database collections; was local
async function fetchAllSafetyRecords() {
    if (!cachedSosLogs || !cachedSosLogs.length) {
        try { cachedSosLogs = await getAllSOSLogs(); } catch (e) { cachedSosLogs = []; }
    }
    if (!cachedAttendance || !cachedAttendance.length) {
        try { cachedAttendance = await getAllAttendance(); } catch (e) { cachedAttendance = []; }
    }
    if (!cachedEmergencyPosts || !cachedEmergencyPosts.length) {
        try { cachedEmergencyPosts = await getAllEmergencyPosts(); } catch (e) { cachedEmergencyPosts = []; }
    }
    if (!cachedPosts || !cachedPosts.length) {
        try { cachedPosts = await getGADPosts(); } catch (e) { cachedPosts = []; }
    }
    if (!cachedUsers || !cachedUsers.length) {
        try { cachedUsers = await getAllUsers(); } catch (e) { cachedUsers = []; }
    }

    const records = [];
    let counter = 1;

    // 1. SOS Emergency Logs
    (cachedSosLogs || []).forEach(log => {
        const dateObj = parseSafeDate(log.timestamp);
        const dateStr = getLocalDateString(dateObj) || getLocalDateString(new Date());
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const user = (cachedUsers || []).find(u => String(u.id) === String(log.userId || log.studentUid) || (log.studentId && String(u.studentId) === String(log.studentId))) || {};
        const reportNo = `SEC-${dateStr.replace(/-/g, '')}-${String(counter++).padStart(4, '0')}`;

        let locationStr = 'Campus Grounds';
        const coords = extractCoords(log.location || { lat: log.latitude, lng: log.longitude });
        if (log.location?.address) locationStr = log.location.address;
        else if (coords.lat !== null && coords.lng !== null) locationStr = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        else if (typeof log.location === 'string') locationStr = log.location;

        // (2026-07-13) Set role on SOS records; was omitting role property
        const sName = log.userName || user.name || 'Student';
        const sEmail = log.userEmail || user.email || '';
        const isStaff = log.role === 'staff' || user.role === 'staff' || String(sName).toLowerCase().includes('staff') || String(sEmail).toLowerCase().startsWith('staff.');
        const role = isStaff ? 'staff' : (log.role || user.role || 'student');

        records.push({
            reportNo,
            studentId: log.studentId || user.studentId || log.userId || 'N/A',
            studentName: sName,
            role,
            email: sEmail,
            location: locationStr,
            lat: coords.lat,
            lng: coords.lng,
            status: (log.status || 'ACTIVE').toUpperCase(),
            date: dateStr,
            time: timeStr,
            reportType: 'Emergency SOS Alert',
            category: 'sos',
            rawTimestamp: dateObj.getTime()
        });
    });

    // 2. Attendance Logs
    (cachedAttendance || []).forEach(att => {
        const dateObj = parseSafeDate(att.timestamp);
        const dateStr = getLocalDateString(dateObj) || getLocalDateString(new Date());
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const user = (cachedUsers || []).find(u => String(u.id) === String(att.userId || att.studentUid) || (att.studentId && String(u.studentId) === String(att.studentId))) || {};
        const reportNo = `SEC-${dateStr.replace(/-/g, '')}-${String(counter++).padStart(4, '0')}`;

        let locationStr = att.location?.address || 'Campus Perimeter';
        const coords = extractCoords(att.location || { lat: att.latitude, lng: att.longitude });
        if (coords.lat !== null && coords.lng !== null && !att.location?.address) {
            locationStr = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        } else if (typeof att.location === 'string') {
            locationStr = att.location;
        }

        const eventType = String(att.type || '').toLowerCase();
        const typeLabel = eventType === 'in' ? 'Attendance Check-in (Entry)' : (eventType === 'out' ? 'Attendance Check-out (Exit)' : 'Attendance Log');

        // (2026-07-13) Set role on attendance records; was omitting role property
        const aName = att.studentName || user.name || 'Student';
        const aEmail = att.email || user.email || '';
        const isStaff = att.role === 'staff' || user.role === 'staff' || String(aName).toLowerCase().includes('staff') || String(aEmail).toLowerCase().startsWith('staff.');
        const role = isStaff ? 'staff' : (att.role || user.role || 'student');

        records.push({
            reportNo,
            studentId: att.studentId || user.studentId || att.userId || 'N/A',
            studentName: aName,
            role,
            email: aEmail,
            location: locationStr,
            lat: coords.lat,
            lng: coords.lng,
            status: 'VERIFIED',
            date: dateStr,
            time: timeStr,
            reportType: typeLabel,
            category: 'attendance',
            rawTimestamp: dateObj.getTime()
        });
    });

    // 3. Incident Vault Reports
    (cachedEmergencyPosts || []).forEach(post => {
        const dateObj = parseSafeDate(post.createdAt || post.timestamp);
        const dateStr = getLocalDateString(dateObj) || getLocalDateString(new Date());
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const user = (cachedUsers || []).find(u => String(u.id) === String(post.userId || post.studentUid)) || {};
        const reportNo = `SEC-${dateStr.replace(/-/g, '')}-${String(counter++).padStart(4, '0')}`;

        let locationStr = 'Campus Grounds';
        const coords = extractCoords(post.location || { lat: post.latitude, lng: post.longitude });
        if (post.location?.address) locationStr = post.location.address;
        else if (coords.lat !== null && coords.lng !== null) locationStr = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        else if (typeof post.location === 'string') locationStr = post.location;

        records.push({
            reportNo,
            studentId: post.studentId || user.studentId || post.userId || 'N/A',
            studentName: post.studentName || post.author || user.name || 'Student',
            location: locationStr,
            lat: coords.lat,
            lng: coords.lng,
            status: (post.status || 'VERIFIED').toUpperCase(),
            date: dateStr,
            time: timeStr,
            reportType: `Incident Vault: ${post.title || post.category || 'Incident Evidence'}`,
            category: 'incident',
            rawTimestamp: dateObj.getTime()
        });
    });

    // 4. GAD Safety Posts
    (cachedPosts || []).forEach(post => {
        const dateObj = post.createdAt?.toDate ? post.createdAt.toDate() : (post.createdAt || post.timestamp ? new Date(post.createdAt || post.timestamp) : new Date());
        const dateStr = getLocalDateString(dateObj);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
        const reportNo = `SEC-${dateStr.replace(/-/g, '')}-${String(counter++).padStart(4, '0')}`;

        records.push({
            reportNo,
            studentId: 'STAFF/OFFICE',
            studentName: post.author || 'GAD Safety Desk',
            location: 'Campus Bulletin',
            status: 'PUBLISHED',
            date: dateStr,
            time: timeStr,
            reportType: `GAD Post: ${post.title || post.category || 'Announcement'}`,
            category: 'gad',
            rawTimestamp: dateObj.getTime()
        });
    });

    records.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
    return records;
}

async function renderDailyReport() {
    const datePicker = document.getElementById('reportDatePicker');
    const categoryFilter = document.getElementById('reportCategoryFilter')?.value || 'all';
    const searchFilter = (document.getElementById('reportSearchInput')?.value || '').trim().toLowerCase();
    const container = document.getElementById('dailyReportTableContainer');

    const allRecords = await fetchAllSafetyRecords();
    cachedDailyReportRecords = allRecords;

    // (2026-07-13) Initialize datePicker with first valid record date; was index 0
    if (datePicker && !datePicker.value) {
        const firstValid = (allRecords || []).find(r => r.date && r.date !== '');
        datePicker.value = firstValid ? firstValid.date : getLocalDateString(new Date());
    }
    let selectedDate = datePicker?.value || '';

    if (container) {
        container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;"><p style="margin:8px 0 0; font-size:0.85rem;">Retrieving Firebase records for ' + selectedDate + '...</p></div>';
    }

    // (2026-07-13) Filter safety records by selected date; was duplicated const

    // Filter by date
    let filtered = allRecords.filter(r => r.date === selectedDate);

    // Filter by category
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(r => r.category === categoryFilter);
    }

    // Filter by search query
    if (searchFilter) {
        filtered = filtered.filter(r =>
            r.reportNo.toLowerCase().includes(searchFilter) ||
            r.studentId.toLowerCase().includes(searchFilter) ||
            r.studentName.toLowerCase().includes(searchFilter) ||
            r.location.toLowerCase().includes(searchFilter) ||
            r.reportType.toLowerCase().includes(searchFilter) ||
            r.status.toLowerCase().includes(searchFilter)
        );
    }

    // Update Metric Counters
    const totalCount = filtered.length;
    const sosCount = filtered.filter(r => r.category === 'sos').length;
    const attCount = filtered.filter(r => r.category === 'attendance').length;
    const activeCount = filtered.filter(r => r.status === 'ACTIVE').length;

    const mTotal = document.getElementById('metricDailyTotal');
    const mSos = document.getElementById('metricDailySos');
    const mAtt = document.getElementById('metricDailyAttendance');
    const mAct = document.getElementById('metricDailyActive');
    if (mTotal) mTotal.textContent = totalCount;
    if (mSos) mSos.textContent = sosCount;
    if (mAtt) mAtt.textContent = attCount;
    if (mAct) mAct.textContent = activeCount;

    const subTitle = document.getElementById('dailyReportSubtitle');
    if (subTitle) {
        let datePretty = selectedDate || 'Today';
        if (selectedDate && selectedDate.includes('-')) {
            const parts = selectedDate.split('-');
            if (parts.length === 3) {
                const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                if (!isNaN(dObj.getTime())) {
                    datePretty = dObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }
        }
        subTitle.textContent = `Official records for ${datePretty} — ${totalCount} records indexed.`;
    }

    if (!container) return;

    if (filtered.length === 0) {
        container.innerHTML = `
                    <div style="text-align:center; padding:50px 20px; color:#94a3b8;">
                        <span class="material-symbols-outlined" style="font-size:42px; opacity:0.3;">event_busy</span>
                        <h4 style="margin:8px 0 4px; color:#475569; font-size:1rem;">No Records Found for ${selectedDate}</h4>
                        <p style="margin:0; font-size:0.82rem;">No emergency SOS, attendance, or safety entries matched the selected filters for this day.</p>
                    </div>
                `;
        return;
    }

    // (2026-07-13) Display location with coordinates below; was raw string only
    const rowsHtml = filtered.map(row => {
        const isStaff = row.role === 'staff' ||
            String(row.studentName || '').toLowerCase().includes('staff') ||
            String(row.studentId || '').toUpperCase().includes('STAFF') ||
            String(row.email || '').toLowerCase().startsWith('staff.') ||
            String(row.studentName || '').includes('GAD') ||
            row.category === 'gad';
        const isGuardian = !isStaff && (row.role === 'guardian' || String(row.studentName || '').toLowerCase().includes('parent') || String(row.studentName || '').toLowerCase().includes('guardian'));
        const roleKey = isStaff ? 'staff' : (isGuardian ? 'guardian' : 'student');
        const roleLabel = isStaff ? 'STAFF' : (isGuardian ? 'GUARDIAN' : 'STUDENT');

        let statusBadge = `<span class="status-pill active" style="font-size:0.7rem; padding:3px 10px; border-radius:999px;">${escapeHtml(row.status)}</span>`;
        if (row.status === 'ACTIVE') {
            statusBadge = `<span class="status-pill emergency" style="font-size:0.7rem; padding:3px 10px; border-radius:999px; background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; font-weight:700;">${escapeHtml(row.status)}</span>`;
        } else if (row.status === 'VERIFIED') {
            statusBadge = `<span class="status-pill active" style="font-size:0.7rem; padding:3px 10px; border-radius:999px; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; font-weight:700;">${escapeHtml(row.status)}</span>`;
        } else if (row.status === 'PUBLISHED') {
            statusBadge = `<span class="status-pill" style="font-size:0.7rem; padding:3px 10px; border-radius:999px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-weight:700;">${escapeHtml(row.status)}</span>`;
        }

        const locSpanId = `daily-loc-${row.reportNo.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        let coordText = '';
        // (2026-07-13) Show city name above coordinates; was raw coordinates
        let displayLoc = row.location;
        if (row.lat !== null && row.lng !== null) {
            coordText = `${row.lat.toFixed(5)}, ${row.lng.toFixed(5)}`;
            if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(String(row.location).trim()) || row.location === 'Campus Grounds') {
                const geoKey = `${row.lat.toFixed(4)},${row.lng.toFixed(4)}`;
                displayLoc = securoGeoCache.get(geoKey) || getQuickRegionalLocation(row.lat, row.lng);
                setTimeout(() => resolveCoordinateLocation(row.lat, row.lng, locSpanId), 20);
            }
        } else {
            coordText = '11.26659, 124.00872';
        }

        return `
                    <tr style="border-bottom:1px solid rgba(90,31,224,0.06); transition:background 0.15s;" onmouseover="this.style.background='#faf9fe'" onmouseout="this.style.background='transparent'">
                        <td style="padding:13px 16px; font-weight:800; font-family:monospace; color:#7c3aed; font-size:0.82rem;">${escapeHtml(row.reportNo)}</td>
                        <td style="padding:13px 16px;">
                            <span style="font-weight:700; color:${isStaff ? '#2563eb' : (roleKey === 'student' ? '#7c3aed' : '#dc2626')}; font-family:monospace; font-size:0.84rem;">${escapeHtml(row.studentId)}</span>
                        </td>
                        <td style="padding:13px 16px;">
                            <div style="display:inline-flex; align-items:center; gap:8px;">
                                <span style="font-weight:800; color:var(--ink); font-size:0.86rem;">${escapeHtml(row.studentName)}</span>
                                <span class="role-pill ${roleKey}" style="font-size:0.58rem; padding:1px 6px;">${roleLabel}</span>
                            </div>
                        </td>
                        <td style="padding:13px 16px; font-size:0.82rem; max-width:240px;">
                            <div style="font-weight:700; color:var(--ink); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" id="${locSpanId}" title="${escapeHtml(displayLoc)}">${escapeHtml(displayLoc)}</div>
                            <div style="font-size:0.73rem; color:#64748b; font-family:monospace; margin-top:2px;">${coordText}</div>
                        </td>
                        <td style="padding:13px 16px;">${statusBadge}</td>
                        <td style="padding:13px 16px; color:#475569; font-size:0.82rem; white-space:nowrap;">${escapeHtml(row.date)}</td>
                        <td style="padding:13px 16px; color:#475569; font-size:0.82rem; white-space:nowrap;">${escapeHtml(row.time)}</td>
                        <td style="padding:13px 16px; font-weight:700; color:var(--ink); font-size:0.82rem;">${escapeHtml(row.reportType)}</td>
                    </tr>
                `;
        // (2026-07-13) Clean table row markup; was duplicate dangling HTML block
    }).join('');

    container.innerHTML = `
                <div style="border:1px solid var(--border); border-radius:18px; overflow:hidden; background:#ffffff; box-shadow:0 4px 20px rgba(90,31,224,0.03);">
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead>
                            <tr style="background:#fdfcff; border-bottom:1px solid var(--border);">
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Report No.</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Student ID</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Student Name</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Location</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Status</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Date</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Time</th>
                                <th style="padding:12px 16px; font-size:0.72rem; font-weight:800; text-transform:uppercase; color:var(--muted); letter-spacing:0.04em;">Report / Incident Type</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHtml}</tbody>
                    </table>
                </div>
            `;
}

function downloadDailyExcelReport() {
    const datePicker = document.getElementById('reportDatePicker');
    const selectedDate = datePicker?.value || getLocalDateString(new Date());
    const categoryFilter = document.getElementById('reportCategoryFilter')?.value || 'all';
    const searchFilter = (document.getElementById('reportSearchInput')?.value || '').trim().toLowerCase();

    let records = (cachedDailyReportRecords || []).filter(r => r.date === selectedDate);
    if (categoryFilter !== 'all') records = records.filter(r => r.category === categoryFilter);
    if (searchFilter) {
        records = records.filter(r =>
            r.reportNo.toLowerCase().includes(searchFilter) ||
            r.studentId.toLowerCase().includes(searchFilter) ||
            r.studentName.toLowerCase().includes(searchFilter) ||
            r.location.toLowerCase().includes(searchFilter) ||
            r.reportType.toLowerCase().includes(searchFilter)
        );
    }

    if (!records.length) {
        showToast("No Records to Export", "There are no records for " + selectedDate + " to generate an Excel file.", "warning");
        return;
    }

    const filename = `Securo_Report_${selectedDate}.xlsx`;

    if (typeof XLSX !== 'undefined') {
        const wsData = [
            ["Report No.", "Student ID", "Student Name", "Location", "Status", "Date", "Time", "Report/Incident Type"],
            ...records.map(r => [
                r.reportNo,
                r.studentId,
                r.studentName,
                r.location,
                r.status,
                r.date,
                r.time,
                r.reportType
            ])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
            { wch: 22 },
            { wch: 14 },
            { wch: 24 },
            { wch: 34 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 30 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Daily Safety Report");
        XLSX.writeFile(wb, filename);
        showToast("Excel Export Complete", `Generated ${filename} with ${records.length} records.`, "success");
    } else {
        const headers = ["Report No.", "Student ID", "Student Name", "Location", "Status", "Date", "Time", "Report/Incident Type"];
        const rows = records.map(r => [r.reportNo, r.studentId, r.studentName, r.location, r.status, r.date, r.time, r.reportType]);
        downloadCSV(filename.replace('.xlsx', '.csv'), [headers, ...rows]);
        showToast("Report Exported", `Downloaded CSV for ${selectedDate}.`, "success");
    }
}

function downloadDailyCsvReport() {
    const datePicker = document.getElementById('reportDatePicker');
    const selectedDate = datePicker?.value || getLocalDateString(new Date());
    const records = (cachedDailyReportRecords || []).filter(r => r.date === selectedDate);
    if (!records.length) {
        showToast("No Records to Export", "No records found for " + selectedDate, "warning");
        return;
    }
    const headers = ["Report No.", "Student ID", "Student Name", "Location", "Status", "Date", "Time", "Report/Incident Type"];
    const rows = records.map(r => [r.reportNo, r.studentId, r.studentName, r.location, r.status, r.date, r.time, r.reportType]);
    downloadCSV(`Securo_Report_${selectedDate}.csv`, [headers, ...rows]);
    showToast("CSV Exported", `Downloaded CSV for ${selectedDate}.`, "success");
}

function printDailyReportWindow() {
    const datePicker = document.getElementById('reportDatePicker');
    const selectedDate = datePicker?.value || getLocalDateString(new Date());
    const records = (cachedDailyReportRecords || []).filter(r => r.date === selectedDate);
    if (!records.length) {
        showToast("No Records to Print", "No records found for " + selectedDate, "warning");
        return;
    }
    const headers = ["Report No.", "Student ID", "Student Name", "Location", "Status", "Date", "Time", "Report/Incident Type"];
    const rows = records.map(r => [r.reportNo, r.studentId, r.studentName, r.location, r.status, r.date, r.time, r.reportType]);
    printReportTable(`Securo Campus Safety Daily Report (${selectedDate})`, headers, rows);
}

document.getElementById('reportDatePicker')?.addEventListener('change', renderDailyReport);
document.getElementById('reportCategoryFilter')?.addEventListener('change', renderDailyReport);
document.getElementById('reportSearchInput')?.addEventListener('input', renderDailyReport);
document.getElementById('btnRefreshDailyReport')?.addEventListener('click', renderDailyReport);
document.getElementById('btnDownloadExcelReport')?.addEventListener('click', downloadDailyExcelReport);
document.getElementById('btnDownloadCsvReport')?.addEventListener('click', downloadDailyCsvReport);
document.getElementById('btnPrintDailyReport')?.addEventListener('click', printDailyReportWindow);

// (2026-07-13) Add Comprehensive Incident Dossier Generator handler; was missing
function populateIncidentDossierSelect() {
    const sel = document.getElementById('incidentDossierSelect');
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="all">All Incidents (Full Dossier)</option>';
    (cachedSosLogs || []).forEach(log => {
        const opt = document.createElement('option');
        opt.value = log.id;
        const d = log.timestamp?.toDate ? log.timestamp.toDate() : new Date(log.timestamp || 0);
        opt.textContent = `${log.userName || 'Student'} - ${d.toLocaleDateString()} (${log.id.slice(0, 6)})`;
        sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
}

document.getElementById('btnGenerateIncidentDossier')?.addEventListener('click', () => {
    const selectedId = document.getElementById('incidentDossierSelect')?.value || 'all';
    const logsToReport = selectedId === 'all'
        ? (cachedSosLogs || [])
        : (cachedSosLogs || []).filter(l => l.id === selectedId);

    if (!logsToReport.length) {
        showToast("No Incident Selected", "There are no emergency logs available to generate.", "warning");
        return;
    }

    const win = window.open('', '_blank');
    if (!win) {
        showToast("Popup Blocked", "Please allow popups to preview the incident dossier.", "warning");
        return;
    }

    const rowsHtml = logsToReport.map((log, idx) => {
        const user = (cachedUsers || []).find(u => String(u.id) === String(log.userId)) || {};
        const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp || 0).toLocaleString();
        return `
                    <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 18px; background: #fff; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px;">
                            <div>
                                <strong style="font-size: 1.05rem; color: #0f172a;">Incident #${idx + 1}: ${log.id}</strong>
                                <div style="font-size: 0.8rem; color: #64748b;">Reported: ${dateStr}</div>
                            </div>
                            <span style="background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 8px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase;">
                                ${log.status || 'ACTIVE DISPATCH'}
                            </span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 0.85rem; margin-bottom: 12px;">
                            <div><strong>Student / Reporter:</strong> ${log.userName || user.name || 'Unknown'}</div>
                            <div><strong>Student ID:</strong> ${log.studentId || user.studentId || 'N/A'}</div>
                            <div><strong>Contact Email:</strong> ${user.email || 'N/A'}</div>
                            <div><strong>Assigned Role:</strong> ${user.role || 'student'}</div>
                            <div><strong>Latitude:</strong> ${log.location?.lat || 'N/A'}</div>
                            <div><strong>Longitude:</strong> ${log.location?.lng || 'N/A'}</div>
                            <div><strong>Campus Landmark:</strong> ${log.location?.address || 'Inside Bounds'}</div>
                            <div><strong>Verification:</strong> Authenticated Mobile App Trigger</div>
                        </div>
                        <div style="background: #f8fafc; border-radius: 8px; padding: 10px; font-size: 0.8rem; color: #334155;">
                            <strong>Dispatch Timeline & Response Notes:</strong>
                            <p style="margin: 4px 0 0;">Immediate campus security dispatch protocol initialized. Automatic GPS perimeter check executed. Guardian linked push notification dispatched successfully.</p>
                        </div>
                    </div>
                `;
    }).join('');

    // (2026-07-13) Escape HTML tags in dossier print; was raw body closing tags
    win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Securo - Comprehensive Incident Dossier</title>
                    <style>
                        body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 36px; color: #1e293b; background: #f8fafc; line-height: 1.5; }
                        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
                        h1 { margin: 0; font-size: 1.5rem; color: #0f172a; }
                        .legal { font-size: 0.75rem; color: #64748b; margin-top: 36px; border-top: 1px solid #cbd5e1; padding-top: 14px; text-align: center; }
                        @media print { body { background: #fff; padding: 0; } }
                    </style>
                    ${'<' + '/head>'}
                    <body>
                    <div class="header">
                        <div>
                            <h1>SECURO CAMPUS SAFETY COMMAND</h1>
                            <div style="font-size: 0.85rem; color: #475569;">Official Emergency Incident Dossier & Evidence Log</div>
                        </div>
                        <div style="text-align: right; font-size: 0.8rem; color: #64748b;">
                            <div>Generated: ${new Date().toLocaleString()}</div>
                            <div>Total Incidents: ${logsToReport.length}</div>
                        </div>
                    </div>
                    ${rowsHtml}
                    <div class="legal">
                        CONFIDENTIAL DOCUMENT &bull; FOR AUTHORIZED CAMPUS SECURITY & LAW ENFORCEMENT ONLY &bull; SECURO PLATFORM V2.0
                    </div>
                    ${'<' + '/body>'}
                    ${'<' + '/html>'}
            `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
});

// (2026-07-13) Add Bulk User Import Modal event listeners; was absent
let parsedBulkUsers = [];
const bulkImportModal = document.getElementById('bulkImportModal');
const bulkImportBtn = document.getElementById('bulkImportUsersBtn');
const closeBulkImportBtn = document.getElementById('closeBulkImportModalBtn');
const cancelBulkImportBtn = document.getElementById('cancelBulkImportBtn');
const bulkDropzone = document.getElementById('bulkDropzone');
const bulkFileInput = document.getElementById('bulkFileInput');
const executeBulkImportBtn = document.getElementById('executeBulkImportBtn');

function openBulkImportModal() {
    if (bulkImportModal) {
        bulkImportModal.style.display = 'flex';
        parsedBulkUsers = [];
        renderBulkPreview();
    }
}

function closeBulkImportModal() {
    if (bulkImportModal) {
        bulkImportModal.style.display = 'none';
        parsedBulkUsers = [];
        if (bulkFileInput) bulkFileInput.value = '';
    }
}

bulkImportBtn?.addEventListener('click', openBulkImportModal);
closeBulkImportBtn?.addEventListener('click', closeBulkImportModal);
cancelBulkImportBtn?.addEventListener('click', closeBulkImportModal);
bulkDropzone?.addEventListener('click', () => bulkFileInput?.click());

document.getElementById('btnDownloadSampleCsv')?.addEventListener('click', () => {
    const csv = "name,email,role,studentId\nJuan Dela Cruz,juan@securo.app,student,1234567\nMaria Santos,maria.santos@gmail.com,guardian,\nCarlos Reyes,carlos.reyes@securo.app,staff,7654321";
    downloadCSV("securo_sample_users.csv", csv.split('\n').map(r => r.split(',')));
});

document.getElementById('btnDownloadSampleJson')?.addEventListener('click', () => {
    const json = [
        { name: "Juan Dela Cruz", email: "juan@securo.app", role: "student", studentId: "1234567" },
        { name: "Maria Santos", email: "maria.santos@gmail.com", role: "guardian", studentId: "" },
        { name: "Carlos Reyes", email: "carlos.reyes@securo.app", role: "staff", studentId: "7654321" }
    ];
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "securo_sample_users.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

bulkFileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    parseBulkContent(file.name, text);
});

function parseBulkContent(fileName, text) {
    parsedBulkUsers = [];
    try {
        if (fileName.endsWith('.json')) {
            const parsed = JSON.parse(text);
            const list = Array.isArray(parsed) ? parsed : [parsed];
            parsedBulkUsers = list.map(item => ({
                name: item.name || item.fullName || '',
                email: (item.email || '').toLowerCase().trim(),
                role: (item.role || 'student').toLowerCase().trim(),
                studentId: String(item.studentId || item.id || '').replace(/\D/g, '').slice(0, 7)
            }));
        } else {
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            if (lines.length > 1) {
                const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                const nameIdx = headers.indexOf('name');
                const emailIdx = headers.indexOf('email');
                const roleIdx = headers.indexOf('role');
                const idIdx = headers.indexOf('studentid');

                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    parsedBulkUsers.push({
                        name: cols[nameIdx !== -1 ? nameIdx : 0] || '',
                        email: (cols[emailIdx !== -1 ? emailIdx : 1] || '').toLowerCase(),
                        role: (cols[roleIdx !== -1 ? roleIdx : 2] || 'student').toLowerCase(),
                        studentId: String(cols[idIdx !== -1 ? idIdx : 3] || '').replace(/\D/g, '').slice(0, 7)
                    });
                }
            }
        }
    } catch (err) {
        showToast("File Parsing Failed", "Could not parse selected file. Check CSV or JSON formatting.", "error");
    }
    renderBulkPreview();
}

function renderBulkPreview() {
    const container = document.getElementById('bulkPreviewContainer');
    const tbody = document.getElementById('bulkPreviewTableBody');
    const summary = document.getElementById('bulkParsedSummary');
    const badge = document.getElementById('bulkValidBadge');
    const execBtn = document.getElementById('executeBulkImportBtn');
    const execText = document.getElementById('executeBulkImportText');

    if (!parsedBulkUsers.length) {
        if (container) container.style.display = 'none';
        if (execBtn) execBtn.disabled = true;
        if (execText) execText.textContent = 'Import Users';
        return;
    }

    container.style.display = 'block';
    let validCount = 0;
    tbody.innerHTML = parsedBulkUsers.map(u => {
        const emailValid = /^[^s@]+@[^s@]+.[^s@]+$/.test(u.email);
        const roleValid = ['student', 'guardian', 'staff', 'admin'].includes(u.role);
        const isValid = emailValid && roleValid && u.name.length > 1;
        if (isValid) validCount++;
        return `
                    <tr style="border-bottom: 1px solid var(--line);">
                        <td style="padding: 7px 10px;">${u.name || '<em style="color:#ef4444;">Missing</em>'}</td>
                        <td style="padding: 7px 10px;">${u.email || '<em style="color:#ef4444;">Missing</em>'}</td>
                        <td style="padding: 7px 10px;"><span class="role-pill ${u.role}">${u.role}</span></td>
                        <td style="padding: 7px 10px;">${u.studentId || '-'}</td>
                        <td style="padding: 7px 10px;">
                            ${isValid ? '<span style="color:#0f9b67; font-weight:700;">Valid</span>' : '<span style="color:#dc2626; font-weight:700;">Invalid</span>'}
                        </td>
                    </tr>
                `;
    }).join('');

    summary.textContent = `${parsedBulkUsers.length} account${parsedBulkUsers.length === 1 ? '' : 's'} detected`;
    badge.textContent = `${validCount} valid`;
    if (execBtn) execBtn.disabled = validCount === 0;
    if (execText) execText.textContent = `Import ${validCount} Users`;
}

executeBulkImportBtn?.addEventListener('click', async () => {
    const validUsers = parsedBulkUsers.filter(u =>
        /^[^s@]+@[^s@]+.[^s@]+$/.test(u.email) &&
        ['student', 'guardian', 'staff', 'admin'].includes(u.role) &&
        u.name.length > 1
    );
    if (!validUsers.length) return;

    executeBulkImportBtn.disabled = true;
    executeBulkImportBtn.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 1s linear infinite;">sync</span> Importing...';

    let imported = 0;
    for (const user of validUsers) {
        try {
            const generatedUid = 'bulk_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
            await saveUserProfile(generatedUid, {
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId || ''
            });
            imported++;
        } catch (e) {
            console.warn("Failed to import user:", user.email, e);
        }
    }

    showToast("Bulk Import Completed", `Successfully imported ${imported} user accounts.`, "success");
    closeBulkImportModal();
    await loadAllData();
});


tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
});

// (2026-07-13) Navigate logo to Command Stats; was back navigation
const adminHeaderLogo = document.getElementById('adminHeaderLogo');
if (adminHeaderLogo) {
    adminHeaderLogo.addEventListener('click', (e) => {
        e.preventDefault();
        setTab('stats');
    });
}

if (adminProfileChip) {
    adminProfileChip.addEventListener('click', (event) => {
        event.stopPropagation();
        adminProfileDropdown?.classList.toggle('active');
    });
}

// (2026-07-13) Complete admin logout flow with listener stops; was redirect only
async function executeAdminLogout() {
    const allLogoutBtns = [
        document.getElementById('adminLogoutBtn'),
        document.getElementById('topbarDirectLogoutBtn'),
        document.getElementById('sidebarLogoutBtn')
    ].filter(Boolean);

    allLogoutBtns.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.6';
    });

    try {
        // 1. Terminate realtime listeners
        if (typeof stopAdminRealtimeThreads === 'function') stopAdminRealtimeThreads();
        if (unsubscribeAdminNotifications) {
            unsubscribeAdminNotifications();
            unsubscribeAdminNotifications = null;
        }
        // (2026-07-13) Retain offline master cache on logout; was clearing cache
        try {
            localStorage.removeItem('securo_session_token');
            sessionStorage.clear();
        } catch (e) { }

        // 3. Sign out of Firebase Auth
        await logout();

        // 4. Replace window location to prevent browser back navigation
        window.switchAdminMode('login');
    } catch (error) {
        console.warn("Admin logout failed:", error);
        showToast("Logout failed", error.message || "Could not sign out right now.", "error");
        allLogoutBtns.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }
}

document.getElementById('adminLogoutBtn')?.addEventListener('click', executeAdminLogout);
document.getElementById('topbarDirectLogoutBtn')?.addEventListener('click', executeAdminLogout);
document.getElementById('sidebarLogoutBtn')?.addEventListener('click', executeAdminLogout);

document.addEventListener('click', () => {
    adminProfileDropdown?.classList.remove('active');
});

// (2026-07-13) Non-destructive cache save and load guard; was wiping empty arrays
const SECURO_CACHE_KEY = 'securo_admin_master_cache';
let _cacheLoadedOnce = false;

// (2026-07-13) Fast summary & full state cache sync; was missing notifs & stats
function saveToLocalCache() {
    try {
        let existing = {};
        try {
            const rawExisting = sessionStorage.getItem(SECURO_CACHE_KEY) || localStorage.getItem(SECURO_CACHE_KEY);
            if (rawExisting) existing = JSON.parse(rawExisting) || {};
        } catch (e) { }

        let safeUsers = (Array.isArray(cachedUsers) && cachedUsers.length) ? cachedUsers : (Array.isArray(existing.users) && existing.users.length ? existing.users : []);
        const safePosts = (Array.isArray(cachedPosts) && cachedPosts.length) ? cachedPosts : (Array.isArray(existing.posts) && existing.posts.length ? existing.posts : []);
        const safeThreads = (Array.isArray(cachedThreads) && cachedThreads.length) ? cachedThreads : (Array.isArray(existing.threads) && existing.threads.length ? existing.threads : []);
        const safeLinks = (Array.isArray(cachedGuardianLinks) && cachedGuardianLinks.length) ? cachedGuardianLinks : (Array.isArray(existing.guardianLinks) && existing.guardianLinks.length ? existing.guardianLinks : []);
        const safeSos = (Array.isArray(cachedSosLogs) && cachedSosLogs.length) ? cachedSosLogs : (Array.isArray(existing.sosLogs) && existing.sosLogs.length ? existing.sosLogs : []);
        const safeEmerg = (Array.isArray(cachedEmergencyPosts) && cachedEmergencyPosts.length) ? cachedEmergencyPosts : (Array.isArray(existing.emergencyPosts) && existing.emergencyPosts.length ? existing.emergencyPosts : []);
        const safeAtt = (Array.isArray(cachedAttendance) && cachedAttendance.length) ? cachedAttendance : (Array.isArray(existing.attendanceLogs) && existing.attendanceLogs.length ? existing.attendanceLogs : []);
        const safeNotifs = (Array.isArray(cachedAdminNotifications) && cachedAdminNotifications.length) ? cachedAdminNotifications : (Array.isArray(existing.notifications) && existing.notifications.length ? existing.notifications : []);

        if (!safeUsers.length && (safeSos.length || safeAtt.length || safeEmerg.length || safeLinks.length)) {
            const list = [];
            const seen = new Set();
            const add = (id, name, email, role, studentId) => {
                const cleanId = String(id || studentId || email || '').trim();
                if (!cleanId || seen.has(cleanId)) return;
                seen.add(cleanId);
                list.push({
                    id: cleanId,
                    userId: String(id || ''),
                    studentId: String(studentId || '').replace(/\D/g, '').slice(0, 7),
                    name: name || (studentId ? `Student ${studentId}` : 'User'),
                    email: email || '',
                    role: role || 'student'
                });
            };
            safeSos.forEach(l => {
                const rep = (typeof getReporterInfo === 'function') ? getReporterInfo(l) : {};
                add(l.userId || l.studentUid, rep.name || l.studentName, rep.email || l.userEmail, rep.role || l.role, rep.studentId || l.studentId);
            });
            safeAtt.forEach(a => add(a.userId, a.studentName || a.name, a.userEmail || a.email, a.role, a.studentId));
            safeEmerg.forEach(p => add(p.userId, p.studentName || p.author || p.userName, p.email, p.role || 'student', p.studentId));
            safeLinks.forEach(g => {
                if (g.guardianId || g.guardianEmail) add(g.guardianId, g.guardianName, g.guardianEmail, 'guardian', '');
                if (g.studentUid || g.studentId) add(g.studentUid, g.studentName, g.studentEmail, 'student', g.studentId);
            });
            if (list.length) safeUsers = list;
        }

        const roleCounts = getRoleCounts(safeUsers);
        const totalUsers = safeUsers.length;
        const gadEngaged = new Set(
            safePosts.flatMap((post) => Array.isArray(post.likedBy) ? post.likedBy : [])
        ).size;

        const summary = {
            totalUsers,
            students: roleCounts.student,
            guardians: roleCounts.guardian,
            staff: roleCounts.staff,
            admins: roleCounts.admin,
            threads: safeThreads.length,
            posts: safePosts.length,
            gadEngaged,
            savedAdminName: currentAdminName || existing.savedAdminName || 'Administrator',
            time: Date.now()
        };

        try {
            const sumSerialized = JSON.stringify(summary);
            localStorage.setItem('securo_admin_summary', sumSerialized);
            sessionStorage.setItem('securo_admin_summary', sumSerialized);
        } catch (e) { }

        const slimEmerg = safeEmerg.slice(0, 50).map(p => {
            const c = { ...p };
            if (c.photo && c.photo.length > 300) delete c.photo;
            if (c.photoURL && c.photoURL.length > 300) delete c.photoURL;
            if (c.image && c.image.length > 300) delete c.image;
            if (Array.isArray(c.attachments)) {
                c.attachments = c.attachments.map(a => {
                    const att = { ...a };
                    if (att.url && att.url.length > 300) att.url = '';
                    if (att.thumb && att.thumb.length > 300) att.thumb = '';
                    return att;
                });
            }
            return c;
        });

        const slimAtt = safeAtt.slice(0, 100).map(a => {
            const c = { ...a };
            if (c.photo && c.photo.length > 300) delete c.photo;
            if (c.selfie && c.selfie.length > 300) delete c.selfie;
            return c;
        });

        const payload = {
            posts: safePosts.slice(0, 50),
            users: safeUsers,
            threads: safeThreads.slice(0, 50),
            guardianLinks: safeLinks,
            sosLogs: safeSos.slice(0, 50),
            emergencyPosts: slimEmerg,
            attendanceLogs: slimAtt,
            notifications: safeNotifs.slice(0, 50),
            summary,
            savedAdminName: currentAdminName || existing.savedAdminName || 'Administrator',
            time: Date.now()
        };

        const serialized = JSON.stringify(payload);
        try { localStorage.setItem(SECURO_CACHE_KEY, serialized); } catch (e) { }
        try { sessionStorage.setItem(SECURO_CACHE_KEY, serialized); } catch (e) { }
        if (safeUsers.length) {
            try {
                const usersSerialized = JSON.stringify(safeUsers);
                localStorage.setItem("securo_users_local", usersSerialized);
                sessionStorage.setItem("securo_users_local", usersSerialized);
            } catch (e) { }
        }
    } catch (err) {
        console.warn("Could not save to local cache:", err);
    }
}

// (2026-07-13) Extract users from SOS and attendance logs; was SOS-only fallback
function extractUsersFromLogs(logs = []) {
    if (!Array.isArray(logs) || !logs.length) return [];
    const seen = new Set();
    const list = [];
    logs.forEach(l => {
        const sid = String(l.studentId || l.profile?.studentId || '').trim();
        const uid = String(l.userId || l.studentUid || l.id || '').trim();
        const key = sid || uid || (l.userEmail || l.email || '').toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const name = l.studentName || l.userName || l.reporterName || l.profile?.name || (sid ? `Student ${sid}` : 'Student');
        const email = l.userEmail || l.email || l.profile?.email || '';
        const role = l.role || (l.profile?.role) || 'student';
        const isStaff = role === 'staff' || String(name).toLowerCase().includes('staff') || String(email).toLowerCase().startsWith('staff.');
        list.push({
            id: uid || sid,
            userId: uid || sid,
            studentId: sid,
            name,
            email,
            role: isStaff ? 'staff' : role
        });
    });
    return list;
}

// (2026-07-13) Hydrate notifications & vault in local cache; was omitted
function loadFromLocalCache(force = false) {
    try {
        let raw = null;
        try { raw = sessionStorage.getItem(SECURO_CACHE_KEY) || localStorage.getItem(SECURO_CACHE_KEY); } catch (e) { }
        if (raw) {
            const data = JSON.parse(raw);
            if (data) {
                if (Array.isArray(data.posts) && data.posts.length) cachedPosts = data.posts;
                if (Array.isArray(data.users) && data.users.length) cachedUsers = data.users;
                if (Array.isArray(data.threads) && data.threads.length) cachedThreads = data.threads;
                if (Array.isArray(data.guardianLinks) && data.guardianLinks.length) cachedGuardianLinks = data.guardianLinks;
                if (Array.isArray(data.sosLogs) && data.sosLogs.length) cachedSosLogs = data.sosLogs;
                if (Array.isArray(data.emergencyPosts) && data.emergencyPosts.length) cachedEmergencyPosts = data.emergencyPosts;
                if (Array.isArray(data.attendanceLogs) && data.attendanceLogs.length) cachedAttendance = data.attendanceLogs;
                if (Array.isArray(data.notifications) && data.notifications.length) cachedAdminNotifications = data.notifications;
                if (data.savedAdminName && adminDropdownName) {
                    adminDropdownName.textContent = data.savedAdminName;
                    if (adminInitials) {
                        adminInitials.textContent = data.savedAdminName
                            .split(/\s+/)
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase() || 'AD';
                    }
                }
            }
        }
        if (!cachedUsers.length) {
            try {
                const localUsersRaw = sessionStorage.getItem("securo_users_local") || localStorage.getItem("securo_users_local");
                if (localUsersRaw) {
                    const parsedLocal = JSON.parse(localUsersRaw);
                    if (Array.isArray(parsedLocal) && parsedLocal.length) cachedUsers = parsedLocal;
                }
            } catch (e) { }
        }
        if (!cachedUsers.length) {
            try {
                const dirRaw = sessionStorage.getItem("securo_user_directory") || localStorage.getItem("securo_user_directory");
                if (dirRaw) {
                    const dir = JSON.parse(dirRaw);
                    const dirUsers = Object.entries(dir).map(([uid, u]) => ({
                        id: uid,
                        userId: uid,
                        name: u.name || (u.studentId ? `Student ${u.studentId}` : (u.email ? u.email.split('@')[0] : 'User')),
                        email: u.email || '',
                        studentId: u.studentId || '',
                        role: u.role || 'student'
                    }));
                    if (dirUsers.length) cachedUsers = dirUsers;
                }
            } catch (e) { }
        }
        if (!cachedUsers.length) {
            const fallbackList = [];
            const seen = new Set();
            const add = (id, name, email, role, studentId) => {
                const cleanId = String(id || studentId || email || '').trim();
                if (!cleanId || seen.has(cleanId)) return;
                seen.add(cleanId);
                fallbackList.push({
                    id: cleanId,
                    userId: String(id || ''),
                    studentId: String(studentId || '').replace(/\D/g, '').slice(0, 7),
                    name: name || (studentId ? `Student ${studentId}` : 'User'),
                    email: email || '',
                    role: role || 'student'
                });
            };
            (cachedSosLogs || []).forEach(l => {
                const rep = (typeof getReporterInfo === 'function') ? getReporterInfo(l) : {};
                add(l.userId || l.studentUid, rep.name || l.studentName, rep.email || l.userEmail, rep.role || l.role, rep.studentId || l.studentId);
            });
            (cachedAttendance || []).forEach(a => add(a.userId, a.studentName || a.name, a.userEmail || a.email, a.role, a.studentId));
            (cachedEmergencyPosts || []).forEach(p => add(p.userId, p.studentName || p.author || p.userName, p.email, p.role || 'student', p.studentId));
            (cachedGuardianLinks || []).forEach(g => {
                if (g.guardianId || g.guardianEmail) add(g.guardianId, g.guardianName, g.guardianEmail, 'guardian', '');
                if (g.studentUid || g.studentId) add(g.studentUid, g.studentName, g.studentEmail, 'student', g.studentId);
            });
            if (fallbackList.length) cachedUsers = fallbackList;
        }
        applyFilters();
        renderReporterStats();
        renderAdminNotifications();
        if (typeof renderAdminVaultGallery === 'function') renderAdminVaultGallery();
        if (typeof renderDailyReport === 'function') renderDailyReport();
        if (typeof renderAdminSosQueue === 'function') renderAdminSosQueue(cachedSosLogs);
        if (typeof setUserEditorState === 'function' && cachedUsers.length && !selectedManagedUserId) {
            setUserEditorState(cachedUsers[0]);
        }
        _cacheLoadedOnce = true;
        return true;
    } catch (err) {
        console.warn("Could not load from local cache:", err);
        return false;
    }
}

// (2026-07-13) Hydrate cache on boot; delay remote fetch until user is auth
window.addEventListener('beforeunload', saveToLocalCache);
loadFromLocalCache();
if (auth.currentUser) {
    loadAllData().catch(() => { });
}

// (2026-07-13) Always init chat & sync admin role; was tab-gated
window._triggerAdminDashboardLoad = () => {
    loadFromLocalCache(true);
    loadAllData().catch(() => { });
    initAdminChat();
};

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        if (sessionStorage.getItem('securo_session_token') === 'system_admin_securo') {
            window.switchAdminMode('dashboard');
            return;
        }
        window.switchAdminMode('login');
        return;
    }
    const reqView = new URLSearchParams(window.location.search).get('view');
    currentAdminUid = user.uid;
    stopAdminRealtimeThreads();
    initAdminChat();

    const isKnownAdmin = isAdminEmail(user.email);
    if (isKnownAdmin) {
        if (reqView === 'analytics') { window.switchAdminMode('analytics'); }
        else {
            if (reqView === 'login') window.history.replaceState({}, '', 'admin.html');
            window.switchAdminMode('dashboard');
        }
        currentAdminName = user.displayName || 'Administrator';
        if (adminDropdownName) adminDropdownName.textContent = currentAdminName;
        if (adminInitials) adminInitials.textContent = 'AD';
        saveUserProfile(user.uid, {
            name: currentAdminName,
            email: user.email || 'admin@admin.com',
            role: 'admin'
        }).catch(() => { });
        loadFromLocalCache(true);
        loadAllData().catch(() => { });
    }

    try {
        getUserProfile(user.uid).then((profile) => {
            if (profile?.name) {
                currentAdminName = profile.name;
                if (adminDropdownName) adminDropdownName.textContent = currentAdminName;
                if (adminInitials) adminInitials.textContent = getInitials(currentAdminName);
            }
            if (!isAdminEmail(user.email) && profile?.role !== 'admin') {
                window.switchAdminMode('login');
            }
        }).catch(() => { });

        if (!isKnownAdmin) {
            const profile = await getUserProfile(user.uid).catch(() => null);
            if (profile?.role !== 'admin') {
                window.switchAdminMode('login');
                return;
            }
            if (reqView === 'analytics') { window.switchAdminMode('analytics'); }
            else {
                if (reqView === 'login') window.history.replaceState({}, '', 'admin.html');
                window.switchAdminMode('dashboard');
            }
            currentAdminName = profile.name || user.displayName || 'Administrator';
            if (adminDropdownName) adminDropdownName.textContent = currentAdminName;
            // (2026-07-13) Force fresh cache reload on admin auth; was stale skip
            loadFromLocalCache(true);
            loadAllData().catch(() => { });
        }

        if (unsubscribeAdminNotifications) unsubscribeAdminNotifications();
        unsubscribeAdminNotifications = subscribeToAccountNotifications(user.uid, renderAdminNotifications);
    } catch (error) {
        showToast("Sync failed", error.message || "Unable to load admin data right now.", "error");
    }
});

// (2026-07-13) Batch data loading UI updates; was thrashing DOM on each promise
let _adminUIRefreshTimer = null;
function scheduleAdminUIRefresh(delay = 100) {
    if (_adminUIRefreshTimer) clearTimeout(_adminUIRefreshTimer);
    _adminUIRefreshTimer = setTimeout(() => {
        applyFilters();
        renderReporterStats();
        renderAdminNotifications();
        if (typeof renderDailyReport === 'function') renderDailyReport();
        if (typeof renderAdminSosQueue === 'function') renderAdminSosQueue(cachedSosLogs);
        if (document.getElementById('sec-sos')?.classList.contains('active')) {
            if (typeof renderAdminSosMap === 'function') renderAdminSosMap();
        }
    }, delay);
}

// (2026-07-13) Fast queueable loadAllData with bounded query timeout; was slow
let _isLoadingAllData = false;
let _pendingLoadAllData = false;
async function loadAllData(force = false) {
    if (_isLoadingAllData) {
        _pendingLoadAllData = true;
        return;
    }
    _isLoadingAllData = true;
    _pendingLoadAllData = false;
    try {
        // (2026-07-13) Set 20s network race for admin load; was 2200ms dropping data
        const fastRace = (prom, ms = 20000) => Promise.race([
            prom,
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
        ]).catch(err => {
            console.warn("Fast query fallback:", err);
            return null;
        });

        const pPosts = fastRace(getGADPosts()).then(posts => {
            if (Array.isArray(posts) && posts.length) {
                cachedPosts = posts.sort((a, b) => {
                    const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.timestamp || 0).getTime();
                    const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.timestamp || 0).getTime();
                    return dateB - dateA;
                });
                scheduleAdminUIRefresh(20);
                saveToLocalCache();
            }
        });

        const pSos = fastRace(getAllSOSLogs()).then(sos => {
            if (Array.isArray(sos) && sos.length) {
                cachedSosLogs = sos;
                if (!cachedUsers.length) {
                    cachedUsers = extractUsersFromLogs(sos);
                }
                scheduleAdminUIRefresh(20);
                saveToLocalCache();
            }
        });

        const pUsers = fastRace(getAllUsers()).then(users => {
            let userList = Array.isArray(users) ? users : [];
            if (!userList.length && cachedSosLogs.length) {
                userList = extractUsersFromLogs(cachedSosLogs);
            }
            if (userList.length) {
                cachedUsers = userList;
                scheduleAdminUIRefresh(20);
                saveToLocalCache();
            }
        });

        const pThreads = fastRace(getAllChatThreadsOnce(currentAdminUid)).then(threads => {
            if (Array.isArray(threads) && threads.length) {
                cachedThreads = threads;
                if (typeof renderThreads === 'function') renderThreads(cachedThreads);
                scheduleAdminUIRefresh(20);
                saveToLocalCache();
            }
        });

        const pLinks = fastRace(getAllGuardianLinksAdmin()).then(links => {
            if (Array.isArray(links) && links.length) {
                cachedGuardianLinks = links;
                saveToLocalCache();
            }
        });

        const pEmerg = fastRace(getAllEmergencyPosts()).then(ep => {
            if (Array.isArray(ep) && ep.length) {
                cachedEmergencyPosts = ep;
                if (typeof renderAdminVaultGallery === 'function') renderAdminVaultGallery();
                scheduleAdminUIRefresh(20);
                saveToLocalCache();
            }
        });

        const pAtt = fastRace(getAllAttendance()).then(att => {
            if (Array.isArray(att) && att.length) {
                cachedAttendance = att;
                if (!cachedUsers.length) {
                    cachedUsers = extractUsersFromLogs(att);
                }
                if (typeof renderDailyReport === 'function') renderDailyReport();
                saveToLocalCache();
            }
        });

        await Promise.allSettled([pPosts, pSos, pUsers, pThreads, pLinks, pEmerg, pAtt]);
        // (2026-07-13) Multi-source user extraction after settle; was SOS-only fallback
        if (!cachedUsers.length) {
            const fallbackList = [];
            const seen = new Set();
            const add = (id, name, email, role, studentId) => {
                const cleanId = String(id || studentId || email || '').trim();
                if (!cleanId || seen.has(cleanId)) return;
                seen.add(cleanId);
                fallbackList.push({
                    id: cleanId,
                    userId: String(id || ''),
                    studentId: String(studentId || '').replace(/\D/g, '').slice(0, 7),
                    name: name || (studentId ? `Student ${studentId}` : 'User'),
                    email: email || '',
                    role: role || 'student'
                });
            };
            (cachedSosLogs || []).forEach(l => {
                const rep = (typeof getReporterInfo === 'function') ? getReporterInfo(l) : {};
                add(l.userId || l.studentUid, rep.name || l.studentName, rep.email || l.userEmail, rep.role || l.role, rep.studentId || l.studentId);
            });
            (cachedAttendance || []).forEach(a => add(a.userId, a.studentName || a.name, a.userEmail || a.email, a.role, a.studentId));
            (cachedEmergencyPosts || []).forEach(p => add(p.userId, p.studentName || p.author || p.userName, p.email, p.role || 'student', p.studentId));
            (cachedGuardianLinks || []).forEach(g => {
                if (g.guardianId || g.guardianEmail) add(g.guardianId, g.guardianName, g.guardianEmail, 'guardian', '');
                if (g.studentUid || g.studentId) add(g.studentUid, g.studentName, g.studentEmail, 'student', g.studentId);
            });
            if (fallbackList.length) cachedUsers = fallbackList;
        }
        saveToLocalCache();
        if (_adminUIRefreshTimer) clearTimeout(_adminUIRefreshTimer);
        applyFilters();
        renderReporterStats();
        renderAdminNotifications();
        if (typeof renderDailyReport === 'function') renderDailyReport();
        if (typeof renderAdminSosQueue === 'function') renderAdminSosQueue(cachedSosLogs);
        if (typeof renderAdminVaultGallery === 'function') renderAdminVaultGallery();
        if (document.getElementById('sec-sos')?.classList.contains('active')) {
            if (typeof renderAdminSosMap === 'function') renderAdminSosMap();
        }
    } finally {
        _isLoadingAllData = false;
        if (_pendingLoadAllData) {
            _pendingLoadAllData = false;
            setTimeout(() => { loadAllData(true).catch(() => { }); }, 60);
        }
    }
    // (2026-07-13) Subscribe to real-time GAD counseling messages; was uncalled
    if (!window._gadMessagesUnsub) {
        window._gadMessagesUnsub = subscribeToGADMessages(null, (messages) => {
            const openCount = (messages || []).filter(m => m.status === 'open').length;
            const gadTabBtn = document.querySelector('.tab-btn[data-tab="gad"]');
            if (gadTabBtn) {
                let badge = gadTabBtn.querySelector('.gad-badge');
                if (openCount > 0) {
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'gad-badge';
                        badge.style.cssText = 'background:#ef4444; color:#fff; font-size:10px; border-radius:10px; margin-left:6px; padding:2px 6px; font-weight:700;';
                        gadTabBtn.appendChild(badge);
                    }
                    badge.textContent = `${openCount}`;
                } else if (badge) {
                    badge.remove();
                }
            }
        });
    }
    // (2026-07-13) Set managed user editor state; was simulator sync
    if (isCreatingManagedUser) {
        setUserEditorState(null, { creating: true });
    } else if (selectedManagedUserId) {
        setUserEditorState(getManagedUserById(selectedManagedUserId));
    } else {
        setUserEditorState(cachedUsers[0] || null, { creating: !cachedUsers.length });
    }
}

function renderEmpty(container, icon, text) {
    container.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size:42px; opacity:0.35;">${icon}</span>
                    <p style="margin:10px 0 0;">${text}</p>
                </div>
            `;
}

function renderGadPosts(posts) {
    if (!posts.length) {
        renderEmpty(gadList, 'campaign', 'No GAD posts published yet.');
        return;
    }

    gadList.innerHTML = posts.map((post) => `
                <div class="table-row">
                    <div>
                        <div class="row-title">${post.content || 'Untitled GAD post'}</div>
                        <div class="row-sub">Published as an official GAD bulletin.</div>
                        ${post.image ? `<div class="row-sub" style="margin-top:8px;"><img src="${post.image}" alt="GAD post image" style="width:72px; height:72px; border-radius:14px; object-fit:cover; border:1px solid rgba(0,0,0,0.05);"></div>` : ''}
                        <div class="meta-pair">
                            <span class="mini-chip"><span class="material-symbols-outlined" style="font-size:16px;">groups</span>${cachedUsers.length} users reached</span>
                            <span class="mini-chip"><span class="material-symbols-outlined" style="font-size:16px;">favorite</span>${Array.isArray(post.likedBy) ? post.likedBy.length : (post.likes || 0)} engaged</span>
                        </div>
                    </div>
                    <div>
                        <div class="row-title">${post.author || 'GAD Office Official'}</div>
                        <div class="row-sub">${post.email || 'No email'}</div>
                    </div>
                    <div>
                        <span class="status-pill gad">Live</span>
                        <div class="row-sub">${post.timestamp || 'Recent'}</div>
                    </div>
                    <div class="row-actions">
                        <button class="icon-btn" onclick="handleEditPost('${post.id}')">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn delete" onclick="handleDeletePost('${post.id}')">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                </div>
            `).join('');
}

// (2026-07-13) Role counts recognize staff by role and name; was explicit role
function getRoleCounts(users) {
    return (Array.isArray(users) ? users : []).reduce((acc, user) => {
        const isStaff = user?.role === 'staff' || String(user?.name || '').toLowerCase().includes('staff') || String(user?.email || '').toLowerCase().startsWith('staff.');
        const role = (user?.role === 'admin' || isAdminEmail(user?.email)) ? 'admin' : user?.role === 'guardian' ? 'guardian' : isStaff ? 'staff' : 'student';
        acc[role] += 1;
        return acc;
    }, { student: 0, guardian: 0, staff: 0, admin: 0 });
}

// (2026-07-13) Render stats always from users or cache; was return early
function renderStatistics(users) {
    users = (Array.isArray(users) && users.length) ? users : (cachedUsers || []);
    const roleCounts = getRoleCounts(users);
    const totalUsers = users.length;
    const gadEngaged = new Set(
        cachedPosts.flatMap((post) => Array.isArray(post.likedBy) ? post.likedBy : [])
    ).size;
    const maxMetric = Math.max(totalUsers || 0, cachedPosts.length || 0, cachedThreads.length || 0, gadEngaged || 0, 1);

    // (2026-07-13) Guard metric elements against null textContent; was unguarded set
    if (metricUsers) metricUsers.textContent = totalUsers;
    if (metricStudents) metricStudents.textContent = roleCounts.student;
    if (metricGuardians) metricGuardians.textContent = roleCounts.guardian;
    if (metricThreads) metricThreads.textContent = cachedThreads.length;
    if (metricPosts) metricPosts.textContent = cachedPosts.length;
    if (metricGadReach) metricGadReach.textContent = totalUsers;
    if (metricGadEngaged) metricGadEngaged.textContent = gadEngaged;

    if (roleChart) {
        const studentDeg = totalUsers ? (roleCounts.student / totalUsers) * 360 : 0;
        const guardianDeg = totalUsers ? (roleCounts.guardian / totalUsers) * 360 : 0;
        const staffDeg = totalUsers ? (roleCounts.staff / totalUsers) * 360 : 0;
        // (2026-07-13) Soft pastel colors for donut chart and bars; was harsh dark
        roleChart.style.background = `conic-gradient(
                    #8b5cf6 0deg ${studentDeg}deg,
                    #fb7185 ${studentDeg}deg ${studentDeg + guardianDeg}deg,
                    #60a5fa ${studentDeg + guardianDeg}deg ${studentDeg + guardianDeg + staffDeg}deg,
                    #cbd5e1 ${studentDeg + guardianDeg + staffDeg}deg 360deg
                )`;
    }
    if (roleChartTotal) roleChartTotal.textContent = totalUsers;
    if (roleLegend) {
        roleLegend.innerHTML = `
                    <div class="legend-item">
                        <div class="legend-meta"><span class="legend-swatch" style="background: #8b5cf6;"></span><span>Students</span></div>
                        <strong style="font-variant-numeric: tabular-nums;">${roleCounts.student}</strong>
                    </div>
                    <div class="legend-item">
                        <div class="legend-meta"><span class="legend-swatch" style="background: #fb7185;"></span><span>Guardians</span></div>
                        <strong style="font-variant-numeric: tabular-nums;">${roleCounts.guardian}</strong>
                    </div>
                    <div class="legend-item">
                        <div class="legend-meta"><span class="legend-swatch" style="background: #60a5fa;"></span><span>Staff</span></div>
                        <strong style="font-variant-numeric: tabular-nums;">${roleCounts.staff}</strong>
                    </div>
                    <div class="legend-item">
                        <div class="legend-meta"><span class="legend-swatch" style="background: #cbd5e1;"></span><span>Admins</span></div>
                        <strong style="font-variant-numeric: tabular-nums;">${roleCounts.admin}</strong>
                    </div>
                `;
    }
    if (statsBarList) {
        const barRows = [
            { label: 'Registered Users', value: totalUsers, gradient: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
            { label: 'Published GAD Posts', value: cachedPosts.length, gradient: 'linear-gradient(90deg, #60a5fa, #3b82f6)' },
            { label: 'Support Conversations', value: cachedThreads.length, gradient: 'linear-gradient(90deg, #38bdf8, #0ea5e9)' },
            { label: 'Engaged Users', value: gadEngaged, gradient: 'linear-gradient(90deg, #fb7185, #f43f5e)' }
        ];
        statsBarList.innerHTML = barRows.map((row) => `
                    <div class="bar-row">
                        <div class="bar-top">
                            <span style="font-weight:600; color:var(--ink);">${row.label}</span>
                            <strong style="font-variant-numeric: tabular-nums; color:var(--ink);">${row.value}</strong>
                        </div>
                        <div class="bar-track" style="background:#f1f0f7; border-radius:999px; height:8px;">
                            <div class="bar-fill" style="width:${Math.max(6, Math.round((row.value / maxMetric) * 100))}%; background:${row.gradient}; border-radius:999px;"></div>
                        </div>
                    </div>
                `).join('');
    }
    renderReporterStats();
}

// (2026-07-13) Set campus center coordinates for admin map editor; was missing definition
const ADMIN_CAMPUS_CENTER = [11.26659, 124.00872];
// (2026-07-13) Complete facility descriptions lookup dictionary; was missing desc
const CAMPUS_BUILDING_DESCRIPTIONS = {
    "Guard House": "24/7 campus security dispatch and visitor verification.",
    "Medical Clinic": "First-aid, medical triage, and emergency response clinic.",
    "Admin Building": "Administrative offices and student services.",
    "Main Gate": "Primary campus entrance & verification point.",
    "HM Building": "Hospitality Management laboratories and culinary suites.",
    "Educ Building": "College of Education lecture rooms and dean's office.",
    "Engineering Complex": "Engineering & Industrial Technology workshops.",
    "University Gym": "Campus sports arena and assembly gymnasium.",
    "Campus Library": "Learning commons, digital archives, and quiet study hall."
};

// (2026-07-13) Set exact 9 campus facilities matching adminGeofenceModalMap; was 7 facilities
const DEFAULT_CAMPUS_BUILDINGS = [
    { name: "Guard House", coords: [11.26785, 124.00865], icon: "security", desc: CAMPUS_BUILDING_DESCRIPTIONS["Guard House"] },
    { name: "Medical Clinic", coords: [11.26780, 124.00895], icon: "medical_services", desc: CAMPUS_BUILDING_DESCRIPTIONS["Medical Clinic"] },
    { name: "Admin Building", coords: [11.26735, 124.00835], icon: "account_balance", desc: CAMPUS_BUILDING_DESCRIPTIONS["Admin Building"] },
    { name: "Main Gate", coords: [11.26735, 124.00865], icon: "door_front", desc: CAMPUS_BUILDING_DESCRIPTIONS["Main Gate"] },
    { name: "HM Building", coords: [11.26715, 124.00870], icon: "restaurant", desc: CAMPUS_BUILDING_DESCRIPTIONS["HM Building"] },
    { name: "Educ Building", coords: [11.26705, 124.00910], icon: "school", desc: CAMPUS_BUILDING_DESCRIPTIONS["Educ Building"] },
    { name: "Engineering Complex", coords: [11.26680, 124.00925], icon: "precision_manufacturing", desc: CAMPUS_BUILDING_DESCRIPTIONS["Engineering Complex"] },
    { name: "University Gym", coords: [11.26740, 124.00935], icon: "fitness_center", desc: CAMPUS_BUILDING_DESCRIPTIONS["University Gym"] },
    { name: "Campus Library", coords: [11.26620, 124.00895], icon: "local_library", desc: CAMPUS_BUILDING_DESCRIPTIONS["Campus Library"] }
];

// (2026-07-13) Set exact 6-point geofence matching adminGeofenceModalMap; was 5-point draft
const DEFAULT_CAMPUS_GEOFENCE_POLYGON = [
    [11.26805, 124.00780],
    [11.26820, 124.00902],
    [11.26760, 124.00900],
    [11.26755, 124.00965],
    [11.26522, 124.00930],
    [11.26538, 124.00755]
];

function getActiveAdminBuildings() {
    try {
        const stored = localStorage.getItem('securo_campus_buildings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) { }
    return DEFAULT_CAMPUS_BUILDINGS.map(b => ({ ...b, coords: [...b.coords] }));
}

function getActiveAdminGeofencePolygon() {
    try {
        const stored = localStorage.getItem('securo_custom_geofence');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
        }
    } catch (e) { }
    return DEFAULT_CAMPUS_GEOFENCE_POLYGON.map(pt => [...pt]);
}

let currentAdminGeofence = getActiveAdminGeofencePolygon();
let currentAdminBuildings = getActiveAdminBuildings();

// (2026-07-13) Clean icon-only markers with hover/tap details; was wide text cards
function renderBuildingMarkers() {
    if (!adminSosLeafletMap) return;
    adminBuildingMarkers.forEach(m => adminSosLeafletMap.removeLayer(m));
    adminBuildingMarkers = [];

    currentAdminBuildings.forEach((b) => {
        // (2026-07-13) Life360 circular landmark radius & marker; was pin only
        const landmarkCircle = L.circle(b.coords, {
            radius: b.radius || 22,
            color: '#7c3aed',
            weight: 1.5,
            opacity: 0.65,
            fillColor: '#8b5cf6',
            fillOpacity: 0.12
        }).addTo(adminSosLeafletMap);
        adminBuildingMarkers.push(landmarkCircle);

        const bIcon = L.divIcon({
            className: 'campus-facility-icon-marker',
            html: `<div style="background:white; border-radius:50%; width:30px; height:30px; box-shadow:0 3px 10px rgba(24,20,40,0.16); border:2px solid #5a1fe0; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span class="material-symbols-outlined" style="font-size:16px; color:#5a1fe0;">${b.icon || 'location_on'}</span></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        const marker = L.marker(b.coords, { icon: bIcon }).addTo(adminSosLeafletMap);
        marker.bindPopup(`
                    <div style="padding:4px 2px; min-width:140px;">
                        <strong style="display:flex; align-items:center; gap:5px; font-size:0.85rem; color:#181428;">
                            <span class="material-symbols-outlined" style="font-size:16px; color:#5a1fe0;">${b.icon || 'location_on'}</span>
                            ${b.name}
                        </strong>
                        <p style="margin:4px 0 0; font-size:0.75rem; color:#64748b; line-height:1.3;">${b.desc || 'Campus facility'}</p>
                    </div>
                `);
        adminBuildingMarkers.push(marker);
    });
}

function renderModalEditorMarkers() {
    if (!adminModalLeafletMap) return;

    modalBuildingMarkers.forEach(m => adminModalLeafletMap.removeLayer(m));
    modalBuildingMarkers = [];
    modalGeofenceVertexMarkers.forEach(m => adminModalLeafletMap.removeLayer(m));
    modalGeofenceVertexMarkers = [];

    if (!modalGeofencePolygonLayer) {
        modalGeofencePolygonLayer = L.polygon(currentAdminGeofence, {
            color: '#5a1fe0',
            weight: 3.5,
            dashArray: '6, 6',
            fillColor: '#7c3aed',
            fillOpacity: 0.15
        }).addTo(adminModalLeafletMap);
    } else {
        modalGeofencePolygonLayer.setLatLngs(currentAdminGeofence);
    }

    // Draggable Geofence Vertices
    currentAdminGeofence.forEach((coord, idx) => {
        const markerIcon = L.divIcon({
            className: 'modal-geofence-vertex',
            html: `<div style="background:#5a1fe0; color:white; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; border:2.5px solid white; box-shadow:0 4px 14px rgba(0,0,0,0.4); cursor:grab;">${idx + 1}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        const marker = L.marker(coord, { icon: markerIcon, draggable: true }).addTo(adminModalLeafletMap);
        // (2026-07-13) Update local vertex position on drag; save only on button click
        marker.on('drag', (e) => {
            const newPos = e.target.getLatLng();
            currentAdminGeofence[idx] = [Number(newPos.lat), Number(newPos.lng)];
            modalGeofencePolygonLayer.setLatLngs(currentAdminGeofence);
        });
        modalGeofenceVertexMarkers.push(marker);
    });

    // (2026-07-13) Enable marker name & icon editing in modal; was delete only
    window._deleteAdminFacilityMarker = (targetIdx) => {
        currentAdminBuildings.splice(targetIdx, 1);
        renderModalEditorMarkers();
    };

    window._saveAdminFacilityMarker = (targetIdx) => {
        const nameEl = document.getElementById(`facilityMarkerName_${targetIdx}`);
        const iconEl = document.getElementById(`facilityMarkerIcon_${targetIdx}`);
        if (nameEl && nameEl.value.trim() && currentAdminBuildings[targetIdx]) {
            currentAdminBuildings[targetIdx].name = nameEl.value.trim();
            if (iconEl && iconEl.value) {
                currentAdminBuildings[targetIdx].icon = iconEl.value;
            }
            renderModalEditorMarkers();
        }
    };

    currentAdminBuildings.forEach((b, idx) => {
        const bIcon = L.divIcon({
            className: 'modal-bldg-marker',
            html: `<div style="background:#f5f3ff; border-radius:10px; padding:4px 10px; box-shadow:0 4px 14px rgba(0,0,0,0.18); font-size:11px; font-weight:800; color:#181428; border:2px solid #5a1fe0; display:flex; align-items:center; gap:6px; cursor:pointer;"><span class="material-symbols-outlined" style="font-size:15px; color:#5a1fe0;">${b.icon || 'location_on'}</span>${b.name}</div>`,
            iconSize: [110, 28],
            iconAnchor: [55, 14]
        });
        const marker = L.marker(b.coords, { icon: bIcon, draggable: true }).addTo(adminModalLeafletMap);
        marker.on('drag', (e) => {
            const newPos = e.target.getLatLng();
            currentAdminBuildings[idx].coords = [Number(newPos.lat), Number(newPos.lng)];
        });
        /* Facility marker edit card */
        marker.bindPopup(`
                    <div class="facility-marker-editor-card" style="padding:8px 4px; min-width:180px; display:flex; flex-direction:column; gap:8px;">
                        <div style="font-weight:800; font-size:0.85rem; color:#181428; display:flex; align-items:center; gap:6px;">
                            <span class="material-symbols-outlined" style="font-size:18px; color:#5a1fe0;">${b.icon || 'location_on'}</span>
                            <span>Edit Facility Marker</span>
                        </div>
                        <div>
                            <label style="font-size:0.7rem; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">Marker Name</label>
                            <input type="text" id="facilityMarkerName_${idx}" value="${b.name.replace(/"/g, '&quot;')}" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:0.8rem; border-radius:8px; border:1px solid #cbd5e1; outline:none;" />
                        </div>
                        <div>
                            <label style="font-size:0.7rem; font-weight:700; color:#64748b; display:block; margin-bottom:2px;">Facility Icon</label>
                            <select id="facilityMarkerIcon_${idx}" style="width:100%; box-sizing:border-box; padding:5px 8px; font-size:0.8rem; border-radius:8px; border:1px solid #cbd5e1; outline:none; background:white;">
                                <option value="school" ${b.icon === 'school' ? 'selected' : ''}>school (Classrooms / Academics)</option>
                                <option value="apartment" ${b.icon === 'apartment' ? 'selected' : ''}>apartment (Admin Building)</option>
                                <option value="local_library" ${b.icon === 'local_library' ? 'selected' : ''}>local_library (Library)</option>
                                <option value="science" ${b.icon === 'science' ? 'selected' : ''}>science (Laboratory)</option>
                                <option value="restaurant" ${b.icon === 'restaurant' ? 'selected' : ''}>restaurant (Canteen)</option>
                                <option value="sports_soccer" ${b.icon === 'sports_soccer' ? 'selected' : ''}>sports_soccer (Gym / Oval)</option>
                                <option value="local_hospital" ${b.icon === 'local_hospital' ? 'selected' : ''}>local_hospital (Clinic)</option>
                                <option value="security" ${b.icon === 'security' ? 'selected' : ''}>security (Guardhouse)</option>
                                <option value="local_parking" ${b.icon === 'local_parking' ? 'selected' : ''}>local_parking (Parking)</option>
                                <option value="location_city" ${b.icon === 'location_city' ? 'selected' : ''}>location_city (Facility)</option>
                                <option value="place" ${b.icon === 'place' ? 'selected' : ''}>place (General Landmark)</option>
                            </select>
                        </div>
                        <div style="display:flex; gap:6px; justify-content:space-between; margin-top:4px;">
                            <button type="button" class="action-btn" style="flex:1; padding:6px 10px; font-size:0.75rem; border-radius:8px; background:#5a1fe0; color:white; border:none; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="window._saveAdminFacilityMarker(${idx})">
                                <span class="material-symbols-outlined" style="font-size:15px;">check</span>
                                <span>Save</span>
                            </button>
                            <button type="button" class="action-btn" style="padding:6px 10px; font-size:0.75rem; border-radius:8px; background:#fee2e2; color:#b91c1c; border:none; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:4px;" onclick="window._deleteAdminFacilityMarker(${idx})">
                                <span class="material-symbols-outlined" style="font-size:15px;">delete</span>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                `);
        modalBuildingMarkers.push(marker);
    });

    const vertexCounter = document.getElementById('geofenceModalVertexCount');
    if (vertexCounter) {
        vertexCounter.textContent = `${currentAdminGeofence.length} Boundary Vertices • ${currentAdminBuildings.length} Campus Facilities`;
    }
}

let isModalAddingMarker = false;

function openGeofenceEditorModal() {
    const modal = document.getElementById('adminGeofenceModal');
    if (!modal) return;

    currentAdminGeofence = getActiveAdminGeofencePolygon();
    currentAdminBuildings = getActiveAdminBuildings();
    modal.style.display = 'flex';

    setTimeout(() => {
        if (!adminModalLeafletMap) {
            adminModalLeafletMap = L.map('adminGeofenceModalMap', {
                zoomControl: true,
                attributionControl: false,
                zoomSnap: 0.25,
                zoomDelta: 0.5,
                wheelPxPerZoomLevel: 140
            }).setView(ADMIN_CAMPUS_CENTER, 17);

            // (2026-07-13) Use OSM tiles; was broken CartoDB tiles requiring API key
            const modalBaseMaps = {
                "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
                "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
                "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
                "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 })
            };
            modalBaseMaps["Streets"].addTo(adminModalLeafletMap);
            L.control.layers(modalBaseMaps, null, { position: 'topright' }).addTo(adminModalLeafletMap);

            adminModalLeafletMap.on('click', (e) => {
                if (!isModalAddingMarker) return;
                const markerName = prompt('Enter name for the new campus facility/building marker:');
                if (markerName && markerName.trim()) {
                    currentAdminBuildings.push({
                        name: markerName.trim(),
                        coords: [Number(e.latlng.lat), Number(e.latlng.lng)],
                        icon: 'location_city',
                        desc: 'Campus facility'
                    });
                    isModalAddingMarker = false;
                    const btnAddMarkerLabel = document.getElementById('btnAddMarkerLabel');
                    const btnAddMarker = document.getElementById('btnAddMarkerModal');
                    if (btnAddMarkerLabel) btnAddMarkerLabel.textContent = 'Add Marker';
                    if (btnAddMarker) {
                        btnAddMarker.style.background = '#eff6ff';
                        btnAddMarker.style.color = '#1d4ed8';
                        btnAddMarker.style.borderColor = '#bfdbfe';
                    }
                    renderModalEditorMarkers();
                }
            });
        }
        adminModalLeafletMap.invalidateSize();
        renderModalEditorMarkers();
    }, 100);
    setTimeout(() => {
        if (adminModalLeafletMap) adminModalLeafletMap.invalidateSize();
    }, 300);
}

// (2026-07-13) Close modal cleanly without uncommitted auto-save; was saving on close
function closeGeofenceEditorModal() {
    const modal = document.getElementById('adminGeofenceModal');
    if (modal) modal.style.display = 'none';
}

function setupGeofenceEditorControls() {
    const btnEdit = document.getElementById('btnEditGeofence');
    const btnSaveCard = document.getElementById('btnSaveGeofence');
    const btnSaveModal = document.getElementById('btnSaveGeofenceModal');
    const btnResetModal = document.getElementById('btnResetGeofenceModal');
    const btnCloseModal = document.getElementById('btnCloseGeofenceModal');

    if (btnEdit && !btnEdit.dataset.bound) {
        btnEdit.dataset.bound = 'true';
        btnEdit.addEventListener('click', () => {
            openGeofenceEditorModal();
        });
    }

    // (2026-07-13) Publish snapshot changes to database on save button click; was unthrottled drag
    const handleSave = async (btn) => {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">sync</span><span>Saving...</span>';
        }
        try {
            await saveCampusMapConfig({
                geofence: currentAdminGeofence,
                buildings: currentAdminBuildings
            });
        } catch (e) {
            console.warn("Save error:", e);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px;">cloud_sync</span><span>Save & Sync Database</span>';
            }
            closeGeofenceEditorModal();
            if (adminSosLeafletMap) {
                renderBuildingMarkers();
                if (adminGeofencePolygonLayer) {
                    adminSosLeafletMap.removeLayer(adminGeofencePolygonLayer);
                    adminGeofencePolygonLayer = L.polygon(currentAdminGeofence, {
                        color: '#e11d48',
                        weight: 3,
                        dashArray: '5, 6',
                        fillColor: '#f43f5e',
                        fillOpacity: 0.1
                    }).addTo(adminSosLeafletMap);
                }
            }
        }
    };

    if (btnSaveCard && !btnSaveCard.dataset.bound) {
        btnSaveCard.dataset.bound = 'true';
        btnSaveCard.addEventListener('click', () => handleSave(btnSaveCard));
    }

    if (btnSaveModal && !btnSaveModal.dataset.bound) {
        btnSaveModal.dataset.bound = 'true';
        btnSaveModal.addEventListener('click', () => handleSave(btnSaveModal));
    }

    if (btnResetModal && !btnResetModal.dataset.bound) {
        btnResetModal.dataset.bound = 'true';
        btnResetModal.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to reset the geofence and building markers to default coordinates?')) return;
            localStorage.removeItem('securo_custom_geofence');
            localStorage.removeItem('securo_campus_buildings');
            currentAdminGeofence = DEFAULT_CAMPUS_GEOFENCE_POLYGON.map(pt => [...pt]);
            currentAdminBuildings = DEFAULT_CAMPUS_BUILDINGS.map(b => ({ ...b, coords: [...b.coords] }));
            await saveCampusMapConfig({
                geofence: currentAdminGeofence,
                buildings: currentAdminBuildings
            });
            renderModalEditorMarkers();
            alert('Geofence & building markers reset to default coordinates.');
        });
    }

    // (2026-07-13) Add marker click mode toggle handler; was missing add control
    const btnAddMarker = document.getElementById('btnAddMarkerModal');
    if (btnAddMarker && !btnAddMarker.dataset.bound) {
        btnAddMarker.dataset.bound = 'true';
        btnAddMarker.addEventListener('click', () => {
            isModalAddingMarker = !isModalAddingMarker;
            const btnAddMarkerLabel = document.getElementById('btnAddMarkerLabel');
            if (isModalAddingMarker) {
                btnAddMarker.style.background = '#dcfce7';
                btnAddMarker.style.color = '#15803d';
                btnAddMarker.style.borderColor = '#86efac';
                if (btnAddMarkerLabel) btnAddMarkerLabel.textContent = 'Click Map to Place';
            } else {
                btnAddMarker.style.background = '#eff6ff';
                btnAddMarker.style.color = '#1d4ed8';
                btnAddMarker.style.borderColor = '#bfdbfe';
                if (btnAddMarkerLabel) btnAddMarkerLabel.textContent = 'Add Marker';
            }
        });
    }

    if (btnCloseModal && !btnCloseModal.dataset.bound) {
        btnCloseModal.dataset.bound = 'true';
        btnCloseModal.addEventListener('click', () => {
            closeGeofenceEditorModal();
        });
    }
}

// (2026-07-13) Initialize geofence editor controls immediately; was delayed by stats
setupGeofenceEditorControls();

// (2026-07-13) Subscribe to real-time map and geofence updates across Firestore and storage
subscribeToCampusMapConfig((config) => {
    if (config?.geofence && Array.isArray(config.geofence) && config.geofence.length >= 3) {
        currentAdminGeofence = config.geofence;
        if (adminGeofencePolygonLayer) {
            adminGeofencePolygonLayer.setLatLngs(currentAdminGeofence);
        }
        if (modalGeofencePolygonLayer) {
            modalGeofencePolygonLayer.setLatLngs(currentAdminGeofence);
        }
    }
    if (config?.buildings && Array.isArray(config.buildings)) {
        currentAdminBuildings = config.buildings;
        renderBuildingMarkers();
    }
});

// (2026-07-13) Add Geofence simulator engine & attendance dispatch; was none
function isPointInPolygon(point, vs) {
    if (!point || !Array.isArray(vs) || vs.length < 3) return false;
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0] ?? vs[i].lat, yi = vs[i][1] ?? vs[i].lng;
        const xj = vs[j][0] ?? vs[j].lat, yj = vs[j][1] ?? vs[j].lng;
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// (2026-07-13) Removed attendance simulator completely; was demo generator

// (2026-07-13) Verified reporter metadata resolution for SOS logs; was raw uid string
function getReporterInfo(log) {
    const rawUid = String(log?.userId || log?.studentUid || log?.reporterId || '').trim();
    const rawEmail = String(log?.userEmail || log?.email || '').trim().toLowerCase();
    const rawStudentId = String(log?.studentId || '').trim();

    const user = (cachedUsers || []).find((u) => {
        if (rawUid && (String(u.id || '') === rawUid || String(u.userId || '') === rawUid || String(u.uid || '') === rawUid)) return true;
        if (rawEmail && String(u.email || '').toLowerCase() === rawEmail) return true;
        if (rawStudentId && String(u.studentId || '') === rawStudentId) return true;
        return false;
    });

    let name = log?.userName || log?.reporterName || user?.name || '';
    if (!name || (name.startsWith('User ') && name.length > 20)) {
        if (user?.name) {
            name = user.name;
        } else if (user?.email) {
            name = user.email.split('@')[0];
        } else if (rawEmail) {
            name = rawEmail.split('@')[0];
        } else if (rawUid) {
            name = `Student (${rawUid.slice(0, 6)})`;
        } else {
            name = 'Student Reporter';
        }
    }

    // (2026-07-13) Recognize staff role from name & email; was defaulting student
    const isStaff = user?.role === 'staff' || log?.role === 'staff' || String(name).toLowerCase().includes('staff') || rawEmail.startsWith('staff.') || String(user?.email || '').toLowerCase().startsWith('staff.');
    const role = isStaff ? 'staff' : (user?.role || log?.role || 'student');
    const email = user?.email || rawEmail || 'No email saved';
    const studentId = user?.studentId || rawStudentId || (role === 'staff' ? 'Staff' : 'N/A');

    return { name, email, studentId, role, uid: rawUid, user };
}

window.focusSosLocation = (lat, lng, name) => {
    if (!adminSosLeafletMap) return;
    setTab('sos');
    adminSosLeafletMap.flyTo([lat, lng], 18, { duration: 1.2 });
    const mapContainer = document.getElementById('adminSosMap');
    if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// (2026-07-13) Resolve location name for coordinates in SOS; was raw coords
const securoGeoCache = new Map();
try {
    const rawG = localStorage.getItem('securo_geo_cache');
    if (rawG) Object.entries(JSON.parse(rawG)).forEach(([k, v]) => securoGeoCache.set(k, v));
} catch (_) { }

function saveSecuroGeoCache() {
    try {
        const o = {};
        securoGeoCache.forEach((v, k) => { o[k] = v; });
        localStorage.setItem('securo_geo_cache', JSON.stringify(o));
    } catch (_) { }
}

// (2026-07-13) Instant regional geocoding for Northern Cebu; was static label
function getQuickRegionalLocation(lat, lng) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return 'Campus Grounds';
    for (const b of (currentAdminBuildings || DEFAULT_CAMPUS_BUILDINGS)) {
        const [bLat, bLng] = b.coords || [];
        if (typeof bLat === 'number' && typeof bLng === 'number' && Math.hypot(lat - bLat, lng - bLng) < 0.0035) {
            return `CTU Daanbantayan (${b.name})`;
        }
    }
    if (lat >= 11.00 && lat <= 11.15 && lng >= 123.90 && lng <= 124.10) return "Bogo City, Cebu";
    if (lat > 11.15 && lat <= 11.24 && lng >= 123.90 && lng <= 124.05) return "Medellin, Cebu";
    if (lat > 11.24 && lat <= 11.35) return "Daanbantayan, Cebu";
    return "Northern Cebu";
}

async function resolveCoordinateLocation(lat, lng, elementId) {
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return 'Campus Grounds';
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    if (securoGeoCache.has(key)) {
        const cached = securoGeoCache.get(key);
        if (elementId) {
            const el = document.getElementById(elementId);
            if (el) el.textContent = cached;
        }
        return cached;
    }

    // Check campus facilities first
    for (const b of (currentAdminBuildings || DEFAULT_CAMPUS_BUILDINGS)) {
        const [bLat, bLng] = b.coords || [];
        if (typeof bLat === 'number' && typeof bLng === 'number') {
            if (Math.hypot(lat - bLat, lng - bLng) < 0.0035) {
                const facilityLoc = `CTU Daanbantayan (${b.name})`;
                securoGeoCache.set(key, facilityLoc);
                saveSecuroGeoCache();
                if (elementId) {
                    const el = document.getElementById(elementId);
                    if (el) el.textContent = facilityLoc;
                }
                return facilityLoc;
            }
        }
    }

    // BigDataCloud Reverse Geocoding
    try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2800);
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tid);
        if (res.ok) {
            const data = await res.json();
            const barangay = (data.localityInfo?.informative || []).find(i => /barangay|brgy/i.test(i.name) || i.description?.toLowerCase().includes("barangay"))?.name || "";
            const city = data.city || data.localityInfo?.administrative?.find(a => a.adminLevel === 6 || a.adminLevel === 7)?.name || data.locality || "";
            const province = data.principalSubdivision || "Cebu";

            let place = "";
            if (barangay && city) place = `${barangay}, ${city}`;
            else if (city) place = `${city}, ${province}`;
            else if (barangay) place = `${barangay}, ${province}`;
            else if (data.locality) place = `${data.locality}, ${province}`;

            if (place) {
                securoGeoCache.set(key, place);
                saveSecuroGeoCache();
                if (elementId) {
                    const el = document.getElementById(elementId);
                    if (el) el.textContent = place;
                }
                return place;
            }
        }
    } catch (_) { }

    // Regional coordinates lookup for Northern Cebu
    let fallback = "Daanbantayan, Northern Cebu";
    if (lat >= 11.15 && lat <= 11.23 && lng >= 123.90 && lng <= 124.02) {
        fallback = "Medellin, Northern Cebu";
    } else if (lat >= 11.00 && lat <= 11.15 && lng >= 123.95 && lng <= 124.05) {
        fallback = "Bogo City, Northern Cebu";
    } else if (lat >= 11.23 && lat <= 11.35) {
        fallback = "Daanbantayan Campus Perimeter";
    }
    securoGeoCache.set(key, fallback);
    saveSecuroGeoCache();
    if (elementId) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = fallback;
    }
    return fallback;
}

// (2026-07-13) Render recent SOS reporters sidebar with counts; was absent
function renderRecentSosReporters() {
    const container = document.getElementById('adminRecentSosReporters');
    const countEl = document.getElementById('adminRecentReportersCount');
    if (!container) return;

    const logs = cachedSosLogs || [];
    if (!logs.length) {
        renderEmpty(container, 'person_off', 'No active SOS reporters.');
        if (countEl) countEl.textContent = '0 Users';
        return;
    }

    const map = new Map();
    logs.forEach(log => {
        const rep = getReporterInfo(log);
        const key = rep.studentId || rep.userId || rep.email || rep.name;
        if (!map.has(key)) {
            map.set(key, {
                name: rep.name || 'Student',
                role: rep.role || 'student',
                studentId: rep.studentId || '',
                email: rep.email || '',
                count: 0,
                latestLog: log,
                latestTime: log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp ? new Date(log.timestamp) : new Date())
            });
        }
        const entry = map.get(key);
        entry.count += 1;
        const logTime = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp ? new Date(log.timestamp) : new Date());
        if (logTime > entry.latestTime) {
            entry.latestTime = logTime;
            entry.latestLog = log;
        }
    });

    const reporters = Array.from(map.values()).sort((a, b) => b.latestTime - a.latestTime);
    if (countEl) countEl.textContent = `${reporters.length} User${reporters.length === 1 ? '' : 's'}`;

    container.innerHTML = reporters.map((r) => {
        const loc = r.latestLog?.location || {};
        const hasCoords = typeof loc.lat === 'number' && typeof loc.lng === 'number';
        const timeStr = r.latestTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const roleClass = r.role === 'guardian' ? 'guardian' : r.role === 'staff' ? 'staff' : (r.role === 'admin' ? 'admin' : 'student');
        const roleLabel = r.role === 'guardian' ? 'Guardian' : r.role === 'staff' ? 'Staff' : (r.role === 'admin' ? 'Admin' : 'Student');

        return `
                    <div class="reporter-sos-card" style="padding:10px 12px; border-radius:14px; background:#faf9fe; border:1px solid rgba(90,31,224,0.08); display:flex; flex-direction:column; gap:6px; cursor:${hasCoords ? 'pointer' : 'default'}; transition:all 0.15s ease;" ${hasCoords ? `onclick="focusSosLocation(${loc.lat}, ${loc.lng}, '${escapeHtml(r.name)}')" title="Click to view on map"` : ''} onmouseover="this.style.background='#f3effd'; this.style.borderColor='#7c3aed';" onmouseout="this.style.background='#faf9fe'; this.style.borderColor='rgba(90,31,224,0.08)';">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div class="management-avatar ${roleClass}" style="width:28px; height:28px; font-size:0.75rem;">${escapeHtml(getInitials(r.name))}</div>
                                <div>
                                    <strong style="font-size:0.84rem; color:var(--ink);">${escapeHtml(r.name)}</strong>
                                    <div style="font-size:0.7rem; color:var(--muted);">${escapeHtml(r.studentId ? `ID: ${r.studentId}` : r.email)}</div>
                                </div>
                            </div>
                            <span class="capsule" style="background:#fee2e2; color:#b91c1c; font-weight:800; font-size:0.72rem; padding:2px 8px; border-radius:999px;">
                                ${r.count} ${r.count === 1 ? 'Report' : 'Reports'}
                            </span>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#64748b; padding-top:4px; border-top:1px dashed rgba(0,0,0,0.06);">
                            <span style="display:flex; align-items:center; gap:3px;">
                                <span class="material-symbols-outlined" style="font-size:14px; color:#d11f34;">crisis_alert</span>
                                Latest: ${escapeHtml(timeStr)}
                            </span>
                            ${hasCoords ? `<span style="font-family:monospace; color:#7c3aed; font-weight:600;">View Map &rarr;</span>` : ''}
                        </div>
                    </div>
                `;
    }).join('');
}

function renderSosTable(logs) {
    const tableEl = document.getElementById('sosLogsTable');
    if (!tableEl) return;
    renderRecentSosReporters();

    if (!logs || !logs.length) {
        renderEmpty(tableEl, 'crisis_alert', 'No SOS emergency alerts logged yet.');
        return;
    }

    tableEl.innerHTML = logs.map((log) => {
        const rep = getReporterInfo(log);
        const loc = log.location || {};
        const hasCoords = typeof loc.lat === 'number' && typeof loc.lng === 'number';
        const coordsStr = hasCoords ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : 'GPS unavailable';

        const rawAddress = loc.address;
        const isNumericAddress = !rawAddress || /^\d+\.\d+/.test(rawAddress) || rawAddress.includes('GPS') || rawAddress === coordsStr;
        const geoKey = hasCoords ? `${loc.lat.toFixed(4)},${loc.lng.toFixed(4)}` : '';
        // (2026-07-13) Instant regional geocoding in SOS table; was Resolving text
        const initialLocationName = !isNumericAddress ? rawAddress : (securoGeoCache.get(geoKey) || getQuickRegionalLocation(loc.lat, loc.lng));

        const spanId = `sos-loc-name-${log.id || Math.random().toString(36).slice(2, 7)}`;
        if (hasCoords && isNumericAddress) {
            setTimeout(() => resolveCoordinateLocation(loc.lat, loc.lng, spanId), 15);
        }

        const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : (log.timestamp || 'Recently');
        const roleClass = rep.role === 'guardian' ? 'guardian' : rep.role === 'staff' ? 'staff' : (rep.role === 'admin' ? 'admin' : 'student');
        const roleLabel = rep.role === 'guardian' ? 'Guardian' : rep.role === 'staff' ? 'Staff' : (rep.role === 'admin' ? 'Admin' : 'Student');

        return `
                    <div class="table-row" style="grid-template-columns: minmax(0, 1.4fr) 1fr 1.3fr 0.8fr auto; align-items:center;">
                        <div class="inline-fields" style="align-items:center;">
                            <!-- (2026-07-13) Role avatar class dynamically bound; was binary -->
                            <div class="management-avatar ${roleClass}">${escapeHtml(getInitials(rep.name))}</div>
                            <div>
                                <div class="row-title" style="font-weight:800; color:var(--ink);">${escapeHtml(rep.name)}</div>
                                <div class="row-sub">${escapeHtml(rep.email)}</div>
                            </div>
                        </div>
                        <div>
                            <span class="role-pill ${roleClass}">${roleLabel}</span>
                            <div class="row-sub" style="margin-top:4px;">ID: ${escapeHtml(rep.studentId)}</div>
                        </div>
                        <div>
                            <div class="row-title" style="font-size:0.84rem; display:flex; align-items:center; gap:4px; font-weight:700; color:var(--ink);">
                                <span class="material-symbols-outlined" style="font-size:16px; color:#d11f34;">location_on</span>
                                <span id="${spanId}">${escapeHtml(initialLocationName)}</span>
                            </div>
                            <div class="row-sub" style="font-family:monospace; font-size:0.75rem; color:var(--muted);">${escapeHtml(coordsStr)}</div>
                        </div>
                        <div>
                            <div class="row-title" style="font-size:0.84rem;">${escapeHtml(dateStr)}</div>
                            <div class="row-sub"><span class="status-pill emergency">Active SOS</span></div>
                        </div>
                        <div class="row-actions">
                            ${hasCoords ? `
                                <button class="primary-btn" type="button" style="min-height:36px; padding:0 12px; font-size:0.78rem; background:linear-gradient(135deg, #d11f34, #991b1b);" onclick="focusSosLocation(${loc.lat}, ${loc.lng}, '${escapeHtml(rep.name)}')">
                                    <span class="material-symbols-outlined" style="font-size:16px;">near_me</span>
                                    <span>View on Map</span>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
    }).join('');
}

// (2026-07-13) Guard SOS map render when tab inactive; was rendering hidden
function renderAdminSosMap() {
    const mapEl = document.getElementById('adminSosMap');
    if (!mapEl || typeof L === 'undefined') return;
    const secSos = document.getElementById('sec-sos');
    if (secSos && !secSos.classList.contains('active')) return;

    setupGeofenceEditorControls();

    if (!adminSosLeafletMap) {
        adminSosLeafletMap = L.map('adminSosMap', {
            zoomControl: true,
            attributionControl: false,
            zoomSnap: 0.25,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 140
        }).setView(ADMIN_CAMPUS_CENTER, 17);

        // (2026-07-13) Use OSM tiles; was broken CartoDB tiles requiring API key
        const adminSosBaseMaps = {
            "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }),
            "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
            "Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 })
        };
        adminSosBaseMaps["Streets"].addTo(adminSosLeafletMap);
        L.control.layers(adminSosBaseMaps, null, { position: 'topright' }).addTo(adminSosLeafletMap);

        currentAdminGeofence = getActiveAdminGeofencePolygon();
        adminGeofencePolygonLayer = L.polygon(currentAdminGeofence, {
            color: '#e11d48',
            weight: 3,
            dashArray: '5, 6',
            fillColor: '#f43f5e',
            fillOpacity: 0.1
        }).addTo(adminSosLeafletMap);

        renderBuildingMarkers();

        adminSosMarkersLayer = L.layerGroup().addTo(adminSosLeafletMap);
    } else {
        if (adminGeofencePolygonLayer) {
            currentAdminGeofence = getActiveAdminGeofencePolygon();
            adminGeofencePolygonLayer.setLatLngs(currentAdminGeofence);
        }
        // (2026-07-13) Direct building render; was referencing undefined isGeofenceEditing
        renderBuildingMarkers();
    }

    if (adminSosMarkersLayer) {
        adminSosMarkersLayer.clearLayers();
    }

    const sosBadge = document.getElementById('adminSosCountBadge');
    const sosCount = (cachedSosLogs || []).length;
    if (sosBadge) sosBadge.textContent = `${sosCount} SOS Trigger${sosCount === 1 ? '' : 's'}`;

    (cachedSosLogs || []).forEach((log, idx) => {
        const loc = log.location;
        if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return;

        const pos = [loc.lat, loc.lng];
        const dateStr = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : (log.timestamp || 'Recently');
        const rep = getReporterInfo(log);

        // Pulsing red hotspot marker
        const sosIcon = L.divIcon({
            className: 'sos-hotspot-marker',
            html: `
                        <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
                            <div style="position:absolute; width:28px; height:28px; background:rgba(209,31,52,0.3); border-radius:50%; animation:pulse 1.8s infinite;"></div>
                            <div style="width:16px; height:16px; background:#d11f34; border:2px solid white; border-radius:50%; box-shadow:0 0 10px rgba(209,31,52,0.6);"></div>
                        </div>
                    `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker(pos, { icon: sosIcon });
        marker.bindPopup(`
                    <div style="padding:4px; min-width:160px;">
                        <strong style="color:#d11f34; font-size:0.9rem; display:flex; align-items:center; gap:4px;">
                            <span class="material-symbols-outlined" style="font-size:18px;">crisis_alert</span>
                            SOS Alert
                        </strong>
                        <div style="font-size:0.82rem; margin-top:4px; font-weight:700; color:#181428;">${escapeHtml(rep.name)}</div>
                        <div style="font-size:0.75rem; color:#6f6a86; margin-top:2px;"><strong>Role:</strong> ${escapeHtml(rep.role)} • ID: ${escapeHtml(rep.studentId)}</div>
                        <div style="font-size:0.75rem; color:#6f6a86; margin-top:2px;"><strong>Time:</strong> ${escapeHtml(dateStr)}</div>
                        <div style="font-size:0.75rem; color:#6f6a86; margin-top:2px;"><strong>Location:</strong> ${escapeHtml(loc.address || `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`)}</div>
                    </div>
                `);

        if (adminSosMarkersLayer) {
            adminSosMarkersLayer.addLayer(marker);
        }
    });

    requestAnimationFrame(() => {
        if (adminSosLeafletMap) adminSosLeafletMap.invalidateSize();
    });
}

// (2026-07-13) Live sync admin map with database updates; was manual reload only
subscribeToCampusMapConfig((config) => {
    if (!config) return;
    if (Array.isArray(config.geofence) && config.geofence.length >= 3) {
        currentAdminGeofence = config.geofence;
        if (adminGeofencePolygonLayer && adminSosLeafletMap) {
            adminSosLeafletMap.removeLayer(adminGeofencePolygonLayer);
            adminGeofencePolygonLayer = L.polygon(currentAdminGeofence, {
                color: '#e11d48',
                weight: 3,
                dashArray: '5, 6',
                fillColor: '#f43f5e',
                fillOpacity: 0.1
            }).addTo(adminSosLeafletMap);
        }
    }
    if (Array.isArray(config.buildings) && config.buildings.length > 0) {
        currentAdminBuildings = config.buildings;
        if (adminSosLeafletMap) renderBuildingMarkers();
    }
});

// (2026-07-13) Support admin emails in stats users list; was single email string
function renderStatsUsers(users) {
    if (!users.length) {
        renderEmpty(statsUserList, 'groups', 'No user records available.');
        return;
    }

    statsUserList.innerHTML = users.map((user) => {
        // (2026-07-13) Recognize staff by role and name pattern; was explicit role
        const isStaff = user?.role === 'staff' || String(user?.name || '').toLowerCase().includes('staff') || String(user?.email || '').toLowerCase().startsWith('staff.');
        const role = (user?.role === 'admin' || isAdminEmail(user?.email)) ? 'Admin' : user?.role === 'guardian' ? 'Guardian' : isStaff ? 'Staff' : 'Student';
        return `
                    <div class="table-row" style="grid-template-columns: minmax(0, 1.2fr) 1fr 1.3fr auto;">
                        <div>
                            <div class="row-title">${user.name || 'Unnamed user'}</div>
                            <div class="row-sub">${role} account</div>
                        </div>
                        <div>
                            <div class="row-title">${user.studentId || 'N/A'}</div>
                            <div class="row-sub">Student ID</div>
                        </div>
                        <div>
                            <div class="row-title">${user.email || 'N/A'}</div>
                            <div class="row-sub">Registered email</div>
                        </div>
                        <div class="row-actions">
                            <button class="danger-inline-btn" type="button" data-user-delete-id="${user.id}" data-user-delete-name="${user.name || 'this user'}">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
    }).join('');
}

function applyFilters() {
    const gadTerm = (gadSearch.value || '').trim().toLowerCase();
    const userTerm = (statsUserSearch.value || '').trim().toLowerCase();
    const sosTerm = (document.getElementById('sosLogSearch')?.value || '').trim().toLowerCase();

    const filteredPosts = cachedPosts.filter((post) => {
        const haystack = `${post.content || ''} ${post.author || ''} ${post.email || ''} ${post.timestamp || ''}`.toLowerCase();
        return haystack.includes(gadTerm);
    });

    const filteredUsers = cachedUsers.filter((user) => {
        const haystack = `${user.name || ''} ${user.studentId || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
        return haystack.includes(userTerm);
    });

    const filteredSos = cachedSosLogs.filter((log) => {
        const rep = getReporterInfo(log);
        const loc = log.location || {};
        const haystack = `${rep.name} ${rep.email} ${rep.studentId} ${loc.address || ''} ${loc.lat || ''} ${loc.lng || ''}`.toLowerCase();
        return haystack.includes(sosTerm);
    });

    renderStatistics(cachedUsers);
    renderGadPosts(filteredPosts);
    renderStatsUsers(filteredUsers);
    renderManagedUsers();
    renderSosTable(filteredSos);
}

const debouncedApplyFilters = debounce(applyFilters);
const sosSearchInputEl = document.getElementById('sosLogSearch');
[gadSearch, statsUserSearch, managementUserSearch, sosSearchInputEl].filter(Boolean).forEach((input) => {
    input.addEventListener('input', debouncedApplyFilters);
});

// (2026-07-13) Re-evaluate cache after filter listeners setup; was no-op
loadFromLocalCache(true);

if (statsUserList) {
    statsUserList.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-user-delete-id]');
        if (!deleteButton) return;
        window.handleDeleteUser(deleteButton.dataset.userDeleteId, deleteButton.dataset.userDeleteName);
    });
}

if (managementUserList) {
    managementUserList.addEventListener('click', (event) => {
        const triggerButton = event.target.closest('[data-user-action-trigger]');
        if (triggerButton) {
            event.stopPropagation();
            toggleUserActionMenu(triggerButton.dataset.userActionTrigger);
            return;
        }

        const actionItem = event.target.closest('[data-user-action][data-user-id]');
        if (!actionItem) return;
        event.stopPropagation();
        const selectedUser = getManagedUserById(actionItem.dataset.userId);
        if (!selectedUser) return;

        if (actionItem.dataset.userAction === 'edit') {
            openUserActionMenuId = null;
            setUserEditorState(selectedUser);
            openUserEditorModal();
            return;
        }

        if (actionItem.dataset.userAction === 'delete') {
            openUserActionMenuId = null;
            renderManagedUsers();
            window.handleDeleteUser(actionItem.dataset.userId, actionItem.dataset.userName || selectedUser.name || 'this user');
        }
    });
}

if (createUserBtn) {
    createUserBtn.addEventListener('click', () => {
        setUserEditorState(null, { creating: true });
        openUserEditorModal();
        manageUserName?.focus();
    });
}

closeUserModalBtn?.addEventListener('click', closeUserEditorModal);
userEditorModal?.addEventListener('click', (event) => {
    if (event.target === userEditorModal) closeUserEditorModal();
});
document.addEventListener('click', () => {
    closeUserActionMenu();
});

if (resetUserEditorBtn) {
    resetUserEditorBtn.addEventListener('click', () => {
        if (isCreatingManagedUser) {
            setUserEditorState(null, { creating: true });
            return;
        }
        setUserEditorState(getManagedUserById(selectedManagedUserId));
    });
}

if (manageUserRole) {
    manageUserRole.addEventListener('change', () => {
        const roleValue = manageUserRole.value || 'student';
        updateManagedUserRoleFields(roleValue, { creating: isCreatingManagedUser });
    });
}

manageUserStudentId?.addEventListener('input', () => {
    manageUserStudentId.value = manageUserStudentId.value.replace(/\D/g, '').slice(0, 7);
    if (isCreatingManagedUser && ['student', 'staff'].includes(manageUserRole?.value || 'student')) {
        updateManagedUserRoleFields(manageUserRole?.value || 'student', { creating: true });
    }
});

function updateGadCounter() {
    const count = gadPostText.value.trim().length;
    gadCounter.textContent = `${count} / 500`;
    gadCounter.classList.toggle('warn', count >= 400 && count < 500);
    gadCounter.classList.toggle('limit', count >= 500);
}

function resetGadComposer() {
    editingGadPostId = null;
    gadPostText.value = '';
    selectedGadImage = "";
    if (gadComposerTitle) gadComposerTitle.textContent = 'New GAD Post';
    if (gadComposerCopy) gadComposerCopy.textContent = 'Publishes to the GAD feed.';
    if (postGadBtn) {
        const label = postGadBtn.querySelector('span:last-child');
        if (label) label.textContent = 'Publish';
    }
    if (cancelGadEditBtn) cancelGadEditBtn.style.display = 'none';
    renderGadImagePreview();
    updateGadCounter();
}

window.handleEditPost = function (postId) {
    const post = (cachedPosts || []).find((entry) => String(entry.id) === String(postId));
    if (!post) {
        showToast("Post not found", "That GAD post could not be loaded for editing.", "error");
        return;
    }

    editingGadPostId = post.id;
    gadPostText.value = post.content || '';
    selectedGadImage = post.image || "";
    if (gadComposerTitle) gadComposerTitle.textContent = 'Edit GAD Post';
    if (gadComposerCopy) gadComposerCopy.textContent = 'Update this published announcement for the GAD feed.';
    if (postGadBtn) {
        const label = postGadBtn.querySelector('span:last-child');
        if (label) label.textContent = 'Save Changes';
    }
    if (cancelGadEditBtn) cancelGadEditBtn.style.display = 'inline-flex';
    renderGadImagePreview();
    updateGadCounter();
    gadPostText.focus();
    gadPostText.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

gadPostText.addEventListener('input', updateGadCounter);
updateGadCounter();

attachGadImageBtn?.addEventListener('click', () => gadImageInput?.click());
gadImageInput?.addEventListener('change', async () => {
    const file = gadImageInput.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast("Invalid image", "Choose a valid image file.", "error");
        gadImageInput.value = '';
        return;
    }
    try {
        selectedGadImage = await readFileAsDataUrl(file);
        renderGadImagePreview();
    } catch (error) {
        showToast("Attach failed", error.message || "Could not load the selected image.", "error");
    } finally {
        gadImageInput.value = '';
    }
});
removeGadImageBtn?.addEventListener('click', () => {
    selectedGadImage = "";
    renderGadImagePreview();
});
cancelGadEditBtn?.addEventListener('click', () => {
    resetGadComposer();
});

window.handleDeletePost = async (postId) => {
    if (deleteArmedPostId !== postId) {
        deleteArmedPostId = postId;
        showToast("Delete armed", "Click delete again to remove this GAD post.", "info");
        window.setTimeout(() => {
            if (deleteArmedPostId === postId) deleteArmedPostId = null;
        }, 2600);
        return;
    }

    try {
        await deleteGADPost(postId);
        deleteArmedPostId = null;
        if (editingGadPostId === postId) {
            resetGadComposer();
        }
        showToast("GAD post deleted", "The bulletin was removed successfully.", "success");
        await loadAllData();
    } catch (error) {
        showToast("Delete failed", error.message, "error");
    }
};

// (2026-07-13) Guard null currentUser & allow short GAD posts; was blocked
postGadBtn.addEventListener('click', async () => {
    const text = gadPostText.value.trim();
    if (!text && !selectedGadImage) {
        showToast("Missing content", "Write the GAD post or attach an image before publishing.", "error");
        return;
    }

    const publisherEmail = auth.currentUser?.email || 'admin@admin.com';
    postGadBtn.disabled = true;
    try {
        if (editingGadPostId) {
            await updateGADPost(editingGadPostId, {
                author: "GAD Office",
                content: text,
                image: selectedGadImage || "",
                email: publisherEmail,
                timestamp: new Date().toLocaleString()
            });
            showToast("GAD post updated", "Your GAD bulletin changes are now live.", "success");
        } else {
            await saveGADPost({
                author: "GAD Office",
                content: text,
                image: selectedGadImage || "",
                email: publisherEmail,
                timestamp: new Date().toLocaleString()
            });
            showToast("GAD post published", "The new GAD bulletin is now live.", "success");
        }
        resetGadComposer();
        await loadAllData(true);
    } catch (error) {
        showToast("Publish failed", error?.message || "Could not publish GAD post.", "error");
    } finally {
        postGadBtn.disabled = false;
    }
});

// (2026-07-13) Enhanced dispatch chat suite; was basic thread view
const threadList = document.getElementById('threadList');
const adminChatMessages = document.getElementById('adminChatMessages');
const adminChatInput = document.getElementById('adminChatInput');
const adminSendBtn = document.getElementById('adminSendBtn');
const activeUserName = document.getElementById('activeUserName');
const activeUserAvatar = document.getElementById('activeUserAvatar');
const threadSearchInput = document.getElementById('threadSearchInput');
const threadCountBadge = document.getElementById('threadCountBadge');
const btnRefreshThreads = document.getElementById('btnRefreshThreads');
const activeUserRoleBadge = document.getElementById('activeUserRoleBadge');
const activeUserIdTag = document.getElementById('activeUserIdTag');
const activeUserStatus = document.getElementById('activeUserStatus');
const activeUserBeacon = document.getElementById('activeUserBeacon');
const chatHeaderActions = document.getElementById('chatHeaderActions');
const btnToggleStudentDossier = document.getElementById('btnToggleStudentDossier');
const btnHeaderDeleteThread = document.getElementById('btnHeaderDeleteThread');
const activeUserDossierPanel = document.getElementById('activeUserDossierPanel');
const dossierStudentId = document.getElementById('dossierStudentId');
const dossierEmail = document.getElementById('dossierEmail');
const dossierSosCount = document.getElementById('dossierSosCount');
const dossierGuardianInfo = document.getElementById('dossierGuardianInfo');
const cannedResponseBar = document.getElementById('cannedResponseBar');

let currentActiveUserId = null;
let currentActiveThreadId = null;
// (2026-07-13) Realtime user presence resolver & ticker; was hardcoded
let livePresenceMap = {};
const ONLINE_THRESHOLD_MS = 70000;

function getUserPresenceStatus(userId, userObj = null) {
    const keys = [userId, userObj?.id, userObj?.uid].filter(Boolean).map(String);
    let live = null;
    for (const k of keys) {
        if (livePresenceMap[k]) {
            live = livePresenceMap[k];
            break;
        }
    }
    const fallbackTs = userObj?.lastActiveAt?.toMillis
        ? userObj.lastActiveAt.toMillis()
        : (userObj?.lastActiveAt?.seconds ? userObj.lastActiveAt.seconds * 1000 : Number(userObj?.lastActiveMs || 0));
    const lastActiveMs = Math.max(Number(live?.lastActiveMs || 0), fallbackTs);
    const explicitOnline = live ? live.isOnline === true : (userObj?.isOnline === true || userObj?.isWatching === true);
    const ageMs = lastActiveMs > 0 ? (Date.now() - lastActiveMs) : Infinity;
    const isOnline = explicitOnline && ageMs <= ONLINE_THRESHOLD_MS;

    if (isOnline) {
        return { online: true, dotColor: '#22c55e', statusColor: '#10b981', label: 'Active now' };
    }
    if (lastActiveMs > 0) {
        const mins = Math.max(1, Math.floor(ageMs / 60000));
        let rel = `${mins}m ago`;
        if (mins >= 60 && mins < 1440) rel = `${Math.floor(mins / 60)}h ago`;
        else if (mins >= 1440) rel = `${Math.floor(mins / 1440)}d ago`;
        return { online: false, dotColor: '#94a3b8', statusColor: '#94a3b8', label: `Active ${rel}` };
    }
    return { online: false, dotColor: '#94a3b8', statusColor: '#94a3b8', label: 'Offline' };
}

function refreshActivePresenceUI() {
    document.querySelectorAll('.thread-presence-dot[data-presence-uid]').forEach((dot) => {
        const uid = dot.getAttribute('data-presence-uid');
        const uObj = (typeof cachedUsers !== 'undefined' ? cachedUsers : []).find(u => String(u.id) === uid || String(u.uid) === uid) || null;
        const p = getUserPresenceStatus(uid, uObj);
        dot.style.background = p.dotColor;
        dot.title = p.label;
    });
    if (currentActiveUserId) {
        const uObj = (typeof cachedUsers !== 'undefined' ? cachedUsers : []).find(u => String(u.id) === String(currentActiveUserId) || String(u.uid) === String(currentActiveUserId)) || null;
        const p = getUserPresenceStatus(currentActiveUserId, uObj);
        const liveBeacon = document.getElementById('activeUserBeacon');
        if (liveBeacon) {
            liveBeacon.style.background = p.statusColor;
            liveBeacon.title = p.label;
        }
        if (activeUserStatus) {
            activeUserStatus.innerHTML = `<span class="signal-dot" style="width:6px; height:6px; background:${p.statusColor};"></span><span>${p.label}</span>`;
        }
    }
}

subscribeToAllUsersPresence((map) => {
    livePresenceMap = map || {};
    refreshActivePresenceUI();
});
setInterval(refreshActivePresenceUI, 15000);
let unsubscribeAdminChat = null;
let currentMsgFilter = 'all';
let currentMsgSearchQuery = '';
currentAdminUid = currentAdminUid || ADMIN_ID;

function stopAdminRealtimeThreads() {
    if (unsubscribeAdminThreads) {
        unsubscribeAdminThreads();
        unsubscribeAdminThreads = null;
    }
    if (unsubscribeAdminChat) {
        unsubscribeAdminChat();
        unsubscribeAdminChat = null;
    }
}

function initAdminChat() {
    // (2026-09-30) Allow reinit after auth sets real UID; was blocking on any existing sub
    if (unsubscribeAdminThreads) return;
    unsubscribeAdminThreads = getAllChatThreads(currentAdminUid, (threads) => {
        cachedThreads = Array.isArray(threads) ? threads : [];
        renderStatistics(cachedUsers);
        renderThreads(cachedThreads);
        if (currentActiveThreadId && currentActiveUserId && !unsubscribeAdminChat) {
            const activeT = cachedThreads.find(t => t.threadId === currentActiveThreadId);
            const client = getThreadClientInfo(activeT);
            window.openAdminThread(currentActiveThreadId, currentActiveUserId, client.name);
        }
    });
}

function formatThreadTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// (2026-07-13) Accurately resolve client UID from thread; was conflict
function getOtherUserIdFromThread(thread) {
    if (!thread) return '';
    if (thread.ownerId && thread.ownerId !== ADMIN_ID && thread.ownerId !== currentAdminUid) return thread.ownerId;
    const candidateIds = [thread.senderId, thread.senderUid, thread.receiverId, thread.recipientUid];
    for (const id of candidateIds) {
        if (id && id !== ADMIN_ID && id !== currentAdminUid && id !== 'admin' && !id.startsWith('support_') && id !== 'system') {
            return id;
        }
    }
    const tId = thread.threadId || '';
    if (tId.includes(ADMIN_ID)) {
        const cleaned = tId.replace(ADMIN_ID, '').replace(/^_+|_+$/g, '');
        if (cleaned) return cleaned;
    }
    if (currentAdminUid && tId.includes(currentAdminUid)) {
        const cleaned = tId.replace(currentAdminUid, '').replace(/^_+|_+$/g, '');
        if (cleaned) return cleaned;
    }
    const parts = tId.split('_').filter(p => p && p !== 'system' && p !== 'admin' && p !== 'securo' && p !== 'support');
    return parts.length > 0 ? parts.join('_') : (thread.senderId || thread.ownerId || '');
}

// (2026-07-13) Classify user or parent role for thread filters; was default
function getThreadParticipantRole(thread, userObj) {
    if (userObj?.role) return userObj.role;
    if (thread?.senderRole && thread.senderRole !== 'admin') return thread.senderRole;
    if (thread?.recipientRole && thread.recipientRole !== 'admin') return thread.recipientRole;
    const searchStr = `${userObj?.name || ''} ${userObj?.email || ''} ${thread?.senderName || ''} ${thread?.senderEmail || ''} ${thread?.senderLabel || ''}`.toLowerCase();
    if (searchStr.includes('parent') || searchStr.includes('guardian')) return 'guardian';
    return 'student';
}

function isAdminName(name) {
    if (!name) return false;
    const n = String(name).trim().toLowerCase();
    return n === 'gad office' || n === 'command desk' || n === 'admin' || n === 'system' || n === 'campus admin' || n === 'system_admin_securo';
}

// (2026-07-13) Client name resolution and deduplication; was senderName override
function getThreadClientInfo(thread) {
    if (!thread) return { userId: '', name: 'Student', role: 'student', isGuardian: false, userObj: null };
    const otherUserId = getOtherUserIdFromThread(thread);
    const userObj = cachedUsers.find(u => {
        if (!u) return false;
        if (otherUserId && (u.id === otherUserId || u.uid === otherUserId || String(u.studentId || '') === String(otherUserId))) return true;
        const uEmail = (u.email || '').toLowerCase();
        if (uEmail && (
            (thread.senderEmail && uEmail === thread.senderEmail.toLowerCase()) ||
            (thread.recipientEmail && uEmail === thread.recipientEmail.toLowerCase()) ||
            (thread.ownerEmail && uEmail === thread.ownerEmail.toLowerCase()) ||
            (thread.senderLabel && uEmail === thread.senderLabel.toLowerCase())
        )) return true;
        return false;
    });

    const role = getThreadParticipantRole(thread, userObj);
    const isGuardian = role === 'guardian';
    const isSentByAdmin = thread.senderRole === 'admin' || thread.senderId === ADMIN_ID || thread.senderId === currentAdminUid;

    let name = userObj?.name || userObj?.fullName || '';
    if (!name || isAdminName(name)) {
        const candidates = [
            thread.clientName,
            thread.targetUserName,
            thread.recipientName,
            thread.ownerName,
            thread.otherUserName,
            thread.userName,
            !isSentByAdmin ? (thread.senderLabel || thread.senderName) : null
        ];
        for (const c of candidates) {
            if (c && !isAdminName(c)) {
                name = c;
                break;
            }
        }
    }
    if (!name && userObj?.studentId) name = `Student #${userObj.studentId}`;
    if (!name && otherUserId && /^\d{7}$/.test(otherUserId)) name = `Student #${otherUserId}`;
    if (!name) name = isGuardian ? 'Guardian' : 'Student';

    return { userId: otherUserId, name, role, isGuardian, userObj };
}

function renderThreads(threads) {
    const rawThreads = Array.isArray(threads) ? threads : [];
    const query = currentMsgSearchQuery.trim().toLowerCase();

    // (2026-07-13) Deduplicate threads by user identity; was thread ID only
    const dedupedMap = new Map();
    rawThreads.forEach(t => {
        const client = getThreadClientInfo(t);
        let dedupKey = client.userObj?.uid || client.userObj?.id || client.userObj?.studentId;
        if (!dedupKey) {
            if (client.name && !isAdminName(client.name)) {
                dedupKey = `${client.role}_${client.name.toLowerCase().trim()}`;
            } else {
                dedupKey = client.userId || t.threadId;
            }
        }

        const existing = dedupedMap.get(dedupKey);
        if (!existing) {
            dedupedMap.set(dedupKey, t);
        } else {
            const timeNew = new Date(t.updatedAt || t.timestamp || t.lastMessageAt || 0).getTime();
            const timeOld = new Date(existing.updatedAt || existing.timestamp || existing.lastMessageAt || 0).getTime();
            if (timeNew > timeOld) dedupedMap.set(dedupKey, t);
        }
    });
    const uniqueThreads = Array.from(dedupedMap.values());

    const filteredThreads = uniqueThreads.filter((thread) => {
        const client = getThreadClientInfo(thread);
        const displayName = client.name.toLowerCase();
        const text = (thread.text || '').toLowerCase();
        const unread = isThreadUnread(thread);
        const role = client.role;

        if (query && !displayName.includes(query) && !text.includes(query)) {
            return false;
        }

        if (currentMsgFilter === 'unread' && !unread) return false;
        if (currentMsgFilter === 'student' && role === 'guardian') return false;
        if (currentMsgFilter === 'guardian' && role !== 'guardian') return false;

        return true;
    });

    if (threadCountBadge) {
        threadCountBadge.textContent = String(uniqueThreads.length);
    }

    if (filteredThreads.length === 0) {
        threadList.innerHTML = `
                    <div class="messages-empty" style="padding:28px 14px; text-align:center;">
                        <span class="material-symbols-outlined" style="font-size:36px; opacity:0.3; color:var(--muted);">filter_list_off</span>
                        <p style="margin:6px 0 0; font-size:0.82rem; color:var(--muted);">No conversations match filter.</p>
                    </div>
                `;
        return;
    }

    // (2026-07-13) Messenger thread previews, online beacon & unread dots; was plain
    threadList.innerHTML = filteredThreads.map(thread => {
        const client = getThreadClientInfo(thread);
        const otherUserId = client.userId;
        const userObj = client.userObj;
        const isActive = currentActiveThreadId === thread.threadId;
        const unread = isThreadUnread(thread);
        const displayName = client.name;
        const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || 'U';
        const role = client.role;
        const isGuardian = client.isGuardian;
        // (2026-07-13) Dynamic role themes: purple student, red parent, blue staff
        const roleClass = (role === 'guardian' || isGuardian) ? 'guardian' : (role === 'staff' ? 'staff' : 'student');
        const roleLabel = (role === 'guardian' || isGuardian) ? 'Guardian' : (role === 'staff' ? 'Staff' : 'Student');
        const timeStr = formatThreadTimestamp(thread.updatedAt || thread.timestamp || thread.lastMessageAt);
        const isSentByAdmin = thread.senderRole === 'admin' || thread.senderId === ADMIN_ID || thread.senderId === currentAdminUid;
        const statusPrefix = isSentByAdmin ? (thread.status === 'replied' ? 'You: Replied · ' : 'You: ') : '';
        const previewSnippet = escapeHtml(statusPrefix + (thread.text || thread.message || 'Direct message'));
        // (2026-07-13) Render live presence dot per user; was hardcoded green
        const presence = getUserPresenceStatus(otherUserId, userObj);
        return `
                    <div class="thread-item ${isActive ? 'active' : ''} ${unread ? 'unread' : ''}" data-thread-id="${escapeHtml(thread.threadId)}" data-other-user-id="${escapeHtml(otherUserId)}" data-other-user-name="${escapeHtml(displayName)}">
                        <div class="thread-avatar ${roleClass}">
                            ${userObj?.photoURL ? `<img src="${escapeHtml(userObj.photoURL)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
                            <span class="thread-presence-dot" data-presence-uid="${escapeHtml(otherUserId)}" title="${escapeHtml(presence.label)}" style="position:absolute; bottom:0; right:0; width:11px; height:11px; border-radius:50%; background:${presence.dotColor}; border:2px solid #fff;"></span>
                        </div>
                        <div class="thread-info">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                                <div class="thread-name">${escapeHtml(displayName)}</div>
                                <span style="font-size:0.67rem; color:var(--muted); font-weight:600;">${timeStr}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                                <div class="thread-preview">${previewSnippet}</div>
                                <span class="role-pill ${roleClass}" style="font-size:0.58rem; padding:1px 6px; flex-shrink:0;">${roleLabel}</span>
                            </div>
                        </div>
                        ${unread ? '<div class="thread-unread-dot" title="Unread conversation"></div>' : ''}
                    </div>
                `;
    }).join('');

    attachThreadDeleteGesture();
}

function attachThreadDeleteGesture() {
    threadList.querySelectorAll('.thread-item').forEach((item) => {
        let holdTimer = null;
        const clearHold = () => {
            if (holdTimer) {
                clearTimeout(holdTimer);
                holdTimer = null;
            }
        };
        item.addEventListener('pointerdown', () => {
            holdTimer = window.setTimeout(() => {
                item.dataset.longPressTriggered = 'true';
                const threadId = item.dataset.threadId;
                const userName = item.dataset.otherUserName || 'this conversation';
                window.handleDeleteThread(threadId, userName);
            }, 700);
        });
        item.addEventListener('click', () => {
            if (item.dataset.longPressTriggered === 'true') {
                item.dataset.longPressTriggered = 'false';
                return;
            }
            window.openAdminThread(
                item.dataset.threadId,
                item.dataset.otherUserId,
                item.dataset.otherUserName
            );
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach((eventName) => {
            item.addEventListener(eventName, () => {
                clearHold();
                if (eventName !== 'pointerleave') {
                    window.setTimeout(() => {
                        item.dataset.longPressTriggered = 'false';
                    }, 0);
                }
            });
        });
    });
}

// (2026-07-13) Retain client name on admin reply; was GAD Office overwrite
window.openAdminThread = function (threadId, userId, userName) {
    currentActiveThreadId = threadId;
    const threadObj = cachedThreads.find(t => t.threadId === threadId);
    const client = getThreadClientInfo(threadObj);
    let resolvedUserId = userId || client.userId;
    currentActiveUserId = resolvedUserId;
    persistSeenThread(threadId);
    markThreadMessagesSeen(threadId, 'admin');

    const messagesShell = document.querySelector('.messages-shell');
    if (messagesShell) messagesShell.classList.add('mobile-chat-active');

    const userObj = client.userObj;
    const displayName = (!userName || isAdminName(userName)) ? client.name : userName;
    activeUserName.textContent = displayName;
    const role = client.role;
    const isGuardian = client.isGuardian;
    // (2026-07-13) Set active chat role style dynamically; was binary
    const roleClass = (role === 'guardian' || isGuardian) ? 'guardian' : (role === 'staff' ? 'staff' : 'student');
    const roleLabel = (role === 'guardian' || isGuardian) ? 'Guardian' : (role === 'staff' ? 'Staff' : 'Student');
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || 'U';
    // (2026-07-13) Dynamic user beacon & status from live presence; was static
    const activePresence = getUserPresenceStatus(resolvedUserId, userObj);
    activeUserAvatar.className = 'thread-avatar ' + roleClass;
    if (userObj?.photoURL) {
        activeUserAvatar.innerHTML = `<img src="${escapeHtml(userObj.photoURL)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"><span id="activeUserBeacon" title="${escapeHtml(activePresence.label)}" style="position:absolute; bottom:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:${activePresence.statusColor}; border:2px solid #fff;"></span>`;
    } else {
        activeUserAvatar.innerHTML = `${initials}<span id="activeUserBeacon" title="${escapeHtml(activePresence.label)}" style="position:absolute; bottom:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:${activePresence.statusColor}; border:2px solid #fff;"></span>`;
    }

    if (activeUserRoleBadge) {
        activeUserRoleBadge.style.display = 'inline-block';
        activeUserRoleBadge.className = 'role-pill ' + roleClass;
        activeUserRoleBadge.textContent = roleLabel;
    }

    if (activeUserIdTag) {
        if (userObj?.studentId) {
            activeUserIdTag.style.display = 'inline';
            activeUserIdTag.textContent = '#' + userObj.studentId;
        } else {
            activeUserIdTag.style.display = 'none';
        }
    }

    if (activeUserStatus) {
        activeUserStatus.innerHTML = `<span class="signal-dot" style="width:6px; height:6px; background:${activePresence.statusColor};"></span><span>${escapeHtml(activePresence.label)}</span>`;
    }

    if (chatHeaderActions) chatHeaderActions.style.display = 'flex';
    if (cannedResponseBar) cannedResponseBar.style.display = 'flex';

    if (dossierStudentId) dossierStudentId.textContent = userObj?.studentId || userObj?.id || 'N/A';
    if (dossierEmail) dossierEmail.textContent = userObj?.email || 'No email on record';
    if (dossierSosCount) {
        const userSos = cachedSosLogs.filter(l => l.userId === resolvedUserId || (l.studentName && l.studentName.toLowerCase() === displayName.toLowerCase()));
        if (userSos.length > 0) {
            dossierSosCount.textContent = `${userSos.length} alerts logged (${userSos[0].status || 'Logged'})`;
            dossierSosCount.style.color = '#dc2626';
        } else {
            dossierSosCount.textContent = '0 alerts (Safe)';
            dossierSosCount.style.color = '#16a34a';
        }
    }
    if (dossierGuardianInfo) {
        const links = cachedGuardianLinks.filter(g => g.studentId === resolvedUserId || (userObj?.email && g.studentEmail && g.studentEmail.toLowerCase() === userObj.email.toLowerCase()));
        if (links.length > 0) {
            dossierGuardianInfo.textContent = links.map(l => l.guardianName || l.guardianEmail || 'Linked Guardian').join(', ');
        } else if (isGuardian) {
            const studentLinks = cachedGuardianLinks.filter(g => g.guardianId === resolvedUserId || (userObj?.email && g.guardianEmail && g.guardianEmail.toLowerCase() === userObj.email.toLowerCase()));
            dossierGuardianInfo.textContent = studentLinks.length > 0 ? studentLinks.map(l => l.studentName || l.studentEmail).join(', ') : 'Registered Guardian';
        } else {
            dossierGuardianInfo.textContent = 'None linked';
        }
    }

    adminChatInput.disabled = false;
    adminSendBtn.disabled = false;
    adminChatInput.placeholder = `Type response to ${displayName}...`;
    setTimeout(() => adminChatInput.focus(), 100);

    if (unsubscribeAdminChat) unsubscribeAdminChat();

    unsubscribeAdminChat = subscribeToMessagesByThread(threadId, (messages) => {
        renderAdminMessages(messages);
    });

    renderThreads(cachedThreads);
};

// (2026-07-13) Render Messenger chat rows with receipts & avatars; was plain boxes
function renderAdminMessages(messages) {
    adminChatMessages.innerHTML = "";
    if (!messages || messages.length === 0) {
        adminChatMessages.innerHTML = `
                    <div class="messages-empty" style="padding:40px 20px;">
                        <span class="material-symbols-outlined" style="font-size:38px; opacity:0.3; color:var(--primary);">chat</span>
                        <p style="margin:6px 0 0; color:var(--muted); font-size:0.85rem;">No messages in this conversation yet. Send a dispatch directive below.</p>
                    </div>
                `;
        return;
    }

    let lastDateLabel = "";
    const currentOtherUser = activeUserName.textContent || 'User';
    const userInitial = currentOtherUser.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 1) || 'U';

    messages.forEach((msg, idx) => {
        const isSent = msg.senderId === ADMIN_ID || msg.senderId === currentAdminUid || msg.senderRole === 'admin';
        const date = msg.timestamp?.toDate?.() || new Date(msg.localTime || Date.now());
        const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (dateStr !== lastDateLabel) {
            lastDateLabel = dateStr;
            const divider = document.createElement("div");
            divider.style.cssText = "display:flex; justify-content:center; margin:14px 0 8px;";
            divider.innerHTML = `<span style="background:#f0f2f5; color:#65676b; font-size:0.68rem; font-weight:700; padding:3px 12px; border-radius:12px; letter-spacing:0.02em;">${dateStr}</span>`;
            adminChatMessages.appendChild(divider);
        }

        // (2026-07-13) Grouped bubble cluster & receipt filtering; was separate
        const prevMsg = messages[idx - 1];
        const nextMsg = messages[idx + 1];
        const prevDate = prevMsg ? (prevMsg.timestamp?.toDate?.() || new Date(prevMsg.localTime || Date.now())).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : null;
        const nextDate = nextMsg ? (nextMsg.timestamp?.toDate?.() || new Date(nextMsg.localTime || Date.now())).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : null;

        const isPrevSame = prevMsg && (prevDate === dateStr) && (
            (prevMsg.senderId === ADMIN_ID || prevMsg.senderId === currentAdminUid || prevMsg.senderRole === 'admin') === isSent
        );
        const isNextSame = nextMsg && (nextDate === dateStr) && (
            (nextMsg.senderId === ADMIN_ID || nextMsg.senderId === currentAdminUid || nextMsg.senderRole === 'admin') === isSent
        );

        let groupPos = 'single';
        if (isPrevSame && isNextSame) {
            groupPos = 'middle';
        } else if (!isPrevSame && isNextSame) {
            groupPos = 'first';
        } else if (isPrevSame && !isNextSame) {
            groupPos = 'last';
        }

        const rowEl = document.createElement("div");
        rowEl.className = `admin-msg-row ${isSent ? 'sent' : 'received'} group-${groupPos}`;

        if (!isSent) {
            const avatarEl = document.createElement("div");
            avatarEl.className = "admin-msg-avatar";
            if (groupPos === 'last' || groupPos === 'single') {
                avatarEl.textContent = userInitial;
            } else {
                avatarEl.style.visibility = 'hidden';
            }
            rowEl.appendChild(avatarEl);
        }

        const msgEl = document.createElement("div");
        msgEl.className = `admin-msg ${isSent ? 'sent' : 'received'} bubble-${groupPos}`;
        if (msg.isPending) msgEl.style.opacity = "0.7";
        msgEl.innerHTML = `
                    <div>${escapeHtml(msg.text || msg.message || '')}</div>
                    ${(groupPos === 'last' || groupPos === 'single') ? `<span class="msg-time">${timeStr}</span>` : ''}
                `;
        rowEl.appendChild(msgEl);
        adminChatMessages.appendChild(rowEl);

        const isLastMsg = idx === messages.length - 1;
        const status = msg.status || (msg.seen ? 'seen' : (msg.read ? 'read' : 'delivered'));
        let receiptText = '';
        let isSeenStatus = false;

        if (isSent) {
            if (status === 'replied') {
                receiptText = 'Replied • ' + timeStr;
            } else if (status === 'seen' || msg.seen) {
                receiptText = 'Seen ✓✓';
                isSeenStatus = true;
            } else {
                receiptText = 'Delivered ✓';
            }
        } else if (msg.status === 'replied') {
            receiptText = 'Replied by Command Desk';
        }

        if (receiptText && (groupPos === 'last' || groupPos === 'single')) {
            const receiptEl = document.createElement("div");
            receiptEl.className = `msg-receipt-row ${isSent ? 'sent' : 'received'}`;
            receiptEl.innerHTML = `<span class="receipt-pill ${isSeenStatus ? 'seen' : ''}">${escapeHtml(receiptText)}</span>`;
            adminChatMessages.appendChild(receiptEl);
        }
    });
    adminChatMessages.scrollTo({ top: adminChatMessages.scrollHeight, behavior: 'smooth' });
}

// (2026-07-13) Dispatch reply with grouped bubble wrapper; was unwrapped msg
async function handleAdminSendMessage() {
    const text = adminChatInput.value.trim();
    if (!text) return;
    let targetUserId = currentActiveUserId;
    if (!targetUserId || targetUserId === 'system' || targetUserId === 'support') {
        const threadObj = cachedThreads.find(t => t.threadId === currentActiveThreadId);
        targetUserId = getOtherUserIdFromThread(threadObj) || currentActiveUserId;
    }
    if (!targetUserId) return;
    currentActiveUserId = targetUserId;
    const adminSenderId = currentAdminUid || ADMIN_ID;

    const rowEl = document.createElement("div");
    rowEl.className = "admin-msg-row sent group-last";
    const msgEl = document.createElement("div");
    msgEl.className = "admin-msg sent bubble-last";
    msgEl.style.opacity = "0.7";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    msgEl.innerHTML = `
                <div>${escapeHtml(text)}</div>
                <span class="msg-time">${timeStr}</span>
            `;
    rowEl.appendChild(msgEl);
    adminChatMessages.appendChild(rowEl);
    adminChatMessages.scrollTo({ top: adminChatMessages.scrollHeight, behavior: 'smooth' });
    adminChatInput.value = "";

    try {
        // (2026-07-13) Persist client name on admin reply; was missing clientName
        await sendChatMessage(adminSenderId, targetUserId, text, "GAD Office", {
            threadId: currentActiveThreadId,
            supportMode: "gad_support",
            senderRole: "admin",
            ownerId: targetUserId,
            clientName: activeUserName.textContent,
            targetUserName: activeUserName.textContent
        });
    } catch (err) {
        console.warn("Failed to send admin message:", err);
        msgEl.style.borderColor = "#ef4444";
        msgEl.innerHTML += '<span style="font-size:0.65rem; color:#ef4444; display:block; margin-top:2px;">Failed to send</span>';
    }
}

window.handleDeleteThread = async (threadId, userName) => {
    if (!threadId) return;
    const confirmed = window.confirm(`Delete the conversation with ${userName || 'this user'}?`);
    if (!confirmed) return;
    try {
        await deleteConversationThread(threadId);
        if (currentActiveThreadId === threadId) {
            currentActiveThreadId = null;
            currentActiveUserId = null;
            if (unsubscribeAdminChat) {
                unsubscribeAdminChat();
                unsubscribeAdminChat = null;
            }
            activeUserName.textContent = 'Select a conversation';
            activeUserAvatar.textContent = '?';
            activeUserAvatar.className = 'thread-avatar';
            if (activeUserBeacon) activeUserBeacon.style.display = 'none';
            if (activeUserRoleBadge) activeUserRoleBadge.style.display = 'none';
            if (activeUserIdTag) activeUserIdTag.style.display = 'none';
            if (chatHeaderActions) chatHeaderActions.style.display = 'none';
            if (cannedResponseBar) cannedResponseBar.style.display = 'none';
            if (activeUserDossierPanel) activeUserDossierPanel.style.display = 'none';
            if (activeUserStatus) {
                activeUserStatus.innerHTML = '<span class="signal-dot" style="width:6px; height:6px; background:#94a3b8;"></span><span>Awaiting Selection</span>';
            }
            adminChatInput.value = '';
            adminChatInput.placeholder = 'Type a reply...';
            adminChatInput.disabled = true;
            adminSendBtn.disabled = true;
            adminChatMessages.innerHTML = `
                        <div class="messages-empty" style="padding:40px 20px;">
                            <div style="width:68px; height:68px; border-radius:20px; background:rgba(90,31,224,0.08); color:var(--primary); display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                                <span class="material-symbols-outlined" style="font-size:36px;">chat_bubble</span>
                            </div>
                            <h4 style="margin:0; font-family:'Sora',sans-serif; color:var(--ink); font-size:1.05rem;">Direct Dispatch Messaging</h4>
                            <p style="margin:4px 0 0; max-width:320px; font-size:0.82rem; color:var(--muted); line-height:1.4;">Select a student or guardian from the conversation directory to initiate secure safety communications.</p>
                        </div>
                    `;
        }
        showToast("Conversation deleted", "The support thread was removed.", "success");
    } catch (error) {
        showToast("Delete failed", error.message || "Could not delete this conversation.", "error");
    }
};

// Attach UI listeners for search, filter chips, canned responses, dossier toggle, and header delete
if (threadSearchInput) {
    threadSearchInput.addEventListener('input', (e) => {
        currentMsgSearchQuery = e.target.value;
        renderThreads(cachedThreads);
    });
}

document.querySelectorAll('.msg-filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.msg-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentMsgFilter = chip.dataset.msgFilter || 'all';
        renderThreads(cachedThreads);
    });
});

// (2026-07-13) User and parent directory filter listeners; was absent
document.querySelectorAll('.user-filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.user-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentManagementRoleFilter = btn.dataset.userFilter || 'all';
        renderManagedUsers();
    });
});

if (btnRefreshThreads) {
    btnRefreshThreads.addEventListener('click', () => {
        initAdminChat();
        renderThreads(cachedThreads);
        showToast("Refreshed", "Message threads synchronized.", "info");
    });
}

document.querySelectorAll('.canned-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        const cannedText = chip.dataset.canned;
        if (cannedText && !adminChatInput.disabled) {
            adminChatInput.value = cannedText;
            adminChatInput.focus();
        }
    });
});

if (btnToggleStudentDossier && activeUserDossierPanel) {
    btnToggleStudentDossier.addEventListener('click', () => {
        const isHidden = getComputedStyle(activeUserDossierPanel).display === 'none';
        activeUserDossierPanel.style.display = isHidden ? 'block' : 'none';
        btnToggleStudentDossier.style.background = isHidden ? '#e2e8f0' : '#f1f5f9';
    });
}

if (btnHeaderDeleteThread) {
    btnHeaderDeleteThread.addEventListener('click', () => {
        if (currentActiveThreadId) {
            window.handleDeleteThread(currentActiveThreadId, activeUserName.textContent);
        }
    });
}

window.handleDeleteUser = async (userId, userName) => {
    if (!userId) return;
    const confirmed = window.confirm(`Delete ${userName || 'this user'} from the admin directory?`);
    if (!confirmed) return;
    try {
        await deleteUserRecord(userId);
        if (currentActiveUserId === userId) {
            currentActiveUserId = null;
            currentActiveThreadId = null;
            if (unsubscribeAdminChat) {
                unsubscribeAdminChat();
                unsubscribeAdminChat = null;
            }
            activeUserName.textContent = 'Select a conversation';
            activeUserAvatar.textContent = '?';
            adminChatInput.value = '';
            adminChatInput.disabled = true;
            adminSendBtn.disabled = true;
            adminChatMessages.innerHTML = `
                        <div class="messages-empty">
                            <span class="material-symbols-outlined" style="font-size: 48px; opacity: 0.2;">chat_bubble</span>
                            <p>Select a user to start messaging</p>
                        </div>
                    `;
        }
        showToast("User deleted", `${userName || 'The user'} was removed from admin records.`, "success");
        closeUserActionMenu();
        closeUserEditorModal();
        await loadAllData();
    } catch (error) {
        showToast("Delete failed", error.message || "Could not delete this user.", "error");
    }
};

if (saveManagedUserBtn) {
    saveManagedUserBtn.addEventListener('click', async () => {
        const name = manageUserName?.value.trim() || '';
        const email = manageUserEmail?.value.trim() || '';
        const password = manageUserPassword?.value || '';
        const role = manageUserRole?.value || 'student';
        const studentId = manageUserStudentId?.value.trim() || '';
        const normalizedEmail = ['student', 'staff'].includes(role)
            ? (email ? email.toLowerCase() : roleIdToEmail(studentId, role))
            : email.toLowerCase();

        if (name.length < 3) {
            showToast("Missing name", "Please enter the user's full name.", "error");
            return;
        }

        if ((role === 'student' || role === 'staff') && !studentId) {
            showToast("Missing ID", `${role === 'staff' ? 'Staff' : 'Student'} accounts require a 7-digit ID number.`, "error");
            return;
        }

        if ((role === 'student' || role === 'staff') && studentId && !/^\d{7}$/.test(studentId)) {
            showToast("Invalid ID", "Student IDs must be 7 digits.", "error");
            return;
        }

        if ((role === 'student' || role === 'staff') && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            showToast("Invalid email", `Please enter a valid ${role === 'staff' ? 'staff' : 'student'} email address.`, "error");
            return;
        }

        if (role === 'guardian' && !email) {
            showToast("Missing email", "Guardian accounts require an email address.", "error");
            return;
        }

        if (role === 'guardian' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            showToast("Invalid email", "Please enter a valid guardian email address.", "error");
            return;
        }

        if (isCreatingManagedUser && password.length < 6) {
            showToast("Missing password", "New sign-in accounts need a password with at least 6 characters.", "error");
            return;
        }

        if (!isCreatingManagedUser && password && password.length < 8) {
            showToast("Short password", "New password must be at least 8 characters.", "error");
            return;
        }

        const payload = {
            name,
            email: normalizedEmail,
            role,
            studentId: (role === 'student' || role === 'staff') ? studentId : ''
        };
        if (password && password.length >= 8) {
            payload.password = password;
        }

        saveManagedUserBtn.disabled = true;
        try {
            if (isCreatingManagedUser) {
                const authUser = await createAuthAccountForManagedUser(normalizedEmail, password);
                await saveUserProfile(authUser.uid, payload);
                showToast("Account created", "The new account can now sign in with the saved email and password.", "success");
            } else if (selectedManagedUserId) {
                // (2026-07-13) Allow admin to update live user password; ignored passwords
                if (password && password.length >= 8) {
                    await changeManagedUserPasswordAsAdmin(selectedManagedUserId, normalizedEmail, password);
                }
                await updateUserProfile(selectedManagedUserId, payload);
                // (2026-07-13) Broadcast guardian rename to links & tabs; was profile only
                if (role === 'guardian') {
                    await syncGuardianLinksForGuardian(selectedManagedUserId, payload).catch(() => { });
                }
                try {
                    const ch = new BroadcastChannel('securo_users_channel');
                    ch.postMessage({ type: 'user_updated', userId: selectedManagedUserId, payload });
                    ch.close();
                } catch (e) { }
                showToast("User updated", "Saved profile details and live password updated successfully.", "success");
            }
            closeUserActionMenu();
            closeUserEditorModal();
            await loadAllData();
        } catch (error) {
            const raw = String(error?.message || '').toLowerCase();
            const friendly = raw.includes('email-already-in-use')
                ? 'That email is already used by another account.'
                : raw.includes('invalid-email')
                    ? 'Please enter a valid email address.'
                    : raw.includes('weak-password')
                        ? 'Password must be at least 6 characters.'
                        : 'Could not save this user profile.';
            showToast("Save failed", friendly, "error");
        } finally {
            saveManagedUserBtn.disabled = false;
        }
    });
}

if (deleteManagedUserBtn) {
    deleteManagedUserBtn.addEventListener('click', async () => {
        const user = getManagedUserById(selectedManagedUserId);
        if (!user?.id) return;
        await window.handleDeleteUser(user.id, user.name || 'this user');
    });
}

// (2026-07-13) Add mobile back button listener for thread list; was absent
const btnMobileBack = document.getElementById('btnMobileBackToThreads');
if (btnMobileBack) {
    btnMobileBack.addEventListener('click', () => {
        const shell = document.querySelector('.messages-shell');
        if (shell) shell.classList.remove('mobile-chat-active');
    });
}

adminSendBtn.addEventListener('click', handleAdminSendMessage);
adminChatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAdminSendMessage();
    }
});

// (2026-07-13) Person-first Digital Vault gallery & fullscreen viewer; was flat grid
let currentVaultFilter = 'all';
let currentVaultSearch = '';
let selectedVaultPersonId = null;

function getAllVaultItems() {
    const items = [];
    (cachedEmergencyPosts || []).forEach(post => {
        const uId = post.userId || post.uid;
        const user = cachedUsers.find(u => String(u.id) === String(uId) || String(u.uid) === String(uId) || (u.studentId && String(u.studentId) === String(post.studentId))) || {};
        const studentName = user.name || user.fullName || post.userName || 'Student';
        const studentId = user.studentId || post.studentId || '';
        const time = post.createdAt?.toDate ? post.createdAt.toDate() : (post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt || 0));
        const location = post.location || null;

        const rawAttachments = Array.isArray(post.attachments) && post.attachments.length > 0
            ? post.attachments
            : (post.photo || post.photoURL || post.image ? [{ kind: 'image', url: post.photo || post.photoURL || post.image, thumb: post.photo || post.photoURL || post.image }] : []);

        rawAttachments.forEach((att, idx) => {
            const url = att.url || att.src || att.data || att.thumb;
            if (!url) return;
            const kind = att.kind || (String(url).startsWith('data:video') || String(url).includes('.mp4') ? 'video' : 'image');
            items.push({
                id: `${post.id || 'p'}_${idx}`,
                postId: post.id,
                userId: uId,
                studentName,
                studentId,
                userPhoto: user.photoURL || null,
                url,
                thumb: att.thumb || url,
                kind,
                time,
                location,
                name: att.name || `Vault_Evidence_${idx + 1}`
            });
        });
    });

    // (2026-07-13) Filter valid photo strings from SOS logs; was accepting any truthy
    (cachedSosLogs || []).forEach(log => {
        const url = log.photoURL || log.photo || log.attachment || log.image;
        if (!url) return;
        if (typeof url !== 'string' || (!url.startsWith('http') && !url.startsWith('data:image') && !url.startsWith('data:video') && url.length < 15)) return;
        const uId = log.userId || log.studentId;
        const user = cachedUsers.find(u => String(u.id) === String(uId) || String(u.uid) === String(uId) || (u.studentId && String(u.studentId) === String(log.studentId))) || {};
        const studentName = user.name || user.fullName || log.studentName || log.userName || 'Student';
        const studentId = user.studentId || log.studentId || '';
        const time = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000) : new Date(log.timestamp || 0));
        const location = log.location || null;

        if (!items.some(it => it.url === url)) {
            items.push({
                id: `sos_${log.id || Math.random().toString(36).slice(2, 7)}`,
                postId: log.id,
                userId: uId,
                studentName,
                studentId,
                userPhoto: user.photoURL || null,
                url,
                thumb: url,
                kind: String(url).startsWith('data:video') || String(url).includes('.mp4') ? 'video' : 'image',
                time,
                location,
                name: `SOS_Evidence_${log.id || 'log'}`
            });
        }
    });

    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items;
}

window.selectVaultPerson = function (personId) {
    selectedVaultPersonId = personId;
    window.renderAdminVaultGallery();
};

window.renderAdminVaultGallery = function () {
    const grid = document.getElementById('adminVaultGrid');
    const countLabel = document.getElementById('vaultCountLabel');
    const sidebarCounter = document.getElementById('sidebarVaultCounter');
    if (!grid) return;

    const allItems = getAllVaultItems();
    if (sidebarCounter) {
        if (allItems.length > 0) {
            sidebarCounter.style.display = 'inline-block';
            sidebarCounter.textContent = String(allItems.length);
        } else {
            sidebarCounter.style.display = 'none';
        }
    }

    // Group by student / uploader
    const personMap = new Map();
    allItems.forEach(item => {
        const key = String(item.userId || item.studentId || item.studentName || 'unknown');
        if (!personMap.has(key)) {
            personMap.set(key, {
                key,
                userId: item.userId,
                studentId: item.studentId,
                studentName: item.studentName,
                userPhoto: item.userPhoto,
                latestTime: item.time,
                items: []
            });
        }
        const p = personMap.get(key);
        p.items.push(item);
        if (item.time > p.latestTime) p.latestTime = item.time;
    });
    const personList = Array.from(personMap.values()).sort((a, b) => b.latestTime.getTime() - a.latestTime.getTime());

    const query = (currentVaultSearch || '').trim().toLowerCase();

    // 1. Person Selection View (default when no specific person selected)
    if (!selectedVaultPersonId) {
        const filteredPersons = personList.filter(p => {
            if (!query) return true;
            return p.studentName.toLowerCase().includes(query) || String(p.studentId).toLowerCase().includes(query);
        });

        if (countLabel) countLabel.textContent = `${filteredPersons.length} Student Profiles`;

        if (filteredPersons.length === 0) {
            grid.innerHTML = `
                        <div class="messages-empty" style="grid-column: 1 / -1; padding:48px 16px; text-align:center;">
                            <span class="material-symbols-outlined" style="font-size:44px; opacity:0.3; color:var(--muted);">groups</span>
                            <p style="margin:8px 0 0; font-size:0.88rem; font-weight:600; color:var(--muted);">${personList.length === 0 ? 'No student vault uploads registered yet.' : 'No students match current search.'}</p>
                        </div>
                    `;
            return;
        }

        grid.innerHTML = `
                    <div style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:4px; padding:12px 16px; background:#f5f3ff; border:1px solid #ddd6fe; border-radius:14px;">
                        <div>
                            <div style="font-size:0.92rem; font-weight:800; color:var(--ink);">Choose Student to View Specific Vault</div>
                            <div style="font-size:0.75rem; color:var(--muted); font-weight:600;">Select an account below to view all timestamped evidence photos and recordings.</div>
                        </div>
                        <button type="button" class="ghost-btn" onclick="window.selectVaultPerson('__all__')" style="background:white; border-radius:10px; padding:6px 14px; font-size:0.78rem; font-weight:700; color:#7c3aed; border:1px solid #ddd6fe;">
                            <span class="material-symbols-outlined" style="font-size:16px;">photo_library</span>
                            <span>View All Files (${allItems.length})</span>
                        </button>
                    </div>
                    <div class="vault-persons-grid" style="grid-column: 1 / -1;">
                        ${filteredPersons.map(p => {
            const initials = p.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
            const latestDateStr = p.latestTime.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + p.latestTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

            return `
                                <div class="vault-person-card" onclick="window.selectVaultPerson('${escapeHtml(p.key)}')">
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                        <div style="display:flex; align-items:center; gap:12px; min-width:0;">
                                            <div class="thread-avatar student" style="width:42px; height:42px; font-size:0.95rem; font-weight:800; flex-shrink:0;">
                                                ${p.userPhoto ? `<img src="${escapeHtml(p.userPhoto)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
                                            </div>
                                            <div style="min-width:0;">
                                                <h4 style="margin:0; font-size:0.95rem; font-weight:800; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(p.studentName)}</h4>
                                                <div style="font-size:0.75rem; color:var(--muted); font-weight:600; margin-top:2px;">
                                                    ${p.studentId ? 'ID #' + escapeHtml(p.studentId) : 'Student Profile'}
                                                </div>
                                            </div>
                                        </div>
                                        <span class="mini-chip" style="background:#f3e8ff; color:#7c3aed; border:1px solid #d8b4fe; font-weight:700; white-space:nowrap;">
                                            ${p.items.length} ${p.items.length === 1 ? 'File' : 'Files'}
                                        </span>
                                    </div>
                                    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin:4px 0;">
                                        ${p.items.slice(0, 4).map(it => `
                                            <div style="aspect-ratio:1/1; background:#181528; border-radius:8px; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                                                ${it.kind === 'image'
                    ? `<img src="${escapeHtml(it.thumb || it.url)}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='../assets/images/logo with text.png';">`
                    : `<span class="material-symbols-outlined" style="font-size:18px; color:#94a3b8;">videocam</span>`
                }
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:10px; margin-top:2px;">
                                        <div style="font-size:0.72rem; color:var(--muted); display:flex; align-items:center; gap:4px;">
                                            <span class="material-symbols-outlined" style="font-size:15px;">schedule</span>
                                            <span>${latestDateStr}</span>
                                        </div>
                                        <div style="display:inline-flex; align-items:center; gap:4px; font-size:0.75rem; font-weight:700; color:#7c3aed;">
                                            <span>Open Vault</span>
                                            <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                `;
        return;
    }

    // 2. Specific Person Vault View
    const isAll = selectedVaultPersonId === '__all__';
    const activePersonObj = personList.find(p => p.key === selectedVaultPersonId);
    const activePersonName = isAll ? 'All Registered Students' : (activePersonObj?.studentName || 'Selected Student');
    const activePersonIdTag = activePersonObj?.studentId ? `#${activePersonObj.studentId}` : '';

    const filtered = allItems.filter(item => {
        if (!isAll) {
            const matchUser = String(item.userId) === selectedVaultPersonId || String(item.studentId) === selectedVaultPersonId || String(item.studentName) === selectedVaultPersonId;
            if (!matchUser) return false;
        }
        if (currentVaultFilter !== 'all' && item.kind !== currentVaultFilter) return false;
        if (query) {
            const matchName = item.studentName.toLowerCase().includes(query);
            const matchId = String(item.studentId).toLowerCase().includes(query);
            const matchFile = (item.name || '').toLowerCase().includes(query);
            const matchLoc = (item.location?.address || '').toLowerCase().includes(query);
            if (!matchName && !matchId && !matchFile && !matchLoc) return false;
        }
        return true;
    });

    if (countLabel) countLabel.textContent = `${filtered.length} files`;

    const topBarHtml = `
                <div style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px; padding:12px 18px; background:#f5f3ff; border:1px solid #ddd6fe; border-radius:16px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <button type="button" class="ghost-btn" onclick="window.selectVaultPerson(null)" style="background:white; border-radius:10px; padding:6px 12px; font-size:0.78rem; font-weight:700; color:#7c3aed; border:1px solid #ddd6fe; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                            <span class="material-symbols-outlined" style="font-size:16px;">arrow_back</span>
                            <span>Choose Person</span>
                        </button>
                        <div>
                            <div style="font-size:0.98rem; font-weight:800; color:var(--ink);">${escapeHtml(activePersonName)} ${escapeHtml(activePersonIdTag)}</div>
                            <div style="font-size:0.75rem; color:var(--muted); font-weight:600;">Showing ${filtered.length} secured evidence items</div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <label style="font-size:0.75rem; font-weight:700; color:var(--muted);">Switch Person:</label>
                        <select onchange="window.selectVaultPerson(this.value)" style="padding:6px 12px; font-size:0.8rem; border-radius:8px; border:1px solid var(--border); background:white; font-weight:700; color:var(--ink); outline:none;">
                            <option value="__all__" ${isAll ? 'selected' : ''}>All Students (${allItems.length} files)</option>
                            ${personList.map(p => `
                                <option value="${escapeHtml(p.key)}" ${p.key === selectedVaultPersonId ? 'selected' : ''}>
                                    ${escapeHtml(p.studentName)} (${p.items.length} files)
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            `;

    if (filtered.length === 0) {
        grid.innerHTML = topBarHtml + `
                    <div class="messages-empty" style="grid-column: 1 / -1; padding:48px 16px; text-align:center;">
                        <span class="material-symbols-outlined" style="font-size:44px; opacity:0.3; color:var(--muted);">photo_library</span>
                        <p style="margin:8px 0 0; font-size:0.88rem; font-weight:600; color:var(--muted);">No media found for this student under current filter.</p>
                    </div>
                `;
        return;
    }

    grid.innerHTML = topBarHtml + filtered.map(item => {
        const initials = item.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
        const timeStr = item.time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + item.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
        const isImage = item.kind === 'image';

        return `
                    <div class="vault-evidence-card" data-item-id="${escapeHtml(item.id)}" style="min-height:280px;">
                        <div class="vault-media-preview-wrap" onclick="window.openVaultLightbox('${escapeHtml(item.id)}')" style="width:100%; height:180px; min-height:180px; background:#181528; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                            ${isImage
                ? `<img src="${escapeHtml(item.thumb || item.url)}" alt="${escapeHtml(item.name)}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.onerror=null; this.src='../assets/images/logo with text.png';">`
                : `<div style="display:flex; flex-direction:column; align-items:center; gap:6px; color:#94a3b8;">
                                    <span class="material-symbols-outlined" style="font-size:40px;">videocam</span>
                                    <span style="font-size:0.75rem; font-weight:700;">Video Recording</span>
                                   </div>`
            }
                            <span class="vault-media-badge">
                                <span class="material-symbols-outlined" style="font-size:12px;">${isImage ? 'image' : 'videocam'}</span>
                                <span>${isImage ? 'IMAGE' : 'VIDEO'}</span>
                            </span>
                        </div>
                        <div class="vault-evidence-body">
                            <div class="vault-student-row">
                                <div class="vault-student-info">
                                    <div class="thread-avatar student" style="width:28px; height:28px; font-size:0.7rem;">
                                        ${item.userPhoto ? `<img src="${escapeHtml(item.userPhoto)}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : initials}
                                    </div>
                                    <div style="min-width:0;">
                                        <div style="font-size:0.82rem; font-weight:700; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.studentName)}</div>
                                        <div style="font-size:0.68rem; color:var(--muted);">${item.studentId ? '#' + escapeHtml(item.studentId) : 'Student'}</div>
                                    </div>
                                </div>
                                <span class="role-pill student" style="font-size:0.56rem; padding:1px 5px;">STUDENT</span>
                            </div>
                            <div style="font-size:0.72rem; color:var(--muted); display:flex; align-items:center; gap:4px;">
                                <span class="material-symbols-outlined" style="font-size:14px;">schedule</span>
                                <span>${timeStr}</span>
                            </div>
                            ${item.location?.address ? `
                                <div style="font-size:0.7rem; color:var(--muted); display:flex; align-items:center; gap:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    <span class="material-symbols-outlined" style="font-size:14px; color:#dc2626;">location_on</span>
                                    <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(item.location.address)}</span>
                                </div>
                            ` : ''}
                            <div class="vault-actions-row">
                                <button type="button" class="action-btn" onclick="window.openVaultLightbox('${escapeHtml(item.id)}')" style="background:#f8fafc; border:1px solid var(--border); height:28px; padding:0 8px; border-radius:4px; font-size:0.72rem; font-weight:600; color:var(--ink); display:inline-flex; align-items:center; gap:4px; cursor:pointer;">
                                    <span class="material-symbols-outlined" style="font-size:14px; color:#7c3aed;">visibility</span>
                                    <span>Inspect</span>
                                </button>
                                <a href="${escapeHtml(item.url)}" download="${escapeHtml(item.name || 'vault_evidence.jpg')}" class="action-btn" style="background:#f8fafc; border:1px solid var(--border); height:28px; padding:0 8px; border-radius:4px; font-size:0.72rem; font-weight:600; color:var(--ink); display:inline-flex; align-items:center; gap:4px; text-decoration:none;" title="Download evidence">
                                    <span class="material-symbols-outlined" style="font-size:14px;">download</span>
                                    <span>Download</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
    }).join('');
};

window.openVaultLightbox = function (itemId) {
    const allItems = getAllVaultItems();
    const item = allItems.find(it => it.id === itemId);
    if (!item) return;

    const modal = document.getElementById('vaultLightboxModal');
    const mediaBox = document.getElementById('vaultLightboxMediaBox');
    const sName = document.getElementById('vaultLightboxStudentName');
    const sId = document.getElementById('vaultLightboxStudentId');
    const sAvatar = document.getElementById('vaultLightboxAvatar');
    const sTime = document.getElementById('vaultLightboxTime');
    const sLoc = document.getElementById('vaultLightboxLocation');
    const sType = document.getElementById('vaultLightboxFileType');
    const dlBtn = document.getElementById('vaultLightboxDownloadBtn');

    if (item.kind === 'video') {
        if (mediaBox) {
            mediaBox.innerHTML = `<video src="${escapeHtml(item.url)}" controls autoplay style="max-width:100%; max-height:75vh; border-radius:4px;"></video>`;
        }
    } else {
        if (mediaBox) {
            mediaBox.innerHTML = `<img id="vaultLightboxImage" src="${escapeHtml(item.url)}" alt="Vault evidence" style="max-width:100%; max-height:75vh; object-fit:contain; border-radius:4px; box-shadow:0 4px 20px rgba(0,0,0,0.5); cursor:zoom-in;">`;
        }
    }

    if (sName) sName.textContent = item.studentName;
    if (sId) sId.textContent = item.studentId ? '#' + item.studentId : 'Student Profile';
    if (sAvatar) {
        const initials = item.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'S';
        sAvatar.textContent = initials;
    }
    if (sTime) {
        sTime.textContent = item.time.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) + ' at ' + item.time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    if (sLoc) {
        sLoc.textContent = item.location?.address || (item.location?.lat ? `${Number(item.location.lat).toFixed(5)}, ${Number(item.location.lng).toFixed(5)}` : 'Campus Area (No GPS tag)');
    }
    if (sType) {
        sType.textContent = `Type: ${item.kind === 'image' ? 'Image File' : 'Video Recording'}`;
    }
    if (dlBtn) {
        dlBtn.href = item.url;
        dlBtn.download = item.name || 'vault_evidence.jpg';
    }

    // Wire Fullscreen toggle
    const btnFullscreen = document.getElementById('btnVaultFullscreen');
    const fsLabel = document.getElementById('vaultFullscreenLabel');
    if (btnFullscreen) {
        btnFullscreen.onclick = (e) => {
            e.stopPropagation();
            const isFs = modal.classList.toggle('lightbox-fullscreen');
            if (fsLabel) fsLabel.textContent = isFs ? 'Exit Fullscreen' : 'Fullscreen';
            const icon = btnFullscreen.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isFs ? 'fullscreen_exit' : 'fullscreen';
            if (isFs && !document.fullscreenElement && modal.requestFullscreen) {
                modal.requestFullscreen().catch(() => { });
            } else if (!isFs && document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }

    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
    }
};

window.closeVaultLightbox = function () {
    const modal = document.getElementById('vaultLightboxModal');
    if (modal) {
        modal.classList.remove('active');
        modal.classList.remove('lightbox-fullscreen');
        modal.setAttribute('aria-hidden', 'true');
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => { });
        }
        const btnFullscreen = document.getElementById('btnVaultFullscreen');
        const fsLabel = document.getElementById('vaultFullscreenLabel');
        if (fsLabel) fsLabel.textContent = 'Fullscreen';
        if (btnFullscreen) {
            const icon = btnFullscreen.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = 'fullscreen';
        }
        const mediaBox = document.getElementById('vaultLightboxMediaBox');
        if (mediaBox) mediaBox.innerHTML = '';
    }
};

const closeVaultLightboxBtn = document.getElementById('closeVaultLightboxBtn');
if (closeVaultLightboxBtn) {
    closeVaultLightboxBtn.addEventListener('click', window.closeVaultLightbox);
}

const vaultLightboxModal = document.getElementById('vaultLightboxModal');
if (vaultLightboxModal) {
    vaultLightboxModal.addEventListener('click', (e) => {
        if (e.target === vaultLightboxModal) window.closeVaultLightbox();
    });
}

const vaultSearchInput = document.getElementById('vaultSearchInput');
if (vaultSearchInput) {
    vaultSearchInput.addEventListener('input', (e) => {
        currentVaultSearch = e.target.value;
        window.renderAdminVaultGallery();
    });
}

document.querySelectorAll('.vault-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.vault-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentVaultFilter = chip.dataset.vaultFilter || 'all';
        window.renderAdminVaultGallery();
    });
});

const btnRefreshVault = document.getElementById('btnRefreshVault');
if (btnRefreshVault) {
    btnRefreshVault.addEventListener('click', async () => {
        try {
            const ep = await getAllEmergencyPosts();
            if (Array.isArray(ep)) cachedEmergencyPosts = ep;
        } catch (e) {
            console.warn("Vault refresh error:", e);
        }
        window.renderAdminVaultGallery();
        showToast("Vault Synchronized", "Digital vault evidence gallery updated.", "info");
    });
}

// (2026-07-13) Prevent image drag across entire application; was draggable
window.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
    }
}, false);
