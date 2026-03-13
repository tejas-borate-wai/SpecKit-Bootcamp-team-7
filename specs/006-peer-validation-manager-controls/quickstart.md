# Quickstart: Peer Validation & Manager/Admin Controls

**Feature**: 006-peer-validation-manager-controls  
**Date**: 2026-03-13  
**Prerequisites**: Phases 1–5 implemented (auth, skill framework, skill profiles, assessments, certifications)

---

## Build Order

The implementation should follow this dependency-ordered sequence. Each step builds on the previous one.

### Step 1: TypeScript Models & Interfaces

Create the shared TypeScript interfaces in `src/app/shared/models/`:

1. `skill-submission.model.ts` — `SkillSubmission`, `SubmissionStatus` types
2. `peer-validation.model.ts` — `PeerValidationRequest`, `PeerValidationStatus`, `PeerResponse` interfaces
3. `manager-assessment.model.ts` — `ManagerAssessment`, `AdminOverride` interfaces
4. `rating-calculation.model.ts` — `RatingInput`, `RatingResult`, `ConfidenceLevel` types

**Verify**: `ng build` passes with no TypeScript errors; all interfaces compile with strict mode.

---

### Step 2: Rating Calculation Utility

Create `src/app/core/services/rating-calculation.service.ts`:

1. Implement `calculateFinalRating(input: RatingInput): RatingResult` — weighted formula with proportional redistribution
2. Implement `getConfidenceLevel(sourceCount: number): ConfidenceLevel` — derives High/Medium/Low
3. Implement `getProficiencyLevel(finalRating: number): ProficiencyLevel` — maps rating to level via percentage thresholds

**Unit tests** (`rating-calculation.service.spec.ts`):
- All 4 sources present: Self=3, Manager=4, Peer=3, System=3.5 → Final=3.475
- No Peer: weights redistribute to Self=0.235, Manager=0.353, System=0.412
- Only Self + Manager: Self=0.40, Manager=0.60
- Only Self: weight=1.0, Final=Self
- Edge: all sources null → Final=0, confidence=Low
- Confidence: 4→High, 3→High, 2→Medium, 1→Low
- Level mapping: 0–40%→Beginner, 41–65%→Intermediate, 66–85%→Advanced, 86–100%→Expert
- Boundary tests: exactly 40% (Beginner), exactly 41% (Intermediate), exactly 65% (Intermediate), exactly 66% (Advanced), exactly 85% (Advanced), exactly 86% (Expert)

**Verify**: `ng test --include='**/rating-calculation*'` — all tests pass.

---

### Step 3: MockApiInterceptor Extensions

Extend `src/app/core/interceptors/mock-api.interceptor.ts` with new URL patterns:

1. `GET /api/team/employees` — returns team members with computed summary metrics
2. `GET /api/team/employees/:userId` — returns employee skill profile with all ratings
3. `GET /api/team/validation-queue` — returns Pending submissions (department-filtered for Manager)
4. `GET /api/team/validation-queue/:submissionId` — returns full submission detail with evidence
5. `POST /api/team/validation-queue/:submissionId/approve` — approval with rating + final calculation
6. `POST /api/team/validation-queue/:submissionId/reject` — rejection with mandatory reason
7. `POST /api/team/validation-queue/:submissionId/override` — admin override with justification
8. `POST /api/peer-validation/request` — create peer validation request
9. `GET /api/peer-validation/eligible-peers/:skillId` — eligible peers list
10. `POST /api/peer-validation/:requestId/respond` — peer response submission

Add in-memory peer validation seed data (2–3 pre-populated requests with responses for demo).

**Verify**: Manual test via service injection in a test — interceptor returns expected data shapes.

---

### Step 4: NgRx Team Feature State

Create `src/app/core/store/team/`:

1. `team.state.ts` — `TeamState` interface definition
2. `team.actions.ts` — Load employees, load queue, approve, reject, override, peer request/response actions
3. `team.reducer.ts` — State transitions for all actions
4. `team.effects.ts` — HTTP calls via services → dispatches success/failure actions
5. `team.selectors.ts` — Selectors including:
   - `selectTeamEmployees` (role-scoped: Manager=department, Admin=all)
   - `selectValidationQueue` (role-scoped)
   - `selectSelectedSubmission`
   - `selectEligiblePeers(requesterId, skillId)` (factory selector)
   - `selectPeerValidationWithExpiry` (date-comparison for 7-day expiry)

