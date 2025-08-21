export type InterviewLevel = 'beginner' | 'intermediate' | 'advanced';

export interface BaseQuestion {
  question: string;
  type: 'text' | 'code';
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  answer: string;
}

export interface CodeQuestion extends BaseQuestion {
  type: 'code';
  codeSnippet: string;
  language: string;
  instructions: string;
  expectedOutput?: string;
}

export type Question = TextQuestion | CodeQuestion;

export interface InterviewConfig {
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  interviewLevel: InterviewLevel;
}

export interface AnswerRecord {
  question: string;
  userAns: string;
  type: 'text' | 'code';
  codeLanguage?: string;
  originalCode?: string;
  modifiedCode?: string;
  isVoiceAnswer?: boolean;
}

export function getQuestionCountRange(level: InterviewLevel): { min: number; max: number } {
  switch (level) {
    case 'beginner':
      return { min: 5, max: 8 };
    case 'intermediate':
      return { min: 8, max: 12 };
    case 'advanced':
      return { min: 10, max: 15 };
    default:
      return { min: 5, max: 8 };
  }
}

export function generateRandomQuestionCount(level: InterviewLevel): number {
  const { min, max } = getQuestionCountRange(level);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function predictInterviewLevel(jobPosition: string, jobDesc: string, jobExperience: string): InterviewLevel {
  const experience = parseInt(jobExperience) || 0;
  
  if (experience <= 2) {
    return 'beginner';
  } else if (experience <= 5) {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}
