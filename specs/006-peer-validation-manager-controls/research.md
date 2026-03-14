# Technical Research: Peer Validation & Manager/Admin Controls

**Feature**: 006-peer-validation-manager-controls  
**Date**: 2026-03-13  
**Status**: Complete  
**Context**: Angular 17+ SPA, NgRx 17+ for state, Angular Material UI, TypeScript strict mode, SCSS, mock-first architecture (no backend), data from JSON via HttpClient interceptors. Depends on Phase 1 (auth/RBAC), Phase 2 (skill library), Phase 3 (skill profiles), Phase 4 (assessments/system rating), Phase 5 (certifications).

---

## 1. Final Rating Calculation with Weight Redistribution

### Decision

Implement the weighted-average formula as a **pure utility function** in `src/app/core/services/rating-calculation.service.ts` (or a standalone `src/app/shared/utils/rating.util.ts`). The function accepts a partial `RatingInput` object (sources may be `null`), dynamically computes redistributed weights for present sources, and returns a `RatingResult` containing the final score, effective weights used, source count, and confidence level.

### Rationale

The weighted-average formula with proportional redistribution is a classic "normalize remaining weights to sum to 1.0" pattern. The key insight is that when a source is absent, its weight doesn't disappear — it's redistributed proportionally to the remaining sources, preserving their relative importance. This is equivalent to: recalculate each present source's effective weight as `originalWeight / sumOfPresentWeights`.

**Base weights (all 4 sources present):**

| Source | Weight |
|---|---|
| Self Rating | 0.20 |
| Manager Rating | 0.30 |
| Peer Rating | 0.15 |
| System Rating | 0.35 |
| **Total** | **1.00** |

**Redistribution formula:**
```
effectiveWeight[i] = baseWeight[i] / Σ(baseWeight[j]) for all present sources j
```

**Edge case verification:**

| Present Sources | Self eff. | Manager eff. | Peer eff. | System eff. |
|---|---|---|---|---|
| All 4 | 0.200 | 0.300 | 0.150 | 0.350 |
| Self + Manager + System (no Peer) | 0.235 | 0.353 | — | 0.412 |
| Self + Manager (2 sources) | 0.400 | 0.600 | — | — |
| Self only (1 source) | 1.000 | — | — | — |
| Manager + System (2 sources) | — | 0.462 | — | 0.538 |
| Manager + Peer + System (no Self) | — | 0.375 | 0.1875 | 0.4375 |

**Implementation pattern:**

```typescript
// rating-calculation.util.ts

interface RatingInput {
  selfRating: number | null;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
}

interface RatingResult {
  finalRating: number;
  sourceCount: number;
  confidence: 'High' | 'Medium' | 'Low';
  effectiveWeights: Record<string, number>;
}

const BASE_WEIGHTS: Record<string, number> = {
  selfRating: 0.20,
  managerRating: 0.30,
  peerRating: 0.15,
  systemRating: 0.35,
};

function calculateFinalRating(input: RatingInput): RatingResult {
  const presentSources = (Object.keys(BASE_WEIGHTS) as (keyof RatingInput)[])
    .filter((key) => input[key] !== null && input[key] !== undefined);

  if (presentSources.length === 0) {
    return { finalRating: 0, sourceCount: 0, confidence: 'Low', effectiveWeights: {} };
  }

  const weightSum = presentSources.reduce((sum, key) => sum + BASE_WEIGHTS[key], 0);

  const effectiveWeights: Record<string, number> = {};
  let finalRating = 0;

  for (const key of presentSources) {
    const effectiveWeight = BASE_WEIGHTS[key] / weightSum;
    effectiveWeights[key] = effectiveWeight;
    finalRating += (input[key] as number) * effectiveWeight;
  }

  const sourceCount = presentSources.length;

  return {
    finalRating: Math.round(finalRating * 1000) / 1000, // 3 decimal places
    sourceCount,
    confidence: sourceCount >= 3 ? 'High' : sourceCount === 2 ? 'Medium' : 'Low',
    effectiveWeights,
  };
}
```

