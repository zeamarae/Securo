const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./parent-CFJHzwYC.js","./install-sw-DAi8K7sx.js","./preload-helper-BXBgov45.js","./gad-messenger-ui-nKC6E18m.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-BXBgov45.js";/* empty css                  */r();var o=e(),s=`<!-- (2026-07-13) Consolidated parent auth & dashboard views; was 2 files -->\r
<section id="parentAuthSection" class="parent-view-section is-hidden">\r
<div class="toast-stack" id="toastStack" aria-live="polite"></div>\r
\r
    <div class="login-card">\r
        <div class="brand-section">\r
            <img src="../assets/images/logo.png" alt="Securo Logo" class="brand-logo-img">\r
            <h1 class="brand-name">Securo</h1>\r
            <p class="text-muted small">Guardian Presence Portal</p>\r
        </div>\r
\r
        <div class="divider">USE YOUR GUARDIAN ACCOUNT</div>\r
\r
        <div class="auth-tabs">\r
            <button class="tab-btn active" id="loginTab" type="button">Sign In</button>\r
            <button class="tab-btn" id="signupTab" type="button">Register</button>\r
        </div>\r
\r
        <form id="guardianAuthForm">\r
            <div class="form-group" id="emailGroup">\r
                <label class="form-label">Email Address</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">mail</span>\r
                    <!-- (2026-07-13) Add email input placeholder; was parent@example.com -->\r
                    <input type="email" id="emailInput" placeholder="Enter email address" required>\r
                </div>\r
            </div>\r
\r
            <!-- (2026-07-13) Remove full name from guardian signup; moved to post-login onboarding -->\r
\r
            <div class="form-group">\r
                <label class="form-label">Password</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">lock</span>\r
                    <!-- (2026-07-13) Add password placeholder; was empty string -->\r
                    <input type="password" id="passwordInput" placeholder="Enter password" autocomplete="new-password" required>\r
                    <button type="button" class="btn par-u1" data-password-target="passwordInput">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <!-- (2026-07-13) Forgot password trigger link; was OTP modal button -->\r
            <div class="login-only par-u2">\r
                <button type="button" id="openOtpModalBtn" class="par-u3">Forgot Password?</button>\r
            </div>\r
\r
            <div class="form-group signup-only">\r
                <label class="form-label">Confirm Password</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">verified_user</span>\r
                    <!-- (2026-07-13) Add confirm password placeholder; was empty string -->\r
                    <input type="password" id="confirmPasswordSignup" placeholder="Confirm password" autocomplete="new-password">\r
                    <button type="button" class="btn par-u1" data-password-target="confirmPasswordSignup">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <div id="errorMsg" class="error-msg"></div>\r
            <div class="signup-only par-u4">\r
                You will enter your child’s Student ID after registration inside the guardian dashboard.\r
            </div>\r
\r
            <button type="submit" class="btn-action" id="submitBtn">\r
                <span id="btnText">Enter Guardian Hub</span>\r
                <span class="material-symbols-outlined">login</span>\r
            </button>\r
\r
            <div class="par-u5">\r
                <a href="../public/role-selection.html" class="text-link">Change Role</a>\r
            </div>\r
        </form>\r
    </div>\r
\r
    <!-- (2026-07-13) Password reset link modal; was 3-step OTP modal -->\r
    <div id="guardianOtpModal" class="otp-modal-backdrop par-u6">\r
        <div class="otp-modal-card">\r
            <div class="otp-modal-header">\r
                <div class="par-u7">\r
                    <div class="otp-icon-bubble">\r
                        <span class="material-symbols-outlined">lock_reset</span>\r
                    </div>\r
                    <div>\r
                        <h3 class="par-u8">Reset Password</h3>\r
                        <p class="par-u9">Receive a password reset link to your email</p>\r
                    </div>\r
                </div>\r
                <button type="button" id="closeOtpModalBtn" class="otp-close-btn" aria-label="Close">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
\r
            <!-- View 1: Request reset link -->\r
            <div id="resetRequestView" class="otp-step">\r
                <div class="otp-explain-container par-u10">\r
                    <div class="par-u11">\r
                        <span class="material-symbols-outlined par-u12">info</span>\r
                        Reset password via email link\r
                    </div>\r
                    <p class="par-u13">\r
                        Enter your registered Guardian Gmail address below. We'll send you an official password reset link directly to your inbox.\r
                    </p>\r
                </div>\r
                <div class="form-group par-u14">\r
                    <label class="form-label">Guardian Gmail Address</label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined input-icon">mail</span>\r
                        <input type="email" id="resetEmailInput" placeholder="parent@gmail.com">\r
                    </div>\r
                </div>\r
                <div id="resetEmailError" class="error-msg par-u15"></div>\r
                <button type="button" id="sendResetLinkBtn" class="btn-action">\r
                    <span>Send Password Reset Link</span>\r
                    <span class="material-symbols-outlined">send</span>\r
                </button>\r
            </div>\r
