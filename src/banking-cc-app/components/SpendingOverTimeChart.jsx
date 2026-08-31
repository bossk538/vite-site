import { useMemo, useState } from "react";

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };
const LINE_COLOR = "#2a78d6"; // series-1, sequential default hue

function niceMax(value) {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

export default function SpendingOverTimeChart({ data }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const maxAmount = useMemo(() => niceMax(Math.max(...(data || []).map((d) => d.amount), 0)), [data]);

  if (!data || data.length === 0) {
    return <p className="chart-empty">No spending data yet.</p>;
  }

  const xFor = (i) => PADDING.left + (i / (data.length - 1)) * plotWidth;
  const yFor = (amount) => PADDING.top + plotHeight - (amount / maxAmount) * plotHeight;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(d.amount).toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${xFor(data.length - 1).toFixed(1)} ${(PADDING.top + plotHeight).toFixed(
    1
  )} L ${xFor(0).toFixed(1)} ${(PADDING.top + plotHeight).toFixed(1)} Z`;

  const yTicks = [0, 0.5, 1].map((f) => Math.round(maxAmount * f));

  function handleMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    const ratio = Math.min(1, Math.max(0, (localX - PADDING.left) / plotWidth));
    const index = Math.round(ratio * (data.length - 1));
    setHoverIndex(index);
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        role="img"
        aria-label="Spending over the last 30 days"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              stroke="var(--chart-gridline)"
              strokeWidth="1"
            />
            <text x={PADDING.left - 8} y={yFor(tick) + 4} textAnchor="end" className="chart-axis-label">
              ${tick}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={LINE_COLOR} opacity="0.1" stroke="none" />
        <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hovered && (
          <>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={PADDING.top}
              y2={PADDING.top + plotHeight}
              stroke="var(--chart-baseline)"
              strokeWidth="1"
            />
            <circle
              cx={xFor(hoverIndex)}
              cy={yFor(hovered.amount)}
              r="4"
              fill={LINE_COLOR}
              stroke="var(--chart-surface)"
              strokeWidth="2"
            />
          </>
        )}

        <text x={PADDING.left} y={HEIGHT - 6} className="chart-axis-label">
          {formatDate(data[0].date)}
        </text>
        <text x={WIDTH - PADDING.right} y={HEIGHT - 6} textAnchor="end" className="chart-axis-label">
          {formatDate(data[data.length - 1].date)}
        </text>
      </svg>
      {hovered && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(xFor(hoverIndex) / WIDTH) * 100}%`,
            top: `${(yFor(hovered.amount) / HEIGHT) * 100}%`,
          }}
        >
          <div className="chart-tooltip-date">{formatDate(hovered.date)}</div>
          <div className="chart-tooltip-amount">${hovered.amount.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
