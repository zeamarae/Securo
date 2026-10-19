---
source_file: "install-sw.js"
type: "code"
community: "Emergency Contacts & SOS"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Emergency_Contacts__SOS
---

# install-sw.js

## Connections
- [[Logger]] - `imports` [EXTRACTED]
- [[Network]] - `imports` [EXTRACTED]
- [[UI]] - `imports` [EXTRACTED]
- [[db.js]] - `dynamic_import` [EXTRACTED]
- [[initializeOfflineSupport()]] - `indirect_call` [INFERRED]
- [[isServiceWorkerReady()]] - `contains` [EXTRACTED]
- [[registerServiceWorker()]] - `contains` [EXTRACTED]
- [[requestBackgroundSync()]] - `contains` [EXTRACTED]
- [[requestNotificationPermission()]] - `contains` [EXTRACTED]
- [[setupConnectivityListeners()]] - `contains` [EXTRACTED]
- [[setupServiceWorkerListeners()]] - `contains` [EXTRACTED]
- [[showLocalNotification()]] - `contains` [EXTRACTED]
- [[showUpdateNotification()]] - `contains` [EXTRACTED]
- [[updateOfflineQueueIndicator()]] - `contains` [EXTRACTED]
- [[utils.js]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Emergency_Contacts__SOS