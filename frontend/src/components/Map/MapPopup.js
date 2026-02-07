import React from 'react';
import {
  calculateDistance,
  userToToiletNavigation,
  renderStarAverageRatingCount,
  rateAndReviewClick,
} from '../../utils/utils';
import { getFeeLabel } from '../../utils/priceLabel';


const MapPopup = ({
  toilet,
  center,
  averageRating = 0,
  reviewCount = 0,
  price,
}) => {
  if (!toilet || !center) return null;

  const lat = toilet.location?.coordinates?.[1];
  const lng = toilet.location?.coordinates?.[0];

  const distanceText =
    lat && lng
      ? `${calculateDistance(center.lat, center.lng, lat, lng).toFixed(1)} km`
      : 'N/A';

  return (
    // 稍微往上抬一点，抵消 InfoWindow 顶部空白
    <div className="max-w-[260px] break-words -mt-2">
      {/* 去掉 bg-white / rounded-xl / shadow-md，只保留内边距和排版 */}
      <div className="px-3.5 pt-2 pb-3 text-left">
        {/* 标题 */}
        <h4 className="mb-1 text-sm sm:text-base font-semibold text-slate-900 leading-snug">
          {toilet.toilet_name}
        </h4>

        {/* 描述 */}
        {toilet.toilet_description && (
          <p className="mb-1.5 text-xs text-slate-600 leading-snug line-clamp-3">
            {toilet.toilet_description}
          </p>
        )}

        {/* 评分：和列表一致，有评论显示星星，否则显示 No reviews yet */}
        <div className="mb-2 text-xs">
          {reviewCount > 0 ? (
            <div className="flex items-center gap-1 text-[#f1c40f]">
              {renderStarAverageRatingCount(averageRating, reviewCount)}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 italic">
              No reviews yet
            </span>
          )}
        </div>

        {/* 信息区 */}
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-baseline gap-2">
            <span className="min-w-[40px] text-[11px] uppercase tracking-wide text-slate-400">
              Fee
            </span>
<span className="text-slate-900">
  {getFeeLabel(toilet)}
</span>
          </div>



          <div className="flex items-baseline gap-2">
            <span className="min-w-[40px] text-[11px] uppercase tracking-wide text-slate-400">
              Dist.
            </span>
            <span className="text-slate-900">
              {distanceText}
            </span>
          </div>
        </div>

        {/* 操作按钮：永远横向、等宽、等高 */}
        <div className="mt-3 flex flex-row gap-2">
          {/* 主按钮 */}
          <button
            className="
              flex-1 basis-1/2
              inline-flex items-center justify-center
              h-9 px-3
              rounded-lg
              bg-gradient-to-r from-[#1E40AF] to-[#6366F1]
              text-xs font-semibold text-white
              shadow-sm
              hover:from-[#1D4ED8] hover:to-[#4F46E5]
              focus:outline-none
              transition
              whitespace-nowrap
            "
            onClick={() =>
              window.open(
                userToToiletNavigation(center.lat, center.lng, lat, lng),
                '_blank'
              )
            }
          >
            <span>Navigate</span>
          </button>

          {/* 次按钮 */}
          <button
            className="
              flex-1 basis-1/2
              inline-flex items-center justify-center
              h-9 px-3
              rounded-lg
              border border-[#C7D2FE]
              bg-[#EEF2FF]
              text-xs font-medium text-[#3730A3]
              hover:bg-[#E0E7FF]
              focus:outline-none
              transition
              whitespace-nowrap
            "
            onClick={() =>
              (window.location.href = rateAndReviewClick(toilet.place_id))
            }
          >
            <span>Rate &amp; Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPopup;
