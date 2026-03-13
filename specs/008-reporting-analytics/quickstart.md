# Quickstart: Reporting and Analytics Module

**Feature**: 008-reporting-analytics
**Date**: 2026-03-13

---

## Prerequisites

- Phase 1 (Mock Auth, RBAC, Navigation) must be implemented — route guards, session store, MockApiInterceptor.
- Phase 2 (Skill Framework Admin) must be implemented — skill-definitions.json and skill-categories.json data.
- Phase 3 (Employee Skill Profile Dashboard) must be implemented — employee-skills.json data and My Skills feature.
- Phase 4 (Skill Assessments) must be implemented — skill-test-attempts.json data (required for trends).
- Phase 7 (Project Management) must be implemented — projects.json, project-assignments.json data (required for gap analysis).

---

## 1. Install Dependencies

```bash
# ngx-charts for chart rendering (heatmap, line, bar charts)
npm install @swimlane/ngx-charts

# SheetJS for Excel/CSV export
npm install xlsx

# html2canvas for PNG export and chart-to-image for PDF embedding
npm install html2canvas

# jsPDF + AutoTable should already be installed from Phase 7
# If not: npm install jspdf jspdf-autotable
```

---

## 2. Scaffold Components

```bash
# Reports landing page
ng g c features/reports/reports-landing --standalone --skip-tests=false

# Skill Gap Analysis report
ng g c features/reports/gap-analysis --standalone --skip-tests=false

# Team Capability report
ng g c features/reports/team-capability --standalone --skip-tests=false

# Org Skill Heatmap (Admin only)
ng g c features/reports/org-heatmap --standalone --skip-tests=false

# Skill Trend Analysis
ng g c features/reports/skill-trends --standalone --skip-tests=false

# Shared responsive chart wrapper
ng g c shared/components/chart-wrapper --standalone --skip-tests=false
```

---

## 3. Scaffold Services

```bash
# Report computation services
ng g s features/reports/services/gap-analysis
ng g s features/reports/services/team-capability
ng g s features/reports/services/heatmap
ng g s features/reports/services/trend-analysis

# Shared export service (if not already created)
ng g s core/services/export
```

---

## 4. Create NgRx Store Files

Create manually under `src/app/features/reports/store/`:

- `reports.actions.ts` — actions for loading each report type, export triggers
- `reports.reducer.ts` — ReportsState with four sub-states (gap, capability, heatmap, trends)
- `reports.effects.ts` — effects that call services and dispatch success/failure
- `reports.selectors.ts` — memoized selectors for each report type's data, loading, and error states

---

## 5. Create Shared Models

Create `src/app/shared/models/report.models.ts` with interfaces:

- `SkillGapRecord`
- `TeamCapabilitySnapshot`
- `HeatmapCell` / `HeatmapChartData`
- `SkillTrendPoint` / `TrendChartData`
- `ExportMetadata`

See [data-model.md](data-model.md) for full interface definitions.

---

## 6. Configure Routes

Add to `src/app/features/reports/reports.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/auth/auth.guard';
import { RoleGuard } from '../../core/auth/role.guard';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { reportsReducer } from './store/reports.reducer';
import { ReportsEffects } from './store/reports.effects';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState('reports', reportsReducer),
      provideEffects(ReportsEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./reports-landing/reports-landing.component').then(
            (m) => m.ReportsLandingComponent
          ),
      },
      {
        path: 'skill-gap',
        loadComponent: () =>
          import('./gap-analysis/gap-analysis.component').then(
            (m) => m.GapAnalysisComponent
          ),
      },
      {
        path: 'team',
        loadComponent: () =>
          import('./team-capability/team-capability.component').then(
            (m) => m.TeamCapabilityComponent
          ),
      },
      {
        path: 'heatmap',
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] },
        loadComponent: () =>
          import('./org-heatmap/org-heatmap.component').then(
            (m) => m.OrgHeatmapComponent
          ),
      },
      {
        path: 'trends',
        loadComponent: () =>
          import('./skill-trends/skill-trends.component').then(
            (m) => m.SkillTrendsComponent
          ),
      },
    ],
  },
];
```

Add to `src/app/app.routes.ts`:

```typescript
{
  path: 'reports',
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['Manager', 'Admin'] },
  loadChildren: () =>
    import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
},
```

---

## 7. Prioritised Implementation Order

| Priority | File | Description |
|---|---|---|
| 1 | `shared/models/report.models.ts` | Define all report interfaces |
| 2 | `features/reports/store/reports.actions.ts` | Define NgRx actions |
| 3 | `features/reports/store/reports.reducer.ts` | Define ReportsState and reducer |
| 4 | `features/reports/services/gap-analysis.service.ts` | Gap computation logic |
| 5 | `features/reports/services/team-capability.service.ts` | Team aggregation logic |
| 6 | `features/reports/services/heatmap.service.ts` | Heatmap count logic |
| 7 | `features/reports/services/trend-analysis.service.ts` | Quarter grouping logic |
| 8 | `features/reports/store/reports.effects.ts` | Wire services to NgRx |
| 9 | `features/reports/store/reports.selectors.ts` | Memoized selectors |
| 10 | `core/services/export.service.ts` | PDF/Excel/CSV/PNG export |
| 11 | `shared/components/chart-wrapper/` | Responsive chart container |
| 12 | `features/reports/reports-landing/` | Navigation hub with tabs/cards |
| 13 | `features/reports/gap-analysis/` | Gap report UI + table + export |
| 14 | `features/reports/team-capability/` | Team report UI + filters + export |
| 15 | `features/reports/org-heatmap/` | Heatmap grid + export |
| 16 | `features/reports/skill-trends/` | Line chart + export |
| 17 | `features/reports/reports.routes.ts` | Route configuration |

---

## 8. Key Design References

- **Chart library**: ngx-charts (see [research.md](research.md) §1)
- **Export strategy**: jsPDF + SheetJS + html2canvas (see [research.md](research.md) §2)
- **Data model**: All computed interfaces in [data-model.md](data-model.md)
- **API contract**: Mock endpoints in [contracts/mock-api-contract.md](contracts/mock-api-contract.md)
- **Constitution**: Responsive rules §18.3, RBAC matrix, route guard matrix
