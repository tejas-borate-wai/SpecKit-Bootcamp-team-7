import { Project } from '../../../shared/models/project.model';
import { ProjectAssignment } from '../../../shared/models/project-assignment.model';
import { CandidateMatchResult } from '../../../shared/models/candidate-match.model';
import { SkillGapResult } from '../../../shared/models/skill-gap.model';
import { AvailabilityOverride, AvailabilityStatus } from '../../../shared/models/availability.model';

export interface MatchFilters {
  department: string | null;
  availability: AvailabilityStatus | null;
  minimumMatchScore: number;
}

export interface ProjectsState {
  projects: Project[];
  assignments: ProjectAssignment[];
  availabilityOverrides: AvailabilityOverride[];
  selectedProjectId: string | null;
  matchResults: CandidateMatchResult[];
  skillGaps: SkillGapResult[];
  filters: MatchFilters;
  loading: boolean;
  error: string | null;
}

export const initialProjectsState: ProjectsState = {
  projects: [],
  assignments: [],
  availabilityOverrides: [],
  selectedProjectId: null,
  matchResults: [],
  skillGaps: [],
  filters: {
    department: null,
    availability: null,
    minimumMatchScore: 0,
  },
  loading: false,
  error: null,
};
