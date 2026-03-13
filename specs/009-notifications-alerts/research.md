# Research: Notifications and Alerts Module

**Feature**: 009-notifications-alerts
**Date**: 2026-03-13

---

## 1. Notification Type Icon Mapping

**Context**: FR-005 requires each notification to display a type icon. The 10 notification event types need consistent, recognisable icons from the chosen component library.

**Decision**: Map each notification type to an Angular Material icon (or PrimeNG equivalent).

**Icon Mapping**:

| Notification Type | Angular Material Icon | PrimeNG Icon | Meaning |
|---|---|---|---|
| `skill_approved` | `check_circle` | `pi pi-check-circle` | Skill approved by manager |
| `skill_rejected` | `cancel` | `pi pi-times-circle` | Skill rejected by manager |
| `assessment_result` | `quiz` | `pi pi-file` | Assessment score available |
| `cert_expiry_warning` | `warning` | `pi pi-exclamation-triangle` | Certification expiring in 30 days |
| `cert_expired` | `error` | `pi pi-ban` | Certification has expired |
| `skill_stale` | `schedule` | `pi pi-clock` | Skill not updated for 6 months |
| `peer_validation_request` | `group` | `pi pi-users` | Peer asked to validate a skill |
| `peer_validation_complete` | `how_to_reg` | `pi pi-user-check` | Peer completed validation |
| `skill_gap_suggestion` | `trending_up` | `pi pi-chart-line` | Training suggestion based on project gap |
| `skill_pending_approval` | `pending_actions` | `pi pi-inbox` | Manager: employee submitted skill |

**Rationale**: Angular Material's icon set covers all 10 types without custom SVGs. Each icon is semantically meaningful and visually distinct. The mapping is implemented as a constant lookup object in the component.

---

## 2. NgRx Store Architecture for Notifications

**Context**: The notifications `unreadCount` is consumed globally (header bell across all routes), while the notification list is consumed only on `/notifications`. The store slice must be registered at the root level, not as a feature-level lazy slice.

**Decision**: Register the `notifications` slice in `core/store/` at the root provider level, not in a feature route.

**Rationale**:
- The bell badge component lives in the header (app shell) and renders on every route.
- If notifications were a feature-scoped slice (registered via `provideState` in feature routes), the unread count would be unavailable until the user navigates to `/notifications`.
- Root registration via `provideStore({ notifications: notificationsReducer })` or by adding to the root `provideState` ensures the slice is available app-wide from app init.

**State Shape**:
```typescript
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
```

**Actions**:
- `[Notifications] Load` — trigger initial fetch on app init
- `[Notifications] Load Success` — store fetched notifications
- `[Notifications] Load Failure` — store error
- `[Notifications] Mark As Read` — mark single notification read by ID
- `[Notifications] Mark All As Read` — mark all as read
- `[Notifications] Add Notification` — add session-generated notification

**Effects**:
- `loadNotifications$` — on app init, call `GET /api/notifications/:userId` → dispatch success/failure
- No effects needed for mark-as-read (purely in-memory state mutation)

**Selectors**:
- `selectAllNotifications` — all notifications sorted by date descending
- `selectUnreadNotifications` — filtered to `isRead === false`
- `selectUnreadCount` — count of unread
- `selectLoading` — loading state

---

## 3. Session-Generated Notification Strategy

**Context**: FR-012 requires that in-session actions (e.g., completing an assessment) generate new notifications visible immediately without page refresh.

**Decision**: Other feature effects dispatch `addNotification` actions directly — no HTTP round-trip.

**Implementation**:
- When an assessment is completed (Phase 4 effect), after the score is calculated, the effect dispatches:
  ```typescript
  NotificationActions.addNotification({
    notification: {
      notificationId: generateUuid(),
      userId: currentUser.id,
      type: 'assessment_result',
      message: `Your ${skillName} assessment score: ${score}%.`,
      isRead: false,
      date: new Date().toISOString(),
      linkTo: `/assessments/${skillId}/result`
    }
  })
  ```
- The `notifications` reducer handles `addNotification` by prepending to the array and incrementing `unreadCount`.
- No interceptor call needed — the notification exists only in NgRx state for the session.

