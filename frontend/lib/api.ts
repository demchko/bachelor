/**
 * Browser: same-origin `/api` → proxied by Next (see `next.config.ts`) to the Nest backend.
 * Override with NEXT_PUBLIC_API_URL if the API is on another host.
 * Server (SSR): direct URL to backend.
 */
function getApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (explicit) return explicit;

  if (typeof window !== 'undefined') {
    return '/api';
  }

  return process.env.INTERNAL_API_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:3000/api';
}

function parseNestErrorBody(body: unknown, status: number): string {
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.length) return o.message;
    if (Array.isArray(o.message) && o.message.length) return String(o.message[0]);
  }
  return `Помилка сервера (HTTP ${status})`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    if (contentType.includes('application/json')) {
      const body: unknown = await res.json().catch(() => ({}));
      throw new Error(parseNestErrorBody(body, res.status));
    }
    const text = await res.text().catch(() => '');
    throw new Error(text.trim().slice(0, 200) || `Помилка сервера (HTTP ${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  if (!contentType.includes('application/json')) {
    throw new Error('Сервер повернув не JSON. Перевірте URL API (NEXT_PUBLIC_API_URL / проксі).');
  }
  return res.json() as Promise<T>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, token: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    }),

  resendVerification: (email: string) =>
    request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, token: string, password: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (refreshToken: string) =>
    request<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (accessToken: string) =>
    request<void>('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  me: (accessToken: string) =>
    request<User>('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

/* ─── Authenticated helper ─────────────────────────────────── */

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─── IRB ──────────────────────────────────────────────────── */

export interface CircularSum {
  start: number;
  length: number;
  elements: number[];
  sum: number;
}

export interface IrbResult {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  isValid: boolean;
  circularSums: CircularSum[];
  coverage: number[];
  missing: number[];
  redundancyEffective?: number;
  id?: string;
}

export interface IrbProperties {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  totalSum: number;
  expectedSum: number;
  isValid: boolean;
  canonical: number[];
  reflection: number[];
  rotations: number[][];
  distinctRingSums: number;
  redundancyEffective: number;
  spread: number;
  bitsPerSymbol: number;
  capacityBits: number;
}

export interface IrbPreset {
  n: number;
  r: number;
  s: number;
  sequence: number[];
  isValid: boolean;
}

export interface IrbConfigItem extends IrbResult {
  id: string;
  source: 'generator' | 'manual' | 'preset';
  label: string | null;
  createdAt: string;
}

export const irbApi = {
  generate: (token: string, n: number, r: number, save = false, label?: string) =>
    request<IrbResult>('/irb/generate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ n, r, save, label }),
    }),
  validate: (token: string, sequence: number[], r: number, save = false, label?: string) =>
    request<IrbResult>('/irb/validate', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, r, save, label }),
    }),
  properties: (token: string, sequence: number[], r: number) =>
    request<IrbProperties>('/irb/properties', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, r }),
    }),
  variants: (token: string, n: number, r: number, max = 5) =>
    request<IrbResult[]>('/irb/variants', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ n, r, max }),
    }),
  presets: (token: string) =>
    request<IrbPreset[]>('/irb/presets', { headers: authHeaders(token) }),
  list: (token: string) =>
    request<IrbConfigItem[]>('/irb/configs', {
      headers: authHeaders(token),
    }),
  remove: (token: string, id: string) =>
    request<{ message: string }>(`/irb/configs/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),
};

/* ─── Codes ────────────────────────────────────────────────── */

export interface EncodeResult {
  codeword: string;
  blockLength: number;
  dataLength: number;
  redundancy?: number;
  symbolWidth?: number;
  generatorMatrix?: number[][];
  parityCheckMatrix?: number[][];
  codebook?: string[];
}

export interface DecodeResult {
  corrected: string;
  decoded: string;
  errorPositions: number[];
  detectedErrors: number;
  correctedErrors: number;
  uncorrected: boolean;
}

export interface EfficiencyResult {
  n: number;
  r: number;
  total: number;
  detectable: number;
  correctable: number;
  detectablePct: number;
  correctablePct: number;
}

export interface CyclicStructureResult {
  blockLength: number;
  informationLength: number;
  redundancy: number;
  differenceSet: number[];
  generatorMatrix: number[][];
  parityCheckMatrix: number[][];
  informationColumns: number[];
}

