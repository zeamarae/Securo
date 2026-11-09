# Graph Report - securo  (2026-11-09)

## Corpus Check
- Large corpus: 134 files · ~805,758 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 468 nodes · 807 edges · 40 communities (26 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Cluster 0: db.js
- Cluster 2: getUserProfile()
- Cluster 3: emergency-contacts.js
- Cluster 4: package.json
- Cluster 5: ref_https
- Cluster 6: auth.js
- Cluster 7: assertGuardianCapacityForRequest()
- Cluster 8: manifest.json
- Cluster 9: deleteEmergencyPost()
- Cluster 10: deleteCurrentUserAccount()
- Cluster 11: deleteEmergencyPost()
- Cluster 12: deleteCurrentUserAccount()
- Cluster 13: ExampleInstrumentedTest.java
- Cluster 14: assertGuardianCapacityForRequest()
- Cluster 15: createGuardianLinkFromStudent()
- Cluster 16: getLinksForStudent()
- Cluster 17: readLocalGuardianLinks()
- Cluster 18: preloader.js
- Cluster 19: router.js
- Cluster 20: app.js
- Cluster 21: readLocalGuardianLinks()
- Cluster 22: preloader.js
- Cluster 23: router.js
- Cluster 24: jsconfig.json
- Cluster 25: getLinksForStudent()
- Cluster 26: spa-router.js
- Cluster 27: readLocalGADMessages()
- Cluster 28: readLocalGADMessages()
- Cluster 30: MainActivity.java
- Cluster 31: service-worker.js
- Cluster 32: service-worker.js

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

### Community 2 - "Cluster 2: getUserProfile()"
Cohesion: 0.10
Nodes (25): getUserProfile(), addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget() (+17 more)

### Community 3 - "Cluster 3: emergency-contacts.js"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 4 - "Cluster 4: package.json"
Cohesion: 0.06
Nodes (30): author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core, @capacitor/geolocation (+22 more)

### Community 5 - "Cluster 5: ref_https"
Cohesion: 0.11
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 6 - "Cluster 6: auth.js"
Cohesion: 0.12
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 7 - "Cluster 7: assertGuardianCapacityForRequest()"
Cohesion: 0.18
Nodes (19): assertGuardianCapacityForRequest(), createGuardianLinkFromStudent(), createGuardianLinkRequest(), findExistingGuardianStudentLink(), findStudentUidByStudentId(), findUserByEmail(), getAcceptedStudentGuardianLinks(), getAllUsers() (+11 more)

### Community 8 - "Cluster 8: manifest.json"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 9 - "Cluster 9: deleteEmergencyPost()"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 10 - "Cluster 10: deleteCurrentUserAccount()"
Cohesion: 0.20
Nodes (14): deleteCurrentUserAccount(), deleteUserRecord(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserProfile(), isPermissionDeniedError(), readLocalUsers(), saveUserProfile() (+6 more)

### Community 11 - "Cluster 11: deleteEmergencyPost()"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 12 - "Cluster 12: deleteCurrentUserAccount()"
Cohesion: 0.19
Nodes (13): deleteCurrentUserAccount(), deleteUserRecord(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), isPermissionDeniedError(), readLocalUsers(), saveUserProfile(), subscribeToStudentLinks() (+5 more)

### Community 14 - "Cluster 14: assertGuardianCapacityForRequest()"
Cohesion: 0.22
Nodes (10): assertGuardianCapacityForRequest(), createGuardianLinkRequest(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), findStudentUidByStudentId(), getAcceptedStudentGuardianLinks(), getGuardianLinkRecords(), normalizeComparableValue() (+2 more)

### Community 15 - "Cluster 15: createGuardianLinkFromStudent()"
Cohesion: 0.33
Nodes (9): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getUserIdentityKeys(), inferUserRole(), mergeUsersByIdentity(), normalizeEmail(), saveGADPost() (+1 more)

### Community 16 - "Cluster 16: getLinksForStudent()"
Cohesion: 0.32
Nodes (8): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue(), sendAccountNotification(), sendChatMessage()

### Community 17 - "Cluster 17: readLocalGuardianLinks()"
Cohesion: 0.52
Nodes (7): readLocalGuardianLinks(), removeGuardianLink(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 18 - "Cluster 18: preloader.js"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 19 - "Cluster 19: router.js"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 20 - "Cluster 20: app.js"
Cohesion: 0.48
Nodes (5): cleanURL(), getCurrentPage(), init(), navigate(), updateLinks()

### Community 21 - "Cluster 21: readLocalGuardianLinks()"
Cohesion: 0.52
Nodes (7): readLocalGuardianLinks(), removeGuardianLink(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 22 - "Cluster 22: preloader.js"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 23 - "Cluster 23: router.js"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 24 - "Cluster 24: jsconfig.json"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, target, exclude

### Community 25 - "Cluster 25: getLinksForStudent()"
Cohesion: 0.40
Nodes (6): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue()

### Community 26 - "Cluster 26: spa-router.js"
Cohesion: 0.60
Nodes (5): back(), convertToHashURL(), init(), interceptLinks(), navigate()

### Community 27 - "Cluster 27: readLocalGADMessages()"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

### Community 28 - "Cluster 28: readLocalGADMessages()"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 193 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initializeOfflineSupport()` connect `Cluster 2: getUserProfile()` to `Cluster 1: db.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Cluster 0: db.js` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Why does `initializeOfflineSupport()` connect `Cluster 3: emergency-contacts.js` to `Cluster 0: db.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `Cluster 1: db.js` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Why does `logAuditEvent()` connect `Cluster 6: auth.js` to `Cluster 1: db.js`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Cluster 2: getUserProfile()` be split into smaller, more focused modules?**
  _Cohesion score 0.0957983193277311 - nodes in this community are weakly interconnected._