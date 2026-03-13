import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { combineLatest, map, take } from 'rxjs';
import { SkillCategory, SubCategory } from '../../../shared/models/skill-category.model';
import { SkillDefinition } from '../../../shared/models/skill-definition.model';
import * as AdminActions from '../../../core/store/admin/admin.actions';
import {
  selectAllCategories,
  selectAllSkillDefinitions,
  selectSkillDefinitionsLoading,
} from '../../../core/store/admin/admin.selectors';
import { SkillFormComponent, SkillFormData } from './skill-form/skill-form.component';

interface SubGroup {
  subCategory: SubCategory;
  skills: SkillDefinition[];
}

interface CatGroup {
  category: SkillCategory;
  subGroups: SubGroup[];
}

@Component({
  selector: 'app-skill-definitions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
  ],
  templateUrl: './skill-definitions.component.html',
  styleUrl: './skill-definitions.component.scss',
})
export class SkillDefinitionsComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  private categories$ = this.store.select(selectAllCategories);
  private skills$ = this.store.select(selectAllSkillDefinitions);
  loading$ = this.store.select(selectSkillDefinitionsLoading);

  grouped$ = combineLatest([this.categories$, this.skills$]).pipe(
    map(([cats, skills]) =>
      cats.map((cat): CatGroup => ({
        category: cat,
        subGroups: cat.subCategories.map((sub): SubGroup => ({
          subCategory: sub,
          skills: skills.filter((s) => s.subCategoryId === sub.subCategoryId),
        })).filter((sg) => sg.skills.length > 0),
      })).filter((cg) => cg.subGroups.length > 0)
    )
  );

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadCategories());
    this.store.dispatch(AdminActions.loadSkillDefinitions());
  }

  openAdd(): void {
    combineLatest([this.categories$, this.skills$]).pipe(take(1)).subscribe(([cats, skills]) => {
      const ref = this.dialog.open(SkillFormComponent, {
        width: '520px',
        maxWidth: '95vw',
        data: { categories: cats, allSkills: skills } as SkillFormData,
      });
      ref.afterClosed().subscribe((result: Partial<SkillDefinition> | null) => {
        if (result) {
          this.store.dispatch(AdminActions.addSkillDefinition({
            skillDefinition: { skillId: '', description: '', ...result } as SkillDefinition,
          }));
        }
      });
    });
  }

  openEdit(skill: SkillDefinition): void {
    combineLatest([this.categories$, this.skills$]).pipe(take(1)).subscribe(([cats, skills]) => {
      const ref = this.dialog.open(SkillFormComponent, {
        width: '520px',
        maxWidth: '95vw',
        data: { skill, categories: cats, allSkills: skills } as SkillFormData,
      });
      ref.afterClosed().subscribe((result: Partial<SkillDefinition> | null) => {
        if (result) {
          this.store.dispatch(AdminActions.updateSkillDefinition({
            skillDefinition: { ...skill, ...result },
          }));
        }
      });
    });
  }
}
