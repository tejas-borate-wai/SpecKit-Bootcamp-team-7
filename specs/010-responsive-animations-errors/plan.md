# Implementation Plan: Responsive Design, Animations & Error Handling

**Branch**: `010-responsive-animations-errors` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-responsive-animations-errors/spec.md`

## Summary

Implement the cross-cutting UI quality layer for the Skill Matrix Application — a frontend-only Angular 17 SPA. This phase retroactively applies three interconnected concerns to all 30 screens built in Phases 1–9: (1) a responsive design system with 6 mobile-first breakpoints (xs through 2xl) using Angular CDK BreakpointObserver for JS-side detection and centralized SCSS variables for CSS-side media queries, governing sidebar behavior (240px fixed → 64px icon rail → hamburger drawer), header layout, content padding, stat card columns, table-to-card transformations, form layouts, modal-to-bottom-sheet conversion, and mobile bottom nav + FAB patterns; (2) purposeful Angular Animations for route transitions, progress bar fills, assessment success reveals, toast slide-in/out, sidebar collapse/expand, and modal/bottom-sheet slides — all respecting `prefers-reduced-motion`; (3) comprehensive error handling implementing all Section 23 error messages verbatim with real-time inline validation, skeleton/spinner loading states, empty state messages, success/error toasts, and never-blank-page guarantees. Additionally includes a global search system filtering employees by skill/department/level/certification/availability in real time against NgRx state, plus filter controls on all list screens.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+
**Primary Dependencies**: Angular 17, Angular CDK (BreakpointObserver), @angular/animations, NgRx 17+, Angular Material or PrimeNG, Angular Router, SCSS
**Storage**: N/A — this phase introduces no new data; operates against existing NgRx state and mock data from Phases 1–9
**Testing**: Jasmine + Karma (unit tests for breakpoint service, animation trigger configs, validation utilities, search/filter logic)
**Target Platform**: Web browser (SPA) — 375px mobile, 768px tablet, 1280px desktop, 1440px large desktop
**Project Type**: Frontend-only SPA (Single Page Application) — cross-cutting UI enhancement phase
**Performance Goals**: Search filtering executes synchronously against in-memory NgRx state (imperceptible latency); animations run at 60fps; layout reflow on resize without page reload
**Constraints**: No new routes or screens introduced; all changes retrofit existing Phase 1–9 components; depends on all prior phases (1–9) being structurally complete; no backend; animations must respect `prefers-reduced-motion`; all error messages verbatim from Section 23 of requirement.md
**Scale/Scope**: 30 existing screens retrofitted, 6 breakpoints, 7 animation types, 31 functional requirements, 7 success criteria, 5 user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Compliance

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | No new data sources introduced. Global search filters against existing NgRx state (already loaded from mock data via interceptors). No direct JSON imports. |
| II | RBAC at UI Layer | ✅ PASS | Bottom nav "More" tab contents and FAB actions respect role-based visibility using `@if` against user role from NgRx session. No new routes; existing guards remain unchanged. |
| III | State Management | ✅ PASS | Search/filter state uses local component state (form inputs, filter criteria) — appropriate per constitution rules. Global search reads from existing NgRx selectors. No new global state slices required. |
| IV | Responsive Design | ✅ PASS | This phase IS the responsive design implementation. Central `breakpoints.ts` and `_breakpoints.scss` established. BreakpointObserver for JS-side logic. CSS Grid/Flexbox for layout. No inline responsive styles in TypeScript. |
| V | Test Coverage | ✅ PASS | Unit tests for: BreakpointService wrapper, responsive util functions, animation trigger configurations, validation utility functions, global search filter logic, empty state rendering, skeleton loader conditional logic. |
| VI | Error Handling | ✅ PASS | This phase IS the error handling implementation. All Section 23 error messages implemented verbatim. Inline validation on all forms. Skeleton/spinner loading states on all async screens. Never-blank-page guarantee. |
| VII | Accessibility | ✅ PASS | 44×44px minimum tap targets enforced. No hover-only interactions. Color never sole indicator (always paired with icon/text). `prefers-reduced-motion` respected for all animations. Bottom nav and FABs have `aria-label` attributes. |
| VIII | Component Architecture | ✅ PASS | All new shared components (BottomNavComponent, FABComponent, SkeletonLoaderComponent, EmptyStateComponent, GlobalSearchComponent) are standalone. No new feature modules — changes are to existing lazy-loaded features. |
| IX | Consistent Design System | ✅ PASS | All responsive values use CSS Custom Properties from `_variables.scss`. Typography scale from `_typography.scss`. Status colors use canonical tokens. No magic numbers in component SCSS. |
| X | Code Quality | ✅ PASS | TypeScript strict. No `any`. SCSS only. All breakpoint constants typed. Animation definitions in typed configuration objects. |

### Enforcement Rule Compliance

| # | Rule | Status | Notes |
|---|---|---|---|
| 1 | No direct JSON imports | ✅ PASS | No data layer changes — uses existing NgRx selectors |
| 2 | No CSS-only auth hiding | ✅ PASS | Bottom nav items and FABs conditioned via `@if` on role, not CSS |
| 3 | No inline responsive styles | ✅ PASS | All responsive via SCSS media queries + BreakpointObserver service |
| 4 | No untyped `any` | ✅ PASS | Breakpoint, animation, validation interfaces strictly typed |
| 5 | No direct HttpClient in components | ✅ PASS | No new HTTP calls — search filters NgRx state |
| 6 | No BehaviorSubject for global state | ✅ PASS | No new global state; BreakpointService uses BreakpointObserver observable only |
| 7 | No hardcoded breakpoints | ✅ PASS | Central `breakpoints.ts` + `_breakpoints.scss` — foundation of this phase |
| 8 | Route guards + template checks | ✅ PASS | No new routes; existing guards unchanged; bottom nav items use both role check and existing guard protection |
| 9 | No plain-text passwords in prod | ✅ N/A | No auth changes in this feature |
| 10 | No feature NgModules | ✅ PASS | All new components standalone; no NgModules introduced |

## Project Structure

### Documentation (this feature)

```text
specs/010-responsive-animations-errors/
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
│   │   ├── services/
│   │   │   ├── breakpoint.service.ts         # BreakpointObserver wrapper — exposes current breakpoint as observable
│   │   │   ├── global-search.service.ts      # Cross-entity search logic against NgRx state
│   │   │   └── validation.service.ts         # Centralized validation rules + error message constants
│   │   ├── animations/
│   │   │   ├── route.animations.ts           # Route transition trigger (fade + slide)
│   │   │   ├── progress-bar.animations.ts    # Width 0→final% fill animation
│   │   │   ├── toast.animations.ts           # Slide-in/out trigger for toasts
│   │   │   ├── modal.animations.ts           # Slide-up/down for modals and bottom sheets
│   │   │   ├── sidebar.animations.ts         # Collapse/expand width transition
│   │   │   └── success.animations.ts         # Scale-in + fade for assessment completion
│   │   └── constants/
│   │       ├── breakpoints.ts                # Named breakpoint constants (xs, sm, md, lg, xl, 2xl)
│   │       ├── error-messages.ts             # All Section 23 error messages as typed constants
│   │       └── animation-config.ts           # Duration, easing, delay constants
│   ├── shared/
│   │   ├── components/
│   │   │   ├── bottom-nav/
│   │   │   │   ├── bottom-nav.component.ts
│   │   │   │   ├── bottom-nav.component.html
│   │   │   │   └── bottom-nav.component.scss # Mobile-only 5-tab bottom navigation
│   │   │   ├── fab/
│   │   │   │   ├── fab.component.ts
│   │   │   │   ├── fab.component.html
│   │   │   │   └── fab.component.scss        # Floating action button (mobile screens)
│   │   │   ├── skeleton-loader/
│   │   │   │   ├── skeleton-loader.component.ts
│   │   │   │   ├── skeleton-loader.component.html
│   │   │   │   └── skeleton-loader.component.scss  # Shape-matching placeholder loader
│   │   │   ├── empty-state/
│   │   │   │   ├── empty-state.component.ts
│   │   │   │   ├── empty-state.component.html
│   │   │   │   └── empty-state.component.scss  # Reusable empty/no-results display
│   │   │   ├── global-search/
│   │   │   │   ├── global-search.component.ts
│   │   │   │   ├── global-search.component.html
│   │   │   │   └── global-search.component.scss  # Header search with real-time results
│   │   │   ├── inline-error/
│   │   │   │   ├── inline-error.component.ts
│   │   │   │   ├── inline-error.component.html
│   │   │   │   └── inline-error.component.scss # Reusable inline validation error display
│   │   │   └── responsive-table/
│   │   │       ├── responsive-table.component.ts
│   │   │       ├── responsive-table.component.html
│   │   │       └── responsive-table.component.scss  # Table→card-list responsive wrapper
│   │   └── directives/
│   │       ├── swipe.directive.ts            # Swipe-left gesture detection for skill cards
│   │       └── min-tap-target.directive.ts   # Ensures 44×44px minimum on interactive elements
│   └── features/
│       └── [existing feature folders]        # Modified in-place for responsive/animation/error updates
├── styles/
│   ├── _variables.scss                       # Existing — add responsive CSS custom properties
│   ├── _breakpoints.scss                     # Breakpoint SCSS variables + mixin helpers
│   ├── _typography.scss                      # Responsive typography scale (H1–Labels)
│   ├── _animations.scss                      # Global animation keyframes and utility classes
│   └── styles.scss                           # Global styles — import breakpoints, typography, animations
```

**Structure Decision**: Single Angular SPA project following the existing architecture from Phases 1–9. No new feature modules — this phase adds cross-cutting infrastructure (services, constants, animations, shared components, SCSS foundations) and modifies existing feature components in-place for responsive layout, animation integration, and error handling compliance.

## Complexity Tracking

> No constitution violations. Table intentionally empty.
