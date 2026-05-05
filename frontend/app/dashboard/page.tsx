'use client';

import AppLayout from '@/app/components/AppLayout';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

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
];

const stats = [
  { label: 'Тестів пройдено', value: '0', sub: 'з 12 доступних' },
  { label: 'Конфігурацій створено', value: '0', sub: 'ІКВ-генератор' },
  { label: 'Симуляцій запущено', value: '0', sub: 'за весь час' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const firstName = user?.email?.split('.')[0] ?? 'Користувач';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Вітаємо, {displayName}! Оберіть розділ для роботи.
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
