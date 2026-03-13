import { TeamMember, EmployeeSkillProfile } from '../../../shared/models/team-member.model';
import { ValidationQueueItem, SubmissionDetail } from '../../../shared/models/skill-submission.model';
import { PeerValidationRequest, EligiblePeer } from '../../../shared/models/peer-validation.model';

export interface TeamState {
  employees: TeamMember[];
  selectedEmployee: EmployeeSkillProfile | null;
  validationQueue: ValidationQueueItem[];
  selectedSubmission: SubmissionDetail | null;
  peerValidations: PeerValidationRequest[];
  eligiblePeers: EligiblePeer[];
  loading: boolean;
  error: string | null;
}

export const initialTeamState: TeamState = {
  employees: [],
  selectedEmployee: null,
  validationQueue: [],
  selectedSubmission: null,
  peerValidations: [],
  eligiblePeers: [],
  loading: false,
  error: null,
};
