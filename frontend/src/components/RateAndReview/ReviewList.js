import ReviewItem from './ReviewItem';

const ReviewList = ({ reviews, currentUser, onDelete }) => {
  if (!reviews.length) {
    return (
      <p className="min-h-[50vh] flex items-center justify-center text-sm text-slate-500">
        Be the first to share your experience.
      </p>
    );
  }

  return (
<ul
  className="
    bg-white
    rounded-lg
    border border-slate-100
    shadow-sm
    divide-y divide-slate-100
    max-h-[78vh]
    w-full
     max-w-[90vw] lg:max-w-[70vw]
    overflow-y-auto
    scrollbar-none
    mx-auto
  "
>

      {reviews.map((review) => (
        <ReviewItem
          key={review._id}
          review={review}
          canDelete={currentUser?.uid === review.user_id}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default ReviewList;
