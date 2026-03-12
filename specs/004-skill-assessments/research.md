# Technical Research: Skill Assessments Module

**Feature Branch**: `004-skill-assessments`  
**Date**: 2026-03-12  
**Context**: Angular 17+ SPA, NgRx for state, Angular Material UI, SCSS, TypeScript strict mode, mock-first (no backend), data from JSON via HttpClient interceptors.

---

## 1. Timer Implementation Strategy

### Decision

Use **RxJS `timer()` + `interval()`** with a per-second tick managed inside an NgRx Effect (or a dedicated `TimerService`), storing remaining seconds in NgRx state. The countdown-timer component reads state via a selector and is purely presentational. Auto-submit is dispatched as an NgRx action when remaining seconds reach 0.

### Rationale

| Criterion | RxJS `timer`/`interval` | `setInterval` |
|---|---|---|
| **Angular integration** | First-class; observables compose with Angular's change detection and `takeUntilDestroyed()` | Requires manual `clearInterval` in `ngOnDestroy`; easy to leak |
| **Lifecycle cleanup** | `takeUntilDestroyed(destroyRef)` (Angular 17) or `takeUntil(destroy$)` auto-cleans | Must track interval ID and manually clear |
| **Testability** | Controllable with `fakeAsync` / `TestScheduler`; no real timers needed | `fakeAsync` + `tick()` works but less idiomatic |
| **Accuracy** | Same JS event-loop accuracy as `setInterval`; both drift ~1-4ms per tick — acceptable for a 15-min exam timer | Same |
| **Background tab behavior** | Modern browsers throttle both `setInterval` and RxJS `interval` to ≥1 s in background tabs. **Mitigation**: store `startTimestamp` (epoch ms) in NgRx state and compute remaining time as `deadline - Date.now()` on each tick. This self-corrects drift regardless of throttling. | Same throttling; same mitigation needed |
| **Composability** | Can pipe through `map`, `filter`, `switchMap`, `takeWhile` — e.g., `takeWhile(sec => sec > 0)` then `finalize(() => dispatch(autoSubmit()))` | Callback-only; conditional logic is imperative |

**Background-tab self-correction pattern:**

```typescript
// In effect or service
const deadline = Date.now() + 15 * 60 * 1000;
interval(1000).pipe(
  map(() => Math.max(0, Math.ceil((deadline - Date.now()) / 1000))),
  distinctUntilChanged(),
  takeWhile(remaining => remaining > 0, true), // inclusive: emits 0
  takeUntilDestroyed(this.destroyRef),
).subscribe(remaining => {
  store.dispatch(assessmentActions.timerTick({ remaining }));
  if (remaining === 0) {
    store.dispatch(assessmentActions.autoSubmit());
  }
});
```

This approach ensures the timer is always accurate — even if the user switches to another tab for 5 minutes, the remaining time is correct when they return because it's computed from the wall clock, not accumulated ticks.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **`setInterval` directly in component** | Imperative; harder lifecycle cleanup; doesn't compose with NgRx or RxJS streams; no advantage over `interval()`. |
| **Web Workers for timer** | Over-engineered for a 1-second polling UI timer; adds complexity with no real accuracy benefit since we self-correct via `Date.now()`. |
| **`requestAnimationFrame`** | Pauses entirely in background tabs — worse than `interval` for this use case. |
| **Store only deadline in NgRx, compute in template via `async` pipe** | Creates a tight coupling between the template and `Date.now()` polling; better to let the effect push updates. |

---

## 2. Question Randomization

### Decision

Use the **Fisher-Yates (Knuth) shuffle** algorithm implemented as a **pure utility function** in `src/app/shared/utils/shuffle.util.ts`. Invoke it inside the NgRx **Effect** that handles assessment start (after questions are loaded from the interceptor), storing the shuffled order in NgRx state. Use **true random** (no seed), since reproducibility across sessions is not required.

### Rationale

| Criterion | Fisher-Yates Shuffle | `Array.sort(() => Math.random() - 0.5)` |
|---|---|---|
| **Correctness** | O(n), produces uniformly distributed permutations guaranteed | **Not uniform**; sort-based shuffle produces biased distributions because comparison-based sorting with a non-transitive comparator is undefined behavior |
| **Performance** | O(n) in-place — for 5–10 questions, both are instant | O(n log n) — negligible for small arrays, but algorithmically worse |
| **Well-established** | Textbook algorithm; used by lodash `_.shuffle`, standard libraries | Known anti-pattern; MDN and ESLint plugins warn against it |

