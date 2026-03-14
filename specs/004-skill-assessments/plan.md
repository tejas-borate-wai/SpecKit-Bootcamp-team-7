# Implementation Plan: Skill Assessments Module

**Branch**: `004-skill-assessments` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-skill-assessments/spec.md`

## Summary

Implement the Skill Assessments module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers: an assessments list showing all skills with their assessment status (Not Attempted / In Progress / Completed), a timed assessment runner with randomized multiple-choice questions displayed one at a time with Previous/Next navigation and a 15-minute countdown timer, difficulty-weighted score calculation (Easy=1pt, Medium=2pt, Hard=3pt), a post-assessment score card showing test score, certification bonus, project experience bonus, system rating, final rating status, proficiency level, and level change indicator, a 24-hour retake cooldown mechanism, and complete test history. All data is served via HttpClient interceptors from skill-exams.json and skill-test-attempts.json mock files — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Animations  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (skill-exams.json, skill-test-attempts.json, employee-skills.json, certifications.json, projects.json, project-assignments.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Assessment screen render < 2 seconds; timer accuracy within 1 second; score card display < 1 second after submission; 60 fps animations  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); depends on Phase 1 auth/guards, Phase 2 skill library, and Phase 3 skill profile data being available; no mid-test persistence across page refreshes  
**Scale/Scope**: 3 screens (/assessments, /assessments/:skillId/take, /assessments/:skillId/result), 5–10 questions per assessment, ~24 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All assessment data from skill-exams.json, skill-test-attempts.json via HttpClient + MockApiInterceptor; no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | /assessments/** routes guarded by AuthGuard (all roles can access); no role-specific UI elements in this feature |
| III | State Management (NgRx) | ✅ PASS | Assessments state in NgRx feature slice; components use selectors; effects handle HTTP calls; no BehaviorSubject for shared state |
| IV | Responsive Design | ✅ PASS | Assessment screen adapts at 3 breakpoints: desktop (centered 720px card), tablet (full-width, larger tap targets), mobile (full-screen, stacked options, sticky nav buttons); BreakpointObserver + SCSS variables |
| V | Test Coverage | ✅ PASS | Unit tests planned for: difficulty-weighted scoring, system rating formula, level mapping, retake cooldown logic, timer auto-submit, question randomization |
| VI | Error Handling | ✅ PASS | Timer expired → auto-submit with message; retake cooldown → inline message; no questions → empty state message; loading spinner for data fetch |
| VII | Accessibility | ✅ PASS | aria-labels on question options, timer, navigation buttons; 44×44px touch targets; progress bar has aria-valuenow; prefers-reduced-motion respected |
| VIII | Component Architecture | ✅ PASS | All components standalone; assessments feature route lazy-loaded via loadChildren |
| IX | Design System | ✅ PASS | Level badges use canonical proficiency colors (Grey/Blue/Purple/Gold); status pills use design system tokens; SCSS custom properties throughout |
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
| 8 | No template-only role checks | ✅ Route guards from Phase 1 + AuthGuard on /assessments/** |
| 9 | No plain-text passwords in production | ✅ N/A for this feature |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/004-skill-assessments/
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
│   │   │   └── mock-api.interceptor.ts      # Extended: skill-exams, skill-test-attempts endpoints
│   │   ├── services/
│   │   │   ├── assessment.service.ts        # Load exams, submit attempts, retake check via HttpClient
│   │   │   └── scoring.service.ts           # Difficulty weighting, system rating formula, level mapping
│   │   └── store/
│   │       └── assessments/
│   │           ├── assessments.actions.ts
│   │           ├── assessments.reducer.ts
│   │           ├── assessments.effects.ts
│   │           └── assessments.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── rating-badge/                # Reused from Phase 3
│   │   │   ├── progress-bar/
│   │   │   │   └── progress-bar.component.ts/html/scss    # Question progress indicator
│   │   │   └── countdown-timer/
│   │   │       └── countdown-timer.component.ts/html/scss  # Reusable timer display
│   │   ├── pipes/
│   │   │   └── proficiency-label.pipe.ts    # Reused from Phase 3
│   │   └── models/
│   │       ├── skill-exam.model.ts          # SkillExam, ExamQuestion interfaces
│   │       ├── assessment-attempt.model.ts  # AssessmentAttempt, ScoreCard interfaces
│   │       └── assessment-status.model.ts   # AssessmentStatus enum
│   ├── features/
│   │   └── assessments/
│   │       ├── assessments-list/
│   │       │   └── assessments-list.component.ts/html/scss
│   │       ├── take-assessment/
│   │       │   └── take-assessment.component.ts/html/scss
│   │       ├── assessment-result/
│   │       │   └── assessment-result.component.ts/html/scss
│   │       └── assessments.routes.ts
│   ├── app.routes.ts                        # Updated: assessments lazy route
│   └── app.config.ts                        # Unchanged from Phase 1
├── assets/
│   └── mock-data/
│       ├── skill-exams.json                 # Primary data: questions per skill
│       ├── skill-test-attempts.json         # Test history: all past attempts
│       ├── employee-skills.json             # Read: systemRating update after assessment
│       ├── certifications.json              # Read: certification bonus check
│       ├── projects.json                    # Read: project experience check
│       └── project-assignments.json         # Read: project assignment check
└── styles/
    ├── _variables.scss                      # Existing design tokens
    └── _breakpoints.scss                    # Existing breakpoint variables
```

