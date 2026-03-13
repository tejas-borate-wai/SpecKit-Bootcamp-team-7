import { createAction, props } from '@ngrx/store';
import { EmployeeSkill, EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';

// ── Load my skills ───────────────────────────────────────────────────────────
export const loadMySkills = createAction('[Skills] Load My Skills', props<{ userId: string }>());
export const loadMySkillsSuccess = createAction('[Skills] Load My Skills Success', props<{ record: EmployeeSkillRecord }>());
export const loadMySkillsFailure = createAction('[Skills] Load My Skills Failure', props<{ error: string }>());

// ── Load all employee skills (Manager/Admin) ─────────────────────────────────
export const loadAllEmployeeSkills = createAction('[Skills] Load All Employee Skills');
export const loadAllEmployeeSkillsSuccess = createAction('[Skills] Load All Employee Skills Success', props<{ records: EmployeeSkillRecord[] }>());
export const loadAllEmployeeSkillsFailure = createAction('[Skills] Load All Employee Skills Failure', props<{ error: string }>());

// ── Load skill library ───────────────────────────────────────────────────────
export const loadSkillLibrary = createAction('[Skills] Load Skill Library');
export const loadSkillLibrarySuccess = createAction('[Skills] Load Skill Library Success', props<{ categories: SkillCategory[]; definitions: SkillDefinition[] }>());
export const loadSkillLibraryFailure = createAction('[Skills] Load Skill Library Failure', props<{ error: string }>());

// ── Add skill ────────────────────────────────────────────────────────────────
export const addSkill = createAction('[Skills] Add Skill', props<{ userId: string; skillId: string; selfRating: number }>());
export const addSkillSuccess = createAction('[Skills] Add Skill Success', props<{ skill: EmployeeSkill }>());
export const addSkillFailure = createAction('[Skills] Add Skill Failure', props<{ error: string }>());

// ── Update skill rating ──────────────────────────────────────────────────────
export const updateSkillRating = createAction('[Skills] Update Skill Rating', props<{ userId: string; skillId: string; selfRating: number }>());
export const updateSkillRatingSuccess = createAction('[Skills] Update Skill Rating Success', props<{ skill: EmployeeSkill }>());
export const updateSkillRatingFailure = createAction('[Skills] Update Skill Rating Failure', props<{ error: string }>());

// ── Delete skill ─────────────────────────────────────────────────────────────
export const deleteSkill = createAction('[Skills] Delete Skill', props<{ userId: string; skillId: string }>());
export const deleteSkillSuccess = createAction('[Skills] Delete Skill Success', props<{ skillId: string }>());
export const deleteSkillFailure = createAction('[Skills] Delete Skill Failure', props<{ error: string }>());

// ── Load test attempts ────────────────────────────────────────────────────────
export const loadTestAttempts = createAction('[Skills] Load Test Attempts', props<{ userId: string }>());
export const loadTestAttemptsSuccess = createAction('[Skills] Load Test Attempts Success', props<{ attempts: SkillTestAttempt[] }>());
export const loadTestAttemptsFailure = createAction('[Skills] Load Test Attempts Failure', props<{ error: string }>());
