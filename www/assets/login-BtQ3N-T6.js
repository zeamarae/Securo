const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-CBSv-6As.js","./install-sw-DAi8K7sx.js","./preload-helper-BXBgov45.js"])))=>i.map(i=>d[i]);
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
    <div class="toast-stack" id="toastStack" aria-live="polite"></div>\r
\r
    <!-- Main Auth Card (loginHub) -->\r
    <div class="login-card pub-login-u1" id="loginHub">\r
        <!-- (2026-07-13) Remove staff terms button; was top-left anchor -->\r
        <div class="brand-section">\r
            <img src="../assets/images/logo.png" alt="Securo Logo" class="brand-logo-img">\r
            <h1 class="brand-name">Securo</h1>\r
            <p class="text-muted small" id="brandSubtitle">Secure campus access</p>\r
        </div>\r
\r
        <div class="divider">OR USE CREDENTIALS</div>\r
\r
        <div class="auth-tabs">\r
            <button class="tab-btn active" id="loginTab">Sign In</button>\r
            <button class="tab-btn" id="signupTab">Register</button>\r
        </div>\r
\r
        <!-- Auth Form (mainAuthForm) -->\r
        <form id="mainAuthForm">\r
            <!-- Student ID (Login Only) -->\r
            <div class="form-group" id="identifierGroup">\r
                <label class="form-label" id="identifierLabel">Student ID Number</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon" id="identifierIcon">badge</span>\r
                    <!-- (2026-07-13) Add descriptive placeholder for ID; was 1234567 -->\r
                    <input type="text" id="identifier" placeholder="Enter 7-digit ID Number" maxlength="7" pattern="\\d*" inputmode="numeric" required>\r
                </div>\r
            </div>\r
\r
            <!-- Student ID (Signup Only) -->\r
            <div class="form-group signup-only">\r
                <label class="form-label" id="signupIdLabel">Student ID Number</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">badge</span>\r
                    <!-- (2026-07-13) Add placeholder for signup ID; was empty -->\r
                    <input type="text" id="studentIdSignup" placeholder="Enter 7-digit ID Number" maxlength="7" pattern="\\d*" inputmode="numeric" autocomplete="off">\r
                </div>\r
            </div>\r
\r
            <!-- (2026-07-13) General required email placeholder on signup; was OTP only -->\r
            <div class="form-group signup-only">\r
                <label class="form-label">Email Address</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">mail</span>\r
                    <input type="email" id="studentEmailSignup" placeholder="Enter your email address" autocomplete="email">\r
                </div>\r
            </div>\r
\r
            <!-- Password -->\r
            <div class="form-group">\r
                <label class="form-label">Password</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">lock</span>\r
                    <!-- (2026-07-13) Add placeholder for password; was empty -->\r
                    <input type="password" id="password" placeholder="Enter password" autocomplete="new-password" required>\r
                    <button type="button" id="togglePassword" class="btn pub-login-u2">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <div class="form-group signup-only">\r
                <label class="form-label">Confirm Password</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">verified_user</span>\r
                    <!-- (2026-07-13) Add placeholder for confirm password; was empty -->\r
                    <input type="password" id="confirmPasswordSignup" placeholder="Confirm password" autocomplete="new-password">\r
                    <button type="button" id="toggleConfirmPassword" class="btn pub-login-u3">\r
                        <span class="material-symbols-outlined">visibility</span>\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <!-- (2026-07-13) Remove terms checkbox from form; was inline checkbox -->\r
\r
            <div class="pub-login-u4">\r
                <a href="#" id="forgotPassword" class="pub-login-u5">Forgot Password?</a>\r
            </div>\r
\r
            <div id="errorMsg" class="error-msg"></div>\r
\r
            <button type="submit" class="btn-action pub-login-u6" id="submitBtn">\r
                <span id="btnText">Enter Hub</span>\r
                <span class="material-symbols-outlined">login</span>\r
            </button>\r
