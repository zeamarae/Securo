---
source_file: "emergency-contacts.js"
type: "code"
community: "Emergency Contacts & SOS"
location: "L1"
tags:
  - graphify/code
  - graphify/INFERRED
  - community/Emergency_Contacts__SOS
---

# emergency-contacts.js

## Connections
- [[DEFAULT_CONTACTS]] - `contains` [EXTRACTED]
- [[Logger]] - `imports` [EXTRACTED]
- [[Storage]] - `imports` [EXTRACTED]
- [[UI]] - `imports` [EXTRACTED]
- [[addEmergencyContact()]] - `indirect_call` [INFERRED]
- [[createSOSFabWithContacts()]] - `indirect_call` [INFERRED]
- [[db.js]] - `imports_from` [EXTRACTED]
- [[getCampusContacts()]] - `indirect_call` [INFERRED]
- [[getEmergencyContacts()]] - `indirect_call` [INFERRED]
- [[getUserProfile()]] - `imports` [EXTRACTED]
- [[initiateCall()]] - `indirect_call` [INFERRED]
- [[removeEmergencyContact()]] - `indirect_call` [INFERRED]
- [[renderEmergencyContactWidget()]] - `indirect_call` [INFERRED]
- [[sendEmergencySMS()]] - `indirect_call` [INFERRED]
- [[showAddContactModal()]] - `contains` [EXTRACTED]
- [[updateCampusContacts()]] - `indirect_call` [INFERRED]
- [[utils.js]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/INFERRED #community/Emergency_Contacts__SOS