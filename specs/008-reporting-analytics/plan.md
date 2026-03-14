# Implementation Plan: Reporting & Analytics

**Branch**: `008-reporting-analytics` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-reporting-analytics/spec.md`

## Summary

Implement the Reporting and Analytics module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers four report types computed entirely client-side from mock JSON data: (1) Skill Gap Analysis comparing project-required skills against team proficiency averages with gap percentages; (2) Team Capability Report showing average proficiency per skill per department with department/category filters; (3) Organisation Skill Heatmap (Admin only) displaying a colour-coded grid of employee counts per skill per proficiency level using ngx-charts or Chart.js; (4) Skill Trend Analysis showing proficiency trends over time via line charts with quarter-over-quarter data derived from skill-test-attempts.json. All reports support export (PDF, Excel, CSV, PNG as applicable) via client-side generation with jsPDF/jsPDF-AutoTable and SheetJS (xlsx). Charts follow responsive rules: full-size on desktop, 100% width on tablet, 250px max height with horizontal scroll on mobile. Manager sees own team only; Admin sees all departments. Heatmap route is Admin-exclusive with DOM-level element removal for Managers.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, ngx-charts or Chart.js (chart rendering), jsPDF + jsPDF-AutoTable (PDF export), SheetJS/xlsx (Excel/CSV export), html2canvas (PNG export for heatmap)  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, users.json, projects.json, skill-definitions.json, skill-categories.json, certifications.json, skill-test-attempts.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: All 4 report screens render within 3 seconds for 100 employees / 50 skills; export generation < 5 seconds; 60 fps chart animations  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory only (resets on refresh); depends on Phase 1 (auth/guards), Phase 2 (skill library), Phase 3 (skill profiles), Phase 4 (assessments/test attempts), Phase 5 (certifications), Phase 7 (projects); all computations client-side; no pre-aggregation layer  
**Scale/Scope**: 5 screens (/reports, /reports/skill-gap, /reports/team, /reports/heatmap, /reports/trends), 24 functional requirements, 9 success criteria, 7 export format combinations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Constitution Check

### Principle Compliance

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All report data computed from in-memory mock data via HttpClient + MockApiInterceptor. No direct JSON imports. No new JSON files needed — reports aggregate existing data from employee-skills.json, projects.json, project-assignments.json, skill-definitions.json, skill-test-attempts.json, users.json. |
| II | RBAC at UI Layer | ✅ PASS | All `/reports/**` routes protected by RoleGuard(['Manager','Admin']). `/reports/heatmap` additionally restricted to Admin via RoleGuard(['Admin']). Heatmap tab removed from DOM for Managers via `@if`. Data scoping enforced at computation layer (Manager sees own team only). |
| III | State Management | ✅ PASS | Report data fetched via NgRx effects; results stored in a `reports` feature slice. Components read from selectors. No BehaviorSubject for cross-component state. Local filter/sort state stays in component. |
| IV | Responsive Design | ✅ PASS | Charts follow Section 18.3: full-size desktop, 100% width tablet, 250px max-height + horizontal scroll mobile. Breakpoints from `_breakpoints.scss` and `breakpoints.ts`. No inline responsive styles. |
| V | Test Coverage | ✅ PASS | Unit tests for: gap % calculation, team capability aggregation, heatmap cell counts, trend quarter grouping, export header fields, role-based data scoping, route guards, empty-state conditions. |
| VI | Error Handling | ✅ PASS | Empty states for no-data scenarios (no projects, no team, no skills). Loading spinners during data fetch. HTTP 403 → permission toast. HTTP 404 → inline "Not Found". |
| VII | Accessibility | ✅ PASS | Chart aria-labels, data tables with proper headers, colour + text for gap indicators, 44×44 px touch targets, prefers-reduced-motion respected for chart animations. |
| VIII | Component Architecture | ✅ PASS | All components standalone. Reports feature lazy-loaded via `loadChildren`. Shared chart wrapper components accept inputs/emit outputs. |
| IX | Consistent Design System | ✅ PASS | Gap indicators use `--color-pending` (amber) and `--color-rejected` (red). Status pills use canonical tokens. Typography follows scale. Charts use design token colours. |
| X | Code Quality | ✅ PASS | TypeScript strict. No `any`. SCSS only. All service methods have explicit return types. |

### Enforcement Rule Compliance

| # | Rule | Status | Notes |
|---|---|---|---|
| 1 | No direct JSON imports | ✅ PASS | All data via HttpClient → MockApiInterceptor |
| 2 | No CSS-only auth hiding | ✅ PASS | Heatmap tab uses `@if(role === 'Admin')` — removed from DOM for non-Admin |
| 3 | No inline responsive styles | ✅ PASS | All responsive via SCSS + BreakpointObserver |
| 4 | No untyped `any` | ✅ PASS | All report interfaces strictly typed |
| 5 | No direct HttpClient in components | ✅ PASS | NgRx effects handle all HTTP calls |
| 6 | No BehaviorSubject for global state | ✅ PASS | NgRx `reports` slice for all report state |
| 7 | No hardcoded breakpoints | ✅ PASS | Central `_breakpoints.scss` variables used |
| 8 | Route guards + template checks | ✅ PASS | RoleGuard on routes AND `@if` in templates |
| 9 | No plain-text passwords in prod | ✅ N/A | No auth changes in this feature |
| 10 | No feature NgModules | ✅ PASS | Standalone components + loadChildren |

## Project Structure

### Documentation (this feature)

```text
specs/008-reporting-analytics/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── interceptors/
│   │   └── mock-api.interceptor.ts          # Existing — no changes needed
│   └── services/
│       └── export.service.ts                # Shared PDF/Excel/CSV/PNG export utility
├── shared/
│   ├── models/
│   │   └── report.models.ts                 # SkillGapRecord, TeamCapabilitySnapshot, HeatmapCell, SkillTrendPoint
│   └── components/
│       └── chart-wrapper/                   # Responsive chart container (breakpoint-aware)
│           ├── chart-wrapper.component.ts
│           ├── chart-wrapper.component.html
│           └── chart-wrapper.component.scss
├── features/
│   └── reports/
│       ├── reports.routes.ts                # Lazy-loaded feature routes
│       ├── store/
│       │   ├── reports.actions.ts           # Load/export actions per report type
│       │   ├── reports.reducer.ts           # ReportsState (gap, capability, heatmap, trends)
│       │   ├── reports.effects.ts           # HTTP calls for data aggregation
│       │   └── reports.selectors.ts         # Memoized selectors per report type
│       ├── services/
│       │   ├── gap-analysis.service.ts      # Skill gap computation logic
│       │   ├── team-capability.service.ts   # Team avg proficiency aggregation
│       │   ├── heatmap.service.ts           # Org-wide skill × level counts
│       │   └── trend-analysis.service.ts    # Quarter grouping & trend computation
│       ├── reports-landing/
│       │   ├── reports-landing.component.ts
│       │   ├── reports-landing.component.html
│       │   └── reports-landing.component.scss
│       ├── gap-analysis/
│       │   ├── gap-analysis.component.ts
│       │   ├── gap-analysis.component.html
│       │   └── gap-analysis.component.scss
│       ├── team-capability/
│       │   ├── team-capability.component.ts
│       │   ├── team-capability.component.html
│       │   └── team-capability.component.scss
│       ├── org-heatmap/
│       │   ├── org-heatmap.component.ts
│       │   ├── org-heatmap.component.html
│       │   └── org-heatmap.component.scss
│       └── skill-trends/
│           ├── skill-trends.component.ts
│           ├── skill-trends.component.html
│           └── skill-trends.component.scss
```

**Structure Decision**: Frontend-only SPA pattern. The `reports` feature lives under `src/app/features/reports/` with 4 sub-components (one per report type) plus a landing page, a shared NgRx store slice, and 4 domain-specific computation services. A shared `ExportService` in `core/services/` handles PDF/Excel/CSV/PNG generation across all report types. Report data models are defined in `shared/models/report.models.ts` as computed interfaces (not persisted entities). A responsive `ChartWrapperComponent` in `shared/components/` provides consistent breakpoint-aware chart rendering.

## Complexity Tracking

> No constitution violations. All 10 principles and 10 enforcement rules pass. No justification needed.
