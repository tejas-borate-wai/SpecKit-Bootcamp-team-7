# Technical Research: Project Management, Candidate Matching & Team Builder

**Feature**: 007-project-mgmt-team-builder  
**Date**: 2026-03-13  
**Status**: Complete  
**Context**: Angular 17+ SPA, NgRx 17+ for state, Angular Material or PrimeNG UI, TypeScript strict mode, SCSS, mock-first architecture (no backend), data from JSON via HttpClient interceptors. Depends on Phase 1 (auth/RBAC), Phase 2 (skill library), Phase 3 (skill profiles/staleness), Phase 4 (assessments/system rating), Phase 5 (certifications/expiry), Phase 6 (validation/final ratings).

---

## 1. Candidate Match Score Calculation Algorithm

### Decision

Implement the match score calculation as a **pure utility function** in `src/app/core/services/candidate-matching.service.ts`. The function accepts a project's required skills (with minimum proficiency levels) and an employee's skill profile, excludes stale and expired-certification skills, and returns a `CandidateMatchResult` containing the match score percentage, matched/total counts, and per-skill breakdown.

### Rationale

The formula `Match Score = (Skills Matched / Skills Required) × 100` is straightforward but requires careful handling of:
- **Skill matching criteria**: A skill is "matched" only when the employee's proficiency level meets or exceeds the required minimum. Level comparison uses the numeric scale: Beginner(1) < Intermediate(2) < Advanced(3) < Expert(4).
- **Stale skill exclusion**: Skills with `lastUpdated` older than 6 months from the current date are excluded from matching entirely — they contribute neither positively nor negatively.
- **Expired certification exclusion**: If a skill's rating was boosted by a certification that has since expired, the expired certification no longer contributes to the system rating, potentially lowering the effective proficiency level.
- **Edge case — zero required skills**: Should never occur per FR-002 validation, but defensively returns 0%.
- **Edge case — employee has none of the required skills**: Match score = 0%, all skills show "Below" status.

### Alternatives Considered

- **Weighted match score** (weight by proficiency gap magnitude): Rejected — the spec explicitly defines a simple ratio formula. Weighting adds complexity that contradicts the specification.
- **Fuzzy matching** (partial credit for "close" proficiency): Rejected — the spec requires binary Meets/Exceeds/Below determination per skill. Partial credit is not in scope.

### Implementation Pattern

```typescript
interface RequiredSkillInput {
  skillId: string;
  minimumLevel: ProficiencyLevel; // 1 | 2 | 3 | 4
}

interface CandidateMatchResult {
  userId: string;
  userName: string;
  department: string;
  matchScore: number;           // 0–100
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

function calculateMatchScore(
  requiredSkills: RequiredSkillInput[],
  employeeSkills: EmployeeSkill[],
  sixMonthsAgo: Date
): { matchScore: number; matchedCount: number; breakdown: SkillBreakdownEntry[] } {
  const nonStaleSkills = employeeSkills.filter(
    s => new Date(s.lastUpdated) >= sixMonthsAgo
  );
  let matchedCount = 0;
  const breakdown: SkillBreakdownEntry[] = requiredSkills.map(req => {
    const empSkill = nonStaleSkills.find(s => s.skillId === req.skillId);
    const candidateLevel = empSkill?.level ?? null;
    const candidateNumeric = proficiencyToNumeric(candidateLevel);
    const status = candidateLevel === null || candidateNumeric < req.minimumLevel
      ? 'Below'
      : candidateNumeric > req.minimumLevel ? 'Exceeds' : 'Meets';
    if (status !== 'Below') matchedCount++;
    return { skillId: req.skillId, skillName: '', requiredLevel: req.minimumLevel,
             candidateLevel, status, isStale: false };
  });
  const matchScore = requiredSkills.length > 0
    ? (matchedCount / requiredSkills.length) * 100 : 0;
  return { matchScore, matchedCount, breakdown };
}
```

---

## 2. Candidate Ranking with Availability Tiebreaking

### Decision

Implement a two-tier sorting strategy: primary sort by match score descending, secondary sort by availability status (Available first, Partially Available second, Busy last), tertiary sort alphabetically by name for final tiebreaking.

