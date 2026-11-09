# Graph Report - securo  (2026-11-09)

## Corpus Check
- Large corpus: 134 files · ~803,492 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 468 nodes · 799 edges · 40 communities (26 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 29
- Community 30
- Community 31
- Community 32

## God Nodes (most connected - your core abstractions)
1. `sendAccountNotification()` - 12 edges
2. `sendAccountNotification()` - 12 edges
3. `readLocalEmergencyPosts()` - 9 edges
4. `readLocalUsers()` - 9 edges
5. `normalizeEmail()` - 9 edges
6. `readLocalEmergencyPosts()` - 9 edges
7. `readLocalUsers()` - 9 edges
8. `normalizeEmail()` - 9 edges
9. `getUserProfile()` - 8 edges
10. `getAllUsers()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `loginWithGoogle()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `signUp()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `logout()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `changePassword()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `loginWithGoogle()` --calls--> `logAuditEvent()`  [EXTRACTED]
  www/auth.js → www/db.js

## Import Cycles
- None detected.

## Communities (40 total, 14 thin omitted)

### Community 2 - "Community 2"
Cohesion: 0.10
Nodes (25): getUserProfile(), addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget() (+17 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (30): author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core, @capacitor/geolocation (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (19): assertGuardianCapacityForRequest(), createGuardianLinkFromStudent(), createGuardianLinkRequest(), findExistingGuardianStudentLink(), findStudentUidByStudentId(), findUserByEmail(), getAcceptedStudentGuardianLinks(), getAllUsers() (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.20
Nodes (14): deleteCurrentUserAccount(), deleteUserRecord(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserProfile(), isPermissionDeniedError(), readLocalUsers(), saveUserProfile() (+6 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 12 - "Community 12"
Cohesion: 0.19
Nodes (13): deleteCurrentUserAccount(), deleteUserRecord(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), isPermissionDeniedError(), readLocalUsers(), saveUserProfile(), subscribeToStudentLinks() (+5 more)

### Community 14 - "Community 14"
Cohesion: 0.24
Nodes (11): createGuardianLinkRequest(), findStudentUidByStudentId(), getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue() (+3 more)

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (9): assertGuardianCapacityForRequest(), getAcceptedStudentGuardianLinks(), readLocalGuardianLinks(), removeLocalGuardianLink(), respondToGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink() (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (9): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getUserIdentityKeys(), inferUserRole(), mergeUsersByIdentity(), normalizeEmail(), saveGADPost() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 18 - "Community 18"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 19 - "Community 19"
Cohesion: 0.48
Nodes (5): cleanURL(), getCurrentPage(), init(), navigate(), updateLinks()

### Community 20 - "Community 20"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 21 - "Community 21"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, target, exclude

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (6): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue()

### Community 24 - "Community 24"
Cohesion: 0.53
Nodes (6): readLocalGuardianLinks(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 25 - "Community 25"
Cohesion: 0.60
Nodes (5): back(), convertToHashURL(), init(), interceptLinks(), navigate()

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

### Community 27 - "Community 27"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (4): doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), getGuardianLinkRecords(), normalizeComparableValue()

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 195 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initializeOfflineSupport()` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
- **Why does `initializeOfflineSupport()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `logAuditEvent()` connect `Community 6` to `Community 1`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0957983193277311 - nodes in this community are weakly interconnected._