# 06 — Final Validation & Accuracy Report

**Audit Scope:** Full-project read-only database inspection across all JavaScript modules, portal controllers, Firebase configuration, and Firestore Security Rules (`securo-a3c9c`).  
**Validation Date:** 2026-11-26  
**Source Code Integrity:** Zero application files, database collections, or security rules were modified during this audit.

---

## 1. Entity Completeness Verification

All 15 Cloud Firestore collections (plus the overloaded `emergency_posts/campus_map_config` singleton document) discovered via AST/regex scanning of `js/db.js`, `js/auth.js`, `js/firebase-config.js`, `js/emergency-contacts.js`, `firestore.rules`, `public/public.js`, `student/student.js`, `staff/staff.js`, `parent/parent.js`, and `admin/admin.js` are accounted for across inventory, relationship analysis, normalization analysis, and diagrams.

| Verification Check | Result | Details |
|---|---|---|
| Existing Firestore collections documented | **PASS (15 / 15)** | `users`, `user_passwords`, `audit_logs`, `guardian_links`, `student_locations`, `attendance`, `sos_logs`, `emergency_posts`, `gad_posts`, `messages`, `gad_messages`, `notifications`, `markers`, `system_settings`, `campus_config` |
| Existing UML vs. Existing ERD entity parity | **PASS (15 / 15)** | Exact 1:1 match of all 15 entities and 17 relationships |
| Proposed 3NF UML vs. Proposed 3NF ERD entity parity | **PASS (23 / 23)** | Exact 1:1 match of all 23 normalized tables, keys, attributes, and 29 foreign-key relationships |
| Auxiliary client-side stores separated | **PASS** | IndexedDB (`SECURO_IDB_STORE`, `MSG_IDB_STORE`), `localStorage` (`emergency_contacts`, offline fallbacks), and unused Firebase Storage initialization explicitly separated from server collections |

---

## 2. Key & Relationship Verification

| Verification Check | Result | Details |
|---|---|---|
| Every entity has a defined Primary Key (PK) | **PASS** | All 15 existing collections and all 23 proposed 3NF tables have explicit single or composite PKs |
| Every relationship backed by codebase evidence | **PASS** | All 17 existing relationships cite exact file paths and line numbers in `02_relationship_analysis.md`; zero invented links |
| Staff vs. Student role separation verified | **PASS** | Verified in `js/db.js:2447,2467` and `public/public.js:189` that Staff cannot link to Guardians; enforced structurally in 3NF via `student_profiles` vs. `staff_profiles` |
| M:N relationships resolved via associative entities | **PASS** | `gad_posts <-> users` likes resolved via `gad_post_likes(post_id, user_id)`; `sos_logs <-> guardian_profiles` resolved via `sos_log_recipients(sos_log_id, guardian_user_id)` |
| Hard UID references distinguished from soft/logical references | **PASS** | Dotted connectors (`..>` / `..`) mark email-matched, array-embedded, and mirrored links in existing diagrams; converted to strict FKs in proposed 3NF diagrams |

---

## 3. Normalization Verification (1NF / 2NF / 3NF)

| Normal Form | Existing Firestore Schema | Proposed 3NF Relational Schema | Summary |
|---|---|---|---|
| **1NF** | **Violated** (10 violation groups) | **Compliant** | Eliminated arrays (`likedGadPosts[]`, `likedBy[]`, `guardianUids[]`, `attachments[]`, `geofence[]`, `buildings[]`), flattened composite maps (`permissions`, `location`, `profile`), and removed synonym duplicate fields. |
| **2NF** | **Violated** (thread-key repeating group) | **Compliant** | Extracted `chat_threads` for thread-level attributes (`support_mode`, `is_anonymous`, `anonymous_alias`, `initiator_user_id`); verified full composite-key dependency on `gad_post_likes` and `sos_log_recipients`. |
| **3NF** | **Violated** (7 violation groups) | **Compliant** | Separated `users` subtypes (`student_profiles`, `staff_profiles`, `guardian_profiles`) and `user_credentials`; removed transitive name/email/studentId copies; extracted `location_reminders`; removed `attendance` and `emergency_posts` overloading; unified triplicated campus map config into `campus_map_configs` + child tables. |

---

## 4. PlantUML Syntax Validation & Rendering Results

All four `.puml` files were validated directly against the live PlantUML rendering engine (via Kroki PlantUML service) and exported to both **SVG** and **PNG** previews with zero syntax errors:

| PlantUML Source File | PlantUML Parser Status | SVG Preview Generated | PNG Preview Generated |
|---|---|---|---|
| `04_existing_database/existing_uml.puml` | **HTTP 200 — Valid** | `existing_uml.svg` (84,757 bytes) | `existing_uml.png` (211,194 bytes) |
| `04_existing_database/existing_erd.puml` | **HTTP 200 — Valid** | `existing_erd.svg` (76,683 bytes) | `existing_erd.png` (125,976 bytes) |
| `05_proposed_3nf/proposed_3nf_uml.puml` | **HTTP 200 — Valid** | `proposed_3nf_uml.svg` (104,982 bytes) | `proposed_3nf_uml.png` (478,093 bytes) |
| `05_proposed_3nf/proposed_3nf_erd.puml` | **HTTP 200 — Valid** | `proposed_3nf_erd.svg` (107,292 bytes) | `proposed_3nf_erd.png` (173,157 bytes) |

---

## 5. Identified Uncertainties, Risks & Limitations

1. **Unmapped Collections in `firestore.rules`:** Three collections written in `js/db.js` — `gad_messages`, `system_settings`, and `campus_config` — have no matching `match` rule in `firestore.rules`. As a result, Firestore denies client writes to those three paths and the app relies on fallback mirrors (`messages` for GAD inquiries, `emergency_posts/campus_map_config` + `localStorage` for campus map config).
2. **Legacy `markers` Collection:** Permitted in `firestore.rules:116` and read by `getCampusMarkers()` (`js/db.js:882`), but no write path exists in the project; its live document fields cannot be verified from source code alone.
3. **Plaintext Password Storage:** Both `users.password` and `user_passwords.password` store plaintext password copies for admin/guardian reset synchronization (`js/db.js:4862-4872`), and `firestore.rules:159` allows `read, write: if true` on `user_passwords`. The proposed 3NF model replaces this with hashed `user_credentials.password_hash` (or delegation exclusively to Firebase Auth Admin SDK).
4. **Polymorphic Notification & Sentinel IDs:** `notifications.userId` occasionally stores literal `"admin"` or an email address instead of a real `users.userId`, `messages.receiverId` uses virtual sentinel `"system_admin_securo"`, and `notifications.relatedId` is polymorphic without a type discriminator.
5. **Base64 Media in Firestore Documents:** `js/firebase-config.js:47` initializes Firebase Storage, yet profile avatars, GAD post images, SOS photos, and vault attachments are stored as Data URIs directly inside Firestore documents (subject to Firestore's 1 MiB document size limit).
6. **Semi-Structured Audit Details:** `audit_logs.details_json` is intentionally retained as JSON in the proposed 3NF schema alongside extracted `auth_method` because future audit actions carry heterogeneous event-specific payloads.
