# Data Model: Skill Framework and Structure Management (Admin)

**Feature Branch**: `002-skill-framework-admin`  
**Date**: 2026-03-12  
**Source**: Feature spec + constitution + research.md

---

## Entity Relationship Diagram

```
┌─────────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐
│   SkillCategory     │1    * │    SubCategory        │1    * │   SkillDefinition     │
├─────────────────────┤───────├──────────────────────┤───────├───────────────────────┤
│ categoryId: string  │       │ subCategoryId: string│       │ skillId: string       │
│ categoryName: string│       │ subCategoryName: str  │       │ skillName: string     │
│ description?: string│       │ categoryId: string   │       │ categoryId: string    │
└─────────────────────┘       └──────────────────────┘       │ subCategoryId: string │
                                                              │ description: string   │
                                                              └───────────────────────┘

┌───────────────────────────┐       ┌────────────────────────────┐
│    ProficiencyLevel       │       │   RatingWeightConfig       │
├───────────────────────────┤       ├────────────────────────────┤
│ level: number (1-4)       │       │ selfRatingWeight: number   │
│ name: string (read-only)  │       │ managerRatingWeight: number│
│ description: string       │       │ peerRatingWeight: number   │
│ exampleCriteria: string   │       │ systemRatingWeight: number │
│ thresholdMin: number      │       └────────────────────────────┘
│ thresholdMax: number      │       Constraint: sum of all = 1.00
└───────────────────────────┘

┌──────────────────────────────────────────┐
│  EmployeeSkill (read-only reference)     │
├──────────────────────────────────────────┤
│ userId: string                           │
│ skills[].skillId: string → FK to         │
│   SkillDefinition.skillId                │
│ skills[].categoryId → FK to              │
│   SkillCategory.categoryId               │
└──────────────────────────────────────────┘
Used for delete guard checks only.
```

---

## Entities

### 1. SkillCategory

The top-level grouping for all skills in the framework.

```typescript
export interface SkillCategory {
  categoryId: string;
  categoryName: string;
  description?: string;
}
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `categoryId` | `string` | Required, unique, UUID format | Auto-generated on create |
| `categoryName` | `string` | Required, unique (case-insensitive), non-empty after trim | Max 100 chars |
| `description` | `string \| undefined` | Optional | Max 500 chars |

**Validation Rules**:
- `categoryName` must be unique across all categories (case-insensitive comparison).
- `categoryName` must not be empty or whitespace-only (trim before validation).
- On delete: system must check `employee-skills.json` for any employee skill entries with a matching `categoryId`. If found, deletion is blocked with "Cannot delete: skills are linked to this category".

**Pre-populated Data** (8 categories):
| categoryId | categoryName | description |
|------------|-------------|-------------|
| `cat-001` | Development | Software development skills across all platforms |
| `cat-002` | QA | Quality assurance and testing methodologies |
| `cat-003` | Cloud | Cloud platform and infrastructure skills |
| `cat-004` | DevOps | Development operations and automation |
| `cat-005` | Data Engineering | Data pipeline, storage, and processing |
| `cat-006` | AI/ML | Artificial intelligence and machine learning |
| `cat-007` | Communication | Professional communication skills |
| `cat-008` | Project Management | Project and program management skills |

---

### 2. SubCategory

A sub-grouping within a parent category.

```typescript
export interface SubCategory {
  subCategoryId: string;
  subCategoryName: string;
  categoryId: string; // FK → SkillCategory.categoryId
}
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `subCategoryId` | `string` | Required, unique, UUID format | Auto-generated on create |
| `subCategoryName` | `string` | Required, non-empty after trim | Max 100 chars |
| `categoryId` | `string` | Required, must reference existing SkillCategory | Foreign key |

**Validation Rules**:
- `subCategoryName` must not be empty or whitespace-only.
- `categoryId` must reference an existing category.
- On delete: check `skill-definitions` for any skills with matching `subCategoryId`. Block if skills exist with "Cannot delete: skill definitions exist under this subcategory".

**Pre-populated Data**:
| subCategoryId | subCategoryName | categoryId |
|--------------|----------------|------------|
| `sub-001` | Frontend | `cat-001` (Development) |
| `sub-002` | Backend | `cat-001` (Development) |
| `sub-003` | Mobile | `cat-001` (Development) |
| `sub-004` | AWS | `cat-003` (Cloud) |
| `sub-005` | Azure | `cat-003` (Cloud) |
| `sub-006` | Google Cloud | `cat-003` (Cloud) |
| `sub-007` | CI/CD | `cat-004` (DevOps) |
| `sub-008` | Containerization | `cat-004` (DevOps) |
| `sub-009` | Infrastructure | `cat-004` (DevOps) |

**Note on JSON Structure**: The constitution defines `skill-categories.json` with subcategories nested inside categories:
```jsonc
{
  "categoryId": "string",
  "categoryName": "string",
  "subCategories": [
    { "subCategoryId": "string", "subCategoryName": "string" }
  ]
}
```
The interceptor must flatten this into separate in-memory arrays for categories and subcategories to support independent CRUD. Subcategories carry a `categoryId` foreign key for the relationship.

