import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { selectMyActiveSkills, selectSkillCategories, selectSkillDefinitions } from '../../../core/store/skills/skills.selectors';
import * as SkillsActions from '../../../core/store/skills/skills.actions';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import { EmployeeSkill } from '../../../shared/models/employee-skill.model';

@Component({
  selector: 'app-add-skill',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatRadioModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './add-skill.component.html',
  styleUrls: ['./add-skill.component.scss'],
})
export class AddSkillComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  categories: SkillCategory[] = [];
  allDefinitions: SkillDefinition[] = [];
  filteredSubCategories: { subCategoryId: string; subCategoryName: string }[] = [];
  filteredDefinitions: SkillDefinition[] = [];
  existingSkills: EmployeeSkill[] = [];
  userId = '';
  duplicateError = false;

  form = this.fb.group({
    categoryId: ['', Validators.required],
    subCategoryId: ['', Validators.required],
    skillId: ['', Validators.required],
    selfRating: [null as number | null, Validators.required],
  });

  ratingOptions = [
    { value: 1, label: '1 — Beginner' },
    { value: 2, label: '2 — Intermediate' },
    { value: 3, label: '3 — Advanced' },
    { value: 4, label: '4 — Expert' },
  ];

  ngOnInit(): void {
    this.store.dispatch(SkillsActions.loadSkillLibrary());

    this.store.select(selectCurrentUser).pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.store.dispatch(SkillsActions.loadMySkills({ userId: user.id }));
      }
    });

    this.store.select(selectSkillCategories).pipe(takeUntil(this.destroy$)).subscribe((cats) => {
      this.categories = cats;
    });

    this.store.select(selectSkillDefinitions).pipe(takeUntil(this.destroy$)).subscribe((defs) => {
      this.allDefinitions = defs;
    });

    this.store.select(selectMyActiveSkills).pipe(takeUntil(this.destroy$)).subscribe((skills) => {
      this.existingSkills = skills;
    });

    this.form.get('categoryId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((catId) => {
      this.form.patchValue({ subCategoryId: '', skillId: '' });
      const cat = this.categories.find((c) => c.categoryId === catId);
      this.filteredSubCategories = cat?.subCategories ?? [];
      this.filteredDefinitions = [];
    });

    this.form.get('subCategoryId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((subId) => {
      this.form.patchValue({ skillId: '' });
      this.filteredDefinitions = this.allDefinitions.filter((d) => d.subCategoryId === subId);
    });

    this.form.get('skillId')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((skillId) => {
      this.duplicateError = this.existingSkills.some((s) => s.skillId === skillId && !s.isDeleted);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.duplicateError) return;
    const { skillId, selfRating } = this.form.value;
    this.store.dispatch(SkillsActions.addSkill({ userId: this.userId, skillId: skillId!, selfRating: selfRating! }));
    this.router.navigate(['/my-skills']);
  }

  onCancel(): void {
    this.router.navigate(['/my-skills']);
  }
}
