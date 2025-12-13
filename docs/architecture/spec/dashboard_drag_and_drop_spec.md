
# Dashboard Drag & Drop Specification
Makerfex Dashboard System  
Detail Level: Comprehensive  
Tone: Makerfex‑Friendly Professional

---

## 1. Purpose, Scope, and Non-Goals
This spec defines V1 drag-and-drop interactions for arranging dashboard cards.  
It covers movement, resizing, collision handling, persistence, and template/user differences.

Non-goals:
- No multi-select dragging
- No versioned layout history
- No intelligent auto-optimization of layout

---

## 2. Interaction Modes
### 2.1 Default Mode
Dashboard is static; no dragging allowed.

### 2.2 Layout Edit Mode
User toggles “Edit Layout”.  
Cards become draggable and resizable.

---

## 3. Drag & Drop Behaviors
### 3.1 Movement
- User drags from card header or drag handle.
- Card snaps to nearest grid unit.
- Live placeholder shows proposed destination.

### 3.2 Collision Rules
Three-phase:
1. **Preview:** Proposed position validated for overlaps.
2. **Resolution:** If overlap detected, either:
   - Reject drop (shake or red outline)
   - Allow drop but auto-pack below (simple push model)
3. **Commit:** Position recorded.

---

## 4. Resizing Behaviors
Resize handles on:
- Right edge
- Bottom edge
- Bottom-right corner

Resizing snaps to grid.  
Respects card `minGrid` constraints.

---

## 5. Visual Feedback & Affordances
- Ghost preview during drag
- Highlighted drop zone
- While resizing, show dashed bounding box

Unsaved changes indicator appears if layout differs from persisted version.

---

## 6. Persistence & Layout Updates
### 6.1 What Is Saved
- Updated `position` fields
- Updated ordering if necessary

### 6.2 When Saving Occurs
Two options in V1:
- Auto-save on each drop  
or
- Save/Cancel buttons

(Implementation choice can vary; spec supports both.)

Backend receives new layout array.

---

## 7. Templates vs User Dashboards
Users cannot modify templates.  
When a user first customizes a template, a UserDashboardLayout is created.

Template updates do **not** overwrite user customizations in V1.

---

## 8. Permissions & Safety
Owners may edit templates.  
Employees may only edit their own layout.

Unauthorized actions produce a non-blocking message.

---

## 9. Edge Cases & Constraints
- Small viewports: resize handles may hide
- Extremely narrow layouts collapse cards to min sizes
- Lost-card recovery: cards auto-packed to nearest valid area

---

## 10. Future Enhancements
- Undo/redo history
- Multi-select operations
- Layout presets

---
