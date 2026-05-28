import { useAuth } from '../../context/AuthContext';

export default function StepDetails({ onNext }) {
  const { user } = useAuth();

  return (
    <div className="card-padded mt-4 max-w-2xl mx-auto">
      <h3 className="font-display uppercase tracking-widest" style={{ color: 'var(--lb-text)' }}>Your details</h3>
      <p className="text-sm mt-2" style={{ color: 'var(--lb-text-muted)' }}>
        We'll send your booking confirmation to these contact points.
      </p>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Field label="Name" value={`${user.first_name} ${user.last_name}`} />
        <Field label="Phone" value={user.phone || '(not provided)'} highlight={!user.phone} />
        <Field label="Email" value={user.email} className="sm:col-span-2" />
      </div>

      {!user.phone && (
        <div className="mt-4 p-3 rounded-md border border-yellow-500/40 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 text-xs">
          ⚠ Add a phone number on your profile to receive SMS confirmations.
        </div>
      )}

      <div className="flex justify-end gap-3 mt-8">
        <button onClick={onNext} className="btn-primary">Next: Select service →</button>
      </div>
    </div>
  );
}

function Field({ label, value, highlight, className }) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-white/50">{label}</p>
      <p className={`mt-1 font-medium ${highlight ? 'text-yellow-600 dark:text-yellow-300' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}
