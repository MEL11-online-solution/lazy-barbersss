import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatDate } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AdminClubMembersPage() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    try {
      const r = await adminApi.clubMembers({ q, page, page_size: 20 });
      setData(r);
    } catch (e) {
      toast.error(e.message || 'Failed to load');
      setData({ rows: [], meta: { total: 0, page: 1, page_size: 20 } });
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page]);

  function onSearch(e) {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  }

  async function handleDelete(member) {
    if (!window.confirm(`Remove ${member.email} from the club?`)) return;
    setDeleting(member.id);
    try {
      await adminApi.deleteClubMember(member.id);
      toast.success('Member removed.');
      load();
    } catch (e) {
      toast.error(e.message || 'Failed to remove member');
    } finally {
      setDeleting(null);
    }
  }

  function exportCsv() {
    if (!data?.rows?.length) return;
    const header = 'Name,Email,Joined';
    const lines = data.rows.map((m) =>
      [`"${m.first_name || ''}"`, `"${m.email}"`, `"${formatDate(m.created_at)}"`].join(',')
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'club-members.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!data) return <PageLoader />;

  const total = data.meta?.total || 0;
  const pageSize = data.meta?.page_size || 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="h-display">Club Members</h1>
          <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>
            {total} member{total !== 1 ? 's' : ''} signed up for exclusive offers
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data.rows.length}
          className="btn-secondary disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <form onSubmit={onSearch} className="flex gap-3 mt-6">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="form-input flex-1"
          placeholder="Search by name or email…"
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
            <tr>
              {['Name', 'Email', 'Joined', ''].map((h, i) => (
                <th
                  key={i}
                  className="text-left p-4 text-xs uppercase tracking-widest"
                  style={{ color: 'var(--lb-text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((m, i) => (
              <tr key={m.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                <td className="p-4 font-semibold" style={{ color: 'var(--lb-text)' }}>
                  {m.first_name || <span style={{ color: 'var(--lb-text-muted)' }}>—</span>}
                </td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{m.email}</td>
                <td className="p-4" style={{ color: 'var(--lb-text-muted)' }}>{formatDate(m.created_at)}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(m)}
                    disabled={deleting === m.id}
                    className="text-xs px-3 py-1.5 rounded font-semibold transition-colors disabled:opacity-40"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                    }}
                  >
                    {deleting === m.id ? 'Removing…' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center" style={{ color: 'var(--lb-text-muted)' }}>
                  No members found.
                </td>
              </tr>
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
