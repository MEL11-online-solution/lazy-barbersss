import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import client from '../../api/client';
import { formatDate, formatTime } from '../../lib/format';
import Spinner from '../../components/common/Spinner';

const ACTION_FILTERS = [
  { value: '', label: 'All Actions' },
  { value: 'booking', label: 'Bookings' },
  { value: 'service', label: 'Services' },
  { value: 'auth', label: 'Auth' },
];

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, page_size: 50 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [since, setSince] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminApi
      .auditLogs({ action: actionFilter || undefined, since: since || undefined, page, page_size: 50 })
      .then(({ rows, meta: m }) => {
        setLogs(rows);
        setMeta(m || { total: 0, page, page_size: 50 });
      })
      .finally(() => setLoading(false));
  }, [actionFilter, since, page]);

  async function exportData(format) {
    setExporting(true);
    try {
      const params = { format };
      if (actionFilter) params.action = actionFilter;
      if (since) params.since = since;
      const response = await client.get('/admin/audit-logs/export', {
        params,
        responseType: format === 'csv' ? 'text' : 'json',
      });
      const content =
        format === 'csv' ? response.data : JSON.stringify(response.data, null, 2);
      const blob = new Blob([content], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function clearFilters() {
    setActionFilter('');
    setSince('');
    setPage(1);
  }

  const totalPages = Math.ceil((meta.total || 0) / (meta.page_size || 50));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display uppercase tracking-widest text-2xl" style={{ color: 'var(--lb-text)' }}>Audit Logs</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--lb-text-muted)' }}>
            {(meta.total || 0).toLocaleString()} total entries
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportData('json')} disabled={exporting} className="btn-secondary btn-sm disabled:opacity-50">↓ JSON</button>
          <button onClick={() => exportData('csv')} disabled={exporting} className="btn-secondary btn-sm disabled:opacity-50">↓ CSV</button>
        </div>
      </div>

      <div className="card p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="form-label">Action</label>
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="form-input">
            {ACTION_FILTERS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Since</label>
          <input type="date" value={since} onChange={(e) => { setSince(e.target.value); setPage(1); }} className="form-input" />
        </div>
        {(actionFilter || since) && (
          <button onClick={clearFilters} className="btn-ghost btn-sm">Clear filters</button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center"><Spinner /></div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center" style={{ color: 'var(--lb-text-muted)' }}>No audit log entries found</div>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ borderBottom: '1px solid var(--lb-border)' }}>
                <tr>
                  {['Time', 'Action', 'Entity', 'User', 'Details'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest" style={{ color: 'var(--lb-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ borderTop: i > 0 ? '1px solid var(--lb-border)' : undefined }}>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--lb-text-muted)' }}>
                      {formatDate(log.created_at)} {formatTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${actionBadge(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--lb-text-muted)' }}>
                      {log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--lb-text-muted)' }}>
                      {log.user_id ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono max-w-xs truncate" style={{ color: 'var(--lb-text-muted)', opacity: 0.8 }}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm" style={{ color: 'var(--lb-text-muted)' }}>Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost btn-sm disabled:opacity-30">← Prev</button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost btn-sm disabled:opacity-30">Next →</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function actionBadge(action) {
  if (action.startsWith('booking')) return 'badge-confirmed';
  if (action.startsWith('auth')) return 'badge-pending';
  return '';
}
