export type AchievementType = 'first-assessment' | 'reached-advanced' | 'improved-20';

export interface AchievementBadge {
  type: AchievementType;
  label: string;
  icon: string;
  earnedDate: string | null;
}
