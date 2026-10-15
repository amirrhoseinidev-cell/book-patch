import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';
import { StudyTimeMinutes, KnowledgeLevel, AchievementBadge } from '../types/palle';
import { DailyStudyTimeSlider } from '../components/DailyStudyTimeSlider';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateUserProfile,
    notes,
    deleteNote,
    logout,
    showToast,
    navigateTo,
    allPaths,
    demoAccounts,
    loginWithDemo,
    isGuest,
    openAuthModal,
    achievements,
    unlockedAchievementsCount,
    totalWisdomPoints,
  } = usePalle();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showStudyTimeModal, setShowStudyTimeModal] = useState(false);
  const [studyTimeValue, setStudyTimeValue] = useState<number>(user?.preferences?.dailyGoalMinutes || 20);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [bioInput, setBioInput] = useState(user?.bio || '');

  const goals: StudyTimeMinutes[] = [15, 20, 30, 45, 60];
  const levels: KnowledgeLevel[] = ['beginner', 'intermediate', 'advanced'];
  const levelLabels: Record<KnowledgeLevel, string> = {
    beginner: 'مبتدی',
    intermediate: 'متوسط',
    advanced: 'پیشرفته',
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return {
          bg: 'bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
          border: 'border-[#38BDF8]',
          text: 'text-[#0369A1]',
          badgeBg: 'bg-[#0284C7]',
          glow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]',
          label: 'الماسین',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#F59E0B]/30',
          border: 'border-[#F59E0B]',
          text: 'text-[#92400E]',
          badgeBg: 'bg-[#D97706]',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
          label: 'زرین (طلا)',
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1]',
          border: 'border-[#94A3B8]',
          text: 'text-[#334155]',
          badgeBg: 'bg-[#64748B]',
          glow: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]',
          label: 'سیمین (نقره)',
        };
      case 'bronze':
      default:
        return {
          bg: 'bg-gradient-to-br from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]/40',
          border: 'border-[#FB923C]',
          text: 'text-[#9A3412]',
          badgeBg: 'bg-[#C2410C]',
          glow: 'shadow-[0_0_10px_rgba(251,146,60,0.2)]',
          label: 'مفرغی (برنز)',
        };
    }
  };

  const handleCycleDailyGoal = async () => {
    const currentGoal = user?.preferences?.dailyGoalMinutes || 20;
    const nextIdx = (goals.indexOf(currentGoal) + 1) % goals.length;
    const nextGoal = goals[nextIdx];
    await updateUserProfile({
      preferences: {
        ...(user?.preferences || {
          defaultLevel: 'intermediate',
          focusMode: true,
          aiTone: 'socratic',
          fontSize: 'normal',
        }),
        dailyGoalMinutes: nextGoal,
      },
    });
    showToast(`هدف روزانه به ${nextGoal} دقیقه تغییر یافت`);
  };

  const handleCycleLevel = async () => {
    const currentLvl = user?.preferences?.defaultLevel || 'intermediate';
    const nextIdx = (levels.indexOf(currentLvl) + 1) % levels.length;
    const nextLvl = levels[nextIdx];
    await updateUserProfile({
      preferences: {
        ...(user?.preferences || {
          dailyGoalMinutes: 20,
          focusMode: true,
          aiTone: 'socratic',
          fontSize: 'normal',
        }),
        defaultLevel: nextLvl,
      },
    });
    showToast(`سطح پیش‌فرض به ${levelLabels[nextLvl]} تغییر یافت`);
  };

  const handleToggleFocus = async () => {
    const isFocus = !(user?.preferences?.focusMode ?? true);
    await updateUserProfile({
      preferences: {
        ...(user?.preferences || {
          dailyGoalMinutes: 20,
          defaultLevel: 'intermediate',
          aiTone: 'socratic',
          fontSize: 'normal',
        }),
        focusMode: isFocus,
      },
    });
    showToast(isFocus ? 'حالت مطالعه بدون حواس‌پرتی فعال شد' : 'حالت مطالعه بدون حواس‌پرتی خاموش شد');
  };

  const handleCycleAiTone = async () => {
    const tones: Array<'socratic' | 'explanatory' | 'concise' | 'storytelling'> = [
      'socratic',
      'explanatory',
      'concise',
      'storytelling',
    ];
    const currentTone = user?.preferences?.aiTone || 'socratic';
    const nextIdx = (tones.indexOf(currentTone) + 1) % tones.length;
    const nextTone = tones[nextIdx];
    await updateUserProfile({
      preferences: {
        ...(user?.preferences || {
          dailyGoalMinutes: 20,
          defaultLevel: 'intermediate',
          focusMode: true,
          fontSize: 'normal',
        }),
        aiTone: nextTone,
      },
    });
    showToast('لحن دستیار هوشمند تغییر یافت');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name: nameInput.trim() || user?.name,
      bio: bioInput.trim() || user?.bio,
    });
    setShowEditModal(false);
  };

  const handleSwitchToDemo = async (demoId: string) => {
    setShowDemoModal(false);
    await loginWithDemo(demoId);
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-28 gap-4">
      {/* Profile Header Card */}
      <section className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#FFDCC5]/30 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-xs bg-[#EDEFE6] border border-[#D5DAC8]">
              <img
                className="w-full h-full object-cover"
                src={
                  user?.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW'
                }
                alt={user?.name || 'کاربر پله'}
              />
            </div>
            {user?.isPhoneVerified && (
              <span
                title="شماره تایید شده"
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#FDA868] text-[#301400] flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white"
              >
                ✓
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="font-bold text-base text-[#312620] truncate">{user?.name || 'کاربر گرامی'}</h1>
                {user?.isDemo && (
                  <span className="text-[10px] font-bold bg-[#FFDCC5] text-[#703700] px-2 py-0.5 rounded-full shrink-0">
                    حساب دمو
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setNameInput(user?.name || '');
                  setBioInput(user?.bio || '');
                  setShowEditModal(true);
                }}
                className="px-2.5 py-1 bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#4E4540] text-[11px] font-bold rounded-full flex items-center gap-1 active:scale-95 transition-transform shrink-0"
              >
                <span className="material-symbols-outlined text-[13px]">edit</span>
                <span>ویرایش مشخصات</span>
              </button>
            </div>

            <p className="text-xs text-[#6B6057] mt-1 leading-relaxed line-clamp-2">
              {user?.bio || 'عضو خانواده پله • مسیر اختصاصی یادگیری عمیق'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {user?.phone && (
                <span className="inline-flex items-center gap-1 bg-[#F5F7EE] px-2.5 py-0.5 rounded-full text-[#312620] text-[11px] font-mono font-bold border border-[#E6E9DE]">
                  <span className="material-symbols-outlined text-[13px] text-[#8F4E15]">phone_iphone</span>
                  <span dir="ltr">{user.phone}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-[#F5F7EE] px-2.5 py-0.5 rounded-full text-[#6B6057] text-[11px] font-bold border border-[#E6E9DE]">
                <span className="material-symbols-outlined text-[13px] text-[#8F4E15]">local_fire_department</span>
                <span>{user?.streakDays ?? 0} روز پیوستگی مطالعه</span>
              </span>
              <span className="inline-flex items-center gap-1 bg-[#F5F7EE] px-2.5 py-0.5 rounded-full text-[#6B6057] text-[11px] font-bold border border-[#E6E9DE]">
                <span className="material-symbols-outlined text-[13px] text-[#312620]">menu_book</span>
                <span>{allPaths.filter((p) => p.status === 'in_progress').length} مسیر فعال</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Mode Conversion CTA */}
      {isGuest && (
        <section className="bg-[#FFFFFF] border-2 border-[#FDA868]/50 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
              <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-xs font-bold text-[#312620]">ذخیره دائمی پیشرفت مهمان</div>
              <div className="text-[11px] text-[#6B6057] truncate">
                مسیرها و پله‌های گذرانده‌شده را به یک حساب دائمی متصل کنید.
              </div>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('register')}
            className="px-3.5 py-2 bg-[#483C35] hover:bg-[#312620] text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs shrink-0"
          >
            ایجاد حساب کاربری
          </button>
        </section>
      )}

      {/* Switch Demo Accounts / Testing Quick Drawer */}
      <section className="bg-[#FFFFFF] p-3.5 rounded-2xl shadow-xs border border-[#E6E9DE] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
            <span className="material-symbols-outlined text-[18px]">switch_account</span>
          </div>
          <div>
            <div className="text-xs font-bold text-[#312620]">تغییر حساب و تست پروفایل‌ها</div>
            <div className="text-[11px] text-[#6B6057]">جابه‌جایی سریع بین حساب‌های نمایشی و تست حساب خام</div>
          </div>
        </div>
        <button
          onClick={() => setShowDemoModal(true)}
          className="px-3 py-1.5 bg-[#483C35] hover:bg-[#312620] text-white text-xs font-bold rounded-xl active:scale-95 transition-transform shadow-xs shrink-0"
        >
          مشاهده دموها
        </button>
      </section>

      {/* Badges & Milestones Showcase Section */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[17px] text-[#8F4E15]">workspace_premium</span>
            <span>نشان‌ها و دستاوردهای یادگیری</span>
            <span className="text-[10px] font-bold bg-[#FFDCC5] text-[#703700] px-2 py-0.5 rounded-full">
              {unlockedAchievementsCount} از {achievements.length} آزاد شده
            </span>
          </h2>
          <button
            onClick={() => navigateTo('achievements')}
            className="text-[11px] text-[#8F4E15] font-bold hover:underline flex items-center gap-0.5"
          >
            <span>مشاهده همه</span>
            <span className="material-symbols-outlined text-[14px]">chevron_left</span>
          </button>
        </div>

        {/* Milestone Highlights */}
        <div className="grid grid-cols-2 gap-2">
          {/* Milestone 1: First Path Completed */}
          {(() => {
            const b = achievements.find((item) => item.id === 'first-path');
            if (!b) return null;
            const style = getTierColors(b.tier);
            return (
              <div
                onClick={() => setSelectedBadge(b)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  b.isUnlocked
                    ? `${style.bg} ${style.border} ${style.glow}`
                    : 'bg-[#FFFFFF] border-[#E6E9DE] hover:border-[#D5DAC8]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      b.isUnlocked ? 'bg-white text-[#92400E]' : 'bg-[#EDEFE6] text-[#8D8177]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      b.isUnlocked ? style.badgeBg + ' text-white' : 'bg-[#EDEFE6] text-[#6B6057]'
                    }`}
                  >
                    {b.isUnlocked ? 'کسب‌شده ✓' : `${b.progress}/${b.maxProgress}`}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#312620] truncate">{b.title}</div>
                  <div className="text-[10px] text-[#8F4E15] font-bold mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">stars</span>
                    <span>+{b.wisdomPoints} امتیاز خرد</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Milestone 2: 7-Day Streak */}
          {(() => {
            const b = achievements.find((item) => item.id === 'streak-7');
            if (!b) return null;
            const style = getTierColors(b.tier);
            return (
              <div
                onClick={() => setSelectedBadge(b)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  b.isUnlocked
                    ? `${style.bg} ${style.border} ${style.glow}`
                    : 'bg-[#FFFFFF] border-[#E6E9DE] hover:border-[#D5DAC8]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      b.isUnlocked ? 'bg-white text-[#C2410C]' : 'bg-[#EDEFE6] text-[#8D8177]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{b.icon}</span>
                  </div>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      b.isUnlocked ? style.badgeBg + ' text-white' : 'bg-[#EDEFE6] text-[#6B6057]'
                    }`}
                  >
                    {b.isUnlocked ? 'کسب‌شده ✓' : `${b.progress}/${b.maxProgress} روز`}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#312620] truncate">{b.title}</div>
                  <div className="text-[10px] text-[#8F4E15] font-bold mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">stars</span>
                    <span>+{b.wisdomPoints} امتیاز خرد</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Badges Slider / Strip */}
        <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E6E9DE] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 flex-1">
            {achievements.map((b) => {
              const tier = getTierColors(b.tier);
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  title={`${b.title} - ${b.isUnlocked ? 'آزاد شده' : 'در انتظار'}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer active:scale-95 transition-all relative ${
                    b.isUnlocked
                      ? `${tier.bg} ${tier.border} shadow-xs`
                      : 'bg-[#EDEFE6]/80 border-[#E6E9DE] text-[#8D8177] opacity-60 hover:opacity-100'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      b.isUnlocked ? tier.text : 'text-[#8D8177]'
                    }`}
                  >
                    {b.icon}
                  </span>
                  {b.isUnlocked && (
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#FDA868] text-[#301400] rounded-full text-[8px] font-bold flex items-center justify-center ring-1 ring-white">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigateTo('achievements')}
            className="px-3 py-1.5 bg-[#483C35] hover:bg-[#312620] text-white text-[11px] font-bold rounded-xl active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1"
          >
            <span>تالار افتخارات</span>
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          </button>
        </div>
      </section>

      {/* Real Learning Paths Section (Mapped directly from user's persisted records) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">auto_stories</span>
            <span>مسیرهای یادگیری من ({allPaths.length})</span>
          </h2>
          {allPaths.length > 0 && (
            <button onClick={() => navigateTo('create-topic')} className="text-[11px] text-[#8F4E15] font-bold">
              + مسیر جدید
            </button>
          )}
        </div>

        {allPaths.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-xs border border-[#E6E9DE] text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-[#8D8177]">route</span>
            <p className="text-xs font-bold text-[#312620]">هنوز هیچ مسیر یادگیری ایجاد نکرده‌اید.</p>
            <p className="text-[11px] text-[#6B6057]">
              موضوع دلخواه خود را تعیین کنید تا مسیر گام‌به‌گام آن به صورت هوشمند برایتان ساخته شود.
            </p>
            <button
              onClick={() => navigateTo('create-topic')}
              className="mt-1 px-4 py-2 bg-[#483C35] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-xs"
            >
              ساخت اولین مسیر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {allPaths.map((p) => {
              const completedCount = p.steps ? p.steps.filter((s) => s.status === 'completed').length : 0;
              const totalCount = p.steps ? p.steps.length : p.totalSteps;
              const isCompleted = p.progressPercent >= 100;

              return (
                <div
                  key={p.id}
                  onClick={() => navigateTo('path-roadmap', { path: p })}
                  className="bg-[#FFFFFF] p-3.5 rounded-2xl shadow-xs border border-[#E6E9DE] flex flex-col gap-2 cursor-pointer hover:border-[#D5DAC8] transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#EDEFE6] border border-[#E6E9DE]">
                        <img
                          className="w-full h-full object-cover"
                          src={
                            p.heroImage ||
                            'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys'
                          }
                          alt={p.title}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#312620] truncate">{p.title}</div>
                        <div className="text-[11px] text-[#6B6057]">
                          {p.status === 'not_started'
                            ? 'هنوز شروع نشده'
                            : `${completedCount} از ${totalCount} پله تکمیل شده`}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[#8F4E15] font-bold shrink-0">{p.progressPercent}٪</span>
                  </div>

                  <div className="w-full h-1.5 bg-[#EDEFE6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-[#312620]' : 'bg-[#FDA868]'
                      }`}
                      style={{ width: `${Math.max(p.progressPercent, 3)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Learning Preferences Section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">tune</span>
          <span>تنظیمات و ترجیحات یادگیری</span>
        </h2>

        <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E6E9DE] overflow-hidden">
          {/* Daily Goal */}
          <div
            onClick={() => {
              setStudyTimeValue(user?.preferences?.dailyGoalMinutes || 20);
              setShowStudyTimeModal(true);
            }}
            className="flex items-center justify-between p-3.5 hover:bg-[#F2F5EC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620]">
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#312620]">زمان مطالعه روزانه</div>
                <div className="text-[11px] text-[#6B6057]">هدف تنظیم‌شده برای هر روز</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#8F4E15]">
                {user?.preferences?.dailyGoalMinutes || 20} دقیقه
              </span>
              <span className="material-symbols-outlined text-[#8D8177] text-[16px]">chevron_left</span>
            </div>
          </div>

          <div className="h-[1px] bg-[#E6E9DE] mx-3.5"></div>

          {/* Preferred Level */}
          <div
            onClick={handleCycleLevel}
            className="flex items-center justify-between p-3.5 hover:bg-[#F2F5EC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620]">
                <span className="material-symbols-outlined text-[18px]">equalizer</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#312620]">سطح پیش‌فرض</div>
                <div className="text-[11px] text-[#6B6057]">تنظیم عمق واژگان و تمارین</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#6B6057]">
                {levelLabels[user?.preferences?.defaultLevel || 'intermediate']}
              </span>
              <span className="material-symbols-outlined text-[#8D8177] text-[16px]">chevron_left</span>
            </div>
          </div>

          <div className="h-[1px] bg-[#E6E9DE] mx-3.5"></div>

          {/* Focus Mode Switch */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620]">
                <span className="material-symbols-outlined text-[18px]">do_not_disturb_on</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#312620]">حالت مطالعه بدون حواس‌پرتی</div>
                <div className="text-[11px] text-[#6B6057]">بی‌صدا کردن هشدارها حین جلسات</div>
              </div>
            </div>
            <button
              onClick={handleToggleFocus}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${
                user?.preferences?.focusMode ?? true ? 'bg-[#483C35]' : 'bg-[#D5DAC8]'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  user?.preferences?.focusMode ?? true ? '-translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant & Notes Section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">psychology</span>
          <span>دستیار هوشمند و یادداشت‌ها</span>
        </h2>

        <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E6E9DE] overflow-hidden">
          {/* AI Tone */}
          <div
            onClick={handleCycleAiTone}
            className="flex items-center justify-between p-3.5 hover:bg-[#F2F5EC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620] flex-shrink-0">
                <span className="material-symbols-outlined text-[18px]">forum</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#312620] truncate">لحن پاسخ‌گویی هوش مصنوعی</div>
                <div className="text-[11px] text-[#6B6057] truncate">
                  {user?.preferences?.aiTone === 'socratic'
                    ? 'توضیحی و سقراطی'
                    : user?.preferences?.aiTone === 'concise'
                    ? 'فشرده و نکته‌محور'
                    : 'آموزشی و تحلیلی'}
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#8D8177] text-[16px]">chevron_left</span>
          </div>

          <div className="h-[1px] bg-[#E6E9DE] mx-3.5"></div>

          {/* Notes Manager */}
          <div
            onClick={() => setShowNotesModal(true)}
            className="flex items-center justify-between p-3.5 hover:bg-[#F2F5EC] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EDEFE6] flex items-center justify-center text-[#312620]">
                <span className="material-symbols-outlined text-[18px]">bookmarks</span>
              </div>
              <div>
                <div className="text-xs font-bold text-[#312620]">مدیریت یادداشت‌ها و گزیده‌ها</div>
                <div className="text-[11px] text-[#6B6057]">{notes.length} یادداشت ذخیره‌شده</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#8D8177] text-[16px]">chevron_left</span>
          </div>
        </div>
      </section>

      {/* Logout Action */}
      <div className="flex flex-col items-center justify-center pt-2">
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors px-4 py-2 rounded-xl text-xs font-bold active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>خروج از حساب کاربری</span>
        </button>
        <span className="text-[10px] text-[#8D8177] mt-1">نسخه ۲.۴.۰ • برنامه یادگیری پله</span>
      </div>

      {/* Demo Switcher Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 w-full max-w-sm shadow-xl border border-[#D5DAC8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E9DE] mb-3">
              <h3 className="text-sm font-bold text-[#312620]">سوئیچ بین حساب‌های نمایشی</h3>
              <button onClick={() => setShowDemoModal(false)} className="text-[#8D8177]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs text-[#6B6057] mb-3">
              برای بررسی سناریوهای مختلف بدون تداخل با حساب اصلی، یکی از حساب‌های دمو را برگزینید:
            </p>
            <div className="flex flex-col gap-2">
              {demoAccounts.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleSwitchToDemo(d.id)}
                  className="p-3 rounded-xl bg-[#F5F7EE] hover:bg-[#EDEFE6] border border-[#E6E9DE] flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={d.avatarUrl} alt={d.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <div className="font-bold text-xs text-[#312620]">{d.name}</div>
                      <div className="text-[10px] text-[#6B6057]">{d.bio}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#8F4E15]">
                    {d.progressPercent > 0 ? `${d.progressPercent}٪` : 'خام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 w-full max-w-sm shadow-xl border border-[#D5DAC8]">
            <h3 className="text-sm font-bold text-[#312620] mb-3">ویرایش اطلاعات کاربری</h3>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] text-[#6B6057] block mb-1">نام:</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-[#F5F7EE] border border-[#D5DAC8] rounded-xl px-3 py-2 text-xs text-[#2E2621] outline-none focus:border-[#483C35]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#6B6057] block mb-1">بیوگرافی و علایق:</label>
                <textarea
                  rows={2}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-[#F5F7EE] border border-[#D5DAC8] rounded-xl px-3 py-2 text-xs text-[#2E2621] outline-none focus:border-[#483C35]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#483C35] text-white rounded-xl text-xs font-bold"
                >
                  ذخیره تغییرات
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-[#EDEFE6] text-[#312620] rounded-xl text-xs font-semibold"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Manager Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 w-full max-w-lg h-[80vh] flex flex-col shadow-xl border border-[#D5DAC8]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E9DE]">
              <h3 className="text-sm font-bold text-[#312620]">یادداشت‌ها و گزیده‌های ذخیره‌شده</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-[#8D8177]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2.5">
              {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#8D8177]">
                  <span className="material-symbols-outlined text-3xl mb-1">bookmark_border</span>
                  <p className="text-xs">هنوز یادداشتی ذخیره نکرده‌اید.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 bg-[#F5F7EE] rounded-xl border border-[#E6E9DE] flex flex-col gap-1.5">
                    {note.stepTitle && (
                      <span className="text-[10px] font-bold text-[#8F4E15]">{note.stepTitle}</span>
                    )}
                    {note.quote && (
                      <blockquote className="text-[11px] text-[#4E4540] italic border-r-2 border-[#FDA868] pr-2">
                        {note.quote}
                      </blockquote>
                    )}
                    <p className="text-xs text-[#2E2621] leading-relaxed whitespace-pre-line">{note.text}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#8D8177]">
                      <span>{new Date(note.createdAt).toLocaleDateString('fa-IR')}</span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-[#BA1A1A] hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Badge Quick Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#D5DAC8] relative flex flex-col gap-3.5">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#EDEFE6] hover:bg-[#E1E3DB] flex items-center justify-center text-[#6B6057] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            {(() => {
              const tier = getTierColors(selectedBadge.tier);
              const isUnlocked = selectedBadge.isUnlocked;

              return (
                <>
                  <div className="flex flex-col items-center text-center pt-2">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md relative mb-2.5 ${
                        isUnlocked ? `${tier.bg} ${tier.border} border-2 ${tier.glow}` : 'bg-[#EDEFE6]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[36px] ${
                          isUnlocked ? tier.text : 'text-[#8D8177]'
                        }`}
                      >
                        {selectedBadge.icon}
                      </span>
                      {isUnlocked && (
                        <div className="absolute -top-1.5 -right-1.5 bg-[#FDA868] text-[#301400] text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                          کسب‌شده
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                        isUnlocked ? tier.badgeBg + ' text-white' : 'bg-[#EDEFE6] text-[#6B6057]'
                      }`}
                    >
                      عیار {tier.label}
                    </span>

                    <h3 className="text-sm font-bold text-[#312620]">{selectedBadge.title}</h3>
                    <span className="text-[10px] text-[#8D8177] font-sans" dir="ltr">
                      {selectedBadge.titleEn}
                    </span>
                  </div>

                  <p className="text-xs text-[#4E4540] text-center leading-relaxed bg-[#F9FAF6] p-2.5 rounded-xl border border-[#E6E9DE]">
                    {selectedBadge.description}
                  </p>

                  {/* Progress Status */}
                  <div className="flex flex-col gap-1.5 bg-[#EDEFE6]/50 p-3 rounded-2xl border border-[#E6E9DE]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B6057] font-medium">پیشرفت دستاورد:</span>
                      <span className="font-bold text-[#312620]">
                        {isUnlocked
                          ? `آزاد شده (${selectedBadge.unlockedAt || 'تکمیل'})`
                          : `${selectedBadge.progress} از ${selectedBadge.maxProgress}`}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[#EDEFE6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FDA868] rounded-full"
                        style={{
                          width: `${Math.round((selectedBadge.progress / selectedBadge.maxProgress) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-0.5">
                      <span className="text-[#8F4E15] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">stars</span>
                        <span>+{selectedBadge.wisdomPoints} امتیاز خرد</span>
                      </span>
                      <span className="text-[#6B6057]">
                        {selectedBadge.id === 'first-path'
                          ? 'پایان دوره کامل'
                          : selectedBadge.id === 'streak-7'
                          ? '۷ روز پیاپی'
                          : 'صعود گام‌به‌گام'}
                      </span>
                    </div>
                  </div>

                  {/* Modal Action CTA */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedBadge(null);
                        navigateTo('achievements');
                      }}
                      className="flex-1 py-2.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#FDA868]">
                        workspace_premium
                      </span>
                      <span>مشاهده در تالار افتخارات</span>
                    </button>
                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="px-4 py-2.5 bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] rounded-xl text-xs font-semibold"
                    >
                      بستن
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Daily Study Time Slider Modal */}
      {showStudyTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#D5DAC8] relative flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E9DE]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15]">
                  <span className="material-symbols-outlined text-[18px]">timelapse</span>
                </div>
                <h3 className="text-sm font-bold text-[#312620]">تنظیم زمان مطالعه روزانه</h3>
              </div>
              <button
                onClick={() => setShowStudyTimeModal(false)}
                className="w-7 h-7 rounded-full bg-[#EDEFE6] hover:bg-[#E1E3DB] flex items-center justify-center text-[#6B6057]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <DailyStudyTimeSlider
              value={studyTimeValue}
              onChange={setStudyTimeValue}
              min={5}
              max={60}
              step={1}
            />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await updateUserProfile({
                    preferences: {
                      ...(user?.preferences || {
                        defaultLevel: 'intermediate',
                        focusMode: true,
                        aiTone: 'socratic',
                        fontSize: 'normal',
                      }),
                      dailyGoalMinutes: studyTimeValue,
                    },
                  });
                  setShowStudyTimeModal(false);
                  showToast(`هدف روزانه به ${studyTimeValue} دقیقه تغییر یافت ✨`);
                }}
                className="flex-1 py-2.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                ذخیره زمان جدید
              </button>
              <button
                type="button"
                onClick={() => setShowStudyTimeModal(false)}
                className="px-4 py-2.5 bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] rounded-xl text-xs font-semibold"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
