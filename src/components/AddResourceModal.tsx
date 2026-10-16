import React, { useState } from 'react';
import { usePalle } from '../context/PalleContext';

interface SuggestionBook {
  id: string;
  title: string;
  author: string;
  translator?: string;
  badge: string;
  sub: string;
  editionBadge: string;
  coverImage: string;
}

const MATCHED_RESOURCES: SuggestionBook[] = [
  {
    id: 'res-1',
    title: 'رساله آپولوژی و لاخس',
    author: 'افلاطون',
    translator: 'ترجمه محمدعلی فروغی',
    badge: 'منبع تطبیقی پله ۳',
    sub: '۱۲ بخش مطالعه',
    editionBadge: 'چاپ اول',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDckLkCDMBzDeQAbN5ujnE38EaOGUh4sctKKjUwocObV1qPEgVQSaI9_ElNHPdzHSop48PM9vc8JLVbQIdKXwy_N6WcXuVon_2ta9Z6bZEzE6b7KWQxBGMIaSvOJp12NZctvBuSZ49Fj6EjzNz1fQXNxBAghlm-mpAo8hBwBJEQq_R-MQdI2tA0ULUyhokQJk1LOE8avMHlcDYYhUL9UZ9TE1svN_G4FaF89CSaJZzilwkxI058aAcn',
  },
  {
    id: 'res-2',
    title: 'تاریخ فلسفه غرب (جلد ۱)',
    author: 'برتراند راسل',
    badge: 'منبع عمومی مسیر',
    sub: '۳۲ مبحث',
    editionBadge: 'جلد ۱',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA1-znHT7hOm9FTSz6YwDOvOH3-QSjjwFiB8NuYWQInM7k8ue8Y0BQiFNumRQ381-50wW-Shwl-ahSmYI8gHW7BMZgATuR-W8aC4cGFo072Vf5x-6Yka38Fs2I5z5w1l2-lrsogrPRH0QN353dedtzIWeJ6vkZc1QKTqWvggW15W5I0OnGjuGs2dXLDPBoAsVVch6EOpd4tCWfj-Oeid6mJgraUdMlHYReSAwYyVrdTmb8AbLaALjvJ',
  },
  {
    id: 'res-3',
    title: 'سیر حکمت در اروپا',
    author: 'محمدعلی فروغی',
    badge: 'مرجع کمکی',
    sub: '۴۵۰ صفحه خلاصه',
    editionBadge: 'کامل',
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBOv7C9WyXSXvR8943zTv8xHJGcxuqMhdP2eQJMdEFc2DlQ0HZVT9mkEkgOjU0HaedAhN6SzWc5_wRCL9i4MObgCqLiX_ld3LHD-DOj912plaYbMKRISzJ9qQ-WyVOIpzZ6AimYoejndu0mnGvkgVLU23mMbbIJd_ADz56Jk7lR-tXIZ2X8fH6xOC73AwE8TV-cXYl8-PCj9Z7nJtbOGJHutA-YJQf8honcwAsLU6xH1Jwr1YvVBkuJ',
  },
];

