import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { CertificationService } from '../../services/certification.service';
import { ToastService } from '../../../shared/services/toast.service';
import * as CertificationsActions from './certifications.actions';
import { selectCurrentUser } from '../session/session.selectors';
import { take } from 'rxjs/operators';

// ── Load Certifications ───────────────────────────────────────────────────────
export const loadCertificationsEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    service = inject(CertificationService)
  ) =>
    actions$.pipe(
      ofType(CertificationsActions.loadCertifications),
      exhaustMap(() =>
        store.select(selectCurrentUser).pipe(
          take(1),
          switchMap((user) => {
            const userId = user?.id ?? '';
            return service.getCertifications(userId).pipe(
              map((certifications) =>
                CertificationsActions.loadCertificationsSuccess({ certifications })
              ),
              catchError((err: { message?: string }) =>
                of(
                  CertificationsActions.loadCertificationsFailure({
                    error: err?.message ?? 'Failed to load certifications',
                  })
                )
              )
            );
          })
        )
      )
    ),
  { functional: true }
);

// ── Upload Certification ──────────────────────────────────────────────────────
export const uploadCertificationEffect = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(CertificationService),
    toast = inject(ToastService),
    router = inject(Router)
  ) =>
    actions$.pipe(
      ofType(CertificationsActions.uploadCertification),
      switchMap(({ payload }) =>
        service.createCertification(payload).pipe(
          tap(() => {
            toast.showSuccess('Certification uploaded successfully!');
            router.navigate(['/certifications']);
          }),
          map((certification) =>
            CertificationsActions.uploadCertificationSuccess({ certification })
          ),
          catchError((err: { message?: string }) =>
            of(
              CertificationsActions.uploadCertificationFailure({
                error: err?.message ?? 'Failed to upload certification',
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

// ── Delete Certification ──────────────────────────────────────────────────────
export const deleteCertificationEffect = createEffect(
  (
    actions$ = inject(Actions),
    service = inject(CertificationService),
    toast = inject(ToastService)
  ) =>
    actions$.pipe(
      ofType(CertificationsActions.deleteCertification),
      switchMap(({ certId }) =>
        service.deleteCertification(certId).pipe(
          tap(() => toast.showSuccess('Certification removed.')),
          map(() => CertificationsActions.deleteCertificationSuccess({ certId })),
          catchError((err: { message?: string }) => {
            toast.showError(err?.message ?? 'Failed to delete certification');
            return of(
              CertificationsActions.loadCertificationsFailure({
                error: err?.message ?? 'Failed to delete certification',
              })
            );
          })
        )
      )
    ),
  { functional: true }
);

// ── Error Toast ───────────────────────────────────────────────────────────────
export const certificationErrorToastEffect = createEffect(
  (actions$ = inject(Actions), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(
        CertificationsActions.loadCertificationsFailure,
        CertificationsActions.uploadCertificationFailure
      ),
      map(({ error }) => {
        toast.showError(error ?? 'An error occurred.');
      })
    ),
  { functional: true, dispatch: false }
);
