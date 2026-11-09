# Graph Report - securo  (2026-11-09)

## Corpus Check
- Large corpus: 134 files · ~799,036 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 460 nodes · 765 edges · 41 communities (27 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Emergency & SOS Response
- Emergency & SOS Response
- Authentication & User Accounts
- Authentication & User Accounts
- Authentication & User Accounts
- Routing & Navigation
- Guardian & Child Linking
- Emergency & SOS Response
- Guardian & Child Linking
- Emergency & SOS Response
- Exampleinstrumentedtest Module
- Guardian & Child Linking
- Guardian & Child Linking
- Guardian & Child Linking
- App Startup & Preloader
- Routing & Navigation
- Routing & Navigation
- Guardian & Child Linking
- App Startup & Preloader
- Routing & Navigation
- Emergency & SOS Response
- Guardian & Child Linking
- Jsconfig Module
- Emergency & SOS Response
- Guardian & Child Linking
- Routing & Navigation
- Readlocalgadmessages() Module
- Readlocalgadmessages() Module
- App Config & Dependencies
- Service-Worker Module
- Service-Worker Module

## God Nodes (most connected - your core abstractions)
1. `sendAccountNotification()` - 12 edges
2. `sendAccountNotification()` - 12 edges
3. `readLocalEmergencyPosts()` - 9 edges
4. `readLocalUsers()` - 9 edges
5. `readLocalEmergencyPosts()` - 9 edges
6. `readLocalUsers()` - 9 edges
7. `normalizeEmail()` - 8 edges
8. `getUserProfile()` - 8 edges
9. `getAllUsers()` - 8 edges
10. `initializeOfflineSupport()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `loginWithGoogle()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `signUp()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `logout()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `changePassword()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `getEmergencyContacts()` --calls--> `getUserProfile()`  [EXTRACTED]
  emergency-contacts.js → db.js

## Import Cycles
- None detected.

## Communities (41 total, 14 thin omitted)

### Community 2 - "Emergency & SOS Response"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 3 - "Emergency & SOS Response"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 4 - "Authentication & User Accounts"
Cohesion: 0.06
Nodes (30): author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core, @capacitor/geolocation (+22 more)

### Community 5 - "Authentication & User Accounts"
Cohesion: 0.11
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 6 - "Authentication & User Accounts"
Cohesion: 0.12
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 7 - "Routing & Navigation"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 8 - "Guardian & Child Linking"
Cohesion: 0.22
Nodes (14): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserIdentityKeys(), inferUserRole(), isPermissionDeniedError() (+6 more)

### Community 9 - "Emergency & SOS Response"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 10 - "Guardian & Child Linking"
Cohesion: 0.22
Nodes (14): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserIdentityKeys(), inferUserRole(), isPermissionDeniedError() (+6 more)

### Community 11 - "Emergency & SOS Response"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 13 - "Guardian & Child Linking"
Cohesion: 0.32
Nodes (8): createGuardianLinkRequest(), deleteCurrentUserAccount(), deleteUserRecord(), findStudentUidByStudentId(), getUserProfile(), readLocalUsers(), subscribeToStudentLinks(), updateGuardianLinkStudentId()

### Community 14 - "Guardian & Child Linking"
Cohesion: 0.32
Nodes (8): createGuardianLinkRequest(), deleteCurrentUserAccount(), deleteUserRecord(), findStudentUidByStudentId(), getUserProfile(), readLocalUsers(), subscribeToStudentLinks(), updateGuardianLinkStudentId()

### Community 15 - "Guardian & Child Linking"
Cohesion: 0.29
Nodes (7): assertGuardianCapacityForRequest(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), getAcceptedStudentGuardianLinks(), getGuardianLinkRecords(), normalizeComparableValue(), respondToGuardianLink()

### Community 16 - "App Startup & Preloader"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 17 - "Routing & Navigation"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 18 - "Routing & Navigation"
Cohesion: 0.48
Nodes (5): cleanURL(), getCurrentPage(), init(), navigate(), updateLinks()

### Community 19 - "Guardian & Child Linking"
Cohesion: 0.29
Nodes (7): assertGuardianCapacityForRequest(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), getAcceptedStudentGuardianLinks(), getGuardianLinkRecords(), normalizeComparableValue(), respondToGuardianLink()

### Community 20 - "App Startup & Preloader"
Cohesion: 0.62
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 21 - "Routing & Navigation"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 22 - "Emergency & SOS Response"
Cohesion: 0.40
Nodes (6): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue()

### Community 23 - "Guardian & Child Linking"
Cohesion: 0.47
Nodes (6): saveUserProfile(), syncGuardianLinksForGuardian(), syncGuardianLinksForStudent(), updateUserProfile(), upsertLocalUser(), writeLocalUsers()

### Community 24 - "Jsconfig Module"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, target, exclude

### Community 25 - "Emergency & SOS Response"
Cohesion: 0.40
Nodes (6): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue()

### Community 26 - "Guardian & Child Linking"
Cohesion: 0.47
Nodes (6): saveUserProfile(), syncGuardianLinksForGuardian(), syncGuardianLinksForStudent(), updateUserProfile(), upsertLocalUser(), writeLocalUsers()

### Community 27 - "Routing & Navigation"
Cohesion: 0.60
Nodes (5): back(), convertToHashURL(), init(), interceptLinks(), navigate()

### Community 28 - "Readlocalgadmessages() Module"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

### Community 29 - "Readlocalgadmessages() Module"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 199 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initializeOfflineSupport()` connect `Emergency & SOS Response` to `Emergency & SOS Response`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Emergency & SOS Response` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Why does `initializeOfflineSupport()` connect `Emergency & SOS Response` to `Emergency & SOS Response`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `Emergency & SOS Response` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Why does `logAuditEvent()` connect `Authentication & User Accounts` to `Emergency & SOS Response`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Emergency & SOS Response` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._