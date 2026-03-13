export interface ManagerAssessment {
  submissionId: string;
  managerId: string;
  managerRating: number;
  comment: string | null;
  assessmentDate: string;
  action: 'approve' | 'reject';
}
