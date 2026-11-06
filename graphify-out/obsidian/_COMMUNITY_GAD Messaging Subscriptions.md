---
type: community
cohesion: 0.50
members: 5
---

# GAD Messaging Subscriptions

**Cohesion:** 0.50 - moderately connected
**Members:** 5 nodes

## Members
- [[readLocalGADMessages()]] - code - db.js
- [[replyToGADMessage()]] - code - db.js
- [[sendGADMessage()]] - code - db.js
- [[subscribeToGADMessages()]] - code - db.js
- [[writeLocalGADMessages()]] - code - db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/GAD_Messaging_Subscriptions
SORT file.name ASC
```

## Connections to other communities
- 5 edges to [[_COMMUNITY_Database & Notification Store]]
- 1 edge to [[_COMMUNITY_Offline Queue & Alerts]]

## Top bridge nodes
- [[sendGADMessage()]] - degree 4, connects to 2 communities
- [[readLocalGADMessages()]] - degree 4, connects to 1 community
- [[replyToGADMessage()]] - degree 3, connects to 1 community
- [[writeLocalGADMessages()]] - degree 3, connects to 1 community
- [[subscribeToGADMessages()]] - degree 2, connects to 1 community