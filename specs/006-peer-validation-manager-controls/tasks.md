# Tasks: Peer Validation & Manager/Admin Controls

**Input**: Design documents from `/specs/006-peer-validation-manager-controls/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/mock-api-contract.md, quickstart.md

**Tests**: Included — unit tests are required per the project constitution (Section 20) and plan.md test coverage gate.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Angular 17 SPA)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: TypeScript models, interfaces, and shared utilities required by all user stories

- [ ] T001 [P] Create SkillSubmission and SubmissionStatus interfaces in src/app/shared/models/skill-submission.model.ts
- [ ] T002 [P] Create PeerValidationRequest, PeerValidationStatus, and PeerResponse interfaces in src/app/shared/models/peer-validation.model.ts
- [ ] T003 [P] Create ManagerAssessment interface in src/app/shared/models/manager-assessment.model.ts
- [ ] T004 [P] Create AdminOverride interface in src/app/shared/models/admin-override.model.ts
- [ ] T005 [P] Create RatingInput, RatingResult, ConfidenceLevel, and ProficiencyLevel types in src/app/shared/models/rating-calculation.model.ts
- [ ] T006 [P] Create TeamMember projected interface in src/app/shared/models/team-member.model.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services, NgRx state, interceptor extensions, and shared components that MUST be complete before ANY user story screen can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Implement calculateFinalRating pure function with proportional weight redistribution in src/app/core/services/rating-calculation.service.ts — accepts RatingInput, returns RatingResult with finalRating, sourceCount, confidence, effectiveWeights, and level
- [ ] T008 Write unit tests for rating calculation: all 4 sources present (Self=3,Manager=4,Peer=3,System=3.5→3.475), no Peer (weight redistribution to Self=0.235,Manager=0.353,System=0.412), Self+Manager only (0.40/0.60), Self only (weight=1.0), all null (Final=0), confidence derivation, proficiency level boundary mapping in src/app/core/services/rating-calculation.service.spec.ts
- [ ] T009 Create TeamService with HttpClient calls for GET /api/team/employees, GET /api/team/employees/:userId, GET /api/team/validation-queue, GET /api/team/validation-queue/:submissionId, POST approve, POST reject, POST override in src/app/core/services/team.service.ts
- [ ] T010 Create PeerValidationService with HttpClient calls for POST /api/peer-validation/request, GET /api/peer-validation/eligible-peers/:skillId, POST /api/peer-validation/:requestId/respond in src/app/core/services/peer-validation.service.ts
- [ ] T011 Extend MockApiInterceptor with 10 new URL patterns for team skills, validation queue CRUD, peer validation endpoints (GET/POST /api/team/*, /api/peer-validation/*) with in-memory data operations and department-scoped filtering in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T012 Add in-memory peer validation seed data (2–3 pre-populated PeerValidationRequests with responses) to MockApiInterceptor for demo purposes in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T013 Create NgRx TeamState interface with employees, selectedEmployee, validationQueue, selectedSubmission, peerValidations, loading, and error fields in src/app/core/store/team/team.state.ts
- [ ] T014 Create NgRx team actions: loadEmployees, loadEmployeesSuccess/Failure, loadValidationQueue, loadValidationQueueSuccess/Failure, loadSubmissionDetail, approveSubmission, rejectSubmission, overrideRating, createPeerRequest, submitPeerResponse, and their success/failure variants in src/app/core/store/team/team.actions.ts
- [ ] T015 Create NgRx team reducer handling all team actions with proper state transitions (approve→Approved+finalRating, reject→Rejected+reason, override→updated rating) in src/app/core/store/team/team.reducer.ts
- [ ] T016 Create NgRx team effects wiring actions to TeamService and PeerValidationService HTTP calls, dispatching success/failure actions, and triggering notification creation on approve/reject in src/app/core/store/team/team.effects.ts
- [ ] T017 Create NgRx team selectors: selectTeamEmployees (role-scoped: Manager=own department, Admin=all), selectValidationQueue (role-scoped), selectSelectedSubmission, selectEligiblePeers(requesterId, skillId) factory selector, selectPeerValidationWithExpiry (7-day date-comparison for expired status) in src/app/core/store/team/team.selectors.ts
- [ ] T018 Register team NgRx feature slice in the application store configuration in src/app/app.config.ts
- [ ] T019 Write unit tests for team selectors: Manager sees own department only, Admin sees all, eligible peers filtered by department+skillId, peer validation expiry detection (>7 days + <2 responses → expired) in src/app/core/store/team/team.selectors.spec.ts
- [ ] T020 Write unit tests for team reducer: approve updates status+managerRating+finalRating, reject updates status+rejectionReason, override updates rating+preserves previous in src/app/core/store/team/team.reducer.spec.ts
- [ ] T021 [P] Create ConfidenceIndicatorComponent standalone component accepting sourceCount input, rendering 🟢 High (3+), 🟡 Medium (2), 🔴 Low (1) with aria-labels in src/app/shared/components/confidence-indicator/confidence-indicator.component.ts
- [ ] T022 [P] Write unit tests for ConfidenceIndicatorComponent: sourceCount=4→High, 3→High, 2→Medium, 1→Low, verify aria-labels present in src/app/shared/components/confidence-indicator/confidence-indicator.component.spec.ts
- [ ] T023 Extend notification service to support approval, rejection, and peer validation notification types in src/app/core/services/notification.service.ts

**Checkpoint**: Foundation ready — all models, services, NgRx state, interceptor, and shared components are in place. User story screens can now be implemented.

---

## Phase 3: User Story 1 — Manager Views Team Skills Overview (Priority: P1) 🎯 MVP

**Goal**: Manager navigates to /team/skills and sees a sortable table of all employees in their team with summary metrics (name, department, skills count, avg rating, profile completion %, actions). Admin sees all employees.

**Independent Test**: Log in as Manager → navigate to /team/skills → verify table shows only own-department employees with correct columns. Log in as Admin → verify all employees visible. Log in as Employee → verify redirect to /unauthorized.

### Implementation for User Story 1

- [ ] T024 [US1] Create TeamSkillsOverviewComponent standalone component with sortable/filterable data table displaying Employee Name, Department, Skills Count, Avg Rating, Profile Completion %, and Actions columns in src/app/features/team/team-skills-overview/team-skills-overview.component.ts
- [ ] T025 [US1] Create TeamSkillsOverviewComponent template with Angular Material/PrimeNG table, "View Profile" link navigating to /team/skills/:employeeId, "Send Validation Request" button, loading spinner, and empty state in src/app/features/team/team-skills-overview/team-skills-overview.component.html
- [ ] T026 [US1] Create TeamSkillsOverviewComponent responsive SCSS styles: desktop=full table, tablet=condensed columns, mobile=card list layout per Section 18.3 in src/app/features/team/team-skills-overview/team-skills-overview.component.scss
- [ ] T027 [US1] Create team feature routes in src/app/features/team/team.routes.ts with routes for '' (overview), 'skills/:employeeId' (profile), 'validation' (queue), 'validation/:submissionId' (detail)
- [ ] T028 [US1] Update app.routes.ts to add lazy-loaded team route with AuthGuard + RoleGuard(['Manager','Admin']) at path 'team' in src/app/app.routes.ts

**Checkpoint**: User Story 1 complete — Team Skills Overview renders with role-scoped data, navigation works, Employee role blocked.

---

## Phase 4: User Story 2 — Manager Reviews and Approves a Skill (Priority: P1)

**Goal**: Manager navigates to /team/validation, selects a pending submission, reviews detail (self-rating, certification, project evidence), sets Manager Rating (1–4), approves it, and the final rating is auto-calculated.

**Independent Test**: Log in as Manager → /team/validation → click pending submission → set Manager Rating → Approve → verify status changes to "Approved", final rating calculated, employee notification sent.

### Implementation for User Story 2

- [ ] T029 [US2] Create ValidationQueueComponent standalone component with sortable list of pending submissions (sortable by employee name, skill name, submit date) in src/app/features/team/validation-queue/validation-queue.component.ts
- [ ] T030 [US2] Create ValidationQueueComponent template with table rows showing Employee name, Skill name, Self Rating, Submit Date, Status; "Approve"/"Reject" buttons for Manager (own team) and Admin (all); loading/empty states in src/app/features/team/validation-queue/validation-queue.component.html
- [ ] T031 [US2] Create ValidationQueueComponent responsive SCSS styles in src/app/features/team/validation-queue/validation-queue.component.scss
- [ ] T032 [US2] Create ValidationDetailComponent standalone component displaying full submission detail: employee name, skill name, self rating, certification evidence, project experience, peer validation responses/average rating in src/app/features/team/validation-detail/validation-detail.component.ts
- [ ] T033 [US2] Create ValidationDetailComponent template with Manager Rating input (1–4 scale), "Approve" button triggering final rating calculation, confirmation dialog, and notification dispatch in src/app/features/team/validation-detail/validation-detail.component.html
- [ ] T034 [US2] Create ValidationDetailComponent responsive SCSS styles (desktop=centered card, mobile=full-width form) in src/app/features/team/validation-detail/validation-detail.component.scss
- [ ] T035 [US2] Write unit tests for ValidationDetailComponent: approve dispatches correct action with managerRating, final rating computed on approval, notification sent to employee in src/app/features/team/validation-detail/validation-detail.component.spec.ts

**Checkpoint**: User Story 2 complete — Manager can view queue, open detail, approve with rating, final rating auto-calculated.

---

## Phase 5: User Story 3 — Manager Rejects a Skill Submission (Priority: P1)

**Goal**: Manager clicks "Reject" on a submission detail, enters a mandatory rejection reason, and the employee is notified with the reason.

**Independent Test**: Open validation detail → click Reject without reason → verify error "Rejection reason is required." → enter reason → Reject → verify status "Rejected" and employee receives rejection notification.

### Implementation for User Story 3

- [ ] T036 [US3] Add rejection workflow to ValidationDetailComponent: "Reject" button showing mandatory rejection reason textarea, validation preventing empty submission, dispatching reject action with reason in src/app/features/team/validation-detail/validation-detail.component.ts
- [ ] T037 [US3] Update ValidationDetailComponent template with rejection reason field, inline validation error "Rejection reason is required.", and confirmation dialog for rejection in src/app/features/team/validation-detail/validation-detail.component.html
- [ ] T038 [US3] Write unit tests for rejection: reject without reason shows validation error, reject with reason dispatches action, employee receives notification "Your [Skill Name] was rejected. Reason: [reason]." in src/app/features/team/validation-detail/validation-detail.component.spec.ts

**Checkpoint**: User Story 3 complete — Rejection workflow with mandatory reason and notification works.

---

## Phase 6: User Story 9 — Final Rating Calculation on Approval (Priority: P1)

**Goal**: When a manager approves a skill, the final rating is automatically calculated using the weighted formula with proportional weight redistribution for missing sources.

**Independent Test**: Approve skills with varying combinations of available rating sources and verify final rating matches expected calculation: all 4 sources → (Self×0.20)+(Manager×0.30)+(Peer×0.15)+(System×0.35), missing peer → redistributed weights, etc.

### Implementation for User Story 9

- [ ] T039 [US9] Integrate rating-calculation.service.ts into the team effects approve flow: on successful approval, call calculateFinalRating with available sources, store finalRating, level, and confidence on the skill record in src/app/core/store/team/team.effects.ts
- [ ] T040 [US9] Update MockApiInterceptor approve endpoint to invoke the rating calculation utility and return computed finalRating, level, confidence, effectiveWeights in the response in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T041 [US9] Write integration-level unit tests verifying end-to-end approval flow: dispatch approve → effect calls service → interceptor computes finalRating → store updated with correct values for multiple source combinations in src/app/core/store/team/team.effects.spec.ts

**Checkpoint**: User Story 9 complete — Final rating calculated correctly on every approval with proper weight redistribution.

---

## Phase 7: User Story 4 — Employee Submits Skill for Peer Validation (Priority: P2)

**Goal**: Employee selects 2–3 eligible peers (same department, same skill) and submits a peer validation request. Each selected peer receives an in-app notification.

**Independent Test**: Log in as Employee → initiate peer validation for a skill → verify only eligible peers shown → select 2 peers → submit → verify peers receive notifications.

### Implementation for User Story 4

- [ ] T042 [P] [US4] Create PeerValidationFormComponent standalone component with two modes: initiation (employee selects peers) and response (peer submits rating) in src/app/features/team/peer-validation-form/peer-validation-form.component.ts
- [ ] T043 [US4] Create PeerValidationFormComponent initiation template: eligible peer list (filtered by department+skill from selectEligiblePeers selector), multi-select chips/dropdown, min 2 / max 3 validation, submit button, error messages ("Select at least 2 peers." / "Maximum 3 peers allowed.") in src/app/features/team/peer-validation-form/peer-validation-form.component.html
- [ ] T044 [US4] Create PeerValidationFormComponent SCSS styles in src/app/features/team/peer-validation-form/peer-validation-form.component.scss
- [ ] T045 [US4] Write unit tests for peer initiation: eligible peers correctly filtered, cannot submit with <2 peers, cannot select >3 peers, submit dispatches createPeerRequest action, peers receive notifications in src/app/features/team/peer-validation-form/peer-validation-form.component.spec.ts

**Checkpoint**: User Story 4 complete — Employee can initiate peer validation with proper eligibility filtering and peer notifications.

---

## Phase 8: User Story 5 — Peer Submits a Validation Rating (Priority: P2)

**Goal**: A peer opens the peer validation form, submits a proficiency rating (1–4) with optional comment, and the requesting employee is notified.

**Independent Test**: Log in as a peer who received a validation request → open form → submit rating → verify employee receives completion notification.

### Implementation for User Story 5

- [ ] T046 [US5] Add response mode to PeerValidationFormComponent: display skill name being validated, proficiency rating selector (1–4 radio buttons), optional comment textarea, Submit button dispatching submitPeerResponse action in src/app/features/team/peer-validation-form/peer-validation-form.component.ts
- [ ] T047 [US5] Add validation to response mode: rating required ("Proficiency rating is required."), guard against peers who don't have the skill ("You cannot validate this skill as it is not in your profile.") in src/app/features/team/peer-validation-form/peer-validation-form.component.html
- [ ] T048 [US5] Write unit tests for peer response: rating required validation, successful submission dispatches action, employee receives notification "[Peer Name] has validated your [Skill Name] skill." in src/app/features/team/peer-validation-form/peer-validation-form.component.spec.ts

**Checkpoint**: User Story 5 complete — Peers can submit validation ratings via the structured form.

---

## Phase 9: User Story 6 — Peer Rating Aggregation and Weight Redistribution (Priority: P2)

**Goal**: When ≥2 peers respond, peer rating = average of responses and carries 0.15 weight. If <2 peers respond within 7 days, peer weight redistributed proportionally.

**Independent Test**: Simulate 2+ peer responses → verify peer average calculated and included. Simulate <2 responses after 7 days → verify weight redistributed.

### Implementation for User Story 6

- [ ] T049 [US6] Implement peer rating aggregation logic: compute average of PeerResponse ratings when responses.length ≥ 2, update peerRating on SkillSubmission in src/app/core/store/team/team.reducer.ts
- [ ] T050 [US6] Implement 7-day expiry detection in selectPeerValidationWithExpiry selector: if status is 'awaiting_responses' and createdDate > 7 days ago and responses < 2, project status as 'expired' in src/app/core/store/team/team.selectors.ts
- [ ] T051 [US6] Ensure rating-calculation.service.ts handles null peerRating correctly: when peer is null (expired or insufficient responses), redistribute 0.15 weight proportionally to present sources in src/app/core/services/rating-calculation.service.ts
- [ ] T052 [US6] Write unit tests: 3 peers rate 2,3,4 → average=3.0; 2 peers minimum threshold met; <2 responses + >7 days → expired status; weight redistribution when peer is null in src/app/core/store/team/team.selectors.spec.ts

**Checkpoint**: User Story 6 complete — Peer rating aggregation and 7-day expiry with weight redistribution work correctly.

---

## Phase 10: User Story 7 — Admin Overrides a Skill Rating (Priority: P2)

**Goal**: Admin sees all employees in the validation queue, opens any submission, uses "Override Rating" to set a custom rating (1–4) with a mandatory justification that replaces the final rating.

**Independent Test**: Log in as Admin → validation queue shows all departments → open submission → Override Rating → enter rating + justification → verify final rating updated. Verify "Override Rating" button absent in DOM for Manager role.

### Implementation for User Story 7

- [ ] T053 [US7] Add override workflow to ValidationDetailComponent: "Override Rating" button rendered via @if(user.role === 'Admin') removing from DOM for non-Admins, override form with rating input (1–4) and mandatory justification textarea in src/app/features/team/validation-detail/validation-detail.component.ts
- [ ] T054 [US7] Update ValidationDetailComponent template with override form, validation error "Override justification is required.", confirmation dialog, and logic to preserve previousFinalRating for audit in src/app/features/team/validation-detail/validation-detail.component.html
- [ ] T055 [US7] Write unit tests for override: Admin sees override button, Manager does not (DOM check), override without justification shows error, override with rating+justification dispatches action, previous rating preserved in src/app/features/team/validation-detail/validation-detail.component.spec.ts

**Checkpoint**: User Story 7 complete — Admin override with mandatory justification and audit trail works.

---

## Phase 11: User Story 8 — View Employee Skill Profile from Team View (Priority: P3)

**Goal**: Manager/Admin clicks "View Profile" from Team Skills Overview to see the employee's full skill profile with all ratings, proficiency levels, statuses, and confidence indicators.

**Independent Test**: Click "View Profile" from /team/skills → verify /team/skills/:employeeId loads with all skill details including ratings, level badges, status pills, and confidence indicators (🟢/🟡/🔴).

### Implementation for User Story 8

- [ ] T056 [P] [US8] Create EmployeeProfileComponent standalone component displaying employee info + all skills with: Skill Name, Self/Manager/Peer/System/Final ratings, Level badge, Status pill, ConfidenceIndicator in src/app/features/team/employee-profile/employee-profile.component.ts
- [ ] T057 [US8] Create EmployeeProfileComponent template with skill detail table/cards, back button to /team/skills, loading spinner, and integration with ConfidenceIndicatorComponent in src/app/features/team/employee-profile/employee-profile.component.html
- [ ] T058 [US8] Create EmployeeProfileComponent responsive SCSS styles (desktop=full table, tablet=condensed, mobile=cards) in src/app/features/team/employee-profile/employee-profile.component.scss
- [ ] T059 [US8] Write unit tests for EmployeeProfileComponent: renders all skill columns, confidence indicator shows correct level based on sourceCount (4→High, 2→Medium, 1→Low), back navigation works in src/app/features/team/employee-profile/employee-profile.component.spec.ts

**Checkpoint**: User Story 8 complete — Employee skill profile displays full rating details with confidence indicators.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Integration validation, accessibility, edge cases, and build verification

- [ ] T060 Verify full end-to-end workflow: Employee submits skill → peer validation initiated → peers respond → manager approves → final rating computed → notifications generated at each step
- [ ] T061 Verify role-based visibility: Employee at /team/** → redirected to /unauthorized; Manager sees own team only; Admin sees all; "Override Rating" absent from DOM for non-Admin
- [ ] T062 [P] Verify responsive layouts at 375px, 768px, 1280px, 1440px for all team screens (overview table→card list on mobile, validation detail form adapts)
- [ ] T063 [P] Verify accessibility: keyboard navigation through validation queue, approve/reject flow; aria-labels on all interactive elements; confidence indicator uses emoji+text (not color alone); 44×44px touch targets
- [ ] T064 Verify edge cases: expired peer validation (>7 days + <2 responses), concurrent approval (first action wins), admin override on already-approved submission, peer who removes skill before validation
- [ ] T065 Run quickstart.md validation: execute all 13 build steps in order and verify each checkpoint passes
- [ ] T066 Run `ng test` — all unit tests pass; run `ng build --configuration=production` — clean build with no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2); depends on US1 for route setup (T027, T028)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (extends ValidationDetailComponent from T032–T034)
- **User Story 9 (Phase 6)**: Depends on User Story 2 (integrates into approve flow from T032–T035)
- **User Story 4 (Phase 7)**: Depends on Foundational (Phase 2); independent of US1/US2/US3
- **User Story 5 (Phase 8)**: Depends on User Story 4 (extends PeerValidationFormComponent from T042–T044)
- **User Story 6 (Phase 9)**: Depends on User Story 5 (requires peer responses); depends on Foundational (T007, T008)
- **User Story 7 (Phase 10)**: Depends on User Story 2 (extends ValidationDetailComponent)
- **User Story 8 (Phase 11)**: Depends on Foundational (Phase 2); independent of other stories
- **Polish (Phase 12)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Team Overview)** → Foundational only — independent
- **US2 (Approve Skill)** → US1 (for route navigation from overview)
- **US3 (Reject Skill)** → US2 (extends same validation detail component)
- **US9 (Final Rating Calc)** → US2 (integrates into approve flow)
- **US4 (Peer Initiation)** → Foundational only — independent
- **US5 (Peer Response)** → US4 (extends peer validation form)
- **US6 (Peer Aggregation)** → US5 (needs peer responses in store)
- **US7 (Admin Override)** → US2 (extends validation detail)
- **US8 (Employee Profile)** → Foundational only — independent

### Within Each User Story

- Models before services
- Services before NgRx effects
- NgRx actions/reducer/selectors before components
- Core implementation before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: All model creation tasks (T001–T006) can run in parallel
- **Phase 2**: T021–T022 (ConfidenceIndicator) can run in parallel with T007–T020 (services/NgRx)
- **Phase 3–6 (P1 stories)**: US1 and US4 can start in parallel after Foundational; US8 can start independently
- **Phase 7–10 (P2 stories)**: US4 can run in parallel with US1; US7 can start when US2 is done
- **Phase 12**: T062 and T063 (responsive + accessibility) can run in parallel

---

## Parallel Example: After Foundational Phase Completes

```bash
# Developer A: P1 critical path
T024–T028 → US1 (Team Overview)
T029–T035 → US2 (Approve Skill)
T036–T038 → US3 (Reject Skill)
T039–T041 → US9 (Final Rating)

# Developer B: P2 peer validation path (parallel with A)
T042–T045 → US4 (Peer Initiation)
T046–T048 → US5 (Peer Response)
T049–T052 → US6 (Peer Aggregation)

# Developer C: Independent screens (parallel with A and B)
T056–T059 → US8 (Employee Profile)
T053–T055 → US7 (Admin Override — after US2 from Dev A)
```

---

## Implementation Strategy

- **MVP Scope**: User Stories 1 + 2 + 3 + 9 (P1) — delivers the core manager workflow: view team, review submissions, approve/reject, auto-calculate final rating
- **Incremental Delivery**: P2 stories (4, 5, 6, 7) add peer validation and admin override on top of the working MVP
- **P3 Completion**: User Story 8 (Employee Profile) adds the drill-down view for detailed skill inspection
- **Risk Mitigation**: Rating calculation utility (T007–T008) is built and tested first as it is the most critical business logic shared by approve, override, and peer aggregation flows
