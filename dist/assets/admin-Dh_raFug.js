const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./admin-BQxehXiB.js","./install-sw-ZnPeoSkn.js","./preload-helper-BXBgov45.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-BXBgov45.js";r();var o=e(),s=`<!-- (2026-07-13) Consolidated admin login, dashboard & analytics views; was 3 files -->\r
<section id="adminLoginSection" class="admin-view-section is-hidden">\r
<div class="login-container">\r
        <div class="header">\r
            <div class="logo-wrap">\r
                <span class="material-symbols-outlined">admin_panel_settings</span>\r
            </div>\r
            <h1>Command Center</h1>\r
            <p class="subtitle">Official Admin Authentication</p>\r
        </div>\r
\r
        <div id="errorMessage" class="error-message"></div>\r
\r
        <form id="adminLoginForm">\r
            <div class="form-group">\r
                <label for="adminEmail">Administrator Email</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined">mail</span>\r
                    <!-- (2026-07-13) Add admin email autocomplete and placeholder; was admin@securo.app -->\r
                    <input type="email" id="adminEmail" placeholder="Enter administrator email" autocomplete="username" required>\r
                </div>\r
            </div>\r
\r
            <div class="form-group">\r
                <label for="password">Security Password</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined">lock</span>\r
                    <!-- (2026-07-13) Use masked text to suppress breach alert; was pass input -->\r
                    <input type="text" id="password" class="secure-mask-input" placeholder="Enter password" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" required>\r
                    <button type="button" class="btn adm-u1" data-password-target="password">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <button type="submit" id="submitBtn" class="login-btn">\r
                <span id="submitBtnText">Access Command Center</span>\r
                <div class="spinner" id="spinner"></div>\r
            </button>\r
        </form>\r
\r
        <!-- (2026-07-13) Remove public admin registration; was toggle register account -->\r
        <a href="../index.html" class="back-link">Return to Student Application</a>\r
    </div>\r
</section>\r
<div id="adminDashboardShell" class="admin-view-section">\r
<div class="toast-stack" id="toastStack" aria-live="polite"></div>\r
\r
    <div class="admin-shell">\r
        <div class="glass-shell">\r
            <header class="topbar">\r
                <!-- (2026-07-13) Logo switches to Command Stats tab; was history back -->\r
                <div class="brand-wrap">\r
                    <a href="javascript:void(0)" id="adminHeaderLogo" title="Command Stats" class="adm-u2">\r
                        <img src="../assets/images/logo with text.png" alt="Securo" class="adm-u3">\r
                    </a>\r
                    <!-- (2026-07-13) Enterprise Command Center header branding; was Sora serif -->\r
                    <div class="adm-u4">\r
                        <h1 class="adm-u5">Command Center</h1>\r
                        <p class="adm-u6">Campus safety operations &amp; dispatch management</p>\r
                    </div>\r
                </div>\r
                <div class="topbar-actions">\r
                    <!-- (2026-07-13) Command Center status & logout header; was static live chip -->\r
                    <div id="topbarSosAlertBadge" class="capsule adm-u7">\r
                        <span class="signal-dot adm-u8"></span>\r
                        <span id="topbarSosCountText">0 Critical SOS</span>\r
                    </div>\r
                    <div class="signal-chip">\r
                        <span class="signal-dot"></span>\r
                        <span>Terminal Live</span>\r
                    </div>\r
                    <a href="../public/about.html" class="ghost-btn adm-u9">\r
                        <span class="material-symbols-outlined adm-u10">info</span>\r
                        <span>About Us</span>\r
                    </a>\r
                    <!-- (2026-07-13) Soft red rounded logout button from images 3 & 4; was square grey -->\r
                    <button class="action-btn adm-u11" id="topbarDirectLogoutBtn" type="button" title="Sign out of command center">\r
                        <span class="material-symbols-outlined adm-u12">logout</span>\r
                        <span>Log Out</span>\r
                    </button>\r
                    <div class="profile-chip" id="adminProfileChip" aria-label="Admin menu">\r
                        <span id="adminInitials">AD</span>\r
                        <div class="profile-dropdown" id="adminProfileDropdown">\r
                            <div class="adm-u13">\r
                                <div id="adminDropdownName" class="adm-u14">Administrator</div>\r
                                <div class="adm-u15">ADMIN COMMAND ACCOUNT</div>\r
                            </div>\r
                            <div class="dropdown-divider"></div>\r
                            <a href="../public/about.html" class="dropdown-item">\r
                                <span class="material-symbols-outlined">info</span>\r
                                <span>About Securo</span>\r
                            </a>\r
                            <a href="../public/settings.html" class="dropdown-item">\r
                                <span class="material-symbols-outlined">settings</span>\r
                                <span>Settings</span>\r
                            </a>\r
                            <button class="dropdown-item logout" id="adminLogoutBtn" type="button">\r
                                <span class="material-symbols-outlined">logout</span>\r
                                <span>Log Out</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                </div>\r
            </header>\r
\r
            <div class="dashboard-grid">\r
                <aside class="sidebar">\r
                    <div class="sidebar-inner">\r
                        <!-- (2026-07-13) Command Center sidebar navigation; was simulator tab -->\r
                        <div class="sidebar-label">Operations</div>\r
                        <div class="nav-stack">\r
                            <button class="tab-btn active" data-tab="stats">\r
                                <span class="material-symbols-outlined">monitoring</span>\r
                                <span>Command Stats</span>\r
                            </button>\r
                            <button class="tab-btn" data-tab="sos">\r
                                <span class="material-symbols-outlined">crisis_alert</span>\r
                                <span>Live SOS Queue</span>\r
                                <span id="sidebarSosCounter" class="capsule adm-u16">0</span>\r
                            </button>\r
                            <button class="tab-btn" data-tab="reports">\r
                                <span class="material-symbols-outlined">assessment</span>\r
                                <span>Reports & Export</span>\r
                            </button>\r
                        </div>\r
\r
                        <div class="sidebar-label adm-u17">Safety Desk</div>\r
                        <div class="nav-stack">\r
                            <button class="tab-btn" data-tab="users">\r
                                <span class="material-symbols-outlined">manage_accounts</span>\r
                                <span>User Directory</span>\r
                            </button>\r
                            <!-- (2026-07-13) Add Digital Vault tab button in sidebar; was absent -->\r
                            <button class="tab-btn" data-tab="vault">\r
                                <span class="material-symbols-outlined">inventory_2</span>\r
                                <span>Digital Vault</span>\r
                                <span id="sidebarVaultCounter" class="capsule adm-u18">0</span>\r
                            </button>\r
                            <button class="tab-btn" data-tab="gad">\r
                                <span class="material-symbols-outlined">campaign</span>\r
                                <span>GAD Bulletins</span>\r
                            </button>\r
                            <button class="tab-btn" data-tab="messages">\r
                                <span class="material-symbols-outlined">chat</span>\r
                                <!-- (2026-07-13) Rename nav item to Messages; was Student Messaging -->\r
                                <span>Messages</span>\r
                                <span id="sidebarMsgCounter" class="capsule adm-u19">0</span>\r
                            </button>\r
                        </div>\r
