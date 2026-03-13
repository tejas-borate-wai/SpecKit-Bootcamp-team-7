import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { take } from 'rxjs';
import { SkillCategory, SubCategory } from '../../../shared/models/skill-category.model';
import * as AdminActions from '../../../core/store/admin/admin.actions';
import {
  selectAllCategories,
  selectCategoriesLoading,
} from '../../../core/store/admin/admin.selectors';
import { SubcategoryFormComponent, SubcategoryFormData } from './subcategory-form/subcategory-form.component';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.scss',
})
export class SubcategoriesComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  categories$ = this.store.select(selectAllCategories);
  loading$ = this.store.select(selectCategoriesLoading);

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadCategories());
  }

  openAdd(category?: SkillCategory): void {
    this.categories$.pipe(take(1)).subscribe((cats) => {
      const ref = this.dialog.open(SubcategoryFormComponent, {
        width: '480px',
        maxWidth: '95vw',
        data: {
          parentCategoryId: category?.categoryId ?? '',
          categories: cats,
        } as SubcategoryFormData,
      });
      ref.afterClosed().subscribe((result: { categoryId: string; subCategoryName: string } | null) => {
        if (result) {
          this.store.dispatch(AdminActions.addSubcategory({
            categoryId: result.categoryId,
            subCategory: { subCategoryId: '', subCategoryName: result.subCategoryName },
          }));
        }
      });
    });
  }

  openEdit(category: SkillCategory, subCategory: SubCategory): void {
    this.categories$.pipe(take(1)).subscribe((cats) => {
      const ref = this.dialog.open(SubcategoryFormComponent, {
        width: '480px',
        maxWidth: '95vw',
        data: {
          subCategory,
          parentCategoryId: category.categoryId,
          categories: cats,
        } as SubcategoryFormData,
      });
      ref.afterClosed().subscribe((result: { categoryId: string; subCategoryName: string } | null) => {
        if (result) {
          this.store.dispatch(AdminActions.updateSubcategory({
            categoryId: result.categoryId,
            subCategory: { ...subCategory, subCategoryName: result.subCategoryName },
          }));
        }
      });
    });
  }

  confirmDelete(category: SkillCategory, subCategory: SubCategory): void {
    if (confirm(`Delete subcategory "${subCategory.subCategoryName}"?`)) {
      this.store.dispatch(AdminActions.deleteSubcategory({
        categoryId: category.categoryId,
        subCategoryId: subCategory.subCategoryId,
      }));
    }
  }
}