\r
            <!-- View 2: Link sent confirmation -->\r
            <div id="resetSentView" class="otp-step par-u6">\r
                <div class="par-u16">\r
                    <div class="par-u17">\r
                        <span class="material-symbols-outlined par-u18">mark_email_read</span>\r
                    </div>\r
                    <h4 class="par-u19">Reset Link Sent!</h4>\r
                    <p class="par-u20">\r
                        We sent a password reset link to <strong id="resetTargetEmailDisplay" class="par-u21"></strong>.\r
                    </p>\r
                    <div class="par-u22">\r
                        <span class="material-symbols-outlined par-u23">mail</span>\r
                        <strong>Next Steps:</strong>\r
                        <ol class="par-u24">\r
                            <li>Open your Gmail (check Inbox and Spam/Junk folder).</li>\r
                            <li>Click the reset link in the email from <em>Securo</em>.</li>\r
                            <li>Type your new password and submit.</li>\r
                            <li>Return to Securo and sign in with your new password!</li>\r
                        </ol>\r
                    </div>\r
                    <button type="button" id="backToSignInBtn" class="btn-action par-u25">\r
                        <span>Return to Sign In</span>\r
                        <span class="material-symbols-outlined">login</span>\r
                    </button>\r
                    <button type="button" id="resendResetLinkBtn" class="par-u26">\r
                        Didn't get the email? Send again\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <!-- View 3: In-app new password (if opened via reset link oobCode) -->\r
            <div id="resetNewPasswordView" class="otp-step par-u6">\r
                <div class="par-u27">\r
                    <span class="material-symbols-outlined par-u28">check_circle</span>\r
                    <span class="par-u29">Reset token verified! Enter your new password below.</span>\r
                </div>\r
                <form id="newPasswordForm" onsubmit="event.preventDefault();">\r
                    <div class="form-group par-u15">\r
                        <label class="form-label">New Password</label>\r
                        <div class="input-wrapper">\r
                            <span class="material-symbols-outlined input-icon">lock</span>\r
                            <input type="password" id="modalNewPassword" placeholder="Minimum 8 characters" autocomplete="new-password">\r
                            <button type="button" class="btn par-u1" data-password-target="modalNewPassword">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div class="form-group par-u14">\r
                        <label class="form-label">Confirm New Password</label>\r
                        <div class="input-wrapper">\r
                            <span class="material-symbols-outlined input-icon">verified_user</span>\r
                            <input type="password" id="modalConfirmPassword" placeholder="Confirm your new password" autocomplete="new-password">\r
                            <button type="button" class="btn par-u1" data-password-target="modalConfirmPassword">\r
                                <span class="material-symbols-outlined">visibility</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div id="newPasswordError" class="error-msg par-u15"></div>\r
                    <button type="submit" id="saveNewPasswordBtn" class="btn-action">\r
                        <span>Save Password &amp; Sign In</span>\r
                        <span class="material-symbols-outlined">login</span>\r
                    </button>\r
                </form>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Add Terms modal with I Agree button; was none -->\r
    <div id="guardianTermsModal" class="otp-modal-backdrop par-u6">\r
        <div class="otp-modal-card par-u30">\r
            <div class="otp-modal-header par-u15">\r
                <div class="par-u7">\r
                    <div class="otp-icon-bubble">\r
                        <span class="material-symbols-outlined">description</span>\r
                    </div>\r
                    <div>\r
                        <h3 class="par-u8">Terms and Conditions</h3>\r
                        <p class="par-u9">Guardian Portal Terms of Service</p>\r
                    </div>\r
                </div>\r
                <button type="button" id="closeGuardianTermsModalBtn" class="otp-close-btn" aria-label="Close">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
            <!-- (2026-07-13) Full 1-15 terms in modal; was abbreviated 4 items -->\r
            <div id="guardianTermsScrollBox" class="par-u31">\r
                <h4 class="par-u32">1. Acceptance of Terms</h4>\r
                <p class="par-u25">By registering for and using the Securo campus safety application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.</p>\r
\r
                <h4 class="par-u32">2. Purpose of the App</h4>\r
                <p class="par-u33">Securo is designed to enhance campus safety and security by providing:</p>\r
                <ul class="par-u34">\r
                    <li>Real-time incident reporting capabilities</li>\r
                    <li>Emergency notifications and alerts</li>\r
                    <li>Campus security communication tools</li>\r
                    <li>Safety resource access for students, staff, and guardians</li>\r
                </ul>\r
