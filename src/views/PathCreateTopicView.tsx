import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';

interface TopicOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const POPULAR_TOPICS: TopicOption[] = [
  { id: 'philosophy', title: 'فلسفه و منطق', subtitle: 'شناخت، خرد، اخلاق', icon: 'auto_stories' },
  { id: 'ai-data', title: 'هوش مصنوعی و داده', subtitle: 'الگوریتم، پایتون، مدل‌ها', icon: 'neurology' },
  { id: 'psychology', title: 'روان‌شناسی و رفتار', subtitle: 'تغییر عادت، شناخت فردی', icon: 'psychology_alt' },
  { id: 'code', title: 'برنامه‌نویسی و وب', subtitle: 'توسعه نرم‌افزار، فرانت‌اند', icon: 'terminal' },
  { id: 'history', title: 'تاریخ معاصر جهان', subtitle: 'سیاست، تحولات، قرن بیستم', icon: 'history_edu' },
  { id: 'sociology', title: 'جامعه و علوم سیاسی', subtitle: 'نهادها، نظریه‌ها، جامعه', icon: 'groups' },
  { id: 'finance', title: 'اقتصاد و سواد مالی', subtitle: 'سرمایه‌گذاری، تصمیم‌گیری', icon: 'account_balance' },
  { id: 'art', title: 'هنر و زیباشناسی', subtitle: 'تحلیل بصری، مکاتب هنری', icon: 'palette' },
];

