# Research: Skill Framework and Structure Management (Admin)

**Feature Branch**: `002-skill-framework-admin`  
**Date**: 2026-03-12  
**Status**: Complete — all NEEDS CLARIFICATION items resolved

---

## Research Task 1: NgRx Feature State Pattern for Admin CRUD

**Context**: The admin feature manages 5 related entity types (categories, subcategories, skill definitions, proficiency levels, rating weights) in a single lazy-loaded feature.

### Decision
Use `@ngrx/entity` with `EntityAdapter` for each entity type (Categories, Subcategories, SkillDefinitions) within a unified `AdminState` feature slice. ProficiencyLevels and RatingWeights use simple array/object state (no adapter needed — fixed-size collections).

### Rationale
- `@ngrx/entity` eliminates boilerplate for normalized CRUD: `setAll`, `addOne`, `updateOne`, `removeOne` are auto-generated with memoized selectors.
- The 3 hierarchical entities (Category → Subcategory → Skill) benefit from normalized state; cross-entity lookups (e.g., "get subcategories for categoryId") are efficient via parameterized selectors.
- ProficiencyLevels (fixed 4 rows) and RatingWeights (fixed 4 values) are too small to warrant EntityAdapter — a plain array and object suffice.
- A single feature slice keeps related state co-located and simplifies the `provideState` registration in the admin routes.

### Alternatives Considered
1. **Hand-rolled state arrays**: More boilerplate, error-prone for CRUD mutations, no auto-generated selectors. Rejected — @ngrx/entity is the standard for CRUD.
2. **Separate feature slices per entity**: Over-engineered for tightly-coupled hierarchy. Adds unnecessary module boundaries and complicates cross-entity selectors.
3. **Single flat array without normalization**: Poor lookup performance, N+1 selector patterns. Rejected.

### State Shape

```typescript
export interface AdminState {
  categories: EntityState<SkillCategory>;
  subcategories: EntityState<SubCategory>;
  skillDefinitions: EntityState<SkillDefinition>;
  proficiencyLevels: ProficiencyLevel[];
  ratingWeights: RatingWeightConfig;
  loading: boolean;
  error: string | null;
}
```

### Cascading Delete Guard Pattern
- Effects handle delete requests: before dispatching `deleteCategorySuccess`, the effect queries `employee-skills` data (via a selector or service call) to check if any employee has skills linked to that category.
- If linked skills exist → dispatch `deleteCategoryFailure` with error message "Cannot delete: skills are linked to this category".
- Same pattern for subcategory deletion → check if skill definitions exist under it.

### Update Strategy
- **Pessimistic updates**: Dispatch action → effect calls service → interceptor processes → on success, dispatch success action → reducer updates state. On failure, dispatch failure action → show error toast.
- Rationale: Even though data is in-memory, the interceptor layer simulates real API behavior. Pessimistic updates keep the flow consistent with production patterns and allow the interceptor to enforce business rules (uniqueness, delete guards).

---

## Research Task 2: Angular Reactive Forms for Admin CRUD

**Context**: Category, subcategory, and skill definition forms need inline validation, uniqueness checks, and cascading dropdowns.

### Decision
Use Angular `FormBuilder` with `FormGroup` and `Validators` in standalone dialog components. Implement uniqueness validation as a synchronous custom `ValidatorFn` that reads current entity names from a component-level array (populated from NgRx selector on dialog open). Implement cascading dropdowns via `valueChanges` subscription with `takeUntilDestroyed`.

### Rationale
- Reactive forms give full programmatic control over validation state, which is essential for real-time inline validation (FR-026).
- Uniqueness validation reads from an array snapshot passed to the dialog at creation time (not a live selector inside the validator) — this avoids circular injection issues and race conditions.
- Cascading dropdowns: when Category changes, reset Subcategory and filter the subcategory list via the store selector `selectSubcategoriesByCategoryId(categoryId)`.
- Dialog pattern (MatDialog or PrimeNG DynamicDialog) for add/edit operations keeps the list view clean and follows Angular Material patterns.

