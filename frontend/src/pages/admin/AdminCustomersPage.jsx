import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatDate } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AdminCustomersPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    try {
      const r = await adminApi.customers({ q, page, page_size: 10 });
      setData(r);
    } catch (e) {
      toast.error(e.message || 'Failed to load');
      setData({ rows: [], meta: { total: 0, page: 1, page_size: 10 } });
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  if (!data) return <PageLoader />;

  const totalPages = Math.max(1, Math.ceil((data.meta?.total || 0) / (data.meta?.page_size || 10)));

  return (
    <>
      <div>
        <h1 className="h-display">Customers</h1>
        <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>View and manage all registered customers</p>
      </div>

      <form onSubmit={onSearch} className="flex gap-3 mt-6">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="form-input flex-1"
          placeholder="Search by name, email, or phone…"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              {['Customer', 'Email', 'Phone', 'Bookings', 'Last visit'].map((h) => (
                <th key={h} className="text-left p-4 text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>{c.first_name} {c.last_name}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{c.email}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{c.phone || '—'}</td>
                <td className="p-4" style={{ color: 'var(--lb-text)' }}>{c.total_bookings}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{c.last_visit ? formatDate(c.last_visit) : '—'}</td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={p === page ? 'w-9 h-9 rounded bg-pink-500 text-white text-sm font-semibold' : 'w-9 h-9 rounded text-sm'}
              style={p !== page ? { backgroundColor: 'var(--lb-border)', color: 'var(--lb-text)' } : undefined}
            >
              {p}
            </button>
          ))}
          {totalPages > 10 && <span style={{ color: 'var(--lb-text-muted)' }}>… of {totalPages}</span>}
        </div>
      )}
    </>
  );
}
