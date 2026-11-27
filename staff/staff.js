// (2026-07-13) Consolidated staff script with inline scripts; was mixed
import { Logger, UI, Permissions, Validation, Format, Storage, Network, Device } from '../js/utils.js';
import { renderEmergencyContactWidget } from '../js/emergency-contacts.js';
import { checkAuth, logout } from '../js/auth.js';
import { auth } from '../js/firebase-config.js';
// (2026-07-13) Import message deletion & admin presence helpers; was missing
import { getUserProfile, saveUserProfile, saveUserDirectoryMarker, getGADPosts, toggleLikeGADPost, logAttendance, getAttendanceHistory, logSOS, getUserSOSLogs, saveEmergencyPost, getUserEmergencyPosts, deleteEmergencyPost, updateEmergencyPostAttachments, getEmergencyPostById, toggleEmergencyPostAccess, toggleEmergencyPostGuardianAccess, sendChatMessage, subscribeToMessages, subscribeToMessagesByThread, deleteChatMessage, deleteGADMessage, markThreadMessagesSeen, subscribeToAdminPresence, subscribeToGuardianRequests, getLinksForStudent, createGuardianLinkFromStudent, respondToGuardianLink, removeGuardianLink, updateStudentLiveLocation, syncGuardianLinksForStudent, setStudentLocationSharingStatus, subscribeToAccountNotifications, markAccountNotificationRead, sendAccountNotification, subscribeToStudentLinks, sendGADMessage, subscribeToGADMessages, subscribeToCampusMapConfig, notifyGuardiansOfGeofenceEvent, attachPhotoToActiveSOS, fetchLatestCampusMapConfig, startUserPresenceHeartbeat } from '../js/db.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import '../js/install-sw.js';
// (2026-07-13) Import Messenger-style GAD popover & back button helper; was modal
import { initGadMessengerUI } from '../js/gad-messenger-ui.js';

// Extracted inline scripts from staff.html
(() => {
    // (2026-07-13) Always apply role-staff class in staff portal; was conditional
    try {
        document.documentElement.classList.add('role-staff');
        if (document.body) document.body.classList.add('role-staff');
    } catch (_) { }
    const pathname = window.location.pathname;
    const isRootUrl = (pathname === '/' || pathname === '/index.html' || pathname.endsWith('/index.html') || !pathname) &&
        !window.location.search &&
        (!window.location.hash || window.location.hash === '#' || window.location.hash === '');
    const isNativeApk = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
        window.location.protocol.startsWith('file:') ||
        window.location.protocol.startsWith('capacitor:') ||
        !!window.cordova;
    const isLoggedIn = Boolean(localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1');

    if (isNativeApk) {
        if (!isLoggedIn) {
            window.__securoAppPending = true;
            window.location.replace('../public/role-selection.html');
        }
    } else if (isRootUrl && !isLoggedIn) {
        window.__securoLandingPending = true;
        sessionStorage.setItem('securo_allow_landing', '1');
        window.location.replace('../index.html');
    }
})();

setTimeout(() => {
    const p = document.getElementById('securo-preloader-overlay');
    if (p) {
        p.classList.add('hidden');
        p.style.setProperty('display', 'none', 'important');
        if (p.parentNode) p.parentNode.removeChild(p);
    }
    document.body.removeAttribute('data-preloader-active');
}, 1200);

// (2026-07-13) Run swipe-close setup immediately if DOM ready; was DOMContentLoaded only
const initStaffSwipeToClose = () => {
    const modals = document.querySelectorAll('.status-modal, .mandatory-modal, .notif-dropdown, .profile-dropdown');

    modals.forEach(modal => {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        const innerCard = modal.querySelector('.status-card, .modal-inner, .notif-panel, .dropdown-item') || modal;

        modal.classList.add('swipe-to-close-element');
        innerCard.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';

        modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            innerCard.style.transition = 'none';
        }, { passive: true });

        modal.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            if (deltaY > 0) { // Only allow swipe down
                innerCard.style.transform = `translateY(${deltaY}px)`;
            }
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const deltaY = currentY - startY;
            innerCard.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
            if (deltaY > 100) { // Threshold for closing
                // Hide modal (simulate close)
                innerCard.style.transform = 'translateY(100vh)';
                setTimeout(() => {
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                    innerCard.style.transform = ''; // reset
                }, 200);
            } else {
                // Snap back
                innerCard.style.transform = 'translateY(0)';
            }
        });
    });

    // Add pop up animations to standard buttons and cards
    const clickableCards = document.querySelectorAll('.vault-card, .menu-item, .history-item');
    clickableCards.forEach(card => {
        card.addEventListener('mousedown', () => card.classList.add('anim-pop-up'));
        card.addEventListener('mouseup', () => card.classList.remove('anim-pop-up'));
        card.addEventListener('mouseleave', () => card.classList.remove('anim-pop-up'));

        card.addEventListener('touchstart', () => card.classList.add('anim-pop-up'), { passive: true });
        card.addEventListener('touchend', () => card.classList.remove('anim-pop-up'));
        card.addEventListener('touchcancel', () => card.classList.remove('anim-pop-up'));
    });
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStaffSwipeToClose);
else initStaffSwipeToClose();

// (2026-07-13) Handle universal back button to close modals; was exiting app
function handleUniversalBackClose() {
    const cameraOverlay = document.getElementById("cameraOverlay");
    if (cameraOverlay && (cameraOverlay.classList.contains("active") || getComputedStyle(cameraOverlay).display !== "none")) {
        closeEmergencyCameraPanel();
        return true;
    }
    const chatOverlay = document.getElementById("chatOverlay");
    if (chatOverlay && chatOverlay.classList.contains("active")) {
        closeChat();
        return true;
    }
    const gadPmModal = document.getElementById("gadPmModal");
    if (gadPmModal && gadPmModal.classList.contains("active")) {
        gadPmModal.classList.remove("active");
        return true;
    }
    const vaultOverlay = document.getElementById("vaultDetailsOverlay");
    if (vaultOverlay && vaultOverlay.classList.contains("active")) {
        const closeBtn = document.getElementById("closeDetailsBtn");
        if (closeBtn) closeBtn.click();
        else {
            const v = document.getElementById("detailsMediaWrap")?.querySelector("video");
            if (v) { v.pause(); v.src = ""; }
            vaultOverlay.classList.remove("active");
        }
        return true;
    }
    const attModal = document.getElementById("attendanceActionModal");
    if (attModal && attModal.classList.contains("active")) {
        const cancelBtn = document.getElementById("attendanceCancelBtn");
        if (cancelBtn) cancelBtn.click();
        else attModal.classList.remove("active");
        return true;
    }
    const statusModal = document.getElementById("statusModal");
    if (statusModal && statusModal.classList.contains("active")) {
        statusModal.classList.remove("active");
        return true;
    }
    const mandatoryModal = document.getElementById("mandatoryModal");
    if (mandatoryModal && mandatoryModal.classList.contains("active")) {
        mandatoryModal.classList.remove("active");
        return true;
    }
    const profileDropdown = document.getElementById("profileDropdown");
    if (profileDropdown && profileDropdown.classList.contains("active")) {
        profileDropdown.classList.remove("active");
        return true;
    }
    const notifDropdown = document.getElementById("notifDropdown");
    if (notifDropdown && notifDropdown.classList.contains("active")) {
        notifDropdown.classList.remove("active");
        return true;
    }
    const activeModal = document.querySelector(".modal.active, .overlay.active, .status-modal.active, [role='dialog'].active");
    if (activeModal && activeModal !== document.body) {
        const modalClose = activeModal.querySelector(".btn-close, .modal-close, [data-dismiss], .close-btn");
        if (modalClose) modalClose.click();
        else activeModal.classList.remove("active");
        return true;
    }
    if (typeof appState !== "undefined" && appState.currentPage && appState.currentPage !== "map") {
        if (typeof setActiveView === "function") {
            setActiveView("map");
            return true;
        }
    }
    return false;
}

try {
    const AppPlugin = window.Capacitor?.Plugins?.App;
    if (AppPlugin?.addListener) {
        AppPlugin.addListener('backButton', ({ canGoBack }) => {
            const handled = handleUniversalBackClose();
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
    if (e.key === 'Escape') handleUniversalBackClose();
});
// (2026-07-13) Lock browser Back button while logged in; was leaving portal
try {
    sessionStorage.removeItem('securo_login_pending');
    sessionStorage.removeItem('securo_just_registered');
    window.history.replaceState({ securoLocked: true }, '', window.location.href);
    window.history.pushState({ securoLocked: true }, '', window.location.href);
} catch (_) { }
window.addEventListener('popstate', () => {
    handleUniversalBackClose();
    if (auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1') {
        try { window.history.pushState({ securoLocked: true }, '', window.location.href); } catch (_) { }
    }
});
window.addEventListener('pageshow', (e) => {
    if (e.persisted && (auth?.currentUser || localStorage.getItem('securo_session_token') || sessionStorage.getItem('securo_authenticated') === '1')) {
        try { window.history.pushState({ securoLocked: true }, '', window.location.href); } catch (_) { }
    }
});

// (2026-07-13) Staff portal initialization with staff theme; was student role
window.__SECURO_FORCED_ROLE = 'staff';
// (2026-07-13) Extracted unified student script; was inline module
// Core utilities and offline support
// (2026-07-13) Fix install-sw path to js/ folder; was broken root path










const ADMIN_EMAIL = 'zearamil9@gmail.com';

// --- INTERACTIVE MAP & WEATHER LOGIC (Date: 2026-05-02) ---
let map;
let userMarker;
let userLocationRing;
// (2026-07-13) Declare mapResizeObserver in scope; was missing declaration
let mapResizeObserver = null;
let campusGeofencePolygonLayer = null;
// (2026-07-13) Center campus view on main school buildings; was offset south on track
const CAMPUS_CENTER = [11.26705, 124.00875];
// (2026-07-13) Set exact 6-point geofence matching adminGeofenceModalMap; was 5-point draft
const DEFAULT_CAMPUS_GEOFENCE_POLYGON = [
    [11.26805, 124.00780],
    [11.26820, 124.00902],
    [11.26760, 124.00900],
    [11.26755, 124.00965],
    [11.26522, 124.00930],
    [11.26538, 124.00755]
];

let activeCampusGeofencePolygon = null;

// (2026-07-13) Retrieve latest saved admin geofence polygon; was returning stale cache
function getCampusGeofencePolygon() {
    try {
        const stored = localStorage.getItem('securo_custom_geofence');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length >= 3) {
                activeCampusGeofencePolygon = parsed;
                return parsed;
            }
        }
    } catch (e) { }
    if (activeCampusGeofencePolygon && Array.isArray(activeCampusGeofencePolygon) && activeCampusGeofencePolygon.length >= 3) {
        return activeCampusGeofencePolygon;
    }
    return DEFAULT_CAMPUS_GEOFENCE_POLYGON;
}

// (2026-07-13) Complete facility descriptions lookup dictionary; was missing in admin sync
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

function getActiveCampusBuildings() {
    try {
        const stored = localStorage.getItem('securo_campus_buildings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map(b => ({
                    ...b,
                    desc: b.desc || CAMPUS_BUILDING_DESCRIPTIONS[b.name] || 'CTU Daanbantayan Campus facility'
                }));
            }
        }
    } catch (e) { }
    return DEFAULT_CAMPUS_BUILDINGS.map(b => ({ ...b, coords: [...b.coords] }));
}

// (2026-08-17) Mirror admin state vars exactly; was student-specific names
let currentStudentGeofence = getActiveCampusBuildings() ? getCampusGeofencePolygon() : getCampusGeofencePolygon();
let currentStudentBuildings = getActiveCampusBuildings();
let CAMPUS_BUILDINGS = currentStudentBuildings;

let buildingMarkerMap = new Map();
let campusMarkersLayerGroup = null;
let areCampusMarkersVisible = true;
// (2026-08-17) Queue Firestore config arriving before map opens; was discarded
let pendingMapConfig = null;

