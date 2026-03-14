import { Pipe, PipeTransform } from '@angular/core';
import { percentageToLevel } from '../utils/skill-utils';
import { SkillProficiencyLevel } from '../models/employee-skill.model';

@Pipe({ name: 'proficiencyLabel', standalone: true, pure: true })
export class ProficiencyLabelPipe implements PipeTransform {
  transform(percentage: number | null | undefined): SkillProficiencyLevel | '—' {
    if (percentage === null || percentage === undefined) return '—';
    return percentageToLevel(percentage);
  }
}
