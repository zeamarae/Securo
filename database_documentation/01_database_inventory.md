# 01 — Complete Database Inventory

**Project:** Securo Campus Safety & Emergency Response System  
**Firebase Project ID:** `securo-a3c9c`  
**Primary Database Engine:** Google Cloud Firestore (NoSQL Document Database)  
**Authentication Provider:** Firebase Authentication (Email/Password + Google OAuth)  
**Secondary / Local Client Persistence:** Browser `localStorage`, `BroadcastChannel`, and IndexedDB (`SECURO_IDB_STORE`, `MSG_IDB_STORE`) used for offline resilience and cross-tab sync.

---

## Executive Summary

A full-project inspection across `js/db.js`, `js/auth.js`, `js/firebase-config.js`, `js/emergency-contacts.js`, `firestore.rules`, `public/public.js`, `student/student.js`, `staff/staff.js`, `parent/parent.js`, and `admin/admin.js` identified **15 Cloud Firestore collections** (including two singleton configuration collections and one legacy read-only collection, plus one overloaded singleton document `emergency_posts/campus_map_config`).

| # | Collection Name | Type / Pattern | Document ID (PK) | Mapped in `firestore.rules` | Status |
|---|---|---|---|---|---|
| 1 | `users` | Core Entity | `userId` (Firebase Auth UID / `system_admin_securo`) | Yes (L39) | Active |
| 2 | `user_passwords` | Support / Cache | `email` (normalized lowercase email) | Yes (L158) | Active |
| 3 | `guardian_links` | Associative / Workflow | `linkId` (Firestore Auto-ID) | Yes (L83) | Active |
| 4 | `student_locations` | 1:1 Telemetry | `studentUid` (Firebase Auth UID) | Yes (L124) | Active |
| 5 | `attendance` | Event Log (Overloaded) | `recordId` (Firestore Auto-ID) | Yes (L55) | Active |
| 6 | `sos_logs` | Incident Log | `logId` (Firestore Auto-ID) | Yes (L47) | Active |
| 7 | `emergency_posts` | Evidence Vault (Overloaded) | `postId` (Auto-ID + `campus_map_config`) | Yes (L63) | Active |
| 8 | `gad_posts` | Bulletin / Announcement | `postId` (Firestore Auto-ID) | Yes (L71) | Active |
| 9 | `messages` | Real-time Chat | `messageId` (Firestore Auto-ID) | Yes (L91) | Active |
| 10 | `gad_messages` | Structured Inquiry | `messageId` (Firestore Auto-ID) | **No** (default deny) | Active (local fallback) |
| 11 | `notifications` | Alert Feed | `notificationId` (Firestore Auto-ID) | Yes (L137) | Active |
| 12 | `audit_logs` | Immutable Audit Trail | `logId` (Firestore Auto-ID) | Yes (L150) | Active |
| 13 | `markers` | Legacy Landmarks | `markerId` (Firestore Auto-ID) | Yes (L116) | Legacy Read-Only |
| 14 | `system_settings` | Singleton Config (`campus_map`) | `configId` (`"campus_map"`) | **No** (default deny) | Active (mirrored) |
| 15 | `campus_config` | Singleton Config (`map`) | `configId` (`"map"`) | **No** (default deny) | Active (mirrored) |

---

## Detailed Entity Specifications

