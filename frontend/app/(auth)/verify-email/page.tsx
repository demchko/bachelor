'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();

  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Auto-verify when both token and email come from the email link
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    if (urlToken && urlEmail) {
      setLoading(true);
      verifyEmail(urlEmail, urlToken)
        .then(() => router.push('/login?verified=1'))
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Помилка верифікації');
          setLoading(false);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, token);
      router.push('/login?verified=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка верифікації');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    setResendLoading(true);
    try {
      const res = await resendVerification(email);
      setResendMessage(res.message ?? 'Лист надіслано повторно');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка надсилання');
    } finally {
      setResendLoading(false);
    }
  };

  // Show spinner while auto-verifying from email link
  if (loading && searchParams.get('token')) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Перевірка...</h1>
        <p className="text-gray-500 text-sm">Підтверджуємо ваш email</p>
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
      <Link
        href="/login"
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
      >
        ← Повернутись до входу
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Підтвердіть email</h1>
        <p className="text-gray-600 text-sm">
          Введіть токен із листа, який ми надіслали на вашу адресу
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {resendMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {resendMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            ЕЛЕКТРОННА ПОШТА
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@lpnu.ua"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            КОД ПІДТВЕРДЖЕННЯ
          </label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Вставте токен із листа"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition font-mono text-sm text-gray-900 placeholder:text-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Перевірка...' : 'Підтвердити email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Не отримали листа?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || !email}
            className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'Надсилається...' : 'Надіслати повторно'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
