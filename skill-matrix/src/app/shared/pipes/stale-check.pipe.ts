import { Pipe, PipeTransform } from '@angular/core';
import { isStale } from '../utils/skill-utils';

@Pipe({ name: 'staleCheck', standalone: true, pure: true })
export class StaleCheckPipe implements PipeTransform {
  transform(isoDate: string | null | undefined): boolean {
    if (!isoDate) return false;
    return isStale(isoDate);
  }
}
