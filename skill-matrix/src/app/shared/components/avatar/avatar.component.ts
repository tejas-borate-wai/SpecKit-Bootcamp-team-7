import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img [src]="avatarUrl" [alt]="name" class="avatar"
         [style.width.px]="size" [style.height.px]="size" />
  `,
  styles: [`
    .avatar {
      border-radius: 50%;
      object-fit: cover;
      cursor: pointer;
    }
  `],
})
export class AvatarComponent {
  @Input() avatarUrl = '';
  @Input() name = '';
  @Input() size = 40;
}
