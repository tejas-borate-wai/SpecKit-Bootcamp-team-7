# Implementation Plan: Notifications and Alerts

**Branch**: `009-notifications-alerts` | **Date**: 2026-03-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-notifications-alerts/spec.md`

## Summary

Implement the Notifications and Alerts module for the Skill Matrix Application — a frontend-only Angular 17 SPA. The feature delivers a persistent notification bell icon in the top header with an unread count badge, a dedicated `/notifications` list screen showing all user-specific notifications with type icons/messages/timestamps/read status, "Mark All as Read" functionality, click-to-read with optional deep-link navigation, and session-generated notification support. All notification data originates from `notifications.json` via the `MockApiInterceptor`, with read/unread state tracked in an NgRx `notifications` store slice. Ten distinct notification event types are supported (skill approval, rejection, assessment result, cert expiry warning, cert expired, skill stale, peer validation request, peer validation complete, skill gap suggestion, skill pending approval), each routed to the correct user by `userId` filtering. Session-generated notifications (e.g., after completing an assessment) are dispatched directly to the NgRx store without HTTP calls.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Angular 17+
**Primary Dependencies**: Angular 17, NgRx 17+, Angular Material or PrimeNG, Angular Router, Angular HttpClient + HTTP Interceptors, Angular CDK (BreakpointObserver)
**Storage**: In-memory via MockApiInterceptor; `notifications.json` in `/assets/mock-data/`
**Testing**: Jasmine + Karma (unit), Cypress (optional E2E)
**Target Platform**: Web browser (SPA) — desktop, tablet, mobile
**Project Type**: Frontend-only SPA (Single Page Application)
**Performance Goals**: Bell badge updates within the same render cycle as state change; notification list renders < 1 second for 100+ notifications; click-to-navigate is single-interaction
**Constraints**: No real backend; no email/SMS/push notifications; in-memory only (resets on refresh); notifications filtered by `userId` exclusively; depends on Phase 1 (auth/guards/header), Phase 3 (skill profile events), Phase 4 (assessment completion events), Phase 5 (certification expiry events), Phase 6 (peer validation/manager approval events)
**Scale/Scope**: 2 screens (/notifications, bell icon in header), 14 functional requirements, 6 success criteria, 10 notification event types

## Constitution Check

### Principle Compliance

| # | Principle | Status | Notes |
|---|---|---|---|
| I | Mock-First Architecture | ✅ PASS | Notifications loaded from `notifications.json` via HttpClient + MockApiInterceptor. No direct JSON imports. Session-generated notifications added directly to NgRx store (no interceptor round-trip needed since they are ephemeral). |
| II | RBAC at UI Layer | ✅ PASS | `/notifications` route protected by AuthGuard (all authenticated roles). No role-specific UI elements to hide — all users see the same notification list filtered by `userId`. Bell icon visible to all authenticated users in the header. |
| III | State Management | ✅ PASS | Notifications stored in NgRx `notifications` slice with `notifications[]`, `unreadCount`, and `loading`. Bell badge reads from `selectUnreadCount` selector. Mark-as-read dispatches actions → reducer updates state → components react via selectors. |
| IV | Responsive Design | ✅ PASS | Notification list follows Section 18.3: desktop = full list with type icon + message + date; tablet = same layout at 100% width; mobile = compact cards, toast positioned bottom-centre. Bell icon follows header responsive rules (Section 18.2). |
| V | Test Coverage | ✅ PASS | Unit tests for: unread count computation, mark-as-read action, mark-all-as-read, notification filtering by userId, session-generated notification dispatch, linkTo navigation logic, empty state rendering, type icon mapping. |
| VI | Error Handling | ✅ PASS | Empty state: "You have no notifications." Loading spinner during initial fetch. If `linkTo` route is inaccessible for current role, notification still marks as read but navigation is suppressed. |
| VII | Accessibility | ✅ PASS | Bell icon has `aria-label="Notifications"` with live region for badge count. Each notification item has semantic markup. Unread indicator uses bold text + dot icon (not colour alone). 44×44 px touch targets for notification items and bell. |
| VIII | Component Architecture | ✅ PASS | All components standalone. Notifications feature lazy-loaded via `loadComponent`. `NotificationItemComponent` is a presentational shared component. |
| IX | Consistent Design System | ✅ PASS | Type icons use component library SVG icon set. Unread dot uses `--color-primary`. Timestamps formatted consistently. Toast notifications for session-generated events use standard toast system. |
| X | Code Quality | ✅ PASS | TypeScript strict. No `any`. SCSS only. All service methods have explicit return types. |

### Enforcement Rule Compliance

| # | Rule | Status | Notes |
|---|---|---|---|
| 1 | No direct JSON imports | ✅ PASS | All data via HttpClient → MockApiInterceptor |
| 2 | No CSS-only auth hiding | ✅ N/A | No role-specific elements to hide in this feature |
| 3 | No inline responsive styles | ✅ PASS | All responsive via SCSS + BreakpointObserver |
| 4 | No untyped `any` | ✅ PASS | Notification interface strictly typed |
| 5 | No direct HttpClient in components | ✅ PASS | NgRx effects handle HTTP calls for initial load |
| 6 | No BehaviorSubject for global state | ✅ PASS | NgRx `notifications` slice for all notification state |
| 7 | No hardcoded breakpoints | ✅ PASS | Central `_breakpoints.scss` variables used |
| 8 | Route guards + template checks | ✅ PASS | AuthGuard on `/notifications` route |
| 9 | No plain-text passwords in prod | ✅ N/A | No auth changes in this feature |
| 10 | No feature NgModules | ✅ PASS | Standalone components + loadComponent |

## Project Structure

### Documentation (this feature)

```text
specs/009-notifications-alerts/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/app/
├── core/
│   ├── interceptors/
│   │   └── mock-api.interceptor.ts          # Existing — add /api/notifications pattern
│   ├── services/
│   │   └── notification.service.ts          # Existing or new — notification CRUD operations
│   └── store/
│       ├── notifications/
│       │   ├── notifications.actions.ts     # Load, markAsRead, markAllAsRead, addNotification
│       │   ├── notifications.reducer.ts     # NotificationsState (notifications[], unreadCount, loading)
│       │   ├── notifications.effects.ts     # Load notifications via HTTP on app init
│       │   └── notifications.selectors.ts   # selectAllNotifications, selectUnreadCount, selectLoading
├── shared/
│   ├── models/
│   │   └── notification.model.ts            # Notification interface, NotificationType enum
│   └── components/
│       └── notification-bell/               # Bell icon + badge (used in header)
│           ├── notification-bell.component.ts
│           ├── notification-bell.component.html
│           └── notification-bell.component.scss
├── features/
│   └── notifications/
│       ├── notifications-list/              # /notifications screen
│       │   ├── notifications-list.component.ts
│       │   ├── notifications-list.component.html
│       │   └── notifications-list.component.scss
│       └── notification-item/               # Single notification row (presentational)
│           ├── notification-item.component.ts
│           ├── notification-item.component.html
│           └── notification-item.component.scss
├── app.component.ts                         # Existing — includes header with bell component
└── app.routes.ts                            # Existing — add /notifications route
```

**Structure Decision**: Frontend-only SPA pattern. The notifications NgRx slice lives in `core/store/notifications/` (not under features) because the `unreadCount` is consumed globally by the header bell component across all routes. The bell icon component lives in `shared/components/notification-bell/` for reuse in the header. The notifications list screen and notification item presentational component live under `features/notifications/` and are lazy-loaded. The `NotificationService` in `core/services/` handles mock API interaction and session-generated notification dispatch.

## Complexity Tracking

> No constitution violations. All 10 principles and 10 enforcement rules pass. No justification needed.
