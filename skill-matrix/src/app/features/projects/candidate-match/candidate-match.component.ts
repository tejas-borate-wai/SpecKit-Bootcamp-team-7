import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CandidateMatchResult } from '../../../shared/models/candidate-match.model';
import { Project } from '../../../shared/models/project.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import {
  selectSelectedProject,
  selectFilteredMatchResults,
  selectMatchFilters,
  selectProjectsLoading,
} from '../../../core/store/projects/projects.selectors';
import { MatchFilters } from '../../../core/store/projects/projects.state';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { MatchBreakdownComponent } from './match-breakdown/match-breakdown.component';

@Component({
  selector: 'app-candidate-match',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatchBreakdownComponent,
  ],
  templateUrl: './candidate-match.component.html',
  styleUrls: ['./candidate-match.component.scss'],
})
export class CandidateMatchComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly pdfService = inject(PdfExportService);
  private readonly destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);
  project$: Observable<Project | null> = this.store.select(selectSelectedProject);
  results$: Observable<CandidateMatchResult[]> = this.store.select(selectFilteredMatchResults);
  filters$: Observable<MatchFilters> = this.store.select(selectMatchFilters);

  expandedUserId: string | null = null;
  showFilters = false;

  departmentOptions: string[] = [];
  filters: MatchFilters = {
    department: null,
    availability: null,
    minimumMatchScore: 0,
  };

  availabilityOptions = ['Available', 'Partially Available', 'Busy'];

  ngOnInit(): void {
    const projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
    this.store.dispatch(ProjectsActions.selectProject({ projectId }));
    this.store.dispatch(ProjectsActions.loadProjectDetail({ projectId }));
    this.store.dispatch(ProjectsActions.runMatching({ projectId }));
    this.store.dispatch(ProjectsActions.detectSkillGaps({ projectId }));

    this.filters$.pipe(takeUntil(this.destroy$)).subscribe((f) => {
      this.filters = { ...f };
    });

    // Derive department options from results
    this.results$.pipe(takeUntil(this.destroy$)).subscribe((results) => {
      const depts = [...new Set(results.map((r) => r.department))].sort();
      this.departmentOptions = depts;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleBreakdown(userId: string): void {
    this.expandedUserId = this.expandedUserId === userId ? null : userId;
  }

  applyFilters(): void {
    this.store.dispatch(ProjectsActions.setFilters({ filters: this.filters }));
  }

  resetFilters(): void {
    this.filters = { department: null, availability: null, minimumMatchScore: 0 };
    this.store.dispatch(ProjectsActions.setFilters({ filters: this.filters }));
  }

  getAvailabilityClass(av: string): string {
    if (av === 'Available') return 'avail-available';
    if (av === 'Partially Available') return 'avail-partial';
    return 'avail-busy';
  }

  getAvailabilityIcon(av: string): string {
    if (av === 'Available') return 'check_circle';
    if (av === 'Partially Available') return 'schedule';
    return 'cancel';
  }

  async onExportPdf(project: Project | null, results: CandidateMatchResult[]): Promise<void> {
    if (!project) return;
    await this.pdfService.exportCandidateReport(project, results);
  }
}
