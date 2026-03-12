# Feature Specification: Employee Skill Profile and Dashboard

**Feature Branch**: `003-employee-skill-profile-dashboard`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Employee Skill Profile and Dashboard for Skill Matrix Application"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - My Skills List View (Priority: P1)

As an employee, I want to see all my skills in a tabular view so that I can quickly understand my current skill profile at a glance.

**Why this priority**: The skills list is the foundational screen for the entire skill profile feature. Every subsequent action (add, edit, delete, view detail) launches from this screen.

**Independent Test**: Can be fully tested by logging in as an employee, navigating to /my-skills, and verifying the table displays all skills with correct columns and data. Delivers immediate visibility into the employee's skill portfolio.

**Acceptance Scenarios**:

1. **Given** an authenticated employee with skills in their profile, **When** they navigate to /my-skills, **Then** a table displays showing Skill name, Category, Level Badge, Rating %, Status, Last Updated, and Actions columns.
2. **Given** an authenticated employee, **When** viewing the skills table on desktop, **Then** all columns are visible in a full table layout.
3. **Given** an authenticated employee, **When** viewing the skills table on tablet, **Then** Category and Last Updated columns are hidden, with data accessible on row expand.
4. **Given** an authenticated employee, **When** viewing the skills table on mobile, **Then** each row renders as a card showing Skill Name (bold), Level Badge pill, Rating %, Status pill, and a three-dot menu icon.
5. **Given** an authenticated employee or manager, **When** viewing /my-skills, **Then** only their own skills are visible.
6. **Given** an authenticated admin, **When** viewing /my-skills, **Then** all employees' skills are visible with edit and delete access to any skill, and an "Override Rating" button is visible per row.
7. **Given** an employee with a stale skill (not updated for 6+ months), **When** viewing the skills list, **Then** that skill row displays an amber warning badge and amber border.

---

### User Story 2 - Add Skill to Profile (Priority: P1)

As an employee, I want to add a new skill from the global skill library to my profile so that I can begin tracking my proficiency.

**Why this priority**: Adding skills is the primary data-entry action. Without it, employees cannot build their skill profiles.

**Independent Test**: Can be fully tested by navigating to /my-skills/add, selecting a category → subcategory → skill via cascading dropdowns, choosing a self-rating, and verifying the skill appears in the skills list.

**Acceptance Scenarios**:

1. **Given** an authenticated employee on /my-skills/add, **When** they select a category, **Then** the subcategory dropdown populates with subcategories belonging to that category.
2. **Given** a selected subcategory, **When** the employee selects a subcategory, **Then** the skill dropdown populates with skills under that subcategory.
3. **Given** a valid skill selected, **When** the employee sets a self-rating (Beginner/Intermediate/Advanced/Expert mapped to 1–4) and clicks Save, **Then** the skill is added to the in-memory employee skills data with status "Draft", the chosen selfRating, and lastUpdated set to now.
4. **Given** a skill that already exists in the employee's profile, **When** the employee attempts to add it again, **Then** the system shows the error "This skill is already in your profile."
5. **Given** the add skill form, **When** required fields are left empty, **Then** inline validation messages appear: "This field is required."

---

### User Story 3 - Skill Detail View (Priority: P1)

As an employee, I want to view detailed information about a specific skill including all rating sources, proficiency level, certification status, and progress over time.

**Why this priority**: The detail view provides the comprehensive single-skill view and is the destination for "View Detail" actions. It brings together ratings, confidence, progress charts, and certifications in one place.

