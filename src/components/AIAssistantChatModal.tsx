import React, { useState, useEffect, useRef } from 'react';
import { usePalle } from '../context/PalleContext';
import { palleApi } from '../services/api';
import { AssistantMessage } from '../types/palle';

const APP_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1X-wSo11NCGzSbdcpKBVFtUGHscalLWyBVnf_KYEJsvdgCcNiZEVyBP56idfxfmTVQcYJforPJpHzJyw8klzmrmgp4dusWTvo2cUy8ZO5MSo038wm9SUFlKmiAUNppis8PE_KX1kSj5E2JjBBoMdFIDI_1yva5kzsCBvUFmATN5X5y8QppYpXrUo3RPR6-BkfmRQqab-dhAVkhY1AhDflh8XCUKDn6JwNASo7C5unx7jQADBtT4VWmn3ik';

export const AIAssistantChatModal: React.FC = () => {
  const { isAiChatOpen, closeAiChat, currentStep, addNote, showToast } = usePalle();
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stepTitle = currentStep?.title || 'رساله آپولوژی (دفاعیه سقراط)';
  const passageContext = currentStep?.passage
    ? `${currentStep.passage.bookTitle} - ${currentStep.passage.chapter}:\n${currentStep.passage.paragraphs.join('\n')}\nنقل قول: ${currentStep.passage.highlightQuote}`
    : '';

  useEffect(() => {
    if (isAiChatOpen && messages.length === 0) {
      // Load initial chat history or default thread
      const threadId = currentStep?.id || 'default-thread';
      palleApi.getChatHistory(threadId).then((res) => {
        if (res.history && res.history.length > 0) {
          setMessages(res.history);
        } else {
          // Provide authentic default conversation like Screen 4
          setMessages([
            {
              id: 'init-user',
              role: 'user',
              text: 'منظور سقراط از اینکه می‌گه «بزرگ‌ترین نادانی اینه که فکر کنی چیزی رو می‌دونی که نمی‌دونی» چیه؟',
              timestamp: '۱۰:۴۲',
            },
            {
              id: 'init-ai',
              role: 'assistant',
              text: 'سقراط اشاره به «جهل مرکب» دارد. او معتقد است تفاوتش با دیگران این نیست که او همه چیز را می‌داند، بلکه این است که:\n\n۱. او به نادانی خود درباره حقایق غایی آگاه است (اعتراف به نادانی).\n۲. در حالی که دیگران با ادعای دانستن، امکان جستجو و تفکر را بر روی خود می‌بندند.\n\nبه همین دلیل، آگاهی از اینکه نمی‌دانیم، نخستین پله برای رسیدن به دانش واقعی است.',
              citation: 'مستند به متن صفحه ۱۸',
              timestamp: '۱۰:۴۲',
            },
          ]);
        }
      });
    }
  }, [isAiChatOpen, currentStep?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isAiChatOpen) return null;

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const res = await palleApi.askAssistant({
        question: userMsg.text,
        passageContext,
        stepTitle,
        threadId: currentStep?.id,
      });

      setMessages((prev) => [...prev, res.answer]);
    } catch (e) {
      showToast('خطا در دریافت پاسخ از دستیار هوشمند', 'warning');
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (msg: AssistantMessage) => {
    navigator.clipboard.writeText(msg.text);
    setCopiedId(msg.id);
    showToast('متن پاسخ کپی شد ✓');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = async (msg: AssistantMessage) => {
    await addNote({
      text: msg.text,
      quote: currentStep?.passage?.highlightQuote,
      bookTitle: currentStep?.passage?.bookTitle,
      stepTitle: currentStep?.title,
    });
    setSavedId(msg.id);
  };

  return (
    <div
      onClick={closeAiChat}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#191D17]/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F5F7EE] w-full max-w-xl max-h-[94vh] sm:h-[92vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#D5DAC8] animate-bottom-sheet sm:animate-in sm:zoom-in-95"
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div
          onClick={closeAiChat}
          className="w-full pt-2.5 pb-1 flex justify-center items-center cursor-pointer sm:hidden bg-[#EDEFE6]"
        >
          <div className="w-12 h-1.5 rounded-full bg-[#D5DAC8]"></div>
        </div>

        {/* Top Context Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#EDEFE6] border-b border-[#E6E9DE] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FDA868] animate-pulse"></span>
              <h3 className="font-bold text-sm sm:text-base text-[#312620]">دستیار یادگیری پله</h3>
            </div>
            <button
              onClick={closeAiChat}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F5F7EE] hover:bg-[#FFFFFF] text-[#4E4540] text-xs font-semibold shadow-2xs active:scale-90 transition-all touch-manipulation"
            >
              <span>بستن</span>
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFFFF]/90 px-3 py-1.5 rounded-xl w-fit text-xs text-[#6B6057] shadow-2xs">
            <span className="material-symbols-outlined text-[#8F4E15] text-[16px]">menu_book</span>
            <span>در حال گفت‌وگو بر اساس:</span>
            <span className="font-bold text-[#312620] truncate max-w-[200px]">
              {currentStep?.passage?.bookTitle || 'رساله آپولوژی'} (ص {currentStep?.passage?.pageNumber || 18})
            </span>
          </div>
        </div>

        {/* Quick Prompts Rail */}
        <div className="w-full overflow-x-auto no-scrollbar px-4 py-2 bg-[#F5F7EE] border-b border-[#E6E9DE]/60">
          <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
            <button
              onClick={() => handleSendMessage('ساده‌تر توضیح بده')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-medium active:scale-95 transition-all"
            >
              <span>💡</span>
              <span>ساده‌تر توضیح بده</span>
            </button>
            <button
              onClick={() => handleSendMessage('با یک مثال روزمره بیان کن')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-medium active:scale-95 transition-all"
            >
              <span>🔍</span>
              <span>با یک مثال روزمره بیان کن</span>
            </button>
            <button
              onClick={() => handleSendMessage('خلاصه این پاراگراف چیست؟')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-medium active:scale-95 transition-all"
            >
              <span>📝</span>
              <span>خلاصه این پاراگراف چیست؟</span>
            </button>
            <button
              onClick={() => handleSendMessage('از من یک سوال بپرس تا بسنجم')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-medium active:scale-95 transition-all"
            >
              <span>❓</span>
              <span>از من یک سوال بپرس تا بسنجم</span>
            </button>
          </div>
        </div>

        {/* Conversation Thread */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex flex-col items-start max-w-[85%] self-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-[#6B6057]">شما</span>
                    <span className="text-[#8D8177] text-[10px]">•</span>
                    <span className="text-[11px] text-[#8D8177]">{msg.timestamp}</span>
                  </div>
                  <div className="bg-[#E7E9E0] text-[#2E2621] rounded-2xl rounded-tr-sm p-3.5 shadow-sm text-sm leading-relaxed text-right">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex flex-col w-full self-stretch">
                <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-sm border border-[#E6E9DE]">
                  {/* Top Citation Badge */}
                  <div className="flex items-center justify-between pb-2 mb-2 bg-[#F2F5EC] rounded-xl px-3 py-2 border border-[#E6E9DE]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#483C35] flex items-center justify-center p-0.5 overflow-hidden">
                        <img alt="Palle Logo" className="w-full h-full object-contain" src={APP_LOGO_URL} />
                      </div>
                      <span className="text-xs font-bold text-[#312620]">پاسخ پله</span>
                      <span className="text-[#8D8177] text-[10px]">•</span>
                      <span className="text-[11px] text-[#8F4E15] font-semibold">
                        {msg.citation || 'مستند به متن درس'}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[#FDA868] text-[20px] filled">
                      auto_awesome
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className="text-[#2E2621] text-sm leading-relaxed whitespace-pre-line text-right">
                    {msg.text}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-[#E6E9DE]/60">
                    <button
                      onClick={() => handleCopy(msg)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-semibold active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">content_copy</span>
                      <span>{copiedId === msg.id ? 'کپی شد!' : 'کپی پاسخ'}</span>
                    </button>

                    <button
                      onClick={() => handleSendMessage('توضیح بیشتری در این باره بده')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EDEFE6] hover:bg-[#E7E9E0] text-[#312620] text-xs font-semibold active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-[15px]">expand_more</span>
                      <span>توضیح بیشتر</span>
                    </button>

                    <button
                      onClick={() => handleSaveNote(msg)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-all ${
                        savedId === msg.id
                          ? 'bg-[#483C35] text-white'
                          : 'bg-[#FFDCC5] text-[#301400] hover:bg-[#FDA868]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {savedId === msg.id ? 'check' : 'bookmark_add'}
                      </span>
                      <span>{savedId === msg.id ? 'در یادداشت‌ها ذخیره شد ✓' : 'ذخیره به عنوان یادداشت پله'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#EDEFE6] text-[#312620] w-fit text-xs font-medium">
              <span className="material-symbols-outlined text-[#FDA868] animate-spin text-[18px]">
                progress_activity
              </span>
              <span>پله در حال تامل بر متن کتاب...</span>
            </div>
          )}
        </div>

        {/* Sticky Input Bar */}
        <div className="p-3 bg-[#F5F7EE] border-t border-[#E6E9DE] pb-safe">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 flex items-center bg-[#FFFFFF] rounded-full px-4 border border-[#D5DAC8] shadow-xs focus-within:border-[#483C35] transition-colors">
              <input
                type="text"
                dir="rtl"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="سؤالت رو درباره این بخش بپرس..."
                className="w-full bg-transparent py-3 pr-1 pl-8 text-[#2E2621] placeholder:text-[#8D8177] text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => showToast('ورودی صوتی در این مرورگر فعال نیست; از صفحه کلید استفاده فرمایید.', 'info')}
                className="absolute left-3 text-[#8D8177] hover:text-[#312620]"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-12 h-12 rounded-full bg-[#483C35] hover:bg-[#312620] disabled:opacity-40 text-[#FDA868] flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[20px] rotate-180">send</span>
            </button>
          </form>
          <div className="text-center pt-2">
            <span className="text-[11px] text-[#8D8177]">
              پاسخ‌ها به طور خودکار به قطعه انتخابی از کتاب ارجاع داده می‌شوند
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
