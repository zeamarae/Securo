# Graph Report - securo  (2026-10-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 452 nodes · 735 edges · 39 communities (23 shown, 16 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1375b39d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Emergency Contacts & SOS
- Campus SOS Dispatcher
- Project Dependencies & Capacitor
- Authentication & Role Management
- Auth Providers & Sessions
- Guardian Link Requests
- Student Profile Services
- Web App Manifest
- Emergency Posts & Activity
- Attendance & SOS Logs
- Android Unit Tests
- Offline Queue & Alerts
- Guardian Notifications
- Guardian Link Verification
- User Identity & Merging
- Client-Side Router
- App Lifecycle & Navigation
- Guardian Link Validation
- User Lookup & Roles
- Web Routing Navigation
- JS Compiler Configuration
- SPA Hash Router
- GAD Messaging Subscriptions
- GAD Message Store
- Preloader GSAP Animations
- Preloader Animation Engine
- Android Capacitor Activity
- Service Worker PWA Cache
- Offline Sync Service Worker

## God Nodes (most connected - your core abstractions)
1. `readLocalEmergencyPosts()` - 9 edges
2. `readLocalEmergencyPosts()` - 9 edges
3. `sendAccountNotification()` - 9 edges
4. `sendAccountNotification()` - 9 edges
5. `readLocalUsers()` - 9 edges
6. `readLocalUsers()` - 9 edges
7. `getAllUsers()` - 8 edges
8. `initializeOfflineSupport()` - 8 edges
9. `getAllUsers()` - 8 edges
10. `initializeOfflineSupport()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `getEmergencyContacts()` --calls--> `getUserProfile()`  [EXTRACTED]
  emergency-contacts.js → db.js
- `getEmergencyContacts()` --calls--> `getUserProfile()`  [EXTRACTED]
  www/emergency-contacts.js → www/db.js
- `changePassword()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js
- `login()` --calls--> `saveUserProfile()`  [EXTRACTED]
  auth.js → db.js
- `loginWithGoogle()` --calls--> `logAuditEvent()`  [EXTRACTED]
  auth.js → db.js

## Import Cycles
- None detected.

## Communities (39 total, 16 thin omitted)

### Community 2 - "Emergency Contacts & SOS"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 3 - "Campus SOS Dispatcher"
Cohesion: 0.10
Nodes (24): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+16 more)

### Community 4 - "Project Dependencies & Capacitor"
Cohesion: 0.06
Nodes (30): author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core, @capacitor/geolocation (+22 more)

### Community 5 - "Authentication & Role Management"
Cohesion: 0.11
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 6 - "Auth Providers & Sessions"
Cohesion: 0.12
Nodes (18): changePassword(), googleProvider, login(), loginWithGoogle(), logout(), roleIdToEmail(), signUp(), staffIdToEmail() (+10 more)

### Community 7 - "Guardian Link Requests"
Cohesion: 0.17
Nodes (16): createGuardianLinkRequest(), deleteCurrentUserAccount(), deleteUserRecord(), findStudentUidByStudentId(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserProfile(), isPermissionDeniedError() (+8 more)

### Community 8 - "Student Profile Services"
Cohesion: 0.17
Nodes (16): createGuardianLinkRequest(), deleteCurrentUserAccount(), deleteUserRecord(), findStudentUidByStudentId(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserProfile(), isPermissionDeniedError() (+8 more)

### Community 9 - "Web App Manifest"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 10 - "Emergency Posts & Activity"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 11 - "Attendance & SOS Logs"
Cohesion: 0.20
Nodes (14): deleteEmergencyPost(), getAllEmergencyPosts(), getAttendanceHistory(), getEmergencyPostById(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), mergeEmergencyPosts() (+6 more)

### Community 13 - "Offline Queue & Alerts"
Cohesion: 0.28
Nodes (9): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue(), saveGADPost(), sendAccountNotification() (+1 more)

### Community 14 - "Guardian Notifications"
Cohesion: 0.28
Nodes (9): getLinksForStudent(), logAttendance(), logSOS(), notifyGuardiansOfGeofenceEvent(), notifyGuardiansSOS(), processOfflineQueue(), saveGADPost(), sendAccountNotification() (+1 more)

### Community 15 - "Guardian Link Verification"
Cohesion: 0.29
Nodes (7): assertGuardianCapacityForRequest(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), getAcceptedStudentGuardianLinks(), getGuardianLinkRecords(), normalizeComparableValue(), respondToGuardianLink()

### Community 16 - "User Identity & Merging"
Cohesion: 0.48
Nodes (7): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getUserIdentityKeys(), inferUserRole(), mergeUsersByIdentity(), normalizeEmail()

### Community 17 - "Client-Side Router"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 18 - "App Lifecycle & Navigation"
Cohesion: 0.48
Nodes (5): cleanURL(), getCurrentPage(), init(), navigate(), updateLinks()

### Community 19 - "Guardian Link Validation"
Cohesion: 0.29
Nodes (7): assertGuardianCapacityForRequest(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink(), getAcceptedStudentGuardianLinks(), getGuardianLinkRecords(), normalizeComparableValue(), respondToGuardianLink()

### Community 20 - "User Lookup & Roles"
Cohesion: 0.48
Nodes (7): createGuardianLinkFromStudent(), findUserByEmail(), getAllUsers(), getUserIdentityKeys(), inferUserRole(), mergeUsersByIdentity(), normalizeEmail()

### Community 21 - "Web Routing Navigation"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 22 - "JS Compiler Configuration"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, target, exclude

### Community 23 - "SPA Hash Router"
Cohesion: 0.60
Nodes (5): back(), convertToHashURL(), init(), interceptLinks(), navigate()

### Community 24 - "GAD Messaging Subscriptions"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

### Community 25 - "GAD Message Store"
Cohesion: 0.50
Nodes (5): readLocalGADMessages(), replyToGADMessage(), sendGADMessage(), subscribeToGADMessages(), writeLocalGADMessages()

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 203 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `initializeOfflineSupport()` connect `Emergency Contacts & SOS` to `Database & Notification Store`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database & Notification Store` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Why does `initializeOfflineSupport()` connect `Campus SOS Dispatcher` to `Firestore Operations`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `Firestore Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Why does `logAuditEvent()` connect `Authentication & Role Management` to `Database & Notification Store`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Should `Emergency Contacts & SOS` be split into smaller, more focused modules?**
  _Cohesion score 0.09803921568627451 - nodes in this community are weakly interconnected._