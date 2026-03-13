import { SkillExam } from '../../../shared/models/skill-exam.model';
import { AssessmentAttempt } from '../../../shared/models/assessment-attempt.model';

export interface ActiveAssessmentState {
  skillId: string;
  exam: SkillExam;
  shuffledQuestionIds: string[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timerDeadline: number;
  timerRemaining: number;
  submitted: boolean;
}

export interface AssessmentsState {
  exams: SkillExam[];
  attempts: AssessmentAttempt[];
  examsLoading: boolean;
  attemptsLoading: boolean;
  error: string | null;
  activeAssessment: ActiveAssessmentState | null;
  lastSubmittedAttempt: AssessmentAttempt | null;
  hasCertificationBonus: boolean;
  hasProjectExperienceBonus: boolean;
}

export const initialAssessmentsState: AssessmentsState = {
  exams: [],
  attempts: [],
  examsLoading: false,
  attemptsLoading: false,
  error: null,
  activeAssessment: null,
  lastSubmittedAttempt: null,
  hasCertificationBonus: false,
  hasProjectExperienceBonus: false,
};
