# Makerfex Guided Q&A Intent Specification
## Internal Architecture & UX Philosophy

---

## 1. Purpose

Guided Q&A sessions in Makerfex exist to help users express **shop concerns in human terms**, so the system can adapt dashboards, defaults, and guidance *without forcing users to understand configuration mechanics upfront*.

These sessions are not “wizards” in the traditional sense.  
They are **intent discovery conversations**.

---

## 2. What Guided Q&A Is (and Is Not)

### 2.1 What It Is

Guided Q&A is a structured way to:
- Capture how an owner *thinks about their shop*
- Identify primary pressures (time, capacity, revenue, risk)
- Translate those pressures into **focus profiles**, **dashboard emphasis**, and **guidance defaults**

It prioritizes:
- clarity over completeness
- intent over precision
- trust over cleverness

---

### 2.2 What It Is Not

Guided Q&A is **not**:
- a replacement for settings pages
- a decision engine
- a personality quiz
- a chatbot pretending to be human
- a one-time gate that locks users in

Answers influence defaults.  
They do not remove agency.

---

## 3. Core Design Principles

### 3.1 Speak in Concerns, Not Features

Questions must be framed in terms users already think in:
- worry
- pressure
- uncertainty
- tradeoffs

Never in terms of:
- charts
- metrics
- dashboards
- configuration concepts

Makerfex does the translation.

---

### 3.2 Answers Define Emphasis, Not Capability

User responses:
- adjust **what is foregrounded**
- influence **what is surfaced first**
- weight **how insights are framed**

They must never:
- hide functionality
- disable access
- force irreversible paths

---

### 3.3 The System Listens First

Guided Q&A establishes trust by:
- listening before suggesting
- reflecting concerns without judgment
- avoiding prescriptive language

The system should feel like it’s arranging a workspace, not evaluating performance.

---

### 3.4 Revisitability Is Mandatory

Guided Q&A must be:
- repeatable
- revisitable
- safe to re-run as the shop evolves

Shops change.  
Seasons change.  
People change.

---

## 4. Where Guided Q&A Is Used

Guided Q&A sessions may appear in three contexts:

1. **Initial Setup**
2. **Intent Refresh**
3. **Domain-Specific Guidance** (pricing, capacity, risk)

All contexts use the same philosophy and language.

---

## 5. Example Question Set (Reference Only)

> Illustrative examples only — not final copy.

### 5.1 Primary Concern Discovery

**Question:**  
What’s your biggest concern in your shop right now?

**Example answers:**
- I’m worried about finishing everything on time
- I don’t know if I’m taking on too much work
- I’m not confident my pricing is sustainable
- I’m unsure which sales channels are worth the effort
- I just want to know if things are “okay”

---

### 5.2 Time vs Revenue Orientation

**Question:**  
Which feels harder lately?

**Example answers:**
- Finding enough time to get everything done
- Making enough money for the time I put in
- Both
- It depends on the season

---

### 5.3 Capacity Awareness

**Question:**  
When work piles up, what usually causes the most stress?

**Example answers:**
- Too many overlapping projects
- Materials or lead times
- Limited shop space
- Not enough help
- Deadlines clustering

---

### 5.4 Marketing & Sales Uncertainty

**Question:**  
How confident do you feel about where your sales come from?

**Example answers:**
- Very confident
- Somewhat confident
- Experimenting and unsure
- Not my main concern right now

---

### 5.5 Planning Style

**Question:**  
How do you usually plan your work?

**Example answers:**
- Carefully with adjustments
- Loosely, adapting daily
- Mostly reacting
- Trying to improve

---

## 6. Interpretation (High Level)

Answers may influence:
- default dashboard focus
- KPI emphasis
- surfaced insights
- ML framing

They must not:
- enforce hard rules
- override explicit user actions
- replace judgment

---

## 7. Relationship to Machine Learning

- Q&A captures **declared intent**
- ML observes **actual behavior**

When they diverge, the system surfaces insight neutrally and lets the user decide.

---

## 8. Summary Principle

Guided Q&A reduces friction between how owners think and how software is configured.

If done well, setup feels calm and dashboards feel relevant.
If done poorly, trust erodes early.

Makerfex must always choose the first outcome.