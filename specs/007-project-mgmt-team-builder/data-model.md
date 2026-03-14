# Data Model: Project Management, Candidate Matching & Team Builder

**Feature**: 007-project-mgmt-team-builder  
**Date**: 2026-03-13  
**Status**: Complete  
**Source**: Feature spec (spec.md) + research.md + constitution.md

---

## Entity Relationship Overview

```
Project ──1:N──▶ RequiredSkill (embedded)
Project ──1:N──▶ RoleSlot (embedded)
Project ──1:N──▶ ProjectAssignment ──N:1──▶ User
ProjectAssignment ──N:1──▶ Project

User ──1:N──▶ EmployeeSkill (from employee-skills.json)
User ──1:1──▶ AvailabilityStatus (derived from project-assignments)

SkillDefinition ◀── referenced by RequiredSkill, EmployeeSkill
SkillCategory ◀── referenced by SkillDefinition

CandidateMatchResult (computed, not persisted)
SkillGapResult (computed, not persisted)
```

---

## Entities

### 1. Project

**Source**: projects.json  
**Persistence**: In-memory via MockApiInterceptor (resets on refresh)

| Field | Type | Required | Description |
|---|---|---|---|
| `projectId` | `string` | Yes | UUID, auto-generated on create |
| `name` | `string` | Yes | Unique (case-insensitive), validated on create/edit |
| `description` | `string` | No | Free-text project description |
| `status` | `ProjectStatus` | Yes | One of: `Draft`, `Open`, `In Progress`, `Completed` |
| `startDate` | `string` (ISO 8601) | Yes | Must be before `deadline` |
| `deadline` | `string` (ISO 8601) | Yes | Must be after `startDate` |
| `requiredSkills` | `RequiredSkill[]` | Yes | At least one required; skill + minimum proficiency |
| `requiredRoles` | `RoleSlot[]` | Yes | Role title + headcount for team building |
| `createdBy` | `string` | Yes | userId of the creating Manager/Admin (auto-filled) |
| `createdDate` | `string` (ISO 8601) | Yes | Auto-set on creation |

**State Transitions**:
```
Draft → Open → In Progress → Completed
  └──────────────────────────┘ (can skip intermediate states)
```

**Validation Rules**:
- `name` must not be empty → "Project name is required."
- `name` must be unique (case-insensitive) → "A project with this name already exists."
- `startDate` must be before `deadline` → "Start date must be before deadline."
- `requiredSkills` must have at least one entry → "Add at least one required skill to create a project."

**TypeScript Interface**:
```typescript
type ProjectStatus = 'Draft' | 'Open' | 'In Progress' | 'Completed';

interface Project {
  projectId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  requiredSkills: RequiredSkill[];
  requiredRoles: RoleSlot[];
  createdBy: string;
  createdDate: string;
}
```

---

### 2. RequiredSkill (Embedded in Project)

**Source**: Embedded within Project.requiredSkills  
**Persistence**: Part of the Project record

| Field | Type | Required | Description |
|---|---|---|---|
| `skillId` | `string` | Yes | References skill-definitions.json |
| `minimumLevel` | `ProficiencyLevel` | Yes | 1 (Beginner), 2 (Intermediate), 3 (Advanced), 4 (Expert) |

**TypeScript Interface**:
```typescript
type ProficiencyLevel = 1 | 2 | 3 | 4;

interface RequiredSkill {
  skillId: string;
  minimumLevel: ProficiencyLevel;
}
```

---

### 3. RoleSlot (Embedded in Project)

**Source**: Embedded within Project.requiredRoles  
**Persistence**: Part of the Project record

| Field | Type | Required | Description |
|---|---|---|---|
| `roleTitle` | `string` | Yes | e.g., "Flutter Developer", "QA Engineer" |
| `headcount` | `number` | Yes | Number of employees needed for this role (≥ 1) |

