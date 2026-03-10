'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PricePoint } from '@/types';

interface PriceChartProps {
  data: PricePoint[];
}

function formatPrice(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

interface TooltipPayload {
  value: number;
  payload: PricePoint;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-gray-500 mb-1">{label ? formatDate(label) : ''}</p>
      <p className="font-bold text-gray-900 text-base">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export default function PriceChart({ data }: PriceChartProps) {
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.05;

  const chartData = data.map((d) => ({
    ...d,
    date: d.timestamp,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            domain={[minPrice - padding, maxPrice + padding]}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={minPrice}
            stroke="#16a34a"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: 'Lowest',
              position: 'insideTopRight',
              fill: '#16a34a',
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={data.length <= 30}
            activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
