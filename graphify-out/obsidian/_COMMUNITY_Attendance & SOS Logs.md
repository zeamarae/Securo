---
type: community
cohesion: 0.20
members: 14
---

# Attendance & SOS Logs

**Cohesion:** 0.20 - loosely connected
**Members:** 14 nodes

## Members
- [[deleteEmergencyPost()_1]] - code - www/db.js
- [[getAllEmergencyPosts()_1]] - code - www/db.js
- [[getAttendanceHistory()_1]] - code - www/db.js
- [[getEmergencyPostById()_1]] - code - www/db.js
- [[getUserActivitySummary()_1]] - code - www/db.js
- [[getUserEmergencyPosts()_1]] - code - www/db.js
- [[getUserSOSLogs()_1]] - code - www/db.js
- [[mergeEmergencyPosts()_1]] - code - www/db.js
- [[readLocalEmergencyPosts()_1]] - code - www/db.js
- [[saveEmergencyPost()_1]] - code - www/db.js
- [[toggleEmergencyPostAccess()_1]] - code - www/db.js
- [[toggleEmergencyPostGuardianAccess()_1]] - code - www/db.js
- [[updateEmergencyPostAttachments()_1]] - code - www/db.js
- [[writeLocalEmergencyPosts()_1]] - code - www/db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Attendance__SOS_Logs
SORT file.name ASC
```

## Connections to other communities
- 14 edges to [[_COMMUNITY_Firestore Operations]]
- 1 edge to [[_COMMUNITY_Guardian Notifications]]

## Top bridge nodes
- [[saveEmergencyPost()_1]] - degree 4, connects to 2 communities
- [[readLocalEmergencyPosts()_1]] - degree 9, connects to 1 community
- [[writeLocalEmergencyPosts()_1]] - degree 6, connects to 1 community
- [[getUserActivitySummary()_1]] - degree 4, connects to 1 community
- [[getUserEmergencyPosts()_1]] - degree 4, connects to 1 community