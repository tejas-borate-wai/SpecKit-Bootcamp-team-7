# Quickstart: Project Management, Candidate Matching & Team Builder

**Feature**: 007-project-mgmt-team-builder  
**Date**: 2026-03-13

---

## Prerequisites

- Phases 1–6 implemented and working (auth, skill framework, skill profiles, assessments, certifications, peer validation)
- Angular CLI 17+ installed globally
- Node.js 18+ and npm available
- Mock data files in `/assets/mock-data/`: projects.json, project-assignments.json (must be created/extended)

---

## Quick Setup

### 1. Install Additional Dependency

```bash
npm install jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

### 2. Create/Verify Mock Data Files

Ensure these files exist in `src/assets/mock-data/`:

**projects.json** — Pre-populate with 3–5 sample projects:
```json
[
  {
    "projectId": "proj-001",
    "name": "Banking App Modernization",
    "description": "Modernize the legacy banking application",
    "status": "Open",
    "startDate": "2026-02-01",
    "deadline": "2026-08-31",
    "requiredSkills": [
      { "skillId": "skill-angular", "minimumLevel": 3 },
      { "skillId": "skill-typescript", "minimumLevel": 2 },
      { "skillId": "skill-docker", "minimumLevel": 2 }
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

**project-assignments.json** — Start with 1–2 sample assignments:
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

### 3. Generate Feature Components

```bash
# Feature components
ng generate component features/projects/projects-list --standalone
ng generate component features/projects/project-create --standalone
ng generate component features/projects/project-detail --standalone
ng generate component features/projects/candidate-match --standalone
ng generate component features/projects/candidate-match/match-breakdown --standalone
ng generate component features/projects/team-builder --standalone
ng generate component features/projects/team-builder/skill-gap-panel --standalone
ng generate component features/projects/team-builder/role-slot-card --standalone
ng generate component features/projects/project-alignment --standalone

# Core services
ng generate service core/services/project
ng generate service core/services/candidate-matching
ng generate service core/services/team-builder
ng generate service core/services/skill-gap
ng generate service core/services/availability
ng generate service core/services/pdf-export
```

### 4. Create Model Interfaces

Create the following files under `src/app/shared/models/`:
- `project.model.ts` — Project, RequiredSkill, RoleSlot, ProjectStatus
- `project-assignment.model.ts` — ProjectAssignment
- `candidate-match.model.ts` — CandidateMatchResult, SkillBreakdownEntry
- `skill-gap.model.ts` — SkillGapResult, NearestEmployee
- `availability.model.ts` — AvailabilityStatus, AvailabilityOverride

### 5. Set Up NgRx Feature Store

Create or extend `src/app/core/store/projects/`:
- `projects.state.ts` — ProjectsState interface
- `projects.actions.ts` — loadProjects, createProject, updateProject, deleteProject, assignToProject, runMatching, etc.
- `projects.reducer.ts` — Handler for each action
- `projects.effects.ts` — HTTP calls via services
- `projects.selectors.ts` — selectProjects, selectMatchResults, selectSkillGaps, etc.

Register the feature store in `projects.routes.ts` using `provideState`.

### 6. Add Routes

In `src/app/app.routes.ts`, add:
```typescript
{
  path: 'projects',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Manager', 'Admin'] },
  loadChildren: () =>
    import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES)
}
```

In `src/app/features/projects/projects.routes.ts`:
```typescript
export const PROJECTS_ROUTES: Routes = [
  { path: '', component: ProjectsListComponent },
  { path: 'create', component: ProjectCreateComponent },
  { path: 'team-builder', component: TeamBuilderComponent },
  { path: ':projectId', component: ProjectDetailComponent },
  { path: ':projectId/match', component: CandidateMatchComponent },
];
```

### 7. Extend MockApiInterceptor

Add handlers for:
- `GET/POST /api/projects`
- `GET/PUT/DELETE /api/projects/:projectId`
- `GET/POST/DELETE /api/project-assignments`
- `PATCH /api/users/:userId/availability`

### 8. Run and Verify

```bash
ng serve
```

1. Log in as a **Manager** user
2. Navigate to `/projects` → should see the project list
3. Click "Create Project" → fill form → submit → verify project appears in list
4. Open a project → click "Find Candidates" → verify match results display
5. Open Team Builder → assign an employee → verify availability changes to Busy
6. Log in as an **Employee** → verify `/projects` route redirects to `/unauthorized`

### 9. Run Tests

```bash
ng test --include='**/projects/**' --include='**/candidate-matching**' --include='**/skill-gap**'
```

---

## Key Files to Implement

| Priority | File | Purpose |
|---|---|---|
| 1 | `shared/models/project.model.ts` | TypeScript interfaces |
| 2 | `core/interceptors/mock-api.interceptor.ts` | Extend with project endpoints |
| 3 | `core/services/project.service.ts` | Project CRUD via HttpClient |
| 4 | `core/store/projects/*` | NgRx state management |
| 5 | `features/projects/projects.routes.ts` | Lazy-loaded routes |
| 6 | `features/projects/projects-list/*` | List with filters |
| 7 | `features/projects/project-create/*` | Create form with validation |
| 8 | `features/projects/project-detail/*` | View/edit project |
| 9 | `core/services/candidate-matching.service.ts` | Match score calculation |
| 10 | `features/projects/candidate-match/*` | Matching UI + breakdown |
| 11 | `core/services/pdf-export.service.ts` | PDF report generation |
| 12 | `core/services/team-builder.service.ts` | Role assignment logic |
| 13 | `features/projects/team-builder/*` | Team builder UI |
| 14 | `core/services/skill-gap.service.ts` | Gap detection + suggestions |
| 15 | `core/services/availability.service.ts` | Availability state management |
| 16 | `features/projects/project-alignment/*` | Alignment view UI |
