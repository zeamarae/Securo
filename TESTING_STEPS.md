# Securo Testing Verification Guide

This guide covers end-to-end verification steps for all newly implemented features and fixes across the Securo Campus Safety System.

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
