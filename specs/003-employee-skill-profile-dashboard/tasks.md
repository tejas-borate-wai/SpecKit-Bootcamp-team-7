# Tasks: Employee Skill Profile and Dashboard

**Input**: Design documents from `/specs/003-employee-skill-profile-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/mock-api-contract.md, quickstart.md

**Tests**: Unit tests included in Polish phase per constitution principle V (Test Coverage mandate).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Angular 17 SPA)
- Shared components: `src/app/shared/components/`
- Feature components: `src/app/features/`
- Core services/store: `src/app/core/`
- Mock data: `src/assets/mock-data/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install additional dependencies and create mock data files for this feature

- [X] T001 Install @swimlane/ngx-charts charting library dependency via `npm install @swimlane/ngx-charts`
- [X] T002 [P] Create employee-skills.json mock data with 6 employee records (mix of Approved, Pending, Draft, Stale statuses; 1 stale skill with lastUpdated 8+ months ago) in src/assets/mock-data/employee-skills.json
- [X] T003 [P] Create skill-test-attempts.json mock data with 25+ attempts across multiple users and skills for progress chart demos in src/assets/mock-data/skill-test-attempts.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, utilities, services, NgRx store, interceptor extensions, and shared components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Models & Interfaces

- [X] T004 [P] Create EmployeeSkill, EmployeeSkillRecord, SkillStatus, ProficiencyLevel interfaces per data-model.md in src/app/shared/models/employee-skill.model.ts
- [X] T005 [P] Create SkillTestAttempt interface per data-model.md in src/app/shared/models/skill-test-attempt.model.ts
- [X] T006 [P] Create AchievementBadge, AchievementType types per data-model.md in src/app/shared/models/achievement.model.ts
- [X] T007 [P] Create dashboard widget data interfaces (EmployeeDashboardData, ManagerDashboardData, AdminDashboardData, and supporting types) per data-model.md in src/app/shared/models/dashboard.model.ts

### Utility Functions

- [X] T008 [P] Create skill utility functions: ratingToPercentage(), percentageToLevel(), computeConfidence(), isStale() per data-model.md in src/app/shared/utils/skill-utils.ts

### Pipes

- [X] T009 [P] Create ProficiencyLabelPipe mapping percentage to Beginner/Intermediate/Advanced/Expert label in src/app/shared/pipes/proficiency-label.pipe.ts
- [X] T010 [P] Create StaleCheckPipe checking if ISO date is older than 6 months in src/app/shared/pipes/stale-check.pipe.ts

### Mock API Interceptor

- [X] T011 Extend MockApiInterceptor with employee-skills CRUD endpoints (GET/POST/PUT/DELETE /api/employee-skills/:userId), skill-test-attempts endpoints (GET /api/skill-test-attempts/:userId and /api/skill-test-attempts/:userId/:skillId), certifications query (GET /api/certifications?userId=), and project-assignments query (GET /api/project-assignments/:userId) per contracts/mock-api-contract.md with RBAC enforcement in src/app/core/interceptors/mock-api.interceptor.ts

### Core Services

- [X] T012 [P] Create SkillService with HttpClient methods: getUserSkills(), addSkill(), updateSkillRating(), deleteSkill() in src/app/core/services/skill.service.ts
- [X] T013 [P] Create SkillLibraryService with HttpClient methods: getCategories(), getDefinitions(), getDefinitionsBySubCategory() in src/app/core/services/skill-library.service.ts
- [X] T014 [P] Create AchievementService with computeAchievements() implementing First Assessment, Reached Advanced, Improved by 20% badge conditions per research.md Decision 4 in src/app/core/services/achievement.service.ts
- [X] T015 [P] Create DashboardService with methods for role-specific widget data aggregation (employee, manager, admin) in src/app/core/services/dashboard.service.ts

### NgRx Skills Store

