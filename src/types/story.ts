export type SupportLevel = 1 | 2 | 3;
export type HintLevel = 1 | 2 | 3;

export type AppScreen =
  | 'start'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'records'
  | 'teacher';

export interface TopicScene {
  id: string;
  scenarioNumber: number;
  title: string;
  subtitle: string;
  beginning: string;
  problem: string;
  endingIdea: string;
  imageUrl: string;
  imageAlt: string;
  scenePromptQuestion: string;
  level1Frames: string[];
  level2Keywords: {
    questions: string[];
    vocabulary: string[];
  };
  level3Connectors: string[];
  sampleParagraph: string;
  fallbackHint: CoachFeedback;
}

export interface WritingPlan {
  who: string;
  where: string;
  whatHappened: string;
  howFelt: string;
  whatNext: string;
  howEnded: string;
}

export interface CoachFeedback {
  focusCategory: string;
  targetSentence: string;
  praise: string;
  fix: string;
  explanation: string;
  question: string;
  whyExplanation: string;
  hint2: string;
  hint3Pattern: string;
  hint3Example: string;
  koreanHelp: {
    praise: string;
    fix: string;
    explanation: string;
    question: string;
    whyExplanation: string;
    hint1: string;
    hint2: string;
    hint3: string;
  };
  isUncertain?: boolean;
  usedFallback?: boolean;
}

export interface RevisionCheckResult {
  fixed: boolean;
  encouragement: string;
  nextLevel: SupportLevel;
  levelChangeReason: 'up' | 'down' | 'same';
}

export interface StoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  topicId: string;
  topicTitle: string;
  supportLevel: SupportLevel;
  hintsUsed: number;
  maxHintLevel: HintLevel;
  firstDraft: string;
  finalDraft: string;
  reflectionNote: string;
  aiHelpSummary: string;
  feedbackFocus?: string;
  whyOpened?: boolean;
  koreanHelpUsed?: boolean;
}