### 1. `users`
- **Purpose:** Unified user profile, role assignment, academic/staff metadata, online presence heartbeat, anonymous GAD alias preference, and liked GAD posts array for all 4 system roles (`student`, `staff`, `guardian`, `admin`). Also hosts a virtual presence document `users/system_admin_securo`.
- **Primary Key:** `userId` (Firestore Document ID = Firebase Auth UID or `"system_admin_securo"`).
- **Source Evidence:** `js/db.js` (L279, L856, L1100, L2012, L4862, L4935), `public/public.js` (L1254, L1495, L2716), `student/student.js` (L3237, L4694), `staff/staff.js` (L3190, L4420), `parent/parent.js` (L364, L3423), `admin/admin.js` (L5613).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `userId` | String | **PK** | No | Firebase Auth UID | Doc ID |
| `role` | String | NOT NULL | No | `'student' \| 'staff' \| 'guardian' \| 'admin'` | Role discriminator |
| `studentId` | String \| Number | **UK** (app-enforced) | Yes | `""` | 7-digit ID for `student` and `staff` |
| `firstName` | String | — | Yes | `null` | Onboarding form |
| `lastName` | String | — | Yes | `null` | Onboarding form |
| `name` | String | NOT NULL | No | Full display name | Derived from `firstName + lastName` |
| `initials` | String | — | Yes | 2-char uppercase | Derived from name |
| `email` | String | — | Yes | `""` | Personal or login email |
| `recoveryEmail` | String | — | Yes | `""` | Separate student/staff recovery email |
| `personalEmail` | String | — | Yes | `""` | Updated from profile screen |
| `authEmail` | String | — | Yes | `student.<id>@securo.app` / `staff.<id>@securo.app` | Deterministic Firebase Auth credential |
| `course` | String | — | Yes | `""` | Student-only |
| `yearLevel` | String | — | Yes | `""` | Student-only (`1`–`5`) |
| `section` | String | — | Yes | `""` | Student-only composite (`"3-A"` / `"BSIT 3-A"`) |
| `department` | String | — | Yes | `""` | Staff-only |
| `photoURL` | String (URL/DataURI) | — | Yes | `""` | Profile avatar |
| `avatar` | String (URL/DataURI) | — | Yes | `""` | Duplicate of `photoURL` |
| `guardianName` | String | — | Yes | `null` | Legacy field read by `js/emergency-contacts.js:57` |
| `guardianPhone` | String | — | Yes | `null` | Legacy field read by `js/emergency-contacts.js:54` |
| `anonAlias` | String | — | Yes | `null` | Saved anonymous GAD chat alias |
| `likedGadPosts` | Array\<String\> | Multi-valued | Yes | `[]` | Array of `gad_posts.postId` |
| `password` | String | — | Yes | `null` | Plaintext password sync cache (`saveAdminUserPassword`) |
| `passwordUpdatedAt` | Timestamp | — | Yes | `null` | Server timestamp |
| `onboardingCompleted` | Boolean | — | Yes | `false` | Set `true` after onboarding |
| `isOnline` | Boolean | — | Yes | `false` | Presence heartbeat |
| `isWatching` | Boolean | — | Yes | `null` | Guardian-only live watch indicator (`parent/parent.js:3423`) |
| `lastActiveMs` | Number | — | Yes | `null` | Epoch milliseconds |
| `lastActiveAt` | Timestamp | — | Yes | `null` | Server timestamp |
| `isDeleted` | Boolean | — | Yes | `false` | Soft-delete flag |
| `deletedAt` | String (ISO) | — | Yes | `null` | Soft-delete timestamp |
| `createdAt` | String \| Timestamp | — | Yes | ISO string | Account creation time |
| `updatedAt` | Timestamp \| String | — | Yes | `serverTimestamp()` | Last update time |

---

