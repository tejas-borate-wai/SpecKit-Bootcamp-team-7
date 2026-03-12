# Tasks: Certifications Module

**Input**: Design documents from `/specs/005-certifications-module/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Angular 17 SPA)
- Paths are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create TypeScript interfaces, constants, and mock data files used across all user stories

- [ ] T001 Create certification TypeScript interfaces (Certification, CertificationStatus, FileMetadata, CreateCertificationPayload, CertificationWithStatus) in src/app/shared/models/certification.model.ts
- [ ] T002 [P] Create file-validation model with ALLOWED_FORMATS (application/pdf, image/jpeg, image/png) and MAX_FILE_SIZE (5242880) constants in src/app/shared/models/file-validation.model.ts
- [ ] T003 [P] Create certifications mock data JSON with sample entries (valid, expiring soon, expired) in assets/mock-data/certifications.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services, NgRx store, interceptor endpoints, and shared components that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create certification utility functions (computeCertificationStatus, hasValidCertification, getActiveCertForSkill, applyRatingBonus, getCertificationBonusWeight) with date-only comparison and referenceDate parameter in src/app/shared/utils/certification.util.ts
- [ ] T005 [P] Create CertificationStatusPipe (standalone, pure) that transforms an expiryDate string to a CertificationStatus using computeCertificationStatus in src/app/shared/pipes/certification-status.pipe.ts
- [ ] T006 Extend MockApiInterceptor with certifications CRUD endpoints: GET /api/certifications?userId=:userId (filter by userId), GET /api/certifications/:certId (find by ID, 404 if missing), POST /api/certifications (generate certId, attach userId from session, return 201), DELETE /api/certifications/:certId (remove from array) in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T007 Create CertificationService with getCertifications(userId), getCertification(certId), and createCertification(payload) methods wrapping HttpClient calls in src/app/core/services/certification.service.ts
- [ ] T008 [P] Create NgRx certifications actions: loadCertifications, loadCertificationsSuccess, loadCertificationsFailure, uploadCertification, uploadCertificationSuccess, uploadCertificationFailure in src/app/core/store/certifications/certifications.actions.ts
- [ ] T009 Create NgRx certifications reducer handling all action types with CertificationsState (certifications[], loading, error, uploadInProgress) and initialCertificationsState in src/app/core/store/certifications/certifications.reducer.ts
- [ ] T010 Create NgRx certifications effects: loadCertifications$ calls CertificationService.getCertifications; uploadCertification$ calls CertificationService.createCertification with success toast and navigation to /certifications in src/app/core/store/certifications/certifications.effects.ts
- [ ] T011 Create NgRx certifications selectors: selectAllCertifications, selectCertificationsLoading, selectCertificationsError, selectCertificationsForSkill(skillId), selectCertificationsWithStatus (maps certs with computeCertificationStatus) in src/app/core/store/certifications/certifications.selectors.ts
- [ ] T012 [P] Create StatusBadgeComponent (standalone) accepting status: CertificationStatus input, rendering a color-coded badge — green for Valid, amber for Expiring Soon, red for Expired — with text label and aria-label in src/app/shared/components/status-badge/status-badge.component.ts|html|scss
- [ ] T013 [P] Create CertifiedBadgeComponent (standalone) accepting isVisible: boolean input, rendering a "Certified" chip/badge when visible with aria-label in src/app/shared/components/certified-badge/certified-badge.component.ts|html|scss
- [ ] T014 Create certifications feature routes: /certifications → CertificationsListComponent, /certifications/upload → CertUploadComponent, both with AuthGuard, register provideState('certifications', certificationsReducer) in src/app/features/certifications/certifications.routes.ts
- [ ] T015 Register certifications lazy-loaded route via loadChildren pointing to certifications.routes.ts with AuthGuard in src/app/app.routes.ts

**Checkpoint**: Foundation ready — all services, store, interceptor endpoints, and shared components are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — View Certifications List (Priority: P1) 🎯 MVP

**Goal**: Display all certifications for the logged-in user in a table with color-coded status badges (Valid/Expiring Soon/Expired)

**Independent Test**: Navigate to /certifications and verify that all certifications from mock data render with correct columns (Certification Name, Skill, Issuing Org, Issue Date, Expiry Date, Status) and appropriate status badges based on date calculations.

### Implementation for User Story 1

- [ ] T016 [US1] Create CertificationsListComponent (standalone) that dispatches loadCertifications on init and subscribes to selectCertificationsWithStatus selector for table data in src/app/features/certifications/certifications-list/certifications-list.component.ts
- [ ] T017 [US1] Implement certifications-list template with mat-table displaying columns: Certification Name, Skill (mapped from skillId to display name via skill-definitions), Issuing Organization, Issue Date, Expiry Date, and Status (using StatusBadgeComponent) with loading spinner while data loads in src/app/features/certifications/certifications-list/certifications-list.component.html
- [ ] T018 [US1] Add certifications-list SCSS styles for table layout, column widths, and loading state in src/app/features/certifications/certifications-list/certifications-list.component.scss

**Checkpoint**: User Story 1 complete — certifications list renders with correct data and status badges. Navigating to /certifications shows a fully functional list.

---

## Phase 4: User Story 2 — Upload a New Certification (Priority: P1)

**Goal**: Functional upload form that saves a new certification to NgRx in-memory state and navigates to the certifications list on success

**Independent Test**: Navigate to /certifications/upload, fill in all required fields with valid data, attach a valid file, submit, and confirm the new certification appears in the certifications list with a success toast.

### Implementation for User Story 2

- [ ] T019 [US2] Create CertUploadComponent (standalone) with reactive form (FormGroup: certName, skillId, issuingOrg, issueDate, expiryDate) and file input; populate skill dropdown from NgRx employee-skills selector filtered to current user; extract FileMetadata on file selection; dispatch uploadCertification action on submit in src/app/features/certifications/cert-upload/cert-upload.component.ts
- [ ] T020 [US2] Implement cert-upload template with mat-form-field for each input: mat-input for certName and issuingOrg, mat-select for skill dropdown, matDatepicker for issueDate and expiryDate, custom file input with readonly mat-input showing filename and mat-icon-button (attach_file) triggering hidden native file input, and a submit button in src/app/features/certifications/cert-upload/cert-upload.component.html
- [ ] T021 [US2] Add cert-upload SCSS styles with two-column form layout for desktop in src/app/features/certifications/cert-upload/cert-upload.component.scss

**Checkpoint**: User Story 2 complete — upload form submits valid data, certification saved to NgRx state, success toast shown, user redirected to list.

---

## Phase 5: User Story 3 — Form Validation on Certification Upload (Priority: P1)

**Goal**: Real-time inline validation preventing invalid submissions — required field checks, file format/size enforcement, and date consistency

**Independent Test**: Attempt to submit the form with various invalid inputs (empty fields, wrong file type, oversized file, expiry before issue date) and verify each validation message appears inline next to the respective field.

### Implementation for User Story 3

- [ ] T022 [US3] Add real-time inline validation to CertUploadComponent: Validators.required on all fields, custom file format validator checking against ALLOWED_FORMATS, file size validator checking MAX_FILE_SIZE, and cross-field validator ensuring expiryDate is after issueDate in src/app/features/certifications/cert-upload/cert-upload.component.ts
- [ ] T023 [US3] Add mat-error elements for all validation states: "This field is required." for empty fields, "Only PDF, JPG, and PNG files are accepted." for invalid format, "File size must not exceed 5 MB." for oversized files, "Expiry date must be after issue date." for date conflict; disable submit button when form is invalid in src/app/features/certifications/cert-upload/cert-upload.component.html
- [ ] T024 [US3] Handle empty skill profile edge case: when user has no skills, show "Add skills to your profile before uploading certifications." message, disable the skill dropdown and submit button in src/app/features/certifications/cert-upload/cert-upload.component.ts|html

**Checkpoint**: User Story 3 complete — all validation rules enforced inline, invalid submissions blocked, clear error messages displayed.

---

## Phase 6: User Story 4 — Certification Rating Bonus (Priority: P2)

**Goal**: Apply +10% rating bonus to skill scores for valid certifications (capped at 100%) and contribute Certification Bonus at 0.20 weight to the System Rating formula

**Independent Test**: Verify that a skill with a valid certification shows +10% bonus on its displayed rating (75% → 85%), scores above 95% cap at 100%, and the System Rating formula reflects 100% × 0.20 for Certification Bonus when a valid cert exists and 0% × 0.20 when none exists.

### Implementation for User Story 4

- [ ] T025 [US4] Create CertificationBonusService with hasValidCertForSkill(skillId) returning Observable<boolean> from NgRx selectCertificationsForSkill + hasValidCertification utility, and getAdjustedScore(testScore, skillId) returning Observable<number> applying applyRatingBonus in src/app/core/services/certification-bonus.service.ts
- [ ] T026 [US4] Integrate certification rating bonus into skill rating display: use CertificationBonusService.getAdjustedScore to show adjusted skill percentages on skill profile and skill detail screens (Phase 3 components)
- [ ] T027 [US4] Integrate Certification Bonus weight (0.20) into System Rating formula: use getCertificationBonusWeight with CertificationBonusService.hasValidCertForSkill to contribute to the system rating computation (Phase 4 scoring service)

**Checkpoint**: User Story 4 complete — valid certifications add +10% to skill scores (capped at 100%), System Rating formula includes Certification Bonus at 0.20 weight.

---

## Phase 7: User Story 5 — Certification Expiry Tracking and Impact (Priority: P2)

**Goal**: Track expiry dates, flag expiring certifications on dashboard, and ensure expired certifications no longer contribute ratings or badges

**Independent Test**: Verify certifications with different expiry states show correct status badges, dashboard displays alerts for expiring-within-30-days certifications, and expired certifications yield 0% bonus and no certified badge.

### Implementation for User Story 5

- [ ] T028 [US5] Add selectExpiringSoonCertifications selector filtering certifications with 'Expiring Soon' status for dashboard alerts in src/app/core/store/certifications/certifications.selectors.ts
- [ ] T029 [US5] Add certification expiry alerts section to the existing dashboard component: display list of certifications expiring within 30 days with certification name, skill, and days remaining (Phase 3 dashboard component)
- [ ] T030 [US5] Verify expired certification exclusion: ensure CertificationBonusService and certified badge logic gate on computeCertificationStatus !== 'Expired' so expired certs contribute 0% bonus and no badge in src/app/core/services/certification-bonus.service.ts

**Checkpoint**: User Story 5 complete — dashboard shows expiry alerts, expired certifications have no rating or badge impact.

---

## Phase 8: User Story 6 — Certified Badge on Skill Profile (Priority: P2)

**Goal**: Display a "Certified" badge next to skills with valid certifications on My Skills list and Skill Detail screens

**Independent Test**: Verify that skills with a valid certification show the "Certified" badge in the skill list and detail views, and skills without certifications or with expired certifications do not show the badge.

### Implementation for User Story 6

- [ ] T031 [US6] Integrate CertifiedBadgeComponent into the existing My Skills list component: for each skill, use selectCertificationsForSkill selector and hasValidCertification utility to determine badge visibility (Phase 3 skill profile list component)
- [ ] T032 [US6] Integrate CertifiedBadgeComponent into the existing Skill Detail screen: show "Certified" badge when a valid certification exists for the displayed skill (Phase 3 skill detail component)

**Checkpoint**: User Story 6 complete — "Certified" badge visible on skill profile for skills with valid certs, hidden for skills with expired or no certs.

---

## Phase 9: User Story 7 — Responsive Certification Screens (Priority: P3)

**Goal**: Certifications list and upload form adapt across desktop, tablet, and mobile breakpoints

**Independent Test**: Resize browser to desktop (1280px+), tablet (768px), and mobile (<480px) and verify: list switches from mat-table to card layout on mobile; upload form switches from two-column to single-column with sticky submit on mobile.

### Implementation for User Story 7

- [ ] T033 [US7] Add responsive layout to CertificationsListComponent: inject BreakpointObserver, switch between mat-table (desktop) and card layout (mobile) based on breakpoint, use SCSS variables from _breakpoints.scss in src/app/features/certifications/certifications-list/certifications-list.component.ts|html|scss
- [ ] T034 [US7] Add responsive layout to CertUploadComponent: inject BreakpointObserver, switch from two-column to single-column layout on mobile, add sticky submit button positioning on mobile, use SCSS variables from _breakpoints.scss in src/app/features/certifications/cert-upload/cert-upload.component.ts|html|scss

**Checkpoint**: User Story 7 complete — all certification screens are responsive across desktop, tablet, and mobile viewports.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, code quality, and final validation across all user stories

- [ ] T035 [P] Add accessibility attributes: aria-labels on status badges, certified badge, file upload button, and all interactive elements; ensure 44×44px minimum touch targets on mobile in src/app/shared/components/ and src/app/features/certifications/
- [ ] T036 [P] Add prefers-reduced-motion media query to disable or simplify animations on certification screens in src/app/features/certifications/
- [ ] T037 Code cleanup: verify no `any` types, no inline styles, no BehaviorSubject for shared state, explicit return types on all services, SCSS-only styling across all certifications-module files
- [ ] T038 Run quickstart.md verification checklist — validate all 11 checks pass (interfaces compile, interceptor handles 4 endpoints, NgRx store works, list renders, form validates, badge shows, dashboard alerts, responsive layouts, no `any`/inline/BehaviorSubject)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — no other story dependencies
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — independent of US1
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) — enhances the upload form created in US2
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) — needs certifications store operational
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) + User Story 4 (Phase 6) for bonus logic verification
- **User Story 6 (Phase 8)**: Depends on Foundational (Phase 2) — uses CertifiedBadgeComponent and selectors
- **User Story 7 (Phase 9)**: Depends on User Story 1 (Phase 3) + User Story 2 (Phase 4) — adds responsive behavior to existing components
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — can run in parallel with US1
- **US3 (P1)**: Depends on US2 — adds validation to the upload form component
- **US4 (P2)**: Can start after Phase 2 — can run in parallel with US1/US2
- **US5 (P2)**: Can start after Phase 2 — integrates with US4 for bonus verification
- **US6 (P2)**: Can start after Phase 2 — can run in parallel with US4/US5
- **US7 (P3)**: Depends on US1 + US2 — adds responsive layouts to list and upload components

### Within Each User Story

- Models/interfaces before services
- Services before components
- Core implementation before cross-feature integration
- Story complete and checkpointed before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003 run in parallel (both depend on T001 for interfaces)
- **Phase 2**: T005 || T008 || T012 || T013 can all run in parallel (independent files)
- **After Phase 2**: US1 || US2 || US4 || US6 can start in parallel (independent stories)
- **Phase 10**: T035 || T036 can run in parallel (independent concerns)

---

## Parallel Example: User Story 1

```bash
# After Phase 2 is complete, launch US1 tasks:

