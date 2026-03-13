import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../shared/models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  /** Load all notifications for the given user */
  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`/api/notifications/${userId}`);
  }
}
