'use client';

interface BitTapeProps {
  bits: string;
  reference?: string;
  onFlip: (index: number) => void;
  label?: string;
}

export default function BitTape({ bits, reference, onFlip, label }: BitTapeProps) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-2">{label}</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-700/90 bg-slate-900 shadow-inner">
        <div className="inline-flex flex-nowrap gap-1 p-3 font-mono text-sm min-w-0">
          {bits.split('').map((bit, idx) => {
            const ref = reference?.[idx];
            const flipped = ref !== undefined && bit !== ref;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onFlip(idx)}
                title={`Позиція ${idx}: клацніть, щоб інвертувати біт`}
                className={`shrink-0 min-w-[1.75rem] h-8 px-1 rounded-md font-bold transition-all ${
                  flipped
                    ? 'bg-rose-600/35 text-rose-50 border-2 border-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.35)]'
                    : 'bg-slate-800 text-emerald-100 border border-slate-600 hover:bg-slate-700'
                }`}
              >
                {bit}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
