const SharedToiletForm = ({ value, onChange, onSubmit, onCancel, isEditing, loading }) => {
  const inputBase =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200';

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4"
    >
    
      {isEditing && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-900 flex items-center justify-between">
          <span>You are editing an existing toilet.</span>
          <button
            type="button"
            onClick={onCancel}
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
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          {isEditing ? 'Edit Toilet' : 'Share a Toilet'}
        </h2>
      </div>

      <input
        className={inputBase}
        placeholder="Toilet name"
        value={value.toilet_name || ''}
        onChange={(e) => onChange('toilet_name', e.target.value)}
        required
      />

      <textarea
        className={`${inputBase} min-h-[96px]`}
        placeholder="Description"
        value={value.toilet_description || ''}
        onChange={(e) => onChange('toilet_description', e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={inputBase}
          placeholder="Eircode"
          value={value.eircode || ''}
          onChange={(e) => onChange('eircode', e.target.value)}
          required
        />

        <input
          className={inputBase}
          placeholder="Contact number"
          value={value.contact_number || ''}
          onChange={(e) => onChange('contact_number', e.target.value)}
          required
        />
      </div>

      <select
        className={inputBase}
        value={value.type || 'free'}
        onChange={(e) => onChange('type', e.target.value)}
      >
        <option value="free">Free</option>
        <option value="free for customer">Free for customer</option>
        <option value="paid">Paid</option>
      </select>

      {value.type === 'paid' && (
        <select
          className={inputBase}
          value={value.price || ''}
          onChange={(e) => onChange('price', e.target.value)}
          required
        >
          <option value="">Select price</option>
          <option value="€0.2">€0.2</option>
          <option value="€0.5">€0.5</option>
          <option value="€1">€1</option>
          <option value="€1.5">€1.5</option>
          <option value="€2">€2</option>
        </select>
      )}

      <button
        disabled={loading}
        className="
    w-full
    rounded-lg
    bg-indigo-600
    hover:bg-indigo-700
    text-white
    py-2
    text-sm
    font-medium
    transition
    disabled:opacity-50
  "
      >
        {loading ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}
      </button>

    </form>
  );
};

export default SharedToiletForm;