\r
                <h4 class="par-u32">3. User Accounts and Registration</h4>\r
                <p class="par-u33">To use Securo, you must:</p>\r
                <ul class="par-u34">\r
                    <li>Provide accurate and complete registration information</li>\r
                    <li>Use a valid student or staff ID number</li>\r
                    <li>Maintain the confidentiality of your account credentials</li>\r
                    <li>Notify us immediately of any unauthorized access to your account</li>\r
                    <li>Be responsible for all activities that occur under your account</li>\r
                </ul>\r
\r
                <h4 class="par-u32">4. User Responsibilities</h4>\r
                <p class="par-u33">When using the App, you agree to:</p>\r
                <ul class="par-u34">\r
                    <li>Use the App only for legitimate campus safety purposes</li>\r
                    <li>Provide truthful and accurate information when reporting incidents</li>\r
                    <li>Not submit false reports or misuse emergency features</li>\r
                    <li>Respect the privacy and rights of other users</li>\r
                    <li>Comply with all applicable campus policies and local laws</li>\r
                </ul>\r
\r
                <h4 class="par-u32">5. Privacy and Data Protection</h4>\r
                <p class="par-u33">We take your privacy seriously. By using Securo:</p>\r
                <ul class="par-u34">\r
                    <li>You consent to the collection and use of your personal information as described in our Privacy Policy</li>\r
                    <li>Your profile information, including name, ID number, and photo (if provided), will be stored securely</li>\r
                    <li>Incident reports and communications may be monitored by campus security personnel</li>\r
                    <li>We will not share your personal information with third parties without your consent, except as required by law</li>\r
                </ul>\r
\r
                <h4 class="par-u32">6. Incident Reporting</h4>\r
                <p class="par-u33">When reporting incidents through the App:</p>\r
                <ul class="par-u34">\r
                    <li>Submit reports promptly and accurately</li>\r
                    <li>False reporting is strictly prohibited and may result in disciplinary action</li>\r
                    <li>Reports are reviewed by campus security and appropriate authorities</li>\r
                    <li>Emergency situations should always be reported to campus security or local emergency services (911) immediately</li>\r
                </ul>\r
\r
                <h4 class="par-u32">7. Guardian Access</h4>\r
                <p class="par-u33">For guardian accounts:</p>\r
                <ul class="par-u34">\r
                    <li>Guardians must be invited and approved by the student</li>\r
                    <li>Guardians have limited access to student safety information</li>\r
                    <li>Guardian access can be revoked by the student at any time</li>\r
                </ul>\r
\r
                <h4 class="par-u32">8. Prohibited Activities</h4>\r
                <p class="par-u33">You may not:</p>\r
                <ul class="par-u34">\r
                    <li>Submit false or misleading information</li>\r
                    <li>Attempt to access accounts or data that do not belong to you</li>\r
                    <li>Interfere with the App's operation or security features</li>\r
                    <li>Use the App to harass, threaten, or harm others</li>\r
                    <li>Reverse engineer or attempt to extract source code from the App</li>\r
                </ul>\r
\r
                <h4 class="par-u32">9. Service Availability</h4>\r
                <p class="par-u33">While we strive to maintain reliable service:</p>\r
                <ul class="par-u34">\r
                    <li>The App is provided "as is" without warranties of any kind</li>\r
                    <li>We do not guarantee uninterrupted or error-free service</li>\r
                    <li>We may modify, suspend, or discontinue features at any time</li>\r
                    <li>In case of actual emergencies, always contact campus security or emergency services directly</li>\r
                </ul>\r
\r
                <h4 class="par-u32">10. Limitation of Liability</h4>\r
                <p class="par-u33">To the maximum extent permitted by law:</p>\r
                <ul class="par-u34">\r
                    <li>We are not liable for any damages arising from your use of the App</li>\r
                    <li>We are not responsible for the actions or inactions of campus security personnel</li>\r
                    <li>The App is a tool to assist campus safety efforts, not a substitute for emergency services</li>\r
                </ul>\r
\r
                <h4 class="par-u32">11. Account Termination</h4>\r
                <p class="par-u33">We reserve the right to:</p>\r
                <ul class="par-u34">\r
                    <li>Suspend or terminate accounts that violate these terms</li>\r
                    <li>Remove content that is inappropriate or violates policies</li>\r
                    <li>Terminate accounts upon graduation, employment termination, or at the user's request</li>\r
                </ul>\r
