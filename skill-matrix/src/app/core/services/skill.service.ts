import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeSkill, EmployeeSkillRecord } from '../../shared/models/employee-skill.model';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private http = inject(HttpClient);

  getUserSkills(userId: string): Observable<EmployeeSkillRecord> {
    return this.http.get<EmployeeSkillRecord>(`/api/employee-skills/${userId}`);
  }

  getAllEmployeeSkills(): Observable<EmployeeSkillRecord[]> {
    return this.http.get<EmployeeSkillRecord[]>('/api/employee-skills');
  }

  addSkill(userId: string, skillId: string, selfRating: number): Observable<EmployeeSkill> {
    return this.http.post<EmployeeSkill>(`/api/employee-skills/${userId}/skills`, { skillId, selfRating });
  }

  updateSkillRating(userId: string, skillId: string, selfRating: number): Observable<EmployeeSkill> {
    return this.http.put<EmployeeSkill>(`/api/employee-skills/${userId}/skills/${skillId}`, { selfRating });
  }

  deleteSkill(userId: string, skillId: string): Observable<{ message: string; skillId: string }> {
    return this.http.delete<{ message: string; skillId: string }>(
      `/api/employee-skills/${userId}/skills/${skillId}`
    );
  }
}