\r
            <!-- (2026-07-13) Remove app trailer link; prev: App Trailer link included -->\r
            <div class="pub-login-u7">\r
                <a href="../public/role-selection.html" class="pub-login-u8">Change Role</a>\r
                <span class="pub-login-u9">&bull;</span>\r
                <a href="../public/about.html" class="pub-login-u5">About Us</a>\r
                <span class="pub-login-u9">&bull;</span>\r
                <a href="../public/terms.html" class="pub-login-u8">Terms</a>\r
            </div>\r
        </form>\r
    </div>\r
\r
    <!-- (2026-07-13) Add required onboarding modal for name, section, and photo; was simple ID modal -->\r
    <!-- Required Onboarding Screen Modal (onboardingModal) -->\r
    <div id="onboardingModal" class="onboarding-modal-backdrop">\r
        <div class="onboarding-modal-card">\r
            <div class="onboarding-header">\r
                <div class="onboarding-badge-icon">\r
                    <img src="../assets/images/logo.png" alt="Securo" class="pub-login-u10">\r
                </div>\r
                <h3 class="onboarding-title">Set Up Your Profile</h3>\r
                <p class="onboarding-subtitle">Complete your student identity to access your campus dashboard and safety tools.</p>\r
            </div>\r
\r
            <!-- Profile Avatar Section -->\r
            <div class="onboarding-avatar-section">\r
                <div class="onboarding-avatar-wrapper">\r
                    <div class="onboarding-avatar-circle" id="onboardingAvatarPreview">\r
                        <span id="onboardingAvatarInitials">ST</span>\r
                        <img id="onboardingAvatarImg" src="" alt="Profile Preview" class="pub-login-u11">\r
                    </div>\r
                </div>\r
                \r
                <div class="onboarding-photo-actions">\r
                    <button type="button" class="photo-action-btn" id="onboardingTakeCamBtn">\r
                        <span class="material-symbols-outlined">photo_camera</span>\r
                        <span>Take Photo</span>\r
                    </button>\r
                    <button type="button" class="photo-action-btn" id="onboardingChooseGalleryBtn">\r
                        <span class="material-symbols-outlined">image</span>\r
                        <span>From Gallery</span>\r
                    </button>\r
                    <button type="button" class="photo-action-btn secondary pub-login-u11" id="onboardingRemovePhotoBtn">\r
                        <span class="material-symbols-outlined">restart_alt</span>\r
                        <span>Default Initials</span>\r
                    </button>\r
                </div>\r
                <input type="file" id="onboardingGalleryInput" accept="image/*" class="pub-login-u11">\r
                <p class="onboarding-photo-note">Photo is optional. Defaults to your name initials if skipped.</p>\r
            </div>\r
\r
            <!-- Camera Viewfinder Stage (Active when camera is open) -->\r
            <div class="onboarding-camera-stage pub-login-u11" id="onboardingCameraStage">\r
                <div class="camera-viewport-circle">\r
                    <video id="onboardingCameraVideo" autoplay playsinline muted></video>\r
                    <div class="camera-circular-guide"></div>\r
                </div>\r
                <div class="camera-controls-row">\r
                    <button type="button" class="cam-control-btn cancel" id="onboardingCancelCamBtn">\r
                        <span class="material-symbols-outlined">close</span>\r
                    </button>\r
                    <button type="button" class="cam-control-btn snap" id="onboardingSnapCamBtn" title="Take Photo">\r
                        <span class="snap-inner"></span>\r
                    </button>\r
                    <button type="button" class="cam-control-btn flip" id="onboardingFlipCamBtn" title="Flip Camera">\r
                        <span class="material-symbols-outlined">flip_camera_android</span>\r
                    </button>\r
                </div>\r
                <canvas id="onboardingCanvas" class="pub-login-u11"></canvas>\r
            </div>\r
\r
            <!-- Form Fields -->\r
            <form id="onboardingForm" class="onboarding-fields-form">\r
                <div class="form-row-grid">\r
                    <div class="form-group pub-login-u12">\r
                        <label class="form-label">First Name</label>\r
                        <div class="input-wrapper">\r
                            <span class="material-symbols-outlined input-icon">person</span>\r
                            <input type="text" id="onboardingFirstName" placeholder="e.g. Juan" required autocomplete="given-name">\r
                        </div>\r
                    </div>\r
                    <div class="form-group pub-login-u12">\r
                        <label class="form-label">Last Name</label>\r
                        <div class="input-wrapper">\r
                            <span class="material-symbols-outlined input-icon">badge</span>\r
                            <input type="text" id="onboardingLastName" placeholder="e.g. Dela Cruz" required autocomplete="family-name">\r
                        </div>\r
                    </div>\r
                </div>\r
