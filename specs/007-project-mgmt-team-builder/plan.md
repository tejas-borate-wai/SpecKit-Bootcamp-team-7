# Implementation Plan: Project Management, Candidate Matching & Team Builder

**Branch**: `007-project-mgmt-team-builder` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-project-mgmt-team-builder/spec.md`

## Summary

Implement the Project Management, Candidate Matching, and Team Builder module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers: a Projects List screen with status-badged table and status/date filters; a Create Project form with cascading skill selection and minimum proficiency per skill, role slot definitions (role title + headcount), and comprehensive inline validation (duplicate name, date logic, required skills); a Project Detail screen for editing/viewing; a Candidate Matching screen that calculates match scores using `(Skills Matched / Skills Required) × 100`, excludes stale/expired skills, ranks by score with availability tiebreaking (Available → Partially Available → Busy), and supports department/availability/minimum-score filters plus PDF export; a Team Builder screen for assigning employees to role slots with automatic availability status transitions (assign → Busy, project complete → Available); Skill Gap Detection that flags unmet skill requirements with gap percentages and learning path suggestions for the closest employees; and a Project Alignment View for employee availability management with manager override capability. All data served via HttpClient interceptors from projects.json, project-assignments.json, employee-skills.json, users.json, skill-definitions.json, and certifications.json mock files — no backend.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+  
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular CDK (BreakpointObserver), Angular HttpClient + HTTP Interceptors, Angular Animations, Angular Router (AuthGuard + RoleGuard)  
**Storage**: In-memory via MockApiInterceptor; JSON files in `/assets/mock-data/` (projects.json, project-assignments.json, employee-skills.json, users.json, skill-definitions.json, skill-categories.json, certifications.json)  
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)  
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile  
**Project Type**: Frontend-only SPA (Single Page Application)  
**Performance Goals**: Candidate matching calculation < 2 seconds for up to 100 employees; projects list render < 1 second; match score calculation < 100ms per candidate; PDF export generation < 3 seconds; 60 fps animations  
**Constraints**: No real backend; all data from JSON files via interceptors; in-memory CRUD only (resets on refresh); depends on Phase 1 (auth/guards), Phase 2 (skill library), Phase 3 (skill profile data), Phase 4 (assessments/system rating), Phase 5 (certifications), Phase 6 (validation/ratings); single-project assignment per employee; PDF generated client-side (browser print API or jsPDF)  
**Scale/Scope**: 5 screens (/projects, /projects/create, /projects/:projectId, /team/matching, /projects/team-builder), plus availability management view, 24 functional requirements, 9 success criteria

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Constitution Principle | Status | Evidence |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | All data from projects.json, project-assignments.json, employee-skills.json, users.json via HttpClient + MockApiInterceptor; no direct JSON imports; interceptor handles GET/POST/PUT/DELETE for /api/projects and /api/project-assignments |
| II | RBAC at UI Layer | ✅ PASS | /projects/** and /team/matching routes guarded by AuthGuard + RoleGuard(['Manager','Admin']); Manager edit/delete restricted to own projects via `@if`; Admin can edit/delete all; Employee role users redirected to /unauthorized |
| III | State Management (NgRx) | ✅ PASS | Projects and project-assignments in NgRx feature slice (projects); candidate match results computed via selectors; effects handle all HTTP calls; no BehaviorSubject for shared state |
| IV | Responsive Design | ✅ PASS | Projects table: desktop=full table, tablet=horizontal scroll, mobile=card list; candidate matching: desktop=filters left + cards right, tablet=filter button + single column, mobile=FAB filter + full-width cards; forms two-column on desktop, single-column on mobile; BreakpointObserver + SCSS breakpoint variables |
| V | Test Coverage | ✅ PASS | Unit tests planned for: match score formula, stale skill exclusion, availability ranking/tiebreaking, skill gap detection, gap percentage calculation, project validation rules (duplicate name, date logic, required skills), role slot assignment logic, availability auto-transitions |
| VI | Error Handling | ✅ PASS | Project creation: 4 inline validation errors per spec; candidate matching: "No candidates found" empty state; loading spinners for data fetch; 403 for unauthorized access; 409 for duplicate project name |
| VII | Accessibility | ✅ PASS | aria-labels on all action buttons; availability indicators use icon + text (not color alone); greyed-out busy candidates have aria-disabled; 44×44px touch targets; prefers-reduced-motion respected |
| VIII | Component Architecture | ✅ PASS | All components standalone; projects feature route lazy-loaded via loadChildren; team/matching route lazy-loaded; shared components reused (data-table, stat-card, confirm-dialog) |
| IX | Design System | ✅ PASS | Status pills use canonical tokens (Draft=grey, Open=blue, In Progress=blue, Completed=green); availability: Available=green, Partially Available=amber, Busy=red; match status: Exceeds=green, Meets=blue, Below=red |
| X | Code Quality | ✅ PASS | TypeScript strict; no `any`; SCSS only; explicit return types on all services; match score calculation in pure utility functions |

**Enforcement Rules Check:**

| # | Rule | Status |
|---|---|---|
| 1 | No direct JSON imports | ✅ Using HttpClient + interceptor exclusively |
| 2 | No CSS-only auth hiding | ✅ Edit/Delete buttons removed from DOM for non-owner managers via `@if(project.createdBy === user.id \|\| user.role === 'Admin')` |
| 3 | No inline responsive styles | ✅ Using SCSS with breakpoint variables from central system |
| 4 | No `any` without justification | ✅ Strict typing; interfaces for Project, ProjectAssignment, CandidateMatch, SkillGap, RoleSlot |
| 5 | No direct HttpClient in components | ✅ NgRx actions → effects → store |
| 6 | No BehaviorSubject for global state | ✅ NgRx store slices only |
| 7 | No hardcoded breakpoints | ✅ Central `_breakpoints.scss` + `breakpoints.ts` |
| 8 | No template-only role checks | ✅ RoleGuard(['Manager','Admin']) on /projects/** and /team/matching routes + `@if` in templates for element visibility |
| 9 | No plain-text passwords in production | ✅ N/A for this feature |
| 10 | No feature NgModules | ✅ Standalone components + loadComponent/loadChildren |

**GATE RESULT: ✅ ALL GATES PASS — no violations detected.**

## Project Structure

### Documentation (this feature)

```text
specs/007-project-mgmt-team-builder/
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
│   │   │   └── mock-api.interceptor.ts              # Extended: /api/projects, /api/project-assignments endpoints
│   │   ├── services/
│   │   │   ├── project.service.ts                   # Project CRUD operations via HttpClient
│   │   │   ├── candidate-matching.service.ts        # Match score calculation, ranking, filtering
│   │   │   ├── team-builder.service.ts              # Role slot assignment, availability transitions
│   │   │   ├── skill-gap.service.ts                 # Gap detection, learning path suggestions
│   │   │   ├── availability.service.ts              # Employee availability management, overrides
│   │   │   └── pdf-export.service.ts                # Client-side PDF generation for candidate reports
│   │   └── store/
│   │       └── projects/
│   │           ├── projects.state.ts
│   │           ├── projects.actions.ts
│   │           ├── projects.reducer.ts
│   │           ├── projects.effects.ts
│   │           └── projects.selectors.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── data-table/                          # Reused from shared
│   │   │   ├── stat-card/                           # Reused from shared
│   │   │   ├── confirm-dialog/                      # Reused from shared
│   │   │   ├── rating-badge/                        # Reused from Phase 3
│   │   │   └── loading-spinner/                     # Reused from shared
│   │   ├── pipes/
│   │   │   └── proficiency-label.pipe.ts            # Reused from Phase 3
│   │   └── models/
│   │       ├── project.model.ts                     # Project, RequiredSkill, RoleSlot interfaces
│   │       ├── project-assignment.model.ts          # ProjectAssignment interface
│   │       ├── candidate-match.model.ts             # CandidateMatch, SkillBreakdown interfaces
│   │       ├── skill-gap.model.ts                   # SkillGap, LearningPathSuggestion interfaces
│   │       └── availability.model.ts                # AvailabilityStatus, AvailabilityOverride interfaces
│   └── features/
│       └── projects/
│           ├── projects.routes.ts                   # Feature route definitions
│           ├── projects-list/
│           │   ├── projects-list.component.ts
│           │   ├── projects-list.component.html
│           │   └── projects-list.component.scss
│           ├── project-create/
│           │   ├── project-create.component.ts
│           │   ├── project-create.component.html
│           │   └── project-create.component.scss
│           ├── project-detail/
│           │   ├── project-detail.component.ts
│           │   ├── project-detail.component.html
│           │   └── project-detail.component.scss
│           ├── candidate-match/
│           │   ├── candidate-match.component.ts
│           │   ├── candidate-match.component.html
│           │   ├── candidate-match.component.scss
│           │   └── match-breakdown/
│           │       ├── match-breakdown.component.ts
│           │       ├── match-breakdown.component.html
│           │       └── match-breakdown.component.scss
│           ├── team-builder/
│           │   ├── team-builder.component.ts
│           │   ├── team-builder.component.html
│           │   ├── team-builder.component.scss
│           │   ├── skill-gap-panel/
│           │   │   ├── skill-gap-panel.component.ts
│           │   │   ├── skill-gap-panel.component.html
│           │   │   └── skill-gap-panel.component.scss
│           │   └── role-slot-card/
│           │       ├── role-slot-card.component.ts
│           │       ├── role-slot-card.component.html
│           │       └── role-slot-card.component.scss
│           └── project-alignment/
│               ├── project-alignment.component.ts
│               ├── project-alignment.component.html
│               └── project-alignment.component.scss
├── assets/
│   └── mock-data/
│       ├── projects.json                            # Project records with requiredSkills and requiredRoles
│       └── project-assignments.json                 # Employee-to-project role assignments
└── styles/
    ├── _variables.scss                              # Design tokens (reused)
    └── _breakpoints.scss                            # Breakpoint variables (reused)
```

**Structure Decision**: Angular SPA single-project structure following the established `core/shared/features` pattern from the constitution. The projects feature module is lazy-loaded under `features/projects/` with six child components covering the five screens plus the alignment view. Candidate matching and team builder are nested under the projects feature since they are project-scoped operations. Shared utility services for matching, gap detection, and PDF export live in `core/services/`.

## Complexity Tracking

> No Constitution Check violations detected. This section is intentionally left empty.
