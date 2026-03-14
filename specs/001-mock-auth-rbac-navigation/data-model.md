# Data Model: Mock Authentication and Role-Based Navigation

**Feature**: 001-mock-auth-rbac-navigation  
**Date**: 2026-03-12

---

## Entities

### 1. User

Represents an application user with identity and role information. Source of truth: `users.json`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | UUID, unique, required | Unique user identifier |
| `name` | `string` | required, non-empty | Full display name |
| `email` | `string` | required, unique, valid email format | Login credential |
| `password` | `string` | required, non-empty | Mock-only plain-text password (never persisted in session) |
| `role` | `'Employee' \| 'Manager' \| 'Admin'` | required, enum | Determines RBAC permissions |
| `department` | `string` | required, non-empty | Organizational department |
| `avatarUrl` | `string` | required | Relative path or placeholder URL for avatar image |

**TypeScript Interface**:
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Employee' | 'Manager' | 'Admin';
  department: string;
  avatarUrl: string;
}
```

**Validation Rules**:
- Email must be a valid email format (used for login matching)
- Password is matched as exact string comparison (mock-only, no hashing)
- Role must be one of the three enum values — no null, no custom roles

---

### 2. SessionUser

Represents the authenticated user stored in application state and localStorage. Excludes the password field from the User entity.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | from User | User identifier |
| `name` | `string` | from User | Display name |
| `email` | `string` | from User | User email |
| `role` | `'Employee' \| 'Manager' \| 'Admin'` | from User | User role for RBAC |
| `department` | `string` | from User | Department |
| `avatarUrl` | `string` | from User | Avatar URL |

**TypeScript Interface**:
```typescript
export type UserRole = 'Employee' | 'Manager' | 'Admin';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarUrl: string;
}
```

**Derivation**: Created from `User` by omitting the `password` field on successful login.

---

### 3. SessionState (NgRx State Slice)

Represents the global authentication state managed by NgRx.

| Field | Type | Default | Description |
|---|---|---|---|
| `user` | `SessionUser \| null` | `null` | Currently authenticated user |
| `isAuthenticated` | `boolean` | `false` | Whether a valid session exists |
| `loading` | `boolean` | `false` | Login request in progress |
| `error` | `string \| null` | `null` | Last login error message |

**TypeScript Interface**:
```typescript
export interface SessionState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

**State Transitions**:

| Action | user | isAuthenticated | loading | error |
|---|---|---|---|---|
| Initial | `null` | `false` | `false` | `null` |
| Login | (unchanged) | (unchanged) | `true` | `null` |
| Login Success | `SessionUser` | `true` | `false` | `null` |
| Login Failure | `null` | `false` | `false` | `"Invalid email or password"` |
| Restore Session Success | `SessionUser` | `true` | `false` | `null` |
| Restore Session Failure | `null` | `false` | `false` | `null` |
| Logout | `null` | `false` | `false` | `null` |

---

### 4. LoginCredentials

Represents the login form submission payload.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `email` | `string` | required, non-empty | User-entered email |
| `password` | `string` | required, non-empty | User-entered password |

**TypeScript Interface**:
```typescript
export interface LoginCredentials {
  email: string;
  password: string;
}
```

**Validation Rules**:
- Both fields required — empty submission shows inline "This field is required"
- No format validation beyond non-empty (mock system accepts any email format present in users.json)

---

### 5. NavItem

Represents a single navigation menu item with role-based visibility.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `label` | `string` | required | Display text for the menu item |
| `icon` | `string` | required | Material icon name (SVG) |
| `route` | `string` | required | Router link target |
| `roles` | `UserRole[]` | required, non-empty | Roles permitted to see this item |
| `section` | `string \| null` | optional | Section header grouping (e.g., "TEAM", "INSIGHTS") |
| `children` | `NavItem[] \| null` | optional | Sub-items for expandable menus |

**TypeScript Interface**:
```typescript
export interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  section?: string;
  children?: NavItem[];
}
```

---

### 6. RouteGuardRule

Defines the access control configuration per route.

| Field | Type | Description |
|---|---|---|
| `path` | `string` | Route pattern |
| `guards` | `('AuthGuard' \| 'RoleGuard')[]` | Guards applied to this route |
| `allowedRoles` | `UserRole[]` | Roles permitted access |

**Route Guard Matrix** (from spec FR-013):

