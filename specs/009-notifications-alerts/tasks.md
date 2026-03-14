# Tasks: Notifications and Alerts Module

**Input**: Design documents from `/specs/009-notifications-alerts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single SPA project**: `src/app/` at repository root
- Paths assume Angular 17 standalone component architecture per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — models, NgRx store scaffolding, and interceptor registration

- [x] T001 [P] Define Notification interface, NotificationType enum, and NotificationTypeConfig interface in src/app/shared/models/notification.model.ts
- [x] T002 [P] Define NOTIFICATION_TYPE_CONFIGS constant map (type → icon name, icon colour, label) in src/app/shared/models/notification.model.ts
- [x] T003 Create NgRx actions (load, loadSuccess, loadFailure, markAsRead, markAllAsRead, addNotification, clear) in src/app/core/store/notifications/notifications.actions.ts
- [x] T004 Create NgRx reducer with NotificationsState (notifications[], unreadCount, loading, error) and initial state in src/app/core/store/notifications/notifications.reducer.ts
- [x] T005 [P] Create NgRx selectors (selectAllNotifications, selectUnreadNotifications, selectUnreadCount, selectNotificationsLoading) in src/app/core/store/notifications/notifications.selectors.ts
- [x] T006 Register notifications store slice at root level via provideState in src/app/app.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story — interceptor pattern, notification service, and NgRx effect for initial data load

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Add /api/notifications/:userId URL pattern to MockApiInterceptor with userId filtering, date-descending sort, RBAC enforcement (session userId must match), and simulated latency in src/app/core/interceptors/mock-api.interceptor.ts
- [x] T008 Create NotificationService with loadNotifications(userId) method calling GET /api/notifications/:userId via HttpClient in src/app/core/services/notification.service.ts
- [x] T009 Create NgRx effect loadNotifications$ that listens for load action, calls NotificationService.loadNotifications, and dispatches loadSuccess/loadFailure in src/app/core/store/notifications/notifications.effects.ts
- [x] T010 Register NotificationsEffects at root level via provideEffects in src/app/app.config.ts
- [x] T011 [P] Populate notifications.json mock data with 15+ entries covering all 10 notification types across Employee, Manager, and Peer users (SC-003) in src/assets/mock-data/notifications.json
- [x] T012 Add /notifications route with AuthGuard to app.routes.ts with lazy-loaded NotificationsListComponent in src/app/app.routes.ts

**Checkpoint**: Foundation ready — interceptor registered, store connected, mock data populated, route defined

---

## Phase 3: User Story 1 — View Unread Notifications via Bell Icon (Priority: P1) 🎯 MVP

**Goal**: Display a notification bell icon in the header with an unread count badge; clicking navigates to /notifications

**Independent Test**: Load app with pre-populated notifications.json containing 3 unread notifications for the logged-in user. Confirm badge shows "3". Click bell → navigate to /notifications. With 0 unread → no badge.

### Implementation for User Story 1

- [x] T013 [US1] Create NotificationBellComponent (standalone) with bell icon, unread badge via selectUnreadCount signal, click handler navigating to /notifications in src/app/shared/components/notification-bell/notification-bell.component.ts
- [x] T014 [US1] Create notification-bell template with mat-icon (or pi icon), @if for badge visibility, aria-label="Notifications", aria-live="polite" on badge in src/app/shared/components/notification-bell/notification-bell.component.html
- [x] T015 [P] [US1] Create notification-bell SCSS with badge positioning (absolute top-right), badge colour (--color-rejected), bell button 44×44px touch target, responsive sizing per Section 18.2 in src/app/shared/components/notification-bell/notification-bell.component.scss
- [x] T016 [US1] Integrate NotificationBellComponent into the app header template — render inside @if(isAuthenticated()) block in the right section of the header in src/app/app.component.html (or shell/layout component)
- [x] T017 [US1] Dispatch NotificationActions.load({ userId }) in AppComponent.ngOnInit after session rehydration from localStorage; skip if not authenticated in src/app/app.component.ts

**Checkpoint**: Bell icon visible in header with correct badge count. Clicking navigates to /notifications. Badge disappears when unread count is 0.

---

## Phase 4: User Story 2 — Review and Read Notifications List (Priority: P1)

**Goal**: Display the /notifications screen with a full list of notifications showing type icon, message, date, read/unread status. Support click-to-read with optional linkTo navigation and "Mark All as Read".

**Independent Test**: Navigate to /notifications with mixed read/unread notifications. Verify each item shows icon + message + date + unread indicator. Click unread notification → marked read + navigates to linkTo. Click "Mark All as Read" → all become read + badge disappears.

### Implementation for User Story 2

- [x] T018 [P] [US2] Create NotificationItemComponent (standalone, presentational) accepting Notification as @Input() and emitting (clicked) @Output() event in src/app/features/notifications/notification-item/notification-item.component.ts
- [x] T019 [P] [US2] Create notification-item template displaying type icon (from NOTIFICATION_TYPE_CONFIGS map), message text, relative date (via RelativeDatePipe or date pipe), and unread indicator (bold + dot) in src/app/features/notifications/notification-item/notification-item.component.html
- [x] T020 [P] [US2] Create notification-item SCSS with unread styling (bold text, --color-primary dot), read styling (normal weight, no dot), 44×44px min touch target, hover state in src/app/features/notifications/notification-item/notification-item.component.scss
- [x] T021 [US2] Create NotificationsListComponent (standalone) with selector for selectAllNotifications, dispatch markAsRead on item click, dispatch markAllAsRead on button click, and route navigation for linkTo in src/app/features/notifications/notifications-list/notifications-list.component.ts
- [x] T022 [US2] Create notifications-list template with page header ("Notifications" title + "Mark All as Read" button disabled when no unread), @for loop rendering NotificationItemComponent per notification, @if empty state ("You have no notifications."), loading spinner via selectNotificationsLoading in src/app/features/notifications/notifications-list/notifications-list.component.html
- [x] T023 [P] [US2] Create notifications-list SCSS with list layout, empty state centred styling, responsive behaviour (desktop full-width list, mobile compact cards, full-width items per Section 18.3) in src/app/features/notifications/notifications-list/notifications-list.component.scss
- [x] T024 [US2] Implement linkTo navigation logic in NotificationsListComponent — on notification click: dispatch markAsRead, then check if linkTo is non-null and user's role can access the route (using route-access-check utility per research.md §5), navigate if accessible, suppress silently if not in src/app/features/notifications/notifications-list/notifications-list.component.ts
- [x] T025 [US2] Create route-access-check utility function canAccessRoute(route, userRole) mapping admin-only and manager-admin routes per constitution route guard matrix in src/app/core/utils/route-access.util.ts

**Checkpoint**: /notifications screen shows all user notifications with correct icons, messages, dates, read/unread status. Clicking marks as read and navigates. "Mark All as Read" works. Empty state shown when no notifications.

---

## Phase 5: User Story 3 — Receive Role-Specific Notification Events (Priority: P2)

**Goal**: Validate that the 10 notification event types are correctly routed to the right users via userId filtering. All types represented in mock data.

**Independent Test**: Seed notifications.json with one notification of each type for different user IDs. Log in as each user → see only their notifications with correct type icons and messages.

### Implementation for User Story 3

- [x] T026 [US3] Verify and update notifications.json to ensure all 10 notification types are present with correct message templates matching spec (skill_approved, skill_rejected, assessment_result, cert_expiry_warning, cert_expired, skill_stale, peer_validation_request, peer_validation_complete, skill_gap_suggestion, skill_pending_approval) in src/assets/mock-data/notifications.json
- [x] T027 [US3] Verify each notification entry in notifications.json has linkTo set to the correct deep-link route (e.g., skill_approved → /my-skills/:skillId, peer_validation_request → /team/validation, skill_pending_approval → /team/validation) in src/assets/mock-data/notifications.json
- [x] T028 [US3] Verify userId filtering in MockApiInterceptor returns only notifications matching the authenticated user's id — test by logging in as Employee user, Manager user, and confirming each sees exclusively their own notifications

**Checkpoint**: All 10 notification types present in mock data. Each user sees only their own notifications. Message templates match spec exactly.

---

## Phase 6: User Story 4 — Session-Generated Notifications (Priority: P3)

**Goal**: When a user completes an in-session action (e.g., assessment), a new notification is generated and added to the store immediately — visible in the bell badge and notification list without page refresh.

**Independent Test**: Complete an assessment → check /notifications for a new "assessment_result" notification that was not in original notifications.json. Bell badge count increments by 1.

### Implementation for User Story 4

- [x] T029 [US4] Add addNotification action handler in notifications.reducer.ts — prepend notification to notifications array and increment unreadCount in src/app/core/store/notifications/notifications.reducer.ts
- [x] T030 [US4] Create generateNotificationId() utility function (uuid-like string generator) in src/app/core/utils/notification-id.util.ts
- [x] T031 [US4] Add session-generated notification dispatch in assessment completion effect — after assessment score is calculated, dispatch NotificationActions.addNotification with type assessment_result, formatted message, linkTo /assessments/:skillId/result in the assessments feature effects file (Phase 4 integration point)
- [x] T032 [US4] Add session-generated notification dispatch in skill approval effect — after manager approves a skill, dispatch NotificationActions.addNotification with type skill_approved, formatted message, linkTo /my-skills/:skillId in the team/validation feature effects file (Phase 6 integration point)
- [x] T033 [US4] Add session-generated notification dispatch in skill rejection effect — after manager rejects a skill, dispatch NotificationActions.addNotification with type skill_rejected, formatted message in the team/validation feature effects file (Phase 6 integration point)
- [x] T034 [US4] Add session-generated notification dispatch in peer validation request — when employee nominates peers, dispatch NotificationActions.addNotification with type peer_validation_request to each selected peer's userId in the peer validation feature effects file (Phase 6 integration point)

**Checkpoint**: Session-generated notifications appear immediately in bell badge and notification list. No page refresh required. Assessment completion, skill approval/rejection, and peer validation all generate notifications.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple components; logout handling; accessibility audit

- [x] T035 Add clearNotifications action dispatch on logout — when user logs out, dispatch NotificationActions.clear to reset notifications state in src/app/core/auth/ (AuthService or logout effect)
- [x] T036 Add loadNotifications dispatch on login success — after successful login and session store, dispatch NotificationActions.load({ userId }) in the auth/login effect or AuthService
- [x] T037 [P] Verify bell icon accessibility — aria-label="Notifications" on button, aria-live="polite" on badge, keyboard focusable, Enter key triggers navigation
- [x] T038 [P] Verify notification list accessibility — each notification item is keyboard navigable (tab + Enter), unread indicator uses bold text + dot (not colour alone), proper heading hierarchy on page
- [x] T039 [P] Verify responsive behaviour — notification list renders correctly at 375px (mobile), 768px (tablet), 1280px (desktop) per Section 18.3/18.2; bell icon adapts to header responsive rules
- [x] T040 Run quickstart.md validation — confirm all files exist, routes registered, store slice active, bell component integrated, mock data complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) — bell icon + badge
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) — notification list screen
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) — mock data validation
- **User Story 4 (Phase 6)**: Depends on Phases 3 + 4 — session notifications need bell + list to be visible
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational — no dependency on US1 (but US1 provides bell badge verification)
- **User Story 3 (P2)**: Can start after Foundational — independent mock data validation
- **User Story 4 (P3)**: Depends on US1 (bell) and US2 (list) being complete — session notifications need both surfaces to verify

### Within Each User Story

- Models/interfaces before services
- Services before components
- Components before integration
- Core implementation before responsive/accessibility polish

### Parallel Opportunities

- T001 + T002 can run in parallel (same file but independent sections)
- T003, T004, T005 can run in parallel (separate NgRx files)
- T011 (mock data) can run in parallel with T007–T010 (interceptor + service + effects)
- T013 + T015 can run in parallel (component + SCSS)
- T018 + T019 + T020 can run in parallel (notification-item files)
- US1 and US2 can start in parallel after Phase 2 (different components/files)
- US3 can run in parallel with US1/US2 (mock data validation only)
- T037 + T038 + T039 can run in parallel (independent verification tasks)

---

## Parallel Example: User Story 2

```bash
# Launch all notification-item files together:
Task T018: "Create NotificationItemComponent in notification-item.component.ts"
Task T019: "Create notification-item template in notification-item.component.html"
Task T020: "Create notification-item SCSS in notification-item.component.scss"
# Then sequentially:
Task T021: "Create NotificationsListComponent (depends on NotificationItemComponent)"
Task T022: "Create notifications-list template"
Task T023: "Create notifications-list SCSS (parallel with T022)"
Task T024: "Implement linkTo navigation logic"
Task T025: "Create route-access-check utility"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (models, actions, reducer, selectors)
2. Complete Phase 2: Foundational (interceptor, service, effects, mock data, route)
3. Complete Phase 3: User Story 1 (bell icon with badge)
4. Complete Phase 4: User Story 2 (notification list with mark-as-read)
5. **STOP and VALIDATE**: Bell shows correct count; list renders; click marks read; Mark All works
6. Deploy/demo if ready — this is the MVP

### Incremental Delivery

1. Setup + Foundational → Store and data layer ready
2. Add User Story 1 → Bell icon works → Deploy/Demo (minimal viable notification awareness)
3. Add User Story 2 → Full list screen works → Deploy/Demo (MVP!)
4. Add User Story 3 → All 10 types validated in mock data → Deploy/Demo
5. Add User Story 4 → Session-generated notifications live → Deploy/Demo (complete feature)
6. Polish → Accessibility, responsive, logout/login integration → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (bell icon)
   - Developer B: User Story 2 (notification list)
   - Developer C: User Story 3 (mock data validation)
3. User Story 4 starts after US1 + US2 are complete (needs both surfaces)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- NgRx notifications slice is registered at ROOT level (not feature-scoped) because bell badge needs global access
- Session-generated notifications (US4) are cross-feature integration points — they require Phase 4/6 effects to exist
- All tasks reference exact file paths from plan.md project structure
- Total tasks: 40
