---
type: community
cohesion: 0.48
members: 7
---

# User Identity & Merging

**Cohesion:** 0.48 - moderately connected
**Members:** 7 nodes

## Members
- [[createGuardianLinkFromStudent()]] - code - db.js
- [[findUserByEmail()]] - code - db.js
- [[getAllUsers()]] - code - db.js
- [[getUserIdentityKeys()]] - code - db.js
- [[inferUserRole()]] - code - db.js
- [[mergeUsersByIdentity()]] - code - db.js
- [[normalizeEmail()]] - code - db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/User_Identity__Merging
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Database & Notification Store]]
- 4 edges to [[_COMMUNITY_Guardian Link Requests]]
- 2 edges to [[_COMMUNITY_Offline Queue & Alerts]]
- 2 edges to [[_COMMUNITY_Guardian Link Verification]]

## Top bridge nodes
- [[createGuardianLinkFromStudent()]] - degree 7, connects to 4 communities
- [[getAllUsers()]] - degree 8, connects to 3 communities
- [[normalizeEmail()]] - degree 5, connects to 1 community
- [[findUserByEmail()]] - degree 4, connects to 1 community
- [[inferUserRole()]] - degree 4, connects to 1 community