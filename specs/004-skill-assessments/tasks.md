# Tasks: Skill Assessments Module

**Input**: Design documents from `/specs/004-skill-assessments/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/mock-api-contract.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted. Unit tests are recommended in the Polish phase per constitution principles.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Mock data in `src/assets/mock-data/`
- Feature code in `src/app/features/assessments/`
- NgRx store in `src/app/core/store/assessments/`
- Shared components/models/utils in `src/app/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create mock data files and TypeScript interfaces needed by all subsequent phases

- [X] T001 [P] Create skill-exams.json mock data file with 5–10 questions per skill (Easy/Medium/Hard mix) in src/assets/mock-data/skill-exams.json
- [X] T002 [P] Create skill-test-attempts.json mock data file with sample past attempts in src/assets/mock-data/skill-test-attempts.json
- [X] T003 [P] Create SkillExam, ExamQuestion, and DifficultyLevel interfaces in src/app/shared/models/skill-exam.model.ts
- [X] T004 [P] Create AssessmentAttempt interface in src/app/shared/models/assessment-attempt.model.ts
- [X] T005 [P] Create AssessmentStatus type ('Not Attempted' | 'In Progress' | 'Completed') in src/app/shared/models/assessment-status.model.ts
- [X] T006 [P] Create ScoreCard interface in src/app/shared/models/score-card.model.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services, state management, utilities, and routing that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Implement scoring utility functions (calculateWeightedScore, calculateSystemRating, mapScoreToLevel, calculateLevelChange) as pure functions in src/app/shared/utils/scoring.util.ts
- [X] T008 [P] Implement Fisher-Yates shuffle utility (shuffleArray) in src/app/shared/utils/shuffle.util.ts
- [X] T009 [P] Extend MockApiInterceptor with GET /api/skill-exams, GET /api/skill-exams/:skillId, GET /api/skill-test-attempts, POST /api/skill-test-attempts, PUT /api/employee-skills/:userId endpoints in src/app/core/interceptors/mock-api.interceptor.ts
- [X] T010 [P] Create AssessmentService with getExams(), getExamBySkillId(), getAttempts(), submitAttempt() methods via HttpClient in src/app/core/services/assessment.service.ts
- [X] T011 [P] Create NgRx AssessmentsState and ActiveAssessmentState interfaces with initial state in src/app/core/store/assessments/assessments.state.ts
- [X] T012 [P] Create NgRx assessments actions (loadExams, loadAttempts, startAssessment, assessmentLoaded, nextQuestion, previousQuestion, selectAnswer, timerTick, timerExpired, submitAssessment, assessmentSubmitted, clearActiveAssessment) in src/app/core/store/assessments/assessments.actions.ts
- [X] T013 Create NgRx assessments reducer handling all actions with immutable state transitions in src/app/core/store/assessments/assessments.reducer.ts
- [X] T014 Create NgRx assessments effects (load exams, load attempts, start assessment with shuffle, timer interval with wall-clock correction, submit attempt, auto-submit on timer expiry) in src/app/core/store/assessments/assessments.effects.ts
- [X] T015 Create NgRx assessments selectors (selectExams, selectAttempts, selectActiveAssessment, selectCurrentQuestion, selectSelectedAnswer, selectProgress, selectTimerRemaining, selectAssessmentStatusBySkill, selectCanRetake, selectCooldownRemaining, selectScoreCard) in src/app/core/store/assessments/assessments.selectors.ts
- [X] T016 Register assessments NgRx feature state in application configuration (provideState in app.config.ts or feature route providers)
- [X] T017 Create assessments.routes.ts with Routes array and update src/app/app.routes.ts with lazy-loaded assessments route guarded by AuthGuard in src/app/features/assessments/assessments.routes.ts and src/app/app.routes.ts

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Browse and Start a Skill Assessment (Priority: P1) 🎯 MVP

**Goal**: Employee navigates to /assessments, sees all skills with assessment status, filters by category/status, and starts an assessment

**Independent Test**: Navigate to /assessments → verify list renders with correct statuses (Not Attempted / Completed) → apply category and status filters → click "Start Assessment" on a not-attempted skill → confirm navigation to /assessments/:skillId/take

- [X] T018 [US1] Create AssessmentsListComponent (standalone, ts/html/scss) with skills table showing skill name, category, assessment status badge, last score, last attempt date, and action buttons in src/app/features/assessments/assessments-list/assessments-list.component.ts
- [X] T019 [US1] Implement category filter dropdown (from skill-categories.json) and status filter dropdown (Not Attempted / Completed) in AssessmentsListComponent in src/app/features/assessments/assessments-list/assessments-list.component.ts
- [X] T020 [US1] Implement "Start Assessment" button for not-attempted skills with navigation to /assessments/:skillId/take, and "Assessment not available yet for this skill." empty state when no exam exists in src/app/features/assessments/assessments-list/assessments-list.component.ts

