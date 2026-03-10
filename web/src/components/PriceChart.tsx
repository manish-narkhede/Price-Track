"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  type TooltipItem,
} from "chart.js";
import {Line} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface PricePoint {
  price: number;
  timestamp: string;
}

export default function PriceChart({history}: {history: PricePoint[]}) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">No price history available yet.</div>
    );
  }

  const labels = history.map((h) =>
    new Date(h.timestamp).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    })
  );

  const prices = history.map((h) => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const data = {
    labels,
    datasets: [
      {
        label: "Price (₹)",
        data: prices,
        fill: true,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.08)",
        tension: 0.3,
        pointRadius: history.length > 60 ? 0 : 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {display: false},
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"line">) =>
            `₹${((ctx.parsed.y ?? 0) as number).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        min: Math.max(0, minPrice * 0.9),
        max: maxPrice * 1.1,
        ticks: {
          callback: (val: unknown) => `₹${(val as number).toLocaleString("en-IN")}`,
        },
        grid: {color: "rgba(0,0,0,0.05)"},
      },
      x: {
        grid: {display: false},
        ticks: {maxTicksLimit: 10},
      },
    },
  };

  return <Line data={data} options={options} />;
}
