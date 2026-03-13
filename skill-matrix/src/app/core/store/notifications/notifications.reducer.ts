import { createReducer, on } from '@ngrx/store';
import { Notification } from '../../../shared/models/notification.model';
import { NotificationActions } from './notifications.actions';

// ── State Shape ───────────────────────────────────────────────────────────────

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function countUnread(notifications: Notification[]): number {
  return notifications.filter((n) => !n.isRead).length;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

export const notificationsReducer = createReducer(
  initialNotificationsState,

  on(NotificationActions.load, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(NotificationActions.loadSuccess, (_state, { notifications }) => ({
    notifications,
    unreadCount: countUnread(notifications),
    loading: false,
    error: null,
  })),

  on(NotificationActions.loadFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(NotificationActions.markAsRead, (state, { notificationId }) => {
    const notifications = state.notifications.map((n) =>
      n.notificationId === notificationId ? { ...n, isRead: true } : n
    );
    return { ...state, notifications, unreadCount: countUnread(notifications) };
  }),

  on(NotificationActions.markAllAsRead, (state) => {
    const notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
    return { ...state, notifications, unreadCount: 0 };
  }),

  on(NotificationActions.addNotification, (state, { notification }) => {
    const notifications = [notification, ...state.notifications];
    return {
      ...state,
      notifications,
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    };
  }),

  on(NotificationActions.clear, () => ({ ...initialNotificationsState }))
);
