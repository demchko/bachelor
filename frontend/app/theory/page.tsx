'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/app/components/AppLayout';
import { THEORY_TOPICS } from '@/app/theory/theory-content';

export default function TheoryPage() {
  const [active, setActive] = useState(THEORY_TOPICS[0].id);
  const topic = THEORY_TOPICS.find((t) => t.id === active)!;

  return (
    <AppLayout>
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-5">
        <h1 className="text-xl font-bold text-slate-900">Теорія та контекст</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Навчальні матеріали до IRB Explorer: ІКВ, лабораторії кодів, симуляція каналу та зв&apos;язок розділів
          платформи.
        </p>
      </header>

      <main className="flex-1 px-6 sm:px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="w-full text-xs font-semibold uppercase tracking-widest text-slate-400">Швидкі переходи</p>
          {[
            { href: '/dashboard', label: 'Панель' },
            { href: '/generator', label: 'Генератор' },
            { href: '/vector-codes', label: 'Моноліт' },
            { href: '/cyclic-codes', label: 'Циклічний' },
            { href: '/simulation', label: 'Симуляція' },
            { href: '/tests', label: 'Тести' },
            { href: '/profile', label: 'Профіль' },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 h-fit shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 px-1">Розділи</p>
            <ul className="space-y-1">
              {THEORY_TOPICS.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActive(t.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${
                      active === t.id
                        ? 'bg-orange-50 text-orange-700 font-semibold ring-1 ring-orange-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base" aria-hidden>
                      {t.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{t.title}</p>
                      <p className="text-xs text-slate-400">{t.duration}</p>
                    </div>
                    {active === t.id && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
              <span className="text-4xl" aria-hidden>
                {topic.emoji}
              </span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{topic.title}</h2>
                <p className="text-sm text-slate-400 mt-0.5">Орієнтовний час: {topic.duration}</p>
              </div>
            </div>
            {topic.content}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const idx = THEORY_TOPICS.findIndex((t) => t.id === active);
                  if (idx > 0) setActive(THEORY_TOPICS[idx - 1].id);
                }}
                disabled={THEORY_TOPICS[0].id === active}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 transition"
              >
                ← Попередній
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = THEORY_TOPICS.findIndex((t) => t.id === active);
                  if (idx < THEORY_TOPICS.length - 1) setActive(THEORY_TOPICS[idx + 1].id);
                }}
                disabled={THEORY_TOPICS[THEORY_TOPICS.length - 1].id === active}
                className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-30 transition"
              >
                Наступний →
              </button>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
