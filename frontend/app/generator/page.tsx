'use client';

import { useState, useCallback } from 'react';
import AppLayout from '@/app/components/AppLayout';
import Link from 'next/link';

/* ─── Types ─────────────────────────────────────────────── */
interface IrbResult {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  valid: boolean;
  circularSums: { sum: number; elements: number[]; value: number }[];
  coverageTable: number[];
}

/* ─── Pure helpers ───────────────────────────────────────── */
function computeCircularSums(seq: number[], n: number): { sum: number; elements: number[]; value: number }[] {
  const len = seq.length;
  const results: { sum: number; elements: number[]; value: number }[] = [];
  for (let i = 0; i < len; i++) {
    let s = 0;
    const els: number[] = [];
    for (let j = 0; j <= i; j++) {
      s += seq[j];
      els.push(seq[j]);
    }
    results.push({ sum: s, elements: els, value: i + 1 });
    // circular wrap
    for (let start = 1; start < len; start++) {
      let cs = 0;
      const ces: number[] = [];
      for (let k = 0; k <= i; k++) {
        cs += seq[(start + k) % len];
        ces.push(seq[(start + k) % len]);
      }
      results.push({ sum: cs, elements: ces, value: cs });
    }
  }
  return results;
}

function generateIrb(n: number, r: number): IrbResult {
  const s = Math.floor((n * (n - 1)) / r) + 1;
  // Default well-known sequences for small n
  const known: Record<string, number[]> = {
    '4-1': [1, 3, 2, 7],
    '4-2': [1, 2, 3, 4],
    '5-1': [1, 2, 4, 8, 3],
    '5-2': [1, 2, 3, 4, 5],
    '6-1': [1, 2, 3, 7, 6, 12],
    '7-1': [1, 2, 4, 8, 16, 5, 11],
  };
  const key = `${n}-${r}`;
  const sequence = known[key] ?? Array.from({ length: n }, (_, i) => i + 1);

  // Build coverage: which values 1..s appear as circular sums
  const covered = new Set<number>();
  const len = sequence.length;
  for (let start = 0; start < len; start++) {
    let cs = 0;
    for (let i = 0; i < len; i++) {
      cs += sequence[(start + i) % len];
      if (cs >= 1 && cs <= s) covered.add(cs);
    }
  }
  const coverageTable = Array.from({ length: s }, (_, i) => i + 1);
  const valid = coverageTable.every((v) => covered.has(v));

  const circularSums: { sum: number; elements: number[]; value: number }[] = [];
  for (let start = 0; start < len; start++) {
    let cs = 0;
    const els: number[] = [];
    for (let i = 0; i < len; i++) {
      cs += sequence[(start + i) % len];
      els.push(sequence[(start + i) % len]);
      if (cs >= 1 && cs <= s) {
        circularSums.push({ sum: cs, elements: [...els], value: cs });
      }
    }
  }

  return { n, r, s, sequence, valid, circularSums, coverageTable };
}

