# Data Model: Peer Validation & Manager/Admin Controls

**Feature**: 006-peer-validation-manager-controls  
**Date**: 2026-03-13  
**Source**: Feature spec (spec.md) + research.md decisions

---

## Entity Relationship Diagram

```
┌──────────────┐        ┌────────────────────┐        ┌──────────────────┐
│    User      │ 1──M   │  SkillSubmission   │ 1──1   │ManagerAssessment │
│ (users.json) │───────▶│(employee-skills.json│───────▶│  (in-memory)     │
│              │        │  + in-memory ext)   │        └──────────────────┘
│              │        └────────────────────┘                │
│              │                │                             │
│              │                │ 1──0..1                     │
│              │                ▼                             │
│              │        ┌────────────────────┐                │
│              │ M──M   │PeerValidationReq   │                │
│              │───────▶│  (in-memory)       │                │
│              │(peers) └────────────────────┘                │
│              │                │                             │
│              │                │ 1──M                        │
│              │                ▼                             ▼
│              │        ┌──────────────┐            ┌──────────────────┐
│              │        │ PeerResponse │            │  AdminOverride   │
│              │        │ (in-memory)  │            │  (in-memory)     │
│              │        └──────────────┘            └──────────────────┘
│              │
│              │ 1──M   ┌──────────────────┐
│              │───────▶│   Notification    │
│              │        │(notifications.json│
│              │        │  + in-memory)     │
│              │        └──────────────────┘
└──────────────┘
```

---

## Core Entities

### SkillSubmission

Represents an employee's skill submitted for manager/peer validation. Built from existing `employee-skills.json` data with in-memory extensions for the validation workflow.

```typescript
interface SkillSubmission {
  submissionId: string;          // UUID — generated in-memory
  userId: string;                // Employee who submitted (FK → users.json)
  skillId: string;               // Skill being validated (FK → skill-definitions.json)
  selfRating: number;            // 1–4 scale (from employee-skills.json)
  managerRating: number | null;  // 1–4 set by manager (null until reviewed)
  peerRating: number | null;     // Computed average of peer responses (null until ≥2 responses)
  systemRating: number | null;   // From assessment system (Phase 4)
  finalRating: number | null;    // Computed from weighted formula (null until approved)
  level: ProficiencyLevel | null; // Derived from finalRating percentage
  status: SubmissionStatus;
  submittedDate: string;         // ISO 8601 date
  lastUpdated: string;           // ISO 8601 date
  rejectionReason: string | null; // Set on rejection
  certificationId: string | null; // FK → certifications.json (evidence)
  projectExperience: string[];   // projectIds where skill is tagged
}

type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
```

**Validation Rules:**
- `selfRating` must be 1–4 (integer)
- `status` transitions: Pending → Approved OR Pending → Rejected (no reverse transitions)
- `rejectionReason` is mandatory when status is 'Rejected'; null otherwise
- `finalRating` is computed only on approval; null while pending

**State Transitions:**
```
  ┌─────────┐    approve (manager sets rating)    ┌──────────┐
  │ Pending │──────────────────────────────────────▶│ Approved │
  └─────────┘                                      └──────────┘
       │
       │ reject (reason required)
       ▼
  ┌──────────┐
  │ Rejected │
  └──────────┘
```

---

### PeerValidationRequest

Tracks a peer validation lifecycle initiated by an employee for a specific skill submission.

```typescript
interface PeerValidationRequest {
  id: string;                     // UUID — generated in-memory
  submissionId: string;           // FK → SkillSubmission
  requesterId: string;            // Employee who requested (FK → users.json)
  skillId: string;                // Skill being validated
  selectedPeerIds: string[];      // 2–3 peer userIds
  status: PeerValidationStatus;
  createdDate: string;            // ISO 8601 date
  responses: PeerResponse[];
}

type PeerValidationStatus = 'created' | 'notified' | 'awaiting_responses' | 'completed' | 'expired';
```