\r
                <h4 class="par-u32">12. Changes to Terms</h4>\r
                <p class="par-u25">We may update these Terms and Conditions from time to time. Continued use of the App after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes through the App or email.</p>\r
\r
                <h4 class="par-u32">13. Governing Law</h4>\r
                <p class="par-u25">These Terms and Conditions are governed by applicable local laws and campus policies. Any disputes will be resolved according to the procedures established by the educational institution.</p>\r
\r
                <h4 class="par-u32">14. Contact Information</h4>\r
                <p class="par-u25">If you have questions about these Terms and Conditions, please contact campus security or the App administrator through the official campus channels.</p>\r
\r
                <h4 class="par-u32">15. Acknowledgment</h4>\r
                <p class="par-u35">By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>\r
            </div>\r
            <!-- (2026-07-13) Align Decline and I Agree buttons; prev: mismatched margins -->\r
            <div class="par-u36">\r
                <button type="button" id="declineGuardianTermsBtn" class="par-u37">\r
                    <span class="material-symbols-outlined par-u38">cancel</span>\r
                    <span>Decline</span>\r
                </button>\r
                <button type="button" id="agreeGuardianTermsBtn" class="btn-action par-u39">\r
                    <span class="material-symbols-outlined par-u38">check_circle</span>\r
                    <span>I Agree</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
</section>\r
<div id="parentDashboardShell" class="parent-view-section">\r
<div class="app-shell">\r
        <header class="topbar">\r
            <div class="content-frame par-u40">\r
                <!-- (2026-07-13) Topbar logo redirects to map homepage; was static header -->\r
                <div class="par-u41">\r
                    <div class="topbar-left par-u42" id="guardianHomeBrand"\r
                        onclick="document.querySelector('.nav-item[data-nav=\\'map\\']')?.click();"\r
                        title="Go to Map Homepage">\r
                        <div class="logo-wrap par-u43">\r
                            <img src="../assets/images/logo with text.png" alt="Securo" draggable="false" class="par-u44">\r
                            <div class="portal-title par-u45">Guardian</div>\r
                        </div>\r
                    </div>\r
                    <div class="desktop-nav-tabs par-u46">\r
                        <a href="#" class="desktop-nav-item active" data-nav="map"><span class="material-symbols-outlined">map</span><span>Child Map</span></a>\r
                        <a href="#" class="desktop-nav-item" data-nav="vault"><span class="material-symbols-outlined">shield</span><span>Vault</span></a>\r
                        <a href="#" class="desktop-nav-item" data-nav="alerts"><span class="material-symbols-outlined">emergency_home</span><span>Safety</span></a>\r
                        <a href="#" class="desktop-nav-item" data-nav="gad"><span class="material-symbols-outlined">campaign</span><span>GAD</span></a>\r
                    </div>\r
                </div>\r
                <div class="topbar-right par-u43">\r
                    <!-- (2026-07-13) Add unread count badge on GAD msg icon; was plain icon -->\r
                    <!-- Header GAD message trigger -->\r
                    <button class="surface-icon par-u48 gad-header-msg-btn" type="button" id="headerGuardianMsgBtn"\r
                        aria-label="GAD Messages" title="GAD Messages">\r
                        <span class="material-symbols-outlined">chat</span>\r
                        <span class="msg-unread-badge" id="headerGuardianMsgBadge"></span>\r
                    </button>\r
                    <!-- (2026-07-13) Move emergency & location modals to dropdown; was map overlay -->\r
                    <div class="notif-btn par-u47">\r
                        <button class="surface-icon par-u48" type="button" id="guardianNotifBell"\r
                            aria-label="Notifications">\r
                            <span class="material-symbols-outlined">notifications</span>\r
                            <div class="notif-badge par-u49" id="guardianNotifBadge"></div>\r
                        </button>\r
                        <!-- (2026-07-13) Fix notif dropdown clipping on mobile; was overflow left -->\r
                        <!-- (2026-07-13) Match student notifications sheet header; was Alerts & Requests -->\r
                        <div class="notif-dropdown par-u50" id="guardianNotifDropdown">\r
                            <div class="par-u51">\r
                                <div>\r
                                    <strong class="par-u52">Notifications</strong>\r
                                    <span class="par-u53">Requests, approvals, and app activity</span>\r
                                </div>\r
                                <button type="button" id="closeGuardianNotifDropdown" class="par-u54" aria-label="Close notifications">\r
                                    <span class="material-symbols-outlined par-u55">close</span>\r
                                </button>\r
                            </div>\r
