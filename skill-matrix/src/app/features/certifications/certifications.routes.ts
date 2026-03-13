import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authGuard } from '../../core/auth/auth.guard';
import { certificationsReducer } from '../../core/store/certifications/certifications.reducer';
import * as certificationsEffects from '../../core/store/certifications/certifications.effects';

export const certificationsRoutes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    providers: [
      provideState('certifications', certificationsReducer),
      provideEffects(certificationsEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./certifications-list/certifications-list.component').then(
            (m) => m.CertificationsListComponent
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./cert-upload/cert-upload.component').then(
            (m) => m.CertUploadComponent
          ),
      },
    ],
  },
];
