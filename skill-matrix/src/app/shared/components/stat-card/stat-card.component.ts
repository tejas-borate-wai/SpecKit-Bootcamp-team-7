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
        @if (icon) {
          <span class="stat-icon-wrap">
            <mat-icon class="stat-icon">{{ icon }}</mat-icon>
          </span>
        }
      </div>
      <div class="stat-title">{{ title }}</div>
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
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      transition: box-shadow 0.15s ease;
    }
    .stat-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .stat-icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(60, 131, 246, 0.1);
    }
    .stat-icon { font-size: 1.25rem; color: #3c83f6; }
    .stat-title { font-size: 0.8125rem; font-weight: 500; color: #64748b; margin-bottom: 4px; }
    .stat-value { font-size: 1.75rem; font-weight: 700; color: #0f172a; letter-spacing: -0.025em; }
    .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; margin-top: 6px; }
    .stat-trend mat-icon { font-size: 0.875rem; height: 0.875rem; width: 0.875rem; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .stat-subtitle { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; }
  `],
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon: string | null = null;
  @Input() trend: number | null = null;
  @Input() subtitle: string | null = null;
}
