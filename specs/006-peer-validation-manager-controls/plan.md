# Implementation Plan: Peer Validation & Manager/Admin Controls

**Branch**: `006-peer-validation-manager-controls` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-peer-validation-manager-controls/spec.md`

## Summary

Implement the Peer Validation and Manager/Admin Controls module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers: a Team Skills Overview screen showing employees in the manager's/admin's scope with summary metrics, a Skill Validation Queue with sortable pending skill submissions, a Validation Detail screen for manager/admin to approve or reject skills with mandatory rejection reasons, an admin-only Override Rating control with documented justification, a peer validation workflow where employees select 2–3 eligible peers who submit proficiency ratings (1–4), peer rating aggregation with minimum 2-response threshold and 7-day expiry with proportional weight redistribution, Employee Skill Profile view from team context with full ratings and confidence indicators, and automatic final rating calculation on approval using the weighted formula: Final = (Self×0.20) + (Manager×0.30) + (Peer×0.15) + (System×0.35). All data served via HttpClient interceptors from employee-skills.json, users.json, and notifications.json mock files — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Animations, Angular Router (AuthGuard + RoleGuard)  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, users.json, notifications.json, skill-definitions.json, certifications.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Team skills table render < 2 seconds for up to 50 employees; validation queue load < 1 second; final rating calculation < 100ms; 60 fps animations  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); depends on Phase 1 (auth/guards), Phase 2 (skill library), Phase 3 (skill profile data), Phase 4 (assessment/system rating), Phase 5 (certifications); peer validation 7-day expiry is simulated via date comparison, not real-time countdown  
**Scale/Scope**: 4 screens (/team/skills, /team/skills/:employeeId, /team/validation, /team/validation/:submissionId), plus peer validation form modal, 26 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All data from employee-skills.json, users.json, notifications.json via HttpClient + MockApiInterceptor; no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | /team/** routes guarded by AuthGuard + RoleGuard(['Manager','Admin']); "Override Rating" button removed from DOM for non-Admin roles via `@if`; Manager sees own team only; Admin sees all |
| III | State Management (NgRx) | ✅ PASS | Team skills and validation queue in NgRx feature slice (teamSkills); peer validation state in NgRx; components use selectors; effects handle HTTP calls; no BehaviorSubject for shared state |
| IV | Responsive Design | ✅ PASS | Team skills table adapts: desktop=full table, tablet=condensed columns, mobile=card list; validation detail responsive form; BreakpointObserver + SCSS breakpoint variables |
| V | Test Coverage | ✅ PASS | Unit tests planned for: final rating formula with all sources, weight redistribution with missing sources, peer rating aggregation, 7-day expiry logic, confidence indicator logic, eligible peer filtering, min/max peer count validation |
| VI | Error Handling | ✅ PASS | Rejection reason mandatory validation; override justification mandatory; peer count validation (2–3); empty validation queue state; loading spinners for data fetch; 403 for unauthorized access |
| VII | Accessibility | ✅ PASS | aria-labels on approve/reject/override buttons; rating selectors accessible; confidence indicator uses emoji + text (not color alone); 44×44px touch targets; prefers-reduced-motion |
| VIII | Component Architecture | ✅ PASS | All components standalone; team feature route lazy-loaded via loadChildren; peer validation form is a standalone presentational component |
| IX | Design System | ✅ PASS | Status pills use canonical tokens (Approved=green, Pending=amber, Rejected=red); confidence indicators use design-system colors; proficiency badges use canonical colors |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on all services; rating calculation in pure utility functions |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ "Override Rating" removed from DOM via `@if(user.role === 'Admin')`; approve/reject removed for non-team members |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables from central system |
| 4 | No `any` without justification | ✅ Strict typing; interfaces for all entities |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store slices only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ RoleGuard(['Manager','Admin']) on /team/** routes + `@if` in templates for element visibility |
| 9 | No plain-text passwords in production | ✅ N/A for this feature |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/006-peer-validation-manager-controls/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   ├── interceptors/
│   │   │   └── mock-api.interceptor.ts          # Extended: validation queue, peer validation, team skills endpoints
│   │   ├── services/
│   │   │   ├── team.service.ts                  # Team skills, validation queue CRUD via HttpClient
│   │   │   ├── peer-validation.service.ts       # Peer request, response, aggregation via HttpClient
│   │   │   ├── rating-calculation.service.ts    # Final rating formula, weight redistribution, confidence indicator
│   │   │   └── notification.service.ts          # Extended: approval/rejection/peer validation notifications
│   │   └── store/
│   │       └── team/
│   │           ├── team.state.ts
│   │           ├── team.actions.ts
│   │           ├── team.reducer.ts
│   │           ├── team.effects.ts
│   │           └── team.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── rating-badge/                    # Reused from Phase 3
│   │   │   ├── confidence-indicator/
│   │   │   │   └── confidence-indicator.component.ts/html/scss   # 🟢🟡🔴 indicator
│   │   │   ├── data-table/                      # Reused from shared
│   │   │   └── confirm-dialog/                  # Reused from shared
│   │   ├── pipes/
│   │   │   └── proficiency-label.pipe.ts        # Reused from Phase 3
│   │   └── models/
│   │       ├── skill-submission.model.ts        # SkillSubmission, SubmissionStatus interfaces
│   │       ├── peer-validation.model.ts         # PeerValidationRequest, PeerResponse interfaces
│   │       ├── manager-assessment.model.ts      # ManagerAssessment, AdminOverride interfaces
│   │       └── rating-calculation.model.ts      # RatingInput, RatingResult, ConfidenceLevel interfaces
│   ├── features/
│   │   └── team/
│   │       ├── team-skills-overview/
│   │       │   └── team-skills-overview.component.ts/html/scss
│   │       ├── employee-profile/
│   │       │   └── employee-profile.component.ts/html/scss
│   │       ├── validation-queue/
│   │       │   └── validation-queue.component.ts/html/scss
│   │       ├── validation-detail/
│   │       │   └── validation-detail.component.ts/html/scss
│   │       ├── peer-validation-form/
│   │       │   └── peer-validation-form.component.ts/html/scss
│   │       └── team.routes.ts
│   ├── app.routes.ts                            # Updated: team lazy route with RoleGuard
│   └── app.config.ts                            # Unchanged from Phase 1
├── assets/
│   └── mock-data/
│       ├── employee-skills.json                 # Primary: skill submissions, ratings, statuses
│       ├── users.json                           # Team membership by department; peer eligibility
│       ├── notifications.json                   # Extended: approval/rejection/peer notifications
│       ├── skill-definitions.json               # Read: skill name lookup
│       └── certifications.json                  # Read: certification evidence on validation detail
└── styles/
    ├── _variables.scss                          # Existing design tokens
    └── _breakpoints.scss                        # Existing breakpoint variables
```

