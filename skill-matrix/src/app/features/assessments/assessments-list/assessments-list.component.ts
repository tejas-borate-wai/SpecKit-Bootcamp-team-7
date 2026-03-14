import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

import { loadExams, loadAttempts, startAssessment } from '../../../core/store/assessments/assessments.actions';
import {
  selectExams,
  selectAttempts,
  selectExamsLoading,
  selectAttemptsLoading,
} from '../../../core/store/assessments/assessments.selectors';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton-loader/skeleton-loader.component';
import { AssessmentStatus } from '../../../shared/models/assessment-status.model';
import { SkillExam } from '../../../shared/models/skill-exam.model';
import { AssessmentAttempt } from '../../../shared/models/assessment-attempt.model';

interface SkillRow {
  skillId: string;
  skillName: string;
  category: string;
  status: AssessmentStatus;
  lastScore: number | null;
  lastAttemptDate: string | null;
  cooldownRemaining: number;
  canRetake: boolean;
  hasExam: boolean;
}

@Component({
  selector: 'app-assessments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AsyncPipe, RouterLink, SkeletonLoaderComponent],
  templateUrl: './assessments-list.component.html',
  styleUrls: ['./assessments-list.component.scss'],
})
export class AssessmentsListComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly exams$ = this.store.select(selectExams);
  readonly attempts$ = this.store.select(selectAttempts);
  readonly examsLoading$ = this.store.select(selectExamsLoading);
  readonly attemptsLoading$ = this.store.select(selectAttemptsLoading);

  selectedCategory = '';
  selectedStatus: '' | AssessmentStatus = '';

  readonly skillRows$ = combineLatest([this.exams$, this.attempts$]).pipe(
    map(([exams, attempts]) => this.buildRows(exams, attempts))
  );

  readonly filteredRows$ = combineLatest([
    this.skillRows$,
  ]).pipe(
    map(([rows]) =>
      rows.filter((r) => {
        const catOk = !this.selectedCategory || r.category === this.selectedCategory;
        const statusOk = !this.selectedStatus || r.status === this.selectedStatus;
        return catOk && statusOk;
      })
    )
  );

  ngOnInit(): void {
    this.store.dispatch(loadExams());
    this.store.dispatch(loadAttempts());
  }

  private buildRows(exams: SkillExam[], attempts: AssessmentAttempt[]): SkillRow[] {
    const SKILL_NAMES: Record<string, { name: string; category: string }> = {
      'skill-001': { name: 'React', category: 'Frontend' },
      'skill-002': { name: 'Angular', category: 'Frontend' },
      'skill-003': { name: 'Vue', category: 'Frontend' },
      'skill-004': { name: 'HTML', category: 'Frontend' },
      'skill-005': { name: 'CSS', category: 'Frontend' },
      'skill-006': { name: 'JavaScript', category: 'Frontend' },
      'skill-007': { name: 'TypeScript', category: 'Frontend' },
      'skill-008': { name: 'Java', category: 'Backend' },
      'skill-009': { name: 'Node.js', category: 'Backend' },
      'skill-010': { name: 'Python', category: 'Backend' },
      'skill-011': { name: '.NET', category: 'Backend' },
      'skill-012': { name: 'Spring Boot', category: 'Backend' },
      'skill-013': { name: 'Flutter', category: 'Mobile' },
      'skill-014': { name: 'React Native', category: 'Mobile' },
      'skill-015': { name: 'Docker', category: 'DevOps' },
      'skill-016': { name: 'Kubernetes', category: 'DevOps' },
      'skill-017': { name: 'Jenkins', category: 'DevOps' },
      'skill-018': { name: 'Terraform', category: 'DevOps' },
      'skill-019': { name: 'SQL', category: 'Database' },
      'skill-020': { name: 'PostgreSQL', category: 'Database' },
      'skill-021': { name: 'MongoDB', category: 'Database' },
      'skill-022': { name: 'Redis', category: 'Database' },
    };

    return exams.map((exam) => {
      const meta = SKILL_NAMES[exam.skillId] ?? { name: exam.skillId, category: 'Other' };
      const skillAttempts = attempts
        .filter((a) => a.skillId === exam.skillId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const latest = skillAttempts[0] ?? null;
      const status: AssessmentStatus = skillAttempts.length > 0 ? 'Completed' : 'Not Attempted';

      let cooldownRemaining = 0;
      let canRetake = true;
      if (latest) {
        const elapsed = Date.now() - new Date(latest.date).getTime();
        const cooldown = 24 * 60 * 60 * 1000;
        cooldownRemaining = Math.max(0, cooldown - elapsed);
        canRetake = elapsed >= cooldown;
      }

      return {
        skillId: exam.skillId,
        skillName: meta.name,
        category: meta.category,
        status,
        lastScore: latest?.score ?? null,
        lastAttemptDate: latest?.date ?? null,
        cooldownRemaining,
        canRetake,
        hasExam: true,
      };
    });
  }

  get categories(): string[] {
    const all = new Set<string>();
    this.skillRows$.subscribe((rows) => rows.forEach((r) => all.add(r.category)));
    return Array.from(all).sort();
  }

  onFilterChange(): void {
    // triggers re-render via filteredRows$ subscription
  }

  startAssessment(skillId: string): void {
    this.store.dispatch(startAssessment({ skillId }));
    this.router.navigate(['/assessments', skillId, 'take']);
  }

  formatCooldown(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