**Validation Rules:**
- `selectedPeerIds.length` must be 2–3
- Each peerId must be a user in the same department as requester
- Each peer must have `skillId` in their own skill profile
- `requesterId` must not be in `selectedPeerIds`
- Status transitions follow the state machine defined in research.md §2

---

### PeerResponse

Individual peer's validation response for a specific skill.

```typescript
interface PeerResponse {
  peerId: string;                 // Peer who responded (FK → users.json)
  rating: number;                 // 1–4 proficiency rating
  comment: string | null;         // Optional comment
  responseDate: string;           // ISO 8601 date
}
```

**Validation Rules:**
- `rating` must be 1, 2, 3, or 4
- A peer can only respond once per PeerValidationRequest
- Peer must have the skill in their own profile (enforced at selection time)

---

### ManagerAssessment

Manager's evaluation of a skill submission.

```typescript
interface ManagerAssessment {
  submissionId: string;           // FK → SkillSubmission
  managerId: string;              // Manager who assessed (FK → users.json)
  managerRating: number;          // 1–4 scale
  comment: string | null;         // Optional on approval, irrelevant here (rejection reason is on SkillSubmission)
  assessmentDate: string;         // ISO 8601 date
  action: 'approve' | 'reject';
}
```

**Validation Rules:**
- `managerRating` must be 1–4 (integer)
- Manager must have role 'Manager' or 'Admin'
- Manager (role='Manager') can only assess employees in their own department

---

### AdminOverride

Admin-initiated rating override with mandatory justification.

```typescript
interface AdminOverride {
  submissionId: string;           // FK → SkillSubmission
  adminId: string;                // Admin who overrode (FK → users.json)
  overriddenRating: number;       // 1–4 scale (replaces finalRating)
  justification: string;         // Mandatory — cannot be empty
  overrideDate: string;           // ISO 8601 date
  previousFinalRating: number | null; // Preserved for audit
}
```

**Validation Rules:**
- `overriddenRating` must be 1–4
- `justification` must be non-empty string (trimmed length > 0)
- Only users with role 'Admin' can create an override
- `previousFinalRating` stores the value before override for audit trail

---

### RatingInput / RatingResult

Input/output models for the final rating calculation utility.

```typescript
interface RatingInput {
  selfRating: number | null;      // 1–4 or null
  managerRating: number | null;   // 1–4 or null
  peerRating: number | null;      // 1–4 (computed average) or null
  systemRating: number | null;    // 0.0–4.0 or null
}

interface RatingResult {
  finalRating: number;            // 0.0–4.0
  sourceCount: number;            // 1–4
  confidence: ConfidenceLevel;
  effectiveWeights: Record<string, number>;
  level: ProficiencyLevel;        // Derived from finalRating %
}

type ConfidenceLevel = 'High' | 'Medium' | 'Low';
```

**Rating Weight Constants:**

| Source | Base Weight |
|---|---|
| Self Rating | 0.20 |
| Manager Rating | 0.30 |
| Peer Rating | 0.15 |
| System Rating | 0.35 |
| **Total** | **1.00** |

**Redistribution:** When a source is null, its weight is redistributed proportionally: `effectiveWeight[i] = baseWeight[i] / sum(baseWeights of present sources)`

**Proficiency Level Mapping:** (from `finalRating / 4.0 × 100`)

| Score % | Level |
|---|---|
| 0–40% | Beginner |
| 41–65% | Intermediate |
| 66–85% | Advanced |
| 86–100% | Expert |

---

### TeamMember

Derived/projected model for the Team Skills Overview table. Not stored directly — computed from users.json and employee-skills.json via selectors.

```typescript
interface TeamMember {
  userId: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  skillsCount: number;            // Count of skills in employee profile
  avgRating: number;              // Average of all finalRatings (0 if none)
  profileCompletion: number;      // 0–100% (skills rated / total skills)
  pendingSubmissions: number;     // Count of Pending status submissions
}
```

---

## NgRx State Shape

### Team Feature Slice

