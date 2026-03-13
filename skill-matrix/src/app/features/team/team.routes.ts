import { Routes } from '@angular/router';

export const teamRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./team-skills-overview/team-skills-overview.component').then(
        (m) => m.TeamSkillsOverviewComponent
      ),
  },
  {
    path: 'skills/:userId',
    loadComponent: () =>
      import('./employee-profile/employee-profile.component').then(
        (m) => m.EmployeeProfileComponent
      ),
  },
  {
    path: 'validation',
    loadComponent: () =>
      import('./validation-queue/validation-queue.component').then(
        (m) => m.ValidationQueueComponent
      ),
  },
  {
    path: 'validation/:submissionId',
    loadComponent: () =>
      import('./validation-detail/validation-detail.component').then(
        (m) => m.ValidationDetailComponent
      ),
  },
];
