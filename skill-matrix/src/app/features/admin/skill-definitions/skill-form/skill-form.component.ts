import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SkillCategory, SubCategory } from '../../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../../shared/models/skill-definition.model';

export interface SkillFormData {
  skill?: SkillDefinition;
  categories: SkillCategory[];
  allSkills: SkillDefinition[];
}

@Component({
  selector: 'app-skill-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './skill-form.component.html',
  styleUrl: './skill-form.component.scss',
})
export class SkillFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SkillFormComponent>);
  protected data: SkillFormData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEdit = false;
  filteredSubcategories: SubCategory[] = [];

  ngOnInit(): void {
    this.isEdit = !!this.data?.skill;

    // Seed subcategories for edit mode
    if (this.isEdit && this.data.skill) {
      const parent = this.data.categories.find((c) => c.categoryId === this.data.skill!.categoryId);
      this.filteredSubcategories = parent?.subCategories ?? [];
    }

    this.form = this.fb.group({
      categoryId: [this.data?.skill?.categoryId ?? '', Validators.required],
      subCategoryId: [this.data?.skill?.subCategoryId ?? '', Validators.required],
      skillName: [this.data?.skill?.skillName ?? '', [Validators.required, Validators.maxLength(80)]],
      description: [this.data?.skill?.description ?? '', [Validators.required, Validators.maxLength(300)]],
    });

    // Cascading: category → subcategory
    this.form.get('categoryId')!.valueChanges.subscribe((catId: string) => {
      const cat = this.data.categories.find((c) => c.categoryId === catId);
      this.filteredSubcategories = cat?.subCategories ?? [];
      this.form.get('subCategoryId')!.setValue('');
    });
  }

  get nameControl() { return this.form.get('skillName')!; }
  get catControl() { return this.form.get('categoryId')!; }
  get subCatControl() { return this.form.get('subCategoryId')!; }
  get descControl() { return this.form.get('description')!; }

  get nameDuplicate(): boolean {
    const val = this.nameControl.value?.trim().toLowerCase() ?? '';
    const subId = this.subCatControl.value;
    if (!val || !subId) { return false; }
    return (this.data.allSkills ?? []).some((s) => {
      if (this.isEdit && s.skillId === this.data.skill!.skillId) { return false; }
      return s.subCategoryId === subId && s.skillName.toLowerCase() === val;
    });
  }

  submit(): void {
    if (this.form.invalid || this.nameDuplicate) { return; }
    this.dialogRef.close(this.form.value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
