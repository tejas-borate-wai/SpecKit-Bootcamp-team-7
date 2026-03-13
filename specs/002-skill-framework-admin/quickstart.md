# Quickstart: Skill Framework and Structure Management (Admin)

**Feature Branch**: `002-skill-framework-admin`  
**Prerequisite**: Feature 001 (Mock Auth, RBAC, Navigation) must be implemented first.

---

## Prerequisites

1. Angular 17+ project initialized with Angular CLI
2. Feature 001 deliverables in place:
   - `AuthGuard` and `RoleGuard` in `src/app/core/auth/`
   - `MockApiInterceptor` in `src/app/core/interceptors/`
   - `SessionState` NgRx store slice in `src/app/core/store/session/`
   - Sidebar and Header components with role-based rendering
   - Login/logout flow working with mock users
3. `@ngrx/entity` package installed (`ng add @ngrx/entity` or `npm install @ngrx/entity`)
4. Angular Material or PrimeNG installed and configured

---

## Implementation Order

### Step 1: TypeScript Interfaces (Models)

Create the shared interfaces used across the feature:

```
src/app/shared/models/
├── skill-category.model.ts       → SkillCategory, SubCategory
├── skill-definition.model.ts     → SkillDefinition
├── proficiency-level.model.ts    → ProficiencyLevel
└── rating-weight.model.ts        → RatingWeightConfig
```

### Step 2: Mock Data Files

Add or verify these JSON files in `/assets/mock-data/`:

- `skill-categories.json` — 8 categories with nested subcategories (may already exist)
- `skill-definitions.json` — 20+ skills with categoryId and subCategoryId (may already exist)
- `proficiency-levels.json` — 4 proficiency levels (NEW)
- `rating-weights.json` — Default weight config (NEW)

### Step 3: Extend MockApiInterceptor

Add URL pattern handlers for all `/api/admin/*` endpoints:
- Categories CRUD (GET, POST, PUT, DELETE with guard)
- Subcategories CRUD (GET, POST, PUT, DELETE with guard)
- Skill Definitions CRUD (GET, POST, PUT)
- Proficiency Levels (GET, PUT)
- Rating Weights (GET, PUT with sum validation)

See [contracts/admin-api-contract.md](contracts/admin-api-contract.md) for full endpoint specs.

### Step 4: NgRx Admin Store

Create the admin feature state slice:

```
src/app/core/store/admin/
├── admin.actions.ts       → All admin CRUD actions
├── admin.reducer.ts       → EntityAdapter reducers for categories/subcategories/skills
├── admin.effects.ts       → Effects handling HTTP calls via interceptor
└── admin.selectors.ts     → Memoized selectors including filtered/grouped queries
```

Register the admin store in admin routes using `provideState('admin', adminReducer)` and `provideEffects(AdminEffects)`.

### Step 5: Admin Feature Routes

Create admin sub-routes with lazy loading:

```typescript
// src/app/features/admin/admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: 'skill-framework/categories', loadComponent: () => import('./categories/categories.component').then(c => c.CategoriesComponent) },
  { path: 'skill-framework/subcategories', loadComponent: () => import('./subcategories/subcategories.component').then(c => c.SubcategoriesComponent) },
  { path: 'skill-framework/skills', loadComponent: () => import('./skill-definitions/skill-definitions.component').then(c => c.SkillDefinitionsComponent) },
  { path: 'proficiency-framework', loadComponent: () => import('./proficiency-framework/proficiency-framework.component').then(c => c.ProficiencyFrameworkComponent) },
  { path: 'rating-config', loadComponent: () => import('./rating-config/rating-config.component').then(c => c.RatingConfigComponent) },
];
```

Register in `app.routes.ts`:
```typescript
{ path: 'admin', canActivate: [AuthGuard, RoleGuard], data: { roles: ['Admin'] }, loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) }
```

### Step 6: Admin Components

Build each screen component (all standalone):

1. **CategoriesComponent** — List + Add/Edit dialogs + Delete with guard
2. **SubcategoriesComponent** — Grouped list + Add/Edit dialogs
3. **SkillDefinitionsComponent** — Grouped list + Add/Edit with cascading dropdowns
4. **ProficiencyFrameworkComponent** — Table with inline row editing
5. **RatingConfigComponent** — Sliders/inputs + real-time sum + save validation

### Step 7: Unit Tests

Test coverage areas:
- Category uniqueness validation (add + edit)
- Category delete guard (linked vs unlinked skills)
- Subcategory delete guard (linked skill definitions)
- Skill uniqueness within subcategory
- Rating weight sum-to-1.00 validation
- Cascading dropdown reset behavior
- RoleGuard on admin routes (non-admin → redirect)
- Interceptor URL routing for admin endpoints

---

## Verification Checklist

- [ ] Login as Admin → navigate to /admin/skill-framework/categories → see 8 categories
- [ ] Add a new category with unique name → appears in list + success toast
- [ ] Add category with duplicate name → validation error shown
- [ ] Delete category with no linked skills → removed + success toast
- [ ] Delete category with linked skills → error message shown, deletion blocked
- [ ] Navigate to subcategories → see grouped by parent category
- [ ] Add subcategory under a category → appears under correct parent
- [ ] Navigate to skill definitions → see grouped by category/subcategory
- [ ] Add skill with cascading Category → Subcategory → Skill Name
- [ ] Add duplicate skill name in same subcategory → error shown
- [ ] Edit proficiency level description → updated in table
- [ ] Level name and score fields are read-only
- [ ] Adjust rating weights → real-time sum updates
- [ ] Save weights summing to 1.00 → success
- [ ] Save weights not summing to 1.00 → validation error
- [ ] Refresh page → weights reset to defaults
- [ ] Login as Employee → navigate to /admin/** → redirected to /unauthorized
- [ ] Login as Manager → navigate to /admin/** → redirected to /unauthorized
