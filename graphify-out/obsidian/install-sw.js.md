---
source_file: "install-sw.js"
type: "code"
community: "Community 2"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Community_2
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

#graphify/code #graphify/EXTRACTED #community/Community_2