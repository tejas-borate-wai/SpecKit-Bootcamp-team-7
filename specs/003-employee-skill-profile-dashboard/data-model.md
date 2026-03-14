# Data Model: Employee Skill Profile and Dashboard

**Feature**: 003-employee-skill-profile-dashboard  
**Date**: 2026-03-12

---

## Entities

### 1. EmployeeSkill

Represents a single skill in an employee's profile. Source of truth: `employee-skills.json`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `skillId` | `string` | required, references skill-definitions.json | ID of the skill from the global library |
| `selfRating` | `number \| null` | 1–4 range, nullable | Employee's self-assessed proficiency (1=Beginner, 2=Intermediate, 3=Advanced, 4=Expert) |
| `managerRating` | `number \| null` | 1–4 range, nullable | Manager's assessed proficiency (set in Phase 6) |
| `peerRating` | `number \| null` | 1–4 range, nullable | Average of peer validations (set in Phase 6) |
| `systemRating` | `number \| null` | 0.0–4.0 range, nullable | Computed from test score + cert bonus + project experience (set in Phase 4) |
| `finalRating` | `number \| null` | 0.0–4.0 range, nullable | Weighted average of all 4 sources |
| `level` | `ProficiencyLevel` | derived from finalRating percentage | Beginner / Intermediate / Advanced / Expert |
| `status` | `SkillStatus` | required, enum | Draft / Pending / Approved / Stale |
| `lastUpdated` | `string` | ISO 8601 date, required | Timestamp of last rating update |
| `isDeleted` | `boolean` | default: false | Soft-delete flag; true = hidden from active profile, retained in history |

**TypeScript Interface**:
```typescript
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SkillStatus = 'Draft' | 'Pending' | 'Approved' | 'Stale';

export interface EmployeeSkill {
  skillId: string;
  selfRating: number | null;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: ProficiencyLevel;
  status: SkillStatus;
  lastUpdated: string;
  isDeleted: boolean;
}
```

**Validation Rules**:
- `selfRating` must be 1, 2, 3, or 4 when provided
- `level` is derived, not directly editable: computed from `finalRating` → percentage → threshold mapping
- `status` transitions: Draft → Pending (on validation request) → Approved (on manager approval); any status → Stale (when lastUpdated > 6 months)
- `isDeleted` = true excludes the skill from the active profile list but retains it in history

**State Transitions**:
```
Draft ──[submit for validation]──→ Pending
Pending ──[manager approves]──→ Approved
Pending ──[manager rejects]──→ Draft (with rejection reason)
Approved ──[6 months no update]──→ Stale
Stale ──[retake assessment / manager review]──→ Approved
Any ──[soft delete]──→ isDeleted = true (status unchanged, hidden from active view)
```

---

### 2. EmployeeSkillRecord

Represents a user's complete skill profile. Source of truth: `employee-skills.json`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `userId` | `string` | required, references users.json | Employee's user ID |
| `skills` | `EmployeeSkill[]` | required, default: [] | Array of all skills in profile (including soft-deleted) |

**TypeScript Interface**:
```typescript
export interface EmployeeSkillRecord {
  userId: string;
  skills: EmployeeSkill[];
}
```

---

### 3. SkillTestAttempt

Represents a single assessment attempt for a skill. Source of truth: `skill-test-attempts.json`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `attemptId` | `string` | UUID, unique, required | Unique attempt identifier |
| `userId` | `string` | required, references users.json | Employee who took the test |
| `skillId` | `string` | required, references skill-definitions.json | Skill that was assessed |
| `score` | `number` | 0–100, required | Percentage score (after difficulty weighting) |
| `earnedPoints` | `number` | ≥ 0, required | Total weighted points earned |
| `maxPoints` | `number` | > 0, required | Maximum possible weighted points |
| `date` | `string` | ISO 8601 datetime, required | When the attempt was made |
| `timeTaken` | `number` | ≥ 0, seconds, required | Duration of the attempt in seconds |

**TypeScript Interface**:
```typescript
export interface SkillTestAttempt {
  attemptId: string;
  userId: string;
  skillId: string;
  score: number;
  earnedPoints: number;
  maxPoints: number;
  date: string;
  timeTaken: number;
}
```

---

### 4. SkillCategory (Read-Only)

From Phase 2 — used for cascading dropdown in Add Skill. Source: `skill-categories.json`.

| Field | Type | Description |
|---|---|---|
| `categoryId` | `string` | Unique category ID |
| `categoryName` | `string` | Display name |
| `subCategories` | `SubCategory[]` | Child subcategories |

**TypeScript Interface**:
```typescript
export interface SubCategory {
  subCategoryId: string;
  subCategoryName: string;
}

export interface SkillCategory {
  categoryId: string;
  categoryName: string;
  subCategories: SubCategory[];
}
```

---

### 5. SkillDefinition (Read-Only)

From Phase 2 — used for skill selection in Add Skill. Source: `skill-definitions.json`.

