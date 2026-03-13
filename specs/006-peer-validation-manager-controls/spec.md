# Feature Specification: Peer Validation and Manager/Admin Controls

**Feature Branch**: `006-peer-validation-manager-controls`  
**Created**: 2026-03-13  
**Status**: Draft  
**Input**: User description: "Peer Validation and Manager/Admin Controls for Skill Matrix Application — peer validation workflow, manager approve/reject skills, validation queue, team skills overview, admin override, final rating calculation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manager Views Team Skills Overview (Priority: P1)

A manager navigates to the Team Skills Overview screen to see a summary table of all employees in their team. The table displays each employee's name, department, skills count, average rating, profile completion percentage, and action buttons. The manager can click "View Profile" to see an employee's full skill profile or "Send Validation Request" to prompt an employee to submit skills for validation.

**Why this priority**: The team skills overview is the primary entry point for managers to monitor and manage their team's skill landscape. Without this screen, managers cannot access any team management functionality.

**Independent Test**: Can be fully tested by logging in as a Manager, navigating to /team/skills, verifying the table renders with correct columns and only shows employees from the manager's own team, and clicking "View Profile" to confirm navigation to the employee's profile.

**Acceptance Scenarios**:

1. **Given** a logged-in Manager, **When** they navigate to /team/skills, **Then** a table is displayed showing only employees in their own team with columns: Employee Name, Department, Skills Count, Avg Rating, Profile Completion %, Actions.
2. **Given** a logged-in Admin, **When** they navigate to /team/skills, **Then** the table displays all employees across all departments.
3. **Given** the Team Skills Overview is displayed, **When** the Manager clicks "View Profile" on an employee row, **Then** they are navigated to /team/skills/:employeeId showing that employee's full skill profile.
4. **Given** the Team Skills Overview is displayed, **When** the Manager or Admin clicks "Send Validation Request" for an employee, **Then** a validation request is initiated for that employee.
5. **Given** a logged-in Employee, **When** they attempt to access /team/skills directly via URL, **Then** they are redirected to /unauthorized.

---

### User Story 2 - Manager Reviews and Approves a Skill from Validation Queue (Priority: P1)

A manager navigates to the Skill Validation Queue to see a list of pending skill submissions from team members. The manager selects a submission to open its detail view, reviews the employee's self-rating, any uploaded certification, and project experience evidence. The manager then sets a Manager Rating (1–4), adds a comment, and approves the skill. Upon approval, the final rating is automatically calculated and the employee's skill record is updated.

**Why this priority**: Skill approval is the core manager workflow that directly impacts employee ratings and is required for the final rating formula to function with manager input.

**Independent Test**: Can be tested by logging in as a Manager, navigating to /team/validation, selecting a pending submission, setting a Manager Rating, approving it, and verifying the skill status changes to "Approved" and the final rating is recalculated.

**Acceptance Scenarios**:

1. **Given** a logged-in Manager, **When** they navigate to /team/validation, **Then** a list of pending skill submissions from their own team is displayed.
2. **Given** the validation queue, **When** the Manager clicks on a submission, **Then** they are navigated to /team/validation/:submissionId showing the validation detail.
3. **Given** the validation detail view, **When** the Manager sets a Manager Rating (1–4) and clicks "Approve", **Then** the skill status is updated to "Approved", a final rating is calculated using the formula, and employee-skills.json is updated in-memory.
4. **Given** the validation detail view, **When** the Manager approves a skill, **Then** a notification is sent to the employee indicating their skill has been approved.
5. **Given** the validation queue, **When** the Manager sorts by employee name, skill name, or submit date, **Then** the list is reordered accordingly.

---

### User Story 3 - Manager Rejects a Skill Submission (Priority: P1)

A manager reviews a skill submission and determines it does not meet the required standard. The manager clicks "Reject" and is required to provide a mandatory rejection reason before the rejection is processed. The employee receives a notification with the rejection reason.

**Why this priority**: Rejection is an equally critical path as approval — without it, managers cannot provide negative feedback or quality control on skill claims.