**TypeScript Interface**:
```typescript
interface RoleSlot {
  roleTitle: string;
  headcount: number;
}
```

**Derived Field** (computed at runtime, not persisted):
- `filledCount`: Number of ProjectAssignment records matching this project + role title

---

### 4. ProjectAssignment

**Source**: project-assignments.json  
**Persistence**: In-memory via MockApiInterceptor (resets on refresh)

| Field | Type | Required | Description |
|---|---|---|---|
| `assignmentId` | `string` | Yes | UUID, auto-generated on assignment |
| `projectId` | `string` | Yes | References projects.json |
| `userId` | `string` | Yes | References users.json |
| `role` | `string` | Yes | Must match a `roleTitle` from the project's `requiredRoles` |
| `assignedDate` | `string` (ISO 8601) | Yes | Date of assignment |

**Constraints**:
- An employee can be assigned to only one active project at a time (per Out of Scope)
- `role` must correspond to a `roleTitle` in the project's `requiredRoles` array
- A role slot cannot exceed its `headcount`

**TypeScript Interface**:
```typescript
interface ProjectAssignment {
  assignmentId: string;
  projectId: string;
  userId: string;
  role: string;
  assignedDate: string;
}
```

---

### 5. CandidateMatchResult (Computed — Not Persisted)

**Source**: Calculated at runtime by `candidate-matching.service.ts`  
**Persistence**: None — computed on demand and held in NgRx store as transient state

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Employee being evaluated |
| `userName` | `string` | Display name from users.json |
| `department` | `string` | Department from users.json |
| `matchScore` | `number` | 0–100, percentage of required skills met |
| `matchedCount` | `number` | Count of skills meeting or exceeding minimum level |
| `totalRequired` | `number` | Total required skills for the project |
| `availability` | `AvailabilityStatus` | Current availability status |
| `skillBreakdown` | `SkillBreakdownEntry[]` | Per-skill detail for the breakdown table |

**TypeScript Interface**:
```typescript
type AvailabilityStatus = 'Available' | 'Partially Available' | 'Busy';

interface CandidateMatchResult {
  userId: string;
  userName: string;
  department: string;
  matchScore: number;
  matchedCount: number;
  totalRequired: number;
  availability: AvailabilityStatus;
  skillBreakdown: SkillBreakdownEntry[];
}

interface SkillBreakdownEntry {
  skillId: string;
  skillName: string;
  requiredLevel: ProficiencyLevel;
  candidateLevel: ProficiencyLevel | null;
  status: 'Exceeds' | 'Meets' | 'Below';
  isStale: boolean;
}
```

---

### 6. SkillGapResult (Computed — Not Persisted)

**Source**: Calculated at runtime by `skill-gap.service.ts`  
**Persistence**: None — computed on demand for the Team Builder screen

| Field | Type | Description |
|---|---|---|
| `skillId` | `string` | Skill with no qualifying candidates |
| `skillName` | `string` | Display name from skill-definitions.json |
| `requiredLevel` | `ProficiencyLevel` | Minimum level required by the project |
| `highestAvailableLevel` | `ProficiencyLevel \| null` | Best available across all employees (null if no one has it) |
| `gapPercentage` | `number` | `((required - highest) / required) × 100` |
| `nearestEmployees` | `NearestEmployee[]` | Up to 3 closest employees for learning suggestions |

**TypeScript Interface**:
```typescript
interface SkillGapResult {
  skillId: string;
  skillName: string;
  requiredLevel: ProficiencyLevel;
  highestAvailableLevel: ProficiencyLevel | null;
  gapPercentage: number;
  nearestEmployees: NearestEmployee[];
}

interface NearestEmployee {
  userId: string;
  name: string;
  currentLevel: ProficiencyLevel;
  levelGap: number; // requiredLevel - currentLevel
}
```

---

### 7. AvailabilityOverride (Transient — Not Persisted to JSON)

