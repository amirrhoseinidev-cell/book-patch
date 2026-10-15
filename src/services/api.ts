import { UserProfile, LearningPath, BookItem, NoteItem, AssistantMessage, LearningStep } from '../types/palle';

const API_BASE = '/api';
const TOKEN_KEY = 'palle_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export interface SendOtpResponse {
  success: boolean;
  phone: string;
  isNewUser: boolean;
  expiresAt: number;
  isDevMode: boolean;
  devOtp?: string;
  message: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: UserProfile;
  message: string;
}

export interface DemoAccountInfo {
  id: string;
  name: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  streakDays: number;
  activePathTitle: string | null;
  progressPercent: number;
  totalPaths: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error || `خطای سرور (${response.status})`);
    (err as any).status = response.status;
    (err as any).data = errorData;
    throw err;
  }

  return response.json();
}

export const palleApi = {
  // ===================== AUTH =====================
  async sendOtp(phone: string, name?: string, purpose?: 'login' | 'register'): Promise<SendOtpResponse> {
    return request<SendOtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, name, purpose }),
    });
  },

  async verifyOtp(
    phone: string,
    code: string,
    name?: string,
    guestData?: { paths?: LearningPath[]; books?: BookItem[]; notes?: NoteItem[] },
    avatarUrl?: string
  ): Promise<VerifyOtpResponse> {
    const res = await request<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code, name, guestData, avatarUrl }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async migrateGuest(guestData: {
    paths?: LearningPath[];
    books?: BookItem[];
    notes?: NoteItem[];
  }): Promise<{ success: boolean; user: UserProfile; paths: LearningPath[]; message: string }> {
    return request('/auth/migrate-guest', {
      method: 'POST',
      body: JSON.stringify(guestData),
    });
  },

  async getDemos(): Promise<{ demos: DemoAccountInfo[] }> {
    return request<{ demos: DemoAccountInfo[] }>('/auth/demos');
  },

  async loginWithDemo(demoId: string): Promise<VerifyOtpResponse> {
    const res = await request<VerifyOtpResponse>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ demoId }),
    });
    if (res.token) {
      setStoredToken(res.token);
    }
    return res;
  },

  async getMe(): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
    }
  },

  // ===================== PROFILE =====================
  async updateProfile(updates: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    return request<{ user: UserProfile }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // ===================== DASHBOARD =====================
  async getDashboard(): Promise<{
    user: UserProfile;
    activePath?: LearningPath | null;
    paths: LearningPath[];
    books: BookItem[];
    notesCount: number;
    statistics?: {
      completedStepsCount: number;
      totalStepsCount: number;
      inProgressPathsCount: number;
      totalPathsCount: number;
    };
  }> {
    return request('/dashboard');
  },

  // ===================== LEARNING PATHS =====================
  async generateLearningPath(input: {
    topic: string;
    level: string;
    goal: string;
    dailyMinutes: number;
  }): Promise<{ path: LearningPath }> {
    return request<{ path: LearningPath }>('/learning-paths/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async getLearningPaths(): Promise<{ paths: LearningPath[] }> {
    return request<{ paths: LearningPath[] }>('/learning-paths');
  },

  async getLearningPath(id: string): Promise<{ path: LearningPath }> {
    return request<{ path: LearningPath }>(`/learning-paths/${id}`);
  },

  async startPath(pathId: string): Promise<{ path: LearningPath }> {
    return request<{ path: LearningPath }>(`/learning-paths/${pathId}/start`, {
      method: 'POST',
    });
  },

  async startStep(pathId: string, stepId: string): Promise<{ path: LearningPath; step: LearningStep }> {
    return request<{ path: LearningPath; step: LearningStep }>(`/steps/${pathId}/${stepId}/start`, {
      method: 'POST',
    });
  },

  async completeStep(
    pathId: string,
    stepId: string
  ): Promise<{
    success: boolean;
    path: LearningPath;
    nextStep?: LearningStep;
  }> {
    return request(`/steps/${pathId}/${stepId}/complete`, {
      method: 'POST',
    });
  },

  async submitQuiz(
    pathId: string,
    stepId: string,
    payload: { score: number; maxScore: number; answers: number[] }
  ): Promise<{
    success: boolean;
    path: LearningPath;
    nextStep?: LearningStep;
  }> {
    return request(`/steps/${pathId}/${stepId}/quiz-submit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ===================== LIBRARY =====================
  async getLibrary(): Promise<{ books: BookItem[] }> {
    return request<{ books: BookItem[] }>('/library');
  },

  async addBookToLibrary(book: Partial<BookItem>): Promise<{ book: BookItem }> {
    return request<{ book: BookItem }>('/library/add', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  },

  // ===================== AI ASSISTANT =====================
  async askAssistant(params: {
    question: string;
    passageContext?: string;
    stepTitle?: string;
    threadId?: string;
  }): Promise<{ answer: AssistantMessage }> {
    return request<{ answer: AssistantMessage }>('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getChatHistory(threadId: string): Promise<{ history: AssistantMessage[] }> {
    return request<{ history: AssistantMessage[] }>(`/assistant/history/${threadId}`);
  },

  // ===================== NOTES =====================
  async getNotes(): Promise<{ notes: NoteItem[] }> {
    return request<{ notes: NoteItem[] }>('/notes');
  },

  async addNote(note: {
    stepId?: string;
    stepTitle?: string;
    bookTitle?: string;
    quote?: string;
    text: string;
  }): Promise<{ note: NoteItem }> {
    return request<{ note: NoteItem }>('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  async deleteNote(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};
