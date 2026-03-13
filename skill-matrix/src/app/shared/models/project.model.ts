export type ProjectStatus = 'Draft' | 'Open' | 'In Progress' | 'Completed';

export type ProficiencyLevel = 1 | 2 | 3 | 4;

export interface RequiredSkill {
  skillId: string;
  minimumLevel: ProficiencyLevel;
}

export interface RoleSlot {
  roleTitle: string;
  headcount: number;
}

export interface Project {
  projectId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  requiredSkills: RequiredSkill[];
  requiredRoles: RoleSlot[];
  createdBy: string;
  createdDate: string;
}