| Field | Type | Description |
|---|---|---|
| `skillId` | `string` | Unique skill ID |
| `skillName` | `string` | Display name |
| `categoryId` | `string` | Parent category reference |
| `subCategoryId` | `string` | Parent subcategory reference |
| `description` | `string` | Skill description |

**TypeScript Interface**:
```typescript
export interface SkillDefinition {
  skillId: string;
  skillName: string;
  categoryId: string;
  subCategoryId: string;
  description: string;
}
```

---

### 6. AchievementBadge

Represents a computed achievement badge. Not persisted — derived from test attempts.

| Field | Type | Description |
|---|---|---|
| `type` | `AchievementType` | Badge identifier |
| `label` | `string` | Display label |
| `icon` | `string` | Material icon name |
| `earnedDate` | `string \| null` | ISO date when earned (first qualifying attempt date) |

**TypeScript Interface**:
```typescript
export type AchievementType = 'first-assessment' | 'reached-advanced' | 'improved-20';

export interface AchievementBadge {
  type: AchievementType;
  label: string;
  icon: string;
  earnedDate: string | null;
}
```

**Computation Rules**:
| Badge | Condition | Icon |
|---|---|---|
| First Assessment | ≥ 1 test attempt exists for the skill | `emoji_events` |
| Reached Advanced | Any attempt score ≥ 66% | `military_tech` |
| Improved by 20% | maxScore - firstScore ≥ 20 pp | `trending_up` |

---

### 7. ConfidenceLevel

Represents the rating confidence indicator for a skill. Computed from available rating sources.

| Level | Condition | Indicator | Color Token |
|---|---|---|---|
| High | 3+ non-null sources | 🟢 | `--color-approved` (green) |
| Medium | 2 non-null sources | 🟡 | `--color-pending` (amber) |
| Low | 1 non-null source | 🔴 | `--color-rejected` (red) |

**TypeScript**:
```typescript
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function computeConfidence(skill: EmployeeSkill): ConfidenceLevel {
  const sources = [skill.selfRating, skill.managerRating, skill.peerRating, skill.systemRating]
    .filter(r => r !== null && r !== undefined).length;
  if (sources >= 3) return 'high';
  if (sources === 2) return 'medium';
  return 'low';
}
```

---

### 8. ProficiencyMapping

Maps rating percentages to proficiency levels. Pure function, no state.

| Score Percentage | Level | Numeric | Badge Color |
|---|---|---|---|
| 0–40% | Beginner | 1 | Grey (`#9CA3AF`) |
| 41–65% | Intermediate | 2 | Blue (`#3B82F6`) |
| 66–85% | Advanced | 3 | Purple (`#8B5CF6`) |
| 86–100% | Expert | 4 | Gold (`#F59E0B`) |

**TypeScript**:
```typescript
export function ratingToPercentage(rating: number): number {
  return (rating / 4.0) * 100;
}

export function percentageToLevel(percentage: number): ProficiencyLevel {
  if (percentage >= 86) return 'Expert';
  if (percentage >= 66) return 'Advanced';
  if (percentage >= 41) return 'Intermediate';
  return 'Beginner';
}
```

---

### 9. DashboardWidgetData

Interfaces for role-specific dashboard widget data. All computed from selectors.

**TypeScript Interfaces**:
```typescript
// Employee Dashboard
export interface EmployeeDashboardData {
  myActiveSkills: EmployeeSkillView[];
  profileCompletion: number;                // 0–100
  skillGaps: SkillGapCard[];                // Skills not yet assessed
  certificationAlerts: CertificationAlert[];
  recentActivity: ActivityItem[];           // Last 5 actions
  achievements: AchievementBadge[];
}

export interface EmployeeSkillView {
  skill: EmployeeSkill;
  definition: SkillDefinition;
  category: SkillCategory;
  isStale: boolean;
  hasCertification: boolean;
  percentage: number;
  level: ProficiencyLevel;
}

export interface SkillGapCard {
  skillDefinition: SkillDefinition;
  categoryName: string;
}

export interface CertificationAlert {
  certName: string;
  skillName: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired';
}

export interface ActivityItem {
  type: 'assessment' | 'certification' | 'skill-added' | 'skill-updated' | 'badge-earned';
  description: string;
  date: string;
}

// Manager Dashboard
export interface ManagerDashboardData {
  pendingApprovals: number;
  teamSkillStrength: TeamSkillSummary[];
  incompleteProfiles: IncompleteProfileItem[];
  staleSkillsCount: number;
  projectMatchRecommendations: ProjectMatchItem[];
  teamAvailability: AvailabilityItem[];
  recentTeamActivity: ActivityItem[];
}

export interface TeamSkillSummary {
  categoryName: string;
  averageRating: number;
  employeeCount: number;
}

export interface IncompleteProfileItem {
  userId: string;
  userName: string;
  completionPercentage: number;
}

export interface ProjectMatchItem {
  projectName: string;
  matchPercentage: number;
}

export interface AvailabilityItem {
  userId: string;
  userName: string;
  status: 'Available' | 'Partially Available' | 'Busy';
}

// Admin Dashboard
export interface AdminDashboardData {
  orgHealthScore: number;                   // 0–100
  totalSkillsTracked: number;
  skillGapByDepartment: DepartmentGap[];
  certificationComplianceRate: number;      // 0–100
  mostCommonGaps: SkillGapSummary[];
  userCountByRole: RoleCount[];
}

export interface DepartmentGap {
  department: string;
  gapCount: number;
  totalSkills: number;
}

export interface SkillGapSummary {
  skillName: string;
  gapCount: number;
}

export interface RoleCount {
  role: 'Employee' | 'Manager' | 'Admin';
  count: number;
}
```

