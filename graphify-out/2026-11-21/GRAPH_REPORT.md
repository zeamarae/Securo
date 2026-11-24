# Graph Report - securo  (2026-11-21)

## Corpus Check
- Large corpus: 150 files · ~886,376 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2245 nodes · 4802 edges · 89 communities (76 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Administration & Campus Operations
- Student & Guardian Services
- Administration & Campus Operations
- Student & Guardian Services
- Authentication & User Management
- Authentication & User Management
- Emergency & Incident Response
- Emergency & Incident Response
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Emergency & Incident Response
- Authentication & User Management
- Authentication & User Management
- Student & Guardian Services
- Student & Guardian Services
- Authentication & User Management
- Authentication & User Management
- Emergency & Incident Response
- Authentication & User Management
- Geospatial & Campus Map
- Geospatial & Campus Map
- Geospatial & Campus Map
- Authentication & User Management
- Administration & Campus Operations
- Administration & Campus Operations
- Module Component 29
- Emergency & Incident Response
- Module Component 31
- Emergency & Incident Response
- Navigation & Routing
- Emergency & Incident Response
- Navigation & Routing
- Authentication & User Management
- Emergency & Incident Response
- Navigation & Routing
- Emergency & Incident Response
- Emergency & Incident Response
- Emergency & Incident Response
- Authentication & User Management
- Module Component 43
- Student & Guardian Services
- Student & Guardian Services
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Student & Guardian Services
- Emergency & Incident Response
- Service Worker & Offline Support
- Emergency & Incident Response
- Emergency & Incident Response
- Service Worker & Offline Support
- Emergency & Incident Response
- Student & Guardian Services
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Administration & Campus Operations
- Authentication & User Management
- Administration & Campus Operations
- UI Components & Transitions
- UI Components & Transitions
- Student & Guardian Services
- UI Components & Transitions
- Student & Guardian Services
- Student & Guardian Services
- UI Components & Transitions
- Student & Guardian Services
- Module Component 71
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- Authentication & User Management
- UI Components & Transitions
- Module Component 78
- Service Worker & Offline Support
- UI Components & Transitions
- Service Worker & Offline Support

## God Nodes (most connected - your core abstractions)
1. `initDashboard()` - 24 edges
2. `initDashboard()` - 24 edges
3. `loadAllData()` - 23 edges
4. `loadAllData()` - 23 edges
5. `sendAccountNotification()` - 16 edges
6. `handleAttendance()` - 16 edges
7. `handleAttendance()` - 16 edges
8. `sendAccountNotification()` - 16 edges
9. `handleAttendance()` - 16 edges
10. `handleAttendance()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `loadAnalytics()` --calls--> `getAllUsers()`  [EXTRACTED]
  admin/admin.js → js/db.js
- `changeManagedUserPasswordAsAdmin()` --calls--> `saveAdminUserPassword()`  [EXTRACTED]
  admin/admin.js → js/db.js
- `fetchAllSafetyRecords()` --calls--> `getAllEmergencyPosts()`  [EXTRACTED]
  admin/admin.js → js/db.js
- `fetchAllSafetyRecords()` --calls--> `getAllUsers()`  [EXTRACTED]
  admin/admin.js → js/db.js
- `fetchAllSafetyRecords()` --calls--> `getGADPosts()`  [EXTRACTED]
  admin/admin.js → js/db.js

## Import Cycles
- None detected.

## Communities (89 total, 13 thin omitted)

### Community 0 - "Administration & Campus Operations"
Cohesion: 0.01
Nodes (135): academicStandingCopy, academicStandingText, anonymousSupportToggle, appState, appView, attendanceActionIcon, attendanceActionIconWrap, attendanceActionMessage (+127 more)

### Community 1 - "Student & Guardian Services"
Cohesion: 0.01
Nodes (135): academicStandingCopy, academicStandingText, anonymousSupportToggle, appState, appView, attendanceActionIcon, attendanceActionIconWrap, attendanceActionMessage (+127 more)

### Community 2 - "Administration & Campus Operations"
Cohesion: 0.01
Nodes (135): academicStandingCopy, academicStandingText, anonymousSupportToggle, appState, appView, attendanceActionIcon, attendanceActionIconWrap, attendanceActionMessage (+127 more)

### Community 3 - "Student & Guardian Services"
Cohesion: 0.01
Nodes (135): academicStandingCopy, academicStandingText, anonymousSupportToggle, appState, appView, attendanceActionIcon, attendanceActionIconWrap, attendanceActionMessage (+127 more)

### Community 4 - "Authentication & User Management"
Cohesion: 0.01
Nodes (125): activeUserAvatar, activeUserBeacon, activeUserDossierPanel, activeUserIdTag, activeUserName, activeUserRoleBadge, activeUserStatus, ADMIN_CAMPUS_CENTER (+117 more)

### Community 5 - "Authentication & User Management"
Cohesion: 0.01
Nodes (125): activeUserAvatar, activeUserBeacon, activeUserDossierPanel, activeUserIdTag, activeUserName, activeUserRoleBadge, activeUserStatus, ADMIN_CAMPUS_CENTER (+117 more)

### Community 6 - "Emergency & Incident Response"
Cohesion: 0.04
Nodes (90): getAcceptedLinksForGuardian(), getAllLinksForGuardian(), getGADPosts(), getGuardianSharedEmergencyPosts(), logAttendance(), mergeEmergencyPosts(), processOfflineQueue(), subscribeToStudentAttendance() (+82 more)

### Community 7 - "Emergency & Incident Response"
Cohesion: 0.05
Nodes (87): getAcceptedLinksForGuardian(), getAllLinksForGuardian(), logAttendance(), processOfflineQueue(), subscribeToStudentAttendance(), subscribeToStudentLocation(), subscribeToStudentSOS(), CAMPUS_BUILDINGS (+79 more)

### Community 8 - "Authentication & User Management"
Cohesion: 0.05
Nodes (70): applyGadLikesOverlay(), assertGuardianCapacityForRequest(), buildThreadsFromMessages(), createGuardianLinkFromStudent(), createGuardianLinkRequest(), deleteCurrentUserAccount(), deleteGADPost(), deleteUserRecord() (+62 more)

### Community 9 - "Authentication & User Management"
Cohesion: 0.05
Nodes (64): applyGadLikesOverlay(), assertGuardianCapacityForRequest(), createGuardianLinkRequest(), deleteConversationThread(), deleteCurrentUserAccount(), deleteGADPost(), deleteUserRecord(), doesGuardianLinkMatchStudent() (+56 more)

### Community 10 - "Authentication & User Management"
Cohesion: 0.09
Nodes (32): changeManagedUserPasswordAsAdmin(), changePassword(), checkAuth(), forgotPassword(), getFriendlyAuthMessage(), getPreferredAuthRole(), googleProvider, login() (+24 more)

### Community 11 - "Authentication & User Management"
Cohesion: 0.10
Nodes (30): changePassword(), checkAuth(), forgotPassword(), getFriendlyAuthMessage(), getPreferredAuthRole(), googleProvider, login(), loginWithGoogle() (+22 more)

### Community 12 - "Authentication & User Management"
Cohesion: 0.05
Nodes (34): puppeteer, author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core (+26 more)

### Community 13 - "Authentication & User Management"
Cohesion: 0.16
Nodes (28): applyFilters(), escapeHtml(), extractUsersFromLogs(), getInitials(), getManagedUserById(), getQuickRegionalLocation(), getReporterInfo(), getRoleCounts() (+20 more)

### Community 14 - "Emergency & Incident Response"
Cohesion: 0.16
Nodes (28): fetchLatestCampusMapConfig(), setStudentLocationSharingStatus(), captureSosLocationSnapshot(), checkCampusGeofence(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings() (+20 more)

### Community 15 - "Authentication & User Management"
Cohesion: 0.16
Nodes (28): applyFilters(), escapeHtml(), extractUsersFromLogs(), getInitials(), getManagedUserById(), getQuickRegionalLocation(), getReporterInfo(), getRoleCounts() (+20 more)

### Community 16 - "Authentication & User Management"
Cohesion: 0.15
Nodes (28): getAttendanceHistory(), getUserActivitySummary(), getUserSOSLogs(), loadStudentLogs(), calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12() (+20 more)

### Community 17 - "Student & Guardian Services"
Cohesion: 0.15
Nodes (27): updateStudentLiveLocation(), checkCampusGeofence(), downloadVaultItem(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings(), getCampusGeofencePolygon() (+19 more)

### Community 18 - "Student & Guardian Services"
Cohesion: 0.15
Nodes (27): fetchLatestCampusMapConfig(), setStudentLocationSharingStatus(), updateStudentLiveLocation(), checkCampusGeofence(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings() (+19 more)

### Community 19 - "Authentication & User Management"
Cohesion: 0.10
Nodes (26): markAccountNotificationRead(), subscribeToGADMessages(), buildGuardianRequestNotification(), buildLocationReminderNotification(), downloadVaultItem(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp() (+18 more)

### Community 20 - "Authentication & User Management"
Cohesion: 0.10
Nodes (26): buildGuardianRequestNotification(), buildLocationReminderNotification(), downloadVaultItem(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getGuardianBaseUrl(), getNotificationIcon() (+18 more)

### Community 21 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (26): captureSosLocationSnapshot(), checkCampusGeofence(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings(), getCampusGeofencePolygon(), getFallbackAttendanceLocation() (+18 more)

### Community 22 - "Authentication & User Management"
Cohesion: 0.11
Nodes (25): markAccountNotificationRead(), openNotifications(), buildGuardianRequestNotification(), buildLocationReminderNotification(), downloadVaultItem(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp() (+17 more)

### Community 23 - "Geospatial & Campus Map"
Cohesion: 0.18
Nodes (24): calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate(), getAttendanceQueueKey(), getIsTimedInFromHistory() (+16 more)

### Community 24 - "Geospatial & Campus Map"
Cohesion: 0.18
Nodes (24): calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate(), getAttendanceQueueKey(), getIsTimedInFromHistory() (+16 more)

### Community 25 - "Geospatial & Campus Map"
Cohesion: 0.19
Nodes (23): calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate(), getAttendanceQueueKey(), getIsTimedInFromHistory() (+15 more)

### Community 26 - "Authentication & User Management"
Cohesion: 0.15
Nodes (19): buildGuardianRequestNotification(), buildLocationReminderNotification(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getNotificationIcon(), getNotificationTimestampMs(), getPostLikeCount() (+11 more)

### Community 27 - "Administration & Campus Operations"
Cohesion: 0.14
Nodes (18): downloadCSV(), downloadDailyCsvReport(), downloadDailyExcelReport(), executeAdminLogout(), extractCoords(), fetchAllSafetyRecords(), getLocalDateString(), openBulkImportModal() (+10 more)

### Community 28 - "Administration & Campus Operations"
Cohesion: 0.15
Nodes (17): downloadCSV(), downloadDailyCsvReport(), downloadDailyExcelReport(), executeAdminLogout(), extractCoords(), fetchAllSafetyRecords(), getLocalDateString(), openBulkImportModal() (+9 more)

### Community 29 - "Module Component 29"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 30 - "Emergency & Incident Response"
Cohesion: 0.20
Nodes (11): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+3 more)

### Community 31 - "Module Component 31"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 32 - "Emergency & Incident Response"
Cohesion: 0.21
Nodes (15): toggleEmergencyPostGuardianAccess(), deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache() (+7 more)

### Community 33 - "Navigation & Routing"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

### Community 34 - "Emergency & Incident Response"
Cohesion: 0.22
Nodes (10): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal() (+2 more)

### Community 35 - "Navigation & Routing"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

### Community 36 - "Authentication & User Management"
Cohesion: 0.18
Nodes (13): attachThreadDeleteGesture(), formatThreadTimestamp(), getOtherUserIdFromThread(), getThreadClientInfo(), getThreadLastActivityMs(), getThreadParticipantRole(), getUserPresenceStatus(), handleAdminSendMessage() (+5 more)

### Community 37 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (13): closeChat(), closeEmergencyCameraPanel(), handleUniversalBackClose(), openEmergencyCamera(), setSosIdleState(), startEmergencyCamera(), startSosHold(), stepHoldAnimation() (+5 more)

### Community 38 - "Navigation & Routing"
Cohesion: 0.26
Nodes (13): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+5 more)

### Community 39 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (13): closeChat(), closeEmergencyCameraPanel(), handleUniversalBackClose(), openEmergencyCamera(), setSosIdleState(), startEmergencyCamera(), startSosHold(), stepHoldAnimation() (+5 more)

### Community 40 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (13): closeChat(), closeEmergencyCameraPanel(), handleUniversalBackClose(), openEmergencyCamera(), setSosIdleState(), startEmergencyCamera(), startSosHold(), stepHoldAnimation() (+5 more)

### Community 41 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (13): closeChat(), closeEmergencyCameraPanel(), handleUniversalBackClose(), openEmergencyCamera(), setSosIdleState(), startEmergencyCamera(), startSosHold(), stepHoldAnimation() (+5 more)

### Community 42 - "Authentication & User Management"
Cohesion: 0.24
Nodes (12): buildUserRelations(), closeUserActionMenu(), formatAdminTime(), getRoleKey(), getRoleLabel(), loadManagedUserLocation(), renderManagedUsers(), renderRelationList() (+4 more)

### Community 44 - "Student & Guardian Services"
Cohesion: 0.23
Nodes (12): getGuardianBaseUrl(), goToSlide(), openInviteParentModal(), playCameraShutterSound(), renderGuardianWatchers(), showToast(), snapSelfiePhoto(), startCircleLiveCamera() (+4 more)

### Community 45 - "Student & Guardian Services"
Cohesion: 0.21
Nodes (12): autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), renderGuardianWatchers(), resetCameraZoom(), showToast(), startRecordingTicker() (+4 more)

### Community 46 - "Authentication & User Management"
Cohesion: 0.18
Nodes (12): attachThreadDeleteGesture(), formatThreadTimestamp(), getOtherUserIdFromThread(), getThreadClientInfo(), getThreadLastActivityMs(), getThreadParticipantRole(), getUserPresenceStatus(), handleAdminSendMessage() (+4 more)

### Community 47 - "Authentication & User Management"
Cohesion: 0.24
Nodes (12): buildUserRelations(), closeUserActionMenu(), formatAdminTime(), getRoleKey(), getRoleLabel(), loadManagedUserLocation(), renderManagedUsers(), renderRelationList() (+4 more)

### Community 48 - "Authentication & User Management"
Cohesion: 0.29
Nodes (12): deleteEmergencyPost(), getAllEmergencyPosts(), getEmergencyPostById(), getGuardianSharedEmergencyPosts(), getUserEmergencyPosts(), mergeEmergencyPosts(), readLocalEmergencyPosts(), toggleEmergencyPostAccess() (+4 more)

### Community 49 - "Student & Guardian Services"
Cohesion: 0.23
Nodes (12): getGuardianBaseUrl(), goToSlide(), openInviteParentModal(), playCameraShutterSound(), renderGuardianWatchers(), showToast(), snapSelfiePhoto(), startCircleLiveCamera() (+4 more)

### Community 50 - "Emergency & Incident Response"
Cohesion: 0.24
Nodes (11): attachPhotoToActiveSOS(), autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), startRecordingTicker(), startVideoRecording() (+3 more)

### Community 51 - "Service Worker & Offline Support"
Cohesion: 0.35
Nodes (8): initializeOfflineSupport(), registerServiceWorker(), requestBackgroundSync(), requestNotificationPermission(), setupConnectivityListeners(), setupServiceWorkerListeners(), showUpdateNotification(), updateOfflineQueueIndicator()

### Community 52 - "Emergency & Incident Response"
Cohesion: 0.24
Nodes (11): attachPhotoToActiveSOS(), autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), startRecordingTicker(), startVideoRecording() (+3 more)

### Community 53 - "Emergency & Incident Response"
Cohesion: 0.24
Nodes (11): saveEmergencyPost(), autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), startRecordingTicker(), startVideoRecording() (+3 more)

### Community 54 - "Service Worker & Offline Support"
Cohesion: 0.35
Nodes (8): initializeOfflineSupport(), registerServiceWorker(), requestBackgroundSync(), requestNotificationPermission(), setupConnectivityListeners(), setupServiceWorkerListeners(), showUpdateNotification(), updateOfflineQueueIndicator()

### Community 55 - "Emergency & Incident Response"
Cohesion: 0.38
Nodes (10): deleteEmergencyPost(), getEmergencyPostById(), readLocalEmergencyPosts(), saveEmergencyPost(), toggleEmergencyPostAccess(), toggleEmergencyPostGuardianAccess(), updateEmergencyPostAttachments(), writeLocalEmergencyPosts() (+2 more)

### Community 56 - "Student & Guardian Services"
Cohesion: 0.29
Nodes (10): getGuardianBaseUrl(), goToSlide(), openInviteParentModal(), playCameraShutterSound(), snapSelfiePhoto(), startCircleLiveCamera(), stopCircleLiveCamera(), toTitleCase() (+2 more)

### Community 57 - "Authentication & User Management"
Cohesion: 0.22
Nodes (9): createAttendanceChart(), createSOSTypeChart(), createUserDistributionChart(), displayRecentActivity(), loadAnalytics(), getAllAuditLogs(), getAllGuardianLinksAdmin(), getAttendanceStats() (+1 more)

### Community 59 - "Authentication & User Management"
Cohesion: 0.22
Nodes (9): createAttendanceChart(), createSOSTypeChart(), createUserDistributionChart(), displayRecentActivity(), loadAnalytics(), getAllAuditLogs(), getAllGuardianLinksAdmin(), getAttendanceStats() (+1 more)

### Community 60 - "Administration & Campus Operations"
Cohesion: 0.29
Nodes (8): closeGeofenceEditorModal(), getActiveAdminBuildings(), getActiveAdminGeofencePolygon(), openGeofenceEditorModal(), renderBuildingMarkers(), renderModalEditorMarkers(), setupGeofenceEditorControls(), saveCampusMapConfig()

### Community 61 - "Authentication & User Management"
Cohesion: 0.39
Nodes (8): getAttendanceHistory(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), loadStudentLogs(), loadHistoryPage(), renderHistory(), loadHistoryPage()

### Community 62 - "Administration & Campus Operations"
Cohesion: 0.29
Nodes (8): closeGeofenceEditorModal(), getActiveAdminBuildings(), getActiveAdminGeofencePolygon(), openGeofenceEditorModal(), renderBuildingMarkers(), renderModalEditorMarkers(), setupGeofenceEditorControls(), saveCampusMapConfig()

### Community 63 - "UI Components & Transitions"
Cohesion: 0.39
Nodes (8): buildThreadsFromMessages(), getAllChatThreads(), getAllChatThreadsOnce(), getMsgSec(), mergeChatMessagesList(), readLocalChatMessages(), subscribeToMessages(), subscribeToMessagesByThread()

### Community 64 - "UI Components & Transitions"
Cohesion: 0.39
Nodes (8): goToSlide(), playCameraShutterSound(), snapSelfiePhoto(), startCircleLiveCamera(), stopCircleLiveCamera(), toTitleCase(), triggerFullscreenOnboarding(), updateFsAvatarPreview()

### Community 65 - "Student & Guardian Services"
Cohesion: 0.52
Nodes (7): readLocalGuardianLinks(), removeGuardianLink(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 66 - "UI Components & Transitions"
Cohesion: 0.67
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 67 - "Student & Guardian Services"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 68 - "Student & Guardian Services"
Cohesion: 0.52
Nodes (7): readLocalGuardianLinks(), removeGuardianLink(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 69 - "UI Components & Transitions"
Cohesion: 0.67
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 70 - "Student & Guardian Services"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 71 - "Module Component 71"
Cohesion: 0.33
Nodes (5): compilerOptions, module, moduleResolution, target, exclude

### Community 72 - "Authentication & User Management"
Cohesion: 0.33
Nodes (6): createAnonymousSupportSessionId(), getSupportThreadState(), handleSendMessage(), openChat(), renderMessages(), syncChatViewport()

### Community 73 - "Authentication & User Management"
Cohesion: 0.33
Nodes (6): createAnonymousSupportSessionId(), getSupportThreadState(), handleSendMessage(), openChat(), renderMessages(), syncChatViewport()

### Community 74 - "Authentication & User Management"
Cohesion: 0.33
Nodes (6): createAnonymousSupportSessionId(), getSupportThreadState(), handleSendMessage(), openChat(), renderMessages(), syncChatViewport()

### Community 75 - "Authentication & User Management"
Cohesion: 0.33
Nodes (6): createAnonymousSupportSessionId(), getSupportThreadState(), handleSendMessage(), openChat(), renderMessages(), syncChatViewport()

### Community 77 - "UI Components & Transitions"
Cohesion: 0.67
Nodes (3): renderGadImagePreview(), resetGadComposer(), updateGadCounter()

### Community 80 - "UI Components & Transitions"
Cohesion: 0.67
Nodes (3): renderGadImagePreview(), resetGadComposer(), updateGadCounter()

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 1064 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `subscribeToMessagesByThread()` connect `UI Components & Transitions` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Emergency & Incident Response`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Administration & Campus Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._
- **Why does `getGADPosts()` connect `Emergency & Incident Response` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Administration & Campus Operations`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Should `Student & Guardian Services` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._
- **Why does `subscribeToMessagesByThread()` connect `Authentication & User Management` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Emergency & Incident Response`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `Administration & Campus Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._