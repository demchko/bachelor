'use client';

import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/app/components/AppLayout';
import { testsApi, type TestQuestion, type TestSubmissionResult } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type AnswerMap = Record<number, number>;

export default function TestsPage() {
  const { accessToken } = useAuth();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submission, setSubmission] = useState<TestSubmissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    testsApi
      .bank(accessToken)
      .then((data) => {
        setQuestions(data.questions);
        setStartedAt(Date.now());
      })
      .catch((err: Error) => setError(err.message));
  }, [accessToken]);

  const handleSubmit = useCallback(async () => {
    if (!accessToken || questions.length === 0) return;
    if (Object.keys(answers).length < questions.length) return;
    setLoading(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        optionIndex: answers[q.id],
      }));
      const durationSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : undefined;
      const result = await testsApi.submit(accessToken, payload, durationSec);
      setSubmission(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, answers, questions, startedAt]);

  const handleReset = () => {
    setAnswers({});
    setSubmission(null);
    setStartedAt(Date.now());
  };

  if (error) {
    return (
      <AppLayout>
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">Тести</h1>
        </header>
        <main className="flex-1 px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        </main>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">Тести</h1>
        </header>
        <main className="flex-1 px-8 py-8 text-gray-500">Завантаження тесту…</main>
      </AppLayout>
    );
  }

  if (submission) {
    const percent = submission.scorePct;
    return (
      <AppLayout>
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <h1 className="text-xl font-bold text-gray-900">Тести</h1>
          <p className="text-sm text-gray-500 mt-0.5">Перевірте свої знання з теорії ІКВ</p>
        </header>
        <main className="flex-1 px-8 py-8 max-w-3xl">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold ${
                percent >= 80
                  ? 'bg-emerald-100 text-emerald-600'
                  : percent >= 50
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {percent}%
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {percent >= 80 ? 'Відмінно!' : percent >= 50 ? 'Непогано!' : 'Варто повторити'}
            </h2>
            <p className="text-gray-500 mb-6">
              Правильних відповідей: {submission.correct} з {submission.total}
            </p>

            <div className="text-left space-y-4 mb-8">
              {submission.answers.map((ans) => {
                const q = questions.find((qq) => qq.id === ans.questionId);
                if (!q) return null;
                return (
                  <div
                    key={ans.questionId}
                    className={`rounded-lg border p-4 ${
                      ans.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span
                        className={`text-sm font-bold flex-shrink-0 ${
                          ans.isCorrect ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {ans.isCorrect ? '✓' : '✗'}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{q.text}</p>
                    </div>
                    {!ans.isCorrect && (
                      <p className="text-xs text-gray-600 pl-5">
                        <strong>Правильно:</strong> {q.options[ans.correctOptionIndex]}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 pl-5 mt-1 italic">{ans.explanation}</p>
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
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Тести</h1>
        <p className="text-sm text-gray-500 mt-0.5">Перевірте свої знання з теорії ІКВ</p>
      </header>

      <main className="flex-1 px-8 py-8 max-w-3xl">
        <div className="space-y-6">
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
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition ${
                        selected
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-medium'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
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
            disabled={loading || Object.keys(answers).length < questions.length}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Перевірка…' : 'Завершити тест'}
          </button>
        </div>
      </main>
    </AppLayout>
  );
}
