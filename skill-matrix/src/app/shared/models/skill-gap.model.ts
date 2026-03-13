import { ProficiencyLevel } from './project.model';

export interface NearestEmployee {
  userId: string;
  name: string;
  currentLevel: ProficiencyLevel;
  levelGap: number;
}

export interface SkillGapResult {
  skillId: string;
  skillName: string;
  requiredLevel: ProficiencyLevel;
  highestAvailableLevel: ProficiencyLevel | null;
  gapPercentage: number;
  nearestEmployees: NearestEmployee[];
}
