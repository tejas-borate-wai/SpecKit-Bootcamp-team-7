import { SkillProficiencyLevel } from './employee-skill.model';

export interface ScoreCard {
  testScore: number;
  earnedPoints: number;
  maxPoints: number;
  certificationBonus: boolean;
  projectExperienceBonus: boolean;
  systemRating: number;
  finalRating: number | null;
  level: SkillProficiencyLevel;
  previousLevel: SkillProficiencyLevel | null;
  levelChanged: boolean;
  levelDirection: 'up' | 'down' | 'none';
}
