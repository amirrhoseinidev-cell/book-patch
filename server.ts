import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { palleStore, normalizeIranianPhone } from './server/store';
import { generateLearningPathWithAI, askAssistantWithAI } from './server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Extend Express Request type with authenticated user
interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: ReturnType<typeof palleStore.getUser>;
}

// Extract bearer token from Authorization header or custom headers
function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const xAuth = req.headers['x-auth-token'] as string;
  if (xAuth) {
    return xAuth.trim();
  }
  return null;
}

// Authentication middleware enforcing real user ownership
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'احراز هویت الزامی است. لطفاً وارد حساب کاربری خود شوید.' });
  }

  const user = palleStore.getSessionUser(token);
  if (!user) {
    return res.status(401).json({ error: 'نشست کاربری شما منقضی شده است. لطفاً مجدداً وارد شوید.' });
  }

  req.userId = user.id;
  req.user = user;
  next();
}

// Optional Auth middleware (e.g. for endpoints that can adapt if user is logged in)
function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const user = palleStore.getSessionUser(token);
    if (user) {
      req.userId = user.id;
      req.user = user;
    }
  }
  next();
}

// Helper to send SMS or fallback to dev testing mode
async function dispatchSms(phone: string, code: string): Promise<{ sent: boolean; isDevMode: boolean; error?: string }> {
  const apiKey = process.env.SMS_PROVIDER_API_KEY || process.env.KAVENEGAR_API_KEY;

  if (!apiKey) {
    // Development testing mode: explicitly log to server stdout
    console.log('\n======================================================');
    console.log(' [PALLE AUTH SMS - DEVELOPMENT TESTING MODE]');
    console.log(` Recipient Phone: ${phone}`);
    console.log(` SMS OTP Verification Code: >>> ${code} <<<`);
    console.log(' Note: SMS_PROVIDER_API_KEY is not configured.');
    console.log(' The code is provided to client UI for testing.');
    console.log('======================================================\n');
    return { sent: false, isDevMode: true };
  }

  try {
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?receptor=${phone}&token=${code}&template=palle-verify`;
    const resp = await fetch(url, { method: 'POST' });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok && data.return?.status === 200) {
      return { sent: true, isDevMode: false };
    }

    // Fallback simple message send
    const simpleUrl = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${phone}&message=${encodeURIComponent(
      `کد تایید ورود به پله: ${code}`
    )}`;
    const resp2 = await fetch(simpleUrl, { method: 'POST' });
    if (resp2.ok) {
      return { sent: true, isDevMode: false };
    }

    return { sent: false, isDevMode: true, error: 'خطا در برقراری ارتباط با پنل پیامک خارجی' };
  } catch (err: any) {
    console.error('Error dispatching SMS:', err);
    return { sent: false, isDevMode: true, error: err.message };
  }
}

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Palle',
    smsConfigured: Boolean(process.env.SMS_PROVIDER_API_KEY || process.env.KAVENEGAR_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Demo accounts catalog
app.get('/api/auth/demos', (req: Request, res: Response) => {
  const demos = palleStore.getAllDemoUsers().map((u) => {
    const paths = palleStore.getPaths(u.id);
    const activePath = paths.find((p) => p.status === 'in_progress') || paths[0];
    return {
      id: u.id,
      name: u.name,
      phone: u.phone,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      streakDays: u.streakDays,
      activePathTitle: activePath ? activePath.title : null,
      progressPercent: activePath ? activePath.progressPercent : 0,
      totalPaths: paths.length,
    };
  });
  return res.json({ demos });
});

// Demo Login (Instant testing with dedicated demo accounts)
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  const { demoId } = req.body;
  const user = palleStore.getUser(demoId);

  if (!user || !user.isDemo) {
    return res.status(404).json({ error: 'حساب نمایشی مورد نظر یافت نشد.' });
  }

  const token = palleStore.createSession(user.id);
  return res.json({
    success: true,
    token,
    user,
    message: `ورود با حساب نمایشی «${user.name}» انجام شد.`,
  });
});

// 1. Send SMS OTP for Registration or Login
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { phone, name, purpose } = req.body;

  const phoneCheck = normalizeIranianPhone(phone);
  if (!phoneCheck.valid) {
    return res.status(400).json({ error: phoneCheck.error });
  }

  const existingUser = palleStore.getUserByPhone(phoneCheck.normalized);
  const isNewUser = !existingUser;

  if (purpose === 'login' && isNewUser) {
    return res.status(404).json({
      error: 'حساب کاربری با این شماره موبایل یافت نشد. لطفاً ابتدا ثبت نام فرمایید.',
      isNewUser: true,
    });
  }

  const otpResult = palleStore.createOrUpdateOtp(phoneCheck.normalized, name, purpose || (isNewUser ? 'register' : 'login'));
  if (!otpResult.success || !otpResult.code) {
    return res.status(429).json({ error: otpResult.error, retryAfterSeconds: otpResult.retryAfterSeconds });
  }

  // Dispatch SMS via provider or dev mode
  const smsOutcome = await dispatchSms(phoneCheck.normalized, otpResult.code);

  return res.json({
    success: true,
    phone: phoneCheck.normalized,
    isNewUser,
    expiresAt: otpResult.expiresAt,
    isDevMode: smsOutcome.isDevMode,
    devOtp: smsOutcome.isDevMode ? otpResult.code : undefined,
    message: smsOutcome.isDevMode
      ? 'حالت آزمایشی: سرویس پیامک خارجی تنظیم نشده است؛ کد تایید به صورت تستی نمایش داده می‌شود.'
      : 'کد تایید با موفقیت از طریق پیامک ارسال شد.',
  });
});

// 2. Verify SMS OTP and complete login / register (with optional guest data migration)
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, code, name, guestData, avatarUrl } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'شماره موبایل و کد تایید الزامی است.' });
  }

  const verifyResult = palleStore.verifyOtp(phone, code, name, guestData, avatarUrl);
  if (!verifyResult.success || !verifyResult.user || !verifyResult.token) {
    return res.status(400).json({ error: verifyResult.error || 'کد تایید نامعتبر است.' });
  }

  return res.json({
    success: true,
    token: verifyResult.token,
    user: verifyResult.user,
    message: `خوش آمدید، ${verifyResult.user.name}`,
  });
});

// 3. Migrate guest progress into an authenticated user account
app.post('/api/auth/migrate-guest', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const guestData = req.body;
  const result = palleStore.migrateGuestData(userId, guestData);
  const updatedUser = palleStore.getUser(userId);
  const paths = palleStore.getPaths(userId);

  return res.json({
    success: true,
    migratedPathsCount: result.migratedPathsCount,
    user: updatedUser,
    paths,
    message: 'پیشرفت حالت مهمان با موفقیت به حساب کاربری منتقل شد.',
  });
});

// Get current authenticated user
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = extractToken(req);
  if (token) {
    palleStore.deleteSession(token);
  }
  return res.json({ success: true, message: 'با موفقیت خارج شدید.' });
});

// Profile endpoints
app.get('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

app.patch('/api/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const updated = palleStore.updateUser(userId, req.body);
  return res.json({ user: updated });
});

// Dashboard summary: strictly calculated from authenticated user's records
app.get('/api/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const user = req.user!;
  const paths = palleStore.getPaths(userId);
  const books = palleStore.getBooks(userId);
  const notes = palleStore.getNotes(userId);

  // Active path: must be strictly an in_progress path with progress < 100
  const activePath = paths.find((p) => p.status === 'in_progress' && p.progressPercent < 100);

  // Statistics calculated from real records
  let completedStepsCount = 0;
  let totalStepsCount = 0;
  for (const p of paths) {
    completedStepsCount += p.steps.filter((s) => s.status === 'completed').length;
    totalStepsCount += p.steps.length;
  }

  return res.json({
    user,
    activePath: activePath || null,
    paths,
    books,
    notesCount: notes.length,
    statistics: {
      completedStepsCount,
      totalStepsCount,
      inProgressPathsCount: paths.filter((p) => p.status === 'in_progress').length,
      totalPathsCount: paths.length,
    },
  });
});

// Learning Path generation with AI (Scoped to user if authenticated, or returned directly for guests)
app.post('/api/learning-paths/generate', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'guest';
    const { topic, level, goal, dailyMinutes } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'موضوع یادگیری الزامی است.' });
    }

    const generatedPath = await generateLearningPathWithAI({
      userId,
      topic: String(topic).trim(),
      level: level || 'intermediate',
      goal: goal || 'درک اصول و جهان‌بینی کلی',
      dailyMinutes: (Number(dailyMinutes) as any) || 20,
    });

    // If authenticated user, save to server database
    if (req.userId) {
      const saved = palleStore.addPath(userId, generatedPath);

      // Add recommended resource to user's library if available
      if (saved.steps[0]?.resourceRecommendation) {
        const rec = saved.steps[0].resourceRecommendation;
        palleStore.addBook(userId, {
          id: `book-${Date.now()}`,
          userId,
          title: rec.title,
          author: rec.author,
          translator: rec.translator,
          coverImage: rec.coverImage,
          status: 'reading',
          progressPercent: 0,
          currentPage: 1,
          totalPages: rec.pageCount || 90,
          pathId: saved.id,
          pathTitle: `مسیر: ${saved.title}`,
          notesCount: 0,
          lastRead: 'هم‌اکنون',
          summary: rec.quote,
        });
      }

      return res.json({ path: saved });
    }

    // For guest users, return the generated path directly to client without saving on server
    generatedPath.status = 'not_started';
    generatedPath.progressPercent = 0;
    generatedPath.currentStepIndex = 0;
    if (generatedPath.steps) {
      generatedPath.steps.forEach((s, idx) => {
        s.status = idx === 0 ? 'available' : 'locked';
      });
    }

    return res.json({ path: generatedPath });
  } catch (err: any) {
    console.error('Error generating learning path:', err);
    return res.status(500).json({ error: 'خطا در تولید مسیر یادگیری هوشمند.' });
  }
});

// Learning Paths list and details
app.get('/api/learning-paths', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const paths = palleStore.getPaths(userId);
  return res.json({ paths });
});

app.get('/api/learning-paths/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const pathId = req.params.id;
  const pathItem = palleStore.getPath(userId, pathId);
  if (!pathItem) {
    return res.status(404).json({ error: 'مسیر یادگیری یافت نشد.' });
  }
  return res.json({ path: pathItem });
});

// Explicitly start a learning path
app.post('/api/learning-paths/:id/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const pathId = req.params.id;
  const started = palleStore.startPath(userId, pathId);
  if (!started) {
    return res.status(404).json({ error: 'مسیر یادگیری یافت نشد.' });
  }
  return res.json({ path: started });
});

// Explicitly start a step
app.post('/api/steps/:pathId/:stepId/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { pathId, stepId } = req.params;
  const result = palleStore.startStep(userId, pathId, stepId);
  if (!result) {
    return res.status(404).json({ error: 'پله یا مسیر مورد نظر یافت نشد.' });
  }
  return res.json(result);
});

// Step Completion
app.post('/api/steps/:pathId/:stepId/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { pathId, stepId } = req.params;

  const result = palleStore.completeStep(userId, pathId, stepId);
  if (!result) {
    return res.status(404).json({ error: 'پله یا مسیر مورد نظر یافت نشد.' });
  }

  return res.json({
    success: true,
    path: result.path,
    nextStep: result.nextStep,
  });
});

// Quiz Submission
app.post('/api/steps/:pathId/:stepId/quiz-submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { pathId, stepId } = req.params;
  const { score, maxScore, answers } = req.body;

  palleStore.recordQuizAttempt(userId, pathId, stepId, Number(score) || 0, Number(maxScore) || 20, answers || []);

  const result = palleStore.completeStep(userId, pathId, stepId);
  if (!result) {
    return res.status(404).json({ error: 'پله یا مسیر مورد نظر یافت نشد.' });
  }

  return res.json({
    success: true,
    path: result.path,
    nextStep: result.nextStep,
  });
});

// Library endpoints
app.get('/api/library', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const books = palleStore.getBooks(userId);
  return res.json({ books });
});

app.post('/api/library/add', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { title, author, translator, coverImage, pathId, pathTitle, totalPages, summary } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'عنوان کتاب الزامی است.' });
  }

  const newBook = palleStore.addBook(userId, {
    id: `book-${Date.now()}`,
    userId,
    title,
    author: author || 'نویسنده مرجع',
    translator,
    coverImage:
      coverImage ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
    status: 'reading',
    progressPercent: 0,
    currentPage: 1,
    totalPages: totalPages || 100,
    pathId,
    pathTitle,
    notesCount: 0,
    lastRead: 'هم‌اکنون',
    summary,
  });

  return res.json({ book: newBook });
});

// AI Assistant Chat grounded in passage
app.post('/api/assistant/ask', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, passageContext, stepTitle, threadId } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'متن پرسش الزامی است.' });
    }

    const user = req.user;
    const answer = await askAssistantWithAI({
      question: String(question).trim(),
      passageContext,
      stepTitle,
      aiTone: user?.preferences?.aiTone || 'socratic',
    });

    if (threadId) {
      palleStore.addChatMessage(threadId, {
        id: `user-${Date.now()}`,
        role: 'user',
        text: question,
        timestamp: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      });
      palleStore.addChatMessage(threadId, answer);
    }

    return res.json({ answer });
  } catch (err: any) {
    console.error('Error answering question with AI:', err);
    return res.status(500).json({ error: 'خطا در ارتباط با دستیار هوشمند پله.' });
  }
});

app.get('/api/assistant/history/:threadId', requireAuth, (req: Request, res: Response) => {
  const { threadId } = req.params;
  const history = palleStore.getChat(threadId);
  return res.json({ history });
});

// Notes endpoints
app.get('/api/notes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const notes = palleStore.getNotes(userId);
  return res.json({ notes });
});

app.post('/api/notes', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { stepId, stepTitle, bookTitle, quote, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'متن یادداشت الزامی است.' });
  }

  const note = palleStore.addNote(userId, {
    id: `note-${Date.now()}`,
    userId,
    stepId,
    stepTitle,
    bookTitle,
    quote,
    text,
    createdAt: new Date().toISOString(),
  });

  return res.json({ note });
});

app.delete('/api/notes/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  palleStore.deleteNote(userId, req.params.id);
  return res.json({ success: true });
});

// ======================== SERVER & VITE SETUP ========================

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Palle (پله) server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Palle server:', err);
  process.exit(1);
});