```typescript
interface TeamState {
  // Employee data
  employees: TeamMember[];
  selectedEmployee: EmployeeSkillProfile | null;

  // Validation queue
  validationQueue: SkillSubmission[];
  selectedSubmission: SkillSubmission | null;

  // Peer validation
  peerValidations: PeerValidationRequest[];
  
  // UI state
  loading: boolean;
  error: string | null;
}
```

### State Conventions

- `employees` loaded on navigation to /team/skills — full dataset, filtered by selector per role
- `validationQueue` loaded on navigation to /team/validation — Pending submissions only
- `selectedSubmission` populated when navigating to /team/validation/:submissionId
- `peerValidations` loaded for the current employee/submission context
- `loading` true during any HTTP operation; false on success or failure
- `error` set on failed operations; cleared on next successful action

---

## Mock Data Extensions

### employee-skills.json — Extended Fields

The existing `employee-skills.json` structure is enhanced with submission tracking:

```jsonc
{
  "userId": "user-001",
  "skills": [
    {
      "skillId": "skill-angular",
      "selfRating": 3,
      "managerRating": 4,           // Set by manager on approval (null if pending)
      "peerRating": 3,              // Computed peer average (null if <2 responses)
      "systemRating": 3.2,          // From assessment system
      "finalRating": 3.475,         // Computed on approval
      "level": "Advanced",
      "status": "Approved",         // Pending | Approved | Rejected
      "lastUpdated": "2026-02-15",
      "submittedDate": "2026-02-10",
      "rejectionReason": null
    }
  ]
}
```

### In-Memory Peer Validation Data

Peer validation requests and responses are managed entirely in-memory (no JSON file). Pre-seeded on interceptor initialization for demo purposes:

```jsonc
// In-memory within MockApiInterceptor
[
  {
    "id": "pv-001",
    "submissionId": "sub-001",
    "requesterId": "user-001",
    "skillId": "skill-angular",
    "selectedPeerIds": ["user-002", "user-003"],
    "status": "completed",
    "createdDate": "2026-02-08",
    "responses": [
      { "peerId": "user-002", "rating": 3, "comment": "Solid Angular skills", "responseDate": "2026-02-09" },
      { "peerId": "user-003", "rating": 4, "comment": null, "responseDate": "2026-02-10" }
    ]
  },
  {
    "id": "pv-002",
    "submissionId": "sub-005",
    "requesterId": "user-004",
    "skillId": "skill-docker",
    "selectedPeerIds": ["user-005", "user-006"],
    "status": "awaiting_responses",
    "createdDate": "2025-12-01",
    "responses": [
      { "peerId": "user-005", "rating": 2, "comment": "Needs improvement", "responseDate": "2025-12-03" }
    ]
  }
]
```

### notifications.json — Extended Events

New notification types added for this feature:

```jsonc
[
  {
    "notificationId": "notif-101",
    "userId": "user-001",
    "type": "skill_approved",
    "message": "Your Angular skill has been approved by Jane Manager.",
    "isRead": false,
    "date": "2026-02-15T10:30:00Z",
    "linkTo": "/my-skills/skill-angular"
  },
  {
    "notificationId": "notif-102",
    "userId": "user-004",
    "type": "skill_rejected",
    "message": "Your Docker skill was rejected. Reason: Insufficient project experience demonstrated.",
    "isRead": false,
    "date": "2026-02-14T14:00:00Z",
    "linkTo": "/my-skills/skill-docker"
  },
  {
    "notificationId": "notif-103",
    "userId": "user-002",
    "type": "peer_validation_request",
    "message": "John Employee requested you to validate their Angular skill.",
    "isRead": false,
    "date": "2026-02-08T09:00:00Z",
    "linkTo": "/team/validation/pv-001"
  },
  {
    "notificationId": "notif-104",
    "userId": "user-001",
    "type": "peer_validation_completed",
    "message": "Sarah Peer has validated your Angular skill.",
    "isRead": true,
    "date": "2026-02-09T11:00:00Z",
    "linkTo": "/my-skills/skill-angular"
  }
]
```
