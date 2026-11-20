# Securo Testing Verification Guide

This guide covers end-to-end verification steps for all newly implemented features and fixes across the Securo Campus Safety System.

<!-- (2026-07-13) Add quick testing summary checklist; was header only -->
## Quick Testing Summary Checklist
- **Terms & Conditions**: Verify removal of close button, centered agreement checkbox, Agree/Decline buttons, and automatic pre-check on registration.
- **Staff Role Experience**: Verify blue accent theme, hidden registration tab, and visible terms button.
- **Landing Page & Team Showcase**: Verify preloader, smooth scrolling, team member roster, credential-free portals, and back navigation via logo.
- **Mobile Routing & Student Logout**: Verify mobile auto-redirect to role selection and student logout routing to login.html.
- **Student-Guardian Link Consent**: Verify invitations start in pending status and require explicit student acceptance prompt.
- **Guardian Desktop View & SOS Alerting**: Verify 4-column vault desktop layout, hidden profile card, removed notification history, and siren audio + haptic vibration on SOS.
- **Geofence Offline Protection**: Verify tracking pauses with offline indicator when student signs out or goes offline.
- **Admin Command Center**: Verify clickable back logo, instant local cache population, 2.5s network timeout, collapsible icon sidebar, circular landmark radiuses, and working message replies.
- **Daily Reports & Native Hardware**: Verify real-date Excel report downloads and native Capacitor camera support.

---

### 1. About Us Page
1. Open the application landing or settings page.
2. Click on the "About Us" link located in the header navigation or the bottom settings menu.
3. Verify that the About Us page opens with proper branding, mission statement, safety pillars, emergency response details, and responsive styling.
4. Verify navigation links back to Login and Dashboard function properly.

---

### 2. Admin Command Center & Logout
1. Navigate to admin-login.html.
2. Confirm there is no public "Register Account" button or toggle.
3. Sign in with administrator credentials.
4. Verify the topbar shows live active SOS counts and message badges.
5. In the top bar or sidebar, click the "Logout" button.
6. Verify that you are signed out from Firebase Auth, session storage is cleared, and you are redirected to the login screen.
7. Click the browser Back button and verify that the Admin dashboard does not reopen.

---

### 3. Real Daily Report Generation & Excel Export
1. Log into the Admin dashboard (admin.html).
2. Navigate to the "Reports" or "Incident Queue" section.
3. Pick a specific date using the date selector.
4. Verify that real records (incidents, SOS logs, attendance records) for that chosen date are displayed in the table.
5. Filter by category or search by student name/ID.
6. Click "Download Excel Report".
7. Verify an Excel file named `Securo_Report_YYYY-MM-DD.xlsx` downloads.
8. Open the Excel file and verify the required columns:
   - Report No.
   - Student ID
   - Student Name
   - Location
   - Status
   - Date
   - Time
   - Report/Incident Type
9. Ensure there is no placeholder or dummy data exported.

---

### 4. Admin Attendance Simulator Removal
1. Inspect the Admin interface and sidebar.
2. Verify there are no buttons, cards, or controls for "Attendance Simulator" or "Simulate Time In/Out".
3. Verify attendance records only update from real campus events.

---

### 5. Profile Color Classification
1. In the Admin dashboard Users / Roster list, check different user accounts.
2. Confirm role pills have clear background colors and readable labels:
   - Student: Purple theme with "Student" label.
   - Parent/Guardian: Amber/Warm theme with "Guardian" label.
   - Staff: Sky blue theme with "Staff" label.
   - Admin: Emerald green theme with "Admin" label.
3. Verify the role text is always visible for accessibility.

---

### 6. Student to Admin Messaging
1. In a student session (index.html), open the "Message Admin" / GAD support chat drawer.
2. Type a message and send it.
3. Open the Admin dashboard in another browser window or tab.
4. Verify the message appears in real time under the Messages tab with a notification badge.
5. Click on the student conversation thread in Admin and verify the student's name and message history appear.
6. Type an Admin reply and send it.
7. Verify the student chat window receives the Admin reply instantly without page refresh.

