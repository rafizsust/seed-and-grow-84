// Types for AI Practice feature

export type PracticeModule = 'reading' | 'listening';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Reading question types
export type ReadingQuestionType = 
  | 'TRUE_FALSE_NOT_GIVEN'
  | 'MULTIPLE_CHOICE'
  | 'FILL_IN_BLANK'
  | 'MATCHING_HEADINGS'
  | 'MATCHING_INFORMATION'
  | 'SENTENCE_COMPLETION'
  | 'SUMMARY_COMPLETION';

// Listening question types  
export type ListeningQuestionType =
  | 'FILL_IN_BLANK'
  | 'MULTIPLE_CHOICE_SINGLE'
  | 'MULTIPLE_CHOICE_MULTIPLE'
  | 'MATCHING_CORRECT_LETTER'
  | 'TABLE_COMPLETION';

export type QuestionType = ReadingQuestionType | ListeningQuestionType;

// Question counts based on question type
export const QUESTION_COUNTS: Record<string, number> = {
  'TRUE_FALSE_NOT_GIVEN': 5,
  'MULTIPLE_CHOICE': 4,
  'FILL_IN_BLANK': 6,
  'MATCHING_HEADINGS': 5,
  'MATCHING_INFORMATION': 5,
  'SENTENCE_COMPLETION': 4,
  'SUMMARY_COMPLETION': 5,
  'MULTIPLE_CHOICE_SINGLE': 4,
  'MULTIPLE_CHOICE_MULTIPLE': 3,
  'MATCHING_CORRECT_LETTER': 5,
  'TABLE_COMPLETION': 5,
};

// Default times based on question count
export const getDefaultTime = (questionCount: number): number => {
  // Roughly 1.5 minutes per question for reading, 1 minute for listening
  return Math.max(5, Math.ceil(questionCount * 1.5));
};

// Practice configuration
export interface PracticeConfig {
  module: PracticeModule;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  topicPreference?: string;
  timeMinutes: number;
  audioSpeed?: number; // For listening only
}

// Generated question structure
export interface GeneratedQuestion {
  id: string;
  question_number: number;
  question_text: string;
  question_type: string;
  correct_answer: string;
  explanation: string;
  options?: string[]; // For MCQ
  heading?: string;
}

// Generated question group
export interface GeneratedQuestionGroup {
  id: string;
  instruction: string;
  question_type: string;
  start_question: number;
  end_question: number;
  options?: {
    options?: string[];
    option_format?: string;
  };
  questions: GeneratedQuestion[];
}

// Generated reading passage
export interface GeneratedPassage {
  id: string;
  title: string;
  content: string;
  passage_number: number;
}

// Generated test structure
export interface GeneratedTest {
  id: string;
  module: PracticeModule;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  topic: string;
  timeMinutes: number;
  passage?: GeneratedPassage; // For reading
  audioBase64?: string; // For listening
  audioFormat?: string;
  sampleRate?: number;
  transcript?: string; // For listening
  questionGroups: GeneratedQuestionGroup[];
  totalQuestions: number;
  generatedAt: string;
}

// Practice result
export interface PracticeResult {
  testId: string;
  answers: Record<number, string>;
  score: number;
  totalQuestions: number;
  bandScore: number;
  completedAt: string;
  timeSpent: number; // seconds
  questionResults: QuestionResult[];
}

export interface QuestionResult {
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

// Local storage key
export const AI_PRACTICE_STORAGE_KEY = 'ai_practice_tests';
export const AI_PRACTICE_RESULTS_KEY = 'ai_practice_results';

// Helper to save/load from localStorage
export function saveGeneratedTest(test: GeneratedTest): void {
  const stored = localStorage.getItem(AI_PRACTICE_STORAGE_KEY);
  const tests: GeneratedTest[] = stored ? JSON.parse(stored) : [];
  // Keep only last 10 tests
  const updated = [test, ...tests.slice(0, 9)];
  localStorage.setItem(AI_PRACTICE_STORAGE_KEY, JSON.stringify(updated));
}

export function loadGeneratedTests(): GeneratedTest[] {
  const stored = localStorage.getItem(AI_PRACTICE_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function loadGeneratedTest(testId: string): GeneratedTest | null {
  const tests = loadGeneratedTests();
  return tests.find(t => t.id === testId) || null;
}

export function savePracticeResult(result: PracticeResult): void {
  const stored = localStorage.getItem(AI_PRACTICE_RESULTS_KEY);
  const results: PracticeResult[] = stored ? JSON.parse(stored) : [];
  const updated = [result, ...results.slice(0, 49)]; // Keep last 50 results
  localStorage.setItem(AI_PRACTICE_RESULTS_KEY, JSON.stringify(updated));
}

export function loadPracticeResults(): PracticeResult[] {
  const stored = localStorage.getItem(AI_PRACTICE_RESULTS_KEY);
  return stored ? JSON.parse(stored) : [];
}
