# Feature Specification: Certifications Module

**Feature Branch**: `005-certifications-module`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Certifications Module for Skill Matrix Application — upload certifications, certification list with status badges, file validation, certification expiry tracking, rating bonus contribution"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Certifications List (Priority: P1)

An employee navigates to the Certifications List screen to view all certifications they have uploaded. Each certification displays its name, associated skill, issuing organization, issue date, expiry date, and a color-coded status badge indicating whether it is Valid (green), Expiring Soon (amber), or Expired (red).

**Why this priority**: The certifications list is the primary entry point for the module. Users must be able to see their certifications and their current validity status before any other functionality is useful.

**Independent Test**: Can be fully tested by navigating to /certifications and verifying that all certifications from mock data render with correct columns and appropriate status badges based on date calculations.

**Acceptance Scenarios**:

1. **Given** a logged-in user with any role, **When** they navigate to /certifications, **Then** a table/card view displays all certifications belonging to that user.
2. **Given** a certification with an expiry date more than 30 days in the future, **When** the certifications list renders, **Then** a green "Valid" badge is displayed for that certification.
3. **Given** a certification with an expiry date within 30 days from today, **When** the certifications list renders, **Then** an amber "Expiring Soon" badge is displayed for that certification.
4. **Given** a certification with an expiry date in the past, **When** the certifications list renders, **Then** a red "Expired" badge is displayed for that certification.
5. **Given** the certifications list is displayed, **When** the user views the table columns, **Then** the columns shown are: Certification Name, Skill, Issuing Organization, Issue Date, Expiry Date, Status.

---

### User Story 2 - Upload a New Certification (Priority: P1)

An employee navigates to the Upload Certification screen and fills out a form with the certification name, associated skill (from a dropdown of skills in their profile), issuing organization, issue date, expiry date, and a file upload. On successful submission, the certification is saved to in-memory state and appears in the certifications list.

**Why this priority**: Uploading certifications is the core write operation of this module. Without it, the certifications list would only display pre-populated mock data and users could not add new certifications.

**Independent Test**: Can be fully tested by navigating to /certifications/upload, filling in all required fields with valid data, attaching a valid file, submitting, and confirming the new certification appears in the list.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the upload certification screen, **When** they view the form, **Then** the fields displayed are: Certification Name, Skill (dropdown), Issuing Organization, Issue Date, Expiry Date, and File Upload.
2. **Given** the Skill dropdown, **When** it renders, **Then** it is populated with only the skills currently in the logged-in user's profile.
3. **Given** all required fields are filled with valid data and a valid file is attached, **When** the user submits the form, **Then** the certification is saved to in-memory state and the user is navigated to the certifications list where the new entry is visible.
4. **Given** a successful upload, **When** the certifications list reloads, **Then** a success toast notification is displayed confirming the upload.

---

### User Story 3 - Form Validation on Certification Upload (Priority: P1)

The upload certification form enforces real-time inline validation for all fields. Required fields display "This field is required." when left empty. The file upload validates format (PDF, JPG, PNG only) and size (max 5 MB). The expiry date must be after the issue date.

**Why this priority**: Validation prevents invalid data entry and provides immediate user feedback, which is essential for a functional upload experience.

**Independent Test**: Can be tested by attempting to submit the form with various invalid inputs (empty fields, wrong file type, oversized file, bad date order) and verifying each validation message appears inline.

**Acceptance Scenarios**:

1. **Given** the user leaves any required field empty, **When** they attempt to submit or blur the field, **Then** the field is highlighted with the message "This field is required."
2. **Given** the user selects a file that is not PDF, JPG, or PNG, **When** the file is attached, **Then** the error message "Only PDF, JPG, and PNG files are accepted." is displayed.
3. **Given** the user selects a file larger than 5 MB, **When** the file is attached, **Then** the error message "File size must not exceed 5 MB." is displayed.
4. **Given** the user enters an expiry date that is before or equal to the issue date, **When** the field is validated, **Then** the error message "Expiry date must be after issue date." is displayed.
5. **Given** any validation error exists on the form, **When** the user attempts to submit, **Then** the form does not submit and all errors are displayed inline next to their respective fields.

---

### User Story 4 - Certification Rating Bonus (Priority: P2)

When an employee holds a valid (non-expired) certification for a skill, the system applies a +10% rating bonus to that skill's score (capped at 100%). The certification also contributes to the System Rating formula at a 0.20 weight via the Certification Bonus component.

**Why this priority**: The rating bonus is the key incentive mechanism that ties certifications to the skill rating framework. It must be accurately calculated but depends on the upload and list features being in place first.

**Independent Test**: Can be tested by verifying that a skill with a valid certification shows the +10% bonus applied to its displayed rating, and that the System Rating formula reflects 100% for the Certification Bonus weight (0.20).

**Acceptance Scenarios**:

