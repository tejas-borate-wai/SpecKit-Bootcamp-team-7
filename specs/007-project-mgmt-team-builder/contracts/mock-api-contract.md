# Mock API Contract: Project Management, Candidate Matching & Team Builder

**Feature**: 007-project-mgmt-team-builder  
**Date**: 2026-03-13  
**Status**: Complete  
**Transport**: Angular HttpClient → MockApiInterceptor (in-memory, no real backend)

---

## Overview

All endpoints are intercepted by `MockApiInterceptor` and resolved against in-memory copies of `projects.json` and `project-assignments.json`. CRUD operations persist for the browser session only; data resets on page refresh. The interceptor enforces RBAC — returns HTTP 403 for unauthorized actions.

---

## Endpoints

### 1. Projects CRUD

#### GET /api/projects

**Description**: Retrieve all projects.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Query Parameters**: None (filtering done client-side via NgRx selectors)

**Response** `200 OK`:
```json
[
  {
    "projectId": "proj-001",
    "name": "Banking App Modernization",
    "description": "Modernize legacy banking app",
    "status": "Open",
    "startDate": "2026-02-01",
    "deadline": "2026-08-31",
    "requiredSkills": [
      { "skillId": "skill-angular", "minimumLevel": 3 },
      { "skillId": "skill-typescript", "minimumLevel": 2 }
    ],
    "requiredRoles": [
      { "roleTitle": "Frontend Developer", "headcount": 2 },
      { "roleTitle": "QA Engineer", "headcount": 1 }
    ],
    "createdBy": "user-mgr-01",
    "createdDate": "2026-01-15"
  }
]
```

---

#### GET /api/projects/:projectId

**Description**: Retrieve a single project by ID.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])

**Response** `200 OK`: Single Project object (same schema as list item above).  
**Response** `404 Not Found`: `{ "error": "Project not found." }`

---

#### POST /api/projects

**Description**: Create a new project.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])

**Request Body**:
```json
{
  "name": "AI Recommendation Engine",
  "description": "Build an AI-powered recommendation system",
  "status": "Draft",
  "startDate": "2026-04-01",
  "deadline": "2026-10-31",
  "requiredSkills": [
    { "skillId": "skill-python", "minimumLevel": 3 },
    { "skillId": "skill-docker", "minimumLevel": 2 }
  ],
  "requiredRoles": [
    { "roleTitle": "ML Engineer", "headcount": 2 },
    { "roleTitle": "Backend Developer", "headcount": 1 }
  ]
}
```

**Interceptor Logic**:
1. Auto-generate `projectId` (UUID)
2. Auto-set `createdBy` from session user ID
3. Auto-set `createdDate` to current date
4. Check for duplicate `name` (case-insensitive) → 409 if conflict
5. Validate `startDate` < `deadline` → 400 if invalid
6. Validate `requiredSkills.length >= 1` → 400 if empty

**Response** `201 Created`: Full Project object with generated fields.  
**Response** `400 Bad Request`: `{ "error": "Start date must be before deadline." }` or `{ "error": "Add at least one required skill to create a project." }`  
**Response** `409 Conflict`: `{ "error": "A project with this name already exists." }`  
**Response** `403 Forbidden`: `{ "error": "You do not have permission to perform this action." }`

---

#### PUT /api/projects/:projectId

**Description**: Update an existing project.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Ownership**: Manager can update only own projects (`createdBy === session.userId`). Admin can update any.

**Request Body**: Full Project object (same schema as POST, with `projectId` in URL).

**Interceptor Logic**:
1. Find project by `projectId` → 404 if not found
2. Check ownership (Manager) or admin role → 403 if unauthorized
3. Validate same rules as POST (duplicate name excluding self, date logic, skills)
4. If `status` changed to `Completed` → trigger availability reset for all assigned employees

**Response** `200 OK`: Updated Project object.  
**Response** `403 Forbidden`: `{ "error": "You do not have permission to perform this action." }`  
**Response** `404 Not Found`: `{ "error": "Project not found." }`  
**Response** `409 Conflict`: `{ "error": "A project with this name already exists." }`

---

#### DELETE /api/projects/:projectId

**Description**: Delete a project.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Ownership**: Manager can delete only own projects. Admin can delete any.

**Interceptor Logic**:
1. Find project by `projectId` → 404 if not found
2. Check ownership (Manager) or admin role → 403 if unauthorized
3. Remove all associated `ProjectAssignment` records
4. Reset availability to `Available` for all previously assigned employees