**Structure Decision**: Single-project Angular SPA extending the architecture from Phases 1–5. New feature code in `src/app/features/team/` (team skills overview, employee profile, validation queue, validation detail, peer validation form). New NgRx team slice in `src/app/core/store/team/`. Rating calculation logic isolated in `src/app/core/services/rating-calculation.service.ts` for testability. Peer validation logic in `src/app/core/services/peer-validation.service.ts`. MockApiInterceptor extended with team skills, validation queue, and peer validation endpoints. Shared confidence-indicator component added to `src/app/shared/components/`.

## Complexity Tracking

> No Constitution Check violations detected — this section is intentionally empty.

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts are complete.*

| # | Principle | Status | Post-Design Evidence |
|---|---|---|---|
| I | Mock-First | ✅ PASS | data-model.md defines SkillSubmission, PeerValidationRequest, ManagerAssessment, AdminOverride from JSON + in-memory; contract specifies all CRUD via 10 interceptor endpoints (GET/POST /api/team/*, /api/peer-validation/*); no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | All /team/** routes guarded by AuthGuard + RoleGuard(['Manager','Admin']); "Override Rating" button removed from DOM via `@if(user.role === 'Admin')`; Manager sees only own department employees via selector-level filtering; interceptor returns 403 for unauthorized department access |
| III | NgRx State | ✅ PASS | TeamState interface defined with typed fields (employees, validationQueue, peerValidations, selectedSubmission); actions/reducer/effects/selectors fully specified; peer validation state as sub-property of team slice; no BehaviorSubject |
| IV | Responsive | ✅ PASS | Team skills table adapts at 3 breakpoints (desktop=full table / tablet=condensed / mobile=card list); validation detail form responsive; BreakpointObserver via Angular CDK; SCSS breakpoint variables from central system |
| V | Tests | ✅ PASS | quickstart.md build order specifies unit tests for: final rating formula with all source combinations, weight redistribution, peer rating aggregation, 7-day expiry logic, confidence indicator, eligible peer filtering, min/max peer count validation, approve/reject/override flows, selector role-scoping |
| VI | Error Handling | ✅ PASS | Contract defines 400/401/403/404/409 error responses for all endpoints; mandatory rejection reason and override justification validated; peer count validation (2–3); loading spinners; empty states |
| VII | Accessibility | ✅ PASS | ConfidenceIndicatorComponent has aria-labels on all variants; approve/reject/override buttons have accessible labels; rating selectors use radio buttons (native ARIA); emoji supplemented with text labels; touch targets ≥44px |
| VIII | Components | ✅ PASS | All 5 feature components standalone; team feature route lazy-loaded via loadChildren; ConfidenceIndicatorComponent is a shared presentational component with no business logic (input → render only) |
| IX | Design System | ✅ PASS | Status pills use canonical tokens (Approved=green, Pending=amber, Rejected=red); proficiency badges use canonical colors (Grey/Blue/Purple/Gold); confidence indicator colors mapped to design system variables; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | TypeScript strict; typed interfaces for all entities (SkillSubmission, PeerValidationRequest, PeerResponse, ManagerAssessment, AdminOverride, RatingInput, RatingResult); rating calculation is a pure function with explicit return type; no `any`; SCSS only |

**POST-DESIGN GATE RESULT: ✅ ALL GATES PASS — design artifacts are constitution-compliant.**
