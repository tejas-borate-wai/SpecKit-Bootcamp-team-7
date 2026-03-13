import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AchievementBadge } from '../../models/achievement.model';

@Component({
  selector: 'app-achievement-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="badge-wrap" [matTooltip]="badge.label">
      <mat-icon class="badge-icon">{{ badge.icon }}</mat-icon>
      <span class="badge-label">{{ badge.label }}</span>
    </div>
  `,
  styles: [`
    .badge-wrap {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      cursor: default;
    }
    .badge-icon {
      color: #f59e0b;
      font-size: 1.75rem;
      height: 1.75rem;
      width: 1.75rem;
    }
    .badge-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-align: center;
      white-space: nowrap;
    }
  `],
})
export class AchievementBadgeComponent {
  @Input() badge!: AchievementBadge;
}