// (2026-07-13) Clean icon-only markers with hover/tap details; was wide text cards
function renderStudentCampusMarkers() {
    if (!map || !campusMarkersLayerGroup) return;
    campusMarkersLayerGroup.clearLayers();
    buildingMarkerMap.clear();

    // (2026-07-13) Restore purple markers & dotted geofence for student; was red
    currentStudentBuildings.forEach(b => {
        const bIcon = L.divIcon({
            className: 'campus-facility-icon-marker',
            // (2026-07-13) Blue theme for staff map building markers; was purple
            html: `<div style="background:white; border-radius:50%; width:30px; height:30px; box-shadow:0 3px 10px rgba(24,20,40,0.16); border:2px solid #2563eb; display:flex; align-items:center; justify-content:center; cursor:pointer;"><span class="material-symbols-outlined" style="font-size:16px; color:#2563eb;">${b.icon || 'location_on'}</span></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        // (2026-07-13) Single clean popup on tap/hover; was duplicate tooltip + popup
        const marker = L.marker(b.coords, { icon: bIcon }).addTo(campusMarkersLayerGroup);
        buildingMarkerMap.set(b.name.toLowerCase(), marker);

        const bDesc = b.desc || CAMPUS_BUILDING_DESCRIPTIONS[b.name] || 'CTU Daanbantayan Campus facility';
        // (2026-07-13) Set -20px offset to keep marker icon visible; was -10px
        marker.bindPopup(`
                    <div style="padding:4px 2px; min-width:160px;">
                        <strong style="display:flex; align-items:center; gap:6px; font-size:0.9rem; color:#181428;">
                            <!-- (2026-07-13) Blue staff map popup icon; was purple -->
                            <span class="material-symbols-outlined" style="font-size:18px; color:#2563eb;">${b.icon || 'location_on'}</span>
                            ${b.name}
                        </strong>
                        <p style="margin:6px 0 0; font-size:0.78rem; color:#64748b; line-height:1.4;">${bDesc}</p>
                    </div>
                `, { offset: [0, -20] });
    });
}

// (2026-08-17) Apply config immediately if map ready, else queue; was discarding early data
function syncMapGeofenceAndMarkers(config = {}) {
    if (!map) {
        pendingMapConfig = config;
        return;
    }
    let geofence = config?.geofence;
    let buildings = config?.buildings;
    if (typeof geofence === 'string') {
        try { geofence = JSON.parse(geofence); } catch (e) { }
    }
    if (typeof buildings === 'string') {
        try { buildings = JSON.parse(buildings); } catch (e) { }
    }

    if (Array.isArray(geofence) && geofence.length >= 3) {
        currentStudentGeofence = geofence.map(pt => [Number(pt[0] ?? pt.lat), Number(pt[1] ?? pt.lng)]);
        activeCampusGeofencePolygon = currentStudentGeofence;
    } else {
        currentStudentGeofence = getCampusGeofencePolygon();
    }

    // (2026-07-13) Remove and re-add polygon layer to guarantee instant redraw; was setLatLngs cache
    if (map) {
        if (campusGeofencePolygonLayer) {
            map.removeLayer(campusGeofencePolygonLayer);
        }
        // (2026-07-13) Purple dotted geofence for student view; was red dashed
        // (2026-07-13) Blue geofence polygon for staff map; was purple
        campusGeofencePolygonLayer = L.polygon(currentStudentGeofence, {
            color: '#2563eb',
            weight: 3,
            dashArray: '3, 6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08
        }).addTo(map);
    }

    if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
        checkCampusGeofence(appState.lastLocation.lat, appState.lastLocation.lng);
    }

    if (Array.isArray(buildings) && buildings.length > 0) {
        currentStudentBuildings = buildings.map(b => ({
            ...b,
            coords: [Number(b.coords?.[0] ?? b.lat ?? b.coords?.lat), Number(b.coords?.[1] ?? b.lng ?? b.coords?.lng)]
        }));
        CAMPUS_BUILDINGS = currentStudentBuildings;
    } else {
        currentStudentBuildings = getActiveCampusBuildings();
        CAMPUS_BUILDINGS = currentStudentBuildings;
    }
    if (campusMarkersLayerGroup) renderStudentCampusMarkers();
}

// (2026-08-17) Subscribe; pending config applied at initInteractiveMap time; was lost
subscribeToCampusMapConfig((config) => {
    syncMapGeofenceAndMarkers(config);
});

// (2026-07-13) Multi-channel broadcast & heartbeat sync; was snapshot only
if (typeof BroadcastChannel !== 'undefined') {
    try {
        const studentMapChannel = new BroadcastChannel('securo_campus_map_channel');
        studentMapChannel.addEventListener('message', (e) => {
            if (e.data) syncMapGeofenceAndMarkers(e.data);
        });
    } catch (e) { }
}

// (2026-07-13) Check both geofence and building marker diffs; was geofence only
setInterval(() => {
    try {
        const storedG = localStorage.getItem("securo_custom_geofence");
        const storedB = localStorage.getItem("securo_campus_buildings");
        if (storedG || storedB) {
            const g = storedG ? JSON.parse(storedG) : null;
            const b = storedB ? JSON.parse(storedB) : null;
            let changed = false;
            if (g && Array.isArray(g) && JSON.stringify(g) !== JSON.stringify(currentStudentGeofence)) {
                changed = true;
            }
            if (b && Array.isArray(b) && JSON.stringify(b) !== JSON.stringify(currentStudentBuildings)) {
                changed = true;
            }
            if (changed) {
                syncMapGeofenceAndMarkers({ geofence: g || currentStudentGeofence, buildings: b || currentStudentBuildings });
            }
        }
    } catch (e) { }
}, 400);

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

// (2026-07-13) Fast location permission check; was blocking on every click
async function ensureCapacitorLocationPermission() {
    if (appState.lastLocation?.lat && !appState.locationPermissionDenied) {
        return true;
    }
    try {
        if (window.Capacitor?.isNativePlatform?.()) {
            const Geolocation = window.Capacitor.Plugins?.Geolocation || window.Capacitor?.Geolocation;
            if (Geolocation) {
                if (typeof Geolocation.checkPermissions === 'function') {
                    const check = await Geolocation.checkPermissions().catch(() => null);
                    if (check?.location === 'granted' || check?.coarseLocation === 'granted') {
                        appState.locationPermissionDenied = false;
                        startTracking();
                        updateTrackingStatusBanner();
                        return true;
                    }
                }
                if (typeof Geolocation.requestPermissions === 'function') {
                    const perm = await Geolocation.requestPermissions().catch(() => null);
                    const isOk = (perm?.location === 'granted' || perm?.coarseLocation === 'granted');
                    appState.locationPermissionDenied = !isOk;
                    if (isOk) startTracking();
                    updateTrackingStatusBanner();
                    return isOk;
                }
            }
        }
        if (navigator.geolocation) {
            return await new Promise((resolve) => {
                const t = setTimeout(() => resolve(true), 1500);
                navigator.geolocation.getCurrentPosition(
                    () => {
                        clearTimeout(t);
                        appState.locationPermissionDenied = false;
                        startTracking();
                        updateTrackingStatusBanner();
                        resolve(true);
                    },
                    () => {
                        clearTimeout(t);
                        resolve(true);
                    },
                    { timeout: 1500, maximumAge: 60000, enableHighAccuracy: false }
                );
            });
        }
    } catch (e) {
        Logger.warn("Permissions", "Capacitor location permission error", e);
    }
    return true;
}

// (2026-07-13) Add haptics & vibration for SOS alerts; was absent
async function triggerDeviceVibration(duration = 1000) {
    try {
        if (window.Capacitor?.Plugins?.Haptics) {
            await window.Capacitor.Plugins.Haptics.vibrate({ duration: typeof duration === 'number' ? duration : 1000 }).catch(() => { });
            return;
        }
    } catch (e) {
        console.warn("Capacitor haptics error:", e);
    }
    try {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    } catch (e) { }
}

// (2026-07-13) Support Securo logo and priorities in push notifications; was basic
async function triggerDevicePushNotification(title, body, options = {}) {
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
        console.warn("Capacitor local notification failed:", e);
    }

    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            try { new Notification(title, { body, icon: "../assets/images/logo.png", badge: "../assets/images/logo.png" }); } catch (e) { }
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(perm => {
                if (perm === "granted") {
                    try { new Notification(title, { body, icon: "../assets/images/logo.png", badge: "../assets/images/logo.png" }); } catch (e) { }
                }
            });
        }
    }
}

let _autoAttendanceBusy = false;
let _lastAutoAttendanceTime = 0;

// (2026-07-13) Auto time out only when exiting campus; was auto timing in
async function processAutoAttendance(type, lat, lng) {
    if (type !== 'out') return;
    if (!appState.user?.uid || _autoAttendanceBusy) return;
    if (!appState.isTimedIn) return;
    if (Date.now() - _lastAutoAttendanceTime < 15000) return;

    const recent = _fullAttendanceHistory?.[0];
    if (recent && recent.type === 'out') {
        const ts = getAttendanceLogDate(recent).getTime();
        if (Date.now() - ts < 30000) return;
    }

    _autoAttendanceBusy = true;
    _lastAutoAttendanceTime = Date.now();

    try {
        const capturedAt = new Date();
        const landmark = typeof getNearestLandmark === 'function' ? getNearestLandmark(lat, lng) : '';
        const location = {
            lat,
            lng,
            address: landmark || 'Outside Campus Bounds',
            isInside: false,
            auto: true
        };

        queueAttendanceLog(appState.user.uid, {
            localId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type: 'out',
            location,
            clientTimestamp: capturedAt.toISOString(),
            auto: true
        });

        const updatedHistory = getMergedAttendanceHistory(_fullAttendanceHistory, appState.user.uid);
        setAttendanceState(false);
        renderAttendanceHistory(updatedHistory);
        calculateStats(updatedHistory);
        updateAttendanceSummary(updatedHistory);
        syncPendingAttendanceLogs().catch((e) => console.warn("Auto attendance sync failed:", e));
        updateStudentLiveLocation(appState.user.uid, { lat, lng, isInside: false }).catch(() => { });
        notifyGuardiansOfGeofenceEvent(appState.user.uid, appState.user.name || appState.user.displayName || 'Student', 'out', location).catch(() => { });

        triggerDevicePushNotification("Campus Exit", "You've exited the campus, automatically timed out.");

        if (typeof showToast === 'function') {
            showToast("Auto Timed Out: Left campus bounds");
        }
    } catch (err) {
        Logger.warn("Attendance", "Auto attendance failed", err);
    } finally {
        _autoAttendanceBusy = false;
    }
}

function getSpecificUserLatestAttendanceLog(preferredType) {
    const history = Array.isArray(_fullAttendanceHistory) ? _fullAttendanceHistory : [];
    if (!history.length) return null;
    if (preferredType) {
        const found = history.find(log => log.type === preferredType);
        if (found) return found;
    }
    return history[0];
}

// (2026-07-13) Detect user-specific recent attendance logs; was unscoped storage
function checkCampusGeofence(lat, lng) {
    const isInside = isPointInPolygon([lat, lng], getCampusGeofencePolygon());
    const userKey = appState.user?.uid || 'guest';
    const userExitKey = `securo_campus_exit_ts_${userKey}`;
    const userEntryKey = `securo_campus_entry_ts_${userKey}`;
    try {
        localStorage.removeItem("securo_campus_exit_ts");
        localStorage.removeItem("securo_campus_entry_ts");
    } catch (e) { }

    const recentInLog = getSpecificUserLatestAttendanceLog('in');
    const recentOutLog = getSpecificUserLatestAttendanceLog('out');
    const recentInTs = recentInLog ? getAttendanceLogDate(recentInLog).getTime() : null;
    const recentOutTs = recentOutLog ? getAttendanceLogDate(recentOutLog).getTime() : null;

    // (2026-07-13) Guard geofence timestamps against fake times; prev: Date.now()
    if (isInside) {
        try { localStorage.removeItem(userExitKey); } catch (e) { }
        const storedEntry = localStorage.getItem(userEntryKey);
        const entryTs = appState.campusEntryTs || recentInTs || (storedEntry ? parseInt(storedEntry, 10) : null);
        if (entryTs) {
            try { localStorage.setItem(userEntryKey, String(entryTs)); } catch (e) { }
        }
        appState.isInsideCampus = true;
        appState.campusEntryTs = entryTs;
        appState.campusExitTs = null;
        appState.campusExitDuration = "";
    } else {
        try { localStorage.removeItem(userEntryKey); } catch (e) { }
        appState.isInsideCampus = false;
        const storedExit = localStorage.getItem(userExitKey);
        const exitTs = appState.campusExitTs || recentOutTs || (storedExit ? parseInt(storedExit, 10) : null);
        if (exitTs) {
            try { localStorage.setItem(userExitKey, String(exitTs)); } catch (e) { }
        }
        appState.campusExitTs = exitTs;
        appState.campusEntryTs = null;
        if (appState.isTimedIn) {
            processAutoAttendance('out', lat, lng);
        }
    }
    updateTrackingStatusBanner();
}

function safeInvalidateMap(retries = 8) {
    if (!map) return;
    const container = document.getElementById('map');
    if (!container || container.clientHeight === 0) return;

    map.invalidateSize();
    if (retries > 0) {
        setTimeout(() => safeInvalidateMap(retries - 1), 100);
    }
}

let _isInitializingMap = false;
// (2026-07-13) Guard map init race & clean container; was unhandled re-init
async function initInteractiveMap() {
    if (map) {
        // (2026-08-17) Re-fetch from Firestore on every tab open; was localStorage only
        const config = await fetchLatestCampusMapConfig();
        syncMapGeofenceAndMarkers(config || {});
        requestAnimationFrame(() => { if (map) map.invalidateSize(); });
        return;
    }
    if (_isInitializingMap) return;
    _isInitializingMap = true;
    try {

        // Fetch exact admin geofence + buildings BEFORE drawing anything
        const firestoreConfig = await fetchLatestCampusMapConfig();

        // (2026-08-17) Robust normalization of Firestore config; was raw assignment
        if (firestoreConfig?.geofence) {
            let g = firestoreConfig.geofence;
            if (typeof g === 'string') { try { g = JSON.parse(g); } catch (e) { } }
            if (Array.isArray(g) && g.length >= 3) {
                currentStudentGeofence = g.map(pt => [Number(pt[0] ?? pt.lat), Number(pt[1] ?? pt.lng)]);
                activeCampusGeofencePolygon = currentStudentGeofence;
            } else {
                currentStudentGeofence = getCampusGeofencePolygon();
            }
        } else {
            currentStudentGeofence = getCampusGeofencePolygon();
        }

        if (firestoreConfig?.buildings) {
            let b = firestoreConfig.buildings;
            if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { } }
            if (Array.isArray(b) && b.length > 0) {
                currentStudentBuildings = b.map(item => ({
                    ...item,
                    coords: [Number(item.coords?.[0] ?? item.lat ?? item.coords?.lat), Number(item.coords?.[1] ?? item.lng ?? item.coords?.lng)]
                }));
                CAMPUS_BUILDINGS = currentStudentBuildings;
            } else {
                currentStudentBuildings = getActiveCampusBuildings();
                CAMPUS_BUILDINGS = currentStudentBuildings;
            }
        } else {
            currentStudentBuildings = getActiveCampusBuildings();
            CAMPUS_BUILDINGS = currentStudentBuildings;
        }

        if (map) {
            syncMapGeofenceAndMarkers(firestoreConfig || {});
            requestAnimationFrame(() => { if (map) map.invalidateSize(); });
            return;
        }

        // (2026-07-13) Use targetMapEl for container; was duplicate mapContainer
        const targetMapEl = document.getElementById('map');
        if (!targetMapEl) return;
        if (targetMapEl._leaflet_id) {
            targetMapEl._leaflet_id = null;
        }

        // Same L.map options as adminSosMap
        map = L.map('map', {
            zoomControl: false,
            attributionControl: false,
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

        let activeLayer = baseMapLayers["Streets"];
        activeLayer.addTo(map);

        // Force tile load after layer is added
        setTimeout(() => { if (map) map.invalidateSize(); }, 100);
        setTimeout(() => { if (map) map.invalidateSize(); }, 500);

        // (2026-07-13) Purple dotted geofence for student view; was red dashed
        // (2026-07-13) Blue geofence polygon for staff map; was purple
        campusGeofencePolygonLayer = L.polygon(currentStudentGeofence, {
            color: '#2563eb',
            weight: 3,
            dashArray: '3, 6',
            fillColor: '#3b82f6',
            fillOpacity: 0.08
        }).addTo(map);

        // Draw building markers with exact admin-saved positions
        campusMarkersLayerGroup = L.layerGroup().addTo(map);
        renderStudentCampusMarkers();

        // Apply any subscription data that beat the fetch
        if (pendingMapConfig) {
            const cfg = pendingMapConfig;
            pendingMapConfig = null;
            syncMapGeofenceAndMarkers(cfg);
        }

        const mapContainer = document.getElementById('map');
        if (mapContainer && !mapResizeObserver && 'ResizeObserver' in window) {
            mapResizeObserver = new ResizeObserver(() => {
                if (map) requestAnimationFrame(() => safeInvalidateMap());
            });
            mapResizeObserver.observe(mapContainer);
        }

        // (2026-07-13) Repeatedly prompt location on map move; was silent bypass
        let lastLocationPromptTs = 0;
        const checkMapMovementLocation = async () => {
            const now = Date.now();
            if (now - lastLocationPromptTs < 2500) return; // Debounce rapid drag events
            lastLocationPromptTs = now;

            let isGranted = false;
            try {
                if (window.Capacitor?.isNativePlatform?.()) {
                    const CapGeo = window.Capacitor.Plugins?.Geolocation || window.Capacitor?.Geolocation;
                    if (CapGeo && typeof CapGeo.checkPermissions === 'function') {
                        const p = await CapGeo.checkPermissions().catch(() => null);
                        isGranted = (p?.location === 'granted' || p?.coarseLocation === 'granted');
                    }
                } else if (navigator.permissions && navigator.permissions.query) {
                    const p = await navigator.permissions.query({ name: 'geolocation' }).catch(() => null);
                    isGranted = (p?.state === 'granted');
                }
            } catch (e) { }

            if (!isGranted) {
                appState.isLocationTrackingActive = false;
                appState.locationPermissionDenied = true;
                updateTrackingStatusBanner();
                const promptResult = await ensureCapacitorLocationPermission();
                if (!promptResult) {
                    showStatus("Turn On Location", "Location access is turned off. Please enable location permissions in settings.", "error");
                }
            } else if (!appState.trackingId) {
                startTracking();
            }
        };

        map.on('movestart', checkMapMovementLocation);
        map.on('dragstart', checkMapMovementLocation);

        document.getElementById('map-zoom-in').onclick = () => map.zoomIn(0.5);
        document.getElementById('map-zoom-out').onclick = () => map.zoomOut(0.5);
        const recenterBtn = document.getElementById('map-recenter-campus');
        if (recenterBtn) {
            recenterBtn.onclick = () => {
                if (map) map.flyTo(CAMPUS_CENTER, 17, { duration: 1.2 });
            };
        }
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

                // Faster layer switching - remove and add immediately
                if (map.hasLayer(prevLayer)) {
                    map.removeLayer(prevLayer);
                }
                nextLayer.addTo(map);

                // Force immediate tile load
                map.invalidateSize(false);

                // Update active layer reference
                activeLayer = nextLayer;

                // Show quick toast notification
                if (typeof showToast === 'function') {
                    showToast(`${nextKey}`, '', 'success');
                }
            };
        }
        const toggleMarkersBtn = document.getElementById('map-toggle-markers');
        if (toggleMarkersBtn) {
            toggleMarkersBtn.onclick = () => {
                areCampusMarkersVisible = !areCampusMarkersVisible;
                if (campusMarkersLayerGroup) {
                    if (areCampusMarkersVisible) {
                        if (!map.hasLayer(campusMarkersLayerGroup)) map.addLayer(campusMarkersLayerGroup);
                        toggleMarkersBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
                        toggleMarkersBtn.title = 'Hide Campus Markers';
                        toggleMarkersBtn.style.opacity = '1';
                    } else {
                        if (map.hasLayer(campusMarkersLayerGroup)) map.removeLayer(campusMarkersLayerGroup);
                        toggleMarkersBtn.innerHTML = '<span class="material-symbols-outlined">visibility_off</span>';
                        toggleMarkersBtn.title = 'Show Campus Markers';
                        toggleMarkersBtn.style.opacity = '0.75';
                    }
                }
            };
        }
        document.getElementById('map-locate').onclick = () => locateUser();

        if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
            updateOwnLocationHighlight([appState.lastLocation.lat, appState.lastLocation.lng], false);
        }

        setupCampusSearch();
    } finally {
        _isInitializingMap = false;
    }
}

// (2026-07-13) Use live marker position for search focus; was stale building.coords
function focusBuilding(building) {
    if (!map || !building) return;
    if (campusMarkersLayerGroup && !map.hasLayer(campusMarkersLayerGroup)) {
        map.addLayer(campusMarkersLayerGroup);
        areCampusMarkersVisible = true;
        const toggleMarkersBtn = document.getElementById('map-toggle-markers');
        if (toggleMarkersBtn) {
            toggleMarkersBtn.innerHTML = '<span class="material-symbols-outlined">visibility</span>';
            toggleMarkersBtn.title = 'Hide Campus Markers';
            toggleMarkersBtn.style.opacity = '1';
        }
    }
    const marker = buildingMarkerMap.get(building.name.toLowerCase());
    const targetPos = marker ? marker.getLatLng() : building.coords;
    map.flyTo(targetPos, 18, { duration: 1.2 });
    if (marker) {
        const el = marker.getElement();
        if (el) {
            el.classList.add('highlight-marker');
            setTimeout(() => el.classList.remove('highlight-marker'), 3000);
        }
        marker.openPopup();
    }
}

function setupCampusSearch() {
    const searchInput = document.getElementById('mapSearchInput');
    if (!searchInput) return;

    let dropdown = document.getElementById('mapSearchDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'mapSearchDropdown';
        // (2026-07-13) Set compact dropdown width & single-line ellipsis; was wrapping tall
        dropdown.style.cssText = 'position:absolute; top:calc(100% + 6px); left:0; width:min(280px, 80vw); background:white; border-radius:14px; box-shadow:0 12px 28px rgba(0,0,0,0.15); max-height:240px; overflow-y:auto; z-index:1001; display:none; border:1px solid #e2e8f0;';
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(dropdown);
    }

    // (2026-07-13) Full building description in dropdown; was b.desc.slice() without fallback
    const renderResults = (query = "") => {
        const q = query.trim().toLowerCase();
        const matches = q
            ? CAMPUS_BUILDINGS.filter(b => {
                const d = b.desc || CAMPUS_BUILDING_DESCRIPTIONS[b.name] || "";
                return b.name.toLowerCase().includes(q) || d.toLowerCase().includes(q);
            })
            : CAMPUS_BUILDINGS;

        if (!matches.length) {
            dropdown.innerHTML = '<div style="padding:12px; font-size:0.8rem; color:var(--muted); text-align:center;">No campus building found</div>';
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = matches.map(b => {
            const descText = b.desc || CAMPUS_BUILDING_DESCRIPTIONS[b.name] || 'CTU Daanbantayan Campus facility';
            return `
                    <div class="search-match-item" data-building="${b.name}" style="padding:8px 12px; display:flex; align-items:center; gap:10px; cursor:pointer; border-bottom:1px solid #f1f5f9; transition:background 0.15s;">
                        <span class="material-symbols-outlined" style="color:var(--primary); font-size:20px; flex-shrink:0;">${b.icon || 'location_on'}</span>
                        <div style="min-width:0; flex:1;">
                            <strong style="font-size:0.82rem; display:block; color:var(--ink); line-height:1.2; margin-bottom:2px;">${b.name}</strong>
                            <span style="font-size:0.7rem; color:var(--muted); line-height:1.2; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${descText}</span>
                        </div>
                    </div>
                `;
        }).join('');
        dropdown.style.display = 'block';
    };

    searchInput.addEventListener('focus', () => renderResults(searchInput.value));
    searchInput.addEventListener('input', (e) => renderResults(e.target.value));

    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.search-match-item');
        if (!item) return;
        const bName = item.dataset.building;
        const building = CAMPUS_BUILDINGS.find(b => b.name === bName);
        if (building) {
            searchInput.value = building.name;
            dropdown.style.display = 'none';
            focusBuilding(building);
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.parentElement.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

window.mapQuickAction = function (type) {
    if (!map) return;
    const locations = {
        'parking': { coords: [11.2660, 124.0080], label: 'Main Parking' },
        'clinic': { coords: [11.2666, 124.0090], label: 'University Clinic' },
        'wifi': { coords: [11.2670, 124.0093], label: 'IT Center (WiFi Hotspot)' }
    };

    const loc = locations[type];
    if (loc) {
        map.flyTo(loc.coords, 18, { duration: 2 });
        L.popup()
            .setLatLng(loc.coords)
            .setContent(`<div class="popup-card"><strong>${loc.label}</strong></div>`)
            .openOn(map);
    }
};

// (2026-07-13) Fast locateUser with instant cached GPS center and quick refresh; was slow cold GPS
function locateUser() {
    const locateBtn = document.getElementById("map-locate");
    if (locateBtn) locateBtn.style.transform = "scale(0.92)";
    setTimeout(() => { if (locateBtn) locateBtn.style.transform = ""; }, 200);

    if (userMarker) {
        map.flyTo(userMarker.getLatLng(), 18, { duration: 0.6 });
    } else if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
        const cached = [appState.lastLocation.lat, appState.lastLocation.lng];
        updateOwnLocationHighlight(cached, true);
        map.flyTo(cached, 18, { duration: 0.6 });
    }

    if (!navigator.geolocation) {
        showStatus("Location Error", "Geolocation is not supported by your browser.", "error");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const latlng = [pos.coords.latitude, pos.coords.longitude];
            appState.lastLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            updateOwnLocationHighlight(latlng, true);
            map.flyTo(latlng, 18, { duration: 0.6 });
            if (appState.user?.uid) {
                updateStudentLiveLocation(appState.user.uid, { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => { });
            }
        },
        () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const latlng = [pos.coords.latitude, pos.coords.longitude];
                    appState.lastLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    updateOwnLocationHighlight(latlng, true);
                    map.flyTo(latlng, 18, { duration: 0.6 });
                    if (appState.user?.uid) {
                        updateStudentLiveLocation(appState.user.uid, { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => { });
                    }
                },
                () => {
                    if (!userMarker && !appState.lastLocation) {
                        showStatus("Location Error", "Could not detect your GPS location.", "error");
                    }
                },
                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
            );
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 30000 }
    );
}

// (2026-07-13) Add shareLiveLocation & sync GPS; was local map centering only
async function shareLiveLocation(isInteractive = true) {
    await ensureCapacitorLocationPermission();
    startTracking();
    if (!navigator.geolocation) {
        if (isInteractive) showStatus("Location Unavailable", "Geolocation is not supported on this device.", "error");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            appState.lastLocation = { lat, lng };
            updateOwnLocationHighlight([lat, lng], true);
            if (appState.user?.uid) {
                await updateStudentLiveLocation(appState.user.uid, { lat, lng }).catch(() => { });
            }
            updateTrackingStatusBanner();
            if (isInteractive) {
                showStatus("Live Location Shared", "Your current location has been shared with your linked guardians.");
            }
        },
        (err) => {
            console.warn("Share location GPS error:", err);
            if (isInteractive) {
                showStatus("GPS Signal Weak", "Could not capture accurate GPS coordinates. Please ensure device location is enabled.", "error");
            }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
}

document.getElementById('map-share-location')?.addEventListener('click', () => shareLiveLocation(true));
document.getElementById('trackingStatusBanner')?.addEventListener('click', () => shareLiveLocation(true));

// (2026-07-13) Connect geofence check to location highlight; was basic marker update
function updateOwnLocationHighlight(latlng, centerMap = false) {
    if (!map || !Array.isArray(latlng) || latlng.length < 2) return;

    checkCampusGeofence(latlng[0], latlng[1]);

    if (!userMarker) {
        const userIcon = L.divIcon({
            className: 'user-marker',
            // (2026-07-13) Blue user location marker for staff map; was purple
            html: '<div class="secure-indicator" style="width: 20px; height: 20px; background: #2563eb; box-shadow: 0 0 0 10px rgba(37, 99, 235, 0.22); animation: pulse-voice 2s infinite;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        userMarker = L.marker(latlng, { icon: userIcon }).addTo(map);
    } else {
        userMarker.setLatLng(latlng);
    }

    if (!userLocationRing) {
        // (2026-07-13) Blue user accuracy ring for staff map; was purple
        userLocationRing = L.circle(latlng, {
            radius: 18,
            color: '#2563eb',
            weight: 1,
            fillColor: '#3b82f6',
            fillOpacity: 0.16
        }).addTo(map);
    } else {
        userLocationRing.setLatLng(latlng);
    }

    if (centerMap) {
        map.flyTo(latlng, Math.max(map.getZoom(), 18), { duration: 1.2 });
    }
}

async function fetchWeather() {
    const widget = document.getElementById('weather-widget');
    const API_KEY = '8e8609506692985392e624c96e1919d1'; // Public/Sample key for demo
    const city = 'Daanbantayan';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},ph&units=metric&appid=${API_KEY}`);
        if (!response.ok) throw new Error('Weather fetch failed');
        const data = await response.json();

        const temp = Math.round(data.main.temp);
        const condition = data.weather[0].description;
        const iconCode = data.weather[0].icon;

        // Map weather conditions to Material symbols
        let materialIcon = 'cloud';
        if (condition.includes('clear')) materialIcon = 'sunny';
        if (condition.includes('rain')) materialIcon = 'rainy';
        if (condition.includes('thunderstorm')) materialIcon = 'thunderstorm';

        // (2026-07-13) Fix degree symbol mojibake in weather widget; was corrupted
        widget.innerHTML = `
                    <span class="material-symbols-outlined weather-icon">${materialIcon}</span>
                    <div class="weather-info">
                        <span class="weather-temp">${temp}\u00B0C</span>
                        <span class="weather-condition">${condition}</span>
                    </div>
                `;
    } catch (error) {
        console.warn("Weather error:", error);
        widget.innerHTML = `
                    <span class="material-symbols-outlined weather-icon">cloud_off</span>
                    <div class="weather-info">
                        <span class="weather-temp">--\u00B0C</span>
                        <span class="weather-condition">Daanbantayan</span>
                    </div>
                `;
    }
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

// Global Auth Check (Date: 2026-05-01 - Separate Login Page)

checkAuth();

const appState = {
    user: {
        uid: "",
        name: "Jordan Dela Cruz",
        initials: "JD",
        studentId: "",
        role: "student"
    },
    currentPage: null, // Start null so the first setActiveView always executes
    sosTriggered: false,
    isTimedIn: false,
    acceptedGuardianCount: 0,
    isLocationTrackingActive: false,
    locationPermissionDenied: false,
    trackingId: null,
    lastLocation: null,
    contextMenuTarget: null,
    initialViewDone: false,
    accountNotifications: [],
    pendingGuardianRequests: [],
    guardianLinkReminders: [],
    vaultSelectionMode: false
};

// (2026-07-13) Show parent bar for students on map; was invalid activeView check
function applyRoleTheme(role) {
    const isStaff = role === 'staff';
    document.documentElement.classList.toggle('role-staff', isStaff);
    document.body.classList.toggle('role-staff', isStaff);
    const parentBar = document.getElementById('studentParentBar');
    if (parentBar) {
        const currentView = appState.currentPage || 'map';
        parentBar.style.display = isStaff ? 'none' : (currentView === 'map' ? 'flex' : 'none');
    }
}
try {
    const savedRole = localStorage.getItem('securo_user_role');
    if (savedRole === 'staff') applyRoleTheme('staff');
} catch (_) { }


// [REMOVED] loginView, loginForm, studentIdInput, passwordInput, loginMessage, togglePassword, biometricLogin (Date: 2026-05-01)
const appView = document.getElementById("appView");

const profileChip = document.getElementById("profileChip");
const headerTitle = document.getElementById("headerTitle");
const headerActionIcon = document.getElementById("headerActionIcon");
const headerLeadingIcon = document.getElementById("headerLeadingIcon");
const screenContent = document.getElementById("screenContent");
const vaultGrid = document.getElementById("vaultGrid");
const vaultTotalEvidence = document.getElementById("vaultTotalEvidence");
const vaultSelectionToolbar = document.getElementById("vaultSelectionToolbar");
const vaultSelectionCount = document.getElementById("vaultSelectionCount");
const cancelVaultSelectionBtn = document.getElementById("cancelVaultSelectionBtn");
const selectAllVaultBtn = document.getElementById("selectAllVaultBtn");
const deleteSelectedVaultBtn = document.getElementById("deleteSelectedVaultBtn");
const navButtons = Array.from(document.querySelectorAll("[data-nav]"));
const pages = Array.from(document.querySelectorAll(".page"));
const floatingNavButtons = Array.from(document.querySelectorAll("[data-nav-target]"));
const sosButton = document.getElementById("sosButton");
const sosRing = document.getElementById("sosRing");
const sosCaption = document.getElementById("sosCaption");
const dispatchState = document.getElementById("dispatchState");
const sosStage = document.querySelector(".sos-stage");
const sosPage = document.getElementById("page-sos");
const globalSosFab = document.getElementById("globalSosFab");
const bottomNav = document.querySelector(".bottom-nav");
const cameraOverlay = document.getElementById("cameraOverlay");
const closeCameraOverlay = document.getElementById("closeCameraOverlay");
const cameraPreview = document.getElementById("cameraPreview");
const captureCanvas = document.getElementById("captureCanvas");
const galleryInput = document.getElementById("galleryInput");
const cameraEmpty = document.getElementById("cameraEmpty");
const cameraError = document.getElementById("cameraError");
const cameraErrorText = document.getElementById("cameraErrorText");

// SOS Capture Elements (Date: 2026-05-02)
const captureAction = document.getElementById("captureAction");
const galleryUploadBtn = document.getElementById("galleryUploadBtn");
const switchCameraBtn = document.getElementById("switchCameraBtn");
const shutterProgress = document.getElementById("shutterProgress");
const cameraReviewBar = document.getElementById("cameraReviewBar");
const reviewTitle = document.getElementById("reviewTitle");
const reviewCopy = document.getElementById("reviewCopy");

// New Elements (Date: 2026-05-02)

const timeInBtn = document.getElementById("timeInBtn");
const timeOutBtn = document.getElementById("timeOutBtn");
const currentStatusText = document.getElementById("currentStatusText");
const attendanceHistoryList = document.getElementById("attendanceHistoryList");
const statAttendanceRate = document.getElementById("statAttendanceRate");
const statDaysPresent = document.getElementById("statDaysPresent");
const academicStandingText = document.getElementById("academicStandingText");
const academicStandingCopy = document.getElementById("academicStandingCopy");
const attendanceLastTime = document.getElementById("attendanceLastTime");
const attendanceLastLocation = document.getElementById("attendanceLastLocation");
const attendanceActionModal = document.getElementById("attendanceActionModal");
const attendanceActionIconWrap = document.getElementById("attendanceActionIconWrap");
const attendanceActionIcon = document.getElementById("attendanceActionIcon");
const attendanceActionTitle = document.getElementById("attendanceActionTitle");
const attendanceActionMessage = document.getElementById("attendanceActionMessage");
const attendanceModalTime = document.getElementById("attendanceModalTime");
const attendanceModalLocation = document.getElementById("attendanceModalLocation");
const attendanceConfirmBtn = document.getElementById("attendanceConfirmBtn");
const attendanceCancelBtn = document.getElementById("attendanceCancelBtn");
const trackingStatusBanner = document.getElementById("trackingStatusBanner");
const trackingStatusIcon = document.getElementById("trackingStatusIcon");
const trackingStatusCopy = document.getElementById("trackingStatusCopy");


let sosTimer = null;
let emergencyStream = null;
let facingMode = "environment";
let emergencyCaptures = [];
let isRecording = false;
let mediaRecorder = null;
let mediaChunks = [];
let isHolding = false;
let holdTimer = null;
// (2026-07-13) Add camera zoom and release state vars; was tap/hold only
let isStartingRecording = false;
let shouldStopRecordingImmediately = false;
let currentCameraZoom = 1;
let captureTouchStartY = 0;
let captureTouchPointerId = null;
let recordingStartTime = null;
let recordingTicker = null;
const MAX_VIDEO_DURATION = 60000;
let launchTimer = null;
let isPosting = false;
let currentGadPosts = [];
let currentVaultItems = [];
const selectedVaultKeys = new Set();
let vaultLongPressTimer = null;
let vaultLongPressTriggered = false;
let vaultLongPressIndex = null;
let isSyncingAttendance = false;

cameraPreview.addEventListener("loadedmetadata", () => {
    if (cameraError) cameraError.hidden = true;
    if (cameraEmpty) cameraEmpty.hidden = true;
});

cameraPreview.addEventListener("playing", () => {
    cameraError.hidden = true;
    cameraEmpty.hidden = true;
});

const pageMeta = {
    map: { title: "Campus Map", icon: "explore", action: "my_location" },
    vault: { title: "Digital Vault", icon: "encrypted", action: "filter_alt" },
    sos: { title: "Emergency SOS", icon: "emergency", action: "notifications_active" },
    gad: { title: "GAD Bulletin", icon: "campaign", action: "tune" },
    attendance: { title: "Attendance", icon: "fact_check", action: "insights" },
    history: { title: "Activity History", icon: "manage_history", action: "" }
};

function formatTime12(date) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateShort(date) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatDateTime12(date) {
    return `${formatDateShort(date)}, ${formatTime12(date)}`;
}

function getAttendanceQueueKey(userId) {
    return `securo_attendance_queue_${userId || "guest"}`;
}

function readPendingAttendanceLogs(userId) {
    if (!userId) return [];
    try {
        const raw = localStorage.getItem(getAttendanceQueueKey(userId));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Failed to read attendance queue:", error);
        return [];
    }
}

function writePendingAttendanceLogs(userId, logs) {
    if (!userId) return;
    try {
        if (!logs.length) {
            localStorage.removeItem(getAttendanceQueueKey(userId));
            return;
        }
        localStorage.setItem(getAttendanceQueueKey(userId), JSON.stringify(logs));
    } catch (error) {
        console.warn("Failed to write attendance queue:", error);
    }
}

function queueAttendanceLog(userId, entry) {
    const pendingLogs = readPendingAttendanceLogs(userId);
    pendingLogs.unshift(entry);
    writePendingAttendanceLogs(userId, pendingLogs);
}

function getAttendanceLogDate(log) {
    if (log?.clientTimestamp) return new Date(log.clientTimestamp);
    return log?.timestamp?.toDate?.() || new Date(log?.timestamp || Date.now());
}

function getMergedAttendanceHistory(remoteHistory, userId = appState.user.uid) {
    const pendingLogs = readPendingAttendanceLogs(userId).map((log) => ({
        ...log,
        pending: true
    }));
    return [...pendingLogs, ...(Array.isArray(remoteHistory) ? remoteHistory : [])]
        .sort((a, b) => getAttendanceLogDate(b) - getAttendanceLogDate(a));
}

async function syncPendingAttendanceLogs() {
    if (isSyncingAttendance || !appState.user.uid) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    const pendingLogs = readPendingAttendanceLogs(appState.user.uid);
    if (!pendingLogs.length) return;

    isSyncingAttendance = true;
    const remainingLogs = [];

    for (const log of pendingLogs.slice().reverse()) {
        try {
            await logAttendance(appState.user.uid, log.type, log.location);
        } catch (error) {
            Logger.warn("Attendance", "Attendance sync failed", error);
            remainingLogs.unshift(log);
        }
    }

    writePendingAttendanceLogs(appState.user.uid, remainingLogs);
    isSyncingAttendance = false;

    try {
        await loadAttendanceUI();
    } catch (error) {
        console.warn("Attendance reload after sync failed:", error);
    }
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
        reader.readAsDataURL(file);
    });
}

// (2026-07-13) Client-side image compression under 1MB limit; was uncompressed
function compressImageFile(file, maxDimension = 960, quality = 0.66) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth || img.width;
            let h = img.naturalHeight || img.height;
            const scale = Math.min(1, maxDimension / Math.max(w, h));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(url);
            reject(e);
        };
        img.src = url;
    });
}

async function captureCanvasToJpegDataUrl(canvas, quality = 0.76, maxDimension = 1280) {
    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height) return canvas.toDataURL("image/jpeg", quality);

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    if (scale === 1) return canvas.toDataURL("image/jpeg", quality);

    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = Math.round(width * scale);
    resizedCanvas.height = Math.round(height * scale);
    const resizedContext = resizedCanvas.getContext("2d");
    return resizedCanvas.toDataURL("image/jpeg", quality);
}

const _studentBlobUrlCache = new Map();
function getPlayableVideoUrl(src) {
    if (!src || typeof src !== 'string' || !src.startsWith('data:video/')) return src || '';
    if (_studentBlobUrlCache.has(src)) return _studentBlobUrlCache.get(src);
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
        _studentBlobUrlCache.set(src, url);
        return url;
    } catch (e) {
        return src;
    }
}

function renderVaultItems(items) {
    if (!vaultGrid || !vaultTotalEvidence) return;
    vaultTotalEvidence.textContent = `${items.length} File${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
        exitVaultSelectionMode();
        vaultGrid.innerHTML = '<div class="vault-empty">No media posted yet.</div>';
        return;
    }

    syncVaultSelectionState(items);

    vaultGrid.innerHTML = items.map((item, index) => {
        const createdAt = item.createdAt?.toDate?.() || new Date(item.createdAt || Date.now());
        const kind = item.kind === "image" ? "image-hand" : item.kind === "video" ? "video" : item.kind === "audio" ? "audio" : "file";
        const icon = item.kind === "image" ? "image" : item.kind === "video" ? "videocam" : item.kind === "audio" ? "mic" : "description";
        const selectionKey = getVaultSelectionKey(item);
        const isSelected = selectedVaultKeys.has(selectionKey);
        const isVideo = item.kind === "video";
        const playableUrl = isVideo ? getPlayableVideoUrl(item.src) : "";
        // (2026-07-13) Vault video thumbnail with play badge; prev: raw video tag
        const preview = item.kind === "image"
            ? `<img class="vault-preview" src="${item.src}" alt="${item.label || "Vault image"}">`
            : item.kind === "video"
                ? (item.thumbnail
                    ? `<img class="vault-preview" src="${item.thumbnail}" alt="Video thumbnail">
                               <div class="vault-video-badge"><span class="material-symbols-outlined">play_arrow</span></div>`
                    : `<div class="vault-video-box" style="background:linear-gradient(135deg, #181528, #2a1f47);">
                                   <video class="vault-preview" src="${playableUrl}" muted playsinline webkit-playsinline preload="metadata" style="object-fit:cover; pointer-events:none;"></video>
                                   <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.4));"></div>
                                   <div class="vault-video-badge"><span class="material-symbols-outlined">play_arrow</span></div>
                               </div>`)
                : "";
        const centerIcon = item.kind === "audio"
            ? '<div style="display:flex;justify-content:center;padding-bottom:16px;"><span class="material-symbols-outlined" style="font-size:46px;">graphic_eq</span></div>'
            : item.kind === "file"
                ? '<div style="display:flex;justify-content:center;padding-bottom:18px;"><span class="material-symbols-outlined" style="font-size:42px;">description</span></div>'
                : "";

        const landmark = getNearestLandmark(item.location?.lat || item.location?.latitude, item.location?.lng || item.location?.longitude);

        let coords = "Location unavailable";
        if (item.location) {
            const lat = item.location.lat || item.location.latitude;
            const lng = item.location.lng || item.location.longitude;
            if (typeof lat === 'number' && typeof lng === 'number') {
                coords = `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
            } else if (item.location.address) {
                coords = item.location.address;
            }
        }

        return `
                    <article class="vault-tile ${kind} ${appState.vaultSelectionMode ? "selection-mode" : ""} ${isSelected ? "selected" : ""}" data-vault-index="${index}" data-vault-key="${selectionKey}">
                        <button class="tile-delete" 
                                data-delete-post="${item.postId}" 
                                data-delete-index="${item.attachmentIndex}" 
                                data-delete-total="${item.totalInPost}"
                                aria-label="Delete media">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                        <button class="tile-download" onclick="event.stopPropagation(); downloadMedia('${item.src}', 'securo_${item.kind}_${createdAt.getTime()}')">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                        ${preview}
                        <div class="vault-select-indicator"><span class="material-symbols-outlined" style="font-size:16px;">check</span></div>
                        <div class="tile-corner"><span class="material-symbols-outlined">${icon}</span></div>
                        ${centerIcon}
                        <div class="tile-meta" style="position: relative; z-index: 1; opacity: 0.8; font-size: 0.6rem;">${formatDateShort(createdAt)} ${formatTime12(createdAt)}</div>
                    </article>
                `;
    }).join("");

    updateVaultSelectionToolbar();
}

function getVaultSelectionKey(item) {
    return `${item?.postId || "post"}:${Number(item?.attachmentIndex ?? -1)}`;
}

function syncVaultSelectionState(items = currentVaultItems) {
    const validKeys = new Set((items || []).map((item) => getVaultSelectionKey(item)));
    Array.from(selectedVaultKeys).forEach((key) => {
        if (!validKeys.has(key)) selectedVaultKeys.delete(key);
    });
    if (!selectedVaultKeys.size && appState.vaultSelectionMode) {
        appState.vaultSelectionMode = false;
    }
}

function updateVaultSelectionToolbar() {
    if (!vaultSelectionToolbar || !vaultSelectionCount || !selectAllVaultBtn || !deleteSelectedVaultBtn) return;

    const selectedCount = selectedVaultKeys.size;
    const totalCount = currentVaultItems.length;

    vaultSelectionToolbar.classList.toggle("active", appState.vaultSelectionMode);
    vaultSelectionCount.textContent = `${selectedCount} selected`;
    selectAllVaultBtn.textContent = selectedCount && selectedCount === totalCount ? "Clear All" : "Select All";
    deleteSelectedVaultBtn.disabled = selectedCount === 0;
    deleteSelectedVaultBtn.style.opacity = selectedCount === 0 ? "0.6" : "1";
}

function enterVaultSelectionMode(initialItem = null) {
    appState.vaultSelectionMode = true;
    if (initialItem) {
        selectedVaultKeys.add(getVaultSelectionKey(initialItem));
    }
    renderVaultItems(currentVaultItems);
}

function exitVaultSelectionMode() {
    appState.vaultSelectionMode = false;
    selectedVaultKeys.clear();
    updateVaultSelectionToolbar();
}

function toggleVaultItemSelection(item) {
    const key = getVaultSelectionKey(item);
    if (selectedVaultKeys.has(key)) {
        selectedVaultKeys.delete(key);
    } else {
        selectedVaultKeys.add(key);
    }

    if (!selectedVaultKeys.size) {
        exitVaultSelectionMode();
        renderVaultItems(currentVaultItems);
        return;
    }

    renderVaultItems(currentVaultItems);
}

// (2026-07-13) Vault persistent cache & auto-load; was memory-only loading
function getVaultCacheKey(uid) {
    const userId = uid || appState?.user?.uid || localStorage.getItem('securo_session_token') || 'last_student';
    return 'securo_vault_cache_' + userId;
}

function saveVaultCache(items) {
    try {
        const key = getVaultCacheKey();
        if (!key) return;
        const toCache = (items || []).slice(0, 40);
        localStorage.setItem(key, JSON.stringify(toCache));
    } catch (err) {
        console.warn("Vault cache store failed:", err);
    }
}

// (2026-07-13) Fix vault item uniqueness; was truncating base64 JPEG header
function deduplicateVaultItems(items) {
    const seen = new Set();
    return (items || []).filter(item => {
        const uniqueKey = item?.id || (item?.postId !== undefined ? `${item.postId}_${item.attachmentIndex ?? 0}` : null) || (item?.url ? String(item.url) : null) || (item?.src && item.src.length > 500 ? `${item.src.slice(0, 30)}_${item.src.slice(-60)}` : item?.src);
        if (!uniqueKey || seen.has(uniqueKey)) return false;
        seen.add(uniqueKey);
        return true;
    });
}

function loadVaultFromCache(uid) {
    try {
        const key = getVaultCacheKey(uid);
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                currentVaultItems = deduplicateVaultItems(parsed);
                renderVaultItems(currentVaultItems);
                return true;
            }
        }
    } catch (err) {
        console.warn("Vault cache load failed:", err);
    }
    return false;
}

async function loadVaultItems() {
    const uid = appState.user.uid || localStorage.getItem('securo_session_token');
    if (!uid) {
        loadVaultFromCache();
        return;
    }
    if (!currentVaultItems || !currentVaultItems.length) {
        loadVaultFromCache(uid);
    }
    try {
        const posts = await getUserEmergencyPosts(uid);
        // (2026-07-13) Backfill guardianVisible=true on legacy posts; was undefined
        posts.forEach((post) => {
            if (post?.id && !String(post.id).startsWith('local_') && post.guardianVisible === undefined) {
                toggleEmergencyPostGuardianAccess(post.id, true).catch(() => { });
            }
        });
        const rawItems = posts.flatMap((post) => (post.attachments || []).map((attachment, index) => ({
            ...attachment,
            createdAt: post.createdAt,
            postId: post.id,
            userId: post.userId || uid,
            studentId: post.studentId || appState.user.studentId || "",
            userName: post.userName || appState.user.name || "",
            attachmentIndex: index,
            totalInPost: (post.attachments || []).length,
            location: post.location,
            gadVisible: post.gadVisible !== false,
            guardianVisible: post.guardianVisible !== false
        })));
        currentVaultItems = deduplicateVaultItems(rawItems);
        saveVaultCache(currentVaultItems);
        renderVaultItems(currentVaultItems);
    } catch (err) {
        console.warn("Vault load from network failed:", err);
        if (!currentVaultItems.length) loadVaultFromCache(uid);
    }
}

loadVaultFromCache();

