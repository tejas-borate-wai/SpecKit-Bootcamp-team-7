import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

export type SkeletonType = 'card' | 'table-row' | 'form' | 'chart' | 'list-item';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    @if (timedOut) {
      <div class="skeleton-timeout">
        <span class="timeout-icon">⚠</span>
        <p>Data took too long to load.</p>
        <button class="retry-btn" (click)="onRetry()">Retry</button>
      </div>
    } @else {
    @switch (type) {
      @case ('card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text short"></div>
        </div>
      }
      @case ('table-row') {
        @for (i of rows; track i) {
          <div class="skeleton-table-row">
            @for (j of cols; track j) {
              <div class="skeleton skeleton-cell"></div>
            }
          </div>
        }
      }
      @case ('form') {
        @for (i of rows; track i) {
          <div class="skeleton-form-field">
            <div class="skeleton skeleton-label"></div>
            <div class="skeleton skeleton-input"></div>
          </div>
        }
      }
      @case ('chart') {
        <div class="skeleton-chart">
          <div class="skeleton skeleton-chart-area"></div>
        </div>
      }
      @case ('list-item') {
        @for (i of rows; track i) {
          <div class="skeleton-list-item">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton-list-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        }
      }
    }
    }
  `,
  styles: [`
    :host { display: block; }

    .skeleton-timeout {
      text-align: center;
      padding: 24px;
      color: #6b7280;
    }
    .timeout-icon { font-size: 24px; }
    .skeleton-timeout p { margin: 8px 0 12px; }
    .retry-btn {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      cursor: pointer;
      font-size: 14px;
    }
    .retry-btn:hover { background: #f3f4f6; }

    .skeleton {
      background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .skeleton-card {
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    }

    .skeleton-title { height: 20px; width: 60%; margin-bottom: 12px; }
    .skeleton-text { height: 14px; width: 100%; margin-bottom: 8px; }
    .skeleton-text.short { width: 40%; }

    .skeleton-table-row {
      display: flex;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .skeleton-cell { height: 16px; flex: 1; }

    .skeleton-form-field { margin-bottom: 20px; }
    .skeleton-label { height: 14px; width: 30%; margin-bottom: 8px; }
    .skeleton-input { height: 40px; width: 100%; }

    .skeleton-chart-area { height: 250px; width: 100%; }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .skeleton-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-list-content { flex: 1; }

    @media (prefers-reduced-motion: reduce) {
      .skeleton { animation: none; background: #e0e0e0; }
    }
  `]
})
export class SkeletonLoaderComponent implements OnInit, OnDestroy {
  @Input() type: SkeletonType = 'card';
  @Input() count = 3;
  @Input() columns = 4;
  @Input() timeoutMs = 10000;
  @Output() retry = new EventEmitter<void>();

  timedOut = false;
  private timerId: ReturnType<typeof setTimeout> | null = null;

  get rows(): number[] { return Array.from({ length: this.count }, (_, i) => i); }
  get cols(): number[] { return Array.from({ length: this.columns }, (_, i) => i); }

  ngOnInit(): void {
    if (this.timeoutMs > 0) {
      this.timerId = setTimeout(() => { this.timedOut = true; }, this.timeoutMs);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
  }

  onRetry(): void {
    this.timedOut = false;
    this.retry.emit();
    if (this.timeoutMs > 0) {
      this.timerId = setTimeout(() => { this.timedOut = true; }, this.timeoutMs);
    }
  }
}
