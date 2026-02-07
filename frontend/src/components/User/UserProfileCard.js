const UserProfileCard = ({ user, onLogout }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {user.displayName || 'Anonymous User'}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {user.email}
        </p>
      </div>

      <div className="mt-3 space-y-1 text-xs text-slate-400">
        <p>User ID: {user.uid}</p>
        <p>
          Joined{' '}
          {new Date(user.metadata.creationTime).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={onLogout}
        className="
          mt-6
          w-full
          rounded-lg
          border border-slate-200
          py-2
          text-sm
          text-red-600
          hover:bg-slate-50
          transition
        "
      >
        Log out
      </button>
    </div>
  );
};

export default UserProfileCard;
