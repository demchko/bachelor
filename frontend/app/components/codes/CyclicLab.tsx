'use client';

import AppLayout from '@/app/components/AppLayout';
import BitTape from '@/app/components/codes/BitTape';
import DifferenceSetRing from '@/app/components/codes/DifferenceSetRing';
import { labInputCyclic, labNumberInputIndigo } from '@/app/components/codes/lab-input-styles';
import MatrixHeatmap from '@/app/components/codes/MatrixHeatmap';
import { useCodeLab } from '@/app/components/codes/useCodeLab';
import Link from 'next/link';

function formatPct(x: number): string {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('uk-UA', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

export default function CyclicLab() {
  const lab = useCodeLab('cyclic');
  const {
    sequenceText,
    setSequenceText,
    data,
    setData,
    sequence,
    encoded,
    received,
    setReceived,
    decoded,
    efficiency,
    n,
    setN,
    r,
    setR,
    encodeMutation,
    decodeMutation,
    efficiencyMutation,
    introduceError,
    randomBitError,
    loading,
    error,
    cyclicStructure,
    cyclicStructureError,
    accessToken,
  } = lab;

  const S = cyclicStructure?.blockLength ?? sequence.reduce((a, b) => a + b, 0);

  return (
    <AppLayout>
      <div className="relative overflow-hidden border-b border-indigo-200/50 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-8 sm:px-10">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_20%,white,transparent),radial-gradient(ellipse_at_70%_80%,white,transparent)]" />
        <div className="relative max-w-5xl">
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Лабораторія · ІКВ</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Циклічні завадостійкі ІКВ-коди</h1>
          <p className="mt-3 text-sm text-indigo-50 max-w-2xl leading-relaxed">
            Множина відмінностей з часткових сум ІКВ по модулю S задає циклічний код: рядки матриці H — циклічні зсуви
            індикатора D. Порівняно з класичними BCH-кодами, оптимізовані циклічні ІКВ-коди спрощують процедури
            кодування та декодування при збереженні корекційної здатності (
            <a
              href="https://doi.org/10.23939/ujit2021.03.099"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-indigo-200"
            >
              Riznyk et al., 2021
            </a>
            ).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/vector-codes"
              className="inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              ← Монолітні коди
            </Link>
            <Link
              href="/simulation"
              className="inline-flex rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              Симуляція каналу
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm">
                  1
                </span>
                Послідовність і кодування
              </h2>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">ІКВ-послідовність</label>
                <input
                  value={sequenceText}
                  onChange={(e) => setSequenceText(e.target.value)}
                  className={labInputCyclic}
                  placeholder="1, 3, 2, 7"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                  Інформаційні біти (довжина = k після кодування)
                </label>
                <input
                  value={data}
                  onChange={(e) => setData(e.target.value.replace(/[^01]/g, ''))}
                  className={labInputCyclic}
                  placeholder="1011"
                />
                {cyclicStructure && (
                  <p className="mt-1 text-xs text-slate-600">
                    Потрібно рівно <strong className="text-indigo-800">{cyclicStructure.informationLength}</strong> біт
                    (k). Довжина зараз: {data.length}
                    {data.length === cyclicStructure.informationLength ? (
                      <span className="text-emerald-600 font-medium"> — OK</span>
                    ) : null}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => encodeMutation.mutate()}
                disabled={
                  loading ||
                  sequence.length < 2 ||
                  !accessToken ||
                  (cyclicStructure != null && data.length !== cyclicStructure.informationLength)
                }
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 disabled:opacity-50"
              >
                {loading ? 'Кодування…' : 'Закодувати (c · G)'}
              </button>
              {encoded && (
                <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-sm space-y-1">
                  <p className="text-violet-950">
                    <span className="text-violet-700">Кодове слово:</span>{' '}
                    <span className="font-mono break-all">{encoded.codeword}</span>
                  </p>
                  <p className="text-xs text-violet-800/80">
                    n = {encoded.blockLength}, k = {encoded.dataLength}, r = {encoded.redundancy ?? '—'}
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white text-sm">
                  2
                </span>
                Канал і декодування (синдром)
              </h2>
              {encoded ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={randomBitError}
                      className="rounded-lg border border-indigo-400 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-950 shadow-sm hover:bg-indigo-100"
                    >
                      Випадковий біт-фліп
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceived(encoded.codeword)}
                      className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                    >
                      Скинути
                    </button>
                  </div>
                  <BitTape bits={received} reference={encoded.codeword} onFlip={introduceError} label="Прийнятий вектор" />
                  <button
                    type="button"
                    onClick={() => decodeMutation.mutate()}
                    disabled={loading}
                    className="w-full rounded-xl bg-fuchsia-700 py-3 text-sm font-semibold text-white hover:bg-fuchsia-600 disabled:opacity-50"
                  >
                    Декодувати (синдром → позиція помилки)
                  </button>
                  {decoded && (
                    <div
                      className={`rounded-xl border-2 p-4 text-sm space-y-2 ${
                        decoded.uncorrected
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-emerald-500 bg-emerald-100'
                      }`}
                    >
                      <p className="font-mono break-all leading-relaxed">
                        <span className="font-bold text-slate-900">Виправлене c:</span>{' '}
                        <span className="text-slate-950">{decoded.corrected}</span>
                      </p>
                      <p className="font-mono break-all leading-relaxed">
                        <span className="font-bold text-slate-900">Інформація m:</span>{' '}
                        <span className="text-slate-950">{decoded.decoded}</span>
                      </p>
                      <p className="text-xs font-medium text-slate-800 border-t border-slate-300/80 pt-2 mt-2">
                        Бітів змінено у каналі (vs відправлене c):{' '}
                        <strong className="tabular-nums text-indigo-900">{decoded.detectedErrors}</strong>
                        {' · '}
                        Позицій виправлено декодером:{' '}
                        <strong className="tabular-nums text-indigo-900">{decoded.correctedErrors}</strong>
                        {decoded.uncorrected ? (
                          <span className="text-rose-800">
                            {' '}
                            · синдром не відповідає одній позиційній помилці (обмеження демо-декодера)
                          </span>
                        ) : null}
                      </p>
                      {decoded.errorPositions.length > 0 && (
                        <p className="text-xs text-slate-700">
                          Виправлені позиції в c: {decoded.errorPositions.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400">Закодуйте повідомлення, щоб з&apos;явилася стрічка бітів.</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            {cyclicStructureError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
                <p className="font-semibold mb-1">Структура коду</p>
                <p>{cyclicStructureError}</p>
              </div>
            )}
            {cyclicStructure && S >= 2 && (
              <DifferenceSetRing S={S} differenceSet={cyclicStructure.differenceSet} />
            )}
            {cyclicStructure && (
              <div className="grid gap-3 sm:grid-cols-2">
                <MatrixHeatmap matrix={cyclicStructure.generatorMatrix} title="Генератор G (k×n)" />
                <MatrixHeatmap matrix={cyclicStructure.parityCheckMatrix} title="Перевірка H (r×n)" />
              </div>
            )}
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Порівняльна ефективність (циклічний варіант)</h2>
          <p className="text-xs text-slate-500">
            Модель зі статті: для параметра n ІКВ оцінюються межі виявлення / виправлення символьних помилок у блоці
            довжини S ≈ n(n−1)+1.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">n (ІКВ)</label>
              <input
                type="number"
                min={3}
                max={32}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className={labNumberInputIndigo}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">r</label>
              <input
                type="number"
                min={1}
                max={8}
                value={r}
                onChange={(e) => setR(Number(e.target.value))}
                className={labNumberInputIndigo}
              />
            </div>
            <div className="col-span-2 flex items-end">
              <button
                type="button"
                onClick={() => efficiencyMutation.mutate()}
                className="w-full rounded-lg bg-indigo-100 text-indigo-900 py-2.5 text-sm font-semibold hover:bg-indigo-200"
              >
                Оцінити
              </button>
            </div>
          </div>
          {efficiency && (
            <dl className="grid grid-cols-2 gap-2 text-sm rounded-xl bg-indigo-50 border border-indigo-200 p-4">
              <dt className="text-indigo-950 font-medium">База комбінацій</dt>
              <dd className="font-mono text-right font-semibold text-slate-900 tabular-nums">
                {efficiency.total.toLocaleString('uk-UA')}
              </dd>
              <dt className="text-indigo-950 font-medium">Виявлення</dt>
              <dd className="font-mono text-right font-semibold text-slate-900 tabular-nums">
                {efficiency.detectable.toLocaleString('uk-UA')}
              </dd>
              <dt className="text-indigo-950 font-medium">Виправлення</dt>
              <dd className="font-mono text-right font-semibold text-slate-900 tabular-nums">
                {efficiency.correctable.toLocaleString('uk-UA')}
              </dd>
              <dt className="text-indigo-950 font-medium">Частки %</dt>
              <dd className="text-right font-bold text-indigo-950 tabular-nums">
                {formatPct(efficiency.detectablePct)}% / {formatPct(efficiency.correctablePct)}%
              </dd>
            </dl>
          )}
        </section>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
      </main>
    </AppLayout>
  );
}
