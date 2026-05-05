'use client';

import type { IrbPreset } from '@/lib/api';

interface Props {
  presets: IrbPreset[];
  loading: boolean;
  onLoad: (preset: IrbPreset) => void;
}

export default function PresetsPanel({ presets, loading, onLoad }: Props) {
  if (loading) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Завантаження каталогу…
      </p>
    );
  }
  if (!presets.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Каталог порожній
      </p>
    );
  }

  const grouped = presets.reduce<Record<string, IrbPreset[]>>((acc, p) => {
    const key = `R=${p.r}`;
    (acc[key] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Перевірені послідовності з монографій В. В. Ризнюка
      </p>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
            {group}
          </h4>
          <div className="space-y-2">
            {items.map((p, i) => (
              <button
                key={`${p.n}-${p.r}-${i}`}
                type="button"
                onClick={() => onLoad(p)}
                className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white hover:border-orange-400 hover:bg-orange-50 transition p-3 text-left"
              >
                <div>
                  <div className="font-mono text-sm text-gray-800">
                    {`{${p.sequence.join(', ')}}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    n={p.n}, R={p.r}, S={p.s}
                  </div>
                </div>
                <span className="text-xs text-orange-600 font-semibold">→</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