\r
                <!-- (2026-07-13) Add id to Year & Section group for role hiding; was bare div -->\r
                <div class="form-group pub-login-u13" id="onboardingYearSectionGroup">\r
                    <label class="form-label pub-login-u14">Year &amp; Section</label>\r
                    <div class="year-section-wrapper pub-login-u15">\r
                        <span class="material-symbols-outlined pub-login-u16">school</span>\r
                        <input\r
                            type="text"\r
                            id="onboardingYear"\r
                            placeholder="4"\r
                            maxlength="1"\r
                            inputmode="numeric"\r
                            autocomplete="off"\r
                           \r
                            required class="pub-login-u17">\r
                        <span class="pub-login-u18">-</span>\r
                        <input\r
                            type="text"\r
                            id="onboardingSection"\r
                            placeholder="A"\r
                            maxlength="4"\r
                            autocomplete="off"\r
                           \r
                            required class="pub-login-u19">\r
                    </div>\r
                    <div class="pub-login-u20">Year 1–5 · Section letters only (e.g. A)</div>\r
                </div>\r
\r
                <!-- (2026-07-13) Staff Department field for onboarding; was absent -->\r
                <!-- (2026-07-13) Move onboarding dept inline styles to CSS; was inline -->\r
                <div class="form-group pub-login-u13 login-dept-group-hidden" id="onboardingDepartmentGroup">\r
                    <label class="form-label pub-login-u14">Department <span class="login-optional-hint">(Optional)</span></label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined input-icon">apartment</span>\r
                        <input type="text" id="onboardingDepartment" placeholder="e.g. Faculty, Admin Office, Security" autocomplete="organization">\r
                    </div>\r
                </div>\r
\r
                <div id="onboardingErrorMsg" class="error-msg pub-login-u21"></div>\r
\r
                <button type="submit" class="btn-action pub-login-u22" id="onboardingSubmitBtn">\r
                    <span id="onboardingSubmitText">Complete Profile</span>\r
                    <span class="material-symbols-outlined">arrow_forward</span>\r
                </button>\r
            </form>\r
        </div>\r
    </div>\r
\r
    <!-- Guardian Invite Modal -->\r
    <div id="guardianInviteModal" class="onboarding-modal-backdrop">\r
        <div class="onboarding-modal-card">\r
            <div class="onboarding-header">\r
                <div class="onboarding-badge-icon">\r
                    <span class="material-symbols-outlined pub-login-u23">family_restroom</span>\r
                </div>\r
                <!-- (2026-07-13) Update parent invite copy; prev: share link copy -->\r
                <h3 class="onboarding-title">Link Your Account With Your Parents</h3>\r
                <p class="onboarding-subtitle">Copy this link to link your account with your parents. Give this link to them to register.</p>\r
            </div>\r
\r
            <!-- Link Display -->\r
            <div class="pub-login-u24">\r
                <div class="pub-login-u25">Guardian Registration Link</div>\r
                <div id="guardianInviteLink" class="pub-login-u26"></div>\r
            </div>\r
\r
            <!-- Copy Button -->\r
            <button type="button" id="copyGuardianLinkBtn" class="btn-action pub-login-u12">\r
                <span class="material-symbols-outlined">content_copy</span>\r
                <span id="copyBtnText">Copy Link</span>\r
            </button>\r
\r
            <!-- Share Button (mobile) -->\r
            <button type="button" id="shareGuardianLinkBtn" class="btn-action pub-login-u27">\r
                <span class="material-symbols-outlined">share</span>\r
                <span>Share Link</span>\r
            </button>\r
\r
            <div class="pub-login-u28">\r
                <div class="pub-login-u29">\r
                    Your parent can use this link to create a guardian account and get linked to you automatically.\r
                </div>\r
            </div>\r
