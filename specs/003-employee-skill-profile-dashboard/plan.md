# Implementation Plan: Employee Skill Profile and Dashboard

**Branch**: `003-employee-skill-profile-dashboard` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-employee-skill-profile-dashboard/spec.md`

## Summary

Implement the Employee Skill Profile and role-specific Dashboard for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers: a My Skills list with responsive table/card layouts, skill CRUD operations (add via cascading dropdowns, edit self-rating, soft-delete with history retention), a skill detail view showing all 4 rating sources with confidence indicators and progress charts, role-specific dashboard widgets (Employee/Manager/Admin), profile completion tracking, skill expiry/stale detection (6-month rule), achievement badges, and line-chart progress visualization. All data is served via HttpClient interceptors from JSON mock files — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, ngx-charts or Chart.js (progress line charts), Angular Animations  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (employee-skills.json, skill-test-attempts.json, skill-categories.json, skill-definitions.json, certifications.json, projects.json, project-assignments.json, notifications.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Dashboard render < 3 seconds; 60 fps chart animations; skill CRUD operations under 1 second  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); depends on Phase 1 auth/guards and Phase 2 skill library being available  
**Scale/Scope**: 5 screens (/dashboard, /my-skills, /my-skills/add, /my-skills/:skillId, /my-skills/:skillId/edit), 3 role-specific dashboard sub-components, ~37 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All skill data from employee-skills.json, skill-test-attempts.json via HttpClient + MockApiInterceptor; no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | "Override Rating" button rendered only for Admin via `@if`; Admin sees all employees' skills; Employee/Manager see own only; route guards from Phase 1 enforced |
| III | State Management (NgRx) | ✅ PASS | Skills state in NgRx feature slice; components use selectors; effects handle HTTP calls; no BehaviorSubject for shared state |
| IV | Responsive Design | ✅ PASS | Skill table adapts at 3 breakpoints (full table / reduced columns / card list); dashboard stat cards 4/2/1 per row; BreakpointObserver + SCSS variables |
| V | Test Coverage | ✅ PASS | Unit tests planned for: level mapping, stale detection, profile completion calculation, skill CRUD, achievement badge logic, confidence indicator |
| VI | Error Handling | ✅ PASS | Duplicate skill → inline error; delete blocked by project → error toast; empty states for no skills/no data; loading spinners/skeletons |
| VII | Accessibility | ✅ PASS | aria-labels on skill cards, form fields; 44×44px touch targets; proficiency badges use color + text label; prefers-reduced-motion respected |
| VIII | Component Architecture | ✅ PASS | All components standalone; dashboard/my-skills feature routes lazy-loaded via loadChildren |
| IX | Design System | ✅ PASS | Proficiency badges use canonical color tokens (Grey/Blue/Purple/Gold); status pills use design system tokens; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on all services |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ Using `@if` to remove "Override Rating" from DOM for non-admin |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables from central system |
| 4 | No `any` without justification | ✅ Strict typing; interfaces for all entities |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store slices only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ Route guards from Phase 1 + template `@if` checks both present |
| 9 | No plain-text passwords in production | ✅ N/A for this feature (no password handling) |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/003-employee-skill-profile-dashboard/
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
│   │   │   └── mock-api.interceptor.ts      # Extended: employee-skills, skill-test-attempts endpoints
│   │   ├── services/
│   │   │   ├── skill.service.ts             # CRUD for employee skills via HttpClient
│   │   │   ├── skill-library.service.ts     # Read categories/subcategories/definitions
│   │   │   ├── dashboard.service.ts         # Dashboard data aggregation via HttpClient
│   │   │   └── achievement.service.ts       # Badge calculation from score history
│   │   └── store/
│   │       └── skills/
│   │           ├── skills.actions.ts
│   │           ├── skills.reducer.ts
│   │           ├── skills.effects.ts
│   │           └── skills.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── skill-card/
│   │   │   │   └── skill-card.component.ts/html/scss
│   │   │   ├── rating-badge/
│   │   │   │   └── rating-badge.component.ts/html/scss
│   │   │   ├── stat-card/
│   │   │   │   └── stat-card.component.ts/html/scss
│   │   │   ├── confidence-indicator/
│   │   │   │   └── confidence-indicator.component.ts/html/scss
│   │   │   ├── achievement-badge/
│   │   │   │   └── achievement-badge.component.ts/html/scss
│   │   │   └── progress-chart/
│   │   │       └── progress-chart.component.ts/html/scss
│   │   ├── pipes/
│   │   │   ├── proficiency-label.pipe.ts    # Maps percentage → Beginner/Intermediate/Advanced/Expert
│   │   │   └── stale-check.pipe.ts          # Checks if lastUpdated > 6 months ago
│   │   └── models/
│   │       ├── employee-skill.model.ts      # EmployeeSkill, SkillStatus, ProficiencyLevel
│   │       ├── skill-test-attempt.model.ts  # SkillTestAttempt interface
│   │       ├── achievement.model.ts         # AchievementBadge type
│   │       └── dashboard.model.ts           # Dashboard widget data interfaces
│   ├── features/
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts/html/scss           # Role-switched container
│   │   │   ├── employee-dashboard/
│   │   │   │   └── employee-dashboard.component.ts/html/scss
│   │   │   ├── manager-dashboard/
│   │   │   │   └── manager-dashboard.component.ts/html/scss
│   │   │   ├── admin-dashboard/
│   │   │   │   └── admin-dashboard.component.ts/html/scss
│   │   │   └── dashboard.routes.ts
│   │   └── my-skills/
│   │       ├── my-skills-list/
│   │       │   └── my-skills-list.component.ts/html/scss
│   │       ├── add-skill/
│   │       │   └── add-skill.component.ts/html/scss
│   │       ├── skill-detail/
│   │       │   └── skill-detail.component.ts/html/scss
│   │       ├── edit-skill/
│   │       │   └── edit-skill.component.ts/html/scss
│   │       └── my-skills.routes.ts
│   ├── app.routes.ts                        # Updated: dashboard + my-skills lazy routes
│   └── app.config.ts                        # Unchanged from Phase 1
├── assets/
│   └── mock-data/
│       ├── employee-skills.json             # Primary data for this feature
│       ├── skill-test-attempts.json         # Score history for progress charts
│       ├── skill-categories.json            # Read-only (from Phase 2)
│       ├── skill-definitions.json           # Read-only (from Phase 2)
│       ├── certifications.json              # Read-only (cert badge display)
│       └── project-assignments.json         # Read-only (delete constraint check)
└── styles/
    ├── _variables.scss                      # Existing design tokens
    └── _breakpoints.scss                    # Existing breakpoint variables
```

