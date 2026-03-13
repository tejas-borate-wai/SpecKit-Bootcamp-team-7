import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, switchMap, of, tap } from 'rxjs';
import { SessionActions } from './session.actions';
import { SessionUser } from '../../../shared/models/user.model';

export const loginEffect = createEffect(
  (
    actions$ = inject(Actions),
    http = inject(HttpClient),
    router = inject(Router)
  ) =>
    actions$.pipe(
      ofType(SessionActions.login),
      switchMap(({ credentials }) =>
        http.post<SessionUser>('/api/auth/login', credentials).pipe(
          map((user) => SessionActions.loginSuccess({ user })),
          catchError((error: HttpErrorResponse) =>
            of(SessionActions.loginFailure({
              error: error.error?.message ?? 'Invalid email or password',
            }))
          )
        )
      )
    ),
  { functional: true }
);

export const loginSuccessEffect = createEffect(
  (
    actions$ = inject(Actions),
    router = inject(Router)
  ) =>
    actions$.pipe(
      ofType(SessionActions.loginSuccess),
      tap(() => {
        const lastRoute = localStorage.getItem('skillmatrix_last_route');
        router.navigate([lastRoute ?? '/dashboard']);
      })
    ),
  { functional: true, dispatch: false }
);

export const logoutEffect = createEffect(
  (
    actions$ = inject(Actions),
    router = inject(Router)
  ) =>
    actions$.pipe(
      ofType(SessionActions.logout),
      tap(() => {
        localStorage.removeItem('skillmatrix_session');
        localStorage.removeItem('skillmatrix_last_route');
        router.navigate(['/login'], { replaceUrl: true });
      })
    ),
  { functional: true, dispatch: false }
);