**Independent Test**: Can be tested by opening a validation detail, clicking "Reject", verifying the rejection reason field is mandatory, submitting the rejection, and confirming the employee receives a notification with the reason.

**Acceptance Scenarios**:

1. **Given** the validation detail view, **When** the Manager clicks "Reject" without entering a reason, **Then** a validation error is shown: "Rejection reason is required."
2. **Given** the validation detail view, **When** the Manager enters a rejection reason and clicks "Reject", **Then** the skill status is updated to "Rejected" and a notification is sent to the employee: "Your [Skill Name] was rejected. Reason: [reason]."
3. **Given** a rejected skill, **When** the employee views their skill profile, **Then** the skill shows a "Rejected" status with the rejection reason visible.

---

### User Story 4 - Employee Submits a Skill for Peer Validation (Priority: P2)

An employee who wants their skill validated by peers selects 2–3 peers from their team. The selected peers must also have the same skill in their own profile. Once the employee submits the validation request, each selected peer receives an in-app notification requesting them to validate the skill.

**Why this priority**: Peer validation is a key input to the final rating formula (0.15 weight) and enables a collaborative validation model, but manager approval can function independently without it.

**Independent Test**: Can be tested by logging in as an Employee, initiating peer validation for a skill, selecting eligible peers, submitting the request, and verifying that each selected peer receives a notification.

**Acceptance Scenarios**:

1. **Given** an employee initiates peer validation for a skill, **When** the peer selection list loads, **Then** only teammates who also have that skill in their own profile are shown as selectable peers.
2. **Given** the peer selection screen, **When** the employee selects fewer than 2 peers, **Then** the submit button is disabled with a message: "Select at least 2 peers."
3. **Given** the peer selection screen, **When** the employee selects more than 3 peers, **Then** additional selections are prevented with a message: "Maximum 3 peers allowed."
4. **Given** the employee submits a peer validation request with 2–3 valid peers, **When** the request is submitted, **Then** each selected peer receives a notification: "[Employee Name] requested you to validate their [Skill Name] skill."

---

### User Story 5 - Peer Submits a Validation Rating (Priority: P2)

A peer who has received a validation request opens the peer validation form. The form displays the skill being validated and allows the peer to submit a proficiency rating (1–4 scale) with an optional comment. Upon submission, the requesting employee is notified that the peer has completed their validation.

**Why this priority**: Without peer responses, the peer rating component of the final formula cannot be populated. This story delivers the peer input mechanism.

**Independent Test**: Can be tested by logging in as a peer who received a validation request, opening the validation form, submitting a rating and comment, and verifying the employee receives a completion notification.

**Acceptance Scenarios**:

1. **Given** a peer has received a validation request notification, **When** they open the peer validation form, **Then** the form displays the skill name being validated, a proficiency rating selector (1–4), an optional comment field, and a Submit button.
2. **Given** the peer validation form, **When** the peer selects a rating and clicks Submit, **Then** the peer rating is recorded and the employee receives a notification: "[Peer Name] has validated your [Skill Name] skill."
3. **Given** the peer validation form, **When** the peer attempts to submit without selecting a rating, **Then** a validation error is shown: "Proficiency rating is required."
4. **Given** a peer who does not have the requested skill in their profile, **When** they try to access the validation form, **Then** they see a message: "You cannot validate this skill as it is not in your profile."

---

### User Story 6 - Peer Rating Aggregation and Weight Redistribution (Priority: P2)

When at least 2 peers have submitted their validation ratings, the peer rating is calculated as the average of all peer responses and included in the final rating formula with a weight of 0.15. If fewer than 2 peers respond within 7 days, the peer weight is redistributed proportionally among the remaining rating sources.

**Why this priority**: This story implements the business rule around peer rating inclusion and weight redistribution, which is essential for accurate final rating calculation.

**Independent Test**: Can be tested by simulating scenarios with 2+ peer responses (verifying peer average is included) and fewer than 2 responses after 7 days (verifying weight redistribution occurs).

