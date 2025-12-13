
# Dashboard Layout Model Specification
Makerfex Dashboard System  
Detail Level: Comprehensive  
Tone: Makerfex‑Friendly Professional

---

## 1. Purpose & Scope
This document defines the JSON-based layout system used to arrange dashboard cards. It explains CardDefinitions, DashboardTemplates, and UserDashboardLayouts—how they relate, differ, and interact with grid-based positioning.

---

## 2. Core Concepts & Entities
### 2.1 CardDefinition
A reusable, global card model defined in code. Includes type, dataSource, visual defaults, and required capabilities.

### 2.2 DashboardTemplate
A role/focus-specific composition of card instances, e.g.:
- Owner Dashboard
- Employee / My Work Dashboard

### 2.3 UserDashboardLayout
A user-personalized copy of the template, stored in the DB. Supports user-level customization.

---

## 3. Grid Model
### 3.1 Grid Coordinates
Position defined as:
```
{ "x": 0, "y": 0, "w": 2, "h": 1 }
```
- `x`, `y`: zero-based grid coordinates  
- `w`, `h`: grid width/height units

### 3.2 Grid Configuration
- Desktop grid width: 12 columns
- Row height: fixed rhythm (approx 110–130px depending on density)

### 3.3 Minimum Dimension Constraints
Cards define:
```
minGrid: { "w": 1, "h": 1 }
```
Charts typically require:
- min width: 2
- min height: 2

---

## 4. CardDefinition Summary
CardDefinition includes:
- `id`
- `type`
- `dataSource`
- `visual`
- `requiredCapabilities`
- Optional `layoutDefaults` e.g. preferred size

---

## 5. CardInstance Model
A layout entry contains:
```
{
  "instanceId": "owner-active-projects",
  "cardId": "active_projects_metric",
  "position": { "x": 0, "y": 0, "w": 2, "h": 1 },
  "overrides": {
    "timeRange": "30d",
    "title": "Active Projects"
  }
}
```

`instanceId` is unique per dashboard.  
`overrides` modify cardDefinition defaults locally.

---

## 6. DashboardTemplate Model
Contains:
- `id`
- `role` ("owner", "employee")
- `focus` ("exec", "my_work")
- `layout`: array of CardInstances
- Optional version tag

---

## 7. UserDashboardLayout Model
Includes:
- `userId`
- `baseTemplateId`
- A copied `layout` array
- User-specific overrides

Users can:
- Rearrange
- Resize
- Hide selected cards (future toggle)

---

## 8. Layout Validation Rules
- No overlapping cards on save
- All cards must remain within grid bounds
- instanceId uniqueness enforced

---

## 9. Examples
Owner dashboard layout:
```
{
  "layout": [
    { "instanceId": "active", "cardId": "projects.active_count", "position": { "x":0,"y":0,"w":2,"h":1 } },
    { "instanceId": "wip", "cardId": "projects.wip_by_stage", "position": { "x":0,"y":1,"w":4,"h":3 } }
  ]
}
```

---

## 10. Future Extensions
- Per-breakpoint layouts (desktop/tablet/mobile)
- Diff model to store template deltas

---
