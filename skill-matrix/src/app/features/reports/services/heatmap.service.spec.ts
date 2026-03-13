import { TestBed } from '@angular/core/testing';
import { HeatmapService } from './heatmap.service';
import { EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';

const skillDefs: SkillDefinition[] = [
  { skillId: 's1', skillName: 'TypeScript', categoryId: 'c1', subCategoryId: 'sc1', description: '' },
  { skillId: 's2', skillName: 'Python', categoryId: 'c2', subCategoryId: 'sc2', description: '' },
];

const makeRecord = (userId: string, skillId: string, level: string): EmployeeSkillRecord => ({
  userId,
  skills: [{
    skillId, level: level as EmployeeSkillRecord['skills'][0]['level'],
    selfRating: null, managerRating: null, peerRating: null, systemRating: null, finalRating: null,
    status: 'Approved', lastUpdated: '', isDeleted: false,
  }],
});

describe('HeatmapService', () => {
  let service: HeatmapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeatmapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computeHeatmapCells', () => {
    it('should return 4 cells per skill (one per proficiency level)', () => {
      const result = service.computeHeatmapCells([], skillDefs);
      // 2 skills × 4 levels = 8 cells
      expect(result.length).toBe(8);
    });

    it('should count employees accurately per skill and level', () => {
      const records = [
        makeRecord('u1', 's1', 'Advanced'),
        makeRecord('u2', 's1', 'Advanced'),
        makeRecord('u3', 's1', 'Intermediate'),
      ];
      const result = service.computeHeatmapCells(records, skillDefs);
      const advancedCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Advanced');
      const intermediateCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Intermediate');
      const beginnerCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Beginner');

      expect(advancedCell!.employeeCount).toBe(2);
      expect(intermediateCell!.employeeCount).toBe(1);
      expect(beginnerCell!.employeeCount).toBe(0);
    });

    it('should show 0 for levels with no employees', () => {
      const records = [makeRecord('u1', 's1', 'Expert')];
      const result = service.computeHeatmapCells(records, skillDefs);
      const beginnerCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Beginner');
      expect(beginnerCell!.employeeCount).toBe(0);
    });

    it('should assign intensityBucket very-high for max count', () => {
      const records = [makeRecord('u1', 's1', 'Expert'), makeRecord('u2', 's1', 'Expert')];
      const result = service.computeHeatmapCells(records, skillDefs);
      const expertCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Expert');
      expect(expertCell!.intensityBucket).toBe('very-high');
    });

    it('should assign intensityBucket low for count 0', () => {
      const records = [makeRecord('u1', 's1', 'Expert')];
      const result = service.computeHeatmapCells(records, skillDefs);
      const beginnerCell = result.find((c) => c.skillId === 's1' && c.proficiencyLevel === 'Beginner');
      expect(beginnerCell!.intensityBucket).toBe('low');
    });
  });

  describe('transformToChartData', () => {
    it('should produce ngx-charts heat-map format', () => {
      const cells = service.computeHeatmapCells(
        [makeRecord('u1', 's1', 'Advanced')],
        [skillDefs[0]],
      );
      const chartData = service.transformToChartData(cells);
      expect(chartData.length).toBe(1);
      expect(chartData[0].name).toBe('TypeScript');
      expect(chartData[0].series.length).toBe(4); // one per proficiency level
      const advSeries = chartData[0].series.find((s) => s.name === 'Advanced');
      expect(advSeries!.value).toBe(1);
    });
  });
});
