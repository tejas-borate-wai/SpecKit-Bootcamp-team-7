# Quickstart: Mock Authentication and Role-Based Navigation

**Feature**: 001-mock-auth-rbac-navigation  
**Date**: 2026-03-12

---

## Prerequisites

- Node.js 18+ and npm 9+
- Angular CLI 17+ (`npm install -g @angular/cli`)

## Project Setup

```bash
# Create Angular 17 project with standalone, SCSS, routing
ng new skill-matrix --standalone --style=scss --routing --strict

cd skill-matrix

# Install dependencies
npm install @ngrx/store @ngrx/effects @ngrx/store-devtools
npm install @angular/material @angular/cdk
```

## Key File Locations

| File | Purpose |
|---|---|
| `src/app/app.config.ts` | Root providers: router, store, httpClient, interceptor |
| `src/app/app.routes.ts` | Root route configuration with guards |
| `src/app/app.component.ts` | Shell: sidebar + header + router-outlet |
| `src/app/core/auth/auth.guard.ts` | `authGuard: CanActivateFn` — redirects unauthenticated to /login |
| `src/app/core/auth/role.guard.ts` | `roleGuard: CanActivateFn` — redirects unauthorized role to /unauthorized |
| `src/app/core/interceptors/mock-api.interceptor.ts` | `HttpInterceptorFn` — routes HttpClient calls to JSON data |
| `src/app/core/store/session/` | NgRx session state (actions, reducer, effects, selectors) |
| `src/app/core/services/navigation.service.ts` | Role-filtered sidebar navigation config |
| `src/app/shared/models/user.model.ts` | User, SessionUser, UserRole interfaces |
| `src/app/features/auth/login/login.component.ts` | Login form with reactive form validation |
| `src/app/features/auth/unauthorized/unauthorized.component.ts` | Access denied page |
| `src/assets/mock-data/users.json` | 10+ mock users with credentials |
| `src/styles/_variables.scss` | Design tokens, CSS custom properties |
| `src/styles/_breakpoints.scss` | Breakpoint SCSS variables |

## Build Order (Recommended)

1. **Models** — Define `User`, `SessionUser`, `UserRole`, `NavItem`, `LoginCredentials` interfaces
2. **Mock Data** — Create `users.json` with 10 users
3. **NgRx Session Store** — Actions, reducer, selectors (no effects yet)
4. **Mock API Interceptor** — Login endpoint handler (POST /api/auth/login)
5. **NgRx Session Effects** — Login effect using HttpClient → interceptor
6. **Session Hydration Meta-Reducer** — localStorage read/write
7. **Auth Guard + Role Guard** — Functional guards reading from NgRx store
8. **App Config** — Wire up providers (router, store, httpClient + interceptor)
9. **Login Component** — Reactive form with validation, dispatches login action
10. **Unauthorized Component** — Static page with "Go to Dashboard" button
11. **Navigation Service** — Role-filtered NavItem[] configuration
12. **Sidebar Component** — Responsive sidebar with BreakpointObserver
13. **Header Component** — Logo, search placeholder, notification bell, avatar dropdown
14. **App Shell** — Wire sidebar + header + router-outlet in app.component
15. **Route Configuration** — All 30 routes with guards and lazy loading
16. **Dashboard Placeholder** — Role-switched placeholder component
17. **Unit Tests** — Guards, interceptor, auth service, selectors, sidebar rendering

## Running the App

```bash
# Development server
ng serve

# Navigate to http://localhost:4200/login
# Login with: priya.sharma@skillmatrix.com / password123 (Employee)
#         or: kavitha.menon@skillmatrix.com / password123 (Manager)
#         or: deepak.joshi@skillmatrix.com / password123 (Admin)
```

## Running Tests

```bash
# Unit tests
ng test

# Unit tests with coverage
ng test --code-coverage
```

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Employee | priya.sharma@skillmatrix.com | password123 |
| Manager | kavitha.menon@skillmatrix.com | password123 |
| Admin | deepak.joshi@skillmatrix.com | password123 |

## Verification Checklist

- [ ] Login with valid credentials → redirects to /dashboard
- [ ] Login with invalid credentials → shows "Invalid email or password"
- [ ] Login with empty fields → shows "This field is required"
- [ ] Employee sidebar shows 5 items only; no manager/admin items in DOM
- [ ] Manager sidebar shows employee items + team/projects sections
- [ ] Admin sidebar shows all items including insights/settings
- [ ] Employee navigating to /team → redirects to /unauthorized
- [ ] Unauthenticated user navigating to /dashboard → redirects to /login
- [ ] Page refresh preserves login session
- [ ] Logout clears session and redirects to /login
- [ ] Sidebar responsive: 240px desktop, 64px tablet, drawer mobile