### 2. `user_passwords`
- **Purpose:** Email-keyed password synchronization lookup used by admin password reset and guardian password sync.
- **Primary Key:** `email` (Document ID = normalized lowercase email).
- **Source Evidence:** `js/db.js` (L4868, L4888), `firestore.rules` (L158).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `email` | String | **PK**, Logical **FK** -> `users.email` / `authEmail` | No | Normalized lowercase | Doc ID & stored field |
| `password` | String | NOT NULL | No | — | Plaintext password copy |
| `updatedAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Last reset timestamp |

---

### 3. `guardian_links`
- **Purpose:** Associative workflow collection linking `guardian` accounts to `student` accounts. Enforces application-level rules: max 1 accepted guardian per student, max 5 linked students per guardian, 30-minute invite TTL, and forbids linking `staff` or `admin` accounts. Also embeds guardian-to-student location reminder attributes.
- **Primary Key:** `linkId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L2365–L2410, L2512–L2536, L2721, L3570), `parent/parent.js` (L2099, L2134).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `linkId` | String | **PK** | No | Auto-ID | Doc ID |
| `guardianId` | String | **FK** -> `users.userId` | Yes | `""` | Empty if invited unregistered email |
| `guardianUid` | String | **FK** (Duplicate of `guardianId`) | Yes | `""` | Synonym maintained for legacy queries |
| `guardianEmail` | String | — | Yes | `""` | Denormalized normalized email |
| `guardianName` | String | — | Yes | `"Parent/Guardian"` | Denormalized from `users.name` |
| `studentUid` | String | **FK** -> `users.userId` | No | — | Resolved student UID |
| `studentId` | String | — | Yes | `""` | Denormalized 7-digit student ID |
| `studentName` | String | — | Yes | `"Student"` | Denormalized from `users.name` |
| `relationshipType` | String | — | Yes | `"parent"` | Relationship label |
| `status` | String | NOT NULL | No | `'pending' \| 'accepted' \| 'rejected' \| 'removed'` | Link lifecycle state |
| `requestedBy` | String | — | Yes | `'guardian' \| 'student'` | Request initiator |
| `permissions` | Map | Composite | Yes | `{ sosAlerts: true, attendanceAlerts: true, liveLocation: true }` | Nested boolean flags |
| `expiresAt` | Number | — | Yes | `Date.now() + 1800000` | 30-min pending invite TTL |
| `createdAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Creation time |
| `approvedAt` | Timestamp | — | Yes | `null` | Acceptance timestamp |
| `respondedAt` | Timestamp | — | Yes | `null` | Accept/reject timestamp |
| `lastSyncedAt` | Timestamp | — | Yes | `null` | Name/profile sync timestamp |
| `updatedAt` | Timestamp | — | Yes | `null` | Last update |
| `locationReminderRequestedAt` | Timestamp | — | Yes | `null` | Embedded reminder timestamp |
| `locationReminderRequestedBy` | String | **FK** -> `users.userId` | Yes | `""` | Guardian UID requesting reminder |
| `locationReminderRequestedByName` | String | — | Yes | `""` | Denormalized guardian name |
| `locationReminderMessage` | String | — | Yes | `""` | Reminder body |
| `locationReminderStudentId` | String | — | Yes | `""` | Denormalized student ID |

---

### 4. `student_locations`
- **Purpose:** Stores live campus GPS coordinates and location-sharing status for students (and staff via `staff/staff.js:620, 1058, 6100`). Coordinates are intentionally withheld when outside campus bounds (`sharingState: "outside_campus"`).
- **Primary Key:** `studentUid` (Document ID = `users.userId`).
- **Source Evidence:** `js/db.js` (L2094, L3612–L3662), `student/student.js` (L5295), `staff/staff.js` (L620, L6100).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `studentUid` | String | **PK, FK** -> `users.userId` | No | User UID | 1:1 with user |
| `lat` | Number | — | Yes | `null` | Omitted when outside campus |
| `lng` | Number | — | Yes | `null` | Omitted when outside campus |
| `isInside` | Boolean | — | Yes | `false` | Inside campus geofence flag |
| `sharingEnabled` | Boolean | — | Yes | `false` | Active sharing toggle |
| `sharingState` | String | — | Yes | `'live' \| 'outside_campus' \| 'off' \| 'permission_denied' \| 'error'` | Sharing state |
| `sharingMessage` | String | — | Yes | `""` | Human-readable status text |
| `updatedAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Last GPS update |

---

