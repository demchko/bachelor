'use client';

import AppLayout from '@/app/components/AppLayout';
import BitTape from '@/app/components/codes/BitTape';
import { labInputMonolithic, labNumberInputAmber } from '@/app/components/codes/lab-input-styles';
import MonolithicPacketBar from '@/app/components/codes/MonolithicPacketBar';
import TrapezoidPanel from '@/app/components/codes/TrapezoidPanel';
import { useCodeLab } from '@/app/components/codes/useCodeLab';
import Link from 'next/link';

function formatPct(x: number): string {
  if (!Number.isFinite(x)) return '—';
  return x.toLocaleString('uk-UA', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
}

export default function MonolithicLab() {
  const lab = useCodeLab('monolithic');
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
    monolithicMeta,
    accessToken,
  } = lab;

  const symbolWidth = monolithicMeta?.symbolWidth ?? Math.ceil(Math.log2((sequence.length || 2) + 1));
  const expectedDataLen =
    monolithicMeta != null ? `кратна ${symbolWidth} (зараз ${data.length % symbolWidth === 0 ? 'OK' : 'не OK'})` : '';

  return (
    <AppLayout>
      <div className="relative overflow-hidden border-b border-amber-200/60 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-8 sm:px-10">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_50%,white,transparent_50%),radial-gradient(circle_at_80%_30%,white,transparent_45%)]" />
        <div className="relative max-w-5xl">
          <p className="text-amber-100 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Лабораторія · ІКВ</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Векторні (монолітні) завадостійкі коди</h1>
          <p className="mt-3 text-sm text-amber-50 max-w-2xl leading-relaxed">
            Модель з порівняльного аналізу монолітного та циклічного кодування (Різник В. В. та ін.,{' '}
            <span className="whitespace-nowrap">UJIT, 2021</span>, DOI{' '}
            <a
              className="underline decoration-amber-200 hover:text-white"
              href="https://doi.org/10.23939/ujit2021.03.099"
              target="_blank"
              rel="noreferrer"
            >
              10.23939/ujit2021.03.099
            </a>
            ): кодові слова як <strong>нероздільні пакети</strong> однойменних символів 1<sup>w</sup>0<sup>n−w</sup>,
            декодування — пошук межі пакета та мажоритарна корекція.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/generator"
              className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              Генератор ІКВ
            </Link>
            <Link
              href="/cyclic-codes"
              className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              Циклічні коди →
            </Link>
            <Link
              href="/theory"
              className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25"
            >
              Теорія
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white text-sm">1</span>
              Параметри та кодування
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Довжина блоку монолітного коду дорівнює <strong>n = кількість елементів ІКВ</strong>. Кожен символ даних
              (група з {symbolWidth} біт) кодується вагою w ∈ [0, n].
            </p>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">ІКВ-послідовність</label>
              <input
                value={sequenceText}
                onChange={(e) => setSequenceText(e.target.value)}
                className={labInputMonolithic}
                placeholder="1, 3, 2, 7"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                Дані (0/1), {expectedDataLen}
              </label>
              <input
                value={data}
                onChange={(e) => setData(e.target.value.replace(/[^01]/g, ''))}
                className={labInputMonolithic}
                placeholder="0011"
              />
            </div>
            <button
              type="button"
              onClick={() => encodeMutation.mutate()}
              disabled={loading || sequence.length < 2 || !accessToken}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
            >
              {loading ? 'Обчислення…' : 'Закодувати'}
            </button>
            {monolithicMeta && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs text-amber-950/90">
                <p>
                  n = {monolithicMeta.blockLength}, ширина символу = {monolithicMeta.symbolWidth} біт, алфавіт |C| ={' '}
                  {monolithicMeta.capacitySymbols}.
                </p>
              </div>
            )}
            {encoded && (
              <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-sm text-emerald-900">
                  <span className="text-emerald-700">Кодове слово:</span>{' '}
                  <span className="font-mono break-all">{encoded.codeword}</span>
                </p>
                <MonolithicPacketBar bits={encoded.codeword} blockLength={encoded.blockLength} />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Інтерактив: канал і декодування</h2>
            <p className="text-sm text-slate-600">
              Інвертуйте біти вручну або додайте випадкову помилку, потім запустіть декодер — побачите відновлений
              пакет і витягнуті дані.
            </p>
            {encoded ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={randomBitError}
                    className="rounded-lg border border-amber-500 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
                  >
                    Випадковий біт-фліп
                  </button>
                  <button
                    type="button"
                    onClick={() => setReceived(encoded.codeword)}
                    className="rounded-lg border border-slate-400 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                  >
                    Скинути до кодового слова
                  </button>
                </div>
                <BitTape bits={received} reference={encoded.codeword} onFlip={introduceError} label="Прийняте слово" />
                <button
                  type="button"
                  onClick={() => decodeMutation.mutate()}
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Декодувати
                </button>
                {decoded && (
                  <div
                    className={`rounded-xl border-2 p-4 text-sm space-y-2 ${
                      decoded.uncorrected ? 'border-rose-400 bg-rose-50' : 'border-emerald-500 bg-emerald-100'
                    }`}
                  >
                    <p className="font-mono break-all leading-relaxed">
                      <span className="font-bold text-slate-900">Виправлено:</span>{' '}
                      <span className="text-slate-950">{decoded.corrected}</span>
                    </p>
                    <p className="font-mono break-all leading-relaxed">
                      <span className="font-bold text-slate-900">Дані:</span>{' '}
                      <span className="text-slate-950">{decoded.decoded}</span>
                    </p>
                    <p className="text-xs font-medium text-slate-800 border-t border-slate-300/80 pt-2 mt-2">
                      Бітів змінено у каналі (vs відправлене c):{' '}
                      <strong className="tabular-nums text-amber-950">{decoded.detectedErrors}</strong>
                      {' · '}
                      Позицій виправлено декодером:{' '}
                      <strong className="tabular-nums text-amber-950">{decoded.correctedErrors}</strong>
                      {decoded.uncorrected ? (
                        <span className="text-rose-800"> · частина структури не відновлена надійно</span>
                      ) : null}
                    </p>
                    {decoded.errorPositions.length > 0 && (
                      <p className="text-xs text-slate-800">Позиції: {decoded.errorPositions.join(', ')}</p>
                    )}
                    <MonolithicPacketBar bits={decoded.corrected} blockLength={encoded.blockLength} />
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">Спочатку закодуйте повідомлення.</p>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Ефективність N₁, N₂</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Евристика зі статті: кількість r-помилкових слів, що виявляються / виправляються для монолітного коду
              довжини n.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">n</label>
                <input
                  type="number"
                  min={4}
                  max={64}
                  value={n}
                  onChange={(e) => setN(Number(e.target.value))}
                  className={labNumberInputAmber}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">r помилок</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={r}
                  onChange={(e) => setR(Number(e.target.value))}
                  className={labNumberInputAmber}
                />
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={() => efficiencyMutation.mutate()}
                  className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
                >
                  Розрахувати
                </button>
              </div>
            </div>
            {efficiency && (
              <dl className="grid grid-cols-2 gap-2 text-sm rounded-xl bg-teal-50 border border-teal-200 p-4">
                <dt className="text-teal-950 font-medium">N₁ виявлення</dt>
                <dd className="font-mono text-right font-semibold text-slate-900 tabular-nums">
                  {efficiency.detectable.toLocaleString('uk-UA')}
                </dd>
                <dt className="text-teal-950 font-medium">N₂ виправлення</dt>
                <dd className="font-mono text-right font-semibold text-slate-900 tabular-nums">
                  {efficiency.correctable.toLocaleString('uk-UA')}
                </dd>
                <dt className="text-teal-950 font-medium">% виявлення</dt>
                <dd className="font-bold text-right text-teal-950 tabular-nums">{formatPct(efficiency.detectablePct)}%</dd>
                <dt className="text-teal-950 font-medium">% виправлення</dt>
                <dd className="font-bold text-right text-teal-950 tabular-nums">{formatPct(efficiency.correctablePct)}%</dd>
              </dl>
            )}
          </div>
          <TrapezoidPanel accessToken={accessToken} />
        </section>

        {monolithicMeta && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Кодова книга (усі дозволені пакети довжини n)</h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {monolithicMeta.codewords.map((cw, i) => (
                <code
                  key={i}
                  className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-mono text-slate-700"
                >
                  w={i}: {cw}
                </code>
              ))}
            </div>
          </section>
        )}

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}
      </main>
    </AppLayout>
  );
}
