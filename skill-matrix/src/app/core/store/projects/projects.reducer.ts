import { createReducer, on } from '@ngrx/store';
import { ProjectsActions } from './projects.actions';
import { initialProjectsState } from './projects.state';

export const projectsReducer = createReducer(
  initialProjectsState,

  // Load Projects
  on(ProjectsActions.loadProjects, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.loadProjectsSuccess, (state, { projects }) => ({
    ...state,
    projects,
    loading: false,
  })),
  on(ProjectsActions.loadProjectsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load Project Detail
  on(ProjectsActions.loadProjectDetail, (state, { projectId }) => ({
    ...state,
    selectedProjectId: projectId,
    loading: true,
    error: null,
  })),
  on(ProjectsActions.loadProjectDetailSuccess, (state, { project }) => {
    const exists = state.projects.some((p) => p.projectId === project.projectId);
    return {
      ...state,
      projects: exists
        ? state.projects.map((p) => (p.projectId === project.projectId ? project : p))
        : [...state.projects, project],
      loading: false,
    };
  }),
  on(ProjectsActions.loadProjectDetailFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Project
  on(ProjectsActions.createProject, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.createProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
    loading: false,
  })),
  on(ProjectsActions.createProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Project
  on(ProjectsActions.updateProject, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.updateProjectSuccess, (state, { project }) => ({
    ...state,
    projects: state.projects.map((p) =>
      p.projectId === project.projectId ? project : p
    ),
    loading: false,
  })),
  on(ProjectsActions.updateProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Project
  on(ProjectsActions.deleteProject, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.deleteProjectSuccess, (state, { projectId }) => ({
    ...state,
    projects: state.projects.filter((p) => p.projectId !== projectId),
    assignments: state.assignments.filter((a) => a.projectId !== projectId),
    selectedProjectId: state.selectedProjectId === projectId ? null : state.selectedProjectId,
    loading: false,
  })),
  on(ProjectsActions.deleteProjectFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Complete Project
  on(ProjectsActions.completeProjectSuccess, (state, { projectId }) => ({
    ...state,
    projects: state.projects.map((p) =>
      p.projectId === projectId ? { ...p, status: 'Completed' as const } : p
    ),
  })),

  // Load Assignments
  on(ProjectsActions.loadAssignments, (state) => ({ ...state, loading: true, error: null })),
  on(ProjectsActions.loadAssignmentsSuccess, (state, { assignments }) => ({
    ...state,
    assignments,
    loading: false,
  })),
  on(ProjectsActions.loadAssignmentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Assign to Project
  on(ProjectsActions.assignToProjectSuccess, (state, { assignment }) => ({
    ...state,
    assignments: [...state.assignments, assignment],
  })),
  on(ProjectsActions.assignToProjectFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Remove Assignment
  on(ProjectsActions.removeAssignmentSuccess, (state, { assignmentId }) => ({
    ...state,
    assignments: state.assignments.filter((a) => a.assignmentId !== assignmentId),
  })),

  // Run Matching
  on(ProjectsActions.runMatching, (state) => ({ ...state, loading: true, matchResults: [] })),
  on(ProjectsActions.runMatchingSuccess, (state, { results }) => ({
    ...state,
    matchResults: results,
    loading: false,
  })),
  on(ProjectsActions.runMatchingFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Detect Skill Gaps
  on(ProjectsActions.detectSkillGapsSuccess, (state, { gaps }) => ({
    ...state,
    skillGaps: gaps,
  })),

  // Filters
  on(ProjectsActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
  })),

  // Select Project
  on(ProjectsActions.selectProject, (state, { projectId }) => ({
    ...state,
    selectedProjectId: projectId,
    matchResults: [],
    skillGaps: [],
  })),

  // Override Availability
  on(ProjectsActions.overrideAvailabilitySuccess, (state, { userId, previousStatus, newStatus, reason }) => ({
    ...state,
    availabilityOverrides: [
      ...state.availabilityOverrides,
      {
        userId,
        previousStatus,
        newStatus,
        reason,
        overriddenBy: '',
        overrideDate: new Date().toISOString(),
      },
    ],
  }))
);
