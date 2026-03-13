import {
  SkillGapRecord,
  TeamCapabilitySnapshot,
  HeatmapCell,
  HeatmapChartData,
  SkillTrendPoint,
  TrendChartData,
} from '../../../shared/models/report.models';

// ── Sub-state interfaces ──────────────────────────────────────────────────────

export interface GapAnalysisState {
  records: SkillGapRecord[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
}

export interface TeamCapabilityState {
  snapshots: TeamCapabilitySnapshot[];
  loading: boolean;
  error: string | null;
  selectedDepartment: string | null;
  selectedCategoryId: string | null;
  viewMode: 'byDepartment' | 'byCategory';
}

export interface HeatmapState {
  cells: HeatmapCell[];
  chartData: HeatmapChartData[];
  loading: boolean;
  error: string | null;
}

export interface TrendsState {
  points: SkillTrendPoint[];
  chartData: TrendChartData[];
  loading: boolean;
  error: string | null;
  selectedDepartment: string | null;
}

// ── Root state ────────────────────────────────────────────────────────────────

export interface ReportsState {
  gapAnalysis: GapAnalysisState;
  teamCapability: TeamCapabilityState;
  heatmap: HeatmapState;
  trends: TrendsState;
}
