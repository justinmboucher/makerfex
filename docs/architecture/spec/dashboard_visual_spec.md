
# Dashboard Visual Specification
Makerfex Dashboard & Analytics System  
Detail Level: Comprehensive  
Tone: Makerfex‑Friendly Professional

---

## 1. Purpose & Scope
This document defines the visual system for dashboard cards, charts, and supporting elements across the Makerfex dashboard experience. It establishes consistent rules for card structure, padding, typography, color semantics, and ApexCharts integration. These guidelines apply to Owner, Employee, and future dashboard lenses.

The goal is to maintain visual cohesion across all reusable dashboard components—Metric Cards, Chart Cards, Table Cards—while allowing dashboards to feel flexible and configurable.

---

## 2. Dashboard Canvas & Grid Context
### 2.1 Dashboard Background
The main dashboard canvas uses the standard Makerfex surface token:
- Light mode: `--color-bg-surface`
- Dark mode: `--color-bg-surface-dark`

### 2.2 Page Padding & Flow
The PageShell provides:
- Outer margin between topbar and dashboard: `var(--space-lg)`
- Horizontal padding: `var(--space-lg)` on desktop

### 2.3 Card Spacing Rhythm
- Horizontal spacing between cards: `var(--space-md)`
- Vertical spacing between rows: `var(--space-md)`

### 2.4 Grid Alignment
Cards snap to a structured grid. All card edges must align to grid boundaries, ensuring consistent spacing and a clean rhythm across the dashboard.

---

## 3. Card Chrome & Anatomy
### 3.1 Card Structure
Cards share a unified structure:
- **Header:** Title, subtitle, optional controls
- **Body:** Core content (chart, metric, table)
- **Footer:** Optional summary or action area

### 3.2 Surface Treatment
- Border radius: `var(--radius-lg)`
- Background: `var(--color-bg-card)`
- Card shadow: soft elevation token `--shadow-sm`

### 3.3 Internal Padding
- Header: `var(--space-md)`
- Body: `var(--space-md)`
- Footer: `var(--space-md)` (if present)

### 3.4 Titles & Eyebrows
Visual hierarchy:
- Eyebrow / section label: small caps, subdued color
- Title: medium weight
- Subtitle: optional, slightly muted

---

## 4. Card States & Status Indicators
### 4.1 Loading
- Use a skeleton shimmer where possible.
- Charts display a dimmed placeholder rectangle.

### 4.2 Error State
Show an inline error message and a retry affordance.  
Keep the card dimensions stable to avoid layout shifts.

### 4.3 Empty & Zero States
- Zero state: use a neutral icon + clear message.
- Empty data: “No data available for this period.”

---

## 5. Metric Cards (KPI Tiles)
### 5.1 Anatomy
Metric cards include:
- Primary numeric value
- Optional unit
- Label or descriptor
- Trend pill (delta % + direction)
- Optional sparkline

### 5.2 Density Variants
- **1×1:** Simple KPI value + trend text.
- **2×1:** KPI + sparkline.
- **2×2:** KPI + extended trend info.

### 5.3 Color Semantics
- Positive trend: success green token
- Negative trend: danger red token
- Neutral: muted token

### 5.4 Sparkline Constraints
- Hidden axes
- Light smoothing
- Area fill is subtle, never overpowering the metric

---

## 6. Chart Cards
### 6.1 Chart Types Supported
- Bar (category series)
- Line / Area (time series)
- Sparkline (metric subtype)

### 6.2 Layout Integration
Charts follow these spacing rules:
- Keep header separate from chart canvas
- Respect min grid size to avoid illegible labels

### 6.3 Axes & Gridline Rules
- Show Y-axis labels unless too narrow
- Rotate X-axis labels only when required
- Use theme tokens for gridlines

### 6.4 Legend Rules
- Place inside top-right when space allows
- Collapse or hide on smaller card widths

---

## 7. Table Cards
### 7.1 Table Header
- Slight surface tint for header row
- Bold column labels

### 7.2 Rows
- Zebra stripe every other row
- Hover highlights row
- Clickable rows use link color for text

### 7.3 Scroll Behavior
If content exceeds card height, table becomes scrollable within body.

---

## 8. Owner vs Employee Dashboard Emphasis
Owner dashboard:  
- Emphasis on aggregates, throughput, revenue, risk.

Employee dashboard:  
- Emphasis on tasks, station work, today’s workload.

Visual treatment remains unified; context changes emphasis.

---

## 9. Responsive & Layout Considerations
Charts collapse labels appropriately; metric tiles stack intelligently.  
Small widths hide legends and reduce sparkline detail.

---

## 10. Accessibility & Theming
- Color contrast must meet WCAG AA.
- Hit areas ≥ 40px.
- Avoid color as the sole means of conveying meaning.

---