---

### 3. SkillDefinition

An individual skill within a subcategory — the leaf node of the hierarchy.

```typescript
export interface SkillDefinition {
  skillId: string;
  skillName: string;
  categoryId: string;    // FK → SkillCategory.categoryId
  subCategoryId: string; // FK → SubCategory.subCategoryId
  description: string;
}
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `skillId` | `string` | Required, unique, UUID format | Auto-generated on create |
| `skillName` | `string` | Required, unique within same `subCategoryId` | Max 100 chars |
| `categoryId` | `string` | Required, must reference existing SkillCategory | Foreign key |
| `subCategoryId` | `string` | Required, must reference existing SubCategory | Foreign key |
| `description` | `string` | Required | Max 500 chars |

**Validation Rules**:
- `skillName` must be unique within the same `subCategoryId` (case-insensitive). The system rejects with "This skill already exists in this subcategory".
- `categoryId` and `subCategoryId` must reference existing entities.
- Cascading dropdown: selecting a category filters available subcategories; changing category resets subcategory and skill name fields.

**Pre-populated Data** (20+ skills):
| skillId | skillName | categoryId | subCategoryId |
|---------|-----------|------------|--------------|
| `skill-001` | React | `cat-001` | `sub-001` (Frontend) |
| `skill-002` | Angular | `cat-001` | `sub-001` (Frontend) |
| `skill-003` | Vue | `cat-001` | `sub-001` (Frontend) |
| `skill-004` | HTML | `cat-001` | `sub-001` (Frontend) |
| `skill-005` | CSS | `cat-001` | `sub-001` (Frontend) |
| `skill-006` | JavaScript | `cat-001` | `sub-001` (Frontend) |
| `skill-007` | TypeScript | `cat-001` | `sub-001` (Frontend) |
| `skill-008` | Java | `cat-001` | `sub-002` (Backend) |
| `skill-009` | Node.js | `cat-001` | `sub-002` (Backend) |
| `skill-010` | Python | `cat-001` | `sub-002` (Backend) |
| `skill-011` | .NET | `cat-001` | `sub-002` (Backend) |
| `skill-012` | Spring Boot | `cat-001` | `sub-002` (Backend) |
| `skill-013` | Flutter | `cat-001` | `sub-003` (Mobile) |
| `skill-014` | React Native | `cat-001` | `sub-003` (Mobile) |
| `skill-015` | Docker | `cat-004` | `sub-008` (Containerization) |
| `skill-016` | Kubernetes | `cat-004` | `sub-008` (Containerization) |
| `skill-017` | Jenkins | `cat-004` | `sub-007` (CI/CD) |
| `skill-018` | Terraform | `cat-004` | `sub-009` (Infrastructure) |
| `skill-019` | SQL | `cat-005` | Data Engineering (general) |
| `skill-020` | PostgreSQL | `cat-005` | Data Engineering (general) |
| `skill-021` | MongoDB | `cat-005` | Data Engineering (general) |
| `skill-022` | Redis | `cat-005` | Data Engineering (general) |

---

### 4. ProficiencyLevel

Defines a proficiency tier with scoring criteria. Fixed collection — 4 levels.

```typescript
export interface ProficiencyLevel {
  level: number;           // 1-4, read-only
  name: string;            // "Beginner" | "Intermediate" | "Advanced" | "Expert", read-only
  description: string;     // Editable by admin
  exampleCriteria: string; // Editable by admin
  thresholdMin: number;    // Display-only (0, 41, 66, 86)
  thresholdMax: number;    // Display-only (40, 65, 85, 100)
}
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `level` | `number` | 1–4, read-only | Cannot be modified |
| `name` | `string` | Fixed values, read-only | "Beginner", "Intermediate", "Advanced", "Expert" |
| `description` | `string` | Required, editable | Admin can update |
| `exampleCriteria` | `string` | Required, editable | Admin can update |
| `thresholdMin` | `number` | Display-only | Lower bound of score percentage |
| `thresholdMax` | `number` | Display-only | Upper bound of score percentage |

**Fixed Data**:
| level | name | thresholdMin | thresholdMax |
|-------|------|-------------|-------------|
| 1 | Beginner | 0 | 40 |
| 2 | Intermediate | 41 | 65 |
| 3 | Advanced | 66 | 85 |
| 4 | Expert | 86 | 100 |

---

### 5. RatingWeightConfig

Defines the weight distribution for the Final Rating formula.

```typescript
export interface RatingWeightConfig {
  selfRatingWeight: number;
  managerRatingWeight: number;
  peerRatingWeight: number;
  systemRatingWeight: number;
}
```

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `selfRatingWeight` | `number` | 0.00–1.00, step 0.01 | Default: 0.20 |
| `managerRatingWeight` | `number` | 0.00–1.00, step 0.01 | Default: 0.30 |
| `peerRatingWeight` | `number` | 0.00–1.00, step 0.01 | Default: 0.15 |
| `systemRatingWeight` | `number` | 0.00–1.00, step 0.01 | Default: 0.35 |

