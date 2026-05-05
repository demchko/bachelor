import CodePlayground from '@/app/components/CodePlayground';

export default function CyclicCodesPage() {
  return (
    <CodePlayground
      title="Циклічні ІКВ-коди"
      description="Кодування, моделювання помилок та декодування циклічних завадостійких ІКВ-кодів."
      kind="cyclic"
    />
  );
}