export const PathCreateTopicView: React.FC = () => {
  const { creationDraft, setCreationDraft, navigateTo } = usePalle();
  const [selectedTopic, setSelectedTopic] = useState(creationDraft.topic || 'فلسفه و منطق');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCard = (topic: TopicOption) => {
    setSelectedTopic(topic.title);
    setSearchQuery('');
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      setSelectedTopic(val.trim());
    } else {
      setSelectedTopic(POPULAR_TOPICS[0].title);
    }
  };

  const handleContinue = () => {
    setCreationDraft((prev) => ({
      ...prev,
      topic: selectedTopic,
    }));
    navigateTo('create-level');
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-32 gap-4">
      {/* Interactive Step Header & Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#6B6057] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FDA868] animate-pulse"></span>
            مرحله ۱ از ۲: انتخاب موضوع
          </span>
          <span className="text-[11px] font-bold text-[#8F4E15] bg-[#FFDCC5] px-2.5 py-0.5 rounded-full">
            ۵۰٪ تکمیل شده
          </span>
        </div>
        <div className="w-full h-2 bg-[#EDEFE6] rounded-full overflow-hidden p-0.5 flex items-center">
          <div className="h-full w-1/2 bg-[#FDA868] rounded-full transition-all duration-700 ease-out shadow-xs"></div>
        </div>
      </div>

      {/* Conversational Intro */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-[#8F4E15]">
          <span className="material-symbols-outlined text-[18px]">explore</span>
          <span className="text-[11px] font-bold tracking-wider">شروع مسیر جدید</span>
        </div>
        <h2 className="text-xl font-black text-[#312620] tracking-tight">
          دوست داری چی یاد بگیری؟
        </h2>
        <p className="text-xs text-[#6B6057] leading-relaxed">
          موضوع، مهارت یا کتابی که ذهنت رو مشغول کرده جستجو یا انتخاب کن تا پله مسیر گام‌به‌گام آن را بچیند.
        </p>
      </div>

      {/* Visual Exploration Bento */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#EDEFE6] p-4 flex items-center justify-between shadow-xs border border-[#E6E9DE]">
        <div className="flex flex-col gap-1 max-w-[65%] z-10">
          <span className="inline-flex items-center gap-1 text-[11px] text-[#8F4E15] font-bold">
            <span className="material-symbols-outlined text-[15px] filled">auto_awesome</span>
            مسیر یادگیری هوشمند
          </span>
          <span className="font-bold text-sm text-[#312620]">دانش عمیق، لقمه‌های آرام</span>
          <span className="text-[11px] text-[#6B6057]">یادگیری بدون اضطراب با برنامه ۱۰ دقیقه‌ای در روز</span>
        </div>
        <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-inner flex-shrink-0 border border-[#D5DAC8]">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZwvUoAeHukBlEy-GdIxBgWKojxlbyVDxiZoM8_itjsLEjEyREVt8TxAKygnbs5mSZMMWL67-xV8y4vgRgv1BThILgbTKDNKGI3MaVY7HMO7BM9dxTzCFmf6O5QdUnvIXrRgcy9qfntjvGdcUVFnruzZggKTw8dUzmnYzO52wboDK_oYe_3OJGVsgbWH9MY9dNWhIBbA8feVuLkJOzTc_B2pDr2soCPI7tLJLjorPWQ5GvU5dvgiI3"
            alt="Study Notebook"
          />
        </div>
      </div>

      {/* Search Input Module */}
      <div className="relative flex items-center w-full">
        <div className="absolute right-3.5 text-[#6B6057] flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          dir="rtl"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="مثلاً: فلسفه اگزیستانسیالیسم، یادگیری ماشین، روان‌شناسی..."
          className="w-full bg-[#FFFFFF] text-[#2E2621] text-xs placeholder:text-[#8D8177] pr-10 pl-10 py-3.5 rounded-xl border border-[#D5DAC8] shadow-xs focus:outline-none focus:border-[#483C35] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange('')}
            className="absolute left-3 text-[#8D8177] hover:text-[#312620] p-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Suggestion Tip Box */}
      <div className="bg-[#F2DFD5]/60 rounded-xl p-3 flex items-start gap-2.5 shadow-xs border border-[#E6E9DE]">
        <div className="w-7 h-7 rounded-lg bg-[#FFDCC5] flex items-center justify-center flex-shrink-0 text-[#8F4E15]">
          <span className="material-symbols-outlined text-[18px] filled">lightbulb</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-[#312620]">پیشنهاد هوشمند پله</span>
          <p className="text-[11px] text-[#6B6057] leading-relaxed">
            می‌تونی هر موضوع خاص یا میان‌رشته‌ای رو تایپ کنی؛ پله مسیر اختصاصی و متناسب با زمان هفتگی‌ات برات می‌سازه.
          </p>
        </div>
      </div>

      {/* Popular Topics Grid Section */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#8F4E15] text-[18px]">local_fire_department</span>
            <h3 className="font-bold text-sm text-[#312620]">موضوعات پرطرفدار</h3>
          </div>
          <span className="text-[11px] text-[#6B6057]">۸ شاخه اصلی</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {POPULAR_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic.title && !searchQuery;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => handleSelectCard(topic)}
                className={`group relative p-3.5 rounded-2xl bg-[#FFFFFF] text-right flex flex-col justify-between min-h-[114px] shadow-xs transition-all active:scale-[0.98] border ${
                  isSelected
                    ? 'ring-2 ring-[#483C35] border-transparent shadow-sm'
                    : 'border-[#E6E9DE] hover:border-[#D5DAC8]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#312620] text-white' : 'bg-[#EDEFE6] text-[#312620]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[19px]">{topic.icon}</span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#FDA868] text-[#301400] flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col mt-2">
                  <span className="font-bold text-xs text-[#312620] group-hover:text-[#8F4E15] transition-colors">
                    {topic.title}
                  </span>
                  <span className="text-[10px] text-[#6B6057] mt-0.5">{topic.subtitle}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reader Quote Card */}
      <div className="p-3 bg-[#EDEFE6] rounded-2xl flex items-center gap-3 shadow-xs border border-[#E6E9DE]">
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border border-[#D5DAC8]">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu-DY6W-sZgHkNyVCI5pJSzqyoBGtg6b1rmdMqkq-xBZHW1ALzUTKNALw1CINlJjcqtb76AEF1X9PHb1dRp-kydhiyaWquHZ1AlIjgLe5diLwLVJS1RI9N6TWM_GlH4swDvTGSmObuk7oboBQdCujOe6Kn_S-z5rhVQAm_9_16XTvoIElhg9LZVNJd2bcgEfRB1uvzYwUB6_umGTke3S5OKXMXinztlar5tqUYVd1zia6YszbacOQN"
            alt="Reflection"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] text-[#312620] italic leading-relaxed">
            «هر گام کوچک، افق جدیدی از فهم را روشن می‌سازد.»
          </p>
          <span className="text-[10px] text-[#8F4E15] font-semibold mt-0.5">پله؛ همراه یادگیری پیوسته</span>
        </div>
      </div>

      {/* Bottom Sticky Action Area */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F7EE]/95 backdrop-blur-xl border-t border-[#E6E9DE] pb-safe shadow-[0_-8px_24px_rgba(72,60,53,0.06)]">
        <div className="px-4 py-3 max-w-xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#6B6057] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#8F4E15]">task_alt</span>
              موضوع انتخاب شده:
            </span>
            <span className="text-xs font-bold text-[#312620]">{selectedTopic}</span>
          </div>

          <button
            onClick={handleContinue}
            className="w-full h-12 bg-[#483C35] hover:bg-[#312620] text-[#F5F7EE] font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span>ادامه و تنظیم سطح</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
