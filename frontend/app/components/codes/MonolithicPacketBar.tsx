'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

  const chartData = chunks.map((word, index) => {
    const ones = word.split('').filter((c) => c === '1').length;
    const zeros = word.length - ones;
    return {
      block: `Блок ${index + 1}`,
      ones,
      zeros,
      word,
    };
  });
  const chartHeight = Math.max(96, chartData.length * 42 + 36);

  return (
    <div className="rounded-xl border border-amber-200/90 bg-amber-50/40 p-3">
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 8, bottom: 4, left: 12 }}
            barSize={22}
          >
            <CartesianGrid stroke="#fde68a" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, blockLength]} hide />
            <YAxis
              type="category"
              dataKey="block"
              width={56}
              tick={{ fontSize: 11, fill: '#92400e', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value} біт`,
                name === 'ones' ? '1' : '0',
              ]}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #fcd34d',
                boxShadow: '0 12px 28px rgba(120, 53, 15, 0.12)',
                fontSize: 12,
              }}
            />
            <Bar dataKey="ones" name="ones" stackId="packet" fill="#d97706" radius={[6, 0, 0, 6]} isAnimationActive={false} />
            <Bar dataKey="zeros" name="zeros" stackId="packet" fill="#cbd5e1" radius={[0, 6, 6, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 space-y-1.5 border-t border-amber-200/70 pt-2">
        {chartData.map((row) => (
          <div key={row.block} className="flex flex-col gap-0.5 text-xs text-amber-900/80 sm:flex-row sm:items-baseline sm:justify-between">
            <span>
              {row.block}: вага w = {row.ones} · пакет 1<sup>{row.ones}</sup>0<sup>{row.zeros}</sup>
            </span>
            <span className="font-mono text-[11px] tracking-wide text-slate-600">{row.word}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
