/** Shared lab form controls: readable placeholders, clear focus ring. */
export const labInputPrimary =
  'mt-1 w-full rounded-xl border border-slate-400/90 bg-white px-3 py-2.5 font-mono text-sm text-slate-900 ' +
  'placeholder:text-slate-600 placeholder:font-normal ' +
  'shadow-sm outline-none transition-colors ' +
  'hover:border-slate-500 focus:border-transparent focus:ring-2 focus:ring-offset-0';

export const labInputMonolithic = `${labInputPrimary} focus:ring-amber-500/80`;
export const labInputCyclic = `${labInputPrimary} focus:ring-indigo-500/80`;

export const labNumberInput =
  'mt-1 w-full rounded-lg border border-slate-400/90 bg-white px-2 py-2 text-sm text-slate-900 ' +
  'shadow-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-slate-400';

export const labNumberInputAmber =
  'mt-1 w-full rounded-lg border border-slate-400/90 bg-white px-2 py-2 text-sm text-slate-900 ' +
  'shadow-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-amber-500/70';

export const labNumberInputIndigo =
  'mt-1 w-full rounded-lg border border-slate-400/90 bg-white px-2 py-2 text-sm text-slate-900 ' +
  'shadow-sm outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500/70';
