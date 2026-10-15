import React from 'react';
import { PalleProvider, usePalle } from './context/PalleContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { AIAssistantChatModal } from './components/AIAssistantChatModal';
import { AddResourceModal } from './components/AddResourceModal';
import { SaveProgressPromptModal } from './components/SaveProgressPromptModal';
import { AuthModal } from './components/AuthModal';

import { OnboardingView } from './views/OnboardingView';
import { HomeView } from './views/HomeView';
import { PathCreateTopicView } from './views/PathCreateTopicView';
import { PathCreateLevelView } from './views/PathCreateLevelView';
import { PathGeneratingView } from './views/PathGeneratingView';
import { PathRoadmapView } from './views/PathRoadmapView';
import { StepLessonOverviewView } from './views/StepLessonOverviewView';
import { BookReaderView } from './views/BookReaderView';
import { StepAssessmentView } from './views/StepAssessmentView';
import { StepCelebrationView } from './views/StepCelebrationView';
import { LibraryView } from './views/LibraryView';
import { ProfileView } from './views/ProfileView';
import { AchievementsView } from './views/AchievementsView';

const MainContent: React.FC = () => {
  const { currentView, toasts, isLoading } = usePalle();

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingView />;
      case 'home':
        return <HomeView />;
      case 'create-topic':
        return <PathCreateTopicView />;
      case 'create-level':
        return <PathCreateLevelView />;
      case 'generating-path':
        return <PathGeneratingView />;
      case 'path-roadmap':
        return <PathRoadmapView />;
      case 'step-overview':
        return <StepLessonOverviewView />;
      case 'book-reader':
        return <BookReaderView />;
      case 'step-assessment':
        return <StepAssessmentView />;
      case 'step-celebration':
        return <StepCelebrationView />;
      case 'library':
        return <LibraryView />;
      case 'profile':
        return <ProfileView />;
      case 'achievements':
        return <AchievementsView />;
      default:
        return <HomeView />;
    }
  };

  const isImmersion = currentView === 'onboarding' || currentView === 'generating-path';

  return (
    <div className="min-h-screen bg-[#F5F7EE] text-[#2E2621] flex flex-col relative selection:bg-[#FDA868]/30 selection:text-[#312620]">
      <Header />

      <main className={`flex-1 w-full flex flex-col ${isImmersion ? '' : 'pt-16'}`}>
        {isLoading && currentView === 'home' ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <span className="material-symbols-outlined text-[#FDA868] animate-spin text-3xl">
              progress_activity
            </span>
            <span className="text-xs text-[#6B6057]">در حال بارگذاری اطلاعات پله...</span>
          </div>
        ) : (
          renderView()
        )}
      </main>

      <Navbar />

      <AIAssistantChatModal />
      <AddResourceModal />
      <SaveProgressPromptModal />
      <AuthModal />

      {/* Global Interactive Toast Notification */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#312620] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all duration-300 animate-in slide-in-from-bottom-2 border border-[#483C35]"
          >
            <span className="material-symbols-outlined text-[18px] text-[#FDA868] filled">
              {toast.type === 'warning' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PalleProvider>
      <MainContent />
    </PalleProvider>
  );
}
