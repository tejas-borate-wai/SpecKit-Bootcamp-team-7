import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Project } from '../../../shared/models/project.model';
import { ProjectAssignment } from '../../../shared/models/project-assignment.model';
import { CandidateMatchResult } from '../../../shared/models/candidate-match.model';
import { SkillGapResult } from '../../../shared/models/skill-gap.model';
import { AvailabilityStatus } from '../../../shared/models/availability.model';
import { MatchFilters } from './projects.state';

export const ProjectsActions = createActionGroup({
  source: 'Projects',
  events: {
    // Load
    'Load Projects': emptyProps(),
    'Load Projects Success': props<{ projects: Project[] }>(),
    'Load Projects Failure': props<{ error: string }>(),

    // Load Single Project
    'Load Project Detail': props<{ projectId: string }>(),
    'Load Project Detail Success': props<{ project: Project }>(),
    'Load Project Detail Failure': props<{ error: string }>(),

    // Create
    'Create Project': props<{ project: Omit<Project, 'projectId' | 'createdBy' | 'createdDate'> }>(),
    'Create Project Success': props<{ project: Project }>(),
    'Create Project Failure': props<{ error: string }>(),

    // Update
    'Update Project': props<{ projectId: string; changes: Partial<Project> }>(),
    'Update Project Success': props<{ project: Project }>(),
    'Update Project Failure': props<{ error: string }>(),

    // Delete
    'Delete Project': props<{ projectId: string }>(),
    'Delete Project Success': props<{ projectId: string }>(),
    'Delete Project Failure': props<{ error: string }>(),

    // Complete Project (auto-resets assigned employee availability)
    'Complete Project': props<{ projectId: string }>(),
    'Complete Project Success': props<{ projectId: string; freedUserIds: string[] }>(),
    'Complete Project Failure': props<{ error: string }>(),

    // Assignments
    'Load Assignments': emptyProps(),
    'Load Assignments Success': props<{ assignments: ProjectAssignment[] }>(),
    'Load Assignments Failure': props<{ error: string }>(),

    'Assign To Project': props<{ projectId: string; userId: string; role: string }>(),
    'Assign To Project Success': props<{ assignment: ProjectAssignment }>(),
    'Assign To Project Failure': props<{ error: string }>(),

    'Remove Assignment': props<{ assignmentId: string }>(),
    'Remove Assignment Success': props<{ assignmentId: string }>(),
    'Remove Assignment Failure': props<{ error: string }>(),

    // Candidate Matching
    'Run Matching': props<{ projectId: string }>(),
    'Run Matching Success': props<{ results: CandidateMatchResult[] }>(),
    'Run Matching Failure': props<{ error: string }>(),

    // Skill Gaps
    'Detect Skill Gaps': props<{ projectId: string }>(),
    'Detect Skill Gaps Success': props<{ gaps: SkillGapResult[] }>(),
    'Detect Skill Gaps Failure': props<{ error: string }>(),

    // Filters
    'Set Filters': props<{ filters: Partial<MatchFilters> }>(),

    // Select project
    'Select Project': props<{ projectId: string | null }>(),

    // Availability Override
    'Override Availability': props<{ userId: string; newStatus: AvailabilityStatus; reason: string }>(),
    'Override Availability Success': props<{ userId: string; previousStatus: AvailabilityStatus; newStatus: AvailabilityStatus; reason: string }>(),
    'Override Availability Failure': props<{ error: string }>(),
  },
});
