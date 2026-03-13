# Mock API Contract: Notifications and Alerts Module

**Feature**: 009-notifications-alerts
**Date**: 2026-03-13

---

## Overview

The Notifications module uses a minimal API surface — primarily a single read endpoint for loading notifications by user. All mutations (mark as read, add session-generated) happen purely in NgRx state without HTTP calls. The interceptor only needs to handle the initial data load.

---

## Endpoints

### 1. GET /api/notifications/:userId

Returns all notifications for a specific user, filtered from `notifications.json` by `userId`.

**Path Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | The ID of the user whose notifications to retrieve |

**Response** (200 OK):
```jsonc
[
  {
    "notificationId": "string (uuid)",
    "userId": "string",
    "type": "skill_approved | skill_rejected | assessment_result | cert_expiry_warning | cert_expired | skill_stale | peer_validation_request | peer_validation_complete | skill_gap_suggestion | skill_pending_approval",
    "message": "string (pre-formatted message)",
    "isRead": "boolean",
    "date": "string (ISO 8601 datetime)",
    "linkTo": "string | null (route path)"
  }
]
```

**Interceptor Logic**:
1. Parse `userId` from URL path
2. Filter in-memory `notifications` array where `notification.userId === userId`
3. Sort by `date` descending (most recent first)
4. Return filtered array with simulated 50–200ms latency

**Error Responses**:
- `403 Forbidden` — Unauthenticated user (no session) attempts access
- `200 OK` with empty array `[]` — Valid user with no notifications

---

### 2. PATCH /api/notifications/:userId/:notificationId (Optional)

Marks a single notification as read. This endpoint is **optional** — the primary implementation uses NgRx-only state mutation without an HTTP call. This endpoint exists only if the team decides to keep interceptor parity for all write operations.

**Path Parameters**:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `userId` | string | Yes | The user ID |
| `notificationId` | string | Yes | The notification to mark as read |

**Request Body**:
```jsonc
{
  "isRead": true
}
```

**Response** (200 OK):
```jsonc
{
  "notificationId": "string",
  "isRead": true
}
```

**Note**: As stated in the spec, write operations modify in-memory data only and reset on page refresh. The recommended approach is to skip this endpoint entirely and handle mark-as-read purely via NgRx reducer, which avoids unnecessary interceptor complexity.

---

## Interceptor Implementation Notes

The `MockApiInterceptor` needs to add a single new URL pattern:

```typescript
// In mock-api.interceptor.ts
if (url.match(/\/api\/notifications\/(.+)/)) {
  const userId = url.split('/').pop();
  const userNotifications = notifications
    .filter(n => n.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return of(new HttpResponse({ status: 200, body: userNotifications }))
    .pipe(delay(randomDelay(50, 200)));
}
```

**RBAC Enforcement**: The interceptor should verify that the session user's `id` matches the requested `userId` parameter. If they don't match, return `403`. This prevents one user from reading another user's notifications.

---

## Error Codes Summary

| Code | Meaning | Trigger |
|---|---|---|
| 200 | Success | Valid request — returns notification array (may be empty) |
| 403 | Forbidden | No authenticated session OR userId mismatch |
