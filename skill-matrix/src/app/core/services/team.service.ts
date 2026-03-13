import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TeamMember, EmployeeSkillProfile } from '../../shared/models/team-member.model';
import { ValidationQueueItem, SubmissionDetail } from '../../shared/models/skill-submission.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly base = '/api/team';

  constructor(private http: HttpClient) {}

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http
      .get<{ data: TeamMember[] }>(`${this.base}/employees`)
      .pipe(map((r) => r.data));
  }

  getEmployeeProfile(userId: string): Observable<EmployeeSkillProfile> {
    return this.http
      .get<{ data: EmployeeSkillProfile }>(`${this.base}/employees/${userId}`)
      .pipe(map((r) => r.data));
  }

  getValidationQueue(): Observable<ValidationQueueItem[]> {
    return this.http
      .get<{ data: ValidationQueueItem[] }>(`${this.base}/validation-queue`)
      .pipe(map((r) => r.data));
  }

  getSubmissionDetail(submissionId: string): Observable<SubmissionDetail> {
    return this.http
      .get<{ data: SubmissionDetail }>(`${this.base}/validation-queue/${submissionId}`)
      .pipe(map((r) => r.data));
  }

  approveSubmission(submissionId: string, managerRating: number, comment: string | null): Observable<{
    submissionId: string;
    status: string;
    managerRating: number;
    finalRating: number;
    level: string;
    confidence: string;
    sourceCount: number;
    effectiveWeights: Record<string, number>;
  }> {
    return this.http
      .post<{ data: { submissionId: string; status: string; managerRating: number; finalRating: number; level: string; confidence: string; sourceCount: number; effectiveWeights: Record<string, number> } }>(
        `${this.base}/validation-queue/${submissionId}/approve`,
        { managerRating, comment }
      )
      .pipe(map((r) => r.data));
  }

  rejectSubmission(submissionId: string, rejectionReason: string): Observable<unknown> {
    return this.http
      .post<{ data: unknown }>(`${this.base}/validation-queue/${submissionId}/reject`, {
        rejectionReason,
      })
      .pipe(map((r) => r.data));
  }

  overrideRating(submissionId: string, overriddenRating: number, justification: string): Observable<unknown> {
    return this.http
      .post<{ data: unknown }>(`${this.base}/validation-queue/${submissionId}/override`, {
        overriddenRating,
        justification,
      })
      .pipe(map((r) => r.data));
  }
}
