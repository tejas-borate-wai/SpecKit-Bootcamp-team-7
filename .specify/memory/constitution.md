<!-- SYNC IMPACT REPORT
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial establishment — all placeholders replaced)
Added sections:
  - Project Identity
  - Technology Stack
  - Architecture Overview
  - Data Strategy
  - Authentication & Authorization
  - RBAC Rules (permission matrix, sidebar, UI visibility, route guards)
  - Route Inventory (30 screens)
  - State Management
  - Rating & Scoring Engine
  - Design System
  - Responsive Design Rules (Sections 18.1–18.7)
  - Component Architecture
  - Error Handling Standards
  - Animation Standards
  - Testing Standards
  - Mock Data Specification (10 JSON files)
  - Core Principles Summary (10 principles)
  - Enforcement Rules
  - Governance
Removed sections: None (template placeholders replaced throughout)
Templates reviewed:
  - .specify/templates/plan-template.md  ✅ reviewed — Constitution Check section present; no amendments needed
  - .specify/templates/spec-template.md  ✅ reviewed — requirements and scope sections align
  - .specify/templates/tasks-template.md ✅ reviewed — phase structure and task categories align
Follow-up TODOs: None — all fields resolved from requirement.md and user request
-->

# Skill Matrix Application Constitution

## Project Identity

**Project Name**: Skill Matrix Application (Frontend SPA with Mock Data)
**Version**: 1.0.0
**Ratified**: 2026-03-12
**Last Amended**: 2026-03-12
**Status**: Active

### Description

The Skill Matrix Application is a frontend-only Single Page Application (SPA) built with Angular 17+
that evaluates, tracks, and manages employee skills across an organization. It provides role-based
dashboards for Employees, Managers, and Admins to assess skills via structured tests, upload
certifications, validate peers, match candidates to projects, and derive organizational skill insights.

### Purpose

- Enable employees to self-assess, track, and grow their skills over time.
- Allow managers to validate team skills, match skilled candidates to projects, and build optimized
  project teams.
- Provide administrators with organizational skill heatmaps, gap analyses, and full framework
  governance.
- Simulate a production-grade Angular SPA architecture using mock data only — no backend required.

---

## Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Framework | Angular | 17+ | Standalone components, signals-ready, mature RBAC ecosystem |
| Language | TypeScript | 5.x (strict mode) | Type safety enforced across all layers |
| State Management | NgRx | 17+ | Predictable global state for session, skills, notifications |
| UI Components | Angular Material OR PrimeNG | latest compatible | Accessible, responsive component library |
| Charts | ngx-charts OR Chart.js | latest compatible | Rich skill progress and heatmap visualizations |
| Animations | @angular/animations | bundled with Angular | Page transitions, progress bars, modal slides |
| Routing | Angular Router | bundled with Angular | Lazy loading, route guards (AuthGuard, RoleGuard) |
| HTTP / Mocking | Angular HttpClient + HTTP interceptors | bundled | Simulates API calls against local JSON files |
| Unit Testing | Jasmine + Karma | bundled with Angular CLI | In-browser unit and component tests |
| E2E Testing | Cypress | optional | End-to-end user journey validation |
| Build Tool | Angular CLI | 17+ | Scaffolding, builds, test runner |
| Styling | SCSS | — | Feature-scoped stylesheets; no inline responsive styles |
| CSS Layout | CSS Grid + Flexbox | — | Responsive layout without JS breakpoint overrides |
| Breakpoints | Angular CDK BreakpointObserver | bundled | Centralized breakpoint detection via `breakpoints.ts` |

**TypeScript strict mode MUST be enabled** (`"strict": true` in `tsconfig.json`). Use of the `any`
type is prohibited unless wrapped in a typed escape hatch with documented justification.

---

## Architecture Overview

### Pattern: Frontend-Only SPA, Mock-First

```
src/
├── app/
│   ├── core/                        # Singleton services, guards, interceptors
│   │   ├── auth/                    # AuthService, AuthGuard, RoleGuard
│   │   ├── interceptors/            # MockApiInterceptor (URL → in-memory JSON)
│   │   ├── services/                # UserService, NotificationService, etc.
│   │   └── store/                   # NgRx root state (session, notifications)
│   ├── shared/                      # Presentational components, pipes, directives
│   │   ├── components/              # SkillCard, RatingBadge, StatCard, etc.
│   │   ├── pipes/                   # ProficiencyLabelPipe, RelativeDatePipe
│   │   ├── directives/              # RoleVisibilityDirective
│   │   └── models/                  # Shared TypeScript interfaces / types
│   ├── features/                    # Lazy-loaded feature routes
│   │   ├── auth/                    # LoginComponent, UnauthorizedComponent
│   │   ├── dashboard/               # Employee / Manager / Admin dashboards
│   │   ├── my-skills/               # Skill profile, CRUD, peer validation
│   │   ├── assessments/             # Test runner, history, score card
│   │   ├── certifications/          # Upload, list, detail
│   │   ├── notifications/           # Notification list
│   │   ├── team/                    # Team skills, validation queue
│   │   ├── projects/                # Project list, create, match, team builder
│   │   ├── reports/                 # Gap analysis, team reports, heatmap
│   │   └── admin/                   # Framework management, rating config
│   ├── app.routes.ts                # Root route configuration (lazy imports)
│   ├── app.component.ts             # Shell: sidebar + router-outlet
│   └── app.config.ts                # provideRouter, provideStore, provideHttpClient
├── assets/
│   └── mock-data/                   # 10 JSON files — single source of truth
│       ├── users.json
│       ├── skill-categories.json
│       ├── skill-definitions.json
│       ├── skill-exams.json
│       ├── employee-skills.json
│       ├── certifications.json
│       ├── projects.json
│       ├── project-assignments.json
│       ├── skill-test-attempts.json
│       └── notifications.json
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── styles/
    ├── _variables.scss              # Design tokens, color system
    ├── _breakpoints.scss            # Breakpoint variables
    ├── _typography.scss             # Type scale
    └── styles.scss                  # Global styles
```

