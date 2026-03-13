# Tasks: Project Management, Candidate Matching & Team Builder

**Input**: Design documents from `/specs/007-project-mgmt-team-builder/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Angular SPA per constitution)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependency, create shared model interfaces, and extend mock data files for this feature

- [ ] T001 Install jsPDF and jsPDF-AutoTable dependencies via `npm install jspdf jspdf-autotable` and `npm install --save-dev @types/jspdf`
- [ ] T002 [P] Create Project and RequiredSkill and RoleSlot and ProjectStatus interfaces in src/app/shared/models/project.model.ts
- [ ] T003 [P] Create ProjectAssignment interface in src/app/shared/models/project-assignment.model.ts
- [ ] T004 [P] Create CandidateMatchResult and SkillBreakdownEntry interfaces in src/app/shared/models/candidate-match.model.ts
- [ ] T005 [P] Create SkillGapResult and NearestEmployee interfaces in src/app/shared/models/skill-gap.model.ts
- [ ] T006 [P] Create AvailabilityStatus type and AvailabilityOverride and ProjectAlignmentEntry interfaces in src/app/shared/models/availability.model.ts
- [ ] T007 [P] Create mock data file src/assets/mock-data/projects.json with 3–5 sample projects including requiredSkills (with minimumLevel) and requiredRoles (with headcount)
- [ ] T008 [P] Create mock data file src/assets/mock-data/project-assignments.json with 1–2 sample assignments

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: NgRx store, interceptor endpoints, core services, and routing that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create NgRx state interface in src/app/core/store/projects/projects.state.ts defining ProjectsState with projects, assignments, availabilityOverrides, selectedProjectId, matchResults, skillGaps, filters, loading, error
- [ ] T010 Create NgRx actions in src/app/core/store/projects/projects.actions.ts for loadProjects, createProject, updateProject, deleteProject, loadAssignments, assignToProject, removeAssignment, runMatching, setFilters, completeProject, overrideAvailability
- [ ] T011 Create NgRx reducer in src/app/core/store/projects/projects.reducer.ts handling all actions from T010
- [ ] T012 Create NgRx selectors in src/app/core/store/projects/projects.selectors.ts for selectProjects, selectSelectedProject, selectAssignments, selectMatchResults, selectSkillGaps, selectFilters, selectLoading, selectProjectsByStatus, selectAssignmentsByProject, selectAvailabilityForUser
- [ ] T013 Extend MockApiInterceptor in src/app/core/interceptors/mock-api.interceptor.ts to handle GET/POST/PUT/DELETE /api/projects with duplicate name check (case-insensitive → 409), date validation (→ 400), requiredSkills validation (→ 400), and ownership check for Manager edit/delete (→ 403)
- [ ] T014 Extend MockApiInterceptor in src/app/core/interceptors/mock-api.interceptor.ts to handle GET/POST/DELETE /api/project-assignments with role slot validation and PATCH /api/users/:userId/availability for override
- [ ] T015 Create ProjectService in src/app/core/services/project.service.ts with getAll, getById, create, update, delete methods via HttpClient calling /api/projects
- [ ] T016 Create NgRx effects in src/app/core/store/projects/projects.effects.ts wiring ProjectService HTTP calls to store actions for project CRUD and assignment operations
- [ ] T017 Register projects feature store in src/app/features/projects/projects.routes.ts using provideState and provideEffects
- [ ] T018 Create feature route definitions in src/app/features/projects/projects.routes.ts with lazy-loaded routes for ProjectsListComponent, ProjectCreateComponent, ProjectDetailComponent, CandidateMatchComponent, TeamBuilderComponent, and ProjectAlignmentComponent
- [ ] T019 Add lazy-loaded route entry for projects feature in src/app/app.routes.ts with path 'projects' guarded by AuthGuard + RoleGuard(['Manager', 'Admin']) using loadChildren pointing to projects.routes.ts
- [ ] T020 Add lazy-loaded route entry for team/matching in src/app/app.routes.ts with path 'team/matching' guarded by AuthGuard + RoleGuard(['Manager', 'Admin']) loading CandidateMatchComponent

**Checkpoint**: Foundation ready — NgRx store, interceptor endpoints, core service, and routes are in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Create and Manage a Project (Priority: P1) 🎯 MVP

**Goal**: Managers/Admins can create, view, edit, and delete projects with full inline validation. Projects List displays all projects with status badges and filters.

**Independent Test**: Navigate to `/projects/create`, fill form with name, dates, roles, and skills, submit, verify project appears in `/projects` list with correct status badge and skills count.

### Implementation for User Story 1

- [ ] T021 [US1] Implement ProjectCreateComponent in src/app/features/projects/project-create/project-create.component.ts with reactive form including project name, description, status dropdown (Draft/Open/In Progress/Completed), start date picker, deadline picker, required roles (dynamic add/remove of roleTitle + headcount), and required skills (cascading category → subcategory → skill dropdowns with minimum proficiency level selector per skill)
- [ ] T022 [US1] Create template in src/app/features/projects/project-create/project-create.component.html with two-column desktop / single-column mobile form layout, inline validation error messages for all 4 validation rules (name required, date order, skills required, duplicate name), and submit/cancel buttons
- [ ] T023 [US1] Create styles in src/app/features/projects/project-create/project-create.component.scss with responsive form layout using SCSS breakpoint variables (two-column desktop, single-column mobile, sticky submit on mobile)
- [ ] T024 [US1] Implement ProjectsListComponent in src/app/features/projects/projects-list/projects-list.component.ts dispatching loadProjects on init, selecting projects from store, computing team size from assignments, implementing status and date range filters, and conditionally showing Edit/Delete actions via @if based on ownership (createdBy === currentUserId || role === 'Admin')
- [ ] T025 [US1] Create template in src/app/features/projects/projects-list/projects-list.component.html with data table showing Project Name, Status badge (color-coded per design system: Draft=grey, Open=blue, In Progress=blue, Completed=green), Start Date, Deadline, Skills Required count, Team Size, and Actions column with Edit/Delete buttons; include status filter dropdown and date range filter; "Create Project" button at top
- [ ] T026 [US1] Create styles in src/app/features/projects/projects-list/projects-list.component.scss with responsive table (desktop=full table, tablet=horizontal scroll, mobile=card list per row) using SCSS breakpoint variables
- [ ] T027 [US1] Implement ProjectDetailComponent in src/app/features/projects/project-detail/project-detail.component.ts loading project by route param :projectId, displaying all fields in view mode, toggling to edit mode (reusing project-create form logic), dispatching updateProject on save, dispatching deleteProject with confirm dialog, and handling project status change to Completed (triggering availability reset for assigned employees via completeProject action)
- [ ] T028 [US1] Create template and styles for ProjectDetailComponent in src/app/features/projects/project-detail/project-detail.component.html and project-detail.component.scss with view/edit toggle, required skills list with proficiency badges, required roles with headcount, status change dropdown, and responsive layout

**Checkpoint**: User Story 1 complete — Projects CRUD fully functional and testable independently. Managers can create/edit/delete own projects, Admins can manage all projects, Projects List shows with filters and status badges.

---

## Phase 4: User Story 2 — Find Matching Candidates for a Project (Priority: P2)

**Goal**: Given a project with required skills, the system calculates match scores for all employees, ranks them by score with availability tiebreaking, excludes stale/expired skills, and displays filterable results with per-candidate skill breakdown and PDF export.

**Independent Test**: Navigate to `/team/matching`, select a project with defined skills, verify candidates are ranked with correct match scores and the breakdown table shows Exceeds/Meets/Below per skill.

### Implementation for User Story 2

- [ ] T029 [US2] Create CandidateMatchingService in src/app/core/services/candidate-matching.service.ts with pure function calculateMatchScore accepting RequiredSkill array and employee skills, excluding stale skills (lastUpdated > 6 months), returning matchScore, matchedCount, and SkillBreakdownEntry array; implement rankCandidates function sorting by score desc → availability (Available=0, Partially Available=1, Busy=2) → alphabetical name
- [ ] T030 [US2] Add NgRx effect in src/app/core/store/projects/projects.effects.ts for runMatching action that loads employee-skills, users, certifications, and skill-definitions from their respective store slices, calls CandidateMatchingService for each employee against the selected project's requiredSkills, and dispatches matchingSuccess with the ranked CandidateMatchResult array
- [ ] T031 [US2] Add NgRx selectors in src/app/core/store/projects/projects.selectors.ts for selectFilteredMatchResults applying department, availability, and minimumMatchScore filters from the filters state slice
- [ ] T032 [US2] Implement CandidateMatchComponent in src/app/features/projects/candidate-match/candidate-match.component.ts dispatching runMatching on project selection, reading matchResults from store via selectFilteredMatchResults, implementing filter controls for department dropdown, availability dropdown, and minimum match score slider, and triggering PDF export via PdfExportService
- [ ] T033 [US2] Create template in src/app/features/projects/candidate-match/candidate-match.component.html with responsive layout (desktop=filters panel left 280px + candidate card grid right; tablet=filter button + single column; mobile=FAB filter + full-width cards), candidate cards showing name, department, match score percentage badge, availability indicator (green ✅ / amber ⚠️ / red ❌ greyed-out for Busy with aria-disabled), matched skills count, and expandable match breakdown row; "Export as PDF" button; empty state with "No candidates found" message and suggestion text
- [ ] T034 [US2] Create styles in src/app/features/projects/candidate-match/candidate-match.component.scss with responsive grid layout, greyed-out styling for busy candidates, availability indicator colors, and filter panel show/hide per breakpoint using SCSS variables
- [ ] T035 [P] [US2] Implement MatchBreakdownComponent in src/app/features/projects/candidate-match/match-breakdown/match-breakdown.component.ts as standalone presentational component accepting SkillBreakdownEntry array @Input and rendering a table with columns Skill, Required Level, Candidate Level, Status with color-coded status pills (Exceeds=green, Meets=blue, Below=red)
- [ ] T036 [P] [US2] Create template and styles for MatchBreakdownComponent in src/app/features/projects/candidate-match/match-breakdown/match-breakdown.component.html and match-breakdown.component.scss
- [ ] T037 [US2] Create PdfExportService in src/app/core/services/pdf-export.service.ts using jsPDF and jsPDF-AutoTable to generate a PDF report with title "Candidate Matching Report — [ProjectName]", generation date, generating user name, and a table of ranked candidates with columns Rank, Candidate, Department, Match Score, Availability, Skills Met; save file as candidates-[project-name].pdf

**Checkpoint**: User Story 2 complete — Candidate matching calculates scores, ranks results with availability tiebreaking, filters work, breakdown table shows per-skill status, PDF export generates.

---

## Phase 5: User Story 3 — Build a Project Team (Priority: P3)

**Goal**: Managers/Admins view role slots for a project, assign matched candidates to slots, and availability auto-transitions to Busy on assignment and to Available on project completion.

**Independent Test**: Navigate to `/projects/team-builder`, select a project, click "Add to Project" for a candidate in a role slot, verify the employee appears in the project team and their availability changes to Busy.

### Implementation for User Story 3

- [ ] T038 [US3] Create TeamBuilderService in src/app/core/services/team-builder.service.ts with methods to get role slots with filled count for a project (computed from project-assignments), assign employee to a role slot via HttpClient POST /api/project-assignments, remove assignment via HttpClient DELETE, and check if role slot is full (filledCount >= headcount)
- [ ] T039 [US3] Add NgRx effects in src/app/core/store/projects/projects.effects.ts for assignToProject action calling TeamBuilderService.assign, dispatching assignmentSuccess (which updates assignments array and sets employee availability to Busy), and for completeProject action resetting all assigned employees to Available
- [ ] T040 [US3] Implement TeamBuilderComponent in src/app/features/projects/team-builder/team-builder.component.ts selecting a project, loading its role slots with filled/total counts from store, listing available candidates from match results per role, dispatching assignToProject on "Add to Project" click, and showing assigned employees per slot
- [ ] T041 [US3] Create template in src/app/features/projects/team-builder/team-builder.component.html showing project name and status header, role slot cards with roleTitle, headcount, filled count, assigned employee list with remove button, and "Assign" action opening candidate selection; responsive layout (desktop=grid of role slot cards, mobile=stacked full-width cards)
- [ ] T042 [US3] Create styles in src/app/features/projects/team-builder/team-builder.component.scss with role slot card layout, filled/unfilled visual distinction, and responsive breakpoints
- [ ] T043 [P] [US3] Implement RoleSlotCardComponent in src/app/features/projects/team-builder/role-slot-card/role-slot-card.component.ts as standalone presentational component accepting roleTitle, headcount, filledCount, and assignedEmployees @Input, emitting assign and remove @Output events, showing filled/total badge and assigned employee names with avatars
- [ ] T044 [P] [US3] Create template and styles for RoleSlotCardComponent in src/app/features/projects/team-builder/role-slot-card/role-slot-card.component.html and role-slot-card.component.scss

**Checkpoint**: User Story 3 complete — Team building works end-to-end. Employees assigned to roles, availability transitions automatically.

---

## Phase 6: User Story 4 — Detect Skill Gaps and Suggest Learning Paths (Priority: P4)

**Goal**: When no candidate meets the minimum proficiency for a required skill, the Team Builder shows a Skill Gap panel with gap percentage and learning path suggestions for the closest employees.

**Independent Test**: Create a project requiring a skill at Expert level when no employee has that skill, open Team Builder, verify the Skill Gap panel appears showing required level, highest available level, gap percentage, and nearest employees with training suggestion.

### Implementation for User Story 4

- [ ] T045 [US4] Create SkillGapService in src/app/core/services/skill-gap.service.ts with detectSkillGaps function accepting project requiredSkills and all employee skill profiles, excluding stale skills, computing gap percentage as ((requiredLevel - highestAvailableLevel) / requiredLevel) × 100, and identifying up to 3 nearest employees per gap skill sorted by closest-to-requirement
- [ ] T046 [US4] Add NgRx effect in src/app/core/store/projects/projects.effects.ts for detectSkillGaps action calling SkillGapService, dispatching skillGapsDetected with the SkillGapResult array, triggered alongside or after runMatching
- [ ] T047 [US4] Add NgRx selector in src/app/core/store/projects/projects.selectors.ts for selectSkillGaps returning the skill gap results for the selected project
- [ ] T048 [US4] Implement SkillGapPanelComponent in src/app/features/projects/team-builder/skill-gap-panel/skill-gap-panel.component.ts as standalone presentational component accepting SkillGapResult array @Input and rendering a panel listing each gap with skill name, required level badge, highest available level badge, gap percentage bar, and nearest employees with name + current level + "Recommend Training" text suggestion
- [ ] T049 [US4] Create template and styles for SkillGapPanelComponent in src/app/features/projects/team-builder/skill-gap-panel/skill-gap-panel.component.html and skill-gap-panel.component.scss with amber warning styling, gap percentage visualization, and responsive layout
- [ ] T050 [US4] Integrate SkillGapPanelComponent into TeamBuilderComponent template in src/app/features/projects/team-builder/team-builder.component.html rendering the panel below role slots when skillGaps array is non-empty using @if

**Checkpoint**: User Story 4 complete — Skill gaps are detected and displayed with learning path suggestions in the Team Builder.

---

## Phase 7: User Story 5 — View and Manage Employee Availability (Priority: P5)

**Goal**: Managers view which employees are assigned to which projects in a Project Alignment View, and can override availability status with a logged reason.

**Independent Test**: Assign an employee to a project via Team Builder, navigate to Project Alignment View, verify the employee shows as Busy with the correct project name and assignment date.

### Implementation for User Story 5

- [ ] T051 [US5] Create AvailabilityService in src/app/core/services/availability.service.ts with methods to derive availability status from project-assignments (assigned to active project → Busy, no assignment → Available), override availability via HttpClient PATCH /api/users/:userId/availability with reason, and self-set Partially Available
- [ ] T052 [US5] Add NgRx effect in src/app/core/store/projects/projects.effects.ts for overrideAvailability action calling AvailabilityService.override, dispatching availabilityOverridden with updated status
- [ ] T053 [US5] Add NgRx selector in src/app/core/store/projects/projects.selectors.ts for selectProjectAlignmentEntries joining users, project-assignments, and projects data to produce ProjectAlignmentEntry array with employee name, role, current project name, availability status, and assignment date
- [ ] T054 [US5] Implement ProjectAlignmentComponent in src/app/features/projects/project-alignment/project-alignment.component.ts selecting alignment entries from store, implementing override action (opening a dialog for reason input), dispatching overrideAvailability, showing availability status with color-coded indicators (Available=green, Partially Available=amber, Busy=red) plus icon + text (not color alone)
- [ ] T055 [US5] Create template in src/app/features/projects/project-alignment/project-alignment.component.html with data table showing Employee name, Role, Current Project, Status badge, Since date, and Override action button; responsive layout (desktop=full table, tablet=condensed, mobile=card list)
- [ ] T056 [US5] Create styles in src/app/features/projects/project-alignment/project-alignment.component.scss with availability status colors using design system tokens, responsive table/card toggle, and override dialog styling

**Checkpoint**: User Story 5 complete — Alignment view shows all employee-to-project assignments, managers can override availability with logged reason.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar integration, accessibility, loading states, and final validation

- [ ] T057 [P] Update sidebar navigation in src/app/app.component.ts (or shared sidebar component) to include "Projects" and "Team Builder" menu items visible only for Manager + Admin roles via @if role check (items MUST NOT exist in DOM for Employee role)
- [ ] T058 [P] Add loading spinner/skeleton states to ProjectsListComponent, CandidateMatchComponent, and TeamBuilderComponent templates for initial data fetch using app-loading-spinner or app-skeleton-loader shared components
- [ ] T059 [P] Add aria-labels to all action buttons across all feature components (Create Project, Edit, Delete, Add to Project, Assign, Override, Export as PDF, filter controls) and ensure aria-disabled on greyed-out busy candidate cards
- [ ] T060 [P] Add toast notifications for success actions (project created, project deleted, employee assigned, availability overridden) and error actions (duplicate name 409, forbidden 403, not found 404) using app-toast shared component
- [ ] T061 [P] Add confirm dialog before project delete action in ProjectsListComponent and ProjectDetailComponent using app-confirm-dialog shared component
- [ ] T062 Run quickstart.md validation — verify all 5 screens render, project CRUD works, matching calculates correct scores, team builder assigns to roles, skill gaps display, alignment view shows correct data, PDF exports, and filters work at all breakpoints (375px, 768px, 1280px, 1440px)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — Requires project data from US1 to exist (mock data or created via UI)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — Uses match results from US2 but can fallback to full employee list
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) — Integrated into Team Builder (US3) template
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) — Reads assignment data from US3
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories. Creates project records needed by US2–US5.
- **User Story 2 (P2)**: Can start after Foundational — Reads project requiredSkills (mock data available from T007). Independently testable.
- **User Story 3 (P3)**: Can start after Foundational — Uses match results from US2 for candidate selection but can show all employees as fallback. Independently testable.
- **User Story 4 (P4)**: Can start after Foundational — Integrated into Team Builder template (US3). Independently testable with mock project data.
- **User Story 5 (P5)**: Can start after Foundational — Reads assignments from project-assignments.json. Independently testable with mock data.

### Within Each User Story

- Models/interfaces created before services
- Services created before NgRx effects
- NgRx effects created before components
- Components created before template/styles
- Presentational sub-components (marked [P]) can be created in parallel with the parent component

### Parallel Opportunities

- **Phase 1**: T002–T008 can all run in parallel (different files)
- **Phase 2**: T009–T012 should be sequential (NgRx state → actions → reducer → selectors); T013–T014 can run in parallel with each other; T015 after T013/T014; T016 after T015; T017–T020 after T016
- **Phase 3 (US1)**: T021–T023 (create form) in parallel with T024–T026 (list); T027–T028 after both
- **Phase 4 (US2)**: T029 before T030–T031; T032–T034 after T031; T035–T036 in parallel with T032–T034; T037 in parallel with T032
- **Phase 5 (US3)**: T038 before T039–T040; T043–T044 in parallel with T040–T042
- **Phase 6 (US4)**: T045 before T046–T047; T048–T049 in parallel; T050 after T048
- **Phase 7 (US5)**: T051 before T052–T053; T054–T056 after T053
- **Phase 8**: T057–T061 can all run in parallel (different files)

---

## Parallel Example: User Story 1

```bash
# Batch 1 — Create form and List in parallel:
Task T021: "Implement ProjectCreateComponent in src/app/features/projects/project-create/project-create.component.ts"
Task T024: "Implement ProjectsListComponent in src/app/features/projects/projects-list/projects-list.component.ts"

