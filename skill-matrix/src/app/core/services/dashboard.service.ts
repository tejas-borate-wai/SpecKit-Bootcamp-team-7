import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SkillTestAttempt } from '../../shared/models/skill-test-attempt.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  getTestAttempts(userId: string): Observable<SkillTestAttempt[]> {
    return this.http.get<SkillTestAttempt[]>(`/api/skill-test-attempts/${userId}`);
  }

  getSkillAttempts(userId: string, skillId: string): Observable<SkillTestAttempt[]> {
    return this.http.get<SkillTestAttempt[]>(`/api/skill-test-attempts/${userId}/${skillId}`);
  }
}
