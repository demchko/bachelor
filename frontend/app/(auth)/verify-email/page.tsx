'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const VERIFY_EMAIL_STORAGE_KEY = 'irb_verify_pending_email';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  if (!local || local.length <= 2) return `**@${domain}`;
  return `${local.slice(0, 2)}•••@${domain}`;
}

type Phase =
  | 'boot'
  | 'verifying'
  | 'post-register-hint'
  | 'error-recovery'
  | 'manual-email';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const [phase, setPhase] = useState<Phase>('boot');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendNotice, setResendNotice] = useState('');
  const [manualEmail, setManualEmail] = useState('');

  const pendingVerifyRef = useRef<{ email: string; token: string } | null>(null);
  const verifyStartedRef = useRef(false);
  const layoutInitDoneRef = useRef(false);

  const [contextEmail, setContextEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) ?? '';
  });

  const syncStorageEmail = useCallback((email: string) => {
    setContextEmail(email);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(VERIFY_EMAIL_STORAGE_KEY, email);
    }
  }, []);

  const clearStorageEmail = useCallback(() => {
    setContextEmail('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(VERIFY_EMAIL_STORAGE_KEY);
    }
  }, []);

  /** Один прохід: читаємо query (під час першого mount ще є token у URL), потім прибираємо з адресного рядка. */
  useLayoutEffect(() => {
    if (layoutInitDoneRef.current) return;
    layoutInitDoneRef.current = true;

    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams(searchParams.toString());

    const token = params.get('token');
    const emailParam = params.get('email');

    if (token && emailParam) {
      const email = decodeURIComponent(emailParam).trim().toLowerCase();
      pendingVerifyRef.current = { email, token };
      verifyStartedRef.current = false;
      syncStorageEmail(email);
      setManualEmail(email);
      setPhase('verifying');
      router.replace('/verify-email', { scroll: false });
      return;
    }

    if (emailParam && !token) {
      const email = decodeURIComponent(emailParam).trim().toLowerCase();
      syncStorageEmail(email);
      setManualEmail(email);
      setPhase('post-register-hint');
      router.replace('/verify-email', { scroll: false });
      return;
    }

    const stored = typeof window !== 'undefined' ? sessionStorage.getItem(VERIFY_EMAIL_STORAGE_KEY) : null;
    if (stored) {
      setContextEmail(stored);
      setManualEmail(stored);
    }
    setPhase('manual-email');
  }, [router, searchParams, syncStorageEmail]);

  useEffect(() => {
    if (phase !== 'verifying') return;

    const pending = pendingVerifyRef.current;
    if (!pending || verifyStartedRef.current) return;

    verifyStartedRef.current = true;
    setErrorMessage('');

    verifyEmail(pending.email, pending.token)
      .then(() => {
        pendingVerifyRef.current = null;
        clearStorageEmail();
        router.push('/login?verified=1');
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Не вдалося підтвердити email';
        setErrorMessage(msg);
        setPhase('error-recovery');
      });
  }, [phase, verifyEmail, router, clearStorageEmail]);

  useEffect(() => {
    if (contextEmail) setManualEmail((prev) => prev || contextEmail);
  }, [contextEmail]);

  const handleResend = async (emailOverride?: string) => {
    const email = (emailOverride ?? contextEmail).trim().toLowerCase();
    if (!email) {
      setErrorMessage('Спочатку введіть email.');
      return;
    }
    syncStorageEmail(email);
    setResendNotice('');
    setErrorMessage('');
    setResendLoading(true);
    try {
      const res = await resendVerification(email);
      setResendNotice(res.message ?? 'Лист надіслано.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Не вдалося надіслати лист');
    } finally {
      setResendLoading(false);
    }
  };

  const registerHref =
    contextEmail ? `/register?email=${encodeURIComponent(contextEmail)}` : '/register';

  if (phase === 'boot') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center text-gray-600">
        Завантаження…
      </div>
    );
  }

  if (phase === 'verifying') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Підтверджуємо email…</h1>
        <p className="text-gray-500 text-sm">Посилання з листа обробляється автоматично.</p>
      </div>
    );
  }

  if (phase === 'post-register-hint') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
          ← Повернутись до входу
        </Link>

        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Перевірте пошту</h1>
        <p className="text-gray-600 text-sm mb-6">
          Ми надіслали лист на <strong className="text-gray-900">{maskEmail(contextEmail)}</strong>. Відкрийте
          посилання в листі — акаунт активується автоматично, без введення коду вручну.
        </p>

        {resendNotice && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {resendNotice}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resendLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-60"
          >
            {resendLoading ? 'Надсилання…' : 'Надіслати лист повторно'}
          </button>
          <Link
            href={registerHref}
            className="w-full text-center border border-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            Зареєструватися з іншим email
          </Link>
          <p className="text-center text-sm text-gray-600">
            Вже активували?{' '}
            <Link href="/login" className="text-orange-600 font-medium hover:text-orange-700">
              Увійти
            </Link>
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Для скидання пароля спочатку активуйте акаунт через лист або скористайтесь «Забули пароль» на сторінці входу.
          </p>
        </div>
      </div>
    );
  }

  if (phase === 'error-recovery') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
          ← Повернутись до входу
        </Link>

        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Не вдалося за посиланням</h1>
        <p className="text-gray-600 text-sm mb-4">
          Адреса: <strong>{maskEmail(contextEmail)}</strong>
        </p>
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 whitespace-pre-wrap">
          {errorMessage}
        </div>

        {resendNotice && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {resendNotice}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void handleResend()}
            disabled={resendLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-60"
          >
            {resendLoading ? 'Надсилання…' : 'Надіслати новий лист активації'}
          </button>
          <Link
            href={registerHref}
            className="w-full text-center border border-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition"
          >
            Зареєструватися знову
          </Link>
          <Link
            href="/forgot-password"
            className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2"
          >
            Забули пароль? (на сторінці входу — після активації акаунта)
          </Link>
        </div>
      </div>
    );
  }

  // manual-email
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
      <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1">
        ← Повернутись до входу
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Активація через пошту</h1>
        <p className="text-gray-600 text-sm">
          Введіть адресу @lpnu.ua — надішлемо новий лист із посиланням для активації (без ручного введення коду).
        </p>
      </div>

      {resendNotice && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          {resendNotice}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="manual-email" className="block text-sm font-medium text-gray-700 mb-2">
            ЕЛЕКТРОННА ПОШТА
          </label>
          <input
            id="manual-email"
            type="email"
            value={manualEmail}
            onChange={(e) => {
              setManualEmail(e.target.value);
              setErrorMessage('');
            }}
            placeholder="student@lpnu.ua"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleResend(manualEmail.trim().toLowerCase())}
          disabled={resendLoading || !manualEmail.trim()}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-60"
        >
          {resendLoading ? 'Надсилання…' : 'Надіслати лист активації'}
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Немає акаунта?{' '}
        <Link href="/register" className="text-orange-600 font-medium hover:text-orange-700">
          Реєстрація
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center text-gray-600">
          Завантаження…
        </div>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
