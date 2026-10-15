import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';
import { QuizQuestion } from '../types/palle';

export const StepAssessmentView: React.FC = () => {
  const { currentStep, submitStepQuiz, showToast } = usePalle();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [answersList, setAnswersList] = useState<number[]>([]);

  const questions: QuizQuestion[] = currentStep?.quiz?.questions && currentStep.quiz.questions.length > 0
    ? currentStep.quiz.questions
    : [
        {
          id: 'q-demo-1',
          question: 'بر اساس متن رساله، هدف نهایی سقراط از طرح پرسش‌های پیاپی در کوچه و بازار چه بود؟',
          category: 'مفهوم‌شناسی دیالوگ سقراطی',
          options: [
            'اثبات برتری خود در فن خطابه و مناظره',
            'آشکار ساختن تناقضات درونی طرف مقابل و بیدار کردن میل به جستجوی حقیقت',
            'آموزش عقاید جدید مذهبی به جوانان آتن',
            'جمع‌آوری آرا و نظرات عمومی برای تدوین قوانین',
          ],
          correctIndex: 1,
          mentorFeedback:
            'سقراط این روش را «مامایی اندیشه» می‌نامید؛ او نمی‌خواست اندیشه‌ای را به دیگران تحمیل کند، بلکه کمک می‌کرد خود فرد تناقضات پندارهای پیشینش را دریابد و اندیشه اصیل متولد شود.',
          wisdomPoints: 20,
        },
      ];

  const currentQ = questions[currentQIndex];
  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);
    setAnswersList((prev) => [...prev, idx]);
    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + currentQ.wisdomPoints);
      showToast('پاسخ صحیح است! +۲۰ امتیاز خرد ✨');
    } else {
      showToast('پاسخ انتخابی نادرست بود؛ توضیح مربی را مرور کنید.', 'info');
    }
  };

  const handleNext = async () => {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Completed all questions in the quiz! Persist attempt and complete step
      const maxScore = questions.reduce((sum, q) => sum + (q.wisdomPoints || 20), 0);
      await submitStepQuiz(score, maxScore, answersList);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-28 gap-4">
      {/* Header Context & Flow */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[#6B6057] text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-sm font-bold text-[#312620]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></span>
            {currentStep?.quiz?.title || 'سنجش ادراکی پله ۳'}
          </span>
          <span className="bg-[#EDEFE6] px-3 py-1 rounded-full text-[#312620] font-bold">
            سوال {currentQIndex + 1} از {questions.length}
          </span>
        </div>

        <div className="w-full bg-[#EDEFE6] h-2 rounded-full overflow-hidden mt-0.5">
          <div
            className="bg-[#FDA868] h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Socratic Illustration Visual Cue */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden shadow-xs bg-[#EDEFE6] flex items-center justify-center border border-[#E6E9DE]">
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwKwR28srhwcrpKO0iCmrlm4GyCmTzOeQ-q7niExsAI8xLrqZZdmh4oPHO_MBF4EkImLj6QIAe27hHlKkm3HMKc-3Z-2QFxWkKNMhAhOLqMNUlpSc2CNU4osQulcc6uRUsta62x4T9xHZvwes_5bJ_6HX7KYFPhrV11lw4-CVRiLipArB3QilWrGGCVss633lXo2-sj_NbEaWaTquErGI5e_G7iCI9gICB8B9d9-T6F8zpM5VTwH7N"
          alt="Socratic Agora Dialogues"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#312620]/80 via-[#312620]/25 to-transparent"></div>
        <div className="absolute bottom-3 right-4 left-4 flex items-center justify-between text-white">
          <span className="text-xs font-semibold flex items-center gap-1 opacity-90">
            <span className="material-symbols-outlined text-[16px] text-[#FFDCC5]">auto_stories</span>
            مرور گفت‌وگوهای میدان آگورا
          </span>
          <span className="text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md font-medium">
            ۳ دقیقه تفکر
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-5 shadow-xs border border-[#E6E9DE] flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="bg-[#EDEFE6] text-[#8F4E15] font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] filled">lightbulb</span>
            {currentQ.category}
          </span>
        </div>

        <h2 className="font-bold text-sm text-[#312620] leading-relaxed text-right">
          {currentQ.question}
        </h2>
      </div>

      {/* Multiple Choice Options */}
      <div className="flex flex-col gap-2.5" role="radiogroup">
        {currentQ.options.map((optText, idx) => {
          const isChosen = selectedOption === idx;
          const isCorrect = idx === currentQ.correctIndex;
          const showCorrectHighlight = isAnswerSubmitted && isCorrect;
          const showWrongHighlight = isAnswerSubmitted && isChosen && !isCorrect;

          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(idx)}
              className={`relative flex items-center justify-between rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs border text-right ${
                showCorrectHighlight
                  ? 'bg-[#F2F5EC] border-[#8F4E15] ring-2 ring-[#8F4E15]'
                  : showWrongHighlight
                  ? 'bg-[#FFDAD6]/30 border-[#BA1A1A] ring-2 ring-[#BA1A1A]'
                  : isChosen
                  ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                  : 'bg-[#FFFFFF] border-[#E6E9DE] hover:border-[#D5DAC8]'
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    showCorrectHighlight
                      ? 'bg-[#483C35] text-white'
                      : showWrongHighlight
                      ? 'bg-[#BA1A1A] text-white'
                      : 'bg-[#EDEFE6] text-[#6B6057]'
                  }`}
                >
                  {showCorrectHighlight ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : showWrongHighlight ? (
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span className="text-xs text-[#2E2621] font-medium leading-relaxed">
                  {optText}
                </span>
              </div>

              <div
                className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border ${
                  isChosen ? 'border-[#312620]' : 'border-[#D5DAC8]'
                }`}
              >
                {isChosen && <div className="w-2.5 h-2.5 rounded-full bg-[#FDA868]"></div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Post-Submission Feedback Banner */}
      {isAnswerSubmitted && (
        <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-sm border border-[#E6E9DE] flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-[#FFDCC5] text-[#301400]'
                  : 'bg-[#FFDAD6] text-[#93000A]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] filled">
                {selectedOption === currentQ.correctIndex ? 'check_circle' : 'info'}
              </span>
              <span>
                {selectedOption === currentQ.correctIndex ? 'پاسخ صحیح است!' : 'نیاز به مرور مجدد'}
              </span>
            </div>

            {selectedOption === currentQ.correctIndex && (
              <span className="text-xs font-bold text-[#8F4E15] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                +{currentQ.wisdomPoints} امتیاز خرد
              </span>
            )}
          </div>

          <div className="bg-[#F5F7EE] rounded-xl p-3.5 flex flex-col gap-1.5 border border-[#E6E9DE]">
            <div className="flex items-center gap-1.5 text-[#312620] text-xs font-bold">
              <span className="material-symbols-outlined text-[16px] text-[#FDA868] filled">psychology</span>
              <span>دیدگاه مربی پله:</span>
            </div>
            <p className="text-xs text-[#4E4540] text-right leading-relaxed">
              {currentQ.mentorFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#F5F7EE]/95 backdrop-blur-xl border-t border-[#E6E9DE] pb-safe shadow-[0_-4px_16px_rgba(72,60,53,0.06)]">
        <div className="w-full max-w-xl mx-auto px-4 py-3">
          <button
            onClick={handleNext}
            disabled={!isAnswerSubmitted}
            className="w-full bg-[#483C35] hover:bg-[#312620] disabled:opacity-40 text-white h-12 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span>
              {currentQIndex + 1 < questions.length ? 'ادامه به سوال بعد' : 'ثبت پله و دریافت مدال'}
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
