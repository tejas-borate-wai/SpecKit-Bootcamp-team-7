import { Injectable } from '@angular/core';
import { RequiredSkill, ProficiencyLevel } from '../../shared/models/project.model';
import { EmployeeSkillRecord } from '../../shared/models/employee-skill.model';
import { CandidateMatchResult, SkillBreakdownEntry } from '../../shared/models/candidate-match.model';
import { TeamMember } from '../../shared/models/team-member.model';
import { Project } from '../../shared/models/project.model';
import { AvailabilityStatus } from '../../shared/models/availability.model';

const LEVEL_MAP: Record<string, ProficiencyLevel> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

const AVAILABILITY_RANK: Record<string, number> = {
  Available: 0,
  'Partially Available': 1,
  Busy: 2,
};

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CandidateMatchingService {
  /**
   * Calculate match score for a single employee against project required skills.
   * Stale skills (lastUpdated > 6 months) are excluded from matching.
   */
  calculateMatchScore(
    requiredSkills: RequiredSkill[],
    skillRecord: EmployeeSkillRecord
  ): { matchScore: number; matchedCount: number; breakdown: SkillBreakdownEntry[] } {
    const now = Date.now();
    const breakdown: SkillBreakdownEntry[] = [];
    let matchedCount = 0;

    for (const req of requiredSkills) {
      const empSkill = skillRecord.skills.find(
        (s) => s.skillId === req.skillId && !s.isDeleted
      );

      if (!empSkill) {
        breakdown.push({
          skillId: req.skillId,
          skillName: req.skillId,
          requiredLevel: req.minimumLevel,
          candidateLevel: null,
          status: 'Below',
          isStale: false,
        });
        continue;
      }

      const updatedAt = empSkill.lastUpdated ? new Date(empSkill.lastUpdated).getTime() : 0;
      const isStale = now - updatedAt > SIX_MONTHS_MS;
      const candidateLevel = LEVEL_MAP[empSkill.level] ?? 1;

      let status: 'Exceeds' | 'Meets' | 'Below';
      if (isStale) {
        status = 'Below';
      } else if (candidateLevel > req.minimumLevel) {
        status = 'Exceeds';
        matchedCount++;
      } else if (candidateLevel >= req.minimumLevel) {
        status = 'Meets';
        matchedCount++;
      } else {
        status = 'Below';
      }

      breakdown.push({
        skillId: req.skillId,
        skillName: req.skillId,
        requiredLevel: req.minimumLevel,
        candidateLevel,
        status,
        isStale,
      });
    }

    const total = requiredSkills.length;
    const matchScore = total > 0 ? Math.round((matchedCount / total) * 100) : 0;
    return { matchScore, matchedCount, breakdown };
  }

  /**
   * Rank all employees against a project's required skills.
   * Sort: score DESC → availability (Available=0, Partially=1, Busy=2) → name ASC
   */
  rankCandidates(
    project: Project,
    allSkillRecords: EmployeeSkillRecord[],
    users: TeamMember[],
    assignments: { userId: string; projectId: string }[] = [],
    activeProjectIds: string[] = []
  ): CandidateMatchResult[] {
    const results: CandidateMatchResult[] = [];

    for (const user of users) {
      const record = allSkillRecords.find((r) => r.userId === user.userId);
      if (!record) continue;

      const { matchScore, matchedCount, breakdown } = this.calculateMatchScore(
        project.requiredSkills,
        record
      );

      const isAssigned = assignments.some(
        (a) => a.userId === user.userId && activeProjectIds.includes(a.projectId)
      );
      const availability: AvailabilityStatus = isAssigned ? 'Busy' : 'Available';

      results.push({
        userId: user.userId,
        userName: user.name,
        department: user.department,
        avatarUrl: user.avatarUrl,
        matchScore,
        matchedCount,
        totalRequired: project.requiredSkills.length,
        availability,
        breakdown,
      });
    }

    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      const availA = AVAILABILITY_RANK[a.availability] ?? 2;
      const availB = AVAILABILITY_RANK[b.availability] ?? 2;
      if (availA !== availB) return availA - availB;
      return a.userName.localeCompare(b.userName);
    });

    return results;
  }
}
