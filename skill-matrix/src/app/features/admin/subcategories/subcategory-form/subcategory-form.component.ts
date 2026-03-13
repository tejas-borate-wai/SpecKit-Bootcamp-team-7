import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SkillCategory, SubCategory } from '../../../../shared/models/skill-category.model';

export interface SubcategoryFormData {
  subCategory?: SubCategory;
  parentCategoryId?: string;
  categories: SkillCategory[];
}

@Component({
  selector: 'app-subcategory-form',
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
  templateUrl: './subcategory-form.component.html',
  styleUrl: './subcategory-form.component.scss',
})
export class SubcategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SubcategoryFormComponent>);
  protected data: SubcategoryFormData = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data?.subCategory;
    this.form = this.fb.group({
      categoryId: [this.data?.parentCategoryId ?? '', Validators.required],
      subCategoryName: [this.data?.subCategory?.subCategoryName ?? '', [Validators.required, Validators.maxLength(60)]],
    });
  }

  get nameControl() { return this.form.get('subCategoryName')!; }
  get categoryControl() { return this.form.get('categoryId')!; }

  submit(): void {
    if (this.form.invalid) { return; }
    this.dialogRef.close(this.form.value);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
