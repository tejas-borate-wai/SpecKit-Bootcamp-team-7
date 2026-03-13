import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';
import { Store } from '@ngrx/store';
import { AvatarComponent } from '../avatar/avatar.component';
import { selectCurrentUser } from '../../../core/store/session/session.selectors';
import { SessionActions } from '../../../core/store/session/session.actions';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    NotificationBellComponent,
    MatBadgeModule,
    AvatarComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() pageTitle = 'Dashboard';
  @Output() toggleSidebar = new EventEmitter<void>();

  private store = inject(Store);
  user$ = this.store.select(selectCurrentUser);

  onLogout(): void {
    this.store.dispatch(SessionActions.logout());
  }
}
