---
type: community
cohesion: 0.17
members: 16
---

# Student Profile Services

**Cohesion:** 0.17 - loosely connected
**Members:** 16 nodes

## Members
- [[createGuardianLinkRequest()_1]] - code - www/db.js
- [[deleteCurrentUserAccount()_1]] - code - www/db.js
- [[deleteUserRecord()_1]] - code - www/db.js
- [[findStudentUidByStudentId()_1]] - code - www/db.js
- [[getGuardianRequestsForStudent()_1]] - code - www/db.js
- [[getStudentBootstrapProfile()_1]] - code - www/db.js
- [[getUserProfile()_1]] - code - www/db.js
- [[isPermissionDeniedError()_1]] - code - www/db.js
- [[readLocalUsers()_1]] - code - www/db.js
- [[saveUserProfile()_1]] - code - www/db.js
- [[subscribeToStudentLinks()_1]] - code - www/db.js
- [[syncGuardianLinksForGuardian()_1]] - code - www/db.js
- [[syncGuardianLinksForStudent()_1]] - code - www/db.js
- [[updateUserProfile()_1]] - code - www/db.js
- [[upsertLocalUser()_1]] - code - www/db.js
- [[writeLocalUsers()_1]] - code - www/db.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Student_Profile_Services
SORT file.name ASC
```

## Connections to other communities
- 16 edges to [[_COMMUNITY_Firestore Operations]]
- 4 edges to [[_COMMUNITY_User Lookup & Roles]]
- 3 edges to [[_COMMUNITY_Auth Providers & Sessions]]
- 2 edges to [[_COMMUNITY_Guardian Notifications]]
- 2 edges to [[_COMMUNITY_Campus SOS Dispatcher]]
- 1 edge to [[_COMMUNITY_Guardian Link Validation]]

## Top bridge nodes
- [[readLocalUsers()_1]] - degree 9, connects to 4 communities
- [[getUserProfile()_1]] - degree 8, connects to 3 communities
- [[createGuardianLinkRequest()_1]] - degree 5, connects to 3 communities
- [[isPermissionDeniedError()_1]] - degree 6, connects to 2 communities
- [[saveUserProfile()_1]] - degree 6, connects to 2 communities