\r
                        <div class="adm-u20">\r
                            <button id="sidebarLogoutBtn" class="tab-btn adm-u21" type="button">\r
                                <span class="material-symbols-outlined adm-u22">logout</span>\r
                                <span>Exit Command Center</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                </aside>\r
\r
                <main class="main-panel">\r
                    <section class="admin-section active" id="sec-stats">\r
                        <div class="stats-grid">\r
                            <div class="metric-card">\r
                                <div class="metric-label">Total Users</div>\r
                                <!-- (2026-07-13) Placeholder dash during initial load; was static 0 -->\r
                                <div class="metric-value" id="metricUsers">--</div>\r
                                <div class="metric-sub">Visible accounts</div>\r
                            </div>\r
                            <div class="metric-card">\r
                                <div class="metric-label">Students</div>\r
                                <div class="metric-value" id="metricStudents">--</div>\r
                                <div class="metric-sub">Student profiles</div>\r
                            </div>\r
                            <div class="metric-card">\r
                                <div class="metric-label">Guardians</div>\r
                                <div class="metric-value" id="metricGuardians">--</div>\r
                                <div class="metric-sub">Guardian profiles</div>\r
                            </div>\r
                            <div class="metric-card">\r
                                <div class="metric-label">Conversations</div>\r
                                <div class="metric-value" id="metricThreads">--</div>\r
                                <div class="metric-sub">Support threads</div>\r
                            </div>\r
                        </div>\r
\r
                        <div class="chart-grid">\r
                            <div class="panel-card chart-card">\r
                                <div>\r
                                    <div class="eyebrow">Roles</div>\r
                                    <h2 class="chart-title">User Distribution</h2>\r
                                    <p class="chart-copy">A quick view of student, guardian, and admin account balance.</p>\r
                                </div>\r
                                <div class="role-chart-wrap">\r
                                    <div class="role-chart" id="roleChart">\r
                                        <div class="role-chart-center">\r
                                            <div>\r
                                                <strong id="roleChartTotal">--</strong>\r
                                                <span class="adm-u23">accounts</span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
                                    <div class="legend-list" id="roleLegend"></div>\r
                                </div>\r
                            </div>\r
                            <div class="panel-card chart-card">\r
                                <div>\r
                                    <div class="eyebrow">Reach</div>\r
                                    <h2 class="chart-title">Platform Activity</h2>\r
                                    <p class="chart-copy">Visual reach snapshot for users, GAD posts, and support conversations.</p>\r
                                </div>\r
                                <div class="bar-list" id="statsBarList"></div>\r
                            </div>\r
                            <div class="panel-card chart-card readable-card">\r
                                <div>\r
                                    <div class="eyebrow">Reporters</div>\r
                                    <h2 class="chart-title">Most Active Reporters</h2>\r
                                    <p class="chart-copy">Students and staff who sent the most SOS or evidence reports.</p>\r
                                </div>\r
                                <div class="table-list" id="reporterStatsList"></div>\r
                            </div>\r
                            <div class="panel-card chart-card readable-card">\r
                                <div>\r
                                    <div class="eyebrow">Notifications</div>\r
                                    <h2 class="chart-title">Admin Notification History</h2>\r
                                    <p class="chart-copy">Recent system-facing account notifications for the admin account.</p>\r
                                </div>\r
                                <div class="table-list" id="adminNotificationHistory"></div>\r
                            </div>\r
                        </div>\r
                        <!-- (2026-07-13) Inline cache hydration for stats; was delayed blank DOM -->\r
                        \r
\r
                        <div class="panel-card">\r
                            <div class="accounts-head">\r
                                <div>\r
                                    <div class="eyebrow">Accounts</div>\r
                                    <h2 class="chart-title">Account Snapshot</h2>\r
                                    <p class="chart-copy">Quick account overview. Use the Users tab for editing, adding, and deleting profiles.</p>\r
                                </div>\r
                                <input type="search" id="statsUserSearch" class="glass-input search-input" placeholder="Search users, IDs, or email">\r
                            </div>\r
                            <div class="table-list adm-u24" id="statsUserList"></div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- (2026-07-13) Add dedicated SOS Triggers tab and table; was stats map only -->\r
                    <section class="admin-section" id="sec-sos">\r
                        <!-- (2026-07-13) 70/30 split full height map & recent SOS sidebar; was 400px -->\r
                        <div class="sos-dashboard-split adm-u25">\r
                            <div class="panel-card chart-card adm-u26">\r
                                <div class="adm-u27">\r
                                    <div>\r
                                        <div class="eyebrow adm-u28">INCIDENT INTELLIGENCE</div>\r
                                        <h2 class="chart-title adm-u29">Campus SOS Hotspots & Incident Map</h2>\r
                                        <p class="chart-copy">Real-time emergency signal visualization with campus geofence perimeter and facilities.</p>\r
                                    </div>\r
                                    <div class="adm-u30">\r
                                        <button class="action-btn adm-u31" id="btnEditGeofence" type="button">\r
                                            <span class="material-symbols-outlined adm-u32">edit_location_alt</span>\r
                                            <span>Edit Geofence & Markers</span>\r
                                        </button>\r
                                        <button class="action-btn adm-u33" id="btnSaveGeofence" type="button">\r
                                            <span class="material-symbols-outlined adm-u34">cloud_sync</span>\r
                                            <span>Save & Sync Database</span>\r
                                        </button>\r
                                        <button class="action-btn adm-u35" id="btnResetGeofence" type="button">\r
                                            <span class="material-symbols-outlined adm-u34">restart_alt</span>\r
                                            <span>Reset</span>\r
                                        </button>\r
                                        <span class="capsule adm-u36">\r
                                            <span class="material-symbols-outlined adm-u10">crisis_alert</span>\r
                                            <span id="adminSosCountBadge">0 SOS Triggers</span>\r
                                        </span>\r
                                    </div>\r
                                </div>\r
                                <div id="adminSosMap" class="adm-u37"></div>\r
                            </div>\r
\r
                            <div class="panel-card chart-card adm-u26">\r
                                <div class="adm-u38">\r
                                    <div>\r
                                        <div class="eyebrow adm-u28">ACTIVE SIGNALS</div>\r
                                        <h2 class="chart-title adm-u29">Recent SOS Reporters</h2>\r
                                        <p class="chart-copy">Students & staff distress logs with report frequencies.</p>\r
                                    </div>\r
                                    <span class="capsule adm-u39" id="adminRecentReportersCount">0 Users</span>\r
                                </div>\r
                                <div id="adminRecentSosReporters" class="adm-u40"></div>\r
                            </div>\r
                        </div>\r
