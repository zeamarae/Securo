---
type: community
cohesion: 0.29
members: 7
---

# Guardian Link Verification

**Cohesion:** 0.29 - loosely connected
**Members:** 7 nodes

## Members
- [[assertGuardianCapacityForRequest()]] - code - db.js
- [[doesGuardianLinkMatchStudent()]] - code - db.js
- [[findExistingGuardianStudentLink()]] - code - db.js
- [[getAcceptedStudentGuardianLinks()]] - code - db.js
- [[getGuardianLinkRecords()]] - code - db.js
- [[normalizeComparableValue()]] - code - db.js
- [[respondToGuardianLink()]] - code - db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Guardian_Link_Verification
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Database & Notification Store]]
- 2 edges to [[_COMMUNITY_User Identity & Merging]]
- 1 edge to [[_COMMUNITY_Offline Queue & Alerts]]
- 1 edge to [[_COMMUNITY_Guardian Link Requests]]

## Top bridge nodes
- [[findExistingGuardianStudentLink()]] - degree 5, connects to 3 communities
- [[assertGuardianCapacityForRequest()]] - degree 5, connects to 2 communities
- [[respondToGuardianLink()]] - degree 3, connects to 2 communities
- [[doesGuardianLinkMatchStudent()]] - degree 3, connects to 1 community
- [[getGuardianLinkRecords()]] - degree 3, connects to 1 community