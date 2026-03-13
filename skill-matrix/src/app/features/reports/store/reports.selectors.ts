import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportsState } from './reports.state';

export const selectReportsState = createFeatureSelector<ReportsState>('reports');

// ── Gap Analysis selectors ────────────────────────────────────────────────────

const selectGapAnalysisState = createSelector(selectReportsState, (s) => s.gapAnalysis);

export const selectGapRecords = createSelector(selectGapAnalysisState, (s) => s.records);
export const selectGapLoading = createSelector(selectGapAnalysisState, (s) => s.loading);
export const selectGapError = createSelector(selectGapAnalysisState, (s) => s.error);
export const selectGapSelectedProject = createSelector(selectGapAnalysisState, (s) => s.selectedProjectId);

// ── Team Capability selectors ─────────────────────────────────────────────────

const selectTeamCapabilityState = createSelector(selectReportsState, (s) => s.teamCapability);

export const selectCapabilitySnapshots = createSelector(selectTeamCapabilityState, (s) => s.snapshots);
export const selectCapabilityLoading = createSelector(selectTeamCapabilityState, (s) => s.loading);
export const selectCapabilityError = createSelector(selectTeamCapabilityState, (s) => s.error);
export const selectCapabilityDepartment = createSelector(selectTeamCapabilityState, (s) => s.selectedDepartment);
export const selectCapabilityCategoryId = createSelector(selectTeamCapabilityState, (s) => s.selectedCategoryId);
export const selectCapabilityViewMode = createSelector(selectTeamCapabilityState, (s) => s.viewMode);

// ── Heatmap selectors ─────────────────────────────────────────────────────────

const selectHeatmapState = createSelector(selectReportsState, (s) => s.heatmap);

export const selectHeatmapCells = createSelector(selectHeatmapState, (s) => s.cells);
export const selectHeatmapChartData = createSelector(selectHeatmapState, (s) => s.chartData);
export const selectHeatmapLoading = createSelector(selectHeatmapState, (s) => s.loading);
export const selectHeatmapError = createSelector(selectHeatmapState, (s) => s.error);

// ── Trends selectors ──────────────────────────────────────────────────────────

const selectTrendsState = createSelector(selectReportsState, (s) => s.trends);

export const selectTrendPoints = createSelector(selectTrendsState, (s) => s.points);
export const selectTrendChartData = createSelector(selectTrendsState, (s) => s.chartData);
export const selectTrendsLoading = createSelector(selectTrendsState, (s) => s.loading);
export const selectTrendsError = createSelector(selectTrendsState, (s) => s.error);
export const selectTrendsDepartment = createSelector(selectTrendsState, (s) => s.selectedDepartment);
