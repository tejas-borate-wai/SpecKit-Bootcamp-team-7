export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface ExamQuestion {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  difficultyLevel: DifficultyLevel;
}

export interface SkillExam {
  skillId: string;
  questions: ExamQuestion[];
}
