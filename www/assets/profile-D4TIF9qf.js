const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-CBSv-6As.js","./install-sw-DAi8K7sx.js","./preload-helper-BXBgov45.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-BXBgov45.js";/* empty css               */r();var o=e(),s=`<button class="sos-fab" id="globalSosFab" type="button" title="Emergency SOS" onclick="window.location.href='../student/student.html?page=sos'">\r
        <span class="material-symbols-outlined">emergency</span>\r
    </button>\r
\r
    <main class="page-shell">\r
        <header class="profile-topbar">\r
            <a id="profileBackBtn" class="hero-back-btn" href="../student/student.html" aria-label="Go back">\r
                <span class="material-symbols-outlined">arrow_back</span>\r
            </a>\r
            <div class="profile-topbar-title">Profile</div>\r
        </header>\r
        <div class="profile-stack">\r
            <section class="hero-card">\r
                <div class="hero-cover"></div>\r
                <div class="hero-body">\r
                    <div class="avatar-wrap">\r
                        <div class="profile-avatar" id="profileAvatar">SU</div>\r
                        <button id="editAvatarBtn" class="avatar-edit-btn" type="button" aria-label="Change profile picture">\r
                            <span class="material-symbols-outlined">photo_camera</span>\r
                        </button>\r
                    </div>\r
                    <input id="avatarInput" type="file" accept="image/*" hidden>\r
                    <div class="hero-meta">\r
                        <div class="eyebrow" id="roleBadge">Student Account</div>\r
                        <div class="name-row">\r
                            <input id="profileNameInput" class="profile-name-input" type="text" value="Loading..." disabled>\r
                            <button id="editNameBtn" class="icon-edit-btn" type="button" aria-label="Edit name">\r
                                <span class="material-symbols-outlined">edit</span>\r
                            </button>\r
                        </div>\r
                        <p class="user-email" id="profileEmail">Loading account...</p>\r
                        <div class="hero-actions">\r
                            <button id="saveNameBtn" class="btn-primary" type="button" disabled>\r
                                <span class="material-symbols-outlined">save</span>\r
                                <span>Save Name</span>\r
                            </button>\r
                            <a href="../public/settings.html" class="btn-secondary">\r
                                <span class="material-symbols-outlined">settings</span>\r
                                <span>Settings</span>\r
                            </a>\r
                            <!-- (2026-07-13) Add id to dashboard link for role routing; was static student -->\r
                            <a href="../student/student.html" id="profileDashboardBtn" class="btn-secondary">\r
                                <span class="material-symbols-outlined">dashboard</span>\r
                                <span>Back to Dashboard</span>\r
                            </a>\r
                        </div>\r
                        <div class="hero-note" id="heroNote">\r
                            Your student ID stays locked after signup. Only your display name and password can be updated here.\r
                        </div>\r
                    </div>\r
                </div>\r
            </section>\r
\r
            <!-- (2026-07-13) Set id on profile card; was anonymous profile-card -->\r
            <section class="profile-card" id="myProfileCard">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title">My Profile</h2>\r
                        <p class="card-copy">Your core account details and permanent ID.</p>\r
                    </div>\r
                    <div class="id-chip" id="myIdChip">\r
                        <span class="material-symbols-outlined">badge</span>\r
                        <span id="myIdLabel">ID: --</span>\r
                    </div>\r
                </div>\r
                <div class="info-grid">\r
                    <div class="info-row" id="studentIdRow">\r
                        <div class="info-label">Student ID</div>\r
                        <div class="info-value" id="profileStudentId">Not linked</div>\r
                    </div>\r
                    <!-- (2026-07-13) Add id to section label for staff Department; was static -->\r
                    <div class="info-row" id="sectionRow">\r
                        <div class="info-label" id="sectionRowLabel">Section</div>\r
                        <div class="info-value" id="profileSectionValue">--</div>\r
                    </div>\r
                    <!-- (2026-07-13) Support personal email input and hide synthetic auth email; was static text -->\r
                    <div class="info-row" id="emailRow">\r
                        <div class="info-label">Email Address</div>\r
                        <div id="emailDisplayWrap" class="pub-profile-u1">\r
                            <div class="info-value pub-profile-u2" id="profileEmailValue">No email registered</div>\r
                            <button id="editEmailBtn" class="btn-secondary pub-profile-u3" type="button">\r
                                <span class="material-symbols-outlined pub-profile-u4">edit</span>\r
                                <span>Edit</span>\r
                            </button>\r
                        </div>\r
                        <div id="emailEditWrap" class="pub-profile-u5">\r
                            <input type="email" id="personalEmailInput" class="input-field pub-profile-u6" placeholder="Enter your email address">\r
                            <button id="savePersonalEmailBtn" class="btn-primary pub-profile-u7" type="button">Save</button>\r
                            <button id="cancelPersonalEmailBtn" class="btn-secondary pub-profile-u8" type="button">Cancel</button>\r
                        </div>\r
                    </div>\r
                    <div class="info-row" id="roleRow">\r
                        <div class="info-label">Role</div>\r
                        <div class="info-value" id="profileRoleValue">Student</div>\r
                    </div>\r
                    <div class="info-row is-hidden" id="guardianOfRow">\r
                        <div class="info-label">Guardian Of</div>\r
                        <div class="info-value" id="guardianOfValue">Pending child link</div>\r
                        <div class="helper-copy pub-profile-u9" id="guardianOfMeta">Student ID pending</div>\r
                    </div>\r
                </div>\r
            </section>\r
