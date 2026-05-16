'use client';

interface MatrixHeatmapProps {
  matrix: number[][];
  title: string;
  maxDisplay?: number;
}

/** Compact GF(2) matrix: rows × cols, 1 = dark cell. */
export default function MatrixHeatmap({ matrix, title, maxDisplay = 32 }: MatrixHeatmapProps) {
  if (!matrix.length) return null;
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const clipRows = Math.min(rows, maxDisplay);
  const clipCols = Math.min(cols, maxDisplay);
  const clipped = matrix.slice(0, clipRows).map((row) => row.slice(0, clipCols));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold text-slate-700 mb-2">{title}</p>
      <div
        className="inline-grid gap-px p-1 rounded-md bg-slate-300 font-mono"
        style={{ gridTemplateColumns: `repeat(${clipCols}, minmax(0, 1fr))` }}
      >
        {clipped.flatMap((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] ${cell ? 'bg-slate-900' : 'bg-white'}`}
              title={`[${ri},${ci}] = ${cell}`}
            />
          )),
        )}
      </div>
      {(rows > clipRows || cols > clipCols) && (
        <p className="text-[10px] text-slate-400 mt-1">
          Показано {clipRows}×{clipCols} з {rows}×{cols}
        </p>
      )}
    </div>
  );
}
