# API Contract: Mock Authentication Interceptor

**Feature**: 001-mock-auth-rbac-navigation  
**Date**: 2026-03-12  
**Type**: Internal HTTP Interceptor (MockApiInterceptor)

This contract defines the HTTP request/response interface between Angular services and the MockApiInterceptor. Although there is no real backend, all services use `HttpClient` and the interceptor simulates API behavior.

---

## Endpoints

### POST /api/auth/login

**Purpose**: Authenticate user against mock data.

**Request**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response** (200):
```json
{
  "id": "string (uuid)",
  "name": "string",
  "email": "string",
  "role": "Employee | Manager | Admin",
  "department": "string",
  "avatarUrl": "string"
}
```
Note: Password is NOT included in the response.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | Email/password mismatch | `{ "message": "Invalid email or password" }` |
| 400 | Missing email or password | `{ "message": "Email and password are required" }` |

**Interceptor Logic**:
1. Load `users.json` array
2. Find user where `user.email === body.email && user.password === body.password`
3. If found: return user object (excluding password) with status 200
4. If not found: return `HttpErrorResponse` with status 401

---

### GET /api/users

**Purpose**: List all users (Admin only).

**Success Response** (200):
```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "Employee | Manager | Admin",
    "department": "string",
    "avatarUrl": "string"
  }
]
```
Note: Password is excluded from the response array.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 403 | Session role is not Admin | `{ "message": "You do not have permission to perform this action." }` |

---

## Interceptor Behavior Contract

### URL Matching
- Interceptor matches requests by URL prefix against a registered route map
- Unmatched URLs are passed through to `next(req)` (allows external requests if needed)

### Simulated Latency
- All interceptor responses include a simulated delay of **50–200ms** (randomized)
- Implemented via RxJS `delay()` operator

### RBAC Enforcement
- Interceptor reads the current session role from NgRx store (via injected store reference)
- Routes with role restrictions return `403 HttpErrorResponse` if session role is insufficient
- Login endpoint (`/api/auth/login`) is exempt from RBAC checks

### Response Format
- All successful responses are wrapped in `HttpResponse<T>` with `status: 200`
- All error responses are thrown as `HttpErrorResponse` with appropriate status code
- Response body follows the JSON structures defined above

### Data Mutation
- `POST`, `PUT`, `DELETE` operations modify **in-memory arrays only**
- Data resets to original JSON file contents on page refresh
- No persistence across browser sessions for CRUD operations (session persistence is separate — handled by localStorage)

---

## Guard Contracts

### AuthGuard (`authGuard: CanActivateFn`)

**Input**: Route activation attempt  
**Behavior**:
1. Read `selectIsAuthenticated` from NgRx store (via `inject(Store)`)
2. If `true`: allow navigation (return `true`)
3. If `false`: redirect to `/login` with `returnUrl` query param (return `UrlTree`)

**Applied To**: All routes except `/login`, `/unauthorized`

### RoleGuard (`roleGuard: CanActivateFn`)

**Input**: Route activation attempt + `route.data['roles']` (string array)  
**Behavior**:
1. Read `selectUserRole` from NgRx store
2. If user role is in `route.data['roles']`: allow navigation (return `true`)
3. If user role is NOT in allowed list: redirect to `/unauthorized` (return `UrlTree`)

**Applied To**: Routes with role restrictions (team, projects, reports/heatmap, admin)

**Guard Execution Order**: `[authGuard, roleGuard]` — authGuard runs first; if it redirects, roleGuard is not executed.

---

## Navigation Service Contract

### `NavigationService.getNavItems$(role: UserRole): Observable<NavItem[]>`

**Input**: User role from session state  
**Output**: Observable emitting filtered array of `NavItem` objects permitted for the given role  
**Behavior**:
- Filters the master navigation configuration by checking `item.roles.includes(role)`
- Removes section headers with no visible children
- Emits new value when role changes (e.g., on login/logout)

### `NavigationService.getActiveRoute$(): Observable<string>`

**Input**: Router events  
**Output**: Observable emitting the current active route path  
**Behavior**: Used by sidebar to highlight the active menu item

---

## Session Persistence Contract

### localStorage Key: `skillmatrix_session`

**Stored Value** (JSON-serialized `SessionState`):
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "Employee | Manager | Admin",
    "department": "string",
    "avatarUrl": "string"
  },
  "isAuthenticated": true,
  "loading": false,
  "error": null
}
```

**Hydration**: On `@ngrx/store/init`, meta-reducer reads and parses this key. If valid, merges into initial state. If corrupted/unparseable, clears key and leaves state as initial (unauthenticated).

**Persistence**: After every reducer pass, the session slice is serialized and written to this key.

**Clearance**: On `Logout` action, the key is removed from localStorage.