**Why this is clean:**
- **Pure function** — no side effects, no dependencies, trivially testable.
- **Single division** handles all edge cases — the algorithm is identical whether 1, 2, 3, or 4 sources are present. No special-case `if/else` chains.
- **Effective weights always sum to 1.0** — mathematically guaranteed by dividing by `weightSum`.
- **Confidence is derived** from `sourceCount`, not stored separately.
- **Rounding** to 3 decimal places prevents floating-point display artifacts (e.g., `3.4750000000000005`).

**Spec validation against acceptance scenarios:**
- All 4 sources (Self=3, Manager=4, Peer=3, System=3.5): Final = `(3×0.20) + (4×0.30) + (3×0.15) + (3.5×0.35) = 3.475` ✓
- No Peer: weights sum to 0.85 → Self=0.235, Manager=0.353, System=0.412 ✓
- Self + Manager only: weights sum to 0.50 → Self=0.40, Manager=0.60 ✓
- Self only: weight sum = 0.20 → Self=1.0 → Final = Self Rating ✓

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **`if/else` chains per source count** | Brittle — 15 possible combinations of 4 sources (2⁴ − 1). The normalization formula handles all cases in a single loop. Adding a 5th source in the future would require rewriting all branches. |
| **Hardcoded weight lookup table** | Pre-computing weights for all 15 combinations avoids runtime division but is unmaintainable and error-prone. The division `weight / sum` runs in O(n) for n ≤ 4 — performance is irrelevant. |
| **Default fallback values for missing sources** | Substituting a default (e.g., 0 or average of other sources) for missing sources distorts the rating. Redistribution preserves the relative importance of available data without inventing data. |
| **Class-based `RatingCalculator` with DI** | Over-engineered for a pure mathematical function. A class adds constructor, lifecycle, and DI overhead for no benefit. The function can still be wrapped in a service if needed for interceptor injection. |

---

## 2. Peer Validation Workflow State Machine

### Decision

Model the peer validation lifecycle as an **explicit status field** (`PeerValidationStatus` union type) on the `PeerValidationRequest` entity in NgRx state, with **status transitions driven by NgRx actions** in the reducer. Use **date-comparison logic in a selector** to detect 7-day expiry — not a real-time timer. The workflow states are: `'created' → 'notified' → 'awaiting_responses' → 'completed' | 'expired'`.

### Rationale

In a mock-first, frontend-only app with no backend, the workflow state machine must be:
1. **Deterministic** — the same state + action always produces the same next state.
2. **Serializable** — the entire state lives in the NgRx store and can be inspected via DevTools.
3. **Simulatable** — expiry is based on mock dates, not real-time countdowns.

**State machine definition:**

```
                       ┌──────────────────────────────────────┐
                       │                                      ▼
  ┌─────────┐    ┌──────────┐    ┌────────────────────┐    ┌───────────┐
  │ created  │───▶│ notified │───▶│ awaiting_responses │───▶│ completed │
  └─────────┘    └──────────┘    └────────────────────┘    └───────────┘
                                          │
                                          │ (7 days elapsed AND responses < 2)
                                          ▼
                                    ┌──────────┐
                                    │ expired  │
                                    └──────────┘
```

**Transition rules:**

| Current State | Action/Condition | Next State |
|---|---|---|
| `created` | Employee submits peer selection (2–3 peers) | `notified` |
| `notified` | System confirms notifications sent to peers | `awaiting_responses` |
| `awaiting_responses` | Peer submits a response AND total responses ≥ 2 | `completed` |
| `awaiting_responses` | 7 days from creation AND total responses < 2 | `expired` |
| `awaiting_responses` | Peer submits a response AND total responses < 2 | `awaiting_responses` (stay; increment response count) |

**NgRx state shape:**

