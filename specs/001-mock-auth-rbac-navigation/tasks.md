# Tasks: Mock Authentication and Role-Based Navigation

**Input**: Design documents from `/specs/001-mock-auth-rbac-navigation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/mock-api-contract.md, quickstart.md

**Tests**: Included — constitution principle V mandates Jasmine + Karma unit tests for all business logic (guards, interceptor, selectors, sidebar rendering).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: Angular SPA at repository root
- Paths follow plan.md project structure under `src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and global configuration

- [x] T001 Create Angular 17 project with standalone components, SCSS, routing, and strict mode via `ng new skill-matrix --standalone --style=scss --routing --strict`
- [x] T002 Install NgRx dependencies (`@ngrx/store`, `@ngrx/effects`, `@ngrx/store-devtools`) and Angular Material + CDK (`@angular/material`, `@angular/cdk`)
- [x] T003 [P] Create SCSS design tokens in `src/styles/_variables.scss` with CSS custom properties for colors, spacing, status colors (Approved=Green, Pending=Amber, Rejected=Red, Draft=Grey, Stale=Amber), and proficiency badge colors
- [x] T004 [P] Create breakpoint SCSS variables in `src/styles/_breakpoints.scss` with xs(0px), sm(480px), md(768px), lg(1024px), xl(1280px), 2xl(1440px+) per Section 18.1
- [x] T005 [P] Create typography SCSS in `src/styles/_typography.scss` with scaling per Section 18.5 (H1: 28/24/20px, H2: 20/18/16px, Body: 14px, Labels: 12/12/11px)
- [x] T006 [P] Import SCSS partials into `src/styles/styles.scss` and configure Angular Material theme with CSS custom properties

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, state management, interceptor, and guards that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 [P] Create shared model interfaces in `src/app/shared/models/user.model.ts`: `User`, `SessionUser`, `UserRole` type, `LoginCredentials` per data-model.md
- [x] T008 [P] Create shared model interface in `src/app/shared/models/session.model.ts`: `SessionState` with user, isAuthenticated, loading, error fields per data-model.md
- [x] T009 [P] Create shared model interface in `src/app/shared/models/navigation.model.ts`: `NavItem` with label, icon, route, roles, section, children fields per data-model.md
- [x] T010 [P] Create centralized breakpoint constants in `src/app/core/breakpoints.ts` exporting breakpoint values for use with Angular CDK BreakpointObserver
- [x] T011 Create NgRx session actions in `src/app/core/store/session/session.actions.ts`: Login, Login Success, Login Failure, Logout, Restore Session, Restore Session Success, Restore Session Failure using `createActionGroup`
- [x] T012 Create NgRx session reducer in `src/app/core/store/session/session.reducer.ts` with state transitions per data-model.md SessionState table (initial → login → success/failure → logout)
- [x] T013 Create NgRx session selectors in `src/app/core/store/session/session.selectors.ts`: `selectCurrentUser`, `selectIsAuthenticated`, `selectUserRole`, `selectAuthLoading`, `selectAuthError`
- [x] T014 Create mock users data file in `src/assets/mock-data/users.json` with 10+ users (6 employees, 2 managers, 1 admin, 1 expert-level) per FR-024/FR-025 with fields: id, name, email, password, role, department, avatarUrl
- [x] T015 Create mock API interceptor in `src/app/core/interceptors/mock-api.interceptor.ts` as `HttpInterceptorFn` using `fetch()` to load JSON (preventing recursion), handling POST `/api/auth/login` with 200/401/400 responses per contracts/mock-api-contract.md, with 50-200ms simulated delay
- [x] T016 Create NgRx session effects in `src/app/core/store/session/session.effects.ts`: login effect dispatching HttpClient POST to `/api/auth/login`, mapping response to Login Success/Failure actions
- [x] T017 Create session hydration meta-reducer in `src/app/core/store/session/session.meta-reducer.ts` for bidirectional localStorage sync: read `skillmatrix_session` on `@ngrx/store/init`, persist session slice after every state change, clear on logout per research.md Decision 6
- [x] T018 Create AuthGuard as functional `CanActivateFn` in `src/app/core/auth/auth.guard.ts` reading `selectIsAuthenticated` from store, returning `true` or redirecting to `/login` per contracts/mock-api-contract.md
- [x] T019 Create RoleGuard as functional `CanActivateFn` in `src/app/core/auth/role.guard.ts` reading `selectUserRole` from store, checking against `route.data['roles']`, returning `true` or redirecting to `/unauthorized` per contracts/mock-api-contract.md
- [x] T020 Configure app providers in `src/app/app.config.ts`: provideRouter, provideStore with session feature + meta-reducer, provideEffects, provideStoreDevtools, provideHttpClient with mockApiInterceptor, provideAnimationsAsync

