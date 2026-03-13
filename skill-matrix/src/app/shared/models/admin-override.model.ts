export interface AdminOverride {
  submissionId: string;
  adminId: string;
  overriddenRating: number;
  justification: string;
  overrideDate: string;
  previousFinalRating: number | null;
}
