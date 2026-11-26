const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-B9fwt6mq.js","./install-sw-DzuPi5je.js","./preload-helper-CGP3o08e.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css               */r();var o=e(),s=`<main class="page-shell">\r
        <div class="settings-stack">\r
            <section class="hero-card">\r
                <a id="settingsBackBtn" class="hero-back-btn" href="../student/student.html" aria-label="Go back">\r
                    <span class="material-symbols-outlined">arrow_back</span>\r
                </a>\r
                <div class="hero-cover"></div>\r
                <div class="hero-body">\r
                    <div class="settings-badge">\r
                        <span class="material-symbols-outlined pub-settings-u1">settings</span>\r
                    </div>\r
                    <div class="eyebrow">App Preferences</div>\r
                    <h1 class="hero-title">Settings</h1>\r
                    <p class="hero-copy">Manage your account preferences, privacy defaults, and quick access shortcuts in one place.</p>\r
                    <div class="hero-user" id="settingsUserMeta">Loading your account...</div>\r
                </div>\r
            </section>\r
\r
            <section class="settings-card">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title">Preferences</h2>\r
                        <p class="card-copy">These settings stay saved on this device for your Securo account.</p>\r
                    </div>\r
                    <div class="status-pill">\r
                        <span class="material-symbols-outlined pub-settings-u2">check_circle</span>\r
                        <span>Saved automatically</span>\r
                    </div>\r
                </div>\r
                <div class="settings-list">\r
                    <div class="setting-row">\r
                        <div class="setting-icon"><span class="material-symbols-outlined">notifications_active</span></div>\r
                        <div class="setting-copy">\r
                            <p class="setting-title">Notification sounds</p>\r
                            <p class="setting-desc">Keep alert sounds on for safety updates and important account activity.</p>\r
                        </div>\r
                        <label class="ios-switch">\r
                            <input type="checkbox" id="notifSoundsToggle">\r
                            <span class="ios-slider"></span>\r
                        </label>\r
                    </div>\r
                    <div class="setting-row">\r
                        <div class="setting-icon"><span class="material-symbols-outlined">support_agent</span></div>\r
                        <div class="setting-copy">\r
                            <p class="setting-title">Anonymous GAD chat by default</p>\r
                            <p class="setting-desc">Start customer support chats in anonymous mode unless you switch it off.</p>\r
                        </div>\r
                        <label class="ios-switch">\r
                            <input type="checkbox" id="anonymousSupportToggle">\r
                            <span class="ios-slider"></span>\r
                        </label>\r
                    </div>\r
                    <div class="setting-row" id="guardianShareRow">\r
                        <div class="setting-icon"><span class="material-symbols-outlined">group</span></div>\r
                        <div class="setting-copy">\r
                            <p class="setting-title">Default parent media access</p>\r
                            <p class="setting-desc">Set whether new vault media should be shared with parents or guardians by default.</p>\r
                        </div>\r
                        <label class="ios-switch">\r
                            <input type="checkbox" id="guardianMediaToggle">\r
                            <span class="ios-slider"></span>\r
                        </label>\r
                    </div>\r
                    <div class="setting-row">\r
                        <div class="setting-icon"><span class="material-symbols-outlined">location_on</span></div>\r
                        <div class="setting-copy">\r
                            <p class="setting-title">Location reminders</p>\r
                            <p class="setting-desc">Keep reminders on when live location is needed for guardians or emergency tools.</p>\r
                        </div>\r
                        <label class="ios-switch">\r
                            <input type="checkbox" id="locationReminderToggle">\r
                            <span class="ios-slider"></span>\r
                        </label>\r
                    </div>\r
                </div>\r
            </section>\r
\r
            <section class="settings-card">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title">Account Shortcuts</h2>\r
                        <p class="card-copy">Jump straight to the account screens you use most often.</p>\r
                    </div>\r
                </div>\r
                <div class="quick-links">\r
                    <a class="quick-link" href="../public/profile.html">\r
                        <span class="pub-settings-u3">\r
                            <span class="material-symbols-outlined">account_circle</span>\r
                            <span>Open profile</span>\r
                        </span>\r
                        <span class="material-symbols-outlined">chevron_right</span>\r
                    </a>\r
                    <a class="quick-link" id="dashboardShortcut" href="../student/student.html">\r
                        <span class="pub-settings-u3">\r
                            <span class="material-symbols-outlined">dashboard</span>\r
                            <span>Back to dashboard</span>\r
                        </span>\r
                        <span class="material-symbols-outlined">chevron_right</span>\r
                    </a>\r
                    <!-- (2026-07-13) Add About Us & Terms links in settings; was missing -->\r
                    <a class="quick-link" href="../public/about.html">\r
                        <span class="pub-settings-u3">\r
                            <span class="material-symbols-outlined">info</span>\r
                            <span>About Securo System</span>\r
                        </span>\r
                        <span class="material-symbols-outlined">chevron_right</span>\r
                    </a>\r
                    <a class="quick-link" href="../public/terms.html">\r
                        <span class="pub-settings-u3">\r
                            <span class="material-symbols-outlined">gavel</span>\r
                            <span>Terms & Conditions</span>\r
                        </span>\r
                        <span class="material-symbols-outlined">chevron_right</span>\r
                    </a>\r
                    <a class="quick-link" href="../public/profile.html#passwordPanel">\r
                        <span class="pub-settings-u3">\r
                            <span class="material-symbols-outlined">lock_reset</span>\r
                            <span>Change password</span>\r
                        </span>\r
                        <span class="material-symbols-outlined">chevron_right</span>\r
                    </a>\r
                </div>\r
            </section>\r
\r
            <!-- (2026-07-13) Add Delete Account card in settings; was missing -->\r
            <section class="settings-card pub-settings-u4" id="dangerZoneCard">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title pub-settings-u5">Delete Account</h2>\r
                        <p class="card-copy">Permanently erase your account, attendance, emergency records, and all personal data.</p>\r
                    </div>\r
                </div>\r
                <div class="pub-settings-u6">\r
                    <button id="openDeleteAccountBtn" type="button" class="pub-settings-u7">\r
                        <span class="material-symbols-outlined">delete_forever</span>\r
                        <span>Delete My Account</span>\r
                    </button>\r
                </div>\r
            </section>\r
        </div>\r
    </main>\r
\r
    <div class="modal-overlay pub-settings-u8" id="deleteAccountModal">\r
        <div class="pub-settings-u9">\r
            <div class="pub-settings-u10">\r
                <span class="material-symbols-outlined pub-settings-u11">warning</span>\r
            </div>\r
            <h3 class="pub-settings-u12">Delete Account Permanently</h3>\r
            <p class="pub-settings-u13">This action cannot be undone. All your profile information, safety logs, and linked account data will be permanently wiped. Enter your password to confirm:</p>\r
            <div class="pub-settings-u14">\r
                <!-- (2026-07-13) Add password eye toggle; was password input without toggle -->\r
                <input id="deletePasswordInput" type="password" placeholder="Enter current password" class="pub-settings-u15">\r
                <button type="button" data-password-target="deletePasswordInput" class="pub-settings-u16">\r
                    <span class="material-symbols-outlined pub-settings-u17">visibility</span>\r
                </button>\r
            </div>\r
            <div class="pub-settings-u18">\r
                <button id="cancelDeleteBtn" type="button" class="pub-settings-u19">Cancel</button>\r
                <button id="confirmDeleteBtn" type="button" class="pub-settings-u20">Confirm Delete</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->
`,c=t(),l=()=>a(()=>import(`./public-B9fwt6mq.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-settings`,dataPage:`settings`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));