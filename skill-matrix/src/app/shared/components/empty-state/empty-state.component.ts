import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      @if (ctaLabel) {
        <button mat-flat-button color="primary" (click)="onCtaClick()">
          {{ ctaLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #9ca3af;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }
    .empty-message {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 24px;
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No data found';
  @Input() message = '';
  @Input() ctaLabel = '';
  @Input() ctaAction: (() => void) | null = null;

  onCtaClick(): void {
    this.ctaAction?.();
  }
}
