import { ProficiencyLevel } from './project.model';
import { AvailabilityStatus } from './availability.model';

export interface SkillBreakdownEntry {
  skillId: string;
  skillName: string;
  requiredLevel: ProficiencyLevel;
  candidateLevel: ProficiencyLevel | null;
  status: 'Exceeds' | 'Meets' | 'Below';
  isStale: boolean;
}

export interface CandidateMatchResult {
  userId: string;
  userName: string;
  department: string;
  matchScore: number;
  matchedCount: number;
  totalRequired: number;
  availability: AvailabilityStatus;
  skillBreakdown: SkillBreakdownEntry[];
}
