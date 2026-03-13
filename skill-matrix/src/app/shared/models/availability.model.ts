export type AvailabilityStatus = 'Available' | 'Partially Available' | 'Busy';

export interface AvailabilityOverride {
  userId: string;
  previousStatus: AvailabilityStatus;
  newStatus: AvailabilityStatus;
  reason: string;
  overriddenBy: string;
  overrideDate: string;
}

export interface ProjectAlignmentEntry {
  userId: string;
  employeeName: string;
  role: string;
  currentProject: string;
  status: AvailabilityStatus;
  since: string;
}
