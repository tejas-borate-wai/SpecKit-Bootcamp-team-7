import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { take } from 'rxjs';
import { SkillCategory } from '../../../shared/models/skill-category.model';
import * as AdminActions from '../../../core/store/admin/admin.actions';
import {
  selectAllCategories,
  selectCategoriesLoading,
} from '../../../core/store/admin/admin.selectors';
import { CategoryFormComponent, CategoryFormData } from './category-form/category-form.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  categories$ = this.store.select(selectAllCategories);
  loading$ = this.store.select(selectCategoriesLoading);
  displayedColumns = ['categoryName', 'description', 'subcategoryCount', 'actions'];

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadCategories());
  }

  openAdd(): void {
    this.categories$.pipe(take(1)).subscribe((cats) => {
      const ref = this.dialog.open(CategoryFormComponent, {
        width: '480px',
        maxWidth: '95vw',
        data: {
          existingNames: cats.map((c) => c.categoryName),
        } as CategoryFormData,
      });
      ref.afterClosed().subscribe((result: { categoryName: string; description: string } | null) => {
        if (result) {
          this.store.dispatch(AdminActions.addCategory({
            category: { categoryId: '', subCategories: [], ...result },
          }));
        }
      });
    });
  }

  openEdit(category: SkillCategory): void {
    this.categories$.pipe(take(1)).subscribe((cats) => {
      const ref = this.dialog.open(CategoryFormComponent, {
        width: '480px',
        maxWidth: '95vw',
        data: {
          category,
          existingNames: cats.map((c) => c.categoryName),
        } as CategoryFormData,
      });
      ref.afterClosed().subscribe((result: { categoryName: string; description: string } | null) => {
        if (result) {
          this.store.dispatch(AdminActions.updateCategory({
            category: { ...category, ...result },
          }));
        }
      });
    });
  }

  confirmDelete(category: SkillCategory): void {
    if (confirm(`Delete category "${category.categoryName}"? This cannot be undone.`)) {
      this.store.dispatch(AdminActions.deleteCategory({ categoryId: category.categoryId }));
    }
  }
}
