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
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      transition: box-shadow 0.15s;
    }
    .skill-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .skill-card.stale { border-color: #f59e0b; }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .skill-info { display: flex; flex-direction: column; gap: 4px; }
    .skill-name { font-weight: 600; color: #0f172a; }
    .stale-badge { display: inline-block; font-size: 0.7rem; background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; border-radius: 9999px; padding: 1px 8px; font-weight: 600; }
    .card-actions { display: flex; align-items: center; gap: 4px; }
    .card-body { display: flex; justify-content: space-between; align-items: center; }
    .rating-row, .status-row { display: flex; align-items: center; gap: 8px; }
    .rating-label { font-size: 0.75rem; color: #64748b; }
    .rating-value { font-weight: 700; color: #0f172a; }
    .status-pill { font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; font-weight: 600; }
    .draft { background: #f1f5f9; color: #64748b; }
    .pending { background: #fffbeb; color: #f59e0b; }
    .approved { background: #f0fdf4; color: #16a34a; }
    .stale-pill { background: #fffbeb; color: #f59e0b; }
    .stale .status-pill.stale { background: #fffbeb; color: #f59e0b; }
    .updated { font-size: 0.7rem; color: #94a3b8; }
    .danger-item { color: #ef4444; }
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
