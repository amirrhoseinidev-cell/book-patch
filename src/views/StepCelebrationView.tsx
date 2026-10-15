import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { usePalle } from '../context/PalleContext';

export const StepCelebrationView: React.FC = () => {
  const { user, currentStep, activePath, navigateTo } = usePalle();

  const userName = user?.name?.split(' ')[0] || 'عزیز';
  const stepNumber = currentStep?.stepNumber || 1;
  const nextStepIndex = currentStep ? currentStep.stepNumber : 1;
  const nextStep = activePath?.steps[nextStepIndex];

  useEffect(() => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FDA868', '#483C35', '#D5C3B9', '#8F4E15'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleContinueToNextStep = () => {
    if (nextStep) {
      navigateTo('step-overview', { step: nextStep });
    } else {
      navigateTo('path-roadmap');
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-2 pb-16 gap-4">
      {/* Celebration Aura & Tactile Illustration */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-1 text-center">
        <div className="absolute w-44 h-44 rounded-full bg-[#FDA868]/15 blur-2xl pointer-events-none -top-2"></div>

        {/* Ascending Steps SVG Graphic */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-2">
          <svg className="w-full h-full drop-shadow-xs" fill="none" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 136H142" stroke="#483c35" strokeLinecap="round" strokeOpacity="0.12" strokeWidth="4"></path>
            {/* Step 1 */}
            <rect fill="#483c35" height="32" rx="6" width="32" x="26" y="104"></rect>
            <path d="M37 120L41 124L48 116" stroke="#f8faf1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            {/* Step 2 */}
            <rect fill="#483c35" height="56" rx="6" width="32" x="54" y="80"></rect>
            <path d="M65 96L69 100L76 92" stroke="#f8faf1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
            {/* Step 3 */}
            <rect fill="#fda868" height="84" rx="7" width="34" x="82" y="52"></rect>
            <rect fill="#f28938" height="28" rx="6" width="34" x="82" y="52"></rect>
            <path d="M94 66L98 70L105 61" stroke="#312620" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.8"></path>
            {/* Step 4 */}
            <rect fill="#edefe6" height="104" rx="6" width="26" x="112" y="32"></rect>
            <circle cx="125" cy="46" fill="#80756f" r="3"></circle>
            {/* Sparkles */}
            <g className="animate-pulse">
              <path d="M100 24C100.5 29.5 102.5 31.5 108 32C102.5 32.5 100.5 34.5 100 40C99.5 34.5 97.5 32.5 92 32C97.5 31.5 99.5 29.5 100 24Z" fill="#fda868"></path>
              <circle cx="118" cy="20" fill="#fda868" r="2.5"></circle>
              <circle cx="78" cy="40" fill="#d5c3b9" r="2"></circle>
            </g>
          </svg>
        </div>

        {/* Milestone Celebration Chip */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFDCC5] text-[#301400] shadow-xs mb-2">
          <span className="material-symbols-outlined text-[#8F4E15] text-[16px] filled">auto_awesome</span>
          <span className="text-xs font-bold">پله {stepNumber} با موفقیت طی شد! ✨</span>
        </div>

        {/* Commendation Typography */}
        <h1 className="text-lg font-black text-[#312620] tracking-tight mb-1">
          آفرین {userName}! یک پله به عمق {activePath?.category || 'یادگیری'} نزدیک‌تر شدی
        </h1>
        <p className="text-xs text-[#6B6057] max-w-sm leading-relaxed px-2">
          {currentStep?.subtitle || 'مفاهیم این مرحله را درک کردی و به پرسش‌های مفهومی آن با موفقیت پاسخ دادی.'}
        </p>
      </div>

      {/* Progress Tracking Surface */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EDEFE6] flex items-center justify-center text-[#312620] shrink-0">
              <span className="material-symbols-outlined text-[18px] filled">menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8D8177]">مسیر مطالعاتی</span>
              <span className="font-bold text-xs text-[#312620]">{activePath?.title || 'مسیر یادگیری'}</span>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#EDEFE6] text-[#312620] text-xs font-bold">
            {activePath?.progressPercent || 30}٪
          </span>
        </div>

        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-[#6B6057] text-xs">
            <span>وضعیت پیشرفت گام‌به‌گام</span>
            <span className="font-bold text-[#312620]">
              {stepNumber} از {activePath?.totalSteps || 10} پله کامل شده
            </span>
          </div>

          <div className="grid grid-cols-10 gap-1.5 w-full items-center py-1" dir="rtl">
            {Array.from({ length: 10 }).map((_, i) => {
              const isPast = i < stepNumber;
              const isCurrent = i === stepNumber;
              return isPast ? (
                <div key={i} className="h-2 rounded-full bg-[#483C35]"></div>
              ) : isCurrent ? (
                <div key={i} className="relative h-2 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#FDA868]"></div>
                  <span className="absolute w-3 h-3 rounded-full bg-[#FDA868]/50 animate-ping"></span>
                </div>
              ) : (
                <div key={i} className="h-2 rounded-full bg-[#EDEFE6]"></div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 bg-[#F5F7EE] px-3.5 py-2.5 rounded-xl border border-[#E6E9DE]">
          <span className="material-symbols-outlined text-[#8F4E15] text-[18px] filled">timer</span>
          <span className="text-xs text-[#312620] font-medium">
            {currentStep?.durationMinutes || 20} دقیقه مطالعه و تمرین متمرکز
          </span>
        </div>
      </div>

      {/* Key Concept Takeaway Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#FDA868]"></div>
        <div className="flex items-center gap-2 mb-1.5 pr-1 text-[#312620]">
          <span className="material-symbols-outlined text-[#8F4E15] text-[20px] filled">lightbulb</span>
          <h2 className="text-xs font-bold">دستاورد مفهومی این پله:</h2>
        </div>
        <p className="text-xs text-[#6B6057] leading-relaxed pr-1">
          {currentStep?.keyTakeaway || 'توانایی تشخیص مغالطه در پیش‌فرض‌ها و مهارت طرح سوالات بنیادین برای کشف حقیقت.'}
        </p>
      </div>

      {/* Next Step Preview Card */}
      {nextStep ? (
        <div
          onClick={handleContinueToNextStep}
          className="bg-[#EDEFE6] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs border border-[#E6E9DE] cursor-pointer hover:bg-[#E1E3DB] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] flex items-center justify-center text-[#312620] shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#8F4E15] font-bold">پله بعدی آماده است</span>
              <span className="font-bold text-xs text-[#312620]">
                پله {nextStep.stepNumber} - {nextStep.title}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#6B6057] rotate-180 text-[18px]">
            arrow_forward_ios
          </span>
        </div>
      ) : (
        <div className="bg-[#EDEFE6] rounded-2xl p-3.5 text-center text-xs text-[#312620] font-bold">
          تبریک! تمام پله‌های این مسیر مطالعاتی را با موفقیت به پایان رساندید 🎉
        </div>
      )}

      {/* Action CTA Area */}
      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={handleContinueToNextStep}
          className="w-full h-12 rounded-xl bg-[#483C35] hover:bg-[#312620] text-white flex items-center justify-center gap-2 text-xs font-bold shadow-md active:scale-[0.98] transition-all"
        >
          <span>ادامه مسیر یادگیری (پله {nextStep ? nextStep.stepNumber : 'بعدی'})</span>
          <span className="material-symbols-outlined text-[#FDA868] text-[18px] filled">play_arrow</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigateTo('achievements')}
            className="h-10 rounded-xl bg-[#FFDCC5]/60 hover:bg-[#FFDCC5] text-[#703700] flex items-center justify-center gap-1.5 text-xs font-bold active:scale-[0.98] transition-all border border-[#FDA868]/40"
          >
            <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
            <span>مشاهده نشان‌ها و رتبه</span>
          </button>

          <button
            onClick={() => navigateTo('profile')}
            className="h-10 rounded-xl bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-[0.98] transition-all border border-[#E6E9DE]"
          >
            <span className="material-symbols-outlined text-[#6B6057] text-[16px]">edit_note</span>
            <span>مرور یادداشت‌ها</span>
          </button>
        </div>
      </div>
    </div>
  );
};
