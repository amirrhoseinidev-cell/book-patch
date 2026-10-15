import React from 'react';
import { usePalle } from '../context/PalleContext';
import { KnowledgeLevel, LearningGoal, StudyTimeMinutes } from '../types/palle';
import { DailyStudyTimeSlider } from '../components/DailyStudyTimeSlider';

export const PathCreateLevelView: React.FC = () => {
  const { creationDraft, setCreationDraft, generateNewPath, navigateTo } = usePalle();

  const handleLevelChange = (lvl: KnowledgeLevel) => {
    setCreationDraft((prev) => ({ ...prev, level: lvl }));
  };

  const handleGoalChange = (g: string) => {
    setCreationDraft((prev) => ({ ...prev, goal: g }));
  };

  const handleTimeChange = (t: number) => {
    setCreationDraft((prev) => ({ ...prev, dailyMinutes: t }));
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-12 gap-5">
      {/* Progress & Step Header */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[#6B6057] text-xs font-semibold">
          <span>مرحله ۲ از ۲: شخصی‌سازی مسیر</span>
          <span className="text-[11px] bg-[#FFDCC5] text-[#301400] px-2.5 py-0.5 rounded-full font-bold">
            گام پایانی
          </span>
        </div>
        <div className="w-full h-2 bg-[#EDEFE6] rounded-full overflow-hidden">
          <div className="h-full bg-[#FDA868] rounded-full w-full transition-all duration-500 ease-out"></div>
        </div>
      </div>

      {/* Heading & Context */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-[#312620] tracking-tight">تنظیم سطح و زمان مطالعه</h2>
        <p className="text-xs text-[#6B6057] leading-relaxed">
          مسیر بر اساس پیش‌زمینه و زمانی که در روز داری تنظیم می‌شه.
        </p>

        {/* Topic Recap Chip */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 bg-[#EDEFE6] px-3 py-1.5 rounded-full text-[#312620] shadow-xs border border-[#E6E9DE]">
            <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">menu_book</span>
            <span className="text-xs font-bold">موضوع انتخابی: {creationDraft.topic}</span>
            <button
              type="button"
              onClick={() => navigateTo('create-topic')}
              className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E1E3DB] text-[#4E4540] hover:bg-[#D5DAC8] transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Field 1: Knowledge Level */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#8F4E15]">stairs</span>
          سطح دانش فعلی شما در این موضوع:
        </label>

        <div className="flex flex-col gap-2">
          {/* Beginner */}
          <div
            onClick={() => handleLevelChange('beginner')}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start gap-3 shadow-xs ${
              creationDraft.level === 'beginner'
                ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                : 'bg-[#EDEFE6] border-transparent hover:bg-[#E7E9E0]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                creationDraft.level === 'beginner' ? 'bg-[#483C35]' : 'bg-[#D5DAC8]'
              }`}
            >
              {creationDraft.level === 'beginner' && (
                <span className="w-2 h-2 rounded-full bg-[#FDA868]"></span>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#312620]">مبتدی</span>
                <span className="text-[10px] font-bold text-[#8F4E15] bg-[#FFDCC5] px-1.5 py-0.5 rounded">
                  پیشنهادی
                </span>
              </div>
              <span className="text-[11px] text-[#6B6057] mt-0.5">آشنایی ندارم یا خیلی کم - توضیح مفاهیم پایه</span>
            </div>
          </div>

          {/* Intermediate */}
          <div
            onClick={() => handleLevelChange('intermediate')}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start gap-3 shadow-xs ${
              creationDraft.level === 'intermediate'
                ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                : 'bg-[#EDEFE6] border-transparent hover:bg-[#E7E9E0]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                creationDraft.level === 'intermediate' ? 'bg-[#483C35]' : 'bg-[#D5DAC8]'
              }`}
            >
              {creationDraft.level === 'intermediate' && (
                <span className="w-2 h-2 rounded-full bg-[#FDA868]"></span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-[#312620]">متوسط</span>
              <span className="text-[11px] text-[#6B6057] mt-0.5">مفاهیم پایه رو می‌دونم - به دنبال درک عمیق‌تر</span>
            </div>
          </div>

          {/* Advanced */}
          <div
            onClick={() => handleLevelChange('advanced')}
            className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start gap-3 shadow-xs ${
              creationDraft.level === 'advanced'
                ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                : 'bg-[#EDEFE6] border-transparent hover:bg-[#E7E9E0]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 ${
                creationDraft.level === 'advanced' ? 'bg-[#483C35]' : 'bg-[#D5DAC8]'
              }`}
            >
              {creationDraft.level === 'advanced' && (
                <span className="w-2 h-2 rounded-full bg-[#FDA868]"></span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-[#312620]">پیشرفته</span>
              <span className="text-[11px] text-[#6B6057] mt-0.5">مطالعه تخصصی و متون پیشرفته</span>
            </div>
          </div>
        </div>
      </div>

      {/* Field 2: Learning Goal */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#8F4E15]">flag</span>
          هدف اصلی یادگیری:
        </label>

        <div className="flex flex-col gap-2">
          {[
            { id: 'principles', label: 'درک اصول و جهان‌بینی کلی', icon: 'auto_awesome' },
            { id: 'literature', label: 'مطالعه و تحلیل کتاب‌های دست اول', icon: 'import_contacts' },
            { id: 'discourse', label: 'کاربرد در گفتگو و تفکر روزمره', icon: 'forum' },
          ].map((item) => {
            const isSelected = creationDraft.goal === item.label;
            return (
              <div
                key={item.id}
                onClick={() => handleGoalChange(item.label)}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border shadow-xs ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                    : 'bg-[#EDEFE6] border-transparent hover:bg-[#E7E9E0]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isSelected ? 'text-[#8F4E15]' : 'text-[#6B6057]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="text-xs font-bold text-[#312620]">{item.label}</span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#483C35] text-white' : 'bg-[#D5DAC8] text-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">check</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field 3: Study Time per Day (Interactive Range Slider & Presets) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#312620] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#8F4E15]">schedule</span>
            <span>زمان مطالعه در روز:</span>
          </label>
          <span className="text-[11px] text-[#8D8177]">قابل تنظیم از ۵ تا ۶۰ دقیقه</span>
        </div>

        <DailyStudyTimeSlider
          value={creationDraft.dailyMinutes || 15}
          onChange={handleTimeChange}
          min={5}
          max={60}
          step={1}
        />
      </div>

      {/* Primary Action CTA */}
      <div className="pt-2">
        <button
          onClick={generateNewPath}
          className="w-full h-13 py-3.5 bg-[#483C35] hover:bg-[#312620] text-[#F5F7EE] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
        >
          <span>ساخت مسیر یادگیری اختصاصی</span>
          <span className="text-[#FDA868]">⚡</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 py-1 text-center text-[#8D8177]">
        <span className="material-symbols-outlined text-[16px]">verified</span>
        <span className="text-[11px]">برنامه به صورت پله‌به‌پله متناسب با زمان شما تنظیم می‌شود</span>
      </div>
    </div>
  );
};