**Checkpoint**: Foundation ready — all models, state management, interceptor, and guards are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Employee Logs In and Sees Role-Appropriate Dashboard (Priority: P1) 🎯 MVP

**Goal**: Enable login with credential validation against mock data, session persistence in NgRx + localStorage, and redirect to /dashboard

**Independent Test**: Enter valid employee credentials on login screen → verify redirect to /dashboard with session stored

### Tests for User Story 1

- [x] T021 [P] [US1] Write unit tests for session reducer in `src/app/core/store/session/session.reducer.spec.ts`: verify state transitions for Login, Login Success, Login Failure, Logout, Restore Session actions
- [x] T022 [P] [US1] Write unit tests for session selectors in `src/app/core/store/session/session.selectors.spec.ts`: verify selectCurrentUser, selectIsAuthenticated, selectUserRole, selectAuthLoading, selectAuthError
- [x] T023 [P] [US1] Write unit tests for mock API interceptor in `src/app/core/interceptors/mock-api.interceptor.spec.ts`: verify 200 on valid login, 401 on invalid credentials, 400 on missing fields

### Implementation for User Story 1

- [x] T024 [US1] Create login component in `src/app/features/auth/login/login.component.ts` with reactive form (email + password fields), inline validation ("This field is required"), dispatching Login action on submit, displaying "Invalid email or password" from store error state per FR-001/FR-006/FR-007
- [x] T025 [US1] Create login component template in `src/app/features/auth/login/login.component.html` with Material form fields, error messages, loading spinner during auth, responsive layout (centered card max-width 400px)
- [x] T026 [US1] Create login component styles in `src/app/features/auth/login/login.component.scss` with centered login card, design tokens from _variables.scss, responsive padding
- [x] T027 [US1] Create dashboard placeholder component in `src/app/features/dashboard/dashboard.component.ts` displaying role-specific greeting (e.g., "Welcome, [name]! Role: [role]") using selectCurrentUser from store per FR-005
- [x] T028 [US1] Create auth routes in `src/app/features/auth/auth.routes.ts` with `/login` loading LoginComponent and `/unauthorized` placeholder (loadComponent)
- [x] T029 [US1] Write unit test for login component in `src/app/features/auth/login/login.component.spec.ts`: verify form validation, action dispatch on submit, error display from store

**Checkpoint**: User Story 1 complete — users can log in with valid credentials, see errors for invalid credentials, and reach the dashboard with their session persisted.

---

## Phase 4: User Story 2 — Manager and Admin See Extended Sidebar Navigation (Priority: P1)

**Goal**: Render role-filtered sidebar navigation where unauthorized items are excluded from the DOM (not CSS-hidden)

**Independent Test**: Log in as each role (Employee, Manager, Admin) and verify sidebar DOM contains only permitted menu items

### Tests for User Story 2

- [x] T030 [P] [US2] Write unit tests for navigation service in `src/app/core/services/navigation.service.spec.ts`: verify Employee gets 5 items, Manager gets Employee items + Team/Projects, Admin gets all items including Insights/Settings with sub-items
- [x] T031 [P] [US2] Write unit tests for sidebar component in `src/app/shared/components/sidebar/sidebar.component.spec.ts`: verify DOM exclusion of unauthorized items per role, section headers hidden when no children pass filter

### Implementation for User Story 2

