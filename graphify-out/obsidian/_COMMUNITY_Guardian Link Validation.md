---
type: community
cohesion: 0.29
members: 7
---

# Guardian Link Validation

**Cohesion:** 0.29 - loosely connected
**Members:** 7 nodes

## Members
- [[assertGuardianCapacityForRequest()_1]] - code - www/db.js
- [[doesGuardianLinkMatchStudent()_1]] - code - www/db.js
- [[findExistingGuardianStudentLink()_1]] - code - www/db.js
- [[getAcceptedStudentGuardianLinks()_1]] - code - www/db.js
- [[getGuardianLinkRecords()_1]] - code - www/db.js
- [[normalizeComparableValue()_1]] - code - www/db.js
- [[respondToGuardianLink()_1]] - code - www/db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Guardian_Link_Validation
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Firestore Operations]]
- 2 edges to [[_COMMUNITY_User Lookup & Roles]]
- 1 edge to [[_COMMUNITY_Guardian Notifications]]
- 1 edge to [[_COMMUNITY_Student Profile Services]]

## Top bridge nodes
- [[findExistingGuardianStudentLink()_1]] - degree 5, connects to 3 communities
- [[assertGuardianCapacityForRequest()_1]] - degree 5, connects to 2 communities
- [[respondToGuardianLink()_1]] - degree 3, connects to 2 communities
- [[doesGuardianLinkMatchStudent()_1]] - degree 3, connects to 1 community
- [[getGuardianLinkRecords()_1]] - degree 3, connects to 1 community