**Implementation:**

```typescript
// shared/utils/shuffle.util.ts
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**Where to invoke — NgRx Effect:**

```typescript
// assessments.effects.ts
startAssessment$ = createEffect(() =>
  this.actions$.pipe(
    ofType(assessmentActions.startAssessment),
    switchMap(({ skillId }) =>
      this.assessmentService.getExam(skillId).pipe(
        map(exam => assessmentActions.assessmentLoaded({
          exam,
          shuffledQuestions: shuffleArray(exam.questions),
        })),
      ),
    ),
  ),
);
```

Placing randomization in the Effect (not the component, not a selector) ensures:
- The shuffle happens **once** when the assessment starts, not on every re-render.
- The shuffled order is stored in NgRx state, so Previous/Next navigation always sees a stable order.
- The component remains purely presentational.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Seed-based PRNG (e.g., `seedrandom`)** | Only needed if we want reproducible question order across sessions (e.g., for cheating prevention or debugging). Spec says "randomized on each attempt" with no reproducibility requirement. Adds a dependency for no benefit. |
| **Shuffle in component `ngOnInit`** | Couples logic to the component lifecycle; harder to test; breaks if component re-initializes. |
| **Shuffle in selector** | Selectors should be pure and memoized. A shuffle in a selector would either re-shuffle on every state change (bad) or require memoization tricks that defeat the purpose. |
| **Shuffle in service** | Acceptable, but since the Effect already orchestrates data loading, adding the shuffle there keeps the flow centralized. |

---

## 3. Assessment State Management with NgRx

### Decision

Create a **dedicated `activeAssessment` sub-slice** within the existing `assessments` feature state. This keeps all assessment-related state in a single NgRx feature while cleanly separating the transient exam session state from the persistent data (exam catalog, test history).

### Rationale

A single `assessments` feature slice avoids registering multiple feature states and keeps related actions, reducers, and selectors co-located. However, the active assessment session (current question, answers, timer) is fundamentally different from the exam catalog and history — it's transient, exists only during an active exam, and should be clearable in one action.

**Recommended state shape:**

```typescript
// assessments.state.ts
export interface AssessmentsState {
  // --- Persistent data (survives navigation within the session) ---
  exams: SkillExam[];                     // All available exams from JSON
  attempts: AssessmentAttempt[];          // All past attempts from JSON
  examsLoading: boolean;
  attemptsLoading: boolean;
  error: string | null;

  // --- Transient session data (lives only during an active exam) ---
  activeAssessment: ActiveAssessmentState | null;
}

export interface ActiveAssessmentState {
  skillId: string;
  exam: SkillExam;
  shuffledQuestionIds: string[];          // Order of question IDs after shuffle
  currentQuestionIndex: number;           // 0-based
  answers: Record<string, string>;        // { [questionId]: selectedOptionId }
  timerDeadline: number;                  // epoch ms — when the timer expires
  timerRemaining: number;                 // seconds remaining (updated by effect)
  submitted: boolean;                     // prevents double-submit
}
```

**Key design decisions within this shape:**

| Decision | Rationale |
|---|---|
| `activeAssessment: ... \| null` | `null` = no active exam. Easy guard check. One `clearActiveAssessment` action resets everything. |
| `answers` as `Record<string, string>` | O(1) lookup by question ID. Supports sparse answers (unanswered questions simply have no key). Easy to count answered questions. |
| `shuffledQuestionIds` instead of full question objects | Avoids duplicating question data. Selectors join `shuffledQuestionIds[currentQuestionIndex]` with `exam.questions` to get the current question. |
| `timerDeadline` (epoch ms) | Immutable once set. The Effect computes `timerRemaining` from `deadline - Date.now()` each tick. Survives NgRx DevTools time-travel. |
| `submitted` flag | Prevents the auto-submit effect from firing after a manual submit (or vice versa). |

**Selectors:**

```typescript
export const selectCurrentQuestion = createSelector(
  selectActiveAssessment,
  (active) => {
    if (!active) return null;
    const questionId = active.shuffledQuestionIds[active.currentQuestionIndex];
    return active.exam.questions.find(q => q.id === questionId) ?? null;
  },
);