### Rationale

The spec (FR-010) requires: "candidates MUST be ordered: Available first, Partially Available second, Busy last" within the same match score. Adding alphabetical name sorting as a stable tiebreaker ensures deterministic ordering when score and availability are identical.

### Implementation Pattern

```typescript
function rankCandidates(candidates: CandidateMatchResult[]): CandidateMatchResult[] {
  const availabilityOrder: Record<AvailabilityStatus, number> = {
    'Available': 0,
    'Partially Available': 1,
    'Busy': 2
  };
  return [...candidates].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (availabilityOrder[a.availability] !== availabilityOrder[b.availability])
      return availabilityOrder[a.availability] - availabilityOrder[b.availability];
    return a.userName.localeCompare(b.userName);
  });
}
```

### Alternatives Considered

- **Single-dimension sort** (score only, ignore availability): Rejected — spec explicitly mandates availability-based secondary sorting.
- **Availability as primary sort**: Rejected — spec ranks by score first, availability breaks ties.

---

## 3. Skill Gap Detection and Learning Path Suggestions

### Decision

Implement skill gap detection in `skill-gap.service.ts` as a function that accepts required skills for a project and the full employee pool, identifies skills where no employee meets the minimum proficiency, calculates the gap percentage, and returns the closest employees as learning path candidates.

### Rationale

A "skill gap" exists when the highest available proficiency level across all employees for a given skill is still below the project's required minimum level. The gap percentage is calculated as:

```
Gap % = ((requiredLevel - highestAvailableLevel) / requiredLevel) × 100
```

For learning path suggestions, employees are ranked by their current level for the gap skill — closest-to-requirement first. The suggestion is informational text only (no LMS integration per the Out of Scope section).

### Implementation Pattern

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
  levelGap: number;
}

