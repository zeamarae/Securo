const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./staff-KEM3YpZ-.js","./install-sw-C1vRYC0v.js","./preload-helper-CGP3o08e.js","./emergency-contacts-5D6Zzroy.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css                  */r();var o=e(),s=`<!-- (2026-07-13) Dramatic intro preloader with logo; was immediate page view -->\r
    <div id="securo-preloader-overlay">\r
        <div class="securo-preloader-bg"></div>\r
        <div class="securo-preloader-content">\r
            <div class="securo-preloader-logo-wrap">\r
                <img src="../assets/images/logo with text.png" alt="Securo" class="securo-preloader-logo">\r
                <div class="securo-preloader-shimmer"></div>\r
            </div>\r
            <!-- (2026-07-13) Move indicator below logo in preloader; was above logo -->\r
            <div class="securo-preloader-indicator">\r
                <span class="securo-preloader-status-text">INITIALIZING SECURE SYSTEMS</span>\r
                <div class="securo-preloader-progress-track">\r
                    <div class="securo-preloader-progress-bar"></div>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Auto-dismiss watchdog for preloader overlay; was unmonitored -->\r
\r
\r
    <div class="device-shell mx-auto">\r
        <div class="screen">\r
            <!-- [REMOVED] Embedded Login Screen (Date: 2026-05-01) - Now handled by login.html -->\r
\r
\r
            <section class="app-view" id="appView" aria-label="Securo application">\r
                <div class="app-shell">\r
                    <header class="topbar navbar navbar-expand border-0">\r
                        <div class="container-fluid px-0 content-frame">\r
                            <!-- (2026-07-13) Fix fallback logo link to staff.html; was index.html -->\r
                            <div class="topbar-left navbar-brand mb-0 sta-u1" id="topbarHomeBrand"\r
                                onclick="if(window.setActiveView){window.setActiveView('map');}else{window.location.href='staff.html';}"\r
                                title="Go to Map Homepage">\r
                                <img src="../assets/images/logo with text.png" alt="Securo"\r
                                    class="topbar-brand-logo sta-u2" draggable="false">\r
                                <div aria-hidden="true" class="sta-u3">\r
                                    <div class="surface-icon" id="headerLeadingIcon"></div>\r
                                    <div class="topbar-title" id="headerTitle">Securo</div>\r
                                </div>\r
                            </div>\r
                            <div class="topbar-right ms-auto sta-u4">\r
                                <!-- (2026-07-13) Add GAD message button left of notif bell; was bell only -->\r
                                <!-- Header GAD message trigger -->\r
                                <button class="surface-icon gad-header-msg-btn" type="button" id="headerGadMsgBtn"\r
                                    aria-label="GAD Messages" title="GAD Messages">\r
                                    <span class="material-symbols-outlined">chat</span>\r
                                </button>\r
                                <div class="notif-btn">\r
                                    <button class="surface-icon" type="button" id="notifBell"\r
                                        aria-label="Notifications">\r
                                        <span class="material-symbols-outlined">notifications</span>\r
                                        <div class="notif-badge" id="notifBadge"></div>\r
                                    </button>\r
                                    <div class="notif-dropdown" id="notifDropdown">\r
                                        <div class="notif-panel">\r
                                            <div class="notif-header">\r
                                                <div>\r
                                                    <span class="notif-title">Notifications</span>\r
                                                    <span class="notif-subtitle">Requests, approvals, and app\r
                                                        activity</span>\r
                                                </div>\r
                                                <button class="notif-close" type="button" id="notifCloseBtn"\r
                                                    aria-label="Close notifications">\r
                                                    <span class="material-symbols-outlined">close</span>\r
                                                </button>\r
                                            </div>\r
                                            <div class="notif-list" id="notifList">\r
                                                <div class="notif-empty">No new notifications</div>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                                <div class="profile-chip" id="profileChip">\r
                                    <span id="userInitials">??</span>\r
                                    <!-- Dropdown Menu (Date: 2026-05-01) -->\r
                                    <div class="profile-dropdown" id="profileDropdown">\r
                                        <div class="sta-u5">\r
                                            <div id="dropdownName" class="dropdown-user-name">\r
                                                Loading...</div>\r
                                            <div id="dropdownId" class="sta-u6">ID:\r
                                                ---</div>\r
                                        </div>\r
                                        <div class="dropdown-divider"></div>\r
                                        <a href="../public/profile.html" class="dropdown-item">\r
                                            <span class="material-symbols-outlined">account_circle</span>\r
                                            <span>Profile View</span>\r
                                        </a>\r
                                        <button class="dropdown-item"\r
                                            onclick="window.setActiveView('history'); document.getElementById('profileDropdown').classList.remove('active');">\r
                                            <span class="material-symbols-outlined">manage_history</span>\r
                                            <span>Activity History</span>\r
                                        </button>\r
                                        <a href="../public/settings.html" class="dropdown-item">\r
                                            <span class="material-symbols-outlined">settings</span>\r
                                            <span>Settings</span>\r
                                        </a>\r
                                        <!-- (2026-07-13) Add About Us link to student dropdown; was settings only -->\r
                                        <a href="../public/about.html" class="dropdown-item">\r
                                            <span class="material-symbols-outlined">info</span>\r
                                            <span>About Us</span>\r
                                        </a>\r
                                        <a href="../admin/admin.html" class="dropdown-item sta-u7" id="adminLink">\r
                                            <span class="material-symbols-outlined">admin_panel_settings</span>\r
                                            <span>Admin Panel</span>\r
                                        </a>\r
                                        <div class="dropdown-divider"></div>\r
\r
                                        <button class="dropdown-item logout" id="logoutLink">\r
                                            <span class="material-symbols-outlined">logout</span>\r
                                            <span>Sign Out</span>\r
                                        </button>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                        </div>\r
                    </header>\r
\r
                    <!-- (2026-07-13) Add parent invite link to header bar; was chip only -->\r
                    <div class="student-parent-bar" id="studentParentBar">\r
                        <div id="studentParentChips" class="sta-u8">\r
                            <div class="parent-selector-chip sta-u9" id="noParentsChip" title="Tap to invite parents">\r
                                <span class="material-symbols-outlined sta-u10">family_restroom</span>\r
                                <span>No parents watching over you yet</span>\r
                            </div>\r
                        </div>\r
                        <!-- (2026-07-13) Show invite parent button in bar; was display none -->\r
                        <button type="button" class="invite-parent-bar-btn" id="inviteParentBarBtn"\r
                            title="Invite a parent or guardian">\r
                            <span class="material-symbols-outlined">person_add</span>\r
                            <span>Invite Parent</span>\r
                        </button>\r
                    </div>\r
\r
                    <main class="screen-content" id="screenContent">\r
                        <!-- (2026-07-13) Reorganize page-map with compact tracking pill and split controls; was monolithic stack -->\r
                        <section class="page active" id="page-map" data-page="map">\r
                            <div class="map-stage sta-u11">\r
                                <!-- Leaflet Map Container -->\r
                                <div id="map" class="sta-u12"></div>\r
\r
                                <!-- Map Search & Quick Access Overlay (Left Side) -->\r
                                <div class="map-overlay-left">\r
                                    <!-- Compact Floating Tracking Status Pill -->\r
                                    <div class="tracking-status-pill is-off" id="trackingStatusBanner">\r
                                        <span class="pulse-status-dot" id="trackingStatusDot"></span>\r
                                        <span class="material-symbols-outlined tracking-status-icon"\r
                                            id="trackingStatusIcon">location_off</span>\r
                                        <span class="tracking-status-label-text" id="trackingStatusCopy">Location\r
                                            Off</span>\r
                                    </div>\r
\r
                                    <!-- Campus Search Box -->\r
                                    <div class="map-search-bar">\r
                                        <span class="material-symbols-outlined">search</span>\r
                                        <input type="text" placeholder="Search Campus..." id="mapSearchInput"\r
                                            autocomplete="off">\r
                                    </div>\r
\r
                                    <!-- (2026-07-13) Remove quick access chips container; was parking/clinic/wifi buttons -->\r
                                </div>\r
\r
                                <!-- (2026-07-13) Add map view switcher button; was standard control buttons only -->\r
                                <div class="map-controls-custom map-controls-top">\r
                                    <button class="map-btn" id="map-layers-btn"\r
                                        title="Toggle Map Style (Satellite / Hybrid / Streets)">\r
                                        <span class="material-symbols-outlined">layers</span>\r
                                    </button>\r
                                    <button class="map-btn" id="map-toggle-markers" title="Hide Campus Markers">\r
                                        <span class="material-symbols-outlined">visibility</span>\r
                                    </button>\r
                                    <button class="map-btn" id="map-locate" title="My GPS Location">\r
                                        <span class="material-symbols-outlined">my_location</span>\r
                                    </button>\r
                                    <!-- (2026-07-13) Remove share location button from map; was share button -->\r
                                    <button class="map-btn" id="map-recenter-campus" title="Center CTU Campus">\r
                                        <span class="material-symbols-outlined">domain</span>\r
                                    </button>\r
                                    <button class="map-btn" id="map-zoom-in" title="Zoom In">\r
                                        <span class="material-symbols-outlined">add</span>\r
                                    </button>\r
                                    <button class="map-btn" id="map-zoom-out" title="Zoom Out">\r
                                        <span class="material-symbols-outlined">remove</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
                        </section>\r
\r
                        <section class="page" id="page-vault" data-page="vault">\r
                            <!-- (2026-07-13) Remove eyebrow badge from vault header; was eyebrow tag -->\r
                            <div class="page-header sta-u13">\r
                                <div class="icon-badge sta-u14">\r
                                    <span class="material-symbols-outlined sta-u15">shield_lock</span>\r
                                </div>\r
                                <div class="sta-u16">\r
                                    <h1 class="page-title sta-u17">\r
                                        Digital Vault</h1>\r
                                    <p class="page-copy sta-u18">\r
                                        Captured media is encrypted and securely timestamped on the verification-ready\r
                                        ledger.</p>\r
                                </div>\r
                            </div>\r
\r
                            <div class="section-stack sta-u19">\r
                                <!-- Vault Summary Hero Card -->\r
                                <div class="card summary-card sta-u20">\r
                                    <div class="sta-u21">\r
                                        <div>\r
                                            <div class="mini-label sta-u22">\r
                                                Total Secured Evidence</div>\r
                                            <div class="section-title sta-u23" id="vaultTotalEvidence">\r
                                                0 Files</div>\r
                                        </div>\r
                                        <div class="sta-u24">\r
                                            <div class="sta-u25">\r
                                                <span class="material-symbols-outlined sta-u26">lock</span>\r
                                                <span>AES-256 Active</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Vault Multi-Selection Action Toolbar -->\r
                                <div class="vault-selection-toolbar sta-u27" id="vaultSelectionToolbar">\r
                                    <div class="vault-selection-copy">\r
                                        <span class="vault-selection-title sta-u28" id="vaultSelectionCount">0\r
                                            selected</span>\r
                                        <span class="vault-selection-subtitle sta-u29">Tap items to select or\r
                                            batch delete.</span>\r
                                    </div>\r
                                    <div class="vault-selection-actions sta-u30">\r
                                        <button class="vault-selection-btn" id="cancelVaultSelectionBtn"\r
                                            type="button">Cancel</button>\r
                                        <button class="vault-selection-btn" id="selectAllVaultBtn" type="button">Select\r
                                            All</button>\r
                                        <button class="vault-selection-btn danger sta-u31" id="deleteSelectedVaultBtn"\r
                                            type="button">\r
                                            <span class="material-symbols-outlined sta-u32">delete</span>\r
                                            <span>Delete</span>\r
                                        </button>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Media Grid -->\r
                                <div class="vault-grid" id="vaultGrid">\r
                                    <div class="vault-empty sta-u33">\r
                                        <div class="icon-badge sta-u34">\r
                                            <span class="material-symbols-outlined sta-u35">photo_library</span>\r
                                        </div>\r
                                        <strong class="sta-u36">No\r
                                            Media Stored Yet</strong>\r
                                        <p class="sta-u37">\r
                                            Photos and video recordings captured during emergency SOS will automatically\r
                                            appear here securely.</p>\r
                                    </div>\r
                                </div>\r
                            </div>\r
                        </section>\r
\r
                        <section class="page page-sos-shell" id="page-sos" data-page="sos">\r
                            <div class="sos-page-overlay" id="sosPageOverlay" aria-hidden="true"></div>\r
\r
                            <!-- (2026-07-13) Clean, unified emergency command header; was cluttered double boxes -->\r
                            <div class="sos-topline sta-u38" id="sosToplineHeader">\r
                                <div class="emergency-eyebrow-container" id="emergencyEyebrowContainer">\r
                                    <div class="eyebrow emergency-eyebrow sta-u39">\r
                                        <span class="material-symbols-outlined sta-u40">emergency</span>\r
                                        PRIORITY EMERGENCY CHANNEL\r
                                    </div>\r
                                    <h1 class="page-title rapid-sos-title sta-u41">\r
                                        Emergency SOS</h1>\r
                                </div>\r
                                <div class="recording-pill recording-status-indicator sta-u42"\r
                                    id="recordingStatusIndicator">\r
                                    <span class="record-dot active-record-dot sta-u43"></span>\r
                                    <span class="recording-text-label">Active</span>\r
                                </div>\r
                            </div>\r
\r
                            <div class="section-stack sta-u44" id="sosSectionStack">\r
                                <!-- Hero Action Stage -->\r
                                <div class="sos-hero-card sta-u45">\r
                                    <div class="center-copy sta-u46">\r
                                        <h2 class="sta-u47">\r
                                            Trigger Emergency Alert</h2>\r
                                        <p class="subcopy sta-u48">\r
                                            Press and hold to broadcast instant priority alert with live GPS and camera\r
                                            uplink.</p>\r
                                    </div>\r
\r
                                    <div class="sos-stage sta-u49">\r
                                        <div class="sos-ring sta-u50" id="sosRing">\r
                                            <!-- (2026-07-13) Clockwise hold spinner progress arc; was plain ring -->\r
                                            <svg class="sos-progress-spinner sta-u51" id="sosProgressSpinner"\r
                                                viewBox="0 0 204 204">\r
                                                <circle cx="102" cy="102" r="92" class="sta-u52">\r
                                                </circle>\r
                                                <circle id="sosProgressArc" cx="102" cy="102" r="92" class="sta-u53">\r
                                                </circle>\r
                                            </svg>\r
                                            <button class="sos-button" id="sosButton" type="button"\r
                                                aria-label="Trigger Emergency SOS">SOS</button>\r
                                        </div>\r
                                    </div>\r
\r
                                    <div class="hold-caption sta-u54" id="sosCaption">\r
                                        <span class="sta-u55"></span>\r
                                        Hold for emergency response\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Telemetry Dispatch & Live Location Cards -->\r
                                <div class="sta-u56">\r
                                    <div class="card dispatch-card sta-u57">\r
                                        <div class="sta-u58">\r
                                            <span class="material-symbols-outlined sta-u59">local_police</span>\r
                                            <span class="success-state sta-u60" id="dispatchState">Standby</span>\r
                                        </div>\r
                                        <div class="dispatch-title-container" id="dispatchTitleContainer">\r
                                            <strong class="dispatch-title-strong sta-u61">Immediate\r
                                                Dispatch</strong>\r
                                            <span class="sta-u62">Campus\r
                                                Security Link</span>\r
                                        </div>\r
                                    </div>\r
\r
                                    <div class="card location-card sta-u57">\r
                                        <div class="sta-u58">\r
                                            <span class="material-symbols-outlined sta-u63">near_me</span>\r
                                            <span class="sta-u64">Live\r
                                                GPS</span>\r
                                        </div>\r
                                        <div>\r
                                            <!-- (2026-07-13) Dynamic nearest landmark title; was static text -->\r
                                            <strong id="sosCurrentLocationTitle" class="sta-u65">CTU\r
                                                Daanbantayan</strong>\r
                                            <span id="sosCurrentLocationSub" class="sta-u66">Campus\r
                                                bounds</span>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- (2026-07-13) Hide contacts widget to prevent SOS scroll; was visible -->\r
                                <div id="emergencyContactsWidget" class="sta-u67"></div>\r
                            </div>\r
                        </section>\r
\r
                        <!-- (2026-07-13) Upgrade GAD section to full GAD Portal with services and PM; was GAD bulletin -->\r
                        <section class="page" id="page-gad" data-page="gad">\r
                            <!-- Distinct Portal Theme Wrap -->\r
                            <div class="sta-u68">\r
                                <div class="page-header sta-u69">\r
                                    <div class="icon-badge sta-u70">\r
                                        <span class="material-symbols-outlined sta-u71">diversity_3</span>\r
                                    </div>\r
                                    <div class="sta-u16">\r
                                        <h1 class="page-title sta-u72">\r
                                            GAD Portal</h1>\r
                                        <p class="sta-u73">\r
                                            Equality, Inclusion & Safe Spaces</p>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Hero Action -->\r
                                <div class="card vault-card sta-u74">\r
                                    <div class="sta-u75">\r
                                        <div>\r
                                            <strong class="sta-u76">Confidential\r
                                                GAD Desk</strong>\r
                                            <span class="sta-u77">Direct\r
                                                assistance, guidance, and completely safe reporting.</span>\r
                                        </div>\r
                                        <div class="sta-u78">\r
                                            <span class="material-symbols-outlined sta-u35">verified_user</span>\r
                                        </div>\r
                                    </div>\r
                                    <button class="primary-btn sta-u79" id="openGadPmBtn" type="button">\r
                                        <span class="material-symbols-outlined">shield_person</span>\r
                                        <span>Report / Message GAD</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
\r
                            <div class="section-stack sta-u80">\r
                                <!-- (2026-07-13) Removed Support Services & Quick Resources; was cards -->\r
\r
                                <!-- GAD Sub-Navigation Tabs -->\r
                                <div class="sta-u81">\r
                                    <button class="history-filter-btn active sta-u82" id="gadTabAnnouncements"\r
                                        type="button" onclick="switchGadTab('announcements')">Announcements</button>\r
                                    <button class="history-filter-btn sta-u82" id="gadTabMyMessages" type="button"\r
                                        onclick="switchGadTab('messages')">My Inquiries</button>\r
                                </div>\r
\r
                                <!-- Announcements Panel -->\r
                                <div id="gadAnnouncementsPanel">\r
                                    <div id="gadPostsFeed">\r
                                        <div id="feedLoader" class="sta-u83">\r
                                            <span class="spinner sta-u84"></span>\r
                                            <p class="sta-u85">Loading announcements...\r
                                            </p>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Student Inquiries / Messages Panel -->\r
                                <div id="gadMessagesPanel" class="sta-u86">\r
                                    <div id="gadInquiriesList">\r
                                        <div class="sta-u87">\r
                                            <span class="material-symbols-outlined sta-u88">forum</span>\r
                                            No messages sent yet. Use "Report / Message GAD" above to start.\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
                        </section>\r
\r
                        <!-- Activity History Page -->\r
                        <section class="page" id="page-history" data-page="history">\r
                            <div class="section-stack">\r
                                <!-- (2026-07-13) Uniform Activity History header; was basic header -->\r
                                <div class="page-header sta-u13">\r
                                    <div class="icon-badge sta-u89">\r
                                        <span class="material-symbols-outlined sta-u15">manage_history</span>\r
                                    </div>\r
                                    <div class="sta-u16">\r
                                        <div class="eyebrow sta-u90">\r
                                            YOUR TIMELINE</div>\r
                                        <h1 class="page-title sta-u91">\r
                                            Activity History</h1>\r
                                        <p class="page-copy sta-u18">\r
                                            A log of your SOS alerts, attendance, and vault activity.</p>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Filter chips -->\r
                                <div class="sta-u92">\r
                                    <button class="history-filter-btn active" data-filter="all"\r
                                        onclick="filterHistory('all')">All</button>\r
                                    <button class="history-filter-btn" data-filter="sos"\r
                                        onclick="filterHistory('sos')">SOS</button>\r
                                    <button class="history-filter-btn" data-filter="attendance"\r
                                        onclick="filterHistory('attendance')">Attendance</button>\r
                                    <button class="history-filter-btn" data-filter="vault"\r
                                        onclick="filterHistory('vault')">Vault</button>\r
                                </div>\r
\r
                                <!-- Timeline list -->\r
                                <div class="card sta-u93">\r
                                    <div id="historyTimeline">\r
                                        <div class="sta-u94">\r
                                            <span class="material-symbols-outlined sta-u95">hourglass_empty</span>\r
                                            Loading your activity...\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="card sta-u93">\r
                                    <div class="sta-u96">\r
                                        <div>\r
                                            <div class="mini-label">NOTIFICATIONS</div>\r
                                            <div class="sta-u97">Notification History</div>\r
                                        </div>\r
                                        <span class="material-symbols-outlined sta-u98">notifications</span>\r
                                    </div>\r
                                    <div id="historyNotifications" class="notif-history-list">\r
                                        <div class="notif-empty sta-u99">No notifications yet</div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
                        </section>\r
\r
                        <section class="page" id="page-attendance" data-page="attendance">\r
                            <div class="section-stack">\r
                                <!-- (2026-07-13) Fix closed page-header and uniform Attendance card stack; was unclosed header tag -->\r
                                <div class="page-header sta-u13">\r
                                    <div class="icon-badge sta-u100">\r
                                        <span class="material-symbols-outlined sta-u15">fact_check</span>\r
                                    </div>\r
                                    <div class="sta-u16">\r
                                        <!-- (2026-07-13) Remove eyebrow from attendance header; was eyebrow tag -->\r
                                        <h1 class="page-title sta-u17">\r
                                            Attendance</h1>\r
                                        <p class="page-copy sta-u18">\r
                                            Time in or out with automatic time and location logging.</p>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="card sta-u101">\r
                                    <div class="sta-u102">\r
                                        <div>\r
                                            <div class="mini-label sta-u103">\r
                                                Presence Status</div>\r
                                            <div class="sta-u104">\r
                                                Campus Attendance</div>\r
                                        </div>\r
                                        <div id="attendanceStatusPill" class="sta-u105">\r
                                            <span id="attendanceStatusDot" class="sta-u106"></span>\r
                                            <span id="currentStatusText">Timed Out</span>\r
                                        </div>\r
                                    </div>\r
\r
                                    <div class="sta-u107">\r
                                        <button id="timeInBtn" class="button-primary sta-u108">\r
                                            <span class="material-symbols-outlined sta-u109">login</span>\r
                                            <span>TIME IN</span>\r
                                        </button>\r
                                        <button id="timeOutBtn" class="button-primary sta-u110" disabled>\r
                                            <span class="material-symbols-outlined sta-u109">logout</span>\r
                                            <span>TIME OUT</span>\r
                                        </button>\r
                                    </div>\r
\r
                                    <div class="sta-u111">\r
                                        <div class="sta-u112">\r
                                            <div class="mini-label sta-u113">\r
                                                Last Log Time</div>\r
                                            <div id="attendanceLastTime" class="sta-u114">\r
                                                No records yet</div>\r
                                        </div>\r
                                        <div class="sta-u115">\r
                                            <div class="mini-label sta-u113">\r
                                                Last Location</div>\r
                                            <!-- (2026-07-13) Wrap long location text; was nowrap overflowing card -->\r
                                            <div id="attendanceLastLocation" class="sta-u116">\r
                                                No records yet</div>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="sta-u56">\r
                                    <div class="card sta-u117">\r
                                        <div id="statAttendanceRate" class="sta-u118">\r
                                            0%</div>\r
                                        <div class="sta-u119">\r
                                            Overall Rate</div>\r
                                    </div>\r
                                    <div class="card sta-u120">\r
                                        <div id="statDaysPresent" class="sta-u121">\r
                                            0</div>\r
                                        <div class="sta-u119">\r
                                            Days Present</div>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="card sta-u122">\r
                                    <div class="row-between sta-u123">\r
                                        <div>\r
                                            <div class="sta-u124">\r
                                                Attendance History</div>\r
                                            <span class="sta-u125">Timestamped presence\r
                                                log</span>\r
                                        </div>\r
                                        <!-- (2026-07-13) Add export buttons for history tab; was icon only -->\r
                                        <div class="sta-u126">\r
                                            <button id="btnExportStudentAttendanceCsv" type="button"\r
                                                class="btn btn-sm sta-u127" title="Export CSV">CSV</button>\r
                                            <button id="btnExportStudentAttendanceJson" type="button"\r
                                                class="btn btn-sm sta-u127" title="Export JSON">JSON</button>\r
                                            <span class="material-symbols-outlined sta-u128">history</span>\r
                                        </div>\r
                                    </div>\r
                                    <div id="attendanceHistoryList">\r
                                        <div class="sta-u129">\r
                                            No attendance records found.</div>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="card sta-u130">\r
                                    <div class="sta-u131">\r
                                        <div class="sta-u132">\r
                                            Academic Standing</div>\r
                                        <div id="academicStandingText" class="sta-u133">\r
                                            Initializing...</div>\r
                                        <p id="academicStandingCopy" class="sta-u134">Please record\r
                                            your first attendance to see your standing.</p>\r
                                    </div>\r
                                    <span class="material-symbols-outlined sta-u135">military_tech</span>\r
                                </div>\r
                            </div>\r
                        </section>\r
\r
\r
                </div>\r
                </main>\r
\r
                <nav class="bottom-nav navbar border-0" aria-label="Primary">\r
                    <div class="container-fluid px-0 content-frame">\r
                        <button class="nav-item active" type="button" data-nav="map" onclick="setActiveView('map')"\r
                            aria-label="Campus Map">\r
                            <span class="material-symbols-outlined">explore</span>\r
                            <span>Map</span>\r
                        </button>\r
                        <button class="nav-item" type="button" data-nav="vault" onclick="setActiveView('vault')"\r
                            aria-label="Digital Vault">\r
                            <span class="material-symbols-outlined">encrypted</span>\r
                            <span>Vault</span>\r
                        </button>\r
                        <button class="nav-item sos-nav" type="button" data-nav="sos" onclick="setActiveView('sos')"\r
                            aria-label="Emergency SOS">\r
                            <span class="material-symbols-outlined">emergency</span>\r
                            <span>SOS</span>\r
                        </button>\r
                        <button class="nav-item" type="button" data-nav="gad" onclick="setActiveView('gad')"\r
                            aria-label="GAD Bulletin">\r
                            <span class="material-symbols-outlined">campaign</span>\r
                            <span>GAD</span>\r
                        </button>\r
                        <button class="nav-item" type="button" data-nav="attendance"\r
                            onclick="setActiveView('attendance')" aria-label="Attendance Dashboard">\r
                            <span class="material-symbols-outlined">fact_check</span>\r
                            <span>Attendance</span>\r
                        </button>\r
\r
                    </div>\r
                </nav>\r
\r
                <button class="sos-fab" type="button" id="globalSosFab" data-nav-target="sos"\r
                    aria-label="Open Emergency SOS">\r
                    <span class="material-symbols-outlined">emergency</span>\r
                </button>\r
\r
                <!-- (2026-07-13) Removed redundant globalGadFab; was overlapping with SOS FAB -->\r
\r
                <section class="camera-overlay" id="cameraOverlay" aria-label="Emergency camera capture">\r
                    <div class="camera-topbar">\r
                        <div>\r
                            <div class="camera-title">Emergency Capture</div>\r
                            <div class="camera-subtitle">Take rapid photos and keep visual evidence flowing.</div>\r
                        </div>\r
                        <button class="camera-icon-btn" type="button" id="closeCameraOverlay"\r
                            aria-label="Close emergency camera">\r
                            <span class="material-symbols-outlined">close</span>\r
                        </button>\r
                    </div>\r
\r
                    <div class="camera-stage">\r
                        <!-- Instagram style: modes removed, replaced with dynamic interaction -->\r
                        <div class="camera-preview-shell">\r
                            <!-- (2026-07-13) Dark poster on camera preview; prev: bare video tag -->\r
                            <video id="cameraPreview" autoplay playsinline muted\r
                                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='%23080b18'/%3E%3C/svg%3E"></video>\r
                            <div class="camera-overlay-grid" aria-hidden="true"></div>\r
                            <div class="camera-status-pill sta-u136" id="recordingStatus">\r
                                <span class="camera-status-dot pulse" aria-hidden="true"></span>\r
                                <span id="recordingTimer">00:00</span>\r
                            </div>\r
                            <div class="camera-status-pill" id="liveStatus">\r
                                <span class="camera-status-dot" aria-hidden="true"></span>\r
                                <span>Live Capture</span>\r
                            </div>\r
                            <div class="camera-empty" id="cameraEmpty">\r
                                <span class="material-symbols-outlined sta-u137">photo_camera</span>\r
                                <strong>Preparing camera</strong>\r
                                <p>Once permission is granted, the live emergency camera will appear here.</p>\r
                            </div>\r
                            <div class="camera-error" id="cameraError" hidden>\r
                                <span class="material-symbols-outlined sta-u137">warning</span>\r
                                <strong>Camera unavailable</strong>\r
                                <p id="cameraErrorText">Allow camera access to capture emergency evidence quickly.</p>\r
                            </div>\r
                        </div>\r
\r
                        <div class="camera-review-bar" id="cameraReviewBar" hidden>\r
                            <div>\r
                                <strong id="reviewTitle">Processing capture...</strong>\r
                                <span id="reviewCopy">Evidence is being uploaded and logged automatically.</span>\r
                            </div>\r
                        </div>\r
\r
                        <div class="camera-bottom">\r
                            <div class="camera-actions-row">\r
                                <div class="camera-actions-left">\r
                                    <button class="camera-chip-btn circular" type="button" id="galleryUploadBtn"\r
                                        aria-label="Open gallery">\r
                                        <span class="material-symbols-outlined">image</span>\r
                                    </button>\r
                                </div>\r
                                <div class="shutter-progress-wrap">\r
                                    <svg class="shutter-ring-svg" viewBox="0 0 120 120">\r
                                        <circle class="shutter-ring-bg" cx="60" cy="60" r="55"></circle>\r
                                        <circle class="shutter-ring-progress" id="shutterProgress" cx="60" cy="60"\r
                                            r="55"></circle>\r
                                    </svg>\r
                                    <button class="shutter-button" type="button" id="captureAction"\r
                                        aria-label="Tap to photo, Hold for video"></button>\r
                                </div>\r
                                <div class="camera-actions-right">\r
                                    <button class="camera-chip-btn circular" type="button" id="switchCameraBtn">\r
                                        <span class="material-symbols-outlined">flip_camera_android</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </div>\r
\r
                    <canvas id="captureCanvas" hidden></canvas>\r
                    <input class="gallery-input sta-u3" id="galleryInput" type="file" accept="image/*,video/*">\r
                </section>\r
        </div>\r
        </section>\r
    </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Fix parent invite modal UI styling; prev: clashing status-btn -->\r
    <div class="status-modal" id="inviteParentModal">\r
        <div class="status-card invite-parent-card">\r
            <div class="status-icon-wrap sta-u138">\r
                <span class="material-symbols-outlined">family_restroom</span>\r
            </div>\r
            <h3 class="status-title sta-u139">Invite Parent or Guardian</h3>\r
            <p class="status-msg sta-u140">\r
                Share your unique link with your parents so they can monitor your safety and live SOS alerts.\r
                <!-- (2026-07-13) Add guardian email input; prev: invite link box only -->\r
            <div class="guardian-invite-email-wrap sta-u141">\r
                <label for="guardianInviteEmailInput" class="sta-u142">Guardian's Email Address</label>\r
                <div class="sta-u143">\r
                    <input type="email" id="guardianInviteEmailInput" placeholder="e.g. parent@gmail.com"\r
                        class="sta-u144">\r
                    <button type="button" class="invite-btn-primary sta-u145" id="sendGuardianInviteEmailBtn">\r
                        <span class="material-symbols-outlined sta-u146">send</span>\r
                        <span>Send</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <div class="sta-u147">\r
                <div class="sta-u148"></div>\r
                <span class="sta-u149">or share link</span>\r
                <div class="sta-u148"></div>\r
            </div>\r
\r
            <div class="invite-link-box" id="inviteLinkBox">\r
                <span id="guardianInviteUrlText" class="invite-url-text">Generating link...</span>\r
            </div>\r
            <div class="invite-modal-actions">\r
                <button type="button" class="invite-btn-primary" id="copyGuardianInviteBtn">\r
                    <span class="material-symbols-outlined sta-u150">content_copy</span>\r
                    <span id="copyInviteBtnLabel">Copy Invite Link</span>\r
                </button>\r
                <button type="button" class="invite-btn-share sta-u86" id="shareGuardianInviteBtn">\r
                    <span class="material-symbols-outlined sta-u150">share</span>\r
                    <span>Share via App</span>\r
                </button>\r
                <button type="button" class="invite-btn-done" id="closeInviteParentBtn">Done</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Status/Success Modal (Date: 2026-05-01) -->\r
    <!-- (2026-07-13) Replace placeholder status message text; was Message goes here. -->\r
    <div class="status-modal" id="statusModal">\r
        <div class="status-card">\r
            <div id="statusIconWrap" class="status-icon-wrap">\r
                <span class="material-symbols-outlined" id="statusIcon">check_circle</span>\r
            </div>\r
            <h3 id="statusTitle" class="status-title">Success!</h3>\r
            <p id="statusMessage" class="status-msg">Your action has been completed successfully.</p>\r
            <button id="statusOkBtn" class="status-btn">Great!</button>\r
        </div>\r
    </div>\r
    <div class="status-modal" id="attendanceActionModal">\r
        <div class="status-card">\r
            <div class="status-icon-wrap success" id="attendanceActionIconWrap">\r
                <span class="material-symbols-outlined" id="attendanceActionIcon">schedule</span>\r
            </div>\r
            <h3 id="attendanceActionTitle" class="status-title">Confirm Attendance</h3>\r
            <p id="attendanceActionMessage" class="status-msg">Review the captured time and location before continuing.\r
            </p>\r
            <div class="attendance-modal-summary">\r
                <div class="attendance-modal-item">\r
                    <strong>Time</strong>\r
                    <span id="attendanceModalTime">--</span>\r
                </div>\r
                <div class="attendance-modal-item">\r
                    <strong>Location</strong>\r
                    <span id="attendanceModalLocation">--</span>\r
                </div>\r
            </div>\r
            <div class="attendance-modal-actions">\r
                <button id="attendanceConfirmBtn" class="status-btn">Confirm</button>\r
                <button id="attendanceCancelBtn" class="status-btn secondary">Cancel</button>\r
            </div>\r
        </div>\r
    </div>\r
    <div class="vault-context-menu" id="vaultContextMenu">\r
        <button class="context-menu-item" id="ctxViewDetails">\r
            <span class="material-symbols-outlined">info</span>\r
            <span>View Details</span>\r
        </button>\r
        <button class="context-menu-item" id="ctxEditAccess">\r
            <span class="material-symbols-outlined" id="ctxAccessIcon">lock_open</span>\r
            <span class="sta-u82">GAD Sharing</span>\r
            <span id="ctxAccessLabel" class="sta-u151">Public</span>\r
        </button>\r
        <div class="dropdown-divider"></div>\r
        <button class="context-menu-item danger" id="ctxDelete">\r
            <span class="material-symbols-outlined">delete</span>\r
            <span>Delete Photo</span>\r
        </button>\r
    </div>\r
\r
    <div class="vault-details-overlay" id="vaultDetailsOverlay">\r
        <div class="details-card">\r
            <button class="details-download-btn" id="downloadDetailsBtn" type="button" aria-label="Download media">\r
                <span class="material-symbols-outlined">download</span>\r
            </button>\r
            <div class="details-media-wrap" id="detailsMediaWrap">\r
                <!-- Media will be injected here -->\r
            </div>\r
            <div class="details-content">\r
                <div class="details-info-row">\r
                    <div class="icon-box"><span class="material-symbols-outlined">calendar_today</span></div>\r
                    <div class="info-text">\r
                        <strong>Date & Time</strong>\r
                        <span id="detailsDateTime">--</span>\r
                    </div>\r
                </div>\r
                <div class="details-info-row">\r
                    <div class="icon-box"><span class="material-symbols-outlined">location_on</span></div>\r
                    <div class="info-text">\r
                        <strong>Captured Location</strong>\r
                        <span id="detailsLocation">--</span>\r
                    </div>\r
                </div>\r
                <div class="details-info-row">\r
                    <div class="icon-box"><span id="detailsVisibilityIcon"\r
                            class="material-symbols-outlined">visibility</span></div>\r
                    <div class="info-text sta-u16">\r
                        <strong>GAD Visibility</strong>\r
                        <span id="detailsVisibility">Shared with Response Team</span>\r
                    </div>\r
                    <label class="ios-switch">\r
                        <input type="checkbox" id="gadAccessToggle">\r
                        <span class="ios-slider"></span>\r
                    </label>\r
                </div>\r
                <!-- (2026-07-13) Removed Parent Access toggle for staff vault; was shown -->\r
                <button class="details-action-btn" id="closeDetailsBtn" type="button">Done</button>\r
            </div>\r
        </div>\r
    </div>\r
    <div class="status-modal" id="vaultDeleteConfirmModal">\r
        <div class="status-card">\r
            <div class="status-icon-wrap error sta-u152">\r
                <span class="material-symbols-outlined">delete_forever</span>\r
            </div>\r
            <h3 class="status-title">Confirm Deletion</h3>\r
            <p class="status-msg">Are you sure you want to permanently delete this media from your vault? This action\r
                cannot be undone.</p>\r
            <div class="attendance-modal-actions">\r
                <button id="confirmDeleteBtn" class="status-btn sta-u153">Delete Permanently</button>\r
                <button id="cancelDeleteBtn" class="status-btn secondary">Cancel</button>\r
            </div>\r
        </div>\r
    </div>\r
    <div class="status-modal" id="logoutConfirmModal">\r
        <div class="status-card">\r
            <div class="status-icon-wrap sta-u138">\r
                <span class="material-symbols-outlined">logout</span>\r
            </div>\r
            <h3 class="status-title">Log Out?</h3>\r
            <p class="status-msg">Are you sure you want to log out of your Securo account? You will need to sign in\r
                again to access your safety tools.</p>\r
            <div class="attendance-modal-actions">\r
                <button id="confirmLogoutBtn" class="status-btn sta-u154">Yes, Log Out</button>\r
                <button id="cancelLogoutBtn" class="status-btn secondary">Stay Signed In</button>\r
            </div>\r
        </div>\r
    </div>\r
    <div class="chat-overlay" id="chatOverlay">\r
        <div class="chat-box">\r
            <div class="chat-header">\r
                <div class="sta-u155">\r
                    <span class="material-symbols-outlined">support_agent</span>\r
                    <strong class="sta-u156">Customer Support</strong>\r
                </div>\r
                <button id="closeChatBtn" class="sta-u157">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
            <div class="chat-messages" id="chatMessages">\r
                <!-- Messages will be injected here -->\r
                <div class="chat-message received">\r
                    Hello! How can we help you today?\r
                    <span class="chat-time">Just now</span>\r
                </div>\r
            </div>\r
            <div class="chat-input-area">\r
                <label class="chat-anon-toggle" for="anonymousSupportToggle">\r
                    <input type="checkbox" id="anonymousSupportToggle" checked>\r
                    <span>Chat anonymously with GAD support</span>\r
                </label>\r
                <div class="chat-input-row">\r
                    <input type="text" class="chat-input" id="chatInput" placeholder="Type your message...">\r
                    <button class="chat-send-btn" id="sendChatBtn">\r
                        <span class="material-symbols-outlined">send</span>\r
                    </button>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
    // (2026-07-13) Add GAD Direct & Anonymous Messaging modal; was toastNotify and body close\r
    <!-- (2026-07-13) Fullscreen GAD chat layout matching guardian; was dialog modal -->\r
\r
    <div class="status-modal" id="gadPmModal">\r
        <div class="gad-chat-card" id="gadChatCard">\r
            <!-- (2026-07-13) Clean GAD header without anon divider; was anon subbar -->\r
            <div class="gad-chat-header">\r
                <div class="sta-u158">\r
                    <div class="sta-u159">\r
                        <span class="material-symbols-outlined sta-u160">support_agent</span>\r
                    </div>\r
                    <div>\r
                        <div class="sta-u161">GAD Support</div>\r
                        <div class="sta-u162">\r
                            <span class="sta-u163"></span>\r
                            <span>Active now • Confidential</span>\r
                        </div>\r
                    </div>\r
                </div>\r
                <button type="button" id="closeGadPmModalBtn" class="gad-chat-close" aria-label="Close chat">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
            <input type="checkbox" id="gadAnonToggle" checked aria-hidden="true" class="sta-u3">\r
            <div class="gad-chat-thread" id="gadChatThread">\r
                <div class="gad-them-row bubble-single">\r
                    <div class="gad-them-avatar"><span class="material-symbols-outlined sta-u164">support_agent</span>\r
                    </div>\r
                    <div class="gad-bubble them bubble-single">Hi! This is the GAD Desk. Tell us what is on your mind —\r
                        your message is confidential.</div>\r
                </div>\r
            </div>\r
            <div class="gad-chat-composer">\r
                <select id="gadCategorySelect" aria-label="Topic">\r
                    <option value="counseling">Topic: Counseling &amp; Mental Health</option>\r
                    <option value="cosh">Topic: Anti-Sexual Harassment (COSH)</option>\r
                    <option value="safespaces">Topic: Safe Spaces &amp; Inclusion</option>\r
                    <option value="policy">Topic: Policy &amp; Rights Inquiry</option>\r
                    <option value="general">Topic: General Support</option>\r
                </select>\r
                <input type="hidden" id="gadSubjectInput" value="">\r
                <div class="gad-chat-input-row">\r
                    <textarea id="gadMessageBody" rows="1" placeholder="Type a message..."></textarea>\r
                    <button type="button" id="submitGadPmBtn" class="gad-chat-send" aria-label="Send message">\r
                        <span class="material-symbols-outlined sta-u165">send</span>\r
                    </button>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Top segmented bar without text, copy requirement; prev: step labels -->\r
    <div id="fullscreenOnboardingScreen" class="fullscreen-onboarding-screen">\r
        <div id="fsOnboardingLoadingOverlay" class="fs-loading-overlay sta-u86">\r
            <div class="fs-loading-spinner"></div>\r
        </div>\r
        <div class="fs-onboarding-container">\r
            <!-- Progress Bar on Top -->\r
            <div class="fs-progress-header">\r
                <div class="fs-progress-steps-row">\r
                    <div class="fs-progress-step-pill active" id="fsProgStep1"></div>\r
                    <div class="fs-progress-step-pill" id="fsProgStep2"></div>\r
                </div>\r
            </div>\r
\r
            <!-- Viewport for Carousel -->\r
            <div class="fs-slides-viewport" id="fsSlidesViewport">\r
                <div class="fs-slides-track" id="fsSlidesTrack">\r
                    <!-- Slide 1: Profile setup -->\r
                    <div class="fs-slide-card" id="fsSlideStep1">\r
                        <h1 class="fs-onboarding-title">Set Up Your Profile</h1>\r
\r
                        <!-- Avatar Picker Section with 165px live camera circle -->\r
                        <div class="fs-avatar-picker-section">\r
                            <div class="fs-avatar-circle-wrapper" id="fsAvatarCircleWrap"\r
                                title="Click to snap selfie photo">\r
                                <div class="fs-avatar-circle" id="fsAvatarPreviewCircle">\r
                                    <video id="fsCircleLiveVideo" autoplay playsinline muted></video>\r
                                    <div class="fs-avatar-placeholder-content" id="fsAvatarPlaceholder">\r
                                        <span class="material-symbols-outlined">add_a_photo</span>\r
                                    </div>\r
                                    <div class="fs-avatar-initials" id="fsAvatarInitials">ST</div>\r
                                    <img id="fsAvatarImg" class="fs-avatar-img" src="" alt="Profile Photo">\r
                                </div>\r
                                <div class="fs-avatar-badge-cam" id="fsAvatarBadgeCam">\r
                                    <span class="material-symbols-outlined">photo_camera</span>\r
                                </div>\r
                            </div>\r
\r
                            <div class="fs-avatar-actions-row">\r
                                <button type="button" class="fs-action-chip" id="fsSnapSelfieBtn">\r
                                    <span class="material-symbols-outlined">camera</span>\r
                                    <span id="fsSnapBtnLabel">Capture Selfie</span>\r
                                </button>\r
                                <button type="button" class="fs-action-chip secondary" id="fsChooseGalleryBtn">\r
                                    <span class="material-symbols-outlined">image</span>\r
                                    <span>From Gallery</span>\r
                                </button>\r
                            </div>\r
                            <input type="file" id="fsGalleryInput" accept="image/*" class="sta-u3">\r
                            <canvas id="fsCameraCanvas" class="sta-u3"></canvas>\r
                        </div>\r
\r
                        <!-- Onboarding Form -->\r
                        <form id="fsOnboardingForm">\r
                            <div class="fs-form-row-grid sta-u166">\r
                                <div class="form-group sta-u167">\r
                                    <label class="form-label sta-u168">First\r
                                        Name</label>\r
                                    <div class="fs-input-field-wrap">\r
                                        <span class="material-symbols-outlined input-icon">person</span>\r
                                        <input type="text" id="fsFirstName" placeholder="e.g. Juan" required\r
                                            autocomplete="given-name">\r
                                    </div>\r
                                </div>\r
                                <div class="form-group sta-u167">\r
                                    <label class="form-label sta-u168">Last\r
                                        Name</label>\r
                                    <div class="fs-input-field-wrap">\r
                                        <span class="material-symbols-outlined input-icon">badge</span>\r
                                        <input type="text" id="fsLastName" placeholder="e.g. Dela Cruz" required\r
                                            autocomplete="family-name">\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- (2026-07-13) Add id to course row for staff hiding; was bare div -->\r
                            <div class="fs-form-row-grid sta-u169" id="fsCourseSectionRow">\r
                                <!-- Course Dropdown -->\r
                                <div class="form-group sta-u167">\r
                                    <label class="form-label sta-u168">Course</label>\r
                                    <div class="fs-input-field-wrap sta-u170">\r
                                        <span class="material-symbols-outlined input-icon">school</span>\r
                                        <select id="fsCourse" required class="sta-u171">\r
                                            <option value="" disabled selected>Select course</option>\r
                                            <option value="BSIT">Bachelor of Science in Information Technology (BSIT)\r
                                            </option>\r
                                            <option value="BIT-Comp Tech">Bachelor in Industrial Technology- Major in\r
                                                Computer Technology (BIT-Comp Tech)</option>\r
                                            <option value="BIT-Elex">Bachelor in Industrial Technology - Major in\r
                                                Electronics (BIT-Elex)</option>\r
                                            <option value="BIT-Automotive">Bachelor in Industrial Technology - Major in\r
                                                Automotive (BIT-Automotive)</option>\r
                                            <option value="BSIE">Bachelor of Science in Industrial Engineering (BSIE)\r
                                            </option>\r
                                            <option value="BSHM">Bachelor of Science in Hospitality Management (BSHM)\r
                                            </option>\r
                                            <option value="BSFi">Bachelor of Science in Fisheries (BSFi)</option>\r
                                            <option value="BEEd">Bachelor of Elementary Education (BEEd)</option>\r
                                            <option value="BSED-Math">Bachelor of Secondary Education - Major in\r
                                                Mathematics (BSED-Math)</option>\r
                                            <option value="BTLEd-HE">Bachelor in Technology Livelihood Education - Major\r
                                                in Home Economics (BTLEd-HE)</option>\r
                                        </select>\r
                                        <span class="material-symbols-outlined sta-u172">arrow_drop_down</span>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Year · Section -->\r
                                <div class="form-group sta-u167">\r
                                    <label class="form-label sta-u168">Year\r
                                        · Section</label>\r
                                    <div class="fs-input-field-wrap sta-u173">\r
                                        <span\r
                                            class="material-symbols-outlined input-icon sta-u174">calendar_today</span>\r
                                        <input type="text" id="fsYearLevel" placeholder="4" maxlength="1"\r
                                            inputmode="numeric" required autocomplete="off" class="sta-u175">\r
                                        <span class="sta-u176">-</span>\r
                                        <input type="text" id="fsSection" placeholder="A" maxlength="4" required\r
                                            autocomplete="off" class="sta-u177">\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- (2026-07-13) Staff Department input for onboarding; was student section -->\r
                            <div class="form-group sta-u167" id="fsStaffDepartmentRow" style="display:none; margin-top:12px;">\r
                                <label class="form-label sta-u168">Department <span style="opacity:0.65; font-weight:500;">(Optional)</span></label>\r
                                <div class="fs-input-field-wrap">\r
                                    <span class="material-symbols-outlined input-icon">apartment</span>\r
                                    <input type="text" id="fsDepartment" placeholder="e.g. Faculty, Admin Office, Security, IT" autocomplete="organization">\r
                                </div>\r
                            </div>\r
\r
                            <div id="fsOnboardingError" class="error-msg sta-u178">\r
                            </div>\r
\r
                            <button type="submit" class="btn-action sta-u179" id="fsSubmitOnboardingBtn">\r
                                <span id="fsSubmitText">Save & Continue</span>\r
                                <span class="material-symbols-outlined" id="fsSubmitIcon">arrow_forward</span>\r
                            </button>\r
                        </form>\r
                    </div>\r
\r
                    <!-- Slide 2: Parent / Guardian Link -->\r
                    <div class="fs-slide-card" id="fsSlideStep2">\r
                        <div class="sta-u180">\r
\r
                            <!-- Badge Icon -->\r
                            <div class="sta-u181">\r
                                <span class="material-symbols-outlined sta-u182">family_restroom</span>\r
                            </div>\r
\r
                            <h2 class="sta-u183">\r
                                Link Your Account With Your Parents</h2>\r
                            <p class="sta-u184">\r
                                Copy this link to link your account with your parents. Give this link to them to\r
                                register.\r
                            </p>\r
\r
                            <!-- Link Container -->\r
                            <div class="sta-u185">\r
                                <div class="sta-u186">\r
                                    <span class="sta-u187">Parent\r
                                        Registration Link</span>\r
                                    <span class="material-symbols-outlined sta-u188">link</span>\r
                                </div>\r
                                <div id="fsGuardianInviteLink" class="sta-u189">\r
                                    <!-- (2026-07-13) Dynamic link placeholder; prev: zea domain -->\r
                                    Generating link...\r
                                </div>\r
                            </div>\r
\r
                            <!-- Action buttons -->\r
                            <div class="sta-u190">\r
                                <!-- (2026-07-13) Shorter copy button label; prev: long prompt label -->\r
                                <button type="button" class="btn-action sta-u191" id="fsCopyGuardianLinkBtn">\r
                                    <span class="material-symbols-outlined">content_copy</span>\r
                                    <span id="fsCopyLinkText">Copy Link</span>\r
                                </button>\r
\r
                                <button type="button" class="btn-action sta-u192" id="fsShareGuardianLinkBtn">\r
                                    <span class="material-symbols-outlined">share</span>\r
                                    <span>Share Link</span>\r
                                </button>\r
\r
                                <button type="button" id="fsProceedToAppBtn" class="sta-u193">\r
                                    <span>Proceed to App</span>\r
                                    <span class="material-symbols-outlined">arrow_forward</span>\r
                                </button>\r
                            </div>\r
\r
                            <!-- Swipe hint -->\r
                            <div id="fsSwipeHintBox" class="sta-u194">\r
                                <span class="material-symbols-outlined sta-u195" id="fsSwipeHintIcon">lock</span>\r
                                <span id="fsSwipeHintText">Copy link above to unlock app</span>\r
                            </div>\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div class="toast-notify" id="toastNotify">\r
        <span class="material-symbols-outlined" id="toastIcon">check_circle</span>\r
        <span id="toastMsg">Success</span>\r
    </div>
`,c=t(),l=()=>a(()=>import(`./staff-KEM3YpZ-.js`),__vite__mapDeps([0,1,2,3]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));