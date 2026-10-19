---
type: community
cohesion: 0.11
members: 26
---

# Authentication & Role Management

**Cohesion:** 0.11 - loosely connected
**Members:** 26 nodes

## Members
- [[analytics]] - code - firebase-config.js
- [[app]] - code - firebase-config.js
- [[auth]] - code - firebase-config.js
- [[auth.js]] - code - auth.js
- [[changePassword()]] - code - auth.js
- [[checkAuth()]] - code - auth.js
- [[db]] - code - firebase-config.js
- [[extractStudentIdFromEmail()]] - code - auth.js
- [[firebase-config.js]] - code - firebase-config.js
- [[firebaseConfig]] - code - firebase-config.js
- [[forgotPassword()]] - code - auth.js
- [[getAdminUserPassword()]] - code - db.js
- [[getEmailByStudentId()]] - code - db.js
- [[getFriendlyAuthMessage()]] - code - auth.js
- [[getPreferredAuthRole()]] - code - auth.js
- [[googleProvider]] - code - auth.js
- [[logAuditEvent()]] - code - db.js
- [[login()]] - code - auth.js
- [[loginWithGoogle()]] - code - auth.js
- [[logout()]] - code - auth.js
- [[ref_https]] - concept
- [[roleIdToEmail()]] - code - auth.js
- [[signUp()]] - code - auth.js
- [[staffIdToEmail()]] - code - auth.js
- [[storage_2]] - code - firebase-config.js
- [[studentIdToEmail()]] - code - auth.js

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Authentication__Role_Management
SORT file.name ASC
```

## Connections to other communities
- 8 edges to [[_COMMUNITY_Database & Notification Store]]
- 3 edges to [[_COMMUNITY_Guardian Link Requests]]
- 3 edges to [[_COMMUNITY_Emergency Contacts & SOS]]
- 2 edges to [[_COMMUNITY_Auth Providers & Sessions]]
- 1 edge to [[_COMMUNITY_Firestore Operations]]

## Top bridge nodes
- [[auth.js]] - degree 25, connects to 3 communities
- [[ref_https]] - degree 6, connects to 3 communities
- [[getAdminUserPassword()]] - degree 4, connects to 2 communities
- [[firebase-config.js]] - degree 9, connects to 1 community
- [[logAuditEvent()]] - degree 7, connects to 1 community