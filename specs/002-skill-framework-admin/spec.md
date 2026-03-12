# Feature Specification: Skill Framework and Structure Management

**Feature Branch**: `002-skill-framework-admin`  
**Created**: 2026-03-12  
**Status**: Draft  
**Input**: User description: "Skill Framework and Structure Management for Skill Matrix Application — Admin functionality. This is a frontend-only Angular 17 app. All data read from and written to in-memory copies of JSON mock data files."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Manages Skill Categories (Priority: P1)

An admin navigates to the Skill Framework – Categories screen and sees a list of all skill categories (Development, QA, Cloud, DevOps, Data Engineering, AI/ML, Communication, Project Management) with their names and descriptions. The admin can add a new category by providing a unique name and description. The admin can edit an existing category's name or description. The admin can delete a category only if no employees have skills linked to it.

**Why this priority**: Skill categories are the top-level building block of the entire skill hierarchy. Without categories, subcategories and skill definitions cannot exist. This is the foundational CRUD operation for the skill framework.

**Independent Test**: Can be fully tested by logging in as Admin, navigating to /admin/skill-framework/categories, and performing add/edit/delete operations on categories while verifying validation rules.

**Acceptance Scenarios**:

1. **Given** an admin is on the Categories screen, **When** the page loads, **Then** all pre-populated categories (Development, QA, Cloud, DevOps, Data Engineering, AI/ML, Communication, Project Management) are displayed with their names and descriptions.
2. **Given** an admin clicks "Add Category", **When** they enter a unique name and description and save, **Then** the new category appears in the list.
3. **Given** an admin clicks "Add Category", **When** they enter a name that already exists and save, **Then** the system rejects the submission with a validation error indicating the name must be unique.
4. **Given** an admin selects a category, **When** they edit the name or description and save, **Then** the updated values are reflected in the list.
5. **Given** a category has employee skills linked to it, **When** the admin attempts to delete it, **Then** the system displays "Cannot delete: skills are linked to this category" and blocks the deletion.
6. **Given** a category has no employee skills linked to it, **When** the admin deletes it, **Then** the category is removed from the list.

---

### User Story 2 - Admin Manages Subcategories (Priority: P1)

An admin navigates to the Skill Framework – Subcategories screen and sees subcategories grouped by their parent category. The admin can add a new subcategory under a specific category. The admin can edit an existing subcategory's name. Pre-populated subcategories include Development → Frontend, Backend, Mobile; Cloud → AWS, Azure, Google Cloud; DevOps → CI/CD, Containerization, Infrastructure.

**Why this priority**: Subcategories are the second tier of the skill hierarchy. They must be in place before skill definitions can be created, and they depend on categories existing first. Together with categories, they form the complete organizational structure.

**Independent Test**: Can be tested by navigating to /admin/skill-framework/subcategories as Admin and performing add/edit operations on subcategories, verifying grouping under parent categories.

**Acceptance Scenarios**:

1. **Given** an admin is on the Subcategories screen, **When** the page loads, **Then** subcategories are displayed grouped under their parent category (e.g., Development shows Frontend, Backend, Mobile).
2. **Given** an admin clicks "Add Subcategory", **When** they select a parent category, enter a subcategory name, and save, **Then** the new subcategory appears under the selected category.
3. **Given** an admin selects a subcategory, **When** they edit the name and save, **Then** the updated name is reflected in the list under the correct parent category.

---

### User Story 3 - Admin Manages Skill Definitions (Priority: P1)

An admin navigates to the Skill Framework – Definitions screen and sees all skills grouped by category and subcategory. The admin can add a new skill by selecting a category, then a subcategory, and entering a skill name and description. The skill name must be unique within its subcategory. The admin can edit an existing skill's name or description.

**Why this priority**: Skill definitions are the leaf nodes of the hierarchy that employees actually add to their profiles. Without defined skills, no skill assessments, ratings, or matching can occur. This completes the skill taxonomy.

**Independent Test**: Can be tested by navigating to /admin/skill-framework/skills as Admin and adding/editing skill definitions, verifying uniqueness constraints and cascading dropdown behavior.

**Acceptance Scenarios**:

1. **Given** an admin is on the Skill Definitions screen, **When** the page loads, **Then** all skills are displayed grouped by category and subcategory (e.g., Development → Frontend → React, Angular, Vue).
2. **Given** an admin clicks "Add Skill", **When** they select a category, then a subcategory, enter a unique skill name and description, and save, **Then** the new skill appears under the selected category and subcategory.
3. **Given** an admin clicks "Add Skill", **When** they enter a skill name that already exists in the selected subcategory, **Then** the system displays "This skill already exists in this subcategory" and rejects the submission.
4. **Given** an admin selects an existing skill, **When** they edit the name or description and save, **Then** the updated values are reflected in the grouped list.

---

### User Story 4 - Admin Views and Edits Proficiency Framework (Priority: P2)

An admin navigates to the Proficiency Framework section and sees a table of the four proficiency levels: Beginner (1), Intermediate (2), Advanced (3), Expert (4). Each level displays its score, description, and example criteria. The admin can edit the descriptions and example criteria for each level, but the level names and numeric scores (1–4) are fixed and cannot be changed. The level thresholds (0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert) are displayed for reference.

**Why this priority**: The proficiency framework defines how skill ratings map to human-readable levels. Editing descriptions and criteria is a configuration task that refines the framework but is not blocking for other features to function — the default values are usable out of the box.

**Independent Test**: Can be tested by viewing the proficiency levels table as Admin and editing descriptions/criteria, verifying that level names and scores remain locked.

**Acceptance Scenarios**:

1. **Given** an admin is on the Proficiency Framework screen, **When** the page loads, **Then** a table displays all four levels with Score, Description, and Example Criteria columns.
2. **Given** an admin clicks edit on a proficiency level row, **When** they modify the Description or Example Criteria and save, **Then** the updated text is reflected in the table.
3. **Given** an admin views a proficiency level row, **When** they attempt to modify the level name or score, **Then** those fields are read-only and cannot be edited.
4. **Given** an admin is on the Proficiency Framework screen, **When** they view the threshold section, **Then** the mapping (0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert) is displayed.

---

### User Story 5 - Admin Configures Rating Weights (Priority: P2)

An admin navigates to the Rating Configuration screen and sees the four rating source weights: Self Rating (default 0.20), Manager Rating (default 0.30), Peer Rating (default 0.15), System Rating (default 0.35). The admin can adjust each weight using sliders or numeric inputs. A real-time sum indicator updates as the admin changes values. On save, the system validates that all weights sum to exactly 1.00 (100%). Changes are saved in-memory for the current session only.

**Why this priority**: Rating weight configuration controls how the Final Rating formula distributes importance across sources. It is a configuration screen that fine-tunes existing defaults but does not block the rating system from functioning with default values.

**Independent Test**: Can be tested by navigating to /admin/rating-config as Admin, adjusting weight values, verifying real-time sum display, and testing the sum-to-1.00 validation on save.

**Acceptance Scenarios**:

1. **Given** an admin is on the Rating Configuration screen, **When** the page loads, **Then** the four weights are displayed with their default values (Self: 0.20, Manager: 0.30, Peer: 0.15, System: 0.35) and the sum shows 1.00.
2. **Given** an admin adjusts a weight value, **When** the value changes, **Then** the real-time sum indicator updates immediately to reflect the new total.
3. **Given** an admin has set weights that sum to 1.00, **When** they click save, **Then** the system accepts the configuration and shows a success confirmation.
4. **Given** an admin has set weights that do not sum to 1.00, **When** they click save, **Then** the system rejects the save and displays a validation error indicating that weights must sum to 1.00 (100%).
5. **Given** an admin saves valid weight configuration, **When** they refresh the page, **Then** the weights reset to original defaults (changes persist in-memory only during the session).

---

### User Story 6 - Non-Admin Users Cannot Access Admin Screens (Priority: P1)

