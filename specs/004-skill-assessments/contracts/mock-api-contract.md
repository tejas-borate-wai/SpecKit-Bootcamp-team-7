# Mock API Contract: Skill Assessments Module

**Feature**: 004-skill-assessments  
**Date**: 2026-03-12  
**Architecture**: Angular HttpClient → MockApiInterceptor → in-memory JSON data

---

## Overview

All endpoints below are intercepted by `MockApiInterceptor`. No real HTTP requests are made. The interceptor matches URL patterns, performs operations on in-memory copies of the JSON data arrays, and returns `Observable<HttpResponse<T>>` with simulated latency (50–200ms).

---

## Endpoints

### 1. GET /api/skill-exams

**Purpose**: Load all available skill exams  
**Auth**: AuthGuard (any authenticated role)  
**Request**: No body or query params  

**Response (200)**:
```json
{
  "data": [
    {
      "skillId": "skill-angular",
      "questions": [
        {
          "questionId": "q-ang-001",
          "questionText": "What decorator is used to define a component in Angular?",
          "options": ["@Component", "@Directive", "@Injectable", "@NgModule"],
          "correctAnswer": "@Component",
          "difficultyLevel": "Easy"
        }
      ]
    }
  ]
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 500 | Interceptor data load failure (simulated) | `{ "error": "Something went wrong. Please try again." }` |

---

### 2. GET /api/skill-exams/:skillId

**Purpose**: Load exam questions for a specific skill  
**Auth**: AuthGuard (any authenticated role)  
**Path Param**: `skillId` — the skill identifier  

**Response (200)**:
```json
{
  "data": {
    "skillId": "skill-angular",
    "questions": [
      {
        "questionId": "q-ang-001",
        "questionText": "What decorator is used to define a component in Angular?",
        "options": ["@Component", "@Directive", "@Injectable", "@NgModule"],
        "correctAnswer": "@Component",
        "difficultyLevel": "Easy"
      },
      {
        "questionId": "q-ang-002",
        "questionText": "Which Angular feature enables lazy loading of routes?",
        "options": ["loadChildren", "forRoot", "forChild", "canActivate"],
        "correctAnswer": "loadChildren",
        "difficultyLevel": "Medium"
      }
    ]
  }
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 404 | No exam exists for skillId | `{ "error": "Assessment not available yet for this skill." }` |

---

### 3. GET /api/skill-test-attempts?userId=:userId

**Purpose**: Load all test attempts for a specific user  
**Auth**: AuthGuard (any authenticated role); interceptor verifies `userId` matches session user  
**Query Param**: `userId` — the user identifier  

**Response (200)**:
```json
{
  "data": [
    {
      "attemptId": "att-001",
      "userId": "user-001",
      "skillId": "skill-angular",
      "score": 72,
      "earnedPoints": 18,
      "maxPoints": 25,
      "date": "2026-03-10T14:30:00Z",
      "timeTaken": 540
    }
  ]
}
```

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | `userId` does not match session user (non-admin) | `{ "error": "You do not have permission to perform this action." }` |

---

### 4. GET /api/skill-test-attempts?userId=:userId&skillId=:skillId

**Purpose**: Load test attempts for a specific user + skill combination  
**Auth**: AuthGuard (any authenticated role)  
**Query Params**: `userId`, `skillId`  

**Response (200)**:
```json
{
  "data": [
    {
      "attemptId": "att-001",
      "userId": "user-001",
      "skillId": "skill-angular",
      "score": 72,
      "earnedPoints": 18,
      "maxPoints": 25,
      "date": "2026-03-10T14:30:00Z",
      "timeTaken": 540
    },
    {
      "attemptId": "att-005",
      "userId": "user-001",
      "skillId": "skill-angular",
      "score": 85,
      "earnedPoints": 22,
      "maxPoints": 25,
      "date": "2026-03-11T10:00:00Z",
      "timeTaken": 480
    }
  ]
}
```

**Error Responses**: Same as endpoint 3.

---

### 5. POST /api/skill-test-attempts

**Purpose**: Submit a completed assessment attempt  
**Auth**: AuthGuard (any authenticated role)  

**Request Body**:
```json
{
  "userId": "user-001",
  "skillId": "skill-angular",
  "score": 85,
  "earnedPoints": 22,
  "maxPoints": 25,
  "date": "2026-03-12T14:30:00Z",
  "timeTaken": 480
}
```

**Response (201)**:
```json
{
  "data": {
    "attemptId": "att-006",
    "userId": "user-001",
    "skillId": "skill-angular",
    "score": 85,
    "earnedPoints": 22,
    "maxPoints": 25,
    "date": "2026-03-12T14:30:00Z",
    "timeTaken": 480
  }
}
```

**Interceptor Behavior**:
- Generates a unique `attemptId` (UUID)
- Adds the attempt to the in-memory `skill-test-attempts` array
- Returns the complete attempt object with the generated ID

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 400 | Missing required fields | `{ "error": "Invalid attempt data" }` |

---

### 6. PUT /api/employee-skills/:userId

**Purpose**: Update the system rating on an employee's skill after assessment  
**Auth**: AuthGuard (any authenticated role); interceptor verifies `userId` matches session user  

**Request Body** (partial update):
```json
{
  "skillId": "skill-angular",
  "systemRating": 3.4,
  "lastUpdated": "2026-03-12"
}
```

**Response (200)**:
```json
{
  "data": {
    "userId": "user-001",
    "skills": [
      {
        "skillId": "skill-angular",
        "selfRating": 3,
        "managerRating": null,
        "peerRating": null,
        "systemRating": 3.4,
        "finalRating": 3.4,
        "level": "Advanced",
        "status": "Pending",
        "lastUpdated": "2026-03-12"
      }
    ]
  }
}
```

**Note**: This endpoint is from Phase 3 but is called by the assessment module after computing the system rating. The interceptor updates the in-memory employee-skills data.

**Error Responses**:
| Status | Condition | Body |
|---|---|---|
| 401 | No authenticated session | `{ "error": "Authentication required" }` |
| 403 | `userId` does not match session user | `{ "error": "You do not have permission to perform this action." }` |
| 404 | Skill not found in user's profile | `{ "error": "Skill not found" }` |

---

## Cross-Feature Read Endpoints (Used for Score Card)

These endpoints are defined in other features but consumed by this module for score card computation:

### GET /api/certifications?userId=:userId&skillId=:skillId
**Purpose**: Check if user holds a valid (non-expired) certification for the assessed skill  
**Owner**: Phase 5 (Certifications)  
**Response**: Array of certifications; this module checks if any exist with `expiryDate` > today

### GET /api/project-assignments?userId=:userId
**Purpose**: Check if user is assigned to a completed project that includes the assessed skill  
**Owner**: Phase 7 (Projects)  
**Response**: Array of assignments; cross-referenced with projects.json to check `status === 'Completed'` and `requiredSkills.includes(skillId)`

---

## Interceptor URL Pattern Summary

| Method | URL Pattern | JSON Source | Operation |
|---|---|---|---|
| GET | `/api/skill-exams` | skill-exams.json | Read all exams |
| GET | `/api/skill-exams/:skillId` | skill-exams.json | Filter by skillId |
| GET | `/api/skill-test-attempts?userId=&skillId=` | skill-test-attempts.json | Filter by userId and/or skillId |
| POST | `/api/skill-test-attempts` | skill-test-attempts.json | Add new attempt to in-memory array |
| PUT | `/api/employee-skills/:userId` | employee-skills.json | Update systemRating for a skill |

---

## Data Flow Diagrams

### Start Assessment Flow
```
AssessmentsListComponent
  → dispatch(startAssessment({ skillId }))
  → Effect: GET /api/skill-exams/:skillId
  → Interceptor: filter skill-exams.json → return SkillExam
  → Effect: shuffle questions, set timerDeadline
  → dispatch(assessmentLoaded({ exam, shuffledQuestions }))
  → Reducer: set activeAssessment state
  → Navigate to /assessments/:skillId/take
```

### Submit Assessment Flow
```
TakeAssessmentComponent
  → dispatch(submitAssessment()) OR dispatch(timerExpired())
  → Effect: calculateWeightedScore(questions, answers)
  → Effect: POST /api/skill-test-attempts (persist attempt)
  → Interceptor: add to in-memory array, return with attemptId
  → Effect: GET /api/certifications?userId&skillId (cert bonus check)
  → Effect: GET /api/project-assignments?userId (project exp check)
  → Effect: calculateSystemRating(testScore, hasCert, hasProject)
  → Effect: PUT /api/employee-skills/:userId (update systemRating)
  → dispatch(assessmentSubmitted({ attempt, scoreCard }))
  → Reducer: add to attempts[], clear activeAssessment
  → Navigate to /assessments/:skillId/result
```

### Retake Check Flow
```
AssessmentsListComponent
  → Selector: selectRetakeCooldown(skillId)
  → Reads latest attempt.date from attempts[]
  → Computes: cooldownEnd = lastAttemptDate + 24h
  → Returns: { canRetake: boolean, hoursRemaining, minutesRemaining }
  → Template: show "Retake" button OR cooldown message
```
