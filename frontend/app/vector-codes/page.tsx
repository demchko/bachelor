import CodePlayground from '@/app/components/CodePlayground';

export default function VectorCodesPage() {
  return (
    <CodePlayground
      title="Векторні (монолітні) ІКВ-коди"
      description="Монолітне кодування ІКВ — пакети однойменних символів, мажоритарне виправлення помилок."
      kind="monolithic"
    />
  );
}
