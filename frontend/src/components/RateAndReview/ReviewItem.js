import { renderStarWithoutCount, changeDateFormat } from '../../utils/utils';

const ReviewItem = ({ review, canDelete, onDelete }) => {
  const rating = Number.isFinite(Number(review.rating))
    ? Number(review.rating)
    : 0;

  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
  
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-sm group">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-slate-900 truncate">
                {review.user_name || 'Anonymous'}
              </span>
              <span className="text-slate-400 shrink-0">
                · {changeDateFormat(review.created_date)}
              </span>
            </div>

            {canDelete && (
              <button
                onClick={() => onDelete(review._id)}
                className="
        text-slate-400
        hover:text-red-500
        text-xs
        transition
        shrink-0
      "
                aria-label="Delete review"
              >
                Delete
              </button>
            )}
          </div>


          <div className="mt-1 flex items-center gap-1 text-xs">
            <div className="text-[#f1c40f] flex">
              {renderStarWithoutCount(Math.round(rating))}
            </div>
            <span className="ml-1 text-slate-400">
              {rating.toFixed(1)}
            </span>

          </div>


          <p className="mt-2 text-sm text-slate-800 leading-relaxed break-all w-full ">
            {review.comment}
          </p>
        </div>


      </div>
    </li>
  );
};

export default ReviewItem;
