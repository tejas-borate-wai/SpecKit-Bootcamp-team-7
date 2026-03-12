# Implementation Plan: Mock Authentication and Role-Based Navigation

**Branch**: `001-mock-auth-rbac-navigation` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mock-auth-rbac-navigation/spec.md`

## Summary

Implement mock authentication, role-based access control (RBAC), and responsive navigation for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers a login screen validated against mock JSON data, NgRx-managed session state with localStorage persistence, Angular Router guards (AuthGuard + RoleGuard) enforcing a 30-route permission matrix across three roles (Employee, Manager, Admin), a responsive sidebar that renders only role-permitted menu items in the DOM, and a top header bar with avatar dropdown and logout. Mock data is served via HttpClient interceptors — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors  
**Storage**: localStorage (session persistence); JSON files in `/assets/mock-data/` (mock data source)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Login-to-dashboard in < 5 seconds; 60 fps UI transitions  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); no JWT  
**Scale/Scope**: 30 routes, 3 roles, 10+ mock users, 10 JSON data files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All data from JSON files via HttpClient + MockApiInterceptor; no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | Sidebar uses `@if` to exclude unauthorized items from DOM; AuthGuard + RoleGuard on all protected routes |
| III | State Management (NgRx) | ✅ PASS | Session state in NgRx store; components use selectors; effects handle HTTP calls |
| IV | Responsive Design | ✅ PASS | Sidebar adapts at 3 breakpoints via BreakpointObserver + SCSS variables; no inline responsive styles |
| V | Test Coverage | ✅ PASS | Unit tests planned for AuthGuard, RoleGuard, AuthService, MockApiInterceptor, session selectors |
| VI | Error Handling | ✅ PASS | Invalid credentials → inline error; 403 → permission toast; loading spinner on auth check |
| VII | Accessibility | ✅ PASS | aria-labels on nav items, form fields; 44×44px touch targets; prefers-reduced-motion respected |
| VIII | Component Architecture | ✅ PASS | All components standalone; feature routes lazy-loaded via loadComponent/loadChildren |
| IX | Design System | ✅ PASS | Colors, typography from _variables.scss CSS custom properties; status pills use canonical tokens |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on services |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ Using `@if` / structural directives to remove from DOM |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables |
| 4 | No `any` without justification | ✅ Strict typing throughout |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ Route guards + template checks both present |
| 9 | No plain-text passwords in production | ✅ Mock-only; users.json excluded from production builds |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/001-mock-auth-rbac-navigation/
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
│   │   ├── auth/
│   │   │   ├── auth.service.ts          # Login/logout, session hydration
│   │   │   ├── auth.guard.ts            # CanActivate — redirects to /login
│   │   │   └── role.guard.ts            # CanActivate — redirects to /unauthorized
│   │   ├── interceptors/
│   │   │   └── mock-api.interceptor.ts  # URL → JSON data routing
│   │   ├── services/
│   │   │   └── navigation.service.ts    # Role-based sidebar config
│   │   ├── store/
│   │   │   └── session/
│   │   │       ├── session.actions.ts
│   │   │       ├── session.reducer.ts
│   │   │       ├── session.effects.ts
│   │   │       └── session.selectors.ts
│   │   └── breakpoints.ts              # Centralized breakpoint constants
│   ├── shared/
│   │   ├── components/
│   │   │   ├── sidebar/
│   │   │   │   └── sidebar.component.ts/html/scss
│   │   │   ├── header/
│   │   │   │   └── header.component.ts/html/scss
│   │   │   ├── avatar/
│   │   │   │   └── avatar.component.ts/html/scss
│   │   │   └── toast/
│   │   │       └── toast.component.ts/html/scss
│   │   └── models/
│   │       ├── user.model.ts
│   │       ├── session.model.ts
│   │       └── navigation.model.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── login.component.ts/html/scss
│   │   │   ├── unauthorized/
│   │   │   │   └── unauthorized.component.ts/html/scss
│   │   │   └── auth.routes.ts
│   │   └── dashboard/
│   │       ├── dashboard.component.ts/html/scss
│   │       └── dashboard.routes.ts
│   ├── app.routes.ts                   # Root route config with guards
│   ├── app.component.ts/html/scss      # Shell: sidebar + header + router-outlet
│   └── app.config.ts                   # Providers: router, store, httpClient, interceptor
├── assets/
│   └── mock-data/
│       └── users.json                  # 10+ mock users
└── styles/
    ├── _variables.scss
    ├── _breakpoints.scss
    ├── _typography.scss
    └── styles.scss
```

**Structure Decision**: Single-project Angular SPA following the constitution's architecture overview. Feature code lives under `src/app/features/` with lazy-loaded routes. Core singletons (guards, interceptors, store, services) reside in `src/app/core/`. Shared presentational components in `src/app/shared/`.

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts are complete.*

| # | Principle | Status | Post-Design Evidence |
|---|---|---|---|
| I | Mock-First | ✅ PASS | data-model.md defines User from users.json; contract specifies interceptor handles POST /api/auth/login via fetch() |
| II | RBAC at UI Layer | ✅ PASS | NavItem model includes roles[]; sidebar filters by role; route guard matrix in data-model matches spec FR-013 |
| III | NgRx State | ✅ PASS | SessionState interface defined; actions/reducer/effects/selectors specified; no BehaviorSubject usage |
| IV | Responsive | ✅ PASS | Sidebar breakpoints documented: 240px/64px/drawer; BreakpointObserver via Angular CDK |
| V | Tests | ✅ PASS | quickstart.md build order includes unit tests for guards, interceptor, selectors |
| VI | Error Handling | ✅ PASS | Contract defines 401/403/400 error responses; SessionState includes error field |
| VII | Accessibility | ✅ PASS | Material components provide ARIA support; touch targets ≥44px per constitution |
| VIII | Components | ✅ PASS | All components standalone; features lazy-loaded via loadComponent/loadChildren |
| IX | Design System | ✅ PASS | SCSS variables referenced; no inline styles |
| X | Code Quality | ✅ PASS | TypeScript strict; typed interfaces for all models; no `any` |

**POST-DESIGN GATE RESULT: ✅ ALL GATES PASS — design artifacts are constitution-compliant.**

## Complexity Tracking

> No violations to justify — all constitution gates pass.
