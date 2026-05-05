'use client';

import type { IrbResult } from '@/lib/api';

interface Props {
  variants: IrbResult[];
  loading: boolean;
  onLoad: (variant: IrbResult) => void;
  onRefresh: () => void;
}

export default function VariantsPanel({ variants, loading, onLoad, onRefresh }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Альтернативні ІКВ для тих самих (n, R)
        </p>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-60"
        >
          {loading ? 'Пошук…' : '↻ Оновити'}
        </button>
      </div>

      {!loading && variants.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">
          Варіантів не знайдено. Спробуйте інші параметри.
        </p>
      )}

      {variants.map((variant, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onLoad(variant)}
          className="w-full text-left rounded-lg border border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition p-3"
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-semibold uppercase text-gray-400">
              Варіант №{i + 1}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                variant.isValid
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {variant.isValid ? 'Дійсний' : 'Недійсний'}
            </span>
          </div>
          <div className="font-mono text-sm text-gray-800">
            {`{${variant.sequence.join(', ')}}`}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            n={variant.n}, R={variant.r}, S={variant.s}
          </div>
        </button>
      ))}
    </div>
  );
}
