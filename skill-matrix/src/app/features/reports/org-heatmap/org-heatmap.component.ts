import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReportsActions } from '../store/reports.actions';
import { selectHeatmapChartData, selectHeatmapLoading, selectHeatmapError } from '../store/reports.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { ExportService } from '../../../core/services/export.service';
import { HeatmapChartData } from '../../../shared/models/report.models';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { SessionUser } from '../../../shared/models/user.model';

@Component({
  selector: 'app-org-heatmap',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ChartWrapperComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './org-heatmap.component.html',
  styleUrls: ['./org-heatmap.component.scss'],
})
export class OrgHeatmapComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly exportService = inject(ExportService);

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLElement>;

  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);
  chartData$: Observable<HeatmapChartData[]> = this.store.select(selectHeatmapChartData);
  loading$: Observable<boolean> = this.store.select(selectHeatmapLoading);
  error$: Observable<string | null> = this.store.select(selectHeatmapError);

  // Color scheme for sequential intensity
  colorScheme = { domain: ['#EFF6FF', '#BFDBFE', '#60A5FA', '#1D4ED8'] };

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.loadHeatmap());
  }

  reload(): void {
    this.store.dispatch(ReportsActions.loadHeatmap());
  }

  async exportPdf(user: SessionUser | null): Promise<void> {
    const element = this.chartContainer?.nativeElement;
    if (!element) return;
    await this.exportService.exportChartToPdf(element, {
      reportTitle: 'Organisation Skill Heatmap',
      generationDate: new Date().toISOString().split('T')[0],
      generatingUserName: user?.name ?? 'Unknown',
    });
  }

  async exportPng(user: SessionUser | null): Promise<void> {
    const element = this.chartContainer?.nativeElement;
    if (!element) return;
    await this.exportService.exportToPng(element, {
      reportTitle: 'Organisation Skill Heatmap',
      generationDate: new Date().toISOString().split('T')[0],
      generatingUserName: user?.name ?? 'Unknown',
    });
  }

  getCellColor(value: number, chartData: HeatmapChartData[]): string {
    const maxValue = Math.max(0, ...chartData.flatMap((row) => row.series.map((s) => s.value)));
    if (maxValue === 0 || value === 0) return '#F9FAFB';
    const ratio = value / maxValue;
    if (ratio >= 0.75) return '#1D4ED8';
    if (ratio >= 0.5) return '#60A5FA';
    if (ratio >= 0.25) return '#BFDBFE';
    return '#EFF6FF';
  }
}
