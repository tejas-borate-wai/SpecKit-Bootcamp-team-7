export interface ProficiencyLevel {
  levelId: number;
  levelName: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  score: number;
  description: string;
  exampleCriteria: string;
  thresholdMin: number;
  thresholdMax: number;
}
