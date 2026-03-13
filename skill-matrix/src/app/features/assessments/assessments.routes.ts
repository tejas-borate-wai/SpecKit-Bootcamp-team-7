import { Routes } from '@angular/router';

export const assessmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./assessments-list/assessments-list.component').then(
        (m) => m.AssessmentsListComponent
      ),
  },
  {
    path: ':skillId/take',
    loadComponent: () =>
      import('./take-assessment/take-assessment.component').then(
        (m) => m.TakeAssessmentComponent
      ),
  },
  {
    path: ':skillId/result',
    loadComponent: () =>
      import('./assessment-result/assessment-result.component').then(
        (m) => m.AssessmentResultComponent
      ),
  },
];
