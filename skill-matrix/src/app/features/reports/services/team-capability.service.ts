import { Injectable } from '@angular/core';
import { EmployeeSkillRecord, SkillProficiencyLevel } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import {
  TeamCapabilitySnapshot,
  proficiencyToPercent,
  percentToProficiency,
} from '../../../shared/models/report.models';

interface SkillDeptKey {
  skillId: string;
  department: string;
}

@Injectable({ providedIn: 'root' })
export class TeamCapabilityService {
  /**
   * Two-pass algorithm:
   * Pass 1 — build a matrix keyed by (skillId, department) collecting individual proficiency %s.
   * Pass 2 — compute average and map back to a proficiency level.
   *
   * Users must be passed so we can resolve userId → department.
   * The caller can pre-filter employeeSkills and skillDefinitions by department/category.
   */
  computeCapabilitySnapshots(
    employeeSkills: EmployeeSkillRecord[],
    skillDefinitions: SkillDefinition[],
    skillCategories: SkillCategory[],
    users: { id: string; department: string }[],
  ): TeamCapabilitySnapshot[] {
    const userDeptMap = new Map<string, string>(users.map((u) => [u.id, u.department]));
    const skillDefMap = new Map<string, SkillDefinition>(skillDefinitions.map((d) => [d.skillId, d]));
    const categoryMap = new Map<string, string>(skillCategories.map((c) => [c.categoryId, c.categoryName]));

    // Pass 1: collect buckets
    const buckets = new Map<string, number[]>();

    for (const record of employeeSkills) {
      const dept = userDeptMap.get(record.userId);
      if (!dept) continue;

      for (const empSkill of record.skills) {
        if (empSkill.isDeleted) continue;
        if (!skillDefMap.has(empSkill.skillId)) continue;

        const key = `${empSkill.skillId}::${dept}`;
        const pct = proficiencyToPercent(empSkill.level as SkillProficiencyLevel);
        const bucket = buckets.get(key) ?? [];
        bucket.push(pct);
        buckets.set(key, bucket);
      }
    }

    // Pass 2: compute averages
    const snapshots: TeamCapabilitySnapshot[] = [];

    buckets.forEach((percents, key) => {
      const [skillId, department] = key.split('::');
      const skillDef = skillDefMap.get(skillId);
      if (!skillDef) return;

      const avg = Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
      const proficiencyLevel = percentToProficiency(avg);
      const categoryName = categoryMap.get(skillDef.categoryId) ?? skillDef.categoryId;

      snapshots.push({
        skillId,
        skillName: skillDef.skillName,
        categoryId: skillDef.categoryId,
        categoryName,
        department,
        averageProficiencyPercent: avg,
        proficiencyLevel,
        employeeCount: percents.length,
      });
    });

    return snapshots;
  }
}