async function deleteSelectedVaultItems() {
    if (!selectedVaultKeys.size) return;

    const selectionsByPost = new Map();
    currentVaultItems.forEach((item) => {
        const key = getVaultSelectionKey(item);
        if (!selectedVaultKeys.has(key)) return;
        if (!selectionsByPost.has(item.postId)) {
            selectionsByPost.set(item.postId, []);
        }
        selectionsByPost.get(item.postId).push(item.attachmentIndex);
    });

    for (const [postId, attachmentIndexes] of selectionsByPost.entries()) {
        const uniqueIndexes = [...new Set(attachmentIndexes)].sort((a, b) => b - a);
        const post = await getEmergencyPostById(postId);
        if (!post?.attachments?.length) continue;

        if (uniqueIndexes.length >= post.attachments.length) {
            await deleteEmergencyPost(postId);
            continue;
        }

        const updatedAttachments = [...post.attachments];
        uniqueIndexes.forEach((index) => {
            if (index >= 0 && index < updatedAttachments.length) {
                updatedAttachments.splice(index, 1);
            }
        });
        await updateEmergencyPostAttachments(postId, updatedAttachments);
    }
}

if (vaultGrid) {
    // Left click delegation for delete button
    // Left click delegation for viewing details or delete button
    vaultGrid.addEventListener("click", async (e) => {
        if (vaultLongPressTriggered) {
            vaultLongPressTriggered = false;
            return;
        }

        if (appState.vaultSelectionMode) {
            const tile = e.target.closest(".vault-tile");
            if (tile) {
                const index = parseInt(tile.dataset.vaultIndex);
                const item = currentVaultItems[index];
                if (item) toggleVaultItemSelection(item);
            }
            return;
        }

        const deleteBtn = e.target.closest(".tile-delete");
        if (deleteBtn) {
            const postId = deleteBtn.dataset.deletePost;
            const attachmentIndex = parseInt(deleteBtn.dataset.deleteIndex);
            const totalInPost = parseInt(deleteBtn.dataset.deleteTotal);

            const confirmed = await showVaultDeleteConfirm();
            if (!confirmed) return;

            const originalHtml = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span>';
            deleteBtn.disabled = true;

            try {
                if (totalInPost <= 1) {
                    await deleteEmergencyPost(postId);
                } else {
                    const post = await getEmergencyPostById(postId);
                    if (post && post.attachments) {
                        const updatedAttachments = [...post.attachments];
                        updatedAttachments.splice(attachmentIndex, 1);
                        await updateEmergencyPostAttachments(postId, updatedAttachments);
                    }
                }
                await loadVaultItems();
                await showStatus("Deleted", "Media has been removed from your vault.");
            } catch (error) {
                console.warn("Delete media error:", error);
                deleteBtn.innerHTML = originalHtml;
                deleteBtn.disabled = false;
                await showStatus("Error", "Could not delete media at this time.", "error");
            }
            return; // Prevent triggering tile click
        }

        const tile = e.target.closest(".vault-tile");
        if (tile) {
            const index = parseInt(tile.dataset.vaultIndex);
            const item = currentVaultItems[index];
            if (item) openVaultItemDetails(item);
        }
    });

    // Right click delegation for custom context menu
    vaultGrid.addEventListener("contextmenu", (e) => {
        if (appState.vaultSelectionMode) {
            e.preventDefault();
            return;
        }
        const tile = e.target.closest(".vault-tile");
        if (!tile) return;

        e.preventDefault();
        const index = parseInt(tile.dataset.vaultIndex);
        appState.contextMenuTarget = currentVaultItems[index];

        const menu = document.getElementById("vaultContextMenu");
        // Perf: use transform instead of top/left to avoid layout recalculation
        requestAnimationFrame(() => {
            menu.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            menu.style.top = "0";
            menu.style.left = "0";
            menu.style.display = "block";
        });

        // Update Edit Access text
        const isVisible = appState.contextMenuTarget.gadVisible !== false;
        document.getElementById("ctxAccessLabel").textContent = isVisible ? "Shared" : "Private";
        document.getElementById("ctxAccessIcon").textContent = isVisible ? "visibility" : "visibility_off";
        document.getElementById("ctxAccessIcon").style.color = isVisible ? "var(--primary)" : "var(--muted)";
    });

    const clearVaultLongPress = () => {
        if (vaultLongPressTimer) {
            clearTimeout(vaultLongPressTimer);
            vaultLongPressTimer = null;
        }
    };

    vaultGrid.addEventListener("pointerdown", (event) => {
        if (appState.vaultSelectionMode) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest(".tile-delete, .tile-download")) return;

        const tile = event.target.closest(".vault-tile");
        if (!tile) return;

        vaultLongPressTriggered = false;
        vaultLongPressIndex = Number(tile.dataset.vaultIndex);
        clearVaultLongPress();
        vaultLongPressTimer = setTimeout(() => {
            const item = currentVaultItems[vaultLongPressIndex];
            if (!item) return;
            vaultLongPressTriggered = true;
            enterVaultSelectionMode(item);
        }, 420);
    });

    ["pointerup", "pointerleave", "pointercancel", "dragstart"].forEach((eventName) => {
        vaultGrid.addEventListener(eventName, clearVaultLongPress);
    });
}

cancelVaultSelectionBtn?.addEventListener("click", () => {
    exitVaultSelectionMode();
    renderVaultItems(currentVaultItems);
});

selectAllVaultBtn?.addEventListener("click", () => {
    if (!currentVaultItems.length) return;

    if (selectedVaultKeys.size === currentVaultItems.length) {
        selectedVaultKeys.clear();
    } else {
        currentVaultItems.forEach((item) => selectedVaultKeys.add(getVaultSelectionKey(item)));
    }

    appState.vaultSelectionMode = selectedVaultKeys.size > 0;
    renderVaultItems(currentVaultItems);
});

deleteSelectedVaultBtn?.addEventListener("click", async () => {
    if (!selectedVaultKeys.size) return;

    const confirmed = await showVaultDeleteConfirm();
    if (!confirmed) return;

    setButtonBusy(deleteSelectedVaultBtn, true);
    try {
        await deleteSelectedVaultItems();
        exitVaultSelectionMode();
        await loadVaultItems();
        await showStatus("Deleted", "Selected media has been removed from your vault.");
    } catch (error) {
        console.warn("Bulk delete error:", error);
        await showStatus("Error", "Could not delete the selected media right now.", "error");
    } finally {
        setButtonBusy(deleteSelectedVaultBtn, false);
    }
});

// (2026-07-13) Add regional landmarks and barangay resolver; was CTU default
const REGIONAL_LANDMARKS = [
    { name: "Brgy. Agujo, Daanbantayan", coords: [11.26850, 124.01020] },
    { name: "Agujo Elementary School, Daanbantayan", coords: [11.26510, 124.01250] },
    { name: "Brgy. Poblacion, Daanbantayan (Town Proper)", coords: [11.25550, 124.02450] },
    { name: "Daanbantayan Municipal Hall & Plaza", coords: [11.25700, 124.02510] },
    { name: "Santa Rosa de Lima Parish, Daanbantayan", coords: [11.25820, 124.02630] },
    { name: "Daanbantayan Public Market & Terminal", coords: [11.25620, 124.02320] },
    { name: "Brgy. Pajo, Daanbantayan", coords: [11.24800, 124.00550] },
    { name: "Brgy. Bakhawan, Daanbantayan", coords: [11.28250, 124.00210] },
    { name: "Brgy. Tapilon & Port, Daanbantayan", coords: [11.29850, 124.02820] },
    { name: "Brgy. Maya & Maya Port, Daanbantayan", coords: [11.31500, 124.04100] },
    { name: "Brgy. Malbago, Daanbantayan", coords: [11.22850, 123.99820] },
    { name: "Brgy. Paypay, Daanbantayan", coords: [11.21800, 123.99200] },
    { name: "Brgy. Bitoon, Daanbantayan", coords: [11.27200, 123.97850] },
    { name: "Brgy. Calape, Daanbantayan", coords: [11.28900, 123.98500] },
    { name: "Brgy. Talisay, Daanbantayan", coords: [11.24100, 124.01900] },
    { name: "Brgy. Tinubdan, Daanbantayan", coords: [11.24500, 123.98700] },
    { name: "Brgy. Tominjao, Daanbantayan", coords: [11.23500, 124.01500] },
    { name: "Curva, Medellin, Cebu", coords: [11.17350, 123.97820] },
    { name: "Poblacion, Medellin, Cebu", coords: [11.12800, 123.96200] },
    { name: "Bogo City Proper, Cebu", coords: [11.05000, 124.00500] }
];

async function fetchReverseGeocode(lat, lng) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) return null;
        const data = await res.json();
        const locality = data.locality || data.principalSubdivision || "";
        const barangay = (data.localityInfo?.informative || []).find(i => /barangay|brgy/i.test(i.name) || i.description?.toLowerCase().includes("barangay"))?.name || "";
        const city = data.city || data.localityInfo?.administrative?.find(a => a.adminLevel === 6 || a.adminLevel === 7)?.name || "Daanbantayan";

        if (barangay && city) return `${barangay}, ${city}`;
        if (locality && city && locality !== city) return `${locality}, ${city}`;
        if (locality) return locality;
    } catch (e) {
        // Offline fallback to local landmark dictionary
    }
    return null;
}

function getNearestLandmark(lat, lng) {
    if (!lat || !lng) return "Location unavailable";

    let nearestBuilding = null;
    let minBuildingDist = Infinity;

    CAMPUS_BUILDINGS.forEach(building => {
        const [bLat, bLng] = building.coords;
        const dist = Math.hypot(lat - bLat, lng - bLng);
        if (dist < minBuildingDist) {
            minBuildingDist = dist;
            nearestBuilding = building.name;
        }
    });

    if (minBuildingDist < 0.0035 && nearestBuilding) {
        const prefix = nearestBuilding.toLowerCase().startsWith("the ") ? "Near " : "Near the ";
        return `CTU Daanbantayan (${prefix}${nearestBuilding})`;
    }

    let nearestPlace = null;
    let minPlaceDist = Infinity;

    REGIONAL_LANDMARKS.forEach(landmark => {
        const [lLat, lLng] = landmark.coords;
        const dist = Math.hypot(lat - lLat, lng - lLng);
        if (dist < minPlaceDist) {
            minPlaceDist = dist;
            nearestPlace = landmark.name;
        }
    });

    return nearestPlace || "Daanbantayan, Cebu";
}

function updateSosLocationDisplay(lat, lng) {
    const titleEl = document.getElementById("sosCurrentLocationTitle");
    const subEl = document.getElementById("sosCurrentLocationSub");
    if (!titleEl || !subEl) return;

    if (!lat || !lng) {
        titleEl.textContent = "Location Detecting...";
        subEl.textContent = "Detecting live GPS...";
        return;
    }

    const isInside = isPointInPolygon([lat, lng], getCampusGeofencePolygon());
    const landmarkName = getNearestLandmark(lat, lng);

    if (isInside) {
        titleEl.textContent = landmarkName;
        subEl.textContent = "CTU Daanbantayan Campus";
    } else {
        titleEl.textContent = landmarkName;
        subEl.textContent = "Outside Campus Bounds";
    }
}

function getVaultDownloadFilename(item) {
    const createdAt = item?.createdAt?.toDate?.() || new Date(item?.createdAt || Date.now());
    const stamp = Number.isNaN(createdAt.getTime())
        ? Date.now()
        : createdAt.toISOString().replace(/[:.]/g, "-");
    const extension = item?.kind === "image"
        ? "jpg"
        : item?.kind === "video"
            ? "mp4"
            : item?.kind === "audio"
                ? "webm"
                : "bin";
    return `vault-${item?.kind || "file"}-${stamp}.${extension}`;
}

function downloadVaultItem(item) {
    if (!item?.src) {
        showStatus("Download Error", "This vault item has no downloadable source.", "error");
        return;
    }

    const link = document.createElement("a");
    link.href = item.src;
    link.download = getVaultDownloadFilename(item);
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
}

// Context Menu Actions
document.addEventListener("click", () => {
    const menu = document.getElementById("vaultContextMenu");
    if (menu) menu.style.display = "none";
});

