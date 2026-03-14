import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, switchMap, tap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SkillService } from '../../services/skill.service';
import { SkillLibraryService } from '../../services/skill-library.service';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../../shared/services/toast.service';
import * as SkillsActions from './skills.actions';

export const loadMySkillsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const skillService = inject(SkillService);
    return actions$.pipe(
      ofType(SkillsActions.loadMySkills),
      switchMap(({ userId }) =>
        skillService.getUserSkills(userId).pipe(
          map((record) => SkillsActions.loadMySkillsSuccess({ record })),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.loadMySkillsFailure({ error: err.error?.message ?? 'Failed to load skills.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const loadAllEmployeeSkillsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const skillService = inject(SkillService);
    return actions$.pipe(
      ofType(SkillsActions.loadAllEmployeeSkills),
      switchMap(() =>
        skillService.getAllEmployeeSkills().pipe(
          map((records) => SkillsActions.loadAllEmployeeSkillsSuccess({ records })),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.loadAllEmployeeSkillsFailure({ error: err.error?.message ?? 'Failed to load employee skills.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const loadSkillLibraryEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const libraryService = inject(SkillLibraryService);
    return actions$.pipe(
      ofType(SkillsActions.loadSkillLibrary),
      switchMap(() =>
        forkJoin({
          categories: libraryService.getCategories(),
          definitions: libraryService.getDefinitions(),
        }).pipe(
          map(({ categories, definitions }) => SkillsActions.loadSkillLibrarySuccess({ categories, definitions })),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.loadSkillLibraryFailure({ error: err.error?.message ?? 'Failed to load skill library.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const addSkillEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const skillService = inject(SkillService);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(SkillsActions.addSkill),
      exhaustMap(({ userId, skillId, selfRating }) =>
        skillService.addSkill(userId, skillId, selfRating).pipe(
          map((skill) => SkillsActions.addSkillSuccess({ skill })),
          tap(() => toast.showSuccess('Skill saved successfully.')),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.addSkillFailure({ error: err.error?.message ?? 'Failed to add skill.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const updateSkillRatingEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const skillService = inject(SkillService);
    return actions$.pipe(
      ofType(SkillsActions.updateSkillRating),
      switchMap(({ userId, skillId, selfRating }) =>
        skillService.updateSkillRating(userId, skillId, selfRating).pipe(
          map((skill) => SkillsActions.updateSkillRatingSuccess({ skill })),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.updateSkillRatingFailure({ error: err.error?.message ?? 'Failed to update skill rating.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

export const deleteSkillEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const skillService = inject(SkillService);
    return actions$.pipe(
      ofType(SkillsActions.deleteSkill),
      switchMap(({ userId, skillId }) =>
        skillService.deleteSkill(userId, skillId).pipe(
          map((res) => SkillsActions.deleteSkillSuccess({ skillId: res.skillId })),
          catchError((err: HttpErrorResponse) => {
            const msg = err.status === 409
              ? 'This skill is linked to an active project and cannot be deleted.'
              : (err.error?.message ?? 'Failed to delete skill.');
            return of(SkillsActions.deleteSkillFailure({ error: msg }));
          })
        )
      )
    );
  },
  { functional: true }
);

export const loadTestAttemptsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const dashboardService = inject(DashboardService);
    return actions$.pipe(
      ofType(SkillsActions.loadTestAttempts),
      switchMap(({ userId }) =>
        dashboardService.getTestAttempts(userId).pipe(
          map((attempts) => SkillsActions.loadTestAttemptsSuccess({ attempts })),
          catchError((err: HttpErrorResponse) =>
            of(SkillsActions.loadTestAttemptsFailure({ error: err.error?.message ?? 'Failed to load test attempts.' }))
          )
        )
      )
    );
  },
  { functional: true }
);
