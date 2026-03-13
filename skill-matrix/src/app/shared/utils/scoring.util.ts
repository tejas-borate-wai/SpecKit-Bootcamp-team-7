import { DifficultyLevel, ExamQuestion } from '../models/skill-exam.model';
import { SkillProficiencyLevel } from '../models/employee-skill.model';

export const DIFFICULTY_POINTS: Record<DifficultyLevel, number> = {
  Easy: 1,
  Medium: 2,
  Hard: 3,
};

export function calculateWeightedScore(
  questions: ExamQuestion[],
  answers: Record<string, string>
): { earnedPoints: number; maxPoints: number; testScore: number } {
  let earnedPoints = 0;
  let maxPoints = 0;
  for (const q of questions) {
    const points = DIFFICULTY_POINTS[q.difficultyLevel];
    maxPoints += points;
    if (answers[q.questionId] === q.correctAnswer) {
      earnedPoints += points;
    }
  }
  const testScore = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
  return { earnedPoints, maxPoints, testScore };
}

export function calculateSystemRating(
  testScore: number,
  hasCertification: boolean,
  hasProjectExperience: boolean
): number {
  const certBonus = hasCertification ? 100 : 0;
  const projectBonus = hasProjectExperience ? 100 : 0;
  return testScore * 0.6 + certBonus * 0.2 + projectBonus * 0.2;
}

export function mapScoreToLevel(scorePercentage: number): SkillProficiencyLevel {
  if (scorePercentage >= 86) return 'Expert';
  if (scorePercentage >= 66) return 'Advanced';
  if (scorePercentage >= 41) return 'Intermediate';
  return 'Beginner';
}

export function calculateLevelChange(
  current: SkillProficiencyLevel,
  previous: SkillProficiencyLevel | null
): { levelChanged: boolean; levelDirection: 'up' | 'down' | 'none' } {
  if (!previous || current === previous) {
    return { levelChanged: false, levelDirection: 'none' };
  }
  const order: SkillProficiencyLevel[] = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
  ];
  const currentIdx = order.indexOf(current);
  const previousIdx = order.indexOf(previous);
  return {
    levelChanged: true,
    levelDirection: currentIdx > previousIdx ? 'up' : 'down',
  };
}
