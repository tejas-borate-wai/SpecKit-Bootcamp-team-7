import { SkillsState, initialSkillsState } from './skills.reducer';
import {
  selectMyActiveSkills, selectMyStaleSkills, selectProfileCompletion, selectSkillById,
} from './skills.selectors';
import { EmployeeSkill } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';

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

function makeState(overrides: Partial<SkillsState> = {}): SkillsState {
  return { ...initialSkillsState, ...overrides };
}

// Wrap state into the NgRx feature shape expected by createFeatureSelector('skills')
function wrapState(skills: SkillsState) {
  return { skills };
}

describe('skills.selectors', () => {
  describe('selectMyActiveSkills', () => {
    it('should return skills where isDeleted is false', () => {
      const s1 = makeSkill({ skillId: 'skill-001', isDeleted: false });
      const s2 = makeSkill({ skillId: 'skill-002', isDeleted: true });
      const state = wrapState(makeState({ mySkills: [s1, s2] }));
      const result = selectMyActiveSkills(state);
      expect(result.length).toBe(1);
      expect(result[0].skillId).toBe('skill-001');
    });

    it('should return empty array when all skills are deleted', () => {
      const state = wrapState(makeState({ mySkills: [makeSkill({ isDeleted: true })] }));
      expect(selectMyActiveSkills(state)).toEqual([]);
    });
  });

  describe('selectMyStaleSkills', () => {
    it('should return skills with lastUpdated older than 6 months', () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 8);
      const stale = makeSkill({ skillId: 'stale-skill', lastUpdated: oldDate.toISOString() });
      const recent = makeSkill({ skillId: 'recent-skill', lastUpdated: new Date().toISOString() });
      const state = wrapState(makeState({ mySkills: [stale, recent] }));
      const result = selectMyStaleSkills(state);
      expect(result.length).toBe(1);
      expect(result[0].skillId).toBe('stale-skill');
    });
  });

  describe('selectProfileCompletion', () => {
    it('should return 0 when no definitions exist', () => {
      const state = wrapState(makeState({ mySkills: [makeSkill()], skillDefinitions: [] }));
      expect(selectProfileCompletion(state)).toBe(0);
    });

    it('should calculate correct percentage of assessed skills', () => {
      const assessed = makeSkill({ skillId: 'skill-001', finalRating: 60 });
      const unassessed = makeSkill({ skillId: 'skill-002', finalRating: null, systemRating: null });
      const defs: SkillDefinition[] = [
        { skillId: 'skill-001', skillName: 'A', subCategoryId: 'sc-001', description: '' },
        { skillId: 'skill-002', skillName: 'B', subCategoryId: 'sc-001', description: '' },
      ];
      const state = wrapState(makeState({ mySkills: [assessed, unassessed], skillDefinitions: defs }));
      expect(selectProfileCompletion(state)).toBe(50);
    });
  });

  describe('selectSkillById', () => {
    it('should return the matching skill', () => {
      const skill = makeSkill({ skillId: 'skill-003' });
      const state = wrapState(makeState({ mySkills: [skill] }));
      const result = selectSkillById('skill-003')(state);
      expect(result).toEqual(skill);
    });

    it('should return null when skill not found', () => {
      const state = wrapState(makeState({ mySkills: [] }));
      expect(selectSkillById('skill-999')(state)).toBeNull();
    });

    it('should not return deleted skills', () => {
      const deleted = makeSkill({ skillId: 'skill-001', isDeleted: true });
      const state = wrapState(makeState({ mySkills: [deleted] }));
      expect(selectSkillById('skill-001')(state)).toBeNull();
    });
  });
});