### Alternatives Considered
1. **Template-driven forms**: Insufficient control for cascading validation; poor testability. Rejected.
2. **AsyncValidator with store.select()**: Introduces unnecessary Observable complexity for an in-memory check. Rejected — synchronous validator with snapshot is simpler and faster.
3. **Inline table editing instead of dialogs**: Good for simple edits (proficiency framework) but not ideal for multi-field forms with cascading selects. Rejected for category/skill creation.

### Validation Rules Summary

| Form | Field | Validators |
|------|-------|-----------|
| Category Add/Edit | name | `required`, `uniqueCategoryName` (custom), `trimWhitespace` (custom) |
| Category Add/Edit | description | `required` |
| Subcategory Add/Edit | parentCategory | `required` |
| Subcategory Add/Edit | name | `required` |
| Skill Definition Add/Edit | category | `required` |
| Skill Definition Add/Edit | subcategory | `required` |
| Skill Definition Add/Edit | skillName | `required`, `uniqueSkillInSubcategory` (custom) |
| Skill Definition Add/Edit | description | `required` |

### Cascading Dropdown Behavior
1. User selects Category → Subcategory dropdown resets to empty and repopulates with filtered subcategories.
2. User selects Subcategory → skill uniqueness validator rescopes to the selected subcategory.
3. If Category changes while Subcategory is populated → Subcategory and Skill Name both reset.

---

## Research Task 3: Rating Weight Configuration UI

**Context**: Four rating source weights (Self, Manager, Peer, System) must be adjustable and sum to exactly 1.00.

### Decision
Use a reactive FormGroup with 4 `FormControl<number>` fields (one per weight). Each field has `min(0)`, `max(1)`, `step(0.01)` constraints. A cross-field validator on the FormGroup checks that all values sum to 1.00 (with ±0.001 tolerance for floating-point). Display a real-time sum indicator via `valueChanges` observable. Validate on save (pessimistic).

### Rationale
- A FormGroup-level validator is the cleanest way to enforce cross-field constraints in Angular Reactive Forms.
- Real-time sum display via `valueChanges.pipe(map(...))` provides immediate feedback without blocking save until the user is ready.
- Floating-point tolerance (±0.001, i.e., `Math.abs(sum - 1.0) < 0.001`) prevents false rejections from IEEE 754 rounding.
- Dual input: sliders for visual adjustment + numeric inputs for precision. Both bound to the same FormControl.

### Alternatives Considered
1. **Auto-balancing sliders**: Changing one slider automatically redistributes remaining weight across others. Complex UX, hard to predict behavior. Rejected.
2. **Percentage inputs (0–100) instead of decimals (0.00–1.00)**: Maps less directly to the formula. Rejected — use decimal internally, display percentage as hint label.
3. **Validate continuously (block save button)**: User can't see the error context. Pessimistic validation with clear error message is more informative. Rejected.

### Implementation Notes
- Default values loaded from `rating-weights.json` via interceptor on component init.
- On save: dispatch `updateRatingWeights` action → effect calls service → interceptor validates sum and stores in-memory → success toast "Rating weights saved successfully".
- On page refresh: weights reset to defaults from JSON (FR-024).

---

## Research Task 4: Proficiency Framework Inline Editing

**Context**: A 4-row table with fixed columns (Level Name, Score) and editable columns (Description, Example Criteria).

### Decision
Use Angular Material `mat-table` with row-level inline editing. Each row has an "Edit" button that toggles the row into edit mode (swaps `<span>` for `<input>/<textarea>`). Level Name and Score columns remain read-only (never toggle). Save button per row dispatches an update action.

