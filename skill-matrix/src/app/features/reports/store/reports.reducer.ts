import { createReducer, on } from '@ngrx/store';
import { ReportsActions } from './reports.actions';
import {
  ReportsState,
  GapAnalysisState,
  TeamCapabilityState,
  HeatmapState,
  TrendsState,
} from './reports.state';

// ── Initial sub-states ────────────────────────────────────────────────────────

const initialGapAnalysis: GapAnalysisState = {
  records: [],
  loading: false,
  error: null,
  selectedProjectId: null,
};

const initialTeamCapability: TeamCapabilityState = {
  snapshots: [],
  loading: false,
  error: null,
  selectedDepartment: null,
  selectedCategoryId: null,
  viewMode: 'byDepartment',
};

const initialHeatmap: HeatmapState = {
  cells: [],
  chartData: [],
  loading: false,
  error: null,
};

const initialTrends: TrendsState = {
  points: [],
  chartData: [],
  loading: false,
  error: null,
  selectedDepartment: null,
};

// ── Root initial state ────────────────────────────────────────────────────────

export const initialReportsState: ReportsState = {
  gapAnalysis: initialGapAnalysis,
  teamCapability: initialTeamCapability,
  heatmap: initialHeatmap,
  trends: initialTrends,
};

// ── Reducer ───────────────────────────────────────────────────────────────────

export const reportsReducer = createReducer(
  initialReportsState,

  // Gap Analysis
  on(ReportsActions.loadGapAnalysis, (state) => ({
    ...state,
    gapAnalysis: { ...state.gapAnalysis, loading: true, error: null },
  })),
  on(ReportsActions.loadGapAnalysisSuccess, (state, { records }) => ({
    ...state,
    gapAnalysis: { ...state.gapAnalysis, loading: false, records },
  })),
  on(ReportsActions.loadGapAnalysisFailure, (state, { error }) => ({
    ...state,
    gapAnalysis: { ...state.gapAnalysis, loading: false, error },
  })),
  on(ReportsActions.setGapSelectedProject, (state, { projectId }) => ({
    ...state,
    gapAnalysis: { ...state.gapAnalysis, selectedProjectId: projectId },
  })),

  // Team Capability
  on(ReportsActions.loadTeamCapability, (state) => ({
    ...state,
    teamCapability: { ...state.teamCapability, loading: true, error: null },
  })),
  on(ReportsActions.loadTeamCapabilitySuccess, (state, { snapshots }) => ({
    ...state,
    teamCapability: { ...state.teamCapability, loading: false, snapshots },
  })),
  on(ReportsActions.loadTeamCapabilityFailure, (state, { error }) => ({
    ...state,
    teamCapability: { ...state.teamCapability, loading: false, error },
  })),
  on(ReportsActions.setCapabilityDepartment, (state, { department }) => ({
    ...state,
    teamCapability: { ...state.teamCapability, selectedDepartment: department },
  })),
  on(ReportsActions.setCapabilityCategoryId, (state, { categoryId }) => ({
    ...state,
    teamCapability: { ...state.teamCapability, selectedCategoryId: categoryId },
  })),
  on(ReportsActions.setCapabilityViewMode, (state, { viewMode }) => ({
    ...state,
    teamCapability: { ...state.teamCapability, viewMode },
  })),

  // Heatmap
  on(ReportsActions.loadHeatmap, (state) => ({
    ...state,
    heatmap: { ...state.heatmap, loading: true, error: null },
  })),
  on(ReportsActions.loadHeatmapSuccess, (state, { cells, chartData }) => ({
    ...state,
    heatmap: { ...state.heatmap, loading: false, cells, chartData },
  })),
  on(ReportsActions.loadHeatmapFailure, (state, { error }) => ({
    ...state,
    heatmap: { ...state.heatmap, loading: false, error },
  })),

  // Trends
  on(ReportsActions.loadTrends, (state) => ({
    ...state,
    trends: { ...state.trends, loading: true, error: null },
  })),
  on(ReportsActions.loadTrendsSuccess, (state, { points, chartData }) => ({
    ...state,
    trends: { ...state.trends, loading: false, points, chartData },
  })),
  on(ReportsActions.loadTrendsFailure, (state, { error }) => ({
    ...state,
    trends: { ...state.trends, loading: false, error },
  })),
  on(ReportsActions.setTrendsDepartment, (state, { department }) => ({
    ...state,
    trends: { ...state.trends, selectedDepartment: department },
  })),
);
