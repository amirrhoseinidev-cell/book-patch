import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { UserProfile, LearningPath, BookItem, NoteItem, AssistantMessage, LearningStep } from '../src/types/palle';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'palle-db.json');

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  lastUsedAt: string;
}

export interface OtpRecord {
  phone: string;
  code: string;
  expiresAt: number; // timestamp
  attempts: number;
  lastSentAt: number;
  name?: string;
  purpose?: 'login' | 'register';
}

export interface QuizAttemptRecord {
  id: string;
  userId: string;
  pathId: string;
  stepId: string;
  score: number;
  maxScore: number;
  answers: number[];
  completedAt: string;
}

export interface DatabaseSchema {
  users: Record<string, UserProfile>;
  sessions: Record<string, SessionRecord>;
  otps: Record<string, OtpRecord>;
  paths: Record<string, LearningPath[]>;
  books: Record<string, BookItem[]>;
  notes: Record<string, NoteItem[]>;
  chats: Record<string, AssistantMessage[]>;
  quizAttempts: Record<string, QuizAttemptRecord[]>;
}

// Phone normalizer utility
export function normalizeIranianPhone(raw: string): { valid: boolean; normalized: string; error?: string } {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, normalized: '', error: 'شماره تلفن همراه الزامی است.' };
  }

  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let cleaned = raw.trim();
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }

  cleaned = cleaned.replace(/[\s\-\(\)]/g, '');

  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    cleaned = '0' + cleaned;
  }

  const regex = /^09\d{9}$/;
  if (!regex.test(cleaned)) {
    return {
      valid: false,
      normalized: cleaned,
      error: 'شماره موبایل وارد شده معتبر نیست. لطفاً شماره را با فرمت استاندارد ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) وارد فرمایید.',
    };
  }

  return { valid: true, normalized: cleaned };
}