\r
                        <div class="panel-card">\r
                            <div class="accounts-head">\r
                                <div>\r
                                    <div class="eyebrow adm-u28">INCIDENT LOGS</div>\r
                                    <h2 class="chart-title">SOS Triggers & Emergency History</h2>\r
                                    <p class="chart-copy">Verified reporter identities, student numbers, incident coordinates, and map links.</p>\r
                                </div>\r
                                <div class="section-actions">\r
                                    <input type="search" id="sosLogSearch" class="glass-input search-input" placeholder="Search reporter name, ID, or location">\r
                                </div>\r
                            </div>\r
                            <div class="users-table-head adm-u41">\r
                                <span>Reporter</span>\r
                                <span>Role / ID</span>\r
                                <span>Location & GPS</span>\r
                                <span>Time Triggered</span>\r
                                <span class="adm-u42">Actions</span>\r
                            </div>\r
                            <div class="table-list adm-u43" id="sosLogsTable"></div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- (2026-07-13) Fix directory header layout & wrap actions; was unclosed div -->\r
                    <section class="admin-section" id="sec-users">\r
                        <div class="panel-card">\r
                            <div class="accounts-head">\r
                                <div>\r
                                    <div class="eyebrow">Directory</div>\r
                                    <h2 class="chart-title">User Directory</h2>\r
                                    <p class="chart-copy">Review users first, then use the 3-dot action button to edit each account in a modal.</p>\r
                                </div>\r
                                <div class="section-actions adm-u44">\r
                                    <input type="search" id="managementUserSearch" class="glass-input search-input adm-u45" placeholder="Search users (students, parents, staff)...">\r
                                    <!-- (2026-07-13) Add directory role filter chips for user and parent; was absent -->\r
                                    <div class="user-role-filter-chips adm-u46">\r
                                        <!-- (2026-07-13) User and parent filter chips; was absent -->\r
                                        <button type="button" class="user-filter-btn active" data-user-filter="all">All</button>\r
                                        <button type="button" class="user-filter-btn" data-user-filter="student">Students</button>\r
                                        <button type="button" class="user-filter-btn" data-user-filter="guardian">Parents</button>\r
                                        <button type="button" class="user-filter-btn" data-user-filter="staff">Staff</button>\r
                                    </div>\r
                                    <!-- (2026-07-13) Add bulk user import button; was single user create only -->\r
                                    <button class="ghost-btn adm-u47" id="bulkImportUsersBtn" type="button">\r
                                        <span class="material-symbols-outlined">upload_file</span>\r
                                        <span>Bulk Import</span>\r
                                    </button>\r
                                    <button class="primary-btn" id="createUserBtn" type="button">\r
                                        <span class="material-symbols-outlined">person_add</span>\r
                                        <span>Add User</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
                            <div class="users-table-head adm-u17">\r
                                <span>User</span>\r
                                <span>Role</span>\r
                                <span>Email / ID</span>\r
                                <span class="adm-u42">More</span>\r
                            </div>\r
                            <div class="users-table" id="managementUserList"></div>\r
                        </div>\r
                    </section>\r
\r
                    <section class="admin-section" id="sec-gad">\r
                        <div class="panel-card">\r
                            <div class="section-head">\r
                                <div>\r
                                    <div class="eyebrow">Post</div>\r
                                    <h2 id="gadComposerTitle">New GAD Post</h2>\r
                                    <p id="gadComposerCopy">Publishes to the GAD feed.</p>\r
                                </div>\r
                                <div class="section-actions">\r
                                    <span class="counter-pill" id="gadCounter">0 / 500</span>\r
                                </div>\r
                            </div>\r
                            <div class="composer-grid">\r
                                <div class="announcement-input-shell">\r
                                    <div class="announcement-input-meta">\r
                                        <span class="announcement-input-label">Announcement Body</span>\r
                                        <span class="announcement-input-hint">Clear, short, and official</span>\r
                                    </div>\r
                                    <textarea id="gadPostText" class="glass-textarea announcement-textarea" placeholder="Write the official announcement here..." maxlength="500"></textarea>\r
                                </div>\r
                                <input id="gadImageInput" type="file" accept="image/*" hidden>\r
                                <div class="image-preview-card" id="gadImagePreviewCard">\r
                                    <img id="gadImagePreview" alt="GAD post preview">\r
                                    <button class="ghost-btn" id="removeGadImageBtn" type="button">\r
                                        <span class="material-symbols-outlined">close</span>\r
                                        <span>Remove Image</span>\r
                                    </button>\r
                                </div>\r
                                <div class="composer-toolbar">\r
                                    <p class="helper-text">12-500 characters.</p>\r
                                    <button class="ghost-btn adm-u48" id="cancelGadEditBtn" type="button">\r
                                        <span class="material-symbols-outlined">close</span>\r
                                        <span>Cancel Edit</span>\r
                                    </button>\r
                                    <button class="ghost-btn" id="attachGadImageBtn" type="button">\r
                                        <span class="material-symbols-outlined">image</span>\r
                                        <span>Attach Image</span>\r
                                    </button>\r
                                    <button class="primary-btn" id="postGadBtn">\r
                                        <span class="material-symbols-outlined">send</span>\r
                                        <span>Publish</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
                        </div>\r
\r
                        <div class="panel-card">\r
                            <div class="section-head">\r
                                <div>\r
                                    <div class="eyebrow">Feed</div>\r
                                    <h2>GAD Posts</h2>\r
                                    <p>Manage posts and see how many users they can reach.</p>\r
                                </div>\r
                                <div class="section-actions">\r
                                    <input type="search" id="gadSearch" class="glass-input search-input" placeholder="Search GAD posts">\r
                                </div>\r
                            </div>\r
                            <div class="hero-grid adm-u49">\r
                                <div class="metric-card">\r
                                    <div class="metric-label">Posts</div>\r
                                    <div class="metric-value" id="metricPosts">0</div>\r
                                    <div class="metric-sub">Published bulletins</div>\r
                                </div>\r
                                <div class="metric-card">\r
                                    <div class="metric-label">Users Reached</div>\r
                                    <div class="metric-value" id="metricGadReach">0</div>\r
                                    <div class="metric-sub">Registered audience</div>\r
                                </div>\r
                                <div class="metric-card">\r
                                    <div class="metric-label">Engaged Users</div>\r
                                    <div class="metric-value" id="metricGadEngaged">0</div>\r
                                    <div class="metric-sub">Unique likes recorded</div>\r
                                </div>\r
                            </div>\r
                            <div class="table-list" id="gadList"></div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- (2026-07-13) Dispatch messaging shell & controls; was plain flat list -->\r
                    <section class="admin-section" id="sec-messages">\r
                        <div class="panel-card chat-panel messages-shell">\r
                            <div class="messages-sidebar">\r
                                <div class="messages-sidebar-head">\r
                                    <div class="adm-u50">\r
                                        <div>\r
                                            <h3 class="adm-u51">\r
                                                <span>Inquiries & Chats</span>\r
                                                <!-- (2026-07-13) Soft round count badge from image 3; was rectangular capsule -->\r
                                                <span id="threadCountBadge" class="adm-u52">0</span>\r
                                            </h3>\r
                                            <p class="thread-hint adm-u53">Direct safety & counseling channels</p>\r
                                        </div>\r
                                        <!-- (2026-07-13) Add New Message compose button next to refresh; was refresh only -->\r
                                        <div class="admin-msg-head-actions">\r
                                            <button id="btnAdminNewMessage" class="admin-new-msg-btn" type="button" title="Start or continue a conversation">\r
                                                <span class="material-symbols-outlined">edit_square</span>\r
                                                <span>New</span>\r
                                            </button>\r
                                            <button id="btnRefreshThreads" class="icon-btn adm-u54" type="button" title="Refresh conversations">\r
                                                <span class="material-symbols-outlined adm-u10">refresh</span>\r
                                            </button>\r
                                        </div>\r
                                    </div>\r
                                    <div class="messages-search-box">\r
                                        <span class="material-symbols-outlined adm-u55">search</span>\r
                                        <input type="text" id="threadSearchInput" placeholder="Search by student or message...">\r
                                    </div>\r
                                    <div class="messages-filter-chips">\r
                                        <button type="button" class="msg-filter-chip active" data-msg-filter="all">All</button>\r
                                        <button type="button" class="msg-filter-chip" data-msg-filter="unread">Unread</button>\r
                                        <button type="button" class="msg-filter-chip" data-msg-filter="student">Students</button>\r
                                        <button type="button" class="msg-filter-chip" data-msg-filter="guardian">Guardians</button>\r
                                        <!-- (2026-07-13) Add Staff filter chip in Messages; was Students/Guardians -->\r
                                        <button type="button" class="msg-filter-chip" data-msg-filter="staff">Staff</button>\r
                                    </div>\r
                                </div>\r
                                <div id="threadList" class="messages-thread-list">\r
                                </div>\r
                            </div>\r
