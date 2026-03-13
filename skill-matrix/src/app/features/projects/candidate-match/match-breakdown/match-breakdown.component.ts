import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillBreakdownEntry } from '../../../../shared/models/candidate-match.model';
import { ProficiencyLevel } from '../../../../shared/models/project.model';

@Component({
  selector: 'app-match-breakdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './match-breakdown.component.html',
  styleUrls: ['./match-breakdown.component.scss'],
})
export class MatchBreakdownComponent {
  @Input() entries: SkillBreakdownEntry[] = [];

  levelLabel(level: ProficiencyLevel | null): string {
    if (level === null) return '—';
    const map: Record<ProficiencyLevel, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced', 4: 'Expert' };
    return map[level] ?? String(level);
  }

  statusClass(status: 'Exceeds' | 'Meets' | 'Below'): string {
    if (status === 'Exceeds') return 'pill-exceeds';
    if (status === 'Meets') return 'pill-meets';
    return 'pill-below';
  }
}
