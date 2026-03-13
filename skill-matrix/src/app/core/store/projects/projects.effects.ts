import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, switchMap, tap, withLatestFrom, forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectsActions } from './projects.actions';
import { selectAllProjects } from './projects.selectors';
import { ProjectService } from '../../services/project.service';
import { CandidateMatchingService } from '../../services/candidate-matching.service';
import { SkillGapService } from '../../services/skill-gap.service';
import { AvailabilityService } from '../../services/availability.service';
import { SkillService } from '../../services/skill.service';
import { TeamService } from '../../services/team.service';
import { SkillLibraryService } from '../../services/skill-library.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Project } from '../../../shared/models/project.model';

// ── Load Projects ─────────────────────────────────────────────────────────────

export const loadProjectsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.loadProjects),
      switchMap(() =>
        projectService.getAll().pipe(
          map((projects) => ProjectsActions.loadProjectsSuccess({ projects })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.loadProjectsFailure({ error: err.error?.message ?? 'Failed to load projects.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Load Project Detail ───────────────────────────────────────────────────────

export const loadProjectDetailEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.loadProjectDetail),
      switchMap(({ projectId }) =>
        projectService.getById(projectId).pipe(
          map((project) => ProjectsActions.loadProjectDetailSuccess({ project })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.loadProjectDetailFailure({ error: err.error?.message ?? 'Failed to load project.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Create Project ─────────────────────────────────────────────────────────────

export const createProjectEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.createProject),
      switchMap(({ project }) =>
        projectService.create(project).pipe(
          map((created) => ProjectsActions.createProjectSuccess({ project: created })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.createProjectFailure({ error: err.error?.message ?? err.error?.error ?? 'Failed to create project.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Update Project ─────────────────────────────────────────────────────────────

export const updateProjectEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.updateProject),
      switchMap(({ projectId, changes }) =>
        projectService.update(projectId, changes).pipe(
          map((project) => ProjectsActions.updateProjectSuccess({ project })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.updateProjectFailure({ error: err.error?.message ?? err.error?.error ?? 'Failed to update project.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Delete Project ─────────────────────────────────────────────────────────────

export const deleteProjectEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.deleteProject),
      switchMap(({ projectId }) =>
        projectService.delete(projectId).pipe(
          map(({ projectId: id }) => ProjectsActions.deleteProjectSuccess({ projectId: id })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.deleteProjectFailure({ error: err.error?.message ?? err.error?.error ?? 'Failed to delete project.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Complete Project ───────────────────────────────────────────────────────────

export const completeProjectEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    const store = inject(Store);
    return actions$.pipe(
      ofType(ProjectsActions.completeProject),
      withLatestFrom(store.select(selectAllProjects)),
      switchMap(([{ projectId }, _projects]) =>
        projectService.update(projectId, { status: 'Completed' }).pipe(
          map((project: Project) => {
            const freedUserIds: string[] = [];
            return ProjectsActions.completeProjectSuccess({ projectId: project.projectId, freedUserIds });
          }),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.completeProjectFailure({ error: err.error?.message ?? 'Failed to complete project.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Load Assignments ───────────────────────────────────────────────────────────

export const loadAssignmentsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.loadAssignments),
      switchMap(() =>
        projectService.getAssignments().pipe(
          map((assignments) => ProjectsActions.loadAssignmentsSuccess({ assignments })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.loadAssignmentsFailure({ error: err.error?.message ?? 'Failed to load assignments.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Assign To Project ──────────────────────────────────────────────────────────

export const assignToProjectEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.assignToProject),
      switchMap(({ projectId, userId, role }) =>
        projectService.assign(projectId, userId, role).pipe(
          map((assignment) => ProjectsActions.assignToProjectSuccess({ assignment })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.assignToProjectFailure({ error: err.error?.message ?? err.error?.error ?? 'Failed to assign employee.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Remove Assignment ──────────────────────────────────────────────────────────

export const removeAssignmentEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    return actions$.pipe(
      ofType(ProjectsActions.removeAssignment),
      switchMap(({ assignmentId }) =>
        projectService.removeAssignment(assignmentId).pipe(
          map(() => ProjectsActions.removeAssignmentSuccess({ assignmentId })),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.removeAssignmentFailure({ error: err.error?.message ?? 'Failed to remove assignment.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Run Matching ───────────────────────────────────────────────────────────────

export const runMatchingEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    const skillService = inject(SkillService);
    const teamService = inject(TeamService);
    const matchingService = inject(CandidateMatchingService);
    return actions$.pipe(
      ofType(ProjectsActions.runMatching),
      switchMap(({ projectId }) =>
        forkJoin({
          projects: projectService.getAll(),
          allSkills: skillService.getAllEmployeeSkills(),
          users: teamService.getTeamMembers(),
        }).pipe(
          map(({ projects, allSkills, users }) => {
            const project = projects.find((p) => p.projectId === projectId);
            if (!project) {
              return ProjectsActions.runMatchingFailure({ error: 'Project not found.' });
            }
            const results = matchingService.rankCandidates(project, allSkills, users);
            return ProjectsActions.runMatchingSuccess({ results });
          }),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.runMatchingFailure({ error: err.error?.message ?? 'Failed to run matching.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Detect Skill Gaps ──────────────────────────────────────────────────────────

export const detectSkillGapsEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const projectService = inject(ProjectService);
    const skillService = inject(SkillService);
    const teamService = inject(TeamService);
    const libraryService = inject(SkillLibraryService);
    const skillGapService = inject(SkillGapService);
    return actions$.pipe(
      ofType(ProjectsActions.detectSkillGaps),
      switchMap(({ projectId }) =>
        forkJoin({
          projects: projectService.getAll(),
          allSkills: skillService.getAllEmployeeSkills(),
          users: teamService.getTeamMembers(),
          definitions: libraryService.getDefinitions(),
        }).pipe(
          map(({ projects, allSkills, users, definitions }) => {
            const project = projects.find((p) => p.projectId === projectId);
            if (!project) {
              return ProjectsActions.detectSkillGapsFailure({ error: 'Project not found.' });
            }
            const gaps = skillGapService.detectSkillGaps(project, allSkills, users, definitions);
            return ProjectsActions.detectSkillGapsSuccess({ gaps });
          }),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.detectSkillGapsFailure({ error: err.error?.message ?? 'Failed to detect skill gaps.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Override Availability ──────────────────────────────────────────────────────

export const overrideAvailabilityEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const availabilityService = inject(AvailabilityService);
    return actions$.pipe(
      ofType(ProjectsActions.overrideAvailability),
      switchMap(({ userId, newStatus, reason }) =>
        availabilityService.override(userId, newStatus, reason).pipe(
          map(() =>
            ProjectsActions.overrideAvailabilitySuccess({
              userId,
              previousStatus: 'Available',
              newStatus,
              reason,
            })
          ),
          catchError((err: HttpErrorResponse) =>
            of(ProjectsActions.overrideAvailabilityFailure({ error: err.error?.message ?? 'Failed to override availability.' }))
          )
        )
      )
    );
  },
  { functional: true }
);

// ── Toast Notifications ────────────────────────────────────────────────────────

export const projectCreatedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.createProjectSuccess),
      tap(() => toast.showSuccess('Project created successfully.'))
    );
  },
  { functional: true, dispatch: false }
);

export const projectCreateFailedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.createProjectFailure),
      tap(({ error }) => toast.showError(error))
    );
  },
  { functional: true, dispatch: false }
);

export const projectDeletedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.deleteProjectSuccess),
      tap(() => toast.showSuccess('Project deleted.'))
    );
  },
  { functional: true, dispatch: false }
);

export const projectDeleteFailedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.deleteProjectFailure),
      tap(({ error }) => toast.showError(error))
    );
  },
  { functional: true, dispatch: false }
);

export const assignedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.assignToProjectSuccess),
      tap(() => toast.showSuccess('Employee assigned to project.'))
    );
  },
  { functional: true, dispatch: false }
);

export const assignFailedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.assignToProjectFailure),
      tap(({ error }) => toast.showError(error))
    );
  },
  { functional: true, dispatch: false }
);

export const availabilityOverriddenToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.overrideAvailabilitySuccess),
      tap(() => toast.showSuccess('Availability updated.'))
    );
  },
  { functional: true, dispatch: false }
);

export const availabilityOverrideFailedToastEffect = createEffect(
  () => {
    const actions$ = inject(Actions);
    const toast = inject(ToastService);
    return actions$.pipe(
      ofType(ProjectsActions.overrideAvailabilityFailure),
      tap(({ error }) => toast.showError(error))
    );
  },
  { functional: true, dispatch: false }
);
