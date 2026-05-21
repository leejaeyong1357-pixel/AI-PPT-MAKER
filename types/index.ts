export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type QuestionType = 1 | 2 | 3 | 4;

export type Difficulty = "easy" | "medium" | "hard";

export interface UserSettings {
  examDate: string;
  targetLevel: Level;
  currentLevel?: Level;
  hchatApiKey: string;
  hchatEndpoint: string;
  setupCompleted: boolean;
}

export interface StudyRecord {
  id: string;
  questionId: string;
  type: QuestionType;
  userAnswer: string;
  feedback?: AiFeedback;
  score?: number;
  bookmarked: boolean;
  noteText?: string;
  createdAt: number;
}

export interface AiFeedback {
  grammarIssues: string[];
  vocabularySuggestions: string[];
  betterExpressions: string[];
  modelAnswer: string;
  estimatedLevel: Level;
  scoreEstimate: number;
  strengths: string[];
  improvements: string[];
}

export interface VocabEntry {
  word: string;
  meaning: string;
  example: string;
  source: string;
  addedAt: number;
}

export interface MockExamResult {
  examId: string;
  startedAt: number;
  finishedAt: number;
  type1: { questionId: string; answer: string; feedback?: AiFeedback };
  type2: { questionId: string; answer: string; feedback?: AiFeedback };
  type3: { questionId: string; answer: string; feedback?: AiFeedback };
  type4: { questionId: string; answer: string; feedback?: AiFeedback };
  totalScore: number;
  estimatedLevel: Level;
}

export interface Type1Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  follow_ups: string[];
  keywords: string[];
  sample_answer: string;
}

export interface Type2Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  question: string;
  follow_ups: string[];
  arguments: Record<string, string[]>;
  sample_answer: string;
}

export interface Type3Item {
  id: string;
  subtype: string;
  category: string;
  difficulty: Difficulty;
  title?: string;
  chart?: {
    type: string;
    data: any[];
    unit?: string;
    x_label?: string;
    y_label?: string;
  };
  image_url?: string;
  image_description?: string;
  question: string;
  key_vocabulary?: string[];
  sample_answer: string;
}

export interface Type4Passage {
  id: string;
  category: string;
  difficulty: Difficulty;
  passage: string;
  key_points: string[];
  sample_summary: string;
}
