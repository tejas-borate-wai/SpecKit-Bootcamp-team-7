export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  skillsCount: number;
  avgRating: number;
  profileCompletion: number;
  pendingSubmissions: number;
}

export interface EmployeeSkillProfile {
  userId: string;
  name: string;
  email: string;
  department: string;
  avatarUrl: string;
  skills: EmployeeSkillView[];
}

export interface EmployeeSkillView {
  skillId: string;
  skillName: string;
  categoryName: string;
  selfRating: number;
  managerRating: number | null;
  peerRating: number | null;
  systemRating: number | null;
  finalRating: number | null;
  level: string | null;
  status: string;
  lastUpdated: string;
  sourceCount: number;
  confidence: string;
}
