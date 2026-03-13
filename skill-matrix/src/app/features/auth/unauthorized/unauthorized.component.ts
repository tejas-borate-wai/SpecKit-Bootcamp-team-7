import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="unauthorized-container">
      <mat-icon class="warning-icon">block</mat-icon>
      <h1>Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <a mat-raised-button color="primary" routerLink="/dashboard">Go to Dashboard</a>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
      padding: 24px;
    }
    .warning-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #EF4444;
      margin-bottom: 16px;
    }
    h1 { margin-bottom: 8px; color: #1f2937; }
    p { margin-bottom: 24px; color: #6b7280; }
  `],
})
export class UnauthorizedComponent {}