### 5. `attendance`
- **Purpose:** Overloaded event collection storing (a) campus Time-In / Time-Out attendance (`type: 'in' | 'out'`), (b) mirrored SOS dispatch markers (`type: 'sos'`), and (c) user registration directory fallback records (`type: 'profile_bootstrap'`).
- **Primary Key:** `recordId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L306, L382, L1167, L1204, L1280, L1361), `student/student.js` (L1449), `staff/staff.js` (L1454), `parent/parent.js` (L2897).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `recordId` | String | **PK** | No | Auto-ID | Doc ID |
| `userId` | String | **FK** -> `users.userId` | No | — | Subject user UID |
| `studentUid` | String | **FK** (Duplicate) | Yes | `null` | Populated on `type='sos'` |
| `studentName` | String | — | Yes | `null` | Denormalized on `type='sos'` |
| `studentId` | String | — | Yes | `null` | Denormalized on `type='sos'` |
| `role` | String | — | Yes | `null` | Populated on `type='sos'` |
| `type` | String | NOT NULL | No | `'in' \| 'out' \| 'sos' \| 'profile_bootstrap'` | Overloaded event discriminator |
| `location` | Map | Composite | Yes | `{ lat, lng, address, auto? }` | Populated on `in`/`out`/`sos` |
| `profile` | Map | Composite | Yes | `{ studentId, name, email }` | Populated on `profile_bootstrap` |
| `timestamp` | Timestamp | NOT NULL | No | `serverTimestamp()` | Event timestamp |

---

### 6. `sos_logs`
- **Purpose:** Critical SOS emergency alert records triggered by students or staff (both inside and outside campus bounds), capturing GPS snapshot, telemetry, notified guardian UIDs, and optional evidence photo attachment.
- **Primary Key:** `logId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L366, L415, L1271, L4059), `student/student.js` (L5366, L6567), `staff/staff.js` (L5048, L6246).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `logId` | String | **PK** | No | Auto-ID | Doc ID |
| `userId` | String | **FK** -> `users.userId` | No | — | Triggering user UID |
| `studentUid` | String | **FK** (Duplicate) | No | Same as `userId` | Legacy alias |
| `guardianUids` | Array\<String\> | Multi-valued **FK** list | Yes | `[]` | Accepted linked guardians |
| `userName` | String | — | Yes | `""` | Denormalized from `users.name` |
| `userEmail` | String | — | Yes | `""` | Denormalized from `users.email` |
| `studentId` | String | — | Yes | `""` | Denormalized 7-digit ID |
| `role` | String | — | Yes | `'student'` | `'student' \| 'staff'` |
| `location` | Map | Composite | Yes | `{ lat, lng, address?, accuracy?, outOfBounds? }` | Static SOS GPS snapshot |
| `accuracy` | Number | — | Yes | `null` | GPS accuracy in meters |
| `battery` | Number | — | Yes | `null` | Battery percentage |
| `emergencyType` | String | — | Yes | `'sos'` | Incident category |
| `status` | String | NOT NULL | No | `'active'` | Dispatch state |
| `hasPhoto` | Boolean | — | Yes | `null` | Set `true` by `attachPhotoToActiveSOS` |
| `lastPhoto` | String (DataURI) | — | Yes | `null` | Attached evidence photo |
| `lastPhotoAt` | Timestamp | — | Yes | `null` | Photo attachment timestamp |
| `timestamp` | Timestamp | NOT NULL | No | `serverTimestamp()` | SOS trigger timestamp |

---

