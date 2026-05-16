'use client';

interface MonolithicPacketBarProps {
  bits: string;
  blockLength: number;
}

/** Visualize monolithic word as 1^w | 0^{n−w} “packet”. */
export default function MonolithicPacketBar({ bits, blockLength }: MonolithicPacketBarProps) {
  if (!bits || blockLength < 1) return null;
  const chunks: string[] = [];
  for (let i = 0; i < bits.length; i += blockLength) {
    chunks.push(bits.slice(i, i + blockLength));
  }

  return (
    <div className="space-y-3">
      {chunks.map((word, bi) => {
        const w = word.split('').filter((c) => c === '1').length;
        const onesPct = (w / word.length) * 100;
        return (
          <div key={bi} className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3">
            <div className="flex justify-between text-xs text-amber-900/80 mb-1">
              <span>Блок #{bi + 1}</span>
              <span>
                вага w = {w} · пакет 1<sup>w</sup>0<sup>{word.length - w}</sup>
              </span>
            </div>
            <div className="h-10 rounded-lg overflow-hidden flex border border-amber-300/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold transition-all duration-500"
                style={{ width: `${onesPct}%` }}
              >
                {onesPct > 12 ? '1…' : ''}
              </div>
              <div
                className="h-full bg-gradient-to-b from-slate-200 to-slate-400 flex items-center justify-center text-slate-700 text-xs font-bold transition-all duration-500"
                style={{ width: `${100 - onesPct}%` }}
              >
                {100 - onesPct > 12 ? '0…' : ''}
              </div>
            </div>
            <p className="font-mono text-[11px] text-slate-600 mt-2 break-all tracking-wide">{word}</p>
          </div>
        );
      })}
    </div>
  );
}
