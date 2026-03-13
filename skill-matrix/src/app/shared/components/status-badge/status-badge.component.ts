import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificationStatus } from '../../models/certification.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.scss'],
})
export class StatusBadgeComponent {
  @Input() status: CertificationStatus = 'Valid';

  get ariaLabel(): string {
    return `Certification status: ${this.status}`;
  }
}
