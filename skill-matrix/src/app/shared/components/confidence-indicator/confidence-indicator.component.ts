import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnyConfidenceLevel = 'high' | 'medium' | 'low' | 'High' | 'Medium' | 'Low';

@Component({
  selector: 'app-confidence-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="indicator" [ngClass]="normalizedLevel">
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
    .high .dot  { background: #16a34a; }
    .medium .dot { background: #f59e0b; }
    .low .dot   { background: #ef4444; }
    .high  { color: #16a34a; }
    .medium { color: #f59e0b; }
    .low   { color: #ef4444; }
  `],
})
export class ConfidenceIndicatorComponent {
  @Input() level: AnyConfidenceLevel = 'low';

  get normalizedLevel(): string {
    return this.level.toLowerCase();
  }

  get labelText(): string {
    const map: Record<string, string> = { high: 'High', medium: 'Medium', low: 'Low' };
    return map[this.level.toLowerCase()] ?? 'Low';
  }
}

