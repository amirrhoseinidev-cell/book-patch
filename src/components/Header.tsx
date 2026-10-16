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
    <header className="fixed top-0 inset-x-0 z-40 bg-[#F5F7EE]/92 backdrop-blur-xl border-b border-[#E6E9DE]/75 shadow-[0_2px_12px_rgba(72,60,53,0.04)] pt-safe select-none transition-all">
      <div className="h-14 sm:h-16 px-3.5 sm:px-4 max-w-xl mx-auto flex items-center justify-between">
        {isMainTab ? (
          <div
            className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform touch-manipulation"
            onClick={() => navigateTo('home')}
          >
            <img alt="Palle App Logo" className="h-7 sm:h-8 w-auto object-contain" src={APP_LOGO_URL} />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-[#312620] tracking-tight leading-tight">پله</span>
              <span className="text-[10px] text-[#6B6057] leading-none">{viewTitleEn}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <button
              aria-label="بازگشت"
              onClick={goBack}
              className="h-10 px-2.5 rounded-xl flex items-center gap-1 text-[#312620] bg-[#EDEFE6]/80 hover:bg-[#EDEFE6] active:scale-90 transition-all touch-manipulation shadow-xs"
            >
              <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
              <span className="text-xs font-bold">بازگشت</span>
            </button>
            <h1 className="font-bold text-xs sm:text-sm text-[#312620] tracking-tight truncate max-w-[170px] sm:max-w-[220px]">
              {stackTitle}
            </h1>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isGuest && (
            <button
              onClick={() => openAuthModal('register')}
              className="h-8 px-2.5 rounded-full bg-[#FFDCC5] hover:bg-[#FDA868] text-[#703700] text-[11px] font-bold flex items-center gap-1 transition-all active:scale-90 shadow-xs touch-manipulation"
              title="ثبت‌نام و ذخیره پیشرفت"
            >
              <span className="material-symbols-outlined text-[15px]">cloud_upload</span>
              <span className="hidden xs:inline">ذخیره</span>
            </button>
          )}

          {isMainTab && (
            <button
              aria-label="اعلان‌ها"
              onClick={() => showToast('اعلانی برای نمایش وجود ندارد', 'info')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B6057] hover:text-[#312620] hover:bg-[#EDEFE6] active:scale-90 transition-all touch-manipulation"
            >
              <span className="material-symbols-outlined text-[21px]">notifications</span>
            </button>
          )}

          <button
            aria-label="پروفایل کاربری"
            onClick={() => navigateTo('profile')}
            className="w-8 h-8 rounded-full overflow-hidden bg-[#483C35] border border-[#D5DAC8] flex items-center justify-center shrink-0 active:scale-90 transition-transform touch-manipulation shadow-xs"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-white text-[17px]">person</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