**Structure Decision**: Single-project Angular SPA extending the architecture from Phase 1. New feature code in `src/app/features/dashboard/` (role-specific dashboards) and `src/app/features/my-skills/` (skill CRUD). New NgRx skills slice in `src/app/core/store/skills/`. Shared presentational components (skill-card, rating-badge, stat-card, confidence-indicator, achievement-badge, progress-chart) in `src/app/shared/components/`. MockApiInterceptor extended with employee-skills and skill-test-attempts endpoints.

## Complexity Tracking

> No Constitution Check violations detected — this section is intentionally empty.

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts are complete.*

| # | Principle | Status | Post-Design Evidence |
|---|---|---|---|
| I | Mock-First | ✅ PASS | data-model.md defines EmployeeSkill, SkillTestAttempt from JSON files; contract specifies all CRUD via interceptor endpoints (GET/POST/PUT/DELETE /api/employee-skills); no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | Contract enforces 403 for Employee/Manager accessing other users' data; "Override Rating" removed from DOM via `@if` for non-Admin; route guards inherited from Phase 1 |
| III | NgRx State | ✅ PASS | SkillsState interface defined with typed fields; actions/reducer/effects/selectors specified; dashboard data computed via memoized selectors; no BehaviorSubject |
| IV | Responsive | ✅ PASS | Skill table adapts at 3 breakpoints (full table/condensed/card list); dashboard stat cards 4/2/1 per row; BreakpointObserver via Angular CDK; SCSS breakpoint variables |
| V | Tests | ✅ PASS | quickstart.md build order includes unit tests for level mapping, stale detection, profile completion, confidence, achievements, CRUD, selectors |
| VI | Error Handling | ✅ PASS | Contract defines 400/403/404/409 error responses; duplicate skill → inline error; delete blocked → error toast; empty states for no skills/no data |
| VII | Accessibility | ✅ PASS | Proficiency badges use color + text label; confidence indicators use emoji + text; Material components provide ARIA support; touch targets ≥44px |
| VIII | Components | ✅ PASS | All components standalone; my-skills and dashboard feature routes lazy-loaded via loadChildren; shared presentational components have no business logic |
| IX | Design System | ✅ PASS | Proficiency badge colors match constitution tokens (Grey/Blue/Purple/Gold); status pills use canonical tokens; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | TypeScript strict; typed interfaces for all entities; no `any`; utility functions with explicit return types; SCSS only |

**POST-DESIGN GATE RESULT: ✅ ALL GATES PASS — design artifacts are constitution-compliant.**
