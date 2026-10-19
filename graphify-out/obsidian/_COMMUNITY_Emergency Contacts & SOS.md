---
type: community
cohesion: 0.10
members: 34
---

# Emergency Contacts & SOS

**Cohesion:** 0.10 - loosely connected
**Members:** 34 nodes

## Members
- [[DEFAULT_CONTACTS]] - code - emergency-contacts.js
- [[Device]] - code - utils.js
- [[Format]] - code - utils.js
- [[Logger]] - code - utils.js
- [[Network]] - code - utils.js
- [[Permissions]] - code - utils.js
- [[Storage]] - code - utils.js
- [[UI]] - code - utils.js
- [[Validation]] - code - utils.js
- [[addEmergencyContact()]] - code - emergency-contacts.js
- [[createSOSFabWithContacts()]] - code - emergency-contacts.js
- [[debounce()]] - code - utils.js
- [[emergency-contacts.js]] - code - emergency-contacts.js
- [[getCampusContacts()]] - code - emergency-contacts.js
- [[getEmergencyContacts()]] - code - emergency-contacts.js
- [[initializeOfflineSupport()]] - code - install-sw.js
- [[initiateCall()]] - code - emergency-contacts.js
- [[install-sw.js]] - code - install-sw.js
- [[isServiceWorkerReady()]] - code - install-sw.js
- [[registerServiceWorker()]] - code - install-sw.js
- [[removeEmergencyContact()]] - code - emergency-contacts.js
- [[renderEmergencyContactWidget()]] - code - emergency-contacts.js
- [[requestBackgroundSync()]] - code - install-sw.js
- [[requestNotificationPermission()]] - code - install-sw.js
- [[sendEmergencySMS()]] - code - emergency-contacts.js
- [[setupConnectivityListeners()]] - code - install-sw.js
- [[setupServiceWorkerListeners()]] - code - install-sw.js
- [[showAddContactModal()]] - code - emergency-contacts.js
- [[showLocalNotification()]] - code - install-sw.js
- [[showUpdateNotification()]] - code - install-sw.js
- [[throttle()]] - code - utils.js
- [[updateCampusContacts()]] - code - emergency-contacts.js
- [[updateOfflineQueueIndicator()]] - code - install-sw.js
- [[utils.js]] - code - utils.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Emergency_Contacts__SOS
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_Database & Notification Store]]
- 3 edges to [[_COMMUNITY_Authentication & Role Management]]
- 2 edges to [[_COMMUNITY_Guardian Link Requests]]

## Top bridge nodes
- [[emergency-contacts.js]] - degree 17, connects to 2 communities
- [[utils.js]] - degree 14, connects to 2 communities
- [[Logger]] - degree 5, connects to 2 communities
- [[install-sw.js]] - degree 15, connects to 1 community
- [[initializeOfflineSupport()]] - degree 8, connects to 1 community