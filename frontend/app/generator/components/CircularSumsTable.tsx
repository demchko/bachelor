'use client';

import type { CircularSum } from '@/lib/api';

interface Props {
  sums: CircularSum[];
  expectedR: number;
  countsByValue: Record<number, number>;
  hovered: { start: number; length: number } | null;
  onHover: (h: { start: number; length: number } | null) => void;
}

export default function CircularSumsTable({
  sums,
  expectedR,
  countsByValue,
  hovered,
  onHover,
}: Props) {
  if (!sums.length) {
    return (
      <p className="text-xs text-gray-400 text-center py-6">
        Немає даних для відображення
      </p>
    );
  }

  return (
    <div
      className="overflow-auto max-h-72 rounded-lg border border-gray-200"
      onMouseLeave={() => onHover(null)}
    >
      <table className="w-full text-sm">
        <thead className="bg-[#1a2332] text-white sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 text-left font-medium">#</th>
            <th className="px-3 py-2 text-left font-medium">Початок</th>
            <th className="px-3 py-2 text-left font-medium">Довж.</th>
            <th className="px-3 py-2 text-left font-medium">Елементи</th>
            <th className="px-3 py-2 text-right font-medium">Сума</th>
            <th className="px-3 py-2 text-right font-medium" title="Скільки разів значення суми зустрічається серед усіх кругових сум">
              Кратн.
            </th>
          </tr>
        </thead>
        <tbody>
          {sums.map((row, i) => {
            const isHovered =
              hovered &&
              hovered.start === row.start &&
              hovered.length === row.length;
            const occ = countsByValue[row.sum] ?? 0;
            const occMatch = occ === expectedR;
            return (
              <tr
                key={`${row.start}-${row.length}-${i}`}
                onMouseEnter={() =>
                  onHover({ start: row.start, length: row.length })
                }
                className={`cursor-pointer transition-colors ${
                  isHovered
                    ? 'bg-emerald-50'
                    : i % 2 === 0
                    ? 'bg-white'
                    : 'bg-gray-50'
                }`}
              >
                <td className="px-3 py-1.5 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-3 py-1.5 font-mono text-gray-700">
                  k<sub>{row.start}</sub>
                </td>
                <td className="px-3 py-1.5 text-gray-600">{row.length}</td>
                <td className="px-3 py-1.5 font-mono text-gray-700">
                  {row.elements.join('+')}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-gray-900">
                  {row.sum}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.5rem] rounded text-xs font-mono font-semibold px-1.5 py-0.5 ${
                      occMatch
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                    title={
                      occMatch
                        ? `Кратність відповідає R=${expectedR}`
                        : `Очікувана кратність R=${expectedR}, фактична — ${occ}`
                    }
                  >
                    {occ}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
