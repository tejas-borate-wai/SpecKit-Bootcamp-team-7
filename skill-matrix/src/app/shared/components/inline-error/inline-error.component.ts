import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inline-error',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (control?.touched && control?.invalid) {
      @for (msg of activeErrors; track msg) {
        <div class="field-error" role="alert">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <span>{{ msg }}</span>
        </div>
      }
    }
  `,
  styles: [`
    .field-error {
      color: #EF4444;
      font-size: 12px;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .error-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class InlineErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() errorMessages: Record<string, string> = {};

  get activeErrors(): string[] {
    if (!this.control?.errors) return [];
    return Object.keys(this.control.errors)
      .filter(key => this.errorMessages[key])
      .map(key => this.errorMessages[key]);
  }
}
