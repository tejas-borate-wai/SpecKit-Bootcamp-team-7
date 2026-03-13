export type SubmissionStatus = 'Pending' | 'Approved' | 'Rejected';
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillSubmission {
  submissionId: string;
  userId: string;
  skillId: string;
  selfRating: number;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: ProficiencyLevel | null;
  status: SubmissionStatus;
  submittedDate: string;
  lastUpdated: string;
  rejectionReason: string | null;
  certificationId: string | null;
  projectExperience: string[];
}

export interface ValidationQueueItem {
  submissionId: string;
  userId: string;
  employeeName: string;
  department: string;
  skillId: string;
  skillName: string;
  selfRating: number;
  status: SubmissionStatus;
  submittedDate: string;
  certificationId: string | null;
  hasCertification: boolean;
  hasProjectExperience: boolean;
  peerValidationStatus: string | null;
  peerRating: number | null;
}

export interface SubmissionDetail {
  submissionId: string;
  userId: string;
  employeeName: string;
  department: string;
  avatarUrl: string;
  skillId: string;
  skillName: string;
  selfRating: number;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: ProficiencyLevel | null;
  confidence: 'High' | 'Medium' | 'Low' | null;
  status: SubmissionStatus;
  submittedDate: string;
  certification: {
    certId: string;
    certName: string;
    issuingOrg: string;
    issueDate: string;
    expiryDate: string;
    status: string;
  } | null;
  projectExperience: {
    projectId: string;
    projectName: string;
    role: string;
    status: string;
  }[];
  peerValidation: {
    status: string;
    responses: {
      peerId: string;
      peerName: string;
      rating: number;
      comment: string | null;
      responseDate: string;
    }[];
    averageRating: number | null;
  } | null;
}
