const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-C2-dk0MW.js","./install-sw-C1vRYC0v.js","./preload-helper-CGP3o08e.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css               */r();var o=e(),s=`<div class="onboarding-container">\r
        <!-- Step 1: Camera Permission -->\r
        <div class="permission-card active" id="cameraCard">\r
            <div class="progress-bar">\r
                <div class="progress-dot active"></div>\r
                <div class="progress-dot"></div>\r
                <div class="progress-dot"></div>\r
            </div>\r
\r
            <div class="permission-icon camera">\r
                <span class="material-symbols-outlined">photo_camera</span>\r
            </div>\r
\r
            <h1 class="card-title">Camera Access</h1>\r
            <p class="card-subtitle">Securo needs camera access to capture emergency evidence and report incidents effectively.</p>\r
\r
            <div class="feature-list">\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">emergency</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Emergency Documentation</p>\r
                        <p class="feature-desc">Capture photo/video evidence during SOS alerts</p>\r
                    </div>\r
                </div>\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">folder_special</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Secure Vault Storage</p>\r
                        <p class="feature-desc">Store incident media in your private encrypted vault</p>\r
                    </div>\r
                </div>\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">account_circle</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Profile Photos</p>\r
                        <p class="feature-desc">Take profile pictures and update your avatar</p>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <div id="cameraStatus"></div>\r
\r
            <button class="btn-primary" id="grantCameraBtn">\r
                <span class="material-symbols-outlined">photo_camera</span>\r
                <span>Allow Camera Access</span>\r
            </button>\r
\r
            <!-- (2026-07-13) Block access without camera; was skip button -->\r
            <div class="permission-requirement-notice">\r
                <span class="material-symbols-outlined">lock</span>\r
                <span>Camera access is strictly required to unlock Securo</span>\r
            </div>\r
        </div>\r
\r
        <!-- Step 2: Location Permission -->\r
        <div class="permission-card" id="locationCard">\r
            <div class="progress-bar">\r
                <div class="progress-dot active"></div>\r
                <div class="progress-dot active"></div>\r
                <div class="progress-dot"></div>\r
            </div>\r
\r
            <div class="permission-icon location">\r
                <span class="material-symbols-outlined">location_on</span>\r
            </div>\r
\r
            <h1 class="card-title">Location Services</h1>\r
            <p class="card-subtitle">Location access is critical for emergency response, attendance tracking, and guardian monitoring.</p>\r
\r
            <div class="warning-box">\r
                <strong>⚠️ Safety Critical</strong>\r
                <p>Without location access, emergency responders cannot find you during SOS alerts. This permission is strongly recommended for your safety.</p>\r
            </div>\r
\r
            <div class="feature-list">\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">emergency</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Emergency Response</p>\r
                        <p class="feature-desc">Share your exact location during SOS alerts</p>\r
                    </div>\r
                </div>\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">schedule</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Auto Attendance</p>\r
                        <p class="feature-desc">Automatic check-in/out when entering campus</p>\r
                    </div>\r
                </div>\r
                <div class="feature-item">\r
                    <div class="feature-icon">\r
                        <span class="material-symbols-outlined">family_restroom</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title">Guardian Monitoring</p>\r
                        <p class="feature-desc">Parents can see your live location for safety</p>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <div id="locationStatus"></div>\r
\r
            <button class="btn-primary" id="grantLocationBtn">\r
                <span class="material-symbols-outlined">location_on</span>\r
                <span>Allow Location Access</span>\r
            </button>\r
\r
            <!-- (2026-07-13) Block access without location; was skip button -->\r
            <div class="permission-requirement-notice">\r
                <span class="material-symbols-outlined">lock</span>\r
                <span>Location access is strictly required to unlock Securo</span>\r
            </div>\r
        </div>\r
\r
        <!-- Step 3: Complete -->\r
        <div class="permission-card" id="completeCard">\r
            <div class="progress-bar">\r
                <div class="progress-dot active"></div>\r
                <div class="progress-dot active"></div>\r
                <div class="progress-dot active"></div>\r
            </div>\r
\r
            <div class="permission-icon complete">\r
                <span class="material-symbols-outlined">check_circle</span>\r
            </div>\r
\r
            <h1 class="card-title">All Set!</h1>\r
            <p class="card-subtitle">Your Securo safety companion is ready. You can now access all emergency features and campus tools.</p>\r
\r
            <div class="complete-checklist">\r
                <div class="checklist-item">\r
                    <div class="checklist-icon">\r
                        <span class="material-symbols-outlined">check</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title" id="cameraCheckText">Camera: Not Granted</p>\r
                    </div>\r
                </div>\r
                <div class="checklist-item">\r
                    <div class="checklist-icon">\r
                        <span class="material-symbols-outlined">check</span>\r
                    </div>\r
                    <div class="feature-text">\r
                        <p class="feature-title" id="locationCheckText">Location: Not Granted</p>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <button class="btn-primary" id="finishBtn">\r
                <span class="material-symbols-outlined">dashboard</span>\r
                <span>Go to Dashboard</span>\r
            </button>\r
\r
            <button class="btn-secondary pub-permissions-u1" id="retryPermissionsBtn">\r
                <span class="material-symbols-outlined">refresh</span>\r
                <span>Grant Missing Permissions</span>\r
            </button>\r
        </div>\r
\r
        <!-- (2026-07-13) Forced re-prompt popup on deny; prev: badge only -->\r
        <div id="permissionDeniedModal" class="permission-denied-overlay pub-permissions-u1">\r
            <div class="permission-denied-box">\r
                <div class="denied-icon-badge">\r
                    <span class="material-symbols-outlined" id="deniedModalIcon">warning</span>\r
                </div>\r
                <h2 class="denied-title" id="deniedModalTitle">Permission Required</h2>\r
                <p class="denied-desc" id="deniedModalDesc">Camera access is required for campus safety.</p>\r
                <!-- (2026-07-13) Dynamic instructions wrapper; prev: hardcoded browser text -->\r
                <div class="denied-instructions" id="deniedInstructionsContainer">\r
                    <p>To enable access in your browser:</p>\r
                    <ol>\r
                        <li>Tap the <strong>Site Controls 🔒</strong> icon in your address bar</li>\r
                        <li>Set <strong>Camera</strong> / <strong>Location</strong> to <strong>Allow</strong></li>\r
                        <li>Tap <strong>Retry Permission</strong> below</li>\r
                    </ol>\r
                </div>\r
                <button class="btn-primary" id="retryDeniedPromptBtn">\r
                    <span class="material-symbols-outlined">refresh</span>\r
                    <span>Retry Permission</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->
`,c=t(),l=()=>a(()=>import(`./public-C2-dk0MW.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-permissions`,dataPage:`permissions`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));