function openVaultItemDetails(item) {
    if (!item) return;
    appState.contextMenuTarget = item; // Ensure target is set for toggle sync

    const overlay = document.getElementById("vaultDetailsOverlay");
    const mediaWrap = document.getElementById("detailsMediaWrap");
    const dt = item.createdAt?.toDate?.() || new Date(item.createdAt || Date.now());

    // (2026-07-13) Stream video via blob URL to fix gray placeholder; was dataUrl
    mediaWrap.innerHTML = item.kind === "image"
        ? `<img src="${item.src}">`
        : item.kind === "video"
            ? `<div style="position:relative; width:100%; height:100%; background:#0c0a17; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                           <video src="${getPlayableVideoUrl(item.src)}" controls playsinline webkit-playsinline style="width:100%; max-height:100%; background:#0c0a17; object-fit:contain; display:block;"></video>
                       </div>`
            : `<div style="display:flex;flex-direction:column;align-items:center;color:#fff;"><span class="material-symbols-outlined" style="font-size:64px;margin-bottom:12px;">mic</span><strong>Voice Evidence</strong></div>`;

    const isVisual = item.kind === "image" || item.kind === "video";
    const lat = item.location?.lat || item.location?.latitude;
    const lng = item.location?.lng || item.location?.longitude;
    const landmark = getNearestLandmark(lat, lng);
    let locString = landmark;
    if (typeof lat === 'number' && typeof lng === 'number') {
        locString += `\nLat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
    }

    document.getElementById("detailsDateTime").textContent = formatDateTime12(dt);
    const locEl = document.getElementById("detailsLocation");
    if (isVisual) {
        locEl.style.display = "block";
        locEl.style.whiteSpace = "pre-line";
        locEl.textContent = locString;
    } else {
        locEl.style.display = "none";
    }

    // Sync toggle and status text
    const isVisible = item.gadVisible !== false;
    const isGuardianVisible = item.guardianVisible !== false;
    const gadAccessToggle = document.getElementById("gadAccessToggle");
    const guardianAccessToggle = document.getElementById("guardianAccessToggle");
    if (gadAccessToggle) gadAccessToggle.checked = isVisible;
    if (guardianAccessToggle) guardianAccessToggle.checked = isGuardianVisible;
    document.getElementById("detailsVisibility").textContent = isVisible ? "Shared with GAD Response Team" : "Private (Hidden from GAD)";
    document.getElementById("detailsVisibilityIcon").textContent = isVisible ? "visibility" : "visibility_off";
    // (2026-07-13) Guard removed Parent Access elements in staff vault; was direct
    const detailsGuardEl = document.getElementById("detailsGuardianVisibility");
    const detailsGuardIconEl = document.getElementById("detailsGuardianVisibilityIcon");
    if (detailsGuardEl) detailsGuardEl.textContent = isGuardianVisible ? "Shared with Parents / Guardians" : "Private (Hidden from Parents / Guardians)";
    if (detailsGuardIconEl) detailsGuardIconEl.textContent = isGuardianVisible ? "group" : "group_off";

    overlay.classList.add("active");
}

const gadAccessToggle = document.getElementById("gadAccessToggle");
if (gadAccessToggle) {
    gadAccessToggle.addEventListener("change", async () => {
        const item = appState.contextMenuTarget;
        if (!item) return;

        const newVis = gadAccessToggle.checked;
        try {
            await toggleEmergencyPostAccess(item.postId, newVis);
            // Refresh local state to ensure it's synced
            await loadVaultItems();

            // Update current modal text
            document.getElementById("detailsVisibility").textContent = newVis ? "Shared with GAD Response Team" : "Private (Hidden from GAD)";
            document.getElementById("detailsVisibilityIcon").textContent = newVis ? "visibility" : "visibility_off";
        } catch (err) {
            gadAccessToggle.checked = !newVis; // Revert on failure
            showStatus("Error", "Could not update access.", "error");
        }
    });
}

const guardianAccessToggle = document.getElementById("guardianAccessToggle");
if (guardianAccessToggle) {
    guardianAccessToggle.addEventListener("change", async () => {
        const item = appState.contextMenuTarget;
        if (!item) return;

        const newVis = guardianAccessToggle.checked;
        try {
            await toggleEmergencyPostGuardianAccess(item.postId, newVis);
            await loadVaultItems();

            // (2026-07-13) Guard missing guardian visibility DOM nodes; was TypeError
            const guardVisEl = document.getElementById("detailsGuardianVisibility");
            const guardVisIconEl = document.getElementById("detailsGuardianVisibilityIcon");
            if (guardVisEl) guardVisEl.textContent = newVis ? "Shared with Parents / Guardians" : "Private (Hidden from Parents / Guardians)";
            if (guardVisIconEl) guardVisIconEl.textContent = newVis ? "group" : "group_off";
        } catch (err) {
            guardianAccessToggle.checked = !newVis;
            showStatus("Error", "Could not update parent access.", "error");
        }
    });
}

document.getElementById("ctxViewDetails").addEventListener("click", () => {
    if (appState.contextMenuTarget) openVaultItemDetails(appState.contextMenuTarget);
});

document.getElementById("ctxEditAccess").addEventListener("click", async () => {
    const item = appState.contextMenuTarget;
    if (!item) return;

    const currentVis = item.gadVisible !== false;
    const newVis = !currentVis;

    try {
        await toggleEmergencyPostAccess(item.postId, newVis);
        await loadVaultItems();
        showStatus("Access Updated", newVis ? "Evidence shared with GAD." : "Evidence is now private.");
    } catch (err) {
        showStatus("Error", "Could not update access.", "error");
    }
});

document.getElementById("ctxDelete").addEventListener("click", async () => {
    const item = appState.contextMenuTarget;
    if (!item) return;

    const confirmed = await showVaultDeleteConfirm();
    if (!confirmed) return;

    try {
        if (item.totalInPost <= 1) {
            await deleteEmergencyPost(item.postId);
        } else {
            const post = await getEmergencyPostById(item.postId);
            if (post && post.attachments) {
                const updatedAttachments = [...post.attachments];
                updatedAttachments.splice(item.attachmentIndex, 1);
                await updateEmergencyPostAttachments(item.postId, updatedAttachments);
            }
        }
        await loadVaultItems();
        showStatus("Deleted", "Media removed.");
    } catch (err) {
        showStatus("Error", "Failed to delete.", "error");
    }
});

// (2026-07-13) Clean video playback on modal close; was unpaused bare tag
document.getElementById("closeDetailsBtn").addEventListener("click", () => {
    const v = document.getElementById("detailsMediaWrap")?.querySelector("video");
    if (v) { v.pause(); v.src = ""; }
    document.getElementById("vaultDetailsOverlay").classList.remove("active");
});

document.getElementById("vaultDetailsOverlay")?.addEventListener("click", (e) => {
    if (e.target.id === "vaultDetailsOverlay") {
        const v = document.getElementById("detailsMediaWrap")?.querySelector("video");
        if (v) { v.pause(); v.src = ""; }
        document.getElementById("vaultDetailsOverlay").classList.remove("active");
    }
});

document.getElementById("downloadDetailsBtn").addEventListener("click", () => {
    const item = appState.contextMenuTarget;
    if (!item) return;
    downloadVaultItem(item);
});

function openAttendanceActionModal(type, details) {
    return new Promise((resolve) => {
        attendanceActionIconWrap.classList.remove("success", "error");
        attendanceActionIconWrap.classList.add(type === "in" ? "success" : "error");
        attendanceActionIcon.textContent = type === "in" ? "login" : "logout";
        attendanceActionTitle.textContent = type === "in" ? "Confirm Time In" : "Confirm Time Out";
        attendanceActionMessage.textContent = "Review the captured time and location before continuing.";
        attendanceModalTime.textContent = details.time;
        attendanceModalLocation.textContent = details.location;
        attendanceConfirmBtn.style.background = type === "in"
            ? "linear-gradient(135deg, #0f9b67, #0c7e54)"
            : "linear-gradient(135deg, #d11f34, #a8192a)";
        attendanceActionModal.classList.add("active");

        const close = (value) => {
            attendanceActionModal.classList.remove("active");
            attendanceConfirmBtn.onclick = null;
            attendanceCancelBtn.onclick = null;
            resolve(value);
        };

        attendanceConfirmBtn.onclick = () => close(true);
        attendanceCancelBtn.onclick = () => close(false);
    });
}

// (2026-07-13) Clean SOS FAB visibility check; was toggling redundant gadFab
function updateGlobalSosFabVisibility(pageName) {
    if (!globalSosFab) return;
    globalSosFab.hidden = pageName === "sos";
}

const notifBell = document.getElementById("notifBell");
const notifDropdown = document.getElementById("notifDropdown");
const notifList = document.getElementById("notifList");
const notifBadge = document.getElementById("notifBadge");
const notifCloseBtn = document.getElementById("notifCloseBtn");
let notificationUnsub = null;
let guardianRequestUnsub = null;
let guardianLinkReminderUnsub = null;
const seenGuardianRequestToasts = new Set();

if (notifDropdown && notifDropdown.parentElement !== document.body) {
    document.body.appendChild(notifDropdown);
}

function setButtonBusy(button, isBusy = true) {
    if (!button) return;
    button.classList.toggle("is-busy", isBusy);
    button.disabled = isBusy;
    button.setAttribute("aria-busy", isBusy ? "true" : "false");
}

// (2026-07-13) Keep unread state until clicked/marked; was auto-read on open
function openNotifications() {
    if (!notifDropdown) return;
    notifDropdown.classList.add("active");
    if (profileDropdown) profileDropdown.classList.remove("active");
}

function closeNotifications() {
    if (!notifDropdown) return;
    notifDropdown.classList.remove("active");
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatNotificationTimestamp(value) {
    const date = value?.toDate?.() || (value ? new Date(value) : null);
    return date ? date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now";
}

function getNotificationTimestampMs(value) {
    if (value?.seconds) {
        return (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1000000);
    }
    const date = value?.toDate?.() || (value ? new Date(value) : null);
    return Number.isFinite(date?.getTime?.()) ? date.getTime() : 0;
}

// (2026-07-13) Add campus entry/exit icons; was default notifications icon
function getNotificationIcon(type) {
    if (type === "campus_entry") return "login";
    if (type === "campus_exit") return "logout";
    if (type === "guardian_request") return "family_restroom";
    if (type === "location_request") return "location_off";
    if (type === "student_guardian_request") return "family_restroom";
    if (type === "guardian_request_accepted") return "check_circle";
    if (type === "guardian_request_declined") return "cancel";
    return "notifications";
}

function buildGuardianRequestNotification(request) {
    const persistedMatch = appState.accountNotifications.find((item) =>
        item?.type === "guardian_request" && item?.requestId === request?.id
    );

    return {
        id: persistedMatch?.id || `guardian-request-${request?.id || crypto.randomUUID()}`,
        type: "guardian_request",
        title: persistedMatch?.title || "Guardian tracking request",
        message: persistedMatch?.message || `${request?.guardianName || "A parent or guardian"} wants to link to your account.`,
        sourceName: persistedMatch?.sourceName || request?.guardianName || "",
        requestId: request?.id || "",
        createdAt: persistedMatch?.createdAt || request?.createdAt || null,
        isRead: persistedMatch?.isRead ?? false,
        resolvedStatus: persistedMatch?.resolvedStatus || "",
        _synthetic: !persistedMatch?.id
    };
}

function buildLocationReminderNotification(link) {
    if (!link?.id || !link?.locationReminderRequestedAt) return null;
    const persistedMatch = appState.accountNotifications.find((item) =>
        item?.type === "location_request" && item?.requestId === link.id
    );

    return {
        id: persistedMatch?.id || `location-request-${link.id}`,
        type: "location_request",
        title: persistedMatch?.title || "Turn on location sharing",
        message: persistedMatch?.message || link?.locationReminderMessage || `${link?.guardianName || "Your parent or guardian"} asked you to turn on location sharing so live tracking can continue.`,
        sourceName: persistedMatch?.sourceName || link?.locationReminderRequestedByName || link?.guardianName || "",
        requestId: link.id,
        createdAt: persistedMatch?.createdAt || link?.locationReminderRequestedAt || null,
        isRead: persistedMatch?.isRead ?? false,
        resolvedStatus: persistedMatch?.resolvedStatus || "",
        _synthetic: !persistedMatch?.id
    };
}

function getVisibleNotifications() {
    const persisted = Array.isArray(appState.accountNotifications) ? [...appState.accountNotifications] : [];
    const pendingRequests = Array.isArray(appState.pendingGuardianRequests) ? appState.pendingGuardianRequests : [];
    const pendingByRequestId = new Map();
    const reminderLinks = Array.isArray(appState.guardianLinkReminders) ? appState.guardianLinkReminders : [];
    const reminderByRequestId = new Map();

    pendingRequests.forEach((request) => {
        if (!request?.id) return;
        pendingByRequestId.set(request.id, buildGuardianRequestNotification(request));
    });

    reminderLinks.forEach((link) => {
        const reminder = buildLocationReminderNotification(link);
        if (!reminder?.requestId) return;
        reminderByRequestId.set(reminder.requestId, reminder);
    });

    persisted.forEach((item) => {
        if (item?.type === "guardian_request" && item?.requestId) {
            pendingByRequestId.delete(item.requestId);
        }
        if (item?.type === "location_request" && item?.requestId) {
            reminderByRequestId.delete(item.requestId);
        }
    });

    return [...persisted, ...pendingByRequestId.values(), ...reminderByRequestId.values()].sort((a, b) => {
        return getNotificationTimestampMs(b?.createdAt) - getNotificationTimestampMs(a?.createdAt);
    });
}

// (2026-07-13) Facebook-style All/Unread tabs & click-to-read; was plain list
let activeNotifFilter = "all";
function syncNotificationViews() {
    const visibleNotifications = getVisibleNotifications();
    renderNotificationHistorySection(visibleNotifications);
    if (!notifList || !notifBadge) return;

    const unreadCount = visibleNotifications.filter((item) => !item.isRead).length;
    notifBadge.classList.toggle("active", unreadCount > 0);

    const filtered = activeNotifFilter === "unread"
        ? visibleNotifications.filter((item) => !item.isRead)
        : visibleNotifications;

    const filterBar = `
        <div class="notif-filter-bar" style="display:flex; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px 6px; border-bottom:1px solid rgba(15,23,42,0.06);">
            <div style="display:flex; gap:6px;">
                <button type="button" class="notif-filter-pill" data-notif-filter="all" style="padding:5px 12px; border-radius:999px; border:none; font-size:0.76rem; font-weight:700; cursor:pointer; background:${activeNotifFilter === 'all' ? 'var(--primary-soft, #ecfdf5)' : '#f1f5f9'}; color:${activeNotifFilter === 'all' ? 'var(--primary)' : '#475569'};">All</button>
                <button type="button" class="notif-filter-pill" data-notif-filter="unread" style="padding:5px 12px; border-radius:999px; border:none; font-size:0.76rem; font-weight:700; cursor:pointer; background:${activeNotifFilter === 'unread' ? 'var(--primary-soft, #ecfdf5)' : '#f1f5f9'}; color:${activeNotifFilter === 'unread' ? 'var(--primary)' : '#475569'};">Unread${unreadCount ? ` (${unreadCount})` : ''}</button>
            </div>
            ${unreadCount > 0 ? `<button type="button" class="notif-mark-all-btn" style="border:none; background:transparent; color:var(--primary); font-size:0.75rem; font-weight:700; cursor:pointer; padding:4px 6px;">Mark all read</button>` : ''}
        </div>
    `;

    if (!filtered.length) {
        notifList.innerHTML = filterBar + `<div class="notif-empty">${activeNotifFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</div>`;
        return;
    }

    notifList.innerHTML = filterBar + filtered.map((item) => {
        const requestId = item.requestId || "";
        const actionable = (item.type === "guardian_request" || item.type === "student_guardian_request") && !item.resolvedStatus && requestId;
        const isUnread = !item.isRead;
        return `
                    <div class="notif-item ${isUnread ? 'is-unread' : 'is-read'}" data-notif-item-id="${item.id || ''}" id="${requestId ? `notif-request-${requestId}` : `notif-${item.id}`}" style="cursor:pointer; background:${isUnread ? 'rgba(15, 155, 103, 0.07)' : '#ffffff'}; align-items:flex-start;">
                        <div class="notif-item-icon">
                            <span class="material-symbols-outlined">${getNotificationIcon(item.type)}</span>
                        </div>
                        <div class="notif-item-content" style="flex:1; min-width:0;">
                            <strong class="notif-item-title" style="font-weight:${isUnread ? '800' : '600'};">${escapeHtml(item.title || "Notification")}</strong>
                            <span class="notif-item-desc" style="color:${isUnread ? '#1e293b' : 'var(--muted)'};">${escapeHtml(item.message || "")}</span>
                            <div style="font-size:0.72rem; color:${isUnread ? 'var(--primary)' : 'var(--muted)'}; font-weight:${isUnread ? '700' : '500'}; margin-top:6px;">${escapeHtml(formatNotificationTimestamp(item.createdAt))}</div>
                            ${actionable ? `
                                <div class="notif-actions">
                                    <button class="notif-action-btn accept" type="button" data-request-id="${requestId}" data-request-status="accepted" data-notification-id="${item.id}">Accept</button>
                                    <button class="notif-action-btn reject" type="button" data-request-id="${requestId}" data-request-status="rejected" data-notification-id="${item.id}">Decline</button>
                                </div>
                            ` : ""}
                        </div>
                        ${isUnread ? '<span class="notif-unread-dot" style="width:9px; height:9px; border-radius:50%; background:var(--primary); flex-shrink:0; margin-top:6px;" title="Unread"></span>' : ''}
                    </div>
                `;
    }).join("");
}

function renderAccountNotifications(notifications = []) {
    appState.accountNotifications = Array.isArray(notifications) ? notifications : [];
    // (2026-07-13) Persist student notifs to localStorage; was memory only
    try { localStorage.setItem('securo_student_notifications', JSON.stringify(appState.accountNotifications)); } catch (_) { }
    syncNotificationViews();

    // (2026-07-13) Show accept/decline notifs on snapshot; was request types only
    notifications.forEach(item => {
        if (!item.isRead && (item.type === "guardian_request" || item.type === "student_guardian_request")) {
            showGuardianRequestNotification({
                id: item.requestId || item.id,
                guardianName: item.sourceName || "A parent / guardian",
                message: item.message || "A parent or guardian wants to link to your account."
            });
        } else if (!item.isRead && (item.type === "guardian_request_accepted" || item.type === "guardian_request_declined")) {
            const evtKey = 'notif_seen_' + item.id;
            if (!window._seenStudentNotifEventIds) window._seenStudentNotifEventIds = new Set();
            if (!window._seenStudentNotifEventIds.has(evtKey)) {
                window._seenStudentNotifEventIds.add(evtKey);
                showStatus(item.title || "Guardian Update", item.message || "");
                const existingPopup = document.getElementById('guardianNotify');
                if (existingPopup) existingPopup.remove();
            }
        }
    });
}

// (2026-07-13) Restore student notifications offline; was memory-only
try {
    const cachedRequests = JSON.parse(localStorage.getItem('securo_student_pending_requests') || '[]');
    if (Array.isArray(cachedRequests) && cachedRequests.length) {
        appState.pendingGuardianRequests = cachedRequests;
    }
    const cachedNotifs = JSON.parse(localStorage.getItem('securo_student_notifications') || '[]');
    if (Array.isArray(cachedNotifs) && cachedNotifs.length) {
        appState.accountNotifications = cachedNotifs;
    }
    syncNotificationViews();
} catch (_) { }

function renderNotificationHistorySection(notifications = []) {
    const container = document.getElementById("historyNotifications");
    if (!container) return;

    if (!notifications.length) {
        container.innerHTML = '<div class="notif-empty" style="padding: 24px;">No notifications yet</div>';
        return;
    }

    container.innerHTML = notifications.map((item) => `
                <div class="notif-history-card ${item.isRead ? "" : "unread"}">
                    <div class="notif-item-icon">
                        <span class="material-symbols-outlined">${getNotificationIcon(item.type)}</span>
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:12px;">
                            <strong class="notif-item-title" style="margin:0;">${escapeHtml(item.title || "Notification")}</strong>
                            <span style="font-size:0.72rem; color:var(--muted); white-space:nowrap;">${escapeHtml(formatNotificationTimestamp(item.createdAt))}</span>
                        </div>
                        <span class="notif-item-desc" style="font-size:0.8rem; margin-top:4px;">${escapeHtml(item.message || "")}</span>
                    </div>
                </div>
            `).join("");
}

if (notifBell) {
    notifBell.addEventListener("click", (e) => {
        e.stopPropagation();
        if (notifDropdown?.classList.contains("active")) {
            closeNotifications();
        } else {
            openNotifications();
        }
    });
}

if (notifCloseBtn) {
    notifCloseBtn.addEventListener("click", closeNotifications);
}

if (notifDropdown) {
    notifDropdown.addEventListener("click", (event) => {
        if (event.target === notifDropdown) closeNotifications();
    });
}

if (profileChip) {
    profileChip.addEventListener("click", (e) => {
        e.stopPropagation();
        // If the click came from inside the dropdown (e.g. a link or button), don't toggle
        if (profileDropdown && profileDropdown.contains(e.target)) return;
        if (profileDropdown) profileDropdown.classList.toggle("active");
        closeNotifications();
    });
}

// Global click-outside listener
document.addEventListener("click", () => {
    if (profileDropdown) profileDropdown.classList.remove("active");
});

// Globally accessible navigation (Date: 2026-05-02)
window.setActiveView = function (pageName) {
    if (appState.currentPage === pageName) {
        const screenContent = document.getElementById("screenContent");
        if (screenContent) screenContent.scrollTo({ top: 0, behavior: "smooth" });
        // Still reload history if already on it (user may want a refresh)
        if (pageName === 'history') {
            _historyLoading = false;
            loadHistoryPage();
        }
        return;
    }

    console.log("Navigating to:", pageName);
    appState.currentPage = pageName;

    // Update Page Visibility
    const allPages = document.querySelectorAll(".page");
    allPages.forEach((page) => {
        const isTarget = page.dataset.page === pageName;
        if (isTarget) {
            page.classList.add("active");
            page.style.display = "block";
        } else {
            page.classList.remove("active");
            page.style.display = "none";
        }
    });

    // Update Bottom Nav Active State
    const allNavBtns = document.querySelectorAll("[data-nav]");
    allNavBtns.forEach((button) => {
        button.classList.toggle("active", button.dataset.nav === pageName);
    });

    // (2026-07-13) Show parent bar for students only; was showing for staff
    const studentParentBar = document.getElementById("studentParentBar");
    if (studentParentBar) {
        const isStaff = appState.user?.role === 'staff' || document.body.classList.contains('role-staff') || document.documentElement.classList.contains('role-staff');
        studentParentBar.style.display = (!isStaff && pageName === "map") ? "flex" : "none";
    }

    updateGlobalSosFabVisibility(pageName);

    // (2026-07-13) Load vault items or cache on tab open; was uid check only
    if (pageName === "vault") {
        loadVaultItems().catch((error) => console.warn("Vault load failed:", error));
    }

    // (2026-07-13) Sync live landmark when opening SOS tab; was static text
    if (pageName === "sos") {
        updateSosLocationDisplay(appState.lastLocation?.lat, appState.lastLocation?.lng);
    }

    // (2026-07-13) Pre-fetch location on attendance tab open; was cold on click
    if (pageName === "attendance" && !appState.lastLocation) {
        resolveAttendanceLocation().catch(() => { });
    }

    // Load history page data when navigating to it
    if (pageName === 'history') {
        _historyLoading = false;
        loadHistoryPage();
    }

    const meta = pageMeta[pageName];
    if (meta) {
        const headerTitle = document.getElementById("headerTitle");
        const headerLeadingIcon = document.getElementById("headerLeadingIcon");
        const headerActionIcon = document.getElementById("headerActionIcon");

        if (headerTitle) headerTitle.textContent = meta.title;
        if (headerLeadingIcon) headerLeadingIcon.innerHTML = '<span class="material-symbols-outlined">' + meta.icon + "</span>";
        if (headerActionIcon) headerActionIcon.textContent = meta.action;
    }

    // (2026-08-17) Await async initInteractiveMap so invalidateSize fires after map ready
    if (pageName === 'map') {
        setTimeout(() => {
            initInteractiveMap().then(() => {
                if (map) {
                    map.setView(CAMPUS_CENTER, 17);
                    requestAnimationFrame(() => map.invalidateSize());
                }
            });
        }, 80);
        setTimeout(() => {
            if (map) map.invalidateSize();
        }, 600);
    }

    const screenContent = document.getElementById("screenContent");
    if (screenContent) screenContent.scrollTo({ top: 0, behavior: "instant" });
}


// Alias for compatibility with existing code
const setActiveView = window.setActiveView;
// (2026-07-13) Set map as default view on launch; was uninvoked until auth
if (typeof setActiveView === 'function') {
    setActiveView('map');
}


// [REMOVED] showApp, validateLogin, handleSuccessfulLogin, loginForm listeners (Date: 2026-05-01)
// Login is now handled by login.html and auth.js

const profileDropdown = document.getElementById("profileDropdown");
const dropdownName = document.getElementById("dropdownName");
const dropdownId = document.getElementById("dropdownId");
const logoutLink = document.getElementById("logoutLink");

// (2026-07-13) Fullscreen Onboarding Screen Elements & Live Camera in Circle
const fsOnboardingScreen = document.getElementById("fullscreenOnboardingScreen");
// (2026-07-13) Show onboarding before map for new user; prev: flashed map
if (sessionStorage.getItem('securo_just_registered') === '1' && fsOnboardingScreen) {
    fsOnboardingScreen.classList.add("active");
    if (appView) appView.classList.remove("active");
}
const fsOnboardingForm = document.getElementById("fsOnboardingForm");
const fsFirstName = document.getElementById("fsFirstName");
const fsLastName = document.getElementById("fsLastName");
const fsCourse = document.getElementById("fsCourse");
const fsYearLevel = document.getElementById("fsYearLevel");
const fsSection = document.getElementById("fsSection");
const fsAvatarCircleWrap = document.getElementById("fsAvatarCircleWrap");
const fsAvatarPreviewCircle = document.getElementById("fsAvatarPreviewCircle");
const fsCircleLiveVideo = document.getElementById("fsCircleLiveVideo");

// Input filters for year, section
if (fsCourse) {
    // Show only the course code after selection (not the full name)
    fsCourse.addEventListener('change', () => {
        const selectedOption = fsCourse.options[fsCourse.selectedIndex];
        if (selectedOption && selectedOption.value) {
            selectedOption.textContent = selectedOption.value;
        }
    });
}
// (2026-07-13) OTP-like jump to section & backspace to year; prev: no navigation
if (fsYearLevel) {
    fsYearLevel.addEventListener('focus', () => fsYearLevel.select());
    fsYearLevel.addEventListener('keydown', (e) => {
        if (/^[1-5]$/.test(e.key)) {
            fsYearLevel.value = e.key;
            e.preventDefault();
            if (fsSection) {
                fsSection.focus();
                fsSection.select();
            }
        }
    });
    fsYearLevel.addEventListener('input', () => {
        fsYearLevel.value = fsYearLevel.value.replace(/[^1-5]/g, '').slice(0, 1);
        if (fsYearLevel.value && fsSection) {
            fsSection.focus();
            fsSection.select();
        }
    });
    fsYearLevel.addEventListener('keypress', (e) => {
        if (!/[1-5]/.test(e.key)) {
            e.preventDefault();
        }
    });
}
if (fsSection) {
    fsSection.addEventListener('input', () => {
        fsSection.value = fsSection.value.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    });
    fsSection.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && (!fsSection.value || (fsSection.selectionStart === 0 && fsSection.selectionEnd === 0))) {
            if (fsYearLevel) {
                fsYearLevel.focus();
                fsYearLevel.select();
            }
        }
    });
}
const fsAvatarPlaceholder = document.getElementById("fsAvatarPlaceholder");
const fsAvatarInitials = document.getElementById("fsAvatarInitials");
const fsAvatarImg = document.getElementById("fsAvatarImg");
const fsSnapSelfieBtn = document.getElementById("fsSnapSelfieBtn");
const fsSnapBtnLabel = document.getElementById("fsSnapBtnLabel");
const fsChooseGalleryBtn = document.getElementById("fsChooseGalleryBtn");
const fsGalleryInput = document.getElementById("fsGalleryInput");
const fsCameraCanvas = document.getElementById("fsCameraCanvas");
const fsOnboardingError = document.getElementById("fsOnboardingError");
const fsSubmitOnboardingBtn = document.getElementById("fsSubmitOnboardingBtn");

let fsOnboardingPhotoData = "";
let fsCameraStream = null;
let fsCurrentUserContext = null;

async function startCircleLiveCamera() {
    if (fsOnboardingPhotoData) return;
    try {
        stopCircleLiveCamera();
        fsCameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
            audio: false
        });
        if (fsCircleLiveVideo) {
            fsCircleLiveVideo.srcObject = fsCameraStream;
            fsCircleLiveVideo.style.display = "block";
        }
        if (fsAvatarPlaceholder) fsAvatarPlaceholder.style.display = "none";
        if (fsAvatarInitials) fsAvatarInitials.style.display = "none";
        if (fsAvatarImg) fsAvatarImg.style.display = "none";
        if (fsSnapBtnLabel) fsSnapBtnLabel.textContent = "Capture Selfie";
    } catch (err) {
        console.warn("Camera live stream permission or startup failed:", err);
        stopCircleLiveCamera();
        updateFsAvatarPreview();
    }
}

function stopCircleLiveCamera() {
    if (fsCameraStream) {
        fsCameraStream.getTracks().forEach(t => t.stop());
        fsCameraStream = null;
    }
    if (fsCircleLiveVideo) {
        fsCircleLiveVideo.srcObject = null;
        fsCircleLiveVideo.style.display = "none";
    }
}

// (2026-07-13) Camera shutter sound and capture audio; prev: silent capture
function playCameraShutterSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);

        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1200;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.5, now);
        ng.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
        noise.connect(filter);
        filter.connect(ng);
        ng.connect(ctx.destination);
        noise.start(now);

        const t2 = now + 0.06;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(700, t2);
        osc2.frequency.exponentialRampToValueAtTime(80, t2 + 0.06);
        gain2.gain.setValueAtTime(0.8, t2);
        gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.06);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.06);
    } catch (e) {
        console.warn("Shutter sound error:", e);
    }
}

// (2026-07-13) Native Capacitor Camera selfie with fallback; was webview only
async function snapSelfiePhoto() {
    if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.Camera) {
        try {
            const photo = await window.Capacitor.Plugins.Camera.getPhoto({
                quality: 85,
                allowEditing: false,
                resultType: 'dataUrl',
                source: 'CAMERA',
                direction: 'FRONT'
            });
            if (photo?.dataUrl) {
                fsOnboardingPhotoData = photo.dataUrl;
                playCameraShutterSound();
                stopCircleLiveCamera();
                updateFsAvatarPreview();
                return;
            }
        } catch (e) {
            console.warn("Capacitor selfie camera error or cancel:", e);
        }
    }
    if (fsCameraStream && fsCircleLiveVideo && fsCircleLiveVideo.videoWidth) {
        const size = Math.min(fsCircleLiveVideo.videoWidth, fsCircleLiveVideo.videoHeight);
        fsCameraCanvas.width = 400;
        fsCameraCanvas.height = 400;
        const ctx = fsCameraCanvas.getContext("2d");
        ctx.translate(400, 0);
        ctx.scale(-1, 1);
        const sx = (fsCircleLiveVideo.videoWidth - size) / 2;
        const sy = (fsCircleLiveVideo.videoHeight - size) / 2;
        ctx.drawImage(fsCircleLiveVideo, sx, sy, size, size, 0, 0, 400, 400);
        fsOnboardingPhotoData = fsCameraCanvas.toDataURL("image/jpeg", 0.9);
        playCameraShutterSound();
        stopCircleLiveCamera();
        updateFsAvatarPreview();
    } else if (fsOnboardingPhotoData) {
        fsOnboardingPhotoData = "";
        startCircleLiveCamera();
    } else {
        startCircleLiveCamera();
    }
}

function updateFsAvatarPreview() {
    if (!fsAvatarImg || !fsAvatarPlaceholder || !fsAvatarInitials) return;
    if (fsOnboardingPhotoData) {
        stopCircleLiveCamera();
        fsAvatarImg.src = fsOnboardingPhotoData;
        fsAvatarImg.style.display = "block";
        fsAvatarPlaceholder.style.display = "none";
        fsAvatarInitials.style.display = "none";
        if (fsSnapBtnLabel) fsSnapBtnLabel.textContent = "Retake Selfie";
        return;
    }

    fsAvatarImg.style.display = "none";

    if (fsCameraStream) {
        if (fsSnapBtnLabel) fsSnapBtnLabel.textContent = "Capture Selfie";
        return;
    }

    if (fsSnapBtnLabel) fsSnapBtnLabel.textContent = "Turn On Camera";

    const fn = fsFirstName ? fsFirstName.value.trim() : "";
    const ln = fsLastName ? fsLastName.value.trim() : "";
    if (fn || ln) {
        let inits = "";
        if (fn && ln) inits = (fn[0] + ln[0]).toUpperCase();
        else if (fn) inits = fn.slice(0, 2).toUpperCase();
        else inits = ln.slice(0, 2).toUpperCase();
        fsAvatarInitials.textContent = inits;
        fsAvatarInitials.style.display = "flex";
        fsAvatarPlaceholder.style.display = "none";
    } else {
        fsAvatarInitials.style.display = "none";
        fsAvatarPlaceholder.style.display = "flex";
    }
}

// (2026-07-13) Disallow all-caps; capitalize first letter only, lowercase rest; was raw replace
function toTitleCase(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/(?:^|\s|-|\.)[a-z]/g, char => char.toUpperCase());
}

if (fsFirstName) {
    fsFirstName.addEventListener("input", () => {
        const start = fsFirstName.selectionStart;
        const end = fsFirstName.selectionEnd;
        fsFirstName.value = toTitleCase(fsFirstName.value);
        fsFirstName.setSelectionRange(start, end);
        if (!fsCameraStream && !fsOnboardingPhotoData) updateFsAvatarPreview();
    });
    fsFirstName.addEventListener("blur", () => {
        fsFirstName.value = toTitleCase(fsFirstName.value.trim());
        if (!fsCameraStream && !fsOnboardingPhotoData) updateFsAvatarPreview();
    });
}

if (fsLastName) {
    fsLastName.addEventListener("input", () => {
        const start = fsLastName.selectionStart;
        const end = fsLastName.selectionEnd;
        fsLastName.value = toTitleCase(fsLastName.value);
        fsLastName.setSelectionRange(start, end);
        if (!fsCameraStream && !fsOnboardingPhotoData) updateFsAvatarPreview();
    });
    fsLastName.addEventListener("blur", () => {
        fsLastName.value = toTitleCase(fsLastName.value.trim());
        if (!fsCameraStream && !fsOnboardingPhotoData) updateFsAvatarPreview();
    });
}

if (fsSection) {
    fsSection.addEventListener("input", () => {
        const start = fsSection.selectionStart;
        const end = fsSection.selectionEnd;
        // (2026-07-13) Restrict section to letters only up to 4 chars; was allowing numbers
        fsSection.value = fsSection.value.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
        fsSection.setSelectionRange(start, end);
    });
    fsSection.addEventListener("blur", () => {
        fsSection.value = fsSection.value.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
    });
}

if (fsAvatarCircleWrap) {
    fsAvatarCircleWrap.addEventListener("click", () => {
        if (fsCameraStream) {
            snapSelfiePhoto();
        } else if (!fsOnboardingPhotoData) {
            startCircleLiveCamera();
        }
    });
}

if (fsSnapSelfieBtn) {
    fsSnapSelfieBtn.addEventListener("click", () => {
        if (fsCameraStream) {
            snapSelfiePhoto();
        } else if (fsOnboardingPhotoData) {
            fsOnboardingPhotoData = "";
            startCircleLiveCamera();
        } else {
            startCircleLiveCamera();
        }
    });
}

if (fsChooseGalleryBtn) {
    fsChooseGalleryBtn.addEventListener("click", () => {
        stopCircleLiveCamera();
        if (fsGalleryInput) fsGalleryInput.click();
    });
}

if (fsGalleryInput) {
    fsGalleryInput.addEventListener("change", () => {
        const file = fsGalleryInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            fsOnboardingPhotoData = e.target?.result || "";
            stopCircleLiveCamera();
            updateFsAvatarPreview();
        };
        reader.readAsDataURL(file);
    });
}

// (2026-07-13) Save directory entry locally in index.html; was missing definition
function saveLocalUserDirectoryEntry(uid, data) {
    try {
        const raw = localStorage.getItem("securo_user_directory");
        const dir = raw ? JSON.parse(raw) : {};
        dir[uid] = { ...(dir[uid] || {}), ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem("securo_user_directory", JSON.stringify(dir));
    } catch (e) {
        console.warn("Local user directory save failed:", e);
    }
}

// (2026-07-13) Swipe slides & load app on last slide; prev: display toggle
let currentOnboardingSlide = 0;
function goToSlide(index) {
    currentOnboardingSlide = Math.max(0, Math.min(1, index));
    const track = document.getElementById("fsSlidesTrack");
    if (track) track.style.transform = `translateX(-${currentOnboardingSlide * 100}%)`;
    const p1 = document.getElementById("fsProgStep1");
    const p2 = document.getElementById("fsProgStep2");
    if (p1) p1.classList.toggle("active", currentOnboardingSlide === 0);
    if (p2) p2.classList.toggle("active", currentOnboardingSlide === 1);
    const stepLbl = document.getElementById("fsProgressStepLabel");
    if (stepLbl) stepLbl.textContent = `Step ${currentOnboardingSlide + 1} of 2`;
}

// (2026-07-13) Show spinner when transitioning into app; prev: immediate exit
function finishOnboardingAndEnterApp() {
    const track = document.getElementById("fsSlidesTrack");
    if (track) track.style.transform = "translateX(-115%)";
    const loader = document.getElementById("fsOnboardingLoadingOverlay");
    if (loader) loader.style.display = "flex";
    setTimeout(() => {
        sessionStorage.removeItem('securo_just_registered');
        if (fsOnboardingScreen) fsOnboardingScreen.classList.remove("active");
        if (loader) loader.style.display = "none";
        if (appView) appView.classList.add("active");
        if (!appState.initialViewDone) {
            setActiveView("map");
            appState.initialViewDone = true;
        }
        if (map) requestAnimationFrame(() => map.invalidateSize());
    }, 650);
}

// (2026-07-13) Helper for current site guardian link; prev: hardcoded zea
function getGuardianBaseUrl() {
    if (typeof window !== "undefined" && window.location && window.location.origin) {
        const isNative = window.location.protocol.startsWith('file') ||
            window.location.protocol.startsWith('capacitor') ||
            (Boolean(window.Capacitor) && window.location.hostname === 'localhost');
        if (!isNative) {
            return window.location.origin + window.location.pathname.replace(/\/(student|staff)\/[^/]*$/, '/parent/parent.html?view=auth');
        }
    }
    return "https://securo.cebutech.digital/parent/parent.html?view=auth";
}

// (2026-07-13) Show Department & hide Section/Step2 for staff; was student fields
function triggerFullscreenOnboarding(user, existingProfile) {
    fsCurrentUserContext = { user, profile: existingProfile };
    if (fsOnboardingError) fsOnboardingError.textContent = "";
    const isStaff = true;
    const courseSecRow = document.getElementById("fsCourseSectionRow");
    const staffDeptRow = document.getElementById("fsStaffDepartmentRow");
    const fsDepartment = document.getElementById("fsDepartment");
    const step2Pill = document.getElementById("fsProgStep2");
    if (courseSecRow) courseSecRow.style.display = "none";
    if (staffDeptRow) staffDeptRow.style.display = "block";
    if (step2Pill) step2Pill.style.display = "none";
    if (fsCourse) fsCourse.required = false;
    if (fsYearLevel) fsYearLevel.required = false;
    if (fsSection) fsSection.required = false;
    const titleEl = document.querySelector(".fs-onboarding-title");
    if (titleEl) titleEl.textContent = "Set Up Staff Profile";
    if (existingProfile?.firstName && fsFirstName) fsFirstName.value = toTitleCase(existingProfile.firstName);
    if (existingProfile?.lastName && fsLastName) fsLastName.value = toTitleCase(existingProfile.lastName);
    if (existingProfile?.department && fsDepartment) fsDepartment.value = existingProfile.department;
    updateFsAvatarPreview();
    const loader = document.getElementById("fsOnboardingLoadingOverlay");
    if (loader) loader.style.display = "none";
    fsHasCopiedGuardianLink = false;
    goToSlide(0);
    const sId = existingProfile?.studentId || (user?.email?.match(/^(?:student|staff)\.(\d{7})@securo\.app$/)?.[1]) || "";
    // (2026-07-13) Dynamic guardian URL using current site; prev: hardcoded zea
    const guardianUrl = getGuardianBaseUrl() + (sId ? `?ref=${encodeURIComponent(sId)}` : "");
    const inviteEl = document.getElementById("fsGuardianInviteLink");
    if (inviteEl) inviteEl.textContent = guardianUrl;
    if (appView) appView.classList.remove("active");
    if (fsOnboardingScreen) fsOnboardingScreen.classList.add("active");
    if (!fsOnboardingPhotoData) {
        startCircleLiveCamera();
    }
}

if (fsOnboardingForm) {
    fsOnboardingForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (fsOnboardingError) fsOnboardingError.textContent = "";
        const fn = fsFirstName ? toTitleCase(fsFirstName.value.trim()) : "";
        const ln = fsLastName ? toTitleCase(fsLastName.value.trim()) : "";
        const isStaff = fsCurrentUserContext?.user?.email?.startsWith("staff.") || fsCurrentUserContext?.profile?.role === "staff" || appState.user?.role === "staff";
        const course = fsCourse ? fsCourse.value.trim().toUpperCase() : "";
        const year = fsYearLevel ? fsYearLevel.value.trim() : "";
        const rawSec = fsSection ? fsSection.value.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() : "";

        if (fn.length < 2) {
            if (fsOnboardingError) fsOnboardingError.textContent = "Please enter your first name.";
            return;
        }
        if (ln.length < 2) {
            if (fsOnboardingError) fsOnboardingError.textContent = "Please enter your last name.";
            return;
        }
        if (!isStaff) {
            if (!course) {
                if (fsOnboardingError) fsOnboardingError.textContent = "Please select your course.";
                return;
            }
            if (!/^[1-5]$/.test(year)) {
                if (fsOnboardingError) fsOnboardingError.textContent = "Year level must be 1–5.";
                return;
            }
            if (!rawSec || rawSec.length < 1 || rawSec.length > 4) {
                if (fsOnboardingError) fsOnboardingError.textContent = "Section must be 1–4 letters (e.g. A).";
                return;
            }
        }

        // If user submits while live camera is on and no static photo snapped yet, automatically snap live frame!
        if (fsCameraStream && !fsOnboardingPhotoData) {
            snapSelfiePhoto();
        }

        if (fsSubmitOnboardingBtn) {
            fsSubmitOnboardingBtn.disabled = true;
            fsSubmitOnboardingBtn.style.opacity = "0.85";
            fsSubmitOnboardingBtn.innerHTML = '<div class="fs-submit-spinner"></div><span>Saving Profile...</span>';
        }

        try {
            const user = fsCurrentUserContext?.user || auth.currentUser;
            const derivedId = user.email?.match(/^(?:student|staff)\.(\d{7})@securo\.app$/)?.[1] || "";
            const derivedRole = user.email?.startsWith("staff.") ? "staff" : "student";
            const fullName = `${fn} ${ln}`;
            const initials = (fn[0] + ln[0]).toUpperCase();
            // (2026-07-13) Save staff department instead of section; was Staff section
            const staffDepartment = document.getElementById("fsDepartment")?.value?.trim() || "";
            const formattedSection = "";

            const updatedProfile = {
                studentId: fsCurrentUserContext?.profile?.studentId || derivedId,
                firstName: fn,
                lastName: ln,
                name: fullName,
                initials,
                department: staffDepartment,
                course: "",
                yearLevel: "",
                section: formattedSection,
                photoURL: fsOnboardingPhotoData || "",
                avatar: fsOnboardingPhotoData || "",
                email: user.email || "",
                role: "staff",
                onboardingCompleted: true,
                updatedAt: new Date().toISOString()
            };
            try {
                localStorage.setItem('securo_user_role', 'staff');
                localStorage.setItem('securo_onboarding_done_' + user.uid, '1');
            } catch (_) { }
            saveLocalUserDirectoryEntry(user.uid, updatedProfile);
            // (2026-07-13) Save profile fast & run directory marker async; was hanging
            await saveUserProfile(user.uid, updatedProfile);
            saveUserDirectoryMarker(user.uid, updatedProfile).catch(() => { });
            sessionStorage.removeItem('securo_just_registered');

            appState.user.studentId = updatedProfile.studentId;
            appState.user.name = updatedProfile.name;
            appState.user.role = updatedProfile.role;
            appState.user.course = updatedProfile.course;
            appState.user.yearLevel = updatedProfile.yearLevel;
            appState.user.section = updatedProfile.section;
            appState.user.photoURL = updatedProfile.photoURL;
            appState.user.initials = updatedProfile.initials;

            dropdownName.textContent = appState.user.name;
            dropdownId.textContent = appState.user.studentId ? `ID: ${appState.user.studentId}` : "ID: Not linked";

            const initialsEl = document.getElementById("userInitials");
            if (appState.user.photoURL) {
                let chipImg = profileChip.querySelector(".profile-chip-avatar");
                if (!chipImg) {
                    chipImg = document.createElement("img");
                    chipImg.className = "profile-chip-avatar";
                    chipImg.style.cssText = "width:100%; height:100%; border-radius:50%; object-fit:cover; position:absolute; inset:0;";
                    profileChip.insertBefore(chipImg, profileChip.firstChild);
                }
                chipImg.src = appState.user.photoURL;
                chipImg.style.display = "block";
                if (initialsEl) initialsEl.style.display = "none";
            } else {
                const chipImg = profileChip.querySelector(".profile-chip-avatar");
                if (chipImg) chipImg.style.display = "none";
                if (initialsEl) {
                    initialsEl.style.display = "block";
                    initialsEl.textContent = appState.user.initials;
                }
            }

            stopCircleLiveCamera();
            if (fsSubmitOnboardingBtn) {
                fsSubmitOnboardingBtn.disabled = false;
                fsSubmitOnboardingBtn.style.opacity = "1";
                fsSubmitOnboardingBtn.innerHTML = '<span id="fsSubmitText">Save & Continue</span><span class="material-symbols-outlined" id="fsSubmitIcon">arrow_forward</span>';
            }
            if (isStaff) {
                finishOnboardingAndEnterApp();
                return;
            }
            // (2026-07-13) Dynamic guardian URL on save; prev: hardcoded zea link
            const studentId = updatedProfile.studentId || "";
            const guardianUrl = getGuardianBaseUrl() + (studentId ? `?ref=${encodeURIComponent(studentId)}` : "");
            const fsGuardianInviteLink = document.getElementById("fsGuardianInviteLink");
            if (fsGuardianInviteLink) fsGuardianInviteLink.textContent = guardianUrl;
            const fsShareGuardianLinkBtn = document.getElementById("fsShareGuardianLinkBtn");
            if (fsShareGuardianLinkBtn && navigator.share) {
                fsShareGuardianLinkBtn.style.display = "flex";
            }
            goToSlide(1);
        } catch (err) {
            console.warn("Onboarding submit failed:", err);
            if (fsOnboardingError) fsOnboardingError.textContent = "Failed to save profile. Please try again.";
            if (fsSubmitOnboardingBtn) {
                fsSubmitOnboardingBtn.disabled = false;
                fsSubmitOnboardingBtn.style.opacity = "1";
                fsSubmitOnboardingBtn.innerHTML = '<span id="fsSubmitText">Save & Continue</span><span class="material-symbols-outlined" id="fsSubmitIcon">arrow_forward</span>';
            }
        }
    });
}

// (2026-07-13) Require copying link before finishing app; prev: immediate finish
let fsHasCopiedGuardianLink = false;
const fsCopyGuardianLinkBtn = document.getElementById("fsCopyGuardianLinkBtn");
const fsCopyLinkText = document.getElementById("fsCopyLinkText");
const fsShareGuardianLinkBtn = document.getElementById("fsShareGuardianLinkBtn");
const fsProceedToAppBtn = document.getElementById("fsProceedToAppBtn");

function markGuardianLinkCopied() {
    fsHasCopiedGuardianLink = true;
    if (fsProceedToAppBtn) {
        fsProceedToAppBtn.style.opacity = "1";
        fsProceedToAppBtn.style.borderColor = "#5a1fe0";
        fsProceedToAppBtn.style.color = "#5a1fe0";
    }
    const hintIcon = document.getElementById("fsSwipeHintIcon");
    const hintText = document.getElementById("fsSwipeHintText");
    if (hintIcon) {
        hintIcon.textContent = "swipe_left";
        hintIcon.style.color = "#0f9b67";
    }
    if (hintText) {
        hintText.textContent = "Link copied! Swipe left or tap to open app";
        hintText.style.color = "#0f9b67";
    }
}

if (fsCopyGuardianLinkBtn) {
    fsCopyGuardianLinkBtn.addEventListener("click", () => {
        const fsGuardianInviteLink = document.getElementById("fsGuardianInviteLink");
        const link = fsGuardianInviteLink ? fsGuardianInviteLink.textContent.trim() : "";
        if (!link) return;
        const fullTextToCopy = "Dear Parent/Guardian please register here: " + link;
        const copySuccess = () => {
            markGuardianLinkCopied();
            if (fsCopyLinkText) fsCopyLinkText.textContent = "Copied to Clipboard!";
            fsCopyGuardianLinkBtn.style.background = "linear-gradient(135deg, #0f9b67, #0a7a52)";
            setTimeout(() => {
                if (fsCopyLinkText) fsCopyLinkText.textContent = "Copy Link";
                fsCopyGuardianLinkBtn.style.background = "linear-gradient(135deg, #5a1fe0, #4311c5)";
            }, 2500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(fullTextToCopy).then(copySuccess).catch(() => {
                const el = document.createElement("textarea");
                el.value = fullTextToCopy;
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
                copySuccess();
            });
        } else {
            const el = document.createElement("textarea");
            el.value = fullTextToCopy;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            copySuccess();
        }
    });
}

if (fsShareGuardianLinkBtn) {
    fsShareGuardianLinkBtn.addEventListener("click", () => {
        const fsGuardianInviteLink = document.getElementById("fsGuardianInviteLink");
        const link = fsGuardianInviteLink ? fsGuardianInviteLink.textContent.trim() : "";
        if (navigator.share && link) {
            navigator.share({
                title: "Securo - Parent Link",
                text: "Dear Parent/Guardian please register here:",
                url: link
            }).then(() => markGuardianLinkCopied()).catch(() => { });
        }
    });
}

if (fsProceedToAppBtn) {
    fsProceedToAppBtn.addEventListener("click", () => {
        if (!fsHasCopiedGuardianLink) {
            showToast("Please copy the parent link first to continue", "info");
            return;
        }
        finishOnboardingAndEnterApp();
    });
}

// Touch swipe handling for 2-slide carousel
let fsTouchStartX = 0;
let fsTouchStartY = 0;
if (fsOnboardingScreen) {
    fsOnboardingScreen.addEventListener("touchstart", (e) => {
        if (e.touches && e.touches.length > 0) {
            fsTouchStartX = e.touches[0].clientX;
            fsTouchStartY = e.touches[0].clientY;
        }
    }, { passive: true });
    fsOnboardingScreen.addEventListener("touchend", (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const diffX = e.changedTouches[0].clientX - fsTouchStartX;
        const diffY = e.changedTouches[0].clientY - fsTouchStartY;
        // (2026-07-13) Swipe left advances step 1 if fields filled; prev: blocked swipe
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
            if (diffX < 0) {
                // Swipe left
                if (currentOnboardingSlide === 0) {
                    const fn = fsFirstName ? fsFirstName.value.trim() : "";
                    const ln = fsLastName ? fsLastName.value.trim() : "";
                    const course = fsCourse ? fsCourse.value.trim() : "";
                    const year = fsYearLevel ? fsYearLevel.value.trim() : "";
                    const sec = fsSection ? fsSection.value.trim() : "";
                    const isFilled = fn.length >= 2 && ln.length >= 2 && Boolean(course) && /^[1-5]$/.test(year) && sec.length >= 1;
                    if (isFilled) {
                        if (typeof fsOnboardingForm.requestSubmit === 'function') {
                            fsOnboardingForm.requestSubmit();
                        } else {
                            fsOnboardingForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }
                    } else {
                        if (fsOnboardingError) fsOnboardingError.textContent = "Please complete all fields to continue.";
                    }
                    return;
                } else if (currentOnboardingSlide === 1) {
                    if (!fsHasCopiedGuardianLink) {
                        showToast("Please copy the parent link first to continue", "info");
                        return;
                    }
                    finishOnboardingAndEnterApp();
                }
            } else if (diffX > 0) {
                // Swipe right
                if (currentOnboardingSlide === 1) {
                    goToSlide(0);
                }
            }
        }
    }, { passive: true });
}

// (2026-07-13) Request push notification permissions on user auth; was missing
onAuthStateChanged(auth, async (user) => {
    if (window.Capacitor?.Plugins?.LocalNotifications) {
        window.Capacitor.Plugins.LocalNotifications.requestPermissions().catch(() => { });
    } else if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => { });
    }
    // (2026-07-13) Route app to role-selection & web to landing; was login.html
    if (window.__securoLandingPending || window.__securoAppPending) {
        return;
    }
    if (!user) {
        localStorage.removeItem('securo_session_token');
        sessionStorage.removeItem('securo_login_pending');
        const isNative = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web')) ||
            window.location.protocol.startsWith('file:') ||
            window.location.protocol.startsWith('capacitor:') ||
            !!window.cordova;
        window.location.replace(isNative ? "../public/role-selection.html" : "../index.html");
        return;
    }

    // (2026-07-13) Broadcast live staff presence heartbeat; was missing
    localStorage.setItem('securo_session_token', user.uid);
    sessionStorage.removeItem('securo_login_pending');
    startUserPresenceHeartbeat(user.uid);
    // (2026-07-13) Start live GAD unread & admin presence watchers; was modal only
    if (typeof initGadMessagingWatchers === "function") initGadMessagingWatchers(user.uid);

    // (2026-07-13) Role-based auth routing and onboarding gate; was hardcoded
    appState.user.uid = user.uid;
    const isJustRegistered = sessionStorage.getItem('securo_just_registered') === '1';
    let cachedProfile = null;
    try {
        const raw = localStorage.getItem("securo_user_directory");
        const dir = raw ? JSON.parse(raw) : {};
        cachedProfile = dir[user.uid] || null;
    } catch (e) { }
    if (!cachedProfile) {
        try {
            const localUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
            cachedProfile = localUsers.find(u => String(u.id) === String(user.uid));
        } catch (e) { }
    }

    // (2026-07-13) Apply staff theme before view switch; was unstyled
    const earlyIsStaff = cachedProfile?.role === 'staff' || user.email?.startsWith('staff.');
    if (earlyIsStaff) {
        applyRoleTheme('staff');
        try { localStorage.setItem('securo_user_role', 'staff'); } catch (_) { }
    }

    if (cachedProfile?.role === 'guardian' || user.email?.startsWith('guardian.')) {
        window.location.replace("../parent/parent.html");
        return;
    }

    // (2026-07-13) Skip permissions check on desktop; was halting on return
    const isNativeApk = !!(window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : window.Capacitor.platform !== 'web'));
    const isDesktopDevice = !isNativeApk && (window.innerWidth >= 768 || window.screen.width >= 992) && !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (!isDesktopDevice) {
        const camAllowed = localStorage.getItem('securo_camera_granted') === 'true';
        const locAllowed = localStorage.getItem('securo_location_granted') === 'true';
        if (!camAllowed || !locAllowed) {
            window.location.replace('../public/permissions-onboarding.html');
            return;
        }
    }

    // (2026-07-13) Watch for web permission revocation; prev: unmonitored
    if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'camera' }).then(p => {
            p.addEventListener('change', () => {
                if (p.state === 'denied') {
                    localStorage.setItem('securo_camera_granted', 'false');
                    localStorage.removeItem('securo_permissions_completed');
                    window.location.replace('../public/permissions-onboarding.html');
                }
            });
        }).catch(() => { });
        navigator.permissions.query({ name: 'geolocation' }).then(p => {
            p.addEventListener('change', () => {
                if (p.state === 'denied') {
                    localStorage.setItem('securo_location_granted', 'false');
                    localStorage.removeItem('securo_permissions_completed');
                    window.location.replace('../public/permissions-onboarding.html');
                }
            });
        }).catch(() => { });
    }

    // (2026-07-13) Show appView immediately unless fresh signup; was blank white
    if (!isJustRegistered && appView) {
        appView.classList.add("active");
        if (!appState.initialViewDone) {
            setActiveView("map");
            appState.initialViewDone = true;
        }
    }

    // --- Step 2: Load profile & data in the background ---
    try {
        // (2026-07-13) Hydrate late staff profile on slow load & retry null; was stuck
        const PROFILE_TIMEOUT = Symbol('profile_timeout');
        const fetchProfileWithRetry = async () => {
            let p = await getUserProfile(user.uid).catch(() => null);
            if (!p) {
                await new Promise(r => setTimeout(r, 900));
                p = await getUserProfile(user.uid).catch(() => null);
            }
            return p;
        };
        const profilePromise = fetchProfileWithRetry();
        const racedProfile = await Promise.race([
            profilePromise,
            new Promise(r => setTimeout(() => r(PROFILE_TIMEOUT), 4500))
        ]);
        const profileTimedOut = racedProfile === PROFILE_TIMEOUT;
        let profile = profileTimedOut ? (cachedProfile || { onboardingCompleted: true }) : racedProfile;
        if (!profileTimedOut && profile) {
            saveLocalUserDirectoryEntry(user.uid, profile);
        }
        if (profileTimedOut) {
            profilePromise.then((lateProfile) => {
                if (!lateProfile || auth.currentUser?.uid !== user.uid) return;
                saveLocalUserDirectoryEntry(user.uid, lateProfile);
                appState.profile = lateProfile;
                const lateDerivedId = user.email?.match(/^(?:student|staff)\.(\d{7})@securo\.app$/)?.[1] || "";
                appState.user.studentId = lateProfile.studentId || lateDerivedId || appState.user.studentId;
                if (lateProfile.name) {
                    appState.user.name = lateProfile.name;
                    appState.user.initials = lateProfile.initials || lateProfile.name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
                }
                if (lateProfile.department || lateProfile.section) appState.user.section = lateProfile.department || lateProfile.section;
                if (lateProfile.photoURL || lateProfile.avatar) appState.user.photoURL = lateProfile.photoURL || lateProfile.avatar;
                if (dropdownId) dropdownId.textContent = appState.user.studentId ? `ID: ${appState.user.studentId}` : "ID: Not linked";
                if (dropdownName) dropdownName.textContent = appState.user.name;
                const initEl = document.getElementById("userInitials");
                if (appState.user.photoURL && profileChip) {
                    let cImg = profileChip.querySelector('.profile-chip-avatar');
                    if (!cImg) {
                        cImg = document.createElement('img');
                        cImg.className = 'profile-chip-avatar';
                        cImg.style.cssText = 'width:100%; height:100%; border-radius:50%; object-fit:cover; position:absolute; inset:0;';
                        profileChip.insertBefore(cImg, profileChip.firstChild);
                    }
                    cImg.src = appState.user.photoURL;
                    cImg.style.display = 'block';
                    if (initEl) initEl.style.display = 'none';
                } else if (initEl) {
                    initEl.textContent = appState.user.initials;
                }
                const rName = String(lateProfile.name || '').trim().toLowerCase();
                const okName = Boolean(rName && rName.length >= 2 && rName !== 'staff member' && rName !== 'staff' && rName !== 'user');
                if (!lateProfile.onboardingCompleted || !okName) {
                    triggerFullscreenOnboarding(user, lateProfile);
                }
            }).catch(() => {});
        }
        if (!profile) profile = cachedProfile || { onboardingCompleted: false };
        if (profile?.role === 'guardian' && user.email !== ADMIN_EMAIL) {
            window.location.replace("../parent/parent.html");
            return;
        }
        if (profile?.role === 'admin' || user.email === ADMIN_EMAIL) {
            window.location.replace("../admin/admin.html");
            return;
        }

        // (2026-07-13) Respect local & remote onboarding flag; was re-prompting on reload
        const isStaff = true;
        const rawName = String(profile?.name || '').trim();
        const lowerName = rawName.toLowerCase();
        const hasValidName = Boolean(rawName && rawName.length >= 2 && lowerName !== 'staff member' && lowerName !== 'student' && lowerName !== 'staff' && lowerName !== 'user' && !lowerName.startsWith('staff.'));
        const localOnboardDone = localStorage.getItem('securo_onboarding_done_' + user.uid) === '1';
        const alreadyCompleted = localOnboardDone || (Boolean(profile?.onboardingCompleted) && hasValidName);
        const needsOnboarding = !alreadyCompleted && !profileTimedOut && (isJustRegistered || !hasValidName || !profile?.onboardingCompleted);

        if (needsOnboarding) {
            triggerFullscreenOnboarding(user, profile || cachedProfile);
            return;
        }

        // (2026-07-13) Close onboarding overlay when complete; was stuck active
        sessionStorage.removeItem('securo_just_registered');
        if (fsOnboardingScreen) fsOnboardingScreen.classList.remove("active");
        stopCircleLiveCamera();
        appView.classList.add("active");
        if (!appState.initialViewDone) {
            setActiveView("map");
            appState.initialViewDone = true;
        }

        const derivedId = user.email?.match(/^(?:student|staff)\.(\d{7})@securo\.app$/)?.[1] || "";
        const derivedRole = user.email?.startsWith('staff.') ? 'staff' : 'student';
        appState.user.studentId = profile?.studentId || derivedId;
        appState.user.name = profile?.name || user.displayName || (isStaff ? "Staff Member" : "Student");
        // (2026-07-13) Persist staff role & apply theme; was unpersisted
        appState.user.role = profile?.role || derivedRole;
        try { localStorage.setItem('securo_user_role', appState.user.role); } catch (_) { }
        applyRoleTheme(appState.user.role);
        appState.user.section = profile?.section || (isStaff ? "Staff" : "");
        appState.user.photoURL = profile?.photoURL || profile?.avatar || "";
        appState.user.initials = profile?.initials || appState.user.name.split(" ").map(n => n[0]).join("").toUpperCase();

        if (profile?.role === 'student') {
            syncGuardianLinksForStudent(user.uid, {
                studentId: appState.user.studentId,
                name: appState.user.name
            }).catch((syncError) => console.warn("Guardian link profile sync failed:", syncError));
            // (2026-07-13) Sync and render links on profile load; prev: count only
            getLinksForStudent(appState.user.studentId, user.uid)
                .then((links) => {
                    const validLinks = Array.isArray(links) ? links : [];
                    appState.acceptedGuardianCount = validLinks.filter((link) => link.status === "accepted").length;
                    appState.guardianLinkReminders = validLinks;
                    renderGuardianWatchers(validLinks);
                    refreshLocationTracking();
                })
                .catch((linkError) => {
                    console.warn("Guardian link count load failed:", linkError);
                    appState.acceptedGuardianCount = 0;
                    refreshLocationTracking();
                });
        }

        dropdownId.textContent = appState.user.studentId ? `ID: ${appState.user.studentId}` : "ID: Not linked";
        dropdownName.textContent = appState.user.name;

        // Initialize emergency contacts widget for SOS page
        try {
            await renderEmergencyContactWidget('emergencyContactsWidget', user.uid);
            Logger.info('Index', 'Emergency contacts widget rendered');
        } catch (error) {
            Logger.error('Index', 'Failed to render emergency contacts', error);
        }

        // Render avatar image if set, else display initials
        const initialsEl = document.getElementById("userInitials");
        if (appState.user.photoURL) {
            let chipImg = profileChip.querySelector('.profile-chip-avatar');
            if (!chipImg) {
                chipImg = document.createElement('img');
                chipImg.className = 'profile-chip-avatar';
                chipImg.style.cssText = 'width:100%; height:100%; border-radius:50%; object-fit:cover; position:absolute; inset:0;';
                profileChip.insertBefore(chipImg, profileChip.firstChild);
            }
            chipImg.src = appState.user.photoURL;
            chipImg.style.display = 'block';
            if (initialsEl) initialsEl.style.display = 'none';
        } else {
            const chipImg = profileChip.querySelector('.profile-chip-avatar');
            if (chipImg) chipImg.style.display = 'none';
            if (initialsEl) {
                initialsEl.style.display = 'block';
                initialsEl.textContent = appState.user.initials;
            }
        }

        if (user.email === ADMIN_EMAIL) {
            const adminLink = document.getElementById("adminLink");
            if (adminLink) adminLink.style.display = 'flex';
            if (headerTitle) headerTitle.textContent = "Admin Access";
            if (headerLeadingIcon) headerLeadingIcon.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px; color:var(--primary);">admin_panel_settings</span>';
        } else if (profile?.role === 'guardian') {
            if (headerTitle) headerTitle.textContent = "Guardian Portal";
            if (headerLeadingIcon) headerLeadingIcon.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px; color:var(--red);">family_restroom</span>';
            if (dropdownId) dropdownId.style.display = 'none';
        } else if (profile?.role === 'staff') {
            if (headerTitle) headerTitle.textContent = "Staff Map";
            if (headerLeadingIcon) headerLeadingIcon.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px; color:var(--green);">badge</span>';
        }

        // Load data in the background â€” non-blocking
        initializeAttendance().catch(e => console.warn("Attendance init failed:", e));
        loadVaultItems().catch(e => console.warn("Vault init failed:", e));
        if (notificationUnsub) notificationUnsub();
        if (guardianRequestUnsub) guardianRequestUnsub();
        if (guardianLinkReminderUnsub) guardianLinkReminderUnsub();
        notificationUnsub = subscribeToAccountNotifications(user.uid, renderAccountNotifications);

        // (2026-07-13) Subscribe guardian requests for students only; was all
        if (appState.user.role === 'student') {
            guardianRequestUnsub = subscribeToGuardianRequests(appState.user.studentId, (requests) => {
                appState.pendingGuardianRequests = Array.isArray(requests) ? requests : [];
                // (2026-07-13) Persist student pending requests offline; was memory only
                try { localStorage.setItem('securo_student_pending_requests', JSON.stringify(appState.pendingGuardianRequests)); } catch (_) { }
                syncNotificationViews();
                requests.forEach(req => showGuardianRequestNotification(req));
            }, user.uid);
            guardianLinkReminderUnsub = subscribeToStudentLinks(user.uid, (links) => {
                appState.guardianLinkReminders = Array.isArray(links) ? links : [];
                syncNotificationViews();
                // (2026-07-13) Show accepted guardians on map chip; was not displayed
                renderGuardianWatchers(appState.guardianLinkReminders);
            }, appState.user.studentId);
        }

        // (2026-07-13) Listen for realtime guardian requests; was missing listener
        try {
            const securoChannel = new BroadcastChannel('securo_users_channel');
            securoChannel.onmessage = (event) => {
                const data = event.data;
                if (!data) return;
                if (data.type === 'guardian_link_created' || data.type === 'guardian_link_updated') {
                    const payload = data.payload || data;
                    const curUid = user.uid;
                    const curSid = String(appState.user?.studentId || '').trim();
                    const targetSid = String(payload.studentId || '').trim();
                    const targetUid = payload.studentUid || '';
                    if ((targetUid && targetUid === curUid) || (targetSid && targetSid === curSid)) {
                        // (2026-07-13) Append pending request to state & cache; was toast only
                        const reqObj = {
                            id: data.linkId || payload.id,
                            studentId: payload.studentId || curSid,
                            studentUid: payload.studentUid || curUid,
                            guardianName: payload.guardianName || "A parent or guardian",
                            guardianId: payload.guardianId || payload.guardianUid,
                            guardianEmail: payload.guardianEmail,
                            message: `${payload.guardianName || "A parent or guardian"} wants to link to your account.`,
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        };
                        const existingIdx = appState.pendingGuardianRequests.findIndex(r => r.id === reqObj.id);
                        if (existingIdx >= 0) {
                            appState.pendingGuardianRequests[existingIdx] = reqObj;
                        } else {
                            appState.pendingGuardianRequests.unshift(reqObj);
                        }
                        try { localStorage.setItem('securo_student_pending_requests', JSON.stringify(appState.pendingGuardianRequests)); } catch (_) { }
                        showGuardianRequestNotification(reqObj, true);
                        syncNotificationViews();
                    }
                } else if (data.type === 'guardian_link_responded') {
                    if (data.studentUid === user.uid) {
                        if (data.response === 'accepted') {
                            showStatus('Guardian Connected', 'Your parent or guardian accepted your link request.');
                        }
                        getLinksForStudent(appState.user?.studentId, user.uid).then(validLinks => {
                            appState.guardianLinkReminders = Array.isArray(validLinks) ? validLinks : [];
                            renderGuardianWatchers(appState.guardianLinkReminders);
                            syncNotificationViews();
                        }).catch(() => { });
                    }
                }
            };
        } catch (_) { }
    } catch (error) {
        Logger.error("Auth", "Auth state processing error", error);
    }
});

// (2026-07-13) Keep invite button & parent bar visible; was hidden on load
function renderGuardianWatchers(links) {
    const isStaff = appState.user?.role === 'staff' || document.body.classList.contains('role-staff') || document.documentElement.classList.contains('role-staff');
    const parentBar = document.getElementById("studentParentBar");
    if (isStaff) {
        if (parentBar) parentBar.style.display = "none";
        return;
    }
    if (parentBar && (appState.currentPage === 'map' || !appState.currentPage)) {
        parentBar.style.display = "flex";
    }
    const container = document.getElementById("studentParentChips");
    if (!container) return;
    const accepted = (links || []).filter(l => l.status === "accepted");
    const inviteBarBtnEl = document.getElementById("inviteParentBarBtn");
    if (inviteBarBtnEl) inviteBarBtnEl.style.display = "inline-flex";
    if (!accepted.length) {
        container.innerHTML = `
                    <div class="parent-selector-chip" id="noParentsChip" style="background: rgba(255, 255, 255, 0.85); border: 1px dashed rgba(90, 31, 224, 0.25); color: #64748b; font-weight: 500; cursor: pointer;" title="Tap to invite parents">
                        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">family_restroom</span>
                        <span>No parents watching over you yet</span>
                    </div>
                `;
        const noChip = document.getElementById("noParentsChip");
        if (noChip) noChip.onclick = () => openInviteParentModal();
        return;
    }
    const localUsers = (() => {
        try { return JSON.parse(localStorage.getItem("securo_users_local") || "[]"); } catch (e) { return []; }
    })();
    container.innerHTML = '';
    accepted.forEach(link => {
        const gid = link.guardianId || link.guardianUid;
        const email = (link.guardianEmail || "").toLowerCase().trim();
        const localMatch = localUsers.find(u =>
            (gid && String(u.id || u.uid || '') === String(gid)) ||
            (email && (String(u.email || '').toLowerCase().trim() === email || String(u.personalEmail || '').toLowerCase().trim() === email))
        );
        const name = (localMatch?.name || link.guardianName || link.guardianEmail || "Parent").trim();
        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0])
            .join("")
            .toUpperCase() || "P";

        const chip = document.createElement('div');
        chip.className = 'parent-selector-chip active';
        chip.title = `Hold to remove ${name}`;
        chip.style.userSelect = 'none';
        // (2026-07-13) Show watching badge only if live online; was static badge
        const isLive = Boolean(link.isWatchingLive);
        chip.innerHTML = `
                    <span class="parent-avatar">${escapeHtml(initials)}</span>
                    <span>${escapeHtml(name)}</span>
                    ${isLive ? `
                    <span class="watching-live-badge">
                        <span class="watching-dot"></span>
                        <span>Watching</span>
                    </span>` : ''}
                `;

        let holdTimer = null;
        let isLongPress = false;
        const startHold = () => {
            isLongPress = false;
            holdTimer = setTimeout(async () => {
                isLongPress = true;
                // (2026-07-13) Use styled modal for parent removal; was native confirm
                if (await UI.showModal('Remove Parent', `Remove parent ${name} from watching over your account? You can re-invite them anytime.`, { type: 'warning', showCancel: true, confirmText: 'Remove' })) {
                    try {
                        // (2026-07-13) Pass guardian & student pair to remove all matching links
                        await removeGuardianLink(link.id, {
                            guardianId: link.guardianId || link.guardianUid,
                            guardianEmail: link.guardianEmail,
                            studentId: link.studentId,
                            studentUid: appState.user?.uid || auth.currentUser?.uid
                        });
                        showToast("Parent removed successfully.");
                    } catch (e) {
                        showToast("Failed to remove parent.", "error");
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

        container.appendChild(chip);
    });
}

// (2026-07-13) Fix parent invite link studentId lookup; prev: missing ref
function openInviteParentModal() {
    const modal = document.getElementById("inviteParentModal");
    const urlText = document.getElementById("guardianInviteUrlText");
    const shareBtn = document.getElementById("shareGuardianInviteBtn");
    const copyBtnLabel = document.getElementById("copyInviteBtnLabel");
    if (!modal) return;
    const studentId = appState.user?.studentId ||
        appState.profile?.studentId ||
        (appState.user?.email?.match(/^(?:student|staff)\.(\d{7})@securo\.app$/)?.[1]) ||
        (() => {
            const text = document.getElementById("dropdownId")?.textContent || "";
            const match = text.match(/ID:\s*(\d{7})/);
            return match ? match[1] : "";
        })() ||
        (() => {
            try {
                const raw = localStorage.getItem("securo_user_directory");
                if (!raw) return "";
                const parsed = JSON.parse(raw);
                const uid = (typeof auth !== "undefined" && auth?.currentUser?.uid) || appState.user?.uid;
                return uid && parsed[uid]?.studentId ? parsed[uid].studentId : "";
            } catch (_) { return ""; }
        })() || "";
    // (2026-07-13) Use dynamic getGuardianBaseUrl; prev: hardcoded zea base
    const guardianUrl = getGuardianBaseUrl() + (studentId ? `?ref=${encodeURIComponent(studentId)}` : "");
    if (urlText) urlText.textContent = guardianUrl;
    if (copyBtnLabel) copyBtnLabel.textContent = "Copy Invite Link";
    if (shareBtn) {
        if (navigator.share) {
            shareBtn.style.display = "flex";
            shareBtn.onclick = () => {
                navigator.share({
                    title: "Securo Guardian Registration",
                    text: "Register as my guardian on Securo to monitor live safety and emergency alerts.",
                    url: guardianUrl
                }).catch(() => { });
            };
        } else {
            shareBtn.style.display = "none";
        }
    }
    const copyBtn = document.getElementById("copyGuardianInviteBtn");
    if (copyBtn) {
        copyBtn.onclick = () => {
            const notifyCopied = () => {
                if (copyBtnLabel) copyBtnLabel.textContent = "Copied to Clipboard!";
                showStatus("Link Copied", "Guardian invite link copied to clipboard. Send it to your parents!");
                setTimeout(() => { if (copyBtnLabel) copyBtnLabel.textContent = "Copy Invite Link"; }, 2500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(guardianUrl).then(notifyCopied).catch(() => {
                    const ta = document.createElement("textarea");
                    ta.value = guardianUrl;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand("copy");
                    document.body.removeChild(ta);
                    notifyCopied();
                });
            } else {
                const ta = document.createElement("textarea");
                ta.value = guardianUrl;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                notifyCopied();
            }
        };
    }
    // (2026-07-13) Wire email input and invite sender; was copy link only
    const sendEmailBtn = document.getElementById("sendGuardianInviteEmailBtn");
    const emailInput = document.getElementById("guardianInviteEmailInput");
    if (sendEmailBtn && emailInput) {
        emailInput.value = "";
        sendEmailBtn.onclick = async () => {
            const email = emailInput.value.trim().toLowerCase();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showStatus("Invalid Email", "Please enter a valid email address for your guardian.");
                return;
            }
            sendEmailBtn.disabled = true;
            const prevBtnHtml = sendEmailBtn.innerHTML;
            sendEmailBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;">sync</span><span>Sending...</span>`;
            // (2026-07-13) Send account notification; was mailto email draft fallback
            try {
                await createGuardianLinkFromStudent({
                    studentUid: appState.user?.uid,
                    studentId: studentId,
                    studentName: appState.profile?.name || appState.user?.name || "Student",
                    guardianEmail: email
                });
                showStatus("Notification Sent", `Child link notification sent to ${email} for their guardian account.`);
                emailInput.value = "";
                modal.classList.remove("active");
            } catch (err) {
                showStatus("Request Failed", err.message || `Could not send request to ${email}.`, "error");
            } finally {
                sendEmailBtn.disabled = false;
                sendEmailBtn.innerHTML = prevBtnHtml;
            }
        };
        emailInput.onkeydown = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendEmailBtn.click();
            }
        };
    }
    const closeBtn = document.getElementById("closeInviteParentBtn");
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove("active");
    }
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.remove("active");
    };
    modal.classList.add("active");
}

