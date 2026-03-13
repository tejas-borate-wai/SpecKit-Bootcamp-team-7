import { Component, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  selectTrendChartData,
  selectTrendsLoading,
  selectTrendsError,
  selectTrendsDepartment,
} from '../store/reports.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { ExportService } from '../../../core/services/export.service';
import { TrendChartData } from '../../../shared/models/report.models';
import { ChartWrapperComponent } from '../../../shared/components/chart-wrapper/chart-wrapper.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { SessionUser } from '../../../shared/models/user.model';

@Component({
  selector: 'app-skill-trends',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ChartWrapperComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './skill-trends.component.html',
  styleUrls: ['./skill-trends.component.scss'],
})
export class SkillTrendsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly exportService = inject(ExportService);

  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLElement>;

  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);
  chartData$: Observable<TrendChartData[]> = this.store.select(selectTrendChartData);
  loading$: Observable<boolean> = this.store.select(selectTrendsLoading);
  error$: Observable<string | null> = this.store.select(selectTrendsError);
  selectedDepartment$: Observable<string | null> = this.store.select(selectTrendsDepartment);

  // Known departments for Admin filter (derived from trend points)
  knownDepartments: string[] = [];

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.loadTrends({}));
  }

  onDepartmentChange(department: string | null): void {
    this.store.dispatch(ReportsActions.setTrendsDepartment({ department }));
    this.store.dispatch(ReportsActions.loadTrends({ department: department ?? undefined }));
  }

  hasSingleDataPoint(chartData: TrendChartData[]): boolean {
    return chartData.some((series) => series.series.length <= 1);
  }

  reload(): void {
    this.store.dispatch(ReportsActions.loadTrends({}));
  }

  async exportPdf(user: SessionUser | null): Promise<void> {
    const element = this.chartContainer?.nativeElement;
    if (!element) return;
    await this.exportService.exportChartToPdf(element, {
      reportTitle: 'Skill Trend Analysis Report',
      generationDate: new Date().toISOString().split('T')[0],
      generatingUserName: user?.name ?? 'Unknown',
    });
  }
}
