# Mock API Contract: Peer Validation & Manager/Admin Controls

**Feature**: 006-peer-validation-manager-controls  
**Date**: 2026-03-13  
**Architecture**: Angular HttpClient → MockApiInterceptor → in-memory JSON data

---

## Overview

All endpoints below are intercepted by `MockApiInterceptor`. No real HTTP requests are made. The interceptor matches URL patterns, performs operations on in-memory copies of JSON data arrays (employee-skills.json, users.json, notifications.json) and in-memory peer validation data, then returns `Observable<HttpResponse<T>>` with simulated latency (50–200ms).

RBAC enforcement: Endpoints marked with `RoleGuard` return HTTP 403 if the session user's role is not in the permitted list. Manager-scoped endpoints additionally filter by the manager's department.

---

## Endpoints

### 1. GET /api/team/employees

**Purpose**: Load team members for the Team Skills Overview table  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Request**: No body or query params  

**Response (200)**:
```json
{
  "data": [
    {
      "userId": "user-001",
      "name": "John Employee",
      "email": "john@company.com",
      "department": "Engineering",
      "avatarUrl": "/assets/avatars/john.png",
      "skillsCount": 5,
      "avgRating": 3.2,
      "profileCompletion": 72,
      "pendingSubmissions": 1
    }
  ]
}
```

**Filtering Logic (in interceptor)**:
- Manager role: returns only employees where `employee.department === currentUser.department`
- Admin role: returns all employees

**Note**: The `skillsCount`, `avgRating`, `profileCompletion`, and `pendingSubmissions` fields are computed by the interceptor from `employee-skills.json` data for each user.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | User role is not Manager or Admin | `{ "error": "You do not have permission to perform this action." }` |

---

### 2. GET /api/team/employees/:userId

**Purpose**: Load full skill profile for a specific employee (viewed from team context)  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Path Param**: `userId` — the employee's user ID  

**Response (200)**:
```json
{
  "data": {
    "userId": "user-001",
    "name": "John Employee",
    "email": "john@company.com",
    "department": "Engineering",
    "avatarUrl": "/assets/avatars/john.png",
    "skills": [
      {
        "skillId": "skill-angular",
        "skillName": "Angular",
        "categoryName": "Development",
        "selfRating": 3,
        "managerRating": 4,
        "peerRating": 3.5,
        "systemRating": 3.2,
        "finalRating": 3.475,
        "level": "Advanced",
        "status": "Approved",
        "lastUpdated": "2026-02-15",
        "sourceCount": 4,
        "confidence": "High"
      }
    ]
  }
}
```

**Filtering Logic**:
- Manager: returns data only if employee is in the same department; 403 otherwise
- Admin: returns data for any employee

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | Manager viewing employee from different department | `{ "error": "You do not have permission to perform this action." }` |
| 404 | userId not found | `{ "error": "Employee not found" }` |

---

### 3. GET /api/team/validation-queue

**Purpose**: Load pending skill submissions awaiting approval  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Request**: No body or query params  

**Response (200)**:
```json
{
  "data": [
    {
      "submissionId": "sub-001",
      "userId": "user-001",
      "employeeName": "John Employee",
      "department": "Engineering",
      "skillId": "skill-angular",
      "skillName": "Angular",
      "selfRating": 3,
      "status": "Pending",
      "submittedDate": "2026-02-10",
      "certificationId": "cert-001",
      "hasCertification": true,
      "hasProjectExperience": true,
      "peerValidationStatus": "completed",
      "peerRating": 3.5
    }
  ]
}
```

**Filtering Logic**:
- Manager: returns only Pending submissions from employees in the manager's department
- Admin: returns all Pending submissions across all departments

**Sorting**: Default sort by `submittedDate` descending. Client-side sorting by employee name, skill name, and submit date.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | User role is not Manager or Admin | `{ "error": "You do not have permission to perform this action." }` |

---

### 4. GET /api/team/validation-queue/:submissionId

**Purpose**: Load full detail for a specific skill submission  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Path Param**: `submissionId` — the submission identifier  

