import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SkillsState } from './skills.reducer';
import { isStale, computeConfidence, ratingToPercentage, percentageToLevel } from '../../../shared/utils/skill-utils';
import { ConfidenceLevel } from '../../../shared/models/dashboard.model';

export const selectSkillsState = createFeatureSelector<SkillsState>('skills');

export const selectMySkills = createSelector(selectSkillsState, (s) => s.mySkills);
export const selectAllEmployeeSkills = createSelector(selectSkillsState, (s) => s.allEmployeeSkills);
export const selectSkillCategories = createSelector(selectSkillsState, (s) => s.skillCategories);
export const selectSkillDefinitions = createSelector(selectSkillsState, (s) => s.skillDefinitions);
export const selectTestAttempts = createSelector(selectSkillsState, (s) => s.testAttempts);
export const selectSkillsLoading = createSelector(selectSkillsState, (s) => s.loading);
export const selectSkillsError = createSelector(selectSkillsState, (s) => s.error);

export const selectMyActiveSkills = createSelector(selectMySkills, (skills) =>
  skills.filter((s) => !s.isDeleted)
);

export const selectMyStaleSkills = createSelector(selectMyActiveSkills, (skills) =>
  skills.filter((s) => isStale(s.lastUpdated))
);

export const selectProfileCompletion = createSelector(
  selectMyActiveSkills,
  selectSkillDefinitions,
  (activeSkills, definitions) => {
    if (definitions.length === 0) return 0;
    const assessedCount = activeSkills.filter((s) => s.finalRating !== null || s.systemRating !== null).length;
    return Math.round((assessedCount / definitions.length) * 100);
  }
);

export const selectSkillById = (skillId: string) =>
  createSelector(selectMyActiveSkills, (skills) => skills.find((s) => s.skillId === skillId) ?? null);

export const selectSkillProgress = (skillId: string) =>
  createSelector(selectTestAttempts, (attempts) =>
    attempts
      .filter((a) => a.skillId === skillId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  );

export const selectConfidenceLevel = (skillId: string) =>
  createSelector(selectMyActiveSkills, (skills): ConfidenceLevel => {
    const skill = skills.find((s) => s.skillId === skillId);
    if (!skill) return 'low';
    return computeConfidence(skill);
  });

export const selectDashboardWidgets = createSelector(
  selectMyActiveSkills,
  selectSkillDefinitions,
  selectSkillCategories,
  (activeSkills, definitions, categories) => {
    const totalDefs = definitions.length;
    const assessedCount = activeSkills.filter((s) => s.finalRating !== null || s.systemRating !== null).length;
    const profileCompletion = totalDefs > 0 ? Math.round((assessedCount / totalDefs) * 100) : 0;
    const staleCount = activeSkills.filter((s) => isStale(s.lastUpdated)).length;
    const pendingCount = activeSkills.filter((s) => s.status === 'Pending').length;

    return { profileCompletion, staleCount, pendingCount, totalActive: activeSkills.length };
  }
);