\r
            <button type="button" id="skipGuardianInviteBtn" class="pub-login-u30">\r
                Skip for now\r
            </button>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Student ID fallback modal; was duplicate fragment -->\r
    <div id="profileModal">\r
        <div class="modal-card">\r
            <div class="pub-login-u31">\r
                <img src="../assets/images/logo.png" alt="Securo Logo" class="pub-login-u32">\r
                <h3 class="pub-login-u33">Complete Profile</h3>\r
                <p class="text-muted small">One more thing! Please provide your Student ID to link your account.</p>\r
            </div>\r
            \r
            <div class="form-group">\r
                <label class="form-label">Student ID Number</label>\r
                <div class="input-wrapper">\r
                    <span class="material-symbols-outlined input-icon">badge</span>\r
                    <input type="text" id="modalStudentId" placeholder="1234567" maxlength="7" pattern="\\d*" inputmode="numeric" required>\r
                </div>\r
            </div>\r
\r
            <button class="btn-action pub-login-u34" id="saveModalBtn">\r
                <span>Save and Continue</span>\r
                <span class="material-symbols-outlined">check_circle</span>\r
            </button>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) 3-step student/parent OTP reset modal; was link only -->\r
    <div id="studentResetModal" class="onboarding-modal-backdrop">\r
        <div class="onboarding-modal-card pub-login-u35">\r
            <div class="pub-login-u36">\r
                <div class="pub-login-u37">\r
                    <div class="pub-login-u38">\r
                        <span class="material-symbols-outlined pub-login-u39">lock_reset</span>\r
                    </div>\r
                    <div>\r
                        <h3 class="pub-login-u40">Reset Password</h3>\r
                        <p class="pub-login-u41">OTP Verification Recovery</p>\r
                    </div>\r
                </div>\r
                <button type="button" id="closeStudentResetModalBtn" class="pub-login-u42">\r
                    <span class="material-symbols-outlined pub-login-u43">close</span>\r
                </button>\r
            </div>\r
\r
            <!-- Step 1: Enter Student ID to dispatch OTP -->\r
            <div id="studentResetFormView">\r
                <p class="pub-login-u44">\r
                    Enter your 7-Digit Student ID. We will send a 6-digit OTP to your registered email, or to your linked parent's email if no student email is set.\r
                </p>\r
\r
                <div class="input-group pub-login-u45">\r
                    <label class="pub-login-u46">7-Digit Student ID</label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined">badge</span>\r
                        <input type="text" id="studentResetIdInput" placeholder="e.g. 1234567" maxlength="7" pattern="\\d*" inputmode="numeric">\r
                    </div>\r
                </div>\r
\r
                <div id="studentResetError" class="error-msg pub-login-u12"></div>\r
\r
                <button type="button" id="studentResetSendBtn" class="btn-action pub-login-u21">\r
                    <span>Send OTP Code</span>\r
                    <span class="material-symbols-outlined">send</span>\r
                </button>\r
\r
                <button type="button" id="studentRequestAdminResetBtn" class="pub-login-u47">\r
                    <span class="material-symbols-outlined pub-login-u48">contact_support</span>\r
                    <span>Can't access email? Request Admin Reset</span>\r
                </button>\r
            </div>\r
\r
            <!-- Step 2: Enter 6-digit OTP received via email -->\r
            <div id="studentResetOtpView" class="pub-login-u49">\r
                <div class="pub-login-u50">\r
                    <span class="material-symbols-outlined pub-login-u51">mark_email_read</span>\r
                </div>\r
                <h4 class="pub-login-u52">Enter Verification OTP</h4>\r
                <p id="studentResetRecipientHint" class="pub-login-u53">\r
                    A 6-digit OTP has been sent to:\r
                </p>\r
                <div id="studentResetTargetEmail" class="pub-login-u54"></div>\r
\r
                <div class="input-group pub-login-u45">\r
                    <label class="pub-login-u46">6-Digit OTP Code</label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined">pin</span>\r
                        <input type="text" id="studentResetOtpInput" placeholder="Enter 6-digit code" maxlength="6" pattern="\\d*" inputmode="numeric" autocomplete="one-time-code">\r
                    </div>\r
                </div>\r
\r
                <div id="studentResetOtpError" class="error-msg pub-login-u12"></div>\r
