import React, { useState, useEffect } from 'react';
import { usePalle } from '../context/PalleContext';
import { SendOtpResponse } from '../services/api';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    sendOtp,
    verifyOtp,
    loginWithDemo,
    demoAccounts,
    showToast,
    isGuest,
  } = usePalle();

  const [mode, setMode] = useState<'register' | 'login'>(authModalMode || 'register');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // Inputs
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpInfo, setOtpInfo] = useState<SendOtpResponse | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(authModalMode || 'register');
  }, [authModalMode]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('phone');
      setPhoneInput('');
      setOtpInput('');
      setNameInput('');
      setErrorMessage('');
      setOtpInfo(null);
      setResendCooldown(0);
    }
  }, [isAuthModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) {
    return null;
  }

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (mode === 'register' && !nameInput.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی خود را وارد کنید.');
      return;
    }

    if (!phoneInput.trim()) {
      setErrorMessage('لطفاً شماره تلفن همراه خود را وارد کنید.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await sendOtp(phoneInput.trim(), nameInput.trim(), mode);
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
      setErrorMessage('لطفاً کد تایید ۶ رقمی را وارد کنید.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtp(phoneInput.trim(), otpInput.trim(), nameInput.trim());
      closeAuthModal();
      showToast(
        isGuest
          ? 'حساب شما ایجاد شد و پیشرفت حالت مهمان با موفقیت منتقل گردید ✨'
          : res.message || 'ورود با موفقیت انجام شد ✨'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'کد تایید نادرست یا منقضی شده است.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = async (demoId: string) => {
    closeAuthModal();
    await loginWithDemo(demoId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#191D17]/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-[#D5DAC8] animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E9DE] mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8F4E15] text-[20px]">
              {step === 'phone' ? 'phone_iphone' : 'sms'}
            </span>
            <h3 className="text-sm font-bold text-[#312620]">
              {step === 'phone'
                ? mode === 'register'
                  ? 'ثبت نام و ذخیره پیشرفت'
                  : 'ورود به حساب کاربری'
                : 'تایید شماره موبایل (OTP)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-[#8D8177] hover:text-[#312620] p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Guest Progress Notice */}
        {isGuest && step === 'phone' && (
          <div className="p-2.5 bg-[#F5F7EE] border border-[#E6E9DE] rounded-xl text-[11px] text-[#6B6057] mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">sync</span>
            <span>تمام مسیرها و پله‌های مطالعه‌شده به حساب جدید شما متصل خواهند شد.</span>
          </div>
        )}

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
            {mode === 'register' && (
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
            )}

            <div>
              <label className="text-xs text-[#6B6057] block mb-1 font-semibold">
                شماره تلفن همراه (برای ارسال پیامک کد):
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
                  setMode(mode === 'register' ? 'login' : 'register');
                  setErrorMessage('');
                }}
                className="text-[#8F4E15] font-semibold hover:underline"
              >
                {mode === 'register' ? 'حساب دارید؟ ورود' : 'حساب ندارید؟ ثبت نام جدید'}
              </button>
            </div>
          </form>
        ) : (
          /* STEP 2: OTP Verification */
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
            {/* Dev Mode Banner */}
            {otpInfo?.isDevMode && (
              <div className="p-3 bg-[#FFDCC5]/60 border border-[#FDA868] rounded-xl text-xs text-[#301400] flex flex-col gap-1.5 shadow-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="material-symbols-outlined text-[16px] text-[#8F4E15]">build_circle</span>
                  <span>حالت آزمایشی توسعه (Dev Mode)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#703700]">
                  کلید سرویس پیامک در سرور تعریف نشده است؛ کد تولیدشده برای این شماره:
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
                  <span>تایید و ذخیره دائمی</span>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </>
              )}
            </button>

            {/* Resend OTP */}
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
  );
};
