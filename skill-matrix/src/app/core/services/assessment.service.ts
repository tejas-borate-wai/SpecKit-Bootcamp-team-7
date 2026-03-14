import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SkillExam } from '../../shared/models/skill-exam.model';
import { AssessmentAttempt } from '../../shared/models/assessment-attempt.model';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly http = inject(HttpClient);

  private get userId(): string {
    try {
      const raw = localStorage.getItem('skillmatrix_session');
      if (!raw) return '';
      return ((JSON.parse(raw) as { user?: { id?: string } }).user?.id) ?? '';
    } catch {
      return '';
    }
  }

  getExams(): Observable<SkillExam[]> {
    return this.http.get<SkillExam[]>('/api/skill-exams');
  }

  getExamBySkillId(skillId: string): Observable<SkillExam> {
    return this.http.get<SkillExam>(`/api/skill-exams/${skillId}`);
  }

  getAttempts(): Observable<AssessmentAttempt[]> {
    return this.http.get<AssessmentAttempt[]>(
      `/api/skill-test-attempts/${this.userId}`
    );
  }

  submitAttempt(attempt: AssessmentAttempt): Observable<AssessmentAttempt> {
    return this.http.post<AssessmentAttempt>(
      '/api/skill-test-attempts',
      attempt
    );
  }
}