**Independent Test**: Can be fully tested by clicking "View Detail" on a skill row and verifying all rating sources, confidence indicator, proficiency badge, progress chart, and certification badge render correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated employee clicking "View Detail" on a skill, **When** the skill detail screen loads at /my-skills/:skillId, **Then** it displays Self Rating, Manager Rating, Peer Rating, System Rating, and Final Rating.
2. **Given** a skill with 3 or more rating sources available, **When** viewing skill detail, **Then** a 🟢 High Confidence indicator is shown.
3. **Given** a skill with exactly 2 rating sources, **When** viewing skill detail, **Then** a 🟡 Medium Confidence indicator is shown.
4. **Given** a skill with only 1 rating source, **When** viewing skill detail, **Then** a 🔴 Low Confidence indicator is shown.
5. **Given** a skill with a valid certification on file, **When** viewing skill detail, **Then** a "Certified" badge is displayed.
6. **Given** a skill with historical score data, **When** viewing skill detail, **Then** a line chart shows the score trend over time (e.g., Jan→60%, Apr→72%, Jul→85%).
7. **Given** a skill with score history, **When** viewing skill detail, **Then** the best score and latest score are shown side by side for comparison.
8. **Given** a skill, **When** viewing skill detail, **Then** the current proficiency level badge (Beginner/Intermediate/Advanced/Expert) and rating percentage are displayed.
9. **Given** a skill, **When** viewing skill detail, **Then** the current status of the skill (Draft, Pending, Approved, Stale) is displayed.

---

### User Story 4 - Role-Specific Dashboard (Priority: P1)

As a user (employee, manager, or admin), I want to see a dashboard customized to my role so that I can immediately access the most relevant information and actions.

**Why this priority**: The dashboard is the landing page after login and the primary navigation hub. Role-specific rendering ensures every user sees actionable, relevant information.

**Independent Test**: Can be fully tested by logging in with each role and verifying the correct set of dashboard widgets renders.

**Acceptance Scenarios**:

1. **Given** a logged-in employee, **When** they view /dashboard, **Then** the Employee Dashboard renders showing: skills list with rating + level + badge, profile completion percentage, skill gap cards with "Start Assessment" CTA, certification badges and expiry alerts, skill progress chart, recent activity feed (last 5 actions), and achievement badges earned.
2. **Given** a logged-in manager, **When** they view /dashboard, **Then** the Manager Dashboard renders showing: pending skill approvals count, team skill strength summary chart, employees with incomplete profiles, stale skills needing team attention, project skill match recommendations, team availability overview, and recent team activity feed.
3. **Given** a logged-in admin, **When** they view /dashboard, **Then** the Admin Dashboard renders showing: organization-wide skill health score, total skills tracked across all employees, skill gap summary by department, org skill heatmap (top-level view), certification compliance rate, most common skill gaps, and user count by role.
4. **Given** any role viewing dashboard on desktop, **When** the dashboard loads, **Then** stat cards display 4 per row.
5. **Given** any role viewing dashboard on tablet, **When** the dashboard loads, **Then** stat cards display 2 per row.
6. **Given** any role viewing dashboard on mobile, **When** the dashboard loads, **Then** stat cards stack 1 per row vertically.

---

### User Story 5 - Edit Skill Self-Rating (Priority: P2)

As an employee, I want to update my self-rating for an existing skill so that my profile reflects my current skill level.

**Why this priority**: Employees need the ability to maintain their profile as their skills improve. Self-rating updates also clear stale status and keep the profile fresh.

**Independent Test**: Can be fully tested by navigating to /my-skills/:skillId/edit, changing the self-rating, saving, and verifying the updated rating in the skills list and detail views.

**Acceptance Scenarios**:

1. **Given** an authenticated employee on /my-skills/:skillId/edit, **When** they change the self-rating to a new level, **Then** the updated self-rating is persisted in-memory and the lastUpdated timestamp refreshes.
2. **Given** a stale skill, **When** the employee updates the self-rating, **Then** the stale status is cleared and the amber warning badge is removed.

---

### User Story 6 - Delete Skill from Profile (Priority: P2)

As an employee, I want to remove a skill from my active profile while preserving it in history for audit purposes.

**Why this priority**: Employees need housekeeping capability. Soft-delete with history retention ensures audit and progress tracking integrity.

**Independent Test**: Can be fully tested by clicking Delete on a skill row, confirming the skill is hidden from the active list, and verifying it remains in history data.

**Acceptance Scenarios**:

1. **Given** an employee with a skill not linked to any active project, **When** they select Delete from the three-dot actions menu, **Then** the skill is removed from the active profile view but retained in history.
2. **Given** a skill linked to an active project, **When** the employee attempts to delete it, **Then** the system shows the error "This skill is linked to an active project and cannot be deleted."
3. **Given** an admin viewing any employee's skills, **When** they select Delete on any skill, **Then** the same delete rules apply.

---

### User Story 7 - Skill Progress Tracking and Achievements (Priority: P2)

As an employee, I want to track my skill improvement over time and earn achievement badges for milestones.

**Why this priority**: Progress tracking motivates employees to improve. Achievement badges provide gamification and recognition.

**Independent Test**: Can be fully tested by viewing the skill detail screen for a skill with multiple historical test attempts and verifying the progress chart and achievement badges render correctly.

**Acceptance Scenarios**:

1. **Given** a skill with multiple assessment attempts over time, **When** viewing the skill detail, **Then** a line chart shows the score trend with data points per assessment.
2. **Given** a skill where the employee's first assessment was completed, **When** viewing achievements, **Then** a "First Assessment" badge is displayed.
3. **Given** a skill where the employee reached Advanced level (66–85%), **When** viewing achievements, **Then** a "Reached Advanced" badge is displayed.
4. **Given** a skill where the score improved by 20% or more across attempts, **When** viewing achievements, **Then** an "Improved by 20%" badge is displayed.
5. **Given** a skill with score history, **When** viewing skill detail, **Then** the best score and latest score are shown for comparison.

---

### User Story 8 - Skill Expiry and Stale Detection (Priority: P2)

As the system, I want to automatically mark skills as stale when their rating has not been updated for 6 months, so that outdated skills are visually flagged and excluded from project matching.

**Why this priority**: Stale detection ensures the skill data across the organization remains current and reliable for project staffing decisions.

**Independent Test**: Can be fully tested by ensuring a skill with a lastUpdated date older than 6 months appears with an amber warning badge and amber border in the skills list.

**Acceptance Scenarios**:

1. **Given** a skill whose lastUpdated date is more than 6 months ago, **When** the skills list renders, **Then** the skill is flagged as "Stale" with an amber warning badge and amber border.
2. **Given** a stale skill, **When** the employee retakes the assessment or receives a manager review, **Then** the stale status is cleared and the amber indicators are removed.
3. **Given** stale skills exist in an employee's profile, **When** project candidate matching is performed (in other features), **Then** stale skills are excluded from matching results.

---

### User Story 9 - Profile Completion Tracking (Priority: P3)

As an employee, I want to see how complete my skill profile is and identify which skills I have not yet assessed.

**Why this priority**: Profile completion drives engagement and helps employees identify gaps. Lower priority because it depends on skills and assessments being established first.

**Independent Test**: Can be fully tested by calculating (skills assessed / total available skills) × 100 and comparing the displayed percentage. Verify unassessed skills show a "Take Assessment" CTA.

**Acceptance Scenarios**:

1. **Given** an employee with 6 skills assessed out of 10 total available skills, **When** they view the dashboard, **Then** the profile completion percentage shows 60%.
2. **Given** available skills the employee has not attempted, **When** viewing the dashboard, **Then** those skills are highlighted as gap cards with a "Take Assessment" call-to-action.

---

### Edge Cases

- What happens when an employee has no skills in their profile? The skills list shows an empty state with a message and an "Add your first skill" CTA button.
- What happens when the skill library has no categories/subcategories/skills? The add skill form shows a message "No skills available in the library."
- What happens when all rating sources are missing for a skill? The skill detail shows 🔴 Low Confidence with only the self-rating available, and the final rating shows "Not yet calculated."
- What happens when a skill's score history has only one data point? The progress chart shows a single point rather than a line; best and latest scores show the same value.
- What happens when an employee deletes all skills? The profile completion resets to 0% and the dashboard shows the empty state.
- What happens when the logged-in user is a manager or admin viewing the dashboard widgets that reference teams or org-wide data, but no data exists? Widgets display "No data available" with appropriate empty-state messaging.

## Requirements *(mandatory)*

