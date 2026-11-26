# Securo Database Architecture & Normalization Documentation

This documentation package provides a complete, evidence-based audit of the **Securo Campus Safety & Emergency Response System** database (Firebase Cloud Firestore, project `securo-a3c9c`), alongside a rigorously normalized **Proposed 3NF Relational Model** and four validated PlantUML diagrams.

> **Read-Only Audit Notice:** No application code, Firestore collections, security rules, or existing data structures were modified in producing this documentation.

---

## Directory Structure

```text
database_documentation/
├── 01_database_inventory.md        # Complete catalog of all 15 Firestore collections & attributes
├── 02_relationship_analysis.md     # Verified relationships, cardinalities, evidence & uncertainties
├── 03_normalization_analysis.md    # 1NF, 2NF, and 3NF compliance audit & decomposition rationale
├── 04_existing_database/
│   ├── existing_uml.puml           # PlantUML source — Existing UML Class Diagram
│   ├── existing_uml.svg / .png     # Rendered diagram previews
│   ├── existing_erd.puml           # PlantUML source — Existing Crow's Foot ERD
│   └── existing_erd.svg / .png     # Rendered diagram previews
├── 05_proposed_3nf/
│   ├── proposed_3nf_uml.puml       # PlantUML source — Proposed 3NF UML Class Diagram (23 tables)
│   ├── proposed_3nf_uml.svg / .png # Rendered diagram previews
│   ├── proposed_3nf_erd.puml       # PlantUML source — Proposed 3NF Crow's Foot ERD (23 tables)
│   └── proposed_3nf_erd.svg / .png # Rendered diagram previews
├── 06_validation_report.md         # Completeness, key, normalization & PlantUML syntax verification
└── README.md                       # This overview & rendering guide
```

---

## Overview of the Four Diagrams

1. **Existing UML Class Diagram** (`04_existing_database/existing_uml.puml`)  
   Documents the actual Cloud Firestore implementation: all 15 collections, exact field names, data types, PK/FK/UK annotations, duplicate/overloaded fields, and verified associations grouped into 5 logical modules.
2. **Existing Entity Relationship Diagram** (`04_existing_database/existing_erd.puml`)  
   Independent Crow's Foot ERD of the actual Firestore implementation distinguishing verified UID references (`||--o{`) from logical email/array/mirror references (`||..o{`, `}o..o{`).
3. **Proposed 3NF UML Class Diagram** (`05_proposed_3nf/proposed_3nf_uml.puml`)  
   Normalized relational UML model (23 tables) resolving every identified 1NF, 2NF, and 3NF violation: Class-Table subtype specialization (`student_profiles`, `staff_profiles`, `guardian_profiles`), `chat_threads`, `gad_post_likes`, `sos_log_recipients`, `emergency_post_attachments`, `location_reminders`, and unified `campus_map_configs` + `campus_geofence_vertices` + `campus_places`.
4. **Proposed 3NF Entity Relationship Diagram** (`05_proposed_3nf/proposed_3nf_erd.puml`)  
   Independent Crow's Foot ERD matching `proposed_3nf_uml.puml` 1:1 in entities, attributes, primary/foreign/unique keys, cardinalities, and participation optionality.

---

## How to Render the PlantUML Files

All four `.puml` files are self-contained, syntactically validated PlantUML sources and already include pre-rendered `.svg` and `.png` previews in their respective folders. To re-render locally or online:

### Option 1: VS Code Extension
1. Install the **PlantUML** extension (`jebbs.plantuml`) in VS Code.
2. Open any `.puml` file and press `Alt + D` to preview or export to SVG/PNG.

### Option 2: PlantUML CLI (Java + Graphviz)
```bash
java -jar plantuml.jar -tsvg database_documentation/04_existing_database/*.puml
java -jar plantuml.jar -tsvg database_documentation/05_proposed_3nf/*.puml
```

### Option 3: Online PlantUML / Kroki Renderer
- Paste any `.puml` file directly into [https://www.plantuml.com/plantuml](https://www.plantuml.com/plantuml) or submit via HTTP POST to `https://kroki.io/plantuml/svg`.
