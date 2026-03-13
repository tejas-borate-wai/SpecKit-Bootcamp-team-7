export interface SkillTestAttempt {
  attemptId: string;
  userId: string;
  skillId: string;
  score: number;
  earnedPoints: number;
  maxPoints: number;
  date: string;
  timeTaken: number;
}
