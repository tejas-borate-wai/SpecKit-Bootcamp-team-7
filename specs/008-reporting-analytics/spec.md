# Feature Specification: Reporting and Analytics Module

**Feature Branch**: `008-reporting-analytics`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Reporting and Analytics Module for Skill Matrix Application."

---

## Overview

This feature provides Managers and Admins with data-driven visibility into team and organisational skill health. It includes four report types — Skill Gap Analysis, Team Capability Report, Organisation Skill Heatmap (Admin only), and Skill Trend Analysis — along with export capabilities and responsive chart behaviour. All report data is computed client-side from existing mock JSON files with no persistable state.

**Access**: Manager and Admin roles only for all `/reports/**` routes. The `/reports/heatmap` route is additionally restricted to Admin only. Employee-role users are redirected to `/unauthorized`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Identify Skill Gaps Against Project Requirements (Priority: P1)

A Manager opens the Skill Gap Analysis report to see which required project skills their team is missing or under-qualified in, so they can plan hiring, training, or project reassignment.

**Why this priority**: Skill gap analysis is the highest-value report for day-to-day project delivery decisions. It directly bridges the project management and people management workflows and can stand alone as a complete, demonstrable feature.

**Independent Test**: Can be fully tested by navigating to `/reports/skill-gap`, selecting a project (or letting the system default to the first available), and verifying that a table is shown with columns: Required Skill, Required Level, Team Average Level, Gap %. A Manager should only see their own team's data; an Admin should see all departments.

**Acceptance Scenarios**:

1. **Given** a Manager navigates to `/reports/skill-gap`, **When** the report loads, **Then** a table is displayed showing only skills required by projects where the Manager's team is involved, with columns: Required Skill | Required Level | Team Average Level | Gap %.
2. **Given** the team average level for a skill equals or exceeds the required level, **When** the report is rendered, **Then** Gap % for that skill is shown as 0% (no gap indicator).
3. **Given** the team average level is below the required level, **When** the report is rendered, **Then** the Gap % is calculated as `Required Level % − Team Average Level %` and displayed with a visual warning indicator.
4. **Given** an Admin navigates to `/reports/skill-gap`, **When** the report loads, **Then** data for all departments across the entire organisation is shown, not limited to a single team.
5. **Given** a Manager navigates to `/reports/skill-gap`, **When** they click "Export", **Then** they can download the report as a PDF or Excel file, each containing the report title, the generation date (2026-03-13), and the generating user's name.
6. **Given** a Manager's team has no project skill requirements defined, **When** the report loads, **Then** an empty state message is shown: "No skill gap data available. Create a project with required skills to see gap analysis."

---

### User Story 2 — Understand Team Skill Strength and Coverage (Priority: P2)

A Manager or Admin views the Team Capability Report to understand how skills are distributed across teams and categories, helping them identify strong areas and coverage gaps at a glance.

**Why this priority**: Team capability data is a prerequisite for strategic workforce planning. It depends only on employee skill profiles (already existing data) and delivers standalone value as a team health dashboard.

**Independent Test**: Can be tested by navigating to `/reports/team`, selecting a department and skill category filter, and verifying the report shows average proficiency per skill for the selected scope.

**Acceptance Scenarios**:

1. **Given** a Manager opens `/reports/team`, **When** the report loads, **Then** it displays average proficiency per skill for each team member in their department, viewable by department or skill category.
2. **Given** a Manager applies a "Skill Category" filter (e.g., Cloud), **When** the filter is applied, **Then** only skills within that category are shown in the report.
3. **Given** an Admin opens `/reports/team`, **When** the report loads, **Then** they can switch between departments using a department selector and see the capability data for any team.
4. **Given** a Manager clicks "Export" on the Team Capability Report, **When** the export completes, **Then** a PDF or Excel file is downloaded including: report title, generated date, generating user's name, and the full data table.

---

### User Story 3 — Visualise Org-Wide Skill Proficiency Distribution (Priority: P3)

An Admin views the Organisation Skill Heatmap to see how proficiency is distributed across the entire organisation for every tracked skill, giving a bird's-eye view of skill health.

**Why this priority**: The heatmap provides strategic org-level insight, restricted to Admin only. It builds on employee skill data and delivers substantial value for workforce planning, but it is Admin-scoped and therefore less critical than team-level reports.

**Independent Test**: Can be tested by logging in as Admin, navigating to `/reports/heatmap`, and verifying a colour-coded grid is rendered showing, for each skill, the count of employees at each proficiency level (Beginner, Intermediate, Advanced, Expert).

**Acceptance Scenarios**:

1. **Given** an Admin navigates to `/reports/heatmap`, **When** the page loads, **Then** a colour-coded grid is displayed with rows = skills, columns = proficiency levels (Beginner | Intermediate | Advanced | Expert), and cells showing employee count.
2. **Given** a skill has employees spread across all four levels (e.g., Flutter: 10 | 5 | 3 | 1), **When** the grid is rendered, **Then** each cell accurately reflects that count.
3. **Given** a Manager navigates to `/reports/heatmap`, **When** the route is accessed, **Then** Manager is redirected to `/unauthorized` — the heatmap is Admin-only.
4. **Given** an Admin is on the heatmap screen, **When** they click "Export", **Then** they can download the heatmap as a PDF or PNG image, each including: report title, generated date, generating user's name.
5. **Given** the Admin is on a mobile device viewing the heatmap, **When** the grid is rendered, **Then** it is horizontally scrollable and the chart height is capped at 250px.

---

### User Story 4 — Track Skill Growth Over Time (Priority: P4)

A Manager or Admin views the Skill Trend Analysis report to see whether employee skill proficiency is improving quarter-over-quarter, helping them evaluate the impact of training initiatives.

**Why this priority**: Trend analysis adds longitudinal context to the other reports, but it requires historical score data and is supplementary to gap and capability reporting.

**Independent Test**: Can be tested by navigating to `/reports/trends`, verifying that a line chart is rendered showing proficiency trends per skill across at least two quarters, with Manager-scoped data for Managers and org-wide data for Admins.

**Acceptance Scenarios**:

1. **Given** a Manager opens `/reports/trends`, **When** the report loads, **Then** a line chart is displayed showing skill proficiency percentage per skill over time (quarter-over-quarter) for their team only.
2. **Given** an Admin opens `/reports/trends`, **When** the report loads, **Then** the chart shows org-wide trend data, with the ability to filter by department.
3. **Given** only one quarter of data exists for a skill, **When** the trend chart is rendered, **Then** a single data point is shown per skill with a notice: "More data points needed for trend analysis."
4. **Given** a user clicks "Export" on the Skill Trend Analysis report, **When** the export completes, **Then** a PDF file is downloaded containing the chart, report title, generated date, and generating user's name.

---

### Edge Cases

- What happens when there are no employee skill records at all? → All report screens show an empty state message rather than a blank or broken chart.
- What happens when a skill exists in project requirements but no employee has that skill in their profile? → Gap % is shown as 100% for that skill.
- What happens when a Manager has no team members assigned to them? → Team capability and skill gap reports show an empty state: "No team data available."
- What happens when historical skill score data covers only a single time period? → Trend chart renders a single data point and displays the notice about needing more data.
- What happens when an Employee-role user navigates directly to `/reports`? → They are redirected to `/unauthorized`.
- What happens when an export file is requested but the data set is empty? → The export still generates a valid file with headers and an "No data available" row.

---

## Requirements *(mandatory)*

### Functional Requirements

**Access Control**

- **FR-001**: All five report screens (`/reports`, `/reports/skill-gap`, `/reports/team`, `/reports/heatmap`, `/reports/trends`) MUST be protected by `RoleGuard(['Manager', 'Admin'])`. Unauthenticated users are redirected to `/login`; Employee-role users are redirected to `/unauthorized`.
- **FR-002**: The `/reports/heatmap` route MUST be additionally restricted to Admin only via `RoleGuard(['Admin'])`. The heatmap tab in the navigation MUST NOT be present in the DOM for Manager-role users (not merely hidden).
- **FR-003**: Managers MUST see only their own team's data across all report types. Admins MUST see all teams and departments. This data scoping MUST be enforced at the data computation layer, not only in the UI.

**Skill Gap Analysis (`/reports/skill-gap`)**

- **FR-004**: The Skill Gap Analysis report MUST compare required project skills (from `projects.json`) against actual employee skill levels (from `employee-skills.json`) and display a table with columns: Required Skill | Required Level | Team Average Level | Gap %.
- **FR-005**: Gap % MUST be calculated as `max(0, Required Level % − Team Average Level %)`. A result of 0% means no gap.
- **FR-006**: Skills with a gap greater than 0% MUST be displayed with a visual warning indicator (e.g., amber/red colour coding).
- **FR-007**: When no project skill requirements exist for the visible scope, the report MUST show the empty state: "No skill gap data available. Create a project with required skills to see gap analysis."
- **FR-008**: The Skill Gap Analysis report MUST be exportable as PDF and Excel, with each export including: report title, generation date, and generating user's full name.

**Team Capability Report (`/reports/team`)**

- **FR-009**: The Team Capability Report MUST display average proficiency levels per skill, organised by department and filterable by skill category.
- **FR-010**: Users MUST be able to switch the view between "By Department" and "By Skill Category" using a toggle or tab control.
- **FR-011**: The Team Capability Report MUST be exportable as PDF and Excel, with each export including: report title, generation date, and generating user's full name.

**Organisation Skill Heatmap (`/reports/heatmap`)**

- **FR-012**: The Org Skill Heatmap MUST display a colour-coded grid where each row represents a skill and each column represents a proficiency level (Beginner | Intermediate | Advanced | Expert), with cells showing the count of employees at that level.
- **FR-013**: The heatmap grid MUST be visualised using a chart component (bar chart, heat grid, or table with colour scaling) that clearly distinguishes low vs. high counts through colour intensity.
- **FR-014**: The Org Skill Heatmap MUST be exportable as PDF and as a PNG image, each including: report title, generation date, and generating user's full name.

