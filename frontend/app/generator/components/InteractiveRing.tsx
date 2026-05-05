'use client';

import { useMemo } from 'react';

interface Props {
  sequence: number[];
  highlight?: { start: number; length: number } | null;
  onNodeChange?: (index: number, value: number) => void;
  size?: number;
}

interface Node {
  x: number;
  y: number;
  val: number;
}

export default function InteractiveRing({
  sequence,
  highlight = null,
  onNodeChange,
  size = 320,
}: Props) {
  const n = sequence.length;
  const cx = size / 2;
  const cy = size / 2;
  const radius = Math.min(cx, cy) - 50;

  const nodes: Node[] = useMemo(() => {
    return sequence.map((val, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        val,
      };
    });
  }, [sequence, n, cx, cy, radius]);

  const isEdgeHighlighted = (edgeIndex: number) => {
    if (!highlight) return false;
    const { start, length } = highlight;
    for (let i = 0; i < length; i += 1) {
      if (edgeIndex === (start + i) % n) return true;
    }
    return false;
  };

  const isNodeStart = (nodeIndex: number) =>
    highlight && nodeIndex === highlight.start;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="Кільцева візуалізація ІКВ"
    >
      <defs>
        <marker
          id="arrow-default"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#fb923c" />
        </marker>
        <marker
          id="arrow-highlight"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill="#10b981" />
        </marker>
      </defs>

      {nodes.map((node, i) => {
        const next = nodes[(i + 1) % n];
        const mx = (node.x + next.x) / 2;
        const my = (node.y + next.y) / 2;
        const dx = next.x - node.x;
        const dy = next.y - node.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = (-dy / len) * 22;
        const ny = (dx / len) * 22;
        const highlighted = isEdgeHighlighted(i);
        return (
          <g key={`edge-${i}`}>
            <line
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke={highlighted ? '#10b981' : '#fb923c'}
              strokeWidth={highlighted ? 3 : 1.6}
              opacity={highlight && !highlighted ? 0.25 : 1}
              markerEnd={
                highlighted ? 'url(#arrow-highlight)' : 'url(#arrow-default)'
              }
            />
            <g transform={`translate(${mx + nx},${my + ny})`}>
              <rect
                x={-10}
                y={-9}
                width={20}
                height={18}
                rx={4}
                fill={highlighted ? '#10b98115' : '#fff7ed'}
                stroke={highlighted ? '#10b981' : '#fed7aa'}
              />
              <text
                x={0}
                y={1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={highlighted ? '#047857' : '#c2410c'}
                fontSize="12"
                fontFamily="monospace"
                fontWeight="600"
              >
                {sequence[i]}
              </text>
            </g>
          </g>
        );
      })}

      {nodes.map((node, i) => (
        <g key={`node-${i}`}>
          <circle
            cx={node.x}
            cy={node.y}
            r={20}
            fill={isNodeStart(i) ? '#10b981' : '#1e3a5f'}
            stroke={isNodeStart(i) ? '#047857' : '#0f1e3d'}
            strokeWidth={2}
          />
          <text
            x={node.x}
            y={node.y - 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="13"
            fontWeight="bold"
          >
            {i}
          </text>
        </g>
      ))}

      <g>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#64748b"
          fontSize="11"
          fontFamily="monospace"
        >
          IRB
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fill="#1e293b"
          fontSize="13"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {`{${sequence.join(', ')}}`}
        </text>
      </g>

      {onNodeChange &&
        nodes.map((node, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const fx = cx + (radius + 36) * Math.cos(angle);
          const fy = cy + (radius + 36) * Math.sin(angle);
          return (
            <foreignObject
              key={`edit-${i}`}
              x={fx - 18}
              y={fy - 12}
              width={36}
              height={24}
            >
              <input
                type="number"
                min={1}
                value={sequence[i]}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= 1) onNodeChange(i, v);
                }}
                className="w-full h-full text-center text-xs font-mono border border-gray-300 rounded bg-white text-gray-800 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              />
            </foreignObject>
          );
        })}
    </svg>
  );
}