function detectSkillGaps(
  requiredSkills: RequiredSkillInput[],
  allEmployeeSkills: EmployeeSkillProfile[],
  sixMonthsAgo: Date
): SkillGapResult[] {
  return requiredSkills
    .map(req => {
      const candidates = allEmployeeSkills
        .flatMap(e => e.skills
          .filter(s => s.skillId === req.skillId && new Date(s.lastUpdated) >= sixMonthsAgo)
          .map(s => ({ userId: e.userId, level: proficiencyToNumeric(s.level) }))
        )
        .sort((a, b) => b.level - a.level);
      const highest = candidates[0]?.level ?? 0;
      if (highest >= req.minimumLevel) return null; // Not a gap
      return {
        skillId: req.skillId, skillName: '',
        requiredLevel: req.minimumLevel,
        highestAvailableLevel: highest > 0 ? highest as ProficiencyLevel : null,
        gapPercentage: ((req.minimumLevel - highest) / req.minimumLevel) * 100,
        nearestEmployees: candidates.slice(0, 3).map(c => ({
          userId: c.userId, name: '', currentLevel: c.level as ProficiencyLevel,
          levelGap: req.minimumLevel - c.level
        }))
      };
    })
    .filter((g): g is SkillGapResult => g !== null);
}
```

### Alternatives Considered

- **Percentage-based gap using rating scores**: Rejected — spec defines gap in terms of proficiency levels (Beginner/Intermediate/Advanced/Expert), not raw rating percentages.
- **Organizational-level gap analysis**: Rejected — that's Phase 8 (Reporting). This feature's gap detection is project-scoped.

---

## 4. Client-Side PDF Export for Candidate Matching Results

### Decision

Use **jsPDF + jsPDF-AutoTable** for generating structured PDF reports of matched candidates. The PDF includes: report title, generation date, generating user's name, project details, and a ranked candidate table with match scores and skill breakdowns.

### Rationale

The spec requires PDF export of matched candidates (FR-014, SC-008). Options evaluated:

| Approach | Pros | Cons |
|---|---|---|
| **window.print()** | Zero dependencies | Cannot control layout precisely; user must interact with print dialog; no programmatic download |
| **jsPDF + jsPDF-AutoTable** | Programmatic PDF generation; table support out of the box; no server needed; npm installable | Adds ~250KB bundle size; learning curve for complex layouts |
| **pdfmake** | Declarative document definition; good table support | ~300KB bundle; steeper API for custom styling |
| **html2canvas + jsPDF** | Renders exact HTML to PDF | Slow for large tables; quality issues with text rendering; heavy (~400KB) |

jsPDF + jsPDF-AutoTable provides the best balance of bundle size, table rendering capability, and simplicity for the structured report format needed.

### Implementation Pattern

```typescript
// pdf-export.service.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function exportCandidateReport(
  projectName: string,
  candidates: CandidateMatchResult[],
  generatedBy: string
): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(`Candidate Matching Report — ${projectName}`, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | By: ${generatedBy}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Rank', 'Candidate', 'Department', 'Match Score', 'Availability', 'Skills Met']],
    body: candidates.map((c, i) => [
      i + 1, c.userName, c.department,
      `${c.matchScore.toFixed(0)}%`, c.availability,
      `${c.matchedCount}/${c.totalRequired}`
    ]),
  });

  doc.save(`candidates-${projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
```

### Alternatives Considered

See table above. **window.print()** deemed insufficient for controlled layout; **pdfmake** larger than needed; **html2canvas** too slow and quality-lossy.

---

## 5. Employee Availability State Machine

### Decision

Model availability as a simple state machine with three states (Available, Partially Available, Busy) and well-defined automatic and manual transitions. Implement in `availability.service.ts` with NgRx actions for each transition.

### Rationale

The spec defines exact transition rules (FR-016, FR-017, FR-020–FR-022):

```
States: Available | Partially Available | Busy

Automatic Transitions:
  Assign to project → Busy         (FR-016)
  Project Completed → Available    (FR-017)

Manual Transitions:
  Employee self-set → Partially Available  (FR-021)
  Manager override → any state             (FR-022, logged reason required)
```

The state machine is simple enough to implement as reducer logic without a formal state machine library. Each transition is an NgRx action dispatched by the relevant effect.

### Implementation Pattern

```typescript
// NgRx actions
export const assignToProject = createAction(
  '[Availability] Assign To Project',
  props<{ userId: string; projectId: string; role: string }>()
);
export const completeProject = createAction(
  '[Availability] Complete Project',
  props<{ projectId: string }>()
);
export const selfSetPartiallyAvailable = createAction(
  '[Availability] Self Set Partially Available',
  props<{ userId: string }>()
);
export const managerOverride = createAction(
  '[Availability] Manager Override',
  props<{ userId: string; newStatus: AvailabilityStatus; reason: string; overriddenBy: string }>()
);
```

### Alternatives Considered

- **XState finite state machine**: Rejected — overkill for 3 states and 4 transitions. Simple reducer logic is sufficient and avoids an additional dependency.
- **Service-local state**: Rejected — availability must be shared across matching, team builder, and alignment views. NgRx is the correct location per constitution principle III.

---

## 6. Project Data Model for Mock Interceptor

### Decision

Extend the `MockApiInterceptor` to handle project and assignment CRUD endpoints, following the URL convention from the constitution. Use the `projects.json` and `project-assignments.json` schemas already defined in the constitution's Mock Data Specification.

### Rationale

The constitution defines the interceptor URL pattern:
- `GET/POST/PUT/DELETE /api/projects` → projects.json
- `GET/POST/DELETE /api/project-assignments` → project-assignments.json

For project creation validation (duplicate name check), the interceptor compares incoming project name against existing projects (case-insensitive) and returns HTTP 409 if a duplicate is found.

The `requiredSkills` field in `projects.json` needs to be extended from the constitution's simple `["skillId"]` array to include minimum proficiency per skill:

```jsonc
"requiredSkills": [
  { "skillId": "skill-angular", "minimumLevel": 3 },
  { "skillId": "skill-typescript", "minimumLevel": 2 }
]
```

Similarly, `requiredRoles` needs to be extended from `["string"]` to include headcount:

```jsonc
"requiredRoles": [
  { "roleTitle": "Frontend Developer", "headcount": 2 },
  { "roleTitle": "QA Engineer", "headcount": 1 }
]
```

These extensions are additive and backward-compatible with the constitution's schema definitions.

### Alternatives Considered

- **Keep requiredSkills as string array**: Rejected — the spec explicitly requires minimum proficiency per skill for matching. A flat ID list cannot express this.
- **Separate requiredSkillDetails endpoint**: Rejected — unnecessary API fragmentation for a mock app; embedding details in the project record is simpler and more realistic.

---

## 7. Responsive Layout Strategy for Candidate Matching

### Decision

Implement the candidate matching screen using a responsive layout with CSS Grid and `BreakpointObserver`:
- **Desktop (≥1024px)**: Two-column layout — filters panel fixed on the left (280px), candidate card grid on the right
- **Tablet (768–1023px)**: Full-width card list with a filter button that opens a slide-in panel
- **Mobile (<768px)**: Full-width stacked cards with a FAB filter button that opens a bottom sheet

### Rationale

This directly maps to the constitution's Section 18.3 component behavior for "Candidate match": Desktop=Side-by-side, Tablet=Side-by-side (adapted to filter button for better space use), Mobile=Stacked. The spec (FR-012) requires department, availability, and minimum match score filters, making a persistent filter panel on desktop and a collapsible one on smaller screens the appropriate UX pattern.

### Implementation Pattern

```scss
// candidate-match.component.scss
.match-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}
```

The `BreakpointObserver` in the component controls whether filters render inline or in a modal/bottom-sheet, using the central `breakpoints.ts` constants.

### Alternatives Considered

- **Always-visible filters on all breakpoints**: Rejected — consumes too much space on mobile.
- **Dropdown-based filters only (no panel)**: Rejected — three filter criteria benefit from a dedicated panel on desktop for discoverability.

---

## 8. Project Ownership and RBAC for Edit/Delete

### Decision

Implement ownership-based access control for project edit/delete operations: Managers can only modify projects where `createdBy === currentUser.id`; Admins can modify any project. Use a combination of route-level `RoleGuard` and template-level `@if` for action button visibility.

### Rationale

Per FR-003: "Managers MUST be able to edit and delete only their own projects. Admins MUST be able to edit and delete any project." This requires dual enforcement:
1. **UI layer**: `@if(project.createdBy === currentUserId || currentUserRole === 'Admin')` to conditionally render Edit/Delete buttons
2. **Interceptor layer**: The mock interceptor validates that `DELETE /api/projects/:id` and `PUT /api/projects/:id` return 403 if the requesting user is a Manager and not the project creator

### Alternatives Considered

- **UI-only enforcement**: Rejected — violates constitution principle II (RBAC must exist at both guard and interceptor level).
- **Owner field as a separate permissions table**: Rejected — over-engineering for a mock app; the `createdBy` field on the project record is sufficient.

---

## Resolved Clarifications

| Original Unknown | Resolution | Source |
|---|---|---|
| PDF export approach | jsPDF + jsPDF-AutoTable client-side generation | Research §4 |
| RequiredSkills schema extension | Array of `{skillId, minimumLevel}` objects (not flat IDs) | Research §6 |
| RequiredRoles schema extension | Array of `{roleTitle, headcount}` objects (not flat strings) | Research §6 |
| Availability state transitions | 3-state machine: Available/Partially Available/Busy with 4 transitions | Research §5 |
| Duplicate project name detection | Case-insensitive comparison in interceptor; HTTP 409 on conflict | Research §8, Spec assumptions |
| Stale skill definition for matching | Skills with `lastUpdated` > 6 months ago are excluded | Research §1, Spec FR-008 |
| Candidate sorting tiebreaker | Score desc → availability order → alpha by name | Research §2 |
| Skill gap percentage formula | `((requiredLevel - highestAvailableLevel) / requiredLevel) × 100` | Research §3 |
| Learning path suggestion scope | Informational text only; no LMS integration | Spec Out of Scope |
| Multi-project assignment | Not supported — single project per employee in this phase | Spec Out of Scope/Assumptions |
