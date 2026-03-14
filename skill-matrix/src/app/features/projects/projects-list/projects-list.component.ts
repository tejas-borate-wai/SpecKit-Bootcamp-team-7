import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

import { Project, ProjectStatus } from '../../../shared/models/project.model';
import { ProjectAssignment } from '../../../shared/models/project-assignment.model';
import { SessionUser } from '../../../shared/models/user.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import {
  selectAllProjects,
  selectAssignments,
  selectProjectsLoading,
} from '../../../core/store/projects/projects.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { ToastService } from '../../../shared/services/toast.service';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    FormsModule,
    SkeletonLoaderComponent,
  ],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})
export class ProjectsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);
  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);

  statusFilter: ProjectStatus | 'All' = 'All';
  startDateFilter = '';
  endDateFilter = '';

  statusOptions: (ProjectStatus | 'All')[] = [
    'All',
    'Draft',
    'Open',
    'In Progress',
    'Completed',
  ];

  filteredProjects$: Observable<(Project & { teamSize: number })[]> = combineLatest([
    this.store.select(selectAllProjects),
    this.store.select(selectAssignments),
  ]).pipe(
    map(([projects, assignments]) =>
      projects.map((p) => ({
        ...p,
        teamSize: assignments.filter((a) => a.projectId === p.projectId).length,
      }))
    )
  );

  ngOnInit(): void {
    this.store.dispatch(ProjectsActions.loadProjects());
    this.store.dispatch(ProjectsActions.loadAssignments());
  }

  getStatusClass(status: ProjectStatus): string {
    const map: Record<ProjectStatus, string> = {
      Draft: 'status-draft',
      Open: 'status-open',
      'In Progress': 'status-in-progress',
      Completed: 'status-completed',
    };
    return map[status] ?? 'status-draft';
  }

  canEdit(project: Project, user: SessionUser | null): boolean {
    if (!user) return false;
    return user.role === 'Admin' || project.createdBy === user.id;
  }

  onEdit(project: Project): void {
    this.router.navigate(['/projects', project.projectId]);
  }

  onDelete(project: Project, user: SessionUser | null): void {
    if (!this.canEdit(project, user)) {
      this.toast.showError('You do not have permission to delete this project.');
      return;
    }
    if (!confirm(`Delete "${project.name}"? This action cannot be undone.`)) return;
    this.store.dispatch(ProjectsActions.deleteProject({ projectId: project.projectId }));
    this.toast.showSuccess(`Project "${project.name}" deleted.`);
  }

  applyFilter(projects: (Project & { teamSize: number })[]): (Project & { teamSize: number })[] {
    return projects.filter((p) => {
      if (this.statusFilter !== 'All' && p.status !== this.statusFilter) return false;
      if (this.startDateFilter && p.startDate < this.startDateFilter) return false;
      if (this.endDateFilter && p.deadline > this.endDateFilter) return false;
      return true;
    });
  }
}
