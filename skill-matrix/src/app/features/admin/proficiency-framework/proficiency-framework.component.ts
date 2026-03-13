import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { ProficiencyLevel } from '../../../shared/models/proficiency-level.model';
import * as AdminActions from '../../../core/store/admin/admin.actions';
import {
  selectAllProficiencyLevels,
  selectProficiencyLevelsLoading,
} from '../../../core/store/admin/admin.selectors';

@Component({
  selector: 'app-proficiency-framework',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCardModule,
  ],
  templateUrl: './proficiency-framework.component.html',
  styleUrl: './proficiency-framework.component.scss',
})
export class ProficiencyFrameworkComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  levels$ = this.store.select(selectAllProficiencyLevels);
  loading$ = this.store.select(selectProficiencyLevelsLoading);

  displayedColumns = ['levelName', 'score', 'thresholdRange', 'description', 'criteria', 'actions'];
  editingId: number | null = null;
  editForms: Record<number, FormGroup> = {};

  ngOnInit(): void {
    this.store.dispatch(AdminActions.loadProficiencyLevels());
  }

  startEdit(level: ProficiencyLevel): void {
    this.editingId = level.levelId;
    this.editForms[level.levelId] = this.fb.group({
      description: [level.description],
      exampleCriteria: [level.exampleCriteria],
    });
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  saveEdit(level: ProficiencyLevel): void {
    const form = this.editForms[level.levelId];
    if (!form || form.invalid) { return; }
    const updated: ProficiencyLevel = { ...level, ...form.value };
    this.store.dispatch(AdminActions.updateProficiencyLevel({ level: updated }));
    this.editingId = null;
  }

  thresholdRange(level: ProficiencyLevel): string {
    return `${level.thresholdMin}%–${level.thresholdMax}%`;
  }
}