### Rationale
- The proficiency table has exactly 4 rows — it's a fixed dataset, not a paginated list. Inline editing is the most natural UX for this case.
- Row-level edit mode (vs. cell-level) groups related fields (description + criteria) into a single save action.
- Angular Material `mat-table` provides accessible table semantics out of the box.
- Read-only fields rendered as plain text; editable fields swap between display and edit mode using `@if (editingRowId === row.level)`.

### Alternatives Considered
1. **Dialog-based editing**: Overkill for editing 2 fields on a 4-row table. Rejected.
2. **Cell-level editing with directives**: More granular but adds complexity for only 2 editable columns. Rejected.
3. **PrimeNG p-table with built-in row editing**: Viable alternative; chose Angular Material for consistency with other admin screens.

### Implementation Notes
- State: `proficiencyLevels: ProficiencyLevel[]` in AdminState (loaded from `proficiency-levels.json`).
- Component tracks `editingLevelId: number | null` locally (not in NgRx — it's UI-only state).
- On save: dispatch `updateProficiencyLevel({ level })` → effect → interceptor → success toast.
- On cancel: revert to original values (snapshot stored on edit click).

---

## Research Task 5: MockApiInterceptor Extension for Admin Endpoints

**Context**: The existing interceptor (from Feature 001) handles auth URLs. It needs to be extended for admin CRUD endpoints.

### Decision
Extend the existing `MockApiInterceptor` by adding new URL pattern handlers in the interceptor's `switch`/`if-else` chain. Each admin endpoint maps to an in-memory array operation. The interceptor checks the session role for all `/api/admin/*` endpoints and returns 403 if the user is not Admin.

### Rationale
- The constitution mandates a single interceptor that routes all `HttpClient` requests. Extending it (not replacing it) maintains the single-responsibility pattern.
- Role checking at the interceptor level provides defense-in-depth alongside route guards.
- Each admin endpoint handler follows the same pattern: parse URL → find in-memory array → perform operation → return `HttpResponse` with simulated delay.

### Alternatives Considered
1. **Separate AdminInterceptor**: Violates single-interceptor pattern in the constitution. Would require careful ordering. Rejected.
2. **Service-level in-memory operations without interceptor**: Bypasses the HttpClient → interceptor flow required by the constitution. Rejected.

### New URL Patterns

| Method | URL Pattern | Operation | Guard |
|--------|-------------|-----------|-------|
| `GET` | `/api/admin/categories` | Return all categories with subcategories | Admin |
| `POST` | `/api/admin/categories` | Add category (check uniqueness) | Admin |
| `PUT` | `/api/admin/categories/:id` | Update category (check uniqueness) | Admin |
| `DELETE` | `/api/admin/categories/:id` | Delete category (check linked skills) | Admin |
| `GET` | `/api/admin/subcategories` | Return all subcategories | Admin |
| `POST` | `/api/admin/subcategories` | Add subcategory | Admin |
| `PUT` | `/api/admin/subcategories/:id` | Update subcategory | Admin |
| `DELETE` | `/api/admin/subcategories/:id` | Delete subcategory (check linked skills) | Admin |
| `GET` | `/api/admin/skill-definitions` | Return all skill definitions | Admin |
| `POST` | `/api/admin/skill-definitions` | Add skill (check uniqueness in subcategory) | Admin |
| `PUT` | `/api/admin/skill-definitions/:id` | Update skill | Admin |
| `GET` | `/api/admin/proficiency-levels` | Return proficiency levels | Admin |
| `PUT` | `/api/admin/proficiency-levels/:level` | Update description/criteria | Admin |
| `GET` | `/api/admin/rating-weights` | Return current weights | Admin |
| `PUT` | `/api/admin/rating-weights` | Update weights (validate sum = 1.00) | Admin |

### Interceptor Business Rules
1. **Category uniqueness**: On POST/PUT, check if `categoryName` already exists (case-insensitive) in the in-memory categories array. Return 409 if duplicate.
2. **Category delete guard**: On DELETE, check `employee-skills.json` in-memory array for any skill entries with a `categoryId` matching the category. Return 409 with message if linked.
3. **Subcategory delete guard**: On DELETE, check `skill-definitions` array for any skills with matching `subCategoryId`. Return 409 if skills exist.
4. **Skill uniqueness**: On POST/PUT, check if `skillName` already exists within the same `subCategoryId`. Return 409 if duplicate.
5. **Rating weight validation**: On PUT, validate that all 4 weights sum to 1.00 (±0.001). Return 400 if invalid.

---

## Research Task 6: Mock Data Files — New Files vs. Existing

**Context**: The constitution defines 10 JSON files. This feature needs proficiency levels and rating weights which may not exist as standalone files.

### Decision
Add 2 new JSON files to `/assets/mock-data/`:
- `proficiency-levels.json`: Array of 4 proficiency level objects with editable fields.
- `rating-weights.json`: Single object with 4 weight values.

These supplement (not replace) the existing 10 files. The existing `skill-categories.json` already contains subcategories nested within categories (per constitution schema).

### Rationale
- Proficiency levels and rating weights are independently manageable entities with their own CRUD operations. Embedding them in another file would complicate the interceptor routing.
- The constitution lists 10 files as minimum ("All files reside in `/assets/mock-data/`. Minimum volume requirements are binding.") — adding more is permitted.
- Existing `skill-categories.json` already contains nested subcategories per the constitution schema. The `skill-definitions.json` contains flat skill records with `categoryId` and `subCategoryId` foreign keys.

### Data Structures

**proficiency-levels.json**:
```json
[
  {
    "level": 1,
    "name": "Beginner",
    "description": "Has basic awareness of the skill. Can perform simple tasks with guidance.",
    "exampleCriteria": "Completed introductory training; can follow documented procedures.",
    "thresholdMin": 0,
    "thresholdMax": 40
  },
  {
    "level": 2,
    "name": "Intermediate",
    "description": "Can apply the skill independently in routine situations.",
    "exampleCriteria": "6+ months practical experience; can troubleshoot common issues.",
    "thresholdMin": 41,
    "thresholdMax": 65
  },
  {
    "level": 3,
    "name": "Advanced",
    "description": "Demonstrates deep expertise. Can handle complex scenarios and mentor others.",
    "exampleCriteria": "2+ years experience; recognized as go-to person; has mentored juniors.",
    "thresholdMin": 66,
    "thresholdMax": 85
  },
  {
    "level": 4,
    "name": "Expert",
    "description": "Industry-recognized authority. Drives innovation and sets best practices.",
    "exampleCriteria": "Speaks at conferences; authored standards; leads architectural decisions.",
    "thresholdMin": 86,
    "thresholdMax": 100
  }
]
```

**rating-weights.json**:
```json
{
  "selfRatingWeight": 0.20,
  "managerRatingWeight": 0.30,
  "peerRatingWeight": 0.15,
  "systemRatingWeight": 0.35
}
```

---

## Research Task 7: Dependency on Feature 001

**Context**: This feature depends on auth, guards, interceptor, and session store from Feature 001.

### Decision
Assume Feature 001 deliverables are available: `AuthGuard`, `RoleGuard`, `MockApiInterceptor` (extensible), `SessionState` (NgRx), `SidebarComponent` (role-filtered), `HeaderComponent`, login/logout flow, and the app shell.

### Dependencies Used
1. **AuthGuard + RoleGuard**: Applied to all `/admin/**` routes.
2. **MockApiInterceptor**: Extended with new admin URL patterns (not replaced).
3. **SessionState selector `selectUserRole`**: Used in components to conditionally render admin-only UI elements.
4. **SidebarComponent**: Already renders Admin menu items when role is Admin (from Feature 001's navigation config).
5. **ToastComponent / NotificationService**: Reused for success/error toasts on CRUD operations.

### No Conflicts
Feature 002 does not modify any Feature 001 files except the interceptor (additive extension only — new URL patterns added, no existing patterns changed).
