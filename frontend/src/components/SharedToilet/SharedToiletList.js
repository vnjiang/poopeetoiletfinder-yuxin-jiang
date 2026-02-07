import SharedToiletItem from './SharedToiletItem';

const SharedToiletList = ({ items = [], onEdit, onDelete }) => {
  const safe = (items || []).filter((t) => t && typeof t === 'object' && t._id);

  if (!safe.length) {
    return (
      <p className="mt-6 text-center text-sm text-slate-500">
        You haven’t shared any toilets yet.
      </p>
    );
  }

  return (
    <ul
      className="
        bg-white
        rounded-xl
        border border-slate-100
        shadow-sm
        divide-y divide-slate-100
        w-full
      "
    >
      {safe.map((t) => (
        <SharedToiletItem
          key={t._id}
          toilet={t}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default SharedToiletList;
