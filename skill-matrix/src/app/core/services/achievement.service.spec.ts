import { AchievementService } from './achievement.service';
import { SkillTestAttempt } from '../../shared/models/skill-test-attempt.model';

function makeAttempt(overrides: Partial<SkillTestAttempt>): SkillTestAttempt {
  return {
    attemptId: 'a-001',
    userId: 'u001',
    skillId: 'skill-001',
    score: 50,
    earnedPoints: 50,
    maxPoints: 100,
    date: '2025-06-01T10:00:00Z',
    timeTaken: 30,
    ...overrides,
  };
}

describe('AchievementService', () => {
  let service: AchievementService;

  beforeEach(() => {
    service = new AchievementService();
  });

  describe('computeAchievements', () => {
    it('should return empty array when no test attempts exist', () => {
      const result = service.computeAchievements('skill-001', []);
      expect(result).toEqual([]);
    });

    it('should award First Assessment badge when at least 1 attempt exists', () => {
      const attempts = [makeAttempt({ score: 40 })];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.some(b => b.type === 'first-assessment')).toBeTrue();
    });

    it('should NOT award First Assessment badge for a different skill', () => {
      const attempts = [makeAttempt({ skillId: 'skill-002', score: 40 })];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.length).toBe(0);
    });

    it('should award Reached Advanced badge for score >= 66', () => {
      const attempts = [makeAttempt({ score: 66 })];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.some(b => b.type === 'reached-advanced')).toBeTrue();
    });

    it('should NOT award Reached Advanced badge for score < 66', () => {
      const attempts = [makeAttempt({ score: 65 })];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.some(b => b.type === 'reached-advanced')).toBeFalse();
    });

    it('should award Improved by 20% badge when improvement >= 20 points', () => {
      const attempts = [
        makeAttempt({ attemptId: 'a-001', score: 40, date: '2025-05-01T10:00:00Z' }),
        makeAttempt({ attemptId: 'a-002', score: 62, date: '2025-06-01T10:00:00Z' }),
      ];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.some(b => b.type === 'improved-20')).toBeTrue();
    });

    it('should NOT award Improved by 20% badge when improvement < 20 points', () => {
      const attempts = [
        makeAttempt({ attemptId: 'a-001', score: 40, date: '2025-05-01T10:00:00Z' }),
        makeAttempt({ attemptId: 'a-002', score: 55, date: '2025-06-01T10:00:00Z' }),
      ];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.some(b => b.type === 'improved-20')).toBeFalse();
    });

    it('should award all 3 badges when all conditions are met', () => {
      const attempts = [
        makeAttempt({ attemptId: 'a-001', score: 40, date: '2025-04-01T10:00:00Z' }),
        makeAttempt({ attemptId: 'a-002', score: 80, date: '2025-06-01T10:00:00Z' }),
      ];
      const badges = service.computeAchievements('skill-001', attempts);
      expect(badges.length).toBe(3);
      expect(badges.map(b => b.type)).toContain('first-assessment');
      expect(badges.map(b => b.type)).toContain('reached-advanced');
      expect(badges.map(b => b.type)).toContain('improved-20');
    });
  });

  describe('computeAllAchievements', () => {
    it('should deduplicate badge types across skills', () => {
      const attempts = [
        makeAttempt({ skillId: 'skill-001', score: 70, date: '2025-05-01T10:00:00Z' }),
        makeAttempt({ skillId: 'skill-002', score: 70, date: '2025-05-01T10:00:00Z' }),
      ];
      const badges = service.computeAllAchievements(['skill-001', 'skill-002'], attempts);
      const types = badges.map(b => b.type);
      const uniqueTypes = new Set(types);
      expect(types.length).toBe(uniqueTypes.size);
    });

    it('should return empty array when no skills or attempts', () => {
      expect(service.computeAllAchievements([], [])).toEqual([]);
    });
  });
});