**Checkpoint**: User Story 1 fully functional — users can browse and start assessments

---

## Phase 4: User Story 2 — Take a Timed Assessment with Navigation (Priority: P1)

**Goal**: Employee takes a timed 15-minute assessment with randomized questions displayed one at a time, Previous/Next navigation, progress bar, and Submit/auto-submit

**Independent Test**: Start an assessment → verify questions appear one at a time in randomized order → navigate Previous/Next and confirm answers are preserved → verify timer counts down → submit test and confirm navigation to result screen → verify auto-submit on timer expiry displays "Time's up!" message

- [X] T021 [P] [US2] Create CountdownTimerComponent (standalone, presentational) with Input for remaining seconds, MM:SS display format, and compact badge variant for mobile in src/app/shared/components/countdown-timer/countdown-timer.component.ts
- [X] T022 [P] [US2] Create ProgressBarComponent (standalone, presentational) with Inputs for current and total, displaying "Question X of Y" with visual progress bar and aria-valuenow/aria-valuemax in src/app/shared/components/progress-bar/progress-bar.component.ts
- [X] T023 [US2] Create TakeAssessmentComponent (standalone, ts/html/scss) with single-question display, 4 radio-button answer options, CountdownTimer, and ProgressBar in src/app/features/assessments/take-assessment/take-assessment.component.ts
- [X] T024 [US2] Implement Previous/Next navigation dispatching NgRx actions with answer preservation (selectAnswer action on option click, previousQuestion/nextQuestion actions on button click) in src/app/features/assessments/take-assessment/take-assessment.component.ts
- [X] T025 [US2] Implement timer countdown effect using RxJS interval with wall-clock correction (timerDeadline - Date.now()) dispatching timerTick and autoSubmit actions in src/app/core/store/assessments/assessments.effects.ts
- [X] T026 [US2] Implement "Submit Test" button dispatching submitAssessment action with navigation to /assessments/:skillId/result, and timer expiry auto-submit with "Time's up! Your test has been auto-submitted." message in src/app/features/assessments/take-assessment/take-assessment.component.ts

**Checkpoint**: User Story 2 fully functional — users can take a complete timed assessment

---

## Phase 5: User Story 3 — View Post-Assessment Score Card (Priority: P1)

**Goal**: After completing an assessment, display a detailed score card with test score, certification bonus, project experience bonus, system rating, final rating status, proficiency level, and level change indicator

**Independent Test**: Complete an assessment → verify score card shows test score as "X% (Y/Z points)" → verify certification bonus line shows "+20% cert bonus" or "No certification" → verify project experience line → verify system rating → verify level badge and level change indicator

- [X] T027 [US3] Create AssessmentResultComponent (standalone, ts/html/scss) with score card layout displaying test score percentage with earned/max points in src/app/features/assessments/assessment-result/assessment-result.component.ts
- [X] T028 [US3] Display certification bonus status ("+20% cert bonus" or "No certification") and project experience bonus status ("+20% project exp" or "No project tagged") in AssessmentResultComponent in src/app/features/assessments/assessment-result/assessment-result.component.ts
- [X] T029 [US3] Display system rating result, final rating (or "Awaiting manager review" if sources incomplete), proficiency level badge (Beginner/Intermediate/Advanced/Expert), and level change indicator (e.g., "⬆ Intermediate → Advanced") in AssessmentResultComponent in src/app/features/assessments/assessment-result/assessment-result.component.ts

**Checkpoint**: User Story 3 fully functional — users see complete score breakdown after every assessment

---

## Phase 6: User Story 4 — Difficulty-Weighted Score Calculation (Priority: P1)

**Goal**: Ensure the scoring engine correctly applies difficulty weights (Easy=1pt, Medium=2pt, Hard=3pt) and computes test score as (earnedPoints / maxPoints) × 100

**Independent Test**: Complete an assessment with known difficulty levels → verify earned points match sum of correct-answer weights → verify max points equal sum of all question weights → verify percentage equals (earned / max) × 100

- [X] T030 [US4] Integrate calculateWeightedScore from scoring.util.ts into the submit assessment effect to compute earnedPoints, maxPoints, and testScore from active assessment answers in src/app/core/store/assessments/assessments.effects.ts
- [X] T031 [US4] Create selectScoreCard NgRx selector that derives testScore, earnedPoints, maxPoints from assessment submission data and feeds to AssessmentResultComponent in src/app/core/store/assessments/assessments.selectors.ts

