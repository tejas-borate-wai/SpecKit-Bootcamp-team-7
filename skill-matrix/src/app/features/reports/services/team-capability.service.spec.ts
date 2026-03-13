import { TestBed } from '@angular/core/testing';
import { TeamCapabilityService } from './team-capability.service';
import { EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';

const skillDefs: SkillDefinition[] = [
  { skillId: 's1', skillName: 'TypeScript', categoryId: 'c1', subCategoryId: 'sc1', description: '' },
  { skillId: 's2', skillName: 'Python', categoryId: 'c2', subCategoryId: 'sc2', description: '' },
];

const categories: SkillCategory[] = [
  { categoryId: 'c1', categoryName: 'Frontend', description: '', subCategories: [] },
  { categoryId: 'c2', categoryName: 'Backend', description: '', subCategories: [] },
];

const users = [
  { id: 'u1', department: 'Engineering' },
  { id: 'u2', department: 'Engineering' },
  { id: 'u3', department: 'Analytics' },
];

const makeRecord = (userId: string, skillId: string, level: string): EmployeeSkillRecord => ({
  userId,
  skills: [{
    skillId,
    selfRating: null, managerRating: null, peerRating: null, systemRating: null, finalRating: null,
    level: level as EmployeeSkillRecord['skills'][0]['level'],
    status: 'Approved', lastUpdated: '', isDeleted: false,
  }],
});

describe('TeamCapabilityService', () => {
  let service: TeamCapabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TeamCapabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should compute average proficiency correctly for multiple employees', () => {
    // u1: Advanced (75%), u2: Intermediate (50%) → average = 63%
    const records = [
      makeRecord('u1', 's1', 'Advanced'),
      makeRecord('u2', 's1', 'Intermediate'),
    ];
    const result = service.computeCapabilitySnapshots(records, skillDefs, categories, users);
    const snap = result.find((s) => s.skillId === 's1' && s.department === 'Engineering');
    expect(snap).toBeTruthy();
    expect(snap!.averageProficiencyPercent).toBe(63);
    expect(snap!.employeeCount).toBe(2);
  });

  it('should reflect employeeCount correctly', () => {
    const records = [
      makeRecord('u1', 's1', 'Expert'),
      makeRecord('u2', 's1', 'Expert'),
    ];
    const result = service.computeCapabilitySnapshots(records, skillDefs, categories, users);
    const snap = result.find((s) => s.skillId === 's1');
    expect(snap!.employeeCount).toBe(2);
  });

  it('should separate snapshots by department', () => {
    const records = [
      makeRecord('u1', 's1', 'Expert'),    // Engineering
      makeRecord('u3', 's1', 'Beginner'), // Analytics
    ];
    const result = service.computeCapabilitySnapshots(records, skillDefs, categories, users);
    const eng = result.find((s) => s.skillId === 's1' && s.department === 'Engineering');
    const ana = result.find((s) => s.skillId === 's1' && s.department === 'Analytics');
    expect(eng!.averageProficiencyPercent).toBe(100);
    expect(ana!.averageProficiencyPercent).toBe(25);
  });

  it('should scope to own department when skillDefs filtered externally (Manager)', () => {
    // Caller filters to Engineering users only
    const engineeringUsers = users.filter((u) => u.department === 'Engineering');
    const records = [
      makeRecord('u1', 's1', 'Advanced'),
      makeRecord('u3', 's1', 'Beginner'), // u3 userId not in engineeringUsers
    ];
    const engRecords = records.filter((r) => engineeringUsers.some((u) => u.id === r.userId));
    const result = service.computeCapabilitySnapshots(engRecords, skillDefs, categories, engineeringUsers);
    const snap = result.find((s) => s.skillId === 's1');
    expect(snap!.employeeCount).toBe(1);
    expect(snap!.averageProficiencyPercent).toBe(75); // Advanced only
  });

  it('should map category name correctly', () => {
    const records = [makeRecord('u1', 's1', 'Expert')];
    const result = service.computeCapabilitySnapshots(records, skillDefs, categories, users);
    const snap = result.find((s) => s.skillId === 's1');
    expect(snap!.categoryName).toBe('Frontend');
  });

  it('should handle deleted skills (isDeleted=true) by excluding them', () => {
    const records: EmployeeSkillRecord[] = [{
      userId: 'u1',
      skills: [{
        skillId: 's1', level: 'Expert', isDeleted: true,
        selfRating: null, managerRating: null, peerRating: null, systemRating: null, finalRating: null,
        status: 'Approved', lastUpdated: '',
      }],
    }];
    const result = service.computeCapabilitySnapshots(records, skillDefs, categories, users);
    expect(result.length).toBe(0);
  });
});
