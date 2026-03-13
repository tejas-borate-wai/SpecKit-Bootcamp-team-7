import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

import {
  startAssessment,
  nextQuestion,
  previousQuestion,
  selectAnswer,
  submitAssessment,
  clearActiveAssessment,
} from '../../../core/store/assessments/assessments.actions';
import {
  selectActiveAssessment,
  selectCurrentQuestion,
  selectSelectedAnswer,
  selectProgress,
  selectTimerRemaining,
} from '../../../core/store/assessments/assessments.selectors';
import { CountdownTimerComponent } from '../../../shared/components/countdown-timer/countdown-timer.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-take-assessment',
  standalone: true,
  imports: [CommonModule, FormsModule, CountdownTimerComponent, ProgressBarComponent],
  templateUrl: './take-assessment.component.html',
  styleUrls: ['./take-assessment.component.scss'],
  animations: [
    trigger('questionSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(-40px)' })),
      ]),
    ]),
  ],
})
export class TakeAssessmentComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly activeAssessment$ = this.store.select(selectActiveAssessment);
  readonly currentQuestion$ = this.store.select(selectCurrentQuestion);
  readonly selectedAnswer$ = this.store.select(selectSelectedAnswer);
  readonly progress$ = this.store.select(selectProgress);
  readonly timerRemaining$ = this.store.select(selectTimerRemaining);

  timedOutMessage = '';
  isSubmitting = false;

  ngOnInit(): void {
    const skillId = this.route.snapshot.paramMap.get('skillId') ?? '';

    // If no active assessment, start one
    this.activeAssessment$.pipe(takeUntil(this.destroy$)).subscribe((active) => {
      if (!active) {
        this.store.dispatch(startAssessment({ skillId }));
      } else if (active.submitted) {
        // Navigate to result
        if (!this.isSubmitting) {
          this.isSubmitting = true;
          this.router.navigate(['/assessments', active.skillId, 'result']);
        }
      }
    });

    // Listen for timer expiry toast
    this.timerRemaining$.pipe(takeUntil(this.destroy$)).subscribe((rem) => {
      if (rem === 0 && !this.timedOutMessage) {
        this.timedOutMessage = "Time's up! Your test has been auto-submitted.";
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectAnswer(questionId: string, answer: string): void {
    this.store.dispatch(selectAnswer({ questionId, answer }));
  }

  onNext(): void {
    this.store.dispatch(nextQuestion());
  }

  onPrevious(): void {
    this.store.dispatch(previousQuestion());
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.store.dispatch(submitAssessment());
  }

  onLeave(): void {
    this.store.dispatch(clearActiveAssessment());
    this.router.navigate(['/assessments']);
  }
}
