const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-DOWDS5eV.js","./install-sw-B5mVeGtM.js","./preload-helper-CGP3o08e.js"])))=>i.map(i=>d[i]);
import{a as e,c as t,i as n,n as r,o as i,r as a,t as o}from"./preload-helper-CGP3o08e.js";/* empty css                  *//* empty css               */var s=t(i()),c=e(),l=`<!-- (2026-07-13) Preloader & signup nav button; was demo access & enter portal -->\r
    <div id="securo-preloader-overlay">\r
        <div class="securo-preloader-bg"></div>\r
        <div class="securo-preloader-content">\r
            <div class="securo-preloader-logo-wrap">\r
                <img src="assets/images/logo with text.png" alt="Securo" class="securo-preloader-logo">\r
                <div class="securo-preloader-shimmer"></div>\r
            </div>\r
            <div class="securo-preloader-indicator">\r
                <span class="securo-preloader-status-text">INITIALIZING SECURE SYSTEMS</span>\r
                <div class="securo-preloader-progress-track">\r
                    <div class="securo-preloader-progress-bar"></div>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Ambient Gradient Blobs -->\r
    <div class="ambient-glow-top"></div>\r
    <div class="ambient-glow-bottom"></div>\r
\r
    <!-- Navigation Header -->\r
    <header class="navbar-main">\r
        <div class="page-container nav-content">\r
            <!-- (2026-07-13) Brand logo scrolls to hero; was history.back navigation -->\r
            <a href="#hero" class="brand-logo-wrap" title="Securo Safety Platform">\r
                <img src="assets/images/logo with text.png" alt="Securo Logo" class="brand-logo-img">\r
            </a>\r
\r
            <nav>\r
                <!-- (2026-07-13) Reorder nav & rename Role Selection; was About Us first -->\r
                <ul class="nav-links">\r
                    <li><a href="#hero">Overview</a></li>\r
                    <li><a href="#features">Features</a></li>\r
                    <li><a href="#dual-view">Student vs. Guardian</a></li>\r
                    <li><a href="#roles">Role Selection</a></li>\r
                    <li><a href="#about-us">About Us</a></li>\r
                </ul>\r
            </nav>\r
\r
            <div class="nav-actions">\r
                <!-- (2026-07-13) Enter Portal loads preloader; was direct href -->\r
                <a href="public/role-selection.html" class="btn-primary" id="enterPortalBtn"\r
                    onclick="enterPortal('public/role-selection.html'); return false;">\r
                    <span>Enter Portal</span>\r
                    <span class="material-symbols-outlined pub-landing-u1">arrow_forward</span>\r
                </a>\r
                <!-- (2026-07-13) Add mobile nav toggle button; was absent -->\r
                <button class="mobile-nav-toggle" id="mobileNavToggle" aria-label="Toggle Navigation" aria-expanded="false">\r
                    <span class="material-symbols-outlined" id="mobileNavIcon">menu</span>\r
                </button>\r
            </div>\r
        </div>\r
        <!-- (2026-07-13) Simple basic mobile nav links; was complex cards -->\r
        <div class="mobile-nav-accordion" id="mobileNavAccordion">\r
            <div class="page-container">\r
                <ul class="mobile-nav-links">\r
                    <li><a href="#hero" class="mobile-nav-link">Overview</a></li>\r
                    <li><a href="#features" class="mobile-nav-link">Features</a></li>\r
                    <li><a href="#dual-view" class="mobile-nav-link">Student vs. Guardian</a></li>\r
                    <li><a href="#roles" class="mobile-nav-link">Role Selection</a></li>\r
                    <li><a href="#about-us" class="mobile-nav-link">About Us</a></li>\r
                </ul>\r
            </div>\r
        </div>\r
    </header>\r
\r
    <main>\r
        <!-- Hero Section: Editorial Headline + Apple Hardware Screenshot Showcase -->\r
        <section class="hero-section" id="hero">\r
            <div class="page-container hero-grid">\r
\r
                <!-- Left Editorial Column -->\r
                <div class="hero-left">\r
                    <h1 class="hero-headline">\r
                        <span>Track.</span>\r
                        <span>Protect.</span>\r
                        <span>Respond.</span>\r
                        <span>Repeat.</span>\r
                    </h1>\r
\r
                    <!-- App Store & Google Play Download Badges -->\r
                    <div class="app-store-badges">\r
                        <a href="#roles" class="store-badge-btn" title="Download on Apple App Store">\r
                            <svg viewBox="0 0 24 24">\r
                                <path\r
                                    d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.82.93-2.87-1 .04-2.19.67-2.89 1.48-.56.64-1.05 1.71-.92 2.73 1.11.08 2.25-.58 2.88-1.34z" />\r
                            </svg>\r
                            <div class="store-badge-text">\r
                                <span class="caption">Download on the</span>\r
                                <span class="store-title">App Store</span>\r
                            </div>\r
                        </a>\r
\r
                        <a href="#roles" class="store-badge-btn" title="Get it on Google Play">\r
                            <svg viewBox="0 0 24 24">\r
                                <path\r
                                    d="M3.6 2.5C3.2 2.9 3 3.5 3 4.3v15.4c0 .8.2 1.4.6 1.8l9.6-9.6L3.6 2.5zm11.1 8.5l2.4-2.4-12.8-7.3c-.1 0-.2-.1-.3-.1l10.7 9.8zm0 2l-10.7 9.8c.1 0 .2-.1.3-.1l12.8-7.3-2.4-2.4zm1.4-1.4l3.1 1.8c.9.5.9 1.4 0 1.9l-3.1 1.8-1.9-1.9 1.9-1.9z" />\r
                            </svg>\r
                            <div class="store-badge-text">\r
                                <span class="caption">GET IT ON</span>\r
                                <span class="store-title">Google Play</span>\r
                            </div>\r
                        </a>\r
                    </div>\r
\r
                    <h2 class="hero-subhead">A secure student is an empowered student.</h2>\r
                    <p class="hero-description">\r
                        Securo is your shared hub for student well-being, live campus safety, and rapid emergency\r
                        intervention. Students and families stay connected through every moment of university life.\r
                    </p>\r
\r
\r
                </div>\r
\r
                <!-- Right iPhone Interactive Trailer Mockup -->\r
                <div class="hero-right" id="trailer">\r
                    <!-- Interactive Tab Switcher -->\r
                    <div class="trailer-tabs-bar" role="tablist">\r
                        <button class="trailer-pill active" onclick="switchPreview('map', this)">\r
                            <span class="material-symbols-outlined">map</span>\r
                            <span>Live Map</span>\r
                        </button>\r
                        <button class="trailer-pill" onclick="switchPreview('sos', this)">\r
                            <span class="material-symbols-outlined">sos</span>\r
                            <span>SOS Alert</span>\r
                        </button>\r
                        <button class="trailer-pill" onclick="switchPreview('vault', this)">\r
                            <span class="material-symbols-outlined">lock</span>\r
                            <span>Vault</span>\r
                        </button>\r
                        <button class="trailer-pill" onclick="switchPreview('attendance', this)">\r
                            <span class="material-symbols-outlined">badge</span>\r
                            <span>Attendance</span>\r
                        </button>\r
                        <button class="trailer-pill" onclick="switchPreview('gad', this)">\r
                            <span class="material-symbols-outlined">support_agent</span>\r
                            <span>GAD Chat</span>\r
                        </button>\r
                        <button class="trailer-pill" onclick="switchPreview('guardian', this)">\r
                            <span class="material-symbols-outlined">family_restroom</span>\r
                            <span>Guardian</span>\r
                        </button>\r
                    </div>\r
\r
                    <!-- Authentic iPhone Hardware Frame -->\r
                    <div class="iphone-mockup-wrap">\r
                        <div class="iphone-island">\r
                            <div class="island-camera"></div>\r
                            <div class="island-sensor"></div>\r
                        </div>\r
\r
                        <div class="iphone-screen">\r
                            <img src="assets/images/student_map.png" alt="Securo App Live Interface" id="previewScreenImg"\r
                                class="iphone-screenshot-img">\r
                        </div>\r
\r
                        <!-- Live Status Floating Chip -->\r
                        <!-- (2026-07-13) Set active watcher to Mommy Mafe Ramil; was John Paul -->\r
                        <div class="phone-floating-pill" id="previewStatusPill">\r
                            <span class="live-dot"></span>\r
                            <span id="previewStatusText">Parent Watching Active: Mommy Mafe Ramil</span>\r
                        </div>\r
                    </div>\r
                </div>\r
\r
            </div>\r
        </section>\r
\r
        <!-- Feature Trailer Highlights Grid -->\r
        <section class="features-section" id="features">\r
            <div class="page-container">\r
                <div class="section-header">\r
                    <span class="section-eyebrow">Enterprise Architecture</span>\r
                    <h2 class="section-title">Engineered for Uncompromising Campus Safety</h2>\r
                    <p class="section-lead">A unified multi-stakeholder platform replacing fragmented alert boxes with\r
                        instant, verifiable defense.</p>\r
                </div>\r
\r
                <div class="features-grid">\r
                    <!-- Pillar 1: Campus Radar & Parent Watcher -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box purple">\r
                            <span class="material-symbols-outlined">radar</span>\r
                        </div>\r
                        <h3>Live Geofenced Radar & Parent Watcher</h3>\r
                        <p>Continuous boundary surveillance with sticky guardian presence indicators. Students instantly\r
                            see which approved family members are watching over them.</p>\r
                        <div class="feature-badge-row">\r
                            <span class="feature-tag">GPS Geofence</span>\r
                            <span class="feature-tag">Live Pulse</span>\r
                        </div>\r
                    </div>\r
\r
                    <!-- Pillar 2: 1-Tap SOS Panic Trigger -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box rose">\r
                            <!-- (2026-07-13) Set valid Material Symbol icon to sos; was emergency_home -->\r
                            <span class="material-symbols-outlined">sos</span>\r
                        </div>\r
                        <h3>1-Tap SOS Beacon & Audio Alarm</h3>\r
                        <p>High-priority incident trigger with a 5-second cancelable countdown, high-decibel audible\r
                            siren, and real-time dispatcher coordinates beaconing.</p>\r
                        <div class="feature-badge-row">\r
                            <span class="feature-tag">5s Countdown</span>\r
                            <span class="feature-tag">Instant Dispatch</span>\r
                        </div>\r
                    </div>\r
\r
                    <!-- Pillar 3: Encrypted Vault Locker -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box orange">\r
                            <span class="material-symbols-outlined">shield_lock</span>\r
                        </div>\r
                        <h3>Tamper-Proof Evidence Vault</h3>\r
                        <p>Encrypted incident evidence repository. Upload and secure photos, audio notes, and video\r
                            clips protected from unauthorized device-level deletion.</p>\r
                        <div class="feature-badge-row">\r
                            <span class="feature-tag">Encrypted Storage</span>\r
                            <span class="feature-tag">Tamper-Proof</span>\r
                        </div>\r
                    </div>\r
\r
                    <!-- Pillar 4: Geofence Automated Attendance -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box emerald">\r
                            <span class="material-symbols-outlined">how_to_reg</span>\r
                        </div>\r
                        <h3>Contactless Gate Attendance</h3>\r
                        <p>Automated arrival and departure verification at university gates without physical lines.\r
                            Real-time logging delivers certainty to families.</p>\r
                        <div class="feature-badge-row">\r
                            <span class="feature-tag">Auto In/Out</span>\r
                            <span class="feature-tag">Zero Queues</span>\r
                        </div>\r
                    </div>\r
\r
                    <!-- Pillar 5: Confidential GAD & Counseling Desk -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box purple">\r
                            <span class="material-symbols-outlined">forum</span>\r
                        </div>\r
                        <h3>Confidential GAD Support Chat</h3>\r
                        <p>Direct real-time communication channel for student guidance, mental health counseling, and\r
                            anti-sexual harassment (COSH) safe reporting.</p>\r
                        <div class="feature-badge-row">\r
                            <!-- (2026-07-13) Remove anonymous option tag; was anonymous option -->\r
                            <span class="feature-tag">Verified Direct</span>\r
                            <span class="feature-tag">Live Thread</span>\r
                        </div>\r
                    </div>\r
\r
                    <!-- Pillar 6: Guardian 360 Presence -->\r
                    <div class="feature-card">\r
                        <div class="feature-icon-box amber">\r
                            <span class="material-symbols-outlined">family_restroom</span>\r
                        </div>\r
                        <h3>Guardian 360° Safety Suite</h3>\r
                        <p>Dedicated portal empowering parents to track multiple linked children, view gate timestamps,\r
                            and access authorized emergency posts.</p>\r
                        <div class="feature-badge-row">\r
                            <span class="feature-tag">Multi-Child</span>\r
                            <span class="feature-tag">Push Alerts</span>\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
        </section>\r
\r
        <!-- Dual-Perspective Experience Showcase -->\r
        <section class="dual-view-section" id="dual-view">\r
            <div class="page-container">\r
                <div class="section-header">\r
                    <!-- (2026-07-13) Rename eyebrow without Ecosystem; was Synchronized Ecosystem -->\r
                    <span class="section-eyebrow">Synchronized Platform</span>\r
                    <h2 class="section-title">Two Perspectives.<br>One Unified Safety Net.</h2>\r
                    <p class="section-lead">See how Securo seamlessly bridges the student's personal defense on campus\r
                        with the parent's peace of mind at home.</p>\r
                </div>\r
\r
                <div class="dual-view-grid">\r
                    <!-- Student Perspective -->\r
                    <div class="perspective-card">\r
                        <span class="perspective-tag student">\r
                            <span class="material-symbols-outlined pub-landing-u2">school</span>\r
                            Student Experience\r
                        </span>\r
                        <h3>Active Defense & Campus Autonomy</h3>\r
                        <p>Complete control over campus navigation, gate attendance, emergency SOS activation, and\r
                            confidential counseling—all from one frictionless interface.</p>\r
                        <div class="perspective-screenshot-box">\r
                            <img src="assets/images/student_map.png" alt="Student Active Map View">\r
                        </div>\r
                    </div>\r
\r
                    <!-- Guardian Perspective -->\r
                    <div class="perspective-card">\r
                        <span class="perspective-tag guardian">\r
                            <span class="material-symbols-outlined pub-landing-u2">family_restroom</span>\r
                            Guardian Experience\r
                        </span>\r
                        <h3>Continuous Peace of Mind</h3>\r
                        <p>Real-time location breadcrumbs, automatic arrival and departure geofence notifications, and\r
                            immediate shared emergency vault access.</p>\r
                        <div class="perspective-screenshot-box">\r
                            <img src="assets/images/guardian_dashboard.png" alt="Guardian Dashboard Monitoring View">\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
        </section>\r
\r
        <!-- (2026-07-13) Remove inline padding on roles section; was inline style -->\r
        <section class="roles-section" id="roles">\r
            <div class="page-container">\r
                <div class="section-header">\r
                    <span class="section-eyebrow">Enterprise Access</span>\r
                    <h2 class="section-title">Choose Your Role</h2>\r
                    <p class="section-lead">Choose your authorized portal to sign in or access your dedicated Securo\r
                        workspace.</p>\r
                </div>\r
\r
                <!-- (2026-07-13) Responsive roles grid classes; was inline grid style -->\r
                <div class="roles-grid">\r
                    <!-- Student Card -->\r
                    <div class="role-portal-card featured">\r
                        <div class="role-avatar-circle student">\r
                            <span class="material-symbols-outlined pub-landing-u3">school</span>\r
                        </div>\r
                        <h3>Student Portal</h3>\r
                        <p class="role-desc">Live radar, guardian watcher bar, SOS alarm trigger, geofenced attendance,\r
                            and GAD chat.</p>\r
                        <a href="public/login.html" class="role-cta-btn student pub-landing-u4"\r
                            onclick="enterPortal('public/login.html', 'student'); return false;">\r
                            <span>Launch Student App</span>\r
                            <span class="material-symbols-outlined pub-landing-u1">arrow_forward</span>\r
                        </a>\r
                    </div>\r
\r
                    <!-- Guardian Card -->\r
                    <div class="role-portal-card">\r
                        <div class="role-avatar-circle guardian">\r
                            <span class="material-symbols-outlined pub-landing-u3">family_restroom</span>\r
                        </div>\r
                        <h3>Guardian Portal</h3>\r
                        <p class="role-desc">Child live tracking radar, gate entry/exit push alerts, and shared incident\r
                            evidence vault.</p>\r
                        <a href="parent/parent.html?view=auth" class="role-cta-btn guardian pub-landing-u4"\r
                            onclick="enterPortal('parent/parent.html?view=auth', 'guardian'); return false;">\r
                            <span>Launch Guardian Portal</span>\r
                            <span class="material-symbols-outlined pub-landing-u1">arrow_forward</span>\r
                        </a>\r
                    </div>\r
\r
                    <!-- Staff Card -->\r
                    <div class="role-portal-card">\r
                        <div class="role-avatar-circle pub-landing-u5">\r
                            <span class="material-symbols-outlined pub-landing-u3">badge</span>\r
                        </div>\r
                        <h3>Securo Staff</h3>\r
                        <p class="role-desc">Faculty attendance verification, campus assistance, and direct workplace\r
                            security communications.</p>\r
                        <a href="public/login.html" class="role-cta-btn pub-landing-u6"\r
                           \r
                            onclick="enterPortal('public/login.html', 'staff'); return false;">\r
                            <span>Launch Staff Portal</span>\r
                            <span class="material-symbols-outlined pub-landing-u1">arrow_forward</span>\r
                        </a>\r
                    </div>\r
                    <!-- (2026-07-13) Remove admin card from landing; was admin card -->\r
                </div>\r
\r
            </div>\r
        </section>\r
\r
        <!-- (2026-07-13) Remove inline styles on about-us and team cards; was inline styles -->\r
        <section class="about-us-section" id="about-us">\r
            <div class="page-container">\r
                <div class="section-header">\r
                    <span class="section-eyebrow">Development Team</span>\r
                    <h2 class="section-title">About Us</h2>\r
                    <p class="section-lead">The dedicated creators and engineering team behind the Securo Campus Safety\r
                        Platform.</p>\r
                </div>\r
                <!-- (2026-07-13) Responsive team grid; was inline grid style -->\r
                <div class="team-grid">\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            RZ</div>\r
                        <h4 class="pub-landing-u8">Ramil, Zea Marae</h4>\r
                        <p class="pub-landing-u9">Core Developer</p>\r
                    </div>\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            SA</div>\r
                        <h4 class="pub-landing-u8">Santosidad, Angel Mae</h4>\r
                        <p class="pub-landing-u9">Developer & Researcher</p>\r
                    </div>\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            LA</div>\r
                        <h4 class="pub-landing-u8">Loon, Alexa Suzane</h4>\r
                        <p class="pub-landing-u9">Developer & QA</p>\r
                    </div>\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            DB</div>\r
                        <h4 class="pub-landing-u8">Delos Santos, Bea</h4>\r
                        <p class="pub-landing-u9">Developer & UI/UX</p>\r
                    </div>\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            TK</div>\r
                        <h4 class="pub-landing-u8">Tangkay, Kenneth Brian</h4>\r
                        <p class="pub-landing-u9">Developer & Systems</p>\r
                    </div>\r
                    <div class="team-member-card">\r
                        <div\r
                            class="pub-landing-u7">\r
                            LL</div>\r
                        <h4 class="pub-landing-u8">Ledesma, Lawrence</h4>\r
                        <p class="pub-landing-u9">Developer & Technical Lead</p>\r
                    </div>\r
                </div>\r
            </div>\r
        </section>\r
    </main>\r
\r
    <!-- Institutional Footer -->\r
    <footer class="footer-main">\r
        <div class="page-container">\r
            <div class="footer-grid">\r
                <div class="footer-brand">\r
                    <h2>Securo</h2>\r
                    <p>The mission-critical campus safety, automated attendance, and emergency defense infrastructure\r
                        for higher education institutions.</p>\r
                </div>\r
\r
                <!-- (2026-07-13) Remove Ecosystem column & add preloader triggers; was Ecosystem col -->\r
                <div class="footer-col">\r
                    <h4>Direct Access</h4>\r
                    <ul>\r
                        <li><a href="public/login.html" onclick="enterPortal('public/login.html', 'student'); return false;">Student\r
                                Login</a></li>\r
                        <li><a href="parent/parent.html?view=auth"\r
                                onclick="enterPortal('parent/parent.html?view=auth', 'guardian'); return false;">Guardian Portal</a>\r
                        </li>\r
                        <!-- (2026-07-13) Remove admin terminal link from footer; was admin link -->\r
                        <li><a href="public/role-selection.html"\r
                                onclick="enterPortal('public/role-selection.html'); return false;">Role Selector</a></li>\r
                    </ul>\r
                </div>\r
\r
                <div class="footer-col">\r
                    <h4>Safety & Compliance</h4>\r
                    <ul>\r
                        <li><a href="public/about.html">About Securo</a></li>\r
                        <!-- (2026-07-13) Rename to Terms and Conditions; was Terms of Service -->\r
                        <li><a href="public/terms.html">Terms and Conditions</a></li>\r
                        <!-- (2026-07-13) Link to separate hotlines.html page; was bottom embed -->\r
                        <li><a href="public/hotlines.html">Daanbantayan Hotlines</a></li>\r
                    </ul>\r
                </div>\r
            </div>\r
\r
            <div class="footer-bottom">\r
                <p>&copy; 2026 Securo Campus Safety Systems. All rights reserved.</p>\r
                <p>Designed for university operations and continuous student protection.</p>\r
            </div>\r
        </div>\r
    </footer>\r
\r
    <!-- Interactive Trailer Script -->\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->\r
`,u=new URL(`logo with text-Ds3lV_hy.png`,import.meta.url).href,d=new URL(`student_map-C9wID4ZA.png`,import.meta.url).href,f=new URL(`student_sos-C1rHyHMt.png`,import.meta.url).href,p=new URL(`student_vault-BCAEbBBR.png`,import.meta.url).href,m=new URL(`student_attendance-aHeBW8wj.png`,import.meta.url).href,h=new URL(`student_gad-BlaHjcfd.png`,import.meta.url).href,g=new URL(`guardian_dashboard-BY1huXPs.png`,import.meta.url).href,_=n(),v={"assets/images/logo with text.png":u,"assets/images/student_map.png":d,"assets/images/student_sos.png":f,"assets/images/student_vault.png":p,"assets/images/student_attendance.png":m,"assets/images/student_gad.png":h,"assets/images/guardian_dashboard.png":g};typeof window<`u`&&(window.__SECURO_LANDING_IMAGES={map:d,sos:f,vault:p,attendance:m,gad:h,guardian:g,logoWithText:u});var y=()=>o(()=>import(`./public-DOWDS5eV.js`),__vite__mapDeps([0,1,2]),import.meta.url);function b(){let e=(0,s.useMemo)(()=>{let e=l;for(let[t,n]of Object.entries(v))e=e.split(t).join(n);return e},[]);return(0,_.jsx)(r,{templateHtml:e,loadController:y,bodyClass:`page-landing`,dataPage:`landing`})}var x=document.getElementById(`root`);x&&(0,c.createRoot)(x).render((0,_.jsx)(a,{children:(0,_.jsx)(b,{})}));