const inviteParentBarBtn = document.getElementById("inviteParentBarBtn");
if (inviteParentBarBtn) {
    inviteParentBarBtn.addEventListener("click", () => openInviteParentModal());
}
const noParentsChipInit = document.getElementById("noParentsChip");
if (noParentsChipInit) {
    noParentsChipInit.addEventListener("click", () => openInviteParentModal());
}

// (2026-07-13) Actionable guardian request prompt modal; was static banner
function showGuardianRequestNotification(request, force = false) {
    if (!request?.id) return;
    if (!force && seenGuardianRequestToasts.has(request.id)) return;
    seenGuardianRequestToasts.add(request.id);

    const existing = document.getElementById('guardianNotify');
    if (existing) existing.remove();

    const notify = document.createElement('div');
    notify.className = 'guardian-notify';
    notify.id = 'guardianNotify';
    notify.style.cursor = 'pointer';
    notify.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <div style="width:44px; height:44px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        <span class="material-symbols-outlined">family_restroom</span>
                    </div>
                    <div style="flex:1;">
                        <strong style="display:block; font-size:0.95rem; color:var(--ink);">Parent / Guardian Request</strong>
                        <span style="font-size:0.8rem; color:var(--muted);">${escapeHtml(request.guardianName || "A parent or guardian")} wants to link to your account.</span>
                    </div>
                </div>
                <div style="display:flex; gap:8px; margin-top:10px;">
                    <button class="notif-action-btn accept" type="button" style="flex:1; padding:8px; border-radius:10px; font-weight:700; font-size:0.84rem; cursor:pointer;" data-request-id="${request.id}" data-request-status="accepted">Accept</button>
                    <button class="notif-action-btn reject" type="button" style="flex:1; padding:8px; border-radius:10px; font-weight:700; font-size:0.84rem; cursor:pointer;" data-request-id="${request.id}" data-request-status="rejected">Decline</button>
                </div>
            `;
    notify.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-request-id][data-request-status]');
        if (btn) {
            e.stopPropagation();
            const reqId = btn.dataset.requestId;
            const status = btn.dataset.requestStatus;
            const siblingBtn = btn.parentElement ? btn.parentElement.querySelector(`button:not([data-request-status="${status}"])`) : null;
            setButtonBusy(btn, true);
            if (siblingBtn) siblingBtn.disabled = true;
            // (2026-07-13) Remove responded request from local storage; was not cleared
            respondToGuardianLink(reqId, status, appState.user?.uid, appState.profile).then(() => {
                notify.remove();
                appState.pendingGuardianRequests = (appState.pendingGuardianRequests || []).filter((item) => String(item.id) !== String(reqId));
                try { localStorage.setItem('securo_student_pending_requests', JSON.stringify(appState.pendingGuardianRequests)); } catch (_) { }
                syncNotificationViews();
                showStatus(status === 'accepted' ? 'Guardian Linked' : 'Request Declined', status === 'accepted' ? 'Parent is now linked to your account.' : 'Guardian request was declined.');
            }).catch(err => {
                setButtonBusy(btn, false);
                if (siblingBtn) siblingBtn.disabled = false;
                showStatus('Error', err.message || 'Could not update request', 'error');
            });
            return;
        }
        openNotifications();
        notify.remove();
    });
    document.body.appendChild(notify);
    setTimeout(() => { if (notify && notify.parentNode) notify.remove(); }, 12000);
}

if (notifList) {
    // (2026-07-13) Handle All/Unread tabs, mark-read & actions; was actions only
    notifList.addEventListener("click", async (event) => {
        const filterBtn = event.target.closest("[data-notif-filter]");
        if (filterBtn) {
            event.stopPropagation();
            activeNotifFilter = filterBtn.dataset.notifFilter || "all";
            syncNotificationViews();
            return;
        }
        if (event.target.closest(".notif-mark-all-btn")) {
            event.stopPropagation();
            const unread = (appState.accountNotifications || []).filter(n => n?.id && !n.isRead);
            unread.forEach(n => { n.isRead = true; });
            try { localStorage.setItem('securo_student_notifications', JSON.stringify(appState.accountNotifications)); } catch (_) { }
            syncNotificationViews();
            await Promise.all(unread.map(n => markAccountNotificationRead(n.id).catch(() => { })));
            return;
        }
        const actionButton = event.target.closest("[data-request-id][data-request-status]");
        if (!actionButton) {
            const notifRow = event.target.closest("[data-notif-item-id]");
            const nid = notifRow?.dataset?.notifItemId;
            if (nid) {
                const target = (appState.accountNotifications || []).find(n => String(n.id) === String(nid));
                if (target && !target.isRead) {
                    target.isRead = true;
                    try { localStorage.setItem('securo_student_notifications', JSON.stringify(appState.accountNotifications)); } catch (_) { }
                    syncNotificationViews();
                    markAccountNotificationRead(nid).catch(() => { });
                }
                // (2026-07-13) Redirect GAD & chat notifications to chat/GAD; was no-op
                if (target) {
                    const nType = String(target.type || '').toLowerCase();
                    const nText = `${target.title || ''} ${target.message || ''}`.toLowerCase();
                    if (nType === 'gad_bulletin') {
                        closeNotifications();
                        // (2026-07-13) Use setActiveView for GAD redirect; was switchPage
                        if (typeof setActiveView === 'function') setActiveView('gad');
                    } else if (nType === 'chat_message' || nType === 'gad' || nType === 'gad_reply' || nText.includes('gad') || nText.includes('reply') || nText.includes('message') || nText.includes('support')) {
                        closeNotifications();
                        if (typeof openChat === 'function') openChat();
                    }
                }
            }
            return;
        }
        event.stopPropagation();
        const requestId = actionButton.dataset.requestId;
        const status = actionButton.dataset.requestStatus;
        const notificationId = actionButton.dataset.notificationId || "";
        const siblingBtn = actionButton.parentElement ? actionButton.parentElement.querySelector(`button:not([data-request-status="${status}"])`) : null;
        setButtonBusy(actionButton, true);
        if (siblingBtn) siblingBtn.disabled = true;
        try {
            await window.handleGuardianResponse(requestId, status, notificationId);
        } catch (err) {
            setButtonBusy(actionButton, false);
            if (siblingBtn) siblingBtn.disabled = false;
        } finally {
            if (document.body.contains(actionButton)) {
                setButtonBusy(actionButton, false);
                if (siblingBtn) siblingBtn.disabled = false;
            }
        }
    });
}

window.handleGuardianResponse = async (requestId, status, notificationId = "") => {
    try {
        const request = (appState.pendingGuardianRequests || []).find((item) => String(item.id) === String(requestId));
        // (2026-07-13) Filter responded request from student cache; was retained
        appState.pendingGuardianRequests = (appState.pendingGuardianRequests || []).filter((item) => String(item.id) !== String(requestId));
        try { localStorage.setItem('securo_student_pending_requests', JSON.stringify(appState.pendingGuardianRequests)); } catch (_) { }
        syncNotificationViews();
        await respondToGuardianLink(requestId, status, appState.user.uid, {
            studentId: appState.user.studentId,
            name: appState.user.name
        });
        if (notificationId) {
            await markAccountNotificationRead(notificationId, {
                resolvedStatus: status
            }).catch(() => { });
        }
        // (2026-07-13) Mark resolved status in cached notifications; was memory desync
        appState.accountNotifications = (appState.accountNotifications || []).map(item => {
            if ((notificationId && item.id === notificationId) || (requestId && item.requestId === requestId)) {
                return { ...item, isRead: true, resolvedStatus: status };
            }
            return item;
        });
        try { localStorage.setItem('securo_student_notifications', JSON.stringify(appState.accountNotifications)); } catch (_) { }
        syncNotificationViews();
        if (!notificationId && request?.id) {
            await sendAccountNotification({
                userId: appState.user.uid,
                type: "guardian_request",
                title: "Guardian tracking request",
                message: `${request.guardianName || "A parent or guardian"} wanted to link to your account.`,
                sourceUserId: request.guardianId || "",
                sourceName: request.guardianName || "",
                requestId: request.id,
                studentId: request.studentId || appState.user.studentId || "",
                resolvedStatus: status,
                isRead: true
            }).catch(() => { });
        }

        // Cleanup UI
        const notify = document.getElementById('guardianNotify');
        if (notify) notify.remove();

        if (status === 'accepted') {
            appState.acceptedGuardianCount = Number(appState.acceptedGuardianCount || 0) + 1;
            refreshLocationTracking();
            showStatus("Link Accepted", "Your guardian can now monitor your safety status.", "success");
        } else {
            showStatus("Link Declined", "The request was declined.");
        }
    } catch (err) {
        console.warn("Link response failed:", err);
        showStatus("Error", "Could not process request.", "error");
    }
};

window.downloadMedia = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showStatus("Downloading", "Saving media to your device...");
};

// Profile Dropdown Toggle (Date: 2026-05-01)
// Handler is registered earlier alongside the notif bell listener.

// Logout from Dropdown (Date: 2026-05-01)
logoutLink.addEventListener("click", async () => {
    const confirmed = await showLogoutConfirm();
    if (confirmed) {
        // (2026-07-13) Redirect to login.html on logout; was landing.html
        if (typeof stopTracking === "function") stopTracking();
        await logout();
        window.location.href = "../public/login.html";
    }
});

function showStatus(title, msg, type = 'success') {
    const statusModal = document.getElementById("statusModal");
    // (2026-07-13) Scope status elements & guarantee fallback message; was raw msg
    const statusTitle = statusModal?.querySelector("#statusTitle") || document.getElementById("statusTitle");
    const statusMessage = statusModal?.querySelector("#statusMessage") || document.getElementById("statusMessage");
    const statusIconWrap = statusModal?.querySelector("#statusIconWrap") || document.getElementById("statusIconWrap");
    const statusIcon = statusModal?.querySelector("#statusIcon") || document.getElementById("statusIcon");
    const okBtn = statusModal?.querySelector("#statusOkBtn") || document.getElementById("statusOkBtn");

    if (statusTitle) statusTitle.textContent = title || (type === 'success' ? 'Success!' : 'Notice');
    if (statusMessage) statusMessage.textContent = msg || (type === 'success' ? 'Your action has been completed successfully.' : 'An unexpected issue occurred. Please try again.');

    statusIconWrap.classList.remove('success', 'error');
    statusIconWrap.classList.add(type);

    if (type === 'success') {
        statusIcon.textContent = 'check_circle';
        okBtn.style.background = 'linear-gradient(135deg, #0f9b67, #0c7e54)';
        okBtn.style.boxShadow = '0 12px 24px rgba(15, 155, 103, 0.3)';
    } else {
        statusIcon.textContent = 'warning';
        okBtn.style.background = 'linear-gradient(135deg, #d11f34, #a8192a)';
        okBtn.style.boxShadow = '0 12px 24px rgba(209, 31, 52, 0.3)';
    }

    statusModal.classList.add("active");
    return new Promise(resolve => {
        okBtn.onclick = () => {
            statusModal.classList.remove("active");
            resolve();
        };
    });
}
function showVaultDeleteConfirm() {
    const modal = document.getElementById("vaultDeleteConfirmModal");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const cancelBtn = document.getElementById("cancelDeleteBtn");

    modal.classList.add("active");

    return new Promise((resolve) => {
        const handleClose = (result) => {
            modal.classList.remove("active");
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        confirmBtn.onclick = () => handleClose(true);
        cancelBtn.onclick = () => handleClose(false);
    });
}
function showLogoutConfirm() {
    const modal = document.getElementById("logoutConfirmModal");
    const confirmBtn = document.getElementById("confirmLogoutBtn");
    const cancelBtn = document.getElementById("cancelLogoutBtn");

    if (confirmBtn) {
        confirmBtn.style.background = "linear-gradient(135deg, #d11f34, #a8192a)";
        confirmBtn.style.color = "#fff";
    }
    modal.classList.add("active");

    return new Promise((resolve) => {
        const handleClose = (result) => {
            modal.classList.remove("active");
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        confirmBtn.onclick = () => handleClose(true);
        cancelBtn.onclick = () => handleClose(false);
    });
}

// GAD Bulletin Feed
const gadPostsFeed = document.getElementById("gadPostsFeed");

async function loadGADPosts() {
    try {
        const posts = typeof getGADPosts === "function" ? await getGADPosts() : [];
        gadPostsFeed.innerHTML = "";

        const safePosts = Array.isArray(posts) && posts.length ? posts : fallbackGadPosts;
        currentGadPosts = safePosts.map(post => ({ ...post, likedBy: Array.isArray(post.likedBy) ? [...post.likedBy] : [] }));
        safePosts.forEach(post => renderPost(post));
    } catch (error) {
        Logger.error("GAD", "Error loading posts", error);
        gadPostsFeed.innerHTML = "";
        currentGadPosts = fallbackGadPosts.map(post => ({ ...post, likedBy: Array.isArray(post.likedBy) ? [...post.likedBy] : [] }));
        fallbackGadPosts.forEach(post => renderPost(post));
    }
}

function formatGadAuthor(author) {
    return (author || "GAD Office").replace(/\s+official$/i, "");
}

function getPostLikeCount(post) {
    if (typeof post.likes === "number") return post.likes;
    return Array.isArray(post.likedBy) ? post.likedBy.length : 0;
}

// (2026-07-13) Fallback to auth uid for post like state; was appState only
function renderPost(post) {
    const likeCount = getPostLikeCount(post);
    const activeUid = appState.user?.uid || auth.currentUser?.uid || "";
    const isLiked = !!(activeUid && Array.isArray(post.likedBy) && post.likedBy.includes(activeUid));
    const postHtml = `
                <article class="card feed-card" id="post-${post.id}" style="margin-bottom: 20px; padding: 20px; border-radius: 22px; border: 1px solid rgba(90, 31, 224, 0.1); background: #ffffff; box-shadow: 0 4px 18px rgba(23, 20, 40, 0.04); transition: transform 0.18s ease, box-shadow 0.18s ease;">
                    <div class="feed-head" style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <div class="icon-badge" style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #f1ebff, #e4d7ff); color: #5a1fe0; box-shadow: 0 4px 12px rgba(90, 31, 224, 0.12); display: flex; align-items: center; justify-content: center;">
                                <span class="material-symbols-outlined" style="font-size: 24px;">verified_user</span>
                            </div>
                            <div class="feed-meta">
                                <strong style="font-size: 0.96rem; font-weight: 800; color: var(--ink); display: flex; align-items: center; gap: 4px;">
                                    ${formatGadAuthor(post.author)}
                                    <span class="material-symbols-outlined" style="font-size: 16px; color: #0284c7;">check_circle</span>
                                </strong>
                                <span style="font-size: 0.75rem; color: var(--muted); margin-top: 1px; display: block;">${post.timestamp}</span>
                            </div>
                        </div>
                        <span style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; background: rgba(90, 31, 224, 0.08); color: var(--primary); letter-spacing: 0.5px;">Official</span>
                    </div>
                    <p class="page-copy" id="content-${post.id}" style="font-size: 0.94rem; line-height: 1.55; margin-bottom: ${post.image ? "16px" : "12px"}; color: #2d264b; word-break: break-word;">${escapeHtml(post.content)}</p>
                    ${post.image ? `<img src="${post.image}" style="width: 100%; max-height: 360px; object-fit: cover; border-radius: 16px; margin-bottom: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">` : ""}
                    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(0, 0, 0, 0.04); padding-top: 10px; margin-top: 4px;">
                        <button class="like-action ${isLiked ? "is-liked" : ""}" type="button" data-like-post="${post.id}" aria-label="Like this post" style="padding: 4px 10px; border-radius: 10px; background: ${isLiked ? "rgba(209, 31, 52, 0.08)" : "transparent"}; display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer; color: ${isLiked ? "#d11f34" : "var(--muted)"};">
                            <span class="material-symbols-outlined" style="font-size: 20px;">${isLiked ? "favorite" : "favorite_border"}</span>
                            <span style="font-size: 0.82rem; font-weight: 700;">${likeCount} ${likeCount === 1 ? "Like" : "Likes"}</span>
                        </button>
                    </div>
                </article>
            `;
    gadPostsFeed.insertAdjacentHTML('beforeend', postHtml);
}

// (2026-07-13) Fallback to auth uid on like click; was blocked if uid empty
gadPostsFeed.addEventListener("click", async (event) => {
    const likeButton = event.target.closest("[data-like-post]");
    const activeUid = appState.user?.uid || auth.currentUser?.uid || "";
    if (!likeButton || !activeUid) return;
    if (likeButton.classList.contains("is-busy")) return;

    const postId = likeButton.dataset.likePost;
    const postIndex = currentGadPosts.findIndex((post) => String(post.id) === String(postId));
    if (postIndex < 0) return;

    try {
        setButtonBusy(likeButton, true);
        if (String(postId).startsWith("fallback-")) {
            const post = currentGadPosts[postIndex];
            const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
            const likedIndex = likedBy.indexOf(activeUid);
            if (likedIndex >= 0) {
                likedBy.splice(likedIndex, 1);
            } else {
                likedBy.push(activeUid);
            }
            currentGadPosts[postIndex] = { ...post, likedBy, likes: likedBy.length };
        } else {
            const result = await toggleLikeGADPost(postId, activeUid);
            const existingLikedBy = Array.isArray(currentGadPosts[postIndex].likedBy) ? currentGadPosts[postIndex].likedBy : [];
            const nextLiked = !!result?.isLiked;
            const nextLikedBy = nextLiked
                ? Array.from(new Set([...existingLikedBy, activeUid]))
                : existingLikedBy.filter((id) => id !== activeUid);
            currentGadPosts[postIndex] = {
                ...currentGadPosts[postIndex],
                likes: typeof result?.likes === "number" ? result.likes : nextLikedBy.length,
                likedBy: nextLikedBy
            };
        }

        gadPostsFeed.innerHTML = "";
        currentGadPosts.forEach(post => renderPost(post));
    } catch (error) {
        console.warn("Like toggle failed:", error);
        showStatus("Error", "Couldn't update the like right now.", "error");
    } finally {
        setButtonBusy(likeButton, false);
    }
});

// (2026-07-13) Add GAD PM modal and inquiry handlers; was basic GAD nav listener
window.switchGadTab = function (tab) {
    const announcementsPanel = document.getElementById("gadAnnouncementsPanel");
    const messagesPanel = document.getElementById("gadMessagesPanel");
    const tabAnnounce = document.getElementById("gadTabAnnouncements");
    const tabMsg = document.getElementById("gadTabMyMessages");

    if (tab === 'messages') {
        if (announcementsPanel) announcementsPanel.style.display = "none";
        if (messagesPanel) messagesPanel.style.display = "block";
        if (tabAnnounce) tabAnnounce.classList.remove("active");
        if (tabMsg) tabMsg.classList.add("active");
        loadStudentGADInquiries();
    } else {
        if (announcementsPanel) announcementsPanel.style.display = "block";
        if (messagesPanel) messagesPanel.style.display = "none";
        if (tabAnnounce) tabAnnounce.classList.add("active");
        if (tabMsg) tabMsg.classList.remove("active");
        loadGADPosts();
    }
};

const openGadPmBtn = document.getElementById("openGadPmBtn");
// (2026-07-13) Two-mode GAD chat, custom alias, unread badge, delete & presence
const headerGadMsgBtn = document.getElementById("headerGadMsgBtn");
const headerGadMsgBadge = document.getElementById("headerGadMsgBadge");
const gadPmModal = document.getElementById("gadPmModal");
const closeGadPmModalBtn = document.getElementById("closeGadPmModalBtn");
const cancelGadPmBtn = document.getElementById("cancelGadPmBtn");
const submitGadPmBtn = document.getElementById("submitGadPmBtn");
const globalGadFab = document.getElementById("globalGadFab");
const gadModeChooser = document.getElementById("gadModeChooser");
const gadChooseNamedBtn = document.getElementById("gadChooseNamedBtn");
const gadChooseAnonBtn = document.getElementById("gadChooseAnonBtn");
const gadAliasSetupPanel = document.getElementById("gadAliasSetupPanel");
const gadAliasInput = document.getElementById("gadAliasInput");
const gadSaveAliasBtn = document.getElementById("gadSaveAliasBtn");
const gadAliasError = document.getElementById("gadAliasError");
const gadSwitchModeBtn = document.getElementById("gadSwitchModeBtn");
const gadActiveModeBadge = document.getElementById("gadActiveModeBadge");
const gadNamedPreviewLabel = document.getElementById("gadNamedPreviewLabel");
const gadAnonPreviewLabel = document.getElementById("gadAnonPreviewLabel");
const gadNamedUnreadBadge = document.getElementById("gadNamedUnreadBadge");
const gadAnonUnreadBadge = document.getElementById("gadAnonUnreadBadge");
const gadAdminPresenceDot = document.getElementById("gadAdminPresenceDot");
const gadAdminPresenceText = document.getElementById("gadAdminPresenceText");

let _cachedGadMessages = [];
let _cachedNamedThreadMessages = [];
let _cachedAnonThreadMessages = [];
let gadNamedThreadUnsub = null;
let gadAnonThreadUnsub = null;
let gadAdminPresenceUnsub = null;
let gadActiveChatMode = null; // 'named' | 'anonymous'

const getGadThreadId = (uid, mode) => {
    const participant = mode === 'anonymous' ? `${uid}__anon` : uid;
    return [participant, "system_admin_securo"].sort().join("_");
};
const getGadReadTsKey = (tid) => `securo_msg_read_ts_${tid}`;
const getGadReadTs = (tid) => parseInt(localStorage.getItem(getGadReadTsKey(tid)) || '0', 10) || 0;
const setGadReadTs = (tid, ts = Date.now()) => {
    try { localStorage.setItem(getGadReadTsKey(tid), String(ts)); } catch (_) {}
};
const getSavedAnonAlias = (uid) => {
    if (!uid) return '';
    const localAlias = (localStorage.getItem(`securo_anon_alias_${uid}`) || '').trim();
    return localAlias || (appState.profile?.anonAlias || '').trim();
};
const saveAnonAlias = async (uid, alias) => {
    const clean = String(alias || '').trim();
    if (!uid || !clean) return '';
    try { localStorage.setItem(`securo_anon_alias_${uid}`, clean); } catch (_) {}
    if (appState.profile) appState.profile.anonAlias = clean;
    try { await saveUserProfile(uid, { anonAlias: clean }); } catch (_) {}
    return clean;
};
const gadMsgToMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (val.seconds) return val.seconds * 1000;
    if (typeof val.toDate === 'function') return val.toDate().getTime();
    const parsed = new Date(val).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
};
const countUnreadAdminMsgs = (msgs, tid, myUid) => {
    const lastRead = getGadReadTs(tid);
    return (msgs || []).filter((m) => {
        if (!m || m.deleted) return false;
        const isFromAdmin = m.senderRole === 'admin' || m.senderId === 'system_admin_securo' || (m.senderId && m.senderId !== myUid && m.senderUid !== myUid);
        if (!isFromAdmin) return false;
        const ts = gadMsgToMs(m.timestamp) || gadMsgToMs(m.localTime) || gadMsgToMs(m.createdAt);
        return ts > lastRead;
    }).length;
};

function updateGadUnreadBadges() {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    if (!uid) return;
    const namedTid = getGadThreadId(uid, 'named');
    const anonTid = getGadThreadId(uid, 'anonymous');
    const modalOpen = Boolean(gadPmModal?.classList.contains('active') && !gadModeChooser?.classList.contains('active'));
    if (modalOpen && gadActiveChatMode === 'named') {
        setGadReadTs(namedTid, Date.now());
        markThreadMessagesSeen(namedTid, 'staff').catch(() => {});
    } else if (modalOpen && gadActiveChatMode === 'anonymous') {
        setGadReadTs(anonTid, Date.now());
        markThreadMessagesSeen(anonTid, 'staff').catch(() => {});
    }
    const namedUnread = countUnreadAdminMsgs(_cachedNamedThreadMessages, namedTid, uid);
    const anonUnread = countUnreadAdminMsgs(_cachedAnonThreadMessages, anonTid, uid);
    const totalUnread = namedUnread + anonUnread;
    if (headerGadMsgBadge) {
        headerGadMsgBadge.textContent = totalUnread > 99 ? '99+' : (totalUnread > 0 ? String(totalUnread) : '');
        headerGadMsgBadge.classList.toggle('has-unread', totalUnread > 0);
    }
    if (gadNamedUnreadBadge) {
        gadNamedUnreadBadge.textContent = namedUnread > 0 ? String(namedUnread) : '';
        gadNamedUnreadBadge.classList.toggle('has-unread', namedUnread > 0);
    }
    if (gadAnonUnreadBadge) {
        gadAnonUnreadBadge.textContent = anonUnread > 0 ? String(anonUnread) : '';
        gadAnonUnreadBadge.classList.toggle('has-unread', anonUnread > 0);
    }
}

function updateGadAdminPresenceUI(isOnline) {
    if (gadAdminPresenceDot) gadAdminPresenceDot.classList.toggle('is-online', !!isOnline);
    if (gadAdminPresenceText) gadAdminPresenceText.textContent = isOnline ? 'Online' : 'Offline';
}

function initGadMessagingWatchers(uid) {
    if (!uid) return;
    if (gadNamedThreadUnsub) gadNamedThreadUnsub();
    if (gadAnonThreadUnsub) gadAnonThreadUnsub();
    if (gadAdminPresenceUnsub) gadAdminPresenceUnsub();

    const namedTid = getGadThreadId(uid, 'named');
    const anonTid = getGadThreadId(uid, 'anonymous');

    gadNamedThreadUnsub = subscribeToMessagesByThread(namedTid, (msgs) => {
        _cachedNamedThreadMessages = Array.isArray(msgs) ? msgs : [];
        updateGadUnreadBadges();
        if (gadActiveChatMode === 'named') renderGadChatThread();
    });
    gadAnonThreadUnsub = subscribeToMessagesByThread(anonTid, (msgs) => {
        _cachedAnonThreadMessages = Array.isArray(msgs) ? msgs : [];
        updateGadUnreadBadges();
        if (gadActiveChatMode === 'anonymous') renderGadChatThread();
    });
    gadAdminPresenceUnsub = subscribeToAdminPresence(updateGadAdminPresenceUI);
}

function renderGadChatThread(messages) {
    const thread = document.getElementById("gadChatThread");
    if (!thread) return;
    const myUid = appState.user?.uid || auth.currentUser?.uid || "";
    const isAnonMode = gadActiveChatMode === 'anonymous';
    const anonAlias = getSavedAnonAlias(myUid);
    const activeThreadId = myUid ? getGadThreadId(myUid, isAnonMode ? 'anonymous' : 'named') : '';
    const welcomeText = isAnonMode
        ? `Hi${anonAlias ? ' ' + anonAlias : ''}! You are messaging GAD anonymously. Your real name is hidden in this conversation.`
        : "Hi! This is the GAD Desk. Tell us what is on your mind — your conversation is private.";
    const items = [{ type: 'them', text: welcomeText, ts: 0, id: null, source: 'welcome' }];
    const timeline = [];

    const threadMsgs = isAnonMode ? _cachedAnonThreadMessages : _cachedNamedThreadMessages;
    if (!isAnonMode) {
        const msgs = (messages || _cachedGadMessages || []).filter(m => !m.isAnonymous && !m.deleted);
        msgs.forEach(m => {
            const baseTs = gadMsgToMs(m.createdAt);
            if (m.message) {
                timeline.push({ type: 'me', text: String(m.message).trim(), ts: baseTs, id: m.id || null, source: 'gad' });
            }
            if (m.status === 'answered' && m.reply) {
                const repTs = gadMsgToMs(m.repliedAt) || (baseTs + 1);
                timeline.push({ type: 'them', text: String(m.reply).trim(), ts: repTs, id: null, source: 'gad' });
            }
        });
    }

    (threadMsgs || []).forEach(tm => {
        if (!tm || tm.deleted) return;
        const text = String(tm.text || tm.message || '').trim();
        if (!text) return;
        const type = (tm.senderId === myUid || tm.senderUid === myUid) ? 'me' : 'them';
        const ts = gadMsgToMs(tm.timestamp) || gadMsgToMs(tm.localTime) || gadMsgToMs(tm.createdAt);
        const existingIdx = timeline.findIndex(e => e.type === type && e.text === text && Math.abs(e.ts - ts) < 15000);
        if (existingIdx >= 0) {
            timeline[existingIdx].chatId = tm.id || null;
        } else {
            timeline.push({ type, text, ts, id: tm.id || null, chatId: tm.id || null, source: 'chat' });
        }
    });

    timeline.sort((a, b) => a.ts - b.ts);
    timeline.forEach(entry => items.push(entry));
    const isWaitingReply = timeline.length > 0 && timeline[timeline.length - 1].type === 'me';

    let html = '';
    for (let i = 0; i < items.length; i++) {
        const cur = items[i];
        const prevSame = (i > 0 && items[i - 1].type === cur.type);
        const nextSame = (i < items.length - 1 && items[i + 1].type === cur.type);

        let bubbleClass = 'bubble-single';
        if (!prevSame && nextSame) bubbleClass = 'bubble-first';
        else if (prevSame && nextSame) bubbleClass = 'bubble-middle';
        else if (prevSame && !nextSame) bubbleClass = 'bubble-last';

        if (cur.type === 'them') {
            const avatarHtml = !nextSame
                ? '<div class="gad-them-avatar"><span class="material-symbols-outlined" style="font-size:16px;">support_agent</span></div>'
                : '<div class="gad-them-avatar-spacer"></div>';
            html += `<div class="gad-them-row ${bubbleClass}">${avatarHtml}<div class="gad-bubble them ${bubbleClass}">${escapeHtml(cur.text)}</div></div>`;
        } else {
            const delBtnHtml = (cur.chatId || cur.id)
                ? `<button type="button" class="gad-msg-del-btn" data-del-chat-id="${escapeHtml(cur.chatId || '')}" data-del-gad-id="${escapeHtml(cur.source === 'gad' ? (cur.id || '') : '')}" data-del-thread-id="${escapeHtml(activeThreadId)}" title="Delete message" aria-label="Delete message"><span class="material-symbols-outlined">delete</span></button>`
                : '';
            html += `<div class="gad-me-row">${delBtnHtml}<div class="gad-bubble me ${bubbleClass}">${escapeHtml(cur.text)}</div></div>`;
        }
    }

    if (isWaitingReply) {
        html += `
                    <div class="gad-chat-status-row">
                        <span class="gad-chat-delivered">Delivered <span class="material-symbols-outlined" style="font-size:13px;">done</span></span>
                        <div class="gad-chat-pending">
                            <span class="material-symbols-outlined" style="font-size:14px; color:#ffb649;">hourglass_top</span>
                            <span>Waiting for counselor reply...</span>
                        </div>
                    </div>
                `;
    }

    thread.innerHTML = html;
    thread.scrollTop = thread.scrollHeight;
    thread.querySelectorAll('.gad-msg-del-btn').forEach((btn) => {
        btn.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            // (2026-07-13) Use styled modal for message delete; was window.confirm
            if (!(await UI.showModal('Delete Message', 'Delete this message permanently?', { type: 'error', showCancel: true, confirmText: 'Delete' }))) return;
            const chatId = btn.dataset.delChatId;
            const gadId = btn.dataset.delGadId;
            const tid = btn.dataset.delThreadId;
            if (chatId) await deleteChatMessage(chatId, tid);
            if (gadId) await deleteGADMessage(gadId);
            renderGadChatThread();
        });
    });
}

function showGadModeChooser() {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    const realName = appState.profile?.name || appState.user?.name || 'Campus Staff';
    const savedAlias = getSavedAnonAlias(uid);
    if (gadNamedPreviewLabel) gadNamedPreviewLabel.textContent = `Continue as ${realName}`;
    if (gadAnonPreviewLabel) gadAnonPreviewLabel.textContent = savedAlias ? `Continue as "${savedAlias}" (Alias)` : 'Choose a custom anonymous name';
    if (gadAliasSetupPanel) gadAliasSetupPanel.classList.remove('active');
    if (gadAliasError) gadAliasError.textContent = '';
    if (gadModeChooser) gadModeChooser.classList.add('active');
    const threadEl = document.getElementById('gadChatThread');
    const composerEl = gadPmModal?.querySelector('.gad-chat-composer');
    if (threadEl) threadEl.style.display = 'none';
    if (composerEl) composerEl.style.display = 'none';
    if (gadSwitchModeBtn) gadSwitchModeBtn.classList.remove('visible');
    if (gadActiveModeBadge) gadActiveModeBadge.classList.remove('visible');
    updateGadUnreadBadges();
}

function enterGadChatMode(mode) {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    if (!uid) return;
    gadActiveChatMode = mode;
    const anonToggle = document.getElementById("gadAnonToggle");
    if (anonToggle) anonToggle.checked = (mode === 'anonymous');
    const tid = getGadThreadId(uid, mode);
    setGadReadTs(tid, Date.now());
    markThreadMessagesSeen(tid, 'staff').catch(() => {});
    updateGadUnreadBadges();

    if (gadModeChooser) gadModeChooser.classList.remove('active');
    if (gadAliasSetupPanel) gadAliasSetupPanel.classList.remove('active');
    const threadEl = document.getElementById('gadChatThread');
    const composerEl = gadPmModal?.querySelector('.gad-chat-composer');
    if (threadEl) threadEl.style.display = '';
    if (composerEl) composerEl.style.display = '';
    if (gadSwitchModeBtn) gadSwitchModeBtn.classList.add('visible');
    if (gadActiveModeBadge) {
        const alias = getSavedAnonAlias(uid);
        gadActiveModeBadge.textContent = mode === 'anonymous' ? `Alias: ${alias}` : 'Named';
        gadActiveModeBadge.classList.add('visible');
    }
    renderGadChatThread();
    const msgInput = document.getElementById("gadMessageBody");
    if (msgInput) {
        msgInput.focus();
        if (!msgInput._enterBound) {
            msgInput._enterBound = true;
            msgInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitGadPmBtn?.click();
                }
            });
        }
    }
}

function openGadPmModal() {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    if (!gadPmModal || !uid) return;
    gadPmModal.classList.add("active");
    if (!gadNamedThreadUnsub || !gadAnonThreadUnsub) initGadMessagingWatchers(uid);
    if (!gadInquiriesUnsub) loadStudentGADInquiries();
    showGadModeChooser();
}

function closeGadPmModal() {
    if (gadPmModal) {
        gadPmModal.classList.remove("active");
    }
}

if (gadChooseNamedBtn) gadChooseNamedBtn.addEventListener("click", () => enterGadChatMode('named'));
if (gadChooseAnonBtn) gadChooseAnonBtn.addEventListener("click", () => {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    const savedAlias = getSavedAnonAlias(uid);
    if (savedAlias) {
        enterGadChatMode('anonymous');
    } else if (gadAliasSetupPanel) {
        gadAliasSetupPanel.classList.add('active');
        if (gadAliasInput) { gadAliasInput.value = ''; gadAliasInput.focus(); }
    }
});
if (gadSaveAliasBtn) gadSaveAliasBtn.addEventListener("click", async () => {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    const val = (gadAliasInput?.value || '').trim();
    if (val.length < 2) {
        if (gadAliasError) gadAliasError.textContent = 'Please enter a name (at least 2 characters).';
        return;
    }
    if (gadAliasError) gadAliasError.textContent = '';
    await saveAnonAlias(uid, val);
    enterGadChatMode('anonymous');
});
if (gadAliasInput) gadAliasInput.addEventListener("keydown", (e) => {
    if (e.key === 'Enter') { e.preventDefault(); gadSaveAliasBtn?.click(); }
});
if (gadSwitchModeBtn) gadSwitchModeBtn.addEventListener("click", showGadModeChooser);

// (2026-07-13) Messenger-style header popup & top-left back button; was modal jump
const gadMessengerUI = initGadMessengerUI({
    role: 'staff',
    headerBtnId: 'headerGadMsgBtn',
    chatHeaderLeftSelector: '#gadPmModal .gad-chat-header .sta-u158',
    chatHeaderActionsSelector: '#gadPmModal .gad-header-actions',
    getUid: () => appState.user?.uid || auth.currentUser?.uid,
    getRealName: () => appState.profile?.name || appState.user?.name || 'Staff',
    getAlias: (uid) => getSavedAnonAlias(uid),
    saveAlias: (uid, val) => saveAnonAlias(uid, val),
    getUnreadCounts: () => ({
        named: Number(document.getElementById('gadNamedUnreadBadge')?.textContent || 0) || 0,
        anon: Number(document.getElementById('gadAnonUnreadBadge')?.textContent || 0) || 0
    }),
    isAdminOnline: () => Boolean(document.getElementById('gadAdminPresenceDot')?.classList.contains('is-online')),
    openMode: (mode) => {
        const uid = appState.user?.uid || auth.currentUser?.uid;
        if (!gadPmModal || !uid) return;
        gadPmModal.classList.add("active");
        if (!gadNamedThreadUnsub || !gadAnonThreadUnsub) initGadMessagingWatchers(uid);
        if (!gadInquiriesUnsub) loadStudentGADInquiries();
        enterGadChatMode(mode);
        gadMessengerUI?.setChatHeaderState(mode);
    },
    onBackToChooser: () => {
        showGadModeChooser();
        gadMessengerUI?.setChatHeaderState('chooser');
    }
});

if (headerGadMsgBtn) headerGadMsgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const uid = appState.user?.uid || auth.currentUser?.uid;
    if (uid && (!gadNamedThreadUnsub || !gadAnonThreadUnsub)) initGadMessagingWatchers(uid);
    gadMessengerUI.togglePopover(headerGadMsgBtn);
});
if (openGadPmBtn) openGadPmBtn.addEventListener("click", openGadPmModal);
if (globalGadFab) globalGadFab.addEventListener("click", openGadPmModal);
if (closeGadPmModalBtn) closeGadPmModalBtn.addEventListener("click", closeGadPmModal);
if (cancelGadPmBtn) cancelGadPmBtn.addEventListener("click", closeGadPmModal);

if (submitGadPmBtn) {
    submitGadPmBtn.addEventListener("click", async () => {
        const isAnon = gadActiveChatMode === 'anonymous';
        const category = document.getElementById("gadCategorySelect")?.value || "general";
        const messageInput = document.getElementById("gadMessageBody");
        const message = messageInput?.value.trim();
        const uid = appState.user?.uid || auth.currentUser?.uid;

        if (!message || !uid) return;

        const originalBtnHtml = submitGadPmBtn.innerHTML;
        submitGadPmBtn.disabled = true;
        submitGadPmBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">hourglass_top</span>';

        try {
            if (isAnon) {
                const alias = getSavedAnonAlias(uid) || 'Anonymous Staff';
                const anonTid = getGadThreadId(uid, 'anonymous');
                await sendChatMessage(uid, "system_admin_securo", message, alias, {
                    threadId: anonTid,
                    senderRole: "staff",
                    recipientRole: "admin",
                    supportMode: "gad_support",
                    isAnonymous: true,
                    anonymousAlias: alias,
                    clientName: alias,
                    senderLabel: alias,
                    ownerId: uid
                });
                setGadReadTs(anonTid, Date.now());
            } else {
                await sendGADMessage({
                    studentUid: uid,
                    studentName: appState.profile?.name || appState.user?.name || "Campus Staff",
                    studentId: appState.profile?.studentId || appState.user?.studentId || "",
                    role: "staff",
                    isAnonymous: false,
                    subject: category === 'counseling' ? 'Counseling Request' : 'GAD Inquiry',
                    category,
                    message
                });
                setGadReadTs(getGadThreadId(uid, 'named'), Date.now());
            }

            if (messageInput) messageInput.value = "";
        } catch (e) {
            console.warn("GAD message send error:", e);
            showStatus("Send Error", "Could not send message right now.", "error");
        } finally {
            submitGadPmBtn.disabled = false;
            submitGadPmBtn.innerHTML = originalBtnHtml;
            if (messageInput) messageInput.focus();
        }
    });
}

let gadInquiriesUnsub = null;
// (2026-07-13) Subscribe to GAD inquiries alongside dual chat threads; was single
function loadStudentGADInquiries() {
    const uid = appState.user?.uid || auth.currentUser?.uid;
    if (!uid) return;
    if (gadInquiriesUnsub) gadInquiriesUnsub();
    if (!gadNamedThreadUnsub || !gadAnonThreadUnsub) initGadMessagingWatchers(uid);
    const container = document.getElementById("gadInquiriesList");

    gadInquiriesUnsub = subscribeToGADMessages(uid, (messages) => {
        _cachedGadMessages = Array.isArray(messages) ? messages : [];
        if (gadActiveChatMode === 'named') renderGadChatThread(_cachedGadMessages);
        if (!container) return;
        if (!messages || !messages.length) {
            container.innerHTML = '<div style="text-align: center; padding: 30px; color: var(--muted); font-size:0.88rem;">No messages sent yet. Use "Message GAD" above to start.</div>';
            return;
        }

        container.innerHTML = messages.map(m => {
            const isAnswered = m.status === "answered" && m.reply;
            const dateStr = m.createdAt?.seconds
                ? new Date(m.createdAt.seconds * 1000).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : "Recently";

            return `
                        <div class="card" style="padding: 16px; margin-bottom: 12px; border-radius: 18px; border: 1px solid rgba(90,31,224,0.12);">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                <div>
                                    <span style="font-size:0.68rem; font-weight:800; text-transform:uppercase; padding:3px 8px; border-radius:6px; background:${m.isAnonymous ? '#fef3c7' : '#f1ebff'}; color:${m.isAnonymous ? '#b45309' : '#5a1fe0'};">
                                        ${m.isAnonymous ? 'Anonymous' : 'Verified'} · ${escapeHtml(m.category || 'General')}
                                    </span>
                                    <strong style="display:block; font-size:0.95rem; margin-top:6px; color:var(--ink);">${escapeHtml(m.subject || 'Support Request')}</strong>
                                </div>
                                <span style="font-size:0.72rem; color:var(--muted);">${dateStr}</span>
                            </div>
                            <p style="font-size:0.85rem; color:var(--ink); line-height:1.4; margin:0 0 10px;">${escapeHtml(m.message || '')}</p>
                            
                            ${isAnswered ? `
                                <div style="background:#f0fdf4; border-left:3px solid #0f9b67; padding:10px 12px; border-radius:0 12px 12px 0; margin-top:8px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                        <strong style="font-size:0.8rem; color:#0f9b67; display:flex; align-items:center; gap:4px;">
                                            <span class="material-symbols-outlined" style="font-size:16px;">verified</span>
                                            ${escapeHtml(m.repliedBy || 'GAD Desk')}
                                        </strong>
                                    </div>
                                    <p style="font-size:0.82rem; color:#14532d; margin:0; line-height:1.4;">${escapeHtml(m.reply)}</p>
                                </div>
                            ` : `
                                <div style="font-size:0.75rem; color:var(--muted); display:flex; align-items:center; gap:6px;">
                                    <span class="material-symbols-outlined" style="font-size:16px; color:#ffb649;">schedule</span>
                                    <span>Waiting for response from GAD Desk</span>
                                </div>
                            `}
                        </div>
                    `;
        }).join('');
    });
}

// Load posts when GAD page is opened
const gadNav = document.querySelector('[data-nav="gad"]');
if (gadNav) {
    gadNav.addEventListener('click', () => {
        switchGadTab('announcements');
    });
}

// Initial load if starting on GAD (though we start on map)
if (appState.currentPage === 'gad') switchGadTab('announcements');

updateGlobalSosFabVisibility(appState.currentPage);




navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setActiveView(button.dataset.nav);
    });
});

floatingNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const target = button.dataset.navTarget;
        if (target) setActiveView(target);
    });
});

// Legacy renderCaptureStrip removed - items are now auto-posted (Date: 2026-05-02)

function stopRecorderIfNeeded() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
    isRecording = false;
    mediaRecorder = null;
    mediaChunks = [];
}

// (2026-07-13) Toggle is-active-stream class on video; prev: raw stream reset
function stopEmergencyCamera() {
    stopRecorderIfNeeded();
    if (emergencyStream) {
        emergencyStream.getTracks().forEach((track) => track.stop());
        emergencyStream = null;
    }
    cameraPreview.srcObject = null;
    cameraPreview.classList.remove('is-active-stream');
}

async function startEmergencyCamera() {
    stopEmergencyCamera();
    cameraError.hidden = true;
    cameraEmpty.hidden = false;

    // Priority 1: High quality video + audio
    // Priority 2: Generic video + audio
    // Priority 3: Video only (if audio is blocked/missing)
    // Priority 4: Generic video only
    const constraintSets = [
        { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true },
        { video: true, audio: true },
        { video: { facingMode: { ideal: facingMode } }, audio: false },
        { video: true, audio: false }
    ];

    let lastErr = null;
    for (const constraints of constraintSets) {
        try {
            console.log("Attempting camera with:", constraints);
            emergencyStream = await navigator.mediaDevices.getUserMedia(constraints);

            if (emergencyStream) {
                cameraPreview.srcObject = emergencyStream;
                // Important: wait for metadata before playing or taking photos
                await new Promise((resolve) => {
                    cameraPreview.onloadedmetadata = () => resolve();
                    // Timeout fallback
                    setTimeout(resolve, 2000);
                });

                await cameraPreview.play().catch(e => console.warn("Auto-play blocked:", e));
                cameraPreview.classList.add('is-active-stream');
                cameraError.hidden = true;
                cameraEmpty.hidden = true;
                return;
            }
        } catch (err) {
            console.warn("Camera constraint set failed:", constraints, err);
            lastErr = err;
        }
    }

    cameraError.hidden = false;
    cameraEmpty.hidden = true;
    cameraErrorText.textContent = `Camera error: ${lastErr?.name || "Denied"}. Please enable camera permissions in settings.`;
}

function openEmergencyCamera() {
    cameraOverlay.classList.add("active");
    if (bottomNav) bottomNav.style.display = "none";
    if (globalSosFab) globalSosFab.style.display = "none";
    startEmergencyCamera();
}

function closeEmergencyCameraPanel() {
    cameraOverlay.classList.remove("active");
    if (bottomNav) bottomNav.style.display = "flex";
    if (globalSosFab) globalSosFab.style.display = "flex";
    stopEmergencyCamera();
    stopRecordingTicker();
    appState.sosTriggered = false;
    appState.sosLogged = false;
    dispatchState.textContent = "Standby";
    dispatchState.style.color = "var(--green)";
    sosCaption.textContent = "Hold for emergency response";
    sosButton.classList.remove("is-triggered", "is-active");
    sosRing.classList.remove("is-triggered", "is-active");
    sosStage.classList.remove("is-arming", "is-launching");
    sosPage.classList.remove("is-arming", "is-launching");
    if (sosTimer) {
        window.clearTimeout(sosTimer);
        sosTimer = null;
    }
    if (launchTimer) {
        window.clearTimeout(launchTimer);
        launchTimer = null;
    }
}

function startRecordingTicker() {
    recordingStartTime = Date.now();
    document.getElementById('recordingStatus').style.display = 'flex';
    document.getElementById('liveStatus').style.display = 'none';
    const progressCircle = document.getElementById('shutterProgress');
    const circumference = 2 * Math.PI * 55; // Updated for R=55

    recordingTicker = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const totalSeconds = Math.floor(elapsed / 1000);
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        document.getElementById('recordingTimer').textContent = `${mins}:${secs}`;

        // Update circular progress
        const progress = Math.min(elapsed / MAX_VIDEO_DURATION, 1);
        const offset = circumference - (progress * circumference);
        if (progressCircle) progressCircle.style.strokeDashoffset = offset;

        if (elapsed >= MAX_VIDEO_DURATION) {
            handleCaptureEnd();
        }
    }, 50);
}

function stopRecordingTicker() {
    if (recordingTicker) clearInterval(recordingTicker);
    recordingTicker = null;
    document.getElementById('recordingStatus').style.display = 'none';
    document.getElementById('liveStatus').style.display = 'flex';
    const progressCircle = document.getElementById('shutterProgress');
    if (progressCircle) progressCircle.style.strokeDashoffset = 345.5; // Updated for R=55
}

function setSosIdleState() {
    appState.sosTriggered = false;
    dispatchState.textContent = "Standby";
    dispatchState.style.color = "var(--green)";
    sosCaption.textContent = "Hold for emergency response";
    sosButton.classList.remove("is-triggered");
    sosRing.classList.remove("is-triggered");
    sosButton.classList.remove("is-active");
    sosRing.classList.remove("is-active");
    sosStage.classList.remove("is-arming", "is-launching");
    sosPage.classList.remove("is-arming", "is-launching");
    if (launchTimer) {
        window.clearTimeout(launchTimer);
        launchTimer = null;
    }
    closeEmergencyCameraPanel();
}

// (2026-07-13) Clockwise circular progress animation on hold; was plain timeout
let sosHoldStartTime = 0;
let sosHoldAnimFrame = null;
const SOS_HOLD_DURATION_MS = 1200;

function updateSosSpinnerProgress(fraction) {
    const arc = document.getElementById("sosProgressArc");
    if (!arc) return;
    const circumference = 578;
    const clamped = Math.max(0, Math.min(fraction, 1));
    arc.style.strokeDashoffset = circumference - (clamped * circumference);
}

function startSosHold() {
    if (appState.sosTriggered || sosTimer) return;
    sosButton.classList.add("is-active");
    sosRing.classList.add("is-active");
    sosStage.classList.add("is-arming");
    sosPage.classList.add("is-arming");
    sosCaption.textContent = "Hold steady... arming emergency dispatch";

    sosHoldStartTime = Date.now();
    updateSosSpinnerProgress(0);

    function stepHoldAnimation() {
        const elapsed = Date.now() - sosHoldStartTime;
        const fraction = elapsed / SOS_HOLD_DURATION_MS;
        updateSosSpinnerProgress(fraction);

        if (fraction < 1 && sosTimer) {
            sosHoldAnimFrame = requestAnimationFrame(stepHoldAnimation);
        }
    }
    sosHoldAnimFrame = requestAnimationFrame(stepHoldAnimation);

    sosTimer = window.setTimeout(() => {
        updateSosSpinnerProgress(1);
        if (sosHoldAnimFrame) {
            cancelAnimationFrame(sosHoldAnimFrame);
            sosHoldAnimFrame = null;
        }
        appState.sosTriggered = true;
        // (2026-07-13) Trigger haptics, push alert & instant SOS; was delayed state only
        triggerDeviceVibration([800, 250, 800, 250, 800]);
        triggerDevicePushNotification("EMERGENCY SOS ACTIVATED", "Your emergency alert and live coordinates have been broadcast to campus security and guardians.");
        if (!appState.sosLogged && appState.user?.uid) {
            appState.sosLogged = true;
            // (2026-07-13) Pass real staff profile name & role; was defaulting student
            logSOS(appState.user.uid, appState.lastLocation || { lat: 0, lng: 0 }, {
                userName: appState.profile?.name || appState.user?.name || appState.user?.displayName || "Campus Staff",
                userEmail: appState.profile?.email || appState.user?.email || "",
                studentId: appState.profile?.studentId || appState.user?.studentId || "",
                role: appState.profile?.role || appState.user?.role || "staff"
            }).catch(e => console.warn("Instant SOS log failed:", e));
        }
        dispatchState.textContent = "Live Dispatch";
        dispatchState.style.color = "#b6141b";
        sosCaption.textContent = "Emergency signal secured and sent";
        sosButton.classList.add("is-triggered");
        sosRing.classList.add("is-triggered");
        sosButton.classList.remove("is-active");
        sosRing.classList.remove("is-active");
        sosStage.classList.remove("is-arming");
        sosPage.classList.remove("is-arming");
        sosStage.classList.add("is-launching");
        sosPage.classList.add("is-launching");
        sosTimer = null;
        launchTimer = window.setTimeout(() => {
            openEmergencyCamera();
            sosStage.classList.remove("is-launching");
            sosPage.classList.remove("is-launching");
            launchTimer = null;
        }, 460);
    }, SOS_HOLD_DURATION_MS);
}

function stopSosHold() {
    sosButton.classList.remove("is-active");
    sosRing.classList.remove("is-active");
    sosStage.classList.remove("is-arming");
    sosPage.classList.remove("is-arming");

    if (sosHoldAnimFrame) {
        cancelAnimationFrame(sosHoldAnimFrame);
        sosHoldAnimFrame = null;
    }

    if (sosTimer) {
        window.clearTimeout(sosTimer);
        sosTimer = null;
    }

    if (!appState.sosTriggered) {
        updateSosSpinnerProgress(0);
        sosCaption.textContent = "Hold for emergency response";
    }
}

sosButton.addEventListener("pointerdown", () => {
    startSosHold();
});

["pointerup", "pointerleave", "pointercancel"].forEach((eventName) => {
    sosButton.addEventListener(eventName, () => {
        stopSosHold();
    });
});

/* FIX: Prevent context menu on long press for SOS Button (Date: 2026-05-02) */
/* By calling preventDefault on contextmenu, we ensure that the native long press menu doesn't cancel the pointer events, allowing the SOS long press to work continuously */
sosButton.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

sosButton.addEventListener("click", () => {
    if (appState.sosTriggered) {
        setSosIdleState();
    }
});

closeCameraOverlay.addEventListener("click", closeEmergencyCameraPanel);

// Capture logic initialized above in the main variables block

function showToast(msg, type = 'success') {
    const toast = document.getElementById("toastNotify");
    const toastMsg = document.getElementById("toastMsg");
    const toastIcon = document.getElementById("toastIcon");

    toastMsg.textContent = msg;
    toastIcon.textContent = type === 'success' ? 'check_circle' : 'info';
    toastIcon.style.color = type === 'success' ? 'var(--green)' : 'var(--amber)';

    toast.classList.add("active");
    setTimeout(() => {
        toast.classList.remove("active");
    }, 3000);
}

// (2026-07-13) Auto-post capture with session fallback & sync; was bare post
async function autoPostCapture(item) {
    const uid = appState.user.uid || localStorage.getItem('securo_session_token');
    if (!uid) return;

    try {
        // Determine location
        const location = appState.lastLocation || { lat: 0, lng: 0, address: "Unknown location" };

        await saveEmergencyPost({
            userId: uid,
            userName: appState.user.name || "Student",
            studentId: appState.user.studentId || "",
            attachments: [item],
            location
        });
        if (item?.kind === "image") {
            attachPhotoToActiveSOS(uid, item).catch(() => { });
        }

        showToast("Evidence secured in digital vault.", "success");
        loadVaultItems().catch(() => { });
    } catch (err) {
        console.warn("Auto-post failed:", err);
        showToast("Saved locally (Offline).", "info");
    }
}

async function compressImage(canvas) {
    // Instagram style compression: JPEG 0.6 quality
    return canvas.toDataURL("image/jpeg", 0.6);
}

// (2026-07-13) Hold-to-record with drag-to-zoom & release stop; was tap/hold
function applyCameraZoom(progress) {
    const zoomLevel = 1 + Math.max(0, Math.min(progress, 1)) * 3.5;
    currentCameraZoom = zoomLevel;

    if (cameraPreview) {
        cameraPreview.style.transform = `scale(${zoomLevel.toFixed(2)})`;
        cameraPreview.style.transformOrigin = "center center";
    }

    const livePill = document.getElementById("liveStatus");
    const liveText = livePill ? livePill.querySelector("span:not(.camera-status-dot)") : null;
    if (liveText) {
        liveText.textContent = zoomLevel > 1.05 ? `${zoomLevel.toFixed(1)}x Zoom` : "Live Capture";
    }

    try {
        const [track] = emergencyStream?.getVideoTracks() || [];
        const caps = track?.getCapabilities?.();
        if (caps && caps.zoom) {
            const minZ = caps.zoom.min || 1;
            const maxZ = Math.min(caps.zoom.max || 4.5, 4.5);
            const targetZ = minZ + (maxZ - minZ) * progress;
            track.applyConstraints({ advanced: [{ zoom: targetZ }] }).catch(() => { });
        }
    } catch (_) { }
}

function resetCameraZoom() {
    currentCameraZoom = 1;
    if (cameraPreview) {
        cameraPreview.style.transition = "transform 0.2s ease";
        cameraPreview.style.transform = "scale(1)";
        setTimeout(() => {
            if (cameraPreview) cameraPreview.style.transition = "";
        }, 220);
    }

    const livePill = document.getElementById("liveStatus");
    const liveText = livePill ? livePill.querySelector("span:not(.camera-status-dot)") : null;
    if (liveText) {
        liveText.textContent = "Live Capture";
    }

    try {
        const [track] = emergencyStream?.getVideoTracks() || [];
        const caps = track?.getCapabilities?.();
        if (caps && caps.zoom) {
            const minZ = caps.zoom.min || 1;
            track.applyConstraints({ advanced: [{ zoom: minZ }] }).catch(() => { });
        }
    } catch (_) { }
}

let isCaptureBusy = false;

async function handleCaptureStart(e) {
    if (isCaptureBusy) return;
    if (e) {
        try { e.preventDefault(); } catch (_) { }
        captureTouchPointerId = e.pointerId ?? null;
        captureTouchStartY = e.clientY ?? 0;
    }
    isHolding = false;
    shouldStopRecordingImmediately = false;
    if (holdTimer) clearTimeout(holdTimer);

    holdTimer = setTimeout(async () => {
        isHolding = true;
        await startVideoRecording();
    }, 300);
}

async function handleCaptureEnd(e) {
    if (e) {
        try { e.preventDefault(); e.stopPropagation(); } catch (_) { }
    }
    if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
    }

    const wasHolding = isHolding;
    const wasRecording = isRecording || isStartingRecording;

    resetCameraZoom();
    isHolding = false;
    captureTouchPointerId = null;

    if (!wasHolding && !wasRecording) {
        if (isCaptureBusy) return;
        isCaptureBusy = true;
        try {
            await takePhotoAndPost();
        } finally {
            setTimeout(() => { isCaptureBusy = false; }, 900);
        }
    } else {
        await stopVideoRecording();
    }
}

// (2026-07-13) Capture single photo and immediately open vault; was multi-burst
async function takePhotoAndPost() {
    let item = null;
    if (window.Capacitor?.isNativePlatform?.() && window.Capacitor?.Plugins?.Camera) {
        try {
            const photo = await window.Capacitor.Plugins.Camera.getPhoto({
                quality: 75,
                allowEditing: false,
                resultType: 'dataUrl',
                source: 'CAMERA'
            });
            if (photo?.dataUrl) {
                item = {
                    kind: "image",
                    src: photo.dataUrl,
                    mimeType: "image/jpeg",
                    label: "Emergency camera capture"
                };
            }
        } catch (nativeErr) {
            console.warn("Capacitor camera capture cancelled or failed, falling back:", nativeErr);
        }
    }

    if (!item) {
        if (!cameraPreview || !cameraPreview.videoWidth) return;
        // (2026-07-13) Scale capture down to 960px & 0.66 quality; was 1280px / 0.72
        const maxDim = 960;
        let w = cameraPreview.videoWidth;
        let h = cameraPreview.videoHeight;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }
        captureCanvas.width = w;
        captureCanvas.height = h;
        const ctx = captureCanvas.getContext("2d");
        ctx.drawImage(cameraPreview, 0, 0, w, h);
        const compressed = captureCanvas.toDataURL("image/jpeg", 0.66);

        item = {
            kind: "image",
            src: compressed,
            mimeType: "image/jpeg",
            label: "Rapid photo capture"
        };

        cameraPreview.style.filter = "brightness(2) contrast(1.2)";
        setTimeout(() => { if (cameraPreview) cameraPreview.style.filter = ""; }, 100);
    }

    // (2026-07-13) Retain active camera on capture; was auto-switch to vault
    await autoPostCapture(item);
}

async function startVideoRecording() {
    if (!emergencyStream || typeof MediaRecorder === "undefined") return;
    if (isRecording || isStartingRecording) return;

    isStartingRecording = true;
    shouldStopRecordingImmediately = false;
    mediaChunks = [];
    const options = { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 1000000 };

    try {
        mediaRecorder = new MediaRecorder(emergencyStream, options);
    } catch (e) {
        try {
            mediaRecorder = new MediaRecorder(emergencyStream);
        } catch (e2) {
            isStartingRecording = false;
            return;
        }
    }

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) mediaChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
        const blob = new Blob(mediaChunks, { type: "video/webm" });
        const src = await fileToDataUrl(blob);

        await autoPostCapture({
            kind: "video",
            src,
            mimeType: "video/webm",
            label: "Emergency video clip"
        });

        stopRecordingTicker();
        captureAction.classList.remove("is-recording");
    };

    try {
        mediaRecorder.start();
        isRecording = true;
        captureAction.classList.add("is-recording");
        startRecordingTicker();
    } catch (err) {
        console.warn("Could not start MediaRecorder:", err);
    } finally {
        isStartingRecording = false;
    }

    if (shouldStopRecordingImmediately) {
        shouldStopRecordingImmediately = false;
        await stopVideoRecording();
    }
}

async function stopVideoRecording() {
    if (isStartingRecording) {
        shouldStopRecordingImmediately = true;
        return;
    }
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
        try {
            mediaRecorder.stop();
        } catch (err) {
            console.warn("MediaRecorder stop error:", err);
        }
    }
    isRecording = false;
    isHolding = false;
    captureAction.classList.remove("is-recording");
    stopRecordingTicker();
}

// (2026-07-13) Single pointer release handler; was duplicate window/lostcapture
captureAction.addEventListener("click", (e) => e.preventDefault());
captureAction.addEventListener("pointerdown", (e) => {
    captureTouchPointerId = e.pointerId;
    captureTouchStartY = e.clientY;
    try {
        captureAction.setPointerCapture(e.pointerId);
    } catch (_) { }
    handleCaptureStart(e);
});

window.addEventListener("pointermove", (e) => {
    if (!isHolding && !isRecording && !isStartingRecording) return;
    if (captureTouchPointerId !== null && e.pointerId !== captureTouchPointerId) return;

    const deltaY = captureTouchStartY - e.clientY;
    const progress = Math.max(0, Math.min(deltaY / 200, 1));
    applyCameraZoom(progress);
}, { passive: true });

captureAction.addEventListener("pointerup", handleCaptureEnd);
captureAction.addEventListener("pointercancel", handleCaptureEnd);

switchCameraBtn.addEventListener("click", async () => {
    facingMode = facingMode === "environment" ? "user" : "environment";
    await startEmergencyCamera();
});

galleryUploadBtn.addEventListener("click", () => {
    galleryInput.click();
});

galleryInput.addEventListener("change", async () => {
    const files = Array.from(galleryInput.files || []);
    for (const file of files) {
        // Check duration if video
        if (file.type.startsWith("video/")) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = async () => {
                window.URL.revokeObjectURL(video.src);
                if (video.duration > 61) {
                    showStatus("File too long", "Maximum video length is 60 seconds.", "error");
                    return;
                }
                const dataUrl = await fileToDataUrl(file);
                await autoPostCapture({
                    kind: "video",
                    src: dataUrl,
                    mimeType: file.type,
                    label: file.name
                });
            };
            video.src = URL.createObjectURL(file);
        } else {
            // (2026-07-13) Compress gallery image to avoid 400 Bad Request; was raw file
            let dataUrl;
            try {
                dataUrl = await compressImageFile(file, 960, 0.66);
            } catch (_) {
                dataUrl = await fileToDataUrl(file);
            }
            await autoPostCapture({
                kind: "image",
                src: dataUrl,
                mimeType: "image/jpeg",
                label: file.name
            });
        }
    }
    galleryInput.value = "";
});

// Legacy event listeners removed (Date: 2026-05-02)

// (2026-07-13) Fix duplicate identifier SyntaxError; was duplicate const
if (globalGadFab) {
    globalGadFab.addEventListener("click", () => {
        openGadPmModal();
    });
}

const headerActionBtn = document.getElementById("headerAction");
if (headerActionBtn) {
    headerActionBtn.addEventListener("click", () => {
        if (appState.currentPage !== "attendance") {
            setActiveView("attendance");
        } else {
            setActiveView("map");
        }
    });
}

// --- ATTENDANCE & TRACKING LOGIC (Date: 2026-05-02) ---

// (2026-07-13) Evaluate geofence attendance on init; was history state only
async function initializeAttendance() {
    const history = await loadAttendanceUI();
    setAttendanceState(getIsTimedInFromHistory(history));
    syncPendingAttendanceLogs().catch((error) => console.warn("Attendance background sync failed:", error));
    if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
        checkCampusGeofence(appState.lastLocation.lat, appState.lastLocation.lng);
    }
}

function getIsTimedInFromHistory(history = []) {
    return Array.isArray(history) && history[0]?.type === 'in';
}

// (2026-07-13) Dynamic live status pill sync; was text color toggle only
function setAttendanceState(isTimedIn) {
    appState.isTimedIn = isTimedIn;
    timeInBtn.disabled = isTimedIn;
    timeOutBtn.disabled = !isTimedIn;
    // (2026-07-13) Status shows Not Timed In when empty; prev: always Timed Out
    if (currentStatusText) {
        if (isTimedIn) {
            currentStatusText.textContent = "Timed In";
        } else if (!_fullAttendanceHistory || !_fullAttendanceHistory.length) {
            currentStatusText.textContent = "Not Timed In";
        } else {
            currentStatusText.textContent = "Timed Out";
        }
    }
    const pill = document.getElementById("attendanceStatusPill");
    const dot = document.getElementById("attendanceStatusDot");
    if (pill) {
        pill.style.background = isTimedIn ? "#ecfdf5" : "#f8fafc";
        pill.style.borderColor = isTimedIn ? "rgba(15, 155, 103, 0.3)" : "rgba(0,0,0,0.06)";
        pill.style.color = isTimedIn ? "#0f9b67" : "#64748b";
    }
    if (dot) {
        dot.style.background = isTimedIn ? "#0f9b67" : "#94a3b8";
        dot.style.animation = isTimedIn ? "pulse-voice 1.5s infinite" : "none";
    }
    refreshLocationTracking();
}

function refreshLocationTracking() {
    const shouldTrack = !!appState.user.uid;
    if (shouldTrack) {
        startTracking();
    } else {
        stopTracking();
    }

    if (shouldTrack && appState.lastLocation?.lat && appState.lastLocation?.lng && appState.user.uid) {
        updateStudentLiveLocation(appState.user.uid, {
            lat: appState.lastLocation.lat,
            lng: appState.lastLocation.lng
        }).catch((error) => console.warn("Live location sync refresh failed:", error));
    }

    updateTrackingStatusBanner();
}

function formatCampusEventTime(ts) {
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

// (2026-07-13) Format personal campus update from user logs; was generic storage
function updateTrackingStatusBanner() {
    if (!trackingStatusBanner || !trackingStatusIcon || !trackingStatusCopy) return;

    const isTrackingOn = !!appState.isLocationTrackingActive;
    const isInside = appState.isInsideCampus !== false;

    trackingStatusBanner.classList.toggle("is-on", isTrackingOn);
    trackingStatusBanner.classList.toggle("is-off", !isTrackingOn);
    trackingStatusBanner.classList.toggle("is-inside", isTrackingOn && isInside);
    trackingStatusBanner.classList.toggle("is-outside", isTrackingOn && !isInside);

    if (isTrackingOn) {
        const userKey = appState.user?.uid || 'guest';
        const userExitKey = `securo_campus_exit_ts_${userKey}`;
        const userEntryKey = `securo_campus_entry_ts_${userKey}`;
        // (2026-07-13) Show status without faked timestamps; prev: faked exit time
        if (isInside) {
            trackingStatusIcon.textContent = "login";
            const recentIn = typeof getSpecificUserLatestAttendanceLog === 'function' ? getSpecificUserLatestAttendanceLog('in') : null;
            const recentInTs = recentIn ? getAttendanceLogDate(recentIn).getTime() : null;
            const storedEntry = localStorage.getItem(userEntryKey);
            const entryTs = appState.campusEntryTs || recentInTs || (storedEntry ? parseInt(storedEntry, 10) : null);
            if (entryTs && (recentInTs || appState.campusEntryTs)) {
                const formatted = `You went inside the campus at ${formatCampusEventTime(entryTs)}`;
                trackingStatusCopy.textContent = formatted;
                trackingStatusBanner.title = `${formatted}. Live campus tracking is active.`;
            } else {
                trackingStatusCopy.textContent = "Inside Campus Bounds";
                trackingStatusBanner.title = "Inside campus bounds. Live tracking active.";
            }
        } else {
            trackingStatusIcon.textContent = "logout";
            const recentOut = typeof getSpecificUserLatestAttendanceLog === 'function' ? getSpecificUserLatestAttendanceLog('out') : null;
            const recentOutTs = recentOut ? getAttendanceLogDate(recentOut).getTime() : null;
            const storedExit = localStorage.getItem(userExitKey);
            const exitTs = appState.campusExitTs || recentOutTs || (storedExit ? parseInt(storedExit, 10) : null);
            if (exitTs && (recentOutTs || appState.campusExitTs)) {
                const formatted = `You went out the campus at ${formatCampusEventTime(exitTs)}`;
                trackingStatusCopy.textContent = formatted;
                trackingStatusBanner.title = `${formatted}. Live campus tracking is active.`;
            } else {
                trackingStatusCopy.textContent = "Outside Campus Bounds";
                trackingStatusBanner.title = "Outside campus bounds. Live tracking active.";
            }
        }
        return;
    }

    trackingStatusIcon.textContent = "location_off";
    trackingStatusCopy.textContent = appState.locationPermissionDenied ? "Location Blocked" : "Location Off";
    trackingStatusBanner.title = "Location is off. Enable browser location permission to activate live tracking.";
}

async function loadAttendanceUI() {
    const remoteHistory = await getAttendanceHistory(appState.user.uid);
    const history = getMergedAttendanceHistory(remoteHistory);
    renderAttendanceHistory(history);
    calculateStats(history);
    updateAttendanceSummary(history);
    updateTrackingStatusBanner();
    return history;
}

// (2026-07-13) Format location with landmark/barangay; was raw lat/lng coords
function formatAttendanceLocation(location) {
    if (location?.address && !/^Lat\s*-?\d/i.test(location.address)) {
        return location.address;
    }
    if (location?.lat && location?.lng) {
        const landmark = getNearestLandmark(location.lat, location.lng);
        return landmark || "Daanbantayan, Cebu";
    }
    if (location?.address) return location.address;
    return "Campus Grounds";
}

let _visibleAttendanceLimit = 10;
let _fullAttendanceHistory = [];

// (2026-07-13) Max 10 initial records with load more pagination; was unlimited list
function renderAttendanceHistory(history) {
    _fullAttendanceHistory = Array.isArray(history) ? history : [];
    if (_fullAttendanceHistory.length === 0) {
        attendanceHistoryList.innerHTML = '<div style="text-align: center; padding: 24px; color: var(--muted); font-size:0.85rem;">No attendance records found.</div>';
        return;
    }

    const visibleItems = _fullAttendanceHistory.slice(0, _visibleAttendanceLimit);
    const itemsHtml = visibleItems.map(log => {
        const date = getAttendanceLogDate(log);
        const timeStr = formatTime12(date);
        const dateStr = formatDateShort(date);
        const locStr = formatAttendanceLocation(log.location);

        return `
                    <div class="attendance-log-item">
                        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                            <div class="log-type ${log.type}">${log.type === 'in' ? 'IN' : 'OUT'}</div>
                            <div style="min-width: 0;">
                                <div style="font-weight: 700; font-size: 0.88rem; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${locStr}</div>
                                <div style="font-size: 0.74rem; color: var(--muted); margin-top: 1px;">${dateStr}${log.pending ? " · Syncing..." : ""}</div>
                            </div>
                        </div>
                        <div class="log-time">${timeStr}</div>
                    </div>
                `;
    }).join('');

    const remaining = _fullAttendanceHistory.length - visibleItems.length;
    const loadMoreHtml = remaining > 0 ? `
                <button class="load-more-attendance-btn" id="loadMoreAttendanceBtn" type="button" onclick="loadMoreAttendance()" style="margin-top: 10px; width: 100%; padding: 12px; border-radius: 16px; background: #f8fafc; border: 1px dashed rgba(15, 155, 103, 0.25); color: #0f9b67; font-weight: 800; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 0.16s ease;">
                    <span>Load More Records (${remaining} remaining)</span>
                    <span class="material-symbols-outlined" style="font-size: 18px;">expand_more</span>
                </button>
            ` : '';

    attendanceHistoryList.innerHTML = itemsHtml + loadMoreHtml;
}

window.loadMoreAttendance = function () {
    _visibleAttendanceLimit += 10;
    renderAttendanceHistory(_fullAttendanceHistory);
};

// (2026-07-13) Add CSV and JSON export for attendance history; was view only
document.getElementById('btnExportStudentAttendanceCsv')?.addEventListener('click', () => {
    if (!_fullAttendanceHistory || !_fullAttendanceHistory.length) {
        if (typeof showToast === 'function') showToast("No attendance records to export.", "info");
        return;
    }
    const headers = ['Event Type', 'Date & Time', 'Campus Landmark / Address', 'Sync Status'];
    const rows = _fullAttendanceHistory.map(log => {
        const date = getAttendanceLogDate(log);
        return [
            (log.type || '').toUpperCase(),
            date.toLocaleString(),
            formatAttendanceLocation(log.location),
            log.pending ? 'Pending Sync' : 'Synced'
        ];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_history_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast("Attendance history exported as CSV.", "success");
});

document.getElementById('btnExportStudentAttendanceJson')?.addEventListener('click', () => {
    if (!_fullAttendanceHistory || !_fullAttendanceHistory.length) {
        if (typeof showToast === 'function') showToast("No attendance records to export.", "info");
        return;
    }
    const data = _fullAttendanceHistory.map(log => ({
        type: (log.type || '').toUpperCase(),
        timestamp: getAttendanceLogDate(log).toISOString(),
        location: formatAttendanceLocation(log.location),
        status: log.pending ? 'Pending Sync' : 'Synced'
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast("Attendance history exported as JSON.", "success");
});

function updateAttendanceSummary(history) {
    const latest = history[0];
    if (!latest) {
        attendanceLastTime.textContent = "No records yet";
        attendanceLastLocation.textContent = "No records yet";
        return;
    }

    const latestDate = getAttendanceLogDate(latest);
    attendanceLastTime.textContent = formatDateTime12(latestDate);
    attendanceLastLocation.textContent = formatAttendanceLocation(latest.location);
}

function calculateStats(history) {
    const daysPresent = new Set(history.filter(h => h.type === 'in').map(h => getAttendanceLogDate(h).toDateString())).size;
    statDaysPresent.textContent = daysPresent;

    const rate = Math.min(100, Math.round((daysPresent / 20) * 100)); // Target of 20 days
    statAttendanceRate.textContent = rate + "%";

    if (rate > 80) {
        academicStandingText.textContent = "Exemplary";
        academicStandingCopy.textContent = "You are maintaining a high attendance consistency. Great work!";
    } else if (rate > 50) {
        academicStandingText.textContent = "Steady";
        academicStandingCopy.textContent = "You are on track. Keep attending your classes regularly.";
    } else {
        academicStandingText.textContent = "Needs Attention";
        academicStandingCopy.textContent = "Your attendance rate is low. Try to be more consistent.";
    }
}

// (2026-07-13) Request Capacitor location & notify student; was browser only
// (2026-07-13) Instant attendance without lingering loader; was slow wait
async function handleAttendance(type) {
    const btn = type === 'in' ? timeInBtn : timeOutBtn;
    if (!btn || btn.classList.contains("is-busy")) return;

    if (type === 'in' && appState.isTimedIn) {
        await showStatus("Already Timed In", "You already have an active time-in record.");
        return;
    }
    if (type === 'out' && !appState.isTimedIn) {
        await showStatus("Time In Required", "You need to time in first before timing out.", "error");
        return;
    }

    setButtonBusy(btn, true);

    try {
        await ensureCapacitorLocationPermission();

        const capturedAt = new Date();
        const location = await resolveAttendanceLocation();

        // Clear button spinner immediately so it doesn't linger while dialog is shown
        setButtonBusy(btn, false);

        // (2026-07-13) Disallow time in outside campus bounds; was allowing time in
        if (type === 'in') {
            if (!location.isInside) {
                await showStatus("Outside Campus", "You cannot time in because you are outside CTU campus grounds. Attendance is only permitted inside the campus.", "error");
                return;
            }
        }

        const confirmed = await openAttendanceActionModal(type, {
            time: formatDateTime12(capturedAt),
            location: location.address
        });

        if (!confirmed) {
            return;
        }

        setButtonBusy(btn, true);

        queueAttendanceLog(appState.user.uid, {
            localId: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            type,
            location,
            clientTimestamp: capturedAt.toISOString()
        });
        const updatedHistory = getMergedAttendanceHistory(_fullAttendanceHistory, appState.user.uid);
        setAttendanceState(type === 'in');
        renderAttendanceHistory(updatedHistory);
        calculateStats(updatedHistory);
        updateAttendanceSummary(updatedHistory);
        syncPendingAttendanceLogs().catch((error) => console.warn("Attendance sync trigger failed:", error));

        const notifTitle = type === 'in' ? "Campus Entry" : "Campus Exit";
        const notifMsg = type === 'in'
            ? "You've entered the campus, successfully timed in."
            : "You've exited the campus, successfully timed out.";
        triggerDevicePushNotification(notifTitle, notifMsg);

        await showStatus(type === 'in' ? "Timed In" : "Timed Out", `Recorded at ${formatTime12(capturedAt)}.`);
    } catch (error) {
        console.warn("Attendance Error:", error);
        await showStatus("Attendance Error", error?.message || "Could not capture location right now.", "error");
    } finally {
        setButtonBusy(btn, false);
        btn.disabled = (type === 'in' ? appState.isTimedIn : !appState.isTimedIn);
    }
}

timeInBtn.addEventListener('click', () => handleAttendance('in'));
timeOutBtn.addEventListener('click', () => handleAttendance('out'));

window.addEventListener("online", () => {
    syncPendingAttendanceLogs().catch((error) => console.warn("Attendance online sync failed:", error));
});

// â”€â”€ Activity History Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _historyCache = [];
let _historyFilter = 'all';
let _historyLoading = false;

async function loadHistoryPage() {
    // Wait for auth to resolve if uid not yet set
    const uid = appState.user.uid;
    if (!uid) {
        // Don't stack retries â€” only schedule one
        if (!_historyLoading) {
            _historyLoading = true;
            setTimeout(() => { _historyLoading = false; loadHistoryPage(); }, 500);
        }
        return;
    }

    if (_historyLoading) return;
    _historyLoading = true;

    const timeline = document.getElementById('historyTimeline');
    if (!timeline) { _historyLoading = false; return; }

    timeline.innerHTML = `
                <div style="text-align:center;padding:32px 20px;color:var(--muted);">
                    <span class="material-symbols-outlined" style="font-size:40px;opacity:0.3;display:block;margin-bottom:10px;">hourglass_empty</span>
                    Loading your activity...
                </div>`;

    try {
        // Fetch all three sources in parallel â€” each catches its own error
        const [attendanceLogs, sosLogs, vaultPosts] = await Promise.all([
            getAttendanceHistory(uid).catch(e => { console.warn('History: attendance fetch failed', e); return []; }),
            getUserSOSLogs(uid).catch(e => { console.warn('History: SOS fetch failed', e); return []; }),
            getUserEmergencyPosts(uid).catch(e => { console.warn('History: vault fetch failed', e); return []; })
        ]);

        const events = [];

        // â”€â”€ Attendance (remote) â”€â”€
        attendanceLogs.forEach(log => {
            const ts = log.timestamp?.toDate?.() || new Date(log.clientTimestamp || log.timestamp || Date.now());
            events.push({
                kind: 'attendance',
                subtype: log.type === 'in' ? 'in' : 'out',
                title: log.type === 'in' ? 'Timed In' : 'Timed Out',
                sub: formatAttendanceLocation(log.location),
                ts,
                pending: false
            });
        });

        // â”€â”€ Attendance (pending / local) â”€â”€
        readPendingAttendanceLogs(uid).forEach(log => {
            const ts = new Date(log.clientTimestamp || Date.now());
            events.push({
                kind: 'attendance',
                subtype: log.type === 'in' ? 'in' : 'out',
                // (2026-07-13) Fix mojibake characters in sync status; was corrupted string
                sub: (formatAttendanceLocation(log.location) || 'Unknown location') + ' \u2022 Syncing...',
                ts,
                pending: true
            });
        });

        // â”€â”€ SOS alerts â”€â”€
        sosLogs.forEach(log => {
            const ts = log.timestamp?.toDate?.() || new Date(log.timestamp || Date.now());
            const loc = log.location;
            const locStr = loc?.address
                || (typeof loc?.lat === 'number' ? `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : 'Unknown location');
            events.push({
                kind: 'sos',
                subtype: 'sos',
                title: 'SOS Alert Triggered',
                sub: locStr,
                ts,
                pending: false
            });
        });

        // â”€â”€ Vault / evidence posts â”€â”€
        vaultPosts.forEach(post => {
            const ts = post.createdAt?.toDate?.() || new Date(post.createdAt || Date.now());
            const count = (post.attachments || []).length;
            const locStr = post.location?.address || 'Unknown location';
            events.push({
                kind: 'vault',
                subtype: 'vault',
                // (2026-07-13) Fix mojibake separator in vault events; was corrupted
                sub: `${count} file${count !== 1 ? 's' : ''} \u2022 ${locStr}`,
                ts,
                pending: false
            });
        });

        // Sort newest first
        events.sort((a, b) => b.ts - a.ts);

        // Deduplicate: drop pending if a synced entry exists for same type+minute
        const seen = new Set();
        _historyCache = events.filter(ev => {
            const key = `${ev.subtype}_${Math.floor(ev.ts.getTime() / 60000)}`;
            if (ev.pending && seen.has(key)) return false;
            seen.add(key);
            return true;
        });

    } catch (err) {
        console.warn('History load error:', err);
        _historyCache = [];
    }

    _historyLoading = false;
    renderHistory();
}

