import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { projectsReducer } from '../../core/store/projects/projects.reducer';
import * as projectsEffects from '../../core/store/projects/projects.effects';

export const projectsRoutes: Routes = [
  {
    path: '',
    providers: [
      provideState('projects', projectsReducer),
      provideEffects(projectsEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent
          ),
      },
      {
        path: 'alignment',
        loadComponent: () =>
          import('./project-alignment/project-alignment.component').then(
            (m) => m.ProjectAlignmentComponent
          ),
      },
      {
        path: ':projectId',
        loadComponent: () =>
          import('./project-detail/project-detail.component').then(
            (m) => m.ProjectDetailComponent
          ),
      },
      {
        path: ':projectId/match',
        loadComponent: () =>
          import('./candidate-match/candidate-match.component').then(
            (m) => m.CandidateMatchComponent
          ),
      },
      {
        path: ':projectId/team-builder',
        loadComponent: () =>
          import('./team-builder/team-builder.component').then(
            (m) => m.TeamBuilderComponent
          ),
      },
    ],
  },
];