---

### 7. Parent & Student Account Linking
1. **Prevent Invalid Student-to-Student Links**:
   - In a student account, attempt to enter another student ID or email as a guardian.
   - Verify the system rejects the operation and requires a registered guardian account.
2. **Student ID + Parent Gmail Linking**:
   - In the student dashboard, enter a registered parent's Gmail address to request linking.
   - Verify a pending link is created with the student UID and parent UID.
   - Verify the parent account receives a notification.
3. **Parent Link Request to Student**:
   - In the Guardian dashboard (guardian-dashboard.html), enter the 7-digit Student ID and submit.
   - Verify the student receives a connection request notification.
   - Accept the request on the student account.
   - Verify the parent receives an acceptance notification, and their dashboard immediately populates with the linked student's profile.
4. **Multiple Children & Multiple Guardians**:
   - Add a second student to the same parent account.
   - Verify the parent can switch between children seamlessly.
   - Link a second guardian to the same student and verify both guardians receive student alerts.

---

### 8. Student SOS Visibility & Parent Notification
1. In the student dashboard, press and hold the SOS button until activated.
2. Verify live coordinates are logged to Firebase `sos_logs`.
3. In the parent dashboard (guardian-dashboard.html):
   - Verify an urgent notification arrives: "SECuro Emergency Alert: Your linked student has triggered an SOS emergency."
   - Verify the dashboard displays the active SOS card in real time showing Student Name, SOS Status (ACTIVE), Time, Emergency Type, and Location.
   - Click "Locate Child on Map" and verify the Leaflet map centers on the emergency coordinates.
4. In the Admin Command Center:
   - Verify the SOS alert badge updates and the incident appears in the live queue.

---

### 9. Persistent Notification System
1. In the parent dashboard, view the notification tray.
2. Refresh the browser page or navigate across views.
3. Verify that notifications do not disappear after reload.
4. Mark a notification as read and verify its read state updates properly.

---

### 10. Native Camera Support (Android / Web)
1. On Android build (Capacitor):
   - Trigger SOS emergency capture or student selfie onboarding.
   - Verify runtime camera permission prompt appears.
   - Capture a photo using the native camera hardware.
   - Verify preview and upload complete successfully.
2. On browser / desktop:
   - Verify graceful fallback to web camera / canvas stream without crashing.

<!-- (2026-07-13) Add sections 11-18 testing steps; was sections 1-10 only -->
---

### 11. Terms and Conditions Agreement Flow
1. Open `terms.html`.
2. Verify that there is no close "X" button in the corner.
3. Scroll to the bottom and verify that the "back to registration" link has been removed.
4. Verify the centered "I agree to the terms and conditions" checkbox with explicit "I Agree" and "Decline" buttons.
5. Check the box and click "I Agree":
   - Verify agreement status is saved to local storage (`securo_terms_agreed`).
   - Verify smooth redirect to registration or back to login.
6. Open `login.html` and verify the registration terms checkbox is automatically pre-checked.

<!-- (2026-07-13) Remove top-left terms button test steps; was included -->
---

### 12. Securo Staff Role Styling & Access
1. Open `login.html` and select the "Securo Staff" role tab:
   - Verify the accent color adapts to vibrant blue theme (`#2563eb`).
   - Verify the registration tab and "Create Account" links are completely hidden (staff cannot self-register).
2. Open `role-selection.html`:
   - Verify the "Securo Staff" card features the vibrant blue icon styling.
   - Verify clicking it navigates to `login.html?role=staff`.

---

### 13. Landing Page Overhaul & Team Members Showcase
1. Open `landing.html` in a web browser:
   - Verify the preloader overlay appears while assets initialize.
   - Verify the "App Trailer" link is removed from the navigation.
   - Verify "Demo Access" and "Enter Portal" in the topbar are replaced by a "Sign Up" button linking to `role-selection.html`.
   - Verify smooth scrolling when clicking navigation anchors (Features, Safety, GAD, About Us, Portals).
   - Verify active navigation items highlight with purple styling.