**Checkpoint**: User Story 4 fully functional — difficulty-weighted scoring is accurate for all question combinations

---

## Phase 7: User Story 5 — Retake Assessment with Cooldown (Priority: P2)

**Goal**: Allow retakes after 24-hour cooldown; show remaining cooldown time if attempted before cooldown elapses

**Independent Test**: Complete an assessment → attempt to retake immediately → verify "You can retake this assessment in X hours Y minutes" message → verify "Retake" button appears after 24 hours → verify retake starts with freshly randomized questions

- [X] T032 [US5] Implement selectCanRetake and selectCooldownRemaining selectors checking 24-hour window from latest attempt date per skill in src/app/core/store/assessments/assessments.selectors.ts
- [X] T033 [US5] Display "Retake" button for completed skills with elapsed cooldown and last score/attempt date in AssessmentsListComponent in src/app/features/assessments/assessments-list/assessments-list.component.ts
- [X] T034 [US5] Display "You can retake this assessment in X hours Y minutes." cooldown message when retake is attempted before 24-hour window elapses in src/app/features/assessments/assessments-list/assessments-list.component.ts

**Checkpoint**: User Story 5 fully functional — retake cooldown is enforced and displayed correctly

---

## Phase 8: User Story 6 — System Rating Calculation (Priority: P2)

**Goal**: Compute System Rating = (TestScore × 0.60) + (CertBonus × 0.20) + (ProjectExp × 0.20) after each assessment and update the employee's skill record

**Independent Test**: Complete an assessment for a skill with a valid certification and completed project → verify system rating equals (testScore × 0.60) + (100 × 0.20) + (100 × 0.20) → complete for a skill without cert/project → verify system rating equals (testScore × 0.60) + 0 + 0

- [X] T035 [US6] Implement certification bonus check in submit assessment effect: read certifications for current user + skill via GET /api/certifications, verify non-expired expiryDate in src/app/core/store/assessments/assessments.effects.ts
- [X] T036 [US6] Implement project experience bonus check in submit assessment effect: read project-assignments via GET /api/project-assignments, cross-reference with projects.json for completed project containing the skill in src/app/core/store/assessments/assessments.effects.ts
- [X] T037 [US6] Compute system rating via calculateSystemRating utility and update employee skill record via PUT /api/employee-skills/:userId after assessment submission in src/app/core/store/assessments/assessments.effects.ts

**Checkpoint**: User Story 6 fully functional — system rating accurately reflects test score, certification, and project experience

---

## Phase 9: User Story 7 — View Test History (Priority: P2)

**Goal**: Display complete test history for any skill showing all previous attempts with date, score, earned/max points, and time taken

**Independent Test**: Complete multiple assessments for a skill → navigate to test history → verify all attempts listed with correct date, score, points, and time → verify empty state message for skills with no history

- [X] T038 [US7] Create test history section displaying all past attempts (attempt date, score %, earned/max points, time taken) as a table or card list in AssessmentResultComponent in src/app/features/assessments/assessment-result/assessment-result.component.ts
- [X] T039 [US7] Display "No attempts have been made" empty state when no assessment history exists for a skill in src/app/features/assessments/assessment-result/assessment-result.component.ts

**Checkpoint**: User Story 7 fully functional — complete test history is visible and accurate

---

## Phase 10: User Story 8 — Responsive Assessment Experience (Priority: P3)

**Goal**: Assessment screens adapt across desktop (≥1280px), tablet (768px), and mobile (<480px) breakpoints per Section 18.3 requirements

**Independent Test**: Resize browser to desktop (1280px+) → verify centered 720px question card, timer top-right, full-width progress bar → resize to tablet (768px) → verify full-width card, 44px+ tap targets → resize to mobile (<480px) → verify full-screen card, stacked options, compact timer badge, sticky Previous/Next at bottom

- [X] T040 [P] [US8] Implement desktop layout (centered max-width 720px question card, timer top-right, full-width progress bar) using SCSS breakpoint variables in src/app/features/assessments/take-assessment/take-assessment.component.scss
- [X] T041 [P] [US8] Implement tablet layout (full-width question card, ≥44px tap targets for answer options and navigation buttons) using Angular CDK BreakpointObserver in src/app/features/assessments/take-assessment/take-assessment.component.scss
- [X] T042 [US8] Implement mobile layout (full-screen question card, vertically stacked answer options, compact timer badge, sticky full-width Previous/Next buttons at viewport bottom) in src/app/features/assessments/take-assessment/take-assessment.component.scss
- [X] T043 [US8] Implement responsive assessments list (desktop full table → tablet reduced columns → mobile card list) in src/app/features/assessments/assessments-list/assessments-list.component.scss

