const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./parent-Bk8Prnmt.js","./install-sw-DzuPi5je.js","./preload-helper-CGP3o08e.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css                  */r();var o=e(),s=`<!-- (2026-07-13) Consolidated parent auth & dashboard views; was 2 files -->
<section id="parentAuthSection" class="parent-view-section is-hidden">
<div class="toast-stack" id="toastStack" aria-live="polite"></div>

    <div class="login-card">
        <div class="brand-section">
            <img src="../assets/images/logo.png" alt="Securo Logo" class="brand-logo-img">
            <h1 class="brand-name">Securo</h1>
            <p class="text-muted small">Guardian Presence Portal</p>
        </div>

        <div class="divider">USE YOUR GUARDIAN ACCOUNT</div>

        <div class="auth-tabs">
            <button class="tab-btn active" id="loginTab" type="button">Sign In</button>
            <button class="tab-btn" id="signupTab" type="button">Register</button>
        </div>

        <form id="guardianAuthForm">
            <div class="form-group" id="emailGroup">
                <label class="form-label">Email Address</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">mail</span>
                    <!-- (2026-07-13) Add email input placeholder; was parent@example.com -->
                    <input type="email" id="emailInput" placeholder="Enter email address" required>
                </div>
            </div>

            <div class="form-group signup-only">
                <label class="form-label">Full Name</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">edit_square</span>
                    <!-- (2026-07-13) Add name input placeholder; was Guardian Full Name -->
                    <input type="text" id="fullNameSignup" placeholder="Enter guardian full name" autocomplete="name">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">lock</span>
                    <!-- (2026-07-13) Add password placeholder; was empty string -->
                    <input type="password" id="passwordInput" placeholder="Enter password" autocomplete="new-password" required>
                    <button type="button" class="btn par-u1" data-password-target="passwordInput">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>

            <!-- (2026-07-13) Forgot password trigger link; was OTP modal button -->
            <div class="login-only par-u2">
                <button type="button" id="openOtpModalBtn" class="par-u3">Forgot Password?</button>
            </div>

            <div class="form-group signup-only">
                <label class="form-label">Confirm Password</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">verified_user</span>
                    <!-- (2026-07-13) Add confirm password placeholder; was empty string -->
                    <input type="password" id="confirmPasswordSignup" placeholder="Confirm password" autocomplete="new-password">
                    <button type="button" class="btn par-u1" data-password-target="confirmPasswordSignup">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>

            <div id="errorMsg" class="error-msg"></div>
            <div class="signup-only par-u4">
                You will enter your child’s Student ID after registration inside the guardian dashboard.
            </div>

            <button type="submit" class="btn-action" id="submitBtn">
                <span id="btnText">Enter Guardian Hub</span>
                <span class="material-symbols-outlined">login</span>
            </button>

            <div class="par-u5">
                <a href="../public/role-selection.html" class="text-link">Change Role</a>
            </div>
        </form>
    </div>

    <!-- (2026-07-13) Password reset link modal; was 3-step OTP modal -->
    <div id="guardianOtpModal" class="otp-modal-backdrop par-u6">
        <div class="otp-modal-card">
            <div class="otp-modal-header">
                <div class="par-u7">
                    <div class="otp-icon-bubble">
                        <span class="material-symbols-outlined">lock_reset</span>
                    </div>
                    <div>
                        <h3 class="par-u8">Reset Password</h3>
                        <p class="par-u9">Receive a password reset link to your email</p>
                    </div>
                </div>
                <button type="button" id="closeOtpModalBtn" class="otp-close-btn" aria-label="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- View 1: Request reset link -->
            <div id="resetRequestView" class="otp-step">
                <div class="otp-explain-container par-u10">
                    <div class="par-u11">
                        <span class="material-symbols-outlined par-u12">info</span>
                        Reset password via email link
                    </div>
                    <p class="par-u13">
                        Enter your registered Guardian Gmail address below. We'll send you an official password reset link directly to your inbox.
                    </p>
                </div>
                <div class="form-group par-u14">
                    <label class="form-label">Guardian Gmail Address</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined input-icon">mail</span>
                        <input type="email" id="resetEmailInput" placeholder="parent@gmail.com">
                    </div>
                </div>
                <div id="resetEmailError" class="error-msg par-u15"></div>
                <button type="button" id="sendResetLinkBtn" class="btn-action">
                    <span>Send Password Reset Link</span>
                    <span class="material-symbols-outlined">send</span>
                </button>
            </div>

            <!-- View 2: Link sent confirmation -->
            <div id="resetSentView" class="otp-step par-u6">
                <div class="par-u16">
                    <div class="par-u17">
                        <span class="material-symbols-outlined par-u18">mark_email_read</span>
                    </div>
                    <h4 class="par-u19">Reset Link Sent!</h4>
                    <p class="par-u20">
                        We sent a password reset link to <strong id="resetTargetEmailDisplay" class="par-u21"></strong>.
                    </p>
                    <div class="par-u22">
                        <span class="material-symbols-outlined par-u23">mail</span>
                        <strong>Next Steps:</strong>
                        <ol class="par-u24">
                            <li>Open your Gmail (check Inbox and Spam/Junk folder).</li>
                            <li>Click the reset link in the email from <em>Securo</em>.</li>
                            <li>Type your new password and submit.</li>
                            <li>Return to Securo and sign in with your new password!</li>
                        </ol>
                    </div>
                    <button type="button" id="backToSignInBtn" class="btn-action par-u25">
                        <span>Return to Sign In</span>
                        <span class="material-symbols-outlined">login</span>
                    </button>
                    <button type="button" id="resendResetLinkBtn" class="par-u26">
                        Didn't get the email? Send again
                    </button>
                </div>
            </div>

            <!-- View 3: In-app new password (if opened via reset link oobCode) -->
            <div id="resetNewPasswordView" class="otp-step par-u6">
                <div class="par-u27">
                    <span class="material-symbols-outlined par-u28">check_circle</span>
                    <span class="par-u29">Reset token verified! Enter your new password below.</span>
                </div>
                <form id="newPasswordForm" onsubmit="event.preventDefault();">
                    <div class="form-group par-u15">
                        <label class="form-label">New Password</label>
                        <div class="input-wrapper">
                            <span class="material-symbols-outlined input-icon">lock</span>
                            <input type="password" id="modalNewPassword" placeholder="Minimum 8 characters" autocomplete="new-password">
                            <button type="button" class="btn par-u1" data-password-target="modalNewPassword">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div class="form-group par-u14">
                        <label class="form-label">Confirm New Password</label>
                        <div class="input-wrapper">
                            <span class="material-symbols-outlined input-icon">verified_user</span>
                            <input type="password" id="modalConfirmPassword" placeholder="Confirm your new password" autocomplete="new-password">
                            <button type="button" class="btn par-u1" data-password-target="modalConfirmPassword">
                                <span class="material-symbols-outlined">visibility</span>
                            </button>
                        </div>
                    </div>
                    <div id="newPasswordError" class="error-msg par-u15"></div>
                    <button type="submit" id="saveNewPasswordBtn" class="btn-action">
                        <span>Save Password &amp; Sign In</span>
                        <span class="material-symbols-outlined">login</span>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Add Terms modal with I Agree button; was none -->
    <div id="guardianTermsModal" class="otp-modal-backdrop par-u6">
        <div class="otp-modal-card par-u30">
            <div class="otp-modal-header par-u15">
                <div class="par-u7">
                    <div class="otp-icon-bubble">
                        <span class="material-symbols-outlined">description</span>
                    </div>
                    <div>
                        <h3 class="par-u8">Terms and Conditions</h3>
                        <p class="par-u9">Guardian Portal Terms of Service</p>
                    </div>
                </div>
                <button type="button" id="closeGuardianTermsModalBtn" class="otp-close-btn" aria-label="Close">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <!-- (2026-07-13) Full 1-15 terms in modal; was abbreviated 4 items -->
            <div id="guardianTermsScrollBox" class="par-u31">
                <h4 class="par-u32">1. Acceptance of Terms</h4>
                <p class="par-u25">By registering for and using the Securo campus safety application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.</p>

                <h4 class="par-u32">2. Purpose of the App</h4>
                <p class="par-u33">Securo is designed to enhance campus safety and security by providing:</p>
                <ul class="par-u34">
                    <li>Real-time incident reporting capabilities</li>
                    <li>Emergency notifications and alerts</li>
                    <li>Campus security communication tools</li>
                    <li>Safety resource access for students, staff, and guardians</li>
                </ul>

                <h4 class="par-u32">3. User Accounts and Registration</h4>
                <p class="par-u33">To use Securo, you must:</p>
                <ul class="par-u34">
                    <li>Provide accurate and complete registration information</li>
                    <li>Use a valid student or staff ID number</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                    <li>Be responsible for all activities that occur under your account</li>
                </ul>

                <h4 class="par-u32">4. User Responsibilities</h4>
                <p class="par-u33">When using the App, you agree to:</p>
                <ul class="par-u34">
                    <li>Use the App only for legitimate campus safety purposes</li>
                    <li>Provide truthful and accurate information when reporting incidents</li>
                    <li>Not submit false reports or misuse emergency features</li>
                    <li>Respect the privacy and rights of other users</li>
                    <li>Comply with all applicable campus policies and local laws</li>
                </ul>

                <h4 class="par-u32">5. Privacy and Data Protection</h4>
                <p class="par-u33">We take your privacy seriously. By using Securo:</p>
                <ul class="par-u34">
                    <li>You consent to the collection and use of your personal information as described in our Privacy Policy</li>
                    <li>Your profile information, including name, ID number, and photo (if provided), will be stored securely</li>
                    <li>Incident reports and communications may be monitored by campus security personnel</li>
                    <li>We will not share your personal information with third parties without your consent, except as required by law</li>
                </ul>

                <h4 class="par-u32">6. Incident Reporting</h4>
                <p class="par-u33">When reporting incidents through the App:</p>
                <ul class="par-u34">
                    <li>Submit reports promptly and accurately</li>
                    <li>False reporting is strictly prohibited and may result in disciplinary action</li>
                    <li>Reports are reviewed by campus security and appropriate authorities</li>
                    <li>Emergency situations should always be reported to campus security or local emergency services (911) immediately</li>
                </ul>

                <h4 class="par-u32">7. Guardian Access</h4>
                <p class="par-u33">For guardian accounts:</p>
                <ul class="par-u34">
                    <li>Guardians must be invited and approved by the student</li>
                    <li>Guardians have limited access to student safety information</li>
                    <li>Guardian access can be revoked by the student at any time</li>
                </ul>

                <h4 class="par-u32">8. Prohibited Activities</h4>
                <p class="par-u33">You may not:</p>
                <ul class="par-u34">
                    <li>Submit false or misleading information</li>
                    <li>Attempt to access accounts or data that do not belong to you</li>
                    <li>Interfere with the App's operation or security features</li>
                    <li>Use the App to harass, threaten, or harm others</li>
                    <li>Reverse engineer or attempt to extract source code from the App</li>
                </ul>

                <h4 class="par-u32">9. Service Availability</h4>
                <p class="par-u33">While we strive to maintain reliable service:</p>
                <ul class="par-u34">
                    <li>The App is provided "as is" without warranties of any kind</li>
                    <li>We do not guarantee uninterrupted or error-free service</li>
                    <li>We may modify, suspend, or discontinue features at any time</li>
                    <li>In case of actual emergencies, always contact campus security or emergency services directly</li>
                </ul>

                <h4 class="par-u32">10. Limitation of Liability</h4>
                <p class="par-u33">To the maximum extent permitted by law:</p>
                <ul class="par-u34">
                    <li>We are not liable for any damages arising from your use of the App</li>
                    <li>We are not responsible for the actions or inactions of campus security personnel</li>
                    <li>The App is a tool to assist campus safety efforts, not a substitute for emergency services</li>
                </ul>

                <h4 class="par-u32">11. Account Termination</h4>
                <p class="par-u33">We reserve the right to:</p>
                <ul class="par-u34">
                    <li>Suspend or terminate accounts that violate these terms</li>
                    <li>Remove content that is inappropriate or violates policies</li>
                    <li>Terminate accounts upon graduation, employment termination, or at the user's request</li>
                </ul>

                <h4 class="par-u32">12. Changes to Terms</h4>
                <p class="par-u25">We may update these Terms and Conditions from time to time. Continued use of the App after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes through the App or email.</p>

                <h4 class="par-u32">13. Governing Law</h4>
                <p class="par-u25">These Terms and Conditions are governed by applicable local laws and campus policies. Any disputes will be resolved according to the procedures established by the educational institution.</p>

                <h4 class="par-u32">14. Contact Information</h4>
                <p class="par-u25">If you have questions about these Terms and Conditions, please contact campus security or the App administrator through the official campus channels.</p>

                <h4 class="par-u32">15. Acknowledgment</h4>
                <p class="par-u35">By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
            </div>
            <!-- (2026-07-13) Align Decline and I Agree buttons; prev: mismatched margins -->
            <div class="par-u36">
                <button type="button" id="declineGuardianTermsBtn" class="par-u37">
                    <span class="material-symbols-outlined par-u38">cancel</span>
                    <span>Decline</span>
                </button>
                <button type="button" id="agreeGuardianTermsBtn" class="btn-action par-u39">
                    <span class="material-symbols-outlined par-u38">check_circle</span>
                    <span>I Agree</span>
                </button>
            </div>
        </div>
    </div>
</section>
<div id="parentDashboardShell" class="parent-view-section">
<div class="app-shell">
        <header class="topbar">
            <div class="content-frame par-u40">
                <!-- (2026-07-13) Topbar logo redirects to map homepage; was static header -->
                <div class="par-u41">
                    <div class="topbar-left par-u42" id="guardianHomeBrand"
                        onclick="document.querySelector('.nav-item[data-nav=\\'map\\']')?.click();"
                        title="Go to Map Homepage">
                        <div class="logo-wrap par-u43">
                            <img src="../assets/images/logo with text.png" alt="Securo" draggable="false" class="par-u44">
                            <div class="portal-title par-u45">Guardian</div>
                        </div>
                    </div>
                    <div class="desktop-nav-tabs par-u46">
                        <a href="#" class="desktop-nav-item active" data-nav="map"><span class="material-symbols-outlined">map</span><span>Child Map</span></a>
                        <a href="#" class="desktop-nav-item" data-nav="vault"><span class="material-symbols-outlined">shield</span><span>Vault</span></a>
                        <a href="#" class="desktop-nav-item" data-nav="alerts"><span class="material-symbols-outlined">emergency_home</span><span>Safety</span></a>
                        <a href="#" class="desktop-nav-item" data-nav="gad"><span class="material-symbols-outlined">campaign</span><span>GAD</span></a>
                    </div>
                </div>
                <div class="topbar-right par-u43">
                    <!-- (2026-07-13) Add unread count badge on GAD msg icon; was plain icon -->
                    <!-- Header GAD message trigger -->
                    <button class="surface-icon par-u48 gad-header-msg-btn" type="button" id="headerGuardianMsgBtn"
                        aria-label="GAD Messages" title="GAD Messages">
                        <span class="material-symbols-outlined">chat</span>
                        <span class="msg-unread-badge" id="headerGuardianMsgBadge"></span>
                    </button>
                    <!-- (2026-07-13) Move emergency & location modals to dropdown; was map overlay -->
                    <div class="notif-btn par-u47">
                        <button class="surface-icon par-u48" type="button" id="guardianNotifBell"
                            aria-label="Notifications">
                            <span class="material-symbols-outlined">notifications</span>
                            <div class="notif-badge par-u49" id="guardianNotifBadge"></div>
                        </button>
                        <!-- (2026-07-13) Fix notif dropdown clipping on mobile; was overflow left -->
                        <!-- (2026-07-13) Match student notifications sheet header; was Alerts & Requests -->
                        <div class="notif-dropdown par-u50" id="guardianNotifDropdown">
                            <div class="par-u51">
                                <div>
                                    <strong class="par-u52">Notifications</strong>
                                    <span class="par-u53">Requests, approvals, and app activity</span>
                                </div>
                                <button type="button" id="closeGuardianNotifDropdown" class="par-u54" aria-label="Close notifications">
                                    <span class="material-symbols-outlined par-u55">close</span>
                                </button>
                            </div>

                            <div id="guardianNotifCards" class="par-u56">
                                <!-- (2026-07-13) Render account notifications in dropdown; was missing -->
                                <div id="guardianAccountNotifList" class="par-u57"></div>
                                <div class="location-alert-card par-u58" id="sosEmergencyCard">
                                    <div class="location-alert-icon par-u59">
                                        <span class="material-symbols-outlined">emergency</span>
                                    </div>
                                    <div class="par-u60">
                                        <strong class="par-u61">🚨 EMERGENCY SOS ACTIVE</strong>
                                        <div id="sosEmergencyText" class="par-u62">
                                            Your child triggered an emergency alert.
                                        </div>
                                        <button class="btn-primary par-u63" id="viewSosLocationBtn" type="button">
                                            Locate Child on Map
                                        </button>
                                    </div>
                                </div>

                                <!-- (2026-07-13) Add pending request notif card; was modal on map only -->
                                <div class="location-alert-card par-u64" id="pendingNotifCard">
                                    <div class="location-alert-icon par-u59">
                                        <span class="material-symbols-outlined">hourglass_top</span>
                                    </div>
                                    <div class="par-u60">
                                        <strong class="par-u65">Parent Request Pending</strong>
                                        <div id="pendingNotifText" class="par-u66">
                                            Waiting for child approval.
                                        </div>
                                        <button class="btn-secondary par-u67" id="viewPendingRequestBtn" type="button">
                                            View Request Details
                                        </button>
                                    </div>
                                </div>

                                <div class="location-alert-card par-u68" id="locationAlertCard">
                                    <div class="location-alert-icon">
                                        <span class="material-symbols-outlined">location_off</span>
                                    </div>
                                    <div class="par-u60">
                                        <strong class="par-u65">Child location required</strong>
                                        <div id="locationAlertText" class="par-u66">
                                            Your child needs to turn on location sharing before live tracking can continue.
                                        </div>
                                        <button class="btn-primary par-u67" id="requestLocationBtn" type="button">
                                            Ask Child to Turn On Location
                                        </button>
                                    </div>
                                </div>

                                <div id="guardianDropdownEmptyState" class="par-u69">
                                    <span class="material-symbols-outlined par-u70">notifications_none</span>
                                    No active alerts or requests right now.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="profile-chip" id="profileBtn">
                        <span id="userInitials">P</span>
                        <div class="profile-dropdown" id="profileDropdown">
                            <div class="par-u71">
                                <div id="dropdownName" class="par-u72">Loading...</div>
                                <div class="par-u73">GUARDIAN ACCOUNT</div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a href="../public/profile.html" class="dropdown-item">
                                <span class="material-symbols-outlined">account_circle</span>
                                <span>My Profile</span>
                            </a>
                            <a href="../public/settings.html" class="dropdown-item">
                                <span class="material-symbols-outlined">settings</span>
                                <span>Settings</span>
                            </a>
                            <!-- (2026-07-13) Add About Us link to guardian dropdown; was settings only -->
                            <a href="../public/about.html" class="dropdown-item">
                                <span class="material-symbols-outlined">info</span>
                                <span>About Us</span>
                            </a>
                            <button class="dropdown-item logout" id="logoutBtn">
                                <span class="material-symbols-outlined">logout</span>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <div class="student-selector-bar" id="studentSelectorBar">
            <div id="studentSelector" class="par-u74">
                <!-- Chips will be injected -->
            </div>
            <!-- (2026-07-13) Match student invite pill button icon; was plain add -->
            <button class="selector-chip par-u75" id="addStudentBtn" type="button">
                <span class="material-symbols-outlined par-u55">person_add</span>
                <span>Link Child</span>
            </button>
        </div>

        <div class="view-container">
            <!-- Map View -->
            <div class="view active par-u47" id="mapView">
                <div id="map"></div>

                <!-- (2026-07-13) Map controls matching student view; was missing control buttons -->
                <div class="map-controls-custom map-controls-top">
                    <button class="map-btn" id="map-layers-btn"
                        title="Toggle Map Style (Satellite / Hybrid / Streets)">
                        <span class="material-symbols-outlined">layers</span>
                    </button>
                    <button class="map-btn" id="map-toggle-markers" title="Hide Campus Markers">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                    <button class="map-btn" id="map-locate" title="Locate Student">
                        <span class="material-symbols-outlined">my_location</span>
                    </button>
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
                <div class="map-overlay">
                    <!-- (2026-07-13) Move child presence chip into overlay; was floating above -->
                    <div class="guardian-map-chip-container par-u76">
                        <div class="tracking-status-pill is-on is-inside par-u77" id="guardianTrackingStatusBanner">
                            <span class="pulse-status-dot" id="guardianTrackingStatusDot"></span>
                            <span class="material-symbols-outlined tracking-status-icon" id="guardianTrackingStatusIcon">login</span>
                            <span class="tracking-status-label-text" id="guardianTrackingStatusCopy">Child Campus Status</span>
                        </div>
                    </div>
                    <!-- (2026-07-13) Hide child card when no child linked; was static loading -->
                    <div class="student-status-card par-u46">
                        <div class="student-avatar" id="studentAvatar"></div>
                        <div class="par-u60">
                            <div class="par-u78">
                                <span id="activeStudentName" class="par-u79">Loading...</span>
                                <div class="status-dot" id="statusDot"></div>
                            </div>
                            <div id="lastSeen" class="par-u80">Awaiting
                                guardian signal...</div>
                        </div>
                        <button id="locateBtn"
                            class="par-u81">
                            <span class="material-symbols-outlined par-u82">my_location</span>
                        </button>
                    </div>
                    <div class="pending-state-card" id="pendingStateCard">
                        <div class="pending-state-head par-u47">
                            <div class="pending-state-icon">
                                <span class="material-symbols-outlined">hourglass_top</span>
                            </div>
                            <div class="par-u83">
                                <!-- (2026-07-13) Dynamic pending card title by request type; was static parent -->
                                <div id="pendingStateTitle" class="par-u84">Parent request pending approval</div>
                                <div id="pendingStateCopy" class="par-u85">
                                    Your child still needs to accept your invitation before live map tracking, vault access, and safety updates become available.
                                </div>
                            </div>
                            <!-- (2026-07-13) Close button for pending card; was unclosable overlay -->
                            <button type="button" id="closePendingCardBtn" aria-label="Close" class="par-u86">
                                <span class="material-symbols-outlined par-u87">close</span>
                            </button>
                        </div>
                        <div class="pending-state-meta">
                            <div class="pending-meta-chip" id="pendingStudentMeta">
                                <span class="material-symbols-outlined par-u55">badge</span>
                                <span>Student ID pending</span>
                            </div>
                            <div class="pending-meta-chip" id="pendingNotifMetaChip">
                                <span class="material-symbols-outlined par-u55">notifications_active</span>
                                <span>Your child will see the request in their notification center.</span>
                            </div>
                        </div>
                        <div class="pending-state-actions">
                            <button class="btn-secondary par-u88" id="cancelPendingRequestBtn" type="button">Cancel Wrong Student ID</button>
                            <button class="btn-secondary par-u88" id="editPendingRequestBtn" type="button">Enter Another Student ID</button>
                        </div>
                    <!-- (2026-07-13) Close pending card container; was unclosed tag -->
                    </div>
                    <!-- (2026-07-13) Remove modal cards from map overlay; was blocking map view -->
                </div>
            </div>

            <!-- Vault View -->
            <div class="view" id="vaultView">
                <div class="section-header">
                    <h2>Child Vault</h2>
                </div>
                <p class="par-u89">Images and videos from your child's vault appear here for guardian review.</p>
                <!-- (2026-07-13) 3-column vault grid container; was bootstrap row -->
                <div id="sharedVaultGrid" class="vault-grid">
                    <!-- Media items -->
                </div>
                <div id="vaultEmpty" class="empty-state">
                    <span class="material-symbols-outlined">auto_stories</span>
                    <h3>No Vault Media</h3>
                    <p>When your child uploads vault photos or videos, they appear here.</p>
                </div>
            </div>

            <!-- Alerts View -->
            <div class="view" id="alertsView">
                <div class="section-header">
                    <h2>Guardian Alerts</h2>
                </div>
                <!-- (2026-07-13) Remove notification history on safety page; was visible -->
                <div id="notificationHistory" class="par-u6"></div>
                <div id="notificationHistoryEmpty" class="par-u6"></div>
                <div class="section-header par-u90">
                    <h2 class="par-u91">Safety Activity</h2>
                </div>
                <div id="alertHistory">
                    <!-- Alert items -->
                </div>
                <div id="alertsEmpty" class="empty-state">
                    <span class="material-symbols-outlined">notifications_active</span>
                    <h3>All Clear</h3>
                    <p>No active emergency alerts from your child.</p>
                </div>
            </div>

            <!-- GAD View -->
            <div class="view" id="gadView">
                <div class="page-header par-u92"
                   >
                    <div class="icon-badge par-u93"
                       >
                        <span class="material-symbols-outlined">campaign</span>
                    </div>
                    <div>
                        <h1 class="page-title par-u94"
                           >
                            Guardian Bulletin</h1>
                        <p class="page-copy par-u95">
                            Official campus updates guardians may want to review alongside their child.</p>
                    </div>
                </div>
                <button class="support-chat-trigger par-u96" id="openGuardianSupportBtn" type="button">
                    <span class="material-symbols-outlined">support_agent</span>
                    <span>Message GAD Support</span>
                </button>
                <div id="gadPostsFeed">
                    <!-- GAD Posts -->
                </div>
            </div>

        </div>

        <nav class="bottom-nav" aria-label="Primary">
            <div class="bottom-nav-inner">
                <a href="#" class="nav-item active" data-nav="map">
                    <span class="material-symbols-outlined">map</span>
                    <span>Child Map</span>
                </a>
                <a href="#" class="nav-item" data-nav="vault">
                    <span class="material-symbols-outlined">shield</span>
                    <span>Vault</span>
                </a>
                <a href="#" class="nav-item" data-nav="alerts">
                    <span class="material-symbols-outlined">emergency_home</span>
                    <span>Safety</span>
                </a>
                <a href="#" class="nav-item" data-nav="gad">
                    <span class="material-symbols-outlined">campaign</span>
                    <span>GAD</span>
                </a>
            </div>
        </nav>

        <!-- (2026-07-13) Fix balanced modal div hierarchy; was extra closing div -->
        <!-- Link Student Modal -->
        <div class="modal-overlay" id="linkModal">
            <div class="modal-card">
                <h3 class="modal-title">Link Your Child</h3>
                <p class="modal-copy">A child link is required before you can use the guardian dashboard. Enter the 7-digit Student ID to send a request now.</p>
                <div class="form-group">
                    <label class="form-label">Student ID Number</label>
                    <input type="text" id="studentIdInput" class="form-input" placeholder="e.g. 1234567" maxlength="7">
                </div>
                <button class="btn-primary" id="sendRequestBtn">Send Request to Continue</button>
                <button class="btn-secondary" id="closeLinkModalBtn" type="button">Not Now</button>
            </div>
        </div>

    <div class="toast-notify" id="toastNotify">
        <span class="material-symbols-outlined" id="toastIcon">info</span>
        <span id="toastMsg">Notification message</span>
    </div>

    <div class="modal-overlay" id="vaultViewerModal">
        <div class="vault-viewer-card">
            <div class="vault-viewer-head">
                <div>
                    <h3 class="vault-viewer-title">Vault Media</h3>
                    <p class="vault-viewer-subtitle" id="vaultViewerMeta">Review shared media from your child.</p>
                </div>
                <button class="vault-viewer-close" id="closeVaultViewerBtn" type="button" aria-label="Close vault viewer">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="vault-viewer-media" id="vaultViewerMedia"></div>
            <div class="vault-viewer-actions">
                <button class="btn-primary" id="downloadVaultViewerBtn" type="button">
                    <span class="material-symbols-outlined">download</span>
                    <span>Download</span>
                </button>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Delete Guardian Account confirmation modal; was missing -->
    <div class="modal-overlay" id="deleteAccountModal">
        <div class="modal-card par-u97">
            <div class="modal-title par-u98">
                <span class="material-symbols-outlined">warning</span>
                Delete Account
            </div>
            <div class="modal-copy">
                Permanently delete your guardian account and all linked records? This action cannot be undone. Please enter your password to confirm:
            </div>
            <div class="form-group">
                <label class="form-label" for="deleteAccountPassword">Confirm Password</label>
                <div class="par-u99">
                    <!-- (2026-07-13) Add password eye toggle; was password input without toggle -->
                    <input type="password" id="deleteAccountPassword" class="form-input par-u100" placeholder="Enter your current password">
                    <button type="button" class="btn par-u101" data-password-target="deleteAccountPassword">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>
            <div class="par-u102">
                <button class="btn-secondary par-u103" type="button" id="cancelDeleteAccountBtn">Cancel</button>
                <button class="btn-primary par-u104" type="button" id="confirmDeleteAccountBtn">Confirm Delete</button>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Live admin presence, mode chooser & alias setup; was named only -->
    <div class="chat-overlay" id="guardianChatOverlay">
        <div class="chat-box">
            <div class="chat-header">
                <div class="par-u105">
                    <span class="material-symbols-outlined">support_agent</span>
                    <div class="guardian-chat-title-wrap">
                        <strong class="par-u106">GAD Support <span class="gad-mode-chip" id="guardianActiveModeBadge"></span></strong>
                        <div class="guardian-presence-row" id="guardianAdminPresenceRow">
                            <span class="gad-presence-dot" id="guardianAdminPresenceDot"></span>
                            <span id="guardianAdminPresenceText">Offline</span>
                        </div>
                    </div>
                </div>
                <div class="gad-header-actions">
                    <button type="button" id="guardianSwitchModeBtn" class="gad-switch-mode-btn" title="Switch Identity Mode">Switch</button>
                    <button id="closeGuardianChatBtn" type="button" aria-label="Close chat">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            <!-- Identity mode selector panel -->
            <div class="gad-mode-chooser" id="guardianModeChooser">
                <div class="gad-mode-title">How would you like to message GAD?</div>
                <div class="gad-mode-sub">Your named and anonymous conversations are kept completely separate.</div>
                <button type="button" class="gad-mode-option" id="guardianChooseNamedBtn">
                    <span class="material-symbols-outlined">badge</span>
                    <div class="gad-mode-option-copy">
                        <strong>Message with My Name</strong>
                        <span id="guardianNamedPreviewLabel">Show your parent name to GAD</span>
                    </div>
                    <span class="gad-mode-unread" id="guardianNamedUnreadBadge"></span>
                </button>
                <button type="button" class="gad-mode-option" id="guardianChooseAnonBtn">
                    <span class="material-symbols-outlined">visibility_off</span>
                    <div class="gad-mode-option-copy">
                        <strong>Message Anonymously</strong>
                        <span id="guardianAnonPreviewLabel">Choose a custom alias name</span>
                    </div>
                    <span class="gad-mode-unread" id="guardianAnonUnreadBadge"></span>
                </button>
                <div class="gad-alias-setup" id="guardianAliasSetupPanel">
                    <label for="guardianAliasInput" class="gad-alias-label">Choose your anonymous display name</label>
                    <div class="gad-alias-row">
                        <input type="text" id="guardianAliasInput" maxlength="32" placeholder="e.g. Concerned Parent">
                        <button type="button" id="guardianSaveAliasBtn" class="gad-alias-save-btn">Continue</button>
                    </div>
                    <div class="gad-alias-error" id="guardianAliasError"></div>
                </div>
            </div>
            <div class="chat-messages" id="guardianChatMessages"></div>
            <div class="chat-input-area" id="guardianChatInputArea">
                <input type="text" class="chat-input" id="guardianChatInput" placeholder="Type your message...">
                <button class="chat-send-btn" id="guardianSendChatBtn" type="button">
                    <span class="material-symbols-outlined">send</span>
                </button>
            </div>
        </div>
    </div>

</div>
<!-- (2026-07-13) Remove duplicate parent.js script tag; was loaded twice -->
`,c=t(),l=()=>a(()=>import(`./parent-Bk8Prnmt.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));