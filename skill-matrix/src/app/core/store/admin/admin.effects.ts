import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ProficiencyLevel } from '../../../shared/models/proficiency-level.model';
import { RatingWeightConfig } from '../../../shared/models/rating-weight.model';
import { ToastService } from '../../../shared/services/toast.service';
import * as AdminActions from './admin.actions';

function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    return (err.error as { message?: string })?.message ?? err.message;
  }
  return 'An unexpected error occurred.';
}

export const loadCategoriesEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient)) =>
    actions$.pipe(
      ofType(AdminActions.loadCategories, AdminActions.loadSubcategories),
      switchMap(() =>
        http.get<SkillCategory[]>('/api/admin/categories').pipe(
          map((categories) => AdminActions.loadCategoriesSuccess({ categories })),
          catchError((err) => of(AdminActions.loadCategoriesFailure({ error: extractErrorMessage(err) })))
        )
      )
    ),
  { functional: true }
);

export const addCategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.addCategory),
      mergeMap(({ category }) =>
        http.post<SkillCategory>('/api/admin/categories', category).pipe(
          map((created) => {
            toast.showSuccess('Category added successfully.');
            return AdminActions.addCategorySuccess({ category: created });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.addCategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const updateCategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.updateCategory),
      mergeMap(({ category }) =>
        http.put<SkillCategory>(`/api/admin/categories/${category.categoryId}`, category).pipe(
          map((updated) => {
            toast.showSuccess('Category updated successfully.');
            return AdminActions.updateCategorySuccess({ category: updated });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.updateCategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const deleteCategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.deleteCategory),
      mergeMap(({ categoryId }) =>
        http.delete<void>(`/api/admin/categories/${categoryId}`).pipe(
          map(() => {
            toast.showSuccess('Category deleted successfully.');
            return AdminActions.deleteCategorySuccess({ categoryId });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.deleteCategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const addSubcategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.addSubcategory),
      mergeMap(({ categoryId, subCategory }) =>
        http.post<{ categoryId: string; subCategory: import('../../../shared/models/skill-category.model').SubCategory }>(
          `/api/admin/categories/${categoryId}/subcategories`, subCategory
        ).pipe(
          map((result) => {
            toast.showSuccess('Subcategory added successfully.');
            return AdminActions.addSubcategorySuccess({ categoryId: result.categoryId, subCategory: result.subCategory });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.addSubcategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const updateSubcategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.updateSubcategory),
      mergeMap(({ categoryId, subCategory }) =>
        http.put<{ categoryId: string; subCategory: import('../../../shared/models/skill-category.model').SubCategory }>(
          `/api/admin/categories/${categoryId}/subcategories/${subCategory.subCategoryId}`, subCategory
        ).pipe(
          map((result) => {
            toast.showSuccess('Subcategory updated successfully.');
            return AdminActions.updateSubcategorySuccess({ categoryId: result.categoryId, subCategory: result.subCategory });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.updateSubcategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const deleteSubcategoryEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.deleteSubcategory),
      mergeMap(({ categoryId, subCategoryId }) =>
        http.delete<void>(`/api/admin/categories/${categoryId}/subcategories/${subCategoryId}`).pipe(
          map(() => {
            toast.showSuccess('Subcategory deleted successfully.');
            return AdminActions.deleteSubcategorySuccess({ categoryId, subCategoryId });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.deleteSubcategoryFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const loadSkillDefinitionsEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient)) =>
    actions$.pipe(
      ofType(AdminActions.loadSkillDefinitions),
      switchMap(() =>
        http.get<SkillDefinition[]>('/api/admin/skill-definitions').pipe(
          map((skillDefinitions) => AdminActions.loadSkillDefinitionsSuccess({ skillDefinitions })),
          catchError((err) => of(AdminActions.loadSkillDefinitionsFailure({ error: extractErrorMessage(err) })))
        )
      )
    ),
  { functional: true }
);

export const addSkillDefinitionEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.addSkillDefinition),
      mergeMap(({ skillDefinition }) =>
        http.post<SkillDefinition>('/api/admin/skill-definitions', skillDefinition).pipe(
          map((created) => {
            toast.showSuccess('Skill added successfully.');
            return AdminActions.addSkillDefinitionSuccess({ skillDefinition: created });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.addSkillDefinitionFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const updateSkillDefinitionEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.updateSkillDefinition),
      mergeMap(({ skillDefinition }) =>
        http.put<SkillDefinition>(`/api/admin/skill-definitions/${skillDefinition.skillId}`, skillDefinition).pipe(
          map((updated) => {
            toast.showSuccess('Skill updated successfully.');
            return AdminActions.updateSkillDefinitionSuccess({ skillDefinition: updated });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.updateSkillDefinitionFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const loadProficiencyLevelsEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient)) =>
    actions$.pipe(
      ofType(AdminActions.loadProficiencyLevels),
      switchMap(() =>
        http.get<ProficiencyLevel[]>('/api/admin/proficiency-levels').pipe(
          map((levels) => AdminActions.loadProficiencyLevelsSuccess({ levels })),
          catchError((err) => of(AdminActions.loadProficiencyLevelsFailure({ error: extractErrorMessage(err) })))
        )
      )
    ),
  { functional: true }
);

export const updateProficiencyLevelEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.updateProficiencyLevel),
      mergeMap(({ level }) =>
        http.put<ProficiencyLevel>(`/api/admin/proficiency-levels/${level.levelId}`, level).pipe(
          map((updated) => {
            toast.showSuccess('Proficiency level updated successfully.');
            return AdminActions.updateProficiencyLevelSuccess({ level: updated });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.updateProficiencyLevelFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);

export const loadRatingWeightsEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient)) =>
    actions$.pipe(
      ofType(AdminActions.loadRatingWeights),
      switchMap(() =>
        http.get<RatingWeightConfig>('/api/admin/rating-weights').pipe(
          map((weights) => AdminActions.loadRatingWeightsSuccess({ weights })),
          catchError((err) => of(AdminActions.loadRatingWeightsFailure({ error: extractErrorMessage(err) })))
        )
      )
    ),
  { functional: true }
);

export const updateRatingWeightsEffect = createEffect(
  (actions$ = inject(Actions), http = inject(HttpClient), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(AdminActions.updateRatingWeights),
      mergeMap(({ weights }) =>
        http.put<RatingWeightConfig>('/api/admin/rating-weights', weights).pipe(
          map((updated) => {
            toast.showSuccess('Rating weights saved successfully.');
            return AdminActions.updateRatingWeightsSuccess({ weights: updated });
          }),
          catchError((err) => {
            const msg = extractErrorMessage(err);
            toast.showError(msg);
            return of(AdminActions.updateRatingWeightsFailure({ error: msg }));
          })
        )
      )
    ),
  { functional: true }
);
