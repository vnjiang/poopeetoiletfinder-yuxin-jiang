import React, { useState } from 'react';

const badge = (text) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
    {text}
  </span>
);

const AdminItem = ({ toilet, onApprove, onReject }) => {
  const [busy, setBusy] = useState(false);

  const name = toilet.toilet_name || '(Unnamed)';
  const desc = toilet.toilet_description || '';
  const type = toilet.type ? String(toilet.type) : 'unknown';
  const price = toilet.price ?? '—';
  const created = toilet.created || '——';


  const handleApproveClick = async () => {
    try {
      setBusy(true);
      await onApprove(toilet);
    } finally {
      setBusy(false);
    }
  };

  const handleRejectClick = async () => {
    const ok = window.confirm('Reject this submission? This cannot be undone.');
    if (!ok) return;

    try {
      setBusy(true);
      await onReject(toilet._id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-gray-900">{name}</h3>
            {badge(type)}
            {price !== '—' ? badge(`${price}`) : badge('No price')}
          </div>

          {desc ? (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{desc}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-400 italic">No description</p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="font-semibold text-gray-700">ID</div>
              <div className="truncate">{toilet._id}</div>
            </div>


            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <div className="font-semibold text-gray-700">Submitted</div>
              <div>{created}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:flex-col sm:w-36">
          <button
            onClick={handleApproveClick}
            disabled={busy}
            className="inline-flex justify-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {busy ? 'Working…' : 'Approve'}
          </button>

          <button
            onClick={handleRejectClick}
            disabled={busy}
            className="inline-flex justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-200"
          >
            Reject
          </button>

        </div>
      </div>
    </div>
  );
};

export default AdminItem;