**Cross-field Validation Rule**:
- All four weights must sum to exactly 1.00 (with ±0.001 tolerance for floating-point precision).
- If sum ≠ 1.00, save is rejected with validation error: "Weights must sum to 1.00 (100%)".

**Session Persistence**:
- Changes persist in-memory during the session only.
- On page refresh, weights reset to defaults from `rating-weights.json`.

---

### 6. EmployeeSkill (Reference Entity — Read-Only)

Used for delete guard checks. Not managed by this feature.

```typescript
// From employee-skills.json — already defined in Feature 001
export interface EmployeeSkillEntry {
  userId: string;
  skills: Array<{
    skillId: string;
    // ... other fields not relevant to this feature
  }>;
}
```

**Usage in This Feature**:
- On category delete: scan all employee skill entries for any `skillId` that maps (via `skill-definitions`) to the target `categoryId`.
- On subcategory delete: scan all skill definitions for any with matching `subCategoryId`. If definitions exist, block deletion.

---

## NgRx State Shape

```typescript
// src/app/core/store/admin/admin.state.ts

import { EntityState } from '@ngrx/entity';

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

### Entity Adapters

```typescript
export const categoryAdapter = createEntityAdapter<SkillCategory>({
  selectId: (cat) => cat.categoryId,
  sortComparer: (a, b) => a.categoryName.localeCompare(b.categoryName),
});

export const subcategoryAdapter = createEntityAdapter<SubCategory>({
  selectId: (sub) => sub.subCategoryId,
  sortComparer: (a, b) => a.subCategoryName.localeCompare(b.subCategoryName),
});

export const skillDefinitionAdapter = createEntityAdapter<SkillDefinition>({
  selectId: (skill) => skill.skillId,
  sortComparer: (a, b) => a.skillName.localeCompare(b.skillName),
});
```

### Key Selectors

| Selector | Returns | Used By |
|----------|---------|---------|
| `selectAllCategories` | `SkillCategory[]` | Categories list, skill form dropdown |
| `selectCategoryById(id)` | `SkillCategory \| undefined` | Category edit dialog |
| `selectAllSubcategories` | `SubCategory[]` | Subcategories list |
| `selectSubcategoriesByCategoryId(id)` | `SubCategory[]` | Filtered subcategory list, cascading dropdown |
| `selectAllSkillDefinitions` | `SkillDefinition[]` | Skills list |
| `selectSkillsBySubcategoryId(id)` | `SkillDefinition[]` | Filtered skills, uniqueness validation |
| `selectSkillsGroupedByCategoryAndSub` | `GroupedSkills` | Skills grouped display |
| `selectProficiencyLevels` | `ProficiencyLevel[]` | Proficiency framework table |
| `selectRatingWeights` | `RatingWeightConfig` | Rating config form |
| `selectAdminLoading` | `boolean` | Loading spinners |
| `selectAdminError` | `string \| null` | Error display |

---

## State Transitions

### Category Lifecycle

```
[Initial Load] → GET /api/admin/categories → loadCategoriesSuccess → state populated
[Add]          → POST /api/admin/categories → addCategorySuccess → entity added
[Edit]         → PUT /api/admin/categories/:id → updateCategorySuccess → entity updated
[Delete]       → DELETE /api/admin/categories/:id
                  ├── (no linked skills) → deleteCategorySuccess → entity removed
                  └── (linked skills)    → deleteCategoryFailure → error toast
```

### Subcategory Lifecycle

```
[Initial Load] → GET /api/admin/subcategories → loadSubcategoriesSuccess → state populated
[Add]          → POST /api/admin/subcategories → addSubcategorySuccess → entity added
[Edit]         → PUT /api/admin/subcategories/:id → updateSubcategorySuccess → entity updated
[Delete]       → DELETE /api/admin/subcategories/:id
                  ├── (no child skills) → deleteSubcategorySuccess → entity removed
                  └── (child skills)    → deleteSubcategoryFailure → error toast
```

### Skill Definition Lifecycle

```
[Initial Load] → GET /api/admin/skill-definitions → loadSkillsSuccess → state populated
[Add]          → POST /api/admin/skill-definitions → addSkillSuccess → entity added
[Edit]         → PUT /api/admin/skill-definitions/:id → updateSkillSuccess → entity updated
```

### Proficiency Level Lifecycle

```
[Initial Load] → GET /api/admin/proficiency-levels → loadProficiencySuccess → state populated
[Edit]         → PUT /api/admin/proficiency-levels/:level → updateProficiencySuccess → level updated
```

### Rating Weight Lifecycle

```
[Initial Load] → GET /api/admin/rating-weights → loadRatingWeightsSuccess → state populated
[Save]         → PUT /api/admin/rating-weights
                  ├── (sum = 1.00) → updateRatingWeightsSuccess → config updated + success toast
                  └── (sum ≠ 1.00) → updateRatingWeightsFailure → validation error toast
[Refresh]      → Weights reset to defaults from JSON file
```
