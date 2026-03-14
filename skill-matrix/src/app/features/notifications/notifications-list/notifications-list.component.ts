import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Notification } from '../../../shared/models/notification.model';
import { NotificationActions } from '../../../core/store/notifications/notifications.actions';
import {
  selectAllNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
} from '../../../core/store/notifications/notifications.selectors';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { canAccessRoute } from '../../../core/utils/route-access.util';
import { selectUserRole } from '../../../core/store/session/session.selectors';

@Component({
  selector: 'app-notifications-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NotificationItemComponent,
  ],
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss'],
})
export class NotificationsListComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  notifications$ = this.store.select(selectAllNotifications);
  unreadCount$ = this.store.select(selectUnreadCount);
  loading$ = this.store.select(selectNotificationsLoading);
  userRole$ = this.store.select(selectUserRole);

  onNotificationClicked(notification: Notification): void {
    if (!notification.isRead) {
      this.store.dispatch(
        NotificationActions.markAsRead({ notificationId: notification.notificationId })
      );
    }

    if (notification.linkTo) {
      this.store.select(selectUserRole).pipe().subscribe((role) => {
        if (role && canAccessRoute(notification.linkTo!, role)) {
          this.router.navigateByUrl(notification.linkTo!);
        }
      }).unsubscribe();
    }
  }

  onMarkAllAsRead(): void {
    this.store.dispatch(NotificationActions.markAllAsRead());
  }
}
