# Makerfex – Dashboard Permissions & Capabilities Specification (v1)

Dashboards must enforce privacy, protect financial data, and ensure users only see
information appropriate to their role. Capabilities control visibility of both cards and
the metrics endpoints.

---

## 1. Capability List

### `view_financials`
Allows:
- Viewing revenue, profit, margins, pipeline value
- Access to financial metrics endpoints

Used by:
- Owners
- Admins

---

### `view_shop_aggregates`
Allows:
- Viewing shop-level project counts, WIP, throughput, at-risk projects
- Access to non-financial operational metrics

Used by:
- Owners
- Managers
- Possibly advanced employees (optional)

---

### `view_my_work`
Allows:
- Viewing assignments scoped to the authenticated user
- Access to personal task metrics

Used by:
- Makers
- Any employee role

---

### `configure_dashboards`
Allows:
- Editing personal dashboards
- Adding/removing cards
- Switching chart types
- Saving layout changes

Used by:  
- Anyone allowed to customize their own dashboard

---

### `configure_role_dashboards`
Allows:
- Editing *role-level* dashboard templates
- Setting defaults for future users in the role

Used by:
- Owners
- Admins

---

## 2. Backend Enforcement

- Metrics endpoints must check capability requirements *at the API layer*.
- A dashboard configuration containing a card the user cannot access:
  - Either filters that card server-side
  - Or the frontend hides it and shows a placeholder (implementation choice)

---

## 3. Frontend Behavior

When rendering a card instance:
1. Look up its CardDefinition.
2. Check `requiredCapabilities`.
3. If the user lacks any capability:
   - Do not render the card.
   - Optionally display a “restricted data” placeholder.

---

## 4. Rationale

This ensures:
- Makers never see owner financial data.
- Owners can access everything.
- Role dashboards remain safe even if reused or cloned.
