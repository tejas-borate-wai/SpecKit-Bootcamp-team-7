import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, map, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Project, RoleSlot } from '../../../shared/models/project.model';
import { ProjectAssignment } from '../../../shared/models/project-assignment.model';
import { CandidateMatchResult } from '../../../shared/models/candidate-match.model';
import { SkillGapResult } from '../../../shared/models/skill-gap.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import {
  selectSelectedProject,
  selectAssignmentsByProject,
  selectMatchResults,
  selectSkillGaps,
  selectProjectsLoading,
} from '../../../core/store/projects/projects.selectors';
import { ToastService } from '../../../shared/services/toast.service';
import { RoleSlotCardComponent } from './role-slot-card/role-slot-card.component';
import { SkillGapPanelComponent } from './skill-gap-panel/skill-gap-panel.component';

interface RoleSlotVM {
  role: RoleSlot;
  filled: number;
  assignedEmployees: { assignmentId: string; userId: string; name: string }[];
}

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    RoleSlotCardComponent,
    SkillGapPanelComponent,
  ],
  templateUrl: './team-builder.component.html',
  styleUrls: ['./team-builder.component.scss'],
})
export class TeamBuilderComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);
  project$: Observable<Project | null> = this.store.select(selectSelectedProject);
  candidates$: Observable<CandidateMatchResult[]> = this.store.select(selectMatchResults);
  skillGaps$: Observable<SkillGapResult[]> = this.store.select(selectSkillGaps);

  projectId = '';
  roleSlotVMs$: Observable<RoleSlotVM[]> | null = null;

  // For role assignment dialog
  assigningRole: RoleSlot | null = null;
  showAssignPanel = false;

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
    this.store.dispatch(ProjectsActions.selectProject({ projectId: this.projectId }));
    this.store.dispatch(ProjectsActions.loadProjectDetail({ projectId: this.projectId }));
    this.store.dispatch(ProjectsActions.loadAssignments());
    this.store.dispatch(ProjectsActions.runMatching({ projectId: this.projectId }));
    this.store.dispatch(ProjectsActions.detectSkillGaps({ projectId: this.projectId }));

    this.roleSlotVMs$ = combineLatest([
      this.store.select(selectSelectedProject),
      this.store.select(selectAssignmentsByProject(this.projectId)),
      this.store.select(selectMatchResults),
    ]).pipe(
      map(([project, assignments, _candidates]) => {
        if (!project) return [];
        return project.requiredRoles.map((role) => {
          const roleAssignments = assignments.filter((a) => a.role === role.roleTitle);
          return {
            role,
            filled: roleAssignments.length,
            assignedEmployees: roleAssignments.map((a) => ({
              assignmentId: a.assignmentId,
              userId: a.userId,
              name: a.userId, // real name resolved separately if available
            })),
          };
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAssign(payload: { userId: string; role: string }): void {
    this.store.dispatch(
      ProjectsActions.assignToProject({
        projectId: this.projectId,
        userId: payload.userId,
        role: payload.role,
      })
    );
    this.toast.showSuccess('Employee assigned to project.');
  }

  onRemove(assignmentId: string): void {
    this.store.dispatch(ProjectsActions.removeAssignment({ assignmentId }));
    this.toast.showSuccess('Assignment removed.');
  }

  getStatusCssClass(status: string): string {
    const map: Record<string, string> = {
      'Draft': 'status-draft',
      'Open': 'status-open',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed',
    };
    return map[status] ?? 'status-draft';
  }
}
