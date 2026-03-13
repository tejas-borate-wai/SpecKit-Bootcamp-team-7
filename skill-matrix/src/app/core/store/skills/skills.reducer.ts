import { createReducer, on } from '@ngrx/store';
import { EmployeeSkill, EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';
import * as SkillsActions from './skills.actions';

export interface SkillsState {
  mySkills: EmployeeSkill[];
  allEmployeeSkills: EmployeeSkillRecord[];
  skillCategories: SkillCategory[];
  skillDefinitions: SkillDefinition[];
  testAttempts: SkillTestAttempt[];
  loading: boolean;
  error: string | null;
}

export const initialSkillsState: SkillsState = {
  mySkills: [],
  allEmployeeSkills: [],
  skillCategories: [],
  skillDefinitions: [],
  testAttempts: [],
  loading: false,
  error: null,
};

export const skillsReducer = createReducer(
  initialSkillsState,

  // Load my skills
  on(SkillsActions.loadMySkills, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.loadMySkillsSuccess, (state, { record }) => ({
    ...state,
    loading: false,
    mySkills: record.skills,
  })),
  on(SkillsActions.loadMySkillsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load all employee skills
  on(SkillsActions.loadAllEmployeeSkills, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.loadAllEmployeeSkillsSuccess, (state, { records }) => ({
    ...state,
    loading: false,
    allEmployeeSkills: records,
  })),
  on(SkillsActions.loadAllEmployeeSkillsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load skill library
  on(SkillsActions.loadSkillLibrary, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.loadSkillLibrarySuccess, (state, { categories, definitions }) => ({
    ...state,
    loading: false,
    skillCategories: categories,
    skillDefinitions: definitions,
  })),
  on(SkillsActions.loadSkillLibraryFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Add skill
  on(SkillsActions.addSkill, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.addSkillSuccess, (state, { skill }) => ({
    ...state,
    loading: false,
    mySkills: [...state.mySkills, skill],
  })),
  on(SkillsActions.addSkillFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Update skill rating
  on(SkillsActions.updateSkillRating, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.updateSkillRatingSuccess, (state, { skill }) => ({
    ...state,
    loading: false,
    mySkills: state.mySkills.map((s) => (s.skillId === skill.skillId ? skill : s)),
  })),
  on(SkillsActions.updateSkillRatingFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Delete skill
  on(SkillsActions.deleteSkill, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.deleteSkillSuccess, (state, { skillId }) => ({
    ...state,
    loading: false,
    mySkills: state.mySkills.filter((s) => s.skillId !== skillId),
  })),
  on(SkillsActions.deleteSkillFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load test attempts
  on(SkillsActions.loadTestAttempts, (state) => ({ ...state, loading: true, error: null })),
  on(SkillsActions.loadTestAttemptsSuccess, (state, { attempts }) => ({
    ...state,
    loading: false,
    testAttempts: attempts,
  })),
  on(SkillsActions.loadTestAttemptsFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