export const selectSelectedAnswer = createSelector(
  selectActiveAssessment,
  selectCurrentQuestion,
  (active, question) => question ? active?.answers[question.id] ?? null : null,
);

export const selectProgress = createSelector(
  selectActiveAssessment,
  (active) => active
    ? { current: active.currentQuestionIndex + 1, total: active.shuffledQuestionIds.length }
    : null,
);

export const selectTimerRemaining = createSelector(
  selectActiveAssessment,
  (active) => active?.timerRemaining ?? 0,
);
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Separate `activeAssessment` feature slice** (`StoreModule.forFeature('activeAssessment', ...)`) | Over-segmented; the active exam is logically part of the assessments domain. Separate feature slices add registration boilerplate and split related selectors across modules. |
| **Flat state (no nesting)** | Mixing transient session fields (`currentQuestionIndex`, `timerRemaining`) at the same level as persistent data (`exams`, `attempts`) makes it hard to clear session state cleanly. |
| **Answers as `Map<string, string>`** | `Map` is not serializable — breaks NgRx DevTools, store freeze, and time-travel debugging. `Record` (plain object) is serializable and works identically for this use case. |
| **Store full question objects in `shuffledQuestions[]`** | Duplicates data already in `exam.questions`. If questions were ever updated (not applicable here, but good practice), you'd have stale copies in two places. |
| **ComponentStore / signal-based local state** | Viable for component-scoped state, but the spec mandates NgRx for shared state. The timer Effect and auto-submit logic need access to the store. Using ComponentStore alongside NgRx adds two state management paradigms. |

---

## 4. Score Calculation Architecture

### Decision

Implement scoring logic as **pure utility functions** in `src/app/shared/utils/scoring.util.ts` and expose derived values via **NgRx selectors**. No Angular service is needed for pure calculations.

### Rationale

The scoring logic involves three calculations, all of which are pure functions (input → output, no side effects, no dependencies on services):

1. **Difficulty-weighted score**: `(earnedPoints / maxPoints) × 100`  
2. **System rating**: `(testScore × 0.60) + (certBonus × 0.20) + (projectExpBonus × 0.20)`  
3. **Level mapping**: score range → proficiency level (Beginner/Intermediate/Advanced/Expert)

Pure functions are the simplest, most testable, and most reusable pattern for stateless calculations:

```typescript
// shared/utils/scoring.util.ts

export const DIFFICULTY_POINTS: Record<DifficultyLevel, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function calculateWeightedScore(
  questions: ExamQuestion[],
  answers: Record<string, string>,
): { earned: number; max: number; percentage: number } {
  let earned = 0;
  let max = 0;
  for (const q of questions) {
    const points = DIFFICULTY_POINTS[q.difficultyLevel];
    max += points;
    if (answers[q.id] === q.correctOptionId) {
      earned += points;
    }
  }
  return { earned, max, percentage: max > 0 ? (earned / max) * 100 : 0 };
}

export function calculateSystemRating(
  testScorePercent: number,
  hasCertification: boolean,
  hasProjectExperience: boolean,
): number {
  const certBonus = hasCertification ? 100 : 0;
  const projectBonus = hasProjectExperience ? 100 : 0;
  return (testScorePercent * 0.60) + (certBonus * 0.20) + (projectBonus * 0.20);
}

export function mapScoreToLevel(systemRating: number): ProficiencyLevel {
  if (systemRating >= 90) return 'Expert';
  if (systemRating >= 70) return 'Advanced';
  if (systemRating >= 40) return 'Intermediate';
  return 'Beginner';
}
```

**NgRx selectors** call these utility functions to derive score data for the result screen:

```typescript
export const selectScoreCard = createSelector(
  selectActiveAssessment,
  selectCertificationForSkill,
  selectProjectExperienceForSkill,
  (active, hasCert, hasProject) => {
    if (!active || !active.submitted) return null;
    const { earned, max, percentage } = calculateWeightedScore(
      active.exam.questions, active.answers,
    );
    const systemRating = calculateSystemRating(percentage, hasCert, hasProject);
    const level = mapScoreToLevel(systemRating);
    return { earned, max, percentage, systemRating, level, hasCert, hasProject };
  },
);
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Angular service (`ScoringService`)** | These functions have no dependencies (no `HttpClient`, no DI tokens, no state). Wrapping them in a service adds DI boilerplate, makes them harder to use in selectors (selectors can't inject services), and violates the principle of keeping pure logic outside the DI container. |
| **Logic inside NgRx reducer** | Reducers should handle state transitions, not business calculations. Embedding scoring formulas in the reducer makes it harder to unit test the formula in isolation and bloats the reducer. |
| **Logic inside NgRx Effect** | Effects are for side effects (HTTP calls, navigation, timer). Score calculation is synchronous and pure — a selector composed with pure utility functions is the correct NgRx pattern. |
| **Logic inside component** | Violates separation of concerns. The component should receive a computed score card from a selector and render it. |

---

## 5. Retake Cooldown Enforcement

### Decision

Store the **`completedAt` timestamp** (ISO 8601 string or epoch ms) on each `AssessmentAttempt` record in the NgRx store. Compute cooldown eligibility via an **NgRx selector** that compares the most recent attempt's `completedAt` against `Date.now()`. Accept that **cooldown resets on page refresh** since all data reloads from static JSON.

### Rationale

**Timestamp comparison strategy:**

```typescript
export const selectRetakeCooldown = (skillId: string) => createSelector(
  selectAttemptsBySkill(skillId),
  (attempts): { canRetake: boolean; remainingMs: number } => {
    if (attempts.length === 0) return { canRetake: true, remainingMs: 0 };

    const lastAttempt = attempts.reduce((latest, a) =>
      a.completedAt > latest.completedAt ? a : latest
    );

    const cooldownEnd = new Date(lastAttempt.completedAt).getTime() + 24 * 60 * 60 * 1000;
    const remainingMs = Math.max(0, cooldownEnd - Date.now());

    return {
      canRetake: remainingMs === 0,
      remainingMs,
    };
  },
);
```

**Display formatting (in component or pipe):**

```typescript
function formatCooldownRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `You can retake this assessment in ${hours} hours ${minutes} minutes.`;
}
```

**What happens on page refresh:**
- All data reloads from `skill-test-attempts.json` (static JSON).
- If the JSON contains no record of the in-session attempt (since in-memory CRUD doesn't persist to disk), the cooldown resets — the user can retake immediately.
- This is **accepted and documented** as a known limitation of the mock-first architecture. The spec's edge cases section confirms: "No mid-test persistence across page refreshes."
- When a real backend is added, the cooldown will be enforced server-side with persisted timestamps.

**Guard layer:** Beyond the selector, add a check in the NgRx Effect that handles `startAssessment` — if cooldown hasn't passed, dispatch a `cooldownActive` action instead of starting the exam. This prevents bypassing the UI-level disable on the button.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **`localStorage` / `sessionStorage` persistence** | Would survive refresh, but violates the mock-first architecture principle (all data through interceptors/NgRx). Introduces a second data source that can desync with the store. If we persist cooldowns but not exam data, the UX is inconsistent. |
| **Cookie-based timestamp** | Same issues as `localStorage` plus additional concerns around cookie size limits and SameSite policies. |
| **Service with `BehaviorSubject`** | Constitution rule: "No BehaviorSubject for global state." NgRx is mandatory for shared state. |
| **Relative time comparison (track elapsed time)** | Fragile — requires a running timer. Epoch comparison is simpler and handles any gap (background tab, sleep, etc.) correctly. |

---

## 6. Responsive Assessment Layout

### Decision

Use **Angular CDK `BreakpointObserver`** to detect the active breakpoint and expose it as an observable (consumed via `async` pipe or signal). Use **SCSS with centralized breakpoint variables** (`_breakpoints.scss`) for layout-specific styles. Combine both: `BreakpointObserver` drives **structural** differences (e.g., sticky button placement, compact timer badge), while SCSS media queries handle **visual** adjustments (widths, padding, font sizes).

### Rationale

**Breakpoint definitions (aligned with spec and existing project conventions):**

| Breakpoint | Width | Layout |
|---|---|---|
| Desktop | ≥ 1024px | Question card centered, max-width 720px; timer top-right; progress bar full-width |
| Tablet | 768px – 1023px | Question card full-width with padding; larger tap targets (48px min) |
| Mobile | < 768px | Full-screen card; stacked answer options; compact timer badge; sticky Previous/Next buttons at viewport bottom |

**BreakpointObserver in component:**

```typescript
// take-assessment.component.ts
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

private breakpointObserver = inject(BreakpointObserver);

