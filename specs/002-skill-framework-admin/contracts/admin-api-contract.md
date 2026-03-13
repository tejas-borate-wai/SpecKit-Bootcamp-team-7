# Mock API Contract: Admin Skill Framework & Rating Configuration

**Feature Branch**: `002-skill-framework-admin`  
**Date**: 2026-03-12  
**Protocol**: Angular HttpClient → MockApiInterceptor → In-Memory JSON  
**Auth**: All endpoints require `Admin` role (interceptor returns 403 otherwise)

---

## Overview

All endpoints are handled by the `MockApiInterceptor`. Requests go through Angular `HttpClient`, are intercepted by URL pattern matching, and resolved against in-memory copies of JSON files. Simulated latency: 50–200ms.

---

## Endpoints

### 1. Categories

#### GET /api/admin/categories

Returns all skill categories.

**Request**: No body  
**Response** `200 OK`:
```json
[
  {
    "categoryId": "cat-001",
    "categoryName": "Development",
    "description": "Software development skills across all platforms"
  }
]
```

---

#### POST /api/admin/categories

Creates a new skill category.

**Request Body**:
```json
{
  "categoryName": "New Category",
  "description": "Description of the new category"
}
```

**Response** `201 Created`:
```json
{
  "categoryId": "cat-009",
  "categoryName": "New Category",
  "description": "Description of the new category"
}
```

**Error** `409 Conflict` (duplicate name):
```json
{
  "error": "A category with this name already exists"
}
```

**Validation**: `categoryName` uniqueness is case-insensitive. Whitespace-only names are rejected with `400 Bad Request`.

---

#### PUT /api/admin/categories/:categoryId

Updates an existing category.

**Request Body**:
```json
{
  "categoryName": "Updated Name",
  "description": "Updated description"
}
```

**Response** `200 OK`:
```json
{
  "categoryId": "cat-001",
  "categoryName": "Updated Name",
  "description": "Updated description"
}
```

**Error** `409 Conflict` (duplicate name — another category has this name):
```json
{
  "error": "A category with this name already exists"
}
```

**Error** `404 Not Found`:
```json
{
  "error": "Category not found"
}
```

---

#### DELETE /api/admin/categories/:categoryId

Deletes a category if no employee skills are linked to it.

**Response** `200 OK`:
```json
{
  "message": "Category deleted successfully"
}
```

**Error** `409 Conflict` (skills linked):
```json
{
  "error": "Cannot delete: skills are linked to this category"
}
```

**Guard Logic**: The interceptor checks `employee-skills` in-memory data. For each employee's skill entries, it resolves the `skillId` to its `categoryId` via `skill-definitions`. If any match the target category, deletion is blocked.

---

### 2. Subcategories

#### GET /api/admin/subcategories

Returns all subcategories with their parent `categoryId`.

**Response** `200 OK`:
```json
[
  {
    "subCategoryId": "sub-001",
    "subCategoryName": "Frontend",
    "categoryId": "cat-001"
  }
]
```

**Note**: The interceptor flattens the nested `subCategories` array from `skill-categories.json` into a flat array of objects with `categoryId` added.

---

#### POST /api/admin/subcategories

Creates a new subcategory under a parent category.

**Request Body**:
```json
{
  "subCategoryName": "New Subcategory",
  "categoryId": "cat-001"
}
```

**Response** `201 Created`:
```json
{
  "subCategoryId": "sub-010",
  "subCategoryName": "New Subcategory",
  "categoryId": "cat-001"
}
```

**Error** `404 Not Found` (invalid categoryId):
```json
{
  "error": "Parent category not found"
}
```

---

#### PUT /api/admin/subcategories/:subCategoryId

Updates a subcategory name.

**Request Body**:
```json
{
  "subCategoryName": "Updated Name"
}
```

**Response** `200 OK`:
```json
{
  "subCategoryId": "sub-001",
  "subCategoryName": "Updated Name",
  "categoryId": "cat-001"
}
```

---

#### DELETE /api/admin/subcategories/:subCategoryId

Deletes a subcategory if no skill definitions exist under it.

**Response** `200 OK`:
```json
{
  "message": "Subcategory deleted successfully"
}
```

**Error** `409 Conflict` (skill definitions exist):
```json
{
  "error": "Cannot delete: skill definitions exist under this subcategory"
}
```

**Guard Logic**: Check `skill-definitions` in-memory array for any entries with matching `subCategoryId`.

---

### 3. Skill Definitions

#### GET /api/admin/skill-definitions

Returns all skill definitions.

