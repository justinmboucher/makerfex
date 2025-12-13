# Owner Dashboard Specification
## Makerfex – Owner / Executive Overview

---

## 1. Purpose

The Owner Dashboard exists to help a shop owner answer one question **immediately**:

**“Am I safe on time, space, and commitments today?”**

It is not a task manager.  
It is not a project list.  
It is not a reporting console.

It is a **time‑first, capacity‑first decision surface** designed to surface urgency without requiring interpretation.

---

## 2. Core Principles

### 2.1 Time Is the Primary Constraint
For makers, revenue, inventory, and marketing are all downstream of time.

The Owner Dashboard must:
- Explicitly surface **time pressure**
- Quantify **capacity risk**
- Reveal **blocking and delay signals**
- Do so in under **5 seconds of visual scan time**

### 2.2 Revenue Is Context, Not Authority
Revenue is displayed only in relation to:
- Time invested
- Capacity consumed
- Risk introduced

Revenue must never dominate the narrative unless the owner explicitly selects a Revenue focus profile.

### 2.3 Declare First, Explain Later
The dashboard:
- **Declares urgency**
- **Quantifies impact**
- **Provides a drill‑down path**

It does not:
- Ask the user to infer risk
- Explain causality inline
- Moralize or prescribe behavior

---

## 3. Explicit Exclusions (Hard Rules)

The following must **never** appear on the Owner Dashboard:

- Individual tasks
- Task lists or task tables
- Task completion UI
- Full project lists
- Per‑project status tables

These belong to:
- Employee dashboards
- Project detail views
- Operational drill‑down pages

---

## 4. Layout Contract (Canonical Overview Frame)

All Owner Overview dashboards use the same structural layout.

### 4.1 Left Column — KPI Stack (Check the Pulse)
A fixed vertical KPI column that establishes immediate state.

### 4.2 Center — Hero Chart (Read the Momentum)
A single, dominant chart that explains *why* the KPIs look the way they do.

### 4.3 Right Rail — Insight Sidebar (Spot the Signals)
A collapsible sidebar for interruptions, alerts, and insights.

The layout is **non‑configurable in v1** to preserve narrative consistency.

---

## 5. KPI Stack Specification (Flow Step 1)

### 5.1 Canonical KPI Set (Fixed)
The following KPIs are always present for Owners:

- **Active Projects**
- **Work In Progress (WIP)**  
  *Time‑weighted or duration‑weighted, not raw count*
- **Completion Percentage**
- **Revenue (Secondary)**

### 5.2 Visual Hierarchy
- Capacity‑related KPIs receive primary emphasis
- Revenue receives secondary emphasis unless Revenue focus is selected
- Color is used to indicate **pressure**, not success

### 5.3 KPI Behavior
KPIs may display:
- Trend deltas
- Short sparklines
- Time‑relative comparisons

KPIs must never:
- Link directly to task views
- Present raw financial breakdowns

---

## 6. Hero Chart Specification (Flow Step 2)

### 6.1 Structural Rules
- Exactly **one** hero chart is visible at all times
- The hero chart is **never collapsible**
- The chart **changes by focus profile**, not by layout

### 6.2 Default Focus (Capacity & Commitment)
The default hero chart must explain:
- Throughput vs intake
- Commitments vs completions
- Delay pressure over time

Examples of acceptable narratives:
- Projects Started vs Completed
- Throughput with cancellation or delay overlays
- Capacity consumption over time

### 6.3 Revenue Focus Behavior
In Revenue focus:
- The hero chart may switch to revenue‑oriented data
- Time or throughput context must remain present
- Revenue may not appear without temporal framing

---

## 7. Focus Profiles (Owner‑Selectable)

Focus profiles adjust **emphasis**, not structure.

### 7.1 Capacity & Commitment (Default)
Primary concern:
- “Can I finish what I’ve committed to?”

Foregrounds:
- WIP pressure
- Throughput vs demand
- Deadline convergence
- Material lead‑time impact

### 7.2 Revenue & Sustainability
Primary concern:
- “Is this worth the time I’m spending?”

Foregrounds:
- Revenue relative to time
- Channel performance vs effort
- Margin proxies framed as time efficiency

### 7.3 Risk & Exposure
Primary concern:
- “Where am I likely to fail or fall behind?”

Foregrounds:
- At‑risk project aggregates
- Bottleneck patterns
- ML‑derived delay probabilities

---

## 8. Insight Sidebar Specification (Flow Step 4)

### 8.1 Purpose
The insight rail surfaces **interrupt‑driven information** without polluting the main narrative.

### 8.2 Allowed Content
- Recent high‑level activity
- Inventory or material lead‑time warnings
- At‑risk signals
- Machine learning insights

### 8.3 ML Rules
ML insights must:
- Quantify time or risk
- Reference historical patterns
- Avoid prescriptions or judgments

ML must never:
- Issue commands
- Recommend actions explicitly
- Replace owner decision‑making

### 8.4 Behavior
- Sidebar is collapsible
- Collapse state is remembered per user
- Sidebar content is opportunistic, not guaranteed

---

## 9. Bottom Region — Details & Evidence (Flow Step 5)

### 9.1 Purpose
This region supports verification and exploration **after** urgency is understood.

### 9.2 Allowed Tables (One Primary at a Time)
- At‑risk project summaries (aggregate)
- Revenue or sales summaries (Revenue focus only)
- Recently impacted projects

### 9.3 Constraints
- Tables are secondary to the hero narrative
- Scrolling is acceptable
- Tables must link to deeper pages, not expand inline

---

## 10. Dashboard Selection Rules

- Owners land on the Owner Dashboard by default
- Capacity & Commitment is the default focus profile
- Focus profile may be changed via dashboard controls or profile settings
- Focus selection persists across sessions

---

## 11. Summary Principle (Non‑Negotiable)

**The Owner Dashboard exists to protect time, space, and commitments.**  
It must surface urgency clearly, quantify impact honestly, and respect the owner’s intelligence by letting them investigate causes on their own terms.

Everything else belongs somewhere else.