\r
                            <!-- (2026-07-13) Admin New Message recipient picker modal; was absent -->\r
                            <div id="adminNewMsgModal" class="admin-new-msg-modal" aria-hidden="true">\r
                                <div class="admin-new-msg-card" role="dialog" aria-modal="true">\r
                                    <div class="admin-new-msg-head">\r
                                        <div>\r
                                            <h3>New Message</h3>\r
                                            <p>Search any student, staff, or parent to start or continue a chat</p>\r
                                        </div>\r
                                        <button type="button" id="closeAdminNewMsgBtn" class="icon-btn" aria-label="Close">\r
                                            <span class="material-symbols-outlined">close</span>\r
                                        </button>\r
                                    </div>\r
                                    <div class="admin-new-msg-search">\r
                                        <span class="material-symbols-outlined">search</span>\r
                                        <input type="text" id="adminNewMsgSearchInput" placeholder="Search by name, ID number, or email..." autocomplete="off">\r
                                    </div>\r
                                    <!-- Recipient role filter chips -->\r
                                    <div class="admin-new-msg-chips" id="adminNewMsgChips">\r
                                        <button type="button" class="admin-new-msg-chip active" data-newmsg-role="all">All</button>\r
                                        <button type="button" class="admin-new-msg-chip" data-newmsg-role="student">Students</button>\r
                                        <button type="button" class="admin-new-msg-chip" data-newmsg-role="staff">Staff</button>\r
                                        <button type="button" class="admin-new-msg-chip" data-newmsg-role="guardian">Parents</button>\r
                                    </div>\r
                                    <div id="adminNewMsgList" class="admin-new-msg-list"></div>\r
                                </div>\r
                            </div>\r
                            <div class="messages-main">\r
                                <div id="chatHeader" class="messages-header">\r
                                    <div class="messages-header-left">\r
                                        <!-- (2026-07-13) Add mobile back button for thread list navigation; was absent -->\r
                                        <button id="btnMobileBackToThreads" type="button" class="mobile-chat-back-btn" title="Back to conversations">\r
                                            <span class="material-symbols-outlined">arrow_back</span>\r
                                        </button>\r
                                        <div id="activeUserAvatar" class="thread-avatar adm-u56">\r
                                            ?\r
                                            <span id="activeUserBeacon" class="adm-u57"></span>\r
                                        </div>\r
                                        <div class="messages-header-info">\r
                                            <div class="messages-header-title-row">\r
                                                <span id="activeUserName" class="messages-header-name">Select a conversation</span>\r
                                                <span id="activeUserRoleBadge" class="role-pill student adm-u58">Student</span>\r
                                                <span id="activeUserIdTag" class="adm-u59"></span>\r
                                            </div>\r
                                            <div class="messages-header-meta">\r
                                                <span id="activeUserStatus" class="messages-header-status adm-u60">\r
                                                    <span class="signal-dot adm-u61"></span>\r
                                                    <span>Dispatch Channel Ready</span>\r
                                                </span>\r
                                                <span id="activeUserEmailText" class="adm-u62"></span>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
                                    <div class="messages-header-actions adm-u48" id="chatHeaderActions">\r
                                        <button id="btnToggleStudentDossier" class="action-btn adm-u63" type="button" title="View Student Dossier & Info">\r
                                            <span class="material-symbols-outlined adm-u32">badge</span>\r
                                            <span>User Info</span>\r
                                        </button>\r
                                        <button id="btnHeaderDeleteThread" class="action-btn adm-u64" type="button" title="Delete this conversation">\r
                                            <span class="material-symbols-outlined adm-u34">delete</span>\r
                                            <span>Delete</span>\r
                                        </button>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Student Quick Dossier Drawer / Info Strip -->\r
                                <div id="activeUserDossierPanel" class="adm-u65">\r
                                    <div class="adm-u66">\r
                                        <div>\r
                                            <span class="adm-u67">Student / Account ID</span>\r
                                            <div id="dossierStudentId" class="adm-u68">-</div>\r
                                        </div>\r
                                        <div>\r
                                            <span class="adm-u67">Email Address</span>\r
                                            <div id="dossierEmail" class="adm-u69">-</div>\r
                                        </div>\r
                                        <div>\r
                                            <span class="adm-u67">Emergency SOS Reports</span>\r
                                            <div id="dossierSosCount" class="adm-u70">0 logged</div>\r
                                        </div>\r
                                        <div>\r
                                            <span class="adm-u67">Linked Guardian(s)</span>\r
                                            <div id="dossierGuardianInfo" class="adm-u68">None linked</div>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
\r
                                <div id="adminChatMessages" class="messages-body">\r
                                    <div class="messages-empty adm-u71" id="chatEmptyPlaceholder">\r
                                        <div class="adm-u72">\r
                                            <span class="material-symbols-outlined adm-u73">chat_bubble</span>\r
                                        </div>\r
                                        <h4 class="adm-u74">Direct Dispatch Messaging</h4>\r
                                        <p class="adm-u75">Select a student or guardian from the conversation directory to initiate secure safety communications.</p>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Quick Canned Dispatch Templates -->\r
                                <div class="messages-canned-bar adm-u48" id="cannedResponseBar">\r
                                    <span class="adm-u76">Quick Dispatch:</span>\r
                                    <button type="button" class="canned-chip" data-canned="Campus Security personnel have been dispatched to your reported coordinates. Please stay where you are.">🚨 Unit Dispatched</button>\r
                                    <button type="button" class="canned-chip" data-canned="Please share your current building, floor, or nearby landmark so responders can reach you immediately.">📍 Send Coordinates</button>\r
                                    <button type="button" class="canned-chip" data-canned="Please remain in a secure, well-lit location and lock the entrance if possible until officers arrive.">🛡️ Secure In Place</button>\r
                                    <button type="button" class="canned-chip" data-canned="Our command team received your report. Can you confirm if anyone is currently injured or in immediate danger?">⚠️ Confirm Danger Status</button>\r
                                    <button type="button" class="canned-chip" data-canned="Thank you for confirming your safety. This support inquiry has been verified and marked resolved.">✅ Incident Resolved</button>\r
                                </div>\r
