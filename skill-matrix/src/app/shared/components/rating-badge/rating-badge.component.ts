import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillProficiencyLevel } from '../../models/employee-skill.model';

@Component({
  selector: 'app-rating-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="level?.toLowerCase()">{{ level ?? '—' }}</span>
  `,
  styles: [`
    .badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .beginner  { background: #f3f4f6; color: #9ca3af; border: 1px solid #e5e7eb; }
    .intermediate { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; }
    .advanced  { background: #f5f3ff; color: #8b5cf6; border: 1px solid #ddd6fe; }
    .expert    { background: #fffbeb; color: #f59e0b; border: 1px solid #fde68a; }
  `],
})
export class RatingBadgeComponent {
  @Input() level: SkillProficiencyLevel | null = null;
}
