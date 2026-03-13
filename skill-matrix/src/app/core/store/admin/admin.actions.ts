import { createAction, props } from '@ngrx/store';
import { SkillCategory, SubCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ProficiencyLevel } from '../../../shared/models/proficiency-level.model';
import { RatingWeightConfig } from '../../../shared/models/rating-weight.model';

// ── Categories ──────────────────────────────────────────────────────────────
export const loadCategories = createAction('[Admin] Load Categories');
export const loadCategoriesSuccess = createAction('[Admin] Load Categories Success', props<{ categories: SkillCategory[] }>());
export const loadCategoriesFailure = createAction('[Admin] Load Categories Failure', props<{ error: string }>());

export const addCategory = createAction('[Admin] Add Category', props<{ category: Omit<SkillCategory, 'subCategories'> & { subCategories?: SubCategory[] } }>());
export const addCategorySuccess = createAction('[Admin] Add Category Success', props<{ category: SkillCategory }>());
export const addCategoryFailure = createAction('[Admin] Add Category Failure', props<{ error: string }>());

export const updateCategory = createAction('[Admin] Update Category', props<{ category: SkillCategory }>());
export const updateCategorySuccess = createAction('[Admin] Update Category Success', props<{ category: SkillCategory }>());
export const updateCategoryFailure = createAction('[Admin] Update Category Failure', props<{ error: string }>());

export const deleteCategory = createAction('[Admin] Delete Category', props<{ categoryId: string }>());
export const deleteCategorySuccess = createAction('[Admin] Delete Category Success', props<{ categoryId: string }>());
export const deleteCategoryFailure = createAction('[Admin] Delete Category Failure', props<{ error: string }>());

// ── Subcategories ────────────────────────────────────────────────────────────
export const loadSubcategories = createAction('[Admin] Load Subcategories');

export const addSubcategory = createAction('[Admin] Add Subcategory', props<{ categoryId: string; subCategory: SubCategory }>());
export const addSubcategorySuccess = createAction('[Admin] Add Subcategory Success', props<{ categoryId: string; subCategory: SubCategory }>());
export const addSubcategoryFailure = createAction('[Admin] Add Subcategory Failure', props<{ error: string }>());

export const updateSubcategory = createAction('[Admin] Update Subcategory', props<{ categoryId: string; subCategory: SubCategory }>());
export const updateSubcategorySuccess = createAction('[Admin] Update Subcategory Success', props<{ categoryId: string; subCategory: SubCategory }>());
export const updateSubcategoryFailure = createAction('[Admin] Update Subcategory Failure', props<{ error: string }>());

export const deleteSubcategory = createAction('[Admin] Delete Subcategory', props<{ categoryId: string; subCategoryId: string }>());
export const deleteSubcategorySuccess = createAction('[Admin] Delete Subcategory Success', props<{ categoryId: string; subCategoryId: string }>());
export const deleteSubcategoryFailure = createAction('[Admin] Delete Subcategory Failure', props<{ error: string }>());

// ── Skill Definitions ────────────────────────────────────────────────────────
export const loadSkillDefinitions = createAction('[Admin] Load Skill Definitions');
export const loadSkillDefinitionsSuccess = createAction('[Admin] Load Skill Definitions Success', props<{ skillDefinitions: SkillDefinition[] }>());
export const loadSkillDefinitionsFailure = createAction('[Admin] Load Skill Definitions Failure', props<{ error: string }>());

export const addSkillDefinition = createAction('[Admin] Add Skill Definition', props<{ skillDefinition: SkillDefinition }>());
export const addSkillDefinitionSuccess = createAction('[Admin] Add Skill Definition Success', props<{ skillDefinition: SkillDefinition }>());
export const addSkillDefinitionFailure = createAction('[Admin] Add Skill Definition Failure', props<{ error: string }>());

export const updateSkillDefinition = createAction('[Admin] Update Skill Definition', props<{ skillDefinition: SkillDefinition }>());
export const updateSkillDefinitionSuccess = createAction('[Admin] Update Skill Definition Success', props<{ skillDefinition: SkillDefinition }>());
export const updateSkillDefinitionFailure = createAction('[Admin] Update Skill Definition Failure', props<{ error: string }>());

// ── Proficiency Levels ───────────────────────────────────────────────────────
export const loadProficiencyLevels = createAction('[Admin] Load Proficiency Levels');
export const loadProficiencyLevelsSuccess = createAction('[Admin] Load Proficiency Levels Success', props<{ levels: ProficiencyLevel[] }>());
export const loadProficiencyLevelsFailure = createAction('[Admin] Load Proficiency Levels Failure', props<{ error: string }>());

export const updateProficiencyLevel = createAction('[Admin] Update Proficiency Level', props<{ level: ProficiencyLevel }>());
export const updateProficiencyLevelSuccess = createAction('[Admin] Update Proficiency Level Success', props<{ level: ProficiencyLevel }>());
export const updateProficiencyLevelFailure = createAction('[Admin] Update Proficiency Level Failure', props<{ error: string }>());

// ── Rating Weights ───────────────────────────────────────────────────────────
export const loadRatingWeights = createAction('[Admin] Load Rating Weights');
export const loadRatingWeightsSuccess = createAction('[Admin] Load Rating Weights Success', props<{ weights: RatingWeightConfig }>());
export const loadRatingWeightsFailure = createAction('[Admin] Load Rating Weights Failure', props<{ error: string }>());

export const updateRatingWeights = createAction('[Admin] Update Rating Weights', props<{ weights: RatingWeightConfig }>());
export const updateRatingWeightsSuccess = createAction('[Admin] Update Rating Weights Success', props<{ weights: RatingWeightConfig }>());
export const updateRatingWeightsFailure = createAction('[Admin] Update Rating Weights Failure', props<{ error: string }>());