\r
                                <div class="messages-composer">\r
                                    <input type="text" id="adminChatInput" class="glass-input adm-u77" placeholder="Type a message or click a quick dispatch template... (Press Enter to send)" disabled>\r
                                    <button id="adminSendBtn" class="primary-btn adm-u78" disabled>\r
                                        <span class="material-symbols-outlined">send</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- (2026-07-13) Soft rounded Digital Vault gallery section; was boxy grey -->\r
                    <section class="admin-section" id="sec-vault">\r
                        <div class="panel-card">\r
                            <div class="card-head adm-u79">\r
                                <div>\r
                                    <div class="capsule adm-u80">DIGITAL VAULT REPOSITORY</div>\r
                                    <h2 class="adm-u81">Student Uploaded Evidence &amp; Media</h2>\r
                                    <p class="adm-u82">All photos, images, and evidence media stored in the digital vault by students</p>\r
                                </div>\r
                                <div class="adm-u83">\r
                                    <button class="ghost-btn adm-u77" id="btnRefreshVault" type="button" title="Synchronize digital vault evidence">\r
                                        <span class="material-symbols-outlined">sync</span>\r
                                        <span>Sync Vault</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Filter & Search Bar -->\r
                            <div class="adm-u84">\r
                                <div class="adm-u85">\r
                                    <span class="material-symbols-outlined adm-u86">search</span>\r
                                    <input type="text" id="vaultSearchInput" class="glass-input adm-u87" placeholder="Search by student name, ID, or location...">\r
                                </div>\r
                                <div class="adm-u88">\r
                                    <button class="filter-chip vault-filter-chip active" data-vault-filter="all" type="button">All Media</button>\r
                                    <button class="filter-chip vault-filter-chip" data-vault-filter="image" type="button">Images</button>\r
                                    <button class="filter-chip vault-filter-chip" data-vault-filter="video" type="button">Videos</button>\r
                                </div>\r
                                <div class="adm-u89">\r
                                    Showing <strong id="vaultCountLabel" class="adm-u90">0</strong> items\r
                                </div>\r
                            </div>\r
\r
                            <!-- Vault Evidence Grid -->\r
                            <div class="vault-evidence-grid" id="adminVaultGrid">\r
                                <div class="messages-empty adm-u91">\r
                                    <span class="material-symbols-outlined adm-u92">photo_library</span>\r
                                    <p class="adm-u93">No student vault media uploaded yet.</p>\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- (2026-07-13) Add Daily Reports & Excel generation; was basic audit view -->\r
                    <section class="admin-section" id="sec-reports">\r
                        <div class="panel-card adm-u94">\r
                            <div class="card-head adm-u95">\r
                                <div>\r
                                    <div class="eyebrow adm-u96">Command Center Audits & Compliance</div>\r
                                    <h2 class="chart-title adm-u97">Daily Safety & Incident Reports</h2>\r
                                    <p class="chart-copy adm-u98">Generate official daily reports and downloadable Excel (.xlsx) workbooks from live Firebase records.</p>\r
                                </div>\r
                                <div class="adm-u99">\r
                                    <button class="action-btn adm-u100" id="btnDownloadExcelReport" type="button">\r
                                        <span class="material-symbols-outlined adm-u101">table_view</span>\r
                                        <span>Download Excel (.xlsx)</span>\r
                                    </button>\r
                                    <button class="action-btn adm-u102" id="btnDownloadCsvReport" type="button">\r
                                        <span class="material-symbols-outlined adm-u10">download</span>\r
                                        <span>Export CSV</span>\r
                                    </button>\r
                                    <button class="action-btn adm-u103" id="btnPrintDailyReport" type="button">\r
                                        <span class="material-symbols-outlined adm-u10">print</span>\r
                                        <span>Print</span>\r
                                    </button>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Date Filter, Search and Category Filter Toolbar -->\r
                            <div class="adm-u104">\r
                                <div>\r
                                    <label for="reportDatePicker" class="adm-u105">Select Report Date</label>\r
                                    <input type="date" id="reportDatePicker" class="glass-input adm-u106">\r
                                </div>\r
                                <div>\r
                                    <label for="reportCategoryFilter" class="adm-u105">Record Category</label>\r
                                    <select id="reportCategoryFilter" class="glass-input adm-u107">\r
                                        <option value="all">All Records (Comprehensive Daily)</option>\r
                                        <!-- (2026-07-13) Add incident evidence records category; was absent -->\r
                                        <option value="incident">Evidence Vault Incidents</option>\r
                                        <option value="sos">Emergency SOS Incidents</option>\r
                                        <option value="attendance">Campus Attendance Logs</option>\r
                                        <option value="gad">GAD Safety Posts</option>\r
                                    </select>\r
                                </div>\r
                                <div class="adm-u108">\r
                                    <label for="reportSearchInput" class="adm-u105">Search Daily Records</label>\r
                                    <div class="adm-u56">\r
                                        <span class="material-symbols-outlined adm-u109">search</span>\r
                                        <input type="text" id="reportSearchInput" class="glass-input adm-u110" placeholder="Search by Student ID, Student Name, Location, or Status...">\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Daily Summary Metrics Cards -->\r
                            <div class="adm-u111">\r
                                <div class="adm-u112">\r
                                    <div class="adm-u113">Total Daily Records</div>\r
                                    <div id="metricDailyTotal" class="adm-u114">0</div>\r
                                </div>\r
                                <div class="adm-u115">\r
                                    <div class="adm-u116">SOS Emergencies</div>\r
                                    <div id="metricDailySos" class="adm-u117">0</div>\r
                                </div>\r
                                <div class="adm-u118">\r
                                    <div class="adm-u119">Attendance Logs</div>\r
                                    <div id="metricDailyAttendance" class="adm-u120">0</div>\r
                                </div>\r
                                <div class="adm-u121">\r
                                    <div class="adm-u122">Active / Pending</div>\r
                                    <div id="metricDailyActive" class="adm-u123">0</div>\r
                                </div>\r
                            </div>\r
                        </div>\r
\r
                        <!-- Daily Separated Record Dossier Panel -->\r
                        <div class="panel-card">\r
                            <div class="card-head adm-u79">\r
                                <div>\r
                                    <h3 id="dailyReportTitle" class="chart-title adm-u124">Daily Safety Dossier</h3>\r
                                    <p id="dailyReportSubtitle" class="chart-copy adm-u125">Official breakdown for selected date.</p>\r
                                </div>\r
                                <div class="adm-u126">\r
                                    <button class="action-btn adm-u127" id="btnRefreshDailyReport" type="button">\r
                                        <span class="material-symbols-outlined adm-u34">refresh</span> Refresh\r
                                    </button>\r
                                </div>\r
                            </div>\r
                            <div id="dailyReportTableContainer" class="adm-u128">\r
                                <div class="adm-u129">Loading records from Firebase...</div>\r
                            </div>\r
                        </div>\r
                    </section>\r
                </main>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div class="modal-overlay" id="userEditorModal" aria-hidden="true">\r
        <div class="modal-card">\r
            <div class="modal-head">\r
                <div class="editor-header adm-u130">\r
                    <div>\r
                        <div class="eyebrow" id="userEditorBadge">Profile Editor</div>\r
                        <h2 class="chart-title" id="userEditorTitle">Select a user</h2>\r
                        <p class="chart-copy" id="userEditorCopy">Choose a saved account to edit its details and linked family information.</p>\r
                    </div>\r
                    <span class="role-pill student" id="userEditorRolePill">Student</span>\r
                </div>\r
                <button class="modal-close-btn" id="closeUserModalBtn" type="button" aria-label="Close editor">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
