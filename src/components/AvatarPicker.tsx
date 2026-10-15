import React from 'react';

export interface PredefinedAvatar {
  id: string;
  name: string;
  url: string;
}

export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  {
    id: 'neutral-default',
    name: 'پیش‌فرض خنثی',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtMRMFHuRHam_9gaPhw-p0_8C8lFJBjY-CrUcgufKp7x53yKh4JO4mTdbf4igPuTTxTAzuZ19VQHkIYu6hwBlzNgqaKxgG5Z5EM4YqsZxxGBzOoo_RgNzE_B8aHGO1MJe9ZMqiRc2axJLYOoGEpSP7gsQ9GojfIPRltmQPnO3yfIHoVKNaWZYjZcnrS8NDZ955vGpBHZn52vlrQngsZhIkEJ1LPXD4PghaeNUT5nJLGxf1qSiHkNCW',
  },
  {
    id: 'scholar-sage',
    name: 'پژوهشگر',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACpj0OiXe-CyIMsSbsMzgb7v-qHca9NEaJPynWisixxXLnLRwDDqXf7xC2Bu6QZHMAu7VaplOXdwSlUHtptQPfvO-SOGv5Clw0kQ3DuXSTCRLO8kUWdIFXxDnqsuQBiVhm5ryXPccZFx4PhU0j_Nvbz67rVHu6xZWyuwSKu1QdJ8aZtyXZ412wYcZEnA7berOdzls10vPbMJChlz94QOEH4HQEV-D0da0i3zyDeok818Iyq5fvCozf',
  },
  {
    id: 'creative-thinker',
    name: 'طراح خلاق',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKxT9wUS3Fyl7misfLJDw9w-FymL13yuNvAW6drqewDccgAPcf251hk2Ddx8wU5U-IoZzo3CFWzRWqTejJ1_1SauFpfks4tokP7IDaRnJAimH9eP9DFgGP-9vCECV1JXv89oxBSFnxwY17FtG4aCDh46TYt1-iuQoacTO8wtsqQTJTuKlQxpxM76xHvbibeKXCL0zbmOGFre7z2fnggkK7KcCl8H0YuzK_mi8hjeVnFPNnH0YZEbAF',
  },
  {
    id: 'philosophy-seeker',
    name: 'جستجوگر خرد',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OrggS_rJDzfTNhTqXk5DcoNaApp79rk_UgkAYdsY5kPLu2OhTSoAC862NcpX5_JilhKtVdnIEB_llu_ifmxq5nVLrJYozRIV3dSmXiDcSFUgYcijZHCcX8xSEvC7JDKOZSjITETXfFPuFtZHTYywAkmGxhbIZgGdJMl_ZmFqESgNEnknD9amWVdkhkzCxVXk_g7JfCVojSunNH_v8KWKrOQBKCmoVQVhke9hndrwq4G24mOuip8x',
  },
  {
    id: 'deep-reader',
    name: 'کتاب‌خوان عمیق',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA1-znHT7hOm9FTSz6YwDOvOH3-QSjjwFiB8NuYWQInM7k8ue8Y0BQiFNumRQ381-50wW-Shwl-ahSmYI8gHW7BMZgATuR-W8aC4cGFo072Vf5x-6Yka38Fs2I5z5w1l2-lrsogrPRH0QN353dedtzIWeJ6vkZc1QKTqWvggW15W5I0OnGjuGs2dXLDPBoAsVVch6EOpd4tCWfj-Oeid6mJgraUdMlHYReSAwYyVrdTmb8AbLaALjvJ',
  },
  {
    id: 'modern-explorer',
    name: 'کاشف نوین',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZwvUoAeHukBlEy-GdIxBgWKojxlbyVDxiZoM8_itjsLEjEyREVt8TxAKygnbs5mSZMMWL67-xV8y4vgRgv1BThILgbTKDNKGI3MaVY7HMO7BM9dxTzCFmf6O5QdUnvIXrRgcy9qfntjvGdcUVFnruzZggKTw8dUzmnYzO52wboDK_oYe_3OJGVsgbWH9MY9dNWhIBbA8feVuLkJOzTc_B2pDr2soCPI7tLJLjorPWQ5GvU5dvgiI3',
  },
];

export const DEFAULT_AVATAR_URL = PREDEFINED_AVATARS[0].url;

interface AvatarPickerProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
  label?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedUrl,
  onSelect,
  label = 'تصویر نمایه (اختیاری)',
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs text-[#6B6057] font-semibold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">face</span>
          <span>{label}</span>
        </label>
        <span className="text-[10px] text-[#8D8177]">
          {selectedUrl === DEFAULT_AVATAR_URL ? 'آواتار پیش‌فرض خنثی' : 'انتخاب شده'}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2 p-2 bg-[#F5F7EE] rounded-2xl border border-[#D5DAC8]">
        {PREDEFINED_AVATARS.map((avatar) => {
          const isSelected = selectedUrl === avatar.url;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.url)}
              className={`relative rounded-full aspect-square p-0.5 transition-all active:scale-95 flex items-center justify-center outline-none ${
                isSelected
                  ? 'ring-2 ring-[#483C35] ring-offset-2 ring-offset-[#F5F7EE] scale-105 shadow-xs'
                  : 'opacity-70 hover:opacity-100 hover:scale-102'
              }`}
              title={avatar.name}
              aria-label={avatar.name}
            >
              <img
                src={avatar.url}
                alt={avatar.name}
                className="w-full h-full rounded-full object-cover bg-white"
              />
              {isSelected && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#483C35] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
