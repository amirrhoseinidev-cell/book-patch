import React from 'react';
import { usePalle } from '../context/PalleContext';
import { LearningPath } from '../types/palle';

export const HomeView: React.FC = () => {
  const {
    user,
    allPaths,
    navigateTo,
    setCreationDraft,
    startPath,
    startStep,
    isGuest,
    openAuthModal,
    achievements,
    unlockedAchievementsCount,
    totalWisdomPoints,
  } = usePalle();

  const userName = user?.name || 'کاربر گرامی';
  const displayGreeting = `سلام ${userName}`;

  // Find active, started, incomplete learning path strictly from real records
  const activeStartedPath: LearningPath | undefined = allPaths.find(
    (p) => p.status === 'in_progress' && p.progressPercent < 100
  );

  // Find unstarted created path (if user created one but hasn't started any yet)
  const unstartedPath: LearningPath | undefined = !activeStartedPath
    ? allPaths.find((p) => p.status === 'not_started' || (!p.startedAt && p.progressPercent === 0))
    : undefined;

  // Check if all created paths are 100% finished
  const allFinished = allPaths.length > 0 && allPaths.every((p) => p.progressPercent >= 100);

  // Determine current active step of the started path
  const currentStep = activeStartedPath?.steps?.find((s) => s.status === 'current') ||
    (activeStartedPath?.steps ? activeStartedPath.steps[activeStartedPath.currentStepIndex] : null);

  const completedStepsCount = activeStartedPath?.steps
    ? activeStartedPath.steps.filter((s) => s.status === 'completed').length
    : 0;

  const totalStepsCount = activeStartedPath?.steps ? activeStartedPath.steps.length : 0;

  const recommendedPaths = [
    {
      id: 'rec-ai',
      topic: 'مبانی هوش مصنوعی و یادگیری عمیق',
      category: 'هوش مصنوعی',
      level: 'سطح متوسط',
      stepsCount: 6,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCn5mDHhtJ8sHz68Ii4BCl_0QzJOtYnPqox4Nx207qv5lawFaVOjDB_FRHfNbrPYSRhBlpwfVTLUahCLxF_lHtJCqgA1x4JtGBAvBm87yoHamSNWFznpNnyml8tAjOxpjQS9ov5tdE8sIln8sO_z_QtiDGSZPX5XDUh_brCxKXZ4d1u_lzHgYTerZ5eMhfiD8jmYaNaeAsrkE3Xd59ADp3obes89kdpN06Lqh7zrNda-uaA3I6TaAPS',
    },
    {
      id: 'rec-psych',
      topic: 'روان‌شناسی شناختی و تصمیم‌گیری',
      category: 'روان‌شناسی',
      level: 'سطح مبتدی',
      stepsCount: 8,
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBaCGpekdp-BDMqQrSoEVoIwr6MDMJOAcKe8RmQVnZ0pf08PyHVoLkF3oa6EpD7VcOIho5nDFhBBKf09kRIAg4BnNDvbSu-qlmK4jxydXnSflavJg5qvvzB3KvIXn2FS59lwIsUu2o5Clnarw0Xfb4b9Z6GD2sFs-fFz5vbv2ydGBVJ3kl-JU8HXWfuGfIVNMEYU3talbDBkpvf8oiXrPIlFMW1AzEGQnBmrBi4bsMvm1H0jUzg-Wan',
    },
    {
      id: 'rec-critical',
      topic: 'تفکر نقادانه در زندگی روزمره',
      category: 'مهارت فردی',
      level: 'سطح مبتدی',
      stepsCount: 4,
      image: null,
    },
  ];

  const handleStartRecommended = (item: typeof recommendedPaths[0]) => {
    setCreationDraft({
      topic: item.topic,
      level: item.level.includes('متوسط') ? 'intermediate' : 'beginner',
      goal: 'درک اصول و جهان‌بینی کلی',
      dailyMinutes: 20,
    });
    navigateTo('create-level');
  };

  const handleResumeActive = async () => {
    if (!activeStartedPath) return;
    if (currentStep) {
      await startStep(activeStartedPath.id, currentStep.id);
      navigateTo('step-overview', { path: activeStartedPath, step: currentStep });
    } else {
      navigateTo('path-roadmap', { path: activeStartedPath });
    }
  };

  const handleStartUnstartedPath = async (path: LearningPath) => {
    await startPath(path.id);
    const firstStep = path.steps[0];
    if (firstStep) {
      navigateTo('step-overview', { path, step: firstStep });
    } else {
      navigateTo('path-roadmap', { path });
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-24 gap-4">
      {/* Guest Mode Informational Card & Direct Save CTA */}
      {isGuest && (
        <section className="bg-[#FFFFFF] border-2 border-[#FDA868]/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
              <span className="material-symbols-outlined text-[20px]">lock_clock</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#312620]">حالت مهمان (Guest Mode)</span>
                <span className="text-[10px] bg-[#EDEFE6] text-[#483C35] px-1.5 py-0.5 rounded font-semibold">ذخیره موقت محلی</span>
              </div>
              <span className="text-[11px] text-[#6B6057] truncate">
                پیشرفت شما در مرورگر نگهداری می‌شود و به سرور آپلود نمی‌گردد.
              </span>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('register')}
            className="px-3.5 py-2 bg-[#483C35] hover:bg-[#312620] text-white text-xs font-bold rounded-xl shrink-0 transition-all active:scale-95 flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            <span>ذخیره دائمی</span>
          </button>
        </section>
      )}

      {/* Top Greeting & Daily Motivation Card */}
      <section className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-[#FFDCC5]/40 pointer-events-none blur-2xl"></div>

        <div className="flex items-center gap-3 mb-3 relative z-10">
          <div className="relative">
            <img
              className="w-12 h-12 rounded-full object-cover shadow-xs bg-[#EDEFE6] border border-[#D5DAC8]"
              src={
                user?.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW'
              }
              alt={userName}
            />
            {user?.isPhoneVerified && (
              <span
                title="شماره تایید شده"
                className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#FDA868] ring-2 ring-white flex items-center justify-center text-[9px] text-[#301400] font-bold"
              >
                ✓
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-bold text-base text-[#312620] tracking-tight truncate">{displayGreeting}</h2>
              {user?.isDemo && (
                <span className="text-[10px] font-bold bg-[#FFDCC5] text-[#703700] px-2 py-0.5 rounded-full">
                  حساب دمو
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B6057]">
              {user?.phone ? `شماره ثبت‌شده: ${user.phone}` : 'وقت یادگیری و صعود به پله بعدی است'}
            </p>
          </div>
        </div>

        {/* Daily Quote Box */}
        <div className="bg-[#F5F7EE] rounded-xl p-3 flex items-start gap-2 relative z-10 border border-[#E6E9DE]">
          <span
            className="material-symbols-outlined text-[#8F4E15] text-[18px] shrink-0 mt-0.5 select-none filled"
          >
            format_quote
          </span>
          <p className="text-xs text-[#312620] italic leading-relaxed">
            «هر پله، درکی عمیق‌تر از پله قبلی است.»
          </p>
        </div>
      </section>

      {/* Achievements & Milestones Quick Bar */}
      <section
        onClick={() => navigateTo('achievements')}
        className="bg-white rounded-2xl p-3 shadow-xs border border-[#E6E9DE] hover:border-[#D5DAC8] transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] flex items-center justify-center text-[#92400E] shrink-0 border border-[#F59E0B]/30 shadow-xs">
            <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#312620]">نشان‌ها و دستاوردهای یادگیری</span>
              <span className="text-[10px] bg-[#FFDCC5] text-[#703700] px-1.5 py-0.2 rounded-full font-bold">
                {unlockedAchievementsCount} از {achievements.length} آزاد شده
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B6057]">
              <span className="flex items-center gap-0.5 font-bold text-[#8F4E15]">
                <span className="material-symbols-outlined text-[13px]">stars</span>
                <span>+{totalWisdomPoints} امتیاز خرد</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-bold text-[#312620]">
                <span className="material-symbols-outlined text-[13px] text-[#C2410C]">
                  local_fire_department
                </span>
                <span>{user?.streakDays ?? 0} روز استمرار</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#8F4E15] font-bold shrink-0">
          <span>مشاهده</span>
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </div>
      </section>

      {/* Primary Action Card: New Path Callout */}
      <section className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] relative overflow-hidden">
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="inline-flex items-center gap-1 bg-[#FFDCC5] text-[#301400] px-2.5 py-0.5 rounded-full w-fit">
                <span className="material-symbols-outlined text-[14px] text-[#8F4E15]">auto_awesome</span>
                <span className="text-[11px] font-bold">طراحی هوشمند مسیر</span>
              </div>
              <h3 className="font-bold text-sm text-[#312620] mt-1">مسیر جدیدی در ذهن داری؟</h3>
              <p className="text-xs text-[#6B6057] leading-relaxed">
                موضوع دلخواهت را بنویس تا پله با هوش مصنوعی و منابع موثق، مسیر گام‌به‌گام آن را بسازد.
              </p>
            </div>
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#EDEFE6] flex items-center justify-center text-[#312620] shadow-xs">
              <span className="material-symbols-outlined text-[26px]">route</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('create-topic')}
            className="w-full h-12 bg-[#483C35] text-[#F5F7EE] rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#312620] active:scale-[0.98] transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>ساخت مسیر یادگیری جدید</span>
          </button>
        </div>
      </section>

      {/* ================= SECTION: CONTINUE LEARNING (STRICT LOGIC) ================= */}
      {activeStartedPath ? (
        /* 1. User has an actual active started path */
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FDA868] animate-pulse"></span>
              <h3 className="font-bold text-sm text-[#312620]">ادامه یادگیری فعلی</h3>
            </div>
            <span className="text-[11px] text-[#8F4E15] bg-[#FFDCC5] px-2.5 py-0.5 rounded-full font-bold">
              در حال یادگیری
            </span>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <img
                className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-xs bg-[#EDEFE6] border border-[#E6E9DE]"
                src={
                  activeStartedPath.heroImage ||
                  currentStep?.resourceRecommendation?.coverImage ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys'
                }
                alt={activeStartedPath.title}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] text-[#8F4E15] font-semibold">{activeStartedPath.category}</span>
                <h4 className="font-bold text-sm text-[#312620] truncate">{activeStartedPath.title}</h4>
                <span className="text-[11px] text-[#6B6057] mt-0.5 truncate">
                  پله {currentStep ? currentStep.stepNumber : 1} از {totalStepsCount}:{' '}
                  {currentStep ? currentStep.title : 'مطالعه مقدماتی'}
                </span>
              </div>
            </div>

            {/* Attached Resource Pill */}
            {currentStep?.resourceRecommendation && (
              <div className="bg-[#F5F7EE] rounded-xl p-2.5 flex items-center justify-between gap-2 border border-[#E6E9DE]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#8F4E15] text-[18px] shrink-0">bolt</span>
                  <span className="text-xs text-[#312620] truncate font-medium">
                    خلاصه مفهومی پله {currentStep.stepNumber} • {currentStep.resourceRecommendation.title}
                  </span>
                </div>
                <span className="text-[11px] text-[#8F4E15] bg-[#FFDCC5] px-2 py-0.5 rounded-full shrink-0 font-bold">
                  {currentStep.durationMinutes || 15} دقیقه
                </span>
              </div>
            )}

            {/* Progress Track (Strictly based on real completed steps records) */}
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#6B6057]">پیشرفت کل مسیر</span>
                <span className="text-[11px] text-[#312620] font-bold">
                  {activeStartedPath.progressPercent}٪ ({completedStepsCount} از {totalStepsCount} پله)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#EDEFE6] overflow-hidden">
                <div
                  className="h-full bg-[#FDA868] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(activeStartedPath.progressPercent, 4)}%` }}
                ></div>
              </div>
            </div>

            {/* Resume Button */}
            <button
              onClick={handleResumeActive}
              className="w-full h-11 bg-[#483C35] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#312620] active:scale-[0.98] transition-all mt-0.5 shadow-xs"
            >
              <span>ورود به گام جاری (پله {currentStep?.stepNumber || 1})</span>
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            </button>
          </div>
        </section>
      ) : unstartedPath ? (
        /* 2. User has a created path, but hasn't started it yet */
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8D8177]"></span>
              <h3 className="font-bold text-sm text-[#312620]">مسیر آماده شروع</h3>
            </div>
            <span className="text-[11px] text-[#4E4540] bg-[#EDEFE6] px-2.5 py-0.5 rounded-full font-bold">
              شروع نشده
            </span>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#EDEFE6] flex items-center justify-center text-[#8F4E15] shrink-0 border border-[#D5DAC8]">
                <span className="material-symbols-outlined text-[24px]">flag</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] text-[#8F4E15] font-semibold">{unstartedPath.category}</span>
                <h4 className="font-bold text-sm text-[#312620] truncate">{unstartedPath.title}</h4>
                <p className="text-[11px] text-[#6B6057] mt-0.5 line-clamp-1">
                  شما این مسیر را ایجاد کرده‌اید اما هنوز یادگیری را آغاز نکرده‌اید.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStartUnstartedPath(unstartedPath)}
              className="w-full h-11 bg-[#483C35] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#312620] active:scale-[0.98] transition-all shadow-xs"
            >
              <span>شروع گام اول (پله ۱ • کاملاً فعال)</span>
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            </button>
          </div>
        </section>
      ) : allFinished ? (
        /* 3. User finished all paths */
        <section className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
            <span className="material-symbols-outlined text-[26px] filled">military_tech</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <h4 className="font-bold text-xs text-[#312620]">تبریک! تمام مسیرهای فعلی را به پایان رسانده‌اید</h4>
            <p className="text-[11px] text-[#6B6057] mt-0.5">
              برای تداوم زنجیره یادگیری، یک موضوع تازه انتخاب کن و صعود کن.
            </p>
          </div>
        </section>
      ) : (
        /* 4. Brand new user with NO learning activity: Clear, high-fidelity empty state */
        <section className="bg-[#FFFFFF] rounded-2xl p-5 shadow-xs border border-[#E6E9DE] flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#EDEFE6] flex items-center justify-center text-[#8D8177] shadow-inner">
            <span className="material-symbols-outlined text-[32px]">stairs</span>
          </div>
          <div className="flex flex-col gap-1 max-w-xs">
            <h4 className="font-bold text-sm text-[#312620]">شما هنوز یادگیری را آغاز نکرده‌اید</h4>
            <p className="text-xs text-[#6B6057] leading-relaxed">
              با ایجاد اولین مسیر یادگیری یا انتخاب یکی از موضوعات پیشنهادی، سفر یادگیری گام‌به‌گام خود را آغاز کنید.
            </p>
          </div>
          <button
            onClick={() => navigateTo('create-topic')}
            className="px-5 py-2.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-xs mt-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>ایجاد نخستین مسیر یادگیری</span>
          </button>
        </section>
      )}

      {/* ================= SECTION: RECOMMENDED PATHS ================= */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#312620] text-[18px]">explore</span>
            <h3 className="font-bold text-sm text-[#312620]">مسیرهای پیشنهادی و محبوب</h3>
          </div>
          <button
            onClick={() => navigateTo('create-topic')}
            className="text-[11px] text-[#8F4E15] hover:text-[#703700] transition-colors font-bold"
          >
            مشاهده همه
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {recommendedPaths.map((item) => (
            <div
              key={item.id}
              onClick={() => handleStartRecommended(item)}
              className="bg-[#FFFFFF] rounded-2xl p-3 shadow-xs border border-[#E6E9DE] flex items-center gap-3 hover:border-[#D5DAC8] transition-colors cursor-pointer group active:scale-[0.99]"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.topic}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#EDEFE6] border border-[#E6E9DE]"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#FFDCC5] flex items-center justify-center shrink-0 text-[#8F4E15]">
                  <span
                    className="material-symbols-outlined text-[24px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    psychology_alt
                  </span>
                </div>
              )}

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="bg-[#EDEFE6] text-[#4E4540] text-[10px] px-2 py-0.5 rounded-full font-medium">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-[#6B6057]">{item.level}</span>
                </div>
                <h4 className="font-bold text-xs text-[#312620] truncate">{item.topic}</h4>
                <div className="flex items-center gap-1 text-[#6B6057] mt-1 text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">stairs</span>
                  <span>{item.stepsCount} پله یادگیری</span>
                </div>
              </div>

              <button
                aria-label="مشاهده مسیر"
                className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620] shrink-0 group-hover:bg-[#483C35] group-hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
