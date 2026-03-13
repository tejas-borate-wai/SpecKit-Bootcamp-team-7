import { createAction, props } from '@ngrx/store';
import { TeamMember, EmployeeSkillProfile } from '../../../shared/models/team-member.model';
import { ValidationQueueItem, SubmissionDetail } from '../../../shared/models/skill-submission.model';
import { PeerValidationRequest, EligiblePeer } from '../../../shared/models/peer-validation.model';

// ── Load Team Members ────────────────────────────────────────────────────────
export const loadTeamMembers = createAction('[Team] Load Team Members');
export const loadTeamMembersSuccess = createAction('[Team] Load Team Members Success', props<{ employees: TeamMember[] }>());
export const loadTeamMembersFailure = createAction('[Team] Load Team Members Failure', props<{ error: string }>());

// ── Load Employee Profile ────────────────────────────────────────────────────
export const loadEmployeeProfile = createAction('[Team] Load Employee Profile', props<{ userId: string }>());
export const loadEmployeeProfileSuccess = createAction('[Team] Load Employee Profile Success', props<{ employee: EmployeeSkillProfile }>());
export const loadEmployeeProfileFailure = createAction('[Team] Load Employee Profile Failure', props<{ error: string }>());

// ── Load Validation Queue ────────────────────────────────────────────────────
export const loadValidationQueue = createAction('[Team] Load Validation Queue');
export const loadValidationQueueSuccess = createAction('[Team] Load Validation Queue Success', props<{ queue: ValidationQueueItem[] }>());
export const loadValidationQueueFailure = createAction('[Team] Load Validation Queue Failure', props<{ error: string }>());

// ── Load Submission Detail ───────────────────────────────────────────────────
export const loadSubmissionDetail = createAction('[Team] Load Submission Detail', props<{ submissionId: string }>());
export const loadSubmissionDetailSuccess = createAction('[Team] Load Submission Detail Success', props<{ submission: SubmissionDetail }>());
export const loadSubmissionDetailFailure = createAction('[Team] Load Submission Detail Failure', props<{ error: string }>());

// ── Approve Submission ──────────────────────────────────────────────────────
export const approveSubmission = createAction('[Team] Approve Submission', props<{ submissionId: string; managerRating: number; comment: string | null }>());
export const approveSubmissionSuccess = createAction('[Team] Approve Submission Success', props<{
  submissionId: string;
  managerRating: number;
  finalRating: number;
  level: string;
  confidence: string;
  sourceCount: number;
  effectiveWeights: Record<string, number>;
}>());
export const approveSubmissionFailure = createAction('[Team] Approve Submission Failure', props<{ error: string }>());

// ── Reject Submission ───────────────────────────────────────────────────────
export const rejectSubmission = createAction('[Team] Reject Submission', props<{ submissionId: string; rejectionReason: string }>());
export const rejectSubmissionSuccess = createAction('[Team] Reject Submission Success', props<{ submissionId: string }>());
export const rejectSubmissionFailure = createAction('[Team] Reject Submission Failure', props<{ error: string }>());

// ── Admin Override ──────────────────────────────────────────────────────────
export const overrideRating = createAction('[Team] Override Rating', props<{ submissionId: string; overriddenRating: number; justification: string }>());
export const overrideRatingSuccess = createAction('[Team] Override Rating Success', props<{ submissionId: string }>());
export const overrideRatingFailure = createAction('[Team] Override Rating Failure', props<{ error: string }>());

// ── Peer Validation ─────────────────────────────────────────────────────────
export const loadEligiblePeers = createAction('[Team] Load Eligible Peers', props<{ skillId: string }>());
export const loadEligiblePeersSuccess = createAction('[Team] Load Eligible Peers Success', props<{ peers: EligiblePeer[] }>());
export const loadEligiblePeersFailure = createAction('[Team] Load Eligible Peers Failure', props<{ error: string }>());

export const createPeerValidationRequest = createAction('[Team] Create Peer Validation Request', props<{ skillId: string; selectedPeerIds: string[] }>());
export const createPeerValidationRequestSuccess = createAction('[Team] Create Peer Validation Request Success', props<{ request: PeerValidationRequest }>());
export const createPeerValidationRequestFailure = createAction('[Team] Create Peer Validation Request Failure', props<{ error: string }>());

export const respondToPeerValidation = createAction('[Team] Respond To Peer Validation', props<{ requestId: string; rating: number; comment: string | null }>());
export const respondToPeerValidationSuccess = createAction('[Team] Respond To Peer Validation Success', props<{ requestId: string; status: string; peerRating: number; responseCount: number }>());
export const respondToPeerValidationFailure = createAction('[Team] Respond To Peer Validation Failure', props<{ error: string }>());
