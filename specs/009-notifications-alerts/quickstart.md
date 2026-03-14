# Quickstart: Notifications and Alerts Module

**Feature**: 009-notifications-alerts
**Date**: 2026-03-13

---

## Prerequisites

- Phase 1 (Mock Auth, RBAC, Navigation) must be implemented — route guards, session store, MockApiInterceptor, app shell with header.
- Phase 3 (Employee Skill Profile) should be implemented — for skill-related notification deep links.
- Phase 4 (Skill Assessments) should be implemented — for session-generated assessment_result notifications.
- Phase 5 (Certifications) should be implemented — for certification expiry notification deep links.
- Phase 6 (Peer Validation) should be implemented — for peer validation and manager approval notification deep links.

---

## 1. Install Dependencies

No new dependencies are required. This feature uses only Angular core, NgRx, and the chosen component library (Angular Material or PrimeNG), all of which are already installed from prior phases.

---

## 2. Scaffold Components

```bash
# Notification bell icon (shared — used in header)
ng g c shared/components/notification-bell --standalone --skip-tests=false

# Notifications list screen
ng g c features/notifications/notifications-list --standalone --skip-tests=false

# Notification item (presentational)
ng g c features/notifications/notification-item --standalone --skip-tests=false
```

---

## 3. Scaffold Services

```bash
# Notification service
ng g s core/services/notification
```

---

## 4. Create NgRx Store Files

Create manually under `src/app/core/store/notifications/`:

- `notifications.actions.ts` — load, loadSuccess, loadFailure, markAsRead, markAllAsRead, addNotification, clear
- `notifications.reducer.ts` — NotificationsState with notifications[], unreadCount, loading, error
- `notifications.effects.ts` — loadNotifications$ effect (HTTP call on app init)
- `notifications.selectors.ts` — selectAllNotifications, selectUnreadCount, selectUnreadNotifications, selectLoading

**Important**: Register this store slice at the root level (in `app.config.ts`), NOT as a feature-scoped provider, because the bell badge component needs access from every route.

---

## 5. Create Shared Models

Create `src/app/shared/models/notification.model.ts` with:

- `Notification` interface
- `NotificationType` enum (10 types)
- `NotificationTypeConfig` interface
- `NOTIFICATION_TYPE_CONFIGS` constant map (type → icon + colour + label)

See [data-model.md](data-model.md) for full interface definitions.

---

## 6. Configure Routes

Add to `src/app/app.routes.ts`:

```typescript
{
  path: 'notifications',
  canActivate: [AuthGuard],
  loadComponent: () =>
    import('./features/notifications/notifications-list/notifications-list.component').then(
      (m) => m.NotificationsListComponent
    ),
},
```

---

## 7. Integrate Bell Component

Add `<app-notification-bell>` to the header section of `AppComponent` (or the shell/layout component):

```html
<!-- In app header, right side -->
@if (isAuthenticated()) {
  <app-notification-bell />
}
```

---

## 8. Update MockApiInterceptor

Add the `/api/notifications/:userId` URL pattern to the existing `MockApiInterceptor`:

```typescript
if (url.match(/\/api\/notifications\/(.+)/)) {
  const userId = /* extract from URL */;
  const userNotifications = this.notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return of(new HttpResponse({ status: 200, body: userNotifications }))
    .pipe(delay(this.randomDelay()));
}
```

---

## 9. Dispatch on App Init

In `AppComponent.ngOnInit()` (or equivalent initializer), after session rehydration:

```typescript
if (this.user) {
  this.store.dispatch(NotificationActions.load({ userId: this.user.id }));
}
```

---

## 10. Prioritised Implementation Order

| Priority | File | Description |
|---|---|---|
| 1 | `shared/models/notification.model.ts` | Notification interface + NotificationType enum |
| 2 | `core/store/notifications/notifications.actions.ts` | NgRx actions |
| 3 | `core/store/notifications/notifications.reducer.ts` | Reducer + initial state |
| 4 | `core/store/notifications/notifications.selectors.ts` | Memoized selectors |
| 5 | `core/services/notification.service.ts` | HTTP calls + helper methods |
| 6 | `core/store/notifications/notifications.effects.ts` | Load effect |
| 7 | Register store slice in `app.config.ts` | Root-level provideState |
| 8 | Update `mock-api.interceptor.ts` | Add /api/notifications pattern |
| 9 | `shared/components/notification-bell/` | Bell icon + badge |
| 10 | Integrate bell in app header | Add component to header template |
| 11 | `features/notifications/notification-item/` | Presentational item component |
| 12 | `features/notifications/notifications-list/` | List screen with mark-all |
| 13 | Add route to `app.routes.ts` | /notifications route |
| 14 | App init dispatch | Load notifications after session rehydration |
| 15 | Cross-feature integration | Add `addNotification` dispatches in Phase 4/6 effects |

---

## 11. Key Design References

- **Type icon mapping**: See [research.md](research.md) §1
- **NgRx store architecture**: See [research.md](research.md) §2
- **Session-generated notifications**: See [research.md](research.md) §3
- **Data model**: All interfaces in [data-model.md](data-model.md)
- **API contract**: Mock endpoint in [contracts/mock-api-contract.md](contracts/mock-api-contract.md)
- **Constitution**: Notification rules in Section 10, route guard matrix, RBAC rules
