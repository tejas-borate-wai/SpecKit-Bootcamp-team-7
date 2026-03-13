import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { adminReducer } from './core/store/admin/admin.reducer';
import * as adminEffects from './core/store/admin/admin.effects';
import { skillsReducer } from './core/store/skills/skills.reducer';
import * as skillsEffects from './core/store/skills/skills.effects';
import { assessmentsReducer } from './core/store/assessments/assessments.reducer';
import * as assessmentsEffects from './core/store/assessments/assessments.effects';

// Placeholder component for routes not yet implemented
const placeholder = () =>
  import('./features/dashboard/dashboard.component').then(
    (m) => m.DashboardComponent
  );

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/auth/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // AuthGuard only — all roles
  {
    path: 'dashboard',
    canActivate: [authGuard],
    providers: [
      provideState('skills', skillsReducer),
      provideEffects(skillsEffects),
    ],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(
        m => m.dashboardRoutes
      ),
  },
  {
    path: 'my-skills',
    canActivate: [authGuard],
    providers: [
      provideState('skills', skillsReducer),
      provideEffects(skillsEffects),
    ],
    loadChildren: () =>
      import('./features/my-skills/my-skills.routes').then(
        m => m.mySkillsRoutes
      ),
  },
  {
    path: 'assessments',
    canActivate: [authGuard],
    providers: [
      provideState('assessments', assessmentsReducer),
      provideEffects(assessmentsEffects),
    ],
    loadChildren: () =>
      import('./features/assessments/assessments.routes').then(
        (m) => m.assessmentsRoutes
      ),
  },
  {
    path: 'certifications',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/certifications/certifications.routes').then(
        (m) => m.certificationsRoutes
      ),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notifications-list/notifications-list.component').then(
        (m) => m.NotificationsListComponent
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },

  // AuthGuard + RoleGuard — Manager, Admin
  {
    path: 'team',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    loadChildren: () =>
      import('./features/team/team.routes').then((m) => m.teamRoutes),
  },
  {
    path: 'projects',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    loadChildren: () =>
      import('./features/projects/projects.routes').then(
        (m) => m.projectsRoutes
      ),
  },

  // Reports — Manager/Admin for main, Admin only for heatmap
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    loadChildren: () =>
      import('./features/reports/reports.routes').then((m) => m.reportsRoutes),
  },

  // Admin only
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    providers: [
      provideState('admin', adminReducer),
      provideEffects(adminEffects),
    ],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },

  // Redirects
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
