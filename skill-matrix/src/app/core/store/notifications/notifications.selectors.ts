import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.reducer';

// ── Feature Selector ──────────────────────────────────────────────────────────

export const selectNotificationsState =
  createFeatureSelector<NotificationsState>('notifications');

// ── Derived Selectors ─────────────────────────────────────────────────────────

export const selectAllNotifications = createSelector(
  selectNotificationsState,
  (state) => state.notifications
);

export const selectUnreadCount = createSelector(
  selectNotificationsState,
  (state) => state.unreadCount
);

export const selectUnreadNotifications = createSelector(
  selectAllNotifications,
  (notifications) => notifications.filter((n) => !n.isRead)
);

export const selectNotificationsLoading = createSelector(
  selectNotificationsState,
  (state) => state.loading
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  (state) => state.error
);
