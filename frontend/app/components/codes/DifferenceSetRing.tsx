'use client';

interface DifferenceSetRingProps {
  /** Block length S (nodes 0 … S−1). */
  S: number;
  /** Positions belonging to the cyclic difference set. */
  differenceSet: number[];
  className?: string;
}

/**
 * Circular layout of Z_S with highlighted difference-set positions (ІКВ partial sums mod S).
 */
export default function DifferenceSetRing({ S, differenceSet, className = '' }: DifferenceSetRingProps) {
  if (S < 2) return null;

  const set = new Set(differenceSet);
  const cx = 110;
  const cy = 110;
  const R = 72;
  const labelR = R + 22;

  const nodes = Array.from({ length: S }, (_, i) => i);

  return (
    <div className={`rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-white p-4 ${className}`}>
      <p className="text-xs font-semibold text-indigo-900/80 mb-3 uppercase tracking-wider">
        Кільце Z<sub>S</sub>, S = {S} · множина D (часткові суми ІКВ)
      </p>
      <svg viewBox="0 0 220 220" className="w-full max-w-[min(100%,320px)] mx-auto" role="img" aria-label="Кільце індексів">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 6" />
        {nodes.map((i) => {
          const angle = (-Math.PI / 2 + (2 * Math.PI * i) / S) % (2 * Math.PI);
          const x = cx + R * Math.cos(angle);
          const y = cy + R * Math.sin(angle);
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const inD = set.has(i);
          return (
            <g key={i}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke={inD ? '#818cf8' : '#e2e8f0'} strokeWidth={inD ? 2 : 0.5} opacity={inD ? 0.9 : 0.35} />
              <circle
                cx={x}
                cy={y}
                r={inD ? 9 : 5}
                fill={inD ? '#4f46e5' : '#cbd5e1'}
                stroke={inD ? '#312e81' : '#94a3b8'}
                strokeWidth="1.5"
                filter={inD ? 'url(#glow)' : undefined}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600"
                style={{ fontSize: S > 24 ? 7 : 9 }}
              >
                {i}
              </text>
            </g>
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-indigo-950 font-bold" style={{ fontSize: 12 }}>
          S={S}
        </text>
      </svg>
      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
        Фіолетові вершини — елементи множини відмінностей D, що задає рядки перевірочної матриці H (циклічні зсуви
        індикатора D).
      </p>
    </div>
  );
}
