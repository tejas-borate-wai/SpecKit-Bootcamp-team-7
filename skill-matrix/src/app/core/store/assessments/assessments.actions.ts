import { createAction, props } from '@ngrx/store';
import { SkillExam } from '../../shared/models/skill-exam.model';
import { AssessmentAttempt } from '../../shared/models/assessment-attempt.model';

// Load all exams
export const loadExams = createAction('[Assessments] Load Exams');
export const loadExamsSuccess = createAction(
  '[Assessments] Load Exams Success',
  props<{ exams: SkillExam[] }>()
);
export const loadExamsFailure = createAction(
  '[Assessments] Load Exams Failure',
  props<{ error: string }>()
);

// Load attempts for current user
export const loadAttempts = createAction('[Assessments] Load Attempts');
export const loadAttemptsSuccess = createAction(
  '[Assessments] Load Attempts Success',
  props<{ attempts: AssessmentAttempt[] }>()
);
export const loadAttemptsFailure = createAction(
  '[Assessments] Load Attempts Failure',
  props<{ error: string }>()
);

// Start an assessment
export const startAssessment = createAction(
  '[Assessments] Start Assessment',
  props<{ skillId: string }>()
);
export const assessmentLoaded = createAction(
  '[Assessments] Assessment Loaded',
  props<{
    skillId: string;
    exam: SkillExam;
    shuffledQuestionIds: string[];
    timerDeadline: number;
  }>()
);
export const startAssessmentFailure = createAction(
  '[Assessments] Start Assessment Failure',
  props<{ error: string }>()
);

// Navigation
export const nextQuestion = createAction('[Assessments] Next Question');
export const previousQuestion = createAction('[Assessments] Previous Question');

// Answer selection
export const selectAnswer = createAction(
  '[Assessments] Select Answer',
  props<{ questionId: string; answer: string }>()
);

// Timer
export const timerTick = createAction(
  '[Assessments] Timer Tick',
  props<{ remaining: number }>()
);
export const timerExpired = createAction('[Assessments] Timer Expired');

// Submit
export const submitAssessment = createAction('[Assessments] Submit Assessment');
export const assessmentSubmitted = createAction(
  '[Assessments] Assessment Submitted',
  props<{
    attempt: AssessmentAttempt;
    hasCertificationBonus: boolean;
    hasProjectExperienceBonus: boolean;
  }>()
);
export const submitAssessmentFailure = createAction(
  '[Assessments] Submit Assessment Failure',
  props<{ error: string }>()
);

// Clear active assessment
export const clearActiveAssessment = createAction(
  '[Assessments] Clear Active Assessment'
);
