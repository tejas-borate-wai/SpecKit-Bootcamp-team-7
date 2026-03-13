import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        @if (icon) {
          <mat-icon class="stat-icon">{{ icon }}</mat-icon>
        }
      </div>
      <div class="stat-value">{{ value }}</div>
      @if (trend !== null && trend !== undefined) {
        <div class="stat-trend" [class.positive]="trend >= 0" [class.negative]="trend < 0">
          <mat-icon>{{ trend >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ trend >= 0 ? '+' : '' }}{{ trend }}%
        </div>
      }
      @if (subtitle) {
        <div class="stat-subtitle">{{ subtitle }}</div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      padding: 20px;
    }
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .stat-title { font-size: 0.875rem; color: var(--color-text-secondary, #6b7280); }
    .stat-icon { font-size: 1.25rem; color: var(--color-primary, #3b82f6); }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--color-text, #111827); }
    .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; margin-top: 4px; }
    .stat-trend mat-icon { font-size: 1rem; height: 1rem; width: 1rem; }
    .positive { color: var(--color-approved, #16a34a); }
    .negative { color: var(--color-rejected, #ef4444); }
    .stat-subtitle { font-size: 0.75rem; color: var(--color-text-secondary, #6b7280); margin-top: 4px; }
  `],
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon: string | null = null;
  @Input() trend: number | null = null;
  @Input() subtitle: string | null = null;
}
