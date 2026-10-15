import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { UserProfile, LearningPath, LearningStep, BookItem, NoteItem, StudyTimeMinutes, AchievementBadge } from '../types/palle';
import {
  palleApi,
  getStoredToken,
  setStoredToken,
  DemoAccountInfo,
  SendOtpResponse,
  VerifyOtpResponse,
} from '../services/api';

export type AppView =
  | 'onboarding'
  | 'home'
  | 'create-topic'
  | 'create-level'
  | 'generating-path'
  | 'path-roadmap'
  | 'step-overview'
  | 'book-reader'
  | 'step-assessment'
  | 'step-celebration'
  | 'library'
  | 'profile'
  | 'achievements';

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

const GUEST_STORAGE_KEY = 'palle_guest_data';
const GUEST_FLAG_KEY = 'palle_is_guest';
const GUEST_PROMPT_KEY = 'palle_guest_prompt_dismissed';

interface PalleContextType {
  user: UserProfile | null;
  activePath: LearningPath | null;
  allPaths: LearningPath[];
  libraryBooks: BookItem[];
  notes: NoteItem[];
  currentView: AppView;
  previousView: AppView;
  currentStep: LearningStep | null;
  isAiChatOpen: boolean;
  isAddResourceOpen: boolean;
  toasts: ToastInfo[];
  isLoading: boolean;
  demoAccounts: DemoAccountInfo[];

  // Achievements & Badges
  achievements: AchievementBadge[];
  unlockedAchievementsCount: number;
  totalWisdomPoints: number;

  // Guest Mode & Prompt States
  isGuest: boolean;
  showSaveProgressModal: boolean;
  hasDismissedSavePrompt: boolean;
  startAsGuest: () => void;
  dismissSaveProgressModal: () => void;

  // Global Auth Modal controls
  isAuthModalOpen: boolean;
  authModalMode: 'register' | 'login';
  openAuthModal: (mode?: 'register' | 'login') => void;
  closeAuthModal: () => void;

  // Path creation draft state
  creationDraft: {
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    dailyMinutes: StudyTimeMinutes;
  };
  setCreationDraft: React.Dispatch<
    React.SetStateAction<{
      topic: string;
      level: 'beginner' | 'intermediate' | 'advanced';
      goal: string;
      dailyMinutes: StudyTimeMinutes;
    }>
  >;

