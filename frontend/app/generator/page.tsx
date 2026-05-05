'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/app/components/AppLayout';
import {
  irbApi,
  type IrbConfigItem,
  type IrbPreset,
  type IrbProperties,
  type IrbResult,
} from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

import InteractiveRing from './components/InteractiveRing';
import CircularSumsTable from './components/CircularSumsTable';
import PropertiesPanel from './components/PropertiesPanel';
import VariantsPanel from './components/VariantsPanel';
import PresetsPanel from './components/PresetsPanel';
import SavedPanel from './components/SavedPanel';

type RightTab = 'coverage' | 'properties' | 'variants' | 'presets' | 'saved';

interface State {
  n: number;
  r: number;
  manualMode: boolean;
  manualInput: string;
  result: IrbResult | null;
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_N'; n: number }
  | { type: 'SET_R'; r: number }
  | { type: 'TOGGLE_MANUAL' }
  | { type: 'SET_MANUAL_INPUT'; input: string }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_RESULT'; result: IrbResult }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'APPLY_SEQUENCE'; sequence: number[]; r?: number };

const N_MIN = 3;
const N_MAX = 12;
const R_MIN = 1;
const R_MAX = 6;

function clampN(value: number) {
  if (!Number.isFinite(value)) return N_MIN;
  return Math.min(N_MAX, Math.max(N_MIN, Math.round(value)));
}
function clampR(value: number) {
  if (!Number.isFinite(value)) return R_MIN;
  return Math.min(R_MAX, Math.max(R_MIN, Math.round(value)));
}
function isValidN(n: number) {
  return Number.isInteger(n) && n >= N_MIN && n <= N_MAX;
}
function isValidR(r: number) {
  return Number.isInteger(r) && r >= R_MIN && r <= R_MAX;
}

const INITIAL: State = {
  n: 4,
  r: 1,
  manualMode: false,
  manualInput: '1, 3, 2, 7',
  result: null,
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_N':
      return { ...state, n: clampN(action.n), error: null };
    case 'SET_R':
      return { ...state, r: clampR(action.r), error: null };
    case 'TOGGLE_MANUAL':
      return {
        ...state,
        manualMode: !state.manualMode,
        manualInput: !state.manualMode
          ? state.result?.sequence.join(', ') ?? state.manualInput
          : state.manualInput,
        error: null,
      };
    case 'SET_MANUAL_INPUT':
      return { ...state, manualInput: action.input, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_RESULT':
      return {
        ...state,
        result: action.result,
        n: action.result.n,
        r: action.result.r,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'APPLY_SEQUENCE':
      return {
        ...state,
        manualMode: true,
        manualInput: action.sequence.join(', '),
        n: clampN(action.sequence.length),
        r: clampR(action.r ?? state.r),
        error: null,
      };
    default:
      return state;
  }
}

function humanize(message: string): string {
  if (/n must not be greater than 12/i.test(message)) return 'N має бути в межах від 3 до 12.';
  if (/n must not be less than 3/i.test(message)) return 'N має бути в межах від 3 до 12.';
  if (/r must not be greater than 6/i.test(message)) return 'R має бути в межах від 1 до 6.';
  if (/r must not be less than 1/i.test(message)) return 'R має бути в межах від 1 до 6.';
  if (/each value in sequence must not be less than 1/i.test(message))
    return 'Кожен елемент послідовності має бути натуральним числом ≥ 1.';
  if (/sequence must contain at least/i.test(message))
    return 'Послідовність занадто коротка.';
  return message;
}

function parseManual(input: string): number[] | { error: string } {
  const tokens = input.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
  if (tokens.length < 3) {
    return { error: 'Введіть щонайменше 3 натуральних числа через кому.' };
  }
  const nums: number[] = [];
  for (const token of tokens) {
    const n = parseInt(token, 10);
    if (!Number.isFinite(n) || n < 1) {
      return { error: `Невалідне значення: "${token}". Дозволено лише натуральні числа ≥ 1.` };
    }
    nums.push(n);
  }
  if (nums.length > 20) {
    return { error: 'Максимальна довжина послідовності — 20 елементів.' };
  }
  return nums;
}

export default function GeneratorPage() {
  const { accessToken } = useAuth();
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const [rightTab, setRightTab] = useState<RightTab>('coverage');
  const [hoveredSum, setHoveredSum] = useState<{ start: number; length: number } | null>(null);

  /**
   * Local raw text state for n/r number inputs so the user can freely clear
   * the field, type a new value, etc. without state jumping mid-typing.
   * Synced to numeric `state.n / state.r` only when the value is a valid integer.
   */
  const [nDraft, setNDraft] = useState<string>(String(INITIAL.n));
  const [rDraft, setRDraft] = useState<string>(String(INITIAL.r));

  useEffect(() => {
    setNDraft(String(state.n));
  }, [state.n]);
  useEffect(() => {
    setRDraft(String(state.r));
  }, [state.r]);

  const [properties, setProperties] = useState<IrbProperties | null>(null);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const [variants, setVariants] = useState<IrbResult[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);

  const [presets, setPresets] = useState<IrbPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  const [saved, setSaved] = useState<IrbConfigItem[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);

  const requestSeq = useRef(0);

  /* ─── Initial generate after mount ─────────────────────────── */
  useEffect(() => {
    if (!accessToken) return;
    const seq = ++requestSeq.current;
    dispatch({ type: 'SET_LOADING', loading: true });
    irbApi
      .generate(accessToken, INITIAL.n, INITIAL.r)
      .then((data) => {
        if (requestSeq.current !== seq) return;
        dispatch({ type: 'SET_RESULT', result: data });
      })
      .catch((err: Error) => {
        if (requestSeq.current !== seq) return;
        dispatch({ type: 'SET_ERROR', error: humanize(err.message) });
      })
      .finally(() => {
        if (requestSeq.current !== seq) return;
        dispatch({ type: 'SET_LOADING', loading: false });
      });
  }, [accessToken]);

  /* ─── Properties refresh whenever result changes ──────────── */
  useEffect(() => {
    if (!accessToken || !state.result) return;
    const seq = ++requestSeq.current;
    setPropertiesLoading(true);
    irbApi
      .properties(accessToken, state.result.sequence, state.result.r)
      .then((data) => {
        if (requestSeq.current !== seq) return;
        setProperties(data);
      })
      .catch(() => {
        if (requestSeq.current !== seq) return;
        setProperties(null);
      })
      .finally(() => {
        if (requestSeq.current !== seq) return;
        setPropertiesLoading(false);
      });
  }, [accessToken, state.result]);

  /* ─── Lazy load presets/saved when tab opens ──────────────── */
  useEffect(() => {
    if (!accessToken) return;
    if (rightTab === 'presets' && presets.length === 0 && !presetsLoading) {
      setPresetsLoading(true);
      irbApi
        .presets(accessToken)
        .then(setPresets)
        .catch(() => setPresets([]))
        .finally(() => setPresetsLoading(false));
    }
    if (rightTab === 'saved') {
      setSavedLoading(true);
      irbApi
        .list(accessToken)
        .then(setSaved)
        .catch(() => setSaved([]))
        .finally(() => setSavedLoading(false));
    }
  }, [accessToken, rightTab, presets.length, presetsLoading]);

  /* ─── Lazy load variants when tab opens ───────────────────── */
  const refreshVariants = useCallback(async () => {
    if (!accessToken) return;
    setVariantsLoading(true);
    try {
      const data = await irbApi.variants(accessToken, state.n, state.r, 5);
      setVariants(data);
    } catch {
      setVariants([]);
    } finally {
      setVariantsLoading(false);
    }
  }, [accessToken, state.n, state.r]);

  useEffect(() => {
    if (rightTab === 'variants' && accessToken) {
      refreshVariants();
    }
  }, [rightTab, accessToken, refreshVariants]);

  /* ─── Generate / Validate handler ─────────────────────────── */
  const compute = useCallback(async () => {
    if (!accessToken) return;

    if (!isValidR(state.r)) {
      dispatch({
        type: 'SET_ERROR',
        error: `R має бути цілим числом від ${R_MIN} до ${R_MAX}.`,
      });
      return;
    }
    if (!state.manualMode && !isValidN(state.n)) {
      dispatch({
        type: 'SET_ERROR',
        error: `N має бути цілим числом від ${N_MIN} до ${N_MAX}.`,
      });
      return;
    }

    const seq = ++requestSeq.current;
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      let data: IrbResult;
      if (state.manualMode) {
        const parsed = parseManual(state.manualInput);
        if (!Array.isArray(parsed)) {
          dispatch({ type: 'SET_ERROR', error: parsed.error });
          dispatch({ type: 'SET_LOADING', loading: false });
          return;
        }
        data = await irbApi.validate(accessToken, parsed, state.r);
      } else {
        data = await irbApi.generate(accessToken, state.n, state.r);
      }
      if (requestSeq.current !== seq) return;
      dispatch({ type: 'SET_RESULT', result: data });
    } catch (err) {
      if (requestSeq.current !== seq) return;
      dispatch({ type: 'SET_ERROR', error: humanize((err as Error).message) });
    } finally {
      if (requestSeq.current !== seq) return;
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [accessToken, state.manualMode, state.manualInput, state.n, state.r]);

  /* ─── Edit a single ring node directly ────────────────────── */
  const handleNodeChange = useCallback(
    (index: number, value: number) => {
      if (!state.result) return;
      const next = [...state.result.sequence];
      next[index] = value;
      dispatch({ type: 'APPLY_SEQUENCE', sequence: next, r: state.result.r });
    },
    [state.result],
  );

  /* ─── Apply external sequence (canonical, rotation, etc.) ── */
  const applySequence = useCallback(
    (sequence: number[], r?: number) => {
      dispatch({ type: 'APPLY_SEQUENCE', sequence, r });
    },
    [],
  );

  /* ─── Save current configuration ──────────────────────────── */
  const handleSave = useCallback(async () => {
    if (!accessToken || !state.result) return;
    try {
      const data = await irbApi.validate(
        accessToken,
        state.result.sequence,
        state.result.r,
        true,
        `IRB(n=${state.result.n}, R=${state.result.r})`,
      );
      dispatch({ type: 'SET_RESULT', result: data });
      setSavedLoading(true);
      const list = await irbApi.list(accessToken);
      setSaved(list);
      setRightTab('saved');
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: humanize((err as Error).message) });
    } finally {
      setSavedLoading(false);
    }
  }, [accessToken, state.result]);

  const handleRemoveSaved = useCallback(
    async (id: string) => {
      if (!accessToken) return;
      try {
        await irbApi.remove(accessToken, id);
        setSaved((items) => items.filter((it) => it.id !== id));
      } catch {
        // ignore
      }
    },
    [accessToken],
  );

  /* ─── Derived values ──────────────────────────────────────── */

  const result = state.result;
  const sequence = result?.sequence ?? [];
  const expectedS = useMemo(() => {
    const num = state.n * (state.n - 1);
    return num % state.r === 0 ? num / state.r + 1 : null;
  }, [state.n, state.r]);

  const countsByValue = useMemo<Record<number, number>>(() => {
    const acc: Record<number, number> = {};
    if (!result) return acc;
    for (const cs of result.circularSums) {
      acc[cs.sum] = (acc[cs.sum] ?? 0) + 1;
    }
    return acc;
  }, [result]);

  const coverageSet = useMemo(() => new Set(result?.coverage ?? []), [result]);

  /* ─── Render ──────────────────────────────────────────────── */
  return (
    <AppLayout>
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Інтерактивний генератор ІКВ</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Синтез, валідація та аналіз інтервальних кільцевих в&apos;язанок (Ризнюк)
        </p>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ─── Left: Controls ─── */}
          <section className="xl:col-span-3 bg-white rounded-xl border border-gray-200 p-6 space-y-5 self-start">
            <h2 className="font-semibold text-gray-900">Параметри</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                Кількість елементів (n)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={nDraft}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setNDraft(raw);
                  if (raw === '') return;
                  const num = parseInt(raw, 10);
                  if (Number.isFinite(num)) dispatch({ type: 'SET_N', n: num });
                }}
                onBlur={() => {
                  if (nDraft === '' || !Number.isFinite(parseInt(nDraft, 10))) {
                    setNDraft(String(state.n));
                  }
                }}
                disabled={state.manualMode}
                className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400 ${
                  isValidN(state.n) ? 'border-gray-300' : 'border-red-400'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1">від {N_MIN} до {N_MAX}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                Параметр кратності (R)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={rDraft}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setRDraft(raw);
                  if (raw === '') return;
                  const num = parseInt(raw, 10);
                  if (Number.isFinite(num)) dispatch({ type: 'SET_R', r: num });
                }}
                onBlur={() => {
                  if (rDraft === '' || !Number.isFinite(parseInt(rDraft, 10))) {
                    setRDraft(String(state.r));
                  }
                }}
                className={`w-full px-3 py-2.5 border rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                  isValidR(state.r) ? 'border-gray-300' : 'border-red-400'
                }`}
              />
              <p className="text-xs text-gray-400 mt-1">від {R_MIN} до {R_MAX}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-mono">
              <p className="text-gray-600">S = n(n−1) / R + 1</p>
              {expectedS !== null ? (
                <p className="text-orange-600 font-bold mt-1">
                  S = {state.n}·{state.n - 1}/{state.r} + 1 = {expectedS}
                </p>
              ) : (
                <p className="text-red-500 font-bold mt-1">
                  ІКВ не існує: {state.n}·{state.n - 1} не ділиться на {state.r}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Ручне введення
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.manualMode ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                  aria-pressed={state.manualMode}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      state.manualMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {state.manualMode && (
                <input
                  type="text"
                  value={state.manualInput}
                  onChange={(e) =>
                    dispatch({ type: 'SET_MANUAL_INPUT', input: e.target.value })
                  }
                  placeholder="1, 3, 2, 7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-mono focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={compute}
                disabled={
                  state.loading ||
                  !isValidR(state.r) ||
                  (!state.manualMode && !isValidN(state.n))
                }
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state.loading
                  ? 'Розрахунок…'
                  : state.manualMode
                  ? 'Перевірити послідовність'
                  : 'Згенерувати'}
              </button>
              <button
                onClick={handleSave}
                disabled={!result || state.loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 rounded-lg transition text-sm disabled:opacity-60"
              >
                Зберегти конфігурацію
              </button>
            </div>

            {state.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-start gap-2">
                <span aria-hidden>⚠</span>
                <span>{state.error}</span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                  className="ml-auto text-red-400 hover:text-red-600"
                  aria-label="Закрити"
                >
                  ✕
                </button>
              </div>
            )}

            {result && (
              <div
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  result.isValid
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border border-amber-200 text-amber-700'
                }`}
              >
                <span aria-hidden>{result.isValid ? '✓' : '✗'}</span>
                <span className="font-semibold">
                  {result.isValid ? 'Дійсний ІКВ' : 'Не є дійсним ІКВ'}
                </span>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Застосувати у:
              </p>
              <div className="space-y-2">
                <Link
                  href="/vector-codes"
                  className="block text-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
                >
                  → Векторний код
                </Link>
                <Link
                  href="/cyclic-codes"
                  className="block text-center px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-orange-400 hover:text-orange-600 transition"
                >
                  → Циклічний код
                </Link>
              </div>
            </div>
          </section>

          {/* ─── Center: Visualization + Sums table ─── */}
          <section className="xl:col-span-5 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Кільце</h2>
              <div className="text-xs text-gray-400 font-mono">
                {sequence.length > 0 && `n=${sequence.length}, R=${state.r}`}
              </div>
            </div>

            {sequence.length === 0 && state.loading ? (
              <div className="h-80 flex items-center justify-center text-gray-400">
                Завантаження…
              </div>
            ) : sequence.length > 0 ? (
              <InteractiveRing
                sequence={sequence}
                highlight={hoveredSum}
                onNodeChange={handleNodeChange}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400 text-sm">
                Натисніть «Згенерувати» для початку
              </div>
            )}

            <p className="text-[11px] text-gray-400 text-center -mt-2">
              Наведіть курсор на рядок таблиці нижче — відповідні елементи підсвітяться у кільці.
              Клацніть біля вузла, щоб змінити значення.
            </p>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Кругові суми ({result?.circularSums.length ?? 0})
              </h3>
              <CircularSumsTable
                sums={result?.circularSums ?? []}
                expectedR={state.r}
                countsByValue={countsByValue}
                hovered={hoveredSum}
                onHover={setHoveredSum}
              />
            </div>
          </section>

          {/* ─── Right: Tabs ─── */}
          <section className="xl:col-span-4 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap gap-1 mb-4 bg-gray-50 rounded-lg p-1">
              {(
                [
                  { id: 'coverage', label: 'Покриття' },
                  { id: 'properties', label: 'Властивості' },
                  { id: 'variants', label: 'Варіанти' },
                  { id: 'presets', label: 'Каталог' },
                  { id: 'saved', label: 'Збережені' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRightTab(tab.id)}
                  className={`flex-1 min-w-fit px-2.5 py-1.5 rounded text-xs font-medium transition whitespace-nowrap ${
                    rightTab === tab.id
                      ? 'bg-white text-gray-900 shadow'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {rightTab === 'coverage' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Таблиця покриття значень {result ? `1..${result.s - 1}` : ''}
                </h3>
                {result ? (
                  <>
                    <div className="grid grid-cols-5 gap-1.5 mb-4">
                      {Array.from({ length: result.s - 1 }, (_, i) => i + 1).map((v) => {
                        const covered = coverageSet.has(v);
                        const occ = countsByValue[v] ?? 0;
                        const matches = occ === result.r;
                        return (
                          <div
                            key={v}
                            className={`aspect-square flex flex-col items-center justify-center rounded text-xs font-bold relative ${
                              !covered
                                ? 'bg-gray-100 text-gray-400'
                                : matches
                                ? 'bg-emerald-500 text-white'
                                : 'bg-amber-400 text-white'
                            }`}
                            title={
                              covered
                                ? `Значення ${v}: зустрічається ${occ} раз(и)`
                                : `Значення ${v}: відсутнє`
                            }
                          >
                            <span>{v}</span>
                            {covered && (
                              <span className="absolute bottom-0.5 right-0.5 text-[8px] opacity-75">
                                ×{occ}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        Кожне значення в [1, {result.s - 1}] має зустрітись рівно{' '}
                        <strong>R = {result.r}</strong> раз серед кругових сум.
                      </p>
                      {!result.isValid && result.missing.length > 0 && (
                        <p className="text-red-600">
                          Відсутні: {result.missing.slice(0, 20).join(', ')}
                          {result.missing.length > 20 ? '…' : ''}
                        </p>
                      )}
                      {result.redundancyEffective !== undefined && (
                        <p>
                          Середня кратність: <strong>{result.redundancyEffective.toFixed(3)}</strong>
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Дані зʼявляться після розрахунку
                  </p>
                )}
              </div>
            )}

            {rightTab === 'properties' && (
              <PropertiesPanel
                props={properties}
                loading={propertiesLoading}
                onApplySequence={(seq) => applySequence(seq, properties?.r)}
              />
            )}

            {rightTab === 'variants' && (
              <VariantsPanel
                variants={variants}
                loading={variantsLoading}
                onLoad={(v) => applySequence(v.sequence, v.r)}
                onRefresh={refreshVariants}
              />
            )}

            {rightTab === 'presets' && (
              <PresetsPanel
                presets={presets}
                loading={presetsLoading}
                onLoad={(p) => applySequence(p.sequence, p.r)}
              />
            )}

            {rightTab === 'saved' && (
              <SavedPanel
                items={saved}
                loading={savedLoading}
                onLoad={(item) => applySequence(item.sequence, item.r)}
                onRemove={handleRemoveSaved}
              />
            )}
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
