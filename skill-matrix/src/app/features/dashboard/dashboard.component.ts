import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../core/store/session/session.selectors';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (user$ | async; as user) {
      <div class="dashboard-placeholder">
        <h1>Welcome, {{ user.name }}!</h1>
        <p>Role: <strong>{{ user.role }}</strong></p>
        <p>Department: {{ user.department }}</p>
      </div>
    }
  `,
  styles: [`
    .dashboard-placeholder {
      padding: 24px;
      h1 { margin-bottom: 8px; }
      p { margin-bottom: 4px; color: #6b7280; }
      strong { color: #3b82f6; }
    }
  `],
})
export class DashboardComponent {
  private store = inject(Store);
  user$ = this.store.select(selectCurrentUser);
}