\r
                <button type="button" id="studentResetVerifyOtpBtn" class="btn-action pub-login-u21">\r
                    <span>Verify OTP Code</span>\r
                    <span class="material-symbols-outlined">verified</span>\r
                </button>\r
\r
                <button type="button" id="studentResetResendOtpBtn" class="pub-login-u47">\r
                    <span class="material-symbols-outlined pub-login-u48">refresh</span>\r
                    <span>Resend OTP Code</span>\r
                </button>\r
            </div>\r
\r
            <!-- Step 3: Set New Password & Auto-Login -->\r
            <div id="studentResetNewPwdView" class="pub-login-u49">\r
                <h4 class="pub-login-u52">Set New Password</h4>\r
                <p class="pub-login-u53">\r
                    OTP verified. Enter and confirm your new password below.\r
                </p>\r
\r
                <div class="input-group pub-login-u45">\r
                    <label class="pub-login-u46">New Password</label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined">lock</span>\r
                        <input type="password" id="studentResetNewPwdInput" placeholder="Minimum 8 characters" autocomplete="new-password">\r
                    </div>\r
                </div>\r
\r
                <div class="input-group pub-login-u45">\r
                    <label class="pub-login-u46">Confirm New Password</label>\r
                    <div class="input-wrapper">\r
                        <span class="material-symbols-outlined">lock_check</span>\r
                        <input type="password" id="studentResetConfirmPwdInput" placeholder="Confirm your new password" autocomplete="new-password">\r
                    </div>\r
                </div>\r
\r
                <div id="studentResetNewPwdError" class="error-msg pub-login-u12"></div>\r
\r
                <button type="button" id="studentResetSavePwdBtn" class="btn-action pub-login-u21">\r
                    <span>Update Password & Sign In</span>\r
                    <span class="material-symbols-outlined">login</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- (2026-07-13) Add terms modal with I Agree button; was inline checkbox -->\r
    <div id="termsModal" class="onboarding-modal-backdrop">\r
        <div class="onboarding-modal-card pub-login-u56">\r
            <div class="onboarding-header pub-login-u12">\r
                <div class="onboarding-badge-icon pub-login-u57">\r
                    <span class="material-symbols-outlined pub-login-u58">description</span>\r
                </div>\r
                <h3 class="onboarding-title pub-login-u59">Terms and Conditions</h3>\r
                <p class="onboarding-subtitle">Please review and agree to continue registration.</p>\r
            </div>\r
            <!-- (2026-07-13) Add terms-content class for spacing; was unclassed container -->\r
            <div id="termsScrollBox" class="terms-content pub-login-u60">\r
                <h4 class="pub-login-u61">1. Acceptance of Terms</h4>\r
                <p class="pub-login-u21">By registering for and using the Securo campus safety application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.</p>\r