function getInitialDatabase(): DatabaseSchema {
  // 1. Demo User: Sara Radmanesh (Active Philosophy Learner - 30% progress)
  const demoSaraId = 'demo-sara';
  const demoSaraUser: UserProfile = {
    id: demoSaraId,
    name: 'سارا رادمنش',
    phone: '09121112233',
    isPhoneVerified: true,
    isDemo: true,
    email: 'sara.radmanesh@demo.palle.ir',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKxT9wUS3Fyl7misfLJDw9w-FymL13yuNvAW6drqewDccgAPcf251hk2Ddx8wU5U-IoZzo3CFWzRWqTejJ1_1SauFpfks4tokP7IDaRnJAimH9eP9DFgGP-9vCECV1JXv89oxBSFnxwY17FtG4aCDh46TYt1-iuQoacTO8wtsqQTJTuKlQxpxM76xHvbibeKXCL0zbmOGFre7z2fnggkK7KcCl8H0YuzK_mi8hjeVnFPNnH0YZEbAF',
    bio: 'طراح ارشد محصول و پژوهشگر علوم شناختی • علاقه‌مند به فلسفه یونان باستان',
    joinDate: 'آبان ۱۴۰۳',
    streakDays: 12,
    activePathsCount: 1,
    preferences: {
      dailyGoalMinutes: 20,
      defaultLevel: 'intermediate',
      focusMode: true,
      aiTone: 'socratic',
      fontSize: 'normal',
    },
  };

  const demoSaraPath: LearningPath = {
    id: 'path-philosophy-western',
    userId: demoSaraId,
    title: 'فلسفه غرب؛ از سقراط تا کانت',
    goal: 'آشنایی عمیق با تاریخ فلسفه غرب، متدهای استدلال نقادانه و متون دست اول',
    category: 'فلسفه و منطق',
    description: 'آشنایی گام‌به‌گام با سرچشمه‌های تفکر فلسفی، پرسشگری نقادانه و کتاب‌های بنیادین اندیشه غرب.',
    level: 'intermediate',
    dailyMinutes: 20,
    totalSteps: 6,
    currentStepIndex: 2, // Step 3
    progressPercent: 33,
    estimatedWeeks: 4,
    weeklyFocus: 'تسلط بر دیالوگ‌های اولیه افلاطون و هنر مامایی اندیشه',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLOQoWXCzTxJZVmYwWnAym9v6ozeejVqlPmeyZsfkOBLZOdf_Qv1XXrW-b1z9tTnf52_4p__IUnRCJD3FJfWVOOS5yqQOjbjTx239C2uEB31FVrMq16oS7aTHihsuir7-Px3zXfbFbM_x8D0xkBNYa3NKZNHIHPNr6bQonKxcrTZLIw0iLOfYGAeKtKRzQbLdUOTMj7FwkS9QopjGePLXF72j0S9TEFnl_8LHJEXgDLEF-GFZLjiP-',
    createdAt: '2024-11-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
    status: 'in_progress',
    startedAt: '2024-11-01T10:00:00.000Z',
    lastActivityAt: '2024-11-14T10:45:00.000Z',
    steps: [
      {
        id: 'step-1',
        pathId: 'path-philosophy-western',
        stepNumber: 1,
        totalSteps: 6,
        title: 'سرآغاز تفکر؛ پیشاسقراطیان و مسئله طبیعت',
        subtitle: 'بررسی جهان‌شناختی تالس، هراکلیتوس و پارمنیدس در مفهوم تغییر و ثبات.',
        category: 'فلسفه یونان باستان',
        level: 'beginner',
        durationMinutes: 25,
        introDescription: 'چگونه نخستین فیلسوفان کوشیدند بدون اسطوره، جهان را با عناصر طبیعی و عقل تبیین کنند.',
        podcastTitle: 'پادکست: طلوع اندیشه در میلتوس',
        podcastDuration: '۰۲:۳۰',
        objectives: [
          { id: 'ob-1', title: 'درک مفهوم آرخه (اصل نخستین)', description: 'چرا تالس آب و هراکلیتوس آتش را بنیاد هستی می‌دانستند.' },
          { id: 'ob-2', title: 'جدال ثبات و تغییر', description: 'مقایسه حرکت مداوم هراکلیتوس با یکپارچگی تغییرناپذیر پارمنیدس.' }
        ],
        resourceRecommendation: {
          title: 'نخستین فیلسوفان یونان',
          author: 'دبلیو. کی. سی. گاتری',
          chapter: 'فصل ۱: مکتب ملطی',
          pageCount: 22,
          estimatedMinutes: 20,
          quote: '«همه چیز در سیلان است و هیچ چیز پایدار نیست.»',
          quoteCitation: 'هراکلیتوس',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys'
        },
        passage: {
          title: 'آرخه و جوهر اولیه جهان',
          bookTitle: 'نخستین فیلسوفان یونان',
          author: 'گاتری',
          chapter: 'فصل اول',
          pageNumber: 12,
          totalPages: 45,
          estimatedMinutes: 8,
          highlightQuote: '«آغاز فلسفه با پرسش از چرایی به جای پذیرش اسطوره همراه بود.»',
          paragraphs: [
            'پرسش پیشاسقراطیان این بود که ماده اصلی سازنده کیهان چیست و چگونه وحدت در کثرت تجلی می‌یابد.',
            'این نگرش، گذار شکوهمند انسان از تبیین‌های تخیلی به مشاهده عقلی را رقم زد.'
          ]
        },
        quiz: {
          title: 'سنجش ادراکی پله ۱',
          stepNumber: 1,
          questions: [
            {
              id: 'q1-1',
              question: 'تفاوت اساسی تفکر پیشاسقراطی با اسطوره‌های کهن چه بود؟',
              category: 'مفاهیم پایه',
              options: [
                'استفاده از شعر به جای نثر',
                'جستجوی علل طبیعی و عقلی به جای خشم و اراده خدایان',
                'نفی کامل وجود آفرینش',
                'تمرکز صِرف بر اصول اخلاقی جامعه'
              ],
              correctIndex: 1,
              mentorFeedback: 'پیشاسقراطیان نخستین کسانی بودند که قوانین کیهانی را در خود طبیعت جستجو کردند نه در ماوراءالطبیعه اسطوره‌ای.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'آغاز تفکر عقلانی با جستجوی علل درونی و نظمی قانون‌مند در دل طبیعت شکل گرفت.',
        status: 'completed',
        startedAt: '2024-11-01T10:15:00.000Z',
        completedAt: '2024-11-05T14:30:00.000Z'
      },
      {
        id: 'step-2',
        pathId: 'path-philosophy-western',
        stepNumber: 2,
        totalSteps: 6,
        title: 'فضیلت و عدالت؛ بررسی رساله جمهوری',
        subtitle: 'تمثیل غار، نظریه مثل و شکل‌گیری مدینه فاضله از دیدگاه افلاطون.',
        category: 'فلسفه افلاطونی',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'شناخت پیوند میان روان‌شناسی فردی، عدالت اجتماعی و قلمرو مثل در اندیشه افلاطون.',
        podcastTitle: 'پادکست: تمثیل غار و بیداری از سایه‌ها',
        podcastDuration: '۰۱:۵۰',
        objectives: [
          { id: 'ob-2-1', title: 'فهم تمثیل غار', description: 'تفاوت درک سایه‌های حسی با نور حقیقت خورشید عقل.' },
          { id: 'ob-2-2', title: 'مفهوم فضیلت سه‌گانه روح', description: 'پیوند عقل، خشم و میل با طبقات جامعه آرمانی.' }
        ],
        resourceRecommendation: {
          title: 'رساله جمهوری',
          author: 'افلاطون',
          translator: 'فؤاد روحانی',
          chapter: 'کتاب هفتم: تمثیل غار',
          pageCount: 35,
          estimatedMinutes: 25,
          quote: '«آنان که در زنجیرند، جز سایه‌های روی دیوار را حقیقت نمی‌پندارند.»',
          quoteCitation: 'افلاطون',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDoZyg0h19AgYOu7eEM8lyPEB1kqVUC_vIecbdhFOMNJvkM-Nnpg3iePpwRryBt6yp2fU4cpCjMhRj7ppQu1P5wJVOP9daGZ6h9skn28khwqAal6BX4DNpgKhQ6LdphrcaE1GkRXYn2uZC6gcLg-zUS8r0nepUrqlWWoX6dQiwRGdK7Atg9pyvFtJkkpp1VdxIVmt1b19IjTZY5kp6z3Az-Nr7VUfmk1N2m_p_sFO7ez3OpBwdCXFF'
        },
        passage: {
          title: 'تمثیل غار و سیر انسان به سوی روشنایی',
          bookTitle: 'جمهوری افلاطون',
          author: 'افلاطون',
          chapter: 'کتاب هفتم',
          pageNumber: 514,
          totalPages: 600,
          estimatedMinutes: 12,
          highlightQuote: '«رسالت فیلسوف پس از دیدن خورشید، بازگشت به غار برای نجات دیگران است.»',
          paragraphs: [
            'زندانیانی را تصور کن که از کودکی در غاری زیرزمینی دست و پا بسته نشسته‌اند و تنها سایه‌های اشیاء را بر دیوار مقابل می‌بینند.',
            'اگر یکی از آنان رها شود و به روشنایی خورشید بنگرد، ابتدا چشمانش از شدت نور درد خواهد گرفت، اما سرانجام حقیقت را درمی‌یابد.'
          ]
        },
        quiz: {
          title: 'سنجش ادراکی پله ۲',
          stepNumber: 2,
          questions: [
            {
              id: 'q2-1',
              question: 'در تمثیل غار افلاطون، خورشید نماد چیست؟',
              category: 'معرفت‌شناسی افلاطون',
              options: [
                'خدایان المپ نشین',
                'مثال خیر و سرچشمه کل حقیقت و دانایی',
                'احساسات و هیجانات طبیعی انسان',
                'هنر و ادبیات تمثیلی'
              ],
              correctIndex: 1,
              mentorFeedback: 'خورشید در تمثیل افلاطون مظهر «ایده خیر» (Good) است که به همه چیز هستی و قابلیت شناخته‌شدن می‌بخشد.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'ادراک حسی صرفاً سایه‌های جهان است؛ رسیدن به عدالت و شناخت راستین مستلزم سیر عقلانی به سوی مثال خیر است.',
        status: 'completed',
        startedAt: '2024-11-06T11:00:00.000Z',
        completedAt: '2024-11-12T16:00:00.000Z'
      },
      {
        id: 'step-3',
        pathId: 'path-philosophy-western',
        stepNumber: 3,
        totalSteps: 6,
        title: 'روش سقراطی و هنر زایش اندیشه (مامایی اندیشه)',
        subtitle: 'چگونه با پرسشگری دقیق، تعاریف پیش‌فرضی را به چالش بکشیم؟',
        category: 'فلسفه باستان و هنر پرسشگری',
        level: 'intermediate',
        durationMinutes: 20,
        introDescription: '«در این مرحله یاد می‌گیرید که سقراط چگونه بدون اینکه خود را دانا بنامد، با سلسله پرسش‌های هوشمندانه تناقضات درونی افراد را آشکار می‌کرد.»',
        podcastTitle: 'پادکست کوتاه: مقدمه ۱ دقیقه‌ای',
        podcastDuration: '۰۱:۱۵',
        objectives: [
          { id: 'ob-3-1', title: '۱. فهم ساختار دیالوگ سقراطی', description: 'آشنایی با الگوی سه‌گانه انکار دانایی، اعتراف به نادانی و کشف تناقض در فرضیات اولیه.' },
          { id: 'ob-3-2', title: '۲. شناخت تفاوت "تعریف اساسی" با "مثال"', description: 'تفکیک بین ارائه نمونه‌های عینی و ذات بنیادین یک مفهوم فلسفی نظیر شجاعت یا عدالت.' },
          { id: 'ob-3-3', title: '۳. تجربه عملی پرسشگری در موقعیت‌های واقعی', description: 'آمادگی ذهنی برای طرح سوالات باز و سازنده بدون موضع تهاجمی در مباحثات روزمره.' }
        ],
        resourceRecommendation: {
          title: 'کتاب: آپولوژی و فایدون',
          author: 'افلاطون',
          translator: 'محمدعلی فروغی',
          chapter: 'فصل ۱: دفاعیه سقراط در دادگاه آتن',
          pageCount: 15,
          estimatedMinutes: 15,
          quote: '«زندگیِ ناآزموده، ارزش زیستن ندارد.»',
          quoteCitation: 'بند ۲۸ دفاعیه سقراط',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5cPKY2V9lklekqN2n61wr24MUXgLtY2uu405xLdPvGutpdvCrtBDULsWiuuMeIvyBaRDUYslf75TqCYRyQ2-vZz6mJjEOZgky0PhSTCHQ5XWruv7KqGUQ5K8oRCDS9Cl61oBwqI6QqlQlEWQxYVR4NtfacCyllzV3Ac31ocfxupwVddorzo-mokuKnLBuvjlI1l3NQJk35x1yXzcXzmKsADWQhGdQAlJp7U3oyy0gWL3U1wae-Bfx'
        },
        passage: {
          title: 'رساله آپولوژی (دفاعیه سقراط)',
          bookTitle: 'رساله آپولوژی و فایدون',
          author: 'افلاطون',
          translator: 'محمدعلی فروغی',
          chapter: 'فصل ۱: آغاز سخن در دادگاه',
          pageNumber: 18,
          totalPages: 95,
          estimatedMinutes: 4,
          highlightQuote: '«...زیرا بزرگ‌ترین نادانی این است که آدمی پندارد آنچه را نمی‌داند، می‌داند.»',
          paragraphs: [
            'ای مردم آتن! من نمی‌دانم سخنان مدعیان در شما چه اثری گذاشت، اما خود من چنان شیفته و مجذوب گفتار فصیح آنان شدم که نزدیک بود فراموش کنم که کیستم؛ هرچند از صد سخن آنان حتی یک کلمه هم حقیقت نداشت. آنچه بیش از همه مرا به شگفتی واداشت هشداری بود که به شما دادند تا فریب چرب‌زبانی مرا نخورید و مرا به نیرنگ و سخنوری متهم ساختند.',
            'اما سخن راستین من از آرایه‌های ادبی و لفاظی‌های ساختگی تهی خواهد بود. من با همان زبانی سخن خواهم گفت که سال‌ها در بازار و کنار پیشخوان صرافان شنیده‌اید. از شما تمنا دارم نه به شیوهٔ بیانم، بلکه فقط به درستی یا نادرستی آنچه می‌گویم عنایت فرمایید؛ زیرا وظیفهٔ دادرس تمیز حق از باطل است و وظیفهٔ خطیب حقیقت‌گویی.',
            'من سالیان دراز به جستجوی دانایان شهر رفتم؛ از سیاست‌مداران و شاعران تا صنعتگران زبردست. هرکدام گمان می‌بردند در دانشی که دارند استادند و بر امور بنیادین هستی نیز وقوف کامل دارند. این پندار باطل، نور اندک دانششان را نیز تیره می‌ساخت. از این روی بود که دریافتم خرد راستین آن است که به نادانی خویشتن آگاه باشیم.'
          ],
          footnote: {
            title: 'محاکمه سقراط در سال ۳۹۹ پیش از میلاد',
            description: 'این دفاعیه ثبت مکتوب افلاطون از استدلال‌های اخلاقی و شهامت عقلانی سقراط است.',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-u_H7iUlNwZkHtwSR9745xMQN_6aH7XhyWHrpYWxPYBn4xNQ8JQbkFIvm2Xh47aI8e1N4QWED7jfyHtiJoGZvpmzTA7TBl2ZVS_tVygy9C9Y6elY66f8EYOTbU0AWcN6f_hl3yOzVs2sxtP0nQf2vGnz8hjM7SmXue3dVPxt-e3VdyDPIFKI4tiZTGzjT2Fcqt85wi9OrsF69btM08xnGPiZvZHowuybfqY2kokOTK3hMtZdkiNwG'
          }
        },
        quiz: {
          title: 'سنجش ادراکی پله ۳',
          stepNumber: 3,
          questions: [
            {
              id: 'q3-1',
              question: 'تفاوت سقراط با دیگر دانایان آتن بر اساس دفاعیه‌اش چه بود؟',
              category: 'فروتنی معرفتی',
              options: [
                'او ثروت و قدرت سیاسی بیشتری داشت',
                'او می‌دانست که چیزی نمی‌داند، در حالی که دیگران توهم دانایی داشتند',
                'او کتب متعددی نگاشته بود',
                'او فن خطابه را بهتر آموزش می‌داد'
              ],
              correctIndex: 1,
              mentorFeedback: 'سقراط دانایی خود را محدود به آگاهی از جهل خویشتن می‌دانست و این پایه‌گذار فروتنی در علم است.',
              wisdomPoints: 20
            },
            {
              id: 'q3-2',
              question: 'بر اساس متن رساله، هدف نهایی سقراط از طرح پرسش‌های پیاپی در کوچه و بازار چه بود؟',
              category: 'مفهوم‌شناسی دیالوگ سقراطی',
              options: [
                'اثبات برتری خود در فن خطابه و مناظره',
                'آشکار ساختن تناقضات درونی طرف مقابل و بیدار کردن میل به جستجوی حقیقت',
                'آموزش عقاید جدید مذهبی به جوانان آتن',
                'جمع‌آوری آرا و نظرات عمومی برای تدوین قوانین'
              ],
              correctIndex: 1,
              mentorFeedback: 'سقراط این روش را «مامایی اندیشه» می‌نامید؛ او نمی‌خواست اندیشه‌ای را به دیگران تحمیل کند، بلکه کمک می‌کرد خود فرد تناقضات پندارهای پیشینش را دریابد و اندیشه اصیل متولد شود.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'توانایی تشخیص مغالطه در پیش‌فرض‌ها و مهارت طرح سوالات بنیادین برای کشف حقیقت.',
        status: 'current',
        startedAt: '2024-11-13T09:00:00.000Z'
      },
      {
        id: 'step-4',
        pathId: 'path-philosophy-western',
        stepNumber: 4,
        totalSteps: 6,
        title: 'ارسطو و دسته‌بندی دانش؛ منطق و اخلاق نیکوماخوس',
        subtitle: 'ارکان علل چهارگانه، حد وسط در اخلاق و تفکیک علوم نظری و عملی.',
        category: 'مکتب مشاء ارسطویی',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'ارسطو چگونه با تدوین ارغنون و قاعده اعتدال زرین، تفکر سامان‌مند را پی‌ریزی کرد.',
        podcastTitle: 'پادکست: اعتدال زرین و راه رستگاری',
        podcastDuration: '۰۲:۱۰',
        objectives: [
          { id: 'ob-4-1', title: 'علل چهارگانه ارسطویی', description: 'علت مادی، صوری، فاعلی و غایی در پیدایش هر پدیده.' }
        ],
        resourceRecommendation: {
          title: 'اخلاق نیکوماخوس',
          author: 'ارسطو',
          translator: 'محمدحسن لطفی',
          chapter: 'کتاب دوم: درباره فضیلت اخلاقی',
          pageCount: 20,
          estimatedMinutes: 20,
          quote: '«فضیلت حد وسطی است میان دو رذیلت؛ یکی بر سبیل فزونی و دیگری بر سبیل کاستی.»',
          quoteCitation: 'ارسطو',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1-znHT7hOm9FTSz6YwDOvOH3-QSjjwFiB8NuYWQInM7k8ue8Y0BQiFNumRQ381-50wW-Shwl-ahSmYI8gHW7BMZgATuR-W8aC4cGFo072Vf5x-6Yka38Fs2I5z5w1l2-lrsogrPRH0QN353dedtzIWeJ6vkZc1QKTqWvggW15W5I0OnGjuGs2dXLDPBoAsVVch6EOpd4tCWfj-Oeid6mJgraUdMlHYReSAwYyVrdTmb8AbLaALjvJ'
        },
        passage: {
          title: 'درباره سعادت و فضیلت اخلاقی',
          bookTitle: 'اخلاق نیکوماخوس',
          author: 'ارسطو',
          chapter: 'کتاب دوم',
          pageNumber: 34,
          totalPages: 120,
          estimatedMinutes: 10,
          highlightQuote: '«ما با تکرار کارهای عادلانه، عادل می‌شویم.»',
          paragraphs: [
            'سعادت غایت قصوای افعال انسانی است و از شکوفایی عقل در هماهنگی با عمل به دست می‌آید.'
          ]
        },
        quiz: {
          title: 'سنجش ادراکی پله ۴',
          stepNumber: 4,
          questions: [
            {
              id: 'q4-1',
              question: 'تعریف فضیلت در اخلاق نیکوماخوس ارسطو کدام است؟',
              category: 'اخلاق فضیلت',
              options: [
                'پیروی بی‌چون‌وچرا از فرامین حاکم',
                'حد وسط و اعتدال میان افراط و تفریط',
                'ریاضت‌کشی و سرکوب تمایلات',
                'کسب بیشترین میزان لذت'
              ],
              correctIndex: 1,
              mentorFeedback: 'فضیلت ملکه‌ای نفسانی است که میان دو حد افراط و تفریط بر اساس خرد عملی قرار دارد.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'سعادت حقیقی در گرو پرورش عادت به فضیلت و رعایت اعتدال است.',
        status: 'locked'
      },
      {
        id: 'step-5',
        pathId: 'path-philosophy-western',
        stepNumber: 5,
        totalSteps: 6,
        title: 'شک دستوری دکارت؛ من می‌اندیشم پس هستم',
        subtitle: 'تولد عقل‌گرایی مدرن، تفکیک نفس و بدن و بنیان‌گذاری یقین فلسفی.',
        category: 'عقل‌گرایی قرن هفدهم',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'دکارت چگونه با شک روش‌مند، نقطه اتکایی نفوذناپذیر برای علم ساخت.',
        podcastTitle: 'پادکست: کالبدشکافی کوگیتو',
        podcastDuration: '۰۲:۱۵',
        objectives: [
          { id: 'ob-5-1', title: 'اصل کوگیتو', description: 'من می‌اندیشم پس هستم.' }
        ],
        resourceRecommendation: {
          title: 'تأملات در فلسفه اولی',
          author: 'رنه دکارت',
          chapter: 'تأمل دوم',
          pageCount: 20,
          estimatedMinutes: 20,
          quote: '«می‌توانم در هر چیزی شک کنم، جز در این که در حال شک کردنم.»',
          quoteCitation: 'رنه دکارت',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACpj0OiXe-CyIMsSbsMzgb7v-qHca9NEaJPynWisixxXLnLRwDDqXf7xC2Bu6QZHMAu7VaplOXdwSlUHtptQPfvO-SOGv5Clw0kQ3DuXSTCRLO8kUWdIFXxDnqsuQBiVhm5ryXPccZFx4PhU0j_Nvbz67rVHu6xZWyuwSKu1QdJ8aZtyXZ412wYcZEnA7berOdzls10vPbMJChlz94QOEH4HQEV-D0da0i3zyDeok818Iyq5fvCozf'
        },
        passage: {
          title: 'شک در حواس و تولد یقین عقلانی',
          bookTitle: 'تأملات در فلسفه اولی',
          author: 'رنه دکارت',
          chapter: 'تأمل دوم',
          pageNumber: 28,
          totalPages: 110,
          estimatedMinutes: 10,
          highlightQuote: '«من شیء متفکری هستم.»',
          paragraphs: [
            'چون می‌خواستم خود را یکسره وقف جستجوی حقیقت کنم، لازم دیدم در همه چیز شک کنم.'
          ]
        },
        quiz: {
          title: 'سنجش ادراکی پله ۵',
          stepNumber: 5,
          questions: [
            {
              id: 'q5-1',
              question: 'هدف دکارت از شک چیست؟',
              category: 'معرفت‌شناسی',
              options: ['شکاکیت مطلق', 'رسیدن به یقین خلل‌ناپذیر', 'نفی دانش', 'سرگرمی فکری'],
              correctIndex: 1,
              mentorFeedback: 'شک دکارت روشی برای کشف حقیقت یقینی بود.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'آگاهی اندیشنده نخستین یقین فلسفی است.',
        status: 'locked'
      },
      {
        id: 'step-6',
        pathId: 'path-philosophy-western',
        stepNumber: 6,
        totalSteps: 6,
        title: 'انقلاب کوپرنیکی کانت؛ نقد عقل محض',
        subtitle: 'شناخت حدود عقل، پدیدار و شیء فی‌نفسه.',
        category: 'فلسفه نقادی',
        level: 'advanced',
        durationMinutes: 35,
        introDescription: 'چگونه کانت عقل‌گرایی و تجربه‌گرایی را در چارچوبی نو پیوند داد.',
        podcastTitle: 'پادکست: سپیده‌دم روشنگری با کانت',
        podcastDuration: '۰۲:۴۵',
        objectives: [
          { id: 'ob-6-1', title: 'مفاهیم ماتقدم', description: 'نقش زمان و مکان به عنوان قالب‌های شهود حسی.' }
        ],
        resourceRecommendation: {
          title: 'سنجش خرد ناب',
          author: 'امانوئل کانت',
          translator: 'میرشمس‌الدین ادیب‌سلطانی',
          chapter: 'مقدمه',
          pageCount: 30,
          estimatedMinutes: 30,
          quote: '«اندیشه‌های بدون محتوا تهی‌اند، و شهودهای بدون مفهوم نابینا.»',
          quoteCitation: 'امانوئل کانت',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLOQoWXCzTxJZVmYwWnAym9v6ozeejVqlPmeyZsfkOBLZOdf_Qv1XXrW-b1z9tTnf52_4p__IUnRCJD3FJfWVOOS5yqQOjbjTx239C2uEB31FVrMq16oS7aTHihsuir7-Px3zXfbFbM_x8D0xkBNYa3NKZNHIHPNr6bQonKxcrTZLIw0iLOfYGAeKtKRzQbLdUOTMj7FwkS9QopjGePLXF72j0S9TEFnl_8LHJEXgDLEF-GFZLjiP-'
        },
        passage: {
          title: 'درباره امکان معرفت ترکیبی پیشینی',
          bookTitle: 'سنجش خرد ناب',
          author: 'امانوئل کانت',
          chapter: 'دیباچه',
          pageNumber: 45,
          totalPages: 400,
          estimatedMinutes: 12,
          highlightQuote: '«ما از اشیاء تنها آنچه را خود در آنها نهاده‌ایم درمی‌یابیم.»',
          paragraphs: [
            'تاکنون فرض می‌شد که همه معرفت‌های ما باید خود را با اعیان وفق دهند؛ اکنون باید آزمود که اگر اشیاء خود را با شناسایی ما وفق دهند چه خواهد شد.'
          ]
        },
        quiz: {
          title: 'سنجش ادراکی پله ۶',
          stepNumber: 6,
          questions: [
            {
              id: 'q6-1',
              question: 'انقلاب کوپرنیکی کانت در معرفت‌شناسی چیست؟',
              category: 'فلسفه کانت',
              options: [
                'چرخش زمین به دور خورشید',
                'تطابق موضوع شناسایی با ساختار ذهن فاعل شناسا به جای برعکس',
                'نفی کامل عقل',
                'اثبات حواس به عنوان یگانه راه شناخت'
              ],
              correctIndex: 1,
              mentorFeedback: 'کانت نشان داد که ذهن انسان منفعل نیست بلکه قالب‌های خود را بر پدیدارها می‌نهد.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'معرفت حاصل ترکیب داده‌های حسی با مقولات پیشینی فاهمه است.',
        status: 'locked'
      }
    ]
  };

  const demoSaraBooks: BookItem[] = [
    {
      id: 'book-sara-1',
      userId: demoSaraId,
      title: 'تاریخ فلسفه غرب',
      author: 'برتراند راسل',
      translator: 'نجف دریابندری',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACpj0OiXe-CyIMsSbsMzgb7v-qHca9NEaJPynWisixxXLnLRwDDqXf7xC2Bu6QZHMAu7VaplOXdwSlUHtptQPfvO-SOGv5Clw0kQ3DuXSTCRLO8kUWdIFXxDnqsuQBiVhm5ryXPccZFx4PhU0j_Nvbz67rVHu6xZWyuwSKu1QdJ8aZtyXZ412wYcZEnA7berOdzls10vPbMJChlz94QOEH4HQEV-D0da0i3zyDeok818Iyq5fvCozf',
      edition: 'چاپ دوازدهم',
      status: 'reading',
      progressPercent: 33,
      currentPage: 92,
      totalPages: 280,
      pathId: demoSaraPath.id,
      pathTitle: demoSaraPath.title,
      notesCount: 2,
      lastRead: 'امروز',
      summary: 'تحلیلی نقادانه بر جریان‌های فلسفی از یونان باستان تا کانت و هگل.'
    },
    {
      id: 'book-sara-2',
      userId: demoSaraId,
      title: 'رساله آپولوژی و فایدون',
      author: 'افلاطون',
      translator: 'محمدعلی فروغی',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OrggS_rJDzfTNhTqXk5DcoNaApp79rk_UgkAYdsY5kPLu2OhTSoAC862NcpX5_JilhKtVdnIEB_llu_ifmxq5nVLrJYozRIV3dSmXiDcSFUgYcijZHCcX8xSEvC7JDKOZSjITETXfFPuFtZHTYywAkmGxhbIZgGdJMl_ZmFqESgNEnknD9amWVdkhkzCxVXk_g7JfCVojSunNH_v8KWKrOQBKCmoVQVhke9hndrwq4G24mOuip8x',
      edition: 'انتشارات علمی و فرهنگی',
      status: 'reading',
      progressPercent: 20,
      currentPage: 19,
      totalPages: 95,
      pathId: demoSaraPath.id,
      pathTitle: demoSaraPath.title,
      notesCount: 1,
      lastRead: 'دیروز',
      summary: 'متن دفاعیه تاریخی سقراط در برابر اتهامات فساد جوانان آتن.'
    }
  ];

  const demoSaraNotes: NoteItem[] = [
    {
      id: 'note-sara-1',
      userId: demoSaraId,
      stepId: 'step-3',
      stepTitle: 'روش سقراطی و هنر زایش اندیشه',
      bookTitle: 'رساله آپولوژی',
      quote: '«زیرا بزرگ‌ترین نادانی این است که آدمی پندارد آنچه را نمی‌داند، می‌داند.»',
      text: 'آگاهی از جهل خویشتن، سرآغاز حقیقی هرگونه پژوهش عقلانی است. سقراط با این نگرش فلسفه را از آسمان به زمین آورد.',
      createdAt: '2024-11-14T10:45:00.000Z'
    },
    {
      id: 'note-sara-2',
      userId: demoSaraId,
      stepId: 'step-2',
      stepTitle: 'فضیلت و عدالت؛ بررسی رساله جمهوری',
      bookTitle: 'جمهوری افلاطون',
      quote: '«آنان که در زنجیرند جز سایه‌ها را حقیقت نمی‌پندارند.»',
      text: 'تمثیل غار هشداری همیشگی درباره محدودیت داده‌های حسی و فریبندگی باورهای سطحی جامعه است.',
      createdAt: '2024-11-10T12:00:00.000Z'
    }
  ];

  // 2. Demo User: Ali Kazemi (AI & Deep Learning - 67% progress)
  const demoAliId = 'demo-ali';
  const demoAliUser: UserProfile = {
    id: demoAliId,
    name: 'علی کاظمی',
    phone: '09124445566',
    isPhoneVerified: true,
    isDemo: true,
    email: 'ali.kazemi@demo.palle.ir',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW',
    bio: 'مهندس نرم‌افزار و علاقه‌مند به هوش مصنوعی و شبکه‌های عصبی عمیق',
    joinDate: 'شهریور ۱۴۰۳',
    streakDays: 24,
    activePathsCount: 1,
    preferences: {
      dailyGoalMinutes: 30,
      defaultLevel: 'advanced',
      focusMode: true,
      aiTone: 'explanatory',
      fontSize: 'normal',
    },
  };

  const demoAliPath: LearningPath = {
    id: 'path-ai-deep-learning',
    userId: demoAliId,
    title: 'مبانی هوش مصنوعی و یادگیری عمیق',
    goal: 'درک معماری شبکه‌های عصبی ترنسفورمر، توجه چندگانه و یادگیری خودنظارتی',
    category: 'هوش مصنوعی',
    description: 'از پرسپترون ساده تا مدل‌های زبانی بزرگ؛ درک ریاضیات و ساختار شبکه‌های عصبی مدرن.',
    level: 'advanced',
    dailyMinutes: 30,
    totalSteps: 6,
    currentStepIndex: 4, // Step 5
    progressPercent: 67, // 4 of 6 completed
    estimatedWeeks: 6,
    weeklyFocus: 'مکانیزم توجه (Attention Mechanism) و لایه‌های ترنسفورمر',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn5mDHhtJ8sHz68Ii4BCl_0QzJOtYnPqox4Nx207qv5lawFaVOjDB_FRHfNbrPYSRhBlpwfVTLUahCLxF_lHtJCqgA1x4JtGBAvBm87yoHamSNWFznpNnyml8tAjOxpjQS9ov5tdE8sIln8sO_z_QtiDGSZPX5XDUh_brCxKXZ4d1u_lzHgYTerZ5eMhfiD8jmYaNaeAsrkE3Xd59ADp3obes89kdpN06Lqh7zrNda-uaA3I6TaAPS',
    createdAt: '2024-09-10T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
    status: 'in_progress',
    startedAt: '2024-09-10T08:00:00.000Z',
    lastActivityAt: '2024-10-14T18:20:00.000Z',
    steps: [
      {
        id: 'step-ai-1',
        pathId: 'path-ai-deep-learning',
        stepNumber: 1,
        totalSteps: 6,
        title: 'ریاضیات جبر خطی و گرادیان کاهشی',
        subtitle: 'بردارها، ماتریس‌ها و بهینه‌سازی تابع هزینه با گرادیان کاهشی تصادفی (SGD).',
        category: 'مبانی ریاضی',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'چگونه بهینه‌سازها با محاسبه مشتقات جزئی وزن‌های شبکه را اصلاح می‌کنند.',
        podcastTitle: 'پادکست: نقشه هندسی یادگیری ماشین',
        podcastDuration: '۰۲:۴۰',
        objectives: [
          { id: 'ob-ai-1', title: 'درک گرادیان و هایپرپارامتر نرخ یادگیری', description: 'نقش learning rate در همگرایی مدل.' }
        ],
        resourceRecommendation: {
          title: 'کتاب یادگیری عمیق',
          author: 'ایان گودفلو',
          chapter: 'فصل ۴: محاسبات عددی و بهینه‌سازی',
          pageCount: 25,
          estimatedMinutes: 25,
          quote: '«بهینه‌سازی در یادگیری عمیق، یافتن کمینه سراسری در فضاهای پرپیچ‌وخم و غیرمحدب است.»',
          quoteCitation: 'گودفلو',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCGpekdp-BDMqQrSoEVoIwr6MDMJOAcKe8RmQVnZ0pf08PyHVoLkF3oa6EpD7VcOIho5nDFhBBKf09kRIAg4BnNDvbSu-qlmK4jxydXnSflavJg5qvvzB3KvIXn2FS59lwIsUu2o5Clnarw0Xfb4b9Z6GD2sFs-fFz5vbv2ydGBVJ3kl-JU8HXWfuGfIVNMEYU3talbDBkpvf8oiXrPIlFMW1AzEGQnBmrBi4bsMvm1H0jUzg-Wan'
        },
        passage: {
          title: 'اصول مشتق‌گیری زنجیره‌ای و پس‌انتشار',
          bookTitle: 'یادگیری عمیق گودفلو',
          author: 'ایان گودفلو',
          chapter: 'فصل ۶',
          pageNumber: 180,
          totalPages: 700,
          estimatedMinutes: 10,
          highlightQuote: '«الگوریتم پس‌انتشار خطای خروجی را با قاعده زنجیره‌ای به لایه‌های اولیه می‌رساند.»',
          paragraphs: [
            'الگوریتم انتشار به عقب (Backpropagation) هسته مرکزی آموزش شبکه‌های عصبی پیش‌خور است.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۱ یادگیری عمیق',
          stepNumber: 1,
          questions: [
            {
              id: 'q-ai-1',
              question: 'هدف اصلی الگوریتم انتشار به عقب (Backpropagation) چیست؟',
              category: 'بهینه‌سازی',
              options: [
                'محاسبه گرادیان تابع هزینه نسبت به وزن‌ها با قاعده زنجیره‌ای',
                'کاهش حجم داده‌های ورودی',
                'رسم نمودار دقت مدل',
                'ذخیره وزن‌ها در حافظه کش'
              ],
              correctIndex: 0,
              mentorFeedback: 'پس‌انتشار با استفاده از قاعده زنجیره‌ای دیفرانسیل، سهم هر پارامتر را در خطای نهایی محاسبه می‌کند.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'الگوریتم پس‌انتشار امکان اصلاح هوشمندانه میلیون‌ها وزن را فراهم می‌آورد.',
        status: 'completed',
        startedAt: '2024-09-12T09:00:00.000Z',
        completedAt: '2024-09-15T11:00:00.000Z'
      },
      {
        id: 'step-ai-2',
        pathId: 'path-ai-deep-learning',
        stepNumber: 2,
        totalSteps: 6,
        title: 'شبکه‌های پیچشی (CNN) و بینایی ماشین',
        subtitle: 'فیلترها، کانولوشن دوبعدی و ادراک ویژگی‌های سلسله‌مراتبی تصویر.',
        category: 'بینایی ماشین',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'شناخت چگونگی تشخیص لبه‌ها، بافت‌ها و اشیاء با لایه‌های پیچشی.',
        podcastTitle: 'پادکست: چشم مصنوعی چگونه می‌بیند',
        podcastDuration: '۰۲:۲۰',
        objectives: [
          { id: 'ob-ai-2', title: 'مفهوم میدان دید موثر و Pooling', description: 'کاهش ابعاد و حفظ عدم وابستگی مکانی.' }
        ],
        resourceRecommendation: {
          title: 'یادگیری عمیق کاربردی با پایتون',
          author: 'فرانسوا شوله',
          chapter: 'فصل ۵: شبکه‌های عصبی پیچشی',
          pageCount: 30,
          estimatedMinutes: 25,
          quote: '«لایه‌های ابتدایی لبه‌ها را می‌بینند، لایه‌های میانی اشکال را، و لایه‌های انتهایی مفهوم شیء را.»',
          quoteCitation: 'فرانسوا شوله',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZwvUoAeHukBlEy-GdIxBgWKojxlbyVDxiZoM8_itjsLEjEyREVt8TxAKygnbs5mSZMMWL67-xV8y4vgRgv1BThILgbTKDNKGI3MaVY7HMO7BM9dxTzCFmf6O5QdUnvIXrRgcy9qfntjvGdcUVFnruzZggKTw8dUzmnYzO52wboDK_oYe_3OJGVsgbWH9MY9dNWhIBbA8feVuLkJOzTc_B2pDr2soCPI7tLJLjorPWQ5GvU5dvgiI3'
        },
        passage: {
          title: 'سلسله‌مراتب بازنمایی بصری',
          bookTitle: 'یادگیری عمیق با پایتون',
          author: 'شوله',
          chapter: 'فصل ۵',
          pageNumber: 120,
          totalPages: 400,
          estimatedMinutes: 10,
          highlightQuote: '«فیلترهای یادگرفته‌شده در فضا جابه‌جایی‌ناپذیر (Translation Invariant) هستند.»',
          paragraphs: [
            'ویژگی شاخص کانولوشن این است که یک الگو را در هر کجای تصویر ظاهر شود تشخیص می‌دهد.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۲ یادگیری عمیق',
          stepNumber: 2,
          questions: [
            {
              id: 'q-ai-2',
              question: 'مزیت کلیدی لایه‌های کانولوشن نسبت به لایه‌های کاملاً متصل (Dense) چیست؟',
              category: 'معماری شبکه',
              options: [
                'اشتراک وزن‌ها و پایستگی نسبت به جابه‌جایی الگوها در تصویر',
                'سرعت صفر در پردازش',
                'عدم نیاز به داده‌های آموزشی',
                'استفاده انحصاری از اعداد صحیح'
              ],
              correctIndex: 0,
              mentorFeedback: 'اشتراک وزن‌ها پارامترهای مدل را به شدت کاهش داده و امکان تعمیم به هر موقعیتی در تصویر را ایجاد می‌کند.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'لایه‌های کانولوشن ویژگی‌های فضایی را با اشتراک وزن‌ها استخراج می‌کنند.',
        status: 'completed',
        startedAt: '2024-09-18T10:00:00.000Z',
        completedAt: '2024-09-24T12:00:00.000Z'
      },
      {
        id: 'step-ai-3',
        pathId: 'path-ai-deep-learning',
        stepNumber: 3,
        totalSteps: 6,
        title: 'شبکه‌های بازگشتی (RNN) و مدل‌سازی توالی‌ها',
        subtitle: 'حافظه سلولی، LSTM و GRU در پردازش متن و داده‌های زمانی.',
        category: 'پردازش زبان طبیعی',
        level: 'intermediate',
        durationMinutes: 30,
        introDescription: 'حل چالش فراموشی بلندمدت و محوشدگی گرادیان با سلول‌های دروازه‌ای.',
        podcastTitle: 'پادکست: سفر در زمان داده‌ها با LSTM',
        podcastDuration: '۰۲:۱۵',
        objectives: [
          { id: 'ob-ai-3', title: 'فهم عملکرد دروازه فراموشی (Forget Gate)', description: 'مدیریت اطلاعات پیشین در توالی‌های طولانی.' }
        ],
        resourceRecommendation: {
          title: 'پردازش زبان طبیعی با یادگیری عمیق',
          author: 'کریستوفر منینگ',
          chapter: 'فصل ۳: RNNها و مدل‌های توالی',
          pageCount: 28,
          estimatedMinutes: 25,
          quote: '«زبان ذاتا ساختار توالی دارد و معنا وابسته به بافتار تاریخی جمله است.»',
          quoteCitation: 'منینگ',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu-DY6W-sZgHkNyVCI5pJSzqyoBGtg6b1rmdMqkq-xBZHW1ALzUTKNALw1CINlJjcqtb76AEF1X9PHb1dRp-kydhiyaWquHZ1AlIjgLe5diLwLVJS1RI9N6TWM_GlH4swDvTGSmObuk7oboBQdCujOe6Kn_S-z5rhVQAm_9_16XTvoIElhg9LZVNJd2bcgEfRB1uvzYwUB6_umGTke3S5OKXMXinztlar5tqUYVd1zia6YszbacOQN'
        },
        passage: {
          title: 'چالش گرادیان محوشونده در شبکه‌های بازگشتی',
          bookTitle: 'یادگیری عمیق',
          author: 'منینگ',
          chapter: 'فصل ۳',
          pageNumber: 85,
          totalPages: 320,
          estimatedMinutes: 8,
          highlightQuote: '«LSTM با ایجاد بزرگراه گرادیانی، جریان اطلاعات را تا صدها گام زمانی پایدار نگه می‌دارد.»',
          paragraphs: [
            'بدون سازوکار دروازه‌ای، گرادیان‌ها در توالی‌های طولانی نمایی کاهش یافته و یادگیری متوقف می‌شود.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۳ یادگیری عمیق',
          stepNumber: 3,
          questions: [
            {
              id: 'q-ai-3',
              question: 'نقش دروازه فراموشی (Forget Gate) در سلول LSTM چیست؟',
              category: 'معماری LSTM',
              options: [
                'تصمیم‌گیری در مورد اینکه کدام بخش از حالت سلول پیشین باید دور ریخته شود',
                'خاموش کردن کل شبکه',
                'افزایش نرخ یادگیری به دو برابر',
                'حذف واژگان نادرست املایی'
              ],
              correctIndex: 0,
              mentorFeedback: 'دروازه فراموشی با ضرب مقادیر بین ۰ و ۱ تعیین می‌کند چه مقدار از اطلاعات کهنه در سلول باقی بماند.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'واحدهای بازگشتی دروازه‌دار راه را برای درک توالی‌های پیوسته گشودند.',
        status: 'completed',
        startedAt: '2024-09-28T09:30:00.000Z',
        completedAt: '2024-10-02T15:00:00.000Z'
      },
      {
        id: 'step-ai-4',
        pathId: 'path-ai-deep-learning',
        stepNumber: 4,
        totalSteps: 6,
        title: 'مکانیسم توجه و مقاله Attention Is All You Need',
        subtitle: 'محاسبه ضرب ماتریسی پرس‌وجو، کلید و ارزش (Q, K, V) و توجه خودبه‌خودی.',
        category: 'معماری ترنسفورمر',
        level: 'advanced',
        durationMinutes: 35,
        introDescription: 'چگونه توجه همزمان به کل جمله، محدودیت‌های پردازش متوالی RNNها را شکست داد.',
        podcastTitle: 'پادکست: طلوع عصر ترنسفورمر',
        podcastDuration: '۰۲:۵۰',
        objectives: [
          { id: 'ob-ai-4', title: 'فرمول Scaled Dot-Product Attention', description: 'درک Softmax((QK^T)/sqrt(d_k)) * V.' }
        ],
        resourceRecommendation: {
          title: 'مقاله Attention Is All You Need',
          author: 'اشیش واسوانی و همکاران',
          chapter: 'بخش ۳: معماری مدل',
          pageCount: 15,
          estimatedMinutes: 20,
          quote: '«ما ترنسفورمر را پیشنهاد می‌کنیم؛ مدلی که کاملاً بر مکانیزم توجه تکیه دارد.»',
          quoteCitation: 'واسوانی',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwKwR28srhwcrpKO0iCmrlm4GyCmTzOeQ-q7niExsAI8xLrqZZdmh4oPHO_MBF4EkImLj6QIAe27hHlKkm3HMKc-3Z-2QFxWkKNMhAhOLqMNUlpSc2CNU4osQulcc6uRUsta62x4T9xHZvwes_5bJ_6HX7KYFPhrV11lw4-CVRiLipArB3QilWrGGCVss633lXo2-sj_NbEaWaTquErGI5e_G7iCI9gICB8B9d9-T6F8zpM5VTwH7N'
        },
        passage: {
          title: 'توجه مقیاس‌شده ضرب داخلی',
          bookTitle: 'مقاله‌های کلاسیک هوش مصنوعی',
          author: 'گوگل ریسرچ',
          chapter: 'بخش ۳.۲',
          pageNumber: 4,
          totalPages: 16,
          estimatedMinutes: 10,
          highlightQuote: '«توجه خودکار به هر کلمه اجازه می‌دهد پیوند مستقیمی با هر کلمه دیگر در جمله برقرار کند.»',
          paragraphs: [
            'تقسیم بر ریشه بُعد کلید (sqrt(d_k)) از ورود سافت‌مکس به نواحی با گرادیان بی‌نهایت کوچک جلوگیری می‌کند.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۴ یادگیری عمیق',
          stepNumber: 4,
          questions: [
            {
              id: 'q-ai-4',
              question: 'چرا در فرمول Attention حاصل ضرب QK^T بر ریشه d_k تقسیم می‌شود؟',
              category: 'ریاضیات توجه',
              options: [
                'برای جلوگیری از بزرگ شدن بیش‌ازحد مقادیر و اشباع تابع Softmax',
                'برای تبدیل ماتریس به بردار یک‌بعدی',
                'برای رمزنگاری مقادیر وزن‌ها',
                'برای کاهش تعداد لایه‌ها'
              ],
              correctIndex: 0,
              mentorFeedback: 'اگر ابعاد بزرگ باشد، ضرب داخلی بسیار بزرگ می‌شود و گرادیان سافت‌مکس به صفر میل می‌کند؛ تقسیم بر ریشه بُعد این اثر را خنثی می‌کند.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'مکانیزم توجه موازی‌سازی یادگیری در توالی‌های عظیم را ممکن ساخت.',
        status: 'completed',
        startedAt: '2024-10-05T09:00:00.000Z',
        completedAt: '2024-10-10T14:00:00.000Z'
      },
      {
        id: 'step-ai-5',
        pathId: 'path-ai-deep-learning',
        stepNumber: 5,
        totalSteps: 6,
        title: 'مدل‌های زبانی بزرگ (LLM) و پس‌آموزش با RLHF',
        subtitle: 'پیش‌آموزش خودنظارتی، تنظیم دقیق دستورالعمل و یادگیری تقویتی بر اساس بازخورد انسانی.',
        category: 'هوش مصنوعی زایشی',
        level: 'advanced',
        durationMinutes: 35,
        introDescription: 'شناخت مسیر تبدیل یک مدل پیش‌بینی‌کننده کلمه بعدی به یک دستیار هوشمند، مفید و ایمن.',
        podcastTitle: 'پادکست: راز هم‌راستاسازی هوش مصنوعی',
        podcastDuration: '۰۲:۳۵',
        objectives: [
          { id: 'ob-ai-5', title: 'مفهوم مدل پاداش (Reward Model) و الگوریتم PPO', description: 'هم‌راستاسازی خروجی مدل با ترجیحات انسانی.' }
        ],
        resourceRecommendation: {
          title: 'راهنمای جامع هوش مصنوعی مدرن',
          author: 'استوارت راسل',
          chapter: 'فصل ۲۶: مدل‌های بنیانی و اخلاق ماشین',
          pageCount: 30,
          estimatedMinutes: 25,
          quote: '«پیش‌آموزش به مدل دانش می‌دهد، اما هم‌راستاسازی به آن شخصیت و کاربردپذیری می‌بخشد.»',
          quoteCitation: 'استوارت راسل',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsvj_DjEj6Q7gyOsc5PF0z8ukLQ-g6uyH_x4xCtB7apgm8hkvtMgMAfyKcomMa3PIhWyMs8ZxecWqek-W8Y5jJ8seTbFjTObcojZSnzuMcq90RjMgpvnQqKPd37c1XcRjPdSCqnmPvsca8u92xxBXz653J4yTvquJobejrfJZQaQ7r123YFnu-N3oRjd7Jw0FgQ6l7uxRxmoXWoHXrJFD3g-_9RN-QRvhHZyEzSdXkL5JdZrS2J89y'
        },
        passage: {
          title: 'هم‌راستاسازی زبانی با بازخورد انسانی',
          bookTitle: 'هوش مصنوعی نوین',
          author: 'راسل و نورویگ',
          chapter: 'فصل ۲۶',
          pageNumber: 940,
          totalPages: 1100,
          estimatedMinutes: 10,
          highlightQuote: '«مدل پاداش معیاری عددی برای ارزیابی کیفیت و صداقت پاسخ‌های تولیدی ارائه می‌دهد.»',
          paragraphs: [
            'با استفاده از بازخوردهای انسانی، مدل تقویتی یاد می‌گیرد پاسخ‌هایی مفید، صادق و بدون سوگیری تولید کند.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۵ یادگیری عمیق',
          stepNumber: 5,
          questions: [
            {
              id: 'q-ai-5',
              question: 'هدف اصلی مرحله RLHF در توسعه مدل‌های زبانی چیست؟',
              category: 'هم‌راستاسازی هوش مصنوعی',
              options: [
                'هم‌راستاکردن رفتار و پاسخ‌های مدل با مقاصد، ارزش‌ها و انتظارات ایمنی انسان',
                'کاهش اندازه وزن‌های مدل روی دیسک',
                'ترجمه کدهای پایتون به C++',
                'جلوگیری از اتصال مدل به اینترنت'
              ],
              correctIndex: 0,
              mentorFeedback: 'RLHF رفتار مدل را هدایت می‌کند تا از تولید پاسخ‌های مبهم، خطرناک یا نامربوط خودداری کند.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'هم‌راستاسازی پلی حیاتی میان قدرت محاسباتی خام و تجربه کاربری مفید است.',
        status: 'current',
        startedAt: '2024-10-12T10:00:00.000Z'
      },
      {
        id: 'step-ai-6',
        pathId: 'path-ai-deep-learning',
        stepNumber: 6,
        totalSteps: 6,
        title: 'استدلال زنجیره‌ای و عاملیت‌های هوشمند (AI Agents)',
        subtitle: 'فراخوانی ابزار، ساختارهای ReAct و سیستم‌های چندعاملی خودمختار.',
        category: 'عامل‌های هوشمند',
        level: 'advanced',
        durationMinutes: 40,
        introDescription: 'چگونه مدل‌های زبانی می‌توانند برنامه‌ریزی کنند، ابزارهای خارجی را به کار گیرند و مسائل پیچیده را حل نمایند.',
        podcastTitle: 'پادکست: تولد عامل‌های هوشمند مستقل',
        podcastDuration: '۰۳:۰۰',
        objectives: [
          { id: 'ob-ai-6', title: 'درک چارچوب ReAct (Reason + Act)', description: 'هم‌افزایی استدلال زنجیره‌ای و تعامل با محیط.' }
        ],
        resourceRecommendation: {
          title: 'سیستم‌های چندعاملی و هوش مصنوعی مستقل',
          author: 'مایکل وولدریج',
          chapter: 'فصل ۱: تعریف عاملیت و استدلال تعاملی',
          pageCount: 30,
          estimatedMinutes: 25,
          quote: '«عاملیت توانایی ادراک، تصمیم‌گیری و اجرای عمل برای تغییر جهان است.»',
          quoteCitation: 'وولدریج',
          coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCGpekdp-BDMqQrSoEVoIwr6MDMJOAcKe8RmQVnZ0pf08PyHVoLkF3oa6EpD7VcOIho5nDFhBBKf09kRIAg4BnNDvbSu-qlmK4jxydXnSflavJg5qvvzB3KvIXn2FS59lwIsUu2o5Clnarw0Xfb4b9Z6GD2sFs-fFz5vbv2ydGBVJ3kl-JU8HXWfuGfIVNMEYU3talbDBkpvf8oiXrPIlFMW1AzEGQnBmrBi4bsMvm1H0jUzg-Wan'
        },
        passage: {
          title: 'استدلال زنجیره‌ای برای حل مسائل چندمرحله‌ای',
          bookTitle: 'عامل‌های هوشمند',
          author: 'وولدریج',
          chapter: 'فصل ۴',
          pageNumber: 88,
          totalPages: 360,
          estimatedMinutes: 10,
          highlightQuote: '«فکر کردن قبل از عمل، درصد خطای تصمیم‌گیری هوش مصنوعی را به شدت کاهش می‌دهد.»',
          paragraphs: [
            'عامل‌های هوشمند با شکستن اهداف بزرگ به زیرمسائل و استفاده از ابزارها قادر به پردازش اطلاعات محیطی هستند.'
          ]
        },
        quiz: {
          title: 'سنجش پله ۶ یادگیری عمیق',
          stepNumber: 6,
          questions: [
            {
              id: 'q-ai-6',
              question: 'تفاوت یک AI Agent با یک LLM معمولی چیست؟',
              category: 'عاملیت هوشمند',
              options: [
                'عامل توانایی برنامه‌ریزی، استفاده از ابزارهای خارجی و حلقه بازخورد از محیط را دارد',
                'عامل‌ها نیازی به ترنسفورمر ندارند',
                'عامل‌ها حافظه را حذف می‌کنند',
                'عامل‌ها فقط بر روی کامپیوترهای کوانتومی اجرا می‌شوند'
              ],
              correctIndex: 0,
              mentorFeedback: 'عامل هوشمند با درک محیط، برنامه‌ریزی و فراخوانی ابزارها (APIs) به یک فاعل فعال تبدیل می‌شود.',
              wisdomPoints: 20
            }
          ]
        },
        keyTakeaway: 'ترکیب تفکر زنجیره‌ای و ابزارها افق نوین عاملیت خودمختار را شکل داده است.',
        status: 'locked'
      }
    ]
  };

  const demoAliBooks: BookItem[] = [
    {
      id: 'book-ali-1',
      userId: demoAliId,
      title: 'یادگیری عمیق',
      author: 'ایان گودفلو',
      coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCGpekdp-BDMqQrSoEVoIwr6MDMJOAcKe8RmQVnZ0pf08PyHVoLkF3oa6EpD7VcOIho5nDFhBBKf09kRIAg4BnNDvbSu-qlmK4jxydXnSflavJg5qvvzB3KvIXn2FS59lwIsUu2o5Clnarw0Xfb4b9Z6GD2sFs-fFz5vbv2ydGBVJ3kl-JU8HXWfuGfIVNMEYU3talbDBkpvf8oiXrPIlFMW1AzEGQnBmrBi4bsMvm1H0jUzg-Wan',
      edition: 'MIT Press',
      status: 'reading',
      progressPercent: 67,
      currentPage: 320,
      totalPages: 700,
      pathId: demoAliPath.id,
      pathTitle: demoAliPath.title,
      notesCount: 2,
      lastRead: 'امروز',
      summary: 'مرجع استاندارد و عمیق تئوری شبکه‌های عصبی.'
    }
  ];

  const demoAliNotes: NoteItem[] = [
    {
      id: 'note-ali-1',
      userId: demoAliId,
      stepId: 'step-ai-4',
      stepTitle: 'مکانیسم توجه و Attention Is All You Need',
      bookTitle: 'مقاله ترنسفورمر',
      quote: '«Attention is All You Need»',
      text: 'تقسیم بر sqrt(d_k) برای پایداری شیب در مقیاس‌های بزرگ ریاضی ضروری است.',
      createdAt: '2024-10-10T14:30:00.000Z'
    }
  ];

  // 3. Demo User: Fresh Account (Clean state, 0 progress, 0 paths)
  const demoFreshId = 'demo-fresh';
  const demoFreshUser: UserProfile = {
    id: demoFreshId,
    name: 'کاربر تازه‌کار (حساب خالی)',
    phone: '09120000000',
    isPhoneVerified: true,
    isDemo: true,
    email: 'newbie@demo.palle.ir',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW',
    bio: 'حساب کاربری جدید برای آزمایش حالت بدون فعالیت و ساخت نخستین مسیر',
    joinDate: new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(new Date()),
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

  return {
    users: {
      [demoSaraId]: demoSaraUser,
      [demoAliId]: demoAliUser,
      [demoFreshId]: demoFreshUser,
    },
    sessions: {},
    otps: {},
    paths: {
      [demoSaraId]: [demoSaraPath],
      [demoAliId]: [demoAliPath],
      [demoFreshId]: [],
    },
    books: {
      [demoSaraId]: demoSaraBooks,
      [demoAliId]: demoAliBooks,
      [demoFreshId]: [],
    },
    notes: {
      [demoSaraId]: demoSaraNotes,
      [demoAliId]: demoAliNotes,
      [demoFreshId]: [],
    },
    chats: {},
    quizAttempts: {},
  };
}

export class PalleStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure schema integrity & demo users presence
        const initial = getInitialDatabase();
        if (!parsed.users) parsed.users = {};
        if (!parsed.sessions) parsed.sessions = {};
        if (!parsed.otps) parsed.otps = {};
        if (!parsed.paths) parsed.paths = {};
        if (!parsed.books) parsed.books = {};
        if (!parsed.notes) parsed.notes = {};
        if (!parsed.chats) parsed.chats = {};
        if (!parsed.quizAttempts) parsed.quizAttempts = {};

        // Guarantee demo profiles exist and are ready
        for (const demoId of ['demo-sara', 'demo-ali', 'demo-fresh']) {
          if (!parsed.users[demoId]) {
            parsed.users[demoId] = initial.users[demoId];
            parsed.paths[demoId] = initial.paths[demoId] || [];
            parsed.books[demoId] = initial.books[demoId] || [];
            parsed.notes[demoId] = initial.notes[demoId] || [];
          }
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error reading db file, reinitializing default data:', e);
    }
    const initial = getInitialDatabase();
    this.save(initial);
    return initial;
  }

  private save(data = this.data): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db file:', e);
    }
  }

  // ===================== USER MANAGEMENT =====================
  public getUser(id: string): UserProfile | undefined {
    return this.data.users[id];
  }

  public getUserByPhone(phone: string): UserProfile | undefined {
    const norm = normalizeIranianPhone(phone);
    if (!norm.valid) return undefined;
    return Object.values(this.data.users).find((u) => u.phone === norm.normalized);
  }

  public getAllDemoUsers(): UserProfile[] {
    return Object.values(this.data.users).filter((u) => u.isDemo);
  }

  public createUser(user: UserProfile): UserProfile {
    this.data.users[user.id] = user;
    if (!this.data.paths[user.id]) this.data.paths[user.id] = [];
    if (!this.data.books[user.id]) this.data.books[user.id] = [];
    if (!this.data.notes[user.id]) this.data.notes[user.id] = [];
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<UserProfile>): UserProfile | undefined {
    const existing = this.data.users[id];
    if (!existing) return undefined;
    this.data.users[id] = {
      ...existing,
      ...updates,
      preferences: { ...existing.preferences, ...updates.preferences },
    };
    this.save();
    return this.data.users[id];
  }

  // ===================== SESSION MANAGEMENT =====================
  public createSession(userId: string): string {
    const token = 'plt_' + crypto.randomBytes(24).toString('hex');
    const now = new Date().toISOString();
    this.data.sessions[token] = {
      token,
      userId,
      createdAt: now,
      lastUsedAt: now,
    };
    this.save();
    return token;
  }

  public getSessionUser(token: string): UserProfile | undefined {
    if (!token) return undefined;
    const session = this.data.sessions[token];
    if (!session) return undefined;
    session.lastUsedAt = new Date().toISOString();
    return this.data.users[session.userId];
  }

  public deleteSession(token: string): boolean {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.save();
      return true;
    }
    return false;
  }

  // ===================== OTP AUTHENTICATION =====================
  public createOrUpdateOtp(
    phone: string,
    name?: string,
    purpose: 'login' | 'register' = 'login'
  ): { success: boolean; code?: string; expiresAt?: number; error?: string; retryAfterSeconds?: number } {
    const norm = normalizeIranianPhone(phone);
    if (!norm.valid) {
      return { success: false, error: norm.error };
    }

    const normalized = norm.normalized;
    const now = Date.now();
    const existing = this.data.otps[normalized];

    // Rate-limit: 60s cooldown
    if (existing && now - existing.lastSentAt < 60_000) {
      const wait = Math.ceil((60_000 - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        error: `لطفاً ${wait} ثانیه تا درخواست مجدد کد تایید شکیبا باشید.`,
        retryAfterSeconds: wait,
      };
    }

    // 6-digit cryptographic OTP code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 120_000; // 2 minutes expiry

    this.data.otps[normalized] = {
      phone: normalized,
      code: randomCode,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
      name: name?.trim() || existing?.name,
      purpose,
    };

    this.save();
    return { success: true, code: randomCode, expiresAt };
  }

  public verifyOtp(
    phone: string,
    code: string,
    name?: string,
    guestData?: { paths?: LearningPath[]; books?: BookItem[]; notes?: NoteItem[] },
    avatarUrl?: string
  ): { success: boolean; user?: UserProfile; token?: string; error?: string } {
    const norm = normalizeIranianPhone(phone);
    if (!norm.valid) {
      return { success: false, error: norm.error };
    }

    const normalized = norm.normalized;
    const record = this.data.otps[normalized];

    if (!record) {
      return { success: false, error: 'کد تایید منقضی شده است یا درخواستی برای این شماره ثبت نشده است.' };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      delete this.data.otps[normalized];
      this.save();
      return { success: false, error: 'کد تایید منقضی شده است. لطفاً کد جدید درخواست کنید.' };
    }

    if (record.attempts >= 3) {
      delete this.data.otps[normalized];
      this.save();
      return { success: false, error: 'تعداد دفعات ورود اشتباه بیش از ۳ بار بوده است. لطفاً مجدداً کد درخواست نمایید.' };
    }

    if (record.code !== code.trim()) {
      record.attempts += 1;
      this.save();
      const left = 3 - record.attempts;
      return {
        success: false,
        error: left > 0 ? `کد تایید نادرست است. (${left} بار تلاش باقی مانده)` : 'کد تایید نامعتبر است و باطل شد.',
      };
    }

    // Code verified successfully!
    delete this.data.otps[normalized];

    const defaultNeutralAvatar =
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW';

    // Find or create user
    let user = this.getUserByPhone(normalized);
    if (!user) {
      const finalName = (name || record.name || 'کاربر گرامی').trim();
      const finalAvatar = avatarUrl?.trim() || defaultNeutralAvatar;
      const newId = `user-${Date.now()}`;
      user = {
        id: newId,
        name: finalName,
        phone: normalized,
        isPhoneVerified: true,
        isDemo: false,
        email: `${normalized}@user.palle.ir`,
        avatarUrl: finalAvatar,
        bio: 'عضو پله • مسیر اختصاصی یادگیری عمیق',
        joinDate: new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(new Date()),
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
      this.createUser(user);
    } else {
      user.isPhoneVerified = true;
      if (name?.trim() && user.name === 'کاربر گرامی') {
        user.name = name.trim();
      }
      if (avatarUrl?.trim()) {
        user.avatarUrl = avatarUrl.trim();
      }
      this.save();
    }

    // Migrate any guest progress into this authenticated user account
    if (guestData) {
      this.migrateGuestData(user.id, guestData);
    }

    const token = this.createSession(user.id);
    return { success: true, user, token };
  }

  public migrateGuestData(
    userId: string,
    guestData?: { paths?: LearningPath[]; books?: BookItem[]; notes?: NoteItem[] }
  ): { migratedPathsCount: number } {
    if (!guestData) return { migratedPathsCount: 0 };

    let count = 0;
    if (!this.data.paths[userId]) this.data.paths[userId] = [];
    if (!this.data.books[userId]) this.data.books[userId] = [];
    if (!this.data.notes[userId]) this.data.notes[userId] = [];

    if (Array.isArray(guestData.paths) && guestData.paths.length > 0) {
      for (const p of guestData.paths) {
        const migratedPath: LearningPath = {
          ...p,
          id: p.id && !p.id.startsWith('path-temp-') ? p.id : `path-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
        };
        const existingIdx = this.data.paths[userId].findIndex((x) => x.id === migratedPath.id || x.title === migratedPath.title);
        if (existingIdx !== -1) {
          this.data.paths[userId][existingIdx] = migratedPath;
        } else {
          this.data.paths[userId].unshift(migratedPath);
          count++;
        }
      }
    }

    if (Array.isArray(guestData.books) && guestData.books.length > 0) {
      for (const b of guestData.books) {
        const migratedBook: BookItem = { ...b, userId };
        const exists = this.data.books[userId].some((x) => x.id === migratedBook.id || x.title === migratedBook.title);
        if (!exists) {
          this.data.books[userId].unshift(migratedBook);
        }
      }
    }

    if (Array.isArray(guestData.notes) && guestData.notes.length > 0) {
      for (const n of guestData.notes) {
        const migratedNote: NoteItem = { ...n, userId };
        const exists = this.data.notes[userId].some((x) => x.id === migratedNote.id || x.text === migratedNote.text);
        if (!exists) {
          this.data.notes[userId].unshift(migratedNote);
        }
      }
    }

    const user = this.data.users[userId];
    if (user) {
      user.activePathsCount = this.data.paths[userId].filter((p) => p.status === 'in_progress').length;
      const hasCompleted = this.data.paths[userId].some((p) => p.steps?.some((s) => s.status === 'completed'));
      if (hasCompleted && user.streakDays === 0) {
        user.streakDays = 1;
      }
    }

    this.save();
    return { migratedPathsCount: count };
  }

  // ===================== LEARNING PATHS & PROGRESS =====================
  public getPaths(userId: string): LearningPath[] {
    return this.data.paths[userId] || [];
  }

  public getPath(userId: string, pathId: string): LearningPath | undefined {
    const paths = this.getPaths(userId);
    return paths.find((p) => p.id === pathId);
  }

  public addPath(userId: string, path: LearningPath): LearningPath {
    if (!this.data.paths[userId]) this.data.paths[userId] = [];
    
    // Ensure newly created path is unstarted
    path.status = 'not_started';
    path.progressPercent = 0;
    path.currentStepIndex = 0;
    if (path.steps && path.steps.length > 0) {
      path.steps.forEach((s, idx) => {
        s.status = idx === 0 ? 'available' : 'locked';
        s.completedAt = undefined;
        s.startedAt = undefined;
      });
    }

    this.data.paths[userId].unshift(path);

    // Sync active paths count strictly to actually started/in-progress paths
    const user = this.data.users[userId];
    if (user) {
      user.activePathsCount = this.data.paths[userId].filter((p) => p.status === 'in_progress').length;
    }
    this.save();
    return path;
  }

  public startPath(userId: string, pathId: string): LearningPath | undefined {
    const path = this.getPath(userId, pathId);
    if (!path) return undefined;

    path.status = 'in_progress';
    if (!path.startedAt) {
      path.startedAt = new Date().toISOString();
    }
    path.lastActivityAt = new Date().toISOString();

    if (path.steps && path.steps.length > 0) {
      if (path.steps[0].status === 'locked' || path.steps[0].status === 'available') {
        path.steps[0].status = 'current';
        path.steps[0].startedAt = new Date().toISOString();
      }
    }

    // Update active paths count
    const user = this.data.users[userId];
    if (user) {
      user.activePathsCount = this.data.paths[userId].filter((p) => p.status === 'in_progress').length;
    }
    this.save();
    return path;
  }

  public startStep(userId: string, pathId: string, stepId: string): { path: LearningPath; step: LearningStep } | undefined {
    const path = this.getPath(userId, pathId);
    if (!path) return undefined;

    const step = path.steps.find((s) => s.id === stepId);
    if (!step) return undefined;

    // Mark path as in_progress if not yet started
    path.status = 'in_progress';
    if (!path.startedAt) path.startedAt = new Date().toISOString();
    path.lastActivityAt = new Date().toISOString();

    if (step.status !== 'completed') {
      step.status = 'current';
      if (!step.startedAt) step.startedAt = new Date().toISOString();
    }

    const stepIndex = path.steps.findIndex((s) => s.id === stepId);
    if (stepIndex !== -1) {
      path.currentStepIndex = stepIndex;
    }

    const user = this.data.users[userId];
    if (user) {
      user.activePathsCount = this.data.paths[userId].filter((p) => p.status === 'in_progress').length;
    }
    this.save();
    return { path, step };
  }

  public completeStep(
    userId: string,
    pathId: string,
    stepId: string
  ): { path: LearningPath; nextStep?: LearningStep } | undefined {
    const path = this.getPath(userId, pathId);
    if (!path) return undefined;

    const stepIndex = path.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return undefined;

    const currentStep = path.steps[stepIndex];
    currentStep.status = 'completed';
    currentStep.completedAt = new Date().toISOString();

    // Unlock next step
    let nextStep: LearningStep | undefined;
    if (stepIndex + 1 < path.steps.length) {
      path.steps[stepIndex + 1].status = 'current';
      path.steps[stepIndex + 1].startedAt = new Date().toISOString();
      path.currentStepIndex = stepIndex + 1;
      nextStep = path.steps[stepIndex + 1];
    }

    // Accurately calculate progress % based on real records
    const completedCount = path.steps.filter((s) => s.status === 'completed').length;
    path.progressPercent = Math.round((completedCount / path.steps.length) * 100);
    path.lastActivityAt = new Date().toISOString();

    if (completedCount === path.steps.length) {
      path.status = 'completed';
      path.completedAt = new Date().toISOString();
    } else {
      path.status = 'in_progress';
    }

    // Update user streak & active paths
    const user = this.data.users[userId];
    if (user) {
      user.streakDays = Math.max(1, (user.streakDays || 0) + 1);
      user.activePathsCount = this.data.paths[userId].filter((p) => p.status === 'in_progress').length;
    }

    this.save();
    return { path, nextStep };
  }

  public recordQuizAttempt(
    userId: string,
    pathId: string,
    stepId: string,
    score: number,
    maxScore: number,
    answers: number[]
  ): QuizAttemptRecord {
    if (!this.data.quizAttempts[userId]) {
      this.data.quizAttempts[userId] = [];
    }

    const record: QuizAttemptRecord = {
      id: `quiz-att-${Date.now()}`,
      userId,
      pathId,
      stepId,
      score,
      maxScore,
      answers,
      completedAt: new Date().toISOString(),
    };

    this.data.quizAttempts[userId].push(record);
    this.save();
    return record;
  }

  // ===================== LIBRARY =====================
  public getBooks(userId: string): BookItem[] {
    return this.data.books[userId] || [];
  }

  public addBook(userId: string, book: BookItem): BookItem {
    if (!this.data.books[userId]) this.data.books[userId] = [];
    this.data.books[userId].unshift(book);
    this.save();
    return book;
  }

  public updateBook(userId: string, bookId: string, updates: Partial<BookItem>): BookItem | undefined {
    const books = this.data.books[userId] || [];
    const index = books.findIndex((b) => b.id === bookId);
    if (index === -1) return undefined;
    books[index] = { ...books[index], ...updates };
    this.save();
    return books[index];
  }

  // ===================== NOTES =====================
  public getNotes(userId: string): NoteItem[] {
    return this.data.notes[userId] || [];
  }

  public addNote(userId: string, note: NoteItem): NoteItem {
    if (!this.data.notes[userId]) this.data.notes[userId] = [];
    this.data.notes[userId].unshift(note);
    this.save();
    return note;
  }

  public deleteNote(userId: string, noteId: string): boolean {
    const notes = this.data.notes[userId] || [];
    this.data.notes[userId] = notes.filter((n) => n.id !== noteId);
    this.save();
    return true;
  }

  // ===================== CHAT =====================
  public getChat(threadId: string): AssistantMessage[] {
    return this.data.chats[threadId] || [];
  }

  public addChatMessage(threadId: string, message: AssistantMessage): void {
    if (!this.data.chats[threadId]) this.data.chats[threadId] = [];
    this.data.chats[threadId].push(message);
    this.save();
  }
}

export const palleStore = new PalleStore();
