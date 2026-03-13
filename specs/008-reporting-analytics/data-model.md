# Data Model: Reporting and Analytics Module

**Feature**: 008-reporting-analytics
**Date**: 2026-03-13

---

## Overview

All entities in this module are **computed / derived** — they are NOT persisted to any JSON file or NgRx store as raw data. They are calculated on-the-fly from existing mock data sources (employee-skills.json, projects.json, project-assignments.json, skill-definitions.json, skill-categories.json, skill-test-attempts.json, users.json) and stored in the NgRx `reports` feature slice as computed results.

---

## Entity Definitions

### 1. SkillGapRecord

A computed result showing the difference between a project-required skill level and the team's average level for that skill.

```typescript
interface SkillGapRecord {
  skillId: string;
  skillName: string;
  projectId: string;
  projectName: string;
  requiredLevelPercent: number;   // 25 | 50 | 75 | 100 (mapped from Beginner–Expert)
  teamAverageLevelPercent: number; // 0–100, computed mean across visible employees
  gapPercent: number;             // max(0, requiredLevelPercent - teamAverageLevelPercent)
  gapSeverity: 'none' | 'warning' | 'critical';  // none=0%, warning=1–49%, critical=≥50%
}
```

**Source Data**: projects.json (`requiredSkills`), employee-skills.json (`skills[].level`), skill-definitions.json (`skillName`)
**Computation**: See research.md §3 — Skill Gap Calculation Algorithm
**Relationships**: References Project (by projectId), SkillDefinition (by skillId)

---

### 2. TeamCapabilitySnapshot

A computed aggregation of proficiency data for a specific skill within a department.

```typescript
interface TeamCapabilitySnapshot {
  skillId: string;
  skillName: string;
  categoryId: string;
  categoryName: string;
  department: string;
  averageProficiencyPercent: number;  // 0–100, mean of proficiency % across employees
  employeeCount: number;              // number of employees who have this skill
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';  // mapped from average
}
```

**Source Data**: employee-skills.json, users.json (`department`), skill-definitions.json, skill-categories.json
**Computation**: See research.md §4 — Team Capability Aggregation Pattern
**Relationships**: References SkillDefinition (by skillId), SkillCategory (by categoryId)

---

### 3. HeatmapCell

A computed count for a specific skill × proficiency-level combination across the entire organisation.

```typescript
interface HeatmapCell {
  skillId: string;
  skillName: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  employeeCount: number;      // count of employees at this level for this skill
  intensityBucket: 'low' | 'medium' | 'high' | 'very-high';  // derived from count relative to max
}
```

**Source Data**: employee-skills.json (`skills[].level`), skill-definitions.json
**Computation**: See research.md §5 — Heatmap Data Computation
**Relationships**: References SkillDefinition (by skillId)

**ngx-charts Data Format**:
```typescript
// Transformed for ngx-charts heat-map component
interface HeatmapChartData {
  name: string;    // skillName (row)
  series: {
    name: string;  // proficiencyLevel (column: Beginner | Intermediate | Advanced | Expert)
    value: number; // employeeCount
  }[];
}
```

---

### 4. SkillTrendPoint

A historical data point for a skill's average proficiency within a team or organisation, grouped by calendar quarter.

```typescript
interface SkillTrendPoint {
  skillId: string;
  skillName: string;
  quarterLabel: string;        // e.g., "2025-Q1", "2025-Q2"
  averageScorePercent: number; // 0–100, mean of test attempt scores in this quarter
  attemptCount: number;        // number of attempts in this quarter (for confidence)
  scope: 'team' | 'org';      // whether this aggregation is team-scoped or org-wide
}
```

**Source Data**: skill-test-attempts.json (`date`, `score`), users.json (`department`), skill-definitions.json
**Computation**: See research.md §6 — Quarter Grouping for Trend Analysis
**Relationships**: References SkillDefinition (by skillId)

