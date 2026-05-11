'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppLayout from '@/app/components/AppLayout';
import {
  simulationApi,
  type CodeKind,
  type SimulationResult,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface CodeOption {
  label: string;
  sequence: number[];
  codeKind: CodeKind;
}

const CODE_OPTIONS: CodeOption[] = [
  { label: 'IRB {1,3,2,7} — n=4, циклічний', sequence: [1, 3, 2, 7], codeKind: 'irb-cyclic' },
  { label: 'IRB {1,2,4} — n=3, циклічний', sequence: [1, 2, 4], codeKind: 'irb-cyclic' },
  { label: 'IRB {1,3,2,7} — n=4, монолітний', sequence: [1, 3, 2, 7], codeKind: 'irb-monolithic' },
  { label: 'IRB {1,3,10,2,5} — n=5, циклічний', sequence: [1, 3, 10, 2, 5], codeKind: 'irb-cyclic' },
];

interface ChartPoint {
  errorRate: number;
  irb: number;
  binary?: number;
  reedSolomon?: number;
}

function SimpleChart({
  data,
  compareBinary,
  compareRS,
}: {
  data: ChartPoint[];
  compareBinary: boolean;
  compareRS: boolean;
}) {
  const maxVal = 100;
  const h = 160;
  const w = 500;
  const pad = { top: 10, right: 10, bottom: 30, left: 36 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const xs = data.map((_, i) => pad.left + (i / Math.max(data.length - 1, 1)) * innerW);
  const toY = (v: number) => pad.top + innerH - (v / maxVal) * innerH;

  const lines: { key: keyof ChartPoint; color: string; label: string }[] = [
    { key: 'irb', color: '#e67e22', label: 'IRB' },
    ...(compareBinary ? [{ key: 'binary' as keyof ChartPoint, color: '#3b82f6', label: 'Бінарний' }] : []),
    ...(compareRS ? [{ key: 'reedSolomon' as keyof ChartPoint, color: '#10b981', label: 'Ріда-Соломона' }] : []),
  ];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            y1={toY(v)}
            x2={w - pad.right}
            y2={toY(v)}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <text
            x={pad.left - 4}
            y={toY(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize="9"
            fill="#9ca3af"
          >
            {v}
          </text>
        </g>
      ))}
      {lines.map(({ key, color }) => {
        const pts = data.map((d, i) => `${xs[i]},${toY(Number(d[key] ?? 0))}`).join(' ');
        return (
          <g key={key}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            {data.map((d, i) => (
              <circle key={i} cx={xs[i]} cy={toY(Number(d[key] ?? 0))} r="3" fill={color} />
            ))}
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={h - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {d.errorRate}%
        </text>
      ))}
      {lines.map(({ color, label }, i) => (
        <g key={label} transform={`translate(${pad.left + i * 80}, ${pad.top})`}>
          <line x1="0" y1="5" x2="14" y2="5" stroke={color} strokeWidth="2" />
          <circle cx="7" cy="5" r="2.5" fill={color} />
          <text x="18" y="9" fontSize="9" fill="#6b7280">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function SimulationPage() {
  const { accessToken } = useAuth();
  const [totalPackets, setTotalPackets] = useState(1000);
  const [errorProb, setErrorProb] = useState(0.15);
  const [optionIdx, setOptionIdx] = useState(0);
  const [compareBinary, setCompareBinary] = useState(true);
  const [compareRS, setCompareRS] = useState(false);
  const [sim, setSim] = useState<SimulationResult | null>(null);

  const option = CODE_OPTIONS[optionIdx];

  const runMutation = useMutation({
    mutationFn: () =>
      simulationApi.run(accessToken!, {
        sequence: option.sequence,
        packets: totalPackets,
        errorProbability: errorProb,
        codeKind: option.codeKind,
        compareBinary,
        compareReedSolomon: compareRS,
        save: true,
      }),
    onSuccess: setSim,
  });

  const loading = runMutation.isPending;
  const error = runMutation.error?.message ?? null;

  const errorPct = Math.round(errorProb * 100);
  const presets = [5, 15, 30];

  const successPct = sim ? Math.round(sim.primary.successRate * 1000) / 10 : null;
  const flipPct = sim ? Math.round(sim.primary.bitFlipRate * 1000) / 10 : null;

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Симуляція каналу зв&apos;язку</h1>
        <p className="text-sm text-gray-500 mt-0.5">Моделювання передачі даних з ІКВ-кодуванням</p>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="font-semibold text-gray-900">Налаштування симуляції</h2>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Кількість пакетів
                </label>
                <span className="text-orange-500 font-bold text-sm">
                  {totalPackets.toLocaleString('uk')}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={totalPackets}
                onChange={(e) => setTotalPackets(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Імовірність помилки
                </label>
                <span className="text-orange-500 font-bold text-sm">{errorPct}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                step={1}
                value={errorPct}
                onChange={(e) => setErrorProb(Number(e.target.value) / 100)}
                className="w-full h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-orange-500 mb-3"
              />
              <div className="flex gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setErrorProb(p / 100)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      errorPct === p
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Тип ІКВ-коду
              </label>
              <div className="relative">
                <select
                  value={optionIdx}
                  onChange={(e) => setOptionIdx(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-sm appearance-none bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none cursor-pointer"
                >
                  {CODE_OPTIONS.map((opt, i) => (
                    <option key={opt.label} value={i}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {[
              { label: 'Порівняти з бінарним (без кодування)', value: compareBinary, set: setCompareBinary },
              { label: 'Порівняти з кодом Ріда-Соломона', value: compareRS, set: setCompareRS },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <button
                  type="button"
                  onClick={() => set(!value)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-[#1a2332]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}

            <div>
              <button
                onClick={() => runMutation.mutate()}
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition shadow-sm disabled:opacity-60"
              >
                {loading ? 'Симуляція…' : 'Запустити симуляцію'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                {loading ? 'Канал моделюється на сервері' : 'Розрахунок виконується на бекенді'}
              </p>
              {error && <p className="text-center text-xs text-red-500 mt-2">{error}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Успішних передач
              </p>
              {sim ? (
                <>
                  <p className="text-2xl font-bold text-gray-900">
                    {sim.primary.recoveredPackets.toLocaleString('uk')}{' '}
                    <span className="text-gray-400 font-normal">
                      / {sim.primary.packets.toLocaleString('uk')}
                    </span>
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      sim.delta >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}
                  >
                    {sim.delta >= 0 ? '↗' : '↘'}
                    {sim.delta > 0 ? '+' : ''}
                    {sim.delta}% vs бінарний
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-300">— / —</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Частота зміни бітів
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {flipPct !== null ? `${flipPct}%` : '—'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Успішність передачі
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {successPct !== null ? `${successPct}%` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Відсоток успішних передач vs Імовірність помилки
          </h2>
          {sim ? (
            <SimpleChart data={sim.chart} compareBinary={compareBinary} compareRS={compareRS} />
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Запустіть симуляцію для відображення графіка
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
