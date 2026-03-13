# Research: Reporting and Analytics Module

**Feature**: 008-reporting-analytics
**Date**: 2026-03-13

---

## 1. Chart Library Selection: ngx-charts vs Chart.js

**Context**: The reports feature requires bar charts (gap analysis, team capability), a heatmap/heat-grid (org heatmap), and line charts (skill trends). The constitution allows either ngx-charts or Chart.js.

**Decision**: **ngx-charts**

**Rationale**:
- Native Angular integration — ngx-charts components are Angular standalone-compatible and work seamlessly with Angular change detection and animations.
- Built-in responsive resizing via `[view]` binding and container-based sizing — no manual resize listeners needed.
- Declarative template syntax (`<ngx-charts-bar-vertical>`, `<ngx-charts-line-chart>`, `<ngx-charts-heat-map>`) aligns with Angular's component model.
- Built-in heatmap chart type (`ngx-charts-heat-map`) directly satisfies FR-012/FR-013 without custom implementation.
- SVG-based rendering produces crisp output at any resolution and integrates well with html2canvas for PNG export.
- Active Swimlane maintenance; compatible with Angular 17.

**Alternatives Considered**:
- **Chart.js**: Canvas-based, lighter weight, larger ecosystem. However, requires `ng2-charts` wrapper for Angular integration, canvas rendering complicates PNG export (need to extract canvas data URL), and no built-in heatmap chart type (would need a plugin or custom implementation). The heatmap requirement strongly favours ngx-charts.

---

## 2. Export Strategy: PDF, Excel, CSV, PNG

**Context**: Reports require multiple export formats: PDF (all 4 reports), Excel (gap analysis, team capability, employee skill list), CSV (employee skill list), PNG (heatmap). All exports must be client-side only.

**Decision**: Use **jsPDF + jsPDF-AutoTable** for PDF, **SheetJS (xlsx)** for Excel/CSV, and **html2canvas** for PNG.

**Rationale**:
- **jsPDF + jsPDF-AutoTable**: Already established in Phase 7 for PDF export. AutoTable handles tabular report data with headers, pagination, and styling. For chart-based PDFs (trends), capture chart as image via html2canvas then embed in PDF via `doc.addImage()`.
- **SheetJS (xlsx)**: BSD-licensed open-source library for Excel/CSV generation. `XLSX.utils.json_to_sheet()` converts report data arrays to worksheets. `XLSX.writeFile()` exports as .xlsx or .csv. Single library handles both formats.
- **html2canvas**: Captures DOM elements as canvas images. Used for PNG export of the heatmap and for embedding charts into PDF exports. Works with SVG-based ngx-charts by rasterizing the rendered chart container.

**Export Matrix**:

| Report | PDF | Excel | CSV | PNG |
|---|---|---|---|---|
| Skill Gap Analysis | ✅ jsPDF-AutoTable | ✅ SheetJS | ❌ | ❌ |
| Team Capability | ✅ jsPDF-AutoTable | ✅ SheetJS | ❌ | ❌ |
| Org Skill Heatmap | ✅ jsPDF + html2canvas | ❌ | ❌ | ✅ html2canvas |
| Skill Trend Analysis | ✅ jsPDF + html2canvas | ❌ | ❌ | ❌ |
| Employee Skill List | ❌ | ✅ SheetJS | ✅ SheetJS | ❌ |

**Export Header Standard** (FR-020): Every export includes:
- Report title (e.g., "Skill Gap Analysis Report")
- Generation date (YYYY-MM-DD format)
- Generating user's full name (from NgRx session state)

**Alternatives Considered**:
- **FileSaver.js** for download triggering: Not needed — jsPDF's `doc.save()` and SheetJS's `XLSX.writeFile()` handle download natively. html2canvas output can be converted to a download link via `canvas.toBlob()`.
- **Server-side export**: Out of scope — no backend.

---

## 3. Skill Gap Calculation Algorithm