\r
            <!-- (2026-07-13) Wrap editor in form to satisfy DOM password field requirement -->\r
            <form id="userEditorForm" onsubmit="event.preventDefault();">\r
                <div class="editor-grid">\r
                    <div class="field-block full">\r
                        <label for="manageUserId">Record ID</label>\r
                        <input id="manageUserId" class="glass-input" type="text" readonly>\r
                    </div>\r
                    <div class="field-block">\r
                        <label for="manageUserName">Full Name</label>\r
                        <input id="manageUserName" class="glass-input" type="text" placeholder="Enter full name">\r
                    </div>\r
                    <div class="field-block">\r
                        <label for="manageUserRole">Role</label>\r
                        <select id="manageUserRole" class="glass-input">\r
                            <option value="student">Student</option>\r
                            <option value="guardian">Guardian</option>\r
                            <option value="staff">Staff</option>\r
                        </select>\r
                    </div>\r
                    <div class="field-block" id="manageUserEmailBlock">\r
                        <label for="manageUserEmail" id="manageUserEmailLabel">Email</label>\r
                        <!-- (2026-07-13) Add autocomplete for user email; was missing attribute -->\r
                        <input id="manageUserEmail" class="glass-input" type="email" placeholder="user@example.com" autocomplete="username">\r
                    </div>\r
                    <div class="field-block">\r
                        <label for="manageUserPassword">Password</label>\r
                        <div class="adm-u131">\r
                            <!-- (2026-07-13) Add autocomplete attribute to password; was missing -->\r
                            <input id="manageUserPassword" class="glass-input adm-u132" type="password" autocomplete="new-password" placeholder="Required for new sign-in accounts">\r
                            <button type="button" class="btn adm-u133" data-password-target="manageUserPassword">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div class="field-block" id="manageUserStudentIdBlock">\r
                        <label for="manageUserStudentId" id="manageUserStudentIdLabel">Student ID</label>\r
                        <input id="manageUserStudentId" class="glass-input" type="text" placeholder="7-digit student ID">\r
                    </div>\r
                </div>\r
\r
                <div class="editor-note" id="userEditorMeta">\r
                    Parent or guardian relationships will appear here once a saved profile is selected.\r
                </div>\r
\r
                <div class="panel-card readable-card adm-u134">\r
                    <div class="eyebrow">Location</div>\r
                    <h3 class="chart-title adm-u135" id="userLocationTitle">No recent location loaded</h3>\r
                    <p class="chart-copy adm-u136" id="userLocationCopy">Select a user to check the latest shared location or evidence area.</p>\r
                </div>\r
\r
                <div class="relation-list" id="managementRelationList"></div>\r