**Structure Decision**: Single-project Angular SPA extending the architecture from Phases 1–3. New feature code in `src/app/features/assessments/` (assessment list, take assessment, result). New NgRx assessments slice in `src/app/core/store/assessments/`. Scoring logic isolated in `src/app/core/services/scoring.service.ts` for testability. MockApiInterceptor extended with skill-exams and skill-test-attempts endpoints. Shared components (progress-bar, countdown-timer) added to `src/app/shared/components/`.

## Complexity Tracking

> No Constitution Check violations detected — this section is intentionally empty.

## Post-Design Constitution Re-Check

*Re-evaluation after Phase 1 design artifacts are complete.*

| # | Principle | Status | Post-Design Evidence |
|---|---|---|---|
| I | Mock-First | ✅ PASS | data-model.md defines SkillExam, AssessmentAttempt from JSON files; contract specifies all CRUD via interceptor endpoints (GET /api/skill-exams, GET/POST /api/skill-test-attempts); no direct JSON imports |
| II | RBAC at UI Layer | ✅ PASS | All assessment routes guarded by AuthGuard (all roles); no role-specific UI elements in this feature; route guards inherited from Phase 1 |
| III | NgRx State | ✅ PASS | AssessmentsState interface defined with typed fields — persistent data (exams, attempts) separated from transient session (activeAssessment); actions/reducer/effects/selectors fully specified; no BehaviorSubject |
| IV | Responsive | ✅ PASS | Assessment screen adapts at 3 breakpoints (desktop 720px centered / tablet full-width / mobile full-screen with sticky buttons); BreakpointObserver via Angular CDK; SCSS breakpoint variables from central system |
| V | Tests | ✅ PASS | quickstart.md build order includes unit tests for difficulty-weighted scoring, system rating formula, level mapping boundaries, retake cooldown, timer, shuffle, reducer, selectors, and components |
| VI | Error Handling | ✅ PASS | Contract defines 400/401/403/404 error responses; timer expired → auto-submit with message; retake cooldown → inline message; no questions → empty state message; loading spinners for data fetch |
| VII | Accessibility | ✅ PASS | Radio buttons for answer options (native ARIA); timer has aria-live for screen readers; progress bar has aria-valuenow/aria-valuemax; touch targets ≥44px; prefers-reduced-motion respected |
| VIII | Components | ✅ PASS | All components standalone; assessments feature route lazy-loaded via loadChildren; countdown-timer and progress-bar are shared presentational components with no business logic |
| IX | Design System | ✅ PASS | Proficiency level badges use canonical color tokens (Grey/Blue/Purple/Gold); status pills use design system tokens; SCSS custom properties throughout |
| X | Code Quality | ✅ PASS | TypeScript strict; typed interfaces for all entities (SkillExam, ExamQuestion, AssessmentAttempt, ScoreCard); scoring utilities are pure functions with explicit return types; no `any`; SCSS only |

**POST-DESIGN GATE RESULT: ✅ ALL GATES PASS — design artifacts are constitution-compliant.**
