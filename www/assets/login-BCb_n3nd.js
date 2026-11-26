const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./public-B9fwt6mq.js","./install-sw-DzuPi5je.js","./preload-helper-CGP3o08e.js"])))=>i.map(i=>d[i]);
import{a as e,i as t,n,o as r,r as i,t as a}from"./preload-helper-CGP3o08e.js";/* empty css                  *//* empty css               */r();var o=e(),s=`<!-- (2026-07-13) Dramatic intro preloader with logo; was immediate page view -->
    <div id="securo-preloader-overlay">
        <div class="securo-preloader-bg"></div>
        <div class="securo-preloader-content">
            <div class="securo-preloader-logo-wrap">
                <img src="../assets/images/logo with text.png" alt="Securo" class="securo-preloader-logo">
                <div class="securo-preloader-shimmer"></div>
            </div>
            <!-- (2026-07-13) Move indicator below logo in preloader; was above logo -->
            <div class="securo-preloader-indicator">
                <span class="securo-preloader-status-text">INITIALIZING SECURE SYSTEMS</span>
                <div class="securo-preloader-progress-track">
                    <div class="securo-preloader-progress-bar"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="toast-stack" id="toastStack" aria-live="polite"></div>

    <!-- Main Auth Card (loginHub) -->
    <div class="login-card pub-login-u1" id="loginHub">
        <!-- (2026-07-13) Remove staff terms button; was top-left anchor -->
        <div class="brand-section">
            <img src="../assets/images/logo.png" alt="Securo Logo" class="brand-logo-img">
            <h1 class="brand-name">Securo</h1>
            <p class="text-muted small" id="brandSubtitle">Secure campus access</p>
        </div>

        <div class="divider">OR USE CREDENTIALS</div>

        <div class="auth-tabs">
            <button class="tab-btn active" id="loginTab">Sign In</button>
            <button class="tab-btn" id="signupTab">Register</button>
        </div>

        <!-- Auth Form (mainAuthForm) -->
        <form id="mainAuthForm">
            <!-- Student ID (Login Only) -->
            <div class="form-group" id="identifierGroup">
                <label class="form-label" id="identifierLabel">Student ID Number</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon" id="identifierIcon">badge</span>
                    <!-- (2026-07-13) Add descriptive placeholder for ID; was 1234567 -->
                    <input type="text" id="identifier" placeholder="Enter 7-digit ID Number" maxlength="7" pattern="\\d*" inputmode="numeric" required>
                </div>
            </div>

            <!-- Student ID (Signup Only) -->
            <div class="form-group signup-only">
                <label class="form-label" id="signupIdLabel">Student ID Number</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">badge</span>
                    <!-- (2026-07-13) Add placeholder for signup ID; was empty -->
                    <input type="text" id="studentIdSignup" placeholder="Enter 7-digit ID Number" maxlength="7" pattern="\\d*" inputmode="numeric" autocomplete="off">
                </div>
            </div>

            <!-- (2026-07-13) Omit required on hidden signup email; was blocking login -->
            <div class="form-group signup-only">
                <label class="form-label">Email Address</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">mail</span>
                    <input type="email" id="studentEmailSignup" placeholder="Enter email address for OTP recovery" autocomplete="email">
                </div>
            </div>

            <!-- Password -->
            <div class="form-group">
                <label class="form-label">Password</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">lock</span>
                    <!-- (2026-07-13) Add placeholder for password; was empty -->
                    <input type="password" id="password" placeholder="Enter password" autocomplete="new-password" required>
                    <button type="button" id="togglePassword" class="btn pub-login-u2">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>

            <div class="form-group signup-only">
                <label class="form-label">Confirm Password</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">verified_user</span>
                    <!-- (2026-07-13) Add placeholder for confirm password; was empty -->
                    <input type="password" id="confirmPasswordSignup" placeholder="Confirm password" autocomplete="new-password">
                    <button type="button" id="toggleConfirmPassword" class="btn pub-login-u3">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </div>

            <!-- (2026-07-13) Remove terms checkbox from form; was inline checkbox -->

            <div class="pub-login-u4">
                <a href="#" id="forgotPassword" class="pub-login-u5">Forgot Password?</a>
            </div>

            <div id="errorMsg" class="error-msg"></div>

            <button type="submit" class="btn-action pub-login-u6" id="submitBtn">
                <span id="btnText">Enter Hub</span>
                <span class="material-symbols-outlined">login</span>
            </button>

            <!-- (2026-07-13) Remove app trailer link; prev: App Trailer link included -->
            <div class="pub-login-u7">
                <a href="../public/role-selection.html" class="pub-login-u8">Change Role</a>
                <span class="pub-login-u9">&bull;</span>
                <a href="../public/about.html" class="pub-login-u5">About Us</a>
                <span class="pub-login-u9">&bull;</span>
                <a href="../public/terms.html" class="pub-login-u8">Terms</a>
            </div>
        </form>
    </div>

    <!-- (2026-07-13) Add required onboarding modal for name, section, and photo; was simple ID modal -->
    <!-- Required Onboarding Screen Modal (onboardingModal) -->
    <div id="onboardingModal" class="onboarding-modal-backdrop">
        <div class="onboarding-modal-card">
            <div class="onboarding-header">
                <div class="onboarding-badge-icon">
                    <img src="../assets/images/logo.png" alt="Securo" class="pub-login-u10">
                </div>
                <h3 class="onboarding-title">Set Up Your Profile</h3>
                <p class="onboarding-subtitle">Complete your student identity to access your campus dashboard and safety tools.</p>
            </div>

            <!-- Profile Avatar Section -->
            <div class="onboarding-avatar-section">
                <div class="onboarding-avatar-wrapper">
                    <div class="onboarding-avatar-circle" id="onboardingAvatarPreview">
                        <span id="onboardingAvatarInitials">ST</span>
                        <img id="onboardingAvatarImg" src="" alt="Profile Preview" class="pub-login-u11">
                    </div>
                </div>
                
                <div class="onboarding-photo-actions">
                    <button type="button" class="photo-action-btn" id="onboardingTakeCamBtn">
                        <span class="material-symbols-outlined">photo_camera</span>
                        <span>Take Photo</span>
                    </button>
                    <button type="button" class="photo-action-btn" id="onboardingChooseGalleryBtn">
                        <span class="material-symbols-outlined">image</span>
                        <span>From Gallery</span>
                    </button>
                    <button type="button" class="photo-action-btn secondary pub-login-u11" id="onboardingRemovePhotoBtn">
                        <span class="material-symbols-outlined">restart_alt</span>
                        <span>Default Initials</span>
                    </button>
                </div>
                <input type="file" id="onboardingGalleryInput" accept="image/*" class="pub-login-u11">
                <p class="onboarding-photo-note">Photo is optional. Defaults to your name initials if skipped.</p>
            </div>

            <!-- Camera Viewfinder Stage (Active when camera is open) -->
            <div class="onboarding-camera-stage pub-login-u11" id="onboardingCameraStage">
                <div class="camera-viewport-circle">
                    <video id="onboardingCameraVideo" autoplay playsinline muted></video>
                    <div class="camera-circular-guide"></div>
                </div>
                <div class="camera-controls-row">
                    <button type="button" class="cam-control-btn cancel" id="onboardingCancelCamBtn">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                    <button type="button" class="cam-control-btn snap" id="onboardingSnapCamBtn" title="Take Photo">
                        <span class="snap-inner"></span>
                    </button>
                    <button type="button" class="cam-control-btn flip" id="onboardingFlipCamBtn" title="Flip Camera">
                        <span class="material-symbols-outlined">flip_camera_android</span>
                    </button>
                </div>
                <canvas id="onboardingCanvas" class="pub-login-u11"></canvas>
            </div>

            <!-- Form Fields -->
            <form id="onboardingForm" class="onboarding-fields-form">
                <div class="form-row-grid">
                    <div class="form-group pub-login-u12">
                        <label class="form-label">First Name</label>
                        <div class="input-wrapper">
                            <span class="material-symbols-outlined input-icon">person</span>
                            <input type="text" id="onboardingFirstName" placeholder="e.g. Juan" required autocomplete="given-name">
                        </div>
                    </div>
                    <div class="form-group pub-login-u12">
                        <label class="form-label">Last Name</label>
                        <div class="input-wrapper">
                            <span class="material-symbols-outlined input-icon">badge</span>
                            <input type="text" id="onboardingLastName" placeholder="e.g. Dela Cruz" required autocomplete="family-name">
                        </div>
                    </div>
                </div>

                <!-- (2026-07-13) Add id to Year & Section group for role hiding; was bare div -->
                <div class="form-group pub-login-u13" id="onboardingYearSectionGroup">
                    <label class="form-label pub-login-u14">Year &amp; Section</label>
                    <div class="year-section-wrapper pub-login-u15">
                        <span class="material-symbols-outlined pub-login-u16">school</span>
                        <input
                            type="text"
                            id="onboardingYear"
                            placeholder="4"
                            maxlength="1"
                            inputmode="numeric"
                            autocomplete="off"
                           
                            required class="pub-login-u17">
                        <span class="pub-login-u18">-</span>
                        <input
                            type="text"
                            id="onboardingSection"
                            placeholder="A"
                            maxlength="4"
                            autocomplete="off"
                           
                            required class="pub-login-u19">
                    </div>
                    <div class="pub-login-u20">Year 1–5 · Section letters only (e.g. A)</div>
                </div>

                <!-- (2026-07-13) Staff Department field for onboarding; was absent -->
                <!-- (2026-07-13) Move onboarding dept inline styles to CSS; was inline -->
                <div class="form-group pub-login-u13 login-dept-group-hidden" id="onboardingDepartmentGroup">
                    <label class="form-label pub-login-u14">Department <span class="login-optional-hint">(Optional)</span></label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined input-icon">apartment</span>
                        <input type="text" id="onboardingDepartment" placeholder="e.g. Faculty, Admin Office, Security" autocomplete="organization">
                    </div>
                </div>

                <div id="onboardingErrorMsg" class="error-msg pub-login-u21"></div>

                <button type="submit" class="btn-action pub-login-u22" id="onboardingSubmitBtn">
                    <span id="onboardingSubmitText">Complete Profile</span>
                    <span class="material-symbols-outlined">arrow_forward</span>
                </button>
            </form>
        </div>
    </div>

    <!-- Guardian Invite Modal -->
    <div id="guardianInviteModal" class="onboarding-modal-backdrop">
        <div class="onboarding-modal-card">
            <div class="onboarding-header">
                <div class="onboarding-badge-icon">
                    <span class="material-symbols-outlined pub-login-u23">family_restroom</span>
                </div>
                <!-- (2026-07-13) Update parent invite copy; prev: share link copy -->
                <h3 class="onboarding-title">Link Your Account With Your Parents</h3>
                <p class="onboarding-subtitle">Copy this link to link your account with your parents. Give this link to them to register.</p>
            </div>

            <!-- Link Display -->
            <div class="pub-login-u24">
                <div class="pub-login-u25">Guardian Registration Link</div>
                <div id="guardianInviteLink" class="pub-login-u26"></div>
            </div>

            <!-- Copy Button -->
            <button type="button" id="copyGuardianLinkBtn" class="btn-action pub-login-u12">
                <span class="material-symbols-outlined">content_copy</span>
                <span id="copyBtnText">Copy Link</span>
            </button>

            <!-- Share Button (mobile) -->
            <button type="button" id="shareGuardianLinkBtn" class="btn-action pub-login-u27">
                <span class="material-symbols-outlined">share</span>
                <span>Share Link</span>
            </button>

            <div class="pub-login-u28">
                <div class="pub-login-u29">
                    Your parent can use this link to create a guardian account and get linked to you automatically.
                </div>
            </div>

            <button type="button" id="skipGuardianInviteBtn" class="pub-login-u30">
                Skip for now
            </button>
        </div>
    </div>

    <!-- (2026-07-13) Student ID fallback modal; was duplicate fragment -->
    <div id="profileModal">
        <div class="modal-card">
            <div class="pub-login-u31">
                <img src="../assets/images/logo.png" alt="Securo Logo" class="pub-login-u32">
                <h3 class="pub-login-u33">Complete Profile</h3>
                <p class="text-muted small">One more thing! Please provide your Student ID to link your account.</p>
            </div>
            
            <div class="form-group">
                <label class="form-label">Student ID Number</label>
                <div class="input-wrapper">
                    <span class="material-symbols-outlined input-icon">badge</span>
                    <input type="text" id="modalStudentId" placeholder="1234567" maxlength="7" pattern="\\d*" inputmode="numeric" required>
                </div>
            </div>

            <button class="btn-action pub-login-u34" id="saveModalBtn">
                <span>Save and Continue</span>
                <span class="material-symbols-outlined">check_circle</span>
            </button>
        </div>
    </div>

    <!-- (2026-07-13) 3-step student/parent OTP reset modal; was link only -->
    <div id="studentResetModal" class="onboarding-modal-backdrop">
        <div class="onboarding-modal-card pub-login-u35">
            <div class="pub-login-u36">
                <div class="pub-login-u37">
                    <div class="pub-login-u38">
                        <span class="material-symbols-outlined pub-login-u39">lock_reset</span>
                    </div>
                    <div>
                        <h3 class="pub-login-u40">Reset Password</h3>
                        <p class="pub-login-u41">OTP Verification Recovery</p>
                    </div>
                </div>
                <button type="button" id="closeStudentResetModalBtn" class="pub-login-u42">
                    <span class="material-symbols-outlined pub-login-u43">close</span>
                </button>
            </div>

            <!-- Step 1: Enter Student ID to dispatch OTP -->
            <div id="studentResetFormView">
                <p class="pub-login-u44">
                    Enter your 7-Digit Student ID. We will send a 6-digit OTP to your registered email, or to your linked parent's email if no student email is set.
                </p>

                <div class="input-group pub-login-u45">
                    <label class="pub-login-u46">7-Digit Student ID</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined">badge</span>
                        <input type="text" id="studentResetIdInput" placeholder="e.g. 1234567" maxlength="7" pattern="\\d*" inputmode="numeric">
                    </div>
                </div>

                <div id="studentResetError" class="error-msg pub-login-u12"></div>

                <button type="button" id="studentResetSendBtn" class="btn-action pub-login-u21">
                    <span>Send OTP Code</span>
                    <span class="material-symbols-outlined">send</span>
                </button>

                <button type="button" id="studentRequestAdminResetBtn" class="pub-login-u47">
                    <span class="material-symbols-outlined pub-login-u48">contact_support</span>
                    <span>Can't access email? Request Admin Reset</span>
                </button>
            </div>

            <!-- Step 2: Enter 6-digit OTP received via email -->
            <div id="studentResetOtpView" class="pub-login-u49">
                <div class="pub-login-u50">
                    <span class="material-symbols-outlined pub-login-u51">mark_email_read</span>
                </div>
                <h4 class="pub-login-u52">Enter Verification OTP</h4>
                <p id="studentResetRecipientHint" class="pub-login-u53">
                    A 6-digit OTP has been sent to:
                </p>
                <div id="studentResetTargetEmail" class="pub-login-u54"></div>

                <div class="input-group pub-login-u45">
                    <label class="pub-login-u46">6-Digit OTP Code</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined">pin</span>
                        <input type="text" id="studentResetOtpInput" placeholder="Enter 6-digit code" maxlength="6" pattern="\\d*" inputmode="numeric" autocomplete="one-time-code">
                    </div>
                </div>

                <div id="studentResetOtpError" class="error-msg pub-login-u12"></div>

                <button type="button" id="studentResetVerifyOtpBtn" class="btn-action pub-login-u21">
                    <span>Verify OTP Code</span>
                    <span class="material-symbols-outlined">verified</span>
                </button>

                <button type="button" id="studentResetResendOtpBtn" class="pub-login-u47">
                    <span class="material-symbols-outlined pub-login-u48">refresh</span>
                    <span>Resend OTP Code</span>
                </button>
            </div>

            <!-- Step 3: Set New Password & Auto-Login -->
            <div id="studentResetNewPwdView" class="pub-login-u49">
                <h4 class="pub-login-u52">Set New Password</h4>
                <p class="pub-login-u53">
                    OTP verified. Enter and confirm your new password below.
                </p>

                <div class="input-group pub-login-u45">
                    <label class="pub-login-u46">New Password</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined">lock</span>
                        <input type="password" id="studentResetNewPwdInput" placeholder="Minimum 8 characters" autocomplete="new-password">
                    </div>
                </div>

                <div class="input-group pub-login-u45">
                    <label class="pub-login-u46">Confirm New Password</label>
                    <div class="input-wrapper">
                        <span class="material-symbols-outlined">lock_check</span>
                        <input type="password" id="studentResetConfirmPwdInput" placeholder="Confirm your new password" autocomplete="new-password">
                    </div>
                </div>

                <div id="studentResetNewPwdError" class="error-msg pub-login-u12"></div>

                <button type="button" id="studentResetSavePwdBtn" class="btn-action pub-login-u21">
                    <span>Update Password & Sign In</span>
                    <span class="material-symbols-outlined">login</span>
                </button>
            </div>
        </div>
    </div>

    <!-- (2026-07-13) Add terms modal with I Agree button; was inline checkbox -->
    <div id="termsModal" class="onboarding-modal-backdrop">
        <div class="onboarding-modal-card pub-login-u56">
            <div class="onboarding-header pub-login-u12">
                <div class="onboarding-badge-icon pub-login-u57">
                    <span class="material-symbols-outlined pub-login-u58">description</span>
                </div>
                <h3 class="onboarding-title pub-login-u59">Terms and Conditions</h3>
                <p class="onboarding-subtitle">Please review and agree to continue registration.</p>
            </div>
            <!-- (2026-07-13) Add terms-content class for spacing; was unclassed container -->
            <div id="termsScrollBox" class="terms-content pub-login-u60">
                <h4 class="pub-login-u61">1. Acceptance of Terms</h4>
                <p class="pub-login-u21">By registering for and using the Securo campus safety application ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.</p>

                <h4 class="pub-login-u61">2. Purpose of the App</h4>
                <p class="pub-login-u59">Securo is designed to enhance campus safety and security by providing:</p>
                <ul class="pub-login-u62">
                    <li>Real-time incident reporting capabilities</li>
                    <li>Emergency notifications and alerts</li>
                    <li>Campus security communication tools</li>
                    <li>Safety resource access for students, staff, and guardians</li>
                </ul>

                <h4 class="pub-login-u61">3. User Accounts and Registration</h4>
                <p class="pub-login-u59">To use Securo, you must:</p>
                <ul class="pub-login-u62">
                    <li>Provide accurate and complete registration information</li>
                    <li>Use a valid student or staff ID number</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access to your account</li>
                    <li>Be responsible for all activities that occur under your account</li>
                </ul>

                <h4 class="pub-login-u61">4. User Responsibilities</h4>
                <p class="pub-login-u59">When using the App, you agree to:</p>
                <ul class="pub-login-u62">
                    <li>Use the App only for legitimate campus safety purposes</li>
                    <li>Provide truthful and accurate information when reporting incidents</li>
                    <li>Not submit false reports or misuse emergency features</li>
                    <li>Respect the privacy and rights of other users</li>
                    <li>Comply with all applicable campus policies and local laws</li>
                </ul>

                <h4 class="pub-login-u61">5. Privacy and Data Protection</h4>
                <p class="pub-login-u59">We take your privacy seriously. By using Securo:</p>
                <ul class="pub-login-u62">
                    <li>You consent to the collection and use of your personal information as described in our Privacy Policy</li>
                    <li>Your profile information, including name, ID number, and photo (if provided), will be stored securely</li>
                    <li>Incident reports and communications may be monitored by campus security personnel</li>
                    <li>We will not share your personal information with third parties without your consent, except as required by law</li>
                </ul>

                <h4 class="pub-login-u61">6. Incident Reporting</h4>
                <p class="pub-login-u59">When reporting incidents through the App:</p>
                <ul class="pub-login-u62">
                    <li>Submit reports promptly and accurately</li>
                    <li>False reporting is strictly prohibited and may result in disciplinary action</li>
                    <li>Reports are reviewed by campus security and appropriate authorities</li>
                    <li>Emergency situations should always be reported to campus security or local emergency services (911) immediately</li>
                </ul>

                <h4 class="pub-login-u61">7. Guardian Access</h4>
                <p class="pub-login-u59">For guardian accounts:</p>
                <ul class="pub-login-u62">
                    <li>Guardians must be invited and approved by the student</li>
                    <li>Guardians have limited access to student safety information</li>
                    <li>Guardian access can be revoked by the student at any time</li>
                </ul>

                <h4 class="pub-login-u61">8. Prohibited Activities</h4>
                <p class="pub-login-u59">You may not:</p>
                <ul class="pub-login-u62">
                    <li>Submit false or misleading information</li>
                    <li>Attempt to access accounts or data that do not belong to you</li>
                    <li>Interfere with the App's operation or security features</li>
                    <li>Use the App to harass, threaten, or harm others</li>
                    <li>Reverse engineer or attempt to extract source code from the App</li>
                </ul>

                <h4 class="pub-login-u61">9. Service Availability</h4>
                <p class="pub-login-u59">While we strive to maintain reliable service:</p>
                <ul class="pub-login-u62">
                    <li>The App is provided "as is" without warranties of any kind</li>
                    <li>We do not guarantee uninterrupted or error-free service</li>
                    <li>We may modify, suspend, or discontinue features at any time</li>
                    <li>In case of actual emergencies, always contact campus security or emergency services directly</li>
                </ul>

                <h4 class="pub-login-u61">10. Limitation of Liability</h4>
                <p class="pub-login-u59">To the maximum extent permitted by law:</p>
                <ul class="pub-login-u62">
                    <li>We are not liable for any damages arising from your use of the App</li>
                    <li>We are not responsible for the actions or inactions of campus security personnel</li>
                    <li>The App is a tool to assist campus safety efforts, not a substitute for emergency services</li>
                </ul>

                <h4 class="pub-login-u61">11. Account Termination</h4>
                <p class="pub-login-u59">We reserve the right to:</p>
                <ul class="pub-login-u62">
                    <li>Suspend or terminate accounts that violate these terms</li>
                    <li>Remove content that is inappropriate or violates policies</li>
                    <li>Terminate accounts upon graduation, employment termination, or at the user's request</li>
                </ul>

                <h4 class="pub-login-u61">12. Changes to Terms</h4>
                <p class="pub-login-u21">We may update these Terms and Conditions from time to time. Continued use of the App after changes are posted constitutes acceptance of the updated terms. We will notify users of significant changes through the App or email.</p>

                <h4 class="pub-login-u61">13. Governing Law</h4>
                <p class="pub-login-u21">These Terms and Conditions are governed by applicable local laws and campus policies. Any disputes will be resolved according to the procedures established by the educational institution.</p>

                <h4 class="pub-login-u61">14. Contact Information</h4>
                <p class="pub-login-u21">If you have questions about these Terms and Conditions, please contact campus security or the App administrator through the official campus channels.</p>

                <h4 class="pub-login-u61">15. Acknowledgment</h4>
                <p class="pub-login-u63">By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</p>
            </div>
            <!-- (2026-07-13) Enable terms buttons on modal open; was disabled scroll locked -->
            <div class="pub-login-u64">
                <button type="button" id="declineTermsBtn" class="pub-login-u65">
                    <span class="material-symbols-outlined pub-login-u66">cancel</span>
                    <span>Decline</span>
                </button>
                <button type="button" id="agreeTermsBtn" class="btn-action pub-login-u67">
                    <span class="material-symbols-outlined pub-login-u66">check_circle</span>
                    <span>I Agree</span>
                </button>
            </div>
        </div>
    </div>

    <!-- Firebase Scripts -->
    
    <!-- (2026-07-13) Link consolidated public module; was inline script -->
`,c=t(),l=()=>a(()=>import(`./public-B9fwt6mq.js`),__vite__mapDeps([0,1,2]),import.meta.url);function u(){return(0,c.jsx)(n,{templateHtml:s,loadController:l,bodyClass:`page-login`,dataPage:`login`})}var d=document.getElementById(`root`);d&&(0,o.createRoot)(d).render((0,c.jsx)(i,{children:(0,c.jsx)(u,{})}));