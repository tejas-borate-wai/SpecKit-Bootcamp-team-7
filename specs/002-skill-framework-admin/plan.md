# Implementation Plan: Skill Framework and Structure Management (Admin)

**Branch**: `002-skill-framework-admin` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-skill-framework-admin/spec.md`

## Summary

Implement the Admin-only Skill Framework management screens and Rating Configuration for the Skill Matrix Application. This feature delivers CRUD operations for the three-level skill hierarchy (Categories → Subcategories → Skill Definitions), an editable Proficiency Framework view, and a Rating Weight Configuration screen with real-time sum validation. All data is sourced from JSON mock files via HttpClient interceptors with in-memory CRUD (resets on refresh). All `/admin/**` routes are guarded by `AuthGuard + RoleGuard(['Admin'])`. State is managed in NgRx with a dedicated `admin` feature slice. The UI uses Angular Material or PrimeNG with responsive layouts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors  
**Storage**: In-memory copies of JSON files in `/assets/mock-data/` (skill-categories.json, skill-definitions.json, employee-skills.json); data resets on page refresh  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Real-time sum indicator updates within 200ms of weight change; form inline validation < 100ms; 60fps UI transitions  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); Admin role only; depends on Feature 001 (auth, guards, interceptor, session store)  
**Scale/Scope**: 8 pre-populated categories, 10+ subcategories, 20+ skill definitions, 4 proficiency levels, 4 rating weights, 5 new admin screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All category/subcategory/skill data from JSON files via HttpClient + MockApiInterceptor; no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | All `/admin/**` routes guarded by AuthGuard + RoleGuard(['Admin']); Admin sidebar items rendered via `@if` on role; non-Admin users redirected to /unauthorized |
| III | State Management (NgRx) | ✅ PASS | Dedicated `admin` NgRx feature slice for categories, subcategories, skills, proficiency levels, rating weights; components use selectors; effects handle HTTP calls |
| IV | Responsive Design | ✅ PASS | Data tables → card lists on mobile; forms two-column on desktop, single-column on mobile; modals → bottom sheets on mobile; all via BreakpointObserver + SCSS variables |
| V | Test Coverage | ✅ PASS | Unit tests for: category CRUD + uniqueness validation, deletion guard (linked skills check), subcategory CRUD, skill definition CRUD + uniqueness within subcategory, rating weight sum-to-1.00 validation, RoleGuard on admin routes, interceptor URL routing |
| VI | Error Handling | ✅ PASS | Inline validation on all form fields; success/error toasts; delete guard messages; loading spinners on data fetch; 403 → permission toast |
| VII | Accessibility | ✅ PASS | aria-labels on form fields, buttons, table headers; 44×44px touch targets; prefers-reduced-motion; color + text labels on status indicators |
| VIII | Component Architecture | ✅ PASS | All components standalone; admin feature routes lazy-loaded via loadChildren |
| IX | Design System | ✅ PASS | CSS custom properties from _variables.scss for colors, typography; success/error toasts use canonical color tokens |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on all services |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ Using `@if` structural directives to remove from DOM |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables |
| 4 | No `any` without justification | ✅ Strict typing throughout |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ Route guards + template checks both present |
| 9 | No plain-text passwords in production | ✅ N/A for this feature (no password handling) |
| 10 | No feature NgModules | ✅ Standalone components + loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/002-skill-framework-admin/
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
│   │   │   └── mock-api.interceptor.ts      # Extended: admin API URL routes for categories, subcategories, skills, proficiency, rating config
│   │   └── store/
│   │       └── admin/
│   │           ├── admin.actions.ts          # Actions for categories, subcategories, skills, proficiency, rating weights
│   │           ├── admin.reducer.ts          # Reducer for admin feature state
│   │           ├── admin.effects.ts          # Effects — HTTP calls via interceptor
│   │           └── admin.selectors.ts        # Memoized selectors for admin state
│   ├── shared/
│   │   └── models/
│   │       ├── skill-category.model.ts       # SkillCategory, SubCategory interfaces
│   │       ├── skill-definition.model.ts     # SkillDefinition interface
│   │       ├── proficiency-level.model.ts    # ProficiencyLevel interface
│   │       └── rating-weight.model.ts        # RatingWeightConfig interface
│   ├── features/
│   │   └── admin/
│   │       ├── admin.routes.ts               # Lazy-loaded admin sub-routes
│   │       ├── categories/
│   │       │   ├── categories.component.ts/html/scss      # Category list + CRUD
│   │       │   └── category-form/
│   │       │       └── category-form.component.ts/html/scss  # Add/Edit category dialog
│   │       ├── subcategories/
│   │       │   ├── subcategories.component.ts/html/scss   # Subcategory list grouped by category
│   │       │   └── subcategory-form/
│   │       │       └── subcategory-form.component.ts/html/scss  # Add/Edit subcategory dialog
│   │       ├── skill-definitions/
│   │       │   ├── skill-definitions.component.ts/html/scss  # Skills grouped by category/subcategory
│   │       │   └── skill-form/
│   │       │       └── skill-form.component.ts/html/scss     # Add/Edit skill dialog (cascading dropdowns)
│   │       ├── proficiency-framework/
│   │       │   └── proficiency-framework.component.ts/html/scss  # Proficiency levels table with inline edit
│   │       └── rating-config/
│   │           └── rating-config.component.ts/html/scss     # Rating weight sliders + sum validation
├── assets/
│   └── mock-data/
│       ├── skill-categories.json            # Pre-populated: 8 categories with subcategories
│       ├── skill-definitions.json           # Pre-populated: 20+ skills across categories
│       ├── employee-skills.json             # Referenced for delete guard checks
│       ├── proficiency-levels.json          # 4 proficiency levels with descriptions and criteria
│       └── rating-weights.json              # Default weights: Self 0.20, Manager 0.30, Peer 0.15, System 0.35
```

**Structure Decision**: Frontend-only SPA following the Angular 17 constitution-defined folder structure. Admin feature is lazy-loaded under `src/app/features/admin/` with sub-routes for each admin screen. NgRx admin state slice in `src/app/core/store/admin/`. Two new mock data files added (`proficiency-levels.json`, `rating-weights.json`) alongside existing ones.

## Complexity Tracking

> **No Constitution Check violations — this section is intentionally empty.**