```typescript
type PeerValidationStatus = 'created' | 'notified' | 'awaiting_responses' | 'completed' | 'expired';

interface PeerValidationRequest {
  id: string;
  submissionId: string;             // Links to the SkillSubmission
  requesterId: string;              // Employee who requested validation
  skillId: string;
  selectedPeerIds: string[];        // 2–3 peer user IDs
  status: PeerValidationStatus;
  createdDate: string;              // ISO date
  responses: PeerResponse[];
}

interface PeerResponse {
  peerId: string;
  rating: number;                   // 1–4
  comment: string | null;
  responseDate: string;             // ISO date
}
```

**Expiry detection via selector (not timer):**

```typescript
const selectPeerValidationWithExpiry = createSelector(
  selectAllPeerValidations,
  (validations): PeerValidationRequest[] =>
    validations.map(v => {
      if (v.status !== 'awaiting_responses') return v;
      const created = new Date(v.createdDate);
      const now = new Date();
      const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 7 && v.responses.length < 2) {
        return { ...v, status: 'expired' as const };
      }
      return v;
    })
);
```

This selector "projects" the expiry status at read-time based on the current date vs. `createdDate`. The underlying store data doesn't need a timer to update — the selector derives it. For mock purposes, pre-configured `createdDate` values in mock data older than 7 days will naturally appear as expired.

**Why NgRx actions + reducer (not XState):**

The project already uses NgRx for all feature state management (Phases 1–5). Introducing XState would:
- Add a new dependency and paradigm that the team must learn.
- Require bridging XState's interpreter with NgRx's store — an integration pattern that adds complexity.
- Be overkill for a 5-state workflow with simple linear transitions.

The NgRx reducer handles state transitions as a straightforward `switch` on action type, with the status field as the state marker. NgRx DevTools already provides time-travel debugging, action log, and state inspection — fulfilling the same debugging needs that XState's visualizer serves.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **XState (formal state machine library)** | Adds a dependency and paradigm mismatch with NgRx. XState excels for complex state machines with parallel states, guards, and invocations — this workflow is a simple linear chain with one branch. Integration with NgRx store requires bridging code. |
| **Real-time `setTimeout`/`setInterval` for 7-day expiry** | The spec says expiry is "simulated via date comparison, not real-time countdown." In a mock app that resets on refresh, a 7-day timer would never fire naturally. Date-comparison in a selector is correct and testable. |
| **BehaviorSubject-based workflow service** | Violates the project constitution (Rule 6: "No BehaviorSubject for global state"). The peer validation state is shared across multiple components (employee initiator, peer responder, manager reviewer) — it must be in NgRx. |
| **Separate NgRx feature slice for peer validation** | Peer validation is tightly coupled to the team/validation feature — the same screens display submissions, peer statuses, and approval workflows. A separate slice would require cross-slice selectors, increasing complexity for no isolation benefit. The peer validation state is a sub-property of the `team` feature slice. |

---

## 3. Role-Scoped Data Filtering in NgRx Selectors

### Decision

Apply role-scoped filtering **at the NgRx selector level**. The mock interceptor returns the full dataset (all employees, all departments), and selectors filter the data by the current user's role and department before it reaches components. This provides a single, auditable filtering layer that is easy to test and matches the mock-first architecture.

### Rationale

There are three possible filtering locations in the Angular/NgRx data flow:

```
[Mock JSON] → [HttpClient/Interceptor] → [NgRx Effect] → [NgRx Store] → [Selector] → [Component]
                     ↑ Option A                               ↑ Option B        ↑ Option C
```

**Evaluation:**