2. Click the Securo logo in the topbar:
   - Verify it navigates back in browser history (or falls back to landing top).
3. Scroll down above the "Enter Portal" section:
   - Verify the "About Us" team showcase is visible listing the 6 members:
     - Ramil, Zea Marae
     - Santosidad, Angel Mae
     - Loon, Alexa Suzane
     - Delos Santos, Bea
     - Tangkay, Kenneth Brian
     - Ledesma, Lawrence
4. Inspect the "Enter Portal" cards:
   - Verify all credentials (emails, passwords, demo logins) have been completely removed.
   - Verify 4 clean role cards: Student, Parent / Guardian, Securo Staff, and Campus Administrator.
5. Check GAD features section:
   - Verify the "Anonymous Option" tag has been removed.

---

### 14. Mobile View Redirection & Student Logout Flow
1. Open `landing.html` or `index.html` on a mobile viewport (screen width < 768px or Capacitor Android environment):
   - If not authenticated, verify immediate redirection to `role-selection.html` (the landing page is never presented to mobile users).
   - If a student session is active, verify immediate redirection into `index.html`.
2. In the student dashboard (`index.html`), click "Log Out":
   - Verify live location tracking is stopped and online status is cleared in Firebase.
   - Verify redirect leads directly to `login.html` (not `landing.html`).

---

### 15. Student-Guardian Invitation Consent Verification
1. From a Parent/Guardian account, submit a student link request using the 7-digit Student ID.
2. Verify in Firebase `guardian_links` that the request status is `pending` (no automatic linking).
3. Log into the student account:
   - Verify the student receives a real-time prompt/notification asking to Accept or Decline the guardian link.
   - Verify the link is only activated once the student explicitly approves.

---

### 16. Guardian Dashboard Desktop View & Alert Sirens
1. Open `guardian-dashboard.html` on a desktop viewport (width >= 992px):
   - Verify the mobile bottom navigation bar is hidden.
   - Verify topbar desktop navigation tabs appear (Dashboard, Student Vault, Safety, GAD Support).
   - Verify Student Vault renders in a wide 4-column responsive grid.
2. In the Safety section:
   - Verify "Notification History" has been removed from parent view.
3. Open `profile.html` with a guardian account:
   - Verify the "My Profile" (`profile-card`) container is hidden for guardians.
4. Trigger an SOS alert on the linked student account:
   - Verify the guardian phone triggers Capacitor Haptics vibration.
   - Verify an audible audio siren synthesizer sounds on the parent dashboard.

---

### 17. Real-Time Geofence Tracking Protection
1. Log a student out or close/uninstall the student session:
   - In `guardian-dashboard.html`, observe the student map view.
   - Verify real-time tracking is paused/disabled with an offline indicator when the student is not logged in, even if their last coordinates were within campus geofence.

---

### 18. Admin Command Center Enhancements
1. Log into `admin.html`:
   - Verify topbar logo image (`logo with text.png`) is clickable and navigates back.
   - Verify initial values load immediately from local cache without delays, and network timeouts are reduced to 2.5 seconds.
2. Inspect the sidebar:
   - Verify sidebar is collapsed to 74px showing only minimalist icons by default.
   - Hover over sidebar and verify it smoothly expands to 240px to reveal labels and navigation names.
3. Open Campus Map in Admin:
   - Verify all 9 campus landmarks display Life360-style circular boundary radiuses (`L.circle`) around facility markers.
4. Open Admin Messages tab:
   - Verify `.messages-shell` occupies the full container height (`calc(100vh - 120px)`).
   - Verify conversations are deduplicated to one thread per student/guardian Messenger-style.
   - Select a conversation and click Send Reply:
     - Verify reply dispatches without `dateStr` JavaScript errors.