### Key Architectural Constraints

- ALL HTTP calls go through `HttpClient`; the `MockApiInterceptor` intercepts URL patterns and
  returns data from in-memory copies of the JSON files.
- CRUD operations mutate **in-memory arrays only**. Data resets on page refresh — this is by design.
- Components MUST NOT import JSON files directly (`import data from '...'` is forbidden in
  components and services; use `HttpClient` + interceptor exclusively).
- All Angular components MUST be **standalone** (`standalone: true`).
- Feature routes MUST be **lazy-loaded** via `loadComponent` or `loadChildren`.

---

## Data Strategy

### Mock-First Architecture (Non-Negotiable)

The application has no backend. All data originates from 10 JSON files in `/assets/mock-data/`. The
`MockApiInterceptor` intercepts every `HttpClient` request by URL pattern, resolves it against an
in-memory copy of the relevant JSON array, and returns an `Observable<HttpResponse<T>>` with
simulated latency of 50–200 ms.

### In-Memory CRUD Pattern

```
Component → Service.method()
  → HttpClient.get/post/put/delete('/api/resource')
  → MockApiInterceptor intercepts
  → Reads / writes in-memory array copy of JSON file
  → Returns Observable<T> (with simulated delay)
  → Effect dispatches success/failure action
  → NgRx store updates
  → Component reacts via selector
```

Data changes (create, update, delete) persist only for the browser session. A page refresh
reinitializes all data from the original JSON files.

### Interceptor URL Conventions

| URL Pattern | JSON Source | Notes |
|---|---|---|
| `POST /api/auth/login` | users.json | Match email + password |
| `GET /api/users` | users.json | Admin listing |
| `GET /api/skill-categories` | skill-categories.json | |
| `GET /api/skill-definitions` | skill-definitions.json | |
| `GET /api/skill-exams/:skillId` | skill-exams.json | Filter by skillId |
| `GET/PUT /api/employee-skills/:userId` | employee-skills.json | Filter by userId |
| `GET/POST/PUT/DELETE /api/certifications` | certifications.json | |
| `GET/POST/PUT/DELETE /api/projects` | projects.json | |
| `GET/POST/DELETE /api/project-assignments` | project-assignments.json | |
| `GET/POST /api/skill-test-attempts` | skill-test-attempts.json | |
| `GET/PATCH /api/notifications/:userId` | notifications.json | Filter by userId |

RBAC enforcement at the interceptor level: if the session role lacks permission for the requested
action, the interceptor returns `status: 403`. The UI catches this and displays the standard
permission-denied toast.

---

## Authentication & Authorization

### Mock Auth Flow

1. User submits email + password on `/login`.
2. `AuthService` calls `POST /api/auth/login` → interceptor looks up `users.json`.
3. On match: user object (`id`, `name`, `email`, `role`, `department`, `avatarUrl`) is dispatched
   to NgRx `SessionState` and mirrored to `localStorage` key `skillmatrix_session`.
4. Router navigates to `/dashboard`; the dashboard renders the role-appropriate sub-component.
5. On page refresh: `AppComponent.ngOnInit` reads `localStorage`, rehydrates NgRx store.
6. Logout: clears NgRx store + `localStorage`, navigates to `/login`.

### Session State (NgRx)

```typescript
interface SessionState {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'Employee' | 'Manager' | 'Admin';
    department: string;
    avatarUrl: string;
  } | null;
  isAuthenticated: boolean;
}
```

### Role Definitions

| Role | Description |
|---|---|
| **Employee** | Regular staff; manages own skills, takes assessments, uploads certifications |
| **Manager** | Team lead; validates team skills, builds projects, matches candidates to roles |
| **Admin** | Platform administrator; full access including skill framework management |

No role hierarchy beyond these three. No JWT tokens or refresh tokens — pure session simulation.

---

## RBAC Rules

### Permission Matrix (23 Actions)