\r
            <section class="profile-card">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title" id="connectionsTitle">Parents / Guardians</h2>\r
                        <p class="card-copy" id="connectionsCopy">Pending requests and approved family links appear here.</p>\r
                    </div>\r
                </div>\r
                <div id="connectionsList" class="info-grid">\r
                    <div class="empty-state">Loading connections...</div>\r
                </div>\r
                <p class="helper-copy" id="connectionsHelper">\r
                    Students can have up to three parents or guardians. Guardian accounts can track one child at a time.\r
                </p>\r
            </section>\r
\r
            <section class="profile-card" id="guardianRequestCard">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title">Request a Parent / Guardian</h2>\r
                        <p class="card-copy">Enter the registered guardian name and email to link them to your account.</p>\r
                    </div>\r
                </div>\r
                <div class="input-stack">\r
                    <div class="search-field-wrap">\r
                        <input id="guardianRequestName" class="input-field" type="text" placeholder="Parent / Guardian full name" autocomplete="off">\r
                        <div id="guardianSearchResults" class="guardian-search-results is-hidden"></div>\r
                    </div>\r
                    <input id="guardianRequestEmail" class="input-field" type="email" placeholder="Registered guardian email">\r
                </div>\r
                <div class="section-actions pub-profile-u10">\r
                    <button id="guardianRequestBtn" class="btn-primary" type="button">\r
                        <span class="material-symbols-outlined">person_add</span>\r
                        <span>Send Parent Request</span>\r
                    </button>\r
                </div>\r
                <p class="helper-copy" id="guardianSearchHint">Search registered guardian names, then tap a result to fill the correct email.</p>\r
            </section>\r
\r
            <section class="profile-card">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title">Change Password</h2>\r
                        <p class="card-copy">Enter your current password first, then choose a new one.</p>\r
                    </div>\r
                    <button id="togglePasswordEditBtn" class="btn-secondary" type="button">\r
                        <span class="material-symbols-outlined">lock_reset</span>\r
                        <span>Edit</span>\r
                    </button>\r
                </div>\r
                <div class="password-panel disabled" id="passwordPanel">\r
                    <div class="input-stack">\r
                        <div class="password-input-wrap">\r
                            <input id="currentPasswordInput" class="input-field" type="password" placeholder="Current password" disabled>\r
                            <button class="password-toggle-btn" type="button" data-password-target="currentPasswordInput" aria-label="Show current password">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                        <div class="password-input-wrap">\r
                            <input id="newPasswordInput" class="input-field" type="password" placeholder="New password" disabled>\r
                            <button class="password-toggle-btn" type="button" data-password-target="newPasswordInput" aria-label="Show new password">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                        <div class="password-input-wrap">\r
                            <input id="confirmPasswordInput" class="input-field" type="password" placeholder="Confirm new password" disabled>\r
                            <button class="password-toggle-btn" type="button" data-password-target="confirmPasswordInput" aria-label="Show confirm password">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                </div>\r
                <div class="section-actions pub-profile-u10">\r
                    <button id="savePasswordBtn" class="btn-primary" type="button" disabled>\r
                        <span class="material-symbols-outlined">password</span>\r
                        <span>Save Password</span>\r
                    </button>\r
                </div>\r
                <p class="helper-copy">If Firebase asks for a recent login before saving, sign in again and retry.</p>\r
            </section>\r
