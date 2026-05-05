'use client';

import type { IrbProperties } from '@/lib/api';

interface Props {
  props: IrbProperties | null;
  loading: boolean;
  onApplySequence?: (sequence: number[]) => void;
}

function Stat({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
      <span className={`text-sm text-gray-900 font-semibold ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default function PropertiesPanel({ props, loading, onApplySequence }: Props) {
  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-4">Розрахунок властивостей…</p>;
  }
  if (!props) {
    return <p className="text-sm text-gray-400 text-center py-4">Властивості зʼявляться після розрахунку</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Числові характеристики
        </h4>
        <Stat label="n (елементів)" value={props.n} mono />
        <Stat label="R (кратність)" value={props.r} mono />
        <Stat label="S = n(n−1)/R + 1" value={props.s} mono />
        <Stat label="Сума елементів" value={`${props.totalSum} / ${props.expectedSum}`} mono />
        <Stat label="Кратність факт. (Rₑ)" value={props.redundancyEffective.toFixed(3)} mono />
        <Stat label="Унікальних кругових сум" value={props.distinctRingSums} mono />
        <Stat label="Розмах (max − min)" value={props.spread} mono />
        <Stat label="Інф. ємність log₂(S−1)" value={`${props.capacityBits.toFixed(3)} біт`} mono />
        <Stat label="Біт на символ" value={`${props.bitsPerSymbol.toFixed(3)} б/симв`} mono />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Канонічна форма
        </h4>
        <div className="font-mono text-sm bg-gray-50 rounded p-2 text-gray-800">
          {`{${props.canonical.join(', ')}}`}
        </div>
        {onApplySequence &&
          props.canonical.join(',') !== props.sequence.join(',') && (
            <button
              type="button"
              onClick={() => onApplySequence(props.canonical)}
              className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              → Застосувати канонічну форму
            </button>
          )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Дзеркальне відображення
        </h4>
        <div className="font-mono text-sm bg-gray-50 rounded p-2 text-gray-800">
          {`{${props.reflection.join(', ')}}`}
        </div>
        {onApplySequence && (
          <button
            type="button"
            onClick={() => onApplySequence(props.reflection)}
            className="mt-2 text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            → Застосувати дзеркальне
          </button>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Циклічні зсуви ({props.rotations.length})
        </h4>
        <div className="space-y-1 max-h-40 overflow-auto">
          {props.rotations.map((rot, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onApplySequence?.(rot)}
              className="w-full text-left font-mono text-xs bg-gray-50 hover:bg-orange-50 hover:text-orange-700 rounded px-2 py-1.5 text-gray-700 transition"
            >
              <span className="text-gray-400 mr-2">σ{i}:</span>
              {`{${rot.join(', ')}}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
