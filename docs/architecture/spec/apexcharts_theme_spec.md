# Makerfex – ApexCharts Theme & Chart Styling Specification (v1)

This document defines the unified chart styling, theme rules, and option defaults used
across all ChartCards in Makerfex.

---
## 1. Goals
- Ensure visual consistency across all charts
- Respect Makerfex design tokens (colors, typography, radii)
- Provide a shared options generator for line, bar, area, radial, and sparkline charts
- Keep charts clean, readable, and modern

---
## 2. Base Theme Mapping to Makerfex Tokens
Colors should map to CSS variables:
- Primary series: var(--mf-color-accent)
- Secondary: var(--mf-color-highlight)
- Success: var(--mf-color-success)
- Warning: var(--mf-color-warning)
- Danger: var(--mf-color-danger)
- Grid: var(--mf-color-border-subtle)
- Background: var(--mf-color-bg-surface)

---
## 3. Global Apex Options
```json
{
  "chart": { "toolbar": { "show": false }, "animations": { "enabled": true } },
  "stroke": { "curve": "smooth", "width": 2 },
  "grid": { "borderColor": "var(--mf-color-border-subtle)", "strokeDashArray": 3 },
  "xaxis": { "labels": { "style": { "colors": "var(--mf-color-text-primary)" } } },
  "yaxis": { "labels": { "style": { "colors": "var(--mf-color-text-primary)" } } },
  "tooltip": { "theme": "dark", "style": { "fontSize": "12px" } },
  "legend": { "show": true, "position": "top", "horizontalAlign": "left" }
}
```
---
## 4. Chart Type Defaults

### 4.1 Line & Area Charts
- Smooth curve
- 2px stroke
- Optional fill for area charts with 20–30% transparency

### 4.2 Bar Charts
- Rounded corners (4px radius)
- BarSpacing tuned for readability
- Horizontal or vertical allowed

### 4.3 Radial Charts
- Thick stroke
- Rounded line caps
- Large center value label

---
## 5. Sparkline Theme
Used inside MetricCards:

```json
{
  "chart": { "sparkline": { "enabled": true } },
  "stroke": { "curve": "smooth", "width": 2 },
  "tooltip": { "enabled": false }
}
```
---
## 6. Theme Utilities
Utility functions will generate options based on data source:
- getLineOptions(data, overrides)
- getBarOptions(data, overrides)
- getAreaOptions(data, overrides)
- getRadialOptions(data, overrides)
- mergeWithBaseTheme(userOverrides)

---
## 7. v1 Scope
- Implement unified chart theme
- Support line, bar, area, radial charts
- Implement sparkline mode
- Defer advanced chart types (scatter, mixed-series) to future versions