- [X] T016 Create NgRx skills actions: loadMySkills, loadMySkillsSuccess/Failure, loadSkillLibrary, loadSkillLibrarySuccess, addSkill, addSkillSuccess/Failure, updateSkillRating, updateSkillRatingSuccess/Failure, deleteSkill, deleteSkillSuccess/Failure, loadTestAttempts, loadTestAttemptsSuccess, loadAllEmployeeSkills, loadAllEmployeeSkillsSuccess in src/app/core/store/skills/skills.actions.ts
- [X] T017 Create NgRx skills reducer with SkillsState interface (mySkills, allEmployeeSkills, skillCategories, skillDefinitions, testAttempts, loading, error) per data-model.md in src/app/core/store/skills/skills.reducer.ts
- [X] T018 Create NgRx skills selectors: selectMySkills, selectMyActiveSkills, selectMyStaleSkills, selectProfileCompletion, selectSkillById, selectSkillProgress, selectConfidenceLevel, selectDashboardWidgets per research.md Decision 2 in src/app/core/store/skills/skills.selectors.ts
- [X] T019 Create NgRx skills effects wiring all actions to HttpClient service calls (SkillService, SkillLibraryService) with error handling in src/app/core/store/skills/skills.effects.ts

### Shared Presentational Components

- [X] T020 [P] Create RatingBadgeComponent displaying proficiency level pill with color token (Grey=Beginner, Blue=Intermediate, Purple=Advanced, Gold=Expert) in src/app/shared/components/rating-badge/rating-badge.component.ts
- [X] T021 [P] Create StatCardComponent displaying metric title, value, optional trend indicator, and optional icon in src/app/shared/components/stat-card/stat-card.component.ts
- [X] T022 [P] Create ConfidenceIndicatorComponent displaying 🟢 High / 🟡 Medium / 🔴 Low based on ConfidenceLevel input in src/app/shared/components/confidence-indicator/confidence-indicator.component.ts
- [X] T023 [P] Create AchievementBadgeComponent displaying badge icon and label for achievement types in src/app/shared/components/achievement-badge/achievement-badge.component.ts
- [X] T024 [P] Create ProgressChartComponent wrapping ngx-charts-line-chart with responsive sizing via BreakpointObserver (desktop full-size, mobile 250px max height) in src/app/shared/components/progress-chart/progress-chart.component.ts
- [X] T025 [P] Create SkillCardComponent displaying skill name, level badge, rating percentage, status pill, and stale amber indicator in src/app/shared/components/skill-card/skill-card.component.ts

**Checkpoint**: Foundation ready — all models, services, store, interceptor, and shared components are available. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — My Skills List View (Priority: P1) 🎯 MVP

**Goal**: Employees can view all their skills in a responsive table with actions menu, stale indicators, and RBAC-controlled visibility.

**Independent Test**: Log in as an employee, navigate to /my-skills, verify the table displays all skills with correct columns, stale badges, and three-dot actions menu. Verify Admin sees "Override Rating", non-admins do not.

- [X] T026 [US1] Create MySkillsListComponent with responsive layout using BreakpointObserver: full mat-table on desktop (Skill, Category, Level Badge, Rating %, Status, Last Updated, Actions), condensed table on tablet (Category + Last Updated hidden), card list on mobile per research.md Decision 7 in src/app/features/my-skills/my-skills-list/my-skills-list.component.ts
- [X] T027 [US1] Implement three-dot mat-menu actions (View Detail, Edit, Delete) and "Add Skill" button; enforce RBAC visibility with @if removing "Override Rating" button from DOM for non-Admin roles per FR-004 in src/app/features/my-skills/my-skills-list/my-skills-list.component.html
- [X] T028 [US1] Style stale skill rows with amber warning badge and amber border (--color-stale-border); add empty state with "Add your first skill" CTA button per FR-005 in src/app/features/my-skills/my-skills-list/my-skills-list.component.scss
- [X] T029 [US1] Create my-skills.routes.ts defining child routes for list, add, detail, and edit with lazy loading in src/app/features/my-skills/my-skills.routes.ts
- [X] T030 [US1] Register /my-skills lazy route with loadChildren pointing to my-skills.routes.ts in src/app/app.routes.ts

**Checkpoint**: Employees can view their skill list across all breakpoints. Skills table is fully navigable and role-aware.

---

## Phase 4: User Story 2 — Add Skill to Profile (Priority: P1)

**Goal**: Employees can add a new skill from the global library via cascading dropdowns with validation.

**Independent Test**: Navigate to /my-skills/add, select Category → Subcategory → Skill via dropdowns, set a self-rating, save, and verify the skill appears in the My Skills list with status "Draft".

- [X] T031 [US2] Create AddSkillComponent with reactive form: cascading mat-select dropdowns (Category → Subcategory → Skill populated from SkillLibraryService), self-rating radio group (1–4 mapped to Beginner–Expert), and Save button dispatching addSkill NgRx action per FR-006, FR-007, FR-009 in src/app/features/my-skills/add-skill/add-skill.component.ts
- [X] T032 [US2] Implement duplicate skill validation checking existing profile skills (error: "This skill is already in your profile." per FR-008) and required field inline validation ("This field is required." per FR-010) in src/app/features/my-skills/add-skill/add-skill.component.html