| # | Action | Employee | Manager | Admin |
|---|:---|:---:|:---:|:---:|
| 1 | View own skill profile | ✅ | ✅ | ✅ |
| 2 | Add / edit own skills | ✅ | ✅ | ✅ |
| 3 | Delete own skills | ✅ | ✅ | ✅ |
| 4 | Take skill assessments | ✅ | ✅ | ✅ |
| 5 | Upload certifications | ✅ | ✅ | ✅ |
| 6 | View own progress / history | ✅ | ✅ | ✅ |
| 7 | Request peer validation | ✅ | ✅ | ✅ |
| 8 | Submit peer validation | ✅ | ✅ | ✅ |
| 9 | Approve / validate team skills | ❌ | ✅ | ✅ |
| 10 | View team skill profiles | ❌ | ✅ | ✅ |
| 11 | View team reports | ❌ | ✅ | ✅ |
| 12 | Create projects | ❌ | ✅ | ✅ |
| 13 | Match candidates to projects | ❌ | ✅ | ✅ |
| 14 | Build project teams | ❌ | ✅ | ✅ |
| 15 | View employee availability | ❌ | ✅ | ✅ |
| 16 | Export reports (gap / team) | ❌ | ✅ | ✅ |
| 17 | Manage skill categories / subcategories | ❌ | ❌ | ✅ |
| 18 | Define skill framework | ❌ | ❌ | ✅ |
| 19 | Configure rating weights | ❌ | ❌ | ✅ |
| 20 | View org skill heatmap | ❌ | ❌ | ✅ |
| 21 | View org gap analysis | ❌ | ❌ | ✅ |
| 22 | Manage all employee skills (any user) | ❌ | ❌ | ✅ |
| 23 | Override skill ratings | ❌ | ❌ | ✅ |

### Sidebar Navigation Per Role

**EMPLOYEE** sidebar:
- Dashboard
- My Skills
- Assessments
- Certifications
- Notifications

**MANAGER** sidebar (all Employee items, plus):
- Team Skills
- Skill Validation Queue
- Project Matching
- Projects
- Team Builder

**ADMIN** sidebar (all Manager items, plus):
- Reports
- Org Skill Heatmap
- Skill Framework (Categories / Subcategories / Definitions)
- Rating Configuration

> **ENFORCEMENT**: Unauthorized sidebar items MUST NOT be rendered to the DOM. Use Angular 17
> `@if` (or `*ngIf`) conditioned on the user's role — NOT `display: none` or `visibility: hidden`.

### UI Element Visibility Rules

All unauthorized controls MUST be removed from the DOM, never merely hidden.

| Screen | Element | Visible To |
|---|---|---|
| My Skills | Override Rating button | Admin only |
| My Skills | Delete / Edit own skill | Employee (own), Manager (own), Admin (any) |
| Validation Queue | Override Rating button | Admin only |
| Validation Queue | Approve / Reject buttons | Manager (own team) + Admin (all) |
| Projects | Delete / Edit project | Manager (own) + Admin (all) |
| Reports | Org heatmap / gap analysis tab | Admin only |
| Reports | Export buttons | Manager + Admin |

### Route Guard Matrix

| Route | Guards | Permitted Roles |
|---|---|---|
| `/login` | — (public) | All (unauthenticated) |
| `/dashboard` | AuthGuard | Employee, Manager, Admin |
| `/my-skills/**` | AuthGuard | Employee, Manager, Admin |
| `/assessments/**` | AuthGuard | Employee, Manager, Admin |
| `/certifications/**` | AuthGuard | Employee, Manager, Admin |
| `/notifications` | AuthGuard | Employee, Manager, Admin |
| `/team/**` | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin |
| `/projects/**` | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin |
| `/reports` | AuthGuard + RoleGuard(['Manager','Admin']) | Manager, Admin |
| `/reports/heatmap` | AuthGuard + RoleGuard(['Admin']) | Admin |
| `/admin/**` | AuthGuard + RoleGuard(['Admin']) | Admin |
| `/unauthorized` | — (public) | All |

**Guard Behavior**:
- `AuthGuard`: unauthenticated user → redirect to `/login`.
- `RoleGuard`: authenticated but insufficient role → redirect to `/unauthorized`.
- `/unauthorized` page: displays "Access Denied. You do not have permission to view this page."
  with a "Go to Dashboard" button.
- Post-login redirect: all roles land at `/dashboard`; the `DashboardComponent` renders
  `EmployeeDashboardComponent`, `ManagerDashboardComponent`, or `AdminDashboardComponent` via
  role-based `@switch` / `*ngSwitch`.

---

## Route Inventory (30 Screens)

