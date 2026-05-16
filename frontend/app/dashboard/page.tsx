'use client';

import AppLayout from '@/app/components/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { statsApi, type UserStats } from '@/lib/api';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

const quickLinks = [
  {
    href: '/generator',
    title: 'Генератор ІКВ',
    description: 'Генеруйте ІКВ-конфігурації за параметрами n та R',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'bg-orange-500',
  },
  {
    href: '/vector-codes',
    title: 'Векторні коди',
    description: 'Монолітні пакети 1^w0^{n−w}, трапеційна таблиця, декодування',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    color: 'bg-amber-600',
  },
  {
    href: '/cyclic-codes',
    title: 'Циклічні коди',
    description: 'Множина D на кільці Z_S, матриці G та H, синдромне декодування',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'bg-indigo-600',
  },
  {
    href: '/simulation',
    title: 'Симуляція',
    description: 'Симулюйте передачу даних по зашумленому каналу',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-blue-500',
  },
  {
    href: '/theory',
    title: 'Теорія',
    description: 'Вивчайте теоретичні основи кільцевих в\'язанок',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'bg-emerald-500',
  },
  {
    href: '/tests',
    title: 'Тести',
    description: 'Перевірте свої знання з теорії ІКВ',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'bg-violet-500',
  },
  {
    href: '/profile',
    title: 'Профіль',
    description: 'Статистика, активність і всі розділи з одного місця',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: 'bg-slate-700',
  },
];

function formatStats(stats: UserStats | null) {
  return [
    {
      label: 'Тестів пройдено',
      value: stats ? String(stats.testsCompleted) : '—',
      sub: stats
        ? `найкращий результат ${stats.bestTestScorePct ?? 0}%`
        : 'завантаження…',
    },
    {
      label: 'Конфігурацій створено',
      value: stats ? String(stats.configsGenerated) : '—',
      sub: 'ІКВ-генератор',
    },
    {
      label: 'Симуляцій запущено',
      value: stats ? String(stats.simulationsRan) : '—',
      sub: 'за весь час',
    },
  ];
}

export default function DashboardPage() {
  const { user, accessToken } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ['stats-me', accessToken],
    queryFn: () => statsApi.me(accessToken!),
    enabled: !!accessToken,
  });

  const firstName = user?.email?.split('.')[0] ?? 'Користувач';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const renderedStats = formatStats(stats ?? null);

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Головна панель</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Вітаємо, {displayName}! Оберіть розділ для роботи.
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {renderedStats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {s.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Quick access */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Швидкий доступ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className={`w-11 h-11 ${item.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Рекомендований маршрут</h2>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                  1
                </span>
                <span>
                  <Link className="font-semibold text-orange-700 hover:underline" href="/generator">
                    Генератор
                  </Link>{' '}
                  — підготуйте або імпортуйте валідну ІКВ-послідовність.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                  2
                </span>
                <span>
                  <Link className="font-semibold text-orange-700 hover:underline" href="/cyclic-codes">
                    Циклічний
                  </Link>{' '}
                  або{' '}
                  <Link className="font-semibold text-orange-700 hover:underline" href="/vector-codes">
                    монолітний
                  </Link>{' '}
                  код — закріпіть структуру матриць і декодування.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                  3
                </span>
                <span>
                  <Link className="font-semibold text-orange-700 hover:underline" href="/simulation">
                    Симуляція
                  </Link>{' '}
                  — порівняйте ІКВ з бінарним каналом і довідковою кривою RS.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-800">
                  4
                </span>
                <span>
                  <Link className="font-semibold text-orange-700 hover:underline" href="/theory">
                    Теорія
                  </Link>{' '}
                  та{' '}
                  <Link className="font-semibold text-orange-700 hover:underline" href="/tests">
                    тести
                  </Link>{' '}
                  — підсумок курсу.
                </span>
              </li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Профіль</p>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Перегляньте статистику тестів, симуляцій і збережених конфігурацій — усі розділи також зібрані там.
              </p>
            </div>
            <Link
              href="/profile"
              className="mt-4 inline-flex justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Відкрити профіль
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-8 bg-[#1a2332] rounded-xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            IR
          </div>
          <div>
            <p className="text-white font-semibold mb-1">IRB Explorer — платформа для дослідження ІКВ</p>
            <p className="text-slate-400 text-sm leading-relaxed">
              Платформа дозволяє генерувати кільцеві в&apos;язанки, досліджувати векторні та циклічні коди,
              симулювати передачу через зашумлений канал та вивчати теоретичну базу.
            </p>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