### 7. `emergency_posts`
- **Purpose:** Digital Vault evidence packages (camera photos, audio, video captures) created during SOS or manual vault uploads, with separate visibility toggles for GAD Admin (`gadVisible`) and Guardians (`guardianVisible`). **Overloaded:** also holds singleton fallback document `emergency_posts/campus_map_config` for campus geofence/buildings sync (`js/db.js:4301`).
- **Primary Key:** `postId` (Firestore Auto-ID, plus literal `"campus_map_config"`).
- **Source Evidence:** `js/db.js` (L437–L765, L4301), `student/student.js` (L5473), `staff/staff.js` (L5148).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `postId` | String | **PK** | No | Auto-ID | Doc ID |
| `userId` | String | **FK** -> `users.userId` | No | — | Uploader UID |
| `userName` | String | — | Yes | `"Student"` | Denormalized |
| `studentId` | String | — | Yes | `""` | Denormalized |
| `attachments` | Array\<Map\> | Multi-valued | Yes | `[]` | Items `{ id, kind, src, name?, capturedAt? }` |
| `location` | Map | Composite | Yes | `{ lat, lng, address? }` | Capture coordinates |
| `gadVisible` | Boolean | NOT NULL | No | `true` | Admin/GAD access flag |
| `guardianVisible` | Boolean | NOT NULL | No | `true` | Guardian access flag |
| `status` | String | NOT NULL | No | `'posted'` | Vault post state |
| `createdAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Creation time |

---

### 8. `gad_posts`
- **Purpose:** Gender and Development (GAD) bulletins and announcements published by Admin/Staff and viewable/likeable by all signed-in users.
- **Primary Key:** `postId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L927–L1147), `admin/admin.js` (L4748).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `postId` | String | **PK** | No | Auto-ID | Doc ID |
| `author` | String | — | Yes | `"GAD Office"` | Display publisher name |
| `email` | String | Logical **FK** -> `users.email` | Yes | `""` | Publisher email |
| `content` | String | NOT NULL | No | — | Post body text |
| `image` | String (URL/DataURI) | — | Yes | `""` | Optional post image |
| `timestamp` | String | — | Yes | Locale string | Formatted display date |
| `likes` | Number | Derived | No | `0` | Derived length of `likedBy` |
| `likedBy` | Array\<String\> | Multi-valued **FK** list | No | `[]` | Array of `users.userId` |
| `createdAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Creation time |
| `updatedAt` | Timestamp | — | Yes | `null` | Edit time |

---

### 9. `messages`
- **Purpose:** Unified real-time messaging collection supporting named and anonymous GAD Support conversations between `student`, `staff`, `guardian`, and Admin (`system_admin_securo`). Supports per-message deletion (hard delete with soft-delete fallback `deleted: true`), read/seen receipts, and replied tracking.
- **Primary Key:** `messageId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L1642–L1987), `student/student.js` (L4994, L6721), `staff/staff.js` (L4720, L6400), `parent/parent.js` (L2479), `admin/admin.js` (L5385).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `messageId` | String | **PK** | No | Auto-ID | Doc ID |
| `threadId` | String | NOT NULL | No | Sorted `participantA_participantB` | Uses `uid__anon` for anonymous threads |
| `senderId` | String | **FK** -> `users.userId` | No | — | Sender UID or `system_admin_securo` |
| `senderUid` | String | **FK** (Duplicate) | No | Same as `senderId` | Legacy alias |
| `receiverId` | String | **FK** -> `users.userId` | No | — | Receiver UID or `system_admin_securo` |
| `recipientUid` | String | **FK** (Duplicate) | No | Same as `receiverId` | Legacy alias |
| `ownerId` | String | **FK** -> `users.userId` | Yes | `""` | True account UID behind anonymous session |
| `text` | String | NOT NULL | No | — | Message body |
| `message` | String | Duplicate | No | Same as `text` | Legacy alias |
| `senderName` | String | — | No | `"User"` | Denormalized name or alias |
| `senderLabel` | String | Duplicate | Yes | `""` | Display label |
| `clientName` | String | — | Yes | `""` | Thread client name/alias |
| `targetUserName` | String | — | Yes | `null` | Set on admin replies |
| `senderRole` | String | NOT NULL | No | `'student' \| 'staff' \| 'guardian' \| 'admin'` | Role for color coding |
| `recipientRole` | String | NOT NULL | No | `'student' \| 'staff' \| 'guardian' \| 'admin'` | Target role |
| `supportMode` | String | — | Yes | `'gad_support'` / `""` | Channel mode |
| `isAnonymous` | Boolean | NOT NULL | No | `false` | Anonymous mode flag |
| `anonymousAlias` | String | — | Yes | `""` | Custom user-chosen alias |
| `anonymousSessionId` | String | — | Yes | `""` | Legacy anonymous session token |
| `read` | Boolean | NOT NULL | No | `false` | Read indicator |
| `seen` | Boolean | Duplicate | No | `false` | Synonym of `read` |
| `seenAt` | Timestamp | — | Yes | `null` | Read timestamp |
| `status` | String | NOT NULL | No | `'delivered' \| 'seen' \| 'replied'` | Delivery state |
| `repliedAt` | Timestamp | — | Yes | `null` | Reply timestamp |
| `repliedBy` | String | — | Yes | `null` | Admin display name |
| `deleted` | Boolean | — | Yes | `null` | Soft-delete fallback |
| `deletedAt` | Timestamp | — | Yes | `null` | Soft-delete timestamp |
| `timestamp` | Timestamp | NOT NULL | No | `serverTimestamp()` | Sent timestamp |

---

