import { teamReducer } from './team.reducer';
import { initialTeamState, TeamState } from './team.state';
import * as TeamActions from './team.actions';
import { SubmissionDetail, ValidationQueueItem } from '../../../shared/models/skill-submission.model';

const mockSubmission: SubmissionDetail = {
  submissionId: 'sub-001',
  userId: 'u001',
  employeeName: 'Alice',
  department: 'Frontend',
  avatarUrl: '',
  skillId: 'skill-001',
  skillName: 'Angular',
  selfRating: 3,
  managerRating: null,
  peerRating: 3.5,
  systemRating: 3.2,
  finalRating: null,
  level: null,
  confidence: null,
  status: 'Pending',
  submittedDate: '2026-01-20',
  certification: null,
  projectExperience: [],
  peerValidation: null,
};

const mockQueueItem: ValidationQueueItem = {
  submissionId: 'sub-001',
  userId: 'u001',
  employeeName: 'Alice',
  department: 'Frontend',
  skillId: 'skill-001',
  skillName: 'Angular',
  selfRating: 3,
  status: 'Pending',
  submittedDate: '2026-01-20',
  certificationId: null,
  hasCertification: false,
  hasProjectExperience: false,
  peerValidationStatus: null,
  peerRating: null,
};

const stateWithSubmission: TeamState = {
  ...initialTeamState,
  validationQueue: [mockQueueItem],
  selectedSubmission: mockSubmission,
};

describe('Team Reducer', () => {

  it('should return initial state for unknown action', () => {
    const result = teamReducer(undefined, { type: '@@UNKNOWN' });
    expect(result).toEqual(initialTeamState);
  });

  describe('approveSubmissionSuccess', () => {
    it('should update status to Approved, set managerRating and finalRating on selectedSubmission', () => {
      const action = TeamActions.approveSubmissionSuccess({
        submissionId: 'sub-001',
        managerRating: 4,
        finalRating: 3.475,
        level: 'Advanced',
        confidence: 'High',
        sourceCount: 4,
        effectiveWeights: {},
      });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.selectedSubmission?.status).toBe('Approved');
      expect(result.selectedSubmission?.managerRating).toBe(4);
      expect(result.selectedSubmission?.finalRating).toBe(3.475);
      expect(result.selectedSubmission?.level).toBe('Advanced');
    });

    it('should remove the approved submission from validationQueue', () => {
      const action = TeamActions.approveSubmissionSuccess({
        submissionId: 'sub-001',
        managerRating: 4,
        finalRating: 3.475,
        level: 'Advanced',
        confidence: 'High',
        sourceCount: 4,
        effectiveWeights: {},
      });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.validationQueue.length).toBe(0);
    });
  });

  describe('rejectSubmissionSuccess', () => {
    it('should remove the rejected submission from validationQueue', () => {
      const action = TeamActions.rejectSubmissionSuccess({ submissionId: 'sub-001' });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.validationQueue.length).toBe(0);
    });

    it('should not modify selectedSubmission if IDs do not match', () => {
      const action = TeamActions.rejectSubmissionSuccess({ submissionId: 'sub-999' });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.selectedSubmission?.submissionId).toBe('sub-001');
    });
  });

  describe('respondToPeerValidationSuccess', () => {
    it('should update selectedSubmission peerRating when responseCount >= 2', () => {
      const action = TeamActions.respondToPeerValidationSuccess({
        requestId: 'pv-001',
        status: 'completed',
        peerRating: 3.0,
        responseCount: 2,
      });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.selectedSubmission?.peerRating).toBe(3.0);
    });

    it('should not update peerRating if responseCount < 2', () => {
      const action = TeamActions.respondToPeerValidationSuccess({
        requestId: 'pv-001',
        status: 'awaiting_responses',
        peerRating: 2.0,
        responseCount: 1,
      });
      const result = teamReducer(stateWithSubmission, action);
      expect(result.selectedSubmission?.peerRating).toBe(3.5); // original
    });
  });
});
