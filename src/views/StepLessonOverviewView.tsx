import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';
import { AffiliatePurchaseModal, AffiliateBookInfo } from '../components/AffiliatePurchaseModal';
import { palleApi } from '../services/api';
import { LearningStep } from '../types/palle';

export const StepLessonOverviewView: React.FC = () => {
  const {
    currentStep,
    activePath,
    startStep,
    completeCurrentStep,
    navigateTo,
    goBack,
    showToast,
    openAiChat,
    addNote,
  } = usePalle();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [affiliateModalBook, setAffiliateModalBook] = useState<AffiliateBookInfo | null>(null);
  const [isCompletingStep, setIsCompletingStep] = useState(false);

  // Requirement 5: Contextual Ask-AI state
  const [askAiQuestion, setAskAiQuestion] = useState('');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiCitation, setAiCitation] = useState<string | null>(null);

  if (!currentStep) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <p className="text-sm text-[#6B6057]">پله‌ای انتخاب نشده است.</p>
        <button
          onClick={() => navigateTo('path-roadmap')}
          className="mt-3 px-4 py-2 bg-[#483C35] text-white rounded-xl text-xs font-bold"
        >
          بازگشت به نقشه مسیر
        </button>
      </div>
    );
  }

  // Requirement 2: Rich Micro-Learning Content (2-3 authentic educational paragraphs with real-world examples)
  const getEducationalParagraphs = (step: LearningStep) => {
    if (step.id === 'step-g-1') {
      return {
        concept:
          'بسیاری از ما باورهای عمیقی در ذهن داریم که سال‌ها بر اساس آن‌ها تصمیم گرفته‌ایم، بدون آنکه حتی یک‌بار درستی آن‌ها را به محک آزمون زده باشیم. اصل بنیادین این پله، «فروتنی معرفتی» است؛ دانایی حقیقی با اعتراف صمیمانه به ندانستن آغاز می‌شود. زمانی که گمان می‌کنیم به پاسخ قطعی رسیده‌ایم، کنجکاوی و جستجو متوقف می‌شود و در تله پیش‌فرض‌های ساختگی گرفتار می‌مانیم.',
        example:
          'به یک موقعیت واقعی در شبکه‌های اجتماعی یا مکالمات کاری فکر کنید؛ خبری هیجان‌انگیز پخش می‌شود و بلافاصله موجی از قضاوت و پیش‌داوری شکل می‌گیرد. فردی که این مهارت را آموخته، به جای قضاوت شتاب‌زده، مکث می‌کند و می‌پرسد: «آیا من شواهد دست‌اول این ماجرا را دیده‌ام یا صرفاً بر موج فرضیات دیگران سوار شده‌ام؟» همین مکث سنجشگرانه، جلوی ده‌ها تصمیم و اظهارنظر نسنجیده را می‌گیرد.',
        application:
          'از امروز، هر زمان که با یک تصمیم مهم یا باور قطعی روبه‌رو شدید، قانون «سه پرسش سقراطی» را به کار ببندید: سه بار پی‌درپی از خود بپرسید «چرا این موضوع برای من یک حقیقت است؟». اگر پایه آن بر تجربه موثق یا استدلال معتبر استوار نبود، آن را بازبینی کنید تا خرد جایگزین توهم دانایی شود.',
      };
    }

    if (step.id === 'step-g-2') {
      return {
        concept:
          'مغالطه منطقی، خطایی در ساختار استدلال است که ظاهری موجه و فریبنده دارد اما از نظر سنجش عقلانی کاملاً بی‌اعتبار است. یکی از رایج‌ترین این خطاها، «مغالطه حمله به شخص (Ad Hominem)» است؛ یعنی زمانی که به جای ارزیابی درستی یا نادرستی یک سخن، به شغل، سن، ظاهر یا انگیزه گوینده حمله می‌کنیم تا ادعای او را بی‌ارزش جلوه دهیم.',
        example:
          'تصور کنید در یک جلسه همفکری، کارمندی جوان پیشنهاد می‌دهد که روش بسته‌بندی محصول برای کاهش هزینه‌ها تغییر کند. اگر مدیر به جای بررسی اعداد و داده‌های فنی بگوید «تو تازه فارغ‌التحصیل شده‌ای و از کسب‌وکار چیزی نمی‌دانی»، مرتکب مغالطه شده است؛ زیرا تجربه کم او، صحت یا عدم صحت محاسبات بسته‌بندی را تغییر نمی‌دهد.',
        application:
          'راهکار کاربردی برای جلسات و گفتگوها: همیشه پیام را از پیام‌رسان جدا کنید. وقتی نظری در ابتدا شما را آزرده می‌کند، به جای توجه به شخصیت گوینده، تنها یک سوال بپرسید: «آیا این ادعا از نظر منطقی و شواهد تجربی درست است یا خیر؟» این تمرین تفکیک منطقی، قدرت استدلال شما را متحول خواهد کرد.',
      };
    }

    // Dynamic generation for any AI or user-created curriculum step
    const concept = step.introDescription
      ? step.introDescription.replace(/[«»]/g, '')
      : `درک عمیق مفهوم «${step.title}» نیازمند شکستن ساختارهای پیچیده به اجزای بنیادین است. این گام شما را با سازوکار اصلی و نحوه کارکرد این ایده آشنا می‌کند تا دانشی ماندگار بسازید.`;

    const example = step.keyTakeaway
      ? `نمونه عینی در دنیای واقعی: ${step.keyTakeaway} به عنوان مثال، در مواجهه با چالش‌های غیرمنتظره روزمره، تسلط بر این مفهوم به شما اجازه می‌دهد واکنش‌های غریزی و شتاب‌زده را با تحلیل سنجیده جایگزین کنید.`
      : `یک سناریوی ملموس: وقتی افراد بدون شناخت این اصل عمل می‌کنند، اغلب در دورهای باطل تکرار اشتباه گرفتار می‌شوند. به کار بردن این دیدگاه، امکان تمایز سرنخ‌های اصلی از عوامل فرعی را فراهم می‌کند.`;

    const application = step.microSummary?.quickReflection
      ? `تمرین و کاربست عملی: «${step.microSummary.quickReflection}» همین امروز در یکی از تصمیمات یا گفتگوهای روزمره‌تان، این پرسش محوری را در ذهن خود بازخوانی کرده و نتیجه آن را بر شفافیت افکارتان مشاهده نمایید.`
      : `تمرین اختصاصی این گام: در ۲۴ ساعت آینده، حداقل یک موقعیت را شناسایی کنید که این مفهوم در آن کاربرد دارد و یادداشت کوتاهی از تجربه خود در پله ثبت کنید.`;

    return { concept, example, application };
  };

  const educationalText = getEducationalParagraphs(currentStep);

  const handleAudioToggle = () => {
    setIsPlayingAudio(!isPlayingAudio);
    showToast(isPlayingAudio ? 'پخش صوت متوقف شد' : 'در حال پخش روایت مقدمه صوتی...');
  };

  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    showToast(isBookmarked ? 'از نشانک‌ها حذف شد' : 'این پله نشانه‌گذاری شد ✓');
  };

  const openAffiliateForBook = () => {
    if (!currentStep.resourceRecommendation) return;
    setAffiliateModalBook({
      title: currentStep.resourceRecommendation.title,
      author: currentStep.resourceRecommendation.author,
      translator: currentStep.resourceRecommendation.translator,
      chapter: currentStep.resourceRecommendation.chapter,
      coverImage: currentStep.resourceRecommendation.coverImage,
      discountCode: currentStep.resourceRecommendation.discountCode || 'PALLE20',
      discountPercent: currentStep.resourceRecommendation.discountPercent || 20,
      affiliateUrl: currentStep.resourceRecommendation.affiliateUrl,
      priceNote: currentStep.resourceRecommendation.priceNote,
    });
  };

  const handleStartMicroLesson = async () => {
    if (activePath && currentStep) {
      await startStep(activePath.id, currentStep.id);
    }
    navigateTo('book-reader');
  };

  // Requirement 4: Actionable sequential progression
  const handleCompleteAndNext = async () => {
    setIsCompletingStep(true);
    try {
      await completeCurrentStep();
    } catch {
      showToast('خطا در ثبت پیشرفت پله', 'warning');
    } finally {
      setIsCompletingStep(false);
    }
  };

  // Requirement 5: Contextual Q&A handling
  const executeAskAi = async (question: string) => {
    if (!question.trim()) return;
    setIsAskingAi(true);
    try {
      const res = await palleApi.askAssistant({
        question,
        stepTitle: currentStep.title,
        passageContext: `${currentStep.title} (${currentStep.category}): ${educationalText.concept}. مثال: ${educationalText.example}`,
      });
      setAiAnswer(res.answer.text);
      setAiCitation(res.answer.citation || 'مستند به آموزه‌های این پله');
      showToast('پاسخ مربی آماده است ✨');
    } catch {
      showToast('پاسخ مربی دریافت نشد. لطفاً دوباره امتحان کنید.', 'warning');
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleAskAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askAiQuestion.trim() || isAskingAi) return;
    await executeAskAi(askAiQuestion.trim());
  };

  const handleAskPrompt = async (prompt: string) => {
    setAskAiQuestion(prompt);
    await executeAskAi(prompt);
  };

  const handleSaveAiAnswerToNote = async () => {
    if (!aiAnswer) return;
    await addNote({
      stepTitle: currentStep.title,
      text: `پرسش: ${askAiQuestion || 'پرسش مفهومی'}\n\nپاسخ مربی:\n${aiAnswer}`,
      quote: currentStep.resourceRecommendation?.quote,
    });
    showToast('پاسخ مربی در صندوقچه یادداشت‌های شما ذخیره شد 📝');
  };

  const isStep1 = currentStep.stepNumber === 1;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-36 gap-4">
      {/* Top Navigation & Status */}
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] transition-all active:scale-95 text-xs font-semibold"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          <span>بازگشت به نقشه مسیر</span>
        </button>

        {/* Step 1 Unlocked & Accessible Indicator */}
        <div className="flex items-center gap-1.5 bg-[#EDEFE6] px-3 py-1 rounded-full text-[11px] font-bold text-[#6B6057]">
          <span className="w-2 h-2 rounded-full bg-[#FDA868] animate-pulse"></span>
          <span>
            {isStep1 && currentStep.status !== 'completed'
              ? 'پله اول (فعال و در دسترس)'
              : currentStep.status === 'completed'
              ? 'تکمیل شده • مرور مجدد'
              : 'گام جاری'}
          </span>
        </div>
      </div>

      {/* Milestone Badges & Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-[#FFDCC5] text-[#301400] px-3 py-1 rounded-full text-xs font-bold shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">stairs</span>
          <span>
            پله {currentStep.stepNumber} از {currentStep.totalSteps}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 bg-[#EDEFE6] text-[#6B6057] px-3 py-1 rounded-full text-[11px] font-medium">
          <span className="material-symbols-outlined text-[15px]">bolt</span>
          <span>میکرو-لرنینگ: {currentStep.durationMinutes} دقیقه</span>
        </span>
        <span className="inline-flex items-center gap-1 bg-[#EDEFE6] text-[#6B6057] px-2.5 py-1 rounded-full text-[11px] font-medium">
          <span className="material-symbols-outlined text-[15px]">psychology</span>
          <span>آموزش کاربردی</span>
        </span>
      </div>

      {/* Step Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FFFFFF] shadow-xs p-4 border border-[#E6E9DE]">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FFDCC5] flex-shrink-0 flex items-center justify-center text-[#8F4E15]">
            <span className="material-symbols-outlined text-[26px] filled">forum</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-[#8F4E15] font-bold mb-0.5">{currentStep.category}</span>
            <h2 className="font-black text-base text-[#312620] leading-snug">{currentStep.title}</h2>
            <p className="text-xs text-[#6B6057] mt-1">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Audio Insight Card */}
        <div className="mt-3.5 flex items-center justify-between px-3 py-2 rounded-xl bg-[#EDEFE6] text-[#312620]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAudioToggle}
              aria-label="پخش صوت راهنما"
              className="w-8 h-8 rounded-full bg-[#312620] text-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPlayingAudio ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold">{currentStep.podcastTitle}</span>
              <span className="text-[10px] text-[#6B6057]">روایت صوتی مربی پله</span>
            </div>
          </div>
          <span className="text-xs text-[#6B6057] font-medium">{currentStep.podcastDuration}</span>
        </div>
      </div>

      {/* ================= SECTION 2: RICH MICRO-LEARNING CONTENT (REQUIREMENT 2) ================= */}
      {/* Replaced high-level lists with ACTUAL short educational text: 2-3 paragraphs with real-world examples */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
            <h3 className="font-bold text-sm text-[#312620]">آموزش فشرده و مفهومی این پله</h3>
          </div>
          <span className="text-[10px] bg-[#FFDCC5] text-[#703700] px-2 py-0.5 rounded-full font-bold">
            یادگیری عمیق در چند دقیقه
          </span>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-xs border-2 border-[#FDA868]/40 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#FFDCC5]/20 rounded-br-full pointer-events-none"></div>

          {/* Paragraph 1: Core Concept */}
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F4E15]">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>۱. مفهوم بنیادین و اصل ماجرا</span>
            </div>
            <p className="text-xs text-[#312620] leading-relaxed bg-[#F5F7EE] p-3 rounded-xl border border-[#E6E9DE] text-justify font-sans">
              {educationalText.concept}
            </p>
          </div>

          {/* Paragraph 2: Real-World Example */}
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F4E15]">
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>۲. مثال ملموس در دنیای واقعی</span>
            </div>
            <p className="text-xs text-[#312620] leading-relaxed bg-[#FDF9F5] p-3 rounded-xl border border-[#FDA868]/30 text-justify font-sans">
              {educationalText.example}
            </p>
          </div>

          {/* Paragraph 3: Actionable Application */}
          <div className="flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#8F4E15]">
              <span className="material-symbols-outlined text-[16px]">psychology_alt</span>
              <span>۳. نحوه کاربست در زندگی و تصمیم‌گیری</span>
            </div>
            <p className="text-xs text-[#312620] leading-relaxed bg-[#EDEFE6] p-3 rounded-xl border border-[#E6E9DE] text-justify font-sans">
              {educationalText.application}
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: RECOMMENDED RESOURCE & AFFILIATE INTEGRATION (REQUIREMENT 3) ================= */}
      {/* Primary CTA: "تهیه کتاب با تخفیف ویژه" alongside option to read inline summary */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
            <h3 className="font-bold text-sm text-[#312620]">کتاب مرجع این پله (مطالعه تکمیلی)</h3>
          </div>
          <span className="text-[11px] text-[#8F4E15] bg-[#FFDCC5] px-2 py-0.5 rounded-full font-bold">
            مطالعه اختیاری
          </span>
        </div>

        <div className="flex flex-col rounded-2xl bg-[#FFFFFF] p-4 shadow-xs border border-[#E6E9DE] overflow-hidden gap-3">
          <div className="flex items-start gap-3.5">
            <div className="relative w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-[#EDEFE6] border border-[#E6E9DE]">
              <img
                src={currentStep.resourceRecommendation.coverImage}
                alt={currentStep.resourceRecommendation.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[9px] text-white px-1.5 py-0.5 bg-[#312620]/80 rounded font-bold">
                کتاب معتبر
              </span>
            </div>

            <div className="flex flex-col justify-between flex-1 min-w-0 h-28 py-0.5">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="material-symbols-outlined text-[#8F4E15] text-[16px]">auto_stories</span>
                  <span className="text-[11px] text-[#6B6057]">منبع غنی‌سازی یادگیری</span>
                </div>
                <h4 className="font-bold text-xs text-[#312620] leading-snug truncate">
                  {currentStep.resourceRecommendation.title}
                </h4>
                <p className="text-[11px] text-[#6B6057] mt-0.5 truncate">
                  {currentStep.resourceRecommendation.author}
                  {currentStep.resourceRecommendation.translator &&
                    ` • ترجمه ${currentStep.resourceRecommendation.translator}`}
                </p>
                <p className="text-[11px] text-[#8F4E15] font-semibold mt-1 truncate">
                  {currentStep.resourceRecommendation.chapter}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[#6B6057] text-[10px]">
                <span className="inline-flex items-center gap-1 bg-[#F5F7EE] px-2 py-0.5 rounded-md border border-[#E6E9DE]">
                  <span className="material-symbols-outlined text-[13px]">menu_book</span>
                  <span>{currentStep.resourceRecommendation.pageCount} صفحه</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-[#F5F7EE] px-2 py-0.5 rounded-md border border-[#E6E9DE]">
                  <span className="material-symbols-outlined text-[13px]">timer</span>
                  <span>حدود {currentStep.resourceRecommendation.estimatedMinutes} دقیقه</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quote Excerpt */}
          <div className="bg-[#F5F7EE] rounded-xl p-3 text-[#4E4540] text-xs italic flex items-start gap-2 border border-[#E6E9DE]">
            <span className="material-symbols-outlined text-[#FDA868] text-[20px] flex-shrink-0 filled">
              format_quote
            </span>
            <span>
              {currentStep.resourceRecommendation.quote} — {currentStep.resourceRecommendation.quoteCitation}
            </span>
          </div>

          {/* Resource & Affiliate CTA Actions */}
          <div className="pt-2 border-t border-[#E6E9DE] flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-[#6B6057]">
              <span className="flex items-center gap-1 text-[#8F4E15] font-semibold">
                <span className="material-symbols-outlined text-[15px] filled">local_mall</span>
                <span>همکاری در فروش پله</span>
              </span>
              <span className="bg-[#FFDCC5] text-[#703700] px-2 py-0.5 rounded-full font-bold text-[10px]">
                کد تخفیف ویژه: {currentStep.resourceRecommendation.discountCode || 'PALLE20'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Primary CTA Button: تهیه کتاب با تخفیف ویژه */}
              <button
                onClick={openAffiliateForBook}
                className="flex-1 h-11 bg-[#FDA868] hover:bg-[#F28938] text-[#301400] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-[#703700] filled">shopping_cart</span>
                <span>تهیه کتاب با تخفیف ویژه</span>
              </button>

              {/* Alongside option to read the inline summary */}
              <button
                onClick={handleStartMicroLesson}
                className="px-3.5 h-11 bg-[#F5F7EE] hover:bg-[#EDEFE6] text-[#312620] border border-[#D5DAC8] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[17px] text-[#8F4E15]">menu_book</span>
                <span>مطالعه خلاصه پله</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: INTERACTIVE ASK-AI BOX (REQUIREMENT 5) ================= */}
      {/* Contextual Q&A box at the bottom of the lesson */}
      <section className="bg-white rounded-2xl p-4 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15]">
              <span className="material-symbols-outlined text-[18px] filled">smart_toy</span>
            </div>
            <h3 className="font-bold text-xs text-[#312620]">پرسش و پاسخ تعاملی با مربی هوشمند</h3>
          </div>
          <button
            onClick={openAiChat}
            className="text-[11px] text-[#8F4E15] font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>پنجره کامل گفتگو</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>

        {/* Text Input with specific placeholder */}
        <form onSubmit={handleAskAiSubmit} className="flex flex-col gap-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={askAiQuestion}
              onChange={(e) => setAskAiQuestion(e.target.value)}
              placeholder="سوالی درباره این مفهوم داری؟ از مربی بپرس..."
              className="w-full bg-[#F5F7EE] border border-[#D5DAC8] focus:border-[#483C35] rounded-xl px-3.5 py-2.5 text-xs text-[#2E2621] outline-none pl-10 placeholder:text-[#8D8177] transition-all"
            />
            <button
              type="submit"
              disabled={isAskingAi || !askAiQuestion.trim()}
              className="absolute left-1.5 w-8 h-8 rounded-lg bg-[#483C35] hover:bg-[#312620] disabled:bg-[#D5DAC8] text-white flex items-center justify-center transition-all active:scale-95 disabled:pointer-events-none"
              title="ارسال سوال به مربی"
            >
              {isAskingAi ? (
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[16px] rotate-180">arrow_forward</span>
              )}
            </button>
          </div>

          {/* Quick Contextual Suggested Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              'یک مثال ساده‌تر بزن',
              'چطور این را در عمل تمرین کنم؟',
              'بزرگ‌ترین اشتباه در فهم این مفهوم چیه؟',
            ].map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAskPrompt(prompt)}
                className="text-[10px] bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#4E4540] px-2.5 py-1 rounded-full whitespace-nowrap transition-all shrink-0 active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>
        </form>

        {/* Contextual AI Answer Card */}
        {aiAnswer && (
          <div className="bg-[#F5F7EE] rounded-xl p-3.5 border border-[#E6E9DE] flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#312620] flex items-center gap-1">
                <span className="material-symbols-outlined text-[#8F4E15] text-[16px]">psychology</span>
                <span>پاسخ مربی پله:</span>
              </span>
              {aiCitation && (
                <span className="text-[10px] text-[#8F4E15] bg-[#FFDCC5] px-2 py-0.5 rounded-full font-medium">
                  {aiCitation}
                </span>
              )}
            </div>

            <p className="text-xs text-[#2E2621] leading-relaxed whitespace-pre-line">{aiAnswer}</p>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E6E9DE]">
              <button
                onClick={handleSaveAiAnswerToNote}
                className="text-[11px] font-bold text-[#8F4E15] hover:text-[#703700] flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-[#EDEFE6] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">bookmark_add</span>
                <span>ذخیره در یادداشت‌ها</span>
              </button>
              <button
                onClick={openAiChat}
                className="text-[11px] font-bold text-[#483C35] hover:underline flex items-center gap-1"
              >
                <span>ادامه در پنجره گفتگو</span>
                <span className="material-symbols-outlined text-[14px]">forum</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Assessment Preview Link */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
            <h3 className="font-bold text-sm text-[#312620]">آزمون سنجش ادراکی پله</h3>
          </div>
          <span className="text-[11px] text-[#6B6057]">تثبیت بدون فراموشی</span>
        </div>

        <div
          onClick={() => navigateTo('step-assessment')}
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#FFFFFF] shadow-xs border border-[#E6E9DE] cursor-pointer hover:border-[#FDA868] transition-all active:scale-[0.99]"
        >
          <div className="w-12 h-12 rounded-xl bg-[#FDA868] flex items-center justify-center text-[#301400] shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[26px]">quiz</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#312620]">{currentStep.quiz.title}</h4>
              <span className="bg-[#FFDCC5] text-[#301400] text-[10px] px-2 py-0.5 rounded-full font-bold">
                {currentStep.quiz.questions.length} سوال
              </span>
            </div>
            <p className="text-[11px] text-[#6B6057] mt-1 leading-normal">
              ارزیابی مفهومی آموخته‌ها با بازخورد اختصاصی و هدایت‌گر مربی هوشمند.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: ACTIONABLE NEXT STEP BUTTON (REQUIREMENT 4) ================= */}
      {/* Sticky Bottom Action Bar with clear "تکمیل پله و ورود به گام بعدی" button */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F7EE]/95 backdrop-blur-xl border-t border-[#E6E9DE] shadow-lg px-4 py-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBookmarkToggle}
            aria-label="نشان کردن این پله"
            className="h-12 w-12 rounded-xl bg-[#EDEFE6] hover:bg-[#E1E3DB] flex items-center justify-center text-[#312620] active:scale-95 transition-all flex-shrink-0"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
            >
              {isBookmarked ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>

          {/* Primary Action Button: "تکمیل پله و ورود به گام بعدی" */}
          <button
            onClick={handleCompleteAndNext}
            disabled={isCompletingStep}
            className="flex-1 h-12 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-75"
          >
            {isCompletingStep ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>در حال ثبت پیشرفت و بازگشایی گام بعدی...</span>
              </>
            ) : (
              <>
                <span>تکمیل پله و ورود به گام بعدی</span>
                <span className="material-symbols-outlined text-[18px] text-[#FDA868]">task_alt</span>
              </>
            )}
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