// Custom breakpoints matching the project's _breakpoints.scss
isMobile$ = this.breakpointObserver.observe('(max-width: 767px)')
  .pipe(map(result => result.matches));

isTablet$ = this.breakpointObserver.observe(
  '(min-width: 768px) and (max-width: 1023px)'
).pipe(map(result => result.matches));
```

**SCSS structure:**

```scss
// take-assessment.component.scss
@use 'styles/breakpoints' as bp;

.assessment-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
}

.nav-buttons {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 16px 0;
}

@media (max-width: bp.$mobile-max) {                 // < 768px
  .assessment-container {
    max-width: 100%;
    padding: 16px;
    min-height: 100vh;
  }

  .answer-option {
    width: 100%;                                      // stacked vertically
  }

  .countdown-timer {
    font-size: 0.875rem;                              // compact badge
    padding: 4px 8px;
    border-radius: 12px;
  }

  .nav-buttons {
    position: sticky;
    bottom: 0;
    background: var(--surface-color);
    padding: 12px 16px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;

    button {
      flex: 1;                                        // full-width buttons
      min-height: 48px;                               // accessible tap target
    }
  }
}

@media (min-width: bp.$tablet-min) and (max-width: bp.$tablet-max) {  // 768–1023px
  .assessment-container {
    max-width: 100%;
    padding: 24px 32px;
  }

  .answer-option {
    min-height: 48px;                                 // larger tap targets
  }
}
```

**Why combine `BreakpointObserver` + SCSS media queries:**

| Concern | Tool |
|---|---|
| Structural template changes (`*ngIf` / `@if` to show/hide elements, swap layouts) | `BreakpointObserver` → observable → template binding |
| Visual adjustments (spacing, widths, font sizes, colors) | SCSS `@media` queries with shared breakpoint variables |

Using `BreakpointObserver` alone would require putting all responsive logic in TypeScript, losing the declarative power of CSS media queries. Using SCSS alone would require CSS-only solutions for structural changes (hiding/showing elements purely with `display:none` instead of not rendering them), which hurts performance and accessibility. The combination gives the best of both worlds.

**Sticky buttons implementation detail:** The `position: sticky; bottom: 0` approach is preferred over `position: fixed` because:
- It participates in the document flow (no overlap issues).
- It naturally unsticks when the user scrolls past the button area.
- Works within Angular Material's `mat-sidenav-content` container without z-index conflicts.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **SCSS-only (no `BreakpointObserver`)** | Cannot conditionally render template blocks or change component behavior based on viewport. Would need to use `display: none` for structural changes, which still renders the DOM and runs change detection. |
| **`BreakpointObserver`-only (no SCSS media queries)** | Would require applying all responsive styles via `[ngClass]` or `[style]` bindings, which is verbose, harder to maintain, and doesn't leverage browser-native media query performance. |
| **Tailwind CSS utility classes** | Project uses SCSS with design tokens and Angular Material — introducing Tailwind would add a conflicting styling paradigm. Project constitution enforces "SCSS only." |
| **CSS Container Queries** | Modern and useful for component-level responsive design, but browser support is still maturing and the team's existing pattern uses viewport-based `@media` queries. Could be adopted later. |
| **`window.matchMedia` directly** | Lower-level API that `BreakpointObserver` wraps. Using it directly loses CDK's subscription management, zone integration, and multi-query support. |

---

## Summary Table

| # | Topic | Decision | Key Tradeoff |
|---|---|---|---|
| 1 | Timer | RxJS `interval` + `Date.now()` self-correction, state in NgRx | Accuracy vs. complexity → wall-clock comparison eliminates drift |
| 2 | Randomization | Fisher-Yates in a pure utility, invoked in NgRx Effect | Correctness vs. simplicity → Fisher-Yates is both correct and simple |
| 3 | State Shape | `activeAssessment` sub-object within `assessments` feature slice | Granularity vs. cohesion → single feature slice with nested transient state |
| 4 | Scoring | Pure utility functions + NgRx selectors | Service vs. function → pure functions are simpler, more testable, selector-compatible |
| 5 | Retake Cooldown | Timestamp comparison in selector; resets on refresh (accepted) | Persistence vs. architecture → mock-first constraints accepted |
| 6 | Responsive Layout | CDK `BreakpointObserver` (structural) + SCSS media queries (visual) | Single tool vs. dual approach → each tool handles what it's best at |
