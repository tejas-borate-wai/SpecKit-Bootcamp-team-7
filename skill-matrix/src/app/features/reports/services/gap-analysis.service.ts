import { Injectable } from '@angular/core';
import { Project } from '../../../shared/models/project.model';
import { EmployeeSkillRecord, SkillProficiencyLevel } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import {
  GapSeverity,
  SkillGapRecord,
  proficiencyToPercent,
} from '../../../shared/models/report.models';

// Numeric ProficiencyLevel (1–4) in Project model maps to these levels
const NUMERIC_LEVEL_TO_PERCENT: Record<number, number> = {
  1: 25,  // Beginner
  2: 50,  // Intermediate
  3: 75,  // Advanced
  4: 100, // Expert
};

@Injectable({ providedIn: 'root' })
export class GapAnalysisService {
  /**
   * Compute gap records for each required skill across all projects.
   * Employee scoping (by department) must be done by the caller before passing employeeSkills.
   */
  computeGapRecords(
    projects: Project[],
    employeeSkills: EmployeeSkillRecord[],
    skillDefinitions: SkillDefinition[],
  ): SkillGapRecord[] {
    const records: SkillGapRecord[] = [];

    for (const project of projects) {
      if (!project.requiredSkills?.length) continue;

      for (const required of project.requiredSkills) {
        const skillDef = skillDefinitions.find((d) => d.skillId === required.skillId);
        if (!skillDef) continue;

        const requiredLevelPercent =
          NUMERIC_LEVEL_TO_PERCENT[required.minimumLevel] ?? 0;

        // Gather all employee levels for this skill
        const employeeLevelPercents: number[] = [];
        for (const record of employeeSkills) {
          const empSkill = record.skills.find(
            (s) => s.skillId === required.skillId && !s.isDeleted,
          );
          if (empSkill?.level) {
            employeeLevelPercents.push(
              proficiencyToPercent(empSkill.level as SkillProficiencyLevel),
            );
          } else {
            // Employee without the skill contributes 0%
            employeeLevelPercents.push(0);
          }
        }

        const teamAverageLevelPercent =
          employeeLevelPercents.length === 0
            ? 0
            : Math.round(
                employeeLevelPercents.reduce((a, b) => a + b, 0) /
                  employeeLevelPercents.length,
              );

        const gapPercent = Math.max(0, requiredLevelPercent - teamAverageLevelPercent);
        const gapSeverity = this._computeSeverity(gapPercent);

        records.push({
          skillId: required.skillId,
          skillName: skillDef.skillName,
          projectId: project.projectId,
          projectName: project.name,
          requiredLevelPercent,
          teamAverageLevelPercent,
          gapPercent,
          gapSeverity,
        });
      }
    }

    return records;
  }

  private _computeSeverity(gapPercent: number): GapSeverity {
    if (gapPercent === 0) return 'none';
    if (gapPercent < 50) return 'warning';
    return 'critical';
  }
}
