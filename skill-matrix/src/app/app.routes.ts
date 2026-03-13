import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

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
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'my-skills',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'add', loadComponent: placeholder },
      { path: ':skillId', loadComponent: placeholder },
      { path: ':skillId/assess', loadComponent: placeholder },
    ],
  },
  {
    path: 'assessments',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'history', loadComponent: placeholder },
      { path: ':skillId/results', loadComponent: placeholder },
    ],
  },
  {
    path: 'certifications',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'upload', loadComponent: placeholder },
      { path: ':certId', loadComponent: placeholder },
    ],
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: placeholder,
  },

  // AuthGuard + RoleGuard — Manager, Admin
  {
    path: 'team',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'validation-queue', loadComponent: placeholder },
      { path: 'employee/:userId', loadComponent: placeholder },
      { path: 'availability', loadComponent: placeholder },
    ],
  },
  {
    path: 'projects',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'create', loadComponent: placeholder },
      { path: ':projectId', loadComponent: placeholder },
      { path: ':projectId/match', loadComponent: placeholder },
      { path: ':projectId/team-builder', loadComponent: placeholder },
    ],
  },

  // Reports — Manager/Admin for main, Admin only for heatmap
  {
    path: 'reports',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Manager', 'Admin'] },
    children: [
      { path: '', loadComponent: placeholder },
      { path: 'gap-analysis', loadComponent: placeholder },
      { path: 'team-capability', loadComponent: placeholder },
      {
        path: 'heatmap',
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
        loadComponent: placeholder,
      },
    ],
  },

  // Admin only
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'framework', loadComponent: placeholder },
      { path: 'rating-config', loadComponent: placeholder },
      { path: 'employees', loadComponent: placeholder },
    ],
  },

  // Redirects
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
