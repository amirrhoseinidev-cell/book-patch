import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { usePalle } from '../context/PalleContext';
import { AchievementBadge, AchievementCategory, AchievementTier } from '../types/palle';

export const AchievementsView: React.FC = () => {
  const {
    achievements,
    unlockedAchievementsCount,
    totalWisdomPoints,
    user,
    allPaths,
    navigateTo,
    goBack,
    showToast,
  } = usePalle();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);

  const totalBadges = achievements.length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedAchievementsCount / totalBadges) * 100) : 0;

  const categories = [
    { id: 'all', label: 'همه نشان‌ها', icon: 'military_tech' },
    { id: 'unlocked', label: 'بازشده‌ها', icon: 'check_circle' },
    { id: 'in_progress', label: 'در حال پیشرفت', icon: 'pending' },
    { id: 'streak', label: 'استمرار و روزمرگی', icon: 'local_fire_department' },
    { id: 'path', label: 'مسیرها و پله‌ها', icon: 'route' },
    { id: 'quiz', label: 'سنجش و آزمون', icon: 'psychology' },
    { id: 'reading', label: 'کتاب و اندیشه', icon: 'auto_stories' },
  ];

  const filteredBadges = achievements.filter((badge) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'unlocked') return badge.isUnlocked;
    if (activeCategory === 'in_progress') return !badge.isUnlocked;
    return badge.category === activeCategory;
  });

  const getTierColors = (tier: AchievementTier) => {
    switch (tier) {
      case 'diamond':
        return {
          bg: 'bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC]',
          border: 'border-[#38BDF8]',
          text: 'text-[#0369A1]',
          badgeBg: 'bg-[#0284C7]',
          badgeText: 'text-white',
          glow: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
          label: 'الماسین',
        };
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#F59E0B]/30',
          border: 'border-[#F59E0B]',
          text: 'text-[#92400E]',
          badgeBg: 'bg-[#D97706]',
          badgeText: 'text-white',
          glow: 'shadow-[0_0_16px_rgba(245,158,11,0.25)]',
          label: 'زرین (طلا)',
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1]',
          border: 'border-[#94A3B8]',
          text: 'text-[#334155]',
          badgeBg: 'bg-[#64748B]',
          badgeText: 'text-white',
          glow: 'shadow-[0_0_12px_rgba(148,163,184,0.2)]',
          label: 'سیمین (نقره)',
        };
      case 'bronze':
      default:
        return {
          bg: 'bg-gradient-to-br from-[#FFEDD5] via-[#FED7AA] to-[#FDBA74]/40',
          border: 'border-[#FB923C]',
          text: 'text-[#9A3412]',
          badgeBg: 'bg-[#C2410C]',
          badgeText: 'text-white',
          glow: 'shadow-[0_0_12px_rgba(251,146,60,0.2)]',
          label: 'مفرغی (برنز)',
        };
    }
  };

  const handleCelebrateBadge = (badge: AchievementBadge) => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FDA868', '#483C35', '#F59E0B', '#38BDF8'],
      });
    } catch {
      // ignore
    }
    showToast(`افتخار «${badge.title}» صیقل‌بخش مسیر یادگیری شماست! ✨`, 'success');
  };

  const handleCopyBadge = (badge: AchievementBadge) => {
    const text = `🏆 دستاورد من در پله: «${badge.title}»\n${badge.description}\nامتیاز خرد کسب‌شده: +${badge.wisdomPoints}\n«${badge.mentorQuote || 'گام‌به‌گام به سوی دانایی'}»`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('متن دستاورد برای اشتراک‌گذاری کپی شد 📋', 'success');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-3 pb-28 gap-4">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#483C35] to-[#312620] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FDA868]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FFDCC5]/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#FDA868] text-[#301400] flex items-center justify-center font-bold shadow-md">
                <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">نشان‌ها و دستاوردهای یادگیری</h1>
                <p className="text-xs text-[#D5C3B9]">ردپای صعود شما در مسیرهای خرد و استمرار</p>
              </div>
            </div>

            <button
              onClick={goBack}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              <span>بازگشت</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/10">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center flex flex-col items-center">
              <span className="text-[10px] text-[#D5C3B9] font-medium">نشان‌های کسب‌شده</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-extrabold text-[#FDA868]">{unlockedAchievementsCount}</span>
                <span className="text-xs text-white/70 font-bold">/ {totalBadges}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center flex flex-col items-center">
              <span className="text-[10px] text-[#D5C3B9] font-medium">امتیاز خرد</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[#FDA868] text-[15px]">stars</span>
                <span className="text-lg font-extrabold text-white">{totalWisdomPoints}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2.5 text-center flex flex-col items-center">
              <span className="text-[10px] text-[#D5C3B9] font-medium">زنجیره استمرار</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[#FDA868] text-[15px]">local_fire_department</span>
                <span className="text-lg font-extrabold text-white">{user?.streakDays ?? 0}</span>
                <span className="text-[10px] text-[#D5C3B9]">روز</span>
              </div>
            </div>
          </div>

          {/* Overall Progress Tracker */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#D5C3B9] text-[11px]">پیشرفت کلی در تالار افتخارات</span>
              <span className="font-bold text-[#FDA868] text-[11px]">{progressPercent}٪ تکمیل‌شده</span>
            </div>
            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FDA868] to-[#FFDCC5] rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <section className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {categories.map((c) => {
          const isActive = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#483C35] text-white shadow-xs'
                  : 'bg-white text-[#6B6057] hover:bg-[#EDEFE6] border border-[#E6E9DE]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </section>

      {/* Key Milestones Spotlight Highlight */}
      {activeCategory === 'all' && (
        <section className="bg-white rounded-3xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#312620]">
              <span className="material-symbols-outlined text-[#8F4E15] text-[18px]">verified</span>
              <span>نشان‌های برجسته و شاخص (Milestones)</span>
            </div>
            <span className="text-[11px] text-[#8F4E15] font-semibold">پایان مسیر &amp; زنجیره ۷ روزه</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. First Path Completed Milestone */}
            {(() => {
              const b = achievements.find((item) => item.id === 'first-path');
              if (!b) return null;
              const style = getTierColors(b.tier);
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                    b.isUnlocked
                      ? `${style.bg} ${style.border} ${style.glow}`
                      : 'bg-[#F9FAF6] border-[#E6E9DE] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          b.isUnlocked ? 'bg-white text-[#92400E]' : 'bg-[#EDEFE6] text-[#8D8177]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">emoji_events</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#312620] flex items-center gap-1">
                          <span>{b.title}</span>
                          {b.isUnlocked && <span className="text-[11px]">✨</span>}
                        </div>
                        <div className="text-[10px] text-[#6B6057] font-sans" dir="ltr">
                          {b.titleEn}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        b.isUnlocked ? 'bg-[#D97706] text-white' : 'bg-[#EDEFE6] text-[#6B6057]'
                      }`}
                    >
                      {b.isUnlocked ? 'کسب‌شده' : 'در انتظار'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#4E4540] leading-relaxed line-clamp-2">{b.description}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#312620]/10">
                    <div className="flex items-center gap-1 text-[#8F4E15] font-bold">
                      <span className="material-symbols-outlined text-[14px]">stars</span>
                      <span>+{b.wisdomPoints} امتیاز خرد</span>
                    </div>
                    <span className="font-bold text-[#312620]">
                      {b.progress} از {b.maxProgress} مسیر
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 2. 7-Day Learning Streak Milestone */}
            {(() => {
              const b = achievements.find((item) => item.id === 'streak-7');
              if (!b) return null;
              const style = getTierColors(b.tier);
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                    b.isUnlocked
                      ? `${style.bg} ${style.border} ${style.glow}`
                      : 'bg-[#F9FAF6] border-[#E6E9DE] opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          b.isUnlocked ? 'bg-white text-[#C2410C]' : 'bg-[#EDEFE6] text-[#8D8177]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">whatshot</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#312620] flex items-center gap-1">
                          <span>{b.title}</span>
                          {b.isUnlocked && <span className="text-[11px]">🔥</span>}
                        </div>
                        <div className="text-[10px] text-[#6B6057] font-sans" dir="ltr">
                          {b.titleEn}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        b.isUnlocked ? 'bg-[#C2410C] text-white' : 'bg-[#EDEFE6] text-[#6B6057]'
                      }`}
                    >
                      {b.isUnlocked ? 'کسب‌شده' : `${b.progress}/${b.maxProgress} روز`}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#4E4540] leading-relaxed line-clamp-2">{b.description}</p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#312620]/10">
                    <div className="flex items-center gap-1 text-[#8F4E15] font-bold">
                      <span className="material-symbols-outlined text-[14px]">stars</span>
                      <span>+{b.wisdomPoints} امتیاز خرد</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#312620]">
                      <span className="material-symbols-outlined text-[14px] text-[#C2410C]">
                        local_fire_department
                      </span>
                      <span>{user?.streakDays ?? 0} روز استمرار</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* Main Badges Grid */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8F4E15] text-[17px]">military_tech</span>
            <span>تمام نشان‌ها و عیارهای دانایی ({filteredBadges.length})</span>
          </h2>
          <span className="text-[11px] text-[#6B6057]">برای جزئیات روی هر نشان ضربه بزنید</span>
        </div>

        {filteredBadges.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E6E9DE] flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-[#8D8177]">emoji_events</span>
            <p className="text-xs font-bold text-[#312620]">هیچ نشانی در این دسته پیدا نشد.</p>
            <p className="text-[11px] text-[#6B6057]">
              با مطالعه روزانه و پاسخ به آزمون‌ها نشان‌های جدیدی آزاد خواهید کرد.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredBadges.map((badge) => {
              const tier = getTierColors(badge.tier);
              const isUnlocked = badge.isUnlocked;
              const percent = Math.round((badge.progress / badge.maxProgress) * 100);

              return (
                <div
                  key={badge.id}
                  onClick={() => setSelectedBadge(badge)}
                  className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 hover:shadow-md active:scale-[0.99] ${
                    isUnlocked
                      ? `${tier.border} shadow-xs`
                      : 'border-[#E6E9DE] hover:border-[#D5DAC8]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs relative ${
                        isUnlocked ? `${tier.bg} ${tier.border} border` : 'bg-[#EDEFE6] text-[#8D8177]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[24px] ${
                          isUnlocked ? tier.text : 'text-[#8D8177]'
                        }`}
                      >
                        {badge.icon}
                      </span>
                      {isUnlocked && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#312620] text-white flex items-center justify-center text-[9px] font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs font-bold text-[#312620] truncate">{badge.title}</h3>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isUnlocked ? tier.badgeBg + ' ' + tier.badgeText : 'bg-[#EDEFE6] text-[#6B6057]'
                          }`}
                        >
                          {tier.label}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#8D8177] font-sans" dir="ltr">
                        {badge.titleEn}
                      </div>

                      <p className="text-[11px] text-[#6B6057] mt-1 line-clamp-2 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress & Wisdom Footer */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F0F2EB]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#8F4E15] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">stars</span>
                        <span>+{badge.wisdomPoints} امتیاز خرد</span>
                      </span>

                      {isUnlocked ? (
                        <span className="text-[#2E7D32] font-bold flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>آزاد شده ({badge.unlockedAt || 'تکمیل'})</span>
                        </span>
                      ) : (
                        <span className="text-[#6B6057] font-semibold">
                          {badge.progress} / {badge.maxProgress}
                        </span>
                      )}
                    </div>

                    {!isUnlocked && (
                      <div className="w-full h-1.5 bg-[#EDEFE6] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FDA868] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(percent, 5)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Encouragement / Mentor Advice Banner */}
      <section className="bg-[#EDEFE6] rounded-3xl p-4 border border-[#E6E9DE] flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
          <span className="material-symbols-outlined text-[22px]">psychology</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-[#312620]">فلسفه نشان‌های پله</h4>
          <p className="text-[11px] text-[#6B6057] leading-relaxed mt-0.5">
            این نشان‌ها صرفاً ابزار ظاهری نیستند؛ هر پله بازتابی از درک عمیق‌تر، استمرار روزمره و تقویت تفکر
            انتقادی شماست.
          </p>
        </div>
      </section>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-[#D5DAC8] relative flex flex-col gap-4">
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
                      className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg relative mb-3 ${
                        isUnlocked ? `${tier.bg} ${tier.border} border-2 ${tier.glow}` : 'bg-[#EDEFE6]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[42px] ${
                          isUnlocked ? tier.text : 'text-[#8D8177]'
                        }`}
                      >
                        {selectedBadge.icon}
                      </span>
                      {isUnlocked && (
                        <div className="absolute -top-2 -right-2 bg-[#FDA868] text-[#301400] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                          کسب‌شده
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1.5 ${
                        isUnlocked ? tier.badgeBg + ' ' + tier.badgeText : 'bg-[#EDEFE6] text-[#6B6057]'
                      }`}
                    >
                      عیار {tier.label}
                    </span>

                    <h3 className="text-base font-extrabold text-[#312620]">{selectedBadge.title}</h3>
                    <span className="text-[11px] text-[#8D8177] font-sans" dir="ltr">
                      {selectedBadge.titleEn}
                    </span>
                  </div>

                  <p className="text-xs text-[#4E4540] text-center leading-relaxed bg-[#F9FAF6] p-3 rounded-2xl border border-[#E6E9DE]">
                    {selectedBadge.description}
                  </p>

                  {/* Mentor Quote */}
                  {selectedBadge.mentorQuote && (
                    <div className="text-[11px] text-[#8F4E15] italic bg-[#FFDCC5]/30 p-2.5 rounded-xl border border-[#FDA868]/30 text-center">
                      {selectedBadge.mentorQuote}
                    </div>
                  )}

                  {/* Progress Status */}
                  <div className="flex flex-col gap-1.5 bg-[#EDEFE6]/50 p-3 rounded-2xl border border-[#E6E9DE]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6B6057] font-medium">وضعیت پیشرفت:</span>
                      <span className="font-bold text-[#312620]">
                        {isUnlocked
                          ? `تکمیل‌شده (${selectedBadge.unlockedAt || 'آزاد'})`
                          : `${selectedBadge.progress} از ${selectedBadge.maxProgress}`}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#EDEFE6] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FDA868] rounded-full"
                        style={{
                          width: `${Math.round((selectedBadge.progress / selectedBadge.maxProgress) * 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-[#8F4E15] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">stars</span>
                        <span>پاداش: +{selectedBadge.wisdomPoints} امتیاز خرد</span>
                      </span>
                      <span className="text-[#6B6057] text-[10px]">
                        دسته‌بندی:{' '}
                        {selectedBadge.category === 'streak'
                          ? 'استمرار'
                          : selectedBadge.category === 'path'
                          ? 'مسیرها'
                          : selectedBadge.category === 'quiz'
                          ? 'آزمون'
                          : 'مطالعه'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {isUnlocked ? (
                      <>
                        <button
                          onClick={() => handleCelebrateBadge(selectedBadge)}
                          className="flex-1 py-2.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#FDA868]">celebration</span>
                          <span>شادی و یادآوری</span>
                        </button>
                        <button
                          onClick={() => handleCopyBadge(selectedBadge)}
                          className="px-3.5 py-2.5 bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                          title="اشتراک‌گذاری"
                        >
                          <span className="material-symbols-outlined text-[16px]">share</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedBadge(null);
                          if (selectedBadge.category === 'path' && allPaths.length > 0) {
                            navigateTo('path-roadmap');
                          } else {
                            navigateTo('home');
                          }
                        }}
                        className="w-full py-2.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>ادامه مطالعه برای آزاد کردن نشان</span>
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
