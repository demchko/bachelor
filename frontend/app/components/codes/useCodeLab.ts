'use client';

import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  codesApi,
  type CyclicStructureResult,
  type DecodeResult,
  type EncodeResult,
  type EfficiencyResult,
  type MonolithicMetaResult,
} from '@/lib/api';
import { computeCyclicStructure } from '@/lib/cyclic-structure';
import { computeMonolithicMeta } from '@/lib/monolithic-meta';
import { useAuth } from '@/lib/auth-context';

export type LabKind = 'cyclic' | 'monolithic';

function flipBit(s: string, i: number) {
  const arr = s.split('');
  arr[i] = arr[i] === '1' ? '0' : '1';
  return arr.join('');
}

function parseSequence(text: string): number[] {
  return text
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((v) => Number.isFinite(v) && v > 0);
}

/** Hamming distance for equal-length bit strings (ASCII '0'/'1'). */
function bitHamming(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i += 1) if (a[i] !== b[i]) d += 1;
  return d + Math.abs(a.length - b.length);
}

export function useCodeLab(kind: LabKind) {
  const { accessToken } = useAuth();
  const [sequenceText, setSequenceText] = useState('1, 3, 2, 7');
  const [data, setData] = useState(kind === 'cyclic' ? '1011' : '0011');
  const [encoded, setEncoded] = useState<EncodeResult | null>(null);
  const [received, setReceived] = useState('');
  const [decoded, setDecoded] = useState<DecodeResult | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyResult | null>(null);
  const [n, setN] = useState(10);
  const [r, setR] = useState(2);

  const sequence = useMemo(() => parseSequence(sequenceText), [sequenceText]);

  const encodeMutation = useMutation({
    mutationFn: () => {
      const fn = kind === 'cyclic' ? codesApi.cyclicEncode : codesApi.monolithicEncode;
      if (!accessToken) throw new Error('Увійдіть у систему.');
      return fn(accessToken, sequence, data);
    },
    onSuccess: (result) => {
      setEncoded(result);
      setReceived(result.codeword);
      setDecoded(null);
    },
  });

  const decodeMutation = useMutation({
    mutationFn: async () => {
      const fn = kind === 'cyclic' ? codesApi.cyclicDecode : codesApi.monolithicDecode;
      if (!accessToken) throw new Error('Увійдіть у систему.');
      const sent = encoded?.codeword;
      const recv = received;
      const result = await fn(accessToken, sequence, recv, sent);
      const channelDiff =
        sent && recv.length === sent.length ? bitHamming(sent, recv) : 0;
      return {
        ...result,
        detectedErrors: Math.max(result.detectedErrors, channelDiff),
      };
    },
    onSuccess: setDecoded,
  });

  const efficiencyMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('Увійдіть у систему.');
      return codesApi.efficiency(accessToken, n, r, kind);
    },
    onSuccess: setEfficiency,
  });

  const cyclicStructure = useMemo((): CyclicStructureResult | undefined => {
    if (kind !== 'cyclic' || sequence.length < 2) return undefined;
    return computeCyclicStructure(sequence) ?? undefined;
  }, [kind, sequence]);

  const cyclicStructureError = useMemo(() => {
    if (kind !== 'cyclic' || sequence.length < 2) return null;
    const S = sequence.reduce((a, b) => a + b, 0);
    if (S > 96) {
      return `Сума ІКВ S=${S} завелика для візуалізації (макс. 96). Скоротіть послідовність.`;
    }
    if (!cyclicStructure) {
      return 'Не вдалося побудувати структуру коду для цієї послідовності.';
    }
    return null;
  }, [kind, sequence, cyclicStructure]);

  const informationLength = cyclicStructure?.informationLength;

  /** Cyclic code requires exactly k bits; pad / trim when structure is known. */
  useEffect(() => {
    if (kind !== 'cyclic' || informationLength == null || informationLength < 1) return;
    setData((prev) => {
      if (prev.length === informationLength) return prev;
      if (prev.length > informationLength) return prev.slice(0, informationLength);
      return prev + '0'.repeat(informationLength - prev.length);
    });
  }, [kind, informationLength]);

  const monolithicMeta = useMemo((): MonolithicMetaResult | undefined => {
    if (kind !== 'monolithic' || sequence.length < 2) return undefined;
    return computeMonolithicMeta(sequence.length) ?? undefined;
  }, [kind, sequence.length]);

  const introduceError = useCallback(
    (idx: number) => {
      if (received) setReceived(flipBit(received, idx));
    },
    [received],
  );

  const randomBitError = useCallback(() => {
    if (!received || received.length === 0) return;
    const idx = Math.floor(Math.random() * received.length);
    introduceError(idx);
  }, [received, introduceError]);

  const loading =
    encodeMutation.isPending ||
    decodeMutation.isPending ||
    efficiencyMutation.isPending;

  const error =
    encodeMutation.error?.message ??
    decodeMutation.error?.message ??
    efficiencyMutation.error?.message ??
    null;

  return {
    accessToken,
    kind,
    sequenceText,
    setSequenceText,
    data,
    setData,
    sequence,
    encoded,
    received,
    setReceived,
    decoded,
    efficiency,
    n,
    setN,
    r,
    setR,
    encodeMutation,
    decodeMutation,
    efficiencyMutation,
    introduceError,
    randomBitError,
    loading,
    error,
    cyclicStructure,
    cyclicStructureError,
    monolithicMeta,
  };
}
