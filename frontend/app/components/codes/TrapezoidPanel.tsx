'use client';

import { useQuery } from '@tanstack/react-query';
import { codesApi, type TrapezoidRow } from '@/lib/api';

export default function TrapezoidPanel({ accessToken }: { accessToken: string | null }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['codes-trapezoid', accessToken],
    queryFn: () => codesApi.trapezoid(accessToken!, 14),
    enabled: !!accessToken,
  });

  if (!accessToken) return null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-500 animate-pulse">
        Завантаження трапеційної таблиці…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
        {(error as Error).message}
      </div>
    );
  }

  const rows = data?.rows ?? [];
  const maxCoeff = Math.max(...rows.flatMap((r: TrapezoidRow) => r.coefficients), 1);

  return (
    <div className="rounded-2xl border border-teal-200/90 bg-gradient-to-br from-teal-50/80 to-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-teal-950 mb-1">Трапеційна схема коефіцієнтів</h3>
      <p className="text-xs text-teal-900/70 mb-4 leading-relaxed">
        За роботою В. В. Різника та співавт. (UJIT, 2021): підрахунок комбінацій для аналізу завадостійкості
        монолітних кодів — кожен рядок відповідає довжині n, стовпці утворюють симетричну «трапецію».
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-teal-800/80 border-b border-teal-200">
              <th className="py-2 pr-3">n</th>
              <th className="py-2 pr-3">Коефіцієнти</th>
              <th className="py-2 pr-3">Сума</th>
              <th className="py-2">n·сума</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: TrapezoidRow) => (
              <tr key={row.n} className="border-b border-teal-100/80 hover:bg-teal-50/50">
                <td className="py-1.5 pr-3 font-mono font-semibold text-slate-800">{row.n}</td>
                <td className="py-1.5 pr-3">
                  <div className="flex gap-0.5 flex-wrap max-w-[220px]">
                    {row.coefficients.map((c, i) => (
                      <span
                        key={i}
                        className="inline-block h-5 min-w-[1.1rem] rounded-sm text-center leading-5 text-[10px] font-mono text-white"
                        style={{
                          backgroundColor: `rgba(13, 148, 136, ${0.35 + (0.55 * c) / maxCoeff})`,
                        }}
                        title={`${c}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-1.5 pr-3 font-mono text-slate-700">{row.sum}</td>
                <td className="py-1.5 font-mono text-slate-600">{row.xn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