### 10. `gad_messages`
- **Purpose:** Structured GAD support and counseling inquiry forms submitted by students/staff (mirrored automatically into `messages` in `js/db.js:4133`). **Important finding:** not declared in `firestore.rules`, so Firestore writes fall back to `localStorage` unless rules are extended.
- **Primary Key:** `messageId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L1968, L4100–L4234).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `messageId` | String | **PK** | No | Auto-ID | Doc ID |
| `studentUid` | String | **FK** -> `users.userId` | No | — | Submitter UID |
| `studentName` | String | NOT NULL | No | Real name or alias | Masked when `isAnonymous=true` |
| `studentId` | String | — | Yes | `""` | Blanked when `isAnonymous=true` |
| `role` | String | — | Yes | `'student'` | `'student' \| 'staff' \| 'guardian'` |
| `isAnonymous` | Boolean | NOT NULL | No | `false` | Confidentiality flag |
| `anonymousAlias` | String | — | Yes | `""` | Alias string |
| `subject` | String | NOT NULL | No | `"General Inquiry"` | Inquiry title |
| `category` | String | NOT NULL | No | `"counseling"` | Inquiry category |
| `message` | String | NOT NULL | No | — | Inquiry body |
| `location` | Map | Composite | Yes | `null` | Optional GPS map |
| `status` | String | NOT NULL | No | `'open' \| 'answered'` | Ticket state |
| `reply` | String | — | Yes | `null` | Admin reply text |
| `repliedAt` | Timestamp | — | Yes | `null` | Reply timestamp |
| `repliedBy` | String | — | Yes | `null` | Admin name |
| `deleted` | Boolean | — | Yes | `null` | Soft-delete fallback |
| `createdAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Submission timestamp |

---

### 11. `notifications`
- **Purpose:** Persistent cross-role notifications for SOS alerts, guardian link invitations/decisions, chat messages, GAD bulletins, password reset alerts/OTPs, and location reminders.
- **Primary Key:** `notificationId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L2314, L2413, L2541, L3790–L3914, L4641–L4735), `public/public.js` (L928, L1038), `parent/parent.js` (L3125).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `notificationId` | String | **PK** | No | Auto-ID | Doc ID |
| `userId` | String | **FK** -> `users.userId` | No | Recipient UID / `'admin'` / email | Primary query key |
| `recipientUid` | String | **FK** (Duplicate) | No | Same as `userId` | Secondary query key |
| `recipientEmail` | String | — | Yes | `""` | Email lookup key for unregistered guardians |
| `sourceUserId` | String | **FK** -> `users.userId` | Yes | `""` / `'gad_office'` | Event initiator |
| `sourceName` | String | — | Yes | `""` | Denormalized sender name |
| `type` | String | NOT NULL | No | `'info' \| 'sos' \| 'guardian_request' \| 'student_guardian_request' \| 'guardian_request_accepted' \| 'guardian_request_declined' \| 'chat_message' \| 'gad' \| 'gad_bulletin' \| 'location_request_sent' \| 'child_password_reset_otp' \| 'password_reset_request'` | Event category |
| `title` | String | NOT NULL | No | `"Notification"` | Heading |
| `message` | String | NOT NULL | No | `""` | Body copy |
| `priority` | String | NOT NULL | No | `'normal' \| 'high' \| 'urgent'` | Urgency |
| `status` | String | NOT NULL | No | `'active'` | Lifecycle status |
| `relatedId` | String | Polymorphic ref | Yes | `""` | Thread/link/student/incident ID |
| `requestId` | String | **FK** -> `guardian_links.linkId` | Yes | `""` | Set for guardian invite notifications |
| `studentId` | String | — | Yes | `""` | Denormalized 7-digit ID |
| `metadata` | Map | Composite / Polymorphic | Yes | `{}` | Variable keys (`postId`, `linkId`, `location`, `resolvedStatus`) |
| `actionUrl` | String | — | Yes | `null` | Optional navigation target |
| `resolvedStatus` | String | — | Yes | `""` | `'accepted' \| 'rejected' \| 'cancelled'` |
| `expiresAt` | Number | — | Yes | `null` | Invite expiry epoch ms |
| `isRead` | Boolean | NOT NULL | No | `false` | Read flag |
| `read` | Boolean | Duplicate | No | `false` | Synonym of `isRead` |
| `readAt` | Timestamp | — | Yes | `null` | Read timestamp |
| `createdAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Creation time |

---

