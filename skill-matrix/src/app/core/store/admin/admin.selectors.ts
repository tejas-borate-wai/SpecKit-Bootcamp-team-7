import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminState } from './admin.reducer';
import { SkillCategory } from '../../../shared/models/skill-category.model';

export const selectAdminState = createFeatureSelector<AdminState>('admin');

// ── Categories ──────────────────────────────────────────────────────────────
export const selectAllCategories = createSelector(selectAdminState, (s) => s.categories);
export const selectCategoriesLoading = createSelector(selectAdminState, (s) => s.categoriesLoading);
export const selectCategoriesError = createSelector(selectAdminState, (s) => s.categoriesError);

export const selectSubcategoriesByCategoryId = (categoryId: string) =>
  createSelector(selectAllCategories, (cats: SkillCategory[]) =>
    cats.find((c) => c.categoryId === categoryId)?.subCategories ?? []
  );

export const selectAllSubcategories = createSelector(selectAllCategories, (cats) =>
  cats.flatMap((c) => c.subCategories.map((s) => ({ ...s, categoryId: c.categoryId, categoryName: c.categoryName })))
);

// ── Skill Definitions ────────────────────────────────────────────────────────
export const selectAllSkillDefinitions = createSelector(selectAdminState, (s) => s.skillDefinitions);
export const selectSkillDefinitionsLoading = createSelector(selectAdminState, (s) => s.skillDefinitionsLoading);
export const selectSkillDefinitionsError = createSelector(selectAdminState, (s) => s.skillDefinitionsError);

export const selectSkillDefinitionsBySubCategoryId = (subCategoryId: string) =>
  createSelector(selectAllSkillDefinitions, (skills) =>
    skills.filter((sk) => sk.subCategoryId === subCategoryId)
  );

// ── Proficiency Levels ───────────────────────────────────────────────────────
export const selectAllProficiencyLevels = createSelector(selectAdminState, (s) => s.proficiencyLevels);
export const selectProficiencyLevelsLoading = createSelector(selectAdminState, (s) => s.proficiencyLevelsLoading);

// ── Rating Weights ───────────────────────────────────────────────────────────
export const selectRatingWeights = createSelector(selectAdminState, (s) => s.ratingWeights);
export const selectRatingWeightsLoading = createSelector(selectAdminState, (s) => s.ratingWeightsLoading);
