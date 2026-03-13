import { ratingToPercentage, percentageToLevel, computeConfidence, isStale } from './skill-utils';
import { EmployeeSkill } from '../models/employee-skill.model';

describe('skill-utils', () => {
  // ─── ratingToPercentage ───────────────────────────────────────────────────

  describe('ratingToPercentage', () => {
    it('should map rating 1 to 25', () => expect(ratingToPercentage(1)).toBe(25));
    it('should map rating 2 to 50', () => expect(ratingToPercentage(2)).toBe(50));
    it('should map rating 3 to 75', () => expect(ratingToPercentage(3)).toBe(75));
    it('should map rating 4 to 100', () => expect(ratingToPercentage(4)).toBe(100));
    it('should return null for null input', () => expect(ratingToPercentage(null)).toBeNull());
  });

  // ─── percentageToLevel ────────────────────────────────────────────────────

  describe('percentageToLevel', () => {
    it('should return Beginner for percentage < 25', () => expect(percentageToLevel(10)).toBe('Beginner'));
    it('should return Beginner for 25', () => expect(percentageToLevel(25)).toBe('Beginner'));
    it('should return Intermediate for 26–50', () => expect(percentageToLevel(40)).toBe('Intermediate'));
    it('should return Intermediate for 50', () => expect(percentageToLevel(50)).toBe('Intermediate'));
    it('should return Advanced for 51–75', () => expect(percentageToLevel(60)).toBe('Advanced'));
    it('should return Advanced for 75', () => expect(percentageToLevel(75)).toBe('Advanced'));
    it('should return Expert for > 75', () => expect(percentageToLevel(80)).toBe('Expert'));
    it('should return Expert for 100', () => expect(percentageToLevel(100)).toBe('Expert'));
  });

  // ─── isStale ──────────────────────────────────────────────────────────────

  describe('isStale', () => {
    it('should return false for a date within 6 months', () => {
      const recentDate = new Date();
      recentDate.setMonth(recentDate.getMonth() - 3);
      expect(isStale(recentDate.toISOString())).toBeFalse();
    });

    it('should return true for a date more than 6 months ago', () => {
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 8);
      expect(isStale(oldDate.toISOString())).toBeTrue();
    });

    it('should return true for exactly 7 months ago', () => {
      const borderDate = new Date();
      borderDate.setMonth(borderDate.getMonth() - 7);
      expect(isStale(borderDate.toISOString())).toBeTrue();
    });
  });

  // ─── computeConfidence ─────────────────────────────────────────────────────

  describe('computeConfidence', () => {
    const base: EmployeeSkill = {
      skillId: 'skill-001',
      selfRating: null, managerRating: null, peerRating: null,
      systemRating: null, finalRating: null,
      level: 'Beginner', status: 'Draft', lastUpdated: new Date().toISOString(), isDeleted: false,
    };

    it('should return low when no ratings present', () => {
      expect(computeConfidence(base)).toBe('low');
    });

    it('should return low for 1 source', () => {
      expect(computeConfidence({ ...base, selfRating: 2 })).toBe('low');
    });

    it('should return medium for 2 sources', () => {
      expect(computeConfidence({ ...base, selfRating: 2, managerRating: 3 })).toBe('medium');
    });

    it('should return high for 3+ sources', () => {
      expect(computeConfidence({ ...base, selfRating: 2, managerRating: 3, peerRating: 3 })).toBe('high');
    });

    it('should count systemRating as a source', () => {
      expect(computeConfidence({ ...base, selfRating: 2, systemRating: 60 })).toBe('medium');
    });
  });
});
