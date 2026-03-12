# Implementation Plan: Certifications Module

**Branch**: `005-certifications-module` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-certifications-module/spec.md`

## Summary

Implement the Certifications module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers: a certifications list screen showing all certifications for the logged-in user with color-coded status badges (Valid/Expiring Soon/Expired), an upload certification form with real-time inline validation for required fields, file format (PDF/JPG/PNG), file size (≤ 5 MB), and date consistency (expiry after issue), a +10% rating bonus for valid certifications (capped at 100%), contribution to the System Rating formula at 0.20 weight via Certification Bonus, a "Certified" badge on skill profile screens for skills with valid certifications, certification expiry tracking with dashboard alerts for certifications expiring within 30 days, automatic removal of rating bonus and badge for expired certifications, and responsive layouts (desktop two-column form, mobile single-column with sticky submit). All data is served via HttpClient interceptors from certifications.json and employee-skills.json mock files — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Reactive Forms  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (certifications.json, employee-skills.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Certifications list render < 2 seconds; form validation instant (< 100ms); file validation client-side only; 60 fps animations  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); file uploads are simulated (store metadata only, not actual file bytes); depends on Phase 1 auth/guards and Phase 3 skill profile data being available  
**Scale/Scope**: 2 primary screens (/certifications, /certifications/upload), ~20 functional requirements, integration with skill profile badge and rating formula

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All certification data from certifications.json via HttpClient + MockApiInterceptor; file upload simulated (metadata stored, no server upload); no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | /certifications/** routes guarded by AuthGuard (Employee, Manager, Admin can access); no role-specific UI elements in this feature (all roles can upload/view certifications per permission matrix rows 5) |
| III | State Management (NgRx) | ✅ PASS | Certifications state in NgRx feature slice; components use selectors; effects handle HTTP calls; no BehaviorSubject for shared state |
| IV | Responsive Design | ✅ PASS | Upload form: two-column on desktop, single-column with sticky submit on mobile; certifications list: full table on desktop, card list on mobile; BreakpointObserver + SCSS variables |
| V | Test Coverage | ✅ PASS | Unit tests planned for: certification status computation (Valid/Expiring Soon/Expired), file validation (format + size), date validation (expiry > issue), rating bonus calculation (+10% capped at 100%), certification bonus in System Rating formula |
| VI | Error Handling | ✅ PASS | Inline validation for all form fields; file format/size errors; date conflict error; empty skill dropdown message; success toast on upload; loading spinner for data fetch |
| VII | Accessibility | ✅ PASS | Visible labels on all form fields; aria-labels on file upload, status badges; 44×44px touch targets; color + text for status badges (not color alone); prefers-reduced-motion respected |
| VIII | Component Architecture | ✅ PASS | All components standalone; certifications feature route lazy-loaded via loadChildren |
| IX | Design System | ✅ PASS | Status badges use canonical color tokens (green=Valid, amber=Expiring Soon, red=Expired); certified badge uses design system tokens; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on all services |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ N/A — no role-specific visibility in this feature |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables from central system |
| 4 | No `any` without justification | ✅ Strict typing; interfaces for all entities |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store slices only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ Route guards from Phase 1 + AuthGuard on /certifications/** |
| 9 | No plain-text passwords in production | ✅ N/A for this feature |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/005-certifications-module/
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
│   │   │   └── mock-api.interceptor.ts      # Extended: certifications CRUD endpoints
│   │   ├── services/
│   │   │   ├── certification.service.ts     # Load, create certifications via HttpClient
│   │   │   └── certification-bonus.service.ts  # Rating bonus calculation, expiry checks
│   │   └── store/
│   │       └── certifications/
│   │           ├── certifications.actions.ts
│   │           ├── certifications.reducer.ts
│   │           ├── certifications.effects.ts
│   │           └── certifications.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── certified-badge/
│   │   │   │   └── certified-badge.component.ts/html/scss  # "Certified" badge display
│   │   │   └── status-badge/
│   │   │       └── status-badge.component.ts/html/scss      # Reusable colored status pill
│   │   ├── pipes/
│   │   │   └── certification-status.pipe.ts  # Compute Valid/Expiring Soon/Expired from date
│   │   ├── utils/
│   │   │   └── certification.util.ts         # Expiry computation, rating bonus calc, file validation
│   │   └── models/
│   │       ├── certification.model.ts        # Certification interface, CertificationStatus type
│   │       └── file-validation.model.ts      # Allowed formats, max size constants
│   ├── features/
│   │   └── certifications/
│   │       ├── certifications-list/
│   │       │   └── certifications-list.component.ts/html/scss
│   │       ├── cert-upload/
│   │       │   └── cert-upload.component.ts/html/scss
│   │       └── certifications.routes.ts
│   ├── app.routes.ts                         # Updated: certifications lazy route
│   └── app.config.ts                         # Unchanged from Phase 1
├── assets/
│   └── mock-data/
│       ├── certifications.json               # Primary data: all certifications
│       └── employee-skills.json              # Read: skill list for dropdown + badge display
└── styles/
    ├── _variables.scss                       # Existing design tokens
    └── _breakpoints.scss                     # Existing breakpoint variables
```