  // Actions
  navigateTo: (view: AppView, options?: { step?: LearningStep; path?: LearningPath }) => void;
  goBack: () => void;
  openAiChat: () => void;
  closeAiChat: () => void;
  openAddResource: () => void;
  closeAddResource: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  startPath: (pathId: string) => Promise<void>;
  startStep: (pathId: string, stepId: string) => Promise<void>;
  completeCurrentStep: () => Promise<void>;
  submitStepQuiz: (score: number, maxScore: number, answers: number[]) => Promise<void>;
  generateNewPath: () => Promise<void>;
  addBookToLibrary: (book: Partial<BookItem>) => Promise<void>;
  addNote: (note: { text: string; quote?: string; bookTitle?: string; stepTitle?: string }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  sendOtp: (phone: string, name?: string, purpose?: 'login' | 'register') => Promise<SendOtpResponse>;
  verifyOtp: (phone: string, code: string, name?: string, avatarUrl?: string) => Promise<VerifyOtpResponse>;
  loginWithDemo: (demoId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const PalleContext = createContext<PalleContextType | undefined>(undefined);

export function PalleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePath, setActivePath] = useState<LearningPath | null>(null);
  const [allPaths, setAllPaths] = useState<LearningPath[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<BookItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [previousView, setPreviousView] = useState<AppView>('home');
  const [currentStep, setCurrentStep] = useState<LearningStep | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccountInfo[]>([]);

  // Guest Mode
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [hasDismissedSavePrompt, setHasDismissedSavePrompt] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_PROMPT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [showSaveProgressModal, setShowSaveProgressModal] = useState(false);

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'register' | 'login'>('register');

  const [creationDraft, setCreationDraft] = useState<{
    topic: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    goal: string;
    dailyMinutes: StudyTimeMinutes;
  }>({
    topic: 'فلسفه و منطق',
    level: 'beginner',
    goal: 'درک اصول و جهان‌بینی کلی',
    dailyMinutes: 15,
  });

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const openAuthModal = (mode: 'register' | 'login' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const dismissSaveProgressModal = () => {
    setShowSaveProgressModal(false);
    setHasDismissedSavePrompt(true);
    try {
      localStorage.setItem(GUEST_PROMPT_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const saveGuestStorage = (paths: LearningPath[], books: BookItem[], notesList: NoteItem[]) => {
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({
          paths,
          books,
          notes: notesList,
        })
      );
    } catch {
      // ignore
    }
  };

  // Dynamic Achievements & Milestones Engine (Rule-based tracking)
  const { achievements, unlockedAchievementsCount, totalWisdomPoints } = useMemo(() => {
    const completedPathsCount = allPaths.filter((p) => p.progressPercent >= 100).length;
    const totalCompletedSteps = allPaths.reduce(
      (acc, p) => acc + (p.steps ? p.steps.filter((s) => s.status === 'completed').length : 0),
      0
    );
    const streakDays = user?.streakDays || 0;
    const notesCount = notes.length;
    const booksCount = libraryBooks.length;
    const totalPathsCount = allPaths.length;

    const list: AchievementBadge[] = [
      {
        id: 'first-step',
        title: 'نخستین پله صعود',
        titleEn: 'First Step Completed',
        description: 'تکمیل موفقیت‌آمیز اولین پله از یک مسیر یادگیری و پاسخ به آزمون ادراکی',
        category: 'path',
        tier: 'bronze',
        icon: 'stairs',
        progress: Math.min(1, totalCompletedSteps),
        maxProgress: 1,
        isUnlocked: totalCompletedSteps >= 1,
        unlockedAt: totalCompletedSteps >= 1 ? 'پله نخست' : undefined,
        wisdomPoints: 50,
        mentorQuote: '«سفر هزار فرسنگی با گام نخست آغاز می‌شود.» — لائوتسه',
      },
      {
        id: 'first-path',
        title: 'پایان نخستین مسیر',
        titleEn: 'First Path Completed',
        description: 'تکمیل ۱۰۰ درصدی تمام پله‌های یک مسیر یادگیری جامع و صعود به قله تسلط',
        category: 'path',
        tier: 'gold',
        icon: 'emoji_events',
        progress: Math.min(1, completedPathsCount),
        maxProgress: 1,
        isUnlocked: completedPathsCount >= 1,
        unlockedAt: completedPathsCount >= 1 ? 'پایان دوره' : undefined,
        wisdomPoints: 250,
        mentorQuote: '«صعود بر قله دانایی، حاصل تداوم در صعود از تک‌تک پله‌هاست.»',
      },
      {
        id: 'streak-3',
        title: 'جرقه‌ی پیوستگی',
        titleEn: '3-Day Learning Spark',
        description: '۳ روز استمرار متوالی در مطالعه، حضور روزانه و تثبیت زنجیره یادگیری',
        category: 'streak',
        tier: 'bronze',
        icon: 'local_fire_department',
        progress: Math.min(3, streakDays),
        maxProgress: 3,
        isUnlocked: streakDays >= 3,
        unlockedAt: streakDays >= 3 ? `${streakDays} روز` : undefined,
        wisdomPoints: 60,
        mentorQuote: '«تکرار خردورزانه و منظم، بنیاد تولد هر عادت سازنده‌ای است.»',
      },
      {
        id: 'streak-7',
        title: 'هفت روز استواری',
        titleEn: '7-Day Learning Streak',
        description: 'حفظ زنجیره مطالعه به مدت ۷ روز بدون وقفه و پیوستگی در درک مفاهیم',
        category: 'streak',
        tier: 'silver',
        icon: 'whatshot',
        progress: Math.min(7, streakDays),
        maxProgress: 7,
        isUnlocked: streakDays >= 7,
        unlockedAt: streakDays >= 7 ? 'هفته نخست' : undefined,
        wisdomPoints: 150,
        mentorQuote: '«نظم ذهنی همان پلی است که رویاهای یادگیری را به تسلط بدل می‌کند.»',
      },
      {
        id: 'streak-30',
        title: 'مشعل استواری ماهانه',
        titleEn: '30-Day Master Streak',
        description: 'استمرار پایدار در یادگیری به مدت ۳۰ روز پی‌درپی و پیوند ناگسستنی با خرد',
        category: 'streak',
        tier: 'diamond',
        icon: 'workspace_premium',
        progress: Math.min(30, streakDays),
        maxProgress: 30,
        isUnlocked: streakDays >= 30,
        unlockedAt: streakDays >= 30 ? '۳۰ روز مداوم' : undefined,
        wisdomPoints: 500,
        mentorQuote: '«ثبات قدم در جستجوی حقیقت، نشان والای جویندگان اصیل دانایی است.»',
      },
      {
        id: 'quiz-master',
        title: 'سنجشگر ژرف‌اندیش',
        titleEn: 'Assessment Champion',
        description: 'پاسخ درست و تسلط ادراکی در آزمون‌های حداقل ۳ پله یادگیری',
        category: 'quiz',
        tier: 'silver',
        icon: 'psychology',
        progress: Math.min(3, totalCompletedSteps),
        maxProgress: 3,
        isUnlocked: totalCompletedSteps >= 3,
        unlockedAt: totalCompletedSteps >= 3 ? 'آزمون ۳ پله' : undefined,
        wisdomPoints: 120,
        mentorQuote: '«پاسخ‌های صحیح ثمره تفکر سنجشگرانه است، نه تکرار طوطی‌وار.»',
      },
      {
        id: 'first-note',
        title: 'کاتب اندیشه',
        titleEn: 'First Thought Recorded',
        description: 'ثبت اولین تأمل شخصی یا گزیده نقل‌قول در صندوقچه یادداشت‌های پله',
        category: 'reading',
        tier: 'bronze',
        icon: 'edit_note',
        progress: Math.min(1, notesCount),
        maxProgress: 1,
        isUnlocked: notesCount >= 1,
        unlockedAt: notesCount >= 1 ? 'یادداشت اول' : undefined,
        wisdomPoints: 40,
        mentorQuote: '«دانشی که مکتوب شود، در اندیشه صیقل می‌یابد و ماندگار می‌گردد.»',
      },
      {
        id: 'library-builder',
        title: 'صاحب کتابخانه',
        titleEn: 'Library Curator',
        description: 'افزودن و پیگیری حداقل ۲ کتاب یا مرجع معتبر در کتابخانه همراه',
        category: 'reading',
        tier: 'silver',
        icon: 'auto_stories',
        progress: Math.min(2, booksCount),
        maxProgress: 2,
        isUnlocked: booksCount >= 2,
        unlockedAt: booksCount >= 2 ? '۲ کتاب' : undefined,
        wisdomPoints: 80,
        mentorQuote: '«کتابخانه، پناهگاه جان‌های آزاده و جویای خرد است.»',
      },
      {
        id: 'explorer-master',
        title: 'جهان‌دیده‌ی مفاهیم',
        titleEn: 'Curriculum Architect',
        description: 'ایجاد یا کاوش در حداقل ۲ مسیر یادگیری گوناگون با هوش مصنوعی',
        category: 'path',
        tier: 'gold',
        icon: 'explore',
        progress: Math.min(2, totalPathsCount),
        maxProgress: 2,
        isUnlocked: totalPathsCount >= 2,
        unlockedAt: totalPathsCount >= 2 ? '۲ مسیر' : undefined,
        wisdomPoints: 160,
        mentorQuote: '«خرد با دیدن خطوط پیوند میان شاخه‌های گوناگون معرفت زاده می‌شود.»',
      },
    ];

    const unlocked = list.filter((b) => b.isUnlocked);
    const points = unlocked.reduce((sum, b) => sum + b.wisdomPoints, 0);

    return {
      achievements: list,
      unlockedAchievementsCount: unlocked.length,
      totalWisdomPoints: points,
    };
  }, [allPaths, user?.streakDays, notes.length, libraryBooks.length]);

  const loadDemoAccounts = async () => {
    try {
      const res = await palleApi.getDemos();
      setDemoAccounts(res.demos || []);
    } catch (e) {
      console.warn('Could not load demo accounts catalog:', e);
    }
  };

  const startAsGuest = () => {
    setIsGuest(true);
    try {
      localStorage.setItem(GUEST_FLAG_KEY, 'true');
    } catch {
      // ignore
    }

    const guestUser: UserProfile = {
      id: 'guest',
      name: 'کاربر مهمان',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW',
      bio: 'در حال تجربه پله در حالت مهمان • داده‌ها به طور موقت در این مرورگر نگهداری می‌شوند',
      joinDate: 'هم‌اکنون',
      streakDays: 0,
      activePathsCount: 0,
      preferences: {
        dailyGoalMinutes: 15,
        defaultLevel: 'beginner',
        focusMode: true,
        aiTone: 'socratic',
        fontSize: 'normal',
      },
    };

    setUser(guestUser);

    // Restore any existing guest progress from local storage
    try {
      const raw = localStorage.getItem(GUEST_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const paths: LearningPath[] = parsed.paths || [];
        const books: BookItem[] = parsed.books || [];
        const nList: NoteItem[] = parsed.notes || [];

        setAllPaths(paths);
        setLibraryBooks(books);
        setNotes(nList);

        const currentActive = paths.find((p) => p.status === 'in_progress' && p.progressPercent < 100) || null;
        setActivePath(currentActive);

        if (currentActive && currentActive.steps && currentActive.steps.length > 0) {
          const step =
            currentActive.steps.find((s) => s.status === 'current') ||
            currentActive.steps[currentActive.currentStepIndex] ||
            currentActive.steps[0];
          setCurrentStep(step);
        }
      } else {
        const starterPath: LearningPath = {
          id: 'path-guest-starter',
          userId: 'guest',
          title: 'تفکر نقادانه و فلسفه کاربردی',
          category: 'فلسفه و منطق کاربردی',
          description: 'مسیر ساختاریافته تفکر نقادانه و سنجشگری عقلانی برای زندگی روزمره.',
          level: 'beginner',
          goal: 'درک اصول و جهان‌بینی کلی',
          dailyMinutes: 15,
          estimatedWeeks: 2,
          weeklyFocus: 'پرورش روحیه پرسشگری و تشخیص مغالطه‌ها',
          heroImage:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
          status: 'in_progress',
          progressPercent: 0,
          currentStepIndex: 0,
          totalSteps: 4,
          startedAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          steps: [
            {
              id: 'step-g-1',
              pathId: 'path-guest-starter',
              stepNumber: 1,
              totalSteps: 4,
              title: 'آغاز پرسشگری: تفاوت میان دانستن و توهم دانایی',
              subtitle: 'چگونه سقراط و فلاسفه کهن پیش‌فرض‌های نادرست را به چالش کشیدند.',
              category: 'تفکر نقادانه',
              level: 'beginner',
              durationMinutes: 15,
              introDescription:
                '«در این پله یاد می‌گیرید که چگونه با پرسش‌های موشکافانه، مرز بین آگاهی حقیقی و پیش‌فرض‌های ساختگی را تمیز دهید.»',
              podcastTitle: 'پادکست: هنر ندانستن و پرسشگری سقراطی',
              podcastDuration: '۰۲:۱۰',
              microSummary: {
                mentorGreeting: 'سلام و درود! در این اولین پله، نیازی به خواندن کتاب‌های قطور یا متون پیچیده نداری؛ اصل مطلب را در چند دقیقه با هم مرور می‌کنیم:',
                coreIdea: 'تفکر نقادانه به معنای مخالفت یا خرده‌گیری نیست، بلکه مهارت کشف پیش‌فرض‌های ناآزموده و رهایی از توهم دانایی است.',
                keyPoints: [
                  'اعتراف به ندانستن (فروتنی معرفتی)، کلید گشودن دروازه یادگیری واقعی است.',
                  'ادعاهای عمومی را از شواهد مستند تفکیک کن و هر ادعایی را بدون دلیل معتبر نپذیر.',
                  'با طرح سوالات چرایی، تناقضات درونی عقاید را آشکار ساز.',
                ],
                realWorldExample: 'قبل از اشتراک‌گذاری یک خبر یا پذیرش یک باور رایج، از خودت بپرس: «منبع موثق این ادعا کجاست؟»',
                quickReflection: 'چه باوری داری که اگر همین حالا دلایلش را بنویسی، متوجه می‌شوی صرفاً از دیگران تقلید کرده‌ای؟',
              },
              objectives: [
                {
                  id: 'ob-g1',
                  title: '۱. فروتنی معرفتی',
                  description: 'تشخیص اینکه اعتراف به ندانستن، آغاز واقعی یادگیری است.',
                },
                {
                  id: 'ob-g2',
                  title: '۲. سنجشگری پیش‌فرض‌ها',
                  description: 'چگونه ادعاهای اثبات‌نشده را از استدلال‌های معتبر تفکیک کنیم.',
                },
              ],
              resourceRecommendation: {
                title: 'کتاب: تفکر نقادانه و سنجشگری عقل',
                author: 'ریچارد پل و لیندا الدر',
                translator: 'اکبر سلطانی',
                chapter: 'فصل اول: ذهن هدایت‌شده',
                pageCount: 18,
                estimatedMinutes: 12,
                quote: '«بزرگ‌ترین مانع یادگیری نادانی نیست، بلکه توهم دانایی است.»',
                quoteCitation: 'ریچارد پل',
                coverImage:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
                discountCode: 'PALLE20',
                discountPercent: 20,
              },
              passage: {
                title: 'سنجشگری عقلانی در عصر اطلاعات',
                bookTitle: 'تفکر نقادانه',
                author: 'ریچارد پل',
                chapter: 'فصل اول',
                pageNumber: 15,
                totalPages: 120,
                estimatedMinutes: 5,
                highlightQuote: '«کسی که سوال نمی‌پرسد، اسیر پاسخ‌های دیگران باقی می‌ماند.»',
                paragraphs: [
                  'بسیاری از تصمیمات و باورهای ما بر پایه عادت‌ها و سوگیری‌های ناخودآگاه شکل می‌گیرند، نه بر اساس بررسی شواهد موثق.',
                  'تفکر نقادانه به معنای مخالفت یا خرده‌گیری نیست؛ بلکه مهارتی است برای بازبینی دقیق افکار خودمان تا بدانیم چه چیز را واقعاً می‌دانیم و چه چیز را صرفاً بر حسب تصادف پذیرفته‌ایم.',
                  'با طرح پرسش‌های سقراطی درباره فرضیات، شواهد و پیامدها، می‌توان به شفافیت و استواری فکری در جهان پیچیده امروز دست یافت.',
                ],
              },
              quiz: {
                title: 'سنجش ادراکی پله ۱',
                stepNumber: 1,
                questions: [
                  {
                    id: 'q-g1',
                    question: 'بر اساس این درس، نخستین گام بنیادین در تفکر نقادانه چیست؟',
                    category: 'مفاهیم پایه',
                    options: [
                      'مخالفت سریع با دیدگاه دیگران',
                      'بازبینی پیش‌فرض‌ها و آگاهی به ندانسته‌های خود',
                      'پذیرش بی‌چون‌وچرای آمار پرطرفدار',
                      'به یاد سپردن حجم زیادی از اطلاعات',
                    ],
                    correctIndex: 1,
                    mentorFeedback: 'عالی است! تفکر نقادانه با فروتنی معرفتی و سنجش فرضیات آغاز می‌شود.',
                    wisdomPoints: 20,
                  },
                ],
              },
              keyTakeaway: 'پرسشگری نقادانه آغاز رهایی از توهم دانایی و گام نخست ساختن مسیر یادگیری عمیق است.',
              status: 'current',
            },
            {
              id: 'step-g-2',
              pathId: 'path-guest-starter',
              stepNumber: 2,
              totalSteps: 4,
              title: 'مغالطات منطقی در زندگی روزمره',
              subtitle: 'شناسایی خطاهای استدلال در گفتگوها و رسانه‌ها.',
              category: 'تفکر نقادانه',
              level: 'beginner',
              durationMinutes: 20,
              introDescription: 'آشنایی با متداول‌ترین مغالطات از جمله حمله به شخص و توسل به مرجعیت نامربوط.',
              podcastTitle: 'پادکست: تله‌های استدلال',
              podcastDuration: '۰۲:۴۵',
              microSummary: {
                mentorGreeting: 'در پله دوم، سراغ خطاهای فکری معروفی می‌رویم که هر روز در رسانه‌ها و بحث‌های خانوادگی می‌شنویم:',
                coreIdea: 'مغالطه یک سفسطه یا خطای استدلال است که ظاهری موجه اما باطنی بی‌پایه دارد.',
                keyPoints: [
                  'مغالطه حمله به شخص (Ad Hominem): تخریب گوینده به جای پاسخ به استدلال.',
                  'مغالطه پهلوان‌پنبه (Straw Man): تحریف سخن طرف مقابل برای رد آسان‌تر آن.',
                  'توسل به اکثریت: پرطرفدار بودن یک ادعا دلیل بر درستی آن نیست.',
                ],
                realWorldExample: '«فلانی چون سنش کمه، حرفش در مورد اقتصاد اشتباهه!» (یک نمونه بارز حمله به شخص).',
                quickReflection: 'آخرین باری که به جای نقد ایده، شخصیت طرف مقابل را نقد کردی کی بود؟',
              },
              objectives: [
                { id: 'ob-g2-1', title: 'شناخت مغالطه پهلوان‌پنبه', description: 'چگونه تحریف سخن دیگران شکل می‌گیرد.' },
              ],
              resourceRecommendation: {
                title: 'کتاب: مغالطات',
                author: 'علی‌اصغر خندان',
                chapter: 'فصل ۲',
                pageCount: 20,
                estimatedMinutes: 15,
                quote: '«منطق، ترازوی سنجش افکار است.»',
                quoteCitation: 'خندان',
                coverImage:
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDoZyg0h19AgYOu7eEM8lyPEB1kqVUC_vIecbdhFOMNJvkM-Nnpg3iePpwRryBt6yp2fU4cpCjMhRj7ppQu1P5wJVOP9daGZ6h9skn28khwqAal6BX4DNpgKhQ6LdphrcaE1GkRXYn2uZC6gcLg-zUS8r0nepUrqlWWoX6dQiwRGdK7Atg9pyvFtJkkpp1VdxIVmt1b19IjTZY5kp6z3Az-Nr7VUfmk1N2m_p_sFO7ez3OpBwdCXFF',
                discountCode: 'PALLE20',
                discountPercent: 20,
              },
              passage: {
                title: 'آسیب‌شناسی استدلال',
                bookTitle: 'مغالطات',
                author: 'خندان',
                chapter: 'فصل دوم',
                pageNumber: 30,
                totalPages: 200,
                estimatedMinutes: 6,
                highlightQuote: '«یک مغالطه ممکن است ظاهر جذابی داشته باشد اما فاقد پشتوانه منطقی است.»',
                paragraphs: [
                  'مغالطه شخصی (Ad Hominem) از پرکاربردترین شگردهای اقناع غیرمنطقی است.',
                  'با تمرین تفکیک موضوع بحث از شخصیت گوینده، می‌توان به سنجش بی‌طرفانه دست یافت.',
                ],
              },
              quiz: {
                title: 'سنجش ادراکی پله ۲',
                stepNumber: 2,
                questions: [
                  {
                    id: 'q-g2',
                    question: 'اگر کسی به جای نقد منطق ادعا، به شغل یا اخلاق مدعی حمله کند مرتکب چه خطایی شده است؟',
                    category: 'مغالطات',
                    options: [
                      'مغالطه پهلوان‌پنبه',
                      'مغالطه حمله به شخص (Ad Hominem)',
                      'مغالطه دور باطل',
                      'مغالطه توسل به احساسات',
                    ],
                    correctIndex: 1,
                    mentorFeedback: 'دقیقاً درست است! به این خطا مغالطه حمله به شخص می‌گویند.',
                    wisdomPoints: 20,
                  },
                ],
              },
              keyTakeaway: 'ارزیابی اعتبار یک ادعا بر اساس استدلال آن است نه شخص مدعی.',
              status: 'locked',
            },
          ],
        };

        const starterBook: BookItem = {
          id: 'book-g-1',
          userId: 'guest',
          title: 'تفکر نقادانه و سنجشگری عقل',
          author: 'ریچارد پل و لیندا الدر',
          translator: 'اکبر سلطانی',
          coverImage:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
          status: 'reading',
          progressPercent: 0,
          currentPage: 1,
          totalPages: 120,
          pathId: starterPath.id,
          pathTitle: starterPath.title,
          notesCount: 0,
          lastRead: 'هم‌اکنون',
          summary: 'کتاب مرجع برای پرورش تفکر نقادانه و سنجشگری عقلانی',
        };

        setAllPaths([starterPath]);
        setLibraryBooks([starterBook]);
        setNotes([]);
        setActivePath(starterPath);
        setCurrentStep(starterPath.steps[0]);
        saveGuestStorage([starterPath], [starterBook], []);
      }
    } catch {
      // ignore
    }

    setCurrentView('home');
    showToast('وارد حالت مهمان شدید. می‌توانید تمام بخش‌ها را بدون ثبت‌نام امتحان کنید ✨', 'info');
  };

  const refreshData = async () => {
    const token = getStoredToken();
    const isGuestActive = !token && localStorage.getItem(GUEST_FLAG_KEY) === 'true';

    if (isGuestActive) {
      startAsGuest();
      setIsLoading(false);
      return;
    }

    if (!token) {
      setUser(null);
      setActivePath(null);
      setAllPaths([]);
      setLibraryBooks([]);
      setNotes([]);
      setIsLoading(false);
      setCurrentView('onboarding');
      return;
    }

    try {
      setIsLoading(true);
      const dash = await palleApi.getDashboard();
      setUser(dash.user);
      setAllPaths(dash.paths || []);
      setLibraryBooks(dash.books || []);
      setIsGuest(false);

      // Real active path calculation
      const currentActive = dash.activePath || null;
      setActivePath(currentActive);

      if (currentActive && currentActive.steps && currentActive.steps.length > 0) {
        const step =
          currentActive.steps.find((s) => s.status === 'current') ||
          currentActive.steps[currentActive.currentStepIndex] ||
          currentActive.steps[0];
        setCurrentStep(step);
      } else {
        setCurrentStep(null);
      }

      const notesData = await palleApi.getNotes();
      setNotes(notesData.notes || []);

      if (currentView === 'onboarding') {
        setCurrentView('home');
      }
    } catch (err: any) {
      if (err.status === 401) {
        setStoredToken(null);
        setUser(null);
        setCurrentView('onboarding');
      } else {
        console.error('Failed to load Palle dashboard:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemoAccounts();
    refreshData();
  }, []);

  const navigateTo = (view: AppView, options?: { step?: LearningStep; path?: LearningPath }) => {
    setPreviousView(currentView);
    if (options?.path) {
      setActivePath(options.path);
    }
    if (options?.step) {
      setCurrentStep(options.step);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentView === 'book-reader') {
      navigateTo('step-overview');
    } else if (currentView === 'step-assessment') {
      navigateTo('step-overview');
    } else if (currentView === 'step-overview') {
      navigateTo('path-roadmap');
    } else if (currentView === 'path-roadmap') {
      navigateTo('home');
    } else if (currentView === 'create-level') {
      navigateTo('create-topic');
    } else if (currentView === 'create-topic') {
      navigateTo('home');
    } else if (currentView === 'step-celebration') {
      navigateTo('path-roadmap');
    } else if (currentView === 'achievements') {
      navigateTo('profile');
    } else {
      navigateTo(previousView || 'home');
    }
  };

  const openAiChat = () => setIsAiChatOpen(true);
  const closeAiChat = () => setIsAiChatOpen(false);
  const openAddResource = () => setIsAddResourceOpen(true);
  const closeAddResource = () => setIsAddResourceOpen(false);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (isGuest) {
      if (user) {
        setUser({ ...user, ...updates, preferences: { ...user.preferences, ...updates.preferences } });
      }
      showToast('تنظیمات به صورت موقت در حالت مهمان ذخیره شد');
      return;
    }

    try {
      const res = await palleApi.updateProfile(updates);
      setUser(res.user);
      showToast('تنظیمات با موفقیت ذخیره شد');
    } catch (e: any) {
      showToast(e.message || 'خطا در ذخیره تغییرات', 'warning');
    }
  };

  const startPath = async (pathId: string) => {
    if (isGuest) {
      setAllPaths((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pathId) return p;
          const up = { ...p, status: 'in_progress' as const, startedAt: new Date().toISOString() };
          if (up.steps && up.steps.length > 0) {
            up.steps[0].status = 'current';
            up.steps[0].startedAt = new Date().toISOString();
          }
          return up;
        });
        const active = updated.find((p) => p.id === pathId) || null;
        setActivePath(active);
        if (active?.steps[0]) setCurrentStep(active.steps[0]);
        saveGuestStorage(updated, libraryBooks, notes);
        return updated;
      });
      showToast('مسیر یادگیری آغاز شد!');
      return;
    }

    try {
      const res = await palleApi.startPath(pathId);
      setActivePath(res.path);
      setAllPaths((prev) => prev.map((p) => (p.id === pathId ? res.path : p)));
      if (res.path.steps[0]) {
        setCurrentStep(res.path.steps[0]);
      }
      showToast('مسیر یادگیری با موفقیت آغاز شد! گام اول آماده مطالعه است.');
    } catch (e: any) {
      showToast(e.message || 'خطا در شروع مسیر یادگیری', 'warning');
    }
  };

  const startStep = async (pathId: string, stepId: string) => {
    if (isGuest) {
      setAllPaths((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pathId) return p;
          const up = { ...p, status: 'in_progress' as const };
          if (!up.startedAt) up.startedAt = new Date().toISOString();
          const stepIdx = up.steps.findIndex((s) => s.id === stepId);
          if (stepIdx !== -1) {
            up.currentStepIndex = stepIdx;
            if (up.steps[stepIdx].status !== 'completed') {
              up.steps[stepIdx].status = 'current';
              if (!up.steps[stepIdx].startedAt) up.steps[stepIdx].startedAt = new Date().toISOString();
            }
          }
          return up;
        });
        const active = updated.find((p) => p.id === pathId) || null;
        setActivePath(active);
        const s = active?.steps.find((x) => x.id === stepId) || null;
        if (s) setCurrentStep(s);
        saveGuestStorage(updated, libraryBooks, notes);
        return updated;
      });
      return;
    }

