---
type: community
cohesion: 0.48
members: 7
---

# User Lookup & Roles

**Cohesion:** 0.48 - moderately connected
**Members:** 7 nodes

## Members
- [[createGuardianLinkFromStudent()_1]] - code - www/db.js
- [[findUserByEmail()_1]] - code - www/db.js
- [[getAllUsers()_1]] - code - www/db.js
- [[getUserIdentityKeys()_1]] - code - www/db.js
- [[inferUserRole()_1]] - code - www/db.js
- [[mergeUsersByIdentity()_1]] - code - www/db.js
- [[normalizeEmail()_1]] - code - www/db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/User_Lookup__Roles
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Firestore Operations]]
- 4 edges to [[_COMMUNITY_Student Profile Services]]
- 2 edges to [[_COMMUNITY_Guardian Notifications]]
- 2 edges to [[_COMMUNITY_Guardian Link Validation]]

## Top bridge nodes
- [[createGuardianLinkFromStudent()_1]] - degree 7, connects to 4 communities
- [[getAllUsers()_1]] - degree 8, connects to 3 communities
- [[normalizeEmail()_1]] - degree 5, connects to 1 community
- [[findUserByEmail()_1]] - degree 4, connects to 1 community
- [[inferUserRole()_1]] - degree 4, connects to 1 community