import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ProjectAlignmentEntry, AvailabilityStatus } from '../../../shared/models/availability.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import {
  selectAllProjects,
  selectAssignments,
  selectProjectsLoading,
} from '../../../core/store/projects/projects.selectors';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-project-alignment',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './project-alignment.component.html',
  styleUrls: ['./project-alignment.component.scss'],
})
export class ProjectAlignmentComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);

  entries$: Observable<ProjectAlignmentEntry[]> = combineLatest([
    this.store.select(selectAssignments),
    this.store.select(selectAllProjects),
  ]).pipe(
    map(([assignments, projects]) => {
      return assignments.map((a) => {
        const proj = projects.find((p) => p.projectId === a.projectId);
        const isActive = proj?.status !== 'Completed';
        return {
          userId: a.userId,
          employeeName: a.userId,
          role: a.role,
          currentProject: proj?.name ?? a.projectId,
          status: (isActive ? 'Busy' : 'Available') as AvailabilityStatus,
          since: a.assignedDate,
        } satisfies ProjectAlignmentEntry;
      });
    })
  );

  // Override dialog state
  overrideTarget: ProjectAlignmentEntry | null = null;
  overrideStatus: AvailabilityStatus = 'Available';
  overrideReason = '';
  availabilityOptions: AvailabilityStatus[] = ['Available', 'Partially Available', 'Busy'];

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.loadProjects());
    this.store.dispatch(ProjectsActions.loadAssignments());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openOverride(entry: ProjectAlignmentEntry): void {
    this.overrideTarget = entry;
    this.overrideStatus = entry.status;
    this.overrideReason = '';
  }

  closeOverride(): void {
    this.overrideTarget = null;
    this.overrideReason = '';
  }

  submitOverride(): void {
    if (!this.overrideTarget || !this.overrideReason.trim()) {
      this.toast.showError('Reason is required.');
      return;
    }
    this.store.dispatch(
      ProjectsActions.overrideAvailability({
        userId: this.overrideTarget.userId,
        newStatus: this.overrideStatus,
        reason: this.overrideReason,
      })
    );
    this.toast.showSuccess(`Availability updated for ${this.overrideTarget.employeeName}.`);
    this.closeOverride();
  }

  getStatusClass(status: AvailabilityStatus): string {
    if (status === 'Available') return 'avail-available';
    if (status === 'Partially Available') return 'avail-partial';
    return 'avail-busy';
  }

  getStatusIcon(status: AvailabilityStatus): string {
    if (status === 'Available') return 'check_circle';
    if (status === 'Partially Available') return 'schedule';
    return 'cancel';
  }
}
