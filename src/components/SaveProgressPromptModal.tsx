import React from 'react';
import { usePalle } from '../context/PalleContext';

export const SaveProgressPromptModal: React.FC = () => {
  const { showSaveProgressModal, dismissSaveProgressModal, openAuthModal } = usePalle();

  if (!showSaveProgressModal) {
    return null;
  }

  const handleCreateAccount = () => {
    dismissSaveProgressModal();
    openAuthModal('register');
  };

  return (
    <div
      onClick={dismissSaveProgressModal}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#191D17]/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl border border-[#D5DAC8] flex flex-col items-center text-center relative overflow-hidden animate-bottom-sheet sm:animate-in sm:zoom-in-95 duration-200 pb-safe"
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 rounded-full bg-[#D5DAC8] mb-3 sm:hidden cursor-pointer" onClick={dismissSaveProgressModal}></div>

        {/* Soft Background Tint */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#FFDCC5]/50 blur-2xl pointer-events-none"></div>

        {/* Tactile Icon */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] mb-2 sm:mb-3 shadow-xs">
          <span className="material-symbols-outlined text-[30px] sm:text-[34px] filled">military_tech</span>
        </div>

        {/* Celebratory Milestone Badge */}
        <span className="px-3 py-1 rounded-full bg-[#EDEFE6] text-[#8F4E15] text-[11px] font-bold mb-2">
          🎉 اولین گام یادگیری با موفقیت تکمیل شد!
        </span>

        {/* Title */}
        <h3 className="text-base font-black text-[#312620] mb-1">
          پیشرفت ارزشمندتان را ذخیره کنید
        </h3>

        {/* Friendly explanation */}
        <p className="text-xs text-[#6B6057] leading-relaxed mb-5 px-1 text-center">
          دستاوردها، یادداشت‌ها و پاسخ‌های شما در این دستگاه ثبت شده است. برای نگهداری دائمی و دسترسی روی تمام دستگاه‌ها، حساب کاربری رایگان خود را در کمتر از ۱ دقیقه بسازید.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleCreateAccount}
            className="w-full h-12 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
            <span>ایجاد حساب کاربری رایگان و ذخیره دائمی</span>
          </button>

          <button
            onClick={dismissSaveProgressModal}
            className="w-full py-2.5 text-center text-xs font-semibold text-[#8D8177] hover:text-[#312620] transition-colors"
          >
            فعلاً نه، ادامه در حالت مهمان
          </button>
        </div>
      </div>
    </div>
  );
};