Register the team feature slice in the app store.

**Unit tests** (`team.selectors.spec.ts`, `team.reducer.spec.ts`):
- Selector: Manager sees own department only; Admin sees all
- Selector: eligible peers filtered by department + skillId
- Selector: peer validation expiry detection (>7 days + <2 responses → expired)
- Reducer: approve action updates status, sets managerRating, computes finalRating
- Reducer: reject action updates status, stores rejectionReason

**Verify**: `ng test --include='**/team*'` — all tests pass.

---

### Step 5: Team Service & Peer Validation Service

Create services in `src/app/core/services/`:

1. `team.service.ts` — HttpClient calls for all /api/team/** endpoints
2. `peer-validation.service.ts` — HttpClient calls for all /api/peer-validation/** endpoints

Both services return `Observable<T>` — they are consumed by NgRx effects, not directly by components.

**Verify**: Services compile; effects dispatch correct actions on success/failure.

---

### Step 6: Shared Components

Create in `src/app/shared/components/`:

1. `confidence-indicator/` — Standalone component: accepts `sourceCount` input, renders 🟢/🟡/🔴 with text and ARIA label

**Unit tests** (`confidence-indicator.component.spec.ts`):
- sourceCount=4 → renders "🟢 High Confidence"
- sourceCount=3 → renders "🟢 High Confidence"
- sourceCount=2 → renders "🟡 Medium Confidence"
- sourceCount=1 → renders "🔴 Low Confidence"
- Verify aria-labels present

**Verify**: `ng test --include='**/confidence-indicator*'` — all tests pass.

---

### Step 7: Team Skills Overview Screen

Create `src/app/features/team/team-skills-overview/`:

1. Standalone component with sortable/filterable table
2. Columns: Employee Name, Department, Skills Count, Avg Rating, Profile Completion %, Actions
3. Actions: "View Profile" link → `/team/skills/:employeeId`, "Send Validation Request" button
4. Responsive: desktop=full table, tablet=condensed columns, mobile=card list
5. Empty state for no employees
6. Loading spinner while data loads

**Verify**: Navigate to /team/skills as Manager → sees own team. As Admin → sees all. As Employee → redirected to /unauthorized.

---

### Step 8: Employee Skill Profile Screen (Team View)

Create `src/app/features/team/employee-profile/`:

1. Standalone component showing all skills with full rating details
2. Each skill row: Skill Name, Self/Manager/Peer/System/Final ratings, Level badge, Status pill, Confidence indicator
3. Back button to team skills overview
4. Responsive layout

**Verify**: Click "View Profile" from team overview → profile loads with correct data and confidence indicators.

---

### Step 9: Validation Queue Screen

Create `src/app/features/team/validation-queue/`:

1. Standalone component with sortable list of pending submissions
2. Sortable by: employee name, skill name, submit date
3. Each row: Employee name, Skill name, Self Rating, Submit Date, Status, Actions
4. Manager: "Approve" and "Reject" buttons visible (own team only)
5. Admin: "Approve", "Reject", and "Override Rating" buttons visible (all employees)
6. "Override Rating" button NOT in DOM for non-Admin roles
7. Click row → navigates to validation detail
8. Loading/empty states

**Verify**: Manager sees own team submissions; Admin sees all. "Override Rating" absent in DOM inspection for Manager. Sorting works.

---

### Step 10: Validation Detail Screen

Create `src/app/features/team/validation-detail/`:

1. Standalone component showing full submission detail
2. Display: Employee name, Skill name, Self Rating, Certification evidence, Project experience
3. Peer validation section: peer responses with ratings and comments
4. Manager Rating input (1–4 scale)
5. "Approve" button → triggers final rating calculation → updates store → notification
6. "Reject" button → shows mandatory rejection reason field → updates store → notification
7. "Override Rating" (Admin only) → form with rating (1–4) + mandatory justification
8. Confirmation dialogs for approve/reject/override actions
9. Responsive form layout

**Unit tests**:
- Approve: dispatches correct action, final rating computed
- Reject without reason: validation error shown
- Override without justification: validation error shown
- Override button absent for Manager role (DOM check)

