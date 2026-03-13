import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

import {
  selectScoreCard,
  selectAttempts,
  selectAttemptsLoading,
} from '../../../core/store/assessments/assessments.selectors';
import { loadAttempts, clearActiveAssessment } from '../../../core/store/assessments/assessments.actions';
import { ScoreCard } from '../../../shared/models/score-card.model';
import { AssessmentAttempt } from '../../../shared/models/assessment-attempt.model';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge/rating-badge.component';

@Component({
  selector: 'app-assessment-result',
  standalone: true,
  imports: [CommonModule, RouterLink, RatingBadgeComponent],
  templateUrl: './assessment-result.component.html',
  styleUrls: ['./assessment-result.component.scss'],
  animations: [
    trigger('revealCard', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) scale(0.97)' }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' })),
      ]),
    ]),
  ],
})
export class AssessmentResultComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly scoreCard$: Observable<ScoreCard | null> = this.store.select(selectScoreCard);
  readonly attemptsLoading$ = this.store.select(selectAttemptsLoading);

  skillId = '';
  skillAttempts$!: Observable<AssessmentAttempt[]>;

  ngOnInit(): void {
    this.skillId = this.route.snapshot.paramMap.get('skillId') ?? '';
    this.store.dispatch(loadAttempts());
    this.store.dispatch(clearActiveAssessment());

    this.skillAttempts$ = this.store.select(selectAttempts).pipe(
      map((attempts) =>
        attempts
          .filter((a) => a.skillId === this.skillId)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
      )
    );
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  backToList(): void {
    this.router.navigate(['/assessments']);
  }
}