export const AddResourceModal: React.FC = () => {
  const { isAddResourceOpen, closeAddResource, addBookToLibrary, activePath, showToast } = usePalle();
  const [activeTab, setActiveTab] = useState<'search' | 'upload'>('search');
  const [selectedId, setSelectedId] = useState<string>('res-1');
  const [searchVal, setSearchVal] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isAddResourceOpen) return null;

  const handleConfirm = async () => {
    setIsAdding(true);
    const chosen = MATCHED_RESOURCES.find((r) => r.id === selectedId) || MATCHED_RESOURCES[0];

    await addBookToLibrary({
      title: chosen.title,
      author: chosen.author,
      translator: chosen.translator,
      coverImage: chosen.coverImage,
      pathId: activePath?.id,
      pathTitle: activePath ? `مسیر: ${activePath.title}` : undefined,
      totalPages: 120,
      summary: chosen.badge,
    });

    setIsAdding(false);
    closeAddResource();
  };

  const handleFileUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`فایل «${file.name}» بارگذاری و پردازش شد ✓`);
      addBookToLibrary({
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: 'فایل شخصی بارگذاری شده',
        coverImage:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBh2oQ1S2rSRrjanmYlIrR513QKCp3PpuQ-Po8YlDa0Yp6RSCIMMql3lU7giYaiEnliiIeZY7GiCKHWrvQ7d_aCn5V_x6G0B-9tmgI1r-YAryZ4FfYFrNsHgBHh46BibWvAZoNFNcRLy0jhlFBuNzoxydVfKjDnBVp-i47NGLYyVJcWWoxrIv0pW4YA_vtBIABGVoMMSvvimt0XS5zo9FUdohRiaDZ7JcuGNvakIZMo6DmHPpTF4Nys',
        totalPages: 40,
        summary: 'سند شخصی استخراج شده با هوش مصنوعی پله',
      });
      closeAddResource();
    }
  };

  return (
    <div
      onClick={closeAddResource}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#191D17]/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F5F7EE] w-full max-w-xl max-h-[94vh] sm:h-[90vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#D5DAC8] animate-bottom-sheet sm:animate-in sm:zoom-in-95"
      >
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div
          onClick={closeAddResource}
          className="w-full pt-2.5 pb-1 flex justify-center items-center cursor-pointer sm:hidden bg-[#EDEFE6]"
        >
          <div className="w-12 h-1.5 rounded-full bg-[#D5DAC8]"></div>
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-[#EDEFE6] border-b border-[#E6E9DE] flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#8F4E15] font-bold">پله‌های یادگیری شما</span>
            <h2 className="text-sm sm:text-base font-bold text-[#312620]">افزودن منبع به پله</h2>
          </div>
          <button
            onClick={closeAddResource}
            className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#312620] hover:bg-[#F2F5EC] active:scale-90 transition-transform shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="p-3 bg-[#F5F7EE]">
          <div className="flex p-1 bg-[#EDEFE6] rounded-xl gap-1 border border-[#E6E9DE]">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'search'
                  ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                  : 'text-[#6B6057] hover:text-[#312620]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>جستجو در فهرست مراجع</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-[#FFFFFF] text-[#312620] shadow-xs'
                  : 'text-[#6B6057] hover:text-[#312620]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>بارگذاری فایل متنی</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-4">
          {activeTab === 'search' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B6057]">
                  نام کتاب، نویسنده یا کلیدواژه
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    dir="rtl"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="مثلاً: تاریخ فلسفه غرب یا برتراند راسل"
                    className="w-full bg-[#FFFFFF] text-[#2E2621] text-xs py-3 pr-9 pl-4 rounded-xl border border-[#D5DAC8] shadow-xs focus:outline-none focus:border-[#483C35]"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8D8177]">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FDA868]"></span>
                  <h3 className="font-bold text-xs text-[#312620]">پیشنهادهای تطبیقی با مسیر شما</h3>
                </div>
                <span className="text-[10px] text-[#6B6057] bg-[#EDEFE6] px-2 py-0.5 rounded-full font-bold">
                  ۳ منبع برتر
                </span>
              </div>

              {/* Resource Cards */}
              <div className="flex flex-col gap-2.5">
                {MATCHED_RESOURCES.map((item) => {
                  const isSelected = selectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`cursor-pointer p-3.5 rounded-2xl transition-all shadow-xs flex items-start gap-3 border ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-[#483C35] ring-2 ring-[#483C35]'
                          : 'bg-[#FFFFFF]/80 border-[#E6E9DE] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="relative shrink-0 w-16 h-22 rounded-xl overflow-hidden bg-[#EDEFE6] border border-[#E6E9DE]">
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-1 right-1 bg-[#312620]/80 rounded px-1 text-[9px] text-white font-bold">
                          {item.editionBadge}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 h-20">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-xs text-[#312620] truncate">{item.title}</h4>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#FDA868] text-[#301400]' : 'bg-[#EDEFE6] text-[#8D8177]'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[15px] font-bold">
                                {isSelected ? 'check' : 'add'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6B6057] mt-0.5 truncate">
                            {item.author} {item.translator && `• ${item.translator}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#FFDCC5] text-[#301400] font-bold">
                            <span className="material-symbols-outlined text-[13px]">verified</span>
                            {item.badge}
                          </span>
                          <span className="text-[10px] text-[#8D8177]">{item.sub}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Upload Section */
            <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-xs border border-[#E6E9DE] flex flex-col items-center text-center my-auto">
              <div className="w-14 h-14 rounded-full bg-[#FFDCC5] flex items-center justify-center text-[#8F4E15] mb-3">
                <span className="material-symbols-outlined text-[30px]">cloud_upload</span>
              </div>
              <h3 className="font-bold text-sm text-[#312620]">آپلود کتاب الکترونیکی شخصی</h3>
              <p className="text-xs text-[#6B6057] mt-1 max-w-xs leading-relaxed">
                فایل‌های PDF یا ePub یا یادداشت‌های متنی را از دستگاه خود انتخاب نمایید تا پله آن را پردازش کند.
              </p>
              <label className="mt-4 px-4 py-2.5 bg-[#EDEFE6] hover:bg-[#E1E3DB] text-[#312620] text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 border border-[#E6E9DE]">
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                <span>انتخاب فایل از دستگاه</span>
                <input type="file" accept=".pdf,.epub,.txt" onChange={handleFileUploadMock} className="hidden" />
              </label>
              <span className="text-[10px] text-[#8D8177] mt-2">حداکثر حجم قابل پذیرش: ۵۰ مگابایت</span>
            </div>
          )}

          {/* Copyright Warning Card */}
          <div className="bg-[#EDEFE6] rounded-2xl p-3.5 shadow-xs flex items-start gap-2.5 border border-[#E6E9DE]">
            <div className="w-6 h-6 rounded-full bg-[#FDA868]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#8F4E15]">
              <span className="material-symbols-outlined text-[16px] filled">info</span>
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-[#6B6057] leading-relaxed">
                <strong className="font-bold text-[#312620]">توجه پیرامون حقوق معنوی:</strong> پله برای کتاب‌های دارای کپی‌رایت تنها گزیده‌ها، نقشه‌های مفهومی و پرسش‌های ادراکی ارائه می‌دهد. شما همواره می‌توانید فایل شخصی خود را بارگذاری فرمایید.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Confirmation CTA */}
        <div className="p-3 bg-[#F5F7EE] border-t border-[#E6E9DE] flex flex-col gap-1.5 pb-safe">
          <button
            onClick={handleConfirm}
            disabled={isAdding}
            className="w-full h-12 py-3 px-6 rounded-2xl bg-[#483C35] hover:bg-[#312620] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <span>{isAdding ? 'در حال افزودن...' : 'افزودن به کتابخانه من'}</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <div className="text-center">
            <span className="text-[10px] text-[#8D8177]">ذخیره خودکار در نشانک‌های همگام‌سازی‌شده</span>
          </div>
        </div>
      </div>
    </div>
  );
};
