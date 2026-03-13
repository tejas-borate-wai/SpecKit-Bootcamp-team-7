import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfidenceLevel } from '../../models/dashboard.model';

@Component({
  selector: 'app-confidence-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="indicator" [ngClass]="level">
      <span class="dot"></span>
      <span class="label">{{ labelText }}</span>
    </span>
  `,
  styles: [`
    .indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .high .dot  { background: var(--color-approved, #16a34a); }
    .medium .dot { background: var(--color-pending, #f59e0b); }
    .low .dot   { background: var(--color-rejected, #ef4444); }
    .high  { color: var(--color-approved, #16a34a); }
    .medium { color: var(--color-pending, #f59e0b); }
    .low   { color: var(--color-rejected, #ef4444); }
  `],
})
export class ConfidenceIndicatorComponent {
  @Input() level: ConfidenceLevel = 'low';

  get labelText(): string {
    const map: Record<ConfidenceLevel, string> = { high: 'High', medium: 'Medium', low: 'Low' };
    return map[this.level];
  }
}
