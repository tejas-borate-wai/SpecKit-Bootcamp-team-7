# API Contract: Employee Skills & Dashboard Mock Interceptor

**Feature**: 003-employee-skill-profile-dashboard  
**Date**: 2026-03-12  
**Type**: Internal HTTP Interceptor (MockApiInterceptor — extension)

This contract defines the HTTP request/response interface for employee skill CRUD operations, test attempt queries, and dashboard data retrieval. All endpoints are handled by the existing `MockApiInterceptor` from Phase 1, extended with new URL patterns.

---

## Endpoints

### GET /api/employee-skills/:userId

**Purpose**: Retrieve all skills for a specific employee (including soft-deleted for history).

**Request**: No body. `userId` from URL path.

**Success Response** (200):
```json
{
  "userId": "string",
  "skills": [
    {
      "skillId": "string",
      "selfRating": 3,
      "managerRating": null,
      "peerRating": null,
      "systemRating": 2.8,
      "finalRating": 2.9,
      "level": "Advanced",
      "status": "Approved",
      "lastUpdated": "2026-01-15",
      "isDeleted": false
    }
  ]
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 403 | Employee/Manager requesting another user's data (non-admin) | `{ "message": "You do not have permission to perform this action." }` |
| 404 | userId not found in employee-skills.json | `{ "message": "Employee not found." }` |

**Interceptor Logic**:
1. Extract `userId` from URL
2. Check RBAC: if session role is Employee or Manager AND `userId !== sessionUser.id`, return 403
3. Find record in `employee-skills.json` where `record.userId === userId`
4. Return full record (including soft-deleted skills — client filters by `isDeleted`)

---

### POST /api/employee-skills/:userId/skills

**Purpose**: Add a new skill to an employee's profile.

**Request**:
```json
{
  "skillId": "string",
  "selfRating": 2
}
```

**Success Response** (201):
```json
{
  "skillId": "string",
  "selfRating": 2,
  "managerRating": null,
  "peerRating": null,
  "systemRating": null,
  "finalRating": null,
  "level": "Beginner",
  "status": "Draft",
  "lastUpdated": "2026-03-12T10:30:00Z",
  "isDeleted": false
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | Missing skillId or selfRating | `{ "message": "Skill ID and self-rating are required." }` |
| 409 | Skill already exists in profile (non-deleted) | `{ "message": "This skill is already in your profile." }` |
| 403 | Non-admin adding skill to another user's profile | `{ "message": "You do not have permission to perform this action." }` |

**Interceptor Logic**:
1. Extract `userId` from URL, parse request body
2. RBAC check: Employee/Manager can only add to own profile; Admin can add to any
3. Check if `skillId` already exists in user's skills array with `isDeleted === false` → 409
4. Create new `EmployeeSkill` object with defaults (null ratings, "Draft" status, current date)
5. Push to in-memory `employee-skills` array for the user
6. Return new skill object with 201

---

### PUT /api/employee-skills/:userId/skills/:skillId

**Purpose**: Update a skill's self-rating.

**Request**:
```json
{
  "selfRating": 3
}
```

**Success Response** (200):
```json
{
  "skillId": "string",
  "selfRating": 3,
  "managerRating": null,
  "peerRating": null,
  "systemRating": 2.8,
  "finalRating": null,
  "level": "Advanced",
  "status": "Approved",
  "lastUpdated": "2026-03-12T11:00:00Z",
  "isDeleted": false
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | selfRating not in 1–4 range | `{ "message": "Self-rating must be between 1 and 4." }` |
| 403 | Non-admin editing another user's skill | `{ "message": "You do not have permission to perform this action." }` |
| 404 | Skill not found in user's profile | `{ "message": "Skill not found." }` |

**Interceptor Logic**:
1. Extract `userId` and `skillId` from URL
2. RBAC check
3. Find skill in user's array where `skill.skillId === skillId && !skill.isDeleted`
4. Update `selfRating`, set `lastUpdated` to current datetime
5. If skill was "Stale", updating the rating clears it back to previous status (Approved)
6. Return updated skill

---

### DELETE /api/employee-skills/:userId/skills/:skillId

**Purpose**: Soft-delete a skill from the employee's active profile.

**Request**: No body.

**Success Response** (200):
```json
{
  "message": "Skill removed from active profile.",
  "skillId": "string"
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 403 | Non-admin deleting another user's skill | `{ "message": "You do not have permission to perform this action." }` |
| 404 | Skill not found | `{ "message": "Skill not found." }` |
| 409 | Skill linked to an active project | `{ "message": "This skill is linked to an active project and cannot be deleted." }` |

**Interceptor Logic**:
1. Extract `userId` and `skillId` from URL
2. RBAC check
3. Find skill in user's array
4. Check `project-assignments.json`: if any assignment exists where `assignment.userId === userId` AND the assigned project (from `projects.json`) has `status !== 'Completed'` AND the project's `requiredSkills` includes `skillId` → return 409
5. Set `skill.isDeleted = true` (soft delete — skill remains in array for history)
6. Return success

---

### GET /api/skill-test-attempts/:userId

**Purpose**: Retrieve all test attempts for a specific employee.

**Request**: No body.

**Success Response** (200):
```json
[
  {
    "attemptId": "string",
    "userId": "string",
    "skillId": "string",
    "score": 72,
    "earnedPoints": 18,
    "maxPoints": 25,
    "date": "2025-11-15T14:30:00Z",
    "timeTaken": 540
  }
]
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 403 | Non-admin requesting another user's attempts | `{ "message": "You do not have permission to perform this action." }` |

**Interceptor Logic**:
1. Extract `userId` from URL
2. RBAC check: Employee/Manager own data only; Admin any user
3. Filter `skill-test-attempts.json` where `attempt.userId === userId`
4. Return sorted by date ascending

---

### GET /api/skill-test-attempts/:userId/:skillId

**Purpose**: Retrieve test attempts for a specific skill of an employee.

**Request**: No body.

**Success Response** (200):
```json
[
  {
    "attemptId": "string",
    "userId": "string",
    "skillId": "string",
    "score": 60,
    "earnedPoints": 12,
    "maxPoints": 20,
    "date": "2025-08-10T09:15:00Z",
    "timeTaken": 480
  },
  {
    "attemptId": "string",
    "userId": "string",
    "skillId": "string",
    "score": 72,
    "earnedPoints": 18,
    "maxPoints": 25,
    "date": "2025-11-15T14:30:00Z",
    "timeTaken": 540
  }
]
```

**Interceptor Logic**:
1. Extract `userId` and `skillId` from URL
2. RBAC check
3. Filter attempts by both `userId` AND `skillId`
4. Return sorted by date ascending (for progress chart chronological order)

---

### GET /api/skill-categories

**Purpose**: Retrieve all skill categories with subcategories (for Add Skill cascading dropdowns).

**Request**: No body.

**Success Response** (200):
```json
[
  {
    "categoryId": "cat-001",
    "categoryName": "Development",
    "subCategories": [
      { "subCategoryId": "sub-001", "subCategoryName": "Frontend" },
      { "subCategoryId": "sub-002", "subCategoryName": "Backend" }
    ]
  }
]
```

**Interceptor Logic**: Return full `skill-categories.json` array. No RBAC restriction (read-only, all roles).

---

### GET /api/skill-definitions

**Purpose**: Retrieve all skill definitions (for Add Skill dropdown).

**Request**: No body. Supports optional query param `?subCategoryId=xxx` for filtering.

**Success Response** (200):
```json
[
  {
    "skillId": "skill-001",
    "skillName": "Angular",
    "categoryId": "cat-001",
    "subCategoryId": "sub-001",
    "description": "Angular web framework"
  }
]
```

**Interceptor Logic**:
1. Return full `skill-definitions.json` array (or filtered by `subCategoryId` if query param present)
2. No RBAC restriction (read-only, all roles)

---

### GET /api/certifications?userId=:userId

**Purpose**: Retrieve certifications for a user (for certified badge display on skill detail).

**Request**: No body. `userId` as query parameter.

**Success Response** (200):
```json
[
  {
    "certId": "cert-001",
    "userId": "user-001",
    "skillId": "skill-001",
    "certName": "AWS Certified Developer",
    "issuingOrg": "Amazon Web Services",
    "issueDate": "2025-06-01",
    "expiryDate": "2028-06-01",
    "filePath": "/assets/certs/aws-cert.pdf"
  }
]
```

**Interceptor Logic**:
1. Filter `certifications.json` by `userId`
2. RBAC: Employee/Manager see own; Admin sees all

---

### GET /api/employee-skills

**Purpose**: Retrieve all employee skill records (for Manager/Admin dashboards).

**Request**: No body.

**Success Response** (200):
```json
[
  {
    "userId": "user-001",
    "skills": [ /* EmployeeSkill[] */ ]
  },
  {
    "userId": "user-002",
    "skills": [ /* EmployeeSkill[] */ ]
  }
]
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 403 | Employee role requesting | `{ "message": "You do not have permission to perform this action." }` |

**Interceptor Logic**:
1. RBAC check: Manager and Admin only
2. Manager: filter to team members only (same department)
3. Admin: return all records
4. Return full `employee-skills.json` array (filtered as appropriate)

---

## Simulated Latency

All endpoints simulated with 50–200ms delay via RxJS `delay()` operator, matching the Phase 1 interceptor pattern.

## Error Response Format

All error responses follow the standard format:
```json
{
  "message": "Human-readable error description"
}
```

Mapped to `HttpErrorResponse` with appropriate HTTP status code in the interceptor.