| # | Route | Component | Roles | Description |
|---|---|---|---|---|
| 1 | `/login` | LoginComponent | All | Mock login form |
| 2 | `/unauthorized` | UnauthorizedComponent | All | Access denied page |
| 3 | `/dashboard` | DashboardComponent (role-switched) | All | Role-specific dashboard |
| 4 | `/my-skills` | MySkillsComponent | All | Skill list for current user |
| 5 | `/my-skills/add` | AddSkillComponent | All | Add new skill |
| 6 | `/my-skills/:skillId` | SkillDetailComponent | All | View / edit skill detail |
| 7 | `/my-skills/:skillId/assess` | AssessmentRunnerComponent | All | Take skill assessment |
| 8 | `/assessments` | AssessmentsListComponent | All | All available assessments |
| 9 | `/assessments/history` | AssessmentHistoryComponent | All | Past attempt history |
| 10 | `/assessments/:skillId/results` | AssessmentResultComponent | All | Score card post-test |
| 11 | `/certifications` | CertificationsListComponent | All | Cert list for current user |
| 12 | `/certifications/upload` | CertUploadComponent | All | Upload certification |
| 13 | `/certifications/:certId` | CertDetailComponent | All | Cert detail view |
| 14 | `/notifications` | NotificationsComponent | All | Notification centre |
| 15 | `/team` | TeamSkillsComponent | Manager, Admin | Team skill overview |
| 16 | `/team/validation-queue` | ValidationQueueComponent | Manager, Admin | Pending skill approvals |
| 17 | `/team/employee/:userId` | EmployeeProfileComponent | Manager, Admin | View employee profile |
| 18 | `/team/availability` | TeamAvailabilityComponent | Manager, Admin | Availability matrix |
| 19 | `/projects` | ProjectsListComponent | Manager, Admin | Project list |
| 20 | `/projects/create` | ProjectCreateComponent | Manager, Admin | Create project |
| 21 | `/projects/:projectId` | ProjectDetailComponent | Manager, Admin | Project detail / edit |
| 22 | `/projects/:projectId/match` | CandidateMatchComponent | Manager, Admin | Match candidates |
| 23 | `/projects/:projectId/team-builder` | TeamBuilderComponent | Manager, Admin | Assign roles / members |
| 24 | `/reports` | ReportsComponent | Manager, Admin | Reports landing |
| 25 | `/reports/gap-analysis` | GapAnalysisComponent | Manager, Admin | Skill gap report |
| 26 | `/reports/team-capability` | TeamCapabilityComponent | Manager, Admin | Team capability report |
| 27 | `/reports/heatmap` | OrgHeatmapComponent | Admin | Org skill heatmap |
| 28 | `/admin/framework` | SkillFrameworkComponent | Admin | Manage categories / definitions |
| 29 | `/admin/rating-config` | RatingConfigComponent | Admin | Configure rating weights |
| 30 | `/admin/employees` | AdminEmployeesComponent | Admin | Manage all employees |

---

## State Management

### NgRx Global Store (Root + Feature Slices)

| Slice | State Contents | Updated By |
|---|---|---|
| `session` | `user`, `isAuthenticated` | AuthService on login / logout / rehydration |
| `skills` | `mySkills[]`, `allSkills[]`, `loading`, `error` | SkillsService on load / CRUD |
| `notifications` | `notifications[]`, `unreadCount`, `loading` | NotificationService |
| `projects` | `projects[]`, `loading`, `error` | ProjectService |
| `teamSkills` | `teamMembers[]`, `validationQueue[]` | TeamService |

### Local Component State (Must NOT go in NgRx)

- Reactive form values and validation state (`FormGroup`)
- Modal open / close flag
- Pagination cursor within a view
- Sort / filter criteria that do not persist across navigation

### Rules

- MUST use `createAction`, `createReducer`, `createEffect`, `createSelector` from `@ngrx/store`.
- NgRx effects MUST handle all async HTTP calls; components MUST NOT call `HttpClient` directly.
- Selectors MUST be memoized (`createSelector`).
- `BehaviorSubject` is forbidden for globally-shared cross-component state — use the NgRx store.

---

## Rating & Scoring Engine

### System Rating Formula

```
SystemRating = (TestScore × 0.60) + (CertBonus × 0.20) + (ProjectExperience × 0.20)
```

- **TestScore**: Normalized 0.0–1.0 from the latest assessment, applying difficulty weighting.
- **CertBonus**: `0.20` if a valid (non-expired) certification exists for the skill; else `0.00`.
- **ProjectExperience**: `0.20` if the skill is tagged on at least one completed project assignment
  for the user; else `0.00`.

### Difficulty Weighting for Test Scores

| Difficulty | Base Points Per Question |
|---|---|
| Easy | 1 |
| Medium | 2 |
| Hard | 3 |

```
TestScore = (Σ earnedPoints) / (Σ maxPoints)    // range: 0.0 – 1.0
```

Stored as `earnedPoints` and `maxPoints` in `skill-test-attempts.json`.

### Final Rating Formula

```
FinalRating = (Self × 0.20) + (Manager × 0.30) + (Peer × 0.15) + (System × 0.35)
```

When any source is absent, the weights of the remaining sources are scaled proportionally to
sum to `1.0`.

### Proficiency Level Mapping

FinalRating (0.0–4.0) is converted to a percentage: `(FinalRating / 4.0) × 100`.

| Score Percentage | Level | Numeric Value |
|---|---|---|
| 0 – 40 % | Beginner | 1 |
| 41 – 65 % | Intermediate | 2 |
| 66 – 85 % | Advanced | 3 |
| 86 – 100 % | Expert | 4 |

### Confidence Indicator

| Sources Present | Confidence Label |
|---|---|
| 3 or more | High |
| 2 | Medium |
| 1 | Low |

### Candidate Match Score

```
MatchScore = (Skills Matched / Skills Required) × 100    // range: 0 – 100 %
```

Used on the candidate match (`/projects/:id/match`) and team builder screens.

### Peer Validation Rules

- Employee nominates 2–3 peers to validate a skill.
- Each peer assigns a rating of 1–4.
- A minimum of **2** peer responses are required for the peer source to count.
- Requests expire after **7 days**; if fewer than 2 responses are received, the peer source is
  excluded and weights are redistributed.