| Criterion | A: Interceptor Level | B: Effect Level | **C: Selector Level (chosen)** |
|---|---|---|---|
| **Mock-first fit** | Interceptor must inspect session context and filter — couples mock logic to business rules | Effect dispatches filtered data to store — store shape varies by role | Store holds full data; selector filters based on role from auth state — clean separation |
| **Testability** | Requires HttpTestingController with session mocking | Testing effects is heavier (marble tests, mock services) | **Selector tests are pure function tests** — pass state in, assert output. Simplest to test. |
| **Role switch without refetch** | Interceptor would need to re-serve data if role context changes | Effect would re-dispatch on role change | **Selector auto-recomputes** when auth state changes — no re-fetch needed |
| **Data availability** | Only role-appropriate data in store — can't derive cross-role views | Same as interceptor | **Full data in store** — Admin dashboards, cross-department analytics, and manager views all derive from the same base data |
| **Security model** | Server-side (real apps); inappropriate for mock-first | N/A | UI-layer filtering is acceptable per the project constitution: "RBAC at UI Layer" |
| **Performance** | Smaller store with pre-filtered data | Same | Full data in store but filtered at memoized selector — NgRx `createSelector` caches results until inputs change. For ≤50 employees, filtering is sub-millisecond. |

**Implementation pattern:**

```typescript
// team.selectors.ts

// Base selector: all employees from store
const selectAllEmployees = createSelector(selectTeamState, (state) => state.employees);

// Auth state selector
const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);

// Role-scoped selector: Manager sees own department, Admin sees all
const selectTeamEmployees = createSelector(
  selectAllEmployees,
  selectCurrentUser,
  (employees, currentUser) => {
    if (!currentUser) return [];
    if (currentUser.role === 'Admin') return employees;
    // Manager: filter to same department
    return employees.filter(e => e.department === currentUser.department);
  }
);
```

**Why NOT interceptor-level filtering for mock-first:**
In a real production app with a backend, server-side filtering (which the interceptor simulates) is the correct security boundary. However, in this mock-first app:
- The interceptor is a testing convenience, not a security boundary.
- Filtering in the interceptor means the store never has the full dataset — this complicates features like admin views that need cross-department data.
- Selector-level filtering is explicitly aligned with Constitution Principle II ("RBAC at UI Layer").

When migrating to a real backend, the selector-level filter remains as a client-side safety net, and the actual security filter moves server-side. The selector logic doesn't need to change.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Interceptor-level filtering** | Couples business rules to mock infrastructure; makes the interceptor complex; prevents Admin from seeing full data without a separate endpoint; harder to test (requires HttpTestingController). |
| **Effect-level filtering** | Effects fetch data and pass it to the store — filtering there means the store shape depends on who's logged in. This complicates state shape, makes selector logic role-unaware, and requires re-fetching on hypothetical role changes. |
| **Component-level filtering** | Violates separation of concerns. Multiple components (team overview, validation queue, employee profile) would each need to implement the same role-check logic. Leads to duplication and inconsistency. |
| **Route resolver or guard-based filtering** | Guards are binary (allow/deny navigation). Resolvers load data for routes but don't own filtering logic — they'd need to call a service that duplicates the selector's role check. Adds an unnecessary indirection layer. |

---

## 4. Peer Eligibility Filtering

### Decision

Implement peer eligibility filtering as an **NgRx selector** that cross-references `users` (from auth/user state) and `employeeSkills` (from skills state) to produce a filtered list of eligible peers. The selector takes the requesting employee's `userId`, `department`, and `skillId` as inputs and returns only users who: (a) are in the same department, (b) have the target skill in their own profile, and (c) are not the requesting employee themselves.

### Rationale

The peer eligibility check requires joining two data sources:
1. **users.json** — provides `department` for each user.
2. **employee-skills.json** — provides the skill list per user.

Since both datasets are already loaded into NgRx state (users in auth/user slice from Phase 1; employee skills in skills slice from Phase 3), the most efficient approach is a memoized selector that joins them. No additional HTTP call is needed.

**Implementation pattern:**