**Acceptance Scenarios**:

1. **Given** 2 or more peers have submitted ratings for a skill, **When** the final rating is calculated, **Then** the peer rating is the average of all peer responses and carries a weight of 0.15.
2. **Given** fewer than 2 peers have responded within 7 days, **When** the final rating is calculated, **Then** the peer weight (0.15) is redistributed proportionally to Self Rating, Manager Rating, and System Rating.
3. **Given** 3 peers submitted ratings of 2, 3, and 4, **When** the peer rating is calculated, **Then** the peer rating equals 3.0 (the average).

---

### User Story 7 - Admin Overrides a Skill Rating (Priority: P2)

An admin accesses the Skill Validation Queue where all employees across the organization are visible. The admin can view any submission's detail and use the "Override Rating" button to set a custom rating with a documented justification. The override replaces the existing final rating.

**Why this priority**: Admin override provides an organizational safety net for correcting inaccurate ratings, but standard manager approval/rejection handles the majority of cases.

**Independent Test**: Can be tested by logging in as an Admin, navigating to a validation detail, clicking "Override Rating", entering a new rating and justification, and verifying the skill's final rating is updated.

**Acceptance Scenarios**:

1. **Given** a logged-in Admin on the Skill Validation Queue, **When** the queue loads, **Then** submissions from all employees across all departments are visible.
2. **Given** the validation detail view as an Admin, **When** the Admin clicks "Override Rating", **Then** a form appears to enter a custom rating (1–4) and a mandatory justification.
3. **Given** the Admin submits an override without a justification, **When** they click "Submit Override", **Then** a validation error is shown: "Override justification is required."
4. **Given** the Admin submits an override with a rating and justification, **When** the override is saved, **Then** the skill's rating is updated to the overridden value with the justification logged.
5. **Given** a logged-in Manager on the Skill Validation Queue, **When** the queue renders, **Then** the "Override Rating" button is not present in the DOM.

---

### User Story 8 - View Employee Skill Profile from Team View (Priority: P3)

A manager or admin navigates to an employee's full skill profile from the Team Skills Overview screen. The profile shows all of the employee's skills with their ratings, proficiency levels, statuses, certifications, and the rating confidence indicator.

**Why this priority**: While team overview provides a summary, drilling into individual profiles is needed for detailed skill review but is not part of the critical approval workflow.

**Independent Test**: Can be tested by clicking "View Profile" from /team/skills and verifying the employee profile at /team/skills/:employeeId displays all skill details including ratings, levels, and confidence indicators.

**Acceptance Scenarios**:

1. **Given** a Manager or Admin on /team/skills, **When** they click "View Profile" for an employee, **Then** they are navigated to /team/skills/:employeeId.
2. **Given** the employee skill profile view, **When** the page loads, **Then** it displays all skills with: Skill Name, Self Rating, Manager Rating, Peer Rating, System Rating, Final Rating, Proficiency Level badge, and Status.
3. **Given** a skill with 3+ rating sources available, **When** the confidence indicator renders, **Then** it shows 🟢 High Confidence.
4. **Given** a skill with exactly 2 rating sources, **When** the confidence indicator renders, **Then** it shows 🟡 Medium Confidence.
5. **Given** a skill with only 1 rating source, **When** the confidence indicator renders, **Then** it shows 🔴 Low Confidence.

---

### User Story 9 - Final Rating Calculation on Approval (Priority: P1)

When a manager approves a skill, the system automatically calculates the final rating using the weighted formula: Final Rating = (Self Rating × 0.20) + (Manager Rating × 0.30) + (Peer Rating × 0.15) + (System Rating × 0.35). If any rating source is missing, its weight is redistributed proportionally among the available sources.

**Why this priority**: The final rating calculation is a core business rule that must execute correctly every time a skill is approved. It is fundamental to the integrity of the skill rating system.

**Independent Test**: Can be tested by approving skills with different combinations of available rating sources and verifying the final rating matches the expected weighted calculation with proper redistribution.

