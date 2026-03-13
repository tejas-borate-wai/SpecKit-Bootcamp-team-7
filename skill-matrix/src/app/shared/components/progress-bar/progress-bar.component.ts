import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-wrapper">
      <span class="progress-label">Question {{ current }} of {{ total }}</span>
      <div
        class="progress-track"
        role="progressbar"
        [attr.aria-valuenow]="current"
        [attr.aria-valuemin]="1"
        [attr.aria-valuemax]="total"
        [attr.aria-label]="'Question ' + current + ' of ' + total"
      >
        <div class="progress-fill" [style.width.%]="percentage"></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .progress-label {
      font-size: 0.85rem;
      color: #6b7280;
      font-weight: 500;
    }
    .progress-track {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #6366f1;
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  `],
})
export class ProgressBarComponent {
  @Input() current = 1;
  @Input() total = 1;

  get percentage(): number {
    return this.total > 0 ? (this.current / this.total) * 100 : 0;
  }
}