\r
                <div class="editor-actions adm-u24">\r
                    <div class="inline-fields">\r
                        <button class="ghost-btn" id="resetUserEditorBtn" type="button">\r
                            <span class="material-symbols-outlined">ink_eraser</span>\r
                            <span>Reset</span>\r
                        </button>\r
                    </div>\r
                    <div class="inline-fields">\r
                        <button class="danger-btn" id="deleteManagedUserBtn" type="button">\r
                            <span class="material-symbols-outlined">delete</span>\r
                            <span>Delete</span>\r
                        </button>\r
                        <button class="primary-btn" id="saveManagedUserBtn" type="button">\r
                            <span class="material-symbols-outlined">save</span>\r
                            <span>Save User</span>\r
                        </button>\r
                    </div>\r
                </div>\r
            </form>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Add bulk user import modal; was single user editor only -->\r
    <div class="modal-overlay adm-u137" id="bulkImportModal">\r
        <div class="modal-card adm-u138">\r
            <div class="adm-u139">\r
                <div>\r
                    <h3 class="adm-u140">Bulk User Import</h3>\r
                    <p class="adm-u141">Import students, guardians, or staff accounts from CSV or JSON</p>\r
                </div>\r
                <button type="button" id="closeBulkImportModalBtn" class="modal-close-btn adm-u142">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
            <div id="bulkDropzone" class="adm-u143">\r
                <span class="material-symbols-outlined adm-u144">cloud_upload</span>\r
                <div class="adm-u145">Click to select or drag & drop a .csv or .json file</div>\r
                <div class="adm-u146">Supported columns: name, email, role, studentId (optional)</div>\r
                <input type="file" id="bulkFileInput" accept=".csv,.json" class="adm-u48">\r
            </div>\r
            <div class="adm-u147">\r
                <button type="button" id="btnDownloadSampleCsv" class="ghost-btn adm-u148">\r
                    <span class="material-symbols-outlined adm-u34">download</span> Download Sample CSV\r
                </button>\r
                <button type="button" id="btnDownloadSampleJson" class="ghost-btn adm-u148">\r
                    <span class="material-symbols-outlined adm-u34">download</span> Download Sample JSON\r
                </button>\r
            </div>\r
            <div id="bulkPreviewContainer" class="adm-u149">\r
                <div class="adm-u150">\r
                    <span id="bulkParsedSummary" class="adm-u151">0 users detected</span>\r
                    <span class="signal-chip adm-u152" id="bulkValidBadge">0 valid</span>\r
                </div>\r
                <div class="adm-u153">\r
                    <table id="bulkPreviewTable" class="adm-u154">\r
                        <thead class="adm-u155">\r
                            <tr>\r
                                <th class="adm-u156">Name</th>\r
                                <th class="adm-u156">Email</th>\r
                                <th class="adm-u156">Role</th>\r
                                <th class="adm-u156">Student ID</th>\r
                                <th class="adm-u156">Status</th>\r
                            </tr>\r
                        </thead>\r
                        <tbody id="bulkPreviewTableBody"></tbody>\r
                    </table>\r
                </div>\r
            </div>\r
            <div class="adm-u157">\r
                <button type="button" id="cancelBulkImportBtn" class="ghost-btn">Cancel</button>\r
                <button type="button" id="executeBulkImportBtn" class="primary-btn" disabled>\r
                    <span class="material-symbols-outlined">person_add</span>\r
                    <span id="executeBulkImportText">Import Users</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Fullscreen Geofence & Campus Marker Editor Modal -->\r
    <div class="modal-overlay adm-u158" id="adminGeofenceModal">\r
        <div class="geofence-modal-card adm-u159">\r
            <div class="adm-u160">\r
                <div>\r
                    <div class="adm-u83">\r
                        <span class="material-symbols-outlined adm-u161">edit_location_alt</span>\r
                        <h2 class="adm-u162">Campus Geofence & Building Markers Live Editor</h2>\r
                        <span class="adm-u163">Fullscreen View</span>\r
                    </div>\r
                    <p class="adm-u164">Drag numbered purple badges to adjust the geofence perimeter. Drag building markers to update facility locations.</p>\r
                </div>\r
                <div class="adm-u165">\r
                    <!-- (2026-07-13) Add facility marker button in modal; was save and reset only -->\r
                    <button class="action-btn adm-u166" id="btnAddMarkerModal" type="button">\r
                        <span class="material-symbols-outlined adm-u12">add_location_alt</span>\r
                        <span id="btnAddMarkerLabel">Add Marker</span>\r
                    </button>\r
                    <button class="action-btn adm-u167" id="btnResetGeofenceModal" type="button">\r
                        <span class="material-symbols-outlined adm-u12">restart_alt</span>\r
                        <span>Reset Defaults</span>\r
                    </button>\r
                    <button class="action-btn adm-u168" id="btnSaveGeofenceModal" type="button">\r
                        <span class="material-symbols-outlined adm-u12">cloud_sync</span>\r
                        <span>Save & Sync Database</span>\r
                    </button>\r
                    <button class="action-btn adm-u169" id="btnCloseGeofenceModal" type="button">\r
                        <span class="material-symbols-outlined adm-u10">close</span>\r
                        <span>Close</span>\r
                    </button>\r
                </div>\r
            </div>\r
            <!-- (2026-07-13) Add markers CRUD sidebar beside map; was map only -->\r
            <div class="adm-u170 geofence-editor-workspace">\r
                <!-- Campus markers CRUD list -->\r
                <aside class="campus-markers-panel" id="geofenceMarkersSidebar" aria-label="Campus Markers">\r
                    <div class="campus-markers-panel-head">\r
                        <div class="campus-markers-head-title">\r
                            <span>Campus Places</span>\r
                            <span class="campus-markers-count" id="geofenceMarkerCountBadge">0</span>\r
                        </div>\r
                        <button type="button" class="campus-markers-new-btn" id="btnOpenCreatePlaceSidebar">\r
                            <span class="material-symbols-outlined">add</span>\r
                            <span>New</span>\r
                        </button>\r
                    </div>\r
                    <div class="campus-markers-list" id="geofenceMarkersList"></div>\r
                </aside>\r
                <!-- Interactive geofence map stage -->\r
                <div class="geofence-map-stage">\r
                    <div id="adminGeofenceModalMap" class="adm-u171"></div>\r
                </div>\r
            </div>\r
            <div class="adm-u172">\r
                <span id="geofenceModalVertexCount">6 Boundary Vertices • 9 Campus Buildings</span>\r
                <span class="adm-u88"><span class="adm-u173"></span> Real-time Firestore Sync Active</span>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Add Place CRUD & zone slider modal; was browser prompt -->\r
    <div class="place-editor-overlay" id="adminPlaceEditorModal" aria-hidden="true">\r
        <!-- Place editor dialog card -->\r
        <div class="place-editor-card" role="dialog" aria-modal="true" aria-labelledby="placeEditorTitle">\r
            <!-- Top cancel, title, save bar -->\r
            <div class="place-editor-topbar">\r
                <button type="button" class="place-editor-action-cancel" id="placeEditorCancelBtn">CANCEL</button>\r
                <h3 class="place-editor-title" id="placeEditorTitle">Edit Place</h3>\r
                <button type="button" class="place-editor-action-save" id="placeEditorSaveBtn">SAVE</button>\r
            </div>\r
            <!-- Place metadata form strip -->\r
            <div class="place-editor-fields">\r
                <div class="place-editor-field-group place-editor-field-name">\r
                    <label for="placeEditorName">Place Name</label>\r
                    <input type="text" id="placeEditorName" class="place-editor-input" placeholder="e.g. Campus Library, Main Gate" maxlength="60" autocomplete="off">\r
                </div>\r
                <div class="place-editor-field-group place-editor-field-icon">\r
                    <label for="placeEditorIcon">Icon</label>\r
                    <select id="placeEditorIcon" class="place-editor-select">\r
                        <option value="location_on">Pin</option>\r
                        <option value="school">School / Academics</option>\r
                        <option value="apartment">Admin Building</option>\r
                        <option value="account_balance">Hall / Office</option>\r
                        <option value="local_library">Library</option>\r
                        <option value="science">Laboratory</option>\r
                        <option value="restaurant">Canteen / Dining</option>\r
                        <option value="fitness_center">Gym / Sports</option>\r
                        <option value="medical_services">Medical Clinic</option>\r
                        <option value="security">Guard House</option>\r
                        <option value="door_front">Campus Gate</option>\r
                        <option value="precision_manufacturing">Engineering</option>\r
                        <option value="local_parking">Parking</option>\r
                        <option value="location_city">Campus Facility</option>\r
                    </select>\r
                </div>\r
                <div class="place-editor-field-group place-editor-field-desc">\r
                    <label for="placeEditorDesc">Description</label>\r
                    <input type="text" id="placeEditorDesc" class="place-editor-input" placeholder="Short facility note" maxlength="120" autocomplete="off">\r
                </div>\r
                <button type="button" class="place-editor-delete-btn is-hidden" id="placeEditorDeleteBtn" title="Delete this campus place">\r
                    <span class="material-symbols-outlined">delete</span>\r
                    <span>Delete</span>\r
                </button>\r
            </div>\r
            <!-- Interactive zone preview map -->\r
            <div class="place-editor-map-wrap">\r
                <div id="placeEditorMap" class="place-editor-map"></div>\r
                <div class="place-editor-map-hint">Drag pin or click map to adjust position</div>\r
                <button type="button" class="place-editor-layer-fab" id="placeEditorLayerBtn" title="Switch map view (Hybrid / Streets / Satellite)">\r
                    <span class="material-symbols-outlined">layers</span>\r
                </button>\r
            </div>\r
            <!-- (2026-07-13) Cap zone radius slider at 50m max; was 1000m max -->\r
            <div class="place-editor-slider-bar">\r
                <input type="range" id="placeEditorRadiusSlider" class="place-editor-range" min="5" max="50" step="1" value="25" aria-label="Zone radius in meters">\r
                <span class="place-editor-radius-label" id="placeEditorRadiusLabel">25 m zone</span>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Add Digital Vault evidence lightbox modal; was absent -->\r
    <div class="modal-overlay" id="vaultLightboxModal" aria-hidden="true">\r
        <div class="modal-card adm-u174">\r
            <div class="adm-u175">\r
                <div class="adm-u176">\r
                    <span class="material-symbols-outlined adm-u177">lock</span>\r
                    <div>\r
                        <h3 id="vaultLightboxTitle" class="adm-u178">Student Vault Evidence</h3>\r
                        <p id="vaultLightboxSubtitle" class="adm-u179">Digital Vault Secure Repository</p>\r
                    </div>\r
                </div>\r
                <div class="adm-u83">\r
                    <!-- (2026-07-13) Add fullscreen toggle to lightbox; was close button only -->\r
                    <button id="btnVaultFullscreen" type="button" class="ghost-btn adm-u180" title="Toggle Fullscreen View">\r
                        <span class="material-symbols-outlined adm-u34">fullscreen</span>\r
                        <span id="vaultFullscreenLabel">Fullscreen</span>\r
                    </button>\r
                    <button class="modal-close-btn" id="closeVaultLightboxBtn" type="button" aria-label="Close image lightbox">\r
                        <span class="material-symbols-outlined adm-u10">close</span>\r
                    </button>\r
                </div>\r
            </div>\r
            <div class="adm-u181">\r
                <div id="vaultLightboxMediaBox" class="adm-u182">\r
                    <img id="vaultLightboxImage" src="" alt="Vault evidence" class="adm-u183">\r
                </div>\r
                <div class="adm-u184">\r
                    <div>\r
                        <div class="adm-u185">Uploader Information</div>\r
                        <div class="adm-u83">\r
                            <div class="thread-avatar student adm-u186" id="vaultLightboxAvatar">S</div>\r
                            <div class="adm-u187">\r
                                <div id="vaultLightboxStudentName" class="adm-u188">Student Name</div>\r
                                <div class="adm-u189">\r
                                    <span class="role-pill student adm-u190">STUDENT</span>\r
                                    <span id="vaultLightboxStudentId" class="adm-u191">#1234567</span>\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </div>\r
                    <div>\r
                        <div class="adm-u185">Recorded Timestamp</div>\r
                        <div id="vaultLightboxTime" class="adm-u192">Nov 10, 2026 • 12:00 AM</div>\r
                    </div>\r
                    <div>\r
                        <div class="adm-u185">Location Coordinates</div>\r
                        <div id="vaultLightboxLocation" class="adm-u193">Campus Area</div>\r
                    </div>\r
                    <div>\r
                        <div class="adm-u185">File Metadata</div>\r
                        <div id="vaultLightboxFileType" class="adm-u194">Format: Image</div>\r
                    </div>\r
                    <div class="adm-u195">\r
                        <a id="vaultLightboxDownloadBtn" href="" download="" class="action-btn adm-u196">\r
                            <span class="material-symbols-outlined adm-u10">download</span>\r
                            <span>Download Media</span>\r
                        </a>\r
                    </div>\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