**Verify**: Full approve/reject/override workflow works end-to-end with correct notifications.

---

### Step 11: Peer Validation Form

Create `src/app/features/team/peer-validation-form/`:

1. Standalone component (modal or inline) for initiating and responding to peer validation
2. **Initiation mode**: Employee selects 2–3 peers from eligible list (filtered by department + skill)
   - Peer selection dropdown/chips showing eligible peers
   - Validation: min 2, max 3 peers
   - Submit → creates PeerValidationRequest → notifies peers
3. **Response mode**: Peer submits rating (1–4) with optional comment
   - Rating selector (radio buttons or star rating)
   - Optional comment textarea
   - Submit → adds PeerResponse → notifies requester

**Unit tests**:
- Eligible peers correctly filtered
- Cannot submit with <2 peers selected
- Cannot select >3 peers
- Peer rating required (validation error if missing)

**Verify**: Employee can initiate peer validation; peers receive notifications; peer can submit rating.

---

### Step 12: Route Configuration

Update `src/app/features/team/team.routes.ts`:

```typescript
export const TEAM_ROUTES: Route[] = [
  { path: '', component: TeamSkillsOverviewComponent },
  { path: 'skills/:employeeId', component: EmployeeProfileComponent },
  { path: 'validation', component: ValidationQueueComponent },
  { path: 'validation/:submissionId', component: ValidationDetailComponent },
];
```

Update `src/app/app.routes.ts`:

```typescript
{
  path: 'team',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Manager', 'Admin'] },
  loadChildren: () => import('./features/team/team.routes').then(m => m.TEAM_ROUTES)
}
```

**Verify**: All team routes are lazy-loaded and guarded. Employee role → 403 redirect. Deep linking works.

---

### Step 13: Integration Testing & Polish

1. Full workflow test: Employee submits skill → peer validation → manager approval → final rating computed
2. Weight redistribution test: approve with missing peer rating → verify correct redistribution
3. Admin override test: override previously approved rating → verify audit trail preservation
4. Verify notifications generated for all events (approval, rejection, peer request, peer completion)
5. Responsive testing at 375px, 768px, 1280px, 1440px
6. Accessibility: keyboard navigation through validation queue, approve/reject flow
7. Edge cases: expired peer validation (>7 days), all peers decline, concurrent approval

**Verify**: `ng test` — all unit tests pass. `ng build --configuration=production` — clean build.

---

## Key Files Created/Modified

| File | Action | Purpose |
|---|---|---|
| `src/app/shared/models/skill-submission.model.ts` | Create | SkillSubmission, SubmissionStatus |
| `src/app/shared/models/peer-validation.model.ts` | Create | PeerValidationRequest, PeerResponse |
| `src/app/shared/models/manager-assessment.model.ts` | Create | ManagerAssessment, AdminOverride |
| `src/app/shared/models/rating-calculation.model.ts` | Create | RatingInput, RatingResult, ConfidenceLevel |
| `src/app/core/services/rating-calculation.service.ts` | Create | Final rating formula, weight redistribution |
| `src/app/core/services/team.service.ts` | Create | Team skills + validation HTTP calls |
| `src/app/core/services/peer-validation.service.ts` | Create | Peer validation HTTP calls |
| `src/app/core/interceptors/mock-api.interceptor.ts` | Modify | Add 10 new URL patterns |
| `src/app/core/store/team/` | Create | NgRx state, actions, reducer, effects, selectors |
| `src/app/shared/components/confidence-indicator/` | Create | 🟢🟡🔴 indicator component |
| `src/app/features/team/team-skills-overview/` | Create | Team overview table |
| `src/app/features/team/employee-profile/` | Create | Employee skill profile from team |
| `src/app/features/team/validation-queue/` | Create | Pending submissions list |
| `src/app/features/team/validation-detail/` | Create | Full submission review + approve/reject |
| `src/app/features/team/peer-validation-form/` | Create | Peer selection & rating form |
| `src/app/features/team/team.routes.ts` | Create | Team feature routes |
| `src/app/app.routes.ts` | Modify | Add team lazy route |
| `src/app/core/services/notification.service.ts` | Modify | Add approval/rejection/peer notification types |
