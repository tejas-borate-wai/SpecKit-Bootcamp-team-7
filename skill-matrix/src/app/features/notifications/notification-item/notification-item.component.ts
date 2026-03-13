import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import {
  Notification,
  NOTIFICATION_TYPE_CONFIGS,
} from '../../../shared/models/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatRippleModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  host: { tabindex: '0', role: 'listitem' },
})
export class NotificationItemComponent {
  @Input({ required: true }) notification!: Notification;
  @Output() clicked = new EventEmitter<Notification>();

  get config() {
    return NOTIFICATION_TYPE_CONFIGS[this.notification.type];
  }

  onItemClick(): void {
    this.clicked.emit(this.notification);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    event.preventDefault();
    this.clicked.emit(this.notification);
  }
}
