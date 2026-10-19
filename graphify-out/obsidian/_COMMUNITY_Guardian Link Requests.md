---
type: community
cohesion: 0.17
members: 16
---

# Guardian Link Requests

**Cohesion:** 0.17 - loosely connected
**Members:** 16 nodes

## Members
- [[createGuardianLinkRequest()]] - code - db.js
- [[deleteCurrentUserAccount()]] - code - db.js
- [[deleteUserRecord()]] - code - db.js
- [[findStudentUidByStudentId()]] - code - db.js
- [[getGuardianRequestsForStudent()]] - code - db.js
- [[getStudentBootstrapProfile()]] - code - db.js
- [[getUserProfile()]] - code - db.js
- [[isPermissionDeniedError()]] - code - db.js
- [[readLocalUsers()]] - code - db.js
- [[saveUserProfile()]] - code - db.js
- [[subscribeToStudentLinks()]] - code - db.js
- [[syncGuardianLinksForGuardian()]] - code - db.js
- [[syncGuardianLinksForStudent()]] - code - db.js
- [[updateUserProfile()]] - code - db.js
- [[upsertLocalUser()]] - code - db.js
- [[writeLocalUsers()]] - code - db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Guardian_Link_Requests
SORT file.name ASC
```

## Connections to other communities
- 16 edges to [[_COMMUNITY_Database & Notification Store]]
- 4 edges to [[_COMMUNITY_User Identity & Merging]]
- 3 edges to [[_COMMUNITY_Authentication & Role Management]]
- 2 edges to [[_COMMUNITY_Offline Queue & Alerts]]
- 2 edges to [[_COMMUNITY_Emergency Contacts & SOS]]
- 1 edge to [[_COMMUNITY_Guardian Link Verification]]

## Top bridge nodes
- [[readLocalUsers()]] - degree 9, connects to 4 communities
- [[getUserProfile()]] - degree 8, connects to 3 communities
- [[createGuardianLinkRequest()]] - degree 5, connects to 3 communities
- [[isPermissionDeniedError()]] - degree 6, connects to 2 communities
- [[saveUserProfile()]] - degree 6, connects to 2 communities