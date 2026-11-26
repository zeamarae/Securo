# 02 — Entity & Relationship Analysis

This document catalogs every verified relationship across the Securo Cloud Firestore database, distinguishing **application-enforced UID/document-ID references** from **logical/soft references** (email matching, array membership, polymorphic IDs, and document mirrors). Because Cloud Firestore is a schemaless document database, no native SQL `FOREIGN KEY` constraints exist; all relationships below are verified directly against queries, writes, subscriptions, and `firestore.rules`.

---

## Complete Verified Relationship Matrix (17 Existing Relationships)

| # | Parent Entity | Child Entity | Referenced PK | Foreign Key / Reference Field | Cardinality | Participation (Parent -> Child) | Reference Type | Codebase Evidence |
|---|---|---|---|---|---|---|---|---|
| R1 | `users` | `user_passwords` | `users.email` / `authEmail` | `user_passwords.email` (PK) | **1 : 0..1** | Optional -> Mandatory | Logical (Email key match) | `js/db.js:4862-4888` (`saveAdminUserPassword`, `getAdminUserPassword`) |
| R2 | `users` | `audit_logs` | `users.userId` | `audit_logs.userId` | **1 : 0..N** | Optional -> Mandatory | Verified UID Reference | `js/db.js:4482,4507`, `js/auth.js:246,270,312,350,465` |
| R3 | `users` | `student_locations` | `users.userId` | `student_locations.studentUid` (PK=FK) | **1 : 0..1** | Optional -> Mandatory | Shared PK Reference | `js/db.js:2021,2094,3612-3662`, `firestore.rules:124` |
| R4 | `users` | `attendance` | `users.userId` | `attendance.userId` (dup `studentUid`) | **1 : 0..N** | Optional -> Mandatory | Verified UID Reference | `js/db.js:306,382,1167,1186,3589`, `firestore.rules:55` |
| R5 | `users` *(role=`student`)* | `guardian_links` | `users.userId` | `guardian_links.studentUid` | **1 : 0..N** *(max 1 `accepted`)* | Optional -> Mandatory | Verified UID Reference | `js/db.js:2371,2472,2518,2631,3390` |
| R6 | `users` *(role=`guardian`)* | `guardian_links` | `users.userId` | `guardian_links.guardianId` (dup `guardianUid`) | **0..1 : 0..N** *(max 5 `accepted`)* | Optional -> Optional *(email invite)* | Verified UID + Email Fallback | `js/db.js:2258,2367,2513,3154` |
| R7 | `users` *(role=`guardian`)* | `guardian_links` *(reminder)* | `users.userId` | `guardian_links.locationReminderRequestedBy` | **0..1 : 0..N** | Optional -> Optional | Embedded Reference | `js/db.js:3571` (`requestStudentLocationReminder`) |
| R8 | `users` *(student/staff)* | `sos_logs` | `users.userId` | `sos_logs.userId` (dup `studentUid`) | **1 : 0..N** | Optional -> Mandatory | Verified UID Reference | `js/db.js:366,409,1341,4059`, `firestore.rules:50` |
| R9 | `users` *(role=`guardian`)* | `sos_logs` | `users.userId` | `sos_logs.guardianUids[]` | **M : N** *(array ref)* | Optional -> Optional | Multi-Valued Array Ref | `js/db.js:366` (`guardianUids` populated from accepted `guardian_links`) |
| R10 | `users` | `emergency_posts` | `users.userId` | `emergency_posts.userId` | **1 : 0..N** | Optional -> Mandatory | Verified UID Reference | `js/db.js:437,487`, `firestore.rules:66` |
| R11 | `users` *(admin/staff)* | `gad_posts` | `users.email` | `gad_posts.email` | **0..1 : 0..N** | Optional -> Optional | Logical (Publisher email) | `admin/admin.js:4748`, `js/db.js:927`, `firestore.rules:73` |
| R12 | `users` | `gad_posts` *(likes)* | `users.userId` / `gad_posts.postId` | `gad_posts.likedBy[]` & `users.likedGadPosts[]` | **M : N** *(bidirectional arrays)* | Optional -> Optional | Dual Multi-Valued Array Ref | `js/db.js:1058-1108`, `firestore.rules:77` |
| R13 | `users` | `messages` | `users.userId` | `messages.senderId`, `receiverId`, `ownerId` | **1 : 0..N** *(3 roles)* | Optional -> Mandatory *(sender/receiver)* / Optional *(owner)* | Verified UID Reference | `js/db.js:1744-1770,1892`, `firestore.rules:91-112` |
| R14 | `users` | `gad_messages` | `users.userId` | `gad_messages.studentUid` | **1 : 0..N** | Optional -> Mandatory | Verified UID Reference | `js/db.js:4105,4147,4181` |
| R15 | `users` | `notifications` | `users.userId` | `notifications.userId` (dup `recipientUid`), `sourceUserId` | **0..1 : 0..N** *(recipient/source)* | Optional -> Optional *(allows `'admin'` / email)* | Verified UID + Sentinel | `js/db.js:3799-3822,3907`, `firestore.rules:137-146` |
| R16 | `guardian_links` | `notifications` | `guardian_links.linkId` | `notifications.requestId` | **0..1 : 0..N** | Optional -> Optional | Verified Doc ID Ref | `js/db.js:2314,2421,2550,2886` |
| R17 | `system_settings` | `campus_config` & `emergency_posts/campus_map_config` | `campus_map` | Identical triplicated write payload | **1 : 1** *(mirror)* | Mandatory -> Mandatory | Architectural Mirror | `js/db.js:4300-4302,4392-4409` |