\r
            <!-- (2026-07-13) Add account deletion section & modal; was missing -->\r
            <section class="profile-card danger-zone-card pub-profile-u11" id="dangerZoneCard">\r
                <div class="card-head">\r
                    <div>\r
                        <h2 class="card-title pub-profile-u12">Delete Account</h2>\r
                        <p class="card-copy">Permanently erase your account, attendance, and all personal safety data.</p>\r
                    </div>\r
                </div>\r
                <div class="section-actions pub-profile-u13">\r
                    <button id="openDeleteModalBtn" class="btn-danger pub-profile-u14" type="button">\r
                        <span class="material-symbols-outlined">delete_forever</span>\r
                        <span>Delete My Account</span>\r
                    </button>\r
                </div>\r
            </section>\r
\r
            <div class="footer-actions">\r
                <button id="logoutBtn" class="btn-danger" type="button">\r
                    <span class="material-symbols-outlined">logout</span>\r
                    <span>Sign Out</span>\r
                </button>\r
            </div>\r
        </div>\r
\r
        <!-- Status Toast -->\r
        <!-- (2026-07-13) Rename toast IDs to prevent statusModal ID clash; was statusTitle/Message -->\r
        <div id="statusToast" class="status-toast is-hidden">\r
            <span id="statusToastIcon" class="material-symbols-outlined status-toast-icon">check_circle</span>\r
            <div class="status-toast-content">\r
                <span id="statusToastTitle" class="status-toast-title">Success</span>\r
                <span id="statusToastMessage" class="status-toast-message">Action completed successfully.</span>\r
            </div>\r
        </div>\r
\r
        <!-- Guardian Context Menu -->\r
        <div id="guardianContextMenu" class="context-menu is-hidden">\r
            <button id="cancelGuardianBtn" class="context-menu-btn" type="button">\r
                <span class="material-symbols-outlined">person_remove</span>\r
                <span>Remove Guardian</span>\r
            </button>\r
        </div>\r
    </main>\r
\r
    <div class="status-modal" id="statusModal">\r
        <div class="status-card">\r
            <div id="statusIconWrap" class="status-icon-wrap success">\r
                <span class="material-symbols-outlined" id="statusIcon">check_circle</span>\r
            </div>\r
            <h3 id="statusTitle" class="status-title">Success</h3>\r
            <p id="statusMessage" class="status-msg">Your changes have been saved successfully.</p>\r
            <button id="statusOkBtn" class="status-btn" type="button">Continue</button>\r
        </div>\r
    </div>\r
\r
    <div class="status-modal" id="deleteAccountModal">\r
        <div class="status-card pub-profile-u15">\r
            <div class="status-icon-wrap error pub-profile-u16">\r
                <span class="material-symbols-outlined">warning</span>\r
            </div>\r
            <h3 class="status-title pub-profile-u17">Delete Account Permanently</h3>\r
            <p class="status-msg pub-profile-u18">This action cannot be undone. All your emergency records, attendance logs, and linked data will be deleted. Enter your password to confirm:</p>\r
            <div class="pub-profile-u19">\r
                <!-- (2026-07-13) Add password eye toggle; was password input without toggle -->\r
                <input id="deletePasswordConfirmInput" class="input-field pub-profile-u20" type="password" placeholder="Enter current password">\r
                <button class="password-toggle-btn pub-profile-u21" type="button" data-password-target="deletePasswordConfirmInput" aria-label="Show password">\r
                    <span class="material-symbols-outlined">visibility</span>\r
                </button>\r
            </div>\r
            <div class="pub-profile-u22">\r
                <button id="cancelDeleteBtn" class="btn-secondary pub-profile-u23" type="button">Cancel</button>\r
                <button id="confirmDeleteBtn" class="btn-danger pub-profile-u24" type="button">Confirm Delete</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->\r
`,c=t(),l=()=>a(()=>import(`./public-CBSv-6As.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-profile`,dataPage:`profile`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));