### 12. `audit_logs`
- **Purpose:** Append-only security compliance log (`allow update: if false; allow delete: if false;` in `firestore.rules:153-154`) recording user authentication events.
- **Primary Key:** `logId` (Firestore Auto-ID).
- **Source Evidence:** `js/db.js` (L4479–L4527), `js/auth.js` (L246, L270, L312, L350, L465).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `logId` | String | **PK** | No | Auto-ID | Doc ID |
| `userId` | String | **FK** -> `users.userId` | No | `'unknown'` | Actor UID |
| `action` | String | NOT NULL | No | `'login' \| 'signup' \| 'logout' \| 'password_change'` | Audited event |
| `details` | Map | Composite / Polymorphic | Yes | `{}` | `{ method, identifier, email, passwordStrength }` |
| `ipAddress` | String | — | Yes | `null` | Reserved placeholder |
| `userAgent` | String | NOT NULL | No | `navigator.userAgent` | Client browser string |
| `sessionId` | String | NOT NULL | No | `sessionStorage` ID / `'no_session'` | Client session identifier |
| `timestamp` | Timestamp | NOT NULL | No | `serverTimestamp()` | Event timestamp |

---

### 13. `markers` *(Legacy Read-Only)*
- **Purpose:** Legacy standalone campus marker collection permitted in `firestore.rules:116` and read by `getCampusMarkers()` (`js/db.js:882`). No write operation (`addDoc`/`setDoc`/`updateDoc`) exists anywhere in the project; active marker CRUD now writes to `buildings[]` inside `system_settings/campus_map`, `campus_config/map`, and `emergency_posts/campus_map_config`.
- **Primary Key:** `markerId` (Firestore Auto-ID).
- **Attributes:** Schemaless / unverified in write paths (documented as an unverified legacy schema).

---

### 14 & 15. `system_settings` (Doc: `campus_map`) & `campus_config` (Doc: `map`)
- **Purpose:** Triplicated singleton configuration documents (simultaneously written to `system_settings/campus_map`, `campus_config/map`, and `emergency_posts/campus_map_config` in `js/db.js:4300-4302`) storing the campus geofence polygon vertices and all campus place markers with their adjustable circular zone radii.
- **Primary Key:** Literal singleton Doc ID (`"campus_map"` in `system_settings`, `"map"` in `campus_config`).
- **Source Evidence:** `js/db.js` (L4249–L4450), `admin/admin.js` (L3581, L3809, L3855).

| Attribute | Data Type | Key / Constraint | Nullable | Default / Values | Notes |
|---|---|---|---|---|---|
| `configId` | String | **PK** | No | `"campus_map"` / `"map"` | Singleton Doc ID |
| `geofence` | Array\<Map\> | Multi-valued | No | `[{ lat: Number, lng: Number }]` | Ordered polygon perimeter vertices |
| `geofenceJson` | String | Redundant JSON | No | Serialized `[[lat, lng], ...]` | String mirror of `geofence` |
| `buildings` | Array\<Map\> | Multi-valued | No | `[{ name, icon, lat, lng, desc, radius }]` | Campus facility markers + zone radius (meters) |
| `buildingsJson` | String | Redundant JSON | No | Serialized buildings array | String mirror of `buildings` |
| `updatedAt` | Timestamp | NOT NULL | No | `serverTimestamp()` | Last map update |

---

## Auxiliary Client-Side Storage *(Non-Firestore)*
Not modeled as server database tables, documented for architectural completeness:
- **IndexedDB:** `SECURO_IDB_STORE` (`admin/admin.js:2450`) caches admin dashboard hydration payloads; `MSG_IDB_STORE` (`js/db.js:1481`) caches chat messages locally.
- **`localStorage`:** `emergency_contacts` (`js/emergency-contacts.js:48`, user custom quick-dial numbers — client-only, never persisted to Firestore), `securo_custom_geofence`, `securo_campus_buildings`, `securo_user_directory`, `securo_user_presence_map`, and offline fallback queues.
- **Firebase Storage:** Initialized in `js/firebase-config.js:47` (`getStorage(app)`), but **not called** anywhere in application code; images are currently persisted as base64 Data URIs directly inside Firestore documents (`users.photoURL`, `sos_logs.lastPhoto`, `emergency_posts.attachments[].src`, `gad_posts.image`).