- [x] T032 [US2] Create navigation service in `src/app/core/services/navigation.service.ts` with master NavItem[] config for all 30+ routes grouped by section (MAIN, TEAM, PROJECTS, INSIGHTS, SETTINGS), exposing `getNavItems$()` observable filtered by user role from NgRx store per contracts/mock-api-contract.md and FR-016/FR-017/FR-018
- [x] T033 [US2] Create sidebar component in `src/app/shared/components/sidebar/sidebar.component.ts` consuming NavigationService, rendering filtered NavItem[] with `@if` control flow to exclude unauthorized items from DOM, using `mat-nav-list` with `mat-expansion-panel` for Admin sub-items (Skill Framework → Categories, Subcategories, Definitions) per FR-015
- [x] T034 [US2] Create sidebar component template in `src/app/shared/components/sidebar/sidebar.component.html` with role-filtered menu items, section headers, active route highlighting via routerLinkActive, icons + text labels
- [x] T035 [US2] Create sidebar component styles in `src/app/shared/components/sidebar/sidebar.component.scss` with 240px width, active item highlight, section header styling, icon sizing, design tokens from _variables.scss

**Checkpoint**: User Story 2 complete — sidebar renders only role-permitted items; unauthorized items verified absent from DOM.

---

## Phase 5: User Story 3 — Route Guards Protect Restricted Pages (Priority: P1)

**Goal**: Enforce route guard matrix so unauthenticated users redirect to /login and unauthorized roles redirect to /unauthorized

**Independent Test**: Navigate to restricted URLs as different roles and verify correct redirect behavior per FR-013

### Tests for User Story 3

- [x] T036 [P] [US3] Write unit tests for AuthGuard in `src/app/core/auth/auth.guard.spec.ts`: verify redirect to /login when unauthenticated, allow when authenticated
- [x] T037 [P] [US3] Write unit tests for RoleGuard in `src/app/core/auth/role.guard.spec.ts`: verify redirect to /unauthorized when role not in allowed list, allow when role matches

### Implementation for User Story 3

