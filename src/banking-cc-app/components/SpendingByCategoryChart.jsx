import { useState } from "react";

// Fixed categorical order from the validated default palette (dataviz skill).
// Never cycled/reordered - identity comes from a stable slot, not a generated hue.
const CATEGORY_COLORS = {
  groceries: "#2a78d6",
  dining: "#eb6834",
  travel: "#1baf7a",
  entertainment: "#eda100",
  shopping: "#e87ba4",
  utilities: "#4a3aa7",
  other: "#898781",
};

const CATEGORY_LABEL = {
  groceries: "Groceries",
  dining: "Dining",
  travel: "Travel",
  entertainment: "Entertainment",
  shopping: "Shopping",
  utilities: "Utilities",
  other: "Other",
};

const BAR_THICKNESS = 22;
const ROW_GAP = 14;
const LABEL_WIDTH = 110;
const CHART_WIDTH = 520;
const PADDING_RIGHT = 70;

export default function SpendingByCategoryChart({ data }) {
  const [hovered, setHovered] = useState(null);

  if (!data || data.length === 0) {
    return <p className="chart-empty">No purchases in the last 30 days yet.</p>;
  }

  const rows = data.slice(0, 7); // series-count ladder: soft cap before folding to "Other"
  const maxAmount = Math.max(...rows.map((r) => r.amount), 1);
  const barAreaWidth = CHART_WIDTH - LABEL_WIDTH - PADDING_RIGHT;
  const height = rows.length * (BAR_THICKNESS + ROW_GAP);

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${height}`}
        width="100%"
        role="img"
        aria-label="Spending by category, last 30 days"
      >
        {rows.map((row, i) => {
          const y = i * (BAR_THICKNESS + ROW_GAP);
          const barWidth = Math.max(4, (row.amount / maxAmount) * barAreaWidth);
          const color = CATEGORY_COLORS[row.category] || CATEGORY_COLORS.other;
          const isHovered = hovered === row.category;
          return (
            <g key={row.category}>
              <text
                x={LABEL_WIDTH - 10}
                y={y + BAR_THICKNESS / 2 + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {CATEGORY_LABEL[row.category] || row.category}
              </text>
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={barAreaWidth}
                height={BAR_THICKNESS}
                fill="var(--chart-gridline)"
                opacity={0}
              />
              <rect
                x={LABEL_WIDTH}
                y={y}
                width={barWidth}
                height={BAR_THICKNESS}
                rx={4}
                fill={color}
                opacity={isHovered ? 1 : 0.92}
                onMouseEnter={() => setHovered(row.category)}
                onMouseLeave={() => setHovered(null)}
              />
              <text
                x={LABEL_WIDTH + barWidth + 8}
                y={y + BAR_THICKNESS / 2 + 4}
                className="chart-value-label"
              >
                ${row.amount.toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
