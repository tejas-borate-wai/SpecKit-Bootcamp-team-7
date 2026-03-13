import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { EmployeeSkill } from '../../models/employee-skill.model';
import { SkillDefinition } from '../../models/skill-definition.model';
import { RatingBadgeComponent } from '../rating-badge/rating-badge.component';
import { isStale } from '../../utils/skill-utils';

@Component({
  selector: 'app-skill-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatMenuModule, MatButtonModule, RatingBadgeComponent],
  template: `
    <div class="skill-card" [class.stale]="stale">
      <div class="card-header">
        <div class="skill-info">
          <span class="skill-name">{{ definition?.skillName ?? skill.skillId }}</span>
          @if (stale) {
            <span class="stale-badge">Stale</span>
          }
        </div>
        <div class="card-actions">
          <app-rating-badge [level]="skill.level"/>
          <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="view.emit(skill.skillId)">
              <mat-icon>visibility</mat-icon>View Detail
            </button>
            <button mat-menu-item (click)="edit.emit(skill.skillId)">
              <mat-icon>edit</mat-icon>Edit
            </button>
            <button mat-menu-item (click)="delete.emit(skill.skillId)" class="danger-item">
              <mat-icon>delete</mat-icon>Delete
            </button>
          </mat-menu>
        </div>
      </div>
      <div class="card-body">
        <div class="rating-row">
          <span class="rating-label">Rating</span>
          <span class="rating-value">
            {{ skill.finalRating !== null ? skill.finalRating + '%' : (skill.systemRating !== null ? skill.systemRating + '%' : '—') }}
          </span>
        </div>
        <div class="status-row">
          <span class="status-pill" [ngClass]="skill.status.toLowerCase()">{{ skill.status }}</span>
          <span class="updated">{{ formatDate(skill.lastUpdated) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skill-card {
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      padding: 16px;
      transition: box-shadow 0.2s;
    }
    .skill-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .skill-card.stale { border-color: var(--color-stale-border, #f59e0b); }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .skill-info { display: flex; flex-direction: column; gap: 4px; }
    .skill-name { font-weight: 600; color: var(--color-text, #111827); }
    .stale-badge { display: inline-block; font-size: 0.7rem; background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; border-radius: 8px; padding: 1px 8px; font-weight: 600; }
    .card-actions { display: flex; align-items: center; gap: 4px; }
    .card-body { display: flex; justify-content: space-between; align-items: center; }
    .rating-row, .status-row { display: flex; align-items: center; gap: 8px; }
    .rating-label { font-size: 0.75rem; color: var(--color-text-secondary, #6b7280); }
    .rating-value { font-weight: 700; color: var(--color-text, #111827); }
    .status-pill { font-size: 0.7rem; padding: 2px 8px; border-radius: 8px; font-weight: 600; }
    .draft { background: #f9fafb; color: #6b7280; }
    .pending { background: #fffbeb; color: #f59e0b; }
    .approved { background: #f0fdf4; color: #16a34a; }
    .stale-pill { background: #fffbeb; color: #f59e0b; } 
    .stale .status-pill.stale { background: #fffbeb; color: #f59e0b; }
    .updated { font-size: 0.7rem; color: var(--color-text-secondary, #9ca3af); }
    .danger-item { color: var(--color-rejected, #ef4444); }
  `],
})
export class SkillCardComponent {
  @Input() skill!: EmployeeSkill;
  @Input() definition: SkillDefinition | null = null;
  @Output() view = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get stale(): boolean {
    return isStale(this.skill.lastUpdated);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
