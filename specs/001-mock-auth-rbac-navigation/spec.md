# Feature Specification: Mock Authentication and Role-Based Navigation

**Feature Branch**: `001-mock-auth-rbac-navigation`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Mock Authentication and Role-Based Navigation for Skill Matrix Application. This is a frontend-only Angular 17 app using mock data. There is no real backend or JWT."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Employee Logs In and Sees Role-Appropriate Dashboard (Priority: P1)

An employee navigates to the application and is presented with a login screen. They enter their email and password. The system validates the credentials against the mock user data. Upon successful login, the employee is redirected to the dashboard and sees only the sidebar menu items appropriate for their role (Dashboard, My Skills, Assessments, Certifications, Notifications). The session is persisted so that refreshing the page does not require re-login.

**Why this priority**: Login is the entry point to the entire application. Without authentication, no other feature is accessible. This story establishes the core auth flow, session management, and role-specific UI rendering.

**Independent Test**: Can be fully tested by entering valid employee credentials on the login screen and verifying redirect to /dashboard with the correct sidebar items rendered.

**Acceptance Scenarios**:

1. **Given** the user is on the login page, **When** they enter a valid employee email and password and click submit, **Then** the system stores the user session and redirects to /dashboard showing the Employee sidebar (Dashboard, My Skills, Assessments, Certifications, Notifications).
2. **Given** the user is on the login page, **When** they enter an invalid email/password combination, **Then** the system displays "Invalid email or password" as an error message on the login form.
3. **Given** the user is on the login page, **When** they click submit with empty email or password fields, **Then** inline validation messages "This field is required" appear below each empty field.
4. **Given** an employee is logged in, **When** they refresh the browser, **Then** the session is restored from persistent storage and they remain on their current page without being redirected to login.

---

### User Story 2 - Manager and Admin See Extended Sidebar Navigation (Priority: P1)

A manager or admin logs in and sees additional sidebar menu items beyond what an employee sees. The manager sees Team and Projects sections. The admin sees everything the manager sees plus Insights and Settings sections. Menu items that a role should not access do not exist in the page structure — they are not merely hidden visually.

**Why this priority**: Role-based navigation is fundamental to the RBAC system. The sidebar must correctly reflect each role's permissions to prevent unauthorized access and provide appropriate workflows.

**Independent Test**: Can be tested by logging in as each role (Employee, Manager, Admin) and verifying the sidebar DOM structure contains only the permitted menu items.

**Acceptance Scenarios**:

1. **Given** a manager is logged in, **When** the sidebar renders, **Then** it contains all Employee items plus Team Skills, Skill Validation Queue, Project Matching, Projects, and Team Builder — and no Admin-only items exist in the DOM.
2. **Given** an admin is logged in, **When** the sidebar renders, **Then** it contains all Manager items plus Reports, Org Skill Heatmap, Skill Framework (Categories, Subcategories, Skill Definitions), and Rating Configuration.
3. **Given** an employee is logged in, **When** the page source is inspected, **Then** no Manager or Admin sidebar items exist anywhere in the DOM.

---

### User Story 3 - Route Guards Protect Restricted Pages (Priority: P1)

When an unauthenticated user tries to access any protected route, they are redirected to the login page. When an authenticated user tries to access a route not allowed for their role (e.g., an Employee navigating to /admin/rating-config), they are redirected to the Unauthorized page showing "Access Denied" with a button to return to the dashboard.

**Why this priority**: Route guards are a security-critical requirement. Without them, users could bypass role restrictions by typing URLs directly, defeating the purpose of RBAC.

**Independent Test**: Can be tested by navigating to restricted URLs while logged in as different roles and verifying the correct redirect behavior.

**Acceptance Scenarios**:

1. **Given** no user is logged in, **When** someone navigates to /dashboard, **Then** the system redirects to /login.
2. **Given** an employee is logged in, **When** they navigate to /team/skills, **Then** the system redirects to /unauthorized.
3. **Given** an employee is on the /unauthorized page, **When** they click "Go to Dashboard", **Then** they are navigated to /dashboard.
4. **Given** a manager is logged in, **When** they navigate to /admin/rating-config, **Then** the system redirects to /unauthorized.
5. **Given** an admin is logged in, **When** they navigate to /admin/rating-config, **Then** the page loads successfully.

