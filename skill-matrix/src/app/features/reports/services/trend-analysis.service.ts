import { Injectable } from '@angular/core';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillTrendPoint, TrendChartData } from '../../../shared/models/report.models';

@Injectable({ providedIn: 'root' })
export class TrendAnalysisService {
  /**
   * Group skill test attempts by (skillId, quarter) and compute average score.
   * @param attempts - pre-filtered by department (caller responsibility)
   * @param scope   - label string for the scope (e.g. department name or 'All')
   */
  computeTrendPoints(
    attempts: SkillTestAttempt[],
    skillDefinitions: SkillDefinition[],
    scope: string,
  ): SkillTrendPoint[] {
    const skillDefMap = new Map<string, string>(skillDefinitions.map((d) => [d.skillId, d.skillName]));

    // Group by key: `skillId::quarter`
    const buckets = new Map<string, number[]>();

    for (const attempt of attempts) {
      if (!skillDefMap.has(attempt.skillId)) continue;
      const quarter = this._getQuarterLabel(attempt.date);
      const key = `${attempt.skillId}::${quarter}`;
      const bucket = buckets.get(key) ?? [];
      bucket.push(attempt.score);
      buckets.set(key, bucket);
    }

    const points: SkillTrendPoint[] = [];

    buckets.forEach((scores, key) => {
      const [skillId, quarter] = key.split('::');
      const skillName = skillDefMap.get(skillId) ?? skillId;
      const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      points.push({ skillId, skillName, quarter, averageScore, attemptCount: scores.length, scope });
    });

    // Sort by quarter then skillName
    points.sort((a, b) => a.quarter.localeCompare(b.quarter) || a.skillName.localeCompare(b.skillName));

    return points;
  }

  /**
   * Transform SkillTrendPoint[] to ngx-charts line-chart format.
   * Format: [{ name: skillName, series: [{ name: quarterLabel, value: avgScore }] }]
   */
  transformToChartData(points: SkillTrendPoint[]): TrendChartData[] {
    const bySkill = new Map<string, TrendChartData>();

    for (const point of points) {
      if (!bySkill.has(point.skillId)) {
        bySkill.set(point.skillId, { name: point.skillName, series: [] });
      }
      bySkill.get(point.skillId)!.series.push({
        name: point.quarter,
        value: point.averageScore,
      });
    }

    return Array.from(bySkill.values());
  }

  /** Convert ISO date string to quarter label like "Q1 2026" */
  getQuarterLabel(dateString: string): string {
    return this._getQuarterLabel(dateString);
  }

  private _getQuarterLabel(dateString: string): string {
    const date = new Date(dateString);
    const month = date.getUTCMonth(); // 0-based
    const year = date.getUTCFullYear();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter} ${year}`;
  }
}
