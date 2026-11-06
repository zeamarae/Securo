---
source_file: "www/install-sw.js"
type: "code"
community: "Campus SOS Dispatcher"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Campus_SOS_Dispatcher
---

# www/install-sw.js

## Connections
- [[Logger_1]] - `imports` [EXTRACTED]
- [[Network_1]] - `imports` [EXTRACTED]
- [[UI_1]] - `imports` [EXTRACTED]
- [[initializeOfflineSupport()_1]] - `indirect_call` [INFERRED]
- [[isServiceWorkerReady()_1]] - `contains` [EXTRACTED]
- [[registerServiceWorker()_1]] - `contains` [EXTRACTED]
- [[requestBackgroundSync()_1]] - `contains` [EXTRACTED]
- [[requestNotificationPermission()_1]] - `contains` [EXTRACTED]
- [[setupConnectivityListeners()_1]] - `contains` [EXTRACTED]
- [[setupServiceWorkerListeners()_1]] - `contains` [EXTRACTED]
- [[showLocalNotification()_1]] - `contains` [EXTRACTED]
- [[showUpdateNotification()_1]] - `contains` [EXTRACTED]
- [[updateOfflineQueueIndicator()_1]] - `contains` [EXTRACTED]
- [[wwwdb.js]] - `dynamic_import` [EXTRACTED]
- [[wwwutils.js]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Campus_SOS_Dispatcher