### Functional Requirements

**My Skills List**

- **FR-001**: System MUST display the employee's skills in a table with columns: Skill, Category, Level Badge, Rating %, Status, Last Updated, and Actions.
- **FR-002**: System MUST provide a three-dot actions menu per row with options: View Detail, Edit, and Delete.
- **FR-003**: System MUST display an "Add Skill" button at the top of the skills list.
- **FR-004**: System MUST enforce UI element visibility rules: Employee and Manager see only their own skills; Admin can see, edit, and delete any employee's skill. The "Override Rating" button MUST be visible only for Admin and removed from DOM for other roles.
- **FR-005**: System MUST adapt the skills list layout by device: full table on desktop, reduced columns on tablet (Category and Last Updated hidden), card list on mobile.

**Add Skill**

- **FR-006**: System MUST present cascading dropdowns: Category → Subcategory → Skill, populated from the global skill library data.
- **FR-007**: System MUST allow the employee to set a self-rating using a 1–4 scale mapped to Beginner, Intermediate, Advanced, and Expert.
- **FR-008**: System MUST reject adding a skill that already exists in the employee's profile with the error message "This skill is already in your profile."
- **FR-009**: System MUST save the new skill to in-memory employee skills data with fields: skillId, selfRating, status set to "Draft", and lastUpdated set to the current date.
- **FR-010**: System MUST validate all required fields and display inline error "This field is required." for any empty field on submit.

**Edit Skill**

- **FR-011**: System MUST allow the employee to update the self-rating for an existing skill.
- **FR-012**: System MUST update the lastUpdated timestamp when the self-rating is changed.

**Delete Skill**

- **FR-013**: System MUST allow an employee to remove a skill from their active profile view.
- **FR-014**: System MUST retain deleted skills in history for audit and progress tracking, hidden from the active profile.
- **FR-015**: System MUST prevent deletion of a skill linked to an active project and display the error "This skill is linked to an active project and cannot be deleted."

**Skill Detail**

- **FR-016**: System MUST display all rating sources for the selected skill: Self Rating, Manager Rating, Peer Rating, System Rating, and Final Rating.
- **FR-017**: System MUST display a Rating Confidence Indicator: 🟢 High (3+ sources), 🟡 Medium (2 sources), 🔴 Low (1 source).
- **FR-018**: System MUST display the proficiency level badge (Beginner/Intermediate/Advanced/Expert) alongside the rating percentage.
- **FR-019**: System MUST display a "Certified" badge if the employee holds a valid certification for the skill.
- **FR-020**: System MUST display a line chart showing the skill's score trend over time using historical assessment data.
- **FR-021**: System MUST show the best score and latest score side by side for comparison.
- **FR-022**: System MUST display the current status of the skill (Draft, Pending, Approved, Stale).

**Skill Progress Tracking**

- **FR-023**: System MUST store score history per skill from assessment attempts.
- **FR-024**: System MUST render a line chart visualization showing the score trend over time.
- **FR-025**: System MUST award achievement badges: "First Assessment" (upon first test completion), "Reached Advanced" (when reaching 66–85% or level Advanced), "Improved by 20%" (when score improves by 20+ percentage points across attempts).

**Skill Expiry**

- **FR-026**: System MUST mark a skill as "Stale" with an amber warning badge and amber border if its rating has not been updated for 6 months.
- **FR-027**: System MUST allow stale status to be cleared when the employee retakes the assessment or receives a manager review.
- **FR-028**: Stale skills MUST be excluded from project candidate matching results (enforced in matching features).

**Profile Completion**

- **FR-029**: System MUST calculate profile completion as (skills assessed / total available skills) × 100.
- **FR-030**: System MUST highlight skills not yet attempted with a "Take Assessment" call-to-action.

**Dashboards**

