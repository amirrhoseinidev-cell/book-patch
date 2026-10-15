import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';
import { BookItem } from '../types/palle';
import { AffiliatePurchaseModal, AffiliateBookInfo } from '../components/AffiliatePurchaseModal';

export const LibraryView: React.FC = () => {
  const { libraryBooks, navigateTo, openAddResource, showToast } = usePalle();
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [affiliateModalBook, setAffiliateModalBook] = useState<AffiliateBookInfo | null>(null);

  const filteredBooks = libraryBooks.filter((book) => {
    if (filter === 'reading' && book.status !== 'reading') return false;
    if (filter === 'completed' && book.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = book.title.toLowerCase().includes(q);
      const matchAuthor = book.author.toLowerCase().includes(q);
      return matchTitle || matchAuthor;
    }
    return true;
  });

  const readingCount = libraryBooks.filter((b) => b.status === 'reading').length;
  const completedCount = libraryBooks.filter((b) => b.status === 'completed').length;

  const handleOpenBook = (book: BookItem) => {
    navigateTo('book-reader');
  };

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto px-4 pt-4 pb-28 gap-4">
      {/* Top Utility & Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-[#312620] tracking-tight">کتابخانه من</h1>
          <span className="text-xs text-[#6B6057]">مجموعه مراجع مطالعاتی و کتاب‌های همراه</span>
        </div>
        <button
          onClick={openAddResource}
          className="flex items-center gap-1.5 bg-[#483C35] hover:bg-[#312620] text-white px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>افزودن کتاب یا جزوه</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#6B6057]">
          <span className="material-symbols-outlined text-[18px]">search</span>
        </div>
        <input
          type="text"
          dir="rtl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو در کتاب‌ها و یادداشت‌ها..."
          className="w-full bg-[#FFFFFF] text-[#2E2621] pr-9 pl-9 py-2.5 rounded-xl text-xs border border-[#D5DAC8] placeholder:text-[#8D8177] focus:outline-none focus:border-[#483C35] transition-colors shadow-xs"
        />
        <button
          aria-label="فیلتر پیشرفته"
          onClick={() => setFilter(filter === 'all' ? 'reading' : filter === 'reading' ? 'completed' : 'all')}
          className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#6B6057] hover:text-[#312620]"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            filter === 'all'
              ? 'bg-[#483C35] text-white shadow-xs'
              : 'bg-[#EDEFE6] text-[#6B6057] hover:text-[#312620]'
          }`}
        >
          همه منابع ({libraryBooks.length})
        </button>
        <button
          onClick={() => setFilter('reading')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            filter === 'reading'
              ? 'bg-[#483C35] text-white shadow-xs'
              : 'bg-[#EDEFE6] text-[#6B6057] hover:text-[#312620]'
          }`}
        >
          در حال مطالعه ({readingCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
            filter === 'completed'
              ? 'bg-[#483C35] text-white shadow-xs'
              : 'bg-[#EDEFE6] text-[#6B6057] hover:text-[#312620]'
          }`}
        >
          پایان‌یافته ({completedCount})
        </button>
      </div>

      {/* Books Stream */}
      <div className="flex flex-col gap-3">
        {filteredBooks.map((book) => {
          const isCompleted = book.status === 'completed';
          return (
            <article
              key={book.id}
              className="relative flex flex-col bg-[#FFFFFF] rounded-2xl p-4 shadow-xs border border-[#E6E9DE] hover:shadow-sm transition-all"
            >
              <div className="flex gap-3.5 items-start">
                {/* Book Cover */}
                <div className="relative shrink-0 w-20 h-28 rounded-xl overflow-hidden shadow-xs bg-[#EDEFE6] border border-[#E6E9DE]">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className={`w-full h-full object-cover ${isCompleted ? 'grayscale-[30%]' : ''}`}
                  />
                  {isCompleted ? (
                    <div className="absolute inset-0 bg-[#312620]/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-[22px] filled">
                        check_circle
                      </span>
                    </div>
                  ) : (
                    <span className="absolute bottom-1 right-1 bg-[#312620]/80 text-white rounded px-1 text-[9px] font-bold">
                      {book.progressPercent}٪
                    </span>
                  )}
                </div>

                {/* Book Meta */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-[#EDEFE6] text-[#4E4540]'
                          : 'bg-[#FFDCC5] text-[#301400]'
                      }`}
                    >
                      {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-[#8F4E15] mr-1 animate-pulse"></span>}
                      {isCompleted ? 'پایان‌یافته' : 'در حال مطالعه'}
                    </span>
                    <button aria-label="گزینه‌ها" className="text-[#8D8177] hover:text-[#312620]">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </div>

                  <h2 className="font-bold text-xs text-[#312620] truncate leading-tight mb-0.5">
                    {book.title}
                  </h2>
                  <p className="text-[11px] text-[#6B6057] truncate mb-2">
                    {book.author}
                    {book.translator && ` • ترجمه ${book.translator}`}
                  </p>

                  {/* Attached Path Pill */}
                  {book.pathTitle && (
                    <div className="inline-flex items-center gap-1 w-fit bg-[#F5F7EE] px-2 py-0.5 rounded-md text-[10px] text-[#6B6057] border border-[#E6E9DE] mb-1">
                      <span className="material-symbols-outlined text-[13px] text-[#8F4E15]">alt_route</span>
                      <span>{book.pathTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar & Actions */}
              <div className="mt-2.5 pt-2 border-t border-[#E6E9DE]/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B6057]">پیشرفت خواندن</span>
                  <span className="text-[#312620] font-bold">
                    ص {book.currentPage} از {book.totalPages} ({book.progressPercent}٪)
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-[#EDEFE6] overflow-hidden">
                  <div
                    className="h-full bg-[#FDA868] rounded-full transition-all duration-500"
                    style={{ width: `${book.progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-[11px] text-[#6B6057]">
                    <span className="material-symbols-outlined text-[15px]">
                      {isCompleted ? 'draw' : 'schedule'}
                    </span>
                    <span>
                      {isCompleted ? `${book.notesCount} یادداشت ثبت شده` : `آخرین خواندن: ${book.lastRead}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenBook(book)}
                      className="flex items-center gap-1 bg-[#483C35] hover:bg-[#312620] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-xs active:scale-95"
                    >
                      <span>{isCompleted ? 'مرور خلاصه' : 'ادامه یادگیری'}</span>
                      <span className="material-symbols-outlined text-[15px] rotate-180">arrow_right_alt</span>
                    </button>

                    <button
                      onClick={() => setAffiliateModalBook({
                        title: book.title,
                        author: book.author,
                        translator: book.translator,
                        coverImage: book.coverImage,
                        discountCode: 'PALLE20',
                        discountPercent: 20,
                      })}
                      className="flex items-center gap-1 bg-[#FFDCC5] hover:bg-[#FDA868] text-[#301400] px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors shadow-xs active:scale-95"
                      title="خرید نسخه چاپی یا دیجیتال کامل با تخفیف اختصاصی پله"
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#8F4E15] filled">shopping_cart</span>
                      <span>تهیه نسخه کامل کتاب (با ۲۰٪ تخفیف)</span>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Tip Container */}
      <div className="mt-2 p-3.5 rounded-2xl bg-[#EDEFE6] flex items-start gap-3 border border-[#E6E9DE]">
        <div className="w-8 h-8 rounded-full bg-[#FFDCC5] flex items-center justify-center shrink-0 text-[#8F4E15]">
          <span className="material-symbols-outlined text-[18px] filled">lightbulb</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#312620]">همگام‌سازی با مسیرهای یادگیری</span>
          <p className="text-[11px] text-[#6B6057] leading-relaxed mt-0.5">
            با مطالعه هر بخش از کتاب‌های متصل به مسیر، نشانگر پله‌های مسیر یادگیری شما به شکل هوشمند گام‌به‌گام به پیش می‌رود.
          </p>
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
