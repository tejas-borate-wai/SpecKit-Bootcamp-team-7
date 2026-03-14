# Data Model: Notifications and Alerts Module

**Feature**: 009-notifications-alerts
**Date**: 2026-03-13

---

## Overview

The Notifications module uses a single persisted entity (`Notification`) loaded from `notifications.json`, plus computed state (`NotificationsState`) managed in the NgRx store. Notifications are read-only from the JSON source; all mutations (mark as read, add session-generated) happen in-memory via NgRx.

---

## Entity Definitions

### 1. Notification

A single in-app message addressed to a specific user, describing a system event.

```typescript
interface Notification {
  notificationId: string;          // Unique identifier (uuid format)
  userId: string;                  // Recipient user ID (matches users.json id)
  type: NotificationType;          // Event type category
  message: string;                 // Pre-formatted human-readable message
  isRead: boolean;                 // Read/unread status
  date: string;                    // ISO 8601 datetime (e.g., "2026-03-13T09:30:00Z")
  linkTo: string | null;           // Optional deep-link route (e.g., "/my-skills/skill-angular")
}
```

**Source Data**: `notifications.json` in `/assets/mock-data/`
**Persistence**: Read from JSON on app init; mutations (read status, new entries) in-memory only
**Relationships**: References User (by `userId`)

---

### 2. NotificationType (Enum)

Classification of the 10 supported notification event types.

```typescript
enum NotificationType {
  SKILL_APPROVED = 'skill_approved',
  SKILL_REJECTED = 'skill_rejected',
  ASSESSMENT_RESULT = 'assessment_result',
  CERT_EXPIRY_WARNING = 'cert_expiry_warning',
  CERT_EXPIRED = 'cert_expired',
  SKILL_STALE = 'skill_stale',
  PEER_VALIDATION_REQUEST = 'peer_validation_request',
  PEER_VALIDATION_COMPLETE = 'peer_validation_complete',
  SKILL_GAP_SUGGESTION = 'skill_gap_suggestion',
  SKILL_PENDING_APPROVAL = 'skill_pending_approval',
}
```

**Icon Mapping** (see [research.md](research.md) §1 for full icon table):

| Type | Angular Material Icon |
|---|---|
| `skill_approved` | `check_circle` |
| `skill_rejected` | `cancel` |
| `assessment_result` | `quiz` |
| `cert_expiry_warning` | `warning` |
| `cert_expired` | `error` |
| `skill_stale` | `schedule` |
| `peer_validation_request` | `group` |
| `peer_validation_complete` | `how_to_reg` |
| `skill_gap_suggestion` | `trending_up` |
| `skill_pending_approval` | `pending_actions` |

---

### 3. NotificationTypeConfig

Static configuration for each notification type (icon, colour, label).

```typescript
interface NotificationTypeConfig {
  type: NotificationType;
  icon: string;                    // Material icon name
  iconColor: string;               // CSS custom property or hex colour
  label: string;                   // Human-readable label for accessibility
}
```

**Implementation**: Defined as a constant `Record<NotificationType, NotificationTypeConfig>` map.

---

## NgRx State Shape

### Notifications Store Slice (Root-Level)

```typescript
interface NotificationsState {
  notifications: Notification[];   // All notifications for current user, sorted by date desc
  unreadCount: number;             // Computed: count of notifications where isRead === false
  loading: boolean;                // True during initial fetch
  error: string | null;            // Error message from failed load
}
```

**Initial State**:
```typescript
const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};
```

**Registration**: Root-level via `provideStore` or root `provideState('notifications', notificationsReducer)` in `app.config.ts` — NOT feature-scoped (bell badge needs global access).

---

### Actions

```typescript
// Load notifications from mock API
const loadNotifications = createAction(
  '[Notifications] Load',
  props<{ userId: string }>()
);

const loadNotificationsSuccess = createAction(
  '[Notifications] Load Success',
  props<{ notifications: Notification[] }>()
);

const loadNotificationsFailure = createAction(
  '[Notifications] Load Failure',
  props<{ error: string }>()
);

// Mark single notification as read
const markAsRead = createAction(
  '[Notifications] Mark As Read',
  props<{ notificationId: string }>()
);

// Mark all notifications as read
const markAllAsRead = createAction(
  '[Notifications] Mark All As Read'
);

// Add session-generated notification (no HTTP)
const addNotification = createAction(
  '[Notifications] Add Notification',
  props<{ notification: Notification }>()
);

// Clear all on logout
const clearNotifications = createAction(
  '[Notifications] Clear'
);
```

---

### Selectors

```typescript
const selectNotificationsState = createFeatureSelector<NotificationsState>('notifications');

const selectAllNotifications = createSelector(
  selectNotificationsState,
  (state) => state.notifications
);

const selectUnreadNotifications = createSelector(
  selectAllNotifications,
  (notifications) => notifications.filter(n => !n.isRead)
);

const selectUnreadCount = createSelector(
  selectNotificationsState,
  (state) => state.unreadCount
);

const selectNotificationsLoading = createSelector(
  selectNotificationsState,
  (state) => state.loading
);
```

---

## Existing Data Source (Read-Only)

| JSON File | Used For | Read Fields |
|---|---|---|
| notifications.json | Initial notification load | `notificationId`, `userId`, `type`, `message`, `isRead`, `date`, `linkTo` |
| users.json | User session (userId for filtering) | `id` |

---

## Validation Rules

| Rule | Applies To | Description |
|---|---|---|
| userId match | Notification | Only notifications where `userId === currentUser.id` are loaded |
| notificationId unique | Notification | Each notification has a globally unique ID |
| date format | Notification | Must be valid ISO 8601 datetime string |
| type valid | Notification | Must match one of the 10 `NotificationType` enum values |
| linkTo route check | Notification click | If `linkTo` exists, check current user's role can access the route before navigating |
| unreadCount sync | NotificationsState | `unreadCount` must always equal `notifications.filter(n => !n.isRead).length` |

---

## State Transitions

### Notification Read Status

```
┌──────────┐    click / markAsRead    ┌──────┐
│  Unread  │ ───────────────────────→ │ Read │
└──────────┘                          └──────┘
      ↑                                  │
      │         (no reverse action)      │
      └──────────────────────────────────┘
           (reset on page refresh only)
```

- Notifications start as `isRead: false` (unread) or `isRead: true` (read) based on `notifications.json`.
- `markAsRead` transitions a single notification from unread → read (irreversible within session).
- `markAllAsRead` transitions all unread notifications → read in one action.
- On page refresh, all state resets to original `notifications.json` values (mock-first architecture).

### Notification Lifecycle

```
App Init
  → Dispatch loadNotifications(userId)
  → Interceptor filters notifications.json by userId
  → Store populated with user's notifications
  → Bell badge shows unreadCount

During Session
  → User clicks notification → markAsRead dispatched
  → Other features dispatch addNotification (session-generated)
  → unreadCount updates reactively

Logout
  → clearNotifications dispatched
  → Store reset to initial state
  → Bell badge hidden (user on login page)
```
