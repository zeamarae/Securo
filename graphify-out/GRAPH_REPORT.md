# Graph Report - securo  (2026-11-21)

## Corpus Check
- 68 files · ~1,000,521 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 40 file(s) not represented in the graph (top: .css 12, .xml 10, (none) 9)

## Summary
- 2656 nodes · 5207 edges · 117 communities (103 shown, 14 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `98cf2192`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- Securo v2.0 - Complete Feature List
- Student & Guardian Services
- Emergency & Incident Response
- Service Worker & Offline Support
- Emergency & Incident Response
- Emergency & Incident Response
- Securo v2.0 - Deployment Guide
- Emergency & Incident Response
- Student & Guardian Services
- Authentication & User Management
- Authentication & User Management
- loadAllData
- Administration & Campus Operations
- Securo v2.0 - Campus Safety Platform
- Administration & Campus Operations
- ✅ **COMPLETED IMPLEMENTATIONS**
- UI Components & Transitions
- Student & Guardian Services
- UI Components & Transitions
- Student & Guardian Services
- sendAccountNotification
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
- Implementation Summary: Clean URLs & Terms and Conditions
- 3. Core Functional Modules
- Securo Clean URL Routing
- Quick Testing Summary Checklist
- Securo v2.0 - Quick Start Checklist
- getUserProfile
- Securo v2.0 - Implementation Complete Summary
- Securo v2.0 - Developer Quick Reference
- Securo Quick Test & Replication Guide
- 🗃️ **Database (db.js) Key Functions**
- 📦 **Utils.js API Reference**
- 🎉 **What Has Been Accomplished**
- 🎯 **Best Practices**
- 🐛 **Debugging Tips**
- ✅ **Pre-Flight Checklist**
- 🔍 **Verify Everything Works**
- 🐛 **Troubleshooting**
- 🚦 **Common Error Messages**
- 📝 **Important Notes**
- 📊 **Statistics**
- 🔧 **Common Development Tasks**
- 🔐 **Security Guidelines**
- ⚙️ **What Needs Work**
- 💡 **Development Tips**
- 📞 **Next Steps**
- 🚀 **Deploy to Production** (Choose One)
- 🔗 **Useful Resources**

## God Nodes (most connected - your core abstractions)
1. `initDashboard()` - 24 edges
2. `initDashboard()` - 24 edges
3. `loadAllData()` - 23 edges
4. `loadAllData()` - 23 edges
5. `Securo v2.0 - Campus Safety Platform` - 19 edges
6. `Quick Testing Summary Checklist` - 19 edges
7. `sendAccountNotification()` - 16 edges
8. `handleAttendance()` - 16 edges
9. `handleAttendance()` - 16 edges
10. `sendAccountNotification()` - 16 edges

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

## Communities (117 total, 14 thin omitted)

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
Nodes (92): getAcceptedLinksForGuardian(), getAllLinksForGuardian(), getGADPosts(), getGuardianSharedEmergencyPosts(), mergeEmergencyPosts(), saveUserProfile(), subscribeToAccountNotifications(), subscribeToStudentAttendance() (+84 more)

### Community 7 - "Emergency & Incident Response"
Cohesion: 0.05
Nodes (85): getAcceptedLinksForGuardian(), getAllLinksForGuardian(), subscribeToAccountNotifications(), subscribeToStudentAttendance(), subscribeToStudentLocation(), subscribeToStudentSOS(), CAMPUS_BUILDINGS, CAMPUS_CENTER (+77 more)

### Community 8 - "Authentication & User Management"
Cohesion: 0.06
Nodes (66): applyGadLikesOverlay(), assertGuardianCapacityForRequest(), buildThreadsFromMessages(), createGuardianLinkFromStudent(), createGuardianLinkRequest(), deleteConversationThread(), deleteCurrentUserAccount(), deleteGADPost() (+58 more)

### Community 9 - "Authentication & User Management"
Cohesion: 0.05
Nodes (61): applyGadLikesOverlay(), assertGuardianCapacityForRequest(), buildThreadsFromMessages(), deleteConversationThread(), deleteEmergencyPost(), deleteGADPost(), doesGuardianLinkMatchStudent(), findExistingGuardianStudentLink() (+53 more)

### Community 10 - "Authentication & User Management"
Cohesion: 0.09
Nodes (33): changePassword(), checkAuth(), forgotPassword(), getFriendlyAuthMessage(), getPreferredAuthRole(), googleProvider, login(), loginWithGoogle() (+25 more)

### Community 11 - "Authentication & User Management"
Cohesion: 0.07
Nodes (40): changePassword(), checkAuth(), forgotPassword(), getFriendlyAuthMessage(), getPreferredAuthRole(), googleProvider, login(), loginWithGoogle() (+32 more)

### Community 12 - "Authentication & User Management"
Cohesion: 0.05
Nodes (34): puppeteer, author, dependencies, @capacitor/android, @capacitor/app, @capacitor/camera, @capacitor/cli, @capacitor/core (+26 more)

### Community 13 - "Authentication & User Management"
Cohesion: 0.16
Nodes (29): applyFilters(), escapeHtml(), extractUsersFromLogs(), getInitials(), getManagedUserById(), getQuickRegionalLocation(), getReporterInfo(), getRoleCounts() (+21 more)

### Community 14 - "Emergency & Incident Response"
Cohesion: 0.14
Nodes (30): setStudentLocationSharingStatus(), captureSosLocationSnapshot(), checkCampusGeofence(), downloadVaultItem(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings() (+22 more)

### Community 15 - "Authentication & User Management"
Cohesion: 0.17
Nodes (23): applyFilters(), escapeHtml(), getInitials(), getOtherUserIdFromThread(), getQuickRegionalLocation(), getReporterInfo(), getRoleCounts(), handleAdminSendMessage() (+15 more)

### Community 16 - "Authentication & User Management"
Cohesion: 0.17
Nodes (25): getUserSOSLogs(), calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate(), getAttendanceQueueKey() (+17 more)

### Community 17 - "Student & Guardian Services"
Cohesion: 0.16
Nodes (26): fetchLatestCampusMapConfig(), updateStudentLiveLocation(), checkCampusGeofence(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings(), getCampusGeofencePolygon() (+18 more)

### Community 18 - "Student & Guardian Services"
Cohesion: 0.15
Nodes (27): fetchLatestCampusMapConfig(), setStudentLocationSharingStatus(), updateStudentLiveLocation(), checkCampusGeofence(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings() (+19 more)

### Community 19 - "Authentication & User Management"
Cohesion: 0.10
Nodes (26): subscribeToGADMessages(), buildGuardianRequestNotification(), buildLocationReminderNotification(), downloadVaultItem(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getGuardianBaseUrl() (+18 more)

### Community 20 - "Authentication & User Management"
Cohesion: 0.12
Nodes (22): markAccountNotificationRead(), openNotifications(), buildGuardianRequestNotification(), buildLocationReminderNotification(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getNotificationIcon() (+14 more)

### Community 21 - "Emergency & Incident Response"
Cohesion: 0.14
Nodes (30): captureSosLocationSnapshot(), checkCampusGeofence(), checkSosTrigger, downloadVaultItem(), ensureCapacitorLocationPermission(), focusBuilding(), formatCampusEventTime(), getActiveCampusBuildings() (+22 more)

### Community 22 - "Authentication & User Management"
Cohesion: 0.12
Nodes (22): markAccountNotificationRead(), openNotifications(), buildGuardianRequestNotification(), buildLocationReminderNotification(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getNotificationIcon() (+14 more)

### Community 23 - "Geospatial & Campus Map"
Cohesion: 0.14
Nodes (31): getAttendanceHistory(), getUserActivitySummary(), getUserEmergencyPosts(), getUserSOSLogs(), loadStudentLogs(), calculateStats(), formatAttendanceLocation(), formatDateShort() (+23 more)

### Community 24 - "Geospatial & Campus Map"
Cohesion: 0.17
Nodes (26): getAttendanceHistory(), loadStudentLogs(), calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate() (+18 more)

### Community 25 - "Geospatial & Campus Map"
Cohesion: 0.20
Nodes (22): calculateStats(), formatAttendanceLocation(), formatDateShort(), formatDateTime12(), formatTime12(), getAttendanceLogDate(), getAttendanceQueueKey(), getIsTimedInFromHistory() (+14 more)

### Community 26 - "Authentication & User Management"
Cohesion: 0.10
Nodes (27): subscribeToGADMessages(), buildGuardianRequestNotification(), buildLocationReminderNotification(), downloadVaultItem(), escapeHtml(), formatGadAuthor(), formatNotificationTimestamp(), getGuardianBaseUrl() (+19 more)

### Community 27 - "Administration & Campus Operations"
Cohesion: 0.21
Nodes (13): downloadCSV(), downloadDailyCsvReport(), downloadDailyExcelReport(), executeAdminLogout(), getLocalDateString(), openBulkImportModal(), parseBulkContent(), printDailyReportWindow() (+5 more)

### Community 28 - "Administration & Campus Operations"
Cohesion: 0.15
Nodes (17): downloadCSV(), downloadDailyCsvReport(), downloadDailyExcelReport(), executeAdminLogout(), extractCoords(), fetchAllSafetyRecords(), getLocalDateString(), openBulkImportModal() (+9 more)

### Community 29 - "Module Component 29"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 30 - "Emergency & Incident Response"
Cohesion: 0.27
Nodes (8): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal()

### Community 31 - "Module Component 31"
Cohesion: 0.13
Nodes (14): background_color, categories, description, display, icons, name, orientation, prefer_related_applications (+6 more)

### Community 32 - "Emergency & Incident Response"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

### Community 33 - "Navigation & Routing"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

### Community 34 - "Emergency & Incident Response"
Cohesion: 0.27
Nodes (8): addEmergencyContact(), createSOSFabWithContacts(), DEFAULT_CONTACTS, getCampusContacts(), getEmergencyContacts(), initiateCall(), renderEmergencyContactWidget(), showAddContactModal()

### Community 35 - "Navigation & Routing"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

### Community 36 - "Authentication & User Management"
Cohesion: 0.18
Nodes (12): attachThreadDeleteGesture(), formatThreadTimestamp(), getOtherUserIdFromThread(), getThreadClientInfo(), getThreadLastActivityMs(), getThreadParticipantRole(), getUserPresenceStatus(), handleAdminSendMessage() (+4 more)

### Community 37 - "Emergency & Incident Response"
Cohesion: 0.17
Nodes (13): closeChat(), closeEmergencyCameraPanel(), handleUniversalBackClose(), openEmergencyCamera(), setSosIdleState(), startEmergencyCamera(), startSosHold(), stepHoldAnimation() (+5 more)

### Community 38 - "Navigation & Routing"
Cohesion: 0.23
Nodes (14): deduplicateVaultItems(), enterVaultSelectionMode(), exitVaultSelectionMode(), getPlayableVideoUrl(), getVaultCacheKey(), getVaultSelectionKey(), loadVaultFromCache(), loadVaultItems() (+6 more)

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
Cohesion: 0.39
Nodes (8): goToSlide(), playCameraShutterSound(), snapSelfiePhoto(), startCircleLiveCamera(), stopCircleLiveCamera(), toTitleCase(), triggerFullscreenOnboarding(), updateFsAvatarPreview()

### Community 45 - "Student & Guardian Services"
Cohesion: 0.24
Nodes (11): attachPhotoToActiveSOS(), autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), startRecordingTicker(), startVideoRecording() (+3 more)

### Community 46 - "Authentication & User Management"
Cohesion: 0.22
Nodes (11): attachThreadDeleteGesture(), formatThreadTimestamp(), getThreadClientInfo(), getThreadLastActivityMs(), getThreadParticipantRole(), getUserPresenceStatus(), initAdminChat(), isAdminName() (+3 more)

### Community 47 - "Authentication & User Management"
Cohesion: 0.24
Nodes (12): buildUserRelations(), closeUserActionMenu(), formatAdminTime(), getRoleKey(), getRoleLabel(), loadManagedUserLocation(), renderManagedUsers(), renderRelationList() (+4 more)

### Community 48 - "Securo v2.0 - Complete Feature List"
Cohesion: 0.04
Nodes (48): **10. Guardian-Student Communication**, **11. GAD Services**, **12. Incident Reporting**, **13. Profile Settings**, **14. Settings & Preferences**, **15. Account Management**, **16. User Management**, **17. Analytics Dashboard** (+40 more)

### Community 49 - "Student & Guardian Services"
Cohesion: 0.39
Nodes (8): goToSlide(), playCameraShutterSound(), snapSelfiePhoto(), startCircleLiveCamera(), stopCircleLiveCamera(), toTitleCase(), triggerFullscreenOnboarding(), updateFsAvatarPreview()

### Community 50 - "Emergency & Incident Response"
Cohesion: 0.27
Nodes (10): autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), startRecordingTicker(), startVideoRecording(), stopRecordingTicker() (+2 more)

### Community 51 - "Service Worker & Offline Support"
Cohesion: 0.35
Nodes (8): initializeOfflineSupport(), registerServiceWorker(), requestBackgroundSync(), requestNotificationPermission(), setupConnectivityListeners(), setupServiceWorkerListeners(), showUpdateNotification(), updateOfflineQueueIndicator()

### Community 52 - "Emergency & Incident Response"
Cohesion: 0.24
Nodes (11): autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), showToast(), startRecordingTicker(), startVideoRecording() (+3 more)

### Community 53 - "Emergency & Incident Response"
Cohesion: 0.21
Nodes (12): attachPhotoToActiveSOS(), autoPostCapture(), fileToDataUrl(), handleCaptureEnd(), handleCaptureStart(), resetCameraZoom(), showToast(), startRecordingTicker() (+4 more)

### Community 54 - "Securo v2.0 - Deployment Guide"
Cohesion: 0.04
Nodes (48): 1. **Firebase Configuration**, 2. **Service Worker & PWA**, 3. **Permission Onboarding**, 4. **Environment-Specific Configuration**, **Admin Features**, **Already Implemented**, **Android (Chrome)**, **Authentication Flow** (+40 more)

### Community 55 - "Emergency & Incident Response"
Cohesion: 0.26
Nodes (13): deleteEmergencyPost(), getEmergencyPostById(), logAttendance(), processOfflineQueue(), readLocalEmergencyPosts(), saveEmergencyPost(), toggleEmergencyPostAccess(), toggleEmergencyPostGuardianAccess() (+5 more)

### Community 56 - "Student & Guardian Services"
Cohesion: 0.23
Nodes (12): getGuardianBaseUrl(), goToSlide(), openInviteParentModal(), playCameraShutterSound(), renderGuardianWatchers(), showToast(), snapSelfiePhoto(), startCircleLiveCamera() (+4 more)

### Community 57 - "Authentication & User Management"
Cohesion: 0.22
Nodes (9): createAttendanceChart(), createSOSTypeChart(), createUserDistributionChart(), displayRecentActivity(), loadAnalytics(), getAllAuditLogs(), getAllGuardianLinksAdmin(), getAttendanceStats() (+1 more)

### Community 59 - "loadAllData"
Cohesion: 0.12
Nodes (20): createAttendanceChart(), createSOSTypeChart(), createUserDistributionChart(), displayRecentActivity(), extractCoords(), extractUsersFromLogs(), fetchAllSafetyRecords(), getManagedUserById() (+12 more)

### Community 60 - "Administration & Campus Operations"
Cohesion: 0.29
Nodes (8): closeGeofenceEditorModal(), getActiveAdminBuildings(), getActiveAdminGeofencePolygon(), openGeofenceEditorModal(), renderBuildingMarkers(), renderModalEditorMarkers(), setupGeofenceEditorControls(), saveCampusMapConfig()

### Community 61 - "Securo v2.0 - Campus Safety Platform"
Cohesion: 0.05
Nodes (42): 🙏 **Acknowledgments**, Advanced Campus Security & Emergency Response System, **Authentication**, **Backend**, 📱 **Browser Support**, 📝 **Changelog**, **✅ Completed (v2.0)**, 🤝 **Contributing** (+34 more)

### Community 62 - "Administration & Campus Operations"
Cohesion: 0.31
Nodes (9): closeGeofenceEditorModal(), getActiveAdminBuildings(), getActiveAdminGeofencePolygon(), openGeofenceEditorModal(), renderAdminSosMap(), renderBuildingMarkers(), renderModalEditorMarkers(), setupGeofenceEditorControls() (+1 more)

### Community 63 - "✅ **COMPLETED IMPLEMENTATIONS**"
Cohesion: 0.06
Nodes (33): 10. **Analytics & Reporting** ✓, 11. **Web App Manifest** ✓, 12. **HTML Files Utils.js Integration** ✓, 13. **Emergency Contact Integration** ✓, 14. **Logger Integration (Partial)** ⚙️, 15. **Code Quality Improvements** ⚙️, 15. **UI/UX Improvements**, 16. **Missing Feature Implementations** (+25 more)

### Community 64 - "UI Components & Transitions"
Cohesion: 0.25
Nodes (11): getGuardianBaseUrl(), goToSlide(), openInviteParentModal(), playCameraShutterSound(), renderGuardianWatchers(), snapSelfiePhoto(), startCircleLiveCamera(), stopCircleLiveCamera() (+3 more)

### Community 65 - "Student & Guardian Services"
Cohesion: 0.52
Nodes (7): readLocalGuardianLinks(), removeGuardianLink(), removeLocalGuardianLink(), subscribeToGuardianLinks(), subscribeToGuardianRequests(), upsertLocalGuardianLink(), writeLocalGuardianLinks()

### Community 66 - "UI Components & Transitions"
Cohesion: 0.67
Nodes (6): dismissFallback(), ensureGSAP(), ensureOverlay(), initPreloader(), runAnimation(), runTransitionDismiss()

### Community 67 - "Student & Guardian Services"
Cohesion: 0.38
Nodes (3): goBack(), interceptLinks(), navigate()

### Community 68 - "sendAccountNotification"
Cohesion: 0.20
Nodes (19): createGuardianLinkFromStudent(), createGuardianLinkRequest(), findStudentUidByStudentId(), findUserByEmail(), getAllUsers(), getUserIdentityKeys(), inferUserRole(), mergeUsersByIdentity() (+11 more)

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

### Community 89 - "Implementation Summary: Clean URLs & Terms and Conditions"
Cohesion: 0.07
Nodes (27): 1. Terms and Conditions Page, 2. Registration Terms Checkbox, 3. Clean URL Routing System, After (New), Before (Old), ✅ Completed Features, 🚀 Deployment, 📁 Files Created (+19 more)

### Community 90 - "3. Core Functional Modules"
Cohesion: 0.10
Nodes (20): 1. System Overview & Technology Stack, 2.1 Student, 2.2 Staff Member, 2.3 Parent / Guardian, 2.4 Security Administrator (Admin Terminal / Command Center), 2. User Roles and Permissions Matrix, 3.1 Authentication & Routing Engine, 3.2 Real-time SOS Dispatch & Telemetry (+12 more)

### Community 91 - "Securo Clean URL Routing"
Cohesion: 0.10
Nodes (20): Browser Compatibility, Files Added/Modified, For Mobile App (Capacitor/Cordova), For Web Deployment (Apache/Nginx), How It Works, How to Use, In HTML Links, In JavaScript (+12 more)

### Community 92 - "Quick Testing Summary Checklist"
Cohesion: 0.10
Nodes (20): 10. Native Camera Support (Android / Web), 11. Terms and Conditions Agreement Flow, 12. Securo Staff Role Styling & Access, 13. Landing Page Overhaul & Team Members Showcase, 14. Mobile View Redirection & Student Logout Flow, 15. Student-Guardian Invitation Consent Verification, 16. Guardian Dashboard Desktop View & Alert Sirens, 17. Real-Time Geofence Tracking Protection (+12 more)

### Community 93 - "Securo v2.0 - Quick Start Checklist"
Cohesion: 0.14
Nodes (14): **Browser DevTools**, **Create Test Accounts**, 📚 **Documentation**, **Firebase Console**, 🧪 **First-Time User Testing**, 📱 **Install as PWA**, 📊 **Monitor Your App**, 🆘 **Need Help?** (+6 more)

### Community 94 - "getUserProfile"
Cohesion: 0.20
Nodes (14): deleteCurrentUserAccount(), deleteUserRecord(), getGuardianRequestsForStudent(), getStudentBootstrapProfile(), getUserProfile(), isPermissionDeniedError(), readLocalUsers(), saveUserProfile() (+6 more)

### Community 95 - "Securo v2.0 - Implementation Complete Summary"
Cohesion: 0.17
Nodes (12): 🎉 **Conclusion**, **Could Have (Future)**, **Deployment Options**, 🚀 **Deployment Steps**, **Fully Functional**, 🏆 **Key Achievements**, **Must Have (Before Production)**, **Pre-Deployment (Critical)** (+4 more)

### Community 96 - "Securo v2.0 - Developer Quick Reference"
Cohesion: 0.20
Nodes (10): **Before Committing**, **Before Deploying**, 📝 **Code Style Guide**, **Comments**, 🆘 **Getting Help**, **Naming Conventions**, 📁 **Project Structure**, 💡 **Quick Commands** (+2 more)

### Community 97 - "Securo Quick Test & Replication Guide"
Cohesion: 0.22
Nodes (8): 1. Terms & Conditions (`terms.html`), 2. Staff Role Experience (`login.html` & `role-selection.html`), 3. Landing Page (`landing.html`), 4. Student Flow & Auth Fix (`index.html`), 5. Guardian Dashboard (`guardian-dashboard.html` & `profile.html`), 6. Admin Command Center (`admin.html`), 7. Sync Build, Securo Quick Test & Replication Guide

### Community 98 - "🗃️ **Database (db.js) Key Functions**"
Cohesion: 0.22
Nodes (9): **Analytics**, **Attendance**, **Audit Logging**, 🗃️ **Database (db.js) Key Functions**, **Emergency**, **Guardian Links**, **Notifications**, **Offline Queue** (+1 more)

### Community 99 - "📦 **Utils.js API Reference**"
Cohesion: 0.22
Nodes (9): **Device**, **Format**, **Logger**, **Network**, **Permissions**, **Storage**, **UI**, 📦 **Utils.js API Reference** (+1 more)

### Community 100 - "🎉 **What Has Been Accomplished**"
Cohesion: 0.29
Nodes (7): **Phase 1: Core Infrastructure** ✅, **Phase 2: Offline & PWA Support** ✅, **Phase 3: Enhanced Features** ✅, **Phase 4: Authentication & Onboarding** ✅, **Phase 5: HTML File Integration** ✅, **Phase 6: Documentation** ✅, 🎉 **What Has Been Accomplished**

### Community 101 - "🎯 **Best Practices**"
Cohesion: 0.33
Nodes (6): **Async Operations**, 🎯 **Best Practices**, **Error Handling**, **Loading States**, **User Feedback**, **Validation**

### Community 102 - "🐛 **Debugging Tips**"
Cohesion: 0.33
Nodes (6): **Check Auth State**, **Check Firestore Connection**, **Check LocalStorage**, **Check Service Worker**, 🐛 **Debugging Tips**, **Enable Verbose Logging**

### Community 103 - "✅ **Pre-Flight Checklist**"
Cohesion: 0.33
Nodes (6): **1. Firebase Setup** (5 minutes), **2. Update Configuration** (2 minutes), **3. Deploy Security Rules** (2 minutes), **4. Test Locally** (3 minutes), **5. Test Features** (3 minutes), ✅ **Pre-Flight Checklist**

### Community 104 - "🔍 **Verify Everything Works**"
Cohesion: 0.33
Nodes (6): **Admin** ✅, **Authentication** ✅, **Core Features** ✅, **Offline** ✅, **Permissions** ✅, 🔍 **Verify Everything Works**

### Community 105 - "🐛 **Troubleshooting**"
Cohesion: 0.33
Nodes (6): **"Camera Not Working"**, **"Cannot find module"**, **"Firebase not defined"**, **"Permission Denied" Errors**, **"Service Worker Not Registering"**, 🐛 **Troubleshooting**

### Community 106 - "🚦 **Common Error Messages**"
Cohesion: 0.40
Nodes (5): **"Camera permission denied"**, 🚦 **Common Error Messages**, **"permission-denied"**, **"Service worker registration failed"**, **"User not found"**

### Community 107 - "📝 **Important Notes**"
Cohesion: 0.40
Nodes (5): **Browser Compatibility**, 📝 **Important Notes**, **Known Issues**, **Performance**, **Security**

### Community 108 - "📊 **Statistics**"
Cohesion: 0.40
Nodes (5): **Code Metrics**, **Files Created**, **Files Deleted**, **Files Updated**, 📊 **Statistics**

### Community 110 - "🔧 **Common Development Tasks**"
Cohesion: 0.50
Nodes (4): **1. Adding a New Feature**, **2. Adding a New Database Function**, **3. Adding a New HTML Page**, 🔧 **Common Development Tasks**

### Community 111 - "🔐 **Security Guidelines**"
Cohesion: 0.50
Nodes (4): **Authentication Checks**, **Firestore Queries**, **Input Sanitization**, 🔐 **Security Guidelines**

### Community 112 - "⚙️ **What Needs Work**"
Cohesion: 0.50
Nodes (4): **Code Quality (30% Complete)**, **Missing Features (Not Critical)**, **Testing Required**, ⚙️ **What Needs Work**

### Community 113 - "💡 **Development Tips**"
Cohesion: 0.50
Nodes (4): 💡 **Development Tips**, **For Debugging**, **For New Developers**, **For Testing**

### Community 114 - "📞 **Next Steps**"
Cohesion: 0.50
Nodes (4): **Immediate (This Week)**, **Long Term (Next Month)**, 📞 **Next Steps**, **Short Term (Next 2 Weeks)**

### Community 115 - "🚀 **Deploy to Production** (Choose One)"
Cohesion: 0.50
Nodes (4): 🚀 **Deploy to Production** (Choose One), **Option A: Firebase Hosting** (Recommended), **Option B: GitHub Pages**, **Option C: Netlify**

### Community 116 - "🔗 **Useful Resources**"
Cohesion: 0.67
Nodes (3): **Documentation**, **Tools**, 🔗 **Useful Resources**

## Knowledge Gaps
- **7 isolated node(s):** `@capacitor/android`, `@capacitor/app`, `@capacitor/camera`, `@capacitor/cli`, `@capacitor/core` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1378 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `subscribeToMessagesByThread()` connect `Authentication & User Management` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Emergency & Incident Response`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `@capacitor/android`, `@capacitor/app`, `@capacitor/camera` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Administration & Campus Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._
- **Why does `getGADPosts()` connect `Emergency & Incident Response` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Administration & Campus Operations`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Should `Student & Guardian Services` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._
- **Why does `subscribeToMessagesByThread()` connect `Authentication & User Management` to `Administration & Campus Operations`, `Student & Guardian Services`, `Authentication & User Management`, `Emergency & Incident Response`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`, `Authentication & User Management`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Should `Administration & Campus Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.013245033112582781 - nodes in this community are weakly interconnected._