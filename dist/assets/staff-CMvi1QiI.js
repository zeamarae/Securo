const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./staff-BRVFrD-6.js","./install-sw-DzuPi5je.js","./preload-helper-CGP3o08e.js","./emergency-contacts-Dwzo_aEB.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css                  */r();var o=e(),s=`<!-- (2026-07-13) Dramatic intro preloader with logo; was immediate page view -->
    <div id="securo-preloader-overlay">
        <div class="securo-preloader-bg"></div>
        <div class="securo-preloader-content">
            <div class="securo-preloader-logo-wrap">
                <img src="../assets/images/logo with text.png" alt="Securo" class="securo-preloader-logo">
                <div class="securo-preloader-shimmer"></div>
            </div>
            <!-- (2026-07-13) Move indicator below logo in preloader; was above logo -->
            <div class="securo-preloader-indicator">
                <span class="securo-preloader-status-text">INITIALIZING SECURE SYSTEMS</span>
                <div class="securo-preloader-progress-track">
                    <div class="securo-preloader-progress-bar"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Auto-dismiss watchdog for preloader overlay; was unmonitored -->


    <div class="device-shell mx-auto">
        <div class="screen">
            <!-- [REMOVED] Embedded Login Screen (Date: 2026-05-01) - Now handled by login.html -->


            <section class="app-view" id="appView" aria-label="Securo application">
                <div class="app-shell">
                    <header class="topbar navbar navbar-expand border-0">
                        <div class="container-fluid px-0 content-frame">
                            <!-- (2026-07-13) Fix fallback logo link to staff.html; was index.html -->
                            <div class="topbar-left navbar-brand mb-0 sta-u1" id="topbarHomeBrand"
                                onclick="if(window.setActiveView){window.setActiveView('map');}else{window.location.href='staff.html';}"
                                title="Go to Map Homepage">
                                <img src="../assets/images/logo with text.png" alt="Securo"
                                    class="topbar-brand-logo sta-u2" draggable="false">
                                <div aria-hidden="true" class="sta-u3">
                                    <div class="surface-icon" id="headerLeadingIcon"></div>
                                    <div class="topbar-title" id="headerTitle">Securo</div>
                                </div>
                            </div>
                            <div class="topbar-right ms-auto sta-u4">
                                <!-- (2026-07-13) Add unread count badge on GAD msg icon; was plain icon -->
                                <!-- Header GAD message trigger -->
                                <button class="surface-icon gad-header-msg-btn" type="button" id="headerGadMsgBtn"
                                    aria-label="GAD Messages" title="GAD Messages">
                                    <span class="material-symbols-outlined">chat</span>
                                    <span class="msg-unread-badge" id="headerGadMsgBadge"></span>
                                </button>
                                <div class="notif-btn">
                                    <button class="surface-icon" type="button" id="notifBell"
                                        aria-label="Notifications">
                                        <span class="material-symbols-outlined">notifications</span>
                                        <div class="notif-badge" id="notifBadge"></div>
                                    </button>
                                    <div class="notif-dropdown" id="notifDropdown">
                                        <div class="notif-panel">
                                            <div class="notif-header">
                                                <div>
                                                    <span class="notif-title">Notifications</span>
                                                    <span class="notif-subtitle">Requests, approvals, and app
                                                        activity</span>
                                                </div>
                                                <button class="notif-close" type="button" id="notifCloseBtn"
                                                    aria-label="Close notifications">
                                                    <span class="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                            <div class="notif-list" id="notifList">
                                                <div class="notif-empty">No new notifications</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="profile-chip" id="profileChip">
                                    <span id="userInitials">??</span>
                                    <!-- Dropdown Menu (Date: 2026-05-01) -->
                                    <div class="profile-dropdown" id="profileDropdown">
                                        <div class="sta-u5">
                                            <div id="dropdownName" class="dropdown-user-name">
                                                Loading...</div>
                                            <div id="dropdownId" class="sta-u6">ID:
                                                ---</div>
                                        </div>
                                        <div class="dropdown-divider"></div>
                                        <a href="../public/profile.html" class="dropdown-item">
                                            <span class="material-symbols-outlined">account_circle</span>
                                            <span>Profile View</span>
                                        </a>
                                        <button class="dropdown-item"
                                            onclick="window.setActiveView('history'); document.getElementById('profileDropdown').classList.remove('active');">
                                            <span class="material-symbols-outlined">manage_history</span>
                                            <span>Activity History</span>
                                        </button>
                                        <a href="../public/settings.html" class="dropdown-item">
                                            <span class="material-symbols-outlined">settings</span>
                                            <span>Settings</span>
                                        </a>
                                        <!-- (2026-07-13) Add About Us link to student dropdown; was settings only -->
                                        <a href="../public/about.html" class="dropdown-item">
                                            <span class="material-symbols-outlined">info</span>
                                            <span>About Us</span>
                                        </a>
                                        <a href="../admin/admin.html" class="dropdown-item sta-u7" id="adminLink">
                                            <span class="material-symbols-outlined">admin_panel_settings</span>
                                            <span>Admin Panel</span>
                                        </a>
                                        <div class="dropdown-divider"></div>

                                        <button class="dropdown-item logout" id="logoutLink">
                                            <span class="material-symbols-outlined">logout</span>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </header>

                    <!-- (2026-07-13) Add parent invite link to header bar; was chip only -->
                    <div class="student-parent-bar" id="studentParentBar">
                        <div id="studentParentChips" class="sta-u8">
                            <div class="parent-selector-chip sta-u9" id="noParentsChip" title="Tap to invite parents">
                                <span class="material-symbols-outlined sta-u10">family_restroom</span>
                                <span>No parents watching over you yet</span>
                            </div>
                        </div>
                        <!-- (2026-07-13) Show invite parent button in bar; was display none -->
                        <button type="button" class="invite-parent-bar-btn" id="inviteParentBarBtn"
                            title="Invite a parent or guardian">
                            <span class="material-symbols-outlined">person_add</span>
                            <span>Invite Parent</span>
                        </button>
                    </div>

                    <main class="screen-content" id="screenContent">
                        <!-- (2026-07-13) Reorganize page-map with compact tracking pill and split controls; was monolithic stack -->
                        <section class="page active" id="page-map" data-page="map">
                            <div class="map-stage sta-u11">
                                <!-- Leaflet Map Container -->
                                <div id="map" class="sta-u12"></div>

                                <!-- Map Search & Quick Access Overlay (Left Side) -->
                                <div class="map-overlay-left">
                                    <!-- Compact Floating Tracking Status Pill -->
                                    <div class="tracking-status-pill is-off" id="trackingStatusBanner">
                                        <span class="pulse-status-dot" id="trackingStatusDot"></span>
                                        <span class="material-symbols-outlined tracking-status-icon"
                                            id="trackingStatusIcon">location_off</span>
                                        <span class="tracking-status-label-text" id="trackingStatusCopy">Location
                                            Off</span>
                                    </div>

                                    <!-- Campus Search Box -->
                                    <div class="map-search-bar">
                                        <span class="material-symbols-outlined">search</span>
                                        <input type="text" placeholder="Search Campus..." id="mapSearchInput"
                                            autocomplete="off">
                                    </div>

                                    <!-- (2026-07-13) Remove quick access chips container; was parking/clinic/wifi buttons -->
                                </div>

                                <!-- (2026-07-13) Add map view switcher button; was standard control buttons only -->
                                <div class="map-controls-custom map-controls-top">
                                    <button class="map-btn" id="map-layers-btn"
                                        title="Toggle Map Style (Satellite / Hybrid / Streets)">
                                        <span class="material-symbols-outlined">layers</span>
                                    </button>
                                    <button class="map-btn" id="map-toggle-markers" title="Hide Campus Markers">
                                        <span class="material-symbols-outlined">visibility</span>
                                    </button>
                                    <button class="map-btn" id="map-locate" title="My GPS Location">
                                        <span class="material-symbols-outlined">my_location</span>
                                    </button>
                                    <!-- (2026-07-13) Remove share location button from map; was share button -->
                                    <button class="map-btn" id="map-recenter-campus" title="Center CTU Campus">
                                        <span class="material-symbols-outlined">domain</span>
                                    </button>
                                    <button class="map-btn" id="map-zoom-in" title="Zoom In">
                                        <span class="material-symbols-outlined">add</span>
                                    </button>
                                    <button class="map-btn" id="map-zoom-out" title="Zoom Out">
                                        <span class="material-symbols-outlined">remove</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section class="page" id="page-vault" data-page="vault">
                            <!-- (2026-07-13) Remove eyebrow badge from vault header; was eyebrow tag -->
                            <div class="page-header sta-u13">
                                <div class="icon-badge sta-u14">
                                    <span class="material-symbols-outlined sta-u15">shield_lock</span>
                                </div>
                                <div class="sta-u16">
                                    <h1 class="page-title sta-u17">
                                        Digital Vault</h1>
                                    <p class="page-copy sta-u18">
                                        Captured media is encrypted and securely timestamped on the verification-ready
                                        ledger.</p>
                                </div>
                            </div>

                            <div class="section-stack sta-u19">
                                <!-- Vault Summary Hero Card -->
                                <div class="card summary-card sta-u20">
                                    <div class="sta-u21">
                                        <div>
                                            <div class="mini-label sta-u22">
                                                Total Secured Evidence</div>
                                            <div class="section-title sta-u23" id="vaultTotalEvidence">
                                                0 Files</div>
                                        </div>
                                        <div class="sta-u24">
                                            <div class="sta-u25">
                                                <span class="material-symbols-outlined sta-u26">lock</span>
                                                <span>AES-256 Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Vault Multi-Selection Action Toolbar -->
                                <div class="vault-selection-toolbar sta-u27" id="vaultSelectionToolbar">
                                    <div class="vault-selection-copy">
                                        <span class="vault-selection-title sta-u28" id="vaultSelectionCount">0
                                            selected</span>
                                        <span class="vault-selection-subtitle sta-u29">Tap items to select or
                                            batch delete.</span>
                                    </div>
                                    <div class="vault-selection-actions sta-u30">
                                        <button class="vault-selection-btn" id="cancelVaultSelectionBtn"
                                            type="button">Cancel</button>
                                        <button class="vault-selection-btn" id="selectAllVaultBtn" type="button">Select
                                            All</button>
                                        <button class="vault-selection-btn danger sta-u31" id="deleteSelectedVaultBtn"
                                            type="button">
                                            <span class="material-symbols-outlined sta-u32">delete</span>
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Media Grid -->
                                <div class="vault-grid" id="vaultGrid">
                                    <div class="vault-empty sta-u33">
                                        <div class="icon-badge sta-u34">
                                            <span class="material-symbols-outlined sta-u35">photo_library</span>
                                        </div>
                                        <strong class="sta-u36">No
                                            Media Stored Yet</strong>
                                        <p class="sta-u37">
                                            Photos and video recordings captured during emergency SOS will automatically
                                            appear here securely.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="page page-sos-shell" id="page-sos" data-page="sos">
                            <div class="sos-page-overlay" id="sosPageOverlay" aria-hidden="true"></div>

                            <!-- (2026-07-13) Clean, unified emergency command header; was cluttered double boxes -->
                            <div class="sos-topline sta-u38" id="sosToplineHeader">
                                <div class="emergency-eyebrow-container" id="emergencyEyebrowContainer">
                                    <div class="eyebrow emergency-eyebrow sta-u39">
                                        <span class="material-symbols-outlined sta-u40">emergency</span>
                                        PRIORITY EMERGENCY CHANNEL
                                    </div>
                                    <h1 class="page-title rapid-sos-title sta-u41">
                                        Emergency SOS</h1>
                                </div>
                                <div class="recording-pill recording-status-indicator sta-u42"
                                    id="recordingStatusIndicator">
                                    <span class="record-dot active-record-dot sta-u43"></span>
                                    <span class="recording-text-label">Active</span>
                                </div>
                            </div>

                            <div class="section-stack sta-u44" id="sosSectionStack">
                                <!-- Hero Action Stage -->
                                <div class="sos-hero-card sta-u45">
                                    <div class="center-copy sta-u46">
                                        <h2 class="sta-u47">
                                            Trigger Emergency Alert</h2>
                                        <p class="subcopy sta-u48">
                                            Press and hold to broadcast instant priority alert with live GPS and camera
                                            uplink.</p>
                                    </div>

                                    <div class="sos-stage sta-u49">
                                        <div class="sos-ring sta-u50" id="sosRing">
                                            <!-- (2026-07-13) Clockwise hold spinner progress arc; was plain ring -->
                                            <svg class="sos-progress-spinner sta-u51" id="sosProgressSpinner"
                                                viewBox="0 0 204 204">
                                                <circle cx="102" cy="102" r="92" class="sta-u52">
                                                </circle>
                                                <circle id="sosProgressArc" cx="102" cy="102" r="92" class="sta-u53">
                                                </circle>
                                            </svg>
                                            <button class="sos-button" id="sosButton" type="button"
                                                aria-label="Trigger Emergency SOS">SOS</button>
                                        </div>
                                    </div>

                                    <div class="hold-caption sta-u54" id="sosCaption">
                                        <span class="sta-u55"></span>
                                        Hold for emergency response
                                    </div>
                                </div>

                                <!-- Telemetry Dispatch & Live Location Cards -->
                                <div class="sta-u56">
                                    <div class="card dispatch-card sta-u57">
                                        <div class="sta-u58">
                                            <span class="material-symbols-outlined sta-u59">local_police</span>
                                            <span class="success-state sta-u60" id="dispatchState">Standby</span>
                                        </div>
                                        <div class="dispatch-title-container" id="dispatchTitleContainer">
                                            <strong class="dispatch-title-strong sta-u61">Immediate
                                                Dispatch</strong>
                                            <span class="sta-u62">Campus
                                                Security Link</span>
                                        </div>
                                    </div>

                                    <div class="card location-card sta-u57">
                                        <div class="sta-u58">
                                            <span class="material-symbols-outlined sta-u63">near_me</span>
                                            <span class="sta-u64">Live
                                                GPS</span>
                                        </div>
                                        <div>
                                            <!-- (2026-07-13) Dynamic nearest landmark title; was static text -->
                                            <strong id="sosCurrentLocationTitle" class="sta-u65">CTU
                                                Daanbantayan</strong>
                                            <span id="sosCurrentLocationSub" class="sta-u66">Campus
                                                bounds</span>
                                        </div>
                                    </div>
                                </div>

                                <!-- (2026-07-13) Hide contacts widget to prevent SOS scroll; was visible -->
                                <div id="emergencyContactsWidget" class="sta-u67"></div>
                            </div>
                        </section>

                        <!-- (2026-07-13) Upgrade GAD section to full GAD Portal with services and PM; was GAD bulletin -->
                        <section class="page" id="page-gad" data-page="gad">
                            <!-- Distinct Portal Theme Wrap -->
                            <div class="sta-u68">
                                <div class="page-header sta-u69">
                                    <div class="icon-badge sta-u70">
                                        <span class="material-symbols-outlined sta-u71">diversity_3</span>
                                    </div>
                                    <div class="sta-u16">
                                        <h1 class="page-title sta-u72">
                                            GAD Portal</h1>
                                        <p class="sta-u73">
                                            Equality, Inclusion & Safe Spaces</p>
                                    </div>
                                </div>

                                <!-- Hero Action -->
                                <div class="card vault-card sta-u74">
                                    <div class="sta-u75">
                                        <div>
                                            <strong class="sta-u76">Confidential
                                                GAD Desk</strong>
                                            <span class="sta-u77">Direct
                                                assistance, guidance, and completely safe reporting.</span>
                                        </div>
                                        <div class="sta-u78">
                                            <span class="material-symbols-outlined sta-u35">verified_user</span>
                                        </div>
                                    </div>
                                    <button class="primary-btn sta-u79" id="openGadPmBtn" type="button">
                                        <span class="material-symbols-outlined">shield_person</span>
                                        <span>Report / Message GAD</span>
                                    </button>
                                </div>
                            </div>

                            <div class="section-stack sta-u80">
                                <!-- (2026-07-13) Removed Support Services & Quick Resources; was cards -->

                                <!-- GAD Sub-Navigation Tabs -->
                                <div class="sta-u81">
                                    <button class="history-filter-btn active sta-u82" id="gadTabAnnouncements"
                                        type="button" onclick="switchGadTab('announcements')">Announcements</button>
                                    <button class="history-filter-btn sta-u82" id="gadTabMyMessages" type="button"
                                        onclick="switchGadTab('messages')">My Inquiries</button>
                                </div>

                                <!-- Announcements Panel -->
                                <div id="gadAnnouncementsPanel">
                                    <div id="gadPostsFeed">
                                        <div id="feedLoader" class="sta-u83">
                                            <span class="spinner sta-u84"></span>
                                            <p class="sta-u85">Loading announcements...
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Student Inquiries / Messages Panel -->
                                <div id="gadMessagesPanel" class="sta-u86">
                                    <div id="gadInquiriesList">
                                        <div class="sta-u87">
                                            <span class="material-symbols-outlined sta-u88">forum</span>
                                            No messages sent yet. Use "Report / Message GAD" above to start.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Activity History Page -->
                        <section class="page" id="page-history" data-page="history">
                            <div class="section-stack">
                                <!-- (2026-07-13) Uniform Activity History header; was basic header -->
                                <div class="page-header sta-u13">
                                    <div class="icon-badge sta-u89">
                                        <span class="material-symbols-outlined sta-u15">manage_history</span>
                                    </div>
                                    <div class="sta-u16">
                                        <div class="eyebrow sta-u90">
                                            YOUR TIMELINE</div>
                                        <h1 class="page-title sta-u91">
                                            Activity History</h1>
                                        <p class="page-copy sta-u18">
                                            A log of your SOS alerts, attendance, and vault activity.</p>
                                    </div>
                                </div>

                                <!-- Filter chips -->
                                <div class="sta-u92">
                                    <button class="history-filter-btn active" data-filter="all"
                                        onclick="filterHistory('all')">All</button>
                                    <button class="history-filter-btn" data-filter="sos"
                                        onclick="filterHistory('sos')">SOS</button>
                                    <button class="history-filter-btn" data-filter="attendance"
                                        onclick="filterHistory('attendance')">Attendance</button>
                                    <button class="history-filter-btn" data-filter="vault"
                                        onclick="filterHistory('vault')">Vault</button>
                                </div>

                                <!-- Timeline list -->
                                <div class="card sta-u93">
                                    <div id="historyTimeline">
                                        <div class="sta-u94">
                                            <span class="material-symbols-outlined sta-u95">hourglass_empty</span>
                                            Loading your activity...
                                        </div>
                                    </div>
                                </div>

                                <div class="card sta-u93">
                                    <div class="sta-u96">
                                        <div>
                                            <div class="mini-label">NOTIFICATIONS</div>
                                            <div class="sta-u97">Notification History</div>
                                        </div>
                                        <span class="material-symbols-outlined sta-u98">notifications</span>
                                    </div>
                                    <div id="historyNotifications" class="notif-history-list">
                                        <div class="notif-empty sta-u99">No notifications yet</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="page" id="page-attendance" data-page="attendance">
                            <div class="section-stack">
                                <!-- (2026-07-13) Fix closed page-header and uniform Attendance card stack; was unclosed header tag -->
                                <div class="page-header sta-u13">
                                    <div class="icon-badge sta-u100">
                                        <span class="material-symbols-outlined sta-u15">fact_check</span>
                                    </div>
                                    <div class="sta-u16">
                                        <!-- (2026-07-13) Remove eyebrow from attendance header; was eyebrow tag -->
                                        <h1 class="page-title sta-u17">
                                            Attendance</h1>
                                        <p class="page-copy sta-u18">
                                            Time in or out with automatic time and location logging.</p>
                                    </div>
                                </div>

                                <div class="card sta-u101">
                                    <div class="sta-u102">
                                        <div>
                                            <div class="mini-label sta-u103">
                                                Presence Status</div>
                                            <div class="sta-u104">
                                                Campus Attendance</div>
                                        </div>
                                        <div id="attendanceStatusPill" class="sta-u105">
                                            <span id="attendanceStatusDot" class="sta-u106"></span>
                                            <span id="currentStatusText">Timed Out</span>
                                        </div>
                                    </div>

                                    <div class="sta-u107">
                                        <button id="timeInBtn" class="button-primary sta-u108">
                                            <span class="material-symbols-outlined sta-u109">login</span>
                                            <span>TIME IN</span>
                                        </button>
                                        <button id="timeOutBtn" class="button-primary sta-u110" disabled>
                                            <span class="material-symbols-outlined sta-u109">logout</span>
                                            <span>TIME OUT</span>
                                        </button>
                                    </div>

                                    <div class="sta-u111">
                                        <div class="sta-u112">
                                            <div class="mini-label sta-u113">
                                                Last Log Time</div>
                                            <div id="attendanceLastTime" class="sta-u114">
                                                No records yet</div>
                                        </div>
                                        <div class="sta-u115">
                                            <div class="mini-label sta-u113">
                                                Last Location</div>
                                            <!-- (2026-07-13) Wrap long location text; was nowrap overflowing card -->
                                            <div id="attendanceLastLocation" class="sta-u116">
                                                No records yet</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="sta-u56">
                                    <div class="card sta-u117">
                                        <div id="statAttendanceRate" class="sta-u118">
                                            0%</div>
                                        <div class="sta-u119">
                                            Overall Rate</div>
                                    </div>
                                    <div class="card sta-u120">
                                        <div id="statDaysPresent" class="sta-u121">
                                            0</div>
                                        <div class="sta-u119">
                                            Days Present</div>
                                    </div>
                                </div>

                                <div class="card sta-u122">
                                    <div class="row-between sta-u123">
                                        <div>
                                            <div class="sta-u124">
                                                Attendance History</div>
                                            <span class="sta-u125">Timestamped presence
                                                log</span>
                                        </div>
                                        <!-- (2026-07-13) Add export buttons for history tab; was icon only -->
                                        <div class="sta-u126">
                                            <button id="btnExportStudentAttendanceCsv" type="button"
                                                class="btn btn-sm sta-u127" title="Export CSV">CSV</button>
                                            <button id="btnExportStudentAttendanceJson" type="button"
                                                class="btn btn-sm sta-u127" title="Export JSON">JSON</button>
                                            <span class="material-symbols-outlined sta-u128">history</span>
                                        </div>
                                    </div>
                                    <div id="attendanceHistoryList">
                                        <div class="sta-u129">
                                            No attendance records found.</div>
                                    </div>
                                </div>

                                <div class="card sta-u130">
                                    <div class="sta-u131">
                                        <div class="sta-u132">
                                            Academic Standing</div>
                                        <div id="academicStandingText" class="sta-u133">
                                            Initializing...</div>
                                        <p id="academicStandingCopy" class="sta-u134">Please record
                                            your first attendance to see your standing.</p>
                                    </div>
                                    <span class="material-symbols-outlined sta-u135">military_tech</span>
                                </div>
                            </div>
                        </section>


                </div>
                </main>

                <nav class="bottom-nav navbar border-0" aria-label="Primary">
                    <div class="container-fluid px-0 content-frame">
                        <button class="nav-item active" type="button" data-nav="map" onclick="setActiveView('map')"
                            aria-label="Campus Map">
                            <span class="material-symbols-outlined">explore</span>
                            <span>Map</span>
                        </button>
                        <button class="nav-item" type="button" data-nav="vault" onclick="setActiveView('vault')"
                            aria-label="Digital Vault">
                            <span class="material-symbols-outlined">encrypted</span>
                            <span>Vault</span>
                        </button>
                        <button class="nav-item sos-nav" type="button" data-nav="sos" onclick="setActiveView('sos')"
                            aria-label="Emergency SOS">
                            <span class="material-symbols-outlined">emergency</span>
                            <span>SOS</span>
                        </button>
                        <button class="nav-item" type="button" data-nav="gad" onclick="setActiveView('gad')"
                            aria-label="GAD Bulletin">
                            <span class="material-symbols-outlined">campaign</span>
                            <span>GAD</span>
                        </button>
                        <button class="nav-item" type="button" data-nav="attendance"
                            onclick="setActiveView('attendance')" aria-label="Attendance Dashboard">
                            <span class="material-symbols-outlined">fact_check</span>
                            <span>Attendance</span>
                        </button>

                    </div>
                </nav>

                <button class="sos-fab" type="button" id="globalSosFab" data-nav-target="sos"
                    aria-label="Open Emergency SOS">
                    <span class="material-symbols-outlined">emergency</span>
                </button>

                <!-- (2026-07-13) Removed redundant globalGadFab; was overlapping with SOS FAB -->

                <section class="camera-overlay" id="cameraOverlay" aria-label="Emergency camera capture">
                    <div class="camera-topbar">
                        <div>
                            <div class="camera-title">Emergency Capture</div>
                            <div class="camera-subtitle">Take rapid photos and keep visual evidence flowing.</div>
                        </div>
                        <button class="camera-icon-btn" type="button" id="closeCameraOverlay"
                            aria-label="Close emergency camera">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="camera-stage">
                        <!-- Instagram style: modes removed, replaced with dynamic interaction -->
                        <div class="camera-preview-shell">
                            <!-- (2026-07-13) Dark poster on camera preview; prev: bare video tag -->
                            <video id="cameraPreview" autoplay playsinline muted
                                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23080b18'/%3E%3C/svg%3E"></video>
                            <div class="camera-overlay-grid" aria-hidden="true"></div>
                            <div class="camera-status-pill sta-u136" id="recordingStatus">
                                <span class="camera-status-dot pulse" aria-hidden="true"></span>
                                <span id="recordingTimer">00:00</span>
                            </div>
                            <div class="camera-status-pill" id="liveStatus">
                                <span class="camera-status-dot" aria-hidden="true"></span>
                                <span>Live Capture</span>
                            </div>
                            <div class="camera-empty" id="cameraEmpty">
                                <span class="material-symbols-outlined sta-u137">photo_camera</span>
                                <strong>Preparing camera</strong>
                                <p>Once permission is granted, the live emergency camera will appear here.</p>
                            </div>
                            <div class="camera-error" id="cameraError" hidden>
                                <span class="material-symbols-outlined sta-u137">warning</span>
                                <strong>Camera unavailable</strong>
                                <p id="cameraErrorText">Allow camera access to capture emergency evidence quickly.</p>
                            </div>
                        </div>

                        <div class="camera-review-bar" id="cameraReviewBar" hidden>
                            <div>
                                <strong id="reviewTitle">Processing capture...</strong>
                                <span id="reviewCopy">Evidence is being uploaded and logged automatically.</span>
                            </div>
                        </div>

                        <div class="camera-bottom">
                            <div class="camera-actions-row">
                                <div class="camera-actions-left">
                                    <button class="camera-chip-btn circular" type="button" id="galleryUploadBtn"
                                        aria-label="Open gallery">
                                        <span class="material-symbols-outlined">image</span>
                                    </button>
                                </div>
                                <div class="shutter-progress-wrap">
                                    <svg class="shutter-ring-svg" viewBox="0 0 120 120">
                                        <circle class="shutter-ring-bg" cx="60" cy="60" r="55"></circle>
                                        <circle class="shutter-ring-progress" id="shutterProgress" cx="60" cy="60"
                                            r="55"></circle>
                                    </svg>
                                    <button class="shutter-button" type="button" id="captureAction"
                                        aria-label="Tap to photo, Hold for video"></button>
                                </div>
                                <div class="camera-actions-right">
                                    <button class="camera-chip-btn circular" type="button" id="switchCameraBtn">
                                        <span class="material-symbols-outlined">flip_camera_android</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <canvas id="captureCanvas" hidden></canvas>
                    <input class="gallery-input sta-u3" id="galleryInput" type="file" accept="image/*,video/*">
                </section>
        </div>
        </section>
    </div>
    </div>

    <!-- (2026-07-13) Fix parent invite modal UI styling; prev: clashing status-btn -->
    <div class="status-modal" id="inviteParentModal">
        <div class="status-card invite-parent-card">
            <div class="status-icon-wrap sta-u138">
                <span class="material-symbols-outlined">family_restroom</span>
            </div>
            <h3 class="status-title sta-u139">Invite Parent or Guardian</h3>
            <p class="status-msg sta-u140">
                Share your unique link with your parents so they can monitor your safety and live SOS alerts.
                <!-- (2026-07-13) Add guardian email input; prev: invite link box only -->
            <div class="guardian-invite-email-wrap sta-u141">
                <label for="guardianInviteEmailInput" class="sta-u142">Guardian's Email Address</label>
                <div class="sta-u143">
                    <input type="email" id="guardianInviteEmailInput" placeholder="e.g. parent@gmail.com"
                        class="sta-u144">
                    <button type="button" class="invite-btn-primary sta-u145" id="sendGuardianInviteEmailBtn">
                        <span class="material-symbols-outlined sta-u146">send</span>
                        <span>Send</span>
                    </button>
                </div>
            </div>

            <div class="sta-u147">
                <div class="sta-u148"></div>
                <span class="sta-u149">or share link</span>
                <div class="sta-u148"></div>
            </div>

            <div class="invite-link-box" id="inviteLinkBox">
                <span id="guardianInviteUrlText" class="invite-url-text">Generating link...</span>
            </div>
            <div class="invite-modal-actions">
                <button type="button" class="invite-btn-primary" id="copyGuardianInviteBtn">
                    <span class="material-symbols-outlined sta-u150">content_copy</span>
                    <span id="copyInviteBtnLabel">Copy Invite Link</span>
                </button>
                <button type="button" class="invite-btn-share sta-u86" id="shareGuardianInviteBtn">
                    <span class="material-symbols-outlined sta-u150">share</span>
                    <span>Share via App</span>
                </button>
                <button type="button" class="invite-btn-done" id="closeInviteParentBtn">Done</button>
            </div>
        </div>
    </div>

    <!-- Status/Success Modal (Date: 2026-05-01) -->
    <!-- (2026-07-13) Replace placeholder status message text; was Message goes here. -->
    <div class="status-modal" id="statusModal">
        <div class="status-card">
            <div id="statusIconWrap" class="status-icon-wrap">
                <span class="material-symbols-outlined" id="statusIcon">check_circle</span>
            </div>
            <h3 id="statusTitle" class="status-title">Success!</h3>
            <p id="statusMessage" class="status-msg">Your action has been completed successfully.</p>
            <button id="statusOkBtn" class="status-btn">Great!</button>
        </div>
    </div>
    <div class="status-modal" id="attendanceActionModal">
        <div class="status-card">
            <div class="status-icon-wrap success" id="attendanceActionIconWrap">
                <span class="material-symbols-outlined" id="attendanceActionIcon">schedule</span>
            </div>
            <h3 id="attendanceActionTitle" class="status-title">Confirm Attendance</h3>
            <p id="attendanceActionMessage" class="status-msg">Review the captured time and location before continuing.
            </p>
            <div class="attendance-modal-summary">
                <div class="attendance-modal-item">
                    <strong>Time</strong>
                    <span id="attendanceModalTime">--</span>
                </div>
                <div class="attendance-modal-item">
                    <strong>Location</strong>
                    <span id="attendanceModalLocation">--</span>
                </div>
            </div>
            <div class="attendance-modal-actions">
                <button id="attendanceConfirmBtn" class="status-btn">Confirm</button>
                <button id="attendanceCancelBtn" class="status-btn secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div class="vault-context-menu" id="vaultContextMenu">
        <button class="context-menu-item" id="ctxViewDetails">
            <span class="material-symbols-outlined">info</span>
            <span>View Details</span>
        </button>
        <button class="context-menu-item" id="ctxEditAccess">
            <span class="material-symbols-outlined" id="ctxAccessIcon">lock_open</span>
            <span class="sta-u82">GAD Sharing</span>
            <span id="ctxAccessLabel" class="sta-u151">Public</span>
        </button>
        <div class="dropdown-divider"></div>
        <button class="context-menu-item danger" id="ctxDelete">
            <span class="material-symbols-outlined">delete</span>
            <span>Delete Photo</span>
        </button>
    </div>

    <div class="vault-details-overlay" id="vaultDetailsOverlay">
        <div class="details-card">
            <button class="details-download-btn" id="downloadDetailsBtn" type="button" aria-label="Download media">
                <span class="material-symbols-outlined">download</span>
            </button>
            <div class="details-media-wrap" id="detailsMediaWrap">
                <!-- Media will be injected here -->
            </div>
            <div class="details-content">
                <div class="details-info-row">
                    <div class="icon-box"><span class="material-symbols-outlined">calendar_today</span></div>
                    <div class="info-text">
                        <strong>Date & Time</strong>
                        <span id="detailsDateTime">--</span>
                    </div>
                </div>
                <div class="details-info-row">
                    <div class="icon-box"><span class="material-symbols-outlined">location_on</span></div>
                    <div class="info-text">
                        <strong>Captured Location</strong>
                        <span id="detailsLocation">--</span>
                    </div>
                </div>
                <div class="details-info-row">
                    <div class="icon-box"><span id="detailsVisibilityIcon"
                            class="material-symbols-outlined">visibility</span></div>
                    <div class="info-text sta-u16">
                        <strong>GAD Visibility</strong>
                        <span id="detailsVisibility">Shared with Response Team</span>
                    </div>
                    <label class="ios-switch">
                        <input type="checkbox" id="gadAccessToggle">
                        <span class="ios-slider"></span>
                    </label>
                </div>
                <!-- (2026-07-13) Removed Parent Access toggle for staff vault; was shown -->
                <button class="details-action-btn" id="closeDetailsBtn" type="button">Done</button>
            </div>
        </div>
    </div>
    <div class="status-modal" id="vaultDeleteConfirmModal">
        <div class="status-card">
            <div class="status-icon-wrap error sta-u152">
                <span class="material-symbols-outlined">delete_forever</span>
            </div>
            <h3 class="status-title">Confirm Deletion</h3>
            <p class="status-msg">Are you sure you want to permanently delete this media from your vault? This action
                cannot be undone.</p>
            <div class="attendance-modal-actions">
                <button id="confirmDeleteBtn" class="status-btn sta-u153">Delete Permanently</button>
                <button id="cancelDeleteBtn" class="status-btn secondary">Cancel</button>
            </div>
        </div>
    </div>
    <div class="status-modal" id="logoutConfirmModal">
        <div class="status-card">
            <div class="status-icon-wrap sta-u138">
                <span class="material-symbols-outlined">logout</span>
            </div>
            <h3 class="status-title">Log Out?</h3>
            <p class="status-msg">Are you sure you want to log out of your Securo account? You will need to sign in
                again to access your safety tools.</p>
            <div class="attendance-modal-actions">
                <button id="confirmLogoutBtn" class="status-btn sta-u154">Yes, Log Out</button>
                <button id="cancelLogoutBtn" class="status-btn secondary">Stay Signed In</button>
            </div>
        </div>
    </div>
    <div class="chat-overlay" id="chatOverlay">
        <div class="chat-box">
            <div class="chat-header">
                <div class="sta-u155">
                    <span class="material-symbols-outlined">support_agent</span>
                    <strong class="sta-u156">Customer Support</strong>
                </div>
                <button id="closeChatBtn" class="sta-u157">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- Messages will be injected here -->
                <div class="chat-message received">
                    Hello! How can we help you today?
                    <span class="chat-time">Just now</span>
                </div>
            </div>
            <div class="chat-input-area">
                <label class="chat-anon-toggle" for="anonymousSupportToggle">
                    <input type="checkbox" id="anonymousSupportToggle" checked>
                    <span>Chat anonymously with GAD support</span>
                </label>
                <div class="chat-input-row">
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type your message...">
                    <button class="chat-send-btn" id="sendChatBtn">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
    // (2026-07-13) Add GAD Direct & Anonymous Messaging modal; was toastNotify and body close
    <!-- (2026-07-13) Fullscreen GAD chat layout matching guardian; was dialog modal -->

    <div class="status-modal" id="gadPmModal">
        <div class="gad-chat-card" id="gadChatCard">
            <!-- (2026-07-13) Live admin presence, mode chooser & alias setup; was static -->
            <div class="gad-chat-header">
                <div class="sta-u158">
                    <div class="sta-u159">
                        <span class="material-symbols-outlined sta-u160">support_agent</span>
                    </div>
                    <div>
                        <div class="sta-u161">GAD Support <span class="gad-mode-chip" id="gadActiveModeBadge"></span></div>
                        <div class="sta-u162" id="gadAdminPresenceRow">
                            <span class="gad-presence-dot" id="gadAdminPresenceDot"></span>
                            <span id="gadAdminPresenceText">Offline</span>
                        </div>
                    </div>
                </div>
                <div class="gad-header-actions">
                    <button type="button" id="gadSwitchModeBtn" class="gad-switch-mode-btn" title="Switch Identity Mode">Switch</button>
                    <button type="button" id="closeGadPmModalBtn" class="gad-chat-close" aria-label="Close chat">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            <!-- Identity mode selector panel -->
            <div class="gad-mode-chooser" id="gadModeChooser">
                <div class="gad-mode-title">How would you like to message GAD?</div>
                <div class="gad-mode-sub">Your named and anonymous conversations are kept completely separate.</div>
                <button type="button" class="gad-mode-option" id="gadChooseNamedBtn">
                    <span class="material-symbols-outlined">badge</span>
                    <div class="gad-mode-option-copy">
                        <strong>Message with My Name</strong>
                        <span id="gadNamedPreviewLabel">Show your staff name to GAD</span>
                    </div>
                    <span class="gad-mode-unread" id="gadNamedUnreadBadge"></span>
                </button>
                <button type="button" class="gad-mode-option" id="gadChooseAnonBtn">
                    <span class="material-symbols-outlined">visibility_off</span>
                    <div class="gad-mode-option-copy">
                        <strong>Message Anonymously</strong>
                        <span id="gadAnonPreviewLabel">Choose a custom alias name</span>
                    </div>
                    <span class="gad-mode-unread" id="gadAnonUnreadBadge"></span>
                </button>
                <div class="gad-alias-setup" id="gadAliasSetupPanel">
                    <label for="gadAliasInput" class="gad-alias-label">Choose your anonymous display name</label>
                    <div class="gad-alias-row">
                        <input type="text" id="gadAliasInput" maxlength="32" placeholder="e.g. Concerned Staff">
                        <button type="button" id="gadSaveAliasBtn" class="gad-alias-save-btn">Continue</button>
                    </div>
                    <div class="gad-alias-error" id="gadAliasError"></div>
                </div>
            </div>
            <input type="checkbox" id="gadAnonToggle" aria-hidden="true" class="sta-u3">
            <div class="gad-chat-thread" id="gadChatThread">
                <div class="gad-them-row bubble-single">
                    <div class="gad-them-avatar"><span class="material-symbols-outlined sta-u164">support_agent</span>
                    </div>
                    <div class="gad-bubble them bubble-single">Hi! This is the GAD Desk. Tell us what is on your mind —
                        your message is confidential.</div>
                </div>
            </div>
            <div class="gad-chat-composer">
                <select id="gadCategorySelect" aria-label="Topic">
                    <option value="counseling">Topic: Counseling &amp; Mental Health</option>
                    <option value="cosh">Topic: Anti-Sexual Harassment (COSH)</option>
                    <option value="safespaces">Topic: Safe Spaces &amp; Inclusion</option>
                    <option value="policy">Topic: Policy &amp; Rights Inquiry</option>
                    <option value="general">Topic: General Support</option>
                </select>
                <input type="hidden" id="gadSubjectInput" value="">
                <div class="gad-chat-input-row">
                    <textarea id="gadMessageBody" rows="1" placeholder="Type a message..."></textarea>
                    <button type="button" id="submitGadPmBtn" class="gad-chat-send" aria-label="Send message">
                        <span class="material-symbols-outlined sta-u165">send</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Top segmented bar without text, copy requirement; prev: step labels -->
    <div id="fullscreenOnboardingScreen" class="fullscreen-onboarding-screen">
        <div id="fsOnboardingLoadingOverlay" class="fs-loading-overlay sta-u86">
            <div class="fs-loading-spinner"></div>
        </div>
        <div class="fs-onboarding-container">
            <!-- Progress Bar on Top -->
            <div class="fs-progress-header">
                <div class="fs-progress-steps-row">
                    <div class="fs-progress-step-pill active" id="fsProgStep1"></div>
                    <div class="fs-progress-step-pill" id="fsProgStep2"></div>
                </div>
            </div>

            <!-- Viewport for Carousel -->
            <div class="fs-slides-viewport" id="fsSlidesViewport">
                <div class="fs-slides-track" id="fsSlidesTrack">
                    <!-- Slide 1: Profile setup -->
                    <div class="fs-slide-card" id="fsSlideStep1">
                        <h1 class="fs-onboarding-title">Set Up Your Profile</h1>

                        <!-- Avatar Picker Section with 165px live camera circle -->
                        <div class="fs-avatar-picker-section">
                            <div class="fs-avatar-circle-wrapper" id="fsAvatarCircleWrap"
                                title="Click to snap selfie photo">
                                <div class="fs-avatar-circle" id="fsAvatarPreviewCircle">
                                    <video id="fsCircleLiveVideo" autoplay playsinline muted></video>
                                    <div class="fs-avatar-placeholder-content" id="fsAvatarPlaceholder">
                                        <span class="material-symbols-outlined">add_a_photo</span>
                                    </div>
                                    <div class="fs-avatar-initials" id="fsAvatarInitials">ST</div>
                                    <img id="fsAvatarImg" class="fs-avatar-img" src="" alt="Profile Photo">
                                </div>
                                <div class="fs-avatar-badge-cam" id="fsAvatarBadgeCam">
                                    <span class="material-symbols-outlined">photo_camera</span>
                                </div>
                            </div>

                            <div class="fs-avatar-actions-row">
                                <button type="button" class="fs-action-chip" id="fsSnapSelfieBtn">
                                    <span class="material-symbols-outlined">camera</span>
                                    <span id="fsSnapBtnLabel">Capture Selfie</span>
                                </button>
                                <button type="button" class="fs-action-chip secondary" id="fsChooseGalleryBtn">
                                    <span class="material-symbols-outlined">image</span>
                                    <span>From Gallery</span>
                                </button>
                            </div>
                            <input type="file" id="fsGalleryInput" accept="image/*" class="sta-u3">
                            <canvas id="fsCameraCanvas" class="sta-u3"></canvas>
                        </div>

                        <!-- Onboarding Form -->
                        <form id="fsOnboardingForm">
                            <div class="fs-form-row-grid sta-u166">
                                <div class="form-group sta-u167">
                                    <label class="form-label sta-u168">First
                                        Name</label>
                                    <div class="fs-input-field-wrap">
                                        <span class="material-symbols-outlined input-icon">person</span>
                                        <input type="text" id="fsFirstName" placeholder="e.g. Juan" required
                                            autocomplete="given-name">
                                    </div>
                                </div>
                                <div class="form-group sta-u167">
                                    <label class="form-label sta-u168">Last
                                        Name</label>
                                    <div class="fs-input-field-wrap">
                                        <span class="material-symbols-outlined input-icon">badge</span>
                                        <input type="text" id="fsLastName" placeholder="e.g. Dela Cruz" required
                                            autocomplete="family-name">
                                    </div>
                                </div>
                            </div>

                            <!-- (2026-07-13) Add id to course row for staff hiding; was bare div -->
                            <div class="fs-form-row-grid sta-u169" id="fsCourseSectionRow">
                                <!-- Course Dropdown -->
                                <div class="form-group sta-u167">
                                    <label class="form-label sta-u168">Course</label>
                                    <div class="fs-input-field-wrap sta-u170">
                                        <span class="material-symbols-outlined input-icon">school</span>
                                        <select id="fsCourse" required class="sta-u171">
                                            <option value="" disabled selected>Select course</option>
                                            <option value="BSIT">Bachelor of Science in Information Technology (BSIT)
                                            </option>
                                            <option value="BIT-Comp Tech">Bachelor in Industrial Technology- Major in
                                                Computer Technology (BIT-Comp Tech)</option>
                                            <option value="BIT-Elex">Bachelor in Industrial Technology - Major in
                                                Electronics (BIT-Elex)</option>
                                            <option value="BIT-Automotive">Bachelor in Industrial Technology - Major in
                                                Automotive (BIT-Automotive)</option>
                                            <option value="BSIE">Bachelor of Science in Industrial Engineering (BSIE)
                                            </option>
                                            <option value="BSHM">Bachelor of Science in Hospitality Management (BSHM)
                                            </option>
                                            <option value="BSFi">Bachelor of Science in Fisheries (BSFi)</option>
                                            <option value="BEEd">Bachelor of Elementary Education (BEEd)</option>
                                            <option value="BSED-Math">Bachelor of Secondary Education - Major in
                                                Mathematics (BSED-Math)</option>
                                            <option value="BTLEd-HE">Bachelor in Technology Livelihood Education - Major
                                                in Home Economics (BTLEd-HE)</option>
                                        </select>
                                        <span class="material-symbols-outlined sta-u172">arrow_drop_down</span>
                                    </div>
                                </div>

                                <!-- Year · Section -->
                                <div class="form-group sta-u167">
                                    <label class="form-label sta-u168">Year
                                        · Section</label>
                                    <div class="fs-input-field-wrap sta-u173">
                                        <span
                                            class="material-symbols-outlined input-icon sta-u174">calendar_today</span>
                                        <input type="text" id="fsYearLevel" placeholder="4" maxlength="1"
                                            inputmode="numeric" required autocomplete="off" class="sta-u175">
                                        <span class="sta-u176">-</span>
                                        <input type="text" id="fsSection" placeholder="A" maxlength="4" required
                                            autocomplete="off" class="sta-u177">
                                    </div>
                                </div>
                            </div>

                            <!-- (2026-07-13) Staff Department input for onboarding; was student section -->
                            <!-- (2026-07-13) Move staff dept inline styles to CSS; was inline -->
                            <div class="form-group sta-u167 staff-dept-row-hidden" id="fsStaffDepartmentRow">
                                <label class="form-label sta-u168">Department <span class="optional-field-hint">(Optional)</span></label>
                                <div class="fs-input-field-wrap">
                                    <span class="material-symbols-outlined input-icon">apartment</span>
                                    <input type="text" id="fsDepartment" placeholder="e.g. Faculty, Admin Office, Security, IT" autocomplete="organization">
                                </div>
                            </div>

                            <div id="fsOnboardingError" class="error-msg sta-u178">
                            </div>

                            <button type="submit" class="btn-action sta-u179" id="fsSubmitOnboardingBtn">
                                <span id="fsSubmitText">Save & Continue</span>
                                <span class="material-symbols-outlined" id="fsSubmitIcon">arrow_forward</span>
                            </button>
                        </form>
                    </div>

                    <!-- Slide 2: Parent / Guardian Link -->
                    <div class="fs-slide-card" id="fsSlideStep2">
                        <div class="sta-u180">

                            <!-- Badge Icon -->
                            <div class="sta-u181">
                                <span class="material-symbols-outlined sta-u182">family_restroom</span>
                            </div>

                            <h2 class="sta-u183">
                                Link Your Account With Your Parents</h2>
                            <p class="sta-u184">
                                Copy this link to link your account with your parents. Give this link to them to
                                register.
                            </p>

                            <!-- Link Container -->
                            <div class="sta-u185">
                                <div class="sta-u186">
                                    <span class="sta-u187">Parent
                                        Registration Link</span>
                                    <span class="material-symbols-outlined sta-u188">link</span>
                                </div>
                                <div id="fsGuardianInviteLink" class="sta-u189">
                                    <!-- (2026-07-13) Dynamic link placeholder; prev: zea domain -->
                                    Generating link...
                                </div>
                            </div>

                            <!-- Action buttons -->
                            <div class="sta-u190">
                                <!-- (2026-07-13) Shorter copy button label; prev: long prompt label -->
                                <button type="button" class="btn-action sta-u191" id="fsCopyGuardianLinkBtn">
                                    <span class="material-symbols-outlined">content_copy</span>
                                    <span id="fsCopyLinkText">Copy Link</span>
                                </button>

                                <button type="button" class="btn-action sta-u192" id="fsShareGuardianLinkBtn">
                                    <span class="material-symbols-outlined">share</span>
                                    <span>Share Link</span>
                                </button>

                                <button type="button" id="fsProceedToAppBtn" class="sta-u193">
                                    <span>Proceed to App</span>
                                    <span class="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>

                            <!-- Swipe hint -->
                            <div id="fsSwipeHintBox" class="sta-u194">
                                <span class="material-symbols-outlined sta-u195" id="fsSwipeHintIcon">lock</span>
                                <span id="fsSwipeHintText">Copy link above to unlock app</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="toast-notify" id="toastNotify">
        <span class="material-symbols-outlined" id="toastIcon">check_circle</span>
        <span id="toastMsg">Success</span>
    </div>
`,c=t(),l=()=>a(()=>import(`./staff-BRVFrD-6.js`),__vite__mapDeps([0,1,2,3]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));