\r
                            <div id="guardianNotifCards" class="par-u56">\r
                                <!-- (2026-07-13) Render account notifications in dropdown; was missing -->\r
                                <div id="guardianAccountNotifList" class="par-u57"></div>\r
                                <div class="location-alert-card par-u58" id="sosEmergencyCard">\r
                                    <div class="location-alert-icon par-u59">\r
                                        <span class="material-symbols-outlined">emergency</span>\r
                                    </div>\r
                                    <div class="par-u60">\r
                                        <strong class="par-u61">🚨 EMERGENCY SOS ACTIVE</strong>\r
                                        <div id="sosEmergencyText" class="par-u62">\r
                                            Your child triggered an emergency alert.\r
                                        </div>\r
                                        <button class="btn-primary par-u63" id="viewSosLocationBtn" type="button">\r
                                            Locate Child on Map\r
                                        </button>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- (2026-07-13) Add pending request notif card; was modal on map only -->\r
                                <div class="location-alert-card par-u64" id="pendingNotifCard">\r
                                    <div class="location-alert-icon par-u59">\r
                                        <span class="material-symbols-outlined">hourglass_top</span>\r
                                    </div>\r
                                    <div class="par-u60">\r
                                        <strong class="par-u65">Parent Request Pending</strong>\r
                                        <div id="pendingNotifText" class="par-u66">\r
                                            Waiting for child approval.\r
                                        </div>\r
                                        <button class="btn-secondary par-u67" id="viewPendingRequestBtn" type="button">\r
                                            View Request Details\r
                                        </button>\r
                                    </div>\r
                                </div>\r
\r
                                <div class="location-alert-card par-u68" id="locationAlertCard">\r
                                    <div class="location-alert-icon">\r
                                        <span class="material-symbols-outlined">location_off</span>\r
                                    </div>\r
                                    <div class="par-u60">\r
                                        <strong class="par-u65">Child location required</strong>\r
                                        <div id="locationAlertText" class="par-u66">\r
                                            Your child needs to turn on location sharing before live tracking can continue.\r
                                        </div>\r
                                        <button class="btn-primary par-u67" id="requestLocationBtn" type="button">\r
                                            Ask Child to Turn On Location\r
                                        </button>\r
                                    </div>\r
                                </div>\r
\r
                                <div id="guardianDropdownEmptyState" class="par-u69">\r
                                    <span class="material-symbols-outlined par-u70">notifications_none</span>\r
                                    No active alerts or requests right now.\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </div>\r
                    <div class="profile-chip" id="profileBtn">\r
                        <span id="userInitials">P</span>\r
                        <div class="profile-dropdown" id="profileDropdown">\r
                            <div class="par-u71">\r
                                <div id="dropdownName" class="par-u72">Loading...</div>\r
                                <div class="par-u73">GUARDIAN ACCOUNT</div>\r
                            </div>\r
                            <div class="dropdown-divider"></div>\r
                            <a href="../public/profile.html" class="dropdown-item">\r
                                <span class="material-symbols-outlined">account_circle</span>\r
                                <span>My Profile</span>\r
                            </a>\r
                            <a href="../public/settings.html" class="dropdown-item">\r
                                <span class="material-symbols-outlined">settings</span>\r
                                <span>Settings</span>\r
                            </a>\r
                            <!-- (2026-07-13) Add About Us link to guardian dropdown; was settings only -->\r
                            <a href="../public/about.html" class="dropdown-item">\r
                                <span class="material-symbols-outlined">info</span>\r
                                <span>About Us</span>\r
                            </a>\r
                            <button class="dropdown-item logout" id="logoutBtn">\r
                                <span class="material-symbols-outlined">logout</span>\r
                                <span>Sign Out</span>\r
                            </button>\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
        </header>\r
\r
        <div class="student-selector-bar" id="studentSelectorBar">\r
            <div id="studentSelector" class="par-u74">\r
                <!-- Chips will be injected -->\r
            </div>\r
            <!-- (2026-07-13) Match student invite pill button icon; was plain add -->\r
            <button class="selector-chip par-u75" id="addStudentBtn" type="button">\r
                <span class="material-symbols-outlined par-u55">person_add</span>\r
                <span>Link Child</span>\r
            </button>\r
        </div>\r
\r
        <div class="view-container">\r
            <!-- Map View -->\r
            <div class="view active par-u47" id="mapView">\r
                <div id="map"></div>\r
