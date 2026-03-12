# Data Model: Skill Assessments Module

**Feature**: 004-skill-assessments  
**Date**: 2026-03-12  
**Source**: Feature specification + constitution mock data schemas

---

## Entity Relationship Overview

```
SkillExam 1──* ExamQuestion        (each exam has 5–10 questions)
AssessmentAttempt *──1 User         (each attempt belongs to one user)
AssessmentAttempt *──1 SkillExam    (each attempt targets one skill's exam)
ScoreCard 1──1 AssessmentAttempt    (computed after submission, not persisted separately)
```

---

## Entities

### 1. SkillExam

Represents the set of assessment questions for a particular skill. Read-only from `skill-exams.json`.

```typescript
// src/app/shared/models/skill-exam.model.ts

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ExamQuestion {
  questionId: string;
  questionText: string;
  options: string[];                    // Exactly 4 options
  correctAnswer: string;               // Must match one of the options
  difficultyLevel: DifficultyLevel;
}

export interface SkillExam {
  skillId: string;
  questions: ExamQuestion[];            // 5–10 questions per skill
}
```

**Validation Rules**:
- `questions.length` must be between 5 and 10 (if fewer than 5 or more than 10, present all available)
- `options` must contain exactly 4 items
- `correctAnswer` must be one of the `options` values
- `difficultyLevel` must be one of `'Easy' | 'Medium' | 'Hard'`

**JSON Source**: `/assets/mock-data/skill-exams.json`

---

### 2. AssessmentAttempt

Represents a single completed test attempt by an employee for a specific skill. Stored in `skill-test-attempts.json`.

```typescript
// src/app/shared/models/assessment-attempt.model.ts

export interface AssessmentAttempt {
  attemptId: string;                    // Unique identifier (UUID)
  userId: string;                       // Reference to users.json
  skillId: string;                      // Reference to skill-exams.json
  score: number;                        // Percentage (0–100)
  earnedPoints: number;                 // Sum of difficulty-weighted correct answers
  maxPoints: number;                    // Sum of all question difficulty weights
  date: string;                         // ISO 8601 datetime (e.g., "2026-03-12T14:30:00Z")
  timeTaken: number;                    // Seconds from start to submission
}
```

**Validation Rules**:
- `score` must be 0–100
- `earnedPoints` must be ≤ `maxPoints`
- `maxPoints` must be > 0
- `timeTaken` must be ≤ 900 (15 minutes in seconds)
- `date` must be a valid ISO 8601 datetime string

**JSON Source**: `/assets/mock-data/skill-test-attempts.json`

---

### 3. AssessmentStatus (Derived)

A computed state per employee-skill pair — not stored, derived from attempt history.

```typescript
// src/app/shared/models/assessment-status.model.ts

export type AssessmentStatus = 'Not Attempted' | 'In Progress' | 'Completed';
```

**Derivation Rules**:
- `'Not Attempted'`: No entries in `skill-test-attempts.json` for this user + skill combination
- `'In Progress'`: Assessment is currently being taken (active in NgRx `activeAssessment` state)
- `'Completed'`: At least one submitted attempt exists for this user + skill combination

---

### 4. ActiveAssessment (Transient State)

Represents the in-progress assessment session. Exists only in NgRx state; never persisted.

```typescript
// src/app/core/store/assessments/assessments.state.ts

export interface ActiveAssessmentState {
  skillId: string;
  exam: SkillExam;
  shuffledQuestionIds: string[];         // Question IDs in randomized order
  currentQuestionIndex: number;          // 0-based index into shuffledQuestionIds
  answers: Record<string, string>;       // { [questionId]: selectedAnswer }
  timerDeadline: number;                 // Epoch ms when timer expires (startTime + 900000)
  timerRemaining: number;                // Seconds remaining (updated by effect each second)
  submitted: boolean;                    // Prevents double-submit
}
```

**State Transitions**:
```
null → ActiveAssessment      (startAssessment action)
  → Update currentQuestionIndex  (nextQuestion / previousQuestion actions)
  → Update answers[questionId]   (selectAnswer action)
  → Update timerRemaining        (timerTick action)
  → submitted = true             (submitAssessment / timerExpired actions)
ActiveAssessment → null      (clearActiveAssessment on navigation away or result viewed)
```

