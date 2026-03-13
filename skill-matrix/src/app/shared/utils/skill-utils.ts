import { EmployeeSkill, SkillProficiencyLevel } from '../models/employee-skill.model';
import { ConfidenceLevel } from '../models/dashboard.model';

/** Convert a 1–4 rating to a 0–100 percentage. */
export function ratingToPercentage(rating: number): number {
  return (rating / 4.0) * 100;
}

/** Map a percentage score (0–100) to a proficiency level label. */
export function percentageToLevel(percentage: number): SkillProficiencyLevel {
  if (percentage >= 86) return 'Expert';
  if (percentage >= 66) return 'Advanced';
  if (percentage >= 41) return 'Intermediate';
  return 'Beginner';
}

/** Derive confidence level from the number of non-null rating sources. */
export function computeConfidence(skill: EmployeeSkill): ConfidenceLevel {
  const nonNull = [skill.selfRating, skill.managerRating, skill.peerRating, skill.systemRating]
    .filter((r) => r !== null && r !== undefined).length;
  if (nonNull >= 3) return 'high';
  if (nonNull === 2) return 'medium';
  return 'low';
}

/** Return true if the ISO date string is more than 6 months in the past. */
export function isStale(lastUpdatedIso: string): boolean {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return new Date(lastUpdatedIso) < sixMonthsAgo;
}
