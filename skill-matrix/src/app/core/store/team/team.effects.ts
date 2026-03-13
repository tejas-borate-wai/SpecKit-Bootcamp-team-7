import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TeamService } from '../../services/team.service';
import { PeerValidationService } from '../../services/peer-validation.service';
import * as TeamActions from './team.actions';

// ── Load Team Members ────────────────────────────────────────────────────────
export const loadTeamMembers$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.loadTeamMembers),
      switchMap(() =>
        teamService.getTeamMembers().pipe(
          map((employees) => TeamActions.loadTeamMembersSuccess({ employees })),
          catchError((err: HttpErrorResponse) => of(TeamActions.loadTeamMembersFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Load Employee Profile ────────────────────────────────────────────────────
export const loadEmployeeProfile$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.loadEmployeeProfile),
      switchMap(({ userId }) =>
        teamService.getEmployeeProfile(userId).pipe(
          map((employee) => TeamActions.loadEmployeeProfileSuccess({ employee })),
          catchError((err: HttpErrorResponse) => of(TeamActions.loadEmployeeProfileFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Load Validation Queue ────────────────────────────────────────────────────
export const loadValidationQueue$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.loadValidationQueue),
      switchMap(() =>
        teamService.getValidationQueue().pipe(
          map((queue) => TeamActions.loadValidationQueueSuccess({ queue })),
          catchError((err: HttpErrorResponse) => of(TeamActions.loadValidationQueueFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Load Submission Detail ───────────────────────────────────────────────────
export const loadSubmissionDetail$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.loadSubmissionDetail),
      switchMap(({ submissionId }) =>
        teamService.getSubmissionDetail(submissionId).pipe(
          map((submission) => TeamActions.loadSubmissionDetailSuccess({ submission })),
          catchError((err: HttpErrorResponse) => of(TeamActions.loadSubmissionDetailFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Approve Submission ──────────────────────────────────────────────────────
export const approveSubmission$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.approveSubmission),
      switchMap(({ submissionId, managerRating: _mr, comment }) =>
        teamService.approveSubmission(submissionId, _mr, comment).pipe(
          map((result) => TeamActions.approveSubmissionSuccess({
            submissionId: result.submissionId,
            managerRating: result.managerRating,
            finalRating: result.finalRating,
            level: result.level,
            confidence: result.confidence,
            sourceCount: result.sourceCount,
            effectiveWeights: result.effectiveWeights,
          })),
          catchError((err: HttpErrorResponse) => of(TeamActions.approveSubmissionFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Reject Submission ───────────────────────────────────────────────────────
export const rejectSubmission$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.rejectSubmission),
      switchMap(({ submissionId, rejectionReason }) =>
        teamService.rejectSubmission(submissionId, rejectionReason).pipe(
          map(() => TeamActions.rejectSubmissionSuccess({ submissionId })),
          catchError((err: HttpErrorResponse) => of(TeamActions.rejectSubmissionFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Admin Override ──────────────────────────────────────────────────────────
export const overrideRating$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const teamService = inject(TeamService);
    return actions$.pipe(
      ofType(TeamActions.overrideRating),
      switchMap(({ submissionId, overriddenRating, justification }) =>
        teamService.overrideRating(submissionId, overriddenRating, justification).pipe(
          map(() => TeamActions.overrideRatingSuccess({ submissionId })),
          catchError((err: HttpErrorResponse) => of(TeamActions.overrideRatingFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Eligible Peers ──────────────────────────────────────────────────────────
export const loadEligiblePeers$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const peerService = inject(PeerValidationService);
    return actions$.pipe(
      ofType(TeamActions.loadEligiblePeers),
      switchMap(({ skillId }) =>
        peerService.getEligiblePeers(skillId).pipe(
          map((peers) => TeamActions.loadEligiblePeersSuccess({ peers })),
          catchError((err: HttpErrorResponse) => of(TeamActions.loadEligiblePeersFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Create Peer Validation Request ──────────────────────────────────────────
export const createPeerValidationRequest$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const peerService = inject(PeerValidationService);
    return actions$.pipe(
      ofType(TeamActions.createPeerValidationRequest),
      switchMap(({ skillId, selectedPeerIds }) =>
        peerService.createPeerValidationRequest(skillId, selectedPeerIds).pipe(
          map((request) => TeamActions.createPeerValidationRequestSuccess({ request })),
          catchError((err: HttpErrorResponse) => of(TeamActions.createPeerValidationRequestFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);

// ── Respond to Peer Validation ──────────────────────────────────────────────
export const respondToPeerValidation$ = createEffect(
  () => {
    const actions$ = inject(Actions);
    const peerService = inject(PeerValidationService);
    return actions$.pipe(
      ofType(TeamActions.respondToPeerValidation),
      switchMap(({ requestId, rating, comment }) =>
        peerService.respondToPeerValidation(requestId, rating, comment).pipe(
          map((result) => TeamActions.respondToPeerValidationSuccess({
            requestId: result.requestId,
            status: result.status,
            peerRating: result.peerRating,
            responseCount: result.responseCount,
          })),
          catchError((err: HttpErrorResponse) => of(TeamActions.respondToPeerValidationFailure({ error: err.error?.error ?? err.message })))
        )
      )
    );
  },
  { functional: true }
);