/* ─── Ring SVG ───────────────────────────────────────────── */
function RingViz({ result }: { result: IrbResult }) {
  const { sequence, n } = result;
  const cx = 150, cy = 150, radius = 100;
  const nodes = sequence.map((val, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      val,
    };
  });

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-xs mx-auto">
      {/* Edges */}
      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % n];
        const mx = (node.x + next.x) / 2;
        const my = (node.y + next.y) / 2;
        const dx = next.x - node.x;
        const dy = next.y - node.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * 20;
        const ny = dx / len * 20;
        return (
          <g key={i}>
            <defs>
              <marker id={`arrow-${i}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#e67e22" />
              </marker>
            </defs>
            <line
              x1={node.x} y1={node.y}
              x2={next.x} y2={next.y}
              stroke="#e67e22" strokeWidth="1.5"
              markerEnd={`url(#arrow-${i})`}
            />
            <text
              x={mx + nx} y={my + ny}
              textAnchor="middle" dominantBaseline="middle"
              fill="#e67e22" fontSize="11" fontFamily="monospace"
            >
              {node.val}
            </text>
          </g>
        );
      })}
      {/* Nodes */}
      {nodes.map((node, i) => (
        <g key={i}>
          <circle cx={node.x} cy={node.y} r="18" fill="#1e3a5f" />
          <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle"
            fill="white" fontSize="13" fontWeight="bold">{i}</text>
        </g>
      ))}
      {/* Center label */}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
        fill="#94a3b8" fontSize="10" fontFamily="monospace">
        IRB {`{${sequence.join(',')}}`}
      </text>
    </svg>
  );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function GeneratorPage() {
  const [n, setN] = useState(4);
  const [r, setR] = useState(1);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [manualError, setManualError] = useState('');
  const [result, setResult] = useState<IrbResult>(() => generateIrb(4, 1));
  const [activeTab, setActiveTab] = useState<'ring' | 'graph'>('ring');

  const handleGenerate = useCallback(() => {
    if (manualMode) {
      const nums = manualInput.split(',').map((s) => parseInt(s.trim(), 10));
      if (nums.some(isNaN) || nums.length < 3) {
        setManualError('Введіть коректну послідовність (мінімум 3 числа через кому)');
        return;
      }
      setManualError('');
      const rr = r;
      const nn = nums.length;
      const s = Math.floor((nn * (nn - 1)) / rr) + 1;
      const covered = new Set<number>();
      for (let start = 0; start < nn; start++) {
        let cs = 0;
        for (let i = 0; i < nn; i++) {
          cs += nums[(start + i) % nn];
          if (cs >= 1 && cs <= s) covered.add(cs);
        }
      }
      const valid = Array.from({ length: s }, (_, i) => i + 1).every((v) => covered.has(v));
      setResult({ n: nn, r: rr, s, sequence: nums, valid, circularSums: [], coverageTable: Array.from({ length: s }, (_, i) => i + 1) });
    } else {
      setResult(generateIrb(n, r));
    }
  }, [n, r, manualMode, manualInput]);

  const s = Math.floor((n * (n - 1)) / r) + 1;

  return (
    <AppLayout>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Генератор ІКВ</h1>
        <p className="text-sm text-gray-500 mt-0.5">Генерація та аналіз інтервальних кільцевих в&apos;язанок</p>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Params ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="font-semibold text-gray-900">Параметри</h2>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Налаштування ІКВ
              </p>

              {/* N */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                  Кількість елементів (N)
                </label>
                <input
                  type="number" min={3} max={12}
                  value={n} onChange={(e) => setN(Number(e.target.value))}
                  disabled={manualMode}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">від 3 до 12</p>
              </div>

              {/* R */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                  Параметр покриття (R)
                </label>
                <input
                  type="number" min={1} max={4}
                  value={r} onChange={(e) => setR(Number(e.target.value))}
                  disabled={manualMode}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">зазвичай 1 або 2</p>
              </div>

              {/* Formula */}
              {!manualMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-mono">
                  <p className="text-gray-600">S = <span className="underline">n(n-1)</span>/R + 1</p>
                  <p className="text-orange-500 font-bold mt-1">S = {s}</p>
                </div>
              )}
            </div>

            {/* Manual toggle */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Або введіть послідовність
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-700">Ручне введення</span>
                <button
                  type="button"
                  onClick={() => { setManualMode(!manualMode); setManualError(''); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${manualMode ? 'bg-orange-500' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${manualMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {manualMode && (
                <div>
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="1, 3, 2, 7"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Введіть через кому</p>
                  {manualError && <p className="text-xs text-red-500 mt-1">{manualError}</p>}
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition"
            >
              Згенерувати
            </button>
            <button
              onClick={() => { setManualMode(true); setManualInput(result.sequence.join(', ')); }}
              className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition text-sm"
            >
              Перевірити послідовність
            </button>
          </div>

          {/* ── Center: Visualization ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Візуалізація кільця</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {(['ring', 'graph'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab === 'ring' ? 'Кільце' : 'Граф'}
                  </button>
                ))}
              </div>
            </div>

            <RingViz result={result} />

            {/* Circular sums table */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Кругові суми</h3>
              <div className="overflow-auto max-h-52 rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-[#1a2332] text-white sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Сума</th>
                      <th className="px-3 py-2 text-left font-medium">Елементи</th>
                      <th className="px-3 py-2 text-left font-medium">Значення</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.circularSums.slice(0, 30).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-1.5 text-gray-600">{i + 1}</td>
                        <td className="px-3 py-1.5 font-mono text-gray-700">{row.elements.join('+')}</td>
                        <td className="px-3 py-1.5 font-semibold text-gray-900">{row.sum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Right: Coverage table ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Таблиця покриття</h2>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {result.coverageTable.map((v) => {
                const covered = result.circularSums.some((cs) => cs.sum === v);
                return (
                  <div
                    key={v}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-bold ${covered ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {covered && (
                      <svg className="w-3 h-3 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {v}
                  </div>
                );
              })}
            </div>

            {/* Validity */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Статус перевірки
              </p>
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${result.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                {result.valid ? (
                  <>
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-emerald-700 text-sm">Дійсний ІКВ</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-red-700 text-sm">Не є дійсним ІКВ</span>
                  </>
                )}
              </div>
              {result.valid && (
                <p className="text-xs text-gray-500 mt-2">
                  Всі числа від 1 до {result.s} покриті круговими сумами.
                </p>
              )}
            </div>

            {/* Apply to */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Застосувати у:
              </p>
              <div className="space-y-2">
                <Link href="/vector-codes" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition">
                  <span>→</span> Векторний код
                </Link>
                <Link href="/cyclic-codes" className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition">
                  <span>→</span> Циклічний код
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </AppLayout>
  );
}
