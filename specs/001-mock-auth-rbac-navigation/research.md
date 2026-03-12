# Research: Mock Authentication and Role-Based Navigation

**Feature**: 001-mock-auth-rbac-navigation  
**Date**: 2026-03-12  
**Status**: Complete — all NEEDS CLARIFICATION resolved

---

## Decision 1: Auth Guard Implementation Pattern

**Decision**: Use Angular 17 functional guards (`CanActivateFn`) with `inject()` — not class-based guards.

**Rationale**: Angular 15+ deprecated class-based `CanActivate` interface. Angular 17 fully embraces functional `CanActivateFn` guards which are simpler, tree-shakeable, and composable. Guards read auth state via NgRx selectors and return `boolean | UrlTree`.

**Implementation**:
- `authGuard: CanActivateFn` — reads `selectIsAuthenticated` from store; returns `true` or redirects to `/login`
- `roleGuard: CanActivateFn` — reads `selectUserRole` from store; checks against `route.data['roles']` array; returns `true` or redirects to `/unauthorized`
- Guards composed in array on route config: `canActivate: [authGuard, roleGuard]` — executed in order, short-circuits on first `false`/`UrlTree`

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Class-based `CanActivate` | Deprecated in Angular 15+; still works but not recommended |
| Single combined guard | Harder to reuse; violates single-responsibility |
| `canMatch` | Useful for lazy-load gating, but `canActivate` is correct for route restriction |

---

## Decision 2: NgRx Session State Structure

**Decision**: Standard NgRx feature state with `createActionGroup`, `createReducer`, `createEffect`, `createSelector`.

**Rationale**: Follows NgRx 17+ best practices. `createActionGroup` reduces boilerplate for related actions. Clean separation of concerns: effects handle HTTP + localStorage side effects, reducer handles pure state transitions, selectors provide memoized derived state.

**Actions**: `Login`, `Login Success`, `Login Failure`, `Logout`, `Restore Session`, `Restore Session Success`, `Restore Session Failure`

