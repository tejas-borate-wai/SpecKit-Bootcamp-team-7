import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, forkJoin, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Project, ProjectStatus, ProficiencyLevel } from '../../../shared/models/project.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { ProjectsActions } from '../../../core/store/projects/projects.actions';
import { selectProjectsLoading, selectProjectsError } from '../../../core/store/projects/projects.selectors';
import { SkillLibraryService } from '../../../core/services/skill-library.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ERROR_MESSAGES } from '../../../core/constants/error-messages';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.scss'],
})
export class ProjectCreateComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly libraryService = inject(SkillLibraryService);
  private readonly toast = inject(ToastService);
  private readonly destroy$ = new Subject<void>();

  loading$: Observable<boolean> = this.store.select(selectProjectsLoading);
  error$: Observable<string | null> = this.store.select(selectProjectsError);

  skillDefinitions: SkillDefinition[] = [];

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
    requiredSkills: this.fb.array([Validators.required]),
  });

  get rolesArray(): FormArray {
    return this.form.get('requiredRoles') as FormArray;
  }

  get skillsArray(): FormArray {
    return this.form.get('requiredSkills') as FormArray;
  }

  ngOnInit(): void {
    this.libraryService.getDefinitions().pipe(takeUntil(this.destroy$)).subscribe((defs) => {
      this.skillDefinitions = defs;
    });

    // React to submit success by redirecting
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((err) => {
      if (err) {
        this.toast.showError(err);
      }
    });

    this.addRole();
    this.addSkill();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addRole(): void {
    this.rolesArray.push(
      this.fb.group({
        roleTitle: ['', Validators.required],
        headcount: [1, [Validators.required, Validators.min(1), Validators.max(50)]],
      })
    );
  }

  removeRole(i: number): void {
    this.rolesArray.removeAt(i);
  }

  addSkill(): void {
    this.skillsArray.push(
      this.fb.group({
        skillId: ['', Validators.required],
        minimumLevel: [1 as ProficiencyLevel, Validators.required],
      })
    );
  }

  removeSkill(i: number): void {
    this.skillsArray.removeAt(i);
  }

  getSkillName(skillId: string): string {
    return this.skillDefinitions.find((d) => d.skillId === skillId)?.skillName ?? skillId;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { startDate, deadline, requiredSkills } = this.form.value as {
      startDate: string;
      deadline: string;
      requiredSkills: unknown[];
    };

    if (new Date(startDate) >= new Date(deadline)) {
      this.toast.showError(ERROR_MESSAGES.startAfterDeadline);
      return;
    }

    if (!requiredSkills || requiredSkills.length === 0) {
      this.toast.showError(ERROR_MESSAGES.noSkillsAdded);
      return;
    }

    this.store.dispatch(ProjectsActions.createProject({ project: this.form.value }));

    // Navigate after a brief moment to allow the effect to run
    // Real navigation occurs when the effect emits success which could be observed
    setTimeout(() => {
      this.router.navigate(['/projects']);
      this.toast.showSuccess('Project created successfully.');
    }, 600);
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
