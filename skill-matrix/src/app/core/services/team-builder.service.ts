import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectAssignment } from '../../shared/models/project-assignment.model';

@Injectable({ providedIn: 'root' })
export class TeamBuilderService {
  private readonly http = inject(HttpClient);

  assign(projectId: string, userId: string, role: string): Observable<ProjectAssignment> {
    return this.http.post<ProjectAssignment>('/api/project-assignments', {
      projectId,
      userId,
      role,
    });
  }

  removeAssignment(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`/api/project-assignments/${assignmentId}`);
  }
}
