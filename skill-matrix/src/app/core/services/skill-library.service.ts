import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { SkillCategory } from '../../shared/models/skill-category.model';
import { SkillDefinition } from '../../shared/models/skill-definition.model';

@Injectable({ providedIn: 'root' })
export class SkillLibraryService {
  private http = inject(HttpClient);

  getCategories(): Observable<SkillCategory[]> {
    return this.http.get<SkillCategory[]>('/api/skill-categories');
  }

  getDefinitions(): Observable<SkillDefinition[]> {
    return this.http.get<SkillDefinition[]>('/api/skill-definitions');
  }

  getDefinitionsBySubCategory(subCategoryId: string): Observable<SkillDefinition[]> {
    return this.getDefinitions().pipe(
      map((defs) => defs.filter((d) => d.subCategoryId === subCategoryId))
    );
  }
}