**Checkpoint**: Employees can add skills with full validation. Duplicate and empty-field errors display correctly.

---

## Phase 5: User Story 3 — Skill Detail View (Priority: P1)

**Goal**: Employees can view comprehensive skill details including all rating sources, confidence indicator, progress chart, and certification badge.

**Independent Test**: Click "View Detail" on a skill row, verify all 4 rating sources display (nulls as "—"), confidence indicator color matches source count, line chart plots historical scores, and certified badge appears for skills with valid certifications.

- [X] T033 [US3] Create SkillDetailComponent loading skill data and test attempts from NgRx store, displaying all rating sources (Self, Manager, Peer, System, Final with nulls shown as "—"), proficiency level badge, and current status per FR-016, FR-018, FR-022 in src/app/features/my-skills/skill-detail/skill-detail.component.ts
- [X] T034 [US3] Integrate ConfidenceIndicatorComponent (🟢🟡🔴 based on non-null rating source count per FR-017) and ProgressChartComponent (line chart of score trend with best/latest score comparison per FR-020, FR-021) in src/app/features/my-skills/skill-detail/skill-detail.component.html
- [X] T035 [US3] Display "Certified" badge by checking certifications data for the skill per FR-019 in src/app/features/my-skills/skill-detail/skill-detail.component.html

**Checkpoint**: Skill detail screen shows all ratings, confidence, chart, and certification status. All data sourced from NgRx store.

---

## Phase 6: User Story 4 — Role-Specific Dashboard (Priority: P1)

**Goal**: Each role (Employee, Manager, Admin) sees a tailored dashboard with relevant widgets on the /dashboard route.

**Independent Test**: Log in as each role and verify the correct set of dashboard widgets renders. Verify stat cards show 4/row on desktop, 2/row on tablet, 1/row stacked on mobile.

- [X] T036 [US4] Create DashboardComponent using @switch on user role from NgRx session store to render EmployeeDashboard, ManagerDashboard, or AdminDashboard per research.md Decision 5 in src/app/features/dashboard/dashboard.component.ts
- [X] T037 [P] [US4] Create EmployeeDashboardComponent with 7 widgets: skills list with rating+level+badge, profile completion percentage, skill gap cards with "Start Assessment" CTA, certification alerts (valid/expiring-soon/expired), skill progress chart, recent activity feed (last 5 actions), and achievement badges per FR-032 in src/app/features/dashboard/employee-dashboard/employee-dashboard.component.ts
- [X] T038 [P] [US4] Create ManagerDashboardComponent with 7 widgets: pending skill approvals count, team skill strength summary chart, employees with incomplete profiles, stale skills needing team attention, project skill match recommendations, team availability overview, and recent team activity feed per FR-033 in src/app/features/dashboard/manager-dashboard/manager-dashboard.component.ts
- [X] T039 [P] [US4] Create AdminDashboardComponent with 7 widgets: org-wide skill health score, total skills tracked, skill gap summary by department, org skill heatmap top-level view, certification compliance rate, most common skill gaps, and user count by role per FR-034 in src/app/features/dashboard/admin-dashboard/admin-dashboard.component.ts
- [X] T040 [US4] Create dashboard.routes.ts and register /dashboard lazy route in app.routes.ts with responsive stat card grid (4/row desktop, 2/row tablet, 1/row mobile per FR-035) in src/app/features/dashboard/dashboard.routes.ts

**Checkpoint**: All three role-specific dashboards render the complete widget set. Stat cards adapt to breakpoints.

---

## Phase 7: User Story 5 — Edit Skill Self-Rating (Priority: P2)

**Goal**: Employees can update their self-rating for an existing skill and clear stale status.

**Independent Test**: Navigate to /my-skills/:skillId/edit, change the self-rating, save, and verify the updated rating and refreshed lastUpdated timestamp in the skills list. Verify a stale skill clears the amber indicators after editing.

- [X] T041 [US5] Create EditSkillComponent with reactive form pre-populated with current selfRating, dispatching updateSkillRating NgRx action on save per FR-011 in src/app/features/my-skills/edit-skill/edit-skill.component.ts
- [X] T042 [US5] Implement lastUpdated timestamp refresh and stale status clearing (Stale → Approved) on successful rating update in interceptor and reducer per FR-012, FR-027 in src/app/core/store/skills/skills.reducer.ts

