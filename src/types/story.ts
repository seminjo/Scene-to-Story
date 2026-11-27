export type SupportLevel = 1 | 2 | 3;

export type AppScreen =
  | 'start'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'checkAgain'
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
  fallbackFeedback: CoachFeedback;
}

export interface WritingPlan {
  who: string;
  where: string;
  whatHappened: string;
  howFelt: string;
  whatNext: string;
  howEnded: string;
}

export interface FeedbackPoint {
  id: string;
  category: string;
  summaryTag: string;
  yourSentence: string;
  thinkAbout: string;
  question: string;
  whyExplanation: string;
  koreanHelp: {
    thinkAbout: string;
    question: string;
    whyExplanation: string;
  };
}

export interface CoachFeedback {
  goodPoint: string;
  goodPointKorean: string;
  feedbackPoints: FeedbackPoint[];
  isUncertain?: boolean;
  usedFallback?: boolean;
}

export interface CheckAgainResult {
  improved: string[];
  remainingPointIds: string[];
  encouragement: string;
  nextLevel: SupportLevel;
}

export interface SavedFeedbackPointSummary {
  category: string;
  summaryTag: string;
  yourSentence: string;
  thinkAbout: string;
  question: string;
}

export interface StoryRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  topicId: string;
  topicTitle: string;
  supportLevel: SupportLevel;
  feedbackCount: number;
  feedbackPoints: SavedFeedbackPointSummary[];
  firstDraft: string;
  finalDraft: string;
  reflectionNote: string;
  aiHelpSummary: string;
  whyOpened: boolean;
  koreanHelpUsed: boolean;
  checkAgainUsed: boolean;
}
