import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectCurrentUser } from '../../core/store/session/session.selectors';
import { SessionActions } from '../../core/store/session/session.actions';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  private readonly store = inject(Store);
  readonly user$ = this.store.select(selectCurrentUser);

  onLogout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}
