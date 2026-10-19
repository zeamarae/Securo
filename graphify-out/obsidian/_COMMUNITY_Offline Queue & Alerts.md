---
type: community
cohesion: 0.28
members: 9
---

# Offline Queue & Alerts

**Cohesion:** 0.28 - loosely connected
**Members:** 9 nodes

## Members
- [[getLinksForStudent()]] - code - db.js
- [[logAttendance()]] - code - db.js
- [[logSOS()]] - code - db.js
- [[notifyGuardiansOfGeofenceEvent()]] - code - db.js
- [[notifyGuardiansSOS()]] - code - db.js
- [[processOfflineQueue()]] - code - db.js
- [[saveGADPost()]] - code - db.js
- [[sendAccountNotification()]] - code - db.js
- [[sendChatMessage()]] - code - db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Offline_Queue__Alerts
SORT file.name ASC
```

## Connections to other communities
- 9 edges to [[_COMMUNITY_Database & Notification Store]]
- 2 edges to [[_COMMUNITY_Guardian Link Requests]]
- 2 edges to [[_COMMUNITY_User Identity & Merging]]
- 1 edge to [[_COMMUNITY_Emergency Posts & Activity]]
- 1 edge to [[_COMMUNITY_Guardian Link Verification]]
- 1 edge to [[_COMMUNITY_GAD Messaging Subscriptions]]

## Top bridge nodes
- [[sendAccountNotification()]] - degree 9, connects to 5 communities
- [[logSOS()]] - degree 5, connects to 2 communities
- [[processOfflineQueue()]] - degree 4, connects to 2 communities
- [[saveGADPost()]] - degree 3, connects to 2 communities
- [[getLinksForStudent()]] - degree 4, connects to 1 community