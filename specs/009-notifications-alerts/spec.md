# Feature Specification: Notifications and Alerts Module

**Feature Branch**: `009-notifications-alerts`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Notifications and Alerts Module for Skill Matrix Application"

## Overview

The Notifications and Alerts Module provides every user of the Skill Matrix Application with timely, contextual in-app notifications about skill lifecycle events, certification status, peer validation activity, and manager actions. Notifications are surfaced via a persistent bell icon in the top header and a dedicated notifications list screen, giving users a reliable inbox for all system-generated activity relevant to them.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Unread Notifications via Bell Icon (Priority: P1)

An employee logs into the application and sees a notification bell in the top-right header showing a badge count of 3. They click the bell, which navigates them to the /notifications screen where they can review everything that needs their attention.

**Why this priority**: The bell icon is the primary awareness mechanism for all notification events. Without it, users have no persistent signal that anything requires action. It is the entry point for the entire feature.

**Independent Test**: Can be fully tested by loading the app with pre-populated notifications.json containing 3 unread notifications for the logged-in user, confirming the badge count is "3", clicking the bell, and confirming navigation to /notifications.

**Acceptance Scenarios**:

1. **Given** a logged-in user with 3 unread notifications, **When** the header renders, **Then** the bell icon displays a badge showing "3"
2. **Given** a logged-in user clicks the bell icon, **When** the click event fires, **Then** the user is navigated to /notifications
3. **Given** a logged-in user with 0 unread notifications, **When** the header renders, **Then** no badge is displayed on the bell icon
4. **Given** all notifications have been read, **When** the header re-renders, **Then** the badge disappears

---

### User Story 2 - Review and Read Notifications List (Priority: P1)

An employee opens the /notifications screen and sees a full list of their notifications, each showing a type icon, message text, date/time, and read/unread status. They click a notification to mark it as read and navigate to the relevant screen.

**Why this priority**: This is the core content delivery surface of the feature. Every notification event is meaningless unless the user can read it and act on it.

**Independent Test**: Can be fully tested by loading /notifications for a user who has both read and unread notifications, verifying all attributes are displayed correctly, clicking one unread notification, and confirming it is marked read and navigates appropriately.

**Acceptance Scenarios**:

1. **Given** a logged-in user on /notifications with mixed read/unread notifications, **When** the list loads, **Then** each notification shows: type icon, message, date/time, and a visual unread indicator
2. **Given** an unread notification with a `linkTo` route in its data, **When** the user clicks it, **Then** the notification is marked as read AND the user is navigated to the linked route
3. **Given** an unread notification with no `linkTo` value, **When** the user clicks it, **Then** the notification is marked as read with no navigation change
4. **Given** the /notifications screen is open, **When** the user clicks "Mark All as Read", **Then** all notifications for that user are marked as read and all unread indicators are removed
5. **Given** a user with no notifications, **When** the list loads, **Then** an empty state message is displayed (e.g., "You have no notifications.")

---

### User Story 3 - Receive Role-Specific Notification Events (Priority: P2)

Users across all roles receive notifications relevant only to their role and context. An employee receives skill approval, assessment result, and certification alerts. A manager receives new skill submission alerts. A peer receives validation request notifications.

**Why this priority**: The value of notifications depends entirely on their relevance. Generic or mis-targeted notifications erode trust. This story validates that the 10 event types are correctly routed to the right users.

**Independent Test**: Can be fully tested by seeding notifications.json with one notification of each type and verifying that loading the app as each respective role (Employee, Manager, Peer) shows only the notifications matching their userId.

**Acceptance Scenarios**:

1. **Given** an employee user, **When** their skill is approved, **Then** they receive a notification: "Your [Skill Name] has been approved by [Manager Name]."
2. **Given** an employee user, **When** their skill is rejected, **Then** they receive a notification: "Your [Skill Name] was rejected. Reason: [reason]."
3. **Given** an employee user, **When** an assessment result is available, **Then** they receive: "Your [Skill Name] assessment score: [score]%."
4. **Given** an employee user, **When** a certification is 30 days from expiry, **Then** they receive: "Your [Cert Name] expires on [Date]. Renew to maintain your rating."
5. **Given** an employee user, **When** a certification has expired, **Then** they receive: "Your [Cert Name] has expired and is no longer contributing to your rating."
6. **Given** an employee user, **When** a skill has not been updated for 6 months, **Then** they receive: "Your [Skill Name] rating is outdated. Retake the assessment to keep it current."
7. **Given** a peer user, **When** selected for skill validation, **Then** they receive: "[Employee Name] requested you to validate their [Skill Name] skill."
8. **Given** an employee user, **When** a peer completes their validation, **Then** they receive: "[Peer Name] has validated your [Skill Name] skill."
9. **Given** an employee user, **When** a skill gap training suggestion is triggered, **Then** they receive: "Based on project requirements, consider improving your [Skill Name] (currently [X]%, needed [Y]%)."
10. **Given** a manager user, **When** an employee submits a skill for validation, **Then** they receive: "[Employee Name] submitted [Skill Name] for validation."

---

### User Story 4 - Session-Generated Notifications (Priority: P3)

When a user completes an in-session action (such as finishing an assessment), a new notification is generated and added to the notification list in real time without requiring a page refresh.

**Why this priority**: This rounds out the feature by making it dynamic during a session, not purely reliant on pre-seeded data. It is a P3 because the demo can function with pre-populated data, but session-generated notifications are needed for the full user flow.

