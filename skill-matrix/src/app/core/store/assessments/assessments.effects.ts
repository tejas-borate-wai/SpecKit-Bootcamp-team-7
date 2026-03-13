import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ToastService } from '../../../shared/services/toast.service';
import { EMPTY, Observable, interval, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  switchMap,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import { AssessmentService } from '../../services/assessment.service';
import { shuffleArray } from '../../../shared/utils/shuffle.util';
import {
  calculateWeightedScore,
  calculateSystemRating,
  mapScoreToLevel,
} from '../../../shared/utils/scoring.util';
import * as AssessmentsActions from './assessments.actions';
import { selectActiveAssessment } from './assessments.selectors';
import { AssessmentAttempt } from '../../../shared/models/assessment-attempt.model';
import { HttpClient } from '@angular/common/http';

// ── Load Exams ────────────────────────────────────────────────────────────────
export const loadExamsEffect = createEffect(
  (actions$ = inject(Actions), service = inject(AssessmentService)) =>
    actions$.pipe(
      ofType(AssessmentsActions.loadExams),
      exhaustMap(() =>
        service.getExams().pipe(
          map((exams) => AssessmentsActions.loadExamsSuccess({ exams })),
          catchError((err: { message?: string }) =>
            of(
              AssessmentsActions.loadExamsFailure({
                error: err?.message ?? 'Failed to load exams',
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

// ── Load Attempts ─────────────────────────────────────────────────────────────
export const loadAttemptsEffect = createEffect(
  (actions$ = inject(Actions), service = inject(AssessmentService)) =>
    actions$.pipe(
      ofType(AssessmentsActions.loadAttempts),
      exhaustMap(() =>
        service.getAttempts().pipe(
          map((attempts) =>
            AssessmentsActions.loadAttemptsSuccess({ attempts })
          ),
          catchError((err: { message?: string }) =>
            of(
              AssessmentsActions.loadAttemptsFailure({
                error: err?.message ?? 'Failed to load attempts',
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

// ── Start Assessment ──────────────────────────────────────────────────────────
export const startAssessmentEffect = createEffect(
  (actions$ = inject(Actions), service = inject(AssessmentService)) =>
    actions$.pipe(
      ofType(AssessmentsActions.startAssessment),
      switchMap(({ skillId }) =>
        service.getExamBySkillId(skillId).pipe(
          map((exam) => {
            const shuffledQuestionIds = shuffleArray(
              exam.questions.map((q) => q.questionId)
            );
            const timerDeadline = Date.now() + 900_000; // 15 minutes
            return AssessmentsActions.assessmentLoaded({
              skillId,
              exam,
              shuffledQuestionIds,
              timerDeadline,
            });
          }),
          catchError((err: { message?: string }) =>
            of(
              AssessmentsActions.startAssessmentFailure({
                error: err?.message ?? 'Failed to load exam',
              })
            )
          )
        )
      )
    ),
  { functional: true }
);

// ── Timer Effect ─────────────────────────────────────────────────────────────
export const timerEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store)
  ) =>
    actions$.pipe(
      ofType(AssessmentsActions.assessmentLoaded),
      switchMap(({ timerDeadline }) =>
        interval(1000).pipe(
          map(() => {
            const remaining = Math.max(
              0,
              Math.round((timerDeadline - Date.now()) / 1000)
            );
            return remaining;
          }),
          switchMap((remaining) => {
            if (remaining <= 0) {
              return of(
                AssessmentsActions.timerTick({ remaining: 0 }),
                AssessmentsActions.timerExpired()
              );
            }
            return of(AssessmentsActions.timerTick({ remaining }));
          }),
          takeUntil(
            actions$.pipe(
              ofType(
                AssessmentsActions.timerExpired,
                AssessmentsActions.submitAssessment,
                AssessmentsActions.clearActiveAssessment
              )
            )
          )
        )
      )
    ),
  { functional: true }
);

// ── Auto Submit on Timer Expiry ───────────────────────────────────────────────
export const autoSubmitEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    service = inject(AssessmentService),
    http = inject(HttpClient)
  ) =>
    actions$.pipe(
      ofType(AssessmentsActions.timerExpired),
      withLatestFrom(store.select(selectActiveAssessment)),
      switchMap(([, active]) => {
        if (!active || active.submitted) return EMPTY;
        return submitAssessmentObs(active, service, http);
      })
    ),
  { functional: true }
);

// ── Submit Assessment ─────────────────────────────────────────────────────────
export const submitAssessmentEffect = createEffect(
  (
    actions$ = inject(Actions),
    store = inject(Store),
    service = inject(AssessmentService),
    http = inject(HttpClient)
  ) =>
    actions$.pipe(
      ofType(AssessmentsActions.submitAssessment),
      withLatestFrom(store.select(selectActiveAssessment)),
      switchMap(([, active]) => {
        if (!active) return EMPTY;
        return submitAssessmentObs(active, service, http);
      })
    ),
  { functional: true }
);

// ── Shared submit logic ───────────────────────────────────────────────────────
function submitAssessmentObs(
  active: import('./assessments.state').ActiveAssessmentState,
  service: AssessmentService,
  http: HttpClient
): Observable<import('@ngrx/store').Action> {
  const sessionRaw = localStorage.getItem('session');
  const userId: string = sessionRaw
    ? (JSON.parse(sessionRaw) as { id?: string }).id ?? 'unknown'
    : 'unknown';

  const { skillId, exam, answers, timerDeadline } = active;
  const { earnedPoints, maxPoints, testScore } = calculateWeightedScore(
    exam.questions,
    answers
  );
  const timeTaken = Math.min(
    900,
    Math.round((timerDeadline - Date.now()) / 1000)
  );
  const adjustedTimeTaken = 900 - timeTaken < 0 ? 0 : 900 - timeTaken;

  // Check certification bonus
  const certObs: Observable<boolean> = http
    .get<{ expiryDate: string }[]>(
      `/api/certifications?userId=${userId}&skillId=${skillId}`
    )
    .pipe(
      map((certs) => {
        const today = new Date();
        return certs.some(
          (c) => c.expiryDate && new Date(c.expiryDate) > today
        );
      }),
      catchError(() => of(false))
    );

  // Check project experience bonus
  const projObs: Observable<boolean> = http
    .get<{ projectId: string }[]>(
      `/api/project-assignments?userId=${userId}`
    )
    .pipe(
      switchMap((assignments) => {
        const projectIds = assignments.map((a) => a.projectId);
        if (projectIds.length === 0) return of(false);
        return http
          .get<{ projectId: string; status: string; requiredSkills: string[] }[]>(
            '/api/projects'
          )
          .pipe(
            map((projects) =>
              projects.some(
                (p) =>
                  projectIds.includes(p.projectId) &&
                  p.status === 'Completed' &&
                  p.requiredSkills.includes(skillId)
              )
            ),
            catchError(() => of(false))
          );
      }),
      catchError(() => of(false))
    );

  // Combine bonus checks
  return certObs.pipe(
    take(1),
    switchMap((hasCert) =>
      projObs.pipe(
        take(1),
        switchMap((hasProj) => {
          const systemRating = calculateSystemRating(
            testScore,
            hasCert,
            hasProj
          );
          const level = mapScoreToLevel(systemRating);

          const attempt: AssessmentAttempt = {
            attemptId: `att-${Date.now()}`,
            userId,
            skillId,
            score: Math.round(testScore),
            earnedPoints,
            maxPoints,
            date: new Date().toISOString(),
            timeTaken: adjustedTimeTaken,
          };

          // POST attempt + PUT employee skill systemRating
          return service.submitAttempt(attempt).pipe(
            switchMap(() =>
              http
                .put(`/api/employee-skills/${userId}`, {
                  skillId,
                  systemRating,
                  level,
                })
                .pipe(catchError(() => of(null)))
            ),
            map(() =>
              AssessmentsActions.assessmentSubmitted({
                attempt,
                hasCertificationBonus: hasCert,
                hasProjectExperienceBonus: hasProj,
              })
            ),
            catchError((err: { message?: string }) =>
              of(
                AssessmentsActions.submitAssessmentFailure({
                  error: err?.message ?? 'Failed to submit assessment',
                })
              )
            )
          );
        })
      )
    )
  );
}

// ── Error Toast Notifications ─────────────────────────────────────────────────
export const assessmentErrorToastEffect = createEffect(
  (actions$ = inject(Actions), toast = inject(ToastService)) =>
    actions$.pipe(
      ofType(
        AssessmentsActions.loadExamsFailure,
        AssessmentsActions.loadAttemptsFailure,
        AssessmentsActions.startAssessmentFailure,
        AssessmentsActions.submitAssessmentFailure
      ),
      map(({ error }) => {
        toast.showError(error ?? 'An error occurred. Please try again.');
      })
    ),
  { functional: true, dispatch: false }
);