**Source**: Created during manager override actions  
**Persistence**: In-memory only (part of NgRx state)

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Employee whose status was overridden |
| `previousStatus` | `AvailabilityStatus` | Status before override |
| `newStatus` | `AvailabilityStatus` | Status after override |
| `reason` | `string` | Mandatory justification (Manager-provided) |
| `overriddenBy` | `string` | userId of the Manager/Admin who performed override |
| `overrideDate` | `string` (ISO 8601) | Date/time of override |

**TypeScript Interface**:
```typescript
interface AvailabilityOverride {
  userId: string;
  previousStatus: AvailabilityStatus;
  newStatus: AvailabilityStatus;
  reason: string;
  overriddenBy: string;
  overrideDate: string;
}
```

---

### 8. ProjectAlignmentEntry (Computed View Model — Not Persisted)

**Source**: Joined from users.json + project-assignments.json + projects.json  
**Persistence**: None — computed for the alignment view

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Employee ID |
| `employeeName` | `string` | From users.json |
| `role` | `string` | Role assigned in the project |
| `currentProject` | `string` | Project name |
| `status` | `AvailabilityStatus` | Derived availability |
| `since` | `string` (ISO 8601) | Assignment date |

**TypeScript Interface**:
```typescript
interface ProjectAlignmentEntry {
  userId: string;
  employeeName: string;
  role: string;
  currentProject: string;
  status: AvailabilityStatus;
  since: string;
}
```

---

## NgRx State Shape

### Projects Feature State

```typescript
interface ProjectsState {
  projects: Project[];
  assignments: ProjectAssignment[];
  availabilityOverrides: AvailabilityOverride[];
  selectedProjectId: string | null;
  matchResults: CandidateMatchResult[];
  skillGaps: SkillGapResult[];
  filters: MatchFilters;
  loading: boolean;
  error: string | null;
}

interface MatchFilters {
  department: string | null;
  availability: AvailabilityStatus | null;
  minimumMatchScore: number; // 0–100, default 0
}
```

---

## Mock Data Schemas

### projects.json (Extended from Constitution)

```jsonc
[
  {
    "projectId": "proj-001",
    "name": "Banking App Modernization",
    "description": "Modernize the legacy banking application to a cloud-native architecture",
    "status": "Open",
    "startDate": "2026-02-01",
    "deadline": "2026-08-31",
    "requiredSkills": [
      { "skillId": "skill-angular", "minimumLevel": 3 },
      { "skillId": "skill-typescript", "minimumLevel": 2 },
      { "skillId": "skill-docker", "minimumLevel": 2 },
      { "skillId": "skill-postgresql", "minimumLevel": 3 }
    ],
    "requiredRoles": [
      { "roleTitle": "Frontend Developer", "headcount": 2 },
      { "roleTitle": "Backend Developer", "headcount": 1 },
      { "roleTitle": "QA Engineer", "headcount": 1 }
    ],
    "createdBy": "user-mgr-01",
    "createdDate": "2026-01-15"
  }
]
```

### project-assignments.json

```jsonc
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

## Relationship Summary

| From Entity | To Entity | Cardinality | Join Field |
|---|---|---|---|
| Project | RequiredSkill | 1:N (embedded) | — |
| Project | RoleSlot | 1:N (embedded) | — |
| Project | ProjectAssignment | 1:N | `projectId` |
| ProjectAssignment | User | N:1 | `userId` |
| RequiredSkill | SkillDefinition | N:1 | `skillId` |
| CandidateMatchResult | User | N:1 | `userId` |
| CandidateMatchResult | SkillBreakdownEntry | 1:N (embedded) | — |
| SkillGapResult | SkillDefinition | N:1 | `skillId` |
| SkillGapResult | NearestEmployee | 1:N (embedded) | — |
| ProjectAlignmentEntry | User | N:1 | `userId` |
| ProjectAlignmentEntry | Project | N:1 | via `currentProject` |
