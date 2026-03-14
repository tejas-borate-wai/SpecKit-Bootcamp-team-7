import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fab',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <a class="fab" [routerLink]="route" [attr.aria-label]="ariaLabel">
      <mat-icon>{{ icon }}</mat-icon>
    </a>
  `,
  styles: [`
    .fab {
      position: fixed;
      bottom: calc(72px + env(safe-area-inset-bottom, 0px));
      right: 16px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: var(--color-primary, #3c83f6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      text-decoration: none;
      z-index: 999;
      -webkit-tap-highlight-color: transparent;

      &:active {
        transform: scale(0.95);
      }

      mat-icon {
        font-size: 24px;
      }
    }
  `]
})
export class FABComponent {
  @Input() icon = 'add';
  @Input() route = '';
  @Input() ariaLabel = 'Quick action';
}
