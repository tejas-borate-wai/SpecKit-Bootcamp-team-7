import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, map, Observable } from 'rxjs';
import { selectAllEmployeeSkills, selectSkillDefinitions } from '../store/skills/skills.selectors';
import { selectTeamMembers } from '../store/team/team.selectors';
import { selectAllProjects } from '../store/projects/projects.selectors';
import { selectCertificationsWithStatus } from '../store/certifications/certifications.selectors';

export interface SearchResult {
  type: 'employee' | 'skill' | 'project' | 'certification';
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private store = inject(Store);

  private teamMembers$ = this.store.select(selectTeamMembers);
  private skillDefinitions$ = this.store.select(selectSkillDefinitions);
  private projects$ = this.store.select(selectAllProjects);
  private certifications$ = this.store.select(selectCertificationsWithStatus);

  search(query: string): Observable<SearchResult[]> {
    const q = query.toLowerCase().trim();
    if (!q) return new Observable((sub) => sub.next([]));

    return combineLatest([
      this.teamMembers$,
      this.skillDefinitions$,
      this.projects$,
      this.certifications$,
    ]).pipe(
      map(([members, skills, projects, certs]) => {
        const results: SearchResult[] = [];

        for (const m of members) {
          if (m.name.toLowerCase().includes(q) || m.department.toLowerCase().includes(q)) {
            results.push({
              type: 'employee',
              id: m.userId,
              title: m.name,
              subtitle: m.department,
              route: `/team/skills/${m.userId}`,
            });
          }
        }

        for (const s of skills) {
          if (s.skillName.toLowerCase().includes(q)) {
            results.push({
              type: 'skill',
              id: s.skillId,
              title: s.skillName,
              subtitle: s.subCategoryId,
              route: '/my-skills',
            });
          }
        }

        for (const p of projects) {
          if (p.name.toLowerCase().includes(q)) {
            results.push({
              type: 'project',
              id: p.projectId,
              title: p.name,
              subtitle: p.status,
              route: `/projects/${p.projectId}`,
            });
          }
        }

        for (const c of certs) {
          if (c.certName.toLowerCase().includes(q)) {
            results.push({
              type: 'certification',
              id: c.certId,
              title: c.certName,
              subtitle: c.issuingOrg,
              route: '/certifications',
            });
          }
        }

        return results.slice(0, 20);
      })
    );
  }
}