function renderHistory() {
    const timeline = document.getElementById('historyTimeline');
    if (!timeline) return;

    const filtered = _historyFilter === 'all'
        ? _historyCache
        : _historyCache.filter(ev => ev.kind === _historyFilter);

    if (filtered.length === 0) {
        const label = _historyFilter === 'all' ? 'No activity recorded yet.' : `No ${_historyFilter} activity found.`;
        timeline.innerHTML = `
                    <div style="text-align:center;padding:32px 20px;color:var(--muted);">
                        <span class="material-symbols-outlined" style="font-size:40px;opacity:0.3;display:block;margin-bottom:10px;">inbox</span>
                        ${label}
                    </div>`;
        return;
    }

    // Group by calendar day
    const groups = new Map();
    filtered.forEach(ev => {
        const dayKey = ev.ts.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        if (!groups.has(dayKey)) groups.set(dayKey, []);
        groups.get(dayKey).push(ev);
    });

    const iconMap = {
        sos: { cls: 'sos', icon: 'emergency' },
        in: { cls: 'in', icon: 'login' },
        out: { cls: 'out', icon: 'logout' },
        vault: { cls: 'vault', icon: 'encrypted' }
    };

    let html = '';
    groups.forEach((evs, day) => {
        html += `<div class="history-day-label">${day}</div>`;
        evs.forEach(ev => {
            const { cls, icon } = iconMap[ev.subtype] || { cls: 'vault', icon: 'info' };
            const timeStr = formatTime12(ev.ts);
            // Escape user-generated content
            const safeTitle = ev.title.replace(/</g, '&lt;');
            const safeSub = (ev.sub || '').replace(/</g, '&lt;');
            html += `
                        <div class="history-item" data-kind="${ev.kind}">
                            <div class="history-icon ${cls}">
                                <span class="material-symbols-outlined" style="font-size:20px;font-variation-settings:'FILL' 1;">${icon}</span>
                            </div>
                            <div class="history-body">
                                <div class="history-title">${safeTitle}</div>
                                <div class="history-sub">${safeSub}</div>
                            </div>
                            <div class="history-time">${timeStr}</div>
                        </div>`;
        });
    });

    timeline.innerHTML = html;
}

