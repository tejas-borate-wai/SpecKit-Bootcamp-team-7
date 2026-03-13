import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectsState } from './projects.state';
import { Project } from '../../../shared/models/project.model';
import { AvailabilityStatus } from '../../../shared/models/availability.model';

export const selectProjectsState = createFeatureSelector<ProjectsState>('projects');

export const selectAllProjects = createSelector(
  selectProjectsState,
  (state) => state.projects
);

export const selectProjectsByStatus = (status: string) => createSelector(
  selectAllProjects,
  (projects) => projects.filter((p) => p.status === status)
);

export const selectSelectedProjectId = createSelector(
  selectProjectsState,
  (state) => state.selectedProjectId
);

export const selectSelectedProject = createSelector(
  selectAllProjects,
  selectSelectedProjectId,
  (projects, id) => (id ? projects.find((p) => p.projectId === id) ?? null : null)
);

export const selectAssignments = createSelector(
  selectProjectsState,
  (state) => state.assignments
);

export const selectAssignmentsByProject = (projectId: string) => createSelector(
  selectAssignments,
  (assignments) => assignments.filter((a) => a.projectId === projectId)
);

export const selectMatchResults = createSelector(
  selectProjectsState,
  (state) => state.matchResults
);

export const selectMatchFilters = createSelector(
  selectProjectsState,
  (state) => state.filters
);

export const selectFilteredMatchResults = createSelector(
  selectMatchResults,
  selectMatchFilters,
  (results, filters) => {
    return results.filter((r) => {
      if (filters.department && r.department !== filters.department) return false;
      if (filters.availability && r.availability !== filters.availability) return false;
      if (r.matchScore < filters.minimumMatchScore) return false;
      return true;
    });
  }
);

export const selectSkillGaps = createSelector(
  selectProjectsState,
  (state) => state.skillGaps
);

export const selectProjectsLoading = createSelector(
  selectProjectsState,
  (state) => state.loading
);

export const selectProjectsError = createSelector(
  selectProjectsState,
  (state) => state.error
);

export const selectProjectAlignmentEntries = createSelector(
  selectProjectsState,
  (state) => {
    // Returns raw state; full join is done in the service
    return {
      assignments: state.assignments,
      overrides: state.availabilityOverrides,
    };
  }
);

export const selectAvailabilityForUser = (userId: string) => createSelector(
  selectAssignments,
  selectProjectsState,
  (assignments, state): AvailabilityStatus => {
    // Check for a manual override first
    const override = state.availabilityOverrides
      .slice()
      .reverse()
      .find((o) => o.userId === userId);
    if (override) return override.newStatus;
    // Derive from active assignment
    const hasActive = assignments.some((a) => a.userId === userId);
    return hasActive ? 'Busy' : 'Available';
  }
);
