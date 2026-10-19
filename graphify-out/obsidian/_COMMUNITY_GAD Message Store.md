---
type: community
cohesion: 0.50
members: 5
---

# GAD Message Store

**Cohesion:** 0.50 - moderately connected
**Members:** 5 nodes

## Members
- [[readLocalGADMessages()_1]] - code - www/db.js
- [[replyToGADMessage()_1]] - code - www/db.js
- [[sendGADMessage()_1]] - code - www/db.js
- [[subscribeToGADMessages()_1]] - code - www/db.js
- [[writeLocalGADMessages()_1]] - code - www/db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/GAD_Message_Store
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Firestore Operations]]
- 1 edge to [[_COMMUNITY_Guardian Notifications]]

## Top bridge nodes
- [[sendGADMessage()_1]] - degree 4, connects to 2 communities
- [[readLocalGADMessages()_1]] - degree 4, connects to 1 community
- [[replyToGADMessage()_1]] - degree 3, connects to 1 community
- [[writeLocalGADMessages()_1]] - degree 3, connects to 1 community
- [[subscribeToGADMessages()_1]] - degree 2, connects to 1 community