# These three tasks are sequential within US1 (same component):
Task T016: "Create CertificationsListComponent logic in certifications-list.component.ts"
Task T017: "Implement certifications-list template in certifications-list.component.html"
Task T018: "Add certifications-list styles in certifications-list.component.scss"
```

## Parallel Example: Multiple Stories After Foundational

```bash
# After Phase 2 completes, these stories can start in parallel:

# Developer A: User Story 1 (Phase 3)
Task T016-T018: Certifications list component

# Developer B: User Story 2 (Phase 4)
Task T019-T021: Upload form component

# Developer C: User Story 4 (Phase 6)
Task T025-T027: Rating bonus integration
```

---

## Implementation Strategy

### MVP First (P1 Stories: US1 + US2 + US3)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T015) — **CRITICAL, blocks all stories**
3. Complete Phase 3: User Story 1 — View certifications list
4. Complete Phase 4: User Story 2 — Upload form (basic flow)
5. Complete Phase 5: User Story 3 — Form validation
6. **STOP and VALIDATE**: All P1 stories should be independently functional

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Certifications list works → **Demo-able!**
3. Add US2 + US3 → Upload with validation works → **MVP Complete!**
4. Add US4 → Rating bonus integration → Deploy/Demo
5. Add US5 → Expiry tracking and dashboard alerts → Deploy/Demo
6. Add US6 → Certified badge on skill profile → Deploy/Demo
7. Add US7 → Responsive layouts → Deploy/Demo
8. Polish → Accessibility, code quality, final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (list) → US7 (responsive list)
   - Developer B: US2 (upload) → US3 (validation) → US7 (responsive form)
   - Developer C: US4 (bonus) → US5 (expiry) → US6 (badge)
3. Polish phase as a team

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable at its checkpoint
- All data flows through NgRx store — no BehaviorSubject for shared state
- File uploads are simulated — store metadata only, not actual file bytes
- Status is always derived from expiryDate at render time — never stored
- Mock data resets on page refresh (in-memory only, consistent with mock-first architecture)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
