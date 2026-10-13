<!-- (2026-07-13) Simplified quick testing guide; was verbose guide -->
# Securo Quick Test & Replication Guide

Use this checklist to quickly verify and replicate all updates implemented today.

---

### 1. Terms & Conditions (`terms.html`)
- [ ] **No Close Button**: Open `terms.html`, verify the top-right "X" button is removed.
- [ ] **Agreement Box**: Scroll to bottom, check "I agree to the terms and conditions".
- [ ] **Buttons**: Click "I Agree" to save agreement and return; click "Decline" to cancel.

---

### 2. Staff Role Experience (`login.html` & `role-selection.html`)
- [ ] **Blue Theme**: Select "Securo Staff" on `role-selection.html` or `login.html?role=staff` -> verify blue accent theme (`#2563eb`).
- [ ] **No Registration**: Verify registration tab is completely hidden for staff.
- [ ] **Terms Pre-Check**: Registration terms checkbox auto-checks if previously agreed in Step 1.

---

### 3. Landing Page (`landing.html`)
- [ ] **Preloader & Smooth Scroll**: Page shows intro preloader, glides smoothly when clicking navigation links, and highlights active items in purple.
- [ ] **About Us Roster**: Above "Enter Portal", verify the 6 team members:
  - Ramil, Zea Marae | Santosidad, Angel Mae | Loon, Alexa Suzane
  - Delos Santos, Bea | Tangkay, Kenneth Brian | Ledesma, Lawrence
- [ ] **Enter Portal Rework**: Verify 4 clean portal cards (Student, Guardian, Staff, Admin) with no credentials/passwords displayed.
- [ ] **Logo & Mobile Gate**: Clicking the logo navigates back; opening on mobile (< 768px) routes to `role-selection.html`.

---

### 4. Student Flow & Auth Fix (`index.html`)
- [ ] **No Redirect Loop**: Logged-in students load `index.html` directly without bouncing to role selection.
- [ ] **Logout Flow**: Logging out stops location tracking and routes to `login.html`.
- [ ] **Guardian Consent**: When a guardian requests a link, student receives an explicit Accept / Decline prompt (no automatic linking).

---

### 5. Guardian Dashboard (`guardian-dashboard.html` & `profile.html`)
- [ ] **Desktop View**: On screens >= 992px, bottom mobile nav is hidden, vault expands to 4 columns, and topbar navigation appears.
- [ ] **Clean Layout**: "Notification History" is removed from Safety page, and "My Profile" card is hidden on `profile.html`.
- [ ] **Offline Guard**: Student logging out pauses parent tracking and displays offline status.
<!-- (2026-07-13) 5s alarm on 1+ picture within 24h limit or 4h recent; was alarm on SOS trigger -->
- [ ] **Guardian 5-Second SOS Alarm (1+ Photo or Past 4 Hours, 24h Cooldown)**: When a student triggers SOS, the student device stays silent. The guardian's device sounds the 5-second emergency alarm and vibrates only once the student reports at least 1 photo or has a recent photo within the past 4 hours; multiple photos captured within a 24-hour window will not produce duplicate alarms.

---

### 6. Admin Command Center (`admin.html`)
- [ ] **Header & Back**: Clickable logo navigates back; header and action buttons align cleanly.
- [ ] **Icon Sidebar**: Sidebar starts collapsed (74px, icons only) and smoothly expands on hover (240px) with minimalist text.
- [ ] **Landmark Circles**: Campus map facilities feature Life360-style circular boundary radiuses.
- [ ] **Messages**: Full container height; replies send without `dateStr` errors.
- [ ] **Fast Cache**: Refreshing page (`F5`) renders cached stats in 0ms; streaming fetch updates values without blocking.

---

### 7. Sync Build
Run `npm run build` to sync all updated files to `www/` for Android.
