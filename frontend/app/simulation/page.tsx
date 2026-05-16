'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/app/components/AppLayout';
import { labInputCyclic } from '@/app/components/codes/lab-input-styles';
import {
  simulationApi,
  type CodeKind,
  type SimulationChartPoint,
  type SimulationResult,
  type SimulationRunSummary,
  type SimulationStats,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { buildClientSimulationChart } from '@/lib/simulation/sweep-chart-client';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const SEQUENCE_PRESETS: { label: string; seq: number[] }[] = [
  { label: '1,3,2,7 (n=4)', seq: [1, 3, 2, 7] },
  { label: '1,2,4 (n=3)', seq: [1, 2, 4] },
  { label: '1,3,10,2,5', seq: [1, 3, 10, 2, 5] },
  { label: '1,2,4,8,16,5,18,9,10', seq: [1, 2, 4, 8, 16, 5, 18, 9, 10] },
];

const PRIMARY_OPTIONS: { kind: CodeKind; label: string; hint: string }[] = [
  { kind: 'irb-cyclic', label: 'Циклічний ІКВ', hint: 'BSC + encode/decode циклічного коду' },
  { kind: 'irb-monolithic', label: 'Монолітний ІКВ', hint: 'Пакетні слова, мажоритарне декодування' },
  { kind: 'binary', label: 'Бінарний канал', hint: 'Без кодування, довжина блоку = S' },
];

function parseSequence(text: string): number[] {
  return text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((v) => Number.isFinite(v) && v > 0);
}

function formatPct(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '—';
  return `${(x * 100).toFixed(digits)}%`;
}

function formatPctPlain(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return '—';
  return `${x.toFixed(digits)}%`;
}

/** Для дуже великих лічильників (наприклад, умовні біт-помилки в аналітичній моделі Р–С). */
function formatCompactCount(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < 1_000_000) return n.toLocaleString('uk-UA');
  return new Intl.NumberFormat('uk-UA', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(n);
}

function successStrengthClass(rate: number): string {
  if (!Number.isFinite(rate)) return 'text-slate-800';
  if (rate >= 0.8) return 'text-emerald-800';
  if (rate >= 0.4) return 'text-amber-800';
  return 'text-red-800';
}

/** `errorRate` у точках графіка — це p у відсотках (може бути дробовим, напр. 0.2 для p=0.002). */
function formatSweepAxisP(percent: number): string {
  if (!Number.isFinite(percent)) return '';
  const trimmed = Number(percent.toFixed(4)).toString();
  return `p=${trimmed}%`;
}

function codeKindUa(k: CodeKind): string {
  switch (k) {
    case 'irb-cyclic':
      return 'Циклічний ІКВ';
    case 'irb-monolithic':
      return 'Монолітний ІКВ';
    case 'binary':
      return 'Бінарний';
    case 'reed-solomon':
      return 'Рід–Соломон (оцінка)';
    default:
      return k;
  }
}

function SweepChart({
  data,
  compareBinary,
  compareRS,
  primaryLabel,
}: {
  data: SimulationChartPoint[];
  compareBinary: boolean;
  compareRS: boolean;
  primaryLabel: string;
}) {
  const chartData = data.map((point) => ({
    ...point,
    errorLabel: formatSweepAxisP(point.errorRate),
  }));

  const lines: { key: keyof SimulationChartPoint; color: string; label: string }[] = [
    { key: 'irb', color: '#ea580c', label: primaryLabel },
    ...(compareBinary ? [{ key: 'binary' as const, color: '#2563eb', label: 'Бінарний' }] : []),
    ...(compareRS ? [{ key: 'reedSolomon' as const, color: '#059669', label: 'Р–С (оцінка)' }] : []),
  ];

  return (
    <div className="h-64 w-full rounded-lg bg-slate-50 px-2 py-3" role="img" aria-label="Графік успішності">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="errorLabel"
            interval={0}
            minTickGap={4}
            tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            domain={[0, 100]}
            width={42}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toFixed(1)}%`,
              String(name),
            ]}
            labelFormatter={(label) => `Ймовірність помилки: ${label}`}
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          {lines.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 1, fill: color, stroke: '#fff' }}
              activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string;
  value: string;
  sub?: string;
  accent?: 'orange' | 'blue' | 'emerald' | 'slate';
}) {
  const border =
    accent === 'blue'
      ? 'border-blue-200 bg-blue-50/80'
      : accent === 'emerald'
        ? 'border-emerald-200 bg-emerald-50/80'
        : accent === 'slate'
          ? 'border-slate-200 bg-slate-50'
          : 'border-orange-200 bg-orange-50/80';
  return (
    <div className={`rounded-2xl border-2 px-5 py-4 ${border}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function StatsTable({ rows, title }: { rows: SimulationStats[]; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-100/80">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-700 border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2.5 font-bold">Код</th>
              <th className="px-4 py-2.5 font-bold">Успішність</th>
              <th className="px-4 py-2.5 font-bold">Відновлено</th>
              <th
                className="px-4 py-2.5 font-bold"
                title="Для рядка «Рід–Соломон» це умовна метрика моделі, не пряма симуляція байтів каналу."
              >
                Біт-помилки
              </th>
              <th className="px-4 py-2.5 font-bold">Flip rate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.codeKind} className="border-b border-slate-100 transition-colors hover:bg-cyan-50/40">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {codeKindUa(r.codeKind)}
                  {r.codeKind === 'reed-solomon' && (
                    <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      модель
                    </span>
                  )}
                </td>
                <td
                  className={`px-4 py-3 font-mono tabular-nums font-semibold ${successStrengthClass(r.successRate)}`}
                >
                  {formatPctPlain(r.successRate * 100)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-800">
                  {r.recoveredPackets.toLocaleString('uk-UA')} / {r.packets.toLocaleString('uk-UA')}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-800" title={r.bitErrors.toLocaleString('uk-UA')}>
                  {formatCompactCount(r.bitErrors)}
                </td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-800">{formatPctPlain(r.bitFlipRate * 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [sequenceText, setSequenceText] = useState('1, 3, 2, 7');
  const [codeKind, setCodeKind] = useState<CodeKind>('irb-cyclic');
  const [totalPackets, setTotalPackets] = useState(2000);
  const [errorProb, setErrorProb] = useState(0.12);
  const [compareBinary, setCompareBinary] = useState(true);
  const [compareRS, setCompareRS] = useState(false);
  const [saveRun, setSaveRun] = useState(true);
  const [sim, setSim] = useState<SimulationResult | null>(null);
  /** Параметри останнього успішного run — для клієнтського графіка (не залежить від версії Nest). */
  const [chartRun, setChartRun] = useState<{ sequence: number[]; codeKind: CodeKind } | null>(null);
  const [historySavedAck, setHistorySavedAck] = useState(false);

  const sequence = useMemo(() => parseSequence(sequenceText), [sequenceText]);

  useEffect(() => {
    if (!historySavedAck) return;
    const t = window.setTimeout(() => setHistorySavedAck(false), 4000);
    return () => window.clearTimeout(t);
  }, [historySavedAck]);

  const runsQuery = useQuery({
    queryKey: ['simulation-runs', accessToken],
    queryFn: () => simulationApi.listRuns(accessToken!),
    enabled: !!accessToken,
  });

  const runMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('Увійдіть у систему.');
      if (sequence.length < 2) throw new Error('Введіть ІКВ-послідовність (мінімум 2 додатних числа).');
      return simulationApi.run(accessToken, {
        sequence,
        packets: totalPackets,
        errorProbability: errorProb,
        codeKind,
        compareBinary: codeKind === 'binary' ? false : compareBinary,
        compareReedSolomon: compareRS,
        save: saveRun,
      });
    },
    onSuccess: (data) => {
      setSim(data);
      setChartRun({ sequence: [...sequence], codeKind });
      if (data.savedRunId) setHistorySavedAck(true);
      void queryClient.invalidateQueries({ queryKey: ['simulation-runs'] });
    },
  });

  const loading = runMutation.isPending;
  const error = runMutation.error?.message ?? null;
  const errorPct = Math.round(errorProb * 100);
  const presets = [5, 12, 20, 30];

  const primaryLabel =
    codeKind === 'irb-cyclic' ? 'Циклічний ІКВ' : codeKind === 'irb-monolithic' ? 'Монолітний ІКВ' : 'Бінарний';

  const baselineBinary = sim?.comparisons.find((c) => c.codeKind === 'binary');
  const showDelta = Boolean(sim && compareBinary && codeKind !== 'binary' && baselineBinary);

  const allStatsRows: SimulationStats[] = useMemo(() => {
    if (!sim) return [];
    return [sim.primary, ...sim.comparisons];
  }, [sim]);

  const sweepChartData = useMemo(() => {
    if (!sim || !chartRun) return sim?.chart ?? [];
    return buildClientSimulationChart({
      sequence: chartRun.sequence,
      primary: chartRun.codeKind,
      compareBinary: chartRun.codeKind === 'binary' ? false : compareBinary,
      compareReedSolomon: compareRS,
    });
  }, [sim, chartRun, compareBinary, compareRS]);

  return (
    <AppLayout>
      <div className="relative overflow-hidden border-b border-cyan-900/20 bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-800 px-6 py-9 sm:px-10">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_20%_0%,rgba(34,211,238,0.35),transparent_50%)]" />
        <div className="relative max-w-4xl">
          <p className="text-cyan-200/90 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Монте-Карло · BSC</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Симуляція каналу зв&apos;язку</h1>
          <p className="mt-3 text-sm text-cyan-100/90 max-w-2xl leading-relaxed">
            Пакети випадкових даних проходять бінарний симетричний канал (ймовірність переключення біта p). Для ІКВ-кодів
            виконується кодування та декодування; порівняйте з бінарною передачею без коду та аналітичною оцінкою RS(255,191).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/cyclic-codes"
              className="inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              Лабораторія: циклічні коди
            </Link>
            <Link
              href="/vector-codes"
              className="inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20"
            >
              Лабораторія: монолітні коди
            </Link>
            <Link href="/generator" className="inline-flex rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20">
              Генератор ІКВ
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Параметри каналу</h2>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">ІКВ-послідовність</label>
                <input
                  value={sequenceText}
                  onChange={(e) => setSequenceText(e.target.value)}
                  className={labInputCyclic}
                  placeholder="1, 3, 2, 7"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {SEQUENCE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setSequenceText(p.seq.join(', '))}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-cyan-50 hover:border-cyan-200"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {sequence.length < 2 && (
                  <p className="text-xs text-amber-700 mt-1">Потрібно щонайменше два додатні цілі числа.</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">Основний тип коду</p>
                <div className="grid gap-2 sm:grid-cols-3 sm:items-stretch">
                  {PRIMARY_OPTIONS.map((opt) => (
                    <button
                      key={opt.kind}
                      type="button"
                      onClick={() => {
                        setCodeKind(opt.kind);
                        if (opt.kind === 'binary') setCompareBinary(false);
                      }}
                      className={`rounded-xl border-2 px-3 py-3 text-left text-sm transition min-h-[5.75rem] flex flex-col ${
                        codeKind === opt.kind
                          ? 'border-cyan-600 bg-cyan-50 shadow-sm ring-1 ring-cyan-600/20'
                          : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-slate-900">{opt.label}</span>
                      <span className="text-xs text-slate-600 mt-1 block leading-snug flex-1">{opt.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">Пакетів симуляції</label>
                  <span className="text-cyan-700 font-bold text-sm tabular-nums">{totalPackets.toLocaleString('uk-UA')}</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={20000}
                  step={200}
                  value={totalPackets}
                  onChange={(e) => setTotalPackets(Number(e.target.value))}
                  className="w-full h-2 rounded-full bg-slate-200 accent-cyan-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">Максимум на бекенді: 50 000 пакетів.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-slate-600">Ймовірність помилки біта p</label>
                  <span className="text-cyan-700 font-bold text-sm tabular-nums">{errorPct}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={45}
                  step={1}
                  value={errorPct}
                  onChange={(e) => setErrorProb(Number(e.target.value) / 100)}
                  className="w-full h-2 rounded-full bg-slate-200 accent-cyan-600 cursor-pointer mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setErrorProb(p / 100)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        errorPct === p ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                {codeKind !== 'binary' && (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Порівняти з бінарним каналом</p>
                      <p className="text-xs text-slate-500">Той самий p, без корегуючого коду</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={compareBinary}
                      onClick={() => setCompareBinary(!compareBinary)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${compareBinary ? 'bg-cyan-600' : 'bg-slate-300'}`}
                    >
                      <span
                        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          compareBinary ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Показати Ріда–Соломона (оцінка)</p>
                    <p className="text-xs text-slate-500">Аналітична модель на графіку порівняння</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={compareRS}
                    onClick={() => setCompareRS(!compareRS)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${compareRS ? 'bg-emerald-600' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        compareRS ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-800">Зберігати запуск у історію</p>
                    <p className="text-xs text-slate-500">Запис у базу для вашого акаунту</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={saveRun}
                    onClick={() => setSaveRun(!saveRun)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${saveRun ? 'bg-slate-800' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        saveRun ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => runMutation.mutate()}
                disabled={loading || !accessToken || sequence.length < 2}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 disabled:opacity-50"
              >
                {loading ? 'Симуляція…' : 'Запустити симуляцію'}
              </button>
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
              <p className="text-xs text-slate-500 text-center">
                Основна симуляція — на сервері (Monte Carlo). Крива vs p після запуску будується в браузері на коротших
                вибірках по сітці p.
              </p>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <StatCard
              title="Успішність декодування"
              value={sim ? formatPctPlain(sim.primary.successRate * 100, 1) : '—'}
              sub={sim ? `відновлено ${sim.primary.recoveredPackets.toLocaleString('uk-UA')} / ${sim.primary.packets.toLocaleString('uk-UA')} пакетів` : undefined}
              accent="orange"
            />
            <StatCard
              title="Частота біт-помилок у каналі"
              value={sim ? formatPctPlain(sim.primary.bitFlipRate * 100, 2) : '—'}
              sub={sim ? `усього біт: ${sim.primary.totalBits.toLocaleString('uk-UA')}` : undefined}
              accent="blue"
            />
            {showDelta && (
              <StatCard
                title="Перевага vs бінарний"
                value={`${sim!.delta > 0 ? '+' : ''}${sim!.delta.toFixed(1)} п.п.`}
                sub="Різниця часток успішного відновлення повідомлення"
                accent="emerald"
              />
            )}
            {historySavedAck && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-3 text-xs text-emerald-950 shadow-sm"
                role="status"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white" aria-hidden>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>
                  <span className="font-semibold">Збережено в історію.</span> Запис з&apos;явиться в таблиці «Останні запуски» нижче.
                </span>
              </div>
            )}
          </div>
        </div>

        {sim && (
          <>
            <StatsTable rows={allStatsRows} title="Порівняння за один запуск (обраний p)" />
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Крива успішності vs p</h2>
              <details className="mt-2 mb-4 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2 text-sm text-slate-700 open:bg-slate-50 open:shadow-inner">
                <summary className="cursor-pointer select-none font-medium text-slate-800 hover:text-cyan-800">
                  Як побудовано цей графік?
                </summary>
                <p className="mt-2 border-t border-slate-200 pt-2 text-xs leading-relaxed text-slate-600">
                  Криву по p будується <span className="font-medium">у браузері</span> (короткий Monte Carlo на кожній
                  точці), щоб вісь містила малі p (0,2%–1%) і лінія Р–С не була «завжди нуль» через застарілий
                  відповідь сервера. Числа в картках і таблиці вище — з повної серверної симуляції на{' '}
                  <span className="font-semibold tabular-nums text-slate-800">{totalPackets.toLocaleString('uk-UA')}</span>{' '}
                  пакетів для обраного p. Р–С на графіку — аналітична RS(255,191) (до 32 байтових символів на блок);
                  при середніх і великих p успіх блоку в цій i.i.d. моделі швидко падає — це очікувано.
                </p>
              </details>
              <SweepChart
                data={sweepChartData}
                compareBinary={compareBinary && codeKind !== 'binary'}
                compareRS={compareRS}
                primaryLabel={primaryLabel}
              />
            </section>
          </>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900">Останні запуски</h2>
            <button
              type="button"
              onClick={() => void runsQuery.refetch()}
              disabled={runsQuery.isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-900 disabled:opacity-60"
            >
              <svg
                className={`h-3.5 w-3.5 shrink-0 ${runsQuery.isFetching ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {runsQuery.isFetching ? 'Оновлення…' : 'Оновити'}
            </button>
          </div>
          {runsQuery.isLoading ? (
            <p className="text-sm text-slate-600">Завантаження…</p>
          ) : runsQuery.data && runsQuery.data.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-700 border-b border-slate-200 bg-slate-50">
                    <th className="px-3 py-2.5 font-bold">Час</th>
                    <th className="px-3 py-2.5 font-bold">Код</th>
                    <th className="px-3 py-2.5 font-bold text-right">Пакети</th>
                    <th className="px-3 py-2.5 font-bold text-right">p</th>
                    <th className="px-3 py-2.5 font-bold text-right">Успішність</th>
                  </tr>
                </thead>
                <tbody>
                  {runsQuery.data.slice(0, 15).map((run: SimulationRunSummary) => (
                    <tr
                      key={run.id}
                      className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50"
                    >
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap tabular-nums">
                        {new Date(run.createdAt).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">{codeKindUa(run.codeKind)}</td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium text-slate-800">
                        {run.packets.toLocaleString('uk-UA')}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-medium text-slate-800">
                        {formatPct(run.errorProbability, 0)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right font-mono tabular-nums font-bold ${successStrengthClass(run.successRate)}`}
                      >
                        {formatPctPlain(run.successRate * 100, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">
              Ще немає збережених запусків. Увімкніть «Зберігати запуск у історію» та запустіть симуляцію — рядок
              з&apos;явиться тут без технічних ідентифікаторів.
            </p>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
