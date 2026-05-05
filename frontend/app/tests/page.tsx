'use client';

import { useState } from 'react';
import AppLayout from '@/app/components/AppLayout';

const questions = [
  {
    id: 1,
    text: 'Що таке інтервальна кільцева в\'язанка (ІКВ)?',
    options: [
      'Лінійна послідовність чисел без повторень',
      'Кільцева послідовність, де дугові суми покривають 1..S',
      'Алгоритм пошуку простих чисел',
      'Метод стиснення даних',
    ],
    correct: 1,
    explanation: 'ІКВ — це кільцева послідовність a₁,…,aₙ такова, що кожне ціле число від 1 до S є сумою деякої дуги кільця.',
  },
  {
    id: 2,
    text: 'Яка формула визначає розмір покриття S для ІКВ з n елементами та параметром R?',
    options: [
      'S = n · R + 1',
      'S = n(n+1)/2',
      'S = n(n−1)/R + 1',
      'S = 2ⁿ − 1',
    ],
    correct: 2,
    explanation: 'S = n(n−1)/R + 1, де n — кількість елементів, R — параметр покриття.',
  },
  {
    id: 3,
    text: 'Яка мінімальна відстань Хемінга для коду на основі ІКВ з параметром R?',
    options: ['d_min = R', 'd_min ≥ R + 1', 'd_min = 2R', 'd_min = R − 1'],
    correct: 1,
    explanation: 'Для кодів на основі ІКВ гарантується d_min ≥ R + 1, що дозволяє виправляти ⌊R/2⌋ помилок.',
  },
  {
    id: 4,
    text: 'Скільки елементів n на кільці при параметрі R=1 дає покриття S=13?',
    options: ['3', '4', '5', '6'],
    correct: 1,
    explanation: 'S = n(n−1)/1 + 1 = n²−n+1. При n=4: 4·3+1=13. Відповідь: n=4.',
  },
  {
    id: 5,
    text: 'Яка властивість відрізняє ІКВ від звичайної лінійної розстановки?',
    options: [
      'Елементи впорядковані за спаданням',
      'Дуги можуть перетинати "злам" між останнім та першим елементом',
      'Усі елементи однакові',
      'Сума всіх елементів дорівнює S',
    ],
    correct: 1,
    explanation: 'Циклічність кільця означає, що дуга може починатись з будь-якого елементу і огинати "стик" між aₙ та a₁.',
  },
];

type AnswerMap = Record<number, number>;

export default function TestsPage() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.correct).length
    : 0;

  const percent = Math.round((score / questions.length) * 100);

  const handleSubmit = () => {
    if (Object.keys(answers).length < questions.length) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Тести</h1>
        <p className="text-sm text-gray-500 mt-0.5">Перевірте свої знання з теорії ІКВ</p>
      </header>

      <main className="flex-1 px-8 py-8 max-w-3xl">
        {submitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${percent >= 80 ? 'bg-emerald-100 text-emerald-600' : percent >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
              {percent}%
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {percent >= 80 ? 'Відмінно!' : percent >= 50 ? 'Непогано!' : 'Варто повторити'}
            </h2>
            <p className="text-gray-500 mb-6">
              Правильних відповідей: {score} з {questions.length}
            </p>

            {/* Per-question review */}
            <div className="text-left space-y-4 mb-8">
              {questions.map((q) => {
                const correct = answers[q.id] === q.correct;
                return (
                  <div key={q.id} className={`rounded-lg border p-4 ${correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      <span className={`text-sm font-bold flex-shrink-0 ${correct ? 'text-emerald-600' : 'text-red-600'}`}>
                        {correct ? '✓' : '✗'}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{q.text}</p>
                    </div>
                    {!correct && (
                      <p className="text-xs text-gray-600 pl-5">
                        <strong>Правильно:</strong> {q.options[q.correct]}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 pl-5 mt-1 italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition"
            >
              Пройти ще раз
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 flex items-center gap-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">
                {Object.keys(answers).length} / {questions.length}
              </span>
            </div>

            {questions.map((q, qi) => (
              <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Питання {qi + 1}
                </p>
                <p className="font-medium text-gray-900 mb-4">{q.text}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${selected ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium' : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <span className="font-mono text-gray-400 mr-3">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Завершити тест
            </button>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