\r
</div>\r
<!-- (2026-07-13) Remove early duplicate admin.js tag; was before analytics -->\r
<section id="adminAnalyticsSection" class="admin-view-section is-hidden">\r
<div class="dashboard-container">\r
        <div class="dashboard-header">\r
            <div>\r
                <h1 class="dashboard-title">Analytics Dashboard</h1>\r
                <p class="adm-u197">Real-time campus safety insights</p>\r
            </div>\r
            <div class="date-range-selector">\r
                <select id="dateRange">\r
                    <option value="7">Last 7 days</option>\r
                    <option value="30" selected>Last 30 days</option>\r
                    <option value="90">Last 90 days</option>\r
                    <option value="custom">Custom range</option>\r
                </select>\r
                <button class="btn-export" id="exportBtn">\r
                    <span class="material-symbols-outlined">download</span>\r
                    <span>Export</span>\r
                </button>\r
                <!-- (2026-07-13) Bind analytics back button to SPA dashboard; was link -->\r
                <a href="#dashboard" id="analyticsBackToDashboardBtn" class="btn-export adm-u198">\r
                    <span class="material-symbols-outlined">arrow_back</span>\r
                    <span>Back</span>\r
                </a>\r
            </div>\r
        </div>\r
\r
        <div id="loadingState" class="loading-state">\r
            <div class="spinner"></div>\r
            <p>Loading analytics data...</p>\r
        </div>\r
\r
        <div id="dashboardContent" class="adm-u199">\r
            <!-- Stats Grid -->\r
            <div class="stats-grid">\r
                <div class="stat-card">\r
                    <div class="stat-card-header">\r
                        <div>\r
                            <p class="stat-label">Total Users</p>\r
                            <h2 class="stat-value" id="statTotalUsers">0</h2>\r
                        </div>\r
                        <div class="stat-icon primary">\r
                            <span class="material-symbols-outlined">people</span>\r
                        </div>\r
                    </div>\r
                    <div class="stat-change positive" id="statUsersChange">\r
                        <span class="material-symbols-outlined">trending_up</span>\r
                        <span>+0% from last period</span>\r
                    </div>\r
                </div>\r
\r
                <div class="stat-card">\r
                    <div class="stat-card-header">\r
                        <div>\r
                            <p class="stat-label">Attendance</p>\r
                            <h2 class="stat-value" id="statAttendance">0</h2>\r
                        </div>\r
                        <div class="stat-icon green">\r
                            <span class="material-symbols-outlined">check_circle</span>\r
                        </div>\r
                    </div>\r
                    <div class="stat-change" id="statAttendanceChange">\r
                        <span>0 check-ins today</span>\r
                    </div>\r
                </div>\r
\r
                <div class="stat-card">\r
                    <div class="stat-card-header">\r
                        <div>\r
                            <p class="stat-label">SOS Alerts</p>\r
                            <h2 class="stat-value" id="statSOS">0</h2>\r
                        </div>\r
                        <div class="stat-icon red">\r
                            <span class="material-symbols-outlined">emergency</span>\r
                        </div>\r
                    </div>\r
                    <div class="stat-change" id="statSOSChange">\r
                        <span>0 active alerts</span>\r
                    </div>\r
                </div>\r
\r
                <div class="stat-card">\r
                    <div class="stat-card-header">\r
                        <div>\r
                            <p class="stat-label">Guardian Links</p>\r
                            <h2 class="stat-value" id="statGuardians">0</h2>\r
                        </div>\r
                        <div class="stat-icon cyan">\r
                            <span class="material-symbols-outlined">family_restroom</span>\r
                        </div>\r
                    </div>\r
                    <div class="stat-change" id="statGuardiansChange">\r
                        <span>0 pending requests</span>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- Charts Grid -->\r
            <div class="charts-grid">\r
                <div class="chart-card adm-u108">\r
                    <h3 class="chart-title">Attendance Trends</h3>\r
                    <div class="chart-container">\r
                        <canvas id="attendanceChart"></canvas>\r
                    </div>\r
                </div>\r
\r
                <div class="chart-card">\r
                    <h3 class="chart-title">User Distribution</h3>\r
                    <div class="chart-container">\r
                        <canvas id="userDistributionChart"></canvas>\r
                    </div>\r
                </div>\r
\r
                <div class="chart-card">\r
                    <h3 class="chart-title">SOS Incidents by Type</h3>\r
                    <div class="chart-container">\r
                        <canvas id="sosTypeChart"></canvas>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- Recent Activity -->\r
            <div class="chart-card">\r
                <h3 class="chart-title">Recent Activity</h3>\r
                <div class="activity-list" id="recentActivityList">\r
                    <!-- Populated by JS -->\r
                </div>\r
            </div>\r
        </div>\r
    </div>\r
</section>\r
`,c=t(),l=()=>a(()=>import(`./admin-BQxehXiB.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));