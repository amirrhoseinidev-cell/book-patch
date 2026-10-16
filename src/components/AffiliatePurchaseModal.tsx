import React, { useState } from 'react';

export interface AffiliateBookInfo {
  title: string;
  author: string;
  translator?: string;
  chapter?: string;
  coverImage?: string;
  discountCode?: string;
  discountPercent?: number;
  affiliateUrl?: string;
  priceNote?: string;
}

interface AffiliatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: AffiliateBookInfo | null;
  onCopyDiscount?: (code: string) => void;
}

export const AffiliatePurchaseModal: React.FC<AffiliatePurchaseModalProps> = ({
  isOpen,
  onClose,
  book,
  onCopyDiscount,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !book) return null;

  const discountCode = book.discountCode || 'PALLE20';
  const discountPercent = book.discountPercent || 20;

  const handleCopy = () => {
    navigator.clipboard?.writeText(discountCode);
    setCopied(true);
    onCopyDiscount?.(discountCode);
    setTimeout(() => setCopied(false), 2500);
  };

  const storePartners = [
    {
      name: 'طاقچه (Taaghche)',
      format: 'نسخه الکترونیک و صوتی',
      badge: 'تحویل آنی',
      url: book.affiliateUrl || `https://taaghche.com/search?terms=${encodeURIComponent(book.title)}&utm_source=palle&utm_medium=affiliate&utm_campaign=learning_path`,
      color: 'bg-[#2E7D32]/10 text-[#2E7D32]',
    },
    {
      name: 'فیدیبو (Fidibo)',
      format: 'کتابخوان قانونی و متن کامل',
      badge: 'نسخه رسمی ناشر',
      url: `https://fidibo.com/search?q=${encodeURIComponent(book.title)}&utm_source=palle_partner`,
      color: 'bg-[#00838F]/10 text-[#00838F]',
    },
    {
      name: 'ایران‌کتاب / دیجی‌کالا',
      format: 'نسخه چاپی جلد شومیز یا گالینگور',
      badge: 'ارسال پستی سراسری',
      url: `https://www.iranketab.ir/search?query=${encodeURIComponent(book.title)}`,
      color: 'bg-[#C2185B]/10 text-[#C2185B]',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#191D17]/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl p-5 w-full max-w-md shadow-2xl border border-[#D5DAC8] relative flex flex-col gap-3.5 animate-bottom-sheet sm:animate-in sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto no-scrollbar pb-safe"
      >
        {/* Mobile Drag Handle */}
        <div
          onClick={onClose}
          className="w-full pt-0 pb-1 flex justify-center items-center cursor-pointer sm:hidden"
        >
          <div className="w-12 h-1.5 rounded-full bg-[#D5DAC8]"></div>
        </div>

        {/* Header with Close */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E6E9DE]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8F4E15] text-[22px] filled">
              shopping_bag
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-[#312620]">تهیه نسخه کامل کتاب</h3>
              <span className="text-[10px] text-[#6B6057]">لینک همکاری در فروش با تخفیف ویژه پله</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-[#EDEFE6] hover:bg-[#E1E3DB] flex items-center justify-center text-[#312620] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Book Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F7EE] border border-[#E6E9DE]">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-16 h-22 rounded-xl object-cover shadow-xs border border-[#E6E9DE] shrink-0"
            />
          ) : (
            <div className="w-16 h-22 rounded-xl bg-[#EDEFE6] flex items-center justify-center shrink-0 text-[#8F4E15]">
              <span className="material-symbols-outlined text-[28px]">menu_book</span>
            </div>
          )}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-[#8F4E15] font-bold">کتاب مرجع منتخب این پله</span>
            <h4 className="font-bold text-xs text-[#312620] leading-snug truncate mt-0.5">
              {book.title}
            </h4>
            <p className="text-[11px] text-[#6B6057] truncate mt-0.5">
              {book.author} {book.translator ? `• ترجمه ${book.translator}` : ''}
            </p>
            {book.chapter && (
              <span className="text-[10px] text-[#8D8177] mt-1 font-medium truncate">
                فصل منطبق با درس: {book.chapter}
              </span>
            )}
          </div>
        </div>

        {/* Special Discount Coupon Pill */}
        <div className="p-3.5 rounded-2xl bg-[#FFDCC5]/70 border border-[#FDA868] flex items-center justify-between gap-2 shadow-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#703700] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#8F4E15] filled">redeem</span>
              <span>کد تخفیف {discountPercent}٪ اختصاصی همراهان پله</span>
            </span>
            <span className="text-[10px] text-[#8F4E15] mt-0.5 font-mono">
              در درگاه خرید وارد کنید تا تخفیف فوری اعمال شود
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-[#483C35] hover:bg-[#312620] text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95 transition-all"
          >
            <span>{copied ? 'کپی شد ✓' : discountCode}</span>
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'done' : 'content_copy'}
            </span>
          </button>
        </div>

        {/* Micro-learning Note (Emphasizing they don't have to buy to learn!) */}
        <div className="p-2.5 rounded-xl bg-[#EDEFE6] text-[11px] text-[#4E4540] flex items-start gap-2">
          <span className="material-symbols-outlined text-[#8F4E15] text-[18px] shrink-0 mt-0.5">
            tips_and_updates
          </span>
          <p className="leading-relaxed">
            <span className="font-bold text-[#312620]">توجه:</span> پله خلاصه‌های جامع و مفهومی هر درس را مستقیماً در اختیار شما قرار می‌دهد تا بدون نیاز به خرید یا مطالعه کل کتاب، مفهوم اصلی را به سرعت بیاموزید. این پیوندها برای کسانی است که مایل به مطالعه نسخه تفصیلی و آرشیو کتاب هستند.
          </p>
        </div>

        {/* Store Partner Options */}
        <div className="flex flex-col gap-2 mt-1">
          <span className="text-xs font-bold text-[#312620]">انتخاب فروشگاه همکار جهت خرید:</span>

          {storePartners.map((store, i) => (
            <a
              key={i}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#FFFFFF] hover:bg-[#F5F7EE] border border-[#E6E9DE] hover:border-[#FDA868] transition-all shadow-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#EDEFE6] flex items-center justify-center text-[#312620] shrink-0 group-hover:bg-[#483C35] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[18px]">storefront</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#312620]">{store.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${store.color}`}>
                      {store.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6B6057] truncate mt-0.5">{store.format}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#8F4E15] shrink-0">
                <span>ورود به فروشگاه</span>
                <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
                  arrow_back
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Affiliate Transparency Footer */}
        <div className="pt-2 border-t border-[#E6E9DE] flex items-center justify-between text-[10px] text-[#8D8177]">
          <span>🔗 همکاری در فروش رسمی پله (Affiliate Program)</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#6B6057] hover:text-[#312620] px-2 py-1"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
