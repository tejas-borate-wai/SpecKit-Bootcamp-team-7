# Feature Specification: Project Management, Candidate Matching, and Team Builder

**Feature Branch**: `007-project-mgmt-team-builder`
**Created**: 2026-03-13
**Status**: Draft
**Input**: User description: "Project Management, Candidate Matching, and Team Builder for Skill Matrix Application."

---

## Overview

This feature enables Managers and Admins to create and manage projects, discover the best-matched candidates from the employee pool based on skill compatibility, assemble project teams by assigning employees to role slots, detect skill gaps when no suitable candidates exist, and track employee availability across projects. All data is persisted in-memory using mock JSON files during the session.

**Access**: Manager and Admin roles only — all screens and routes are protected by `RoleGuard(['Manager', 'Admin'])`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create and Manage a Project (Priority: P1)

A Manager or Admin creates a new project, specifying the name, description, timeline, required roles, and the skills needed along with minimum proficiency levels. They can also edit or delete projects they own (Managers) or any project (Admin).

**Why this priority**: Project creation is the foundational action. Without a project record, no matching or team building can occur. It delivers immediate value as a standalone project registry.

**Independent Test**: Can be fully tested by navigating to `/projects/create`, filling in the form, submitting it, and verifying the new project appears on the `/projects` list with the correct status badge and skill count.

**Acceptance Scenarios**:

1. **Given** a Manager is on the Create Project screen, **When** they submit a valid form with all required fields, **Then** the project is saved and they are redirected to the Projects List showing the new project.
2. **Given** a Manager submits a form with no project name, **When** they click Save, **Then** an inline error "Project name is required." appears below the field.
3. **Given** a Manager sets a Start Date after the Deadline, **When** they click Save, **Then** an inline error "Start date must be before deadline." appears.
4. **Given** a Manager submits a form with no required skills added, **When** they click Save, **Then** an error "Add at least one required skill to create a project." is shown.
5. **Given** a project named "Banking App" already exists, **When** a user creates another project with the same name, **Then** an error "A project with this name already exists." is shown.
6. **Given** a Manager is on the Projects List, **When** they click Edit on a project they own, **Then** the edit form is pre-populated with the project's existing data.
7. **Given** an Admin views the Projects List, **When** they click Edit or Delete on any project (including other managers' projects), **Then** the action is permitted.
8. **Given** a Manager views the Projects List, **When** they view a project created by a different Manager, **Then** the Edit and Delete actions are not visible for that project.

---

### User Story 2 — Find Matching Candidates for a Project (Priority: P2)

A Manager or Admin selects a project and runs the Candidate Matching process to discover which employees best match the project's required skills and proficiency levels.

**Why this priority**: Candidate matching is the core intelligence of this feature. It directly answers the business question "who should work on this project?" and depends on a project record existing (P1).

**Independent Test**: Can be tested by navigating to `/team/matching`, selecting a project with defined skills, and verifying candidates are ranked and displayed with a match breakdown table.

**Acceptance Scenarios**:

1. **Given** a project with required skills is selected on the Matching screen, **When** the system scans employee profiles, **Then** each eligible candidate is shown with a Match Score calculated as `(Skills Matched / Skills Required) × 100`.
2. **Given** a candidate has a Match Score of 100%, **When** results are displayed, **Then** their card appears at the top of the ranked list.
3. **Given** a candidate's skill rating for a required skill is stale or expired, **When** matching is calculated, **Then** that skill is excluded and does not contribute to the match score.
4. **Given** a candidate is Available, **When** results are displayed, **Then** their card is shown with a green ✅ availability indicator and ranked above Partially Available and Busy candidates with equal scores.
5. **Given** a candidate is Busy, **When** results are displayed, **Then** their card is greyed out and ranked last among candidates with equal scores.
6. **Given** no employee meets the minimum proficiency for any required skill, **When** results are displayed, **Then** the message "No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training." is shown.
7. **Given** results are displayed, **When** a Manager applies a Department filter, **Then** only candidates from the selected department are shown.
8. **Given** results are displayed, **When** a Manager clicks "Export as PDF", **Then** a PDF containing the ranked candidate list and match details is downloaded.
9. **Given** a Manager expands a candidate's row, **When** the match breakdown is shown, **Then** it displays a table with columns: Skill | Required Level | Candidate Level | Status (Exceeds / Meets / Below).

---

### User Story 3 — Build a Project Team (Priority: P3)

A Manager or Admin assigns matched candidates to specific role slots on a project, forming the project team.

**Why this priority**: Team building depends on candidate matching (P2) and completes the workflow by converting matched candidates into active project assignments.

**Independent Test**: Can be tested independently by navigating to `/projects/team-builder`, selecting a project and a matched candidate, clicking "Add to Project", and verifying the employee appears in the project's team with the correct role.

**Acceptance Scenarios**:

1. **Given** a project has defined role slots (e.g., Flutter Developer ×2, QA Engineer ×1), **When** a Manager opens the Team Builder, **Then** they see each unfilled role slot with an "Assign" action.
2. **Given** a role slot is unfilled, **When** a Manager clicks "Add to Project" for a matched candidate, **Then** the candidate is assigned to the role, their availability status changes to Busy, and the slot is marked as filled.
3. **Given** all required role slots for a project are filled, **When** the Manager views the Team Builder, **Then** they see the complete team with all assigned employees and roles.
4. **Given** a project's status is changed to Completed, **When** the status update is saved, **Then** all employees assigned to that project automatically have their availability set to Available.

---

### User Story 4 — Detect Skill Gaps and Suggest Learning Paths (Priority: P4)

When no candidate meets the minimum proficiency for one or more required skills, the system surfaces the gap details and suggests which employees are closest to meeting that skill requirement.

**Why this priority**: Skill gap detection is a value-add feature that supports strategic planning. It enhances Team Builder but the core project/matching/team workflows can operate without it.

**Independent Test**: Can be tested by creating a project that requires a skill at Expert level when no employee has that skill, then opening the Team Builder and verifying the gap panel appears.

**Acceptance Scenarios**:

1. **Given** a required skill has no candidates who meet the minimum level, **When** the Team Builder screen is shown, **Then** a Skill Gap panel is displayed listing: Required Skill, Required Level, Highest Available Level, Gap percentage.
2. **Given** a skill gap is detected, **When** the panel is visible, **Then** the system shows a Learning Path Suggestion naming the employee(s) closest to meeting the requirement and recommending relevant training.

---

### User Story 5 — View and Manage Employee Availability (Priority: P5)

Managers can view and override the availability status of employees, and see a Project Alignment View showing which employee is assigned to which project.

**Why this priority**: Availability management supports team planning but is dependent on project assignment data. It is a supporting view rather than a core transaction flow.

**Independent Test**: Can be tested by assigning an employee to a project via Team Builder, then opening the Project Alignment View and verifying the employee shows as Busy with the correct project name.

**Acceptance Scenarios**:

1. **Given** an employee is assigned to a project via Team Builder, **When** a Manager views the Project Alignment View, **Then** the employee appears in the table with: Employee name, Role, Current Project, Status = Busy, Since = assignment date.
2. **Given** a Manager needs to override an employee's availability, **When** they select Override and provide a reason, **Then** the employee's status is updated and the reason is logged.
3. **Given** an employee sets their own status to "Partially Available" from their profile, **When** a Manager views the alignment table, **Then** the employee's status shows "Partially Available" with a warning indicator.

---

### Edge Cases

- What happens when a project has required skills but zero employees have any of those skills in their profiles? → System shows the no-match message and flags all skills as gaps.
- What happens when an employee's skill is stale (not updated in 6 months)? → That skill is excluded from match score calculation; the candidate may still appear but with a lower score.
- What happens if a Manager tries to delete a project that has active team assignments? → The project can still be deleted; all assignments are removed and assigned employees' availability resets to Available.
- What happens when two candidates have identical match scores? → Available candidates are sorted first, then Partially Available, then Busy; ties within the same availability group are sorted alphabetically by name.
- What happens when a role slot requires more candidates than are available (e.g., 3 Flutter Developers but only 1 exists in the pool)? → The system fills what it can and marks remaining slots as unfilled with a warning.

---

## Requirements *(mandatory)*

### Functional Requirements

**Project Management**

- **FR-001**: The system MUST allow Managers and Admins to create projects with the following fields: Project Name (required), Description, Status (Draft / Open / In Progress / Completed), Start Date, Deadline, Required Roles (list of role titles with headcount), Required Skills (multi-select from skill library with a minimum proficiency level per skill), and Created By (auto-filled from the logged-in user's identity).
- **FR-002**: The system MUST validate project creation and display inline field-level errors: "Project name is required." when name is blank; "Start date must be before deadline." when date order is invalid; "Add at least one required skill to create a project." when the skills list is empty; "A project with this name already exists." when a duplicate name is submitted.
- **FR-003**: The system MUST allow Managers to edit and delete only their own projects. Admins MUST be able to edit and delete any project.
- **FR-004**: The Projects List MUST display projects in a table with columns: Project Name, Status badge (color-coded), Start Date, Deadline, Skills Required count, Team Size (number of assigned employees), and Actions.
- **FR-005**: The Projects List MUST support filtering by Status and by date range (Start Date / Deadline).
- **FR-006**: The system MUST support four project statuses: Draft, Open, In Progress, Completed.

**Candidate Matching**

- **FR-007**: The system MUST calculate a Match Score for each employee against a selected project's required skills using the formula: `Match Score = (Skills Matched / Total Skills Required) × 100`. A skill is "matched" only when the employee's proficiency level meets or exceeds the required minimum level.
- **FR-008**: The system MUST exclude stale skill ratings (not updated within 6 months) and expired certification-backed ratings from match score calculations.
- **FR-009**: The system MUST display a Match Breakdown table per candidate showing: Skill | Required Level | Candidate Level | Status (Exceeds / Meets / Below).
- **FR-010**: The system MUST rank candidates by Match Score in descending order. Within the same match score, candidates MUST be ordered: Available first, Partially Available second, Busy last.
- **FR-011**: Busy candidates MUST be visually greyed out in the results list.
- **FR-012**: The system MUST provide filters on the Matching screen for: Department, Availability status, and Minimum match score threshold.
- **FR-013**: When no candidates meet any required skill minimum, the system MUST display: "No candidates found matching the required skills. Consider lowering the minimum proficiency or providing training."
- **FR-014**: The system MUST allow users to export the matched candidates list as a PDF file.

**Team Builder**

- **FR-015**: The Team Builder MUST allow Managers and Admins to view a project's defined role slots (role title and headcount) and assign individual employees to each slot.
- **FR-016**: When an employee is assigned to a project role via Team Builder, the system MUST automatically update that employee's availability status to Busy.
- **FR-017**: When a project status is set to Completed, the system MUST automatically reset all assigned employees' availability to Available.

**Skill Gap Detection**

- **FR-018**: When no candidate qualifies for a required skill, the system MUST flag a Skill Gap for that skill, displaying: Required Skill name, Required Level, Highest Available Level across all employees, and Gap percentage.
- **FR-019**: For each detected skill gap, the system MUST suggest a learning path by identifying the employee(s) whose current level is closest to the required level and recommending training to close the gap.

**Employee Availability**

- **FR-020**: Employee availability MUST support three statuses: Available, Partially Available, Busy.
- **FR-021**: Employees MUST be able to self-set their status to "Partially Available" from their profile.
- **FR-022**: Managers MUST be able to override any team member's availability status, with a mandatory logged reason.
- **FR-023**: The Project Alignment View MUST display a table with columns: Employee | Role | Current Project | Status | Since (assignment date).

**Access Control**

- **FR-024**: All five screens (`/projects`, `/projects/create`, `/projects/:projectId`, `/team/matching`, `/projects/team-builder`) MUST be protected by `RoleGuard(['Manager', 'Admin'])`. Unauthenticated users are redirected to `/login`; authenticated Employees are redirected to `/unauthorized`.

### Key Entities

- **Project**: Represents a work initiative requiring a team. Attributes: project ID, name, description, status, start date, deadline, required skills (with minimum proficiency per skill), required roles (role title + headcount), created by (user reference), created date.
- **Project Assignment**: Represents an employee assigned to a specific role in a project. Attributes: project reference, employee reference, role title, assignment date.
- **Required Skill**: A skill needed for a project with a minimum proficiency threshold. Part of the Project entity. Attributes: skill reference, minimum proficiency level (Beginner / Intermediate / Advanced / Expert).
- **Role Slot**: A role opening within a project. Attributes: role title, required headcount, filled count.
- **Candidate Match Result**: A computed result (not persisted) representing a candidate's suitability for a project. Attributes: employee reference, match score (%), matched skills count, total required skills count, availability status, per-skill breakdown.
- **Skill Gap**: A computed result (not persisted) flagging a missing capability. Attributes: skill reference, required level, highest available level, gap percentage, nearest employees.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Managers can create a fully configured project (with name, dates, roles, and skills) in under 3 minutes.
- **SC-002**: The Candidate Matching results screen loads and displays ranked candidates in under 2 seconds for a team of up to 100 employees.
- **SC-003**: Match scores are accurate — a candidate who meets all required skills at the minimum level or above receives a score of 100%; a candidate who meets none receives 0%.
- **SC-004**: Stale and expired skills are never counted in a candidate's match score — 0% false inclusions.
- **SC-005**: 100% of team assignments automatically trigger an availability status change to Busy without requiring manual intervention.
- **SC-006**: 100% of project completions automatically reset all assigned employees' availability to Available.
- **SC-007**: All five feature screens are inaccessible to Employee-role users — 100% enforcement of role-based access control.
- **SC-008**: The PDF export of matched candidates is generated and available for download within 3 seconds of requesting it.
- **SC-009**: Skill gap detection correctly identifies all required skills for which no qualifying candidate exists, with 0% missed gaps.

---

## Assumptions

- Skill proficiency levels are treated as an ordered scale: Beginner (1) < Intermediate (2) < Advanced (3) < Expert (4). "Meets" means the candidate's level equals the required level; "Exceeds" means it is higher; "Below" means it is lower.
- Stale means a skill rating has not been updated in 6 months, consistent with the definition in the Employee Skill Profile specification.
- Learning Path Suggestions are informational text recommendations only — no integration with an external learning management system is required in this phase.
- PDF export uses client-side rendering (browser print API or equivalent); no server-side rendering is required.
- All CRUD operations update in-memory data only; data resets on page refresh (mock-first architecture per the project constitution).
- The "Created By" field is read from the currently authenticated user's session and is not editable.
- Project names are case-insensitive for duplicate detection (e.g., "Banking App" and "banking app" are treated as duplicates).
- The Matching screen is accessible per-project (a project must be selected before matching can run).

---

## Out of Scope

- Email or push notifications when a project team is assembled (covered in Phase 9 — Notifications).
- Real backend API integration; all data is mock.
- Multi-project assignment for a single employee (an employee can be Busy on one project at a time in this phase).
- Approval workflows for project creation (projects are saved directly by the creating Manager or Admin).
- Gantt chart or timeline view for projects.