\r
                <!-- (2026-07-13) Map controls matching student view; was missing control buttons -->\r
                <div class="map-controls-custom map-controls-top">\r
                    <button class="map-btn" id="map-layers-btn"\r
                        title="Toggle Map Style (Satellite / Hybrid / Streets)">\r
                        <span class="material-symbols-outlined">layers</span>\r
                    </button>\r
                    <button class="map-btn" id="map-toggle-markers" title="Hide Campus Markers">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                    <button class="map-btn" id="map-locate" title="Locate Student">\r
                        <span class="material-symbols-outlined">my_location</span>\r
                    </button>\r
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
                <div class="map-overlay">\r
                    <!-- (2026-07-13) Move child presence chip into overlay; was floating above -->\r
                    <div class="guardian-map-chip-container par-u76">\r
                        <div class="tracking-status-pill is-on is-inside par-u77" id="guardianTrackingStatusBanner">\r
                            <span class="pulse-status-dot" id="guardianTrackingStatusDot"></span>\r
                            <span class="material-symbols-outlined tracking-status-icon" id="guardianTrackingStatusIcon">login</span>\r
                            <span class="tracking-status-label-text" id="guardianTrackingStatusCopy">Child Campus Status</span>\r
                        </div>\r
                    </div>\r
                    <!-- (2026-07-13) Hide child card when no child linked; was static loading -->\r
                    <div class="student-status-card par-u46">\r
                        <div class="student-avatar" id="studentAvatar"></div>\r
                        <div class="par-u60">\r
                            <div class="par-u78">\r
                                <span id="activeStudentName" class="par-u79">Loading...</span>\r
                                <div class="status-dot" id="statusDot"></div>\r
                            </div>\r
                            <div id="lastSeen" class="par-u80">Awaiting\r
                                guardian signal...</div>\r
                        </div>\r
                        <button id="locateBtn"\r
                            class="par-u81">\r
                            <span class="material-symbols-outlined par-u82">my_location</span>\r
                        </button>\r
                    </div>\r
                    <div class="pending-state-card" id="pendingStateCard">\r
                        <div class="pending-state-head par-u47">\r
                            <div class="pending-state-icon">\r
                                <span class="material-symbols-outlined">hourglass_top</span>\r
                            </div>\r
                            <div class="par-u83">\r
                                <!-- (2026-07-13) Dynamic pending card title by request type; was static parent -->\r
                                <div id="pendingStateTitle" class="par-u84">Parent request pending approval</div>\r
                                <div id="pendingStateCopy" class="par-u85">\r
                                    Your child still needs to accept your invitation before live map tracking, vault access, and safety updates become available.\r
                                </div>\r
                            </div>\r
                            <!-- (2026-07-13) Close button for pending card; was unclosable overlay -->\r
                            <button type="button" id="closePendingCardBtn" aria-label="Close" class="par-u86">\r
                                <span class="material-symbols-outlined par-u87">close</span>\r
                            </button>\r
                        </div>\r
                        <div class="pending-state-meta">\r
                            <div class="pending-meta-chip" id="pendingStudentMeta">\r
                                <span class="material-symbols-outlined par-u55">badge</span>\r
                                <span>Student ID pending</span>\r
                            </div>\r
                            <div class="pending-meta-chip" id="pendingNotifMetaChip">\r
                                <span class="material-symbols-outlined par-u55">notifications_active</span>\r
                                <span>Your child will see the request in their notification center.</span>\r
                            </div>\r
                        </div>\r
                        <div class="pending-state-actions">\r
                            <button class="btn-secondary par-u88" id="cancelPendingRequestBtn" type="button">Cancel Wrong Student ID</button>\r
                            <button class="btn-secondary par-u88" id="editPendingRequestBtn" type="button">Enter Another Student ID</button>\r
                        </div>\r
                    <!-- (2026-07-13) Close pending card container; was unclosed tag -->\r
                    </div>\r
                    <!-- (2026-07-13) Remove modal cards from map overlay; was blocking map view -->\r
                </div>\r
            </div>\r
\r
            <!-- Vault View -->\r
            <div class="view" id="vaultView">\r
                <div class="section-header">\r
                    <h2>Child Vault</h2>\r
                </div>\r
                <p class="par-u89">Images and videos from your child's vault appear here for guardian review.</p>\r
                <!-- (2026-07-13) 3-column vault grid container; was bootstrap row -->\r
                <div id="sharedVaultGrid" class="vault-grid">\r
                    <!-- Media items -->\r
                </div>\r
                <div id="vaultEmpty" class="empty-state">\r
                    <span class="material-symbols-outlined">auto_stories</span>\r
                    <h3>No Vault Media</h3>\r
                    <p>When your child uploads vault photos or videos, they appear here.</p>\r
                </div>\r
            </div>\r
