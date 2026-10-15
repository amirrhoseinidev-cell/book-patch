import React from 'react';
import { usePalle } from '../context/PalleContext';
import { LearningStep } from '../types/palle';

export const PathRoadmapView: React.FC = () => {
  const { activePath, navigateTo, showToast, startStep } = usePalle();

  if (!activePath) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <span className="material-symbols-outlined text-4xl text-[#8D8177] mb-2">alt_route</span>
        <h3 className="font-bold text-base text-[#312620]">مسیری انتخاب نشده است</h3>
        <button
          onClick={() => navigateTo('create-topic')}
          className="mt-3 px-4 py-2 bg-[#483C35] text-white rounded-xl text-xs font-bold"
        >
          ساخت مسیر جدید
        </button>
      </div>
    );
  }

  const completedSteps = activePath.steps ? activePath.steps.filter((s) => s.status === 'completed') : [];
  const remainingCount = (activePath.steps ? activePath.steps.length : activePath.totalSteps) - completedSteps.length;

  const handleStepClick = async (step: LearningStep, idx: number) => {
    const isFirstStep = idx === 0 || step.stepNumber === 1;
    // Step 1 is ALWAYS unlocked. Subsequent steps unlock sequentially.
    if (!isFirstStep && step.status === 'locked') {
      showToast('این پله هنوز قفل است. لطفاً ابتدا پله‌های قبلی را به پایان برسانید.', 'info');
      return;
    }
    await startStep(activePath.id, step.id);
    navigateTo('step-overview', { step, path: activePath });
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-margin-mobile pt-4 pb-28 gap-space-md">
      {/* Path Overview Header Card */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-[0_4px_20px_rgba(72,60,53,0.06)] relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-secondary-fixed/30 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold">
              <span className="material-symbols-outlined text-[16px] text-secondary">explore</span>
              مسیر پیوسته
            </span>
            <span className="inline-flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-[15px] text-secondary-container">alarm</span>
              تخمین کل: {activePath.estimatedWeeks} هفته
            </span>
          </div>

          <h2 className="font-headline-md text-headline-md text-primary mt-1 font-bold">{activePath.title}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{activePath.description}</p>

          {/* Progress Overview */}
          <div className="mt-space-xs pt-space-xs flex flex-col gap-2">
            <div className="flex items-center justify-between font-label-md text-label-md text-primary">
              <span className="font-bold">
                پله {activePath.currentStepIndex + 1} از {activePath.totalSteps} ({activePath.progressPercent}٪ پیشرفت)
              </span>
              <span className="text-secondary font-bold">{remainingCount} پله مانده</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-secondary-container rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(activePath.progressPercent, 5)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Journey Context (Subtle Illustration) */}
      <div className="relative h-28 rounded-xl overflow-hidden shadow-sm">
        <img
          src={activePath.heroImage}
          alt={activePath.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-primary/80 via-primary/50 to-transparent flex items-center px-space-md">
          <div className="text-on-primary">
            <p className="font-label-sm text-label-sm opacity-90 font-medium">هدف این هفته</p>
            <p className="font-headline-sm text-headline-sm font-bold">{activePath.weeklyFocus}</p>
          </div>
        </div>
      </div>

      {/* Vertical Timeline Roadmap */}
      <div className="relative flex flex-col">
        <div className="absolute top-6 bottom-8 right-[19px] w-[2px] bg-surface-container-highest -z-0"></div>

        {activePath.steps.map((step, idx) => {
          const isFirstStep = idx === 0 || step.stepNumber === 1;
          const isCompleted = step.status === 'completed';
          
          // Rule 1: Step 1 must ALWAYS be fully unlocked and active as "گام جاری" if not yet completed.
          // Never display a lock icon or "Locked" status on Step 1.
          const isCurrent = step.status === 'current' || (isFirstStep && !isCompleted);

          if (isCurrent) {
            return (
              <div key={step.id} className="relative flex items-start gap-space-md pb-space-lg">
                {/* Pulsing Active Pin */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-[0_0_0_6px_rgba(253,168,104,0.25)]">
                  <span className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse"></span>
                </div>

                {/* Active Highlight Card */}
                <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-[0_8px_24px_rgba(72,60,53,0.1)] relative overflow-hidden bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-secondary-fixed/10 border-2 border-[#FDA868]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/20 rounded-bl-full pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-md text-label-md font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#773B01] animate-ping"></span>
                        <span>{isFirstStep ? 'پله اول • گام فعال و در دسترس' : 'گام جاری'}</span>
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        {step.durationMinutes} دقیقه مطالعه
                      </span>
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
                        {step.title}
                      </h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
                        {step.subtitle}
                      </p>
                    </div>

                    {/* Micro-learning Highlight Pill */}
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FFDCC5]/60 text-[#301400]">
                      <span className="material-symbols-outlined text-secondary text-[18px]">bolt</span>
                      <span className="text-[11px] font-bold">
                        یادگیری میکرو: خلاصه مفاهیم کلیدی بدون نیاز به مطالعه کامل کتاب
                      </span>
                    </div>

                    {/* Resource Tag */}
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low text-on-surface">
                      <span className="material-symbols-outlined text-secondary text-[20px]">auto_stories</span>
                      <span className="font-body-sm text-body-sm font-medium truncate">
                        {step.resourceRecommendation?.title || 'کتاب مرجع این پله'}
                      </span>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      onClick={() => handleStepClick(step, idx)}
                      className="w-full mt-1 h-12 bg-primary-container text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md hover:bg-primary active:scale-[0.98] transition-all font-bold"
                    >
                      <span>شروع یادگیری این گام</span>
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          if (isCompleted) {
            return (
              <div
                key={step.id}
                onClick={() => handleStepClick(step, idx)}
                className="relative flex items-start gap-space-md pb-space-lg group cursor-pointer"
              >
                {/* Node Pin */}
                <div className="relative z-10 w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(72,60,53,0.2)]">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>

                <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition hover:shadow-md border border-[#E6E9DE]">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-secondary font-bold">
                      تکمیل شده • پله {step.stepNumber}
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-primary">task_alt</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary mt-1 font-bold">{step.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{step.subtitle}</p>
                </div>
              </div>
            );
          }

          // Locked Step (Only for Step 2 and beyond, sequentially unlocked)
          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(step, idx)}
              className="relative flex items-start gap-space-md pb-space-lg group opacity-85 cursor-pointer"
            >
              {/* Node Pin */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-surface-container text-outline flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </div>

              <div className="flex-1 bg-surface-container-low rounded-xl p-space-md shadow-sm border border-transparent">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline">
                    {idx === activePath.currentStepIndex + 1 ? 'پله بعدی • ' : ''}پله {step.stepNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-on-surface-variant bg-surface-container font-label-sm text-label-sm">
                    قفل (نیازمند تکمیل پله‌های قبل)
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary/80 mt-1 font-bold">{step.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">{step.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Thought Toast */}
      <div className="bg-primary-fixed/40 rounded-xl p-space-md flex items-center gap-space-sm">
        <span className="material-symbols-outlined text-secondary text-[24px] shrink-0">lightbulb</span>
        <p className="font-body-sm text-body-sm text-on-primary-fixed leading-normal">
          «زندگی نیندیشیده ارزش زیستن ندارد.» با پایان این پله، مدال ویژه «جستجوگر حقیقت» را دریافت خواهید کرد.
        </p>
      </div>

      {/* Bottom Secondary Action Row */}
      <div className="flex flex-col gap-2 pt-space-xs">
        <button
          onClick={() => navigateTo('create-topic')}
          className="w-full h-12 bg-surface-container rounded-xl text-primary font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-[0.99] transition-all font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          <span>ویرایش تنظیمات مسیر و سرعت مطالعه</span>
        </button>
      </div>
    </div>
  );
};