**Checkpoint**: All assessment screens render correctly at all three breakpoints

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T044 [P] Add loading spinner/skeleton states for exam data fetch and attempt history load across all assessment screens
- [X] T045 [P] Add error state handling for interceptor failures and empty states (no exams, no attempts) with toast notifications
- [X] T046 [P] Add Angular Animations for question slide transitions (Previous/Next) and score card reveal animation
- [ ] T047 Run quickstart.md verification checklist to validate all screens, timer, scoring, cooldown, responsive, and state management in specs/004-skill-assessments/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–10)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3, US4) can proceed sequentially: US1 → US2 → US3 → US4
  - P2 stories (US5, US6, US7) can proceed in parallel after Foundational
  - P3 story (US8) can proceed after US2 (assessment screen must exist)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Can start after Foundational — Builds on US1 navigation flow but TakeAssessmentComponent is independent
- **US3 (P1)**: Can start after Foundational — Builds on US2 submission flow but AssessmentResultComponent is independent
- **US4 (P1)**: Depends on US2 (submit flow) and US3 (score card display) — integrates scoring into the pipeline
- **US5 (P2)**: Can start after Foundational — Adds retake logic to US1 list but is independently testable
- **US6 (P2)**: Can start after Foundational — Adds system rating computation to submit flow; can parallel with US5
- **US7 (P2)**: Can start after Foundational — Adds history display; independent of other P2 stories
- **US8 (P3)**: Depends on US2 (take-assessment component must exist) — Purely SCSS/layout work

### Within Each User Story

- Models before services
- Services before NgRx effects
- NgRx state before components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001–T006) can run in parallel
- Foundational tasks T007–T012 can run in parallel (different files, no inter-dependencies)
- T013 (reducer) can start after T011 + T012
- T014 (effects) can start after T010 + T012
- T015 (selectors) can start after T011
- T021 + T022 (shared components) can run in parallel
- T040 + T041 (responsive desktop/tablet) can run in parallel
- P2 stories (US5, US6, US7) can run in parallel after Foundational
- All Polish tasks (T044–T046) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch shared components in parallel:
Task T021: "Create CountdownTimerComponent in src/app/shared/components/countdown-timer/"
Task T022: "Create ProgressBarComponent in src/app/shared/components/progress-bar/"

# Then sequentially build the take-assessment component:
Task T023: "Create TakeAssessmentComponent with question display and options"
Task T024: "Implement Previous/Next navigation with answer preservation"
Task T025: "Implement timer countdown effect with wall-clock correction"
Task T026: "Implement Submit Test button and auto-submit flow"
```

## Parallel Example: P2 Stories (After Foundational)

```bash
# All three P2 stories can start simultaneously:
Developer A: US5 — Retake Cooldown (T032–T034)
Developer B: US6 — System Rating (T035–T037)
Developer C: US7 — Test History (T038–T039)
```

---

## Implementation Strategy

### MVP First (User Stories 1–4)

1. Complete Phase 1: Setup (mock data + interfaces)
2. Complete Phase 2: Foundational (services, NgRx, interceptor, routes)
3. Complete Phase 3: US1 — Browse and Start Assessment
4. Complete Phase 4: US2 — Take Timed Assessment
5. Complete Phase 5: US3 — View Score Card
6. Complete Phase 6: US4 — Difficulty-Weighted Scoring
7. **STOP and VALIDATE**: All P1 stories independently working
8. Deploy/demo if ready — core assessment flow is complete

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Users can browse assessments (MVP-1)
3. Add US2 → Test independently → Users can take assessments (MVP-2)
4. Add US3 + US4 → Test independently → Users see scored results (MVP-3)
5. Add US5 → Test independently → Retake with cooldown enforcement
6. Add US6 → Test independently → System rating feeds into overall skill rating
7. Add US7 → Test independently → Full test history visibility
8. Add US8 → Test independently → Responsive across all breakpoints
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 → US2 → US3 → US4 (P1 sequential flow)
   - Developer B: US5 + US6 (P2 cooldown + rating)
   - Developer C: US7 + US8 (P2 history + P3 responsive)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All data via HttpClient + MockApiInterceptor — no direct JSON imports
- Timer uses wall-clock correction (deadline - Date.now()) to handle background tab throttling
- Scoring utilities are pure functions for testability — no Angular DI needed
- In-memory data only — resets on page refresh per mock-first architecture