Employees and Managers cannot access any of the Skill Framework or Rating Configuration screens. All /admin/** routes are protected by RoleGuard(['Admin']). If a non-admin user attempts to access these routes via URL, they are redirected to the Unauthorized page.

**Why this priority**: Access control is a security-critical requirement. The entire skill framework management feature is meaningless without ensuring only Admins can access it.

**Independent Test**: Can be tested by logging in as an Employee or Manager and navigating directly to /admin/skill-framework/categories, verifying redirect to /unauthorized.

**Acceptance Scenarios**:

1. **Given** an Employee is logged in, **When** they navigate to /admin/skill-framework/categories, **Then** they are redirected to /unauthorized.
2. **Given** a Manager is logged in, **When** they navigate to /admin/rating-config, **Then** they are redirected to /unauthorized.
3. **Given** an Admin is logged in, **When** they navigate to /admin/skill-framework/categories, **Then** the page loads successfully with the categories list.

---

### Edge Cases

- What happens when the admin tries to add a category with only whitespace as the name? The system should treat it as an empty field and require a valid non-empty name.
- What happens when the admin edits a category name to match an existing category's name? The system should reject the edit with a uniqueness validation error.
- What happens when the admin deletes a subcategory that has skill definitions under it? The system should prevent deletion and display an appropriate error message indicating skills exist under this subcategory.
- What happens when the admin adjusts a rating weight to a negative number or a value greater than 1.00? The system should constrain inputs to valid ranges (0.00 to 1.00) and show validation feedback.
- What happens when the admin changes the category dropdown while adding a skill? The subcategory dropdown should reset and reload subcategories for the newly selected category (cascading behavior).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All Skill Framework and Rating Configuration screens (/admin/**) MUST be accessible only to users with the Admin role, enforced by RoleGuard(['Admin']).
- **FR-002**: The Categories screen MUST display a list of all skill categories showing category name and description.
- **FR-003**: Admin MUST be able to add a new skill category by providing a name and description.
- **FR-004**: Category names MUST be unique — the system MUST reject duplicate category names with a validation error.
- **FR-005**: Admin MUST be able to edit an existing category's name and description.
- **FR-006**: Admin MUST be able to delete a category only if no employees have skills linked to it. If skills are linked, the system MUST display "Cannot delete: skills are linked to this category".
- **FR-007**: The mock data MUST include pre-populated categories: Development, QA, Cloud, DevOps, Data Engineering, AI/ML, Communication, Project Management.
- **FR-008**: The Subcategories screen MUST display subcategories grouped by their parent category.
- **FR-009**: Admin MUST be able to add a new subcategory by selecting a parent category and providing a subcategory name.
- **FR-010**: Admin MUST be able to edit an existing subcategory's name.
- **FR-011**: The mock data MUST include pre-populated subcategories (e.g., Development → Frontend, Backend, Mobile; Cloud → AWS, Azure, Google Cloud; DevOps → CI/CD, Containerization, Infrastructure).
- **FR-012**: The Skill Definitions screen MUST display all skills grouped by category and subcategory.
- **FR-013**: Admin MUST be able to add a new skill by selecting a category, then a subcategory (cascading selection), and entering a skill name and description.
- **FR-014**: Skill names MUST be unique within their subcategory. Duplicate submissions MUST be rejected with "This skill already exists in this subcategory".
- **FR-015**: Admin MUST be able to edit an existing skill's name and description.
- **FR-016**: The mock data MUST include pre-populated skills across categories (React, Angular, Vue, HTML, CSS, JavaScript, TypeScript, Java, Node.js, Python, .NET, Spring Boot, Flutter, React Native, Docker, Kubernetes, Jenkins, Terraform, SQL, PostgreSQL, MongoDB, Redis, etc.).
- **FR-017**: The Proficiency Framework MUST display a table with four levels: Beginner (1), Intermediate (2), Advanced (3), Expert (4), each showing Score, Description, and Example Criteria.
- **FR-018**: Admin MUST be able to edit the Description and Example Criteria for each proficiency level. Level names and numeric scores (1–4) MUST be read-only.
- **FR-019**: The proficiency level thresholds MUST be displayed: 0–40% → Beginner, 41–65% → Intermediate, 66–85% → Advanced, 86–100% → Expert.
- **FR-020**: The Rating Configuration screen MUST display the four rating source weights with their default values: Self Rating (0.20), Manager Rating (0.30), Peer Rating (0.15), System Rating (0.35).
- **FR-021**: Admin MUST be able to adjust each rating weight via sliders or numeric inputs.
- **FR-022**: The system MUST display a real-time sum indicator that updates immediately as the admin adjusts any weight value.
- **FR-023**: On save, the system MUST validate that all four weights sum to exactly 1.00 (100%). If the sum is not 1.00, the save MUST be rejected with a validation error.
- **FR-024**: Rating weight changes MUST persist in-memory for the current session only. On page refresh, weights reset to their default values.
- **FR-025**: All CRUD operations on categories, subcategories, and skill definitions MUST update the in-memory copy of the mock data during the session — data resets on page refresh.
- **FR-026**: All form fields MUST display real-time inline validation. Required fields MUST show "This field is required" when left empty on submit.
- **FR-027**: Successful save operations MUST show a success toast notification (e.g., "Category added successfully", "Skill updated successfully").
- **FR-028**: Forms MUST follow responsive layout: two-column on desktop, single-column on mobile with sticky submit button.

### Key Entities

- **Skill Category**: The top-level grouping for skills. Attributes: categoryId, categoryName, description. Contains zero or more subcategories. Pre-populated with 8 categories (Development, QA, Cloud, DevOps, Data Engineering, AI/ML, Communication, Project Management).
- **Subcategory**: A sub-grouping within a category. Attributes: subCategoryId, subCategoryName, parent categoryId. Contains zero or more skill definitions.
- **Skill Definition**: An individual skill within a subcategory. Attributes: skillId, skillName, categoryId, subCategoryId, description. Must have a unique name within its subcategory.
- **Proficiency Level**: Defines a proficiency tier with its scoring criteria. Attributes: level name (fixed: Beginner/Intermediate/Advanced/Expert), score (fixed: 1–4), description (editable), example criteria (editable), percentage threshold range.
- **Rating Weight Configuration**: Defines the weights used in the Final Rating formula. Attributes: selfRatingWeight, managerRatingWeight, peerRatingWeight, systemRatingWeight. All weights must sum to 1.00.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can add, edit, and view skill categories with zero data loss during the session — all changes reflect immediately in the list.
- **SC-002**: Admin can create the full three-level skill hierarchy (Category → Subcategory → Skill) in under 2 minutes per skill.
- **SC-003**: 100% of uniqueness validations are enforced — duplicate category names and duplicate skill names within a subcategory are always rejected.
- **SC-004**: 100% of deletion guard rules are enforced — categories with linked employee skills cannot be deleted.
- **SC-005**: Rating weight configuration validates sum-to-1.00 on every save attempt with zero false positives or false negatives.
- **SC-006**: Real-time sum indicator updates within 200ms of any weight change.
- **SC-007**: All /admin/** routes return "Access Denied" for non-Admin users — zero unauthorized access.
- **SC-008**: Pre-populated mock data contains all 8 categories, their subcategories, and 20+ skill definitions ready for use on first load.

## Assumptions

- This feature is Admin-only. Employees and Managers have no access to any screen or functionality described in this specification.
- All CRUD operations update in-memory copies of the mock data. Data resets to original JSON file content on page refresh.
- The Proficiency Framework display and editing is part of the Admin screens in this phase. Other roles will see proficiency levels as read-only labels on skill profile screens in subsequent phases (Phase 3).
- The Rating Weight Configuration affects the Final Rating formula used in Phase 6 (Peer Validation & Manager Controls). This phase only provides the admin UI to configure the weights; the formula calculation itself is implemented in Phase 6.
- Subcategory deletion rules are not explicitly defined in the user input. The system will prevent deletion of subcategories that have skill definitions under them, consistent with the category deletion guard pattern.
- Category descriptions are optional in the mock data structure. If not provided, categories display with name only.
- The cascading dropdown for skill definition creation (Category → Subcategory → Skill) resets dependent fields when a parent selection changes.
- Responsive behavior follows Section 18.3 of requirement.md: data tables use full columns on desktop, reduced columns on tablet, and expandable card lists on mobile. Forms use two-column layout on desktop and single-column on mobile.
