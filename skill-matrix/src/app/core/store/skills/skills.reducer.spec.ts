import { skillsReducer, SkillsState, initialSkillsState } from './skills.reducer';
import * as SkillsActions from './skills.actions';
import { EmployeeSkill, EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';

function makeSkill(overrides: Partial<EmployeeSkill> = {}): EmployeeSkill {
  return {
    skillId: 'skill-001',
    selfRating: 2,
    managerRating: null,
    peerRating: null,
    systemRating: null,
    finalRating: 50,
    level: 'Intermediate',
    status: 'Approved',
    lastUpdated: new Date().toISOString(),
    isDeleted: false,
    ...overrides,
  };
}

describe('skillsReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = skillsReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialSkillsState);
  });

  // ─── loadMySkills ─────────────────────────────────────────────────────────

  it('should set loading=true on loadMySkills', () => {
    const state = skillsReducer(initialSkillsState, SkillsActions.loadMySkills({ userId: 'u001' }));
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('should populate mySkills on loadMySkillsSuccess', () => {
    const record: EmployeeSkillRecord = { userId: 'u001', skills: [makeSkill()] };
    const state = skillsReducer(initialSkillsState, SkillsActions.loadMySkillsSuccess({ record }));
    expect(state.mySkills.length).toBe(1);
    expect(state.loading).toBeFalse();
  });

  it('should set error on loadMySkillsFailure', () => {
    const state = skillsReducer(initialSkillsState, SkillsActions.loadMySkillsFailure({ error: 'oops' }));
    expect(state.error).toBe('oops');
    expect(state.loading).toBeFalse();
  });

  // ─── addSkill ─────────────────────────────────────────────────────────────

  it('should append skill on addSkillSuccess', () => {
    const skill = makeSkill({ skillId: 'skill-new' });
    const state = skillsReducer(initialSkillsState, SkillsActions.addSkillSuccess({ skill }));
    expect(state.mySkills).toContain(skill);
  });

  it('should set error on addSkillFailure', () => {
    const state = skillsReducer(initialSkillsState, SkillsActions.addSkillFailure({ error: 'duplicate' }));
    expect(state.error).toBe('duplicate');
  });

  // ─── updateSkillRating ────────────────────────────────────────────────────

  it('should replace updated skill on updateSkillRatingSuccess', () => {
    const existing = makeSkill({ skillId: 'skill-001', selfRating: 2 });
    const updated = makeSkill({ skillId: 'skill-001', selfRating: 4, level: 'Expert' });
    const initial: SkillsState = { ...initialSkillsState, mySkills: [existing] };
    const state = skillsReducer(initial, SkillsActions.updateSkillRatingSuccess({ skill: updated }));
    expect(state.mySkills[0].selfRating).toBe(4);
    expect(state.mySkills[0].level).toBe('Expert');
  });

  // ─── deleteSkill ─────────────────────────────────────────────────────────

  it('should remove skill on deleteSkillSuccess', () => {
    const skill1 = makeSkill({ skillId: 'skill-001' });
    const skill2 = makeSkill({ skillId: 'skill-002' });
    const initial: SkillsState = { ...initialSkillsState, mySkills: [skill1, skill2] };
    const state = skillsReducer(initial, SkillsActions.deleteSkillSuccess({ skillId: 'skill-001' }));
    expect(state.mySkills.length).toBe(1);
    expect(state.mySkills[0].skillId).toBe('skill-002');
  });

  it('should set error on deleteSkillFailure (409)', () => {
    const state = skillsReducer(
      initialSkillsState,
      SkillsActions.deleteSkillFailure({ error: 'This skill is linked to an active project and cannot be deleted.' })
    );
    expect(state.error).toContain('active project');
  });

  // ─── loadTestAttempts ─────────────────────────────────────────────────────

  it('should set testAttempts on loadTestAttemptsSuccess', () => {
    const attempts = [
      { attemptId: 'a-001', userId: 'u001', skillId: 'skill-001', score: 72, earnedPoints: 72, maxPoints: 100, date: '2025-06-01T10:00:00Z', timeTaken: 30 },
    ];
    const state = skillsReducer(initialSkillsState, SkillsActions.loadTestAttemptsSuccess({ attempts }));
    expect(state.testAttempts.length).toBe(1);
    expect(state.testAttempts[0].score).toBe(72);
  });
});
