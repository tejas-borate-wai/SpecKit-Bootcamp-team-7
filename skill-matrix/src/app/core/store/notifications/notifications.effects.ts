import { inject } from '@angular/core';
import { Actions, createEffect, ofType, concatLatestFrom } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, concatMap, filter, from, map, of, switchMap } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { NotificationActions } from './notifications.actions';
import { SessionActions } from '../session/session.actions';
import * as AssessmentsActions from '../assessments/assessments.actions';
import * as TeamActions from '../team/team.actions';
import { selectSelectedSubmission } from '../team/team.selectors';
import { generateNotificationId } from '../../../core/utils/notification-id.util';
import { Notification } from '../../../shared/models/notification.model';

// ── Load notifications when explicitly requested ─────────────────────────────

export const loadNotificationsEffect = createEffect(
  (actions$ = inject(Actions), notificationService = inject(NotificationService)) =>
    actions$.pipe(
      ofType(NotificationActions.load),
      switchMap(({ userId }) =>
        notificationService.getNotifications(userId).pipe(
          map((notifications) => NotificationActions.loadSuccess({ notifications })),
          catchError((error: { message?: string }) =>
            of(NotificationActions.loadFailure({ error: error?.message ?? 'Failed to load notifications' }))
          )
        )
      )
    ),
  { functional: true }
);

// ── T036: Load notifications automatically on login success ──────────────────

export const loadNotificationsOnLoginEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(SessionActions.loginSuccess),
      map(({ user }) => NotificationActions.load({ userId: user.id }))
    ),
  { functional: true }
);

// ── T035: Clear notifications on logout ──────────────────────────────────────

export const clearNotificationsOnLogoutEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(SessionActions.logout),
      map(() => NotificationActions.clear())
    ),
  { functional: true }
);

// ── T031: Generate assessment_result notification after assessment submission ─

export const assessmentResultNotificationEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(AssessmentsActions.assessmentSubmitted),
      map(({ attempt }) => {
        const notification: Notification = {
          notificationId: generateNotificationId(),
          userId: attempt.userId,
          type: 'assessment_result',
          message: `You scored ${attempt.score}% on your latest skill assessment.`,
          isRead: false,
          date: new Date().toISOString(),
          linkTo: '/my-skills',
        };
        return NotificationActions.addNotification({ notification });
      })
    ),
  { functional: true }
);

// ── T032: Generate skill_approved notification after manager approves ─────────

export const skillApprovedNotificationEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(TeamActions.approveSubmissionSuccess),
      concatLatestFrom(() => store.select(selectSelectedSubmission)),
      filter(([, submission]) => !!submission),
      map(([{ level }, submission]) => {
        const notification: Notification = {
          notificationId: generateNotificationId(),
          userId: submission!.userId,
          type: 'skill_approved',
          message: `Your ${submission!.skillName} skill has been approved${level ? ` at ${level} level` : ''}.`,
          isRead: false,
          date: new Date().toISOString(),
          linkTo: '/my-skills',
        };
        return NotificationActions.addNotification({ notification });
      })
    ),
  { functional: true }
);

// ── T033: Generate skill_rejected notification after manager rejects ──────────

export const skillRejectedNotificationEffect = createEffect(
  (actions$ = inject(Actions), store = inject(Store)) =>
    actions$.pipe(
      ofType(TeamActions.rejectSubmissionSuccess),
      concatLatestFrom(() => store.select(selectSelectedSubmission)),
      filter(([, submission]) => !!submission),
      map(([, submission]) => {
        const notification: Notification = {
          notificationId: generateNotificationId(),
          userId: submission!.userId,
          type: 'skill_rejected',
          message: `Your ${submission!.skillName} skill submission was rejected. Please review the feedback.`,
          isRead: false,
          date: new Date().toISOString(),
          linkTo: '/my-skills',
        };
        return NotificationActions.addNotification({ notification });
      })
    ),
  { functional: true }
);

// ── T034: Generate peer_validation_request notifications to nominated peers ───

export const peerValidationRequestNotificationEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(TeamActions.createPeerValidationRequestSuccess),
      concatMap(({ request }) => {
        const notifications: Notification[] = request.selectedPeerIds.map((peerId) => ({
          notificationId: generateNotificationId(),
          userId: peerId,
          type: 'peer_validation_request' as const,
          message: `You have been nominated to validate a peer's skill. Please share your rating.`,
          isRead: false,
          date: new Date().toISOString(),
          linkTo: null,
        }));
        return from(notifications.map((notification) =>
          NotificationActions.addNotification({ notification })
        ));
      })
    ),
  { functional: true }
);

