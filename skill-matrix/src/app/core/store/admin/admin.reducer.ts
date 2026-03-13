import { createReducer, on } from '@ngrx/store';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ProficiencyLevel } from '../../../shared/models/proficiency-level.model';
import { RatingWeightConfig } from '../../../shared/models/rating-weight.model';
import * as AdminActions from './admin.actions';

export interface AdminState {
  categories: SkillCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  skillDefinitions: SkillDefinition[];
  skillDefinitionsLoading: boolean;
  skillDefinitionsError: string | null;

  proficiencyLevels: ProficiencyLevel[];
  proficiencyLevelsLoading: boolean;
  proficiencyLevelsError: string | null;

  ratingWeights: RatingWeightConfig | null;
  ratingWeightsLoading: boolean;
  ratingWeightsError: string | null;
}

export const initialAdminState: AdminState = {
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  skillDefinitions: [],
  skillDefinitionsLoading: false,
  skillDefinitionsError: null,

  proficiencyLevels: [],
  proficiencyLevelsLoading: false,
  proficiencyLevelsError: null,

  ratingWeights: null,
  ratingWeightsLoading: false,
  ratingWeightsError: null,
};

export const adminReducer = createReducer(
  initialAdminState,

  // ── Categories ─────────────────────────────────────────────────────────
  on(AdminActions.loadCategories, (state) => ({ ...state, categoriesLoading: true, categoriesError: null })),
  on(AdminActions.loadCategoriesSuccess, (state, { categories }) => ({ ...state, categories, categoriesLoading: false })),
  on(AdminActions.loadCategoriesFailure, (state, { error }) => ({ ...state, categoriesLoading: false, categoriesError: error })),

  on(AdminActions.addCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
  })),
  on(AdminActions.addCategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  on(AdminActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map((c) => (c.categoryId === category.categoryId ? category : c)),
  })),
  on(AdminActions.updateCategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  on(AdminActions.deleteCategorySuccess, (state, { categoryId }) => ({
    ...state,
    categories: state.categories.filter((c) => c.categoryId !== categoryId),
  })),
  on(AdminActions.deleteCategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  // ── Subcategories (mutations live inside categories) ────────────────────
  on(AdminActions.addSubcategorySuccess, (state, { categoryId, subCategory }) => ({
    ...state,
    categories: state.categories.map((c) =>
      c.categoryId === categoryId
        ? { ...c, subCategories: [...c.subCategories, subCategory] }
        : c
    ),
  })),
  on(AdminActions.addSubcategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  on(AdminActions.updateSubcategorySuccess, (state, { categoryId, subCategory }) => ({
    ...state,
    categories: state.categories.map((c) =>
      c.categoryId === categoryId
        ? {
            ...c,
            subCategories: c.subCategories.map((s) =>
              s.subCategoryId === subCategory.subCategoryId ? subCategory : s
            ),
          }
        : c
    ),
  })),
  on(AdminActions.updateSubcategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  on(AdminActions.deleteSubcategorySuccess, (state, { categoryId, subCategoryId }) => ({
    ...state,
    categories: state.categories.map((c) =>
      c.categoryId === categoryId
        ? { ...c, subCategories: c.subCategories.filter((s) => s.subCategoryId !== subCategoryId) }
        : c
    ),
  })),
  on(AdminActions.deleteSubcategoryFailure, (state, { error }) => ({ ...state, categoriesError: error })),

  // ── Skill Definitions ──────────────────────────────────────────────────
  on(AdminActions.loadSkillDefinitions, (state) => ({ ...state, skillDefinitionsLoading: true, skillDefinitionsError: null })),
  on(AdminActions.loadSkillDefinitionsSuccess, (state, { skillDefinitions }) => ({ ...state, skillDefinitions, skillDefinitionsLoading: false })),
  on(AdminActions.loadSkillDefinitionsFailure, (state, { error }) => ({ ...state, skillDefinitionsLoading: false, skillDefinitionsError: error })),

  on(AdminActions.addSkillDefinitionSuccess, (state, { skillDefinition }) => ({
    ...state,
    skillDefinitions: [...state.skillDefinitions, skillDefinition],
  })),
  on(AdminActions.addSkillDefinitionFailure, (state, { error }) => ({ ...state, skillDefinitionsError: error })),

  on(AdminActions.updateSkillDefinitionSuccess, (state, { skillDefinition }) => ({
    ...state,
    skillDefinitions: state.skillDefinitions.map((s) =>
      s.skillId === skillDefinition.skillId ? skillDefinition : s
    ),
  })),
  on(AdminActions.updateSkillDefinitionFailure, (state, { error }) => ({ ...state, skillDefinitionsError: error })),

  // ── Proficiency Levels ─────────────────────────────────────────────────
  on(AdminActions.loadProficiencyLevels, (state) => ({ ...state, proficiencyLevelsLoading: true, proficiencyLevelsError: null })),
  on(AdminActions.loadProficiencyLevelsSuccess, (state, { levels }) => ({ ...state, proficiencyLevels: levels, proficiencyLevelsLoading: false })),
  on(AdminActions.loadProficiencyLevelsFailure, (state, { error }) => ({ ...state, proficiencyLevelsLoading: false, proficiencyLevelsError: error })),

  on(AdminActions.updateProficiencyLevelSuccess, (state, { level }) => ({
    ...state,
    proficiencyLevels: state.proficiencyLevels.map((l) => (l.levelId === level.levelId ? level : l)),
  })),
  on(AdminActions.updateProficiencyLevelFailure, (state, { error }) => ({ ...state, proficiencyLevelsError: error })),

  // ── Rating Weights ─────────────────────────────────────────────────────
  on(AdminActions.loadRatingWeights, (state) => ({ ...state, ratingWeightsLoading: true, ratingWeightsError: null })),
  on(AdminActions.loadRatingWeightsSuccess, (state, { weights }) => ({ ...state, ratingWeights: weights, ratingWeightsLoading: false })),
  on(AdminActions.loadRatingWeightsFailure, (state, { error }) => ({ ...state, ratingWeightsLoading: false, ratingWeightsError: error })),

  on(AdminActions.updateRatingWeightsSuccess, (state, { weights }) => ({ ...state, ratingWeights: weights })),
  on(AdminActions.updateRatingWeightsFailure, (state, { error }) => ({ ...state, ratingWeightsError: error }))
);