**Context**: FR-004/FR-005 require computing gap between project-required skill levels and team average levels, expressed as a percentage.

**Decision**: Implement a pure function that computes gap for each required skill.

**Algorithm**:
```
For each project in visible scope:
  For each requiredSkill in project.requiredSkills:
    requiredLevel = proficiencyToPercent(requiredSkill.minimumLevel)
    
    teamEmployees = employees in visible scope (Manager's team or all for Admin)
    skillRatings = teamEmployees
      .map(emp => emp.skills.find(s => s.skillId === requiredSkill.skillId))
      .map(skill => skill ? proficiencyToPercent(skill.level) : 0)
    
    teamAverage = sum(skillRatings) / teamEmployees.length
    gap = max(0, requiredLevel - teamAverage)
    
    result.push({ skillName, requiredLevel, teamAverage, gap })
```

**Proficiency-to-Percentage Mapping** (from spec assumptions):

| Level | Numeric | Percentage |
|---|---|---|
| Beginner | 1 | 25% |
| Intermediate | 2 | 50% |
| Advanced | 3 | 75% |
| Expert | 4 | 100% |

**Key Rules**:
- Employees who do NOT have the skill contribute 0% to the team average (per spec assumption).
- Gap is clamped at 0 minimum (no negative gaps = no gap).
- When gap > 0%, display amber warning indicator; when gap ≥ 50%, display red critical indicator.

---

## 4. Team Capability Aggregation Pattern

**Context**: FR-009/FR-010 require computing average proficiency per skill per department, filterable by skill category.

**Decision**: Aggregate in a two-pass approach.

**Algorithm**:
```
Pass 1 — Build skill-department matrix:
  For each employee in scope:
    For each skill in employee.skills:
      key = `${skill.skillId}-${employee.department}`
      matrix[key].ratings.push(proficiencyToPercent(skill.level))
      matrix[key].skillName = skillDefinitions[skill.skillId].name
      matrix[key].category = skillDefinitions[skill.skillId].categoryId
      matrix[key].department = employee.department

Pass 2 — Compute averages:
  For each key in matrix:
    matrix[key].averageProficiency = mean(matrix[key].ratings)
    matrix[key].employeeCount = matrix[key].ratings.length
```

**Filters**:
- Department filter: Manager locked to own department; Admin can select any.
- Skill Category filter: both roles can filter by category via dropdown.
- View toggle: "By Department" (columns = departments) vs "By Skill Category" (columns = categories).

---

## 5. Heatmap Data Computation

**Context**: FR-012/FR-013 require a colour-coded grid: rows = skills, columns = proficiency levels, cells = employee count.

**Decision**: Pre-compute a 2D count matrix from employee-skills.json.

**Algorithm**:
```
heatmapData: Map<skillId, { beginner: number, intermediate: number, advanced: number, expert: number }>

For each employee in all employees (Admin-only — full org):
  For each skill in employee.skills:
    level = skill.level  // Beginner | Intermediate | Advanced | Expert
    heatmapData[skill.skillId][level]++
```

**ngx-charts Heat Map Integration**:
- ngx-charts `heat-map` component accepts `results` array: `{ name: skillName, series: [{ name: levelName, value: count }] }`.
- Colour scheme: use a sequential colour scale (light → dark) mapped to count intensity (e.g., 0 = white, max = deep blue/purple).
- The chart renders as an SVG grid — each cell is a `<rect>` with fill colour based on value.

**Responsive Rules** (FR-022/FR-023/FR-024):
- Desktop: full grid with all labels
- Tablet: 100% width, legend below
- Mobile: 250px max height, horizontal scroll, simplified axis labels

---

## 6. Quarter Grouping for Trend Analysis

**Context**: FR-015 requires line chart with quarter-over-quarter proficiency trends derived from skill-test-attempts.json.

**Decision**: Group attempts by calendar quarter, compute average score per skill per quarter.

