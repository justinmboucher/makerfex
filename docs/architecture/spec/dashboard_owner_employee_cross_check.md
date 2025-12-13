# Owner vs Employee Dashboard Cross-Check
## Consistency & Drift Prevention

---

## 1. Purpose

This document cross-checks the Owner and Employee Dashboard specifications to ensure:
- conceptual clarity,
- no overlap creep,
- consistent philosophy.

It exists to prevent gradual erosion of design intent.

---

## 2. Core Question Alignment

| Dashboard | Core Question |
|---------|----------------|
| Owner | Am I safe on time, space, and commitments? |
| Employee | What should I work on right now? |

These questions must never converge.

---

## 3. Information Boundaries

### Owner Dashboard Includes
- capacity signals
- throughput and flow
- risk and exposure
- time-relative context

### Owner Dashboard Excludes
- tasks
- task lists
- execution detail
- per-project micromanagement

---

### Employee Dashboard Includes
- assigned tasks
- deadlines
- workflow stages
- blockers

### Employee Dashboard Excludes
- revenue
- sales metrics
- strategic risk
- shop-wide capacity modeling

---

## 4. Machine Learning Boundaries

| Aspect | Owner | Employee |
|------|-------|----------|
| ML Purpose | Pattern awareness | Execution support |
| ML Tone | Informational | Assistive |
| ML Authority | Never prescriptive | Never coercive |

ML insights must never:
- assign blame,
- override judgment,
- introduce anxiety.

---

## 5. Navigation & Drill-Down

- Owners may drill into execution views
- Employees may drill into project context
- Dashboards must not force cross-role context

Depth is optional. Focus is protected.

---

## 6. Visual Emphasis

- Owner dashboards emphasize trends and pressure
- Employee dashboards emphasize immediacy and clarity

If a panel requires interpretation, it does not belong on the Employee Dashboard.
If a panel requires action, it likely does not belong on the Owner Dashboard.

---

## 7. Drift Detection Rules

If a proposed change:
- adds tasks to owner views → reject
- adds revenue to employee views → reject
- requires explanation to justify placement → reconsider

Simplicity is a feature.

---

## 8. Summary Principle

Owners protect the system.
Employees move the system.

Dashboards must respect that difference, always.