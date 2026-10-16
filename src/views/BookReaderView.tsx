import React, { useState, useEffect } from 'react';
import { usePalle } from '../context/PalleContext';
import { AffiliatePurchaseModal, AffiliateBookInfo } from '../components/AffiliatePurchaseModal';

type ReaderTheme = 'paper' | 'sepia' | 'night';

export const BookReaderView: React.FC = () => {
  const { currentStep, goBack, navigateTo, openAiChat, showToast } = usePalle();
  
  // Reader customization state
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // 0: sm, 1: base, 2: lg, 3: xl
  const [lineHeight, setLineHeight] = useState<'normal' | 'comfortable' | 'spacious'>('comfortable');
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>('paper');
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompletedSection, setIsCompletedSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'source'>('summary');
  const [affiliateModalBook, setAffiliateModalBook] = useState<AffiliateBookInfo | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const fontSizes = [
    'text-sm leading-relaxed',
    'text-base leading-relaxed',
    'text-lg leading-loose',
    'text-xl leading-loose',
  ];
  const fontSizeLabels = ['A-', 'A', 'A+', 'A++'];

  const passage = currentStep?.passage;
  const resource = currentStep?.resourceRecommendation;

  // Track window scroll progress for reader bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? 'نشانک برداشته شد' : 'صفحه با موفقیت نشانه‌گذاری شد ✓', 'success');
  };

  const handleCompleteSection = () => {
    setIsCompletedSection(true);
    showToast('یادگیری خلاصه این پله به پایان رسید! آماده آزمون سنجش ادراکی شوید ✨', 'success');
    setTimeout(() => {
      navigateTo('step-assessment');
    }, 500);
  };

  const openAffiliateModal = () => {
    if (!resource) return;
    setAffiliateModalBook({
      title: resource.title,
      author: resource.author,
      translator: resource.translator,
      chapter: resource.chapter,
      coverImage: resource.coverImage,
      discountCode: resource.discountCode || 'PALLE20',
      discountPercent: resource.discountPercent || 20,
      affiliateUrl: resource.affiliateUrl,
      priceNote: resource.priceNote,
    });
  };

  // Conversational mentor explanation
  const microSummary = currentStep?.microSummary || {
    mentorGreeting: `سلام همسفر پله! در این بخش، هدف ما یادگیری فشرده و عمیق است، بدون اینکه نیازی به خواندن کتاب‌های قطور داشته باشی.`,
    coreIdea: currentStep?.introDescription || 'شناخت پیوند میان تفکر سنجش‌گر و عمل در دنیای واقعی.',
    keyPoints: [
      'اصل مفهوم را بدون حاشیه‌ها بیاموز: تمایز میان حقیقت مستند و باورهای غیرآزموده.',
      'چگونه تناقضات درونی در استدلال‌های روزمره را به موقع شناسایی کنیم؟',
      'به کارگیری پرسشگری سقراطی برای پیشگیری از تصمیم‌گیری‌های شتاب‌زده.',
    ],
    realWorldExample: currentStep?.keyTakeaway || 'تفکر سنجشگرانه سپر شما در برابر اطلاعات گمراه‌کننده است.',
    quickReflection: 'چه باوری در زندگی روزمره داری که تاکنون ادله محکم آن را بررسی نکرده‌ای؟',
  };

  // Theme style classes
  const themeStyles = {
    paper: {
      bg: 'bg-[#F5F7EE]',
      cardBg: 'bg-[#FFFFFF]',
      cardBorder: 'border-[#E6E9DE]',
      textPrimary: 'text-[#2E2621]',
      textSecondary: 'text-[#6B6057]',
      accentBg: 'bg-[#FFDCC5]',
      accentText: 'text-[#703700]',
      toolbarBg: 'bg-[#EDEFE6]',
    },
    sepia: {
      bg: 'bg-[#FDF6E2]',
      cardBg: 'bg-[#F8EED1]',
      cardBorder: 'border-[#E8DBBC]',
      textPrimary: 'text-[#3E2D17]',
      textSecondary: 'text-[#795E3C]',
      accentBg: 'bg-[#EBD2A9]',
      accentText: 'text-[#4A3212]',
      toolbarBg: 'bg-[#F3E5C8]',
    },
    night: {
      bg: 'bg-[#18191A]',
      cardBg: 'bg-[#242526]',
      cardBorder: 'border-[#3A3B3C]',
      textPrimary: 'text-[#E4E6EB]',
      textSecondary: 'text-[#B0B3B8]',
      accentBg: 'bg-[#3A3B3C]',
      accentText: 'text-[#FDA868]',
      toolbarBg: 'bg-[#202122]',
    },
  }[readerTheme];

  const lineHeightClass = {
    normal: 'leading-relaxed',
    comfortable: 'leading-loose',
    spacious: 'leading-[2.3]',
  }[lineHeight];

  return (
    <div className={`min-h-screen ${themeStyles.bg} ${themeStyles.textPrimary} transition-colors duration-200 select-none`}>
      {/* Dynamic Scroll Progress Bar */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-black/5">
        <div
          className="h-full bg-[#FDA868] transition-all duration-150"
          style={{ width: `${Math.max(scrollProgress, 5)}%` }}
        />
      </div>

      {/* Floating Distraction-Free Re-entry Pill (Appears when UI hidden) */}
      {isDistractionFree && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => setIsDistractionFree(false)}
            className="h-9 px-3.5 rounded-full bg-[#312620]/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>نمایش ابزارها</span>
          </button>
        </div>
      )}

      {/* Reader Sticky Header (Hides gracefully in distraction-free mode) */}
      <header
        className={`w-full sticky top-14 sm:top-16 z-30 transition-transform duration-300 ${
          isDistractionFree ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${themeStyles.toolbarBg}/95 backdrop-blur-md border-b ${themeStyles.cardBorder} shadow-xs`}
      >
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={goBack}
              aria-label="بازگشت"
              className="w-9 h-9 rounded-xl bg-white/70 hover:bg-white flex items-center justify-center text-inherit active:scale-90 transition-transform shadow-2xs shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] ${themeStyles.textSecondary} truncate`}>
                پله {currentStep?.stepNumber || 1} • {currentStep?.durationMinutes || 5} دقیقه
              </span>
              <h2 className="font-bold text-xs truncate">
                {currentStep?.title || 'پله یادگیری'}
              </h2>
            </div>
          </div>

          {/* Reader Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Settings Sheet Opener */}
            <button
              onClick={() => setShowSettingsSheet(true)}
              aria-label="تنظیمات قلم و تم مطالعه"
              className="h-9 px-2.5 rounded-xl bg-white/70 hover:bg-white flex items-center gap-1 active:scale-90 transition-transform shadow-2xs text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[17px]">tune</span>
              <span className="text-[11px]">{fontSizeLabels[fontSizeIndex]}</span>
            </button>

            {/* Distraction-Free Toggle */}
            <button
              onClick={() => {
                setIsDistractionFree(true);
                showToast('حالت مطالعه بدون حواس‌پرتی فعال شد. برای بازگشت روی صفحه ضربه بزنید.', 'info');
              }}
              title="حالت مطالعه تمام‌صفحه و متمرکز"
              className="w-9 h-9 rounded-xl bg-white/70 hover:bg-white flex items-center justify-center active:scale-90 transition-transform shadow-2xs"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              aria-label="نشانه‌گذاری"
              className="w-9 h-9 rounded-xl bg-white/70 hover:bg-white flex items-center justify-center active:scale-90 transition-transform shadow-2xs"
            >
              <span
                className="material-symbols-outlined text-[18px] text-[#8F4E15]"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isBookmarked ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Reader Scroll Container */}
      <div className="max-w-xl mx-auto px-4 pt-3 pb-36 flex flex-col gap-4">
        {/* Dual Tab Switcher: Micro-Summary vs Original Text */}
        <section className="w-full pt-1">
          <div className={`grid grid-cols-2 p-1 rounded-2xl gap-1 ${themeStyles.toolbarBg} border ${themeStyles.cardBorder}`}>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation ${
                activeTab === 'summary'
                  ? `${themeStyles.cardBg} ${themeStyles.textPrimary} shadow-xs`
                  : `${themeStyles.textSecondary}`
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">bolt</span>
              <span>خلاصه مفهومی (میکرو)</span>
            </button>

            <button
              onClick={() => setActiveTab('source')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation ${
                activeTab === 'source'
                  ? `${themeStyles.cardBg} ${themeStyles.textPrimary} shadow-xs`
                  : `${themeStyles.textSecondary}`
              }`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">menu_book</span>
              <span>گزیده متن کتاب مرجع</span>
            </button>
          </div>
        </section>

        {/* Content Tabs */}
        {activeTab === 'summary' ? (
          /* TAB 1: MICRO-LEARNING SUMMARY */
          <div className="flex flex-col gap-4">
            {/* Mentor Intro Card */}
            <div className={`p-4 rounded-2xl ${themeStyles.cardBg} shadow-xs border ${themeStyles.cardBorder} flex flex-col gap-3`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
                  <span className="material-symbols-outlined text-[24px] filled">support_agent</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#8F4E15] font-bold">روایت و تحلیل مربی پله</span>
                  <h3 className="text-sm font-bold">چکیده مفهومی و گفتگومحور</h3>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl ${themeStyles.toolbarBg} text-xs leading-relaxed border ${themeStyles.cardBorder}`}>
                <p className="font-semibold text-[#8F4E15] mb-1.5">{microSummary.mentorGreeting}</p>
                <p className={lineHeightClass}>{microSummary.coreIdea}</p>
              </div>
            </div>

            {/* Core Concepts Breakdown */}
            <div className={`p-4 rounded-2xl ${themeStyles.cardBg} shadow-xs border ${themeStyles.cardBorder} flex flex-col gap-3`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
                <h4 className="text-xs font-bold">مفاهیم کلیدی این درس در ۳ دقیقه:</h4>
              </div>

              <div className="space-y-2.5">
                {microSummary.keyPoints.map((point, idx) => (
                  <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-xl ${themeStyles.toolbarBg} border ${themeStyles.cardBorder}`}>
                    <div className="w-5 h-5 rounded-full bg-[#483C35] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className={`text-xs font-medium ${lineHeightClass}`}>{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Real World Application */}
            <div className="p-4 rounded-2xl bg-[#FFDCC5]/40 border border-[#FDA868]/40 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8F4E15] text-[20px] filled">lightbulb</span>
                <span className="text-xs font-bold text-[#301400]">جمع‌بندی کاربردی در زندگی:</span>
              </div>
              <p className="text-xs text-[#483C35] leading-relaxed font-semibold">
                {microSummary.realWorldExample}
              </p>
              <div className="pt-2 border-t border-[#FDA868]/30 text-[11px] text-[#703700] italic">
                پرسش تأمل‌برانگیز: «{microSummary.quickReflection}»
              </div>
            </div>

            {/* Book Reference & Affiliate Callout */}
            {resource && (
              <div className={`p-4 rounded-2xl ${themeStyles.cardBg} border ${themeStyles.cardBorder} shadow-xs flex flex-col gap-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="material-symbols-outlined text-[#8F4E15] text-[18px]">menu_book</span>
                    <span>کتاب مرجع برای مطالعه عمیق‌تر:</span>
                  </div>
                  <span className="text-[10px] text-[#8F4E15] bg-[#FFDCC5] px-2 py-0.5 rounded-full font-bold">
                    ۲۰٪ تخفیف
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={resource.coverImage}
                    alt={resource.title}
                    className="w-14 h-20 rounded-xl object-cover shrink-0 border border-[#E6E9DE] shadow-xs"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <h5 className="text-xs font-bold truncate">{resource.title}</h5>
                    <p className={`text-[11px] ${themeStyles.textSecondary} truncate mt-0.5`}>
                      {resource.author} {resource.translator ? `• ترجمه ${resource.translator}` : ''}
                    </p>
                    <span className={`text-[10px] ${themeStyles.textSecondary} mt-1 truncate`}>
                      فصل منطبق: {resource.chapter}
                    </span>
                  </div>
                </div>

                <button
                  onClick={openAffiliateModal}
                  className="w-full h-11 bg-[#FDA868] hover:bg-[#F28938] text-[#301400] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#703700] filled">shopping_cart</span>
                  <span>تهیه کتاب با تخفیف ویژه پله</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: AUTHENTIC PASSAGE */
          <div className="flex flex-col gap-4">
            <div className={`p-3.5 rounded-2xl ${themeStyles.toolbarBg} shadow-xs flex items-center justify-between border ${themeStyles.cardBorder}`}>
              <div className="flex flex-col">
                <span className="text-[11px] text-[#8F4E15] font-bold">
                  گزیده مستند به کتاب «{passage?.bookTitle || resource?.title || 'مرجع پله'}»
                </span>
                <h3 className="font-bold text-sm mt-0.5">
                  {passage?.title || currentStep?.title}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15]">
                <span className="material-symbols-outlined text-[18px]">history_edu</span>
              </div>
            </div>

            {/* Reader Text Canvas */}
            <article className={`space-y-4 text-justify ${fontSizes[fontSizeIndex]} ${lineHeightClass}`}>
              {passage?.paragraphs && passage.paragraphs.length > 0 ? (
                passage.paragraphs.map((p, idx) => (
                  <p key={idx} className={idx === 0 ? 'first-letter:text-xl first-letter:font-black first-letter:text-[#8F4E15]' : ''}>
                    {p}
                  </p>
                ))
              ) : (
                <p>محتوای متنی این بخش در حال استخراج از مراجع علمی است.</p>
              )}

              {/* Highlight Quote */}
              <div className="p-4 rounded-2xl bg-[#FFDCC5]/40 shadow-xs relative overflow-hidden my-3 border border-[#FDA868]/30">
                <div className="absolute inset-y-0 right-0 w-1.5 bg-[#FDA868] rounded-r"></div>
                <div className="flex items-start gap-3 pr-1">
                  <span className="material-symbols-outlined text-[#8F4E15] text-[20px] flex-shrink-0 mt-0.5 filled">
                    format_quote
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#8F4E15] font-bold">فراز کلیدی</span>
                    <p className="font-bold text-sm leading-relaxed">
                      {passage?.highlightQuote || '«...زیرا بزرگ‌ترین نادانی این است که آدمی پندارد آنچه را نمی‌داند، می‌داند.»'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footnote card */}
              {passage?.footnote && (
                <div className={`p-3 rounded-2xl ${themeStyles.toolbarBg} shadow-xs flex items-center gap-3 my-2 border ${themeStyles.cardBorder}`}>
                  {passage.footnote.imageUrl && (
                    <img
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#D5DAC8]"
                      src={passage.footnote.imageUrl}
                      alt={passage.footnote.title}
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#8F4E15] font-bold">پاورقی مفهومی</span>
                    <p className="font-bold text-xs truncate">{passage.footnote.title}</p>
                    <p className={`text-[11px] ${themeStyles.textSecondary} line-clamp-2 mt-0.5 leading-normal`}>
                      {passage.footnote.description}
                    </p>
                  </div>
                </div>
              )}
            </article>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar (Hides in Distraction-Free mode) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-40 ${themeStyles.bg}/95 backdrop-blur-xl border-t ${themeStyles.cardBorder} pb-safe shadow-[0_-4px_20px_rgba(72,60,53,0.06)] transition-transform duration-300 ${
          isDistractionFree ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Floating Contextual AI Prompt Pill */}
        <div className="max-w-xl mx-auto px-4 -translate-y-4 flex justify-center pointer-events-none">
          <button
            onClick={openAiChat}
            className="pointer-events-auto h-11 px-5 rounded-full bg-[#483C35] hover:bg-[#312620] text-white shadow-xl flex items-center gap-2 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[#FDA868] text-[18px] animate-pulse filled">
              auto_awesome
            </span>
            <span className="text-xs font-bold">پرسیدن از مربی هوشمند درباره این پله</span>
          </button>
        </div>

        {/* Action Buttons Row */}
        <div className="max-w-xl mx-auto px-4 pb-3 pt-0 flex items-center justify-between gap-2.5">
          <button
            onClick={goBack}
            className={`flex-1 h-11 rounded-xl ${themeStyles.toolbarBg} flex items-center justify-center gap-1 active:scale-95 transition-all text-xs font-bold`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            <span>نمای پله</span>
          </button>

          <button
            onClick={handleCompleteSection}
            className={`flex-[2] h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md text-xs font-bold ${
              isCompletedSection
                ? 'bg-[#483C35] text-white'
                : 'bg-[#FFDCC5] hover:bg-[#FDA868] text-[#301400]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px] filled">
              {isCompletedSection ? 'task_alt' : 'quiz'}
            </span>
            <span>{isCompletedSection ? 'تکمیل شد' : 'تکمیل خلاصه و ورود به آزمون'}</span>
          </button>
        </div>
      </div>

      {/* Quick Reader Settings Bottom Sheet */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#D5DAC8] flex flex-col gap-4 pb-safe animate-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[#D5DAC8] mx-auto -mt-1 mb-1 sm:hidden"></div>

            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E9DE]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8F4E15] text-[20px]">tune</span>
                <h3 className="font-bold text-sm text-[#312620]">تنظیمات مطالعه</h3>
              </div>
              <button
                onClick={() => setShowSettingsSheet(false)}
                className="w-8 h-8 rounded-full bg-[#F5F7EE] flex items-center justify-center text-[#6B6057] active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Font Size Stepper */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6B6057]">اندازه قلم متن:</label>
              <div className="grid grid-cols-4 gap-2 bg-[#F5F7EE] p-1.5 rounded-xl border border-[#E6E9DE]">
                {fontSizeLabels.map((lbl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFontSizeIndex(idx)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      fontSizeIndex === idx
                        ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                        : 'text-[#8D8177] hover:text-[#312620]'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6B6057]">فاصله خطوط:</label>
              <div className="grid grid-cols-3 gap-2 bg-[#F5F7EE] p-1.5 rounded-xl border border-[#E6E9DE]">
                {[
                  { id: 'normal', label: 'فشرده' },
                  { id: 'comfortable', label: 'استاندارد' },
                  { id: 'spacious', label: 'باز و روان' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLineHeight(item.id as any)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      lineHeight === item.id
                        ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                        : 'text-[#8D8177] hover:text-[#312620]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reader Theme Palette */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#6B6057]">تم رنگی پس‌زمینه:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'paper', label: 'کاغذ روشن', bg: 'bg-[#F5F7EE]', border: 'border-[#E6E9DE]', text: 'text-[#2E2621]' },
                  { id: 'sepia', label: 'کاهی گرم', bg: 'bg-[#FDF6E2]', border: 'border-[#E8DBBC]', text: 'text-[#3E2D17]' },
                  { id: 'night', label: 'تیره شب', bg: 'bg-[#18191A]', border: 'border-[#3A3B3C]', text: 'text-[#E4E6EB]' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setReaderTheme(th.id as ReaderTheme)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${th.bg} ${
                      readerTheme === th.id
                        ? 'border-[#FDA868] shadow-sm'
                        : `${th.border} opacity-80 hover:opacity-100`
                    }`}
                  >
                    <span className={`text-xs font-bold ${th.text}`}>{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={() => setShowSettingsSheet(false)}
              className="w-full h-11 bg-[#483C35] text-white rounded-xl text-xs font-bold active:scale-95 transition-transform mt-1 shadow-sm"
            >
              اعمال تنظیمات
            </button>
          </div>
        </div>
      )}

      {/* Affiliate Purchase Modal */}
      <AffiliatePurchaseModal
        isOpen={Boolean(affiliateModalBook)}
        onClose={() => setAffiliateModalBook(null)}
        book={affiliateModalBook}
        onCopyDiscount={(code) => showToast(`کد تخفیف ${code} کپی شد!`, 'success')}
      />
    </div>
  );
};
