import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certified-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certified-badge.component.html',
  styleUrls: ['./certified-badge.component.scss'],
})
export class CertifiedBadgeComponent {
  @Input() isVisible = false;
}
