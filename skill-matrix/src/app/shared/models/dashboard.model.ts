import { EmployeeSkill, SkillProficiencyLevel } from './employee-skill.model';
import { SkillDefinition } from './skill-definition.model';
import { SkillCategory } from './skill-category.model';
import { AchievementBadge } from './achievement.model';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ── Employee Dashboard ───────────────────────────────────────────────────────

export interface EmployeeSkillView {
  skill: EmployeeSkill;
  definition: SkillDefinition;
  category: SkillCategory;
  isStale: boolean;
  hasCertification: boolean;
  percentage: number;
  level: SkillProficiencyLevel;
}

export interface SkillGapCard {
  skillDefinition: SkillDefinition;
  categoryName: string;
}

export interface CertificationAlert {
  certName: string;
  skillName: string;
  expiryDate: string;
  status: 'valid' | 'expiring-soon' | 'expired';
}

export interface ActivityItem {
  type: 'assessment' | 'certification' | 'skill-added' | 'skill-updated' | 'badge-earned';
  description: string;
  date: string;
}

export interface EmployeeDashboardData {
  myActiveSkills: EmployeeSkillView[];
  profileCompletion: number;
  skillGaps: SkillGapCard[];
  certificationAlerts: CertificationAlert[];
  recentActivity: ActivityItem[];
  achievements: AchievementBadge[];
}

// ── Manager Dashboard ────────────────────────────────────────────────────────

export interface TeamSkillSummary {
  categoryName: string;
  averageRating: number;
  employeeCount: number;
}

export interface IncompleteProfileItem {
  userId: string;
  userName: string;
  completionPercentage: number;
}

export interface ProjectMatchItem {
  projectName: string;
  matchPercentage: number;
}

export interface AvailabilityItem {
  userId: string;
  userName: string;
  status: 'Available' | 'Partially Available' | 'Busy';
}

export interface ManagerDashboardData {
  pendingApprovals: number;
  teamSkillStrength: TeamSkillSummary[];
  incompleteProfiles: IncompleteProfileItem[];
  staleSkillsCount: number;
  projectMatchRecommendations: ProjectMatchItem[];
  teamAvailability: AvailabilityItem[];
  recentTeamActivity: ActivityItem[];
}

// ── Admin Dashboard ──────────────────────────────────────────────────────────

export interface DepartmentGap {
  department: string;
  gapCount: number;
  totalSkills: number;
}

export interface SkillGapSummary {
  skillName: string;
  gapCount: number;
}

export interface RoleCount {
  role: 'Employee' | 'Manager' | 'Admin';
  count: number;
}

export interface AdminDashboardData {
  orgHealthScore: number;
  totalSkillsTracked: number;
  skillGapByDepartment: DepartmentGap[];
  certificationComplianceRate: number;
  mostCommonGaps: SkillGapSummary[];
  userCountByRole: RoleCount[];
}

// ── Chart Data ───────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChartSeries {
  name: string;
  series: ChartDataPoint[];
}
