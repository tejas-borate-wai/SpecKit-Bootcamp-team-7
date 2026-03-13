import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { roleGuard } from '../../core/auth/role.guard';
import { reportsReducer } from './store/reports.reducer';
import * as reportsEffects from './store/reports.effects';

export const reportsRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('reports', reportsReducer),
      provideEffects(reportsEffects),
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
        canActivate: [roleGuard],
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
