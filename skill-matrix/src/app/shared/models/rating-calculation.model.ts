import { ProficiencyLevel } from './skill-submission.model';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface RatingInput {
  selfRating: number | null;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
}

export interface RatingResult {
  finalRating: number;
  sourceCount: number;
  confidence: ConfidenceLevel;
  effectiveWeights: Record<string, number>;
  level: ProficiencyLevel;
}