---

### User Story 4 - User Logs Out and Session Is Cleared (Priority: P2)

A logged-in user clicks on their avatar in the top header bar, sees a dropdown with their profile name, role badge, and a Logout button. Clicking Logout clears the session from both application state and persistent storage, then redirects the user to the login page. Attempting to navigate back to a protected route after logout redirects to login.

**Why this priority**: Logout completes the authentication lifecycle. It is essential for session security and multi-user demo scenarios but depends on login being implemented first.

**Independent Test**: Can be tested by logging in, clicking Logout, and verifying the session is fully cleared and protected routes are no longer accessible.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** they click their avatar and then click Logout, **Then** the session is cleared from state and persistent storage, and the user is redirected to /login.
2. **Given** a user has just logged out, **When** they press the browser back button, **Then** they are redirected to /login instead of seeing the previous protected page.

---

### User Story 5 - App Shell Renders Responsive Sidebar and Header (Priority: P2)

The application shell consists of a top header bar and a sidebar. On desktop, the sidebar is 240px wide and always visible with icons and text labels. On tablet, the sidebar collapses to 64px with icon-only display and tooltips on hover. On mobile, the sidebar is hidden and accessible via a hamburger menu that opens a full-screen drawer. The header displays the logo, page title, search bar (desktop only), notification bell with unread count badge, and user avatar with dropdown.

**Why this priority**: The app shell layout with responsive behavior is a cross-cutting concern that wraps all content. It must be in place before any feature screens can render properly.

**Independent Test**: Can be tested by resizing the browser to desktop, tablet, and mobile breakpoints and verifying sidebar and header layout adapts correctly.

**Acceptance Scenarios**:

1. **Given** the user is logged in on a desktop viewport (1280px+), **When** the app shell renders, **Then** the sidebar is fixed at 240px wide with full icons and text labels, and the header shows logo, page title, search bar, notification bell, and user avatar.
2. **Given** the user is logged in on a tablet viewport (768px), **When** the app shell renders, **Then** the sidebar collapses to 64px with icon-only display and tooltip labels on hover.
3. **Given** the user is logged in on a mobile viewport (<768px), **When** they tap the hamburger menu icon, **Then** a full-screen sidebar drawer slides in from the left with a close button, and the background is darkened.
4. **Given** the user is logged in, **When** they click the notification bell, **Then** they are navigated to the notifications screen, and the bell displays an unread count badge.
5. **Given** the user is logged in, **When** they click their avatar, **Then** a dropdown appears showing their profile name, role badge, and Logout button.

---

### User Story 6 - Session Restores on Application Startup (Priority: P2)

When the application initializes, it checks persistent storage for an existing user session. If a valid session is found, the application restores the user state and navigates the user past the login page. If no session is found, the user is directed to the login page.

**Why this priority**: Session persistence ensures continuity across page refreshes and browser restarts, which is essential for a usable demo experience. It depends on the login flow being established.

**Independent Test**: Can be tested by logging in, closing the browser tab, reopening the application, and verifying the user is automatically logged in without seeing the login page.

**Acceptance Scenarios**:

- **Given** a user previously logged in and their session exists in persistent storage, **When** the application starts, **Then** the user state is restored and they are navigated to the last visited route (stored in localStorage as `lastRoute`); if that route is absent, invalid, or restricted for their role, they fall back to /dashboard — not the login page.
2. **Given** no session exists in persistent storage, **When** the application starts, **Then** the user is directed to /login.

---

### Edge Cases