```typescript
// team.selectors.ts

const selectEligiblePeers = (requesterId: string, skillId: string) =>
  createSelector(
    selectAllUsers,           // from auth/user state — all users with department
    selectAllEmployeeSkills,  // from skills state — all employees' skill records
    selectCurrentUser,        // requesting employee
    (users, employeeSkills, currentUser) => {
      if (!currentUser) return [];

      return users.filter(user => {
        // Exclude self
        if (user.id === requesterId) return false;
        // Must be same department
        if (user.department !== currentUser.department) return false;
        // Must have the target skill in their profile
        const userSkills = employeeSkills.find(es => es.userId === user.id);
        if (!userSkills) return false;
        return userSkills.skills.some(
          s => s.skillId === skillId && !s.isDeleted
        );
      });
    }
  );
```

**Performance analysis:**
- users.json contains ~20-50 user records (small org mock data).
- employee-skills.json contains one record per user, each with ~5-15 skills.
- Worst case: 50 users × 15 skills = 750 skill checks — trivially fast (<1ms).
- NgRx `createSelector` memoizes the result — the filter only re-runs when users array, employee skills array, or the requesting user changes.

**Why a selector vs. a service method:**
- The component dispatching the peer selection action needs the eligible list synchronously for the UI dropdown. A selector provides this reactively — as data changes (e.g., another user removes a skill), the eligible list auto-updates.
- A service method would need to manually subscribe to two store slices, combine them, and expose the result — effectively reimplementing what `createSelector` does natively.

**Factory selector pattern:**
The selector uses a factory pattern (`selectEligiblePeers(requesterId, skillId)`) because the `requesterId` and `skillId` are dynamic parameters. This creates a new selector instance per unique parameter combination, each with its own memoization. For this use case (one peer selection dialog at a time), there's only one active instance.

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Filter in the interceptor** (mock API endpoint `/api/peers/eligible?department=X&skillId=Y`) | Adds endpoint complexity to the interceptor for what is a UI-side data join. Both data sources are already in the store. Creating a dedicated API endpoint implies a backend concern that doesn't exist. |
| **Filter in the component** | The component would need to inject the store, select two slices, manually combine them with `combineLatest`, and apply the filter. This is imperative, harder to test, and duplicates logic if multiple components need peer eligibility (e.g., validation detail also shows eligible peers). |
| **Pre-compute in the Effect when loading employee skills** | Would require the Effect to proactively compute eligible peers for every skill × every user combination — massively over-computing for a feature used only when an employee opens the peer selection dialog. |
| **Dedicated eligibility service with caching** | Adds a service layer that duplicates the selector's join + filter logic. Services are stateful (cache management), harder to test than pure selector functions, and redundant when the store already holds both datasets. |

---

## 5. Confidence Indicator Component Pattern

### Decision

Implement the confidence indicator as a **standalone Angular 17 component** (`ConfidenceIndicatorComponent`), not a pipe. The component accepts a `sourceCount` input (1–4) and renders the emoji + text indicator using `@if` control flow.

### Rationale

**Why a component over a pipe:**

| Criterion | Component | Pipe |
|---|---|---|
| **Rendering output** | Full HTML template with styled span, emoji, and text label | Returns a plain string — no styling, no HTML structure |
| **Accessibility** | Can add `aria-label`, `role="status"`, and screenreader-friendly text beyond just the emoji | Pipes produce raw text; ARIA attributes must be added by the consumer — no encapsulation |
| **Reusability** | Drop-in `<app-confidence-indicator [sourceCount]="3" />` — self-contained | `{{ 3 \| confidenceLevel }}` produces text, but every usage site must wrap it with the same styled markup and ARIA attributes |
| **Design system alignment** | Component owns its styles (color, font-size, badge shape) — consistent appearance guaranteed | Consumer controls styling — inconsistency risk across usages |
| **Testing** | Component test: render, query DOM for emoji + text, assert ARIA | Pipe test: simpler (pure transform), but doesn't validate the rendered output consumers must build |
| **Spec requirement** | FR-022 says "indicator MUST display" — implies a visual component, not a text transform | — |

**Implementation:**

