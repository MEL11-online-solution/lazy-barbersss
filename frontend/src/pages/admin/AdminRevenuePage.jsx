import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatMoney, formatDate } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import RevenueChart from '../../components/admin/RevenueChart';
import { useToast } from '../../context/ToastContext';

export default function AdminRevenuePage() {
  const toast = useToast();
  const [period, setPeriod] = useState('month');
  const [revenue, setRevenue] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [methodFilter, setMethodFilter] = useState('');
  const periodToDays = { week: 7, month: 30, all: 90 };
  const chartDays = periodToDays[period] ?? 30;

  useEffect(() => {
    let alive = true;
    Promise.all([
      adminApi.revenue(period),
      adminApi.transactions({
        page: 1, page_size: 20,
        ...(methodFilter ? { method: methodFilter } : {}),
      }),
    ])
      .then(([r, tx]) => {
        if (!alive) return;
        setRevenue(r);
        setTransactions(tx);
      })
      .catch((e) => {
        toast.error(e.message || 'Failed');
        if (alive) { setRevenue({ totals: { total: 0 }, by_service: [] }); setTransactions({ rows: [] }); }
      });
    return () => { alive = false; };
  }, [period, methodFilter, toast]);

  if (!revenue || !transactions) return <PageLoader />;

  const totals = revenue.totals || {};
  const onlinePct = totals.total ? (totals.online / totals.total) * 100 : 0;
  const counterPct = totals.total ? (totals.counter / totals.total) * 100 : 0;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="h-display">Revenue</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>Track earnings and financial performance</p>
        </div>
        <select className="form-select max-w-xs" value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="week">This week</option>
          <option value="month">This month</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Stat label="Total revenue" value={formatMoney(totals.total_cents || 0)} sub={period} />
        <Stat label="Average booking" value={formatMoney(Math.round((totals.average || 0) * 100))} />
        <Stat label="Online payments" value={formatMoney(totals.online_cents || 0)} sub={`${onlinePct.toFixed(1)}% of total`} />
        <Stat label="Counter payments" value={formatMoney(totals.counter_cents || 0)} sub={`${counterPct.toFixed(1)}% of total`} />
      </div>

      <div className="mt-8">
        <RevenueChart
          days={chartDays}
          variant="full"
          title={`Revenue trend — ${period === 'week' ? 'last 7 days' : period === 'month' ? 'last 30 days' : 'last 90 days'}`}
        />
      </div>

      <h2 className="h-section text-2xl mt-10">Revenue by service</h2>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              <th className="text-left p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>Service</th>
              <th className="text-right p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {revenue.by_service.length === 0 ? (
              <tr><td colSpan="2" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>No data for this period.</td></tr>
            ) : revenue.by_service.map((r, i) => (
              <tr key={r.service_id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>{r.service_name}</td>
                <td className="p-4 text-right text-gold-400">{formatMoney(r.total_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-10">
        <h2 className="h-section text-2xl">Recent transactions</h2>
        <select
          className="form-select max-w-xs"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="">All payment methods</option>
          <option value="online">Online</option>
          <option value="counter">Counter</option>
        </select>
      </div>
      <div className="card mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              {['Date', 'Transaction', 'Customer', 'Service', 'Method', 'Amount'].map((h, i) => (
                <th key={h} className={`p-4 text-xs uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`} style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.rows.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>No transactions yet.</td></tr>
            ) : transactions.rows.map((t, i) => (
              <tr key={t.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{formatDate(t.processed_at)}</td>
                <td className="p-4 font-mono text-xs text-pink-500">{t.transaction_id}</td>
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{t.customer_name || '—'}</td>
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{t.service_name || '—'}</td>
                <td className="p-4 capitalize" style={{ color: 'var(--lb-text-muted)' }}>{t.method}</td>
                <td className="p-4 text-right text-emerald-500">+ {formatMoney(t.amount_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="card-padded">
      <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{label}</p>
      <p className="text-2xl font-display text-pink-500 mt-2">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)' }}>{sub}</p>}
    </div>
  );
}
