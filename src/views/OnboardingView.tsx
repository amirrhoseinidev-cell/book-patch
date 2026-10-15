import React, { useState, useEffect } from 'react';
import { usePalle } from '../context/PalleContext';
import { SendOtpResponse } from '../services/api';
import { AvatarPicker, DEFAULT_AVATAR_URL } from '../components/AvatarPicker';

const APP_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1X-wSo11NCGzSbdcpKBVFtUGHscalLWyBVnf_KYEJsvdgCcNiZEVyBP56idfxfmTVQcYJforPJpHzJyw8klzmrmgp4dusWTvo2cUy8ZO5MSo038wm9SUFlKmiAUNppis8PE_KX1kSj5E2JjBBoMdFIDI_1yva5kzsCBvUFmATN5X5y8QppYpXrUo3RPR6-BkfmRQqab-dhAVkhY1AhDflh8XCUKDn6JwNASo7C5unx7jQADBtT4VWmn3ik';

export const OnboardingView: React.FC = () => {
  const { navigateTo, sendOtp, verifyOtp, showToast, startAsGuest } = usePalle();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Form Inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR_URL);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpInfo, setOtpInfo] = useState<SendOtpResponse | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const resetModal = () => {
    setStep('phone');
    setPhoneInput('');
    setOtpInput('');
    setNameInput('');
    setSelectedAvatar(DEFAULT_AVATAR_URL);
    setErrorMessage('');
    setOtpInfo(null);
    setResendCooldown(0);
  };

  const handleOpenAuth = (mode: 'register' | 'login') => {
    resetModal();
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (authMode === 'register' && !nameInput.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    if (!phoneInput.trim()) {
      setErrorMessage('لطفاً شماره تلفن همراه خود را وارد کنید.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendOtp(phoneInput.trim(), nameInput.trim(), authMode);
      setOtpInfo(res);
      setStep('otp');
      setResendCooldown(60);
      showToast(res.message, res.isDevMode ? 'info' : 'success');
      if (res.devOtp) {
        setOtpInput(res.devOtp);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ارسال کد تایید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpInput.trim() || otpInput.trim().length < 5) {
      setErrorMessage('لطفاً کد تایید ۶ رقمی را به صورت کامل وارد کنید.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtp(
        phoneInput.trim(),
        otpInput.trim(),
        nameInput.trim(),
        authMode === 'register' ? selectedAvatar : undefined
      );
      setShowAuthModal(false);
      resetModal();
      showToast(res.message || 'ورود با موفقیت انجام شد ✨');
    } catch (err: any) {
      setErrorMessage(err.message || 'کد تایید نادرست یا منقضی شده است.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F7EE] text-[#2E2621] px-4 py-5 max-w-md mx-auto justify-between">
      {/* Top Brand Pill & Skip */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="inline-flex items-center gap-2 bg-[#EDEFE6] px-3.5 py-1.5 rounded-full shadow-xs border border-[#E6E9DE]">
          <img alt="Palle App Logo" className="w-6 h-6 rounded-md object-contain shrink-0" src={APP_LOGO_URL} />
          <span className="font-bold text-xs text-[#312620]">پله</span>
          <span className="w-1 h-1 rounded-full bg-[#8D8177]"></span>
          <span className="text-[11px] text-[#6B6057]">یادگیری قدم به قدم</span>
        </div>

        <button
          onClick={() => handleOpenAuth('login')}
          className="text-xs font-semibold text-[#8F4E15] hover:text-[#312620] px-2 py-1"
        >
          ورود کاربران
        </button>
      </div>

      {/* Hero Vector Illustration (Preserved from Stitch Screen 14) */}
      <div className="relative w-full rounded-3xl bg-[#EDEFE6] p-5 flex flex-col items-center justify-center overflow-hidden mb-4 shadow-sm border border-[#E6E9DE]">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#FDA868]/20 blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#483C35]/5 blur-xl pointer-events-none"></div>

        <div className="relative w-full max-w-[280px] h-44 flex items-center justify-center">
          <svg className="w-full h-full drop-shadow-sm" fill="none" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="205" cy="46" fill="#fda868" fillOpacity="0.18" r="38"></circle>
            <circle cx="205" cy="46" fill="#fda868" fillOpacity="0.3" r="24"></circle>
            <circle cx="205" cy="46" fill="#fda868" r="14"></circle>
            <path d="M205 24V28M205 64V68M183 46H187M223 46H227M189 30L192 33M218 59L221 62M189 62L192 59M218 33L221 30" stroke="#773b01" strokeLinecap="round" strokeWidth="2.2"></path>
            <circle cx="205" cy="46" fill="#ffffff" r="5"></circle>
            <path d="M50 160 C 85 155, 110 120, 145 105 C 170 95, 185 70, 202 52" stroke="#fda868" strokeDasharray="4 4" strokeLinecap="round" strokeWidth="2"></path>

            {/* Step 1: Base Book Foundation */}
            <g transform="translate(36, 142)">
              <path d="M0 16C0 12 4 10 8 10H56C60 10 64 12 64 16V26C64 28 60 30 56 30H8C4 30 0 28 0 26V16Z" fill="#483c35"></path>
              <path d="M6 10H58V14H6V10Z" fill="#d5c3b9"></path>
              <path d="M3 16C3 14 6 12 9 12H61C64 12 67 14 67 16V23C67 25 64 27 61 27H9C6 27 3 25 3 23V16Z" fill="#e1e3db"></path>
              <path d="M67 17L70 19L67 21" stroke="#483c35" strokeLinecap="round" strokeWidth="1.5"></path>
              <rect fill="#483c35" fillOpacity="0.4" height="2.5" rx="1" width="22" x="12" y="18"></rect>
            </g>

            {/* Step 2: Middle Ascending Book Level */}
            <g transform="translate(98, 98)">
              <path d="M0 14C0 10 4 8 8 8H54C58 8 62 10 62 14V23C62 25 58 27 54 27H8C4 27 0 25 0 23V14Z" fill="#773b01"></path>
              <path d="M4 11H58V14H4V11Z" fill="#ffdcc5"></path>
              <path d="M4 14C4 11 8 9 12 9H58C62 9 66 11 66 14V21C66 23 62 25 58 25H12C8 25 4 23 4 21V14Z" fill="#ffffff"></path>
              <circle cx="16" cy="17" fill="#fda868" r="2.5"></circle>
              <rect fill="#4e4540" fillOpacity="0.3" height="2" rx="1" width="30" x="23" y="16"></rect>
            </g>

            {/* Step 3: High Peak Open Book */}
            <g transform="translate(154, 58)">
              <path d="M22 18C15 14 4 14 0 16V30C5 28 16 28 22 31C28 28 39 28 44 30V16C40 14 29 14 22 18Z" fill="#483c35"></path>
              <path d="M22 16C15 12 5 12 1 14V27C5 25 15 25 22 28C29 25 39 25 43 27V14C39 12 29 12 22 16Z" fill="#ffffff"></path>
              <path d="M22 16V28" stroke="#d1c4bd" strokeLinecap="round" strokeWidth="1.5"></path>
              <path d="M22 28V38L25 35L28 38V28" fill="#fda868"></path>
            </g>

            <path d="M72 74L74 70L76 74L80 76L76 78L74 82L72 78L68 76L72 74Z" fill="#fda868"></path>
            <circle cx="140" cy="48" fill="#8f4e15" fillOpacity="0.5" r="2"></circle>
            <circle cx="236" cy="88" fill="#fda868" r="2.5"></circle>
          </svg>
        </div>
      </div>

      {/* Headlines */}
      <div className="text-center px-2 mb-4">
        <h1 className="text-xl font-black text-[#312620] tracking-tight mb-1.5">
          یادگیری عمیق، پله به پله
        </h1>
        <p className="text-xs text-[#6B6057] leading-relaxed max-w-sm mx-auto">
          اهداف یادگیری‌ات را به مسیرهای گام‌به‌گام تبدیل کن، با کتاب‌های معتبر پیش برو و با دستیار هوشمند مفاهیم پیچیده را به زبان ساده بفهم.
        </p>
      </div>

      {/* Feature Value Pills */}
      <div className="flex flex-col gap-2 w-full mb-4">
        <div className="flex items-center gap-3 bg-[#FFFFFF] p-3 rounded-2xl shadow-xs border border-[#E6E9DE]">
          <div className="w-9 h-9 rounded-xl bg-[#FFDCC5] text-[#8F4E15] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg filled">stairs</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#312620]">احراز هویت و داده‌های پایدار</span>
            <span className="text-[11px] text-[#6B6057]">مسیرها، آزمون‌ها و پیشرفت در دیتابیس واقعی ذخیره می‌شوند</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#FFFFFF] p-3 rounded-2xl shadow-xs border border-[#E6E9DE]">
          <div className="w-9 h-9 rounded-xl bg-[#EDEFE6] text-[#312620] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg filled">menu_book</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#312620]">مطالعه هدفمند و متمرکز</span>
            <span className="text-[11px] text-[#6B6057]">تمرکز روی فصل‌های کلیدی کتاب‌های مرجع</span>
          </div>
        </div>
      </div>

      {/* Main Actions: Two Clear Options (Sign Up / Log In & Continue as Guest) */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Option 1: Sign Up / Log In */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => handleOpenAuth('register')}
            className="h-12 bg-[#483C35] hover:bg-[#312620] active:scale-[0.98] text-[#F5F7EE] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-base">how_to_reg</span>
            <span>ثبت‌نام (Sign Up)</span>
          </button>

          <button
            onClick={() => handleOpenAuth('login')}
            className="h-12 bg-[#FFFFFF] hover:bg-[#EDEFE6] active:scale-[0.98] text-[#312620] border border-[#D5DAC8] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-base text-[#8F4E15]">login</span>
            <span>ورود (Log In)</span>
          </button>
        </div>

        {/* Option 2: Continue as Guest */}
        <button
          onClick={startAsGuest}
          className="w-full h-12 bg-[#EDEFE6] hover:bg-[#FFDCC5] border-2 border-[#FDA868] active:scale-[0.98] text-[#312620] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-lg text-[#8F4E15]">rocket_launch</span>
          <span>شروع فوری یادگیری بدون ثبت‌نام (حالت مهمان)</span>
        </button>

        {/* Clear Communication on Guest Mode Storage */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8D8177] px-2 text-center mt-0.5">
          <span className="material-symbols-outlined text-[14px] shrink-0 text-[#8F4E15]">lock_clock</span>
          <span>در حالت مهمان، اطلاعات شما موقتاً در مرورگر نگهداری می‌شود و بدون اجازه به سرور آپلود نمی‌گردد.</span>
        </div>
      </div>

      {/* Auth Modal (Real Phone & OTP verification) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-[#D5DAC8] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E9DE] mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8F4E15] text-[20px]">
                  {step === 'phone' ? 'phone_iphone' : 'sms'}
                </span>
                <h3 className="text-sm font-bold text-[#312620]">
                  {step === 'phone'
                    ? authMode === 'register'
                      ? 'ثبت نام در پله'
                      : 'ورود به حساب کاربری'
                    : 'تایید شماره موبایل (OTP)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-[#8D8177] hover:text-[#312620] p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-[#FFDAD6]/50 border border-[#BA1A1A]/40 rounded-xl text-xs text-[#93000A] mb-3 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Phone & Name Input */}
            {step === 'phone' ? (
              <form onSubmit={handleSendCode} className="flex flex-col gap-3">
                {authMode === 'register' && (
                  <>
                    <AvatarPicker
                      selectedUrl={selectedAvatar}
                      onSelect={setSelectedAvatar}
                      label="تصویر نمایه (اختیاری)"
                    />
                    <div>
                      <label className="text-xs text-[#6B6057] block mb-1 font-semibold">
                        نام و نام خانوادگی:
                      </label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="مثال: پرهام نصیری"
                        className="w-full bg-[#F5F7EE] border border-[#D5DAC8] rounded-xl px-3 py-2.5 text-xs text-[#2E2621] outline-none focus:border-[#483C35]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs text-[#6B6057] block mb-1 font-semibold">
                    شماره تلفن همراه (برای دریافت کد تایید):
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="09123456789"
                    className="w-full bg-[#F5F7EE] border border-[#D5DAC8] rounded-xl px-3 py-2.5 text-xs text-[#2E2621] font-mono outline-none focus:border-[#483C35] text-left"
                  />
                  <span className="text-[10px] text-[#8D8177] mt-1 block">
                    کد تایید پیامکی ۶ رقمی به این شماره ارسال خواهد شد.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#483C35] hover:bg-[#312620] disabled:opacity-50 text-white rounded-xl text-xs font-bold mt-1 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>دریافت کد تایید پیامکی</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="flex justify-between items-center text-xs text-[#6B6057] pt-2 border-t border-[#E6E9DE] mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'register' ? 'login' : 'register');
                      setErrorMessage('');
                    }}
                    className="text-[#8F4E15] font-semibold hover:underline"
                  >
                    {authMode === 'register' ? 'قبلاً ثبت نام کرده‌اید؟ ورود' : 'حساب ندارید؟ ثبت نام جدید'}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: OTP Verification */
              <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
                {/* Dev Mode Banner (Clearly explains why test code is given) */}
                {otpInfo?.isDevMode && (
                  <div className="p-3 bg-[#FFDCC5]/60 border border-[#FDA868] rounded-xl text-xs text-[#301400] flex flex-col gap-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">build_circle</span>
                      <span>حالت آزمایشی توسعه (Dev Mode)</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#703700]">
                      کلید سرویس پیامک (SMS_PROVIDER_API_KEY) در سرور تنظیم نشده است. کد تایید موقت برای شماره شما:
                    </p>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-[#FDA868]/40 mt-0.5">
                      <span className="font-mono font-bold text-sm text-[#312620] tracking-widest">
                        {otpInfo.devOtp}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (otpInfo.devOtp) setOtpInput(otpInfo.devOtp);
                        }}
                        className="text-[10px] bg-[#483C35] text-white px-2 py-1 rounded font-bold hover:bg-[#312620]"
                      >
                        درج خودکار کد
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-[#6B6057] font-semibold">
                      کد تایید ۶ رقمی پیامک‌شده:
                    </label>
                    <span className="text-[11px] font-mono text-[#8F4E15]">{phoneInput}</span>
                  </div>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-[#F5F7EE] border border-[#D5DAC8] rounded-xl px-3 py-2.5 text-center font-mono font-bold text-base tracking-widest text-[#2E2621] outline-none focus:border-[#483C35]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#483C35] hover:bg-[#312620] disabled:opacity-50 text-white rounded-xl text-xs font-bold mt-1 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  ) : (
                    <>
                      <span>تایید و ورود به پله</span>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </>
                  )}
                </button>

                {/* Resend OTP with cooldown timer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={() => handleSendCode()}
                    className={`font-semibold transition-colors ${
                      resendCooldown > 0
                        ? 'text-[#8D8177] cursor-not-allowed'
                        : 'text-[#8F4E15] hover:underline'
                    }`}
                  >
                    {resendCooldown > 0
                      ? `ارسال مجدد کد (${resendCooldown} ثانیه)`
                      : 'ارسال مجدد کد تایید'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[#6B6057] hover:text-[#312620]"
                  >
                    ویرایش شماره
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
