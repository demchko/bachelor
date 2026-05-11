'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AppLayout from '@/app/components/AppLayout';
import {
  codesApi,
  type DecodeResult,
  type EfficiencyResult,
  type EncodeResult,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

type CodeKind = 'cyclic' | 'monolithic';

interface Props {
  title: string;
  description: string;
  kind: CodeKind;
}

function flipBit(s: string, i: number) {
  const arr = s.split('');
  arr[i] = arr[i] === '1' ? '0' : '1';
  return arr.join('');
}

export default function CodePlayground({ title, description, kind }: Props) {
  const { accessToken } = useAuth();
  const [sequenceText, setSequenceText] = useState('1, 3, 2, 7');
  const [data, setData] = useState(kind === 'cyclic' ? '1011' : '0011');
  const [encoded, setEncoded] = useState<EncodeResult | null>(null);
  const [received, setReceived] = useState('');
  const [decoded, setDecoded] = useState<DecodeResult | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyResult | null>(null);
  const [n, setN] = useState(10);
  const [r, setR] = useState(2);

  const sequence = sequenceText
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((v) => Number.isFinite(v) && v > 0);

  const encodeMutation = useMutation({
    mutationFn: () => {
      const fn = kind === 'cyclic' ? codesApi.cyclicEncode : codesApi.monolithicEncode;
      return fn(accessToken!, sequence, data);
    },
    onSuccess: (result) => {
      setEncoded(result);
      setReceived(result.codeword);
      setDecoded(null);
    },
  });

  const decodeMutation = useMutation({
    mutationFn: () => {
      const fn = kind === 'cyclic' ? codesApi.cyclicDecode : codesApi.monolithicDecode;
      return fn(accessToken!, sequence, received, encoded?.codeword);
    },
    onSuccess: setDecoded,
  });

  const efficiencyMutation = useMutation({
    mutationFn: () => codesApi.efficiency(accessToken!, n, r, kind),
    onSuccess: setEfficiency,
  });

  const loading = encodeMutation.isPending || decodeMutation.isPending || efficiencyMutation.isPending;
  const error =
    encodeMutation.error?.message ??
    decodeMutation.error?.message ??
    efficiencyMutation.error?.message ??
    null;

  const introduceError = (idx: number) => {
    if (received) setReceived(flipBit(received, idx));
  };

  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </header>

      <main className="flex-1 px-8 py-8 space-y-6 max-w-5xl">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Кодування</h2>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">ІКВ-послідовність</label>
            <input
              value={sequenceText}
              onChange={(e) => setSequenceText(e.target.value)}
              placeholder="1, 3, 2, 7"
              className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Дані (бітовий рядок)</label>
            <input
              value={data}
              onChange={(e) => setData(e.target.value.replace(/[^01]/g, ''))}
              className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <button
            onClick={() => encodeMutation.mutate()}
            disabled={loading || sequence.length < 2}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Кодування…' : 'Закодувати'}
          </button>

          {encoded && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm space-y-2">
              <p>
                <span className="text-gray-500">Кодове слово:</span>{' '}
                <span className="font-mono text-gray-900 break-all">{encoded.codeword}</span>
              </p>
              <p className="text-xs text-gray-500">
                Довжина блоку n = {encoded.blockLength}, інформаційні біти k = {encoded.dataLength}
                {encoded.redundancy !== undefined ? `, надмірність = ${encoded.redundancy}` : ''}
              </p>
            </div>
          )}
        </section>

        {encoded && (
          <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Канал з помилками + декодування</h2>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Прийняте слово (натисніть біт, щоб інвертувати)
              </label>
              <div className="mt-2 flex flex-wrap gap-1 font-mono text-sm">
                {received.split('').map((bit, idx) => (
                  <button
                    key={idx}
                    onClick={() => introduceError(idx)}
                    className={`w-7 h-7 rounded border font-bold ${
                      bit === encoded.codeword[idx]
                        ? 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        : 'border-red-400 text-red-600 bg-red-50'
                    }`}
                    title={`Біт ${idx}`}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => decodeMutation.mutate()}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
            >
              Декодувати
            </button>

            {decoded && (
              <div
                className={`border rounded-lg p-4 text-sm space-y-2 ${
                  decoded.uncorrected
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p>
                  <span className="text-gray-500">Виправлене слово:</span>{' '}
                  <span className="font-mono break-all">{decoded.corrected}</span>
                </p>
                <p>
                  <span className="text-gray-500">Декодовано:</span>{' '}
                  <span className="font-mono break-all">{decoded.decoded}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Виявлено помилок: {decoded.detectedErrors}, виправлено: {decoded.correctedErrors}
                  {decoded.uncorrected ? ' — деякі помилки не виправлені' : ''}
                </p>
                {decoded.errorPositions.length > 0 && (
                  <p className="text-xs text-gray-500">
                    Позиції виправлених помилок: {decoded.errorPositions.join(', ')}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Аналітика ефективності</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">n (розрядність)</label>
              <input
                type="number"
                min={4}
                max={64}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">r (помилок)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={r}
                onChange={(e) => setR(Number(e.target.value))}
                className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => efficiencyMutation.mutate()}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg transition"
              >
                Розрахувати
              </button>
            </div>
          </div>
          {efficiency && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm grid grid-cols-2 gap-y-2">
              <span className="text-gray-500">Виявлено помилкових слів N₁:</span>
              <span className="font-mono text-gray-900">{efficiency.detectable}</span>
              <span className="text-gray-500">Виправлено N₂:</span>
              <span className="font-mono text-gray-900">{efficiency.correctable}</span>
              <span className="text-gray-500">Ефективність виявлення:</span>
              <span className="font-bold text-emerald-700">{efficiency.detectablePct}%</span>
              <span className="text-gray-500">Ефективність виправлення:</span>
              <span className="font-bold text-blue-700">{efficiency.correctablePct}%</span>
            </div>
          )}
        </section>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>
        )}
      </main>
    </AppLayout>
  );
}
