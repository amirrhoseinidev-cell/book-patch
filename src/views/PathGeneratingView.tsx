import React, { useState, useEffect } from 'react';
import { usePalle } from '../context/PalleContext';

export const PathGeneratingView: React.FC = () => {
  const { creationDraft } = usePalle();
  const [percent, setPercent] = useState(68);
  const [stepStage, setStepStage] = useState(2); // 0, 1, 2, 3

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPercent(85);
      setStepStage(2);
    }, 900);

    const timer2 = setTimeout(() => {
      setPercent(96);
      setStepStage(3);
    }, 1800);

    const timer3 = setTimeout(() => {
      setPercent(100);
      setStepStage(4);
    }, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const dashoffset = 276.46 - (276.46 * percent) / 100;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-screen px-4 py-6 justify-between text-center">
      {/* Top Header */}
      <div className="w-full flex justify-between items-center py-2">
        <div className="flex items-center gap-1.5 text-[#6B6057] text-xs font-semibold">
          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
          <span>هوش مصنوعی پله</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDEFE6] text-[#312620] text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#FDA868] animate-ping"></span>
          <span>تولید برنامه اختصاصی</span>
        </div>
      </div>

      {/* Center Progress Dial */}
      <div className="flex flex-col items-center my-auto">
        <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#FDA868]/10 blur-xl animate-pulse"></div>
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-[#EDEFE6]"
              cx="50"
              cy="50"
              fill="transparent"
              r="44"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <circle
              className="text-[#FDA868] transition-all duration-700 ease-out"
              cx="50"
              cy="50"
              fill="transparent"
              r="44"
              stroke="currentColor"
              strokeDasharray="276.46"
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              strokeWidth="4.5"
            ></circle>
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Equalizer Wavelet */}
            <div className="flex items-end justify-center gap-1.5 h-10 mb-1">
              <div className="w-2 rounded-full bg-[#483C35] h-5 animate-pulse"></div>
              <div className="w-2 rounded-full bg-[#483C35] h-8 animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 rounded-full bg-[#FDA868] h-10 animate-pulse" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 rounded-full bg-[#D5DAC8] h-6 animate-pulse" style={{ animationDelay: '450ms' }}></div>
              <div className="w-2 rounded-full bg-[#D5DAC8] h-4 animate-pulse" style={{ animationDelay: '600ms' }}></div>
            </div>
            <span className="text-2xl font-black text-[#312620] tracking-tight">
              {percent}٪
            </span>
          </div>
        </div>

        <h1 className="text-xl font-black text-[#312620] mb-2 leading-tight">
          در حال چیدمان پله‌های یادگیری شما...
        </h1>
        <p className="text-xs text-[#6B6057] max-w-[320px] mb-6 leading-relaxed">
          پله سرفصل‌های معتبر {creationDraft.topic} را متناسب با سطح {creationDraft.level === 'beginner' ? 'مبتدی' : 'متوسط'} و زمان {creationDraft.dailyMinutes} دقیقه در روز ساختاردهی می‌کند.
        </p>

        {/* Dynamic Pipeline Steps */}
        <div className="w-full bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] space-y-3.5 text-right">
          {/* Step 1 */}
          <div className="flex items-start gap-3 transition-all duration-500">
            <div className="w-6 h-6 rounded-full bg-[#EDEFE6] text-[#312620] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#312620]">تحلیل سرفصل‌های بنیادین {creationDraft.topic}</p>
              <span className="text-[11px] text-[#6B6057]">بررسی پایه‌های پارادایم و مفاهیم ریشه‌ای</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 transition-all duration-500">
            <div className="w-6 h-6 rounded-full bg-[#EDEFE6] text-[#312620] flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#312620]">دسته‌بندی کتاب‌های مرجع و متون دست اول</p>
              <span className="text-[11px] text-[#6B6057]">شناسایی آثار شاخص و سرفصل‌های کلیدی</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 transition-all duration-500">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                stepStage >= 3
                  ? 'bg-[#EDEFE6] text-[#312620]'
                  : 'bg-[#FDA868] text-[#301400]'
              }`}
            >
              {stepStage >= 3 ? (
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              ) : (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#312620]">تبدیل مفاهیم به پله‌های گام‌به‌گام و قابل فهم</p>
              <span className="text-[11px] text-[#6B6057]">تنظیم زنجیره یادگیری روزانه {creationDraft.dailyMinutes} دقیقه‌ای</span>
            </div>
          </div>

          {/* Step 4 */}
          <div
            className={`flex items-start gap-3 transition-all duration-500 ${
              stepStage < 3 ? 'opacity-40' : 'opacity-100'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                stepStage >= 4
                  ? 'bg-[#EDEFE6] text-[#312620]'
                  : stepStage === 3
                  ? 'bg-[#FDA868] text-[#301400]'
                  : 'bg-[#EDEFE6] text-[#8D8177]'
              }`}
            >
              {stepStage >= 4 ? (
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              ) : stepStage === 3 ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[14px]">circle</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-[#312620]">طراحی تمرین‌های ادراکی و پرسش‌های کلیدی</p>
              <span className="text-[11px] text-[#6B6057]">سنجش ادراک بی‌درنگ در پایان هر پله</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex flex-col items-center gap-1.5 w-full pt-4">
        <div className="flex items-center gap-2 text-[#6B6057] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FDA868] animate-ping"></span>
          <span>مسیر شما در چند ثانیه آماده است...</span>
        </div>
      </div>
    </div>
  );
};