\r
            <!-- Alerts View -->\r
            <div class="view" id="alertsView">\r
                <div class="section-header">\r
                    <h2>Guardian Alerts</h2>\r
                </div>\r
                <!-- (2026-07-13) Remove notification history on safety page; was visible -->\r
                <div id="notificationHistory" class="par-u6"></div>\r
                <div id="notificationHistoryEmpty" class="par-u6"></div>\r
                <div class="section-header par-u90">\r
                    <h2 class="par-u91">Safety Activity</h2>\r
                </div>\r
                <div id="alertHistory">\r
                    <!-- Alert items -->\r
                </div>\r
                <div id="alertsEmpty" class="empty-state">\r
                    <span class="material-symbols-outlined">notifications_active</span>\r
                    <h3>All Clear</h3>\r
                    <p>No active emergency alerts from your child.</p>\r
                </div>\r
            </div>\r
\r
            <!-- GAD View -->\r
            <div class="view" id="gadView">\r
                <div class="page-header par-u92"\r
                   >\r
                    <div class="icon-badge par-u93"\r
                       >\r
                        <span class="material-symbols-outlined">campaign</span>\r
                    </div>\r
                    <div>\r
                        <h1 class="page-title par-u94"\r
                           >\r
                            Guardian Bulletin</h1>\r
                        <p class="page-copy par-u95">\r
                            Official campus updates guardians may want to review alongside their child.</p>\r
                    </div>\r
                </div>\r
                <button class="support-chat-trigger par-u96" id="openGuardianSupportBtn" type="button">\r
                    <span class="material-symbols-outlined">support_agent</span>\r
                    <span>Message GAD Support</span>\r
                </button>\r
                <div id="gadPostsFeed">\r
                    <!-- GAD Posts -->\r
                </div>\r
            </div>\r
\r
        </div>\r
\r
        <nav class="bottom-nav" aria-label="Primary">\r
            <div class="bottom-nav-inner">\r
                <a href="#" class="nav-item active" data-nav="map">\r
                    <span class="material-symbols-outlined">map</span>\r
                    <span>Child Map</span>\r
                </a>\r
                <a href="#" class="nav-item" data-nav="vault">\r
                    <span class="material-symbols-outlined">shield</span>\r
                    <span>Vault</span>\r
                </a>\r
                <a href="#" class="nav-item" data-nav="alerts">\r
                    <span class="material-symbols-outlined">emergency_home</span>\r
                    <span>Safety</span>\r
                </a>\r
                <a href="#" class="nav-item" data-nav="gad">\r
                    <span class="material-symbols-outlined">campaign</span>\r
                    <span>GAD</span>\r
                </a>\r
            </div>\r
        </nav>\r
\r
        <!-- (2026-07-13) Fix balanced modal div hierarchy; was extra closing div -->\r
        <!-- Link Student Modal -->\r
        <div class="modal-overlay" id="linkModal">\r
            <div class="modal-card">\r
                <h3 class="modal-title">Link Your Child</h3>\r
                <p class="modal-copy">A child link is required before you can use the guardian dashboard. Enter the 7-digit Student ID to send a request now.</p>\r
                <div class="form-group">\r
                    <label class="form-label">Student ID Number</label>\r
                    <input type="text" id="studentIdInput" class="form-input" placeholder="e.g. 1234567" maxlength="7">\r
                </div>\r
                <button class="btn-primary" id="sendRequestBtn">Send Request to Continue</button>\r
                <button class="btn-secondary" id="closeLinkModalBtn" type="button">Not Now</button>\r
            </div>\r
        </div>\r
\r
    <div class="toast-notify" id="toastNotify">\r
        <span class="material-symbols-outlined" id="toastIcon">info</span>\r
        <span id="toastMsg">Notification message</span>\r
    </div>\r
