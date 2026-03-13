export type SkillProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SkillStatus = 'Draft' | 'Pending' | 'Approved' | 'Stale';

export interface EmployeeSkill {
  skillId: string;
  selfRating: number | null;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: SkillProficiencyLevel;
  status: SkillStatus;
  lastUpdated: string;
  isDeleted: boolean;
}

export interface EmployeeSkillRecord {
  userId: string;
  skills: EmployeeSkill[];
}
