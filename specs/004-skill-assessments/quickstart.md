# Quickstart: Skill Assessments Module

**Feature**: 004-skill-assessments  
**Branch**: `004-skill-assessments`  
**Date**: 2026-03-12

---

## Prerequisites

- Phase 1 (Mock Auth & Navigation) — AuthGuard, RoleGuard, session management, app shell
- Phase 2 (Skill Framework) — skill-categories.json, skill-definitions.json data and services
- Phase 3 (Employee Skill Profile) — employee-skills.json services, SkillsState NgRx slice, proficiency level models
- Angular CLI, Node.js 18+ installed

---

## Build Order

### Step 1: Define TypeScript Interfaces

Create the data model interfaces needed by this feature:

1. `src/app/shared/models/skill-exam.model.ts` — `SkillExam`, `ExamQuestion`, `DifficultyLevel`
2. `src/app/shared/models/assessment-attempt.model.ts` — `AssessmentAttempt`
3. `src/app/shared/models/assessment-status.model.ts` — `AssessmentStatus` type
4. `src/app/shared/models/score-card.model.ts` — `ScoreCard` interface

**Verify**: All interfaces compile with TypeScript strict mode.

### Step 2: Create Scoring Utility Functions

1. `src/app/shared/utils/scoring.util.ts` — Pure functions:
   - `calculateWeightedScore(questions, answers)` → `{ earnedPoints, maxPoints, testScore }`
   - `calculateSystemRating(testScore, hasCertification, hasProjectExperience)` → `number`
   - `mapScoreToLevel(scorePercentage)` → `ProficiencyLevel`
   - `calculateLevelChange(previousLevel, newLevel)` → `{ changed, direction }`

2. `src/app/shared/utils/shuffle.util.ts` — Fisher-Yates shuffle:
   - `shuffleArray<T>(array)` → `T[]`

**Verify**: Unit tests for all scoring functions pass — cover boundary values (0%, 40%, 41%, 65%, 66%, 85%, 86%, 100%).

### Step 3: Extend MockApiInterceptor

Update `src/app/core/interceptors/mock-api.interceptor.ts` to handle:

1. `GET /api/skill-exams` → return all exams from skill-exams.json
2. `GET /api/skill-exams/:skillId` → filter by skillId, return 404 if not found
3. `GET /api/skill-test-attempts?userId=&skillId=` → filter by query params
4. `POST /api/skill-test-attempts` → add attempt to in-memory array, generate UUID

**Verify**: Interceptor returns correct data for each URL pattern; 404 for missing exam; 401 for unauthenticated.

### Step 4: Create Assessment Service

`src/app/core/services/assessment.service.ts` — HttpClient wrapper:

1. `getExams()` → `Observable<SkillExam[]>`
2. `getExamBySkillId(skillId)` → `Observable<SkillExam>`
3. `getAttempts(userId, skillId?)` → `Observable<AssessmentAttempt[]>`
4. `submitAttempt(attempt)` → `Observable<AssessmentAttempt>`

**Verify**: Service compiles; methods return correctly-typed observables.

### Step 5: Create NgRx Assessments State

1. `src/app/core/store/assessments/assessments.state.ts` — State interfaces + initial state
2. `src/app/core/store/assessments/assessments.actions.ts` — Actions:
   - `loadExams`, `loadExamsSuccess`, `loadExamsFailure`
   - `loadAttempts`, `loadAttemptsSuccess`, `loadAttemptsFailure`
   - `startAssessment`, `assessmentLoaded`
   - `nextQuestion`, `previousQuestion`, `selectAnswer`
   - `timerTick`, `timerExpired`
   - `submitAssessment`, `assessmentSubmitted`, `assessmentSubmitFailure`
   - `clearActiveAssessment`
3. `src/app/core/store/assessments/assessments.reducer.ts` — Reducer handling all actions
4. `src/app/core/store/assessments/assessments.effects.ts` — Effects:
   - Load exams from service
   - Load attempts from service
   - Start assessment: fetch exam, shuffle questions, set timer deadline
   - Timer: interval-based countdown with wall-clock correction
   - Submit: calculate score, persist attempt, compute system rating, update employee skill
   - Auto-submit on timer expiry
5. `src/app/core/store/assessments/assessments.selectors.ts` — Selectors:
   - `selectExams`, `selectExamBySkillId`
   - `selectAttempts`, `selectAttemptsForSkill`, `selectLatestAttempt`
   - `selectActiveAssessment`, `selectCurrentQuestion`, `selectProgress`, `selectTimerRemaining`
   - `selectCanRetake`, `selectCooldownRemaining`
   - `selectAssessmentStatusBySkill`
   - `selectScoreCard`