    try {
      const res = await palleApi.startStep(pathId, stepId);
      setActivePath(res.path);
      setAllPaths((prev) => prev.map((p) => (p.id === pathId ? res.path : p)));
      setCurrentStep(res.step);
    } catch (e: any) {
      showToast(e.message || 'خطا در باز کردن پله', 'warning');
    }
  };

  const checkTriggerSavePrompt = (completedSteps: number) => {
    // Show prompt ONLY after the first completed step, if not previously dismissed
    if (completedSteps === 1 && !hasDismissedSavePrompt) {
      setTimeout(() => {
        setShowSaveProgressModal(true);
      }, 1200);
    }
  };

  const completeCurrentStep = async () => {
    if (!activePath || !currentStep) return;

    if (isGuest) {
      const pathId = activePath.id;
      const stepId = currentStep.id;

      setAllPaths((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== pathId) return p;
          const stepIndex = p.steps.findIndex((s) => s.id === stepId);
          if (stepIndex === -1) return p;

          p.steps[stepIndex].status = 'completed';
          p.steps[stepIndex].completedAt = new Date().toISOString();

          if (stepIndex + 1 < p.steps.length) {
            p.steps[stepIndex + 1].status = 'current';
            p.steps[stepIndex + 1].startedAt = new Date().toISOString();
            p.currentStepIndex = stepIndex + 1;
          }

          const comp = p.steps.filter((s) => s.status === 'completed').length;
          p.progressPercent = Math.round((comp / p.steps.length) * 100);
          p.status = comp === p.steps.length ? 'completed' : 'in_progress';

          return { ...p };
        });

        const active = updated.find((p) => p.id === pathId) || null;
        setActivePath(active);
        const next = active?.steps.find((s) => s.id === stepId) || currentStep;
        setCurrentStep(next);

        const totalCompleted = active?.steps.filter((s) => s.status === 'completed').length || 0;
        checkTriggerSavePrompt(totalCompleted);

        saveGuestStorage(updated, libraryBooks, notes);
        return updated;
      });

      showToast('آفرین! این پله با موفقیت تکمیل شد ✨');
      navigateTo('step-celebration');
      return;
    }

    try {
      const res = await palleApi.completeStep(activePath.id, currentStep.id);
      if (res.success) {
        setActivePath(res.path);
        setAllPaths((prev) => prev.map((p) => (p.id === res.path.id ? res.path : p)));
        const updatedStep = res.path.steps.find((s) => s.id === currentStep.id) || currentStep;
        setCurrentStep(updatedStep);
        showToast('آفرین! این پله با موفقیت تکمیل شد ✨');
        navigateTo('step-celebration');
      }
    } catch (e: any) {
      showToast(e.message || 'خطا در ثبت پیشرفت پله', 'warning');
    }
  };

  const submitStepQuiz = async (score: number, maxScore: number, answers: number[]) => {
    if (!activePath || !currentStep) return;

    if (isGuest) {
      await completeCurrentStep();
      return;
    }

    try {
      const res = await palleApi.submitQuiz(activePath.id, currentStep.id, {
        score,
        maxScore,
        answers,
      });
      if (res.success) {
        setActivePath(res.path);
        setAllPaths((prev) => prev.map((p) => (p.id === res.path.id ? res.path : p)));
        const updatedStep = res.path.steps.find((s) => s.id === currentStep.id) || currentStep;
        setCurrentStep(updatedStep);
        showToast('آزمون با موفقیت ثبت و این پله تکمیل شد ✨');
        navigateTo('step-celebration');
      }
    } catch (e: any) {
      showToast(e.message || 'خطا در ثبت نتایج آزمون', 'warning');
    }
  };

  const generateNewPath = async () => {
    navigateTo('generating-path');
    try {
      const res = await palleApi.generateLearningPath({
        topic: creationDraft.topic,
        level: creationDraft.level,
        goal: creationDraft.goal,
        dailyMinutes: creationDraft.dailyMinutes,
      });

      setTimeout(() => {
        setAllPaths((prev) => {
          const updated = [res.path, ...prev];
          if (isGuest) {
            saveGuestStorage(updated, libraryBooks, notes);
          }
          return updated;
        });

        setActivePath(res.path);
        if (res.path.steps[0]) {
          setCurrentStep(res.path.steps[0]);
        }
        showToast(`مسیر یادگیری «${res.path.title}» ساخته شد!`);
        navigateTo('path-roadmap', { path: res.path, step: res.path.steps[0] });
      }, 2500);
    } catch (err: any) {
      showToast('خطا در تولید مسیر یادگیری، لطفاً مجدداً امتحان کنید', 'warning');
      navigateTo('create-level');
    }
  };

  const addBookToLibrary = async (book: Partial<BookItem>) => {
    if (isGuest) {
      const newBook: BookItem = {
        id: `book-guest-${Date.now()}`,
        userId: 'guest',
        title: book.title || 'کتاب مرجع',
        author: book.author || 'نویسنده مرجع',
        translator: book.translator,
        coverImage:
          book.coverImage ||
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
        status: 'reading',
        progressPercent: 0,
        currentPage: 1,
        totalPages: book.totalPages || 100,
        pathId: book.pathId,
        pathTitle: book.pathTitle,
        notesCount: 0,
        lastRead: 'هم‌اکنون',
        summary: book.summary,
      };

      setLibraryBooks((prev) => {
        const updated = [newBook, ...prev];
        saveGuestStorage(allPaths, updated, notes);
        return updated;
      });
      showToast('کتاب به کتابخانه اضافه شد');
      return;
    }

    try {
      const res = await palleApi.addBookToLibrary(book);
      setLibraryBooks((prev) => [res.book, ...prev]);
      showToast('کتاب با موفقیت به کتابخانه افزوده شد');
    } catch (e: any) {
      showToast(e.message || 'خطا در افزودن کتاب', 'warning');
    }
  };

  const addNote = async (noteData: { text: string; quote?: string; bookTitle?: string; stepTitle?: string }) => {
    if (isGuest) {
      const newNote: NoteItem = {
        id: `note-guest-${Date.now()}`,
        userId: 'guest',
        stepId: currentStep?.id,
        stepTitle: noteData.stepTitle || currentStep?.title,
        bookTitle: noteData.bookTitle || currentStep?.resourceRecommendation?.title,
        quote: noteData.quote,
        text: noteData.text,
        createdAt: new Date().toISOString(),
      };

      setNotes((prev) => {
        const updated = [newNote, ...prev];
        saveGuestStorage(allPaths, libraryBooks, updated);
        return updated;
      });
      showToast('یادداشت در حالت مهمان ذخیره شد ✓');
      return;
    }

    try {
      const res = await palleApi.addNote({
        stepId: currentStep?.id,
        stepTitle: noteData.stepTitle || currentStep?.title,
        bookTitle: noteData.bookTitle || currentStep?.resourceRecommendation?.title,
        quote: noteData.quote,
        text: noteData.text,
      });
      setNotes((prev) => [res.note, ...prev]);
      showToast('در یادداشت‌های پله ذخیره شد ✓');
    } catch (e: any) {
      showToast(e.message || 'خطا در ذخیره یادداشت', 'warning');
    }
  };

  const deleteNote = async (id: string) => {
    if (isGuest) {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        saveGuestStorage(allPaths, libraryBooks, updated);
        return updated;
      });
      showToast('یادداشت حذف شد');
      return;
    }

    try {
      await palleApi.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      showToast('یادداشت حذف شد');
    } catch {
      showToast('خطا در حذف یادداشت', 'warning');
    }
  };

  const sendOtp = async (phone: string, name?: string, purpose: 'login' | 'register' = 'login') => {
    return palleApi.sendOtp(phone, name, purpose);
  };

  const verifyOtp = async (phone: string, code: string, name?: string, avatarUrl?: string) => {
    // If in guest mode, package up guest data for atomic server migration
    const guestData =
      isGuest && (allPaths.length > 0 || libraryBooks.length > 0 || notes.length > 0)
        ? { paths: allPaths, books: libraryBooks, notes }
        : undefined;

    const res = await palleApi.verifyOtp(phone, code, name, guestData, avatarUrl);

    // Clear guest flags upon successful verified login
    try {
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(GUEST_PROMPT_KEY);
    } catch {
      // ignore
    }
    setIsGuest(false);
    setUser(res.user);

    await refreshData();
    navigateTo('home');
    return res;
  };

  const loginWithDemo = async (demoId: string) => {
    try {
      setIsLoading(true);
      try {
        localStorage.removeItem(GUEST_FLAG_KEY);
        localStorage.removeItem(GUEST_STORAGE_KEY);
        localStorage.removeItem(GUEST_PROMPT_KEY);
      } catch {
        // ignore
      }
      setIsGuest(false);

      const res = await palleApi.loginWithDemo(demoId);
      setUser(res.user);
      await refreshData();
      showToast(`خوش آمدید، ${res.user.name} (حساب دمو)`);
      navigateTo('home');
    } catch (err: any) {
      showToast(err.message || 'خطا در ورود با حساب دمو', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await palleApi.logout();
    try {
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem(GUEST_PROMPT_KEY);
    } catch {
      // ignore
    }
    setIsGuest(false);
    setUser(null);
    setActivePath(null);
    setAllPaths([]);
    setLibraryBooks([]);
    setNotes([]);
    navigateTo('onboarding');
    showToast('با موفقیت از حساب کاربری خارج شدید');
  };

  return (
    <PalleContext.Provider
      value={{
        user,
        activePath,
        allPaths,
        libraryBooks,
        notes,
        currentView,
        previousView,
        currentStep,
        isAiChatOpen,
        isAddResourceOpen,
        toasts,
        isLoading,
        demoAccounts,
        achievements,
        unlockedAchievementsCount,
        totalWisdomPoints,
        isGuest,
        showSaveProgressModal,
        hasDismissedSavePrompt,
        startAsGuest,
        dismissSaveProgressModal,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        creationDraft,
        setCreationDraft,
        navigateTo,
        goBack,
        openAiChat,
        closeAiChat,
        openAddResource,
        closeAddResource,
        showToast,
        updateUserProfile,
        startPath,
        startStep,
        completeCurrentStep,
        submitStepQuiz,
        generateNewPath,
        addBookToLibrary,
        addNote,
        deleteNote,
        sendOtp,
        verifyOtp,
        loginWithDemo,
        logout,
        refreshData,
      }}
    >
      {children}
    </PalleContext.Provider>
  );
}

export function usePalle(): PalleContextType {
  const ctx = useContext(PalleContext);
  if (!ctx) {
    throw new Error('usePalle must be used within a PalleProvider');
  }
  return ctx;
}