**Response** `200 OK`:
```json
[
  {
    "skillId": "skill-001",
    "skillName": "React",
    "categoryId": "cat-001",
    "subCategoryId": "sub-001",
    "description": "A JavaScript library for building user interfaces"
  }
]
```

---

#### POST /api/admin/skill-definitions

Creates a new skill definition.

**Request Body**:
```json
{
  "skillName": "New Skill",
  "categoryId": "cat-001",
  "subCategoryId": "sub-001",
  "description": "Description of the new skill"
}
```

**Response** `201 Created`:
```json
{
  "skillId": "skill-023",
  "skillName": "New Skill",
  "categoryId": "cat-001",
  "subCategoryId": "sub-001",
  "description": "Description of the new skill"
}
```

**Error** `409 Conflict` (duplicate within subcategory):
```json
{
  "error": "This skill already exists in this subcategory"
}
```

**Validation**: `skillName` uniqueness is checked within the same `subCategoryId` only (case-insensitive). A skill with the same name in a different subcategory is allowed.

---

#### PUT /api/admin/skill-definitions/:skillId

Updates a skill definition.

**Request Body**:
```json
{
  "skillName": "Updated Skill Name",
  "description": "Updated description"
}
```

**Response** `200 OK`:
```json
{
  "skillId": "skill-001",
  "skillName": "Updated Skill Name",
  "categoryId": "cat-001",
  "subCategoryId": "sub-001",
  "description": "Updated description"
}
```

**Error** `409 Conflict` (duplicate name in same subcategory):
```json
{
  "error": "This skill already exists in this subcategory"
}
```

---

### 4. Proficiency Levels

#### GET /api/admin/proficiency-levels

Returns all four proficiency levels.

**Response** `200 OK`:
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

---

#### PUT /api/admin/proficiency-levels/:level

Updates the description and/or example criteria for a proficiency level.

**URL Parameter**: `:level` — numeric level (1, 2, 3, or 4)

**Request Body**:
```json
{
  "description": "Updated description text",
  "exampleCriteria": "Updated criteria text"
}
```

**Response** `200 OK`:
```json
{
  "level": 1,
  "name": "Beginner",
  "description": "Updated description text",
  "exampleCriteria": "Updated criteria text",
  "thresholdMin": 0,
  "thresholdMax": 40
}
```

**Note**: `level`, `name`, `thresholdMin`, and `thresholdMax` are read-only and ignored if sent in the request body.

---

### 5. Rating Weights

#### GET /api/admin/rating-weights

Returns the current rating weight configuration.

**Response** `200 OK`:
```json
{
  "selfRatingWeight": 0.20,
  "managerRatingWeight": 0.30,
  "peerRatingWeight": 0.15,
  "systemRatingWeight": 0.35
}
```

---

#### PUT /api/admin/rating-weights

Updates the rating weight configuration.

**Request Body**:
```json
{
  "selfRatingWeight": 0.25,
  "managerRatingWeight": 0.25,
  "peerRatingWeight": 0.20,
  "systemRatingWeight": 0.30
}
```

**Response** `200 OK`:
```json
{
  "selfRatingWeight": 0.25,
  "managerRatingWeight": 0.25,
  "peerRatingWeight": 0.20,
  "systemRatingWeight": 0.30
}
```

**Error** `400 Bad Request` (sum ≠ 1.00):
```json
{
  "error": "Weights must sum to 1.00 (100%). Current sum: 0.95"
}
```

**Validation**: All four values must be between 0.00 and 1.00. Their sum must equal 1.00 (±0.001 tolerance for floating-point).

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | Used When |
|------|---------|-----------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Invalid input (empty name, invalid weight values) |
| `403` | Forbidden | Non-Admin user attempts access |
| `404` | Not Found | Entity with given ID does not exist |
| `409` | Conflict | Uniqueness violation or delete guard triggered |

---

## Interceptor Behavior Notes

1. **Simulated Latency**: All responses are delayed by 50–200ms (`delay(Math.random() * 150 + 50)`) to simulate network latency.
2. **Role Enforcement**: Before processing any `/api/admin/*` request, the interceptor checks the current session role from the in-memory session state. Returns 403 if role ≠ Admin.
3. **ID Generation**: On POST operations, the interceptor generates a new ID (e.g., `cat-XXX`, `sub-XXX`, `skill-XXX`) using a simple counter or UUID utility.
4. **In-Memory Mutation**: All POST, PUT, DELETE operations mutate the in-memory arrays. Original JSON files are never modified. Data resets on page refresh.
5. **Case-Insensitive Comparison**: All uniqueness checks (category names, skill names within subcategory) use `toLowerCase()` comparison.
