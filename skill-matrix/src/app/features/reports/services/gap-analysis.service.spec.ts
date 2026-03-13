import { TestBed } from '@angular/core/testing';
import { GapAnalysisService } from './gap-analysis.service';
import { Project } from '../../../shared/models/project.model';
import { EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';

const skillDefs: SkillDefinition[] = [
  { skillId: 's1', skillName: 'TypeScript', categoryId: 'c1', subCategoryId: 'sc1', description: '' },
  { skillId: 's2', skillName: 'Angular', categoryId: 'c1', subCategoryId: 'sc1', description: '' },
];

const makeProject = (skillId: string, minimumLevel: 1 | 2 | 3 | 4): Project => ({
  projectId: 'proj-1',
  name: 'Test Project',
  description: '',
  status: 'Open',
  startDate: '2026-01-01',
  deadline: '2026-12-31',
  requiredSkills: [{ skillId, minimumLevel }],
  requiredRoles: [],
  createdBy: 'u1',
  createdDate: '2026-01-01',
});

const makeRecord = (userId: string, skillId: string, level: string): EmployeeSkillRecord => ({
  userId,
  skills: [{
    skillId,
    selfRating: null,
    managerRating: null,
    peerRating: null,
    systemRating: null,
    finalRating: null,
    level: level as EmployeeSkillRecord['skills'][0]['level'],
    status: 'Approved',
    lastUpdated: '2026-01-01',
    isDeleted: false,
  }],
});

describe('GapAnalysisService', () => {
  let service: GapAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GapAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computeGapRecords', () => {
    it('should return empty array when no projects', () => {
      const result = service.computeGapRecords([], [], skillDefs);
      expect(result).toEqual([]);
    });

    it('should return empty array when projects have no required skills', () => {
      const project: Project = {
        projectId: 'p1', name: 'P1', description: '', status: 'Open',
        startDate: '', deadline: '', requiredSkills: [], requiredRoles: [],
        createdBy: '', createdDate: '',
      };
      const result = service.computeGapRecords([project], [], skillDefs);
      expect(result).toEqual([]);
    });

    it('should compute zero gap when team average meets required level', () => {
      // Required level 2 = 50%, employee level Intermediate = 50%
      const project = makeProject('s1', 2);
      const records = [makeRecord('u1', 's1', 'Intermediate')];
      const result = service.computeGapRecords([project], records, skillDefs);

      expect(result.length).toBe(1);
      expect(result[0].gapPercent).toBe(0);
      expect(result[0].gapSeverity).toBe('none');
    });

    it('should compute zero gap when team average exceeds required level', () => {
      // Required level 1 = 25%, employee level Expert = 100%
      const project = makeProject('s1', 1);
      const records = [makeRecord('u1', 's1', 'Expert')];
      const result = service.computeGapRecords([project], records, skillDefs);

      expect(result[0].gapPercent).toBe(0);
      expect(result[0].gapSeverity).toBe('none');
    });

    it('should return warning severity for gap between 1% and 49%', () => {
      // Required level 2 = 50%, employee level Beginner = 25% -> gap = 25%
      const project = makeProject('s1', 2);
      const records = [makeRecord('u1', 's1', 'Beginner')];
      const result = service.computeGapRecords([project], records, skillDefs);

      expect(result[0].gapPercent).toBe(25);
      expect(result[0].gapSeverity).toBe('warning');
    });

    it('should return critical severity for gap >= 50%', () => {
      // Required level 4 = 100%, no employees -> gap = 100%
      const project = makeProject('s1', 4);
      const result = service.computeGapRecords([project], [], skillDefs);

      expect(result[0].gapPercent).toBe(100);
      expect(result[0].gapSeverity).toBe('critical');
    });

    it('employees without the skill contribute 0% to team average', () => {
      // Required level 3 = 75%, two employees: one with Advanced (75%), one without = 0%
      // Average = (75 + 0) / 2 = 37.5 -> rounded to 38 -> gap = 75 - 38 = 37
      const project = makeProject('s1', 3);
      const empWithSkill = makeRecord('u1', 's1', 'Advanced');
      const empWithoutSkill: EmployeeSkillRecord = { userId: 'u2', skills: [] };
      const result = service.computeGapRecords([project], [empWithSkill, empWithoutSkill], skillDefs);

      expect(result[0].teamAverageLevelPercent).toBe(38);
      expect(result[0].gapPercent).toBe(37);
      expect(result[0].gapSeverity).toBe('warning');
    });

    it('should produce correct requiredLevelPercent values for all 4 levels', () => {
      const levels: [1 | 2 | 3 | 4, number][] = [[1, 25], [2, 50], [3, 75], [4, 100]];
      levels.forEach(([level, expected]) => {
        const project = makeProject('s1', level);
        const result = service.computeGapRecords([project], [], skillDefs);
        expect(result[0].requiredLevelPercent).toBe(expected);
      });
    });

    it('should scope correctly when employeeSkills filtered externally for Manager', () => {
      // Caller passes only dept-filtered employee skills — service uses what it gets
      const project = makeProject('s1', 2);
      const recordA = makeRecord('u1', 's1', 'Expert');    // dept A, 100%
      const recordB = makeRecord('u2', 's1', 'Beginner');  // dept B, 25%

      // Manager in dept A sees only recordA
      const resultA = service.computeGapRecords([project], [recordA], skillDefs);
      expect(resultA[0].teamAverageLevelPercent).toBe(100);

      // Admin sees both
      const resultAll = service.computeGapRecords([project], [recordA, recordB], skillDefs);
      expect(resultAll[0].teamAverageLevelPercent).toBe(63); // (100+25)/2 = 62.5 -> 63
    });
  });
});
