import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Area, AreaChart,
} from 'recharts';
import { adminApi } from '../../api';
import Spinner from '../common/Spinner';

const PINK = '#E91E63';

/**
 * Reusable revenue chart, Shopify-style.
 *
 * Props:
 *   days      — number of trailing days to plot (7, 30, 90, ...)
 *   variant   — 'compact' (dashboard widget) | 'full' (revenue page)
 *   title     — optional heading shown above the chart
 *
 * Both variants share the exact same data + line shape; only the
 * chrome differs (axes, height, padding).
 */
export default function RevenueChart({ days = 30, variant = 'full', title }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setData(null);
    setError(null);
    adminApi
      .revenueChart(days)
      .then((rows) => alive && setData(rows))
      .catch((e) => alive && setError(e.message || 'Failed to load chart'));
    return () => { alive = false; };
  }, [days]);

  // Header
  const header = title && (
    <div className="flex items-baseline justify-between mb-3">
      <h3 className="font-display tracking-wider uppercase text-sm text-white/70">{title}</h3>
      {data && data.length > 0 && (
        <span className="text-xs text-white/40">
          Last {days} day{days === 1 ? '' : 's'}
        </span>
      )}
    </div>
  );

  // Loading / error / empty states
  if (error) {
    return (
      <div className="card p-6">
        {header}
        <div className="h-32 flex items-center justify-center text-white/50 text-sm">
          {error}
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="card p-6">
        {header}
        <div className={`flex items-center justify-center ${variant === 'compact' ? 'h-32' : 'h-64'}`}>
          <Spinner />
        </div>
      </div>
    );
  }

  // Pre-compute totals for the header summary
  const total = data.reduce((acc, r) => acc + r.revenue, 0);
  const peak = data.reduce((acc, r) => Math.max(acc, r.revenue), 0);

  // ----- COMPACT (dashboard) -----
  if (variant === 'compact') {
    return (
      <div className="card p-6">
        {header}
        <p className="font-display text-3xl text-pink-500">${total.toFixed(2)}</p>
        <p className="text-xs text-white/40 mt-1">Total · {days}-day trend</p>

        <div className="h-32 mt-4 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="lb-area-compact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PINK} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={PINK} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide /> 
              <Tooltip
                cursor={{ stroke: '#33336B', strokeWidth: 1 }}
                contentStyle={tooltipStyle}
                labelFormatter={formatTooltipLabel}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={PINK}
                strokeWidth={2}
                fill="url(#lb-area-compact)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 4, fill: PINK, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ----- FULL (revenue page) -----
  return (
    <div className="card p-6">
      {header}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-4">
        <Summary label="Total" value={`$${total.toFixed(2)}`} highlight />
        <Summary label="Peak day" value={`$${peak.toFixed(2)}`} />
        <Summary label="Days" value={String(days)} />
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="lb-line-full" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={PINK} stopOpacity={1} />
                <stop offset="100%" stopColor={PINK} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#272758" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              stroke="#6B6B8E"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#33336B' }}
              minTickGap={32}
            />
            <YAxis
              stroke="#6B6B8E"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v}`}
              width={50}
            />
            <Tooltip
              cursor={{ stroke: '#33336B', strokeWidth: 1 }}
              contentStyle={tooltipStyle}
              labelFormatter={formatTooltipLabel}
              formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Revenue']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="url(#lb-line-full)"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 5, fill: PINK, stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Summary({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
      <p className={`mt-1 font-display text-2xl ${highlight ? 'text-pink-500' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

const tooltipStyle = {
  background: '#161636',
  border: '1px solid #33336B',
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
};

function formatXTick(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatTooltipLabel(dateStr) {
  // Recharts can pass either the raw 'YYYY-MM-DD' string from our data
  // or, in some edge cases (e.g. when no data point is under the cursor
  // yet), an empty string or undefined. Guard against both.
  if (!dateStr || typeof dateStr !== 'string') return '';

  // Build a UTC date so 'YYYY-MM-DD' isn't shifted by local timezone
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(d.getTime())) return dateStr; // last-resort fallback

  return d.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}