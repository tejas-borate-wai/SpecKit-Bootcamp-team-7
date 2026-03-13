import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs';
import { of } from 'rxjs';
import { ReportsActions } from './reports.actions';
import { GapAnalysisService } from '../services/gap-analysis.service';
import { TeamCapabilityService } from '../services/team-capability.service';
import { HeatmapService } from '../services/heatmap.service';
import { TrendAnalysisService } from '../services/trend-analysis.service';
import { ToastService } from '../../../shared/services/toast.service';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { Project } from '../../../shared/models/project.model';
import { EmployeeSkillRecord } from '../../../shared/models/employee-skill.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillTestAttempt } from '../../../shared/models/skill-test-attempt.model';

// ── US1: Gap Analysis effect ──────────────────────────────────────────────────

export const loadGapAnalysisEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const store = inject(Store);
    const http = inject(HttpClient);
    const gapService = inject(GapAnalysisService);
    const toast = inject(ToastService);

    return actions$.pipe(
      ofType(ReportsActions.loadGapAnalysis),
      withLatestFrom(store.select(selectCurrentUser)),
      switchMap(([action, user]) => {
        const dept = action.department ?? (user?.role === 'Manager' ? user.department : undefined);
        const url = dept ? `/api/reports/gap-analysis?department=${encodeURIComponent(dept)}` : '/api/reports/gap-analysis';

        return http.get<{ projects: Project[]; employeeSkills: EmployeeSkillRecord[]; skillDefinitions: SkillDefinition[] }>(url).pipe(
          map((response) => {
            const records = gapService.computeGapRecords(
              response.projects,
              response.employeeSkills,
              response.skillDefinitions,
            );
            return ReportsActions.loadGapAnalysisSuccess({ records });
          }),
          catchError((err: HttpErrorResponse) => {
            const msg = err.error?.message ?? 'Failed to load gap analysis data.';
            toast.showError(msg);
            return of(ReportsActions.loadGapAnalysisFailure({ error: msg }));
          }),
        );
      }),
    );
  },
  { functional: true },
);

// ── US2: Team Capability effect ───────────────────────────────────────────────

export const loadTeamCapabilityEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const store = inject(Store);
    const http = inject(HttpClient);
    const teamCapService = inject(TeamCapabilityService);
    const toast = inject(ToastService);

    return actions$.pipe(
      ofType(ReportsActions.loadTeamCapability),
      withLatestFrom(store.select(selectCurrentUser)),
      switchMap(([action, user]) => {
        const dept = action.department ?? (user?.role === 'Manager' ? user.department : undefined);
        const params = new URLSearchParams();
        if (dept) params.set('department', dept);
        if (action.categoryId) params.set('categoryId', action.categoryId);
        const query = params.toString();
        const url = query ? `/api/reports/team-capability?${query}` : '/api/reports/team-capability';

        return http.get<{
          employeeSkills: EmployeeSkillRecord[];
          skillDefinitions: SkillDefinition[];
          skillCategories: SkillCategory[];
          users: { id: string; department: string }[];
        }>(url).pipe(
          map((response) => {
            const snapshots = teamCapService.computeCapabilitySnapshots(
              response.employeeSkills,
              response.skillDefinitions,
              response.skillCategories,
              response.users,
            );
            return ReportsActions.loadTeamCapabilitySuccess({ snapshots });
          }),
          catchError((err: HttpErrorResponse) => {
            const msg = err.error?.message ?? 'Failed to load team capability data.';
            toast.showError(msg);
            return of(ReportsActions.loadTeamCapabilityFailure({ error: msg }));
          }),
        );
      }),
    );
  },
  { functional: true },
);

// ── US3: Heatmap effect ───────────────────────────────────────────────────────

export const loadHeatmapEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const http = inject(HttpClient);
    const heatmapService = inject(HeatmapService);
    const toast = inject(ToastService);

    return actions$.pipe(
      ofType(ReportsActions.loadHeatmap),
      switchMap(() =>
        http.get<{ employeeSkills: EmployeeSkillRecord[]; skillDefinitions: SkillDefinition[] }>('/api/reports/heatmap').pipe(
          map((response) => {
            const cells = heatmapService.computeHeatmapCells(response.employeeSkills, response.skillDefinitions);
            const chartData = heatmapService.transformToChartData(cells);
            return ReportsActions.loadHeatmapSuccess({ cells, chartData });
          }),
          catchError((err: HttpErrorResponse) => {
            const msg = err.error?.message ?? 'Failed to load heatmap data.';
            toast.showError(msg);
            return of(ReportsActions.loadHeatmapFailure({ error: msg }));
          }),
        ),
      ),
    );
  },
  { functional: true },
);

// ── US4: Skill Trends effect ──────────────────────────────────────────────────

export const loadTrendsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const store = inject(Store);
    const http = inject(HttpClient);
    const trendService = inject(TrendAnalysisService);
    const toast = inject(ToastService);

    return actions$.pipe(
      ofType(ReportsActions.loadTrends),
      withLatestFrom(store.select(selectCurrentUser)),
      switchMap(([action, user]) => {
        const dept = action.department ?? (user?.role === 'Manager' ? user.department : undefined);
        const url = dept ? `/api/reports/trends?department=${encodeURIComponent(dept)}` : '/api/reports/trends';
        const scope = dept ?? 'All';

        return http.get<{ skillTestAttempts: SkillTestAttempt[]; skillDefinitions: SkillDefinition[] }>(url).pipe(
          map((response) => {
            const points = trendService.computeTrendPoints(response.skillTestAttempts, response.skillDefinitions, scope);
            const chartData = trendService.transformToChartData(points);
            return ReportsActions.loadTrendsSuccess({ points, chartData });
          }),
          catchError((err: HttpErrorResponse) => {
            const msg = err.error?.message ?? 'Failed to load skill trends data.';
            toast.showError(msg);
            return of(ReportsActions.loadTrendsFailure({ error: msg }));
          }),
        );
      }),
    );
  },
  { functional: true },
);
