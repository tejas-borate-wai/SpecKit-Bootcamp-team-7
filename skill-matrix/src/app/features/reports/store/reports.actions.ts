import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {
  SkillGapRecord,
  TeamCapabilitySnapshot,
  HeatmapCell,
  HeatmapChartData,
  SkillTrendPoint,
  TrendChartData,
} from '../../../shared/models/report.models';

export const ReportsActions = createActionGroup({
  source: 'Reports',
  events: {
    // ── Gap Analysis ──────────────────────────────────────────────────
    'Load Gap Analysis': props<{ department?: string }>(),
    'Load Gap Analysis Success': props<{ records: SkillGapRecord[] }>(),
    'Load Gap Analysis Failure': props<{ error: string }>(),
    'Set Gap Selected Project': props<{ projectId: string | null }>(),

    // ── Team Capability ───────────────────────────────────────────────
    'Load Team Capability': props<{ department?: string; categoryId?: string }>(),
    'Load Team Capability Success': props<{ snapshots: TeamCapabilitySnapshot[] }>(),
    'Load Team Capability Failure': props<{ error: string }>(),
    'Set Capability Department': props<{ department: string | null }>(),
    'Set Capability Category Id': props<{ categoryId: string | null }>(),
    'Set Capability View Mode': props<{ viewMode: 'byDepartment' | 'byCategory' }>(),

    // ── Heatmap ───────────────────────────────────────────────────────
    'Load Heatmap': emptyProps(),
    'Load Heatmap Success': props<{ cells: HeatmapCell[]; chartData: HeatmapChartData[] }>(),
    'Load Heatmap Failure': props<{ error: string }>(),

    // ── Trends ────────────────────────────────────────────────────────
    'Load Trends': props<{ department?: string }>(),
    'Load Trends Success': props<{ points: SkillTrendPoint[]; chartData: TrendChartData[] }>(),
    'Load Trends Failure': props<{ error: string }>(),
    'Set Trends Department': props<{ department: string | null }>(),
  },
});
