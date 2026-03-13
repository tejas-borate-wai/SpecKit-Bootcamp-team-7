# Tasks: Reporting & Analytics

**Input**: Design documents from `/specs/008-reporting-analytics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/mock-api-contract.md, quickstart.md

**Tests**: Included — the project constitution mandates Jasmine + Karma unit tests for all business logic (rating calculations, aggregation, level mapping, validation rules). The plan confirms test coverage for: gap % calculation, team capability aggregation, heatmap cell counts, trend quarter grouping, export header fields, role-based data scoping, route guards, and empty-state conditions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Angular SPA per constitution)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create shared model interfaces used across all report types

- [ ] T001 Install ngx-charts, SheetJS (xlsx), and html2canvas dependencies via `npm install @swimlane/ngx-charts xlsx html2canvas` (jsPDF + jsPDF-AutoTable assumed already installed from Phase 7)
- [ ] T002 [P] Create report model interfaces (SkillGapRecord, TeamCapabilitySnapshot, HeatmapCell, HeatmapChartData, SkillTrendPoint, TrendChartData, ExportMetadata) and proficiency mapping utilities (proficiencyToPercent, percentToProficiency, PROFICIENCY_TO_PERCENT) in src/app/shared/models/report.models.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: NgRx store slice, export service, responsive chart wrapper, interceptor endpoints, routes, and landing page that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create NgRx reports actions in src/app/features/reports/store/reports.actions.ts for loadGapAnalysis, loadGapAnalysisSuccess, loadGapAnalysisFailure, loadTeamCapability, loadTeamCapabilitySuccess, loadTeamCapabilityFailure, loadHeatmap, loadHeatmapSuccess, loadHeatmapFailure, loadTrends, loadTrendsSuccess, loadTrendsFailure, setGapSelectedProject, setCapabilityDepartment, setCapabilityCategoryId, setCapabilityViewMode, setTrendsDepartment
- [ ] T004 Create NgRx reports reducer in src/app/features/reports/store/reports.reducer.ts defining ReportsState with four sub-states (gapAnalysis, teamCapability, heatmap, trends) each having data array, loading, error, and filter properties per data-model.md NgRx State Shape
- [ ] T005 [P] Create NgRx reports selectors in src/app/features/reports/store/reports.selectors.ts with memoized selectors: selectGapRecords, selectGapLoading, selectGapError, selectGapSelectedProject, selectCapabilitySnapshots, selectCapabilityLoading, selectCapabilityDepartment, selectCapabilityCategoryId, selectCapabilityViewMode, selectHeatmapCells, selectHeatmapChartData, selectHeatmapLoading, selectTrendPoints, selectTrendChartData, selectTrendsLoading, selectTrendsDepartment
- [ ] T006 [P] Create ExportService in src/app/core/services/export.service.ts with methods: exportTableToPdf (jsPDF-AutoTable for tabular reports), exportChartToPdf (html2canvas + jsPDF for chart-based reports), exportToExcel (SheetJS XLSX.writeFile for .xlsx), exportToCsv (SheetJS XLSX.writeFile for .csv), exportToPng (html2canvas + canvas.toBlob for PNG download); every export method accepts ExportMetadata and prepends report title, generation date (YYYY-MM-DD), and generating user's full name as header row
- [ ] T007 [P] Create ChartWrapperComponent in src/app/shared/components/chart-wrapper/chart-wrapper.component.ts with BreakpointObserver injection detecting desktop (≥1280px), tablet (768–1279px), and mobile (<768px); expose CSS classes .chart-desktop, .chart-tablet, .chart-mobile on container; create template in chart-wrapper.component.html with ng-content projection and conditional legend toggle button for mobile; create styles in chart-wrapper.component.scss with desktop=natural size, tablet=100% width + legend below, mobile=max-height 250px + overflow-x auto + hidden legend with tap-to-show
- [ ] T008 Extend MockApiInterceptor in src/app/core/interceptors/mock-api.interceptor.ts to handle GET /api/reports/gap-analysis (return projects with requiredSkills, employeeSkills filtered by department param, skillDefinitions), GET /api/reports/team-capability (return employeeSkills, skillDefinitions, skillCategories filtered by department and categoryId params), GET /api/reports/heatmap (Admin-only — return 403 for non-Admin, return all employeeSkills and skillDefinitions), GET /api/reports/trends (return skill-test-attempts filtered by department param, skillDefinitions); apply RBAC role check returning 403 for Employee role on all endpoints
- [ ] T009 Create reports feature routes in src/app/features/reports/reports.routes.ts with parent route providing provideState('reports', reportsReducer) and provideEffects(ReportsEffects), child routes: '' → ReportsLandingComponent, 'skill-gap' → GapAnalysisComponent, 'team' → TeamCapabilityComponent, 'heatmap' → OrgHeatmapComponent (with RoleGuard data: { roles: ['Admin'] }), 'trends' → SkillTrendsComponent; all child components lazy-loaded via loadComponent
- [ ] T010 Register reports lazy-loaded routes in src/app/app.routes.ts with path 'reports' guarded by AuthGuard + RoleGuard(['Manager', 'Admin']) using loadChildren pointing to reports.routes.ts REPORTS_ROUTES
- [ ] T011 Create ReportsLandingComponent in src/app/features/reports/reports-landing/reports-landing.component.ts as navigation hub with cards/tabs linking to the four report sub-pages; create template in reports-landing.component.html with card grid: Skill Gap Analysis, Team Capability, Org Skill Heatmap (rendered via @if only when role === 'Admin' — removed from DOM for Managers per FR-002), Skill Trend Analysis; create styles in reports-landing.component.scss with responsive card grid (desktop=4 columns, tablet=2 columns, mobile=1 column stacked)

**Checkpoint**: Foundation ready — NgRx store, interceptor endpoints, export service, chart wrapper, routes, and landing page are in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Identify Skill Gaps Against Project Requirements (Priority: P1) 🎯 MVP

**Goal**: Managers and Admins see a Skill Gap Analysis report comparing project-required skills against team proficiency averages, with gap percentages and visual warning indicators. PDF and Excel export supported.

**Independent Test**: Navigate to `/reports/skill-gap` as Manager, verify a table loads showing Required Skill | Required Level | Team Average Level | Gap % with Manager seeing only their team's data. Verify gaps > 0% show amber/red warning. Verify export generates PDF/Excel with header fields. Navigate as Admin and verify all departments visible.

### Tests for User Story 1

- [ ] T012 [P] [US1] Unit test GapAnalysisService in src/app/features/reports/services/gap-analysis.service.spec.ts covering: gap % calculation returns max(0, required - average) for various data sets; employees without the skill contribute 0% to team average; gap of 0% when team average meets or exceeds required level; gapSeverity = 'none' for 0%, 'warning' for 1–49%, 'critical' for ≥50%; Manager scoping returns only same-department employees; Admin scoping returns all employees; empty state when no projects have required skills

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create GapAnalysisService in src/app/features/reports/services/gap-analysis.service.ts with computeGapRecords(projects, employeeSkills, skillDefinitions): SkillGapRecord[] method implementing the algorithm from research.md §3 — for each project's requiredSkill, compute requiredLevelPercent via proficiencyToPercent, compute teamAverageLevelPercent as mean of employee skill levels (0% for missing skills), compute gapPercent as max(0, required - average), assign gapSeverity ('none' | 'warning' | 'critical')
- [ ] T014 [US1] Add gap analysis NgRx effects in src/app/features/reports/store/reports.effects.ts: on loadGapAnalysis action, call HttpClient GET /api/reports/gap-analysis with department param (auto-set for Manager from session state), pipe response through GapAnalysisService.computeGapRecords, dispatch loadGapAnalysisSuccess with computed SkillGapRecord[] or loadGapAnalysisFailure on error
- [ ] T015 [US1] Create GapAnalysisComponent in src/app/features/reports/gap-analysis/gap-analysis.component.ts dispatching loadGapAnalysis on init, selecting gap records and loading state from store; create template in gap-analysis.component.html with data table showing Required Skill | Required Level | Team Average Level | Gap % columns, gap rows colour-coded (amber for warning, red for critical severity), empty state message "No skill gap data available. Create a project with required skills to see gap analysis." when no records (FR-007), project filter dropdown (optional), and Export buttons (PDF, Excel); create styles in gap-analysis.component.scss with responsive table (desktop=full table, tablet=horizontal scroll, mobile=expandable card list) using SCSS breakpoint variables; wire Export PDF button to ExportService.exportTableToPdf and Export Excel button to ExportService.exportToExcel, both passing ExportMetadata with report title "Skill Gap Analysis Report", current date, and current user's full name (FR-008, FR-020)

**Checkpoint**: User Story 1 complete — Skill Gap Analysis fully functional. Managers see team-scoped gap data, Admins see org-wide data. Table displays with visual warning indicators. PDF + Excel export works with correct headers.

---

## Phase 4: User Story 2 — Understand Team Skill Strength and Coverage (Priority: P2)

**Goal**: Managers and Admins see a Team Capability Report showing average proficiency per skill per department, with department/category filters and a toggle between "By Department" and "By Skill Category" views. PDF and Excel export supported.

**Independent Test**: Navigate to `/reports/team` as Manager, verify report shows average proficiency per skill for the Manager's department. Apply category filter, verify only that category's skills shown. Toggle to "By Skill Category" view and verify layout changes. As Admin, verify department selector allows switching between all departments. Export as PDF/Excel and verify header fields.

### Tests for User Story 2

- [ ] T016 [P] [US2] Unit test TeamCapabilityService in src/app/features/reports/services/team-capability.service.spec.ts covering: average proficiency computed correctly for multiple employees with same skill; employeeCount reflects how many employees have the skill; department filter restricts data to matching employees; category filter restricts data to matching skills; Manager scoping locks to own department; Admin can switch departments

### Implementation for User Story 2

- [ ] T017 [P] [US2] Create TeamCapabilityService in src/app/features/reports/services/team-capability.service.ts with computeCapabilitySnapshots(employeeSkills, skillDefinitions, skillCategories): TeamCapabilitySnapshot[] method implementing the two-pass algorithm from research.md §4 — Pass 1: build skill-department matrix grouping ratings by (skillId, department), Pass 2: compute averageProficiencyPercent and employeeCount per key, map averages to proficiencyLevel via percentToProficiency
- [ ] T018 [US2] Add team capability NgRx effects in src/app/features/reports/store/reports.effects.ts: on loadTeamCapability action, call HttpClient GET /api/reports/team-capability with department and categoryId params, pipe response through TeamCapabilityService.computeCapabilitySnapshots, dispatch loadTeamCapabilitySuccess with computed TeamCapabilitySnapshot[] or loadTeamCapabilityFailure on error
- [ ] T019 [US2] Create TeamCapabilityComponent in src/app/features/reports/team-capability/team-capability.component.ts dispatching loadTeamCapability on init and on filter change, selecting snapshots and loading state from store; create template in team-capability.component.html with department selector (Manager locked to own department, Admin can select any via dropdown — FR-003), skill category filter dropdown (FR-010), view mode toggle between "By Department" and "By Skill Category" (FR-010), data table showing Skill | Category | Department | Avg Proficiency | Employee Count, empty state when no data, and Export buttons (PDF, Excel); create styles in team-capability.component.scss with responsive table and filter bar layout; wire Export PDF to ExportService.exportTableToPdf and Export Excel to ExportService.exportToExcel with ExportMetadata "Team Capability Report" (FR-011, FR-020)

**Checkpoint**: User Story 2 complete — Team Capability Report fully functional with department/category filters, view toggle, and export. Manager sees own team only, Admin can switch departments.

---

## Phase 5: User Story 3 — Visualise Org-Wide Skill Proficiency Distribution (Priority: P3)

**Goal**: Admin-only Organisation Skill Heatmap showing a colour-coded grid of employee counts per skill per proficiency level (Beginner | Intermediate | Advanced | Expert) using ngx-charts. PDF and PNG export supported. Managers redirected to /unauthorized.

**Independent Test**: Log in as Admin, navigate to `/reports/heatmap`, verify colour-coded grid renders with rows = skills, columns = proficiency levels, cells = employee counts. Verify counts match employee-skills.json data. Export as PDF and PNG, verify files include header fields. Log in as Manager, navigate to `/reports/heatmap`, verify redirect to /unauthorized. Verify heatmap tab not in DOM on reports landing page for Manager.

### Tests for User Story 3

- [ ] T020 [P] [US3] Unit test HeatmapService in src/app/features/reports/services/heatmap.service.spec.ts covering: cell counts accurately reflect number of employees at each proficiency level per skill; skills with no employees at a level show count of 0; intensityBucket correctly assigned as 'low' | 'medium' | 'high' | 'very-high' relative to max count; HeatmapChartData transformation produces correct ngx-charts format with name=skillName and series entries for each level

### Implementation for User Story 3

- [ ] T021 [P] [US3] Create HeatmapService in src/app/features/reports/services/heatmap.service.ts with computeHeatmapCells(employeeSkills, skillDefinitions): HeatmapCell[] method implementing the 2D count matrix from research.md §5 — count employees per skillId per proficiency level across entire org; assign intensityBucket based on count relative to max; also implement transformToChartData(cells): HeatmapChartData[] method converting HeatmapCell[] to ngx-charts heat-map format [{ name: skillName, series: [{ name: levelName, value: count }] }]
- [ ] T022 [US3] Add heatmap NgRx effects in src/app/features/reports/store/reports.effects.ts: on loadHeatmap action, call HttpClient GET /api/reports/heatmap (Admin-only — interceptor returns 403 for non-Admin), pipe response through HeatmapService.computeHeatmapCells and HeatmapService.transformToChartData, dispatch loadHeatmapSuccess with both cells and chartData or loadHeatmapFailure on error
- [ ] T023 [US3] Create OrgHeatmapComponent in src/app/features/reports/org-heatmap/org-heatmap.component.ts dispatching loadHeatmap on init, selecting heatmapChartData and loading state from store; create template in org-heatmap.component.html rendering ngx-charts-heat-map inside ChartWrapperComponent with sequential colour scheme (light → dark intensity), with chart aria-label for accessibility, and Export buttons (PDF, PNG); create styles in org-heatmap.component.scss with responsive layout via ChartWrapperComponent breakpoints (desktop=full grid all labels, tablet=100% width legend below, mobile=250px max height + horizontal scroll per FR-024); wire Export PDF to ExportService.exportChartToPdf (html2canvas captures chart → embeds in jsPDF) and Export PNG to ExportService.exportToPng (html2canvas → blob download), both passing ExportMetadata "Organisation Skill Heatmap" (FR-014, FR-020)

**Checkpoint**: User Story 3 complete — Heatmap renders colour-coded proficiency grid for Admin. Manager access blocked at route and DOM level. PDF + PNG export functional.

---

## Phase 6: User Story 4 — Track Skill Growth Over Time (Priority: P4)

**Goal**: Managers and Admins see a Skill Trend Analysis line chart showing proficiency percentage per skill over time, grouped by calendar quarter. Manager sees own team trends, Admin can filter by department. PDF export supported.

**Independent Test**: Navigate to `/reports/trends` as Manager, verify line chart renders with at least one skill showing data points by quarter. Verify Manager sees only own team data. As Admin, verify department filter dropdown appears and switching departments updates chart. Verify single-data-point edge case shows notice. Export as PDF and verify header fields.

### Tests for User Story 4

- [ ] T024 [P] [US4] Unit test TrendAnalysisService in src/app/features/reports/services/trend-analysis.service.spec.ts covering: attempts correctly grouped by calendar quarter (Q1=Jan–Mar, Q2=Apr–Jun, Q3=Jul–Sep, Q4=Oct–Dec); average score per skill per quarter computed correctly; TrendChartData transformation produces correct ngx-charts line-chart format; single quarter returns one data point per skill; empty attempts array returns empty results; department-scoped filtering returns only matching user attempts

### Implementation for User Story 4

- [ ] T025 [P] [US4] Create TrendAnalysisService in src/app/features/reports/services/trend-analysis.service.ts with computeTrendPoints(attempts, skillDefinitions, scope): SkillTrendPoint[] method implementing the quarter grouping algorithm from research.md §6 — derive quarter label from attempt date, group by (skillId, quarter), compute average score per group, set attemptCount and scope; also implement transformToChartData(points): TrendChartData[] converting to ngx-charts line-chart format [{ name: skillName, series: [{ name: quarterLabel, value: averageScore }] }]
- [ ] T026 [US4] Add trend analysis NgRx effects in src/app/features/reports/store/reports.effects.ts: on loadTrends action, call HttpClient GET /api/reports/trends with department param, pipe response through TrendAnalysisService.computeTrendPoints and transformToChartData, dispatch loadTrendsSuccess with both points and chartData or loadTrendsFailure on error
- [ ] T027 [US4] Create SkillTrendsComponent in src/app/features/reports/skill-trends/skill-trends.component.ts dispatching loadTrends on init and on department filter change, selecting trendChartData and loading state from store; create template in skill-trends.component.html rendering ngx-charts-line-chart inside ChartWrapperComponent with multi-line display (one line per skill), x-axis=quarter labels, y-axis=proficiency %, department filter dropdown for Admin (hidden for Manager per FR-016), notice "More data points needed for trend analysis." when any skill has only one quarter of data (FR-017), and Export PDF button; create styles in skill-trends.component.scss with responsive chart via ChartWrapperComponent (desktop=full legend beside, tablet=100% width legend below, mobile=250px max height + scroll per FR-024); wire Export PDF to ExportService.exportChartToPdf passing ExportMetadata "Skill Trend Analysis Report" (FR-018, FR-020)

**Checkpoint**: User Story 4 complete — Skill Trend Analysis line chart renders with quarterly data. Manager sees team-only data, Admin can filter by department. PDF export functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Export utility tests, route guard tests, responsive validation, and quickstart verification

- [ ] T028 [P] Unit test ExportService in src/app/core/services/export.service.spec.ts covering: every export method includes report title, generation date in YYYY-MM-DD format, and generating user's full name in the file header (FR-020); PDF export generates a valid Blob; Excel export generates a valid .xlsx file; CSV export generates a valid .csv file; PNG export triggers canvas capture
- [ ] T029 [P] Unit test reports route guards in src/app/features/reports/reports.routes.spec.ts covering: Employee role redirected to /unauthorized on /reports (FR-001); Manager can access /reports, /reports/skill-gap, /reports/team, /reports/trends; Manager redirected to /unauthorized on /reports/heatmap (FR-002); Admin can access all five report routes; unauthenticated user redirected to /login
- [ ] T030 [P] Add Employee Skill List export (CSV and Excel) to TeamCapabilityComponent in src/app/features/reports/team-capability/team-capability.component.ts by adding "Export Skill List CSV" and "Export Skill List Excel" buttons wired to ExportService.exportToCsv and ExportService.exportToExcel with employee-level skill data and ExportMetadata "Employee Skill List" (FR-021)
- [ ] T031 Verify responsive chart behaviour at 375px, 768px, and 1280px across all four report components — confirm desktop shows full charts with legend beside, tablet shows 100% width with legend below, mobile caps at 250px height with horizontal scroll and legend hidden (FR-022, FR-023, FR-024, SC-007, SC-008)
- [ ] T032 Run quickstart.md validation steps to confirm all dependencies installed, all routes accessible per role, all 4 reports render data, and all export formats generate correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies on this feature — can start immediately (requires Phases 1–5, 7 of overall project already implemented)
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend on Phase 2 completion
  - User stories can proceed in parallel (different service files, different component directories)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 — Skill Gap Analysis (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 — Team Capability (P2)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 3 — Org Heatmap (P3)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 4 — Skill Trends (P4)**: Can start after Phase 2 — no dependencies on other stories

### Within Each User Story

- Tests SHOULD be written first and FAIL before implementation
- Service (computation logic) before NgRx effects
- NgRx effects before UI component
- All marked [P] tasks within a story can run in parallel with each other

### Shared File Edits (Sequential)

- T008 (interceptor extension) — single file edit, must complete before any effects work
- T014, T018, T022, T026 — all add effect handlers to the same reports.effects.ts file; execute sequentially per story order OR combine into a single implementation pass

---

## Parallel Example: All User Stories After Phase 2

```text
# After Phase 2 is complete, all 4 stories can start in parallel:

# Developer A: User Story 1 (Gap Analysis)
Task T012: Unit test GapAnalysisService (spec file)
Task T013: Create GapAnalysisService (service file)
Task T014: Add gap analysis effects (effects file — coordinate with other stories)
Task T015: Create GapAnalysisComponent (component directory)

# Developer B: User Story 2 (Team Capability)
Task T016: Unit test TeamCapabilityService (spec file)
Task T017: Create TeamCapabilityService (service file)
Task T018: Add team capability effects (effects file — after T014 or coordinate)
Task T019: Create TeamCapabilityComponent (component directory)

# Developer C: User Story 3 (Heatmap)
Task T020: Unit test HeatmapService (spec file)
Task T021: Create HeatmapService (service file)
Task T022: Add heatmap effects (effects file — after T018 or coordinate)
Task T023: Create OrgHeatmapComponent (component directory)

# Developer D: User Story 4 (Trends)
Task T024: Unit test TrendAnalysisService (spec file)
Task T025: Create TrendAnalysisService (service file)
Task T026: Add trends effects (effects file — after T022 or coordinate)
Task T027: Create SkillTrendsComponent (component directory)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install deps, create models)
2. Complete Phase 2: Foundational (store, export service, chart wrapper, interceptor, routes, landing)
3. Complete Phase 3: User Story 1 — Skill Gap Analysis
4. **STOP and VALIDATE**: Test gap analysis independently at `/reports/skill-gap`
5. Deploy/demo if ready — Managers can already see skill gap data and export reports

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Gap Analysis) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Team Capability) → Test independently → Deploy/Demo
4. Add User Story 3 (Heatmap) → Test independently → Deploy/Demo
5. Add User Story 4 (Trends) → Test independently → Deploy/Demo
6. Polish phase → Export tests, route guard tests, responsive validation
7. Each story adds a new report tab without breaking previous reports

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done, assign one story per developer (all 4 stories are independent)
3. Coordinate on reports.effects.ts edits (sequential or integrate at the end)
4. Stories complete and integrate independently into the reports landing page

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in the same phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- The reports.effects.ts file is shared across all stories — coordinate sequential edits
- The reports landing page (T011) already includes @if role guard for heatmap tab
- All report computations happen in services (not components or effects) for testability
- ExportMetadata is always sourced from NgRx session state for the generating user's name
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