**Response (200)**:
```json
{
  "data": {
    "submissionId": "sub-001",
    "userId": "user-001",
    "employeeName": "John Employee",
    "department": "Engineering",
    "avatarUrl": "/assets/avatars/john.png",
    "skillId": "skill-angular",
    "skillName": "Angular",
    "selfRating": 3,
    "systemRating": 3.2,
    "status": "Pending",
    "submittedDate": "2026-02-10",
    "certification": {
      "certId": "cert-001",
      "certName": "Google Angular Certification",
      "issuingOrg": "Google",
      "issueDate": "2025-06-01",
      "expiryDate": "2027-06-01",
      "status": "Valid"
    },
    "projectExperience": [
      {
        "projectId": "proj-001",
        "projectName": "Banking App",
        "role": "Frontend Developer",
        "status": "Completed"
      }
    ],
    "peerValidation": {
      "status": "completed",
      "responses": [
        { "peerId": "user-002", "peerName": "Sarah Peer", "rating": 3, "comment": "Solid Angular skills", "responseDate": "2026-02-09" },
        { "peerId": "user-003", "peerName": "Mike Peer", "rating": 4, "comment": null, "responseDate": "2026-02-10" }
      ],
      "averageRating": 3.5
    }
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | Manager viewing submission from employee in different department | `{ "error": "You do not have permission to perform this action." }` |
| 404 | submissionId not found | `{ "error": "Submission not found" }` |

---

### 5. POST /api/team/validation-queue/:submissionId/approve

**Purpose**: Manager/Admin approves a skill submission  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Path Param**: `submissionId` — the submission to approve  

**Request Body**:
```json
{
  "managerRating": 4,
  "comment": "Excellent Angular skills demonstrated"
}
```

**Validation Rules**:
- `managerRating` required, must be 1–4 (integer)
- `comment` optional (string or null)
- Manager can only approve submissions from employees in their department

**Response (200)**:
```json
{
  "data": {
    "submissionId": "sub-001",
    "status": "Approved",
    "managerRating": 4,
    "finalRating": 3.475,
    "level": "Advanced",
    "confidence": "High",
    "sourceCount": 4,
    "effectiveWeights": {
      "selfRating": 0.20,
      "managerRating": 0.30,
      "peerRating": 0.15,
      "systemRating": 0.35
    }
  }
}
```

**Side Effects**:
- Updates skill status to "Approved" in employee-skills.json in-memory
- Sets managerRating on the skill record
- Computes and stores finalRating using weighted formula
- Derives proficiency level from finalRating
- Creates notification for employee: "Your [Skill Name] has been approved by [Manager Name]."

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | managerRating missing or out of range | `{ "error": "Manager rating must be between 1 and 4" }` |
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | Manager approving employee from different department | `{ "error": "You do not have permission to perform this action." }` |
| 404 | submissionId not found | `{ "error": "Submission not found" }` |
| 409 | Submission already approved or rejected | `{ "error": "This submission has already been processed" }` |

---

### 6. POST /api/team/validation-queue/:submissionId/reject

**Purpose**: Manager/Admin rejects a skill submission  
**Auth**: AuthGuard + RoleGuard(['Manager', 'Admin'])  
**Path Param**: `submissionId` — the submission to reject  

**Request Body**:
```json
{
  "rejectionReason": "Insufficient project experience demonstrated for Advanced level"
}
```

**Validation Rules**:
- `rejectionReason` required, must be non-empty string (trimmed length > 0)
- Manager can only reject submissions from employees in their department

**Response (200)**:
```json
{
  "data": {
    "submissionId": "sub-001",
    "status": "Rejected",
    "rejectionReason": "Insufficient project experience demonstrated for Advanced level"
  }
}
```

**Side Effects**:
- Updates skill status to "Rejected" in employee-skills.json in-memory
- Stores rejectionReason on the skill record
- Creates notification for employee: "Your [Skill Name] was rejected. Reason: [reason]."

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | rejectionReason missing or empty | `{ "error": "Rejection reason is required." }` |
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | Manager rejecting employee from different department | `{ "error": "You do not have permission to perform this action." }` |
| 404 | submissionId not found | `{ "error": "Submission not found" }` |
| 409 | Submission already approved or rejected | `{ "error": "This submission has already been processed" }` |

---

### 7. POST /api/team/validation-queue/:submissionId/override

**Purpose**: Admin overrides a skill's rating (Admin only)  
**Auth**: AuthGuard + RoleGuard(['Admin'])  
**Path Param**: `submissionId` — the submission to override  

**Request Body**:
```json
{
  "overriddenRating": 4,
  "justification": "Employee demonstrated Expert-level skills in recent project review"
}
```

**Validation Rules**:
- `overriddenRating` required, must be 1–4 (integer)
- `justification` required, must be non-empty string (trimmed length > 0)
- Only Admin role can perform overrides

**Response (200)**:
```json
{
  "data": {
    "submissionId": "sub-001",
    "overriddenRating": 4,
    "previousFinalRating": 3.475,
    "justification": "Employee demonstrated Expert-level skills in recent project review",
    "level": "Expert",
    "overrideDate": "2026-03-13T14:00:00Z"
  }
}
```

**Side Effects**:
- Preserves previous finalRating for audit
- Overwrites finalRating with overriddenRating
- Re-derives proficiency level from new rating
- Updates lastUpdated on skill record

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | overriddenRating out of range or justification empty | `{ "error": "Override rating must be between 1 and 4" }` or `{ "error": "Override justification is required." }` |
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | Non-Admin attempting override | `{ "error": "You do not have permission to perform this action." }` |
| 404 | submissionId not found | `{ "error": "Submission not found" }` |

---

### 8. POST /api/peer-validation/request

**Purpose**: Employee initiates a peer validation request for a skill  
**Auth**: AuthGuard (any authenticated role)  

**Request Body**:
```json
{
  "skillId": "skill-angular",
  "selectedPeerIds": ["user-002", "user-003"]
}
```

**Validation Rules**:
- `skillId` required, must exist in employee's skill profile
- `selectedPeerIds` required, length must be 2–3
- Each peer must be in the same department as the requester
- Each peer must have `skillId` in their own skill profile
- Requester's own userId must not be in `selectedPeerIds`

**Response (201)**:
```json
{
  "data": {
    "id": "pv-003",
    "submissionId": "sub-010",
    "requesterId": "user-001",
    "skillId": "skill-angular",
    "selectedPeerIds": ["user-002", "user-003"],
    "status": "notified",
    "createdDate": "2026-03-13",
    "responses": []
  }
}
```

**Side Effects**:
- Creates PeerValidationRequest in in-memory store
- Transitions status from 'created' → 'notified' → 'awaiting_responses'
- Creates notification for each peer: "[Employee Name] requested you to validate their [Skill Name] skill."

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | Fewer than 2 peers selected | `{ "error": "Select at least 2 peers." }` |
| 400 | More than 3 peers selected | `{ "error": "Maximum 3 peers allowed." }` |
| 400 | Peer not in same department | `{ "error": "Selected peers must be in your team." }` |
| 400 | Peer does not have the skill | `{ "error": "Selected peer does not have this skill in their profile." }` |
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 404 | Skill not found in requester's profile | `{ "error": "Skill not found in your profile" }` |

---

### 9. GET /api/peer-validation/eligible-peers/:skillId

**Purpose**: Get list of eligible peers for a specific skill validation  
**Auth**: AuthGuard (any authenticated role)  
**Path Param**: `skillId` — the skill to find eligible validators for  

**Response (200)**:
```json
{
  "data": [
    {
      "userId": "user-002",
      "name": "Sarah Peer",
      "department": "Engineering",
      "avatarUrl": "/assets/avatars/sarah.png",
      "skillLevel": "Advanced"
    },
    {
      "userId": "user-003",
      "name": "Mike Peer",
      "department": "Engineering",
      "avatarUrl": "/assets/avatars/mike.png",
      "skillLevel": "Intermediate"
    }
  ]
}
```

**Filtering Logic**:
- Excludes the requesting user
- Includes only users in the same department
- Includes only users who have `skillId` in their own skill profile

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 404 | skillId not found | `{ "error": "Skill not found" }` |

---

### 10. POST /api/peer-validation/:requestId/respond

**Purpose**: Peer submits their validation rating for a skill  
**Auth**: AuthGuard (any authenticated role)  
**Path Param**: `requestId` — the peer validation request ID  

**Request Body**:
```json
{
  "rating": 3,
  "comment": "Solid Angular skills demonstrated in projects"
}
```

**Validation Rules**:
- `rating` required, must be 1–4 (integer)
- `comment` optional (string or null)
- User must be one of the `selectedPeerIds` in the request
- User must not have already responded
- Request status must be 'awaiting_responses' (not 'completed' or 'expired')
- Responding peer must have the skill in their own profile

**Response (200)**:
```json
{
  "data": {
    "requestId": "pv-001",
    "status": "completed",
    "responseCount": 2,
    "peerRating": 3.5,
    "newResponse": {
      "peerId": "user-003",
      "rating": 3,
      "comment": "Solid Angular skills demonstrated in projects",
      "responseDate": "2026-03-13"
    }
  }
}
```

**Side Effects**:
- Adds PeerResponse to the PeerValidationRequest
- If responseCount ≥ 2: transitions status to 'completed', computes peerRating as average
- Creates notification for requester: "[Peer Name] has validated your [Skill Name] skill."

**Status Transition Logic**:
- After response, if `responses.length >= 2`: status → 'completed'
- After response, if `responses.length < 2`: status stays 'awaiting_responses'
- Peer rating = average of all response ratings (rounded to 1 decimal)

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 400 | Rating missing or out of range | `{ "error": "Proficiency rating is required." }` |
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | User is not a selected peer | `{ "error": "You are not authorized to respond to this request." }` |
| 403 | Peer does not have the skill | `{ "error": "You cannot validate this skill as it is not in your profile." }` |
| 404 | requestId not found | `{ "error": "Peer validation request not found" }` |
| 409 | User already responded | `{ "error": "You have already submitted your validation." }` |
| 409 | Request is expired or completed | `{ "error": "This validation request is no longer active." }` |

---

## Common Response Patterns

### Success Envelope

All success responses use the envelope:
```json
{
  "data": { ... }
}
```

### Error Envelope

All error responses use the envelope:
```json
{
  "error": "Human-readable error message"
}
```

### Simulated Latency

All interceptor responses include a simulated delay of 50–200ms via `delay()` operator to mimic network latency.

### HTTP Status Codes Used

| Code | Meaning |
|---|---|
| 200 | Success (GET, POST actions) |
| 201 | Created (POST new resource) |
| 400 | Validation error (bad input) |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role or wrong department scope) |
| 404 | Resource not found |
| 409 | Conflict (duplicate action, already processed) |
| 500 | Server error (simulated) |