1. **Given** an employee has a valid certification for a skill with a test score of 75%, **When** the skill rating is calculated, **Then** the rating reflects 75% + 10% = 85%.
2. **Given** an employee has a valid certification for a skill with a test score of 95%, **When** the rating bonus is applied, **Then** the final result is capped at 100% (not 105%).
3. **Given** an employee has a valid certification for a skill, **When** the System Rating formula is computed, **Then** the Certification Bonus component uses 100% × 0.20 weight.
4. **Given** an employee does not have any certification for a skill, **When** the System Rating formula is computed, **Then** the Certification Bonus component uses 0% × 0.20 weight.

---

### User Story 5 - Certification Expiry Tracking and Impact (Priority: P2)

The system tracks certification expiry dates. Certifications expiring within 30 days are flagged on the dashboard. Expired certifications no longer contribute to the rating bonus and the certified badge is removed from the skill profile.

**Why this priority**: Expiry tracking ensures data accuracy over time and prevents stale certifications from inflating skill ratings. It's important but secondary to the core upload and list flows.

**Independent Test**: Can be tested by verifying that certifications with different expiry states (valid, expiring soon, expired) display correct status badges, dashboard alerts appear for expiring certifications, and expired certifications do not contribute to rating calculations.

**Acceptance Scenarios**:

1. **Given** a certification with an expiry date within 30 days, **When** the employee views their dashboard, **Then** an alert or flag is shown indicating the certification is expiring soon.
2. **Given** a certification has expired, **When** the skill rating is calculated, **Then** the +10% certification bonus is not applied to that skill.
3. **Given** a certification has expired, **When** the employee views their skill profile, **Then** no "Certified" badge is shown for that skill.
4. **Given** a certification has expired, **When** the System Rating formula is computed for that skill, **Then** the Certification Bonus component uses 0%.

---

### User Story 6 - Certified Badge on Skill Profile (Priority: P2)

When an employee holds a valid certification for a skill, a "Certified" badge is displayed on that skill's entry in the skill profile and skill detail screens.

**Why this priority**: The badge provides visual recognition of certification status and reinforces the value of uploading certifications.

**Independent Test**: Can be tested by verifying that skills with a valid certification show the certified badge in the My Skills list and detail views, and skills without certifications or with expired certifications do not show the badge.

**Acceptance Scenarios**:

1. **Given** an employee has a valid certification for a skill, **When** they view their My Skills list, **Then** a "Certified" badge is displayed next to that skill.
2. **Given** an employee has a valid certification for a skill, **When** they view the Skill Detail screen, **Then** the "Certified" badge is visible.
3. **Given** an employee's certification for a skill has expired, **When** they view their skill profile, **Then** the "Certified" badge is not displayed for that skill.

---

### User Story 7 - Responsive Certification Screens (Priority: P3)

The certifications list and upload form adapt across desktop, tablet, and mobile breakpoints. The upload form follows a two-column layout on desktop and single-column layout on mobile with a sticky submit button.

**Why this priority**: Responsive design ensures usability across devices but is a refinement after core functionality works.

**Independent Test**: Can be tested by resizing the browser to desktop (1280px+), tablet (768px), and mobile (< 480px) breakpoints and verifying layouts adapt correctly.

**Acceptance Scenarios**:

1. **Given** the user is on a desktop viewport, **When** viewing the upload form, **Then** the form displays in a two-column layout.
2. **Given** the user is on a mobile viewport, **When** viewing the upload form, **Then** the form displays in a single-column full-width layout with a sticky submit button at the bottom.
3. **Given** the user is on a desktop viewport, **When** viewing the certifications list, **Then** a full table with all columns is displayed.
4. **Given** the user is on a mobile viewport, **When** viewing the certifications list, **Then** certifications are displayed as cards with key information visible.

---

### Edge Cases

