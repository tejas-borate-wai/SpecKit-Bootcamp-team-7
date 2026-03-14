import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillTestAttempt } from '../../models/skill-test-attempt.model';

@Component({
  selector: 'app-progress-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <div class="chart-header">
        <span class="chart-title">{{ title }}</span>
        @if (attempts.length > 0) {
          <span class="chart-meta">{{ attempts.length }} attempt{{ attempts.length !== 1 ? 's' : '' }}</span>
        }
      </div>
      @if (attempts.length === 0) {
        <div class="empty-state">No assessment data available</div>
      } @else {
        <svg [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight" class="chart-svg" preserveAspectRatio="xMidYMid meet">
          <!-- Grid lines -->
          @for (line of gridLines; track line.y) {
            <line [attr.x1]="padding" [attr.y1]="line.y" [attr.x2]="svgWidth - padding" [attr.y2]="line.y"
                  stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>
            <text [attr.x]="padding - 6" [attr.y]="line.y + 4" text-anchor="end" font-size="10" fill="#9ca3af">{{ line.label }}</text>
          }
          <!-- Area fill -->
          <path [attr.d]="areaPath" fill="rgba(59,130,246,0.08)"/>
          <!-- Line -->
          <path [attr.d]="linePath" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
          <!-- Data points -->
          @for (pt of points; track pt.x) {
            <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4" fill="#3b82f6" stroke="#fff" stroke-width="2">
              <title>{{ pt.label }}</title>
            </circle>
          }
          <!-- X-axis labels -->
          @for (pt of points; track pt.x) {
            <text [attr.x]="pt.x" [attr.y]="svgHeight - 4" text-anchor="middle" font-size="9" fill="#9ca3af">{{ pt.dateLabel }}</text>
          }
        </svg>
        <div class="chart-stats">
          <span class="stat">Best: <strong>{{ bestScore }}%</strong></span>
          <span class="stat">Latest: <strong>{{ latestScore }}%</strong></span>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
    }
    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .chart-title { font-size: 0.875rem; font-weight: 600; color: #0f172a; }
    .chart-meta { font-size: 0.75rem; color: #64748b; }
    .chart-svg { width: 100%; height: auto; max-height: 220px; display: block; }
    .empty-state { text-align: center; padding: 32px; color: #94a3b8; font-size: 0.875rem; }
    .chart-stats { display: flex; gap: 16px; margin-top: 8px; font-size: 0.8rem; color: #64748b; }
    .stat strong { color: #0f172a; }
  `],
})
export class ProgressChartComponent implements OnChanges {
  @Input() attempts: SkillTestAttempt[] = [];
  @Input() title = 'Score Progress';

  readonly svgWidth = 400;
  readonly svgHeight = 160;
  readonly padding = 36;

  points: { x: number; y: number; label: string; dateLabel: string }[] = [];
  linePath = '';
  areaPath = '';
  gridLines: { y: number; label: string }[] = [];
  bestScore = 0;
  latestScore = 0;

  ngOnChanges(): void {
    const sorted = [...this.attempts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const chartW = this.svgWidth - this.padding * 2;
    const chartH = this.svgHeight - this.padding;
    const n = sorted.length;

    this.gridLines = [0, 25, 50, 75, 100].map((v) => ({
      y: this.padding + chartH * (1 - v / 100),
      label: `${v}`,
    }));

    if (n === 0) {
      this.points = [];
      this.linePath = '';
      this.areaPath = '';
      return;
    }

    this.points = sorted.map((a, i) => {
      const x = this.padding + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
      const y = this.padding + chartH * (1 - a.score / 100);
      const date = new Date(a.date);
      const dateLabel = `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
      return { x, y, label: `${a.score}% on ${date.toLocaleDateString()}`, dateLabel };
    });

    this.linePath = this.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const baseY = this.padding + chartH;
    this.areaPath = `${this.linePath} L${this.points[n - 1].x},${baseY} L${this.points[0].x},${baseY} Z`;

    const scores = sorted.map((a) => a.score);
    this.bestScore = Math.max(...scores);
    this.latestScore = scores[scores.length - 1];
  }
}
