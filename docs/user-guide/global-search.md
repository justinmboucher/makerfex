# Global Search

Global search in **MAKERFEX** is the fastest way to jump to customers, projects, inventory items, and workflows without drilling through menus. It lives in the top bar and updates live as you type, returning a small set of high-value results.

---

## Where to find it

- Location: Top bar, near the center/right.
- Control: A compact search field with a search icon and placeholder text like  
  `Search customers, projects, inventory...`

Global search is always available anywhere inside the authenticated app (Dashboard, Customers, Projects, etc.).

---

## What global search looks at

Global search currently queries:

- **Customers**
- **Projects**
- **Inventory items**
- **Workflows**

It does **not** search:

- Dashboards or analytics widgets
- Settings, configuration, or system logs

The intent is: “entities you might want to *open quickly*,” not “every string in the system.”

---

## Basic usage

1. Start typing in the global search box.
2. After a short pause, a dropdown opens under the search field.
3. Up to **15** best-matching results are shown, with:
   - A **colored pill** indicating the type (e.g., `Customer`, `Project`, `Inventory`, `Workflow`)
   - A **label** (primary name/title)
   - An optional **subtitle** (supporting info, like email, workflow name, etc.)

### Interacting with results

- **Mouse:**
  - Click a result row to navigate to that item’s page.
- **Keyboard:**
  - `Arrow Down` / `Arrow Up` – move through results
  - `Enter` – open the selected result
  - `Esc` – close the dropdown

If there are no matches after a valid query, you’ll see a message:

> `No matches found`

---

## Keyboard shortcuts

Global search is designed to be fast for power users.

### Global shortcuts (from anywhere in the app)

- `/` – focus the global search field
- `Ctrl + K` (Windows/Linux) – focus the search field
- `Cmd + K` (macOS) – focus the search field

These work **even when focus is not in the search box**, as long as you’re not currently typing into another input, textarea, or editable field.

### Inside the dropdown

- `Arrow Down` – select the next result
- `Arrow Up` – select the previous result
- `Enter` – open the selected result
- `Esc` – close the dropdown and clear selection

---

## Search syntax

Global search supports a small “search language” on top of free-text typing. You can use:

- **Type filters** – limit results to a specific entity type
- **Short aliases** – quicker versions of type filters
- **Price filters** – (early behavior; see notes below)

You can mix free text + filters in a single query.

### Type filters (long form)

You can explicitly scope searches to a single type:

- `customer: Jane`
- `project: CNC shelf`
- `inventory: plywood`
- `workflow: sanding`

Behavior:

- The **prefix** (`customer:`, `project:`, etc.) tells the search to only show that type.
- The text after the colon is used as the query term (with fuzzy matching applied).

Examples:

- `customer: Jane`  
  → Only customer records that match “Jane”.

- `project: cutting board`  
  → Only projects whose name/label approximately matches “cutting board”.

- `workflow: sanding`  
  → Only workflows whose label/description matches “sanding”.

### Type filter aliases (short form)

For speed, there are short aliases that behave the same as the long form:

| Type      | Long form      | Short alias |
|-----------|----------------|-------------|
| Customer  | `customer:`    | `c:`        |
| Project   | `project:`     | `p:`        |
| Inventory | `inventory:`   | `i:`        |
| Workflow  | `workflow:`    | `w:`        |

Examples:

- `c: Jane`  
  → Same as `customer: Jane`

- `p: shelf`  
  → Same as `project: shelf`

- `i: maple`  
  → Same as `inventory: maple`

- `w: default`  
  → Same as `workflow: default`

You can also use just the prefix to scope type and then continue typing:

- `c:` then type your customer’s name  
- `p:` then type your project keyword

---

## Fuzzy matching

Global search uses a simple **subsequence fuzzy match** for the free-text portion of the query:

- The characters only have to appear **in order**, not necessarily contiguously.

Examples:

- `mpl` will match:
  - `Maple Plywood`
  - `Sample Board`
- `ctbd` might match something like:
  - `Cutting Board`

This is applied to:

- The **label** (main name/title), always
- The **subtitle** (secondary info) when a type filter is not active

---

## Price filters (early behavior)

Global search reserves the `price` prefix for price-related filters:

Supported operators:

- `price>50`
- `price<200`
- `price>=100`
- `price<=250`
- `price=75`

### Current behavior

At this stage, price filters behave in a limited but still useful way:

- They **signal that you’re doing a price-oriented search**.
- The frontend uses them to **restrict result types** to entities where prices make sense, such as:
  - Projects
  - Sales / orders / invoices (as those are added to the system)

So queries like:

- `price>50`
- `p: cutting price>50` (future-friendly combo)

…will only show “price-relevant” entity types rather than, say, workflows or inventory items.

> **Note:**  
> As of this version, the numeric comparison (`> 50`, `< 200`, etc.) is not yet fully enforced by the backend. The filters are wired into the search UI and type-scoping, and the backend will be taught to apply real numeric constraints in a later iteration.

---

## Advanced search

At the top of the dropdown, there is an **“Advanced search”** link.

- Clicking **Advanced search** navigates to the dedicated search page (planned as `/search`), where:
  - You’ll eventually see full filter controls (type, price ranges, status, date ranges, etc.).
  - You can run more complex queries than the compact global search dropdown is designed for.

Depending on your environment, the advanced search page may still be under construction. The link is intended as a bridge from “quick jump” to “full query builder”.

---

## Visual cues in the dropdown

Each result row in the dropdown includes:

- A **type pill** (left side), e.g. `Customer`, `Project`, `Inventory`, `Workflow`
  - Color-coded for quick recognition
- A **primary label**
  - Example: `Bob Doe`, `Maple Plywood`, `CNC Cutting Board`
- An optional **subtitle**
  - Example: customer email, workflow name, or other context

The first row is not automatically selected; you choose a row with arrow keys or mouse.

---

## Summary: cheatsheet

Quick reference for daily use:

- **Open search:** `/` or `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS)
- **Navigate:** `Arrow Up` / `Arrow Down`, `Enter`, `Esc`
- **Type scope:**
  - `customer: Jane` or `c: Jane`
  - `project: shelf` or `p: shelf`
  - `inventory: maple` or `i: maple`
  - `workflow: default` or `w: default`
- **Fuzzy text:** `mpl` matches `Maple Plywood`
- **Price (early behavior):**
  - `price>50`, `price<200`, etc.  
    → limits results to price-related entities; full numeric filtering to come later.
- **Full power:** use **Advanced search** for complex filters once the dedicated search page is available.