- What happens when a user has no skills in their profile and tries to upload a certification? → The Skill dropdown is empty and the form cannot be submitted; a message "Add skills to your profile before uploading certifications." is shown.
- What happens when a user uploads a certification for the same skill twice? → Both certifications are stored; the system uses the one with the latest expiry date for rating bonus calculation.
- What happens when a certification's expiry date is exactly today? → It is treated as "Expiring Soon" (within 30 days) if today is within 30 days, or as "Expired" if it has passed the end of the day. Since dates are date-only (no time component), a certification expiring today is considered "Expiring Soon."
- What happens when the user selects a valid file and then changes it to an invalid file? → The validation re-runs on the new file and the appropriate error message is shown.
- What happens when a certification has no expiry date? → All certifications must have an expiry date; it is a required field and cannot be left empty.
- What happens when the file upload input is cleared after attaching a file? → The field is treated as empty and "This field is required." is shown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a certifications list showing all certifications for the logged-in user with columns: Certification Name, Skill, Issuing Organization, Issue Date, Expiry Date, and Status.
- **FR-002**: System MUST compute and display a status badge for each certification: "Valid" (green) when expiry date is more than 30 days away, "Expiring Soon" (amber) when expiry date is within 30 days, and "Expired" (red) when expiry date has passed.
- **FR-003**: System MUST allow all authenticated roles (Employee, Manager, Admin) to access the certifications list at /certifications.
- **FR-004**: System MUST allow all authenticated roles to access the upload certification form at /certifications/upload.
- **FR-005**: System MUST display an upload form with the fields: Certification Name, Skill (dropdown populated from the user's current skills), Issuing Organization, Issue Date, Expiry Date, and File Upload.
- **FR-006**: System MUST restrict file uploads to PDF, JPG, and PNG formats only and display the error "Only PDF, JPG, and PNG files are accepted." for invalid formats.
- **FR-007**: System MUST reject files exceeding 5 MB in size and display the error "File size must not exceed 5 MB."
- **FR-008**: System MUST validate that all form fields are filled before submission and display "This field is required." on any empty required field.
- **FR-009**: System MUST validate that the expiry date is after the issue date and display "Expiry date must be after issue date." when violated.
- **FR-010**: System MUST perform file validation (format and size) on the client side without uploading to a server.
- **FR-011**: System MUST store the uploaded certification reference (file metadata stored, not the actual file) in in-memory state upon successful form submission.
- **FR-012**: System MUST apply a +10% rating bonus to a skill's score when the employee holds a valid (non-expired) certification for that skill, capped at 100%.
- **FR-013**: System MUST reflect the certification status in the System Rating formula, contributing Certification Bonus at a 0.20 weight (100% if valid certification exists, 0% otherwise).
- **FR-014**: System MUST display a "Certified" badge on the skill profile and skill detail screens for skills with a valid certification.
- **FR-015**: System MUST remove the "Certified" badge and cease applying the rating bonus when a certification has expired.
- **FR-016**: System MUST flag certifications expiring within 30 days on the employee dashboard with an appropriate alert or notification.
- **FR-017**: System MUST display the upload form in a two-column layout on desktop and a single-column layout with a sticky submit button on mobile, following responsive design guidelines.
- **FR-018**: System MUST perform real-time inline validation — errors appear as the user interacts with fields, not only on form submission.
- **FR-019**: System MUST display a success toast notification upon successful certification upload.
- **FR-020**: System MUST show a message "Add skills to your profile before uploading certifications." when the user has no skills in their profile and attempts to upload a certification.

### Key Entities

- **Certification**: Represents a credential uploaded by an employee for a specific skill. Contains a certification identifier, employee reference, skill reference, certification name, issuing organization, issue date, expiry date, and a file path reference (simulated upload).
- **Certification Status**: A computed state derived from the certification's expiry date relative to the current date. Possible values: Valid (expiry > 30 days away), Expiring Soon (expiry ≤ 30 days away), Expired (expiry date has passed).
- **Rating Bonus**: A +10% additive bonus applied to a skill's score when a valid certification exists for that skill. Capped at 100%.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all their certifications with correct status badges within 3 seconds of navigating to the certifications list.
- **SC-002**: Users can complete the certification upload process (fill form, attach file, submit) in under 2 minutes.
- **SC-003**: 100% of file validation rules are enforced correctly — invalid formats, oversized files, and date conflicts are caught before submission.
- **SC-004**: Certification status badges update accurately based on the current date — valid, expiring soon, and expired states match the 30-day threshold rule with zero misclassifications.
- **SC-005**: The +10% rating bonus is correctly applied only for skills with valid certifications and correctly removed when certifications expire.
- **SC-006**: The "Certified" badge appears on skill profiles exclusively for skills with non-expired certifications.
- **SC-007**: Certifications expiring within 30 days are flagged in the dashboard with visible alerts.
- **SC-008**: The upload form responds correctly across desktop (two-column) and mobile (single-column with sticky submit) breakpoints.

## Assumptions

- File uploads are simulated — the application stores a file path reference in memory but does not actually upload the file to any server or persist it to disk.
- The Skill dropdown on the upload form is populated from the logged-in user's current skill profile (employee-skills.json). If the user has no skills, the dropdown is empty and the form cannot be submitted.
- Certification data is pre-populated in certifications.json for demo purposes. New certifications added during a session are stored in NgRx state and reset on page refresh (consistent with the mock-first architecture).
- The 30-day "Expiring Soon" threshold is calculated from the current date at the time of rendering; it is not a stored field.
- When multiple certifications exist for the same skill, the one with the latest expiry date determines whether the rating bonus and certified badge are active.
- The +10% rating bonus is additive to the test score percentage (e.g., 75% + 10% = 85%), not multiplicative. The result is capped at 100%.
- The Certification Bonus in the System Rating formula is binary: 100% (if valid cert exists) or 0% (if no valid cert), weighted at 0.20.
- All date fields use date-only values (no time component). Expiry comparison is inclusive of the expiry date (a certification expiring today is considered "Expiring Soon," not "Expired").