**Checkpoint**: Self-rating updates persist in-memory. Stale skills are restored to Approved status on edit.

---

## Phase 8: User Story 6 — Delete Skill from Profile (Priority: P2)

**Goal**: Employees can soft-delete skills from their active profile while retaining history, with project-link constraint enforcement.

**Independent Test**: Delete a skill not linked to a project — verify it disappears from the active list. Attempt to delete a skill linked to an active project — verify the error "This skill is linked to an active project and cannot be deleted." appears.

- [X] T043 [US6] Implement soft-delete confirmation dialog and dispatch deleteSkill NgRx action from MySkillsListComponent three-dot menu per FR-013, FR-014 in src/app/features/my-skills/my-skills-list/my-skills-list.component.ts
- [X] T044 [US6] Handle 409 error response from interceptor (project link constraint) displaying error toast "This skill is linked to an active project and cannot be deleted." per FR-015 in src/app/core/store/skills/skills.effects.ts

**Checkpoint**: Soft-delete works with history retention. Project-linked skills are protected with clear error messaging.

---

## Phase 9: User Story 7 — Skill Progress Tracking and Achievements (Priority: P2)

**Goal**: Employees earn achievement badges for skill milestones and see them on their skill detail and dashboard.

**Independent Test**: View a skill with multiple test attempts — verify "First Assessment" badge appears. View a skill with score ≥ 66% — verify "Reached Advanced" badge. View a skill with 20%+ improvement — verify "Improved by 20%" badge. Check the Employee Dashboard shows all earned badges.

- [X] T045 [US7] Wire AchievementService.computeAchievements() into SkillDetailComponent to display per-skill achievement badges section per FR-025 in src/app/features/my-skills/skill-detail/skill-detail.component.ts
- [X] T046 [US7] Integrate achievement badges earned widget on EmployeeDashboard by aggregating badges across all skills per FR-032 in src/app/features/dashboard/employee-dashboard/employee-dashboard.component.ts

**Checkpoint**: Achievement badges render correctly based on test history. Both skill detail and employee dashboard show earned badges.

---

## Phase 10: User Story 8 — Skill Expiry and Stale Detection (Priority: P2)

**Goal**: Skills not updated for 6+ months are automatically flagged as "Stale" with visual indicators and excluded from matching.

**Independent Test**: Verify a skill with lastUpdated date older than 6 months shows amber warning badge and amber border in the skills list. Verify the Manager Dashboard displays a stale skills count.

- [X] T047 [US8] Wire selectMyStaleSkills selector into MySkillsListComponent to apply amber styling to stale rows and display stale count badge per FR-026 in src/app/features/my-skills/my-skills-list/my-skills-list.component.ts
- [X] T048 [US8] Wire stale skills count and "stale skills needing team attention" widget data into ManagerDashboard per FR-028 in src/app/features/dashboard/manager-dashboard/manager-dashboard.component.ts

**Checkpoint**: Stale skills are visually flagged in the skills list. Manager Dashboard shows stale alert data.

---

## Phase 11: User Story 9 — Profile Completion Tracking (Priority: P3)

**Goal**: Employees see their profile completion percentage and unassessed skills highlighted with "Take Assessment" CTA.

**Independent Test**: Verify profile completion shows (assessed / total) × 100 on the Employee Dashboard. Verify unassessed skills render as gap cards with "Take Assessment" CTA.

- [X] T049 [US9] Wire selectProfileCompletion selector into EmployeeDashboard profile completion stat card and verify correct percentage calculation per FR-029 in src/app/features/dashboard/employee-dashboard/employee-dashboard.component.ts
- [X] T050 [US9] Render unassessed skill gap cards with "Take Assessment" CTA using skill library definitions minus user assessed skills per FR-030 in src/app/features/dashboard/employee-dashboard/employee-dashboard.component.html

**Checkpoint**: Profile completion percentage is accurate. Gap cards display with assessment CTAs for all unassessed skills.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Unit tests (constitution mandate), validation, and cleanup across all user stories

- [X] T051 [P] Add unit tests for skill utility functions: ratingToPercentage, percentageToLevel, computeConfidence, isStale in src/app/shared/utils/skill-utils.spec.ts
- [X] T052 [P] Add unit tests for AchievementService.computeAchievements() badge conditions in src/app/core/services/achievement.service.spec.ts
- [X] T053 [P] Add unit tests for NgRx skills selectors (selectMyActiveSkills, selectMyStaleSkills, selectProfileCompletion, selectConfidenceLevel) in src/app/core/store/skills/skills.selectors.spec.ts
- [X] T054 [P] Add unit tests for skills reducer state transitions (add, update, delete, load success/failure) in src/app/core/store/skills/skills.reducer.spec.ts
- [X] T055 Run quickstart.md verification checklist, ensure TypeScript strict compliance, no `any` types, and SCSS-only styles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Stories (Phase 3–11)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3, US4) are the MVP core — implement first
  - P2 stories (US5, US6, US7, US8) extend and refine the MVP
  - P3 story (US9) adds final polish
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 — My Skills List (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 — Add Skill (P1)**: Can start after Foundational — no dependencies on other stories
- **US3 — Skill Detail (P1)**: Can start after Foundational — no dependencies on other stories (navigated from US1 but can be developed independently)
- **US4 — Dashboard (P1)**: Can start after Foundational — no dependencies on other stories
- **US5 — Edit Skill (P2)**: Can start after Foundational — integrates with US1 list but independently testable
- **US6 — Delete Skill (P2)**: Depends on US1 (delete triggered from list component) — can start after US1 is complete
- **US7 — Achievements (P2)**: Depends on US3 (badges displayed in skill detail) — can start after US3 is complete
- **US8 — Stale Detection (P2)**: Depends on US1 (stale styling in list) — can start after US1 is complete
- **US9 — Profile Completion (P3)**: Depends on US4 (completion widget on dashboard) — can start after US4 is complete

### Within Each User Story

- Models/services before feature components (handled by Foundational phase)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2**: All tasks marked [P] can run in parallel (T004–T010, T012–T015, T020–T025)
- **Phase 3–6**: All four P1 stories (US1, US2, US3, US4) can start in parallel after Foundational
- **Phase 6**: Dashboard sub-components T037, T038, T039 can run in parallel (different files)
- **Phase 7–10**: US5 and US7 can run in parallel; US6 and US8 can run in parallel
- **Phase 12**: All test file tasks (T051–T054) can run in parallel

---

## Parallel Example: P1 User Stories (After Foundational)

```bash
# All four P1 stories can start simultaneously after Phase 2:
Developer A: US1 — My Skills List (T026–T030)
Developer B: US2 — Add Skill (T031–T032)
Developer C: US3 — Skill Detail (T033–T035)
Developer D: US4 — Dashboards (T036–T040)
```

## Parallel Example: Foundational Shared Components

```bash
# All shared components can be built in parallel:
T020: RatingBadgeComponent
T021: StatCardComponent
T022: ConfidenceIndicatorComponent
T023: AchievementBadgeComponent
T024: ProgressChartComponent
T025: SkillCardComponent
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (install deps, create mock data)
2. Complete Phase 2: Foundational (models, services, store, interceptor, shared components)
3. Complete Phase 3: US1 — My Skills List
4. **STOP and VALIDATE**: Verify skill list renders with all breakpoints and RBAC
5. Complete Phase 4: US2 — Add Skill
6. Complete Phase 5: US3 — Skill Detail
7. Complete Phase 6: US4 — Role-Specific Dashboards
8. **STOP and VALIDATE**: Full MVP with list, add, detail, and dashboards working

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (My Skills List) → Test → **MVP Start: Skills are visible**
3. US2 (Add Skill) → Test → **Employees can build profiles**
4. US3 (Skill Detail) → Test → **Full skill visibility**
5. US4 (Dashboards) → Test → **All roles have landing pages**
6. US5 (Edit) + US6 (Delete) → Test → **Full CRUD complete**
7. US7 (Achievements) + US8 (Stale) → Test → **Gamification + data health**
8. US9 (Profile Completion) → Test → **Engagement tracking**
9. Polish → Tests + Validation → **Feature complete**

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (My Skills List) → then US6 (Delete)
   - Developer B: US2 (Add Skill) → then US5 (Edit)
   - Developer C: US3 (Skill Detail) → then US7 (Achievements)
   - Developer D: US4 (Dashboards) → then US8 (Stale) → then US9 (Completion)
3. All developers: Polish phase tests

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable after Foundational
- All data operations are in-memory; data resets on page refresh
- Phase 1 (Auth) and Phase 2 (Skill Framework) must be implemented prior to this feature
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
