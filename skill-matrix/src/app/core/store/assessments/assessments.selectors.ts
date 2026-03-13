import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AssessmentsState } from './assessments.state';
import {
  calculateWeightedScore,
  calculateSystemRating,
  mapScoreToLevel,
  calculateLevelChange,
} from '../../../shared/utils/scoring.util';
import { ScoreCard } from '../../../shared/models/score-card.model';
import { SkillProficiencyLevel } from '../../../shared/models/employee-skill.model';
import { ExamQuestion } from '../../../shared/models/skill-exam.model';

export const selectAssessmentsState =
  createFeatureSelector<AssessmentsState>('assessments');

export const selectExams = createSelector(
  selectAssessmentsState,
  (state) => state.exams
);

export const selectAttempts = createSelector(
  selectAssessmentsState,
  (state) => state.attempts
);

export const selectExamsLoading = createSelector(
  selectAssessmentsState,
  (state) => state.examsLoading
);

export const selectAttemptsLoading = createSelector(
  selectAssessmentsState,
  (state) => state.attemptsLoading
);

export const selectAssessmentsError = createSelector(
  selectAssessmentsState,
  (state) => state.error
);

export const selectActiveAssessment = createSelector(
  selectAssessmentsState,
  (state) => state.activeAssessment
);

export const selectCurrentQuestion = createSelector(
  selectActiveAssessment,
  (active) => {
    if (!active) return null;
    const qId =
      active.shuffledQuestionIds[active.currentQuestionIndex];
    return active.exam.questions.find((q: ExamQuestion) => q.questionId === qId) ?? null;
  }
);

export const selectSelectedAnswer = createSelector(
  selectActiveAssessment,
  (active) => {
    if (!active) return null;
    const qId =
      active.shuffledQuestionIds[active.currentQuestionIndex];
    return active.answers[qId] ?? null;
  }
);

export const selectProgress = createSelector(
  selectActiveAssessment,
  (active) => {
    if (!active) return { current: 0, total: 0 };
    return {
      current: active.currentQuestionIndex + 1,
      total: active.shuffledQuestionIds.length,
    };
  }
);

export const selectTimerRemaining = createSelector(
  selectActiveAssessment,
  (active) => active?.timerRemaining ?? null
);

// Returns AssessmentStatus for a given skill
export const selectAssessmentStatusBySkill = (skillId: string) =>
  createSelector(
    selectActiveAssessment,
    selectAttempts,
    (active, attempts): 'Not Attempted' | 'In Progress' | 'Completed' => {
      if (active?.skillId === skillId && !active.submitted) return 'In Progress';
      const has = attempts.some((a) => a.skillId === skillId);
      return has ? 'Completed' : 'Not Attempted';
    }
  );

// Returns true if the user can retake (no attempt in past 24h)
export const selectCanRetake = (skillId: string) =>
  createSelector(selectAttempts, (attempts): boolean => {
    const skillAttempts = attempts.filter((a) => a.skillId === skillId);
    if (skillAttempts.length === 0) return true;
    const latest = skillAttempts.reduce((a, b) =>
      new Date(a.date) > new Date(b.date) ? a : b
    );
    const elapsed = Date.now() - new Date(latest.date).getTime();
    return elapsed >= 24 * 60 * 60 * 1000;
  });

// Returns remaining cooldown in ms
export const selectCooldownRemaining = (skillId: string) =>
  createSelector(selectAttempts, (attempts): number => {
    const skillAttempts = attempts.filter((a) => a.skillId === skillId);
    if (skillAttempts.length === 0) return 0;
    const latest = skillAttempts.reduce((a, b) =>
      new Date(a.date) > new Date(b.date) ? a : b
    );
    const elapsed = Date.now() - new Date(latest.date).getTime();
    const cooldown = 24 * 60 * 60 * 1000;
    return Math.max(0, cooldown - elapsed);
  });

// ScoreCard selector derived from lastSubmittedAttempt + bonus flags
export const selectLastSubmittedAttempt = createSelector(
  selectAssessmentsState,
  (state) => state.lastSubmittedAttempt
);

export const selectHasCertificationBonus = createSelector(
  selectAssessmentsState,
  (state) => state.hasCertificationBonus
);

export const selectHasProjectExperienceBonus = createSelector(
  selectAssessmentsState,
  (state) => state.hasProjectExperienceBonus
);

export const selectScoreCard = createSelector(
  selectAssessmentsState,
  (state): ScoreCard | null => {
    const attempt = state.lastSubmittedAttempt;
    if (!attempt) return null;

    const { testScore, earnedPoints, maxPoints } = {
      testScore: attempt.score,
      earnedPoints: attempt.earnedPoints,
      maxPoints: attempt.maxPoints,
    };

    const hasCert = state.hasCertificationBonus;
    const hasProj = state.hasProjectExperienceBonus;
    const systemRating = calculateSystemRating(testScore, hasCert, hasProj);
    const level = mapScoreToLevel(systemRating);

    // Derive previous level from second-to-last attempt for the same skill
    const skillAttempts = state.attempts
      .filter((a) => a.skillId === attempt.skillId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    const prevAttempt =
      skillAttempts.length > 1 ? skillAttempts[1] : null;
    const previousLevel: SkillProficiencyLevel | null = prevAttempt
      ? mapScoreToLevel(calculateSystemRating(prevAttempt.score, false, false))
      : null;

    const { levelChanged, levelDirection } = calculateLevelChange(
      level,
      previousLevel
    );

    return {
      testScore,
      earnedPoints,
      maxPoints,
      certificationBonus: hasCert,
      projectExperienceBonus: hasProj,
      systemRating,
      finalRating: null,
      level,
      previousLevel,
      levelChanged,
      levelDirection,
    };
  }
);
