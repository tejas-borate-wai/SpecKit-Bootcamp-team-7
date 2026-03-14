import { TestBed } from '@angular/core/testing';
import { TrendAnalysisService } from './trend-analysis.service';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';

const skillDefs: SkillDefinition[] = [
  { skillId: 's1', skillName: 'TypeScript', categoryId: 'c1', subCategoryId: 'sc1', description: '' },
  { skillId: 's2', skillName: 'Python', categoryId: 'c2', subCategoryId: 'sc2', description: '' },
];

const makeAttempt = (userId: string, skillId: string, score: number, date: string): SkillTestAttempt => ({
  attemptId: `${userId}-${skillId}-${date}`,
  userId, skillId, score, earnedPoints: 0, maxPoints: 100,
  date: `${date}T10:00:00Z`,
  timeTaken: 300,
});

describe('TrendAnalysisService', () => {
  let service: TrendAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrendAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuarterLabel', () => {
    it('Q1: Jan–Mar', () => {
      expect(service.getQuarterLabel('2026-01-15T00:00:00Z')).toBe('Q1 2026');
      expect(service.getQuarterLabel('2026-03-31T00:00:00Z')).toBe('Q1 2026');
    });
    it('Q2: Apr–Jun', () => {
      expect(service.getQuarterLabel('2026-04-01T00:00:00Z')).toBe('Q2 2026');
      expect(service.getQuarterLabel('2026-06-30T00:00:00Z')).toBe('Q2 2026');
    });
    it('Q3: Jul–Sep', () => {
      expect(service.getQuarterLabel('2026-07-01T00:00:00Z')).toBe('Q3 2026');
    });
    it('Q4: Oct–Dec', () => {
      expect(service.getQuarterLabel('2026-10-01T00:00:00Z')).toBe('Q4 2026');
    });
  });

  describe('computeTrendPoints', () => {
    it('should return empty array for empty attempts', () => {
      const result = service.computeTrendPoints([], skillDefs, 'All');
      expect(result).toEqual([]);
    });

    it('should group by quarter correctly', () => {
      const attempts = [
        makeAttempt('u1', 's1', 60, '2026-01-10'),
        makeAttempt('u2', 's1', 80, '2026-02-10'),  // same quarter Q1 2026
        makeAttempt('u1', 's1', 70, '2026-04-10'),  // Q2 2026
      ];
      const result = service.computeTrendPoints(attempts, skillDefs, 'All');
      const q1 = result.find((p) => p.skillId === 's1' && p.quarter === 'Q1 2026');
      const q2 = result.find((p) => p.skillId === 's1' && p.quarter === 'Q2 2026');
      expect(q1).toBeTruthy();
      expect(q1!.averageScore).toBe(70); // (60+80)/2 = 70
      expect(q2!.averageScore).toBe(70); // single attempt
    });

    it('should set attemptCount correctly', () => {
      const attempts = [
        makeAttempt('u1', 's1', 50, '2026-01-01'),
        makeAttempt('u2', 's1', 70, '2026-01-15'),
      ];
      const result = service.computeTrendPoints(attempts, skillDefs, 'Engineering');
      const q1 = result.find((p) => p.quarter === 'Q1 2026');
      expect(q1!.attemptCount).toBe(2);
    });

    it('should scope correctly to filtered attempts (department filtering done by caller)', () => {
      // Only pass the dept-filtered attempts
      const engAttempts = [makeAttempt('u1', 's1', 90, '2026-01-10')];
      const result = service.computeTrendPoints(engAttempts, skillDefs, 'Engineering');
      expect(result[0].scope).toBe('Engineering');
      expect(result[0].averageScore).toBe(90);
    });
  });

  describe('transformToChartData', () => {
    it('should produce correct ngx-charts line-chart format', () => {
      const attempts = [
        makeAttempt('u1', 's1', 60, '2026-01-01'),
        makeAttempt('u1', 's1', 80, '2026-04-01'),
      ];
      const points = service.computeTrendPoints(attempts, skillDefs, 'All');
      const chartData = service.transformToChartData(points);

      expect(chartData.length).toBe(1);
      expect(chartData[0].name).toBe('TypeScript');
      expect(chartData[0].series.length).toBe(2);
      expect(chartData[0].series[0].name).toMatch(/Q\d \d{4}/);
    });

    it('should return one line per skill', () => {
      const attempts = [
        makeAttempt('u1', 's1', 70, '2026-01-01'),
        makeAttempt('u1', 's2', 80, '2026-01-01'),
      ];
      const points = service.computeTrendPoints(attempts, skillDefs, 'All');
      const chartData = service.transformToChartData(points);
      expect(chartData.length).toBe(2);
    });
  });
});
