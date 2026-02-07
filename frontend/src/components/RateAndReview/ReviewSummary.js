import { renderStarWithoutCount } from '../../utils/utils';

const ReviewSummary = ({ avgRating, total, onWrite }) => {
  return (
    <section className="flex items-center justify-between gap-8 w-full  max-w-[90vw] lg:max-w-[70vw] mx-auto mb-3 mt-[50px] lg:mt-0 pt-[50px]">


      <div className="flex items-center gap-5">
        <div className="text-4xl font-semibold text-slate-900 leading-none">
          {total > 0 ? avgRating.toFixed(1) : '0.0'}
        </div>


        <div className="flex flex-col gap-1.5">
          <div className={`flex ${total > 0 ? "text-[#f1c40f]" : "text-slate-300"}`}>
            {renderStarWithoutCount(total > 0 ? Math.round(avgRating) : 0)}
          </div>

          {total > 0 ? (
            <span className="text-sm text-slate-500 leading-tight">
              {total} review{total > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-sm text-slate-500 leading-tight">
              No reviews yet
            </span>
          )}
        </div>

      </div>


      <button
        onClick={onWrite}
        className="
  rounded-lg
  bg-gradient-to-r from-[#1E40AF] to-[#6366F1]
  px-4 py-2
  text-sm font-semibold text-white
  hover:from-[#1D4ED8] hover:to-[#4F46E5]
  transition
"

      >
        Write review
      </button>
    </section>
  );
};

export default ReviewSummary;