---

### 10. SkillsState (NgRx State Slice)

Represents the global skills state managed by NgRx.

| Field | Type | Default | Description |
|---|---|---|---|
| `mySkills` | `EmployeeSkill[]` | `[]` | Current user's skills |
| `allEmployeeSkills` | `EmployeeSkillRecord[]` | `[]` | All employees' skills (manager/admin) |
| `skillCategories` | `SkillCategory[]` | `[]` | Skill categories from library |
| `skillDefinitions` | `SkillDefinition[]` | `[]` | Skill definitions from library |
| `testAttempts` | `SkillTestAttempt[]` | `[]` | Current user's test attempts |
| `loading` | `boolean` | `false` | Data fetching in progress |
| `error` | `string \| null` | `null` | Last error message |

**TypeScript Interface**:
```typescript
export interface SkillsState {
  mySkills: EmployeeSkill[];
  allEmployeeSkills: EmployeeSkillRecord[];
  skillCategories: SkillCategory[];
  skillDefinitions: SkillDefinition[];
  testAttempts: SkillTestAttempt[];
  loading: boolean;
  error: string | null;
}
```

**State Transitions**:

| Action | Effect on State |
|---|---|
| Load My Skills | `loading: true`, `error: null` |
| Load My Skills Success | `mySkills: payload`, `loading: false` |
| Load My Skills Failure | `error: payload`, `loading: false` |
| Load Skill Library | `loading: true` |
| Load Skill Library Success | `skillCategories: payload.categories`, `skillDefinitions: payload.definitions`, `loading: false` |
| Add Skill | `loading: true` |
| Add Skill Success | `mySkills: [...state.mySkills, payload]`, `loading: false` |
| Add Skill Failure | `error: payload`, `loading: false` |
| Update Skill Rating | `loading: true` |
| Update Skill Rating Success | `mySkills: updated array`, `loading: false` |
| Delete Skill Success | `mySkills: skill.isDeleted set to true`, `loading: false` |
| Load Test Attempts Success | `testAttempts: payload` |
| Load All Employee Skills Success | `allEmployeeSkills: payload` |

---

## Relationships

```
SkillCategory (skill-categories.json)
  │
  └──[has many]──→ SubCategory
                      │
                      └──[has many]──→ SkillDefinition (skill-definitions.json)
                                         │
                                         └──[referenced by]──→ EmployeeSkill.skillId
                                                                  │
                                                                  ├──[belongs to]──→ EmployeeSkillRecord.userId
                                                                  │
                                                                  ├──[has many]──→ SkillTestAttempt (score history)
                                                                  │
                                                                  ├──[derives]──→ AchievementBadge[] (computed)
                                                                  │
                                                                  ├──[derives]──→ ConfidenceLevel (computed)
                                                                  │
                                                                  ├──[derives]──→ ProficiencyLevel (via rating → %)
                                                                  │
                                                                  └──[checked against]──→ project-assignments.json
                                                                                           (delete constraint)

SessionUser (from Phase 1 NgRx store)
  │
  ├──[role determines]──→ Dashboard sub-component (Employee/Manager/Admin)
  │
  └──[userId filters]──→ EmployeeSkillRecord (own skills)
                           │
                           └──[aggregated into]──→ DashboardWidgetData (role-specific)
```

---

## Mock Data: employee-skills.json

Pre-populated skill records for demo users. Includes stale skills for demo purposes.

| userId | Skills Count | Notes |
|---|---|---|
| User 1 (Employee) | 5 skills | Mix of Approved, Pending, Draft; 1 stale skill (lastUpdated 8 months ago) |
| User 2 (Employee) | 4 skills | All Approved; no stale |
| User 3 (Employee) | 3 skills | 1 with all 4 rating sources (High confidence demo) |
| User 10 (Expert Employee) | 6 skills | All Expert-level; multiple certifications |
| User 7 (Manager) | 4 skills | Mix of levels |
| User 9 (Admin) | 3 skills | Mix of levels |

## Mock Data: skill-test-attempts.json

Pre-populated test attempts for progress chart demos.

| userId | Attempts | Notes |
|---|---|---|
| User 1 | 8 attempts | Multiple attempts per skill showing progress over time |
| User 2 | 5 attempts | Steady improvement trend |
| User 10 | 12 attempts | Multiple skills with Expert scores; "Improved by 20%" badge demo |
