import { Injectable } from '@angular/core';
import { SkillTestAttempt } from '../../shared/models/skill-test-attempt.model';
import { AchievementBadge } from '../../shared/models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  computeAchievements(skillId: string, attempts: SkillTestAttempt[]): AchievementBadge[] {
    const forSkill = attempts
      .filter((a) => a.skillId === skillId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const badges: AchievementBadge[] = [];

    // Badge 1: First Assessment — ≥1 test attempt
    if (forSkill.length >= 1) {
      badges.push({
        type: 'first-assessment',
        label: 'First Assessment',
        icon: 'emoji_events',
        earnedDate: forSkill[0].date,
      });
    }

    // Badge 2: Reached Advanced — any attempt score ≥ 66
    const advanced = forSkill.find((a) => a.score >= 66);
    if (advanced) {
      badges.push({
        type: 'reached-advanced',
        label: 'Reached Advanced',
        icon: 'military_tech',
        earnedDate: advanced.date,
      });
    }

    // Badge 3: Improved by 20% — maxScore - firstScore ≥ 20
    if (forSkill.length >= 2) {
      const firstScore = forSkill[0].score;
      const maxScore = Math.max(...forSkill.map((a) => a.score));
      if (maxScore - firstScore >= 20) {
        const improvedAttempt = forSkill.find((a) => a.score >= firstScore + 20);
        badges.push({
          type: 'improved-20',
          label: 'Improved by 20%',
          icon: 'trending_up',
          earnedDate: improvedAttempt?.date ?? null,
        });
      }
    }

    return badges;
  }

  computeAllAchievements(skillIds: string[], attempts: SkillTestAttempt[]): AchievementBadge[] {
    const allBadges: AchievementBadge[] = [];
    const seen = new Set<string>();
    for (const skillId of skillIds) {
      for (const badge of this.computeAchievements(skillId, attempts)) {
        if (!seen.has(badge.type)) {
          seen.add(badge.type);
          allBadges.push(badge);
        }
      }
    }
    return allBadges;
  }
}