**Cross-Feature Integration Points**:
- Phase 4 (Assessments): `assessment_result` notification after test completion
- Phase 5 (Certifications): No automatic generation (cert expiry check would require a background scan — deferred per spec assumptions)
- Phase 6 (Peer Validation): `peer_validation_request` when employee nominates peers; `skill_approved` / `skill_rejected` when manager acts; `peer_validation_complete` when peer submits rating
- Phase 7 (Projects): No automatic generation in this phase

**Key Rule**: Session-generated notifications are lost on page refresh. This is by design (mock-first architecture — no persistence beyond notifications.json).

---

## 4. Bell Icon Badge Implementation

**Context**: FR-001/FR-002 require a bell icon with unread count badge in the header, updating reactively.

**Decision**: Create a `NotificationBellComponent` in `shared/components/` that subscribes to `selectUnreadCount`.

**Implementation**:
```typescript
@Component({
  standalone: true,
  selector: 'app-notification-bell',
  template: `
    <button (click)="navigateToNotifications()" 
            aria-label="Notifications"
            class="bell-button">
      <mat-icon>notifications</mat-icon>
      @if (unreadCount() > 0) {
        <span class="badge" aria-live="polite">{{ unreadCount() }}</span>
      }
    </button>
  `
})
export class NotificationBellComponent {
  private store = inject(Store);
  private router = inject(Router);
  unreadCount = this.store.selectSignal(selectUnreadCount);

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }
}
```

**Key Details**:
- Uses Angular 17 signals via `selectSignal` for zero-latency reactive updates.
- Badge uses `@if` (Angular 17 control flow) — not rendered in DOM when count is 0.
- `aria-live="polite"` announces badge updates to screen readers.
- Badge disappears immediately when `unreadCount` reaches 0 (SC-001, SC-004).

---

## 5. Mark-as-Read and Navigation Logic

**Context**: FR-006/FR-007 require clicking a notification to mark it as read and optionally navigate to `linkTo`.

**Decision**: Handle in the `NotificationItemComponent` click handler with conditional navigation.

**Algorithm**:
```
onNotificationClick(notification):
  1. Dispatch markAsRead(notification.notificationId)
  2. If notification.linkTo is not null/empty:
     a. Check if current user's role has access to the route
        (use RoleGuard logic or a route-access-check utility)
     b. If accessible → router.navigate([notification.linkTo])
     c. If NOT accessible → do nothing (mark as read only, no error shown)
  3. If notification.linkTo is null/empty:
     → do nothing after marking as read
```

**Edge Case — Inaccessible `linkTo`**: Per spec edge cases, if `linkTo` contains a route the user's role cannot access, the notification still marks as read but navigation is suppressed. No error message is displayed. This prevents Manager/Employee users from hitting unauthorized routes if an Admin-scoped notification somehow appears in their data.

**Route Access Check Utility**:
```typescript
function canAccessRoute(route: string, userRole: string): boolean {
  const adminOnlyRoutes = ['/admin', '/reports/heatmap'];
  const managerAdminRoutes = ['/team', '/projects', '/reports'];
  
  if (adminOnlyRoutes.some(r => route.startsWith(r))) return userRole === 'Admin';
  if (managerAdminRoutes.some(r => route.startsWith(r))) return ['Manager', 'Admin'].includes(userRole);
  return true; // public or all-authenticated routes
}
```

---

## 6. Notification Loading Strategy

**Context**: Notifications need to be loaded on app init so the bell badge shows the correct count immediately.

**Decision**: Dispatch `loadNotifications` in the app initializer or root component `ngOnInit`, after session rehydration.

**Flow**:
```
AppComponent.ngOnInit():
  1. Rehydrate session from localStorage (Phase 1)
  2. If user is authenticated:
     a. Dispatch NotificationActions.load({ userId: user.id })
     b. Effect calls GET /api/notifications/:userId
     c. Interceptor filters notifications.json by userId
     d. Success → notifications stored in NgRx → bell badge renders
  3. If user is NOT authenticated:
     → Skip notification loading (no bell shown on login page)
```

**On Login**: After successful login, dispatch `loadNotifications` so notifications appear immediately without a page refresh.