```typescript
// confidence-indicator.component.ts
@Component({
  selector: 'app-confidence-indicator',
  standalone: true,
  template: `
    @if (sourceCount >= 3) {
      <span class="confidence high" aria-label="High confidence rating">
        🟢 High Confidence
      </span>
    } @else if (sourceCount === 2) {
      <span class="confidence medium" aria-label="Medium confidence rating">
        🟡 Medium Confidence
      </span>
    } @else {
      <span class="confidence low" aria-label="Low confidence rating">
        🔴 Low Confidence
      </span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfidenceIndicatorComponent {
  @Input({ required: true }) sourceCount!: number;
}
```

**Key design decisions within the component:**
- **`ChangeDetectionStrategy.OnPush`** — the component is purely presentational with a single `@Input`. OnPush ensures Angular skips change detection unless `sourceCount` changes.
- **`@if` control flow** (Angular 17 syntax) — replaces `*ngIf`/`*ngSwitchCase`. Cleaner, built-in, no module imports needed.
- **`aria-label`** on each variant — ensures screenreaders announce the confidence level. The emoji alone is not accessible (screenreaders may read "green circle" or nothing).
- **Text alongside emoji** — FR-022 requires "emoji + text" and the spec notes accessibility: "confidence indicator uses emoji + text (not color alone)."
- **No `@Input` for the label text** — the spec defines exactly three fixed tiers. Making labels configurable adds complexity for a feature with no configurability requirement.

**SCSS (scoped):**

```scss
.confidence {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;

  &.high   { background-color: var(--color-success-light); color: var(--color-success-dark); }
  &.medium { background-color: var(--color-warning-light); color: var(--color-warning-dark); }
  &.low    { background-color: var(--color-error-light);   color: var(--color-error-dark); }
}
```

### Alternatives Considered

| Alternative | Why Not Chosen |
|---|---|
| **Pipe (`confidenceLevel`)** | A pipe transforms data to text (`3 → "🟢 High Confidence"`), but the consumer must handle styling, ARIA, and DOM structure. This creates repetitive template boilerplate at every usage site and risks inconsistency. The spec describes a **visual indicator**, not a text transform. |
| **Directive on a host element** | Directives modify existing elements — they don't own their own template. The confidence indicator is self-contained rendered output, not a behavior modifier. A directive would require the consumer to provide the host element and class bindings, reducing encapsulation. |
| **Component + Pipe hybrid** (pipe computes, component renders) | Over-engineered. The computation (count → tier) is a 3-line `@if` — extracting it into a separate pipe adds a file and indirection for no reuse benefit. If the tier logic is needed outside the component (e.g., in a selector for filtering), it belongs in a utility function, not a pipe. |
| **Signal-based input** (`input.required<number>()`) | Angular 17 signal inputs are available but still in developer preview. The project uses `@Input()` decorator pattern consistently across Phases 1–5. Adopting signal inputs for one component creates inconsistency. Can be migrated when the team adopts signals project-wide. |

---

## Summary of Decisions

| # | Topic | Decision | Key Factor |
|---|---|---|---|
| 1 | Final Rating Calculation | Pure utility function with `weight / sumOfPresentWeights` normalization | Single formula handles all 15 source combinations; no special-case branching |
| 2 | Peer Validation State Machine | NgRx status field + reducer transitions + date-comparison selector for expiry | Consistent with existing NgRx architecture; no new dependencies; expiry via mock dates |
| 3 | Role-Scoped Filtering | NgRx selector-level filtering (store holds full data, selector applies role filter) | Memoized, testable, auto-recomputes on role change, keeps full data available for admin views |
| 4 | Peer Eligibility Filtering | NgRx factory selector joining users + employeeSkills by department and skillId | Both datasets already in store; memoized; reactive to data changes; sub-millisecond for mock scale |
| 5 | Confidence Indicator | Standalone Angular 17 component with OnPush, `@if` control flow, ARIA labels | Encapsulates rendering + styling + accessibility; spec describes a visual indicator, not a text transform |