\r
    <div class="modal-overlay" id="vaultViewerModal">\r
        <div class="vault-viewer-card">\r
            <div class="vault-viewer-head">\r
                <div>\r
                    <h3 class="vault-viewer-title">Vault Media</h3>\r
                    <p class="vault-viewer-subtitle" id="vaultViewerMeta">Review shared media from your child.</p>\r
                </div>\r
                <button class="vault-viewer-close" id="closeVaultViewerBtn" type="button" aria-label="Close vault viewer">\r
                    <span class="material-symbols-outlined">close</span>\r
                </button>\r
            </div>\r
            <div class="vault-viewer-media" id="vaultViewerMedia"></div>\r
            <div class="vault-viewer-actions">\r
                <button class="btn-primary" id="downloadVaultViewerBtn" type="button">\r
                    <span class="material-symbols-outlined">download</span>\r
                    <span>Download</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Delete Guardian Account confirmation modal; was missing -->\r
    <div class="modal-overlay" id="deleteAccountModal">\r
        <div class="modal-card par-u97">\r
            <div class="modal-title par-u98">\r
                <span class="material-symbols-outlined">warning</span>\r
                Delete Account\r
            </div>\r
            <div class="modal-copy">\r
                Permanently delete your guardian account and all linked records? This action cannot be undone. Please enter your password to confirm:\r
            </div>\r
            <div class="form-group">\r
                <label class="form-label" for="deleteAccountPassword">Confirm Password</label>\r
                <div class="par-u99">\r
                    <!-- (2026-07-13) Add password eye toggle; was password input without toggle -->\r
                    <input type="password" id="deleteAccountPassword" class="form-input par-u100" placeholder="Enter your current password">\r
                    <button type="button" class="btn par-u101" data-password-target="deleteAccountPassword">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
            <div class="par-u102">\r
                <button class="btn-secondary par-u103" type="button" id="cancelDeleteAccountBtn">Cancel</button>\r
                <button class="btn-primary par-u104" type="button" id="confirmDeleteAccountBtn">Confirm Delete</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Live admin presence, mode chooser & alias setup; was named only -->\r
    <div class="chat-overlay" id="guardianChatOverlay">\r
        <div class="chat-box">\r
            <div class="chat-header">\r
                <div class="par-u105">\r
                    <span class="material-symbols-outlined">support_agent</span>\r
                    <div class="guardian-chat-title-wrap">\r
                        <strong class="par-u106">GAD Support <span class="gad-mode-chip" id="guardianActiveModeBadge"></span></strong>\r
                        <div class="guardian-presence-row" id="guardianAdminPresenceRow">\r
                            <span class="gad-presence-dot" id="guardianAdminPresenceDot"></span>\r
                            <span id="guardianAdminPresenceText">Offline</span>\r
                        </div>\r
                    </div>\r
                </div>\r
                <div class="gad-header-actions">\r
                    <button type="button" id="guardianSwitchModeBtn" class="gad-switch-mode-btn" title="Switch Identity Mode">Switch</button>\r
                    <button id="closeGuardianChatBtn" type="button" aria-label="Close chat">\r
                        <span class="material-symbols-outlined">close</span>\r
                    </button>\r
                </div>\r
            </div>\r
            <!-- Identity mode selector panel -->\r
            <div class="gad-mode-chooser" id="guardianModeChooser">\r
                <div class="gad-mode-title">How would you like to message GAD?</div>\r
                <div class="gad-mode-sub">Your named and anonymous conversations are kept completely separate.</div>\r
                <button type="button" class="gad-mode-option" id="guardianChooseNamedBtn">\r
                    <span class="material-symbols-outlined">badge</span>\r
                    <div class="gad-mode-option-copy">\r
                        <strong>Message with My Name</strong>\r
                        <span id="guardianNamedPreviewLabel">Show your parent name to GAD</span>\r
                    </div>\r
                    <span class="gad-mode-unread" id="guardianNamedUnreadBadge"></span>\r
                </button>\r
                <button type="button" class="gad-mode-option" id="guardianChooseAnonBtn">\r
                    <span class="material-symbols-outlined">visibility_off</span>\r
                    <div class="gad-mode-option-copy">\r
                        <strong>Message Anonymously</strong>\r
                        <span id="guardianAnonPreviewLabel">Choose a custom alias name</span>\r
                    </div>\r
                    <span class="gad-mode-unread" id="guardianAnonUnreadBadge"></span>\r
                </button>\r
                <div class="gad-alias-setup" id="guardianAliasSetupPanel">\r
                    <label for="guardianAliasInput" class="gad-alias-label">Choose your anonymous display name</label>\r
                    <div class="gad-alias-row">\r
                        <input type="text" id="guardianAliasInput" maxlength="32" placeholder="e.g. Concerned Parent">\r
                        <button type="button" id="guardianSaveAliasBtn" class="gad-alias-save-btn">Continue</button>\r
                    </div>\r
                    <div class="gad-alias-error" id="guardianAliasError"></div>\r
                </div>\r
            </div>\r
            <div class="chat-messages" id="guardianChatMessages"></div>\r
            <div class="chat-input-area" id="guardianChatInputArea">\r
                <input type="text" class="chat-input" id="guardianChatInput" placeholder="Type your message...">\r
                <button class="chat-send-btn" id="guardianSendChatBtn" type="button">\r
                    <span class="material-symbols-outlined">send</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
</div>\r
<!-- (2026-07-13) Remove duplicate parent.js script tag; was loaded twice -->\r
`,c=t(),l=()=>a(()=>import(`./parent-CFJHzwYC.js`),__vite__mapDeps([0,1,2,3]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));