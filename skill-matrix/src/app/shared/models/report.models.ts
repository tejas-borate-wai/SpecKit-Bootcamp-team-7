import { SkillProficiencyLevel } from './employee-skill.model';

// ── Proficiency Mapping ───────────────────────────────────────────────────────

export const PROFICIENCY_TO_PERCENT: Record<SkillProficiencyLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100,
};

export function proficiencyToPercent(level: SkillProficiencyLevel | undefined | null): number {
  if (!level) return 0;
  return PROFICIENCY_TO_PERCENT[level] ?? 0;
}

export function percentToProficiency(percent: number): SkillProficiencyLevel {
  if (percent >= 100) return 'Expert';
  if (percent >= 75) return 'Advanced';
  if (percent >= 50) return 'Intermediate';
  return 'Beginner';
}

// ── Shared Export Metadata ────────────────────────────────────────────────────

export interface ExportMetadata {
  reportTitle: string;
  generationDate: string; // YYYY-MM-DD
  generatingUserName: string;
}

// ── User Story 1: Skill Gap Analysis ─────────────────────────────────────────

export type GapSeverity = 'none' | 'warning' | 'critical';

export interface SkillGapRecord {
  skillId: string;
  skillName: string;
  projectId: string;
  projectName: string;
  requiredLevelPercent: number;
  teamAverageLevelPercent: number;
  gapPercent: number;
  gapSeverity: GapSeverity;
  department?: string;
}

// ── User Story 2: Team Capability ─────────────────────────────────────────────

export interface TeamCapabilitySnapshot {
  skillId: string;
  skillName: string;
  categoryId: string;
  categoryName: string;
  department: string;
  averageProficiencyPercent: number;
  proficiencyLevel: SkillProficiencyLevel;
  employeeCount: number;
}

// ── User Story 3: Org Heatmap ─────────────────────────────────────────────────

export type IntensityBucket = 'low' | 'medium' | 'high' | 'very-high';

export interface HeatmapCell {
  skillId: string;
  skillName: string;
  proficiencyLevel: SkillProficiencyLevel;
  employeeCount: number;
  intensityBucket: IntensityBucket;
}

export interface HeatmapChartData {
  name: string;
  series: { name: string; value: number }[];
}

// ── User Story 4: Skill Trends ────────────────────────────────────────────────

export interface SkillTrendPoint {
  skillId: string;
  skillName: string;
  quarter: string;
  averageScore: number;
  attemptCount: number;
  scope: string;
}

export interface TrendChartData {
  name: string;
  series: { name: string; value: number }[];
}
