'use client';

import AppLayout from '@/app/components/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { statsApi } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NAV_TILES = [
  {
    href: '/dashboard',
    title: 'Головна панель',
    desc: 'Огляд і статистика',
    color: 'bg-slate-800',
  },
  {
    href: '/generator',
    title: 'Генератор ІКВ',
    desc: 'Нові конфігурації',
    color: 'bg-orange-500',
  },
  {
    href: '/vector-codes',
    title: 'Монолітні коди',
    desc: 'Лабораторія',
    color: 'bg-amber-600',
  },
  {
    href: '/cyclic-codes',
    title: 'Циклічні коди',
    desc: 'Матриці H, G',
    color: 'bg-indigo-600',
  },
  {
    href: '/simulation',
    title: 'Симуляція',
    desc: 'BSC, порівняння',
    color: 'bg-cyan-600',
  },
  {
    href: '/theory',
    title: 'Теорія',
    desc: 'Матеріали курсу',
    color: 'bg-emerald-600',
  },
  {
    href: '/tests',
    title: 'Тести',
    desc: 'Перевірка знань',
    color: 'bg-violet-600',
  },
];

export default function ProfilePage() {
  const { user, accessToken, logout } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-me', accessToken],
    queryFn: () => statsApi.me(accessToken!),
    enabled: !!accessToken,
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const initials =
    user?.email
      ?.split(/[@._-]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'U';

  const lastActivity =
    stats?.lastActivityAt &&
    new Date(stats.lastActivityAt).toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <AppLayout>
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Профіль</h1>
        <p className="text-sm text-slate-500 mt-1">
          Обліковий запис, активність у IRB Explorer і швидкі переходи по всьому застосунку.
        </p>
      </header>

      <main className="flex-1 px-6 sm:px-8 py-8 max-w-5xl mx-auto w-full space-y-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-slate-900 truncate">{user?.email}</p>
            <p className="text-sm text-slate-500 mt-0.5">Внутрішній ідентифікатор</p>
            <p className="text-xs font-mono text-slate-400 mt-1 break-all">{user?.id}</p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Link
              href="/dashboard"
              className="inline-flex justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              На головну панель
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex justify-center rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Вийти
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Активність</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Тестів пройдено</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {statsLoading ? '…' : stats?.testsCompleted ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Найкращий бал: {stats?.bestTestScorePct != null ? `${stats.bestTestScorePct}%` : '—'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Конфігурацій</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {statsLoading ? '…' : stats?.configsGenerated ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Збережено: {stats?.configsSaved ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Симуляцій</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {statsLoading ? '…' : stats?.simulationsRan ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Запусків каналу</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Остання активність</p>
              <p className="text-sm font-medium text-slate-800 mt-2">{lastActivity ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-1">За даними сервера</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Усі розділи</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {NAV_TILES.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md"
              >
                <div className={`h-10 w-10 shrink-0 rounded-lg ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                  →
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-orange-600">{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Безпека облікового запису</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Пароль можна скинути через електронну пошту. Після зміни пароля увійдіть знову на всіх пристроях.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/forgot-password"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Забули пароль?
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
            >
              Сторінка входу
            </Link>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
