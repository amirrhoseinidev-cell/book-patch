import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';
import { AffiliatePurchaseModal, AffiliateBookInfo } from '../components/AffiliatePurchaseModal';

export const BookReaderView: React.FC = () => {
  const { currentStep, goBack, navigateTo, openAiChat, showToast } = usePalle();
  const [fontSizeIndex, setFontSizeIndex] = useState(0); // 0: normal, 1: large, 2: xlarge
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompletedSection, setIsCompletedSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'source'>('summary');
  const [affiliateModalBook, setAffiliateModalBook] = useState<AffiliateBookInfo | null>(null);

  const fontSizeLabels = ['A', 'A+', 'A++'];
  const fontSizes = ['text-sm leading-relaxed', 'text-base leading-loose', 'text-lg leading-loose'];

  const passage = currentStep?.passage;
  const resource = currentStep?.resourceRecommendation;

  const handleFontToggle = () => {
    setFontSizeIndex((prev) => (prev + 1) % fontSizeLabels.length);
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? 'نشانک برداشته شد' : 'صفحه با موفقیت نشانه‌گذاری شد ✓');
  };

  const handleCompleteSection = () => {
    setIsCompletedSection(true);
    showToast('یادگیری خلاصه این پله به پایان رسید! آماده آزمون سنجش ادراکی شوید ✨');
    setTimeout(() => {
      navigateTo('step-assessment');
    }, 600);
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

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto pb-36">
      {/* Reading App Header Toolbar */}
      <section className="w-full px-4 py-2.5 bg-[#EDEFE6] border-b border-[#E6E9DE] flex items-center justify-between shadow-xs sticky top-16 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={goBack}
            aria-label="بازگشت به جزئیات پله"
            className="w-9 h-9 rounded-xl bg-[#F5F7EE] hover:bg-[#FFFFFF] flex items-center justify-center text-[#312620] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-[#6B6057] truncate">کپسول یادگیری و خلاصه تعاملی پله</span>
            <h2 className="font-bold text-xs text-[#312620] truncate">
              {currentStep?.title || 'پله یادگیری'}
            </h2>
          </div>
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleFontToggle}
            aria-label="تغییر اندازه قلم"
            className="h-9 px-2.5 rounded-xl bg-[#F5F7EE] hover:bg-[#FFFFFF] flex items-center gap-1 text-[#312620] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">format_size</span>
            <span className="text-xs font-bold">{fontSizeLabels[fontSizeIndex]}</span>
          </button>
          <button
            onClick={handleBookmarkToggle}
            aria-label="نشانه‌گذاری صفحه"
            className="w-9 h-9 rounded-xl bg-[#F5F7EE] hover:bg-[#FFFFFF] flex items-center justify-center text-[#312620] active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
      </section>

      {/* Dual Tab Mode Switcher (Rule 2: Emphasizes Micro-Learning Summary) */}
      <section className="w-full px-4 pt-3 pb-2 bg-[#F5F7EE] flex flex-col gap-2">
        <div className="grid grid-cols-2 p-1 bg-[#EDEFE6] rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'summary'
                ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                : 'text-[#6B6057] hover:text-[#312620]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">bolt</span>
            <span>خلاصه مفهومی و کاربردی</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'source'
                ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                : 'text-[#6B6057] hover:text-[#312620]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">menu_book</span>
            <span>گزیده متن دست‌اول</span>
          </button>
        </div>

        {/* Progress Strip */}
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-[#6B6057]">
            <span className="material-symbols-outlined text-[15px] text-[#8F4E15]">auto_stories</span>
            <span>{passage?.chapter || 'مفاهیم منتخب پله'}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[#8F4E15]">
            <span>پله {currentStep?.stepNumber || 1} از {currentStep?.totalSteps || 6}</span>
            <span className="text-[#8D8177]">•</span>
            <span className="font-bold">یادگیری سریع (~۵ دقیقه)</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[#EDEFE6] rounded-full overflow-hidden">
          <div className="h-full bg-[#FDA868] rounded-full w-[45%] transition-all duration-500"></div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full px-4 pt-3 flex flex-col gap-4">
        {activeTab === 'summary' ? (
          /* ================= TAB 1: CONVERSATIONAL MICRO-LEARNING SUMMARY ================= */
          <div className="flex flex-col gap-4">
            {/* Friendly Mentor Card */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] shadow-xs border border-[#E6E9DE] flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] shrink-0">
                  <span className="material-symbols-outlined text-[24px] filled">support_agent</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#8F4E15] font-bold">روایت و تحلیل مربی پله</span>
                  <h3 className="text-sm font-bold text-[#312620]">چکیده مفهومی و گفتگومحور</h3>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F5F7EE] text-[#312620] text-xs leading-relaxed border border-[#E6E9DE]">
                <p className="font-medium text-[#703700] mb-1.5">{microSummary.mentorGreeting}</p>
                <p>{microSummary.coreIdea}</p>
              </div>
            </div>

            {/* Core Concepts Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
                <h4 className="text-xs font-bold text-[#312620]">مفاهیم کلیدی این درس در ۳ دقیقه:</h4>
              </div>

              <div className="space-y-2.5">
                {microSummary.keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F7EE] border border-[#E6E9DE]">
                    <div className="w-5 h-5 rounded-full bg-[#483C35] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-[#2E2621] leading-relaxed font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Reflection & Takeaway */}
            <div className="p-4 rounded-2xl bg-[#FFDCC5]/50 border border-[#FDA868]/40 flex flex-col gap-2">
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

            {/* Book Reference & Affiliate Callout (Rule 3) */}
            {resource && (
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E6E9DE] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#312620]">
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
                    <h5 className="text-xs font-bold text-[#312620] truncate">{resource.title}</h5>
                    <p className="text-[11px] text-[#6B6057] truncate mt-0.5">
                      {resource.author} {resource.translator ? `• ترجمه ${resource.translator}` : ''}
                    </p>
                    <span className="text-[10px] text-[#8D8177] mt-1 truncate">
                      فصل منطبق: {resource.chapter}
                    </span>
                  </div>
                </div>

                <button
                  onClick={openAffiliateModal}
                  className="w-full h-11 bg-[#FDA868] hover:bg-[#F28938] text-[#301400] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#703700] filled">shopping_cart</span>
                  <span>تهیه کتاب با تخفیف ویژه</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ================= TAB 2: AUTHENTIC PASSAGE / SOURCE EXCERPT ================= */
          <div className="flex flex-col gap-4">
            {/* Chapter Metadata Card */}
            <div className="p-3.5 rounded-2xl bg-[#EDEFE6] shadow-xs flex items-center justify-between border border-[#E6E9DE]">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#8F4E15] font-bold">
                  گزیده مستند به کتاب «{passage?.bookTitle || resource?.title || 'مرجع پله'}»
                </span>
                <h3 className="font-bold text-sm text-[#312620] mt-0.5">
                  {passage?.title || currentStep?.title}
                </h3>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15]">
                <span className="material-symbols-outlined text-[18px]">history_edu</span>
              </div>
            </div>

            {/* Paper Reading Canvas */}
            <article className={`text-[#2E2621] space-y-4 text-justify ${fontSizes[fontSizeIndex]}`}>
              {passage?.paragraphs && passage.paragraphs.length > 0 ? (
                passage.paragraphs.map((p, idx) => (
                  <p key={idx} className={idx === 0 ? 'first-letter:text-xl first-letter:font-black first-letter:text-[#8F4E15]' : ''}>
                    {p}
                  </p>
                ))
              ) : (
                <p>محتوای متنی این بخش در حال استخراج از مراجع علمی است.</p>
              )}

              {/* Key Philosophic Highlight Card */}
              <div className="p-4 rounded-2xl bg-[#FFDCC5]/50 shadow-xs relative overflow-hidden my-3 border border-[#FDA868]/30">
                <div className="absolute inset-y-0 right-0 w-1.5 bg-[#FDA868] rounded-r"></div>
                <div className="flex items-start gap-3 pr-1">
                  <span className="material-symbols-outlined text-[#8F4E15] text-[20px] flex-shrink-0 mt-0.5 filled">
                    format_quote
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] text-[#8F4E15] font-bold">فراز کلیدی</span>
                    <p className="font-bold text-sm text-[#312620] leading-relaxed">
                      {passage?.highlightQuote || '«...زیرا بزرگ‌ترین نادانی این است که آدمی پندارد آنچه را نمی‌داند، می‌داند.»'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footnote / Contextual Illustration Card */}
              {passage?.footnote && (
                <div className="p-3 rounded-2xl bg-[#EDEFE6] shadow-xs flex items-center gap-3 my-2 border border-[#E6E9DE]">
                  {passage.footnote.imageUrl && (
                    <img
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#D5DAC8]"
                      src={passage.footnote.imageUrl}
                      alt={passage.footnote.title}
                    />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] text-[#8F4E15] font-bold">پاورقی مفهومی</span>
                    <p className="font-bold text-xs text-[#312620] truncate">{passage.footnote.title}</p>
                    <p className="text-[11px] text-[#6B6057] line-clamp-2 mt-0.5 leading-normal">
                      {passage.footnote.description}
                    </p>
                  </div>
                </div>
              )}
            </article>

            {/* Affiliate CTA in Source Tab as well (Rule 3) */}
            {resource && (
              <div className="p-3.5 rounded-2xl bg-[#F5F7EE] border border-[#E6E9DE] flex items-center justify-between gap-2 mt-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#312620]">علاقه‌مند به مطالعه کل کتاب؟</span>
                  <span className="text-[10px] text-[#6B6057] truncate">
                    کد تخفیف ۲۰٪ ویژه پله: PALLE20
                  </span>
                </div>
                <button
                  onClick={openAffiliateModal}
                  className="px-3 py-2 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold shrink-0 active:scale-95 transition-all shadow-xs"
                >
                  تهیه کتاب با تخفیف
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom Reading Controls Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F7EE]/95 backdrop-blur-xl border-t border-[#E6E9DE] pb-safe shadow-[0_-4px_20px_rgba(72,60,53,0.06)]">
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
            className="flex-1 h-11 rounded-xl bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] flex items-center justify-center gap-1 active:scale-98 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            <span>نمای پله</span>
          </button>

          <button
            onClick={handleCompleteSection}
            className={`flex-[2] h-11 px-4 rounded-xl flex items-center justify-center gap-1.5 active:scale-98 transition-all shadow-md text-xs font-bold ${
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

      {/* Affiliate Purchase Modal */}
      <AffiliatePurchaseModal
        isOpen={Boolean(affiliateModalBook)}
        onClose={() => setAffiliateModalBook(null)}
        book={affiliateModalBook}
        onCopyDiscount={(code) => showToast(`کد تخفیف ${code} کپی شد!`)}
      />
    </div>
  );
};

