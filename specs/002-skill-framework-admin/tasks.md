# Tasks: Skill Framework and Structure Management (Admin)

**Input**: Design documents from `/specs/002-skill-framework-admin/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/admin-api-contract.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. User stories with the same priority (P1) are ordered by dependency: US6 (access control) is folded into the Foundational phase since it provides guards required by all other stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared TypeScript interfaces, mock data files, and NgRx admin store scaffolding required by all user stories.

- [ ] T001 [P] Create SkillCategory and SubCategory interfaces in src/app/shared/models/skill-category.model.ts
- [ ] T002 [P] Create SkillDefinition interface in src/app/shared/models/skill-definition.model.ts
- [ ] T003 [P] Create ProficiencyLevel interface in src/app/shared/models/proficiency-level.model.ts
- [ ] T004 [P] Create RatingWeightConfig interface in src/app/shared/models/rating-weight.model.ts
- [ ] T005 [P] Create or verify skill-categories.json with 8 categories and 9 nested subcategories in src/assets/mock-data/skill-categories.json
- [ ] T006 [P] Create or verify skill-definitions.json with 22+ pre-populated skills in src/assets/mock-data/skill-definitions.json
- [ ] T007 [P] Create proficiency-levels.json with 4 levels (Beginner through Expert) in src/assets/mock-data/proficiency-levels.json
- [ ] T008 [P] Create rating-weights.json with default weights (Self 0.20, Manager 0.30, Peer 0.15, System 0.35) in src/assets/mock-data/rating-weights.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: NgRx admin store slice, interceptor extension, admin routes with guards — MUST complete before ANY user story UI can be implemented. Also satisfies **User Story 6** (Non-Admin access control, P1).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 Create NgRx admin actions for categories, subcategories, skill definitions, proficiency levels, and rating weights in src/app/core/store/admin/admin.actions.ts
- [ ] T010 Create NgRx admin reducer with EntityAdapter for categories, subcategories, and skill definitions; plain state for proficiency levels and rating weights in src/app/core/store/admin/admin.reducer.ts
- [ ] T011 Create NgRx admin selectors including selectAllCategories, selectSubcategoriesByCategoryId, selectSkillDefinitionsBySubCategoryId, selectAllProficiencyLevels, selectRatingWeights in src/app/core/store/admin/admin.selectors.ts
- [ ] T012 Create NgRx admin effects handling HTTP calls for all admin CRUD operations in src/app/core/store/admin/admin.effects.ts
- [ ] T013 Extend MockApiInterceptor with admin endpoint URL patterns for categories CRUD (GET/POST/PUT/DELETE /api/admin/categories), subcategories CRUD, skill-definitions CRUD, proficiency-levels (GET/PUT), and rating-weights (GET/PUT) in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T014 Implement interceptor business rules: category name uniqueness (case-insensitive), category delete guard (check employee-skills for linked skills), subcategory delete guard (check skill-definitions), skill name uniqueness within subcategory, rating weight sum-to-1.00 validation in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T015 Implement interceptor role enforcement returning 403 for non-Admin users on all /api/admin/* endpoints in src/app/core/interceptors/mock-api.interceptor.ts
- [ ] T016 Create admin lazy-loaded routes file with sub-routes for categories, subcategories, skills, proficiency-framework, and rating-config in src/app/features/admin/admin.routes.ts
- [ ] T017 Register admin routes in main app routes with AuthGuard + RoleGuard(['Admin']) and provideState/provideEffects for admin NgRx slice in src/app/app.routes.ts

**Checkpoint**: Foundation ready — admin NgRx store, interceptor endpoints, and route guards are in place. Non-Admin users are redirected to /unauthorized (US6 satisfied). User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Admin Manages Skill Categories (Priority: P1) 🎯 MVP

**Goal**: Admin can list, add, edit, and delete skill categories from /admin/skill-framework/categories with full validation (uniqueness, delete guard for linked skills).

**Independent Test**: Log in as Admin → navigate to /admin/skill-framework/categories → see 8 pre-populated categories → add/edit/delete categories → verify validation errors for duplicates and linked-skill deletions.

### Implementation for User Story 1

- [ ] T018 [US1] Create CategoriesComponent with data table listing all categories (name, description, actions column) in src/app/features/admin/categories/categories.component.ts
- [ ] T019 [US1] Create CategoriesComponent template with responsive table (desktop) / card list (mobile), Add Category button, edit/delete action buttons per row in src/app/features/admin/categories/categories.component.html
- [ ] T020 [US1] Create CategoriesComponent SCSS with responsive styles (two-column desktop, single-column mobile) in src/app/features/admin/categories/categories.component.scss
- [ ] T021 [US1] Create CategoryFormComponent dialog with reactive form (categoryName: required + unique validator, description: required), inline validation errors, and save/cancel buttons in src/app/features/admin/categories/category-form/category-form.component.ts
- [ ] T022 [US1] Create CategoryFormComponent template with form fields, inline error messages ("This field is required", "A category with this name already exists"), and responsive layout in src/app/features/admin/categories/category-form/category-form.component.html
- [ ] T023 [US1] Create CategoryFormComponent SCSS in src/app/features/admin/categories/category-form/category-form.component.scss
- [ ] T024 [US1] Implement delete confirmation dialog in CategoriesComponent showing success toast on delete or error message "Cannot delete: skills are linked to this category" when blocked in src/app/features/admin/categories/categories.component.ts
- [ ] T025 [US1] Wire CategoriesComponent to NgRx store: dispatch loadCategories on init, use selectAllCategories selector, dispatch addCategory/updateCategory/deleteCategory actions in src/app/features/admin/categories/categories.component.ts

**Checkpoint**: User Story 1 is fully functional — Admin can CRUD categories with all validation rules enforced.

---

## Phase 4: User Story 2 — Admin Manages Subcategories (Priority: P1)

**Goal**: Admin can list subcategories grouped by parent category, add new subcategories under a category, and edit subcategory names from /admin/skill-framework/subcategories.

**Independent Test**: Log in as Admin → navigate to /admin/skill-framework/subcategories → see subcategories grouped by category (e.g., Development → Frontend, Backend, Mobile) → add/edit subcategories → verify parent category selection.

### Implementation for User Story 2

- [ ] T026 [US2] Create SubcategoriesComponent with grouped display (subcategories listed under parent category headers) and action buttons in src/app/features/admin/subcategories/subcategories.component.ts
- [ ] T027 [US2] Create SubcategoriesComponent template with expandable category groups, Add Subcategory button, edit/delete actions, and responsive layout in src/app/features/admin/subcategories/subcategories.component.html
- [ ] T028 [US2] Create SubcategoriesComponent SCSS with grouped list styles and responsive breakpoints in src/app/features/admin/subcategories/subcategories.component.scss
- [ ] T029 [US2] Create SubcategoryFormComponent dialog with reactive form (parentCategory: required dropdown, subCategoryName: required), inline validation in src/app/features/admin/subcategories/subcategory-form/subcategory-form.component.ts
- [ ] T030 [US2] Create SubcategoryFormComponent template with category dropdown and name field in src/app/features/admin/subcategories/subcategory-form/subcategory-form.component.html
- [ ] T031 [US2] Create SubcategoryFormComponent SCSS in src/app/features/admin/subcategories/subcategory-form/subcategory-form.component.scss
- [ ] T032 [US2] Implement delete with guard — show error "Cannot delete: skill definitions exist under this subcategory" when skill definitions exist, else remove and show success toast in src/app/features/admin/subcategories/subcategories.component.ts
- [ ] T033 [US2] Wire SubcategoriesComponent to NgRx store: dispatch loadSubcategories and loadCategories on init, use selectSubcategoriesByCategoryId selector for grouping, dispatch add/update/delete actions in src/app/features/admin/subcategories/subcategories.component.ts

**Checkpoint**: User Story 2 is fully functional — Admin can manage subcategories grouped by parent category with delete guards.

---

## Phase 5: User Story 3 — Admin Manages Skill Definitions (Priority: P1)

**Goal**: Admin can list all skills grouped by category and subcategory, add new skills with cascading dropdowns (Category → Subcategory → Skill Name), and edit skill definitions from /admin/skill-framework/skills.

**Independent Test**: Log in as Admin → navigate to /admin/skill-framework/skills → see 22+ skills grouped by category/subcategory → add skill with cascading dropdowns → verify duplicate rejection "This skill already exists in this subcategory" → edit skills.

### Implementation for User Story 3

- [ ] T034 [US3] Create SkillDefinitionsComponent with grouped display (skills listed under category → subcategory hierarchy) and action buttons in src/app/features/admin/skill-definitions/skill-definitions.component.ts
- [ ] T035 [US3] Create SkillDefinitionsComponent template with two-level grouping (category headers → subcategory headers → skill rows), Add Skill button, edit actions, and responsive layout in src/app/features/admin/skill-definitions/skill-definitions.component.html
- [ ] T036 [US3] Create SkillDefinitionsComponent SCSS with hierarchical group styles and responsive breakpoints in src/app/features/admin/skill-definitions/skill-definitions.component.scss
- [ ] T037 [US3] Create SkillFormComponent dialog with reactive form: cascading dropdowns (category → subcategory), skill name (required + unique-within-subcategory validator), description (required) in src/app/features/admin/skill-definitions/skill-form/skill-form.component.ts
- [ ] T038 [US3] Implement cascading dropdown behavior: category valueChanges resets subcategory and filters subcategory list; subcategory valueChanges rescopes skill uniqueness validator in src/app/features/admin/skill-definitions/skill-form/skill-form.component.ts
- [ ] T039 [US3] Create SkillFormComponent template with cascading selects, skill name/description inputs, inline errors ("This field is required", "This skill already exists in this subcategory") in src/app/features/admin/skill-definitions/skill-form/skill-form.component.html
- [ ] T040 [US3] Create SkillFormComponent SCSS in src/app/features/admin/skill-definitions/skill-form/skill-form.component.scss
- [ ] T041 [US3] Wire SkillDefinitionsComponent to NgRx store: dispatch loadSkillDefinitions/loadCategories/loadSubcategories on init, use grouped selectors, dispatch add/update actions in src/app/features/admin/skill-definitions/skill-definitions.component.ts

**Checkpoint**: User Story 3 is fully functional — Admin can manage the complete skill hierarchy with cascading dropdowns and uniqueness enforcement.

---

## Phase 6: User Story 4 — Admin Views and Edits Proficiency Framework (Priority: P2)

**Goal**: Admin can view the four proficiency levels (Beginner through Expert) with scores, descriptions, criteria, and thresholds. Admin can edit descriptions and example criteria while level names and scores remain read-only.

**Independent Test**: Log in as Admin → navigate to /admin/proficiency-framework → see 4-row table → edit description/criteria on a row → verify level name and score are read-only → save → see updated values.

### Implementation for User Story 4

- [ ] T042 [US4] Create ProficiencyFrameworkComponent with mat-table displaying 4 levels (Level, Name, Score, Description, Example Criteria, Threshold Range) and inline row editing in src/app/features/admin/proficiency-framework/proficiency-framework.component.ts
- [ ] T043 [US4] Create ProficiencyFrameworkComponent template with table, read-only columns (Name, Score, Threshold), editable columns (Description, Example Criteria) toggled by Edit button, Save/Cancel per row in src/app/features/admin/proficiency-framework/proficiency-framework.component.html
- [ ] T044 [US4] Create ProficiencyFrameworkComponent SCSS with table styles, editable field highlight, and responsive layout in src/app/features/admin/proficiency-framework/proficiency-framework.component.scss
- [ ] T045 [US4] Wire ProficiencyFrameworkComponent to NgRx store: dispatch loadProficiencyLevels on init, use selectAllProficiencyLevels selector, dispatch updateProficiencyLevel action on save with success toast in src/app/features/admin/proficiency-framework/proficiency-framework.component.ts

**Checkpoint**: User Story 4 is fully functional — Admin can view and edit proficiency level descriptions and criteria.

---

## Phase 7: User Story 5 — Admin Configures Rating Weights (Priority: P2)

**Goal**: Admin can adjust the four rating source weights (Self, Manager, Peer, System) with real-time sum indicator. Save validates sum equals 1.00. Changes persist in-memory only (reset on refresh).

**Independent Test**: Log in as Admin → navigate to /admin/rating-config → see 4 weights with defaults summing to 1.00 → adjust values → see real-time sum update → save with valid sum → success toast → save with invalid sum → error shown → refresh page → weights reset to defaults.

### Implementation for User Story 5

- [ ] T046 [US5] Create RatingConfigComponent with reactive FormGroup (4 FormControls for weights), cross-field sum validator (±0.001 tolerance), and real-time sum display via valueChanges observable in src/app/features/admin/rating-config/rating-config.component.ts
- [ ] T047 [US5] Create RatingConfigComponent template with slider + numeric input for each weight, real-time sum indicator, Save button, inline validation error "Weights must sum to 1.00 (100%)" in src/app/features/admin/rating-config/rating-config.component.html
- [ ] T048 [US5] Create RatingConfigComponent SCSS with slider layout, sum indicator styles, and responsive form layout (two-column desktop, single-column mobile) in src/app/features/admin/rating-config/rating-config.component.scss
- [ ] T049 [US5] Wire RatingConfigComponent to NgRx store: dispatch loadRatingWeights on init, use selectRatingWeights selector, dispatch updateRatingWeights action on save with success/error toast in src/app/features/admin/rating-config/rating-config.component.ts

**Checkpoint**: User Story 5 is fully functional — Admin can configure rating weights with real-time validation and session-only persistence.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validations, loading states, toast notifications, and quickstart verification across all admin screens.

- [ ] T050 [P] Add loading spinner/skeleton states to all admin list components (CategoriesComponent, SubcategoriesComponent, SkillDefinitionsComponent, ProficiencyFrameworkComponent, RatingConfigComponent) during initial data fetch
- [ ] T051 [P] Ensure success toast notifications ("Category added successfully", "Skill updated successfully", "Rating weights saved successfully", etc.) are shown on all successful CRUD operations across admin screens
- [ ] T052 [P] Ensure all form dialogs follow responsive layout: two-column on desktop, single-column on mobile with sticky submit button per Section 18.3
- [ ] T053 [P] Ensure all data tables follow responsive behavior: full columns on desktop, reduced columns on tablet, expandable card list on mobile per Section 18.3
- [ ] T054 Run quickstart.md verification checklist to validate all admin screens end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately. All tasks are parallelizable.
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories. Tasks T009–T012 (NgRx) are sequential. T013–T015 (interceptor) are sequential. T016–T017 (routes) depend on T009–T012.
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion.
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1 and US2.
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1–US3.
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) completion. Can run in parallel with US1–US4.
- **Polish (Phase 8)**: Depends on ALL user stories being complete.

### User Story Dependencies

- **User Story 1 (P1) — Categories**: Independent after Foundational phase. No cross-story dependency.
- **User Story 2 (P1) — Subcategories**: Independent after Foundational phase. Uses category data from store but does not depend on US1 UI being complete.
- **User Story 3 (P1) — Skill Definitions**: Independent after Foundational phase. Uses category + subcategory data from store but does not depend on US1/US2 UI being complete.
- **User Story 4 (P2) — Proficiency Framework**: Fully independent — separate data entity with no cross-entity dependencies.
- **User Story 5 (P2) — Rating Weights**: Fully independent — separate data entity with no cross-entity dependencies.
- **User Story 6 (P1) — Access Control**: Satisfied in Foundational phase (T015 interceptor role enforcement + T017 route guards).

### Within Each User Story

- Component class (`.ts`) before template (`.html`) and styles (`.scss`)
- Form dialog component after list component
- NgRx wiring as final integration step per story

### Parallel Opportunities

- **Phase 1**: ALL tasks (T001–T008) can run in parallel — independent files.
- **Phase 2**: T009 → T010 → T011 → T012 are sequential (NgRx chain). T013 → T014 → T015 are sequential (interceptor chain). T016 → T017 are sequential (routes). But the NgRx chain and interceptor chain can run in parallel with each other.
- **Phase 3–7**: ALL user story phases can start in parallel after Phase 2 completes (different component directories, no file conflicts).
- **Phase 8**: All polish tasks marked [P] can run in parallel.

---

## Parallel Example: User Story 1 (Categories)

```bash
# After Phase 2 completes:
# Developer A works on CategoriesComponent (T018–T020)
# Developer B works on CategoryFormComponent (T021–T023)
# Then merge: T024 (delete dialog) + T025 (NgRx wiring)
```

## Parallel Example: All User Stories After Foundational

```bash
# After Phase 2 completes:
# Developer A: US1 (Phase 3) — Categories CRUD
# Developer B: US2 (Phase 4) — Subcategories CRUD
# Developer C: US3 (Phase 5) — Skill Definitions CRUD
# Developer D: US4 (Phase 6) + US5 (Phase 7) — Proficiency + Rating Config
# All work in separate directories under src/app/features/admin/
```

---

## Implementation Strategy

1. **MVP Scope**: Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1 — Categories). This delivers the core admin CRUD capability with access control.
2. **Incremental Delivery**: After MVP, add Phases 4–5 (Subcategories + Skill Definitions) to complete the full skill hierarchy, then Phases 6–7 (Proficiency + Rating Config) for configuration screens.
3. **All user stories are independently testable** — each phase ends with a checkpoint confirming the story works as a standalone increment.