**State Shape**:
```typescript
interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

**Selectors**: `selectCurrentUser`, `selectIsAuthenticated`, `selectUserRole`, `selectAuthLoading`, `selectAuthError`

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| BehaviorSubject service | Prohibited by constitution principle III |
| Signal-based store | Not yet standard in NgRx; signals can be used in components for template reactivity |
| Standalone service with signals | Would work for small scope but violates constitution mandate for NgRx |

---

## Decision 3: Mock Data Interceptor Pattern

**Decision**: Use Angular 17 functional `HttpInterceptorFn` registered via `provideHttpClient(withInterceptors([...]))`. Use `fetch()` API internally to load JSON files and avoid interceptor recursion.

**Rationale**: Functional interceptors are standalone-compatible and don't require `@Injectable()`. Using native `fetch()` to load JSON files prevents infinite interceptor loops (HttpClient calls would re-trigger the interceptor). Simulated latency achieved via RxJS `delay()` operator.

**Key Design Points**:
- URL pattern matching via route map: `Record<string, { asset: string, handler: Function }>`
- Login handler: match email + password against users.json array; return 401 on mismatch
- RBAC enforcement: interceptor checks session role against route permissions; returns 403 for unauthorized actions
- Simulated delay: 50–200ms via `delay()` operator for realistic async behavior

**Recursion Prevention**: Use `fetch()` API (bypasses Angular HTTP layer) or `inject(HttpBackend)` to create an unintercepted client.

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| Class-based `HTTP_INTERCEPTORS` | Legacy; not standalone-friendly |
| json-server / MSW | External tools; spec requires interceptor-based approach |
| Direct JSON imports | Violates constitution enforcement rule #1 |

---

## Decision 4: UI Component Library

**Decision**: Angular Material (`@angular/material`) with Angular CDK `BreakpointObserver`.

**Rationale**:
- `mat-sidenav` has built-in `mode` property (`side` / `over` / `push`) mapping perfectly to the 3 breakpoints
- `BreakpointObserver` is part of `@angular/cdk` which ships with Material — zero extra dependency
- Excellent accessibility (WCAG 2.1 AA) and theme support via CSS custom properties (M3 design tokens)
- Modular imports — only import used components
- Always in sync with Angular major releases

**Responsive Sidebar Strategy**:
| Breakpoint | Sidebar Mode | Width | Behavior |
|---|---|---|---|
| Desktop (≥1024px) | `mode="side"` | 240px | Always visible, full icons + text |
| Tablet (768–1023px) | `mode="side"` | 64px | Icon-only with tooltips |
| Mobile (<768px) | `mode="over"` | 240px | Hamburger drawer overlay |

**Nested Navigation**: `mat-expansion-panel` inside `mat-nav-list` for Admin settings sub-items (Skill Framework → Categories, Subcategories, Definitions). Sufficient for the 30-route sidebar.

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| PrimeNG | Richer tree-nav (`p-panelMenu`) out-of-box, but requires adding `@angular/cdk` separately; two design systems to manage; larger bundle |
| Custom sidebar | Maximum control but significant effort; would violate YAGNI for a demo app |
| Tailwind CSS components | No sidebar component; would require building from scratch |

---

## Decision 5: Lazy Loading Strategy

**Decision**: `loadChildren` for feature route groups, `loadComponent` for standalone leaf pages.

**Rationale**:
- `loadChildren` creates one JS chunk per feature area with multiple child routes — better chunk grouping
- `loadComponent` creates one chunk per component — ideal for isolated pages (login, unauthorized)
- Guards on parent routes apply to all child routes automatically
- `route.data` (e.g., roles) is inherited by child routes unless overridden

**Pattern**:
- Leaf pages (login, unauthorized): `loadComponent`
- Feature areas (my-skills, admin, team, projects): `loadChildren` → exports `Routes` array constant
- Shell routes (dashboard): `loadComponent` since single component with role-based inner content

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| `loadChildren` with NgModule | Legacy; standalone preferred in Angular 17 |
| Eager loading | No code splitting; slower initial load |
| `@defer` blocks | For template-level lazy loading, not route-level |

---

## Decision 6: Session Persistence Strategy

**Decision**: NgRx meta-reducer for bidirectional localStorage sync (hydrate on init, persist on change).

**Rationale**: Meta-reducer intercepts `@ngrx/store/init` action to rehydrate session from localStorage, and persists the session slice after every state change. This approach is automatic, centralized, and guarantees guards have access to session state before any route resolution.

**Key Implementation**:
- localStorage key: `skillmatrix_session`
- Hydration: on `@ngrx/store/init`, parse stored JSON and merge into initial state
- Persistence: after each reducer pass, write session slice to localStorage
- Cleanup: `Logout` action clears session object → meta-reducer writes `null` state → effect removes localStorage key
- Error handling: if stored JSON is corrupted/unparseable, clear localStorage and redirect to login

**Security Considerations**:
- localStorage is vulnerable to XSS — acceptable for mock/demo app with no real credentials
- Stored session includes user object (excluding password) — password is never persisted
- Role stored in session is validated by interceptor and guards on every request — modifying localStorage role only affects UI; interceptor enforces actual permissions from source data

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| `APP_INITIALIZER` only | Can validate session at startup but runs before store is ready; can cause timing issues with guards |
| `AppComponent.ngOnInit` | Too late — guards may fire before component initializes |
| ngrx-store-localstorage library | External dependency; meta-reducer is simple enough to implement inline |
| sessionStorage | Cleared on tab close; constitution specifies localStorage persistence across refreshes |

---

## Decision 7: Role-Based Sidebar Rendering

**Decision**: Navigation configuration as data-driven array filtered by user role at runtime. Unauthorized items excluded from DOM via Angular `@if` control flow.

**Rationale**: Constitution mandates that unauthorized items MUST NOT exist in the DOM. A static configuration array defining all menu items with their `roles` property allows a single `NavigationService` to filter items based on the current user's role from NgRx store.

**Implementation**:
```typescript
interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: ('Employee' | 'Manager' | 'Admin')[];
  children?: NavItem[];
}
```

- `NavigationService` exposes a selector-derived observable of filtered `NavItem[]`
- Sidebar component subscribes and renders only permitted items
- Uses Angular 17 `@if` control flow (not `*ngIf`) for conditional rendering
- Section headers (TEAM, PROJECTS, INSIGHTS, SETTINGS) only render if at least one child item passes the role filter

**Alternatives Considered**:
| Approach | Verdict |
|---|---|
| CSS `display: none` | Violates constitution rule #2 — items still in DOM |
| Separate sidebar components per role | Duplicates template code; harder to maintain |
| Directive-based filtering | More complex than needed; data-driven array is simpler |
