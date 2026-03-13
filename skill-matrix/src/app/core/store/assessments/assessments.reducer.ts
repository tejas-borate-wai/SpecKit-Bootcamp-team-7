import { createReducer, on } from '@ngrx/store';
import { initialAssessmentsState } from './assessments.state';
import * as AssessmentsActions from './assessments.actions';

export const assessmentsReducer = createReducer(
  initialAssessmentsState,

  // Load exams
  on(AssessmentsActions.loadExams, (state) => ({
    ...state,
    examsLoading: true,
    error: null,
  })),
  on(AssessmentsActions.loadExamsSuccess, (state, { exams }) => ({
    ...state,
    exams,
    examsLoading: false,
  })),
  on(AssessmentsActions.loadExamsFailure, (state, { error }) => ({
    ...state,
    examsLoading: false,
    error,
  })),

  // Load attempts
  on(AssessmentsActions.loadAttempts, (state) => ({
    ...state,
    attemptsLoading: true,
    error: null,
  })),
  on(AssessmentsActions.loadAttemptsSuccess, (state, { attempts }) => ({
    ...state,
    attempts,
    attemptsLoading: false,
  })),
  on(AssessmentsActions.loadAttemptsFailure, (state, { error }) => ({
    ...state,
    attemptsLoading: false,
    error,
  })),

  // Start assessment
  on(AssessmentsActions.startAssessment, (state) => ({
    ...state,
    error: null,
  })),
  on(
    AssessmentsActions.assessmentLoaded,
    (state, { skillId, exam, shuffledQuestionIds, timerDeadline }) => ({
      ...state,
      activeAssessment: {
        skillId,
        exam,
        shuffledQuestionIds,
        currentQuestionIndex: 0,
        answers: {},
        timerDeadline,
        timerRemaining: 900,
        submitted: false,
      },
      lastSubmittedAttempt: null,
      hasCertificationBonus: false,
      hasProjectExperienceBonus: false,
    })
  ),
  on(AssessmentsActions.startAssessmentFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Navigation
  on(AssessmentsActions.nextQuestion, (state) => {
    if (!state.activeAssessment) return state;
    const next = Math.min(
      state.activeAssessment.currentQuestionIndex + 1,
      state.activeAssessment.shuffledQuestionIds.length - 1
    );
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        currentQuestionIndex: next,
      },
    };
  }),
  on(AssessmentsActions.previousQuestion, (state) => {
    if (!state.activeAssessment) return state;
    const prev = Math.max(
      state.activeAssessment.currentQuestionIndex - 1,
      0
    );
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        currentQuestionIndex: prev,
      },
    };
  }),

  // Answer selection
  on(AssessmentsActions.selectAnswer, (state, { questionId, answer }) => {
    if (!state.activeAssessment) return state;
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        answers: {
          ...state.activeAssessment.answers,
          [questionId]: answer,
        },
      },
    };
  }),

  // Timer
  on(AssessmentsActions.timerTick, (state, { remaining }) => {
    if (!state.activeAssessment) return state;
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        timerRemaining: remaining,
      },
    };
  }),
  on(AssessmentsActions.timerExpired, (state) => {
    if (!state.activeAssessment) return state;
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        timerRemaining: 0,
        submitted: true,
      },
    };
  }),

  // Submit
  on(AssessmentsActions.submitAssessment, (state) => {
    if (!state.activeAssessment) return state;
    return {
      ...state,
      activeAssessment: {
        ...state.activeAssessment,
        submitted: true,
      },
    };
  }),
  on(
    AssessmentsActions.assessmentSubmitted,
    (state, { attempt, hasCertificationBonus, hasProjectExperienceBonus }) => ({
      ...state,
      attempts: [...state.attempts, attempt],
      lastSubmittedAttempt: attempt,
      hasCertificationBonus,
      hasProjectExperienceBonus,
    })
  ),
  on(AssessmentsActions.submitAssessmentFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Clear active assessment
  on(AssessmentsActions.clearActiveAssessment, (state) => ({
    ...state,
    activeAssessment: null,
  }))
);