- **FR-031**: The /dashboard route MUST render a role-specific dashboard component: EmployeeDashboardComponent for Employee, ManagerDashboardComponent for Manager, AdminDashboardComponent for Admin.
- **FR-032**: Employee Dashboard MUST display: skills list with rating + level + badge, profile completion percentage, skill gap cards with "Start Assessment" CTA, certification badges and expiry alerts, skill progress chart (line chart per skill), recent activity feed (last 5 actions), and achievement badges earned.
- **FR-033**: Manager Dashboard MUST display: pending skill approvals count, team skill strength summary chart, employees with incomplete profiles, stale skills needing team attention, project skill match recommendations, team availability overview, and recent team activity feed.
- **FR-034**: Admin Dashboard MUST display: organization-wide skill health score, total skills tracked across all employees, skill gap summary by department, org skill heatmap (top-level view), certification compliance rate, most common skill gaps, and user count by role.
- **FR-035**: Dashboard stat cards MUST adapt layout: 4 per row on desktop, 2 per row on tablet, 1 per row stacked on mobile.

**Proficiency Level Mapping**

- **FR-036**: System MUST map rating percentages to proficiency levels: 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert.
- **FR-037**: System MUST display both the percentage rating and proficiency level label together on all screens.

### Key Entities

- **Employee Skill**: Represents a skill in an employee's profile. Key attributes: skillId, userId, selfRating, managerRating, peerRating, systemRating, finalRating, level (Beginner/Intermediate/Advanced/Expert), status (Draft/Pending/Approved/Stale), lastUpdated, isDeleted (for soft delete).
- **Skill Test Attempt**: Represents a historical assessment attempt for a skill. Key attributes: attemptId, userId, skillId, score, earnedPoints, maxPoints, date, timeTaken.
- **Skill Definition**: Represents a skill in the global library. Key attributes: skillId, skillName, categoryId, subCategoryId, description. Linked to a category and subcategory.
- **Skill Category**: Top-level grouping for skills. Key attributes: categoryId, categoryName, subCategories.
- **Achievement Badge**: A reward indicator for skill milestones. Types: "First Assessment", "Reached Advanced", "Improved by 20%". Computed at render time from score history.

## Assumptions

- All data operations are in-memory only; data resets on page refresh. No server-side persistence.
- The global skill library (categories, subcategories, skill definitions) is pre-populated via mock data from a prior feature and is read-only in this feature.
- Certifications data is populated by a separate feature; this feature only reads certification status to display badges and expiry alerts.
- Project assignments data is populated by a separate feature; this feature only reads it to enforce the "cannot delete skill linked to active project" rule.
- Manager and Admin dashboards display summary/aggregate widgets. The underlying data for team/org views comes from the same mock data files, filtered by role scope (manager sees own team, admin sees all).
- The "recent activity feed" on dashboards shows mock/pre-populated activity entries. Dynamic activity tracking from user actions is limited to in-session actions.
- The rating confidence indicator counts non-null rating sources (selfRating, managerRating, peerRating, systemRating) to determine confidence level.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Employees can add a new skill to their profile in under 30 seconds by selecting from cascading dropdowns and setting a self-rating.
- **SC-002**: 100% of skills in an employee's profile display the correct proficiency level badge matching the percentage-to-level mapping rules.
- **SC-003**: All three role-specific dashboards render the complete set of specified widgets without missing or blank sections.
- **SC-004**: Stale skills (not updated for 6+ months) are visually distinguishable from active skills with 100% accuracy.
- **SC-005**: Profile completion percentage accurately reflects the ratio of assessed skills to total available skills, verified against known test data.
- **SC-006**: Skill detail screens display the correct confidence indicator (🟢/🟡/🔴) based on the number of available rating sources.
- **SC-007**: Skill progress line charts accurately plot all historical assessment data points in chronological order.
- **SC-008**: Users can successfully perform all skill CRUD operations (add, view, edit, delete) across desktop, tablet, and mobile breakpoints.
- **SC-009**: Achievement badges are correctly awarded based on assessment history — "First Assessment" after the first test, "Reached Advanced" upon reaching the Advanced level, "Improved by 20%" when improvement exceeds 20 percentage points.
- **SC-010**: Unauthorized UI elements (e.g., "Override Rating" for non-admin roles) are completely absent from the DOM, not merely hidden.
