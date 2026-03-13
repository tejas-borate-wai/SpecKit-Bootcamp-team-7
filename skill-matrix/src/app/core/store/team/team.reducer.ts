import { createReducer, on } from '@ngrx/store';
import { TeamState, initialTeamState } from './team.state';
import * as TeamActions from './team.actions';

export const teamReducer = createReducer(
  initialTeamState,

  // Load Team Members
  on(TeamActions.loadTeamMembers, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadTeamMembersSuccess, (state, { employees }) => ({ ...state, loading: false, employees })),
  on(TeamActions.loadTeamMembersFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load Employee Profile
  on(TeamActions.loadEmployeeProfile, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadEmployeeProfileSuccess, (state, { employee }) => ({ ...state, loading: false, selectedEmployee: employee })),
  on(TeamActions.loadEmployeeProfileFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load Validation Queue
  on(TeamActions.loadValidationQueue, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadValidationQueueSuccess, (state, { queue }) => ({ ...state, loading: false, validationQueue: queue })),
  on(TeamActions.loadValidationQueueFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load Submission Detail
  on(TeamActions.loadSubmissionDetail, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadSubmissionDetailSuccess, (state, { submission }) => ({ ...state, loading: false, selectedSubmission: submission })),
  on(TeamActions.loadSubmissionDetailFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Approve
  on(TeamActions.approveSubmission, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.approveSubmissionSuccess, (state, { submissionId, managerRating, finalRating, level, confidence }) => ({
    ...state,
    loading: false,
    validationQueue: state.validationQueue.filter((s) => s.submissionId !== submissionId),
    selectedSubmission: state.selectedSubmission?.submissionId === submissionId
      ? { ...state.selectedSubmission, status: 'Approved' as const, managerRating, finalRating, level: level as any || null, confidence: confidence as 'High' | 'Medium' | 'Low' }
      : state.selectedSubmission,
  })),
  on(TeamActions.approveSubmissionFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Reject
  on(TeamActions.rejectSubmission, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.rejectSubmissionSuccess, (state, { submissionId }) => ({
    ...state,
    loading: false,
    validationQueue: state.validationQueue.filter((s) => s.submissionId !== submissionId),
  })),
  on(TeamActions.rejectSubmissionFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Override
  on(TeamActions.overrideRating, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.overrideRatingSuccess, (state) => ({ ...state, loading: false })),
  on(TeamActions.overrideRatingFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Eligible Peers
  on(TeamActions.loadEligiblePeers, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.loadEligiblePeersSuccess, (state, { peers }) => ({ ...state, loading: false, eligiblePeers: peers })),
  on(TeamActions.loadEligiblePeersFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Create Peer Validation Request
  on(TeamActions.createPeerValidationRequest, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.createPeerValidationRequestSuccess, (state, { request }) => ({
    ...state,
    loading: false,
    peerValidations: [...state.peerValidations, request],
  })),
  on(TeamActions.createPeerValidationRequestFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Respond to Peer Validation
  on(TeamActions.respondToPeerValidation, (state) => ({ ...state, loading: true, error: null })),
  on(TeamActions.respondToPeerValidationSuccess, (state, { status, peerRating, responseCount }) => ({
    ...state,
    loading: false,
    selectedSubmission: state.selectedSubmission
      ? {
          ...state.selectedSubmission,
          peerRating: responseCount >= 2 ? peerRating : state.selectedSubmission.peerRating,
          peerValidation: state.selectedSubmission.peerValidation
            ? { ...state.selectedSubmission.peerValidation, status, averageRating: peerRating }
            : state.selectedSubmission.peerValidation,
        }
      : null,
  })),
  on(TeamActions.respondToPeerValidationFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
