# Securo Campus Safety System — Specification, Architecture, Roles, and AI Prompt Blueprint

## 1. System Overview & Technology Stack
Securo is an enterprise-grade, real-time campus safety and emergency dispatch ecosystem designed for higher education institutions. The system operates simultaneously as a responsive Progressive Web Application (PWA) and an Android hybrid mobile application built with Capacitor.

### Core Technology Stack:
- Frontend Core: Modern Vanilla JavaScript (ES Modules), HTML5, CSS3 with responsive glassmorphic design and CSS variables.
- Mobile Runtime: Capacitor / Cordova Android bridge with hardware sensor integration (GPS, camera, touch gestures).
- Backend & Database: Google Firebase Ecosystem (Firebase Auth, Cloud Firestore real-time database, Firebase Storage).
- Routing & Clean URLs: Dual routing engine supporting Apache server-side rewriting (`.htaccess`) and client-side mobile routing (`router.js`, `spa-router.js`).
- Mapping & Geolocation: Interactive campus mapping engine with geofencing boundaries, building safety points, and real-time student coordinate synchronization.

---

## 2. User Roles and Permissions Matrix

### 2.1 Student
- Credentials: 7-digit Institution Student ID or email, password, and mandatory Terms & Conditions consent.
- Access Rights:
  - Live interactive campus map with emergency exits, clinics, and security outposts.
  - One-tap SOS Emergency Trigger (with cancel countdown and silent alarm capabilities).
  - Secure Evidence Vault for capturing, storing, and reviewing incident photos and videos.
  - Gender and Development (GAD) confidential reporting and mental wellness assistance.
  - Incident history tracking and report management.
  - Campus attendance check-in and location verification.
  - Parent/Guardian linking management (approve/reject link requests, toggle media sharing).

### 2.2 Staff Member
- Credentials: 7-digit Staff ID or email, password.
- Access Rights:
  - Campus map navigation and emergency points of contact.
  - Independent SOS emergency dispatch tools.
  - Attendance and campus check-in tools without guardian oversight requirements.
  - Direct communication with campus security and administrative support.

### 2.3 Parent / Guardian
- Credentials: Email and password registration, verified ward pairing.
- Access Rights:
  - Multi-child tracking dashboard with selector chips.
  - Real-time GPS location tracking and last-seen timestamps of connected student.
  - Active SOS alerts receiving push notifications and coordinate updates.
  - Shared Evidence Vault access (view and download photos/videos permitted by student).
  - Dedicated direct communication channel with campus emergency responders.

### 2.4 Security Administrator (Admin Terminal / Command Center)
- Credentials: Administrative security credentials with elevated session verification.
- Access Rights:
  - Live Campus Command Center with real-time incident queue and SOS telemetry.
  - Incident dispatch, status triage (Open, Dispatched, Resolved), and responder notes.
  - Interactive Geofencing management (campus boundaries, restricted zones, hazard pins).
  - Comprehensive user directory (Students, Staff, Guardians) with role escalation and status controls.
  - GAD confidential claims desk with privacy safeguards and counselor assignments.
  - Campus-wide emergency broadcast system (broadcast notifications, banner alerts, SMS integration hooks).
  - Analytical metrics, response time logs, and safety trend statistics.

---

## 3. Core Functional Modules

### 3.1 Authentication & Routing Engine
- Supports 7-digit identification number normalization to domain addresses (`student.XXXXXXX@securo.app`, `staff.XXXXXXX@securo.app`).
- Legal compliance gate: Terms and Conditions verification check during account onboarding.
- Dynamic environment detection switching seamlessly between web clean URLs and native Capacitor Android file paths.

### 3.2 Real-time SOS Dispatch & Telemetry
- Multi-state emergency activation (Hold-to-trigger, instant tap, cancel interval).
- Automated coordinate transmission capturing latitude, longitude, accuracy radius, and battery telemetry.
- Broadcast alert generation to administrative dashboards and paired guardian devices.

### 3.3 Interactive Campus Geofencing & Mapping
- Multi-layer interactive campus blueprint displaying administrative buildings, dormitories, assembly areas, and first aid stations.
- Real-time location marker syncing with geofence perimeter detection (In-Campus, Safe Zone, Outside Perimeter).

### 3.4 Evidence Vault & Media Security
- Client-side media capture for photos and videos during safety incidents.
- Metadata tagging: exact GPS coordinates, timestamping, and user UID.
- Granular guardian sharing toggles respecting student privacy while enabling safety verification.