**ngx-charts Data Format**:
```typescript
// Transformed for ngx-charts line-chart component
interface TrendChartData {
  name: string;    // skillName (one line per skill)
  series: {
    name: string;  // quarterLabel (x-axis)
    value: number; // averageScorePercent (y-axis)
  }[];
}
```

---

### 5. ExportMetadata

Metadata included in every export file header (FR-020).

```typescript
interface ExportMetadata {
  reportTitle: string;       // e.g., "Skill Gap Analysis Report"
  generatedDate: string;     // YYYY-MM-DD format
  generatedByName: string;   // Full name of the current user (from session state)
}
```

---

## NgRx State Shape

### Reports Feature Slice

```typescript
interface ReportsState {
  gapAnalysis: {
    records: SkillGapRecord[];
    loading: boolean;
    error: string | null;
    selectedProjectId: string | null;  // optional project filter
  };
  teamCapability: {
    snapshots: TeamCapabilitySnapshot[];
    loading: boolean;
    error: string | null;
    selectedDepartment: string | null;  // Admin can switch; Manager locked
    selectedCategoryId: string | null;  // skill category filter
    viewMode: 'by-department' | 'by-category';
  };
  heatmap: {
    cells: HeatmapCell[];
    chartData: HeatmapChartData[];  // pre-transformed for ngx-charts
    loading: boolean;
    error: string | null;
  };
  trends: {
    points: SkillTrendPoint[];
    chartData: TrendChartData[];  // pre-transformed for ngx-charts
    loading: boolean;
    error: string | null;
    selectedDepartment: string | null;  // Admin filter
  };
}
```

**Registration**: Registered as a feature slice via `provideState('reports', reportsReducer)` in the reports feature routes.

---

## Proficiency Mapping (Shared Utility)

```typescript
const PROFICIENCY_TO_PERCENT: Record<string, number> = {
  'Beginner': 25,
  'Intermediate': 50,
  'Advanced': 75,
  'Expert': 100,
};

function proficiencyToPercent(level: string): number {
  return PROFICIENCY_TO_PERCENT[level] ?? 0;
}

function percentToProficiency(percent: number): string {
  if (percent >= 86) return 'Expert';
  if (percent >= 66) return 'Advanced';
  if (percent >= 41) return 'Intermediate';
  return 'Beginner';
}
```

---

## Existing Data Sources (Read-Only)

This module does NOT create or modify any JSON files. It reads from these existing sources:

| JSON File | Used For | Read Fields |
|---|---|---|
| employee-skills.json | Gap, Capability, Heatmap | `userId`, `skills[].skillId`, `skills[].level`, `skills[].finalRating` |
| projects.json | Gap Analysis | `projectId`, `name`, `requiredSkills`, `status` |
| project-assignments.json | Gap Analysis (team involvement) | `projectId`, `userId` |
| skill-definitions.json | All reports (skill names) | `skillId`, `skillName`, `categoryId` |
| skill-categories.json | Team Capability (category filter) | `categoryId`, `categoryName` |
| skill-test-attempts.json | Trend Analysis | `userId`, `skillId`, `score`, `date` |
| users.json | Data scoping (department) | `id`, `department`, `role` |

---

## Validation Rules

| Rule | Applies To | Description |
|---|---|---|
| Gap ≥ 0 | SkillGapRecord | `gapPercent = max(0, required - average)` — never negative |
| Average includes zeroes | SkillGapRecord, TeamCapabilitySnapshot | Employees missing a skill contribute 0% to the average |
| Quarter format | SkillTrendPoint | Must match pattern `YYYY-QN` where N ∈ {1, 2, 3, 4} |
| Export metadata required | ExportMetadata | All three fields (title, date, userName) must be non-empty |
| Heatmap Admin-only | HeatmapCell | Data is only computed when current user role is Admin |
| Scope enforcement | All | Manager data never includes employees outside their department |

---

## State Transitions

This module has no state machines — all entities are computed on demand and do not transition between states. Report data is recalculated fresh each time the user navigates to a report screen.