---

## Business-Rule & Role-Separation Verification

1. **Students vs. Staff Separation:**
   - Verified in `js/db.js:2447, 2467` and `public/public.js:189`: **Staff accounts CANNOT link to Guardians.** Only users with `role == 'student'` can participate as the child side of `guardian_links`, and `staff` / `admin` accounts are explicitly blocked from acting as guardians.
   - However, in the existing database, **both** `student` and `staff` share `users` and write live coordinates to `student_locations` (`staff/staff.js:620, 1058, 6100`), log Time-In/Out to `attendance`, trigger `sos_logs`, and upload `emergency_posts`.
2. **Guardian Capacity Constraints:**
   - Verified in `js/db.js:2470-2475, 2753-2795`: A student may have at most **1** `accepted` record in `guardian_links` at any given time (historical `rejected`/`removed` or `pending` records may coexist, hence physical `1:0..N` with a logical `1:0..1` active constraint).
   - A guardian may monitor multiple students (enforced via `assertGuardianCapacityForRequest`).
3. **Anonymous GAD Messaging Thread Separation:**
   - Verified in `js/db.js:4132`, `student/student.js:4994`, `staff/staff.js:4720`, `parent/parent.js:2479`: When a user messages GAD anonymously, `threadId` uses `<uid>__anon_system_admin_securo` while `ownerId` and `senderId` still retain the authenticated UID for Firestore security rules (`firestore.rules:94-95`). Named threads use `<uid>_system_admin_securo`.

---

## Uncertain / Unverified Relationships (Explicitly Flagged)

| Item | Observation | Reason Marked Uncertain |
|---|---|---|
| `markers` -> any entity | Defined in `firestore.rules:116` and read via `getCampusMarkers()` (`js/db.js:882`). | No write path (`addDoc`/`setDoc`) or foreign key exists in the codebase. Treated as an isolated legacy collection in existing diagrams and unified into `campus_places` in the proposed 3NF design. |
| `notifications.relatedId` -> polymorphic target | Holds `threadId` (`chat_message`), `linkId` (`guardian_request`), `studentId` (`password_reset_request`), or `incidentId`. | Polymorphic string reference without a discriminator column; cannot be modeled as a single hard FK in existing ERD. |
| `gad_posts.email` -> `users.email` | Stores publisher email string (`admin/admin.js:4748`), not `authorUid`. | Logical email match only; breaks if admin/staff changes email. Resolved to `author_user_id` FK in 3NF. |
| `users/system_admin_securo` | Virtual presence document written by `startUserPresenceHeartbeat` (`js/db.js:4954`) and used as `receiverId` in `messages`. | Not a Firebase Auth UID, yet referenced as a `users` document ID. In 3NF, modeled as a real admin `users` row or assigned admin FK. |
| `notifications.userId = 'admin'` | Several callers (`js/db.js:1794, 4154`, `public/public.js:1038`) write literal `'admin'` instead of an actual admin UID. | Sentinel string rather than a valid `users.userId` FK. |