- [x] T038 [US3] Create unauthorized component in `src/app/features/auth/unauthorized/unauthorized.component.ts` displaying "Access Denied. You do not have permission to view this page." with "Go to Dashboard" button navigating to /dashboard per FR-014
- [x] T039 [US3] Create unauthorized component template and styles in `src/app/features/auth/unauthorized/unauthorized.component.html` and `src/app/features/auth/unauthorized/unauthorized.component.scss` with centered layout, warning icon, action button
- [x] T040 [US3] Configure root route configuration in `src/app/app.routes.ts` with full guard matrix per FR-013: /login (public), /unauthorized (public), /dashboard (AuthGuard), /my-skills/** (AuthGuard), /assessments/** (AuthGuard), /certifications/** (AuthGuard), /notifications (AuthGuard), /team/** (AuthGuard+RoleGuard Manager/Admin), /projects/** (AuthGuard+RoleGuard Manager/Admin), /reports (AuthGuard+RoleGuard Manager/Admin), /reports/heatmap (AuthGuard+RoleGuard Admin), /admin/** (AuthGuard+RoleGuard Admin), wildcard → /dashboard
- [x] T041 [US3] Create placeholder lazy-loaded route files for future features: `src/app/features/dashboard/dashboard.routes.ts`, with loadComponent/loadChildren stubs for my-skills, assessments, certifications, notifications, team, projects, reports, admin route groups
- [x] T042 [US3] Write integration test in `src/app/features/auth/unauthorized/unauthorized.component.spec.ts`: verify message text, "Go to Dashboard" button navigates to /dashboard

**Checkpoint**: User Story 3 complete — all 30 routes protected by correct guards; unauthenticated → /login, unauthorized role → /unauthorized.

---

## Phase 6: User Story 4 — User Logs Out and Session Is Cleared (Priority: P2)

**Goal**: Implement logout flow that clears NgRx state + localStorage and redirects to /login

**Independent Test**: Log in, click Logout from avatar dropdown, verify session cleared and protected routes inaccessible

### Implementation for User Story 4

- [x] T043 [US4] Create avatar component in `src/app/shared/components/avatar/avatar.component.ts` displaying user avatar image (object-fit: cover, 40px circle), clickable to toggle dropdown
- [x] T044 [US4] Create header component in `src/app/shared/components/header/header.component.ts` with logo + page title (left), search placeholder (center, desktop only), notification bell with badge placeholder + avatar component with dropdown (right) per FR-019/FR-020
- [x] T045 [US4] Create header component template in `src/app/shared/components/header/header.component.html` with Material toolbar, avatar dropdown showing profile name, role badge, and Logout button that dispatches Logout action per FR-020
- [x] T046 [US4] Create header component styles in `src/app/shared/components/header/header.component.scss` with responsive layout per Section 18.2 (desktop: full header; tablet: hidden search; mobile: compact)
- [x] T047 [US4] Add logout effect in `src/app/core/store/session/session.effects.ts`: on Logout action, clear localStorage keys `skillmatrix_session` and `skillmatrix_last_route`, then navigate to /login using `router.navigate(['/login'], { replaceUrl: true })` to replace browser history and prevent back-button bypass per US4-AC2
- [x] T048 [US4] Write unit test for header component in `src/app/shared/components/header/header.component.spec.ts`: verify avatar dropdown renders profile name and role badge, Logout button dispatches Logout action

**Checkpoint**: User Story 4 complete — full logout flow clears session and redirects; avatar dropdown with profile info works.

---

## Phase 7: User Story 5 — App Shell Renders Responsive Sidebar and Header (Priority: P2)

**Goal**: Wire sidebar + header + router-outlet into app shell with responsive breakpoint behavior (240px/64px/drawer)

**Independent Test**: Resize browser to desktop(1280px+), tablet(768px), mobile(<768px) and verify sidebar adapts correctly

### Implementation for User Story 5

- [x] T049 [US5] Create app shell in `src/app/app.component.ts` using `mat-sidenav-container` with sidebar component in `mat-sidenav` and header + `router-outlet` in `mat-sidenav-content`, injecting BreakpointObserver to switch sidebar mode (side/over) and width (240px/64px/drawer) per FR-021/FR-022/FR-023
- [x] T050 [US5] Create app shell template in `src/app/app.component.html` with `mat-sidenav-container`, conditionally rendered sidebar (hidden on /login and /unauthorized routes), header inside content area, router-outlet for page content
- [x] T051 [US5] Create app shell styles in `src/app/app.component.scss` with responsive sidebar widths using CSS custom properties and breakpoint media queries per _breakpoints.scss, hamburger menu icon visibility rules, drawer overlay darkening
- [x] T052 [US5] Update sidebar component in `src/app/shared/components/sidebar/sidebar.component.ts` to accept `collapsed` input for icon-only mode (64px on tablet), show tooltips on icon hover when collapsed, emit close event for mobile drawer
- [x] T053 [US5] Write unit test for app shell in `src/app/app.component.spec.ts`: verify sidebar hidden on /login route, sidebar visible on /dashboard route, BreakpointObserver integration for responsive mode switching

**Checkpoint**: User Story 5 complete — app shell renders responsively at all 3 breakpoints with correct sidebar behavior.

---

## Phase 8: User Story 6 — Session Restores on Application Startup (Priority: P2)

**Goal**: On app init, hydrate session from localStorage so logged-in users skip the login page

**Independent Test**: Log in, close tab, reopen app → verify user is auto-logged-in without seeing login page

### Implementation for User Story 6

- [x] T054 [US6] Add Restore Session effect in `src/app/core/store/session/session.effects.ts`: on app init, dispatch Restore Session action; effect reads localStorage key `skillmatrix_session`, validates data integrity (role field exists, required fields present), dispatches Restore Session Success or Failure per research.md Decision 6; on Restore Session Success, read `skillmatrix_last_route` from localStorage and navigate to that route (with /dashboard fallback if absent, invalid path, or role-restricted per FR-009)
- [x] T054a [US6] Subscribe to `Router.events` (filtering `NavigationEnd`) in `src/app/app.component.ts` and write `event.urlAfterRedirects` to `localStorage['skillmatrix_last_route']` on each navigation, excluding /login and /unauthorized; persists the last visited route for FR-009 session restore
- [x] T055 [US6] Update AuthGuard in `src/app/core/auth/auth.guard.ts` to handle race condition: if store is not yet hydrated, wait for first emission of selectIsAuthenticated before deciding redirect
- [x] T056 [US6] Handle corrupted localStorage data: if stored JSON is unparseable or missing required fields (role, id, email), clear localStorage and dispatch Restore Session Failure per spec edge cases
- [x] T057 [US6] Write unit test for session hydration meta-reducer in `src/app/core/store/session/session.meta-reducer.spec.ts`: verify rehydration from valid localStorage, graceful handling of corrupted data, clearance on logout

**Checkpoint**: User Story 6 complete — session persistence works across page refreshes and browser restarts; corrupted data handled gracefully.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final wiring, edge cases, and validation across all stories

- [x] T058 Handle wildcard/404 routes in `src/app/app.routes.ts`: unknown routes redirect to /dashboard (for authenticated users) or /login (for unauthenticated) per spec edge cases
- [x] T059 Add toast notification service in `src/app/shared/components/toast/toast.component.ts` and wire HTTP 403 responses to trigger it; extend `src/app/core/interceptors/mock-api.interceptor.ts` to detect 403 responses and call the toast service with message "You do not have permission to perform this action." per FR-026 — this is the exclusive trigger for data-layer permission denials; route guard redirects to /unauthorized remain separate per FR-012
- [ ] T060 Verify all 10+ mock users in `src/assets/mock-data/users.json` are loadable and each role produces correct navigation experience per quickstart.md test credentials
- [ ] T061 Run quickstart.md verification checklist: login valid/invalid/empty, sidebar per role, guard redirects, session persistence, logout, responsive sidebar at 375px/768px/1280px/1440px

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Foundational phase completion
  - US1 (Login, P1) and US2 (Sidebar, P1) and US3 (Guards, P1): Can proceed in parallel after Foundational
  - US4 (Logout, P2): Depends on US1 (login must exist) and US2 (sidebar/header for dropdown)
  - US5 (Responsive Shell, P2): Depends on US2 (sidebar) and US4 (header)
  - US6 (Session Restore, P2): Depends on US1 (login) and meta-reducer from Foundational
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no story dependencies
- **US2 (P1)**: Can start after Foundational — no story dependencies
- **US3 (P1)**: Can start after Foundational — no story dependencies
- **US4 (P2)**: Depends on US1 (session actions) + needs header component
- **US5 (P2)**: Depends on US2 (sidebar) + US4 (header)
- **US6 (P2)**: Depends on US1 (session store + meta-reducer)

### Within Each User Story

- Tests written first, verified to fail before implementation
- Models/interfaces before services
- Services before components
- Components before route wiring
- Commit after each task or logical group

### Parallel Opportunities

**Within Setup (Phase 1)**:
```
T003 (_variables.scss) ║ T004 (_breakpoints.scss) ║ T005 (_typography.scss) ║ T006 (styles.scss)
```

**Within Foundational (Phase 2)**:
```
T007 (user.model) ║ T008 (session.model) ║ T009 (navigation.model) ║ T010 (breakpoints.ts)
```

**P1 User Stories (after Foundational)**:
```
US1 (Login)  ║  US2 (Sidebar)  ║  US3 (Route Guards)
```

**P2 User Stories (after P1 prerequisites)**:
```
US4 (Logout) → US5 (Shell) → US6 (Session Restore)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. **STOP and VALIDATE**: Test login flow independently
5. Demo: user can log in and see dashboard

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Login) → Test → **MVP: users can authenticate**
3. US2 (Sidebar) → Test → **Role-specific navigation works**
4. US3 (Guards) → Test → **RBAC fully enforced on all 30 routes**
5. US4 (Logout) → Test → **Full auth lifecycle complete**
6. US5 (Shell) → Test → **Responsive layout at all breakpoints**
7. US6 (Restore) → Test → **Session persistence across refreshes**
8. Polish → Final validation against quickstart.md checklist

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Login)
   - Developer B: US2 (Sidebar Navigation)
   - Developer C: US3 (Route Guards)
3. After P1 stories merge:
   - Developer A: US4 (Logout + Header)
   - Developer B: US5 (App Shell)
   - Developer C: US6 (Session Restore)

---

## Notes

- [P] tasks = different files, no dependencies — safe to run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Test credentials: Employee=priya.sharma@skillmatrix.com, Manager=kavitha.menon@skillmatrix.com, Admin=deepak.joshi@skillmatrix.com (all pw: password123)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All components must be Angular 17 standalone (no NgModules)
- All responsive styles in SCSS only — no inline responsive styles in TypeScript
