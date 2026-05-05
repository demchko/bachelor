'use client';

import { useState } from 'react';
import AppLayout from '@/app/components/AppLayout';

const topics = [
  {
    id: 'intro',
    title: 'Вступ до ІКВ',
    emoji: '📖',
    duration: '5 хв',
    content: (
      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          <strong>Інтервальна кільцева в&apos;язанка (ІКВ)</strong> — це математична структура, що базується
          на кільцевому розміщенні елементів, де кожне ціле число від 1 до S може бути представлено
          як сума послідовних елементів кільця.
        </p>
        <p>
          Формально, ІКВ визначається як послідовність <em>a₁, a₂, …, aₙ</em> натуральних чисел,
          розміщених по колу, така що кожне ціле число від 1 до S = n(n-1)/R + 1 є сумою
          деякої дуги кільця.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 font-mono text-xs">
          <p className="font-bold mb-1 text-amber-800">Формула розміру покриття:</p>
          <p>S = n(n−1)/R + 1</p>
          <p className="mt-2 text-amber-700">де n — кількість елементів, R — параметр покриття</p>
        </div>
        <p>
          Приклад: ІКВ з послідовністю {'{'} 1, 3, 2, 7 {'}'} при n=4, R=1 дає S=13. Перевіримо:
          всі числа від 1 до 13 можна отримати як суми дуг цього кільця.
        </p>
      </div>
    ),
  },
  {
    id: 'properties',
    title: 'Властивості ІКВ',
    emoji: '⚙️',
    duration: '8 хв',
    content: (
      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>ІКВ мають ряд важливих властивостей, що визначають їх застосування в кодуванні:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Компактність:</strong> n елементів покривають S ≈ n²/R значень</li>
          <li><strong>Рівномірність:</strong> кожна дуга однакової довжини дає різні суми</li>
          <li><strong>Циклічність:</strong> структура замкнена — кільце не має початку чи кінця</li>
          <li><strong>Надлишковість R:</strong> параметр R визначає ступінь перекриття покриття</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs">
          <p className="font-bold text-blue-800 mb-1">Теорема про оптимальність:</p>
          <p className="text-blue-700">
            ІКВ є оптимальним, якщо S досягає максимального значення n(n-1)/R + 1
            при даному n та R.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'coding',
    title: 'Кодування на основі ІКВ',
    emoji: '💡',
    duration: '10 хв',
    content: (
      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>
          ІКВ утворюють основу для побудови <strong>векторних</strong> та <strong>циклічних кодів</strong>,
          що використовуються для виявлення та виправлення помилок при передачі даних.
        </p>
        <h3 className="font-semibold text-gray-900">Векторний код на основі ІКВ</h3>
        <p>
          У векторному кодуванні кожен символ даних кодується набором позицій у кільці.
          Завдяки властивості покриття ІКВ, будь-яка одиночна або подвійна помилка
          при прийомі може бути виявлена.
        </p>
        <h3 className="font-semibold text-gray-900">Циклічний код на основі ІКВ</h3>
        <p>
          Циклічна структура ІКВ дозволяє будувати коди з простою апаратною реалізацією
          на регістрах зсуву. Перевірочна матриця такого коду визначається безпосередньо
          послідовністю ІКВ.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs font-mono">
          <p className="font-bold text-emerald-800 mb-1">Мінімальна відстань Хемінга:</p>
          <p className="text-emerald-700">d_min ≥ R + 1</p>
          <p className="mt-1 text-emerald-600">Можна виправити ⌊R/2⌋ помилок</p>
        </div>
      </div>
    ),
  },
  {
    id: 'applications',
    title: 'Застосування',
    emoji: '🚀',
    duration: '6 хв',
    content: (
      <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
        <p>ІКВ та коди на їх основі знаходять широке застосування у сучасних системах:</p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { title: 'Цифрові комунікації', desc: 'Захист від помилок у бездротових мережах 5G/LTE' },
            { title: 'Зберігання даних', desc: 'RAID-системи, Flash-пам\'ять, жорсткі диски' },
            { title: 'Космічний зв\'язок', desc: 'Передача телеметрії та команд управління' },
            { title: 'QR-коди', desc: 'Виправлення помилок при зчитуванні пошкоджених QR-кодів' },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-orange-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function TheoryPage() {
  const [active, setActive] = useState(topics[0].id);
  const topic = topics.find((t) => t.id === active)!;

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Теорія</h1>
        <p className="text-sm text-gray-500 mt-0.5">Теоретичні основи інтервальних кільцевих в&apos;язанок</p>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 h-fit">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 px-1">Розділи</p>
            <ul className="space-y-1">
              {topics.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActive(t.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm ${active === t.id ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.duration}</p>
                    </div>
                    {active === t.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="text-4xl">{topic.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
                <p className="text-sm text-gray-400 mt-0.5">Час читання: {topic.duration}</p>
              </div>
            </div>
            {topic.content}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  const idx = topics.findIndex((t) => t.id === active);
                  if (idx > 0) setActive(topics[idx - 1].id);
                }}
                disabled={topics[0].id === active}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 transition"
              >
                ← Попередній
              </button>
              <button
                onClick={() => {
                  const idx = topics.findIndex((t) => t.id === active);
                  if (idx < topics.length - 1) setActive(topics[idx + 1].id);
                }}
                disabled={topics[topics.length - 1].id === active}
                className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium disabled:opacity-30 transition"
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
