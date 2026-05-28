import { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import { formatDate } from '../../lib/format';
import { PageLoader } from '../../components/common/Spinner';
import { useToast } from '../../context/ToastContext';

export default function AdminContactPage() {
  const toast = useToast();
  const [data, setData] = useState(null);

  async function load() {
    try {
      setData(await adminApi.contactMessages());
    } catch (e) {
      toast.error(e.message || 'Failed');
      setData({ rows: [], meta: {} });
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function markRead(id) {
    try {
      await adminApi.markContactRead(id);
      await load();
    } catch (e) {
      toast.error(e.message || 'Failed');
    }
  }

  if (!data) return <PageLoader />;

  return (
    <>
      <div>
        <h1 className="h-display">Contact Messages</h1>
        <p className="mt-1" style={{ color: 'var(--lb-text-muted)' }}>
          {data.meta?.unread_count > 0
            ? `${data.meta.unread_count} unread message${data.meta.unread_count === 1 ? '' : 's'}`
            : 'All caught up.'}
        </p>
      </div>

      <div className="space-y-3 mt-8">
        {data.rows.length === 0 ? (
          <div className="card-padded text-center" style={{ color: 'var(--lb-text-muted)' }}>No messages yet.</div>
        ) : data.rows.map((m) => (
          <div key={m.id} className={`card-padded ${m.is_read ? 'opacity-70' : ''}`} style={!m.is_read ? { borderColor: 'rgba(236,72,153,0.4)' } : undefined}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold" style={{ color: 'var(--lb-text)' }}>
                  {m.full_name}
                  {!m.is_read && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-pink-500" />}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--lb-text-muted)' }}>
                  {m.email} {m.phone ? `· ${m.phone}` : ''}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--lb-text-muted)', opacity: 0.7 }}>{formatDate(m.created_at)}</p>
              </div>
              {!m.is_read && (
                <button onClick={() => markRead(m.id)} className="btn-ghost btn-sm">Mark read</button>
              )}
            </div>
            {m.subject && <p className="font-display tracking-wider uppercase text-sm mt-3" style={{ color: 'var(--lb-text)' }}>{m.subject}</p>}
            <p className="mt-2 whitespace-pre-wrap text-sm" style={{ color: 'var(--lb-text-muted)' }}>{m.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
