import { Injectable } from '@angular/core';
import { EmployeeSkillRecord, SkillProficiencyLevel } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import {
  HeatmapCell,
  HeatmapChartData,
  IntensityBucket,
  proficiencyToPercent,
} from '../../../shared/models/report.models';

const PROFICIENCY_LEVELS: SkillProficiencyLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

@Injectable({ providedIn: 'root' })
export class HeatmapService {
  /**
   * Build a 2D count matrix: for each skill × proficiency level, how many employees hold it.
   */
  computeHeatmapCells(
    employeeSkills: EmployeeSkillRecord[],
    skillDefinitions: SkillDefinition[],
  ): HeatmapCell[] {
    // Count matrix keyed by `skillId::level`
    const countMap = new Map<string, number>();

    for (const record of employeeSkills) {
      for (const empSkill of record.skills) {
        if (empSkill.isDeleted) continue;
        if (!skillDefinitions.some((d) => d.skillId === empSkill.skillId)) continue;
        const key = `${empSkill.skillId}::${empSkill.level}`;
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
    }

    // Find global max for intensity bucket calculation
    const maxCount = Math.max(0, ...countMap.values());

    const cells: HeatmapCell[] = [];

    for (const skillDef of skillDefinitions) {
      for (const level of PROFICIENCY_LEVELS) {
        const key = `${skillDef.skillId}::${level}`;
        const count = countMap.get(key) ?? 0;
        cells.push({
          skillId: skillDef.skillId,
          skillName: skillDef.skillName,
          proficiencyLevel: level,
          employeeCount: count,
          intensityBucket: this._intensityBucket(count, maxCount),
        });
      }
    }

    return cells;
  }

  /**
   * Transform HeatmapCell[] into ngx-charts heat-map format.
   * Format: [{ name: skillName, series: [{ name: levelName, value: count }] }]
   */
  transformToChartData(cells: HeatmapCell[]): HeatmapChartData[] {
    const bySkill = new Map<string, HeatmapChartData>();

    for (const cell of cells) {
      if (!bySkill.has(cell.skillId)) {
        bySkill.set(cell.skillId, { name: cell.skillName, series: [] });
      }
      bySkill.get(cell.skillId)!.series.push({
        name: cell.proficiencyLevel,
        value: cell.employeeCount,
      });
    }

    return Array.from(bySkill.values());
  }

  private _intensityBucket(count: number, maxCount: number): IntensityBucket {
    if (maxCount === 0 || count === 0) return 'low';
    const ratio = count / maxCount;
    if (ratio >= 0.75) return 'very-high';
    if (ratio >= 0.5) return 'high';
    if (ratio >= 0.25) return 'medium';
    return 'low';
  }
}
