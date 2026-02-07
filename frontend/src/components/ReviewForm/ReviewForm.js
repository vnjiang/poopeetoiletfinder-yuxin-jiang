import React, { useState } from 'react';

const ReviewForm = ({ onSubmit, isSubmitting, submitError }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (rating < 1) {
      errors.rating = 'Please select a rating';
    }

    if (!comment || comment.trim().length < 5) {
      errors.comment = 'Your review is too short';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-100 rounded-lg p-5"
    >
    
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Rating
        </label>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = hoverRating
              ? value <= hoverRating
              : value <= rating;

            return (
              <button
                key={value}
                type="button"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                className="text-xl leading-none focus:outline-none"
                aria-label={`Rate ${value} star`}
              >
                <span
                  className={
                    active
                      ? 'text-[#f1c40f]'
                      : 'text-slate-300'
                  }
                >
                  ★
                </span>
              </button>
            );
          })}
        </div>

        {fieldErrors.rating && (
          <p className="mt-1 text-xs text-red-600">
            {fieldErrors.rating}
          </p>
        )}
      </div>

    
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Comment
        </label>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="
            w-full rounded-md border border-slate-200
            px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
          placeholder="What was your experience like?"
        />
        {fieldErrors.comment && (
          <p className="mt-1 text-xs text-red-600">
            {fieldErrors.comment}
          </p>
        )}
      </div>


      {submitError && (
        <p className="mb-3 text-sm text-red-600">
          {submitError}
        </p>
      )}

    
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full h-10
          rounded-lg
          bg-gradient-to-r from-[#1E40AF] to-[#6366F1]
          text-sm font-semibold text-white
          hover:from-[#1D4ED8] hover:to-[#4F46E5]
          disabled:opacity-60
          transition
        "
      >
        {isSubmitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
};

export default ReviewForm;
