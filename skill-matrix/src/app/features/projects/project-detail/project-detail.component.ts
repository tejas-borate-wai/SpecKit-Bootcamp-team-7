import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, filter, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Project, ProjectStatus, ProficiencyLevel } from '../../../shared/models/project.model';
import { SessionUser } from '../../../shared/models/user.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import { selectSelectedProject, selectProjectsLoading } from '../../../core/store/projects/projects.selectors';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { SkillLibraryService } from '../../../core/services/skill-library.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly libraryService = inject(SkillLibraryService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);
  currentUser$: Observable<SessionUser | null> = this.store.select(selectCurrentUser);
  project$: Observable<Project | null> = this.store.select(selectSelectedProject);

  editMode = false;
  skillDefinitions: SkillDefinition[] = [];
  projectId = '';

  statusOptions: ProjectStatus[] = ['Draft', 'Open', 'In Progress', 'Completed'];
  proficiencyOptions: { label: string; value: ProficiencyLevel }[] = [
    { label: 'Beginner (1)', value: 1 },
    { label: 'Intermediate (2)', value: 2 },
    { label: 'Advanced (3)', value: 3 },
    { label: 'Expert (4)', value: 4 },
  ];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    status: ['Open' as ProjectStatus, Validators.required],
    startDate: ['', Validators.required],
    deadline: ['', Validators.required],
    requiredRoles: this.fb.array([]),
    requiredSkills: this.fb.array([]),
  });

  get rolesArray(): FormArray {
    return this.form.get('requiredRoles') as FormArray;
  }

  get skillsArray(): FormArray {
    return this.form.get('requiredSkills') as FormArray;
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId') ?? '';
    this.store.dispatch(ProjectsActions.selectProject({ projectId: this.projectId }));
    this.store.dispatch(ProjectsActions.loadProjectDetail({ projectId: this.projectId }));

    this.libraryService.getDefinitions().pipe(takeUntil(this.destroy$)).subscribe((defs) => {
      this.skillDefinitions = defs;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getSkillName(skillId: string): string {
    return this.skillDefinitions.find((d) => d.skillId === skillId)?.skillName ?? skillId;
  }

  getProficiencyLabel(level: ProficiencyLevel): string {
    const labels: Record<ProficiencyLevel, string> = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Expert',
    };
    return labels[level] ?? String(level);
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

  enterEditMode(project: Project): void {
    this.editMode = true;

    // Clear arrays
    while (this.rolesArray.length) this.rolesArray.removeAt(0);
    while (this.skillsArray.length) this.skillsArray.removeAt(0);

    this.form.patchValue({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate,
      deadline: project.deadline,
    });

    project.requiredRoles.forEach((r) =>
      this.rolesArray.push(this.fb.group({ roleTitle: [r.roleTitle], headcount: [r.headcount] }))
    );

    project.requiredSkills.forEach((s) =>
      this.skillsArray.push(this.fb.group({ skillId: [s.skillId], minimumLevel: [s.minimumLevel] }))
    );
  }

  cancelEdit(): void {
    this.editMode = false;
  }

  addRole(): void {
    this.rolesArray.push(this.fb.group({ roleTitle: ['', Validators.required], headcount: [1] }));
  }

  removeRole(i: number): void {
    this.rolesArray.removeAt(i);
  }

  addSkill(): void {
    this.skillsArray.push(this.fb.group({ skillId: ['', Validators.required], minimumLevel: [1 as ProficiencyLevel] }));
  }

  removeSkill(i: number): void {
    this.skillsArray.removeAt(i);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { startDate, deadline } = this.form.value as { startDate: string; deadline: string };
    if (new Date(startDate) >= new Date(deadline)) {
      this.toast.showError('Start date must be before deadline.');
      return;
    }
    const wasCompleted = this.form.get('status')?.value === 'Completed';
    this.store.dispatch(ProjectsActions.updateProject({ projectId: this.projectId, changes: this.form.value }));
    if (wasCompleted) {
      this.store.dispatch(ProjectsActions.completeProject({ projectId: this.projectId }));
    }
    this.editMode = false;
    this.toast.showSuccess('Project updated.');
  }

  onDelete(user: SessionUser | null, project: Project): void {
    if (!this.canEdit(project, user)) {
      this.toast.showError('You do not have permission to delete this project.');
      return;
    }
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    this.store.dispatch(ProjectsActions.deleteProject({ projectId: this.projectId }));
    this.toast.showSuccess('Project deleted.');
    this.router.navigate(['/projects']);
  }
}