**Verify**: Register feature state in app config. Reducer handles initial state and all actions. Selectors return expected derived values.

### Step 6: Create Shared Components

1. `src/app/shared/components/countdown-timer/` — Presentational timer display
   - Input: `remaining` (seconds)
   - Displays MM:SS format; compact badge variant for mobile
2. `src/app/shared/components/progress-bar/` — Question progress indicator
   - Input: `current`, `total`
   - Displays "Question X of Y" with visual bar

**Verify**: Components render correctly with sample inputs. Responsive variants work at mobile breakpoint.

### Step 7: Create Feature Components

1. `src/app/features/assessments/assessments-list/` — Assessments list view
   - Table showing all skills with assessment status
   - "Start Assessment" / "Retake" buttons based on status and cooldown
   - Category and status filters
   - Responsive: desktop table → mobile card list

2. `src/app/features/assessments/take-assessment/` — Assessment runner
   - Single question display with 4 radio-button options
   - Previous / Next navigation
   - Progress bar (Step 6 component)
   - Countdown timer (Step 6 component)
   - Submit Test button
   - Responsive: desktop centered 720px → mobile full-screen + sticky buttons

3. `src/app/features/assessments/assessment-result/` — Score card view
   - Test score with earned/max points
   - Certification bonus status
   - Project experience bonus status
   - System rating result
   - Final rating or "Awaiting manager review"
   - Proficiency level badge
   - Level change indicator

**Verify**: Each component renders, integrates with NgRx store, and responds to breakpoint changes.

### Step 8: Create Feature Routes

`src/app/features/assessments/assessments.routes.ts`:

```typescript
export const ASSESSMENTS_ROUTES: Routes = [
  { path: '', component: AssessmentsListComponent },
  { path: ':skillId/take', component: TakeAssessmentComponent },
  { path: ':skillId/result', component: AssessmentResultComponent },
];
```

Update `src/app/app.routes.ts`:
```typescript
{
  path: 'assessments',
  canActivate: [AuthGuard],
  loadChildren: () => import('./features/assessments/assessments.routes')
    .then(m => m.ASSESSMENTS_ROUTES),
}
```

**Verify**: Routes load lazily; AuthGuard redirects unauthenticated users; navigation between list → take → result works.

### Step 9: Write Unit Tests

Cover the mandatory testing areas from the constitution:

1. **Scoring utility tests** (`scoring.util.spec.ts`):
   - Difficulty weighting: Easy=1, Medium=2, Hard=3
   - Score calculation with all correct, all wrong, mixed answers
   - System rating formula: with/without cert, with/without project exp
   - Level mapping: boundary values at 0%, 40%, 41%, 65%, 66%, 85%, 86%, 100%

2. **Shuffle utility tests** (`shuffle.util.spec.ts`):
   - Output has same elements as input
   - Output length matches input length
   - Returns new array (immutability)

3. **Selector tests** (`assessments.selectors.spec.ts`):
   - `selectCanRetake`: cooldown logic with fresh and expired timestamps
   - `selectCurrentQuestion`: returns correct question based on index
   - `selectScoreCard`: computes correct values

4. **Reducer tests** (`assessments.reducer.spec.ts`):
   - `assessmentLoaded`: sets activeAssessment correctly
   - `selectAnswer`: updates answers record
   - `timerTick`: updates remaining seconds
   - `submitAssessment`: marks as submitted

5. **Component tests**:
   - AssessmentsListComponent: renders skill list, shows correct buttons
   - TakeAssessmentComponent: displays question, handles navigation
   - AssessmentResultComponent: displays score card data

**Verify**: All tests pass with `ng test`. Coverage ≥ 80% on utility functions and selectors.

---

## Verification Checklist

- [ ] TypeScript strict mode passes with no errors
- [ ] All 3 screens render correctly at desktop, tablet, and mobile breakpoints
- [ ] Timer counts down from 15:00 and auto-submits at 0:00
- [ ] Questions are randomized on each assessment start
- [ ] Previous/Next navigation preserves answers
- [ ] Score card shows all required fields after submission
- [ ] Retake cooldown shows hours/minutes remaining message
- [ ] "Assessment not available" message for skills with no exam
- [ ] System rating formula produces correct results
- [ ] Employee skill's systemRating is updated after assessment
- [ ] Test history shows all previous attempts
- [ ] All unit tests pass
- [ ] No ESLint or TypeScript strict mode violations
