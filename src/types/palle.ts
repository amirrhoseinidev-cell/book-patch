export type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';
export type LearningGoal = 'principles' | 'literature' | 'discourse';
export type StudyTimeMinutes = number;

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  isPhoneVerified?: boolean;
  isDemo?: boolean;
  email?: string;
  avatarUrl: string;
  bio: string;
  joinDate: string;
  streakDays: number;
  activePathsCount: number;
  preferences: {
    dailyGoalMinutes: StudyTimeMinutes;
    defaultLevel: KnowledgeLevel;
    focusMode: boolean;
    aiTone: 'socratic' | 'explanatory' | 'concise' | 'storytelling';
    fontSize: 'normal' | 'large' | 'xlarge';
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  category: string;
  options: string[];
  correctIndex: number;
  mentorFeedback: string;
  wisdomPoints: number;
}

export interface StepQuiz {
  title: string;
  stepNumber: number;
  questions: QuizQuestion[];
}

export interface StepPassage {
  title: string;
  bookTitle: string;
  author: string;
  translator?: string;
  chapter: string;
  pageNumber: number;
  totalPages: number;
  estimatedMinutes: number;
  highlightQuote: string;
  paragraphs: string[];
  footnote?: {
    title: string;
    description: string;
    imageUrl?: string;
  };
}

export interface StepMicroSummary {
  mentorGreeting: string;
  coreIdea: string;
  keyPoints: string[];
  realWorldExample: string;
  quickReflection: string;
}

export interface LearningStep {
  id: string;
  pathId: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  category: string;
  level: KnowledgeLevel;
  durationMinutes: number;
  introDescription: string;
  podcastTitle: string;
  podcastDuration: string;
  microSummary?: StepMicroSummary;
  objectives: {
    id: string;
    title: string;
    description: string;
  }[];
  resourceRecommendation: {
    title: string;
    author: string;
    translator?: string;
    chapter: string;
    pageCount: number;
    estimatedMinutes: number;
    quote: string;
    quoteCitation: string;
    coverImage: string;
    affiliateUrl?: string;
    affiliateStore?: string;
    discountCode?: string;
    discountPercent?: number;
    priceNote?: string;
  };
  passage: StepPassage;
  quiz: StepQuiz;
  keyTakeaway: string;
  status: 'completed' | 'current' | 'available' | 'locked';
  startedAt?: string;
  completedAt?: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  goal: string;
  category: string;
  description: string;
  level: KnowledgeLevel;
  dailyMinutes: StudyTimeMinutes;
  totalSteps: number;
  currentStepIndex: number; // 0-based
  progressPercent: number;
  estimatedWeeks: number;
  steps: LearningStep[];
  weeklyFocus: string;
  heroImage: string;
  createdAt: string;
  updatedAt: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
  lastActivityAt?: string;
}

export interface BookItem {
  id: string;
  userId: string;
  title: string;
  author: string;
  translator?: string;
  coverImage: string;
  edition?: string;
  status: 'reading' | 'completed' | 'saved';
  progressPercent: number;
  currentPage: number;
  totalPages: number;
  pathId?: string;
  pathTitle?: string;
  notesCount: number;
  lastRead: string;
  summary?: string;
  passageText?: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  stepId?: string;
  stepTitle?: string;
  bookTitle?: string;
  quote?: string;
  text: string;
  createdAt: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citation?: string;
  timestamp: string;
  points?: number;
}

export type AchievementCategory = 'path' | 'streak' | 'quiz' | 'reading';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface AchievementBadge {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  wisdomPoints: number;
  mentorQuote?: string;
}