window.filterHistory = function (filter) {
    _historyFilter = filter;
    document.querySelectorAll('.history-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderHistory();
};

// Wrap setActiveView â€” history loading is now handled inside setActiveView directly above.

// --- TRACKING LOGIC (Date: 2026-05-02) ---

function startTracking() {
    if (appState.trackingId) return;
    if (!navigator.geolocation) {
        appState.isLocationTrackingActive = false;
        appState.locationPermissionDenied = true;
        if (appState.user.uid) {
            setStudentLocationSharingStatus(appState.user.uid, {
                sharingEnabled: false,
                sharingState: "unsupported",
                sharingMessage: "Location services are not available on this device."
            }).catch((error) => console.warn("Location status sync failed:", error));
        }
        updateTrackingStatusBanner();
        return;
    }
    console.log("Starting real-time tracking...");
    appState.trackingId = navigator.geolocation.watchPosition(
        (pos) => {
            appState.lastLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                timestamp: new Date()
            };
            appState.isLocationTrackingActive = true;
            // (2026-07-13) Sync geofence auto-out with live GPS tracker; was missing sync
            checkCampusGeofence(pos.coords.latitude, pos.coords.longitude);
            updateOwnLocationHighlight([pos.coords.latitude, pos.coords.longitude], false);
            updateSosLocationDisplay(pos.coords.latitude, pos.coords.longitude);
            updateTrackingStatusBanner();

            if (appState.user.uid) {
                updateStudentLiveLocation(appState.user.uid, {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    isInside: appState.isInsideCampus
                }).catch(e => console.warn("Live tracking sync failed:", e));
            }
        },
        (err) => {
            console.warn("Tracking error:", err);
            appState.isLocationTrackingActive = false;
            appState.locationPermissionDenied = err?.code === 1;
            if (appState.user.uid) {
                setStudentLocationSharingStatus(appState.user.uid, {
                    sharingEnabled: false,
                    sharingState: err?.code === 1 ? "permission_denied" : "error",
                    sharingMessage: err?.code === 1
                        ? "Location permission is turned off on your child's device."
                        : "The device could not share live location right now."
                }).catch((error) => console.warn("Location status sync failed:", error));
            }
            updateTrackingStatusBanner();
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 }
    );
}