# Batch 2 — Templates in parallel:
Task T022: "Create template for project-create.component.html"
Task T025: "Create template for projects-list.component.html"

# Batch 3 — Styles in parallel:
Task T023: "Create styles for project-create.component.scss"
Task T026: "Create styles for projects-list.component.scss"

# Batch 4 — Detail (depends on form patterns from Batch 1):
Task T027: "Implement ProjectDetailComponent"
Task T028: "Create template and styles for ProjectDetailComponent"
```

---

## Parallel Example: User Story 2

```bash
# Batch 1 — Core matching logic:
Task T029: "Create CandidateMatchingService"

# Batch 2 — NgRx + PDF in parallel:
Task T030: "Add NgRx effect for runMatching"
Task T037: "Create PdfExportService"

# Batch 3 — Selectors + sub-components in parallel:
Task T031: "Add NgRx selectors for filtered match results"
Task T035: "Implement MatchBreakdownComponent"
Task T036: "Create template/styles for MatchBreakdownComponent"

# Batch 4 — Main component:
Task T032: "Implement CandidateMatchComponent"
Task T033: "Create template for CandidateMatchComponent"
Task T034: "Create styles for CandidateMatchComponent"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Create and Manage a Project
4. **STOP and VALIDATE**: Navigate to /projects/create, create a project, verify it appears in /projects list with correct status badge
5. Deploy/demo if ready — project registry is independently useful

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test project CRUD → Deploy/Demo (MVP!)
3. Add User Story 2 → Test candidate matching → Deploy/Demo
4. Add User Story 3 → Test team builder assignments → Deploy/Demo
5. Add User Story 4 → Test skill gap detection → Deploy/Demo
6. Add User Story 5 → Test availability management → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (project CRUD)
   - Developer B: User Story 2 (candidate matching service + PDF)
   - Developer C: User Story 3 + 4 (team builder + skill gap)
3. User Story 5 after US3 assignments exist
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies — safe to run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable via mock data
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Projects.json mock data (T007) provides testable project records before US1 UI is built
- The candidate matching service (T029) is a pure function — easy to unit test in isolation
- All availability state transitions are handled via NgRx actions — deterministic and testable
