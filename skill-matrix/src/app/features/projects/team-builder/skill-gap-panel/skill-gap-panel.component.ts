import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SkillGapResult } from '../../../../shared/models/skill-gap.model';
import { ProficiencyLevel } from '../../../../shared/models/project.model';

@Component({
  selector: 'app-skill-gap-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './skill-gap-panel.component.html',
  styleUrls: ['./skill-gap-panel.component.scss'],
})
export class SkillGapPanelComponent {
  @Input() gaps: SkillGapResult[] = [];

  levelLabel(level: ProficiencyLevel): string {
    const map: Record<ProficiencyLevel, string> = {
      1: 'Beginner',
      2: 'Intermediate',
      3: 'Advanced',
      4: 'Expert',
    };
    return map[level] ?? String(level);
  }
}
