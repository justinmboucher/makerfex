# Dashboard Selection & Routing Specification
## Makerfex – Role and Focus Resolution

---

## 1. Purpose

This specification defines how Makerfex determines **which dashboard a user sees** and **how focus is applied**, without introducing ambiguity or hidden behavior.

The goal is predictability:
- users always understand *why* they see what they see,
- routing feels intentional, not magical,
- focus changes never feel like loss of control.

---

## 2. Core Concepts

### 2.1 Role Determines Dashboard Type

Every authenticated user resolves to a **primary role**:

- **Owner**
- **Employee**

Role determines:
- which dashboard type is shown by default,
- which focus controls are available,
- which information is emphasized.

Role does **not** determine permissions alone — it determines *context*.

---

### 2.2 Focus Determines Emphasis

Focus is a **lens**, not a destination.

Focus affects:
- KPI emphasis
- hero chart selection
- insight framing
- ordering of secondary panels

Focus does **not**:
- change routes
- hide data
- remove features

---

## 3. Default Routing Rules

### 3.1 Initial Login

On login, Makerfex resolves dashboards in this order:

1. Determine user role
2. Load last-used dashboard (if exists)
3. Otherwise load role default

---

### 3.2 Role Defaults

| Role | Default Dashboard |
|----|-------------------|
| Owner | Owner Overview |
| Employee | Employee / My Work |

---

### 3.3 Focus Defaults

| Role | Default Focus |
|----|---------------|
| Owner | Capacity & Commitment |
| Employee | Execution (implicit) |

Employees do not select focus profiles in v1.

---

## 4. Owner Focus Resolution

Owners may change focus explicitly via dashboard controls or profile settings.

Supported owner focus profiles:
- Capacity & Commitment (default)
- Revenue & Sustainability
- Risk & Exposure

Focus selection:
- persists across sessions,
- may be updated by Guided Q&A,
- is never overridden silently.

---

## 5. Guided Q&A Interaction

Guided Q&A:
- suggests an initial focus,
- adjusts emphasis weights,
- never forces a focus change without user confirmation.

If Q&A is re-run:
- previous focus is replaced only if the user accepts changes,
- historical data remains untouched.

---

## 6. Manual Overrides

Users may:
- navigate freely to other dashboards,
- switch focus at any time,
- ignore focus recommendations entirely.

Manual actions always take precedence over inferred intent.

---

## 7. Summary Principle

Dashboard selection must feel **boring in the best way**:
- obvious,
- reversible,
- and predictable.

If users ever wonder *why* they landed somewhere, the system has failed.