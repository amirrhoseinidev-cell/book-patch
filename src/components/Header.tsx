import React from 'react';
import { usePalle } from '../context/PalleContext';

const APP_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1X-wSo11NCGzSbdcpKBVFtUGHscalLWyBVnf_KYEJsvdgCcNiZEVyBP56idfxfmTVQcYJforPJpHzJyw8klzmrmgp4dusWTvo2cUy8ZO5MSo038wm9SUFlKmiAUNppis8PE_KX1kSj5E2JjBBoMdFIDI_1yva5kzsCBvUFmATN5X5y8QppYpXrUo3RPR6-BkfmRQqab-dhAVkhY1AhDflh8XCUKDn6JwNASo7C5unx7jQADBtT4VWmn3ik';

export const Header: React.FC = () => {
  const { currentView, goBack, user, navigateTo, showToast, isGuest, openAuthModal } = usePalle();

  if (currentView === 'onboarding' || currentView === 'generating-path') {
    return null;
  }

  const isMainTab = ['home', 'library', 'profile'].includes(currentView);

  let viewTitleEn = 'Home';
  let stackTitle = 'Path Overview';

  if (currentView === 'home') viewTitleEn = 'Home';
  else if (currentView === 'library') viewTitleEn = 'Library';
  else if (currentView === 'profile') viewTitleEn = 'Profile';
  else if (currentView === 'path-roadmap' || currentView === 'create-topic' || currentView === 'create-level') {
    stackTitle = 'Path Overview';
  } else if (currentView === 'step-overview' || currentView === 'book-reader') {
    stackTitle = 'Step Lesson';
  } else if (currentView === 'step-assessment') {
    stackTitle = 'Step Assessment';
  } else if (currentView === 'step-celebration') {
    stackTitle = 'Step Milestone';
  } else if (currentView === 'achievements') {
    stackTitle = 'نشان‌ها و دستاوردها';
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(72,60,53,0.04)] pt-safe">
      <div className="h-16 px-4 max-w-xl mx-auto flex items-center justify-between">
        {isMainTab ? (
          <div
            className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform"
            onClick={() => navigateTo('home')}
          >
            <img alt="Palle App Logo" className="h-8 w-auto object-contain" src={APP_LOGO_URL} />
            <div className="flex flex-col">
              <span className="font-bold text-lg text-primary tracking-tight">پله</span>
              <span className="text-[11px] text-on-surface-variant leading-none">{viewTitleEn}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              aria-label="بازگشت"
              onClick={goBack}
              className="h-11 px-2 rounded-xl flex items-center gap-1 text-primary hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              <span className="text-xs font-semibold">بازگشت</span>
            </button>
            <img alt="Palle App Logo" className="h-7 w-auto object-contain hidden sm:inline-block" src={APP_LOGO_URL} />
            <h1 className="font-bold text-sm text-primary tracking-tight truncate max-w-[200px]">
              {stackTitle}
            </h1>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isGuest && (
            <button
              onClick={() => openAuthModal('register')}
              className="h-8 px-2.5 rounded-full bg-[#FFDCC5] hover:bg-[#FDA868] text-[#703700] text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-xs"
              title="ثبت‌نام و ذخیره پیشرفت"
            >
              <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
              <span>ذخیره پیشرفت</span>
            </button>
          )}

          {isMainTab && (
            <button
              aria-label="اعلان‌ها"
              onClick={() => showToast('اعلانی برای نمایش وجود ندارد', 'info')}
              className="w-11 h-11 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          )}

          <button
            aria-label="پروفایل کاربری"
            onClick={() => navigateTo('profile')}
            className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