\r
                <h4 class="pub-login-u61">2. Purpose of the App</h4>\r
                <p class="pub-login-u59">Securo is designed to enhance campus safety and security by providing:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Real-time incident reporting capabilities</li>\r
                    <li>Emergency notifications and alerts</li>\r
                    <li>Campus security communication tools</li>\r
                    <li>Safety resource access for students, staff, and guardians</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">3. User Accounts and Registration</h4>\r
                <p class="pub-login-u59">To use Securo, you must:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Provide accurate and complete registration information</li>\r
                    <li>Use a valid student or staff ID number</li>\r
                    <li>Maintain the confidentiality of your account credentials</li>\r
                    <li>Notify us immediately of any unauthorized access to your account</li>\r
                    <li>Be responsible for all activities that occur under your account</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">4. User Responsibilities</h4>\r
                <p class="pub-login-u59">When using the App, you agree to:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Use the App only for legitimate campus safety purposes</li>\r
                    <li>Provide truthful and accurate information when reporting incidents</li>\r
                    <li>Not submit false reports or misuse emergency features</li>\r
                    <li>Respect the privacy and rights of other users</li>\r
                    <li>Comply with all applicable campus policies and local laws</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">5. Privacy and Data Protection</h4>\r
                <p class="pub-login-u59">We take your privacy seriously. By using Securo:</p>\r
                <ul class="pub-login-u62">\r
                    <li>You consent to the collection and use of your personal information as described in our Privacy Policy</li>\r
                    <li>Your profile information, including name, ID number, and photo (if provided), will be stored securely</li>\r
                    <li>Incident reports and communications may be monitored by campus security personnel</li>\r
                    <li>We will not share your personal information with third parties without your consent, except as required by law</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">6. Incident Reporting</h4>\r
                <p class="pub-login-u59">When reporting incidents through the App:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Submit reports promptly and accurately</li>\r
                    <li>False reporting is strictly prohibited and may result in disciplinary action</li>\r
                    <li>Reports are reviewed by campus security and appropriate authorities</li>\r
                    <li>Emergency situations should always be reported to campus security or local emergency services (911) immediately</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">7. Guardian Access</h4>\r
                <p class="pub-login-u59">For guardian accounts:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Guardians must be invited and approved by the student</li>\r
                    <li>Guardians have limited access to student safety information</li>\r
                    <li>Guardian access can be revoked by the student at any time</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">8. Prohibited Activities</h4>\r
                <p class="pub-login-u59">You may not:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Submit false or misleading information</li>\r
                    <li>Attempt to access accounts or data that do not belong to you</li>\r
                    <li>Interfere with the App's operation or security features</li>\r
                    <li>Use the App to harass, threaten, or harm others</li>\r
                    <li>Reverse engineer or attempt to extract source code from the App</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">9. Service Availability</h4>\r
                <p class="pub-login-u59">While we strive to maintain reliable service:</p>\r
                <ul class="pub-login-u62">\r
                    <li>The App is provided "as is" without warranties of any kind</li>\r
                    <li>We do not guarantee uninterrupted or error-free service</li>\r
                    <li>We may modify, suspend, or discontinue features at any time</li>\r
                    <li>In case of actual emergencies, always contact campus security or emergency services directly</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">10. Limitation of Liability</h4>\r
                <p class="pub-login-u59">To the maximum extent permitted by law:</p>\r
                <ul class="pub-login-u62">\r
                    <li>We are not liable for any damages arising from your use of the App</li>\r
                    <li>We are not responsible for the actions or inactions of campus security personnel</li>\r
                    <li>The App is a tool to assist campus safety efforts, not a substitute for emergency services</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">11. Account Termination</h4>\r
                <p class="pub-login-u59">We reserve the right to:</p>\r
                <ul class="pub-login-u62">\r
                    <li>Suspend or terminate accounts that violate these terms</li>\r
                    <li>Remove content that is inappropriate or violates policies</li>\r
                    <li>Terminate accounts upon graduation, employment termination, or at the user's request</li>\r
                </ul>\r
\r
                <h4 class="pub-login-u61">12. Changes to Terms</h4>\r
                <p class="pub-login-u21">We may update these Terms and Conditions from time to time. Continued use of the App after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes through the App or email.</p>\r
\r
                <h4 class="pub-login-u61">13. Governing Law</h4>\r
                <p class="pub-login-u21">These Terms and Conditions are governed by applicable local laws and campus policies. Any disputes will be resolved according to the procedures established by the educational institution.</p>\r
\r
                <h4 class="pub-login-u61">14. Contact Information</h4>\r
                <p class="pub-login-u21">If you have questions about these Terms and Conditions, please contact campus security or the App administrator through the official campus channels.</p>\r
\r
                <h4 class="pub-login-u61">15. Acknowledgment</h4>\r
                <p class="pub-login-u63">By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>\r
            </div>\r
            <!-- (2026-07-13) Enable terms buttons on modal open; was disabled scroll locked -->\r
            <div class="pub-login-u64">\r
                <button type="button" id="declineTermsBtn" class="pub-login-u65">\r
                    <span class="material-symbols-outlined pub-login-u66">cancel</span>\r
                    <span>Decline</span>\r
                </button>\r
                <button type="button" id="agreeTermsBtn" class="btn-action pub-login-u67">\r
                    <span class="material-symbols-outlined pub-login-u66">check_circle</span>\r
                    <span>I Agree</span>\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Firebase Scripts -->\r
    \r
    <!-- (2026-07-13) Link consolidated public module; was inline script -->\r
`,c=t(),l=()=>a(()=>import(`./public-CBSv-6As.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-login`,dataPage:`login`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));