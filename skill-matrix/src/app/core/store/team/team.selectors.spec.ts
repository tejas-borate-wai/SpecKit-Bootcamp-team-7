import { selectTeamMembers, selectValidationQueue, selectEligiblePeers, selectPeerValidationWithExpiry } from './team.selectors';
import { initialTeamState, TeamState } from './team.state';
import { TeamMember } from '../../../shared/models/team-member.model';
import { ValidationQueueItem } from '../../../shared/models/skill-submission.model';
import { PeerValidationRequest } from '../../../shared/models/peer-validation.model';

const mockManagers: TeamMember[] = [
  { userId: 'u007', name: 'Manager A', email: 'm@a.com', department: 'Frontend', avatarUrl: '', skillsCount: 3, avgRating: 3, profileCompletion: 80, pendingSubmissions: 1 },
  { userId: 'u008', name: 'Manager B', email: 'm@b.com', department: 'Backend', avatarUrl: '', skillsCount: 2, avgRating: 2.5, profileCompletion: 60, pendingSubmissions: 0 },
];

const mockQueue: ValidationQueueItem[] = [
  { submissionId: 'sub-001', userId: 'u001', employeeName: 'Alice', department: 'Frontend', skillId: 'skill-001', skillName: 'Angular', selfRating: 3, status: 'Pending', submittedDate: '2026-01-20', certificationId: null, hasCertification: false, hasProjectExperience: false, peerValidationStatus: null, peerRating: null },
  { submissionId: 'sub-002', userId: 'u006', employeeName: 'Bob', department: 'Backend', skillId: 'skill-007', skillName: 'Node.js', selfRating: 4, status: 'Pending', submittedDate: '2026-01-22', certificationId: null, hasCertification: false, hasProjectExperience: false, peerValidationStatus: null, peerRating: null },
];

const stateWithData: TeamState = {
  ...initialTeamState,
  employees: mockManagers,
  validationQueue: mockQueue,
};

describe('Team Selectors', () => {

  describe('selectTeamMembers', () => {
    it('should select all employees from state', () => {
      const result = selectTeamMembers({ team: stateWithData });
      expect(result.length).toBe(2);
    });
  });

  describe('selectValidationQueue', () => {
    it('should select all queue items from state', () => {
      const result = selectValidationQueue({ team: stateWithData });
      expect(result.length).toBe(2);
    });
  });

  describe('selectPeerValidationWithExpiry', () => {
    it('should project status as expired when awaiting_responses + >7 days + <2 responses', () => {
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const expiredRequest: PeerValidationRequest = {
        id: 'pv-001',
        submissionId: 'sub-001',
        requesterId: 'u001',
        skillId: 'skill-001',
        selectedPeerIds: ['u002', 'u003'],
        status: 'awaiting_responses',
        createdDate: oldDate,
        responses: [{ peerId: 'u002', rating: 3, comment: null, responseDate: '2026-01-21' }],
      };
      const state: TeamState = { ...initialTeamState, peerValidations: [expiredRequest] };
      const result = selectPeerValidationWithExpiry({ team: state });
      expect(result[0].status).toBe('expired');
    });

    it('should NOT mark as expired when responses >= 2', () => {
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const completedRequest: PeerValidationRequest = {
        id: 'pv-002',
        submissionId: 'sub-002',
        requesterId: 'u006',
        skillId: 'skill-007',
        selectedPeerIds: ['u002', 'u003'],
        status: 'awaiting_responses',
        createdDate: oldDate,
        responses: [
          { peerId: 'u002', rating: 3, comment: null, responseDate: '2026-01-21' },
          { peerId: 'u003', rating: 4, comment: null, responseDate: '2026-01-22' },
        ],
      };
      const state: TeamState = { ...initialTeamState, peerValidations: [completedRequest] };
      const result = selectPeerValidationWithExpiry({ team: state });
      expect(result[0].status).toBe('awaiting_responses');
    });

    it('should NOT mark as expired when within 7 days', () => {
      const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const recentRequest: PeerValidationRequest = {
        id: 'pv-003',
        submissionId: 'sub-003',
        requesterId: 'u001',
        skillId: 'skill-001',
        selectedPeerIds: ['u002', 'u003'],
        status: 'awaiting_responses',
        createdDate: recentDate,
        responses: [],
      };
      const state: TeamState = { ...initialTeamState, peerValidations: [recentRequest] };
      const result = selectPeerValidationWithExpiry({ team: state });
      expect(result[0].status).toBe('awaiting_responses');
    });
  });
});
