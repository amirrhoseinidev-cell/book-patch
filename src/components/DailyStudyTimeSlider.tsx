import React, { useState, useEffect } from 'react';

export interface DailyStudyTimeSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const DailyStudyTimeSlider: React.FC<DailyStudyTimeSliderProps> = ({
  value,
  onChange,
  min = 5,
  max = 60,
  step = 1,
}) => {
  const [isInteracting, setIsInteracting] = useState(false);

  // Quick preset pills requested: [۵ دقیقه] [۱۵ دقیقه] [۳۰ دقیقه] [۴۵ دقیقه]
  const presets = [
    { val: 5, label: '۵ دقیقه' },
    { val: 15, label: '۱۵ دقیقه' },
    { val: 30, label: '۳۰ دقیقه' },
    { val: 45, label: '۴۵ دقیقه' },
    { val: 60, label: '۱ ساعت' },
  ];

  // Visual Micro-Feedback logic
  const getMicroFeedback = (minutes: number) => {
    if (minutes <= 10) {
      return {
        icon: 'bolt',
        label: 'مطالعه سریع و سبک',
        description: 'ایده‌آل برای روزهای پرمشغله و ساخت عادت پیوسته اولیه',
        color: 'text-[#D97706]',
        badgeBg: 'bg-[#FEF3C7]',
        badgeBorder: 'border-[#FDE68A]',
        badgeText: 'text-[#92400E]',
      };
    }
    if (minutes <= 20) {
      return {
        icon: 'local_fire_department',
        label: 'مطالعه بهینه و پیوسته (پیشنهادی)',
        description: 'تعادل عالی بین سرعت یادگیری و استمرار بدون احساس خستگی',
        color: 'text-[#C2410C]',
        badgeBg: 'bg-[#FFEDD5]',
        badgeBorder: 'border-[#FED7AA]',
        badgeText: 'text-[#9A3412]',
      };
    }
    if (minutes <= 35) {
      return {
        icon: 'psychology',
        label: 'مطالعه عمیق و تحلیلی',
        description: 'فرصت کافی برای درک استدلال‌های مفهومی و حل تمرین‌ها',
        color: 'text-[#8F4E15]',
        badgeBg: 'bg-[#FFDCC5]',
        badgeBorder: 'border-[#FDA868]/40',
        badgeText: 'text-[#703700]',
      };
    }
    return {
      icon: 'auto_stories',
      label: 'مطالعه عمیق و تمرکزی (حالت پیشرفته)',
      description: 'غوطه‌وری کامل در متون مرجع، تحلیل گزیده‌ها و یادداشت‌برداری',
      color: 'text-[#312620]',
      badgeBg: 'bg-[#EDEFE6]',
      badgeBorder: 'border-[#D5DAC8]',
      badgeText: 'text-[#312620]',
    };
  };

  const feedback = getMicroFeedback(value);
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value, 10);
    if (!isNaN(newVal)) {
      onChange(Math.min(max, Math.max(min, newVal)));
    }
  };

  const handleStepDelta = (delta: number) => {
    const nextVal = Math.min(max, Math.max(min, value + delta));
    onChange(nextVal);
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-4 relative overflow-hidden transition-all">
      {/* Background Subtle Ambient Glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none blur-2xl transition-all duration-500"
        style={{
          backgroundColor: value >= 30 ? 'rgba(72, 60, 53, 0.08)' : 'rgba(253, 168, 104, 0.15)',
        }}
      ></div>

      {/* Prominent Center Display with Dynamic Text Animation */}
      <div className="flex flex-col items-center justify-center text-center pt-1 relative z-10">
        <div className="flex items-baseline justify-center gap-2">
          {/* Minus Step Button */}
          <button
            type="button"
            onClick={() => handleStepDelta(-1)}
            disabled={value <= min}
            className="w-8 h-8 rounded-full bg-[#F5F7EE] hover:bg-[#EDEFE6] disabled:opacity-30 disabled:pointer-events-none text-[#312620] flex items-center justify-center transition-all active:scale-90"
            title="کاهش یک دقیقه"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>

          {/* Large Animated Number */}
          <div className="flex items-baseline gap-1 mx-2">
            <span
              className={`text-4xl font-black text-[#312620] tracking-tight transition-transform duration-150 inline-block ${
                isInteracting ? 'scale-110 text-[#8F4E15]' : 'scale-100'
              }`}
            >
              {value}
            </span>
            <span className="text-sm font-bold text-[#6B6057]">دقیقه در روز</span>
          </div>

          {/* Plus Step Button */}
          <button
            type="button"
            onClick={() => handleStepDelta(1)}
            disabled={value >= max}
            className="w-8 h-8 rounded-full bg-[#F5F7EE] hover:bg-[#EDEFE6] disabled:opacity-30 disabled:pointer-events-none text-[#312620] flex items-center justify-center transition-all active:scale-90"
            title="افزایش یک دقیقه"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Dynamic Micro-Feedback Chip with Animated Icon */}
        <div
          className={`mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${feedback.badgeBg} ${feedback.badgeBorder} ${feedback.badgeText}`}
        >
          <span
            className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${
              isInteracting ? 'scale-125 rotate-6' : 'scale-100'
            }`}
          >
            {feedback.icon}
          </span>
          <span>{feedback.label}</span>
        </div>

        <p className="text-[11px] text-[#6B6057] mt-1.5 max-w-xs leading-normal">
          {feedback.description}
        </p>
      </div>

      {/* Interactive Range Slider (LTR direction for consistent native thumb physics) */}
      <div className="flex flex-col gap-2 pt-1 px-1 relative z-10" dir="ltr">
        <div className="relative flex items-center w-full h-8">
          {/* Custom Styled Gradient Track Fill */}
          <div className="absolute inset-x-0 h-2.5 bg-[#EDEFE6] rounded-full overflow-hidden pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-[#FDA868] to-[#483C35] rounded-full transition-all duration-75"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* HTML5 Range Input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            onMouseDown={() => setIsInteracting(true)}
            onMouseUp={() => setIsInteracting(false)}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => setIsInteracting(false)}
            className="w-full h-6 opacity-0 cursor-pointer z-20 relative"
            aria-label="انتخاب زمان مطالعه روزانه"
          />

          {/* Styled Floating Thumb */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FFFFFF] border-3 border-[#483C35] shadow-md pointer-events-none transition-transform duration-75 flex items-center justify-center z-10 ${
              isInteracting ? 'scale-125 ring-4 ring-[#FDA868]/40 shadow-lg' : 'scale-100'
            }`}
            style={{ left: `${percentage}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#FDA868]"></div>
          </div>
        </div>

        {/* Min / Max Labels */}
        <div className="flex items-center justify-between text-[10px] text-[#8D8177] font-bold px-0.5" dir="rtl">
          <span>{min} دقیقه (حداقل)</span>
          <span>{max} دقیقه (۱ ساعت)</span>
        </div>
      </div>

      {/* Quick-Select Presets (Chips): [۵ دقیقه] [۱۵ دقیقه] [۳۰ دقیقه] [۴۵ دقیقه] */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-[#F0F2EB]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6B6057]">انتخاب سریع زمان‌های متداول:</span>
          <span className="text-[10px] text-[#8D8177]">با یک ضربه</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {presets.map((preset) => {
            const isSelected = value === preset.val;
            return (
              <button
                key={preset.val}
                type="button"
                onClick={() => onChange(preset.val)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                  isSelected
                    ? 'bg-[#483C35] text-white shadow-xs ring-2 ring-[#FDA868]'
                    : 'bg-[#F5F7EE] hover:bg-[#EDEFE6] text-[#4E4540] border border-[#E6E9DE]'
                }`}
              >
                <span>{preset.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FDA868]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