function stopTracking() {
    if (appState.trackingId) {
        navigator.geolocation.clearWatch(appState.trackingId);
        appState.trackingId = null;
        console.log("Stopped real-time tracking.");
    }
    appState.isLocationTrackingActive = false;
    if (appState.user.uid) {
        setStudentLocationSharingStatus(appState.user.uid, {
            sharingEnabled: false,
            sharingState: "stopped",
            sharingMessage: "Location sharing is currently turned off on your child's device."
        }).catch((error) => console.warn("Location status sync failed:", error));
    }
    updateTrackingStatusBanner();
}

// (2026-07-13) Include campus boundary check in attendance GPS; was lat lng
function getFallbackAttendanceLocation() {
    if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
        const isInside = isPointInPolygon([appState.lastLocation.lat, appState.lastLocation.lng], getCampusGeofencePolygon());
        return {
            lat: appState.lastLocation.lat,
            lng: appState.lastLocation.lng,
            address: `Lat ${appState.lastLocation.lat.toFixed(5)}, Lng ${appState.lastLocation.lng.toFixed(5)}`,
            isInside
        };
    }

    return {
        lat: null,
        lng: null,
        address: "Location unavailable",
        isInside: false
    };
}

// (2026-07-13) Fast cached location resolution; was slow cold GPS wait
async function resolveAttendanceLocation() {
    let lat = null;
    let lng = null;

    // Instant check: Use active tracked GPS location if available
    if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
        lat = appState.lastLocation.lat;
        lng = appState.lastLocation.lng;
    } else if (window.Capacitor?.isNativePlatform?.() && window.Capacitor.Plugins?.Geolocation) {
        try {
            const pos = await Promise.race([
                window.Capacitor.Plugins.Geolocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: 1500,
                    maximumAge: 60000
                }),
                new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 1500))
            ]);
            if (pos?.coords?.latitude && pos?.coords?.longitude) {
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                appState.lastLocation = { lat, lng, timestamp: new Date() };
            }
        } catch (_) { }
    }

    if (!lat || !lng) {
        try {
            const position = await new Promise((resolve, reject) => {
                if (!navigator.geolocation) return reject(new Error("No geolocation"));
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 1500,
                    maximumAge: 60000
                });
            });
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            appState.lastLocation = { lat, lng, timestamp: new Date() };
        } catch (e) {
            if (appState.lastLocation?.lat && appState.lastLocation?.lng) {
                lat = appState.lastLocation.lat;
                lng = appState.lastLocation.lng;
            }
        }
    }

    if (!lat || !lng) {
        return getFallbackAttendanceLocation();
    }

    const isInside = isPointInPolygon([lat, lng], getCampusGeofencePolygon());
    let address = "";

    if (isInside) {
        const campusSpot = getNearestLandmark(lat, lng);
        address = campusSpot.startsWith("CTU") ? campusSpot : `CTU Daanbantayan (${campusSpot})`;
    } else {
        const localPlace = getNearestLandmark(lat, lng);
        address = localPlace.includes("Outside") ? localPlace : `${localPlace} (Outside Campus)`;
    }

    return {
        lat,
        lng,
        address,
        isInside
    };
}

// Modify startSosHold to log location to DB
const originalStartSosHold = startSosHold;
startSosHold = async () => {
    originalStartSosHold();
    // We can log the SOS event to DB once it triggers
};

// Update SOS Trigger to save to Firestore
const checkSosTrigger = setInterval(() => {
    if (appState.sosTriggered && !appState.sosLogged) {
        appState.sosLogged = true;
        // (2026-07-13) Pass real staff profile name & role; was defaulting student
        logSOS(appState.user.uid, appState.lastLocation || { lat: 0, lng: 0 }, {
            userName: appState.profile?.name || appState.user?.name || appState.user?.displayName || "Campus Staff",
            userEmail: appState.profile?.email || appState.user?.email || "",
            studentId: appState.profile?.studentId || appState.user?.studentId || "",
            role: appState.profile?.role || appState.user?.role || "staff"
        });
    } else if (!appState.sosTriggered) {
        appState.sosLogged = false;
    }
}, 1000);


setSosIdleState();

// --- CHAT LOGIC (Date: 2026-05-02) ---
const chatOverlay = document.getElementById("chatOverlay");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");
const closeChatBtn = document.getElementById("closeChatBtn");
const anonymousSupportToggle = document.getElementById("anonymousSupportToggle");

let unsubscribeChat = null;
let currentSupportThreadId = null;
let currentSupportParticipantId = null;
let currentAnonymousSupportSessionId = null;

function syncChatViewport() {
    if (!chatOverlay) return;

    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--chat-viewport-height", `${Math.round(viewportHeight)}px`);
    const keyboardIsOpen = window.visualViewport
        ? (window.innerHeight - window.visualViewport.height) > 120
        : false;
    chatOverlay.classList.toggle("keyboard-open", keyboardIsOpen);
}

function createAnonymousSupportSessionId() {
    return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSupportThreadState() {
    const adminId = "system_admin_securo";
    const isAnonymous = anonymousSupportToggle?.checked !== false;

    if (isAnonymous) {
        if (!currentAnonymousSupportSessionId) {
            currentAnonymousSupportSessionId = createAnonymousSupportSessionId();
        }
        return {
            adminId,
            isAnonymous,
            participantId: currentAnonymousSupportSessionId,
            threadId: `support_${adminId}_${currentAnonymousSupportSessionId}`
        };
    }

    return {
        adminId,
        isAnonymous,
        participantId: appState.user.uid,
        threadId: [appState.user.uid, adminId].sort().join("_")
    };
}

function openChat() {
    chatOverlay.classList.add("active");
    syncChatViewport();

    // Auto-focus the input field
    setTimeout(() => {
        if (chatInput) chatInput.focus();
    }, 300);

    if (appState.user.uid) {
        const supportState = getSupportThreadState();
        currentSupportThreadId = supportState.threadId;
        currentSupportParticipantId = supportState.participantId;

        if (unsubscribeChat) unsubscribeChat();
        unsubscribeChat = subscribeToMessagesByThread(currentSupportThreadId, (messages) => {
            renderMessages(messages);
        });
    }
}

function closeChat() {
    chatOverlay.classList.remove("active");
    chatOverlay.classList.remove("keyboard-open");
    if (unsubscribeChat) {
        unsubscribeChat();
        unsubscribeChat = null;
    }
}

function renderMessages(messages) {
    chatMessages.innerHTML = "";
    if (messages.length === 0) {
        chatMessages.innerHTML = '<div class="chat-message received">Hello! You can chat with GAD support here, and anonymous mode can stay on if you prefer privacy.<span class="chat-time">Just now</span></div>';
    }

    // Deduplicate and sort messages
    const allMessages = [...messages].sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.localTime || 0);
        const timeB = b.timestamp?.toDate?.() || new Date(b.localTime || 0);
        return timeA - timeB;
    });

    allMessages.forEach(msg => {
        const isSent = msg.senderId === appState.user.uid;
        const date = msg.timestamp?.toDate?.() || new Date(msg.localTime || Date.now());
        const timeStr = formatTime12(date);

        const msgEl = document.createElement("div");
        msgEl.className = `chat-message ${isSent ? "sent" : "received"}`;
        if (msg.isPending) msgEl.style.opacity = "0.7";
        msgEl.innerHTML = `${msg.text}<span class="chat-time">${timeStr}</span>`;
        chatMessages.appendChild(msgEl);
    });
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
}

async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (!text || !appState.user.uid) return;

    const supportState = getSupportThreadState();
    const adminId = supportState.adminId;
    // (2026-07-13) Tag staff chat messages with staff role; was student
    const isAnonymous = supportState.isAnonymous;
    const roleTag = (appState.user.role || 'staff').toLowerCase();
    const senderLabel = isAnonymous ? "Anonymous Staff" : (appState.user.name || "Staff");
    currentSupportThreadId = supportState.threadId;
    currentSupportParticipantId = supportState.participantId;

    // UI Predictive Update: Show message immediately
    const tempMsg = {
        text,
        senderId: appState.user.uid,
        localTime: Date.now(),
        isPending: true
    };

    // Append to UI immediately for "Always Send" feel
    const msgEl = document.createElement("div");
    msgEl.className = "chat-message sent";
    msgEl.style.opacity = "0.7";
    msgEl.innerHTML = `${text}<span class="chat-time">${formatTime12(new Date())}</span>`;
    chatMessages.appendChild(msgEl);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
    chatInput.value = "";

    try {
        await sendChatMessage(appState.user.uid, adminId, text, senderLabel, {
            threadId: currentSupportThreadId,
            senderRole: roleTag,
            recipientRole: "admin",
            supportMode: "gad_support",
            isAnonymous,
            senderLabel,
            ownerId: appState.user.uid,
            anonymousSessionId: isAnonymous ? currentSupportParticipantId : ""
        });
    } catch (err) {
        console.warn("Failed to send message:", err);
        msgEl.style.color = "var(--error)";
        msgEl.innerHTML += '<span style="font-size:0.5rem;display:block;">Tap to retry</span>';
    }
}

if (anonymousSupportToggle) {
    anonymousSupportToggle.addEventListener("change", () => {
        if (anonymousSupportToggle.checked) {
            currentAnonymousSupportSessionId = createAnonymousSupportSessionId();
        }
        if (chatOverlay?.classList.contains("active")) {
            if (unsubscribeChat) {
                unsubscribeChat();
                unsubscribeChat = null;
            }
            openChat();
        }
    });
}

if (sendChatBtn) sendChatBtn.addEventListener("click", handleSendMessage);
if (chatInput) chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // Prevent newline in input
        handleSendMessage();
    }
});
if (chatInput) {
    chatInput.addEventListener("focus", () => {
        setTimeout(syncChatViewport, 120);
    });
}
if (closeChatBtn) closeChatBtn.addEventListener("click", closeChat);
if (chatOverlay) chatOverlay.addEventListener("click", (e) => {
    if (e.target === chatOverlay) closeChat();
});
// (2026-07-13) Prevent image drag across entire application; was draggable
window.addEventListener('dragstart', (e) => {
    if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
    }
}, false);
