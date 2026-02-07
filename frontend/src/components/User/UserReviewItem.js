const UserReviewItem = ({ review, onDelete }) => {
  return (
    <li className="rounded-lg border border-slate-100 p-4">

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-900 truncate">
          {review.toilet_name || 'Toilet review'}
        </p>

        <button
          onClick={() => onDelete(review._id)}
          className="
            text-slate-400
            hover:text-red-500
            text-xs
            transition
            shrink-0
          "
        >
          Delete
        </button>
      </div>

    
      <p className="mt-2 text-sm text-slate-600 break-all">
        {review.comment}
      </p>

      <div className="mt-2 text-xs text-slate-400">
        {new Date(
          review.created_date || review.createdAt
        ).toLocaleDateString()}
      </div>
    </li>
  );
};

export default UserReviewItem;