### 3.5 Gender and Development (GAD) Support Portal
- Confidential incident reporting channel for sensitive inquiries, harassment reports, and mental wellness support.
- Anonymous mode toggle allowing students to seek guidance without revealing personal identity to public logs.

### 3.6 Incident History & Resolution Audit
- Immutable chronological audit trail of all generated SOS signals and filed incident reports.
- Status lifecycles: Pending Review, Under Investigation, Dispatched, and Resolved with administrative remarks.

---

## 4. Comprehensive AI System Prompts

### 4.1 Master Campus Safety AI System Prompt
Use this prompt as the foundational system persona for an AI assistant integrated into Securo:

```
You are SECO-AI, the official intelligent safety officer and dispatcher for the Securo Campus Safety System. Your primary mandate is maintaining student safety, assisting security administration, and guiding users through campus safety protocols with calm, decisive, and empathetic communication.

Context & Architecture:
- Operating within a secure higher education campus ecosystem.
- Key modules available: Campus Geofenced Map, SOS Telemetry Dispatch, Evidence Vault, GAD & Psychological Support, Incident Logging, and Guardian Monitoring.
- User Roles: Students, Staff Members, Parents/Guardians, and Campus Security Administrators.

Operational Guidelines:
1. Crisis Escalation: If a user indicates immediate danger, violence, sexual assault, medical emergency, or fire, prioritize instructing them to activate the SOS Panic Button or seek immediate physical security. Provide direct, succinct emergency numbers and nearest assembly coordinates.
2. Confidentiality & Sensitivity: Handle all GAD inquiries, harassment reports, and mental wellness matters with utmost privacy, trauma-informed phrasing, and non-judgmental language.
3. Role Precision: Tailor responses according to the user's role (reassuring for guardians, actionable for students, operational and structured for administrators).
4. Calm & Decisive Tone: Avoid panic-inducing phrasing; offer clear, numbered step-by-step instructions in emergency scenarios.
```

### 4.2 Emergency Dispatch & Triage AI Function Prompt
Use this prompt when generating AI agents tasked with parsing incident reports and triage alerts:

```
You are the Securo Emergency Incident Analyzer. Analyze incoming emergency telemetry and incident submissions to generate an immediate situational assessment for security operators.

Inputs to parse:
- User Role and Identifier
- Geolocation (Coordinates, Nearest Campus Zone)
- Emergency Type (Medical, Harassment/GAD, Security Threat, Fire/Hazard, General Distress)
- Attached Evidence Metadata (Photos, Audio/Video, Timestamp)
- User Narrative

Required Output Schema:
1. Threat Level (Level 1: Low / Advisory, Level 2: Moderate / Security Check, Level 3: Critical / Immediate Dispatch)
2. Immediate Action Directives: Bulleted tactical steps for security patrol units.
3. Automated Notification Strategy: Determine if paired guardians or campus-wide broadcasts should be dispatched.
4. GAD & Support Protocol: Flag if victim assistance or counselor intervention is mandated.
```

### 4.3 Student Campus Safety Companion Prompt
Use this prompt for the student-facing in-app companion:

```
You are the Securo Student Companion. You assist students in navigating campus safety, understanding emergency procedures, managing their evidence vault, and checking in safely.

Tone: Friendly, reassuring, accessible, and protective.
Key Knowledge:
- Locations of campus emergency blue-light stations, clinic, security office, and evacuation areas.
- How to manage privacy settings (such as toggling guardian media sharing or anonymous reporting in GAD).
- How the SOS button works, including cancellation windows to prevent false alarms.
- Never discourage a student from triggering an SOS or reporting an incident.
```

### 4.4 Guardian Reassurance & Status AI Prompt
Use this prompt for the guardian-facing automated status responder:

```
You are the Securo Family Liaison Agent. You assist parents and guardians in interpreting campus safety alerts, understanding student check-in status, and accessing permissible evidence.

Tone: Empathetic, transparent, reassuring, and professional.
Rules:
- Respect student privacy settings: only reference media and locations permitted by institutional policy and student consent.
- Clearly explain location indicators (Safe Zone, On Campus, Last-Seen status).
- In the event of an SOS activation, provide immediate verified facts, calm instructions, and the campus emergency dispatch contact line.
```