export interface MonolithicMetaResult {
  blockLength: number;
  symbolWidth: number;
  codewords: string[];
  capacitySymbols: number;
}

export interface TrapezoidRow {
  n: number;
  coefficients: number[];
  sum: number;
  xn: number;
}

export interface TrapezoidResponse {
  rows: TrapezoidRow[];
}

export const codesApi = {
  trapezoid: (token: string, maxN?: number) =>
    request<TrapezoidResponse>('/codes/trapezoid' + (maxN != null ? `?maxN=${maxN}` : ''), {
      headers: authHeaders(token),
    }),
  cyclicEncode: (token: string, sequence: number[], data: string) =>
    request<EncodeResult>('/codes/cyclic/encode', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, data }),
    }),
  cyclicDecode: (token: string, sequence: number[], received: string, originalCodeword?: string) =>
    request<DecodeResult>('/codes/cyclic/decode', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, received, originalCodeword }),
    }),
  monolithicEncode: (token: string, sequence: number[], data: string) =>
    request<EncodeResult>('/codes/monolithic/encode', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, data }),
    }),
  monolithicDecode: (token: string, sequence: number[], received: string, originalCodeword?: string) =>
    request<DecodeResult>('/codes/monolithic/decode', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ sequence, received, originalCodeword }),
    }),
  efficiency: (token: string, n: number, r: number, kind: 'monolithic' | 'cyclic') =>
    request<EfficiencyResult>('/codes/efficiency', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ n, r, kind }),
    }),
};

/* ─── Simulation ───────────────────────────────────────────── */

export type CodeKind = 'irb-cyclic' | 'irb-monolithic' | 'binary' | 'reed-solomon';

export interface SimulationStats {
  codeKind: CodeKind;
  packets: number;
  errorProbability: number;
  totalBits: number;
  bitErrors: number;
  successfulPackets: number;
  recoveredPackets: number;
  bitFlipRate: number;
  successRate: number;
}

/** `errorRate` — p каналу у відсотках (може бути дробовим, напр. 0.2 для p = 0.002). */
export interface SimulationChartPoint {
  errorRate: number;
  irb: number;
  binary?: number;
  reedSolomon?: number;
}

export interface SimulationResult {
  primary: SimulationStats;
  comparisons: SimulationStats[];
  chart: SimulationChartPoint[];
  delta: number;
  savedRunId?: string;
}

export interface SimulationRunSummary {
  id: string;
  codeKind: CodeKind;
  irbSequence: number[];
  packets: number;
  errorProbability: number;
  totalBits: number;
  bitErrors: number;
  successfulPackets: number;
  recoveredPackets: number;
  bitFlipRate: number;
  successRate: number;
  createdAt: string;
}

export const simulationApi = {
  run: (
    token: string,
    payload: {
      sequence: number[];
      packets: number;
      errorProbability: number;
      codeKind: CodeKind;
      compareBinary?: boolean;
      compareReedSolomon?: boolean;
      save?: boolean;
    },
  ) =>
    request<SimulationResult>('/simulation/run', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    }),
  listRuns: (token: string) =>
    request<SimulationRunSummary[]>('/simulation/runs', {
      headers: authHeaders(token),
    }),
};

/* ─── Tests ────────────────────────────────────────────────── */

export interface TestQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface TestBank {
  total: number;
  questions: TestQuestion[];
}

export interface TestAnswerResult {
  questionId: number;
  optionIndex: number;
  isCorrect: boolean;
  correctOptionIndex: number;
  explanation: string;
}

export interface TestSubmissionResult {
  attemptId: string;
  total: number;
  correct: number;
  scorePct: number;
  answers: TestAnswerResult[];
}

export const testsApi = {
  bank: (token: string) =>
    request<TestBank>('/tests', {
      headers: authHeaders(token),
    }),
  submit: (
    token: string,
    answers: { questionId: number; optionIndex: number }[],
    durationSec?: number,
  ) =>
    request<TestSubmissionResult>('/tests/submit', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ answers, durationSec }),
    }),
};

/* ─── Stats ────────────────────────────────────────────────── */

export interface UserStats {
  testsCompleted: number;
  testsAvailable: number;
  bestTestScorePct: number | null;
  configsGenerated: number;
  configsSaved: number;
  simulationsRan: number;
  lastActivityAt: string | null;
}

export const statsApi = {
  me: (token: string) =>
    request<UserStats>('/stats/me', {
      headers: authHeaders(token),
    }),
};
