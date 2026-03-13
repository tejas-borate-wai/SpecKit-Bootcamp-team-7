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
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      cursor: default;
    }
    .badge-icon {
      color: var(--color-primary, #f59e0b);
      font-size: 1.75rem;
      height: 1.75rem;
      width: 1.75rem;
    }
    .badge-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--color-text-secondary, #6b7280);
      text-align: center;
      white-space: nowrap;
    }
  `],
})
export class AchievementBadgeComponent {
  @Input() badge!: AchievementBadge;
}
