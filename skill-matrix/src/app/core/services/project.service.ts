import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../../shared/models/project.model';
import { ProjectAssignment } from '../../shared/models/project-assignment.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>('/api/projects');
  }

  getById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`/api/projects/${projectId}`);
  }

  create(project: Omit<Project, 'projectId' | 'createdBy' | 'createdDate'>): Observable<Project> {
    return this.http.post<Project>('/api/projects', project);
  }

  update(projectId: string, changes: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`/api/projects/${projectId}`, changes);
  }

  delete(projectId: string): Observable<{ projectId: string }> {
    return this.http.delete<{ projectId: string }>(`/api/projects/${projectId}`);
  }

  getAssignments(userId?: string): Observable<ProjectAssignment[]> {
    const url = userId
      ? `/api/project-assignments?userId=${userId}`
      : '/api/project-assignments';
    return this.http.get<ProjectAssignment[]>(url);
  }

  assign(projectId: string, userId: string, role: string): Observable<ProjectAssignment> {
    return this.http.post<ProjectAssignment>('/api/project-assignments', { projectId, userId, role });
  }

  removeAssignment(assignmentId: string): Observable<void> {
    return this.http.delete<void>(`/api/project-assignments/${assignmentId}`);
  }

  overrideAvailability(userId: string, newStatus: string, reason: string): Observable<{ userId: string; status: string }> {
    return this.http.patch<{ userId: string; status: string }>(`/api/users/${userId}/availability`, { status: newStatus, reason });
  }
}