**Independent Test**: Can be fully tested by taking an assessment to completion, then checking the /notifications screen for a new "assessment result available" notification that was not in the original notifications.json.

**Acceptance Scenarios**:

1. **Given** a user completes an assessment, **When** the result is calculated, **Then** a new notification of type "assessment_result" is added to the user's notification list
2. **Given** a new notification is added during the session, **When** the header bell re-renders, **Then** the unread badge count increments by 1
3. **Given** a new session-generated notification is added, **When** the user navigates to /notifications, **Then** the new notification appears at the top of the list

---

### Edge Cases

- What happens when a user has more than 100 notifications? The list must remain scrollable and performant; pagination or virtual scrolling should be considered.
- What happens when `linkTo` contains a route the current user's role cannot access? The notification must still mark as read, but navigation should be suppressed and no error displayed.
- What happens when the same notification event fires multiple times for the same user and skill (e.g., skill goes stale twice)? Duplicate handling is deferred to mock data — notifications.json controls uniqueness for demo purposes.
- What happens if a user switches roles between sessions? Only notifications matching the current user's userId (from NgRx/localStorage) are shown.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a notification bell icon in the top-right header area visible to all authenticated users regardless of role
- **FR-002**: The bell icon MUST display a numeric unread count badge when the logged-in user has one or more unread notifications; the badge MUST disappear when unread count reaches zero
- **FR-003**: Clicking the bell icon MUST navigate the user to the /notifications screen
- **FR-004**: The /notifications screen MUST show all notifications belonging to the logged-in user, ordered by date descending (most recent first)
- **FR-005**: Each notification in the list MUST display: a type icon, the message text, the date/time, and a visual indicator of read/unread status
- **FR-006**: Clicking an unread notification MUST mark it as read in the application state
- **FR-007**: Clicking a notification with a `linkTo` value MUST navigate the user to that route after marking the notification as read
- **FR-008**: The /notifications screen MUST include a "Mark All as Read" button that marks all of the logged-in user's notifications as read simultaneously
- **FR-009**: The system MUST support all 10 notification event types defined in Section 10 of requirement.md, with correct message templates and correct recipient role routing
- **FR-010**: Notifications persisted in notifications.json MUST be loaded via Angular HttpClient interceptor (not direct JSON import) so the data layer is consistent with other features
- **FR-011**: Read/unread status MUST be tracked in NgRx state for the duration of the session and reflected immediately across all components (bell badge and list view) without page refresh
- **FR-012**: New notifications generated during a session (e.g., completing an assessment) MUST be added to NgRx state and immediately visible in the notification list and bell badge
- **FR-013**: The /notifications screen MUST display an empty state message when the user has no notifications
- **FR-014**: The /notifications route MUST be accessible to all authenticated roles (Employee, Manager, Admin) and protected by AuthGuard

### Key Entities

- **Notification**: A single in-app message addressed to a specific user. Attributes: unique identifier, recipient user identifier, event type category, pre-formatted message string, read/unread state, timestamp of creation, optional deep-link route destination
- **Notification Type**: A classification that determines the icon displayed and the event category (e.g., skill_approval, skill_rejection, assessment_result, cert_expiry_warning, cert_expired, skill_stale, peer_validation_request, peer_validation_complete, skill_gap_suggestion, skill_pending_approval)
- **Notification State**: The aggregated in-memory collection of all notifications for the current session, including unread count per user, stored in NgRx store

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The unread notification count badge updates within the same render cycle as the underlying state change — users see the correct count without any manual refresh
- **SC-002**: Clicking a notification and being navigated to its linked route takes no more than one user interaction (single click)
- **SC-003**: All 10 notification event types are represented in the pre-populated notifications.json mock data, covering all 3 roles (Employee, Manager, Peer/Colleague), enabling a complete demo walkthrough without any additional configuration
- **SC-004**: "Mark All as Read" reduces the unread count to zero and removes all unread indicators in a single action, confirmed visually without page reload
- **SC-005**: The notifications list correctly filters to show only the logged-in user's own notifications — a user switching between accounts (by re-logging) sees only their respective notifications
- **SC-006**: Session-generated notifications (from completing an assessment) appear in the notification list and increment the bell badge count within the same user session without requiring a page refresh

---

## Assumptions

- Notifications are in-app only; no email, SMS, or push notifications are required
- All notifications for demo purposes are pre-populated in notifications.json at startup; the system does not generate new notifications automatically from data state changes (e.g., no background job scanning cert expiry dates) — session-generated notifications are only triggered by explicit in-session user actions
- The `linkTo` field in notifications.json may be null/empty for notifications that do not correspond to a navigable route
- Notification data is read-only from notifications.json; write/delete operations on notifications (mark as read, mark all as read) update only in-memory NgRx state and are lost on page refresh
- Notification ordering is by date descending; no sorting controls are required in this phase
- There is no pagination requirement for the notifications list in the MVP; scroll-based display of all notifications is acceptable
- The type icon mapping (notification type → icon) follows a standard set: approval=checkmark, rejection=cross, assessment=quiz, certification=badge, stale=clock, peer=people, gap=trending-up; exact icons are defined during planning using the available component library (Angular Material or PrimeNG)
- Notifications are not role-gated beyond userId filtering — any authenticated user navigating to /notifications sees their own list regardless of role
