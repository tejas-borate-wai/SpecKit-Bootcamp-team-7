import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SkillCategory } from '../../../../shared/models/skill-category.model';

export interface CategoryFormData {
  category?: SkillCategory;
  existingNames: string[];
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CategoryFormComponent>);
  protected data: CategoryFormData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data?.category;
    this.form = this.fb.group({
      categoryName: [
        this.data?.category?.categoryName ?? '',
        [Validators.required, Validators.maxLength(60)],
      ],
      description: [
        this.data?.category?.description ?? '',
        [Validators.required, Validators.maxLength(200)],
      ],
    });
  }

  get nameControl() { return this.form.get('categoryName')!; }
  get descControl() { return this.form.get('description')!; }

  get nameDuplicate(): boolean {
    const val = this.nameControl.value?.trim().toLowerCase() ?? '';
    const existing = (this.data?.existingNames ?? []).map((n) => n.toLowerCase());
    if (this.isEdit) {
      const original = this.data.category!.categoryName.toLowerCase();
      return val !== original && existing.includes(val);
    }
    return existing.includes(val);
  }

  submit(): void {
    if (this.form.invalid || this.nameDuplicate) { return; }
    this.dialogRef.close(this.form.value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