**Skill Trend Analysis (`/reports/trends`)**

- **FR-015**: The Skill Trend Analysis report MUST display a line chart showing proficiency percentage per skill over time, with data points grouped by quarter.
- **FR-016**: Each Manager MUST see only their team's trend data. Admins MUST be able to filter by department to compare trends.
- **FR-017**: When only one time-period data point exists for a skill, the system MUST display a notice: "More data points needed for trend analysis."
- **FR-018**: The Skill Trend Analysis report MUST be exportable as a PDF including the rendered chart, report title, generation date, and generating user's full name.

**Export General Rules**

- **FR-019**: All exports (PDF, Excel, CSV, PNG) MUST be generated and available for download within 5 seconds of the user requesting them.
- **FR-020**: Every export file MUST include in its header or first row: the report title, the generation date (formatted as YYYY-MM-DD), and the full name of the user who generated it.
- **FR-021**: Employee Skill List export (available from the Team Capability or Skills screens) MUST support CSV and Excel formats.

**Responsive Chart Behaviour**

- **FR-022**: On desktop viewports (≥1280px), charts MUST render at full size with all axis labels visible and the legend displayed beside the chart.
- **FR-023**: On tablet viewports (768px–1279px), charts MUST render at 100% container width with the legend displayed below the chart.
- **FR-024**: On mobile viewports (<768px), charts MUST be capped at 250px height, show simplified axis labels, be horizontally scrollable when data exceeds viewport width, and the legend MUST be hidden by default with a tap-to-show option.

### Key Entities

- **Skill Gap Record**: A computed (non-persisted) result showing the difference between what a project requires and what the team delivers. Attributes: skill name, required level (%), team average level (%), gap % (0 when no gap).
- **Team Capability Snapshot**: A computed aggregation of proficiency data for a team or department at a point in time. Attributes: skill name, category, department, average proficiency level, employee count.
- **Heatmap Cell**: A computed count for a specific skill × proficiency-level combination across the organisation. Attributes: skill name, proficiency level, employee count, colour intensity bucket.
- **Skill Trend Point**: A historical data point for a skill's average proficiency within a team or org. Attributes: skill name, quarter label, average proficiency %, scope (team / org-wide).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four report screens load and render their full data within 3 seconds on a dataset of up to 100 employees and 50 skills.
- **SC-002**: Gap % values in the Skill Gap Analysis are accurate to ±1% — verified by comparing computed results against manual calculations on the same mock data set.
- **SC-003**: The Organisation Skill Heatmap correctly reflects the employee count per skill per proficiency level, with 0% discrepancy against the underlying `employee-skills.json` data.
- **SC-004**: All export files are generated and available for download within 5 seconds of the user requesting them.
- **SC-005**: 100% of export files include the required header fields: report title, generation date, and generating user's name.
- **SC-006**: The `/reports/heatmap` route is inaccessible to Manager and Employee roles — 100% enforcement verified by direct URL navigation attempts.
- **SC-007**: All report screens render correctly and without broken layouts at the three test breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop).
- **SC-008**: Charts on mobile viewports never exceed 250px in height and are horizontally scrollable when content overflows — verified at 375px viewport width.
- **SC-009**: Managers see only their own team's data in every report type — 0% data leakage to other teams verified by cross-checking Manager and Admin views on the same dataset.

---

## Assumptions

- "Team Average Level" for Skill Gap Analysis is computed as the arithmetic mean of all final skill ratings (as a percentage) across all employees in the visible scope for that skill. Employees who do not have the skill in their profile contribute a score of 0% to the average.
- Proficiency levels map to percentages as: Beginner = 25%, Intermediate = 50%, Advanced = 75%, Expert = 100% (midpoints of the level bands defined in requirement.md Section 3). This mapping is used for average and gap calculations.
- Quarter-over-quarter trend data is derived from `skill-test-attempts.json` dates; each attempt's score is grouped by calendar quarter (Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec).
- The "Employee Skill List" export is scoped to the logged-in user's team for Managers and org-wide for Admins.
- PNG export for the heatmap is achieved via client-side canvas rendering (e.g., screenshot of the chart element); no server-side rendering is required.
- All report data is computed fresh on each page load from in-memory mock data; there is no caching or pre-aggregation layer required in this phase.
- The Reports landing page (`/reports`) acts as a navigation hub with tabs/cards linking to the four report sub-pages; it does not display its own data.

---

## Out of Scope

- Scheduled or emailed report delivery (no email functionality in this mock app).
- Real-time data refresh or WebSocket-based updates; all data is static mock data loaded on navigation.
- User-configurable report templates or custom columns.
- Drill-down from the heatmap into individual employee profiles (covered separately in Phase 3 and Phase 6).
- Saving report configurations or bookmarking filters between sessions.
