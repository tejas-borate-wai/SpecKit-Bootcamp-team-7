import { Injectable } from '@angular/core';
import { Project, ProficiencyLevel } from '../../shared/models/project.model';
import { EmployeeSkillRecord } from '../../shared/models/employee-skill.model';
import { SkillGapResult, NearestEmployee } from '../../shared/models/skill-gap.model';
import { TeamMember } from '../../shared/models/team-member.model';
import { SkillDefinition } from '../../shared/models/skill-definition.model';

const LEVEL_MAP: Record<string, ProficiencyLevel> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class SkillGapService {
  detectSkillGaps(
    project: Project,
    allSkillRecords: EmployeeSkillRecord[],
    users: TeamMember[],
    definitions: SkillDefinition[]
  ): SkillGapResult[] {
    const now = Date.now();
    const gaps: SkillGapResult[] = [];

    for (const req of project.requiredSkills) {
      const def = definitions.find((d) => d.skillId === req.skillId);
      const skillName = def?.skillName ?? req.skillId;

      // Collect candidates with this skill (non-stale)
      const candidates: { userId: string; level: ProficiencyLevel }[] = [];
      for (const record of allSkillRecords) {
        const skill = record.skills.find(
          (s) => s.skillId === req.skillId && !s.isDeleted
        );
        if (!skill) continue;
        const updated = skill.lastUpdated ? new Date(skill.lastUpdated).getTime() : 0;
        if (now - updated > SIX_MONTHS_MS) continue;
        candidates.push({ userId: record.userId, level: LEVEL_MAP[skill.level] ?? 1 });
      }

      const highestLevel = candidates.length > 0
        ? (Math.max(...candidates.map((c) => c.level)) as ProficiencyLevel)
        : 0 as ProficiencyLevel;

      if (highestLevel >= req.minimumLevel) continue; // No gap

      const gapPercentage = req.minimumLevel > 0
        ? Math.round(((req.minimumLevel - highestLevel) / req.minimumLevel) * 100)
        : 100;

      // Find up to 3 nearest employees
      const nearest: NearestEmployee[] = candidates
        .sort((a, b) => b.level - a.level)
        .slice(0, 3)
        .map((c) => {
          const user = users.find((u) => u.userId === c.userId);
          return {
            userId: c.userId,
            name: user?.name ?? c.userId,
            currentLevel: c.level,
            levelGap: req.minimumLevel - c.level,
          };
        });

      gaps.push({
        skillId: req.skillId,
        skillName,
        requiredLevel: req.minimumLevel,
        highestAvailableLevel: highestLevel,
        gapPercentage,
        nearestEmployees: nearest,
      });
    }

    return gaps;
  }
}