**Acceptance Scenarios**:

1. **Given** all four rating sources are available (Self=3, Manager=4, Peer=3, System=3.5), **When** the final rating is calculated, **Then** Final Rating = (3×0.20) + (4×0.30) + (3×0.15) + (3.5×0.35) = 0.60 + 1.20 + 0.45 + 1.225 = 3.475.
2. **Given** Peer Rating is missing, **When** the final rating is calculated, **Then** the peer weight (0.15) is redistributed proportionally: Self = 0.20/(0.20+0.30+0.35) ≈ 0.235, Manager = 0.30/(0.85) ≈ 0.353, System = 0.35/(0.85) ≈ 0.412.
3. **Given** only Self Rating and Manager Rating are available, **When** the final rating is calculated, **Then** weights are redistributed: Self = 0.20/(0.20+0.30) = 0.40, Manager = 0.30/(0.50) = 0.60.
4. **Given** only Self Rating is available, **When** the final rating is calculated, **Then** the final rating equals the self rating with weight 1.0.

---

### Edge Cases

- What happens when a manager tries to approve a skill from an employee not on their team? → The "Approve" and "Reject" buttons are not rendered for employees outside the manager's team.
- What happens when an employee selects a peer who subsequently removes the skill from their profile before validation? → The peer is removed from the eligible validators list and the employee is notified to select a replacement if the minimum threshold of 2 peers is not met.
- What happens when all peers decline or fail to respond within 7 days? → Peer weight (0.15) is redistributed proportionally to the other available rating sources.
- What happens when a manager and admin both attempt to review the same submission simultaneously? → The first action processed takes effect; the second reviewer sees the updated status upon refresh.
- What happens when an admin overrides a rating that was already approved by a manager? → The admin override takes precedence; the previous manager rating is preserved in history but the final rating reflects the admin's override.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a Team Skills Overview table at /team/skills accessible only to Manager and Admin roles, guarded by RoleGuard.
- **FR-002**: Managers MUST see only employees from their own team in the Team Skills Overview; Admins MUST see all employees across all departments.
- **FR-003**: The Team Skills Overview MUST show columns: Employee Name, Department, Skills Count, Avg Rating, Profile Completion %, and Actions (View Profile, Send Validation Request).
- **FR-004**: The system MUST provide a Skill Validation Queue at /team/validation displaying pending skill submissions awaiting approval.
- **FR-005**: The Skill Validation Queue MUST be sortable by employee name, skill name, and submit date.
- **FR-006**: Managers MUST see "Approve" and "Reject" buttons for their own team's submissions only; Admins MUST see these buttons for all employee submissions.
- **FR-007**: The "Override Rating" button MUST be visible only to Admins and MUST NOT exist in the DOM for Manager or Employee roles.
- **FR-008**: The Validation Detail screen at /team/validation/:submissionId MUST display: Employee name, Skill name, Self Rating, uploaded certification (if any), and project experience evidence (if any).
- **FR-009**: Managers and Admins MUST be able to set a Manager Rating (1–4 scale) when reviewing a submission.
- **FR-010**: Approving a skill MUST trigger the final rating calculation using the weighted formula and update the skill status to "Approved" in employee-skills.json in-memory.
- **FR-011**: Rejecting a skill MUST require a mandatory rejection reason before processing.
- **FR-012**: Upon rejection, the system MUST send a notification to the employee with the message: "Your [Skill Name] was rejected. Reason: [reason]."
- **FR-013**: Admins MUST be able to override any skill rating with a documented justification via the "Override Rating" control.
- **FR-014**: Override justification MUST be mandatory — the system MUST prevent submission without it.
- **FR-015**: When an employee submits a skill for peer validation, the system MUST allow selection of 2–3 peers from their team who also possess the same skill.
- **FR-016**: Selected peers MUST receive an in-app notification requesting validation.
- **FR-017**: Each peer MUST submit a proficiency rating (1–4) via a structured form; an optional comment field MUST also be provided.
- **FR-018**: The peer rating MUST only be included in the final rating formula when at least 2 peer responses have been received.
- **FR-019**: If fewer than 2 peers respond within 7 days, the peer weight (0.15) MUST be redistributed proportionally among the remaining rating sources.
- **FR-020**: Peers MUST only be able to validate skills that they also have in their own profile.
- **FR-021**: The Final Rating MUST be calculated as: (Self Rating × 0.20) + (Manager Rating × 0.30) + (Peer Rating × 0.15) + (System Rating × 0.35), with proportional weight redistribution when sources are missing.
- **FR-022**: The Rating Confidence Indicator MUST display: 🟢 High Confidence for 3+ sources, 🟡 Medium Confidence for 2 sources, 🔴 Low Confidence for 1 source.
- **FR-023**: The Employee Skill Profile view at /team/skills/:employeeId MUST display all skills with their individual ratings, proficiency levels, statuses, and confidence indicators.
- **FR-024**: Upon approval, the system MUST send a notification to the employee: "Your [Skill Name] has been approved by [Manager Name]."
- **FR-025**: All /team/** routes MUST be protected by AuthGuard + RoleGuard(['Manager', 'Admin']).
- **FR-026**: Unauthorized UI controls MUST be removed from the DOM entirely — not hidden with CSS.

### Key Entities

- **Skill Submission**: Represents an employee's skill submitted for validation. Contains the employee reference, skill reference, self-rating, current status (Pending, Approved, Rejected), submission date, and associated evidence (certifications, project experience).
- **Peer Validation Request**: Links a skill submission to selected peer validators. Tracks each peer's response status, rating, comment, and response date. Requires 2–3 peers per request.
- **Manager Assessment**: The manager's evaluation of a skill submission. Contains the manager rating (1–4), optional comment, assessment date, and the assessing manager's identity.
- **Admin Override**: An admin-initiated rating override. Contains the overridden rating value, mandatory justification, override date, and the admin's identity.
- **Final Rating**: The computed weighted rating combining Self Rating, Manager Rating, Peer Rating, and System Rating with proportional weight redistribution for missing sources.
- **Rating Confidence**: A derived indicator (High/Medium/Low) based on the number of available rating sources for a skill.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Managers can review and approve or reject a pending skill submission within 3 clicks from the validation queue.
- **SC-002**: 100% of approved skills have a correctly computed final rating using the weighted formula with proper weight redistribution for missing sources.
- **SC-003**: Peer validation requests can be initiated and completed by all involved parties (requester + 2–3 peers) in under 5 minutes of active interaction.
- **SC-004**: The team skills overview loads and displays all relevant team members with accurate summary data (skills count, avg rating, profile completion) on first navigation.
- **SC-005**: Admin override actions are always accompanied by a documented justification, with 0% of overrides processed without one.
- **SC-006**: The rating confidence indicator accurately reflects the number of available rating sources for every displayed skill — no mismatched indicators.
- **SC-007**: Role-based visibility rules are enforced with 100% accuracy: Manager sees only own team data, Admin sees all data, "Override Rating" is absent for non-Admin roles.
- **SC-008**: All rejection and approval notifications are delivered to the correct employee immediately upon the manager's action.

## Assumptions

- The logged-in user's team membership is determined by the `department` field in users.json — a manager sees employees sharing the same department.
- Peer validation requests and responses are managed in-memory during the session and reference data from employee-skills.json and users.json.
- The 7-day peer response deadline is simulated using date comparisons against mock data timestamps; no real-time countdown is implemented.
- Manager comments on approvals/rejections are optional fields in the mock data (the requirement states "mandatory: add optional comment" — interpreted as the comment field is always presented but input is optional for approvals and mandatory for rejections).
- "Send Validation Request" from the Team Skills Overview triggers a workflow where the employee is prompted to submit skills, rather than the manager directly initiating peer selection.
- Admin override fully replaces the computed final rating; the original computed value is retained in history for audit purposes.
- All CRUD operations update in-memory data only; data resets on page refresh per the mock-first architecture principle.