**Algorithm**:
```
For each attempt in skill-test-attempts.json (filtered by scope):
  quarter = getQuarter(attempt.date)  // "2025-Q1", "2025-Q2", etc.
  key = `${attempt.skillId}-${quarter}`
  groups[key].scores.push(attempt.score)  // score is 0–100 percentage

For each key in groups:
  groups[key].average = mean(groups[key].scores)

Quarter derivation:
  month = new Date(dateString).getMonth()  // 0-based
  quarter = Math.floor(month / 3) + 1      // 1, 2, 3, 4
  label = `${year}-Q${quarter}`
```

**ngx-charts Line Chart Integration**:
- Data format: `{ name: skillName, series: [{ name: quarterLabel, value: averageScore }] }`
- X-axis: quarter labels chronologically ordered
- Y-axis: proficiency percentage (0–100%)
- Multi-line: one line per skill (filterable)

**Edge Case**: When only one quarter of data exists → single data point per skill + notice: "More data points needed for trend analysis." (FR-017)

---

## 7. Data Scoping for Role-Based Report Filtering

**Context**: FR-003 requires Managers see only their team's data; Admins see all.

**Decision**: Implement scoping at the service/computation layer, not just UI filtering.

**Implementation**:
```
getVisibleEmployees(currentUser: SessionUser, allUsers: User[]): User[] {
  if (currentUser.role === 'Admin') return allUsers;
  if (currentUser.role === 'Manager') {
    return allUsers.filter(u => u.department === currentUser.department);
  }
  return []; // Employee should never reach reports
}
```

**Scoping Rules**:
- Gap Analysis: Manager sees gaps only for projects where their team is involved; Admin sees all projects.
- Team Capability: Manager locked to own department; Admin can switch departments.
- Heatmap: Admin only — always org-wide (no scoping filter needed).
- Trends: Manager sees team trends only; Admin sees org-wide with optional department filter.

---

## 8. Responsive Chart Wrapper Component

**Context**: FR-022/FR-023/FR-024 define specific chart behaviour per breakpoint. Rather than duplicating responsive logic in each report component, a shared wrapper provides consistency.

**Decision**: Create a `ChartWrapperComponent` in `shared/components/` that handles breakpoint detection and chart container sizing.

**Implementation**:
- Injects `BreakpointObserver` to detect current breakpoint tier (desktop/tablet/mobile).
- Exposes CSS classes: `.chart-desktop`, `.chart-tablet`, `.chart-mobile` on the container.
- Desktop: chart rendered at natural size; legend position = 'right'.
- Tablet: chart at 100% container width; legend position = 'below'.
- Mobile: chart container max-height = 250px; overflow-x = auto (horizontal scroll); legend hidden by default with a "Show Legend" toggle button.
- The wrapper is a presentational component — it does NOT fetch data. It receives chart data and chart type via `@Input()` and renders the appropriate ngx-charts component inside a responsive container.

**SCSS** (uses central `_breakpoints.scss` variables):
```scss
@use 'breakpoints' as bp;

:host {
  display: block;
  width: 100%;
}

.chart-mobile {
  max-height: 250px;
  overflow-x: auto;
  overflow-y: hidden;
}
```

---

## Summary of Decisions

| Topic | Decision | Key Library |
|---|---|---|
| Chart Library | ngx-charts | `@swimlane/ngx-charts` |
| PDF Export | jsPDF + jsPDF-AutoTable | `jspdf`, `jspdf-autotable` |
| Excel/CSV Export | SheetJS | `xlsx` |
| PNG Export | html2canvas | `html2canvas` |
| Gap Calculation | Pure function, proficiency-to-% mapping | — |
| Team Aggregation | Two-pass matrix approach | — |
| Heatmap Data | 2D count matrix → ngx-charts heat-map | — |
| Trend Grouping | Calendar quarter from attempt dates | — |
| Data Scoping | Service-layer filtering by role/department | — |
| Responsive Charts | Shared ChartWrapperComponent | Angular CDK BreakpointObserver |