| Route | Guards | Allowed Roles |
|---|---|---|
| `/login` | — (public) | All |
| `/unauthorized` | — (public) | All |
| `/dashboard` | AuthGuard | Employee, Manager, Admin |
| `/my-skills/**` | AuthGuard | Employee, Manager, Admin |
| `/assessments/**` | AuthGuard | Employee, Manager, Admin |
| `/certifications/**` | AuthGuard | Employee, Manager, Admin |
| `/notifications` | AuthGuard | Employee, Manager, Admin |
| `/team/**` | AuthGuard + RoleGuard | Manager, Admin |
| `/projects/**` | AuthGuard + RoleGuard | Manager, Admin |
| `/reports` | AuthGuard + RoleGuard | Manager, Admin |
| `/reports/heatmap` | AuthGuard + RoleGuard | Admin |
| `/admin/**` | AuthGuard + RoleGuard | Admin |

---

## Relationships

```
User (users.json)
  │
  ├──[login validates]──→ LoginCredentials (form payload)
  │
  └──[omit password]──→ SessionUser
                           │
                           ├──[stored in]──→ SessionState (NgRx store)
                           │                    │
                           │                    └──[persisted to]──→ localStorage (skillmatrix_session)
                           │
                           ├──[role determines]──→ NavItem[] (filtered sidebar)
                           │
                           └──[role checked by]──→ RouteGuardRule (authGuard + roleGuard)
```

---

## Sidebar Configuration (Static Data)

### Employee Sidebar
| Label | Icon | Route |
|---|---|---|
| Dashboard | `dashboard` | `/dashboard` |
| My Skills | `psychology` | `/my-skills` |
| Assessments | `quiz` | `/assessments` |
| Certifications | `verified` | `/certifications` |
| Notifications | `notifications` | `/notifications` |

### Manager Sidebar (Employee + below)
| Section | Label | Icon | Route |
|---|---|---|---|
| TEAM | Team Skills | `groups` | `/team` |
| TEAM | Skill Validation Queue | `fact_check` | `/team/validation-queue` |
| TEAM | Project Matching | `match` | `/projects/match` |
| PROJECTS | Projects | `folder_special` | `/projects` |
| PROJECTS | Team Builder | `engineering` | `/projects/team-builder` |

### Admin Sidebar (Manager + below)
| Section | Label | Icon | Route |
|---|---|---|---|
| INSIGHTS | Reports | `assessment` | `/reports` |
| INSIGHTS | Org Skill Heatmap | `local_fire_department` | `/reports/heatmap` |
| SETTINGS | Skill Framework | `category` | `/admin/framework` |
| SETTINGS | → Categories | `label` | `/admin/framework/categories` |
| SETTINGS | → Subcategories | `label_important` | `/admin/framework/subcategories` |
| SETTINGS | → Skill Definitions | `description` | `/admin/framework/definitions` |
| SETTINGS | Rating Configuration | `tune` | `/admin/rating-config` |

---

## Mock Data: users.json

Minimum 10 users as specified in FR-024/FR-025:

| # | Name | Email | Password | Role | Department |
|---|---|---|---|---|---|
| 1 | Priya Sharma | priya.sharma@skillmatrix.com | password123 | Employee | Engineering |
| 2 | Rahul Patel | rahul.patel@skillmatrix.com | password123 | Employee | Engineering |
| 3 | Ananya Gupta | ananya.gupta@skillmatrix.com | password123 | Employee | Design |
| 4 | Vikram Singh | vikram.singh@skillmatrix.com | password123 | Employee | QA |
| 5 | Meera Nair | meera.nair@skillmatrix.com | password123 | Employee | Data Engineering |
| 6 | Arjun Reddy | arjun.reddy@skillmatrix.com | password123 | Employee | Engineering |
| 7 | Kavitha Menon | kavitha.menon@skillmatrix.com | password123 | Manager | Engineering |
| 8 | Suresh Kumar | suresh.kumar@skillmatrix.com | password123 | Manager | QA |
| 9 | Deepak Joshi | deepak.joshi@skillmatrix.com | password123 | Admin | IT Operations |
| 10 | Neha Verma | neha.verma@skillmatrix.com | password123 | Employee | Engineering |

- User #10 (Neha Verma) is the Expert-level employee as required by FR-024
- All passwords are `password123` for demo convenience (mock-only, per constitution assumption)
- Avatar URLs use placeholder: `assets/avatars/{id}.png` or a placeholder service URL
