'use client';

import type { IrbConfigItem } from '@/lib/api';

interface Props {
  items: IrbConfigItem[];
  loading: boolean;
  onLoad: (item: IrbConfigItem) => void;
  onRemove: (id: string) => void;
}

export default function SavedPanel({ items, loading, onLoad, onRemove }: Props) {
  if (loading) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">Завантаження…</p>
    );
  }
  if (!items.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        У вас ще немає збережених конфігурацій
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-semibold text-gray-700 truncate">
              {item.label ?? `IRB(n=${item.n}, R=${item.r})`}
            </span>
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                item.isValid
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {item.isValid ? 'OK' : '⚠'}
            </span>
          </div>
          <div className="font-mono text-xs text-gray-700 mb-1">
            {`{${item.sequence.join(', ')}}`}
          </div>
          <div className="text-[10px] text-gray-500 mb-2">
            {item.source === 'manual' ? 'ручний ввід' : 'генератор'} ·{' '}
            {new Date(item.createdAt).toLocaleString('uk-UA')}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onLoad(item)}
              className="flex-1 text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 rounded px-2 py-1 font-medium"
            >
              Завантажити
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="text-xs text-gray-400 hover:text-red-500 px-2"
              aria-label="Видалити"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