**On Logout**: Dispatch `clearNotifications` to reset the store slice.

---

## 7. Notification List Rendering and Empty State

**Context**: FR-004/FR-005/FR-013 define the `/notifications` screen layout.

**Decision**: Render as a simple scrollable list (no pagination in MVP per spec assumptions).

**Layout**:
```
/notifications screen:
┌─────────────────────────────────────────┐
│ Notifications              [Mark All ↓] │
├─────────────────────────────────────────┤
│ ● [icon] Message text here              │
│   2 hours ago                           │
├─────────────────────────────────────────┤
│   [icon] Another message (read)         │
│   Yesterday                             │
├─────────────────────────────────────────┤
│   ...                                   │
└─────────────────────────────────────────┘
```

**Visual Rules**:
- Unread notifications: bold text + coloured dot indicator (blue `--color-primary`)
- Read notifications: normal weight text, no dot
- Type icon: left-aligned, using the icon mapping from Research §1
- Date/time: relative format ("2 hours ago", "Yesterday", "Mar 10") via a `RelativeDatePipe`
- "Mark All as Read" button: right-aligned in the header bar, disabled when no unread notifications exist

**Empty State**: When user has 0 notifications total → show centred illustration + text: "You have no notifications."

**Responsive Behaviour**:
- Desktop: list maxes out at content area width, notification items have generous padding
- Tablet: full width, same layout
- Mobile: compact cards, full-width items, "Mark All as Read" as a text button above the list

---

## 8. Mock Data Structure for notifications.json

**Context**: SC-003 requires all 10 notification types represented in mock data covering all 3 roles.

**Decision**: Pre-populate notifications.json with at least 15 notifications covering all types and multiple users.

**Required Coverage**:

| Type | Recipient Role | Count |
|---|---|---|
| `skill_approved` | Employee | 1+ |
| `skill_rejected` | Employee | 1+ |
| `assessment_result` | Employee | 1+ |
| `cert_expiry_warning` | Employee | 1+ |
| `cert_expired` | Employee | 1+ |
| `skill_stale` | Employee | 1+ |
| `peer_validation_request` | Employee (peer) | 1+ |
| `peer_validation_complete` | Employee | 1+ |
| `skill_gap_suggestion` | Employee | 1+ |
| `skill_pending_approval` | Manager | 1+ |

**Mock Data Schema** (from constitution):
```jsonc
{
  "notificationId": "string (uuid)",
  "userId": "string (matches users.json id)",
  "type": "string (one of 10 types)",
  "message": "string (pre-formatted)",
  "isRead": "boolean",
  "date": "string (ISO 8601 datetime)",
  "linkTo": "string | null (route path)"
}
```

**Example Entries**:
```jsonc
[
  {
    "notificationId": "notif-001",
    "userId": "user-emp-01",
    "type": "skill_approved",
    "message": "Your Angular skill has been approved by Sarah Chen.",
    "isRead": false,
    "date": "2026-03-13T09:30:00Z",
    "linkTo": "/my-skills/skill-angular"
  },
  {
    "notificationId": "notif-010",
    "userId": "user-mgr-01",
    "type": "skill_pending_approval",
    "message": "John Doe submitted Docker for validation.",
    "isRead": false,
    "date": "2026-03-12T14:00:00Z",
    "linkTo": "/team/validation"
  }
]
```

---

## Summary of Decisions

| Topic | Decision | Key Detail |
|---|---|---|
| Type Icon Mapping | Angular Material icons | 10 distinct icons, one per type |
| NgRx Store Placement | Root-level `core/store/notifications/` | Bell badge needs global access |
| Session Notifications | Direct NgRx dispatch (no HTTP) | Cross-feature effects dispatch `addNotification` |
| Bell Badge | `NotificationBellComponent` with `selectSignal` | Zero-latency reactive updates via signals |
| Mark-as-Read | Click handler with conditional `linkTo` navigation | Inaccessible routes suppressed silently |
| Loading Strategy | Dispatch on app init after session rehydration | Also on login; clear on logout |
| List Rendering | Scrollable list, no pagination | Empty state for 0 notifications |
| Mock Data | 15+ entries covering all 10 types, 3 roles | Pre-populated in notifications.json |
