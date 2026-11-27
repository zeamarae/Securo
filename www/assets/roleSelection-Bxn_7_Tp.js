const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-eEtm4NGb.js","./install-sw-BR8Wf3D3.js","./preload-helper-BXBgov45.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-BXBgov45.js";/* empty css                  *//* empty css               */r();var o=e(),s=`<!-- (2026-07-13) Dramatic intro preloader with logo; was immediate page view -->\r
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
    <div class="selection-card">\r
        <div class="logo-area">\r
            <div class="logo-icon">\r
                <span class="material-symbols-outlined">shield_person</span>\r
            </div>\r
            <h1>Welcome to Securo</h1>\r
            <p class="subtitle">Please select your primary role to continue</p>\r
        </div>\r
\r
        <div class="role-grid">\r
            <button class="role-btn student" onclick="selectRole('student')">\r
                <div class="icon-circle">\r
                    <span class="material-symbols-outlined">school</span>\r
                </div>\r
                <div class="role-info">\r
                    <h2>I am a Student</h2>\r
                    <p>Access campus map, SOS tools, and attendance.</p>\r
                </div>\r
                <span class="material-symbols-outlined arrow">arrow_forward_ios</span>\r
            </button>\r
\r
            <button class="role-btn staff" onclick="selectRole('staff')">\r
                <div class="icon-circle">\r
                    <span class="material-symbols-outlined">badge</span>\r
                </div>\r
                <div class="role-info">\r
                    <h2>I am a Staff Member</h2>\r
                    <!-- (2026-07-13) Concise staff description; was verbose & uneven in height -->\r
                    <p>Access campus map, SOS tools, attendance, and support.</p>\r
                </div>\r
                <span class="material-symbols-outlined arrow">arrow_forward_ios</span>\r
            </button>\r
\r
            <button class="role-btn guardian" onclick="selectRole('guardian')">\r
                <div class="icon-circle">\r
                    <span class="material-symbols-outlined">family_restroom</span>\r
                </div>\r
                <div class="role-info">\r
                    <h2>I am a Parent / Guardian</h2>\r
                    <p>Monitor ward's safety and receive alerts.</p>\r
                </div>\r
                <span class="material-symbols-outlined arrow">arrow_forward_ios</span>\r
            </button>\r
        </div>\r
\r
        <div class="footer-note">\r
            <p>&copy; 2026 Securo Campus Safety Systems</p>\r
            <div class="pub-roleselection-u1">\r
                <!-- (2026-07-13) Remove app trailer link; was trailer link -->\r
                <a href="../public/about.html" class="pub-roleselection-u2">About Us</a>\r
                <span class="pub-roleselection-u3">•</span>\r
                <a href="../admin/admin.html?view=login" class="pub-roleselection-u4">Admin Terminal</a>\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->\r
`,c=t(),l=()=>a(()=>import(`./public-eEtm4NGb.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-role-selection`,dataPage:`role-selection`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));