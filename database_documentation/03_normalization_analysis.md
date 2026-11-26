# 03 — Database Normalization Analysis (1NF, 2NF, 3NF)

## Context: Document Store vs. Relational Normalization

Securo currently runs on **Google Cloud Firestore**, a NoSQL document database where controlled denormalization (embedding coordinates, repeating display names for fast reads without joins, and duplicating arrays for security-rule filtering) is an intentional engineering trade-off.

To evaluate the schema rigorously against relational database theory without modifying the running application, this analysis:
1. Evaluates the **actual existing Firestore schema** against **1NF, 2NF, and 3NF**.
2. Identifies every concrete normalization violation with exact file/line evidence.
3. Distinguishes **intentional NoSQL patterns** from **structural anomalies** (data duplication, entity overloading, update anomalies, and security-rule drift).
4. Maps every violation to a justified correction in the **Proposed 3NF Relational Schema** (`05_proposed_3nf/`).

---

## A. First Normal Form (1NF) Evaluation

**1NF Criteria:** Atomic attribute values, no repeating groups or multi-valued arrays, unique primary key per record, no duplicate synonymous columns.

**Verdict for Existing Database:** **FAILS 1NF** (10 concrete violation groups across 9 collections).

| # | Entity | Violating Attribute(s) | Violation Type | Evidence | Proposed 1NF Correction |
|---|---|---|---|---|---|
| 1NF-1 | `users` & `gad_posts` | `users.likedGadPosts[]` and `gad_posts.likedBy[]` | Multi-valued arrays + dual storage of same M:N relationship | `js/db.js:1058-1108` | Extract associative table **`gad_post_likes(post_id, user_id, liked_at)`**; remove both arrays and derived `gad_posts.likes`. |
| 1NF-2 | `sos_logs` | `guardianUids[]` | Multi-valued array of foreign keys | `js/db.js:366` | Extract associative table **`sos_log_recipients(sos_log_id, guardian_user_id, notified_at)`**. |
| 1NF-3 | `emergency_posts` | `attachments[]` (`Array<Map>`) | Repeating nested group of media objects | `js/db.js:437,645`, `student/student.js:5473` | Extract child table **`emergency_post_attachments(attachment_id, post_id, media_kind, media_url, file_name, captured_at)`**. |
| 1NF-4 | `system_settings` / `campus_config` | `geofence[]`, `geofenceJson` | Repeating coordinate vertices + serialized JSON copy | `js/db.js:4251-4289` | Extract ordered child table **`campus_geofence_vertices(vertex_id, config_id, sequence_order, latitude, longitude)`**. |
| 1NF-5 | `system_settings` / `campus_config` | `buildings[]`, `buildingsJson` | Repeating embedded facility markers + JSON copy | `js/db.js:4255-4290` | Extract child table **`campus_places(place_id, config_id, name, icon, description, latitude, longitude, zone_radius_meters, updated_at)`** (also absorbs legacy `markers`). |
| 1NF-6 | `guardian_links` | `permissions` (`Map`) | Non-atomic nested object (`sosAlerts`, `attendanceAlerts`, `liveLocation`) | `js/db.js:2374,2523` | Flatten to atomic boolean columns: `perm_sos_alerts`, `perm_attendance_alerts`, `perm_live_location`. |
| 1NF-7 | `attendance`, `sos_logs`, `emergency_posts`, `gad_messages` | `location` (`Map`) | Non-atomic composite coordinate object | `js/db.js:366,437,1167,4113` | Flatten to atomic columns (`latitude`, `longitude`, `location_address`, `is_out_of_bounds`, `is_auto_logged`). |
| 1NF-8 | `users` | `section` (e.g. `"BSIT 3-A"`), `name` + `initials` | Composite concatenated string | `student/student.js:3235` | Store atomic `course`, `year_level`, `section_code` in `student_profiles`; compute `initials` at presentation layer. |
| 1NF-9 | `users`, `guardian_links`, `sos_logs`, `messages`, `notifications` | Duplicate synonym fields: `photoURL`/`avatar`, `guardianId`/`guardianUid`, `userId`/`studentUid`, `senderId`/`senderUid`, `receiverId`/`recipientUid`, `text`/`message`, `read`/`seen`, `isRead`/`read`, `relatedId`/`requestId` | Redundant repeating attributes for the same fact | `js/db.js:1744-1767,2367,3799-3817` | Consolidate each pair to one canonical column. |
| 1NF-10 | `attendance` | `profile` (`Map` on `type='profile_bootstrap'`) | Non-atomic nested object from entity overloading | `js/db.js:306` | Remove `profile_bootstrap` rows from `attendance_logs`; store profiles solely in `users`. |

*(Note: `audit_logs.details` is retained as `details_json` in the proposed 3NF schema alongside extracted `auth_method` because audit event metadata is intentionally heterogeneous across event types; this is explicitly documented as a deliberate semi-structured exception.)*

---

## B. Second Normal Form (2NF) Evaluation

**2NF Criteria:** Satisfies 1NF, and every non-key attribute is fully functionally dependent on the **entire** primary key (no partial dependencies on a subset of a composite key).

**Verdict for Existing Database:** **FAILS 2NF** (fails prerequisite 1NF, plus exhibits thread-key partial/repeating dependency in `messages` and requires composite-key verification on newly extracted associative tables).

| # | Entity | Determinant / Key Issue | Violation Explanation | Proposed 2NF Correction |
|---|---|---|---|---|
| 2NF-1 | `messages` | Logical composite key `threadId = sort(participantA, participantB)` embedded inside every message row | Thread-level metadata (`supportMode`, `isAnonymous`, `anonymousAlias`, `anonymousSessionId`, `clientName`, `ownerId`) depends solely on `threadId`, not on individual `messageId` or `timestamp`. Updating an alias or client name requires updating all historical message documents (update anomaly). | Extract **`chat_threads(thread_id PK, initiator_user_id FK, assigned_admin_id FK, support_mode, is_anonymous, anonymous_alias, created_at, updated_at)`** and reference `thread_id` as FK from **`chat_messages`**. |
| 2NF-2 | Newly extracted associative tables (`gad_post_likes`, `sos_log_recipients`) | Composite PKs `(post_id, user_id)` and `(sos_log_id, guardian_user_id)` | Every non-key attribute (`liked_at`, `notified_at`) depends on the **full** composite key (when *that* user liked *that* post; when *that* guardian was notified of *that* SOS). | Verified 2NF-compliant with zero partial dependencies. |

---

## C. Third Normal Form (3NF) Evaluation

**3NF Criteria:** Satisfies 2NF, and no non-key attribute is transitively dependent on a primary key through another non-key attribute (every non-key attribute depends on *"the key, the whole key, and nothing but the key"*). Independent entities must not be overloaded into a single table.

**Verdict for Existing Database:** **FAILS 3NF** (7 major transitive-dependency and entity-overloading violation groups).

| # | Entity | Transitive Chain / Anomaly | Evidence | Proposed 3NF Correction |
|---|---|---|---|---|
| 3NF-1 | `users` | `userId -> role -> {studentId, course, yearLevel, section, guardianName, guardianPhone}` (student) vs `{studentId, department}` (staff) vs `{isWatching}` (guardian). | `public/public.js:1254`, `student/student.js:3237`, `staff/staff.js:3190`, `parent/parent.js:3423` | Apply **Class-Table Subtype Specialization**: keep shared columns in **`users`** and separate role-specific attributes into **`student_profiles`**, **`staff_profiles`**, and **`guardian_profiles`** (1:0..1 PK=FK). This also structurally enforces that Staff cannot link to Guardians! |
| 3NF-2 | `users` & `user_passwords` | `users.password` duplicated in `user_passwords(email -> password)` creates transitive dependency `userId -> email -> password` and dual-store update anomalies. | `js/db.js:4862-4872` | Extract **`user_credentials(user_id PK/FK, password_hash, password_updated_at)`** (1:0..1 with `users`), eliminating plaintext duplication across `users` and `user_passwords`. |
| 3NF-3 | `guardian_links` | (a) `linkId -> guardianId -> {guardianName, guardianEmail}` and `linkId -> studentUid -> {studentId, studentName}` (already causes active sync patches in `syncGuardianLinksForStudent` / `syncGuardianLinksForGuardian`).<br>(b) Embedded unrelated location-reminder event fields (`locationReminderRequestedAt`, `locationReminderRequestedBy`, `locationReminderRequestedByName`, `locationReminderMessage`, `locationReminderStudentId`) overwrite prior reminders and depend on a separate reminder event. | `js/db.js:2231,2263,3341,3571` | (a) Remove denormalized names/IDs from **`guardian_links`**; join via `student_user_id` (`student_profiles`) and `guardian_user_id` (`guardian_profiles`). Retain `invited_guardian_email` only for pending pre-registration invites.<br>(b) Extract **`location_reminders(reminder_id PK, link_id FK, requested_by_user_id FK, message, requested_at)`**. |
| 3NF-4 | `sos_logs`, `emergency_posts`, `gad_messages`, `notifications` | Transitive user-profile copies: `userName`, `userEmail`, `studentId`, `role`, `sourceName`, `studentName`, `repliedBy` depend on `userId`/`studentUid`/`sourceUserId`, not on the event PK. | `js/db.js:366,437,3810,4106` | Remove denormalized identity copies; resolve display details via FKs (`user_id`, `submitter_user_id`, `replied_by_user_id`, `source_user_id`) to `users`. |
| 3NF-5 | `gad_posts` | `postId -> email -> author` (logical publisher reference) and `postId -> likedBy[] -> likes` (derived aggregate stored physically). | `js/db.js:927,1095`, `admin/admin.js:4748` | Replace `author` + `email` with **`author_user_id` FK -> `users.user_id`**; derive like counts dynamically from `COUNT(*)` on **`gad_post_likes`**. |
| 3NF-6 | `attendance` *(Entity Overloading)* | Single collection stores 3 independent entity types (`in`/`out` attendance, `sos` mirrors, `profile_bootstrap` user markers), creating sparse nulls and duplicate SOS rows. | `js/db.js:306,382,1167` | Restrict **`attendance_logs`** strictly to Time-In/Time-Out events (`event_type IN ('in','out')`). SOS events live solely in `sos_logs`; profiles live solely in `users`. |
| 3NF-7 | `system_settings`, `campus_config`, `emergency_posts/campus_map_config`, `markers` *(Triplicated Config Overloading)* | Identical geofence/buildings config is written to 3 separate collections (`system_settings`, `campus_config`, and overloaded doc inside `emergency_posts`) due to missing `firestore.rules` entries, while legacy `markers` remains orphaned. | `js/db.js:882,4300-4302` | Consolidate into **`campus_map_configs`** (header) + **`campus_geofence_vertices`** (1:N) + **`campus_places`** (1:N). Remove the overloaded config doc from `emergency_posts`. |

---

## Summary: Existing vs. Proposed 3NF Architecture

| Metric | Existing Firestore Database | Proposed 3NF Relational Database |
|---|---|---|
| Total Entities | **15** Firestore collections *(+1 overloaded doc)* | **23** normalized tables *(every addition justified by 1NF/2NF/3NF)* |
| 1NF Compliance | **Non-compliant** (arrays, nested maps, duplicate synonyms) | **Compliant** (atomic columns, associative & child tables) |
| 2NF Compliance | **Non-compliant** (repeating thread attributes in `messages`) | **Compliant** (`chat_threads` extracted; composite PKs verified) |
| 3NF Compliance | **Non-compliant** (transitive profile copies, subtype mixing, entity overloading, triplicated config) | **Compliant** (subtype tables, FK-driven joins, zero overloaded collections) |
| Intentional NoSQL Notes | Denormalized names & mirrored config docs exist to work around Firestore lack of server-side joins and missing security rules on `system_settings`/`campus_config`/`gad_messages`. | Relational logical model eliminates all update/insert/delete anomalies while preserving 100% of Securo business logic (including Student/Staff separation, anonymous GAD alias threads, and adjustable campus place zone radii). |