**Response** `200 OK`: `{ "message": "Project deleted successfully." }`  
**Response** `403 Forbidden`: `{ "error": "You do not have permission to perform this action." }`  
**Response** `404 Not Found`: `{ "error": "Project not found." }`

---

### 2. Project Assignments

#### GET /api/project-assignments

**Description**: Retrieve all project assignments.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Query Parameters**:
- `projectId` (optional): Filter by project

**Response** `200 OK`:
```json
[
  {
    "assignmentId": "assign-001",
    "projectId": "proj-001",
    "userId": "user-emp-01",
    "role": "Frontend Developer",
    "assignedDate": "2026-02-05"
  }
]
```

---

#### POST /api/project-assignments

**Description**: Assign an employee to a project role.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])

**Request Body**:
```json
{
  "projectId": "proj-001",
  "userId": "user-emp-03",
  "role": "Frontend Developer"
}
```

**Interceptor Logic**:
1. Auto-generate `assignmentId` (UUID)
2. Auto-set `assignedDate` to current date
3. Validate project exists → 404 if not found
4. Validate role matches a `roleTitle` in project's `requiredRoles`
5. Validate role slot not full (`filledCount < headcount`)
6. Validate employee not already assigned to another active project
7. Set employee availability to `Busy`

**Response** `201 Created`: Full ProjectAssignment object.  
**Response** `400 Bad Request`: `{ "error": "Role slot is already full." }` or `{ "error": "Employee is already assigned to another active project." }`  
**Response** `404 Not Found`: `{ "error": "Project not found." }`

---

#### DELETE /api/project-assignments/:assignmentId

**Description**: Remove an employee from a project.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])

**Interceptor Logic**:
1. Find assignment by `assignmentId` → 404 if not found
2. Remove assignment
3. If employee has no other active assignments → set availability to `Available`

**Response** `200 OK`: `{ "message": "Assignment removed successfully." }`  
**Response** `404 Not Found`: `{ "error": "Assignment not found." }`

---

### 3. Candidate Matching (Client-Side)

Candidate matching is computed entirely client-side — no dedicated API endpoint. The matching service reads from the NgRx store (which is populated from `/api/employee-skills`, `/api/users`, `/api/certifications`, `/api/skill-definitions`).

**Computation Flow**:
```
1. Load project's requiredSkills from projects store
2. Load all employees from users store (filter by Manager's team or all for Admin)
3. Load all employee-skills from skills store
4. For each employee:
   a. Exclude stale skills (lastUpdated > 6 months ago)
   b. Compare each required skill against employee's non-stale skills
   c. Calculate matchScore = (matchedCount / totalRequired) × 100
   d. Determine availability from project-assignments store
5. Rank candidates: score desc → availability order → alpha name
6. Apply filters (department, availability, min score)
```

---

### 4. Availability Management (Client-Side)

Availability is derived from project-assignments data and overrides stored in NgRx:

**Default Derivation**:
- Employee has active project assignment → `Busy`
- Employee has no active assignment and no override → `Available`
- Employee or Manager set override → use override status

**Override Endpoint (Mock)**:

#### PATCH /api/users/:userId/availability

**Description**: Manager override of employee availability.  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])

**Request Body**:
```json
{
  "status": "Partially Available",
  "reason": "Employee attending training half-day"
}
```

**Response** `200 OK`: `{ "userId": "user-emp-03", "status": "Partially Available" }`

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": "Human-readable error message"
}
```

**HTTP Status Codes Used**:

| Code | Meaning | Triggers |
|---|---|---|
| 200 | Success | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation failures (dates, missing skills) |
| 403 | Forbidden | Insufficient role or ownership violation |
| 404 | Not Found | Resource ID not found |
| 409 | Conflict | Duplicate project name |

---

## Data Dependencies (Cross-Feature)

| Endpoint | Depends On | Provided By |
|---|---|---|
| Candidate matching | `/api/employee-skills` | Phase 3 (Skill Profile) |
| Candidate matching | `/api/users` | Phase 1 (Auth) |
| Candidate matching | `/api/skill-definitions` | Phase 2 (Skill Framework) |
| Candidate matching | `/api/certifications` | Phase 5 (Certifications) |
| Skill gap detection | All of the above | Phases 1–5 |
| Availability derivation | `/api/project-assignments` | This feature (Phase 7) |
