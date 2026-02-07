const SharedToiletItem = ({ toilet, onEdit, onDelete }) => {

  const isApproved = toilet.approved_by_admin === true;
  const isRejected = toilet.rejected === true;

  let statusText = "Pending";
  let statusClass = "bg-amber-50 text-amber-700 border-amber-200";

  if (isApproved) {
    statusText = "Approved";
    statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (isRejected) {
    statusText = "Rejected";
    statusClass = "bg-rose-50 text-rose-700 border-rose-200";
  }



  const priceText =
    toilet.type === 'paid'
      ? String(toilet.price || '').replace(/^€/, '') 
      : null;

  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900 truncate">
              {toilet.toilet_name || 'Shared toilet'}
            </h3>

            <span
              className="
                shrink-0
                rounded-full
                border border-slate-200
                px-2 py-0.5
                text-[11px]
                text-slate-600
              "
            >
              {toilet.type}
              {toilet.type === 'paid' && priceText ? ` · €${priceText}` : ''}
            </span>
          </div>



          <span
            className={`
    shrink-0 rounded-full border px-2 py-0.5
    text-[11px] font-medium
    ${statusClass}
  `}
          >
            {statusText}
          </span>



          <p className="mt-1 text-sm text-slate-700 leading-relaxed break-words">
            {toilet.toilet_description}
          </p>

          <div className="mt-2 text-xs text-slate-500">
            {toilet.eircode ? <span className="mr-3">Eircode: {toilet.eircode}</span> : null}
            {toilet.contact_number ? <span>Contact: {toilet.contact_number}</span> : null}
          </div>
        </div>


        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(toilet)}
            className="
      rounded-lg
      border border-slate-200
      px-3 py-1.5
      text-xs font-medium
      text-slate-700
      hover:bg-slate-50
      transition
    "
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => {
              const ok = window.confirm(
                `Delete "${toilet.toilet_name || "this toilet"}"?\nThis action cannot be undone.`
              );
              if (ok) onDelete(toilet._id);
            }}
            className="
      rounded-lg
      border border-slate-200
      px-3 py-1.5
      text-xs font-medium
      text-slate-500
      hover:text-red-600
      hover:border-red-200
      hover:bg-red-50
      transition
    "
          >
            Delete
          </button>
        </div>

      </div>
    </li>
  );
};

export default SharedToiletItem;
