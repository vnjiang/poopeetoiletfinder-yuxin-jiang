import UserReviewItem from './UserReviewItem';

const UserReviewList = ({ reviews, onDelete }) => {
  if (!reviews.length) {
    return (
      <p className="text-sm text-slate-500">
        You haven’t written any reviews yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4 max-h-[52vh] overflow-y-auto scrollbar-none pr-1 ">
      {reviews.map((review) => (
        <UserReviewItem
          key={review._id}
          review={review}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};

export default UserReviewList;