- Eligible peers MUST have the validated skill listed in their own profile.
- Peer mean rating is used as the `Peer` input to the FinalRating formula.

### Skill Staleness

- A skill is **stale** when its `lastUpdated` date is more than **6 months** in the past.
- Stale indicators: amber border on the skill card; excluded from candidate matching and team
  builder suggestions.
- Cleared by: retaking the assessment OR a manager explicitly marking the skill as reviewed.

---

## Design System

### Color Tokens (CSS Custom Properties in `_variables.scss`)

| Token | Value | Usage |
|---|---|---|
| `--color-approved` | #22C55E (green) | Approved status, success toasts |
| `--color-pending` | #F59E0B (amber) | Pending status, stale skill border |
| `--color-rejected` | #EF4444 (red) | Rejected status, error messages |
| `--color-draft` | #6B7280 (grey) | Draft status |
| `--color-stale-border` | #F59E0B (amber) | Stale skill card outline |
| `--color-primary` | #3B82F6 (blue) | Primary CTA, active links |
| `--color-surface` | #FFFFFF | Card backgrounds |
| `--color-bg` | #F9FAFB | Page background |

### Proficiency Badges

| Level | Label | Badge Color |
|---|---|---|
| 1 | Beginner | Grey (#9CA3AF) |
| 2 | Intermediate | Blue (#3B82F6) |
| 3 | Advanced | Purple (#8B5CF6) |
| 4 | Expert | Gold (#F59E0B) |

### Status Pills

| Status | Color |
|---|---|
| Approved / Completed / Available | Green |
| Pending / Partially Available / Stale border | Amber |
| Rejected / Busy | Red |
| Draft | Grey |
| In Progress | Blue |

### Toast Notification System

| Type | Color | Dismiss |
|---|---|---|
| Success | Green | Auto after 4 s |
| Error | Red | Manual |
| Info | Blue | Auto after 4 s |
| Permission Denied (HTTP 403) | Red | Manual — message: "You do not have permission to perform this action." |

---

## Responsive Design Rules

### 18.1 Breakpoints

| Token | Min Width | Context |
|---|---|---|
| `xs` | 0 px | Mobile portrait |
| `sm` | 480 px | Mobile landscape |
| `md` | 768 px | Tablet |
| `lg` | 1024 px | Small desktop |
| `xl` | 1280 px | Desktop |
| `2xl` | 1440 px | Large desktop |

Breakpoints MUST be defined once in `src/app/core/breakpoints.ts` (TypeScript constants) and in
`src/styles/_breakpoints.scss` (SCSS variables). Magic pixel values elsewhere are forbidden.

### 18.2 Layout Behavior Per Breakpoint

| Element | Desktop (≥1024 px) | Tablet (768–1023 px) | Mobile (<768 px) |
|---|---|---|---|
| Sidebar | 240 px fixed | 64 px icon strip | Hamburger drawer (overlay) |
| Header | Full with search bar | Compact with search | Compact, no search bar |
| Content area | max-width 1440 px, centered | Full width, 16 px padding | Full width, 12 px padding |

### 18.3 Component Behavior Per Breakpoint

| Component | Desktop | Tablet | Mobile |
|---|---|---|---|
| Stat cards | 4 per row | 2 per row | 1 per row |
| Skill table | Full table | Condensed table | Card list |
| Assessment | Standard layout | Standard layout | Full-screen |
| Candidate match | Side-by-side | Side-by-side | Stacked |
| Charts | Full size | Scaled proportionally | Scaled, horizontal scroll if needed |
| Forms | Two columns | Two columns | Single column |
| Modals | Centre overlay | Centre overlay | Bottom sheet (slide-up) |
| Toast | Top-right | Top-right | Bottom-centre |

### 18.4 Touch Rules

- Minimum touch target size: **44 × 44 px** on all interactive elements.
- No functionality accessible exclusively via hover (tooltips may supplement but MUST NOT be the
  sole interaction path).
- Swipe left on a skill card reveals the Delete action.
- Mobile bottom navigation bar: 5 tabs for Employee (Dashboard, My Skills, Assessments, Certs,
  Notifications); adapts for Manager / Admin roles.
- Floating Action Button (FAB) for the primary screen action on mobile.

### 18.5 Typography Scale

| Style | Desktop | Tablet | Mobile |
|---|---|---|---|
| H1 | 28 px | 24 px | 20 px |
| H2 | 20 px | 18 px | 16 px |
| Card Title | 16 px | 15 px | 14 px |
| Body | 14 px | 14 px | 14 px |
| Labels | 12 px | 12 px | 11 px |

### 18.6 Icons & Avatars

- Icons: SVG only. No icon fonts. Use the chosen component library's SVG icon set consistently.
- Avatars: `object-fit: cover`, circular crop, **40 px** on desktop / **36 px** on mobile.

### 18.7 Angular Implementation Notes

- Use `BreakpointObserver` (Angular CDK) for any JS-side breakpoint logic; inject it as a service.
- Export breakpoint constants from a single `src/app/core/breakpoints.ts`.
- CSS Custom Properties for design tokens defined in `:root` via `_variables.scss`.
- CSS Grid for page-level layout; Flexbox for component-level alignment.
- SCSS only — no inline `style` bindings in TypeScript for responsive behavior.

---

## Component Architecture

### Standalone Components (Mandatory)

Every component MUST be declared standalone:

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, /* other deps */],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent { }
```

NgModules are only permitted where Angular CLI scaffold requires them at the app root.

### Shared / Presentational Components

| Component | Selector | Purpose |
|---|---|---|
| `SkillCardComponent` | `app-skill-card` | Skill summary + stale indicator |
| `RatingBadgeComponent` | `app-rating-badge` | Proficiency badge (Beginner–Expert) |
| `StatCardComponent` | `app-stat-card` | Dashboard metric widget |
| `DataTableComponent` | `app-data-table` | Generic sortable / filterable table |
| `ConfirmDialogComponent` | `app-confirm-dialog` | Reusable confirmation modal |
| `ToastComponent` | `app-toast` | Toast notification display |
| `LoadingSpinnerComponent` | `app-loading-spinner` | Centred spinner |
| `SkeletonLoaderComponent` | `app-skeleton-loader` | Placeholder for loading lists |
| `AvatarComponent` | `app-avatar` | User avatar with fallback initials |

Shared components MUST contain no business logic. They accept `@Input()` data and emit `@Output()`
events only. All business logic lives in services and NgRx effects.

### Lazy-Loaded Feature Routes

Each feature MUST be lazy-loaded:

```typescript
// app.routes.ts
{
  path: 'my-skills',
  canActivate: [AuthGuard],
  loadChildren: () =>
    import('./features/my-skills/my-skills.routes').then(m => m.MY_SKILLS_ROUTES)
}
```

---

## Error Handling Standards

### Assessment Errors

| Scenario | Required Behavior |
|---|---|
| Timer expires | Auto-submit current answers; navigate to score card |
| Retake within cooldown (24 h) | Inline message: "You can retake this assessment in X hours." |
| No questions available | Empty state: "Assessment not yet available for this skill." |

### Certification Upload Errors

| Scenario | Validation Rule |
|---|---|
| Invalid file format | Allow PDF, JPG, PNG only; inline error on all others |
| File too large | Max 5 MB; message: "File must be under 5 MB" |
| Missing required fields | Inline red error beneath each required field |
| Expiry before issue date | Inline error: "Expiry date must be after issue date" |

### Project Errors

| Scenario | Validation Rule |
|---|---|
| Missing project name | Required; inline error |
| Deadline before start date | Inline error: "Deadline must be after start date" |
| No required skills selected | At least one required; inline error |
| Duplicate project name | Interceptor returns 409; error toast |

### Skill Errors

| Scenario | Behavior |
|---|---|
| Duplicate skill | Inline error: "You have already added this skill" |
| Delete blocked by active project | Error toast: "Cannot delete a skill assigned to an active project" |

### Candidate Matching Errors

| Scenario | Behavior |
|---|---|
| No candidates found | Empty state: illustration + "No candidates match the required skills" |

### General Standards

- Real-time inline validation on every form field (on blur AND on submit attempt).
- Error text: `--color-rejected` (#EF4444), positioned directly beneath the field.
- Success toast: green, auto-dismiss after 4 s.
- Error toast: red, manual dismiss.
- Loading states: spinner on initial data fetch; skeleton loader for list / table views.
- HTTP 403 from interceptor: ALWAYS show permission toast (never an inline error).
- HTTP 404: show "Not Found" inline empty state within the content area (no full-page redirect).
- HTTP 500 (simulated): show "Something went wrong. Please try again." error toast.

---

## Animation Standards

All animations MUST use `@angular/animations` and MUST respect the
`prefers-reduced-motion: reduce` media query (disable or shorten durations for users who request
reduced motion).

| Animation | Trigger | Duration | Notes |
|---|---|---|---|
| Page transition | Router navigation | 300 ms | Fade + slight Y translate |
| Skill progress bar fill | On view enter | 600 ms | Width animates 0 → final % |
| Test completion reveal | Score card enter | 500 ms | Scale-in + fade |
| Toast slide | Toast enter / leave | 250 ms | Slide from edge, fade out |
| Sidebar collapse | Icon-only toggle | 200 ms | Width transition (240 px → 64 px) |
| Modal / bottom sheet slide | Modal open (mobile) | 300 ms | Slide up from bottom |
| Stat card counter | Dashboard data load | 800 ms | Numeric count-up animation |

---

## Testing Standards

### Frameworks

- **Unit tests**: Jasmine + Karma (mandatory).
- **E2E tests**: Cypress (optional; implement key user journeys if time allows).

### Mandatory Unit Test Coverage Areas

| Area | What to Cover |
|---|---|
| Login validation | Email format, password non-empty, wrong credentials → error message |
| Skill rating calculation | System rating formula; final rating with all sources; final rating with missing sources |
| Level mapping | Each threshold boundary: 0–40 % → Beginner, 41–65 % → Intermediate, 66–85 % → Advanced, 86–100 % → Expert |
| Skill CRUD | Add, edit, delete; delete blocked when an active project is tagged |
| Cert validation | Format check, size check, date range logic, required field validation |
| Candidate matching | Match score formula: `(matched / required) × 100` |
| Skill gap analysis | Correct identification of missing skills for a project |
| Reporting | Data aggregation yields correct totals |
| Notification service | Mark as read; unread count decrements correctly |
| Peer validation | Min 2 responses required; 7-day expiry logic; eligible peer check |
| Skill expiry | Stale flag set correctly after 6 months |
| Team builder logic | Role assignment; skill gap detection |
| Route guards | `AuthGuard` redirects unauthenticated; `RoleGuard` redirects wrong role |
| Mock interceptor | Correct URL maps to correct data; 403 returned for unauthorized actions |

### Test Naming Convention

```typescript
describe('ServiceName / ComponentName', () => {
  it('should [expected behavior] when [condition]', () => { ... });
});
```

### Coverage Target

Aim for **≥ 80 %** statement coverage on all services and utility functions.

---

## Mock Data Specification

All files reside in `/assets/mock-data/`. Minimum volume requirements are binding.

### users.json

Minimum: **10 users** (6 Employee, 2 Manager, 1 Admin, 1 Expert-level Employee)

```jsonc
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "password": "string (plain text — mock/simulation use only)",
  "role": "Employee | Manager | Admin",
  "department": "string",
  "avatarUrl": "string (relative path or placeholder URL)"
}
```

### skill-categories.json

Must include: Development (Frontend / Backend / Mobile), QA, Cloud (AWS / Azure / Google Cloud),
DevOps (CI/CD / Containerization / Infrastructure), Data Engineering, AI/ML, Communication,
Project Management.

```jsonc
{
  "categoryId": "string",
  "categoryName": "string",
  "subCategories": [
    { "subCategoryId": "string", "subCategoryName": "string" }
  ]
}
```

### skill-definitions.json

Must include at minimum: React, Angular, Vue, HTML, CSS, JavaScript, TypeScript, Java, Node.js,
Python, .NET, Spring Boot, Flutter, React Native, Docker, Kubernetes, Jenkins, Terraform, SQL,
PostgreSQL, MongoDB, Redis.

```jsonc
{
  "skillId": "string",
  "skillName": "string",
  "categoryId": "string",
  "subCategoryId": "string",
  "description": "string"
}
```

### skill-exams.json

Each skill with an exam MUST have **5–10 questions** with a mix of Easy, Medium, and Hard difficulty.

```jsonc
{
  "skillId": "string",
  "questions": [
    {
      "questionId": "string",
      "questionText": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "difficultyLevel": "Easy | Medium | Hard"
    }
  ]
}
```

### employee-skills.json

```jsonc
{
  "userId": "string",
  "skills": [
    {
      "skillId": "string",
      "selfRating": "number (1–4) | null",
      "managerRating": "number (1–4) | null",
      "peerRating": "number (1–4) | null",
      "systemRating": "number (0.0–4.0)",
      "finalRating": "number (0.0–4.0)",
      "level": "Beginner | Intermediate | Advanced | Expert",
      "status": "Approved | Pending | Rejected",
      "lastUpdated": "string (ISO 8601 date, e.g. 2025-11-01)"
    }
  ]
}
```

### certifications.json

```jsonc
{
  "certId": "string",
  "userId": "string",
  "skillId": "string",
  "certName": "string",
  "issuingOrg": "string",
  "issueDate": "string (YYYY-MM-DD)",
  "expiryDate": "string (YYYY-MM-DD) | null",
  "filePath": "string (relative path under /assets/)"
}
```

### projects.json

Statuses: `Draft | Open | In Progress | Completed`

```jsonc
{
  "projectId": "string",
  "name": "string",
  "description": "string",
  "status": "Draft | Open | In Progress | Completed",
  "startDate": "string (YYYY-MM-DD)",
  "deadline": "string (YYYY-MM-DD)",
  "requiredSkills": ["skillId"],
  "requiredRoles": ["string"],
  "createdBy": "userId"
}
```

### project-assignments.json

```jsonc
{
  "assignmentId": "string",
  "projectId": "string",
  "userId": "string",
  "role": "string",
  "assignedDate": "string (YYYY-MM-DD)"
}
```

### skill-test-attempts.json

```jsonc
{
  "attemptId": "string",
  "userId": "string",
  "skillId": "string",
  "score": "number (0–100, percentage)",
  "earnedPoints": "number",
  "maxPoints": "number",
  "date": "string (ISO 8601 datetime)",
  "timeTaken": "number (seconds)"
}
```

### notifications.json

Types include (but are not limited to): `peer_validation_request`, `skill_approved`,
`skill_rejected`, `assessment_reminder`, `project_assigned`, `cert_expiring`.

```jsonc
{
  "notificationId": "string",
  "userId": "string",
  "type": "string",
  "message": "string",
  "isRead": "boolean",
  "date": "string (ISO 8601 datetime)"
}
```

---

## Core Principles

### I. Mock-First Architecture (NON-NEGOTIABLE)

All data MUST originate from the 10 JSON files in `/assets/mock-data/`, served exclusively through
Angular `HttpClient` interceptors. Components and services MUST NOT directly import JSON files.
The interceptor layer simulates realistic API latency and supports role-aware 403 responses.

### II. RBAC at UI Layer

Unauthorized UI elements MUST be removed from the DOM — never hidden with CSS. Route guards MUST
enforce access control, redirecting unauthorized users to `/unauthorized`. The 23-action permission
matrix defined in this document is authoritative and binding on every component and interceptor.

### III. State Management

All shared application state MUST live in NgRx. Components MUST read data exclusively from
selectors and dispatch actions to modify state. NgRx effects handle all async and HTTP operations.
Raw `BehaviorSubject` for cross-component state is prohibited.

### IV. Responsive Design

The application MUST function fully across all six breakpoints (xs through 2xl). Responsive
behavior MUST be implemented via CSS Grid / Flexbox and `BreakpointObserver`. Inline responsive
styles in TypeScript template strings and magic pixel values outside the central SCSS system are
prohibited.

### V. Test Coverage

Unit tests MUST be written for all services, guards, pipes, and logic-bearing components. Every
one of the 14 mandatory coverage areas MUST have at least one test. Coverage target: ≥ 80 % on
services and utilities.

### VI. Error Handling

Every user-facing action that can fail MUST have a defined error state: inline validation, toast
notification, or empty state. HTTP error codes from the interceptor (403, 404, 409, 500) MUST map
to specific UI feedback patterns. Loading states (spinner / skeleton) MUST accompany all async
data fetches.

### VII. Accessibility

All interactive elements MUST have accessible labels (`aria-label` or visible text). Color MUST
NOT be the sole differentiator — add icons or text labels alongside color. Minimum contrast ratio:
**4.5 : 1** for body text. All touch targets MUST be ≥ 44 × 44 px. Animations MUST respect
`prefers-reduced-motion`.

### VIII. Component Architecture

All components MUST be standalone. Feature routes MUST be lazy-loaded. Presentational components
in `app/shared/components/` MUST contain no business logic — they accept inputs and emit outputs
only.

### IX. Consistent Design System

All colors, typography, spacing, and borders MUST use CSS Custom Properties defined in
`_variables.scss`. No magic numbers in component SCSS. Status states (Approved / Pending /
Rejected / Draft / Stale) MUST use the canonical color tokens defined in the Design System section.

### X. Code Quality

TypeScript strict mode is mandatory. The `any` type is prohibited without documented justification.
SCSS only — no inline styles. Every public service method MUST declare an explicit return type.
ESLint (Angular rules) and Prettier MUST pass on all files before any commit.

---

## Enforcement Rules — What AI Agents MUST NEVER Do

When generating code for this project, the following are **absolutely prohibited**:

1. **Direct JSON imports in components / services**
   `import data from '../assets/mock-data/users.json'` — FORBIDDEN. Use `HttpClient` + interceptor.

2. **CSS-only authorization hiding**
   `display: none` or `visibility: hidden` on unauthorized elements — FORBIDDEN. Use `@if` / `*ngIf`
   to prevent DOM rendering entirely.

3. **Inline responsive styles in TypeScript**
   `[style.width]="isMobile ? '100%' : '240px'"` — FORBIDDEN. Use SCSS with breakpoint variables.

4. **`any` type without justification**
   FORBIDDEN without a typed escape wrapper and a doc comment explaining why.

5. **Components calling `HttpClient` directly for shared state**
   FORBIDDEN. Use NgRx actions → effects → store.

6. **`BehaviorSubject` for global shared state**
   FORBIDDEN. Use NgRx store slices.

7. **Hardcoded breakpoint values outside the central SCSS system**
   `@media (max-width: 768px)` in a component SCSS file without referencing the central variable —
   FORBIDDEN.

8. **Template-only role checks without corresponding route guards**
   Relying solely on `*ngIf="role === 'Admin'"` in a template without `RoleGuard` on the route —
   FORBIDDEN. Both MUST be present.

9. **Plain-text passwords in production builds**
   `users.json` uses plain-text passwords as a deliberate mock-only simulation. This data MUST NOT
   be deployed to any production or publicly-accessible environment.

10. **Feature-level NgModules**
    NgModules for feature areas — FORBIDDEN. Use standalone components + `loadComponent` /
    `loadChildren` in route definitions.

---

## Governance

- This constitution is the **single source of truth** for all architectural, design, and behavioral
  decisions in the Skill Matrix Application.
- It supersedes any conflicting guidance found in `requirement.md`, plan documents, or spec
  documents.
- **Amendment procedure**: Any change to a principle, permission matrix row, route, data schema, or
  enforcement rule requires updating this file first, incrementing the semantic version, and
  prepending an updated Sync Impact Report HTML comment.
- **Versioning policy**:
  - **MAJOR**: Removal or redefinition of a core principle; removal of a route or role.
  - **MINOR**: Addition of a new principle, route, mock data file, or permission row.
  - **PATCH**: Clarification, wording correction, additional examples, non-semantic refinements.
- **Compliance review**: All speckit phases (spec, plan, tasks, implement) MUST include a
  "Constitution Check" that verifies no enforcement rules are violated before producing output.
- **Template alignment**: `plan-template.md`, `spec-template.md`, and `tasks-template.md` must
  reflect this constitution's principles in their "Constitution Check" and task-categorization
  sections.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