- What happens when a user manually types a URL for a route that doesn't exist? The application should redirect to the dashboard (or show a 404 state) rather than displaying a blank page.
- What happens if the persistent storage data is corrupted or incomplete (e.g., a user object missing the role field)? The application should treat it as an invalid session, clear storage, and redirect to /login.
- What happens if a user modifies the stored role in persistent storage to escalate privileges? Route guards must always re-validate the user's role from the authoritative session state, not solely from client-side storage.
- What happens when a Manager user tries to access /reports/heatmap (Admin-only)? They should be redirected to /unauthorized even though they can access /reports.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a login screen at /login with email and password input fields.
- **FR-002**: System MUST validate submitted credentials against the users.json mock data file.
- **FR-003**: Upon successful login, the system MUST store the user object (id, name, email, role, department, avatarUrl) in both application state and persistent storage (localStorage). Application state MUST be managed via a singleton `AuthService` exposing a `BehaviorSubject<User | null>` as the session state source of truth.
- **FR-004**: Upon successful login, the system MUST redirect the user to /dashboard regardless of role (Employee, Manager, or Admin).
- **FR-005**: The /dashboard route MUST render a different dashboard view depending on the logged-in user's role.
- **FR-006**: If credentials do not match, the system MUST display the error message "Invalid email or password" on the login form.
- **FR-007**: If the email or password field is empty on submit, the system MUST display inline validation "This field is required" below the empty field(s).
- **FR-008**: The user session MUST persist in localStorage across page refreshes.
- **FR-009**: On application initialization, the system MUST check localStorage for an existing session; if found, restore the user state, skip the login page, and navigate to the route stored in `lastRoute` (localStorage). If `lastRoute` is absent, invalid, or role-restricted, the system MUST fall back to /dashboard.
- **FR-010**: Logout MUST clear the user state from both application state and localStorage, then redirect to /login.
- **FR-011**: An AuthGuard MUST protect all routes except /login. Unauthenticated users accessing any protected route MUST be redirected to /login.
- **FR-012**: A RoleGuard MUST accept an array of allowed roles. If the authenticated user's role is not in the allowed list, the user MUST be redirected to /unauthorized.
- **FR-013**: The route guard matrix MUST be enforced as follows:
  - /dashboard → AuthGuard → Employee, Manager, Admin
  - /my-skills/** → AuthGuard → Employee, Manager, Admin
  - /assessments/** → AuthGuard → Employee, Manager, Admin
  - /certifications/** → AuthGuard → Employee, Manager, Admin
  - /notifications → AuthGuard → Employee, Manager, Admin
  - /team/** → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
  - /projects/** → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
  - /reports → AuthGuard + RoleGuard(['Manager','Admin']) → Manager, Admin
  - /reports/heatmap → AuthGuard + RoleGuard(['Admin']) → Admin only
  - /admin/** → AuthGuard + RoleGuard(['Admin']) → Admin only
- **FR-014**: The /unauthorized page MUST display "Access Denied. You do not have permission to view this page." and a "Go to Dashboard" button that navigates to /dashboard.
- **FR-015**: The sidebar MUST render dynamically based on the logged-in user's role. Unauthorized menu items MUST NOT exist in the DOM (not merely hidden with CSS).
- **FR-016**: EMPLOYEE sidebar MUST contain: Dashboard, My Skills, Assessments, Certifications, Notifications.
- **FR-017**: MANAGER sidebar MUST contain all Employee items plus: Team Skills, Skill Validation Queue, Project Matching (under TEAM section), Projects, Team Builder (under PROJECTS section).
- **FR-018**: ADMIN sidebar MUST contain all Manager items plus: Reports, Org Skill Heatmap (under INSIGHTS section), Skill Framework with sub-items Categories, Subcategories, Skill Definitions, and Rating Configuration (under SETTINGS section).
- **FR-019**: The top header bar MUST display: Logo + Page Title (left), Search bar (center, desktop only), Notifications bell with unread count badge + User avatar with dropdown (right).
- **FR-020**: The user avatar dropdown MUST show: profile name, role badge, and Logout button.
- **FR-021**: On desktop (1280px+), the sidebar MUST be a fixed 240px wide panel with full icons and text labels.
- **FR-022**: On tablet (768px), the sidebar MUST collapse to 64px with icon-only display and tooltip labels on hover.
- **FR-023**: On mobile (<768px), the sidebar MUST be hidden and accessible via a hamburger menu icon in the header, opening as a full-screen drawer from the left with a close button and darkened background overlay.
- **FR-024**: The users.json mock data file MUST contain a minimum of 10 users: 6 employees, 2 managers, 1 admin, and 1 user with Expert-level skills.
- **FR-025**: Each user record in users.json MUST include: id, name, email, password, role (Employee/Manager/Admin), department, and avatarUrl.
- **FR-026**: If a user navigates via URL to a restricted action or resource, the system MUST show a toast notification "You do not have permission to perform this action." and return no data.

### Key Entities

- **User**: Represents an application user with identity and role information. Attributes: id, name, email, password, role (Employee / Manager / Admin), department, avatarUrl. Serves as the foundation for authentication, authorization, and session management.
- **User Session**: Represents the authenticated state of a user. Contains the user object (excluding password) and is persisted in both application state and localStorage. Created on login, restored on app init, destroyed on logout.
- **Sidebar Menu Configuration**: Defines the navigation structure per role. Each menu item has a label, icon, route path, and optional sub-items. The configuration determines which items are rendered in the DOM based on the current user's role.
- **Route Guard Rule**: Defines access control per route. Each rule specifies the route pattern, the guard type (AuthGuard and/or RoleGuard), and the list of allowed roles.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the login process (enter credentials and reach the dashboard) in under 5 seconds.
- **SC-002**: 100% of route guard rules are enforced — no protected route is accessible without proper authentication and role authorization.
- **SC-003**: Sidebar navigation renders the correct menu items for each role with zero unauthorized items present in the DOM.
- **SC-004**: User session persists across page refresh — users do not need to re-login after refreshing the browser.
- **SC-005**: Logout fully clears the session — after logout, no protected route is accessible without re-authenticating.
- **SC-006**: The application shell (sidebar + header) adapts correctly at all three primary breakpoints: mobile (<768px), tablet (768px–1279px), and desktop (1280px+).
- **SC-007**: 100% of login validation scenarios produce the correct error message without page reload or blank state.
- **SC-008**: All 10+ mock users are loadable and each role (Employee, Manager, Admin) produces the correct navigation and dashboard experience.

## Clarifications

### Session 2026-03-13

- Q: How should Angular application state be managed for the user session? → A: Angular Service + BehaviorSubject — a singleton `AuthService` holding a `BehaviorSubject<User | null>` as the session state source of truth.
- Q: Where should the app navigate on session restore at startup? → A: Redirect to last visited route (stored as `lastRoute` in localStorage), with fallback to /dashboard if absent, invalid, or role-restricted.

## Assumptions

- This is a frontend-only application with no real backend or JWT-based authentication. Credential matching is performed against a local JSON file (users.json).
- Passwords are stored in plain text in the mock data file since this is a demo/development application — no password hashing or encryption is applied.
- The users.json file includes a password field for mock credential matching. In a real application, passwords would never be stored or transmitted in plain text.
- Session persistence uses localStorage. Data resets only if the user explicitly clears browser storage.
- The /dashboard route is a shared entry point for all roles; the specific dashboard content (Employee vs Manager vs Admin) is determined by the logged-in user's role and will be implemented in a subsequent phase (Phase 3).
- Route guard validation relies on the user role stored in application state. The application re-hydrates this state from localStorage on startup.
- Application state is managed via a singleton `AuthService` with a `BehaviorSubject<User | null>`. Components and guards subscribe to this observable; NgRx and Angular Signals are explicitly out of scope for this phase.
- The notification bell in the header displays a count badge but the full notifications feature (data, list screen) will be implemented in a subsequent phase (Phase 9).
- The search bar in the header is a visual placeholder in this phase; search functionality will be implemented in Phase 10.
- Mobile bottom navigation bar is not part of this phase — it will be addressed in Phase 10 (Responsive Design).
