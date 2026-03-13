import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { ReportsActions } from '../store/reports.actions';
import {
  selectGapRecords,
  selectGapLoading,
  selectGapError,
} from '../store/reports.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { ExportService } from '../../../core/services/export.service';
import { SkillGapRecord } from '../../../shared/models/report.models';
import { SessionUser } from '../../../shared/models/user.model';

@Component({
  selector: 'app-gap-analysis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './gap-analysis.component.html',
  styleUrls: ['./gap-analysis.component.scss'],
})
export class GapAnalysisComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly exportService = inject(ExportService);

  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);
  gapRecords$: Observable<SkillGapRecord[]> = this.store.select(selectGapRecords);
  loading$: Observable<boolean> = this.store.select(selectGapLoading);
  error$: Observable<string | null> = this.store.select(selectGapError);

  selectedProjectId: string | null = null;

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.loadGapAnalysis({}));
  }

  reload(): void {
    this.store.dispatch(ReportsActions.loadGapAnalysis({}));
  }

  getProjectIds(records: SkillGapRecord[]): string[] {
    return [...new Set(records.map((r) => r.projectId))];
  }

  getProjectName(records: SkillGapRecord[], projectId: string): string {
    return records.find((r) => r.projectId === projectId)?.projectName ?? projectId;
  }

  filterRecords(records: SkillGapRecord[], projectId: string | null): SkillGapRecord[] {
    if (!projectId) return records;
    return records.filter((r) => r.projectId === projectId);
  }

  getSeverityClass(severity: SkillGapRecord['gapSeverity']): string {
    const map: Record<string, string> = { none: 'severity-none', warning: 'severity-warning', critical: 'severity-critical' };
    return map[severity] ?? '';
  }

  formatPercent(value: number): string {
    return `${value}%`;
  }

  async exportPdf(records: SkillGapRecord[], user: SessionUser | null): Promise<void> {
    const columns = ['Project', 'Skill', 'Required Level', 'Team Average', 'Gap %', 'Severity'];
    const rows = records.map((r) => [
      r.projectName,
      r.skillName,
      this.formatPercent(r.requiredLevelPercent),
      this.formatPercent(r.teamAverageLevelPercent),
      this.formatPercent(r.gapPercent),
      r.gapSeverity.toUpperCase(),
    ]);
    await this.exportService.exportTableToPdf(columns, rows, {
      reportTitle: 'Skill Gap Analysis Report',
      generationDate: new Date().toISOString().split('T')[0],
      generatingUserName: user?.name ?? 'Unknown',
    });
  }

  async exportExcel(records: SkillGapRecord[], user: SessionUser | null): Promise<void> {
    const columns = ['Project', 'Skill', 'Required Level (%)', 'Team Average (%)', 'Gap (%)', 'Severity'];
    const rows = records.map((r) => [
      r.projectName,
      r.skillName,
      r.requiredLevelPercent,
      r.teamAverageLevelPercent,
      r.gapPercent,
      r.gapSeverity.toUpperCase(),
    ]);
    await this.exportService.exportToExcel(columns, rows, {
      reportTitle: 'Skill Gap Analysis Report',
      generationDate: new Date().toISOString().split('T')[0],
      generatingUserName: user?.name ?? 'Unknown',
    });
  }
}