---

### 5. ScoreCard (Computed)

A computed result displayed after each assessment. Not a stored entity — derived from attempt data, certification data, and project data via an NgRx selector.

```typescript
// src/app/shared/models/score-card.model.ts

import { ProficiencyLevel } from './proficiency-level.model';

export interface ScoreCard {
  testScore: number;                     // Percentage (0–100)
  earnedPoints: number;                  // Difficulty-weighted earned points
  maxPoints: number;                     // Maximum possible difficulty-weighted points
  certificationBonus: boolean;           // true if valid cert exists for skill
  projectExperienceBonus: boolean;       // true if skill tagged on completed project
  systemRating: number;                  // Percentage (0–100)
  finalRating: number | null;            // null if sources incomplete ("Awaiting manager review")
  level: ProficiencyLevel;              // Mapped from systemRating
  previousLevel: ProficiencyLevel | null; // Previous level before this attempt
  levelChanged: boolean;                 // true if level differs from previous
  levelDirection: 'up' | 'down' | 'none'; // Direction of level change
}
```

---

### 6. ProficiencyLevel (Shared — reused from Phase 3)

```typescript
// src/app/shared/models/proficiency-level.model.ts (already exists from Phase 3)

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
```

**Level Mapping** (from constitution):
| Score Percentage | Level |
|---|---|
| 0 – 40% | Beginner |
| 41 – 65% | Intermediate |
| 66 – 85% | Advanced |
| 86 – 100% | Expert |

---

## NgRx State Slice

```typescript
// src/app/core/store/assessments/assessments.state.ts

export interface AssessmentsState {
  exams: SkillExam[];                     // All available exams
  attempts: AssessmentAttempt[];          // All past attempts for current user
  examsLoading: boolean;
  attemptsLoading: boolean;
  error: string | null;
  activeAssessment: ActiveAssessmentState | null;
}

export const initialAssessmentsState: AssessmentsState = {
  exams: [],
  attempts: [],
  examsLoading: false,
  attemptsLoading: false,
  error: null,
  activeAssessment: null,
};
```

---

## Scoring Utility Functions

```typescript
// src/app/shared/utils/scoring.util.ts

export const DIFFICULTY_POINTS: Record<DifficultyLevel, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function calculateWeightedScore(
  questions: ExamQuestion[],
  answers: Record<string, string>
): { earnedPoints: number; maxPoints: number; testScore: number } {
  let earnedPoints = 0;
  let maxPoints = 0;
  for (const q of questions) {
    const points = DIFFICULTY_POINTS[q.difficultyLevel];
    maxPoints += points;
    if (answers[q.questionId] === q.correctAnswer) {
      earnedPoints += points;
    }
  }
  const testScore = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
  return { earnedPoints, maxPoints, testScore };
}

export function calculateSystemRating(
  testScore: number,
  hasCertification: boolean,
  hasProjectExperience: boolean
): number {
  const certBonus = hasCertification ? 100 : 0;
  const projectBonus = hasProjectExperience ? 100 : 0;
  return (testScore * 0.60) + (certBonus * 0.20) + (projectBonus * 0.20);
}

export function mapScoreToLevel(scorePercentage: number): ProficiencyLevel {
  if (scorePercentage >= 86) return 'Expert';
  if (scorePercentage >= 66) return 'Advanced';
  if (scorePercentage >= 41) return 'Intermediate';
  return 'Beginner';
}
```

---

## Cross-Feature Data Dependencies

| Data Source | Feature Owner | Usage in This Feature |
|---|---|---|
| `skill-exams.json` | Phase 4 (this feature) | Primary: exam questions |
| `skill-test-attempts.json` | Phase 4 (this feature) | Primary: attempt history, retake check |
| `employee-skills.json` | Phase 3 | Read: update systemRating after assessment |
| `certifications.json` | Phase 5 | Read: check if valid cert exists for certification bonus |
| `projects.json` | Phase 7 | Read: check if skill tagged on completed project |
| `project-assignments.json` | Phase 7 | Read: check if user assigned to project with skill |
| `skill-definitions.json` | Phase 2 | Read: skill name/category for display in list |
| `skill-categories.json` | Phase 2 | Read: category names for filter dropdown |