**Structure Decision**: Single-project Angular SPA extending the architecture from Phases 1–4. New feature code in `src/app/features/certifications/` (certifications list, upload form). New NgRx certifications slice in `src/app/core/store/certifications/`. Certification bonus logic isolated in `src/app/core/services/certification-bonus.service.ts` for testability. MockApiInterceptor extended with certifications CRUD endpoints. Shared components (certified-badge, status-badge) added to `src/app/shared/components/`. Certification status pipe added to `src/app/shared/pipes/`.

## Complexity Tracking

> No Constitution Check violations detected — this section is intentionally empty.

---

## Post-Design Constitution Re-Check

*Re-evaluated after Phase 1 design artifacts (data-model.md, contracts/, quickstart.md) are complete.*

| # | Constitution Principle | Status | Post-Design Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | data-model.md confirms JSON source `certifications.json`; contracts define 4 interceptor endpoints (GET/POST/DELETE); file upload stores metadata only (FileMetadata interface); quickstart Step 4 extends MockApiInterceptor |
| II | RBAC at UI Layer | ✅ PASS | contracts specify AuthGuard on all endpoints; quickstart Step 10 registers routes with AuthGuard; all roles permitted per constitution permission matrix |
| III | State Management (NgRx) | ✅ PASS | data-model.md defines `CertificationsState` shape; quickstart Step 5 creates full NgRx slice (actions/reducer/effects/selectors); no BehaviorSubject in design |
| IV | Responsive Design | ✅ PASS | quickstart Step 9 specifies BreakpointObserver for list (table→cards) and form (2-col→1-col + sticky submit); SCSS variables from central system |
| V | Test Coverage | ✅ PASS | quickstart Steps 2–3 mandate unit tests for utility functions and pipe; Step 5 mandates selector tests; verification checklist item 2 covers boundary date tests |
| VI | Error Handling | ✅ PASS | contracts define error responses (401, 404, 400, 500); data-model lists all validation rules; quickstart Step 9 covers form validation |
| VII | Accessibility | ✅ PASS | Status-badge and certified-badge components will use Angular Material with built-in ARIA; file input uses mat-form-field with label and mat-error |
| VIII | Component Architecture | ✅ PASS | All components in quickstart are standalone; feature routes lazy-loaded in Step 10; no NgModules |
| IX | Design System | ✅ PASS | Status badge uses canonical color tokens (green/amber/red); certified badge uses design system; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | data-model.md uses TypeScript strict interfaces (no `any`); all functions have explicit return types; SCSS only |

**POST-DESIGN GATE RESULT: ✅ ALL GATES PASS — design artifacts are fully consistent with the constitution.**
