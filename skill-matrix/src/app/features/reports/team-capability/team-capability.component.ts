import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { FormsModule } from '@angular/forms';

import { ReportsActions } from '../store/reports.actions';
import {
  selectCapabilitySnapshots,
  selectCapabilityLoading,
  selectCapabilityError,
  selectCapabilityDepartment,
  selectCapabilityCategoryId,
  selectCapabilityViewMode,
} from '../store/reports.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { ExportService } from '../../../core/services/export.service';
import { TeamCapabilitySnapshot } from '../../../shared/models/report.models';
import { SessionUser } from '../../../shared/models/user.model';

@Component({
  selector: 'app-team-capability',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatButtonToggleModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './team-capability.component.html',
  styleUrls: ['./team-capability.component.scss'],
})
export class TeamCapabilityComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly exportService = inject(ExportService);

  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);
  snapshots$: Observable<TeamCapabilitySnapshot[]> = this.store.select(selectCapabilitySnapshots);
  loading$: Observable<boolean> = this.store.select(selectCapabilityLoading);
  error$: Observable<string | null> = this.store.select(selectCapabilityError);
  selectedDepartment$: Observable<string | null> = this.store.select(selectCapabilityDepartment);
  selectedCategoryId$: Observable<string | null> = this.store.select(selectCapabilityCategoryId);
  viewMode$: Observable<'byDepartment' | 'byCategory'> = this.store.select(selectCapabilityViewMode);

  ngOnInit(): void {
    this.store.dispatch(ReportsActions.loadTeamCapability({}));
  }

  onDepartmentChange(department: string | null): void {
    this.store.dispatch(ReportsActions.setCapabilityDepartment({ department }));
    this.store.dispatch(ReportsActions.loadTeamCapability({ department: department ?? undefined }));
  }

  onCategoryChange(categoryId: string | null): void {
    this.store.dispatch(ReportsActions.setCapabilityCategoryId({ categoryId }));
    this.store.dispatch(ReportsActions.loadTeamCapability({ categoryId: categoryId ?? undefined }));
  }

  onViewModeChange(viewMode: 'byDepartment' | 'byCategory'): void {
    this.store.dispatch(ReportsActions.setCapabilityViewMode({ viewMode }));
  }

  getUniqueDepartments(snapshots: TeamCapabilitySnapshot[]): string[] {
    return [...new Set(snapshots.map((s) => s.department))].sort();
  }

  getUniqueCategories(snapshots: TeamCapabilitySnapshot[]): { categoryId: string; categoryName: string }[] {
    const seen = new Set<string>();
    const result: { categoryId: string; categoryName: string }[] = [];
    for (const s of snapshots) {
      if (!seen.has(s.categoryId)) {
        seen.add(s.categoryId);
        result.push({ categoryId: s.categoryId, categoryName: s.categoryName });
      }
    }
    return result.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
  }

  formatPercent(value: number): string {
    return `${value}%`;
  }

  reload(): void {
    this.store.dispatch(ReportsActions.loadTeamCapability({}));
  }

  async exportPdf(snapshots: TeamCapabilitySnapshot[], user: SessionUser | null): Promise<void> {
    this.exportService.exportTableToPdf(
      ['Skill', 'Category', 'Department', 'Avg Proficiency', 'Level', 'Employee Count'],
      snapshots.map((s) => [s.skillName, s.categoryName, s.department, this.formatPercent(s.averageProficiencyPercent), s.proficiencyLevel, s.employeeCount]),
      { reportTitle: 'Team Capability Report', generationDate: new Date().toISOString().split('T')[0], generatingUserName: user?.name ?? 'Unknown' },
    );
  }

  async exportExcel(snapshots: TeamCapabilitySnapshot[], user: SessionUser | null): Promise<void> {
    await this.exportService.exportToExcel(
      ['Skill', 'Category', 'Department', 'Avg Proficiency (%)', 'Level', 'Employee Count'],
      snapshots.map((s) => [s.skillName, s.categoryName, s.department, s.averageProficiencyPercent, s.proficiencyLevel, s.employeeCount]),
      { reportTitle: 'Team Capability Report', generationDate: new Date().toISOString().split('T')[0], generatingUserName: user?.name ?? 'Unknown' },
    );
  }

  async exportSkillListCsv(snapshots: TeamCapabilitySnapshot[], user: SessionUser | null): Promise<void> {
    await this.exportService.exportToCsv(
      ['Skill', 'Category', 'Department', 'Avg Proficiency (%)', 'Level', 'Employee Count'],
      snapshots.map((s) => [s.skillName, s.categoryName, s.department, s.averageProficiencyPercent, s.proficiencyLevel, s.employeeCount]),
      { reportTitle: 'Employee Skill List', generationDate: new Date().toISOString().split('T')[0], generatingUserName: user?.name ?? 'Unknown' },
    );
  }

  async exportSkillListExcel(snapshots: TeamCapabilitySnapshot[], user: SessionUser | null): Promise<void> {
    await this.exportService.exportToExcel(
      ['Skill', 'Category', 'Department', 'Avg Proficiency (%)', 'Level', 'Employee Count'],
      snapshots.map((s) => [s.skillName, s.categoryName, s.department, s.averageProficiencyPercent, s.proficiencyLevel, s.employeeCount]),
      { reportTitle: 'Employee Skill List', generationDate: new Date().toISOString().split('T')[0], generatingUserName: user?.name ?? 'Unknown' },
    );
  }
}
