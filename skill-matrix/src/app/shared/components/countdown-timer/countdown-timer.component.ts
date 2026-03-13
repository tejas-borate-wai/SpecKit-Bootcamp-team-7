import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer" [class.warning]="remainingSeconds <= 120" [class.compact]="compact">
      <span class="timer-icon" aria-hidden="true">⏱</span>
      <span class="timer-display" [attr.aria-label]="'Time remaining: ' + formattedTime">
        {{ formattedTime }}
      </span>
    </div>
  `,
  styles: [`
    .timer {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      background: var(--timer-bg, #f0fdf4);
      border: 1px solid var(--timer-border, #bbf7d0);
      font-variant-numeric: tabular-nums;
      font-size: 1rem;
      font-weight: 600;
      color: var(--timer-color, #15803d);
      transition: background 0.3s, color 0.3s;
      white-space: nowrap;
    }
    .timer.warning {
      --timer-bg: #fef2f2;
      --timer-border: #fecaca;
      --timer-color: #dc2626;
    }
    .timer.compact {
      padding: 4px 10px;
      font-size: 0.85rem;
      border-radius: 12px;
    }
    .timer-icon { font-size: 1em; }
    .timer-display { letter-spacing: 0.05em; }
  `],
})
export class CountdownTimerComponent {
  @Input() remainingSeconds = 0;
  @Input() compact = false;

  get formattedTime(): string {
    const m = Math.floor(Math.max(0, this.remainingSeconds) / 60)
      .toString()
      .padStart(2, '0');
    const s = (Math.max(0, this.remainingSeconds) % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
