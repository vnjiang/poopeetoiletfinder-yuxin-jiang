import React, { useState, useEffect } from 'react';
import {
  userToToiletNavigation,
  rateAndReviewClick,
  fetchToiletsWithRatingAndDistance,
  renderStarAverageRatingCount,
} from '../../utils/utils';
import { useNavigate } from 'react-router-dom';
import { getFeeLabel } from '../../utils/priceLabel';


const AllToilet = ({ userLocation }) => {
  const [toilets, setToilets] = useState([]);
  const navigate = useNavigate();

  const fetchToilets = async (location) => {
    const data = await fetchToiletsWithRatingAndDistance(location);
    return [...data]
      .sort((a, b) => a.toiletDistance - b.toiletDistance)
      .slice(0, 10);
  };

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) return;

    fetchToilets(userLocation)
      .then(setToilets)
      .catch(console.error);
  }, [userLocation]);


  return (

    <div className="m-0 h-full min-h-0 flex flex-col">


      <div className="px-3 pt-0 pb-3 pr-4 border-b border-slate-100 bg-white">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Nearby toilets
          </h2>
          <span className="text-[13px] text-slate-500">
            Sorted by distance • Top 10
          </span>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto">
        
   
        <ul className="w-full p-0 list-none space-y-3">
          {toilets.map((toilet) => (
            <li
              key={toilet._id || toilet.place_id}
              className="bg-white border border-gray-100 rounded-xl p-[19px] shadow-sm"

            >
              <div className="flex-1">
              
                <div className="flex justify-between items-start gap-2">
                  <div className="font-semibold text-[13px] sm:text-[14px] md:text-[15px] leading-snug">
                    {toilet.toilet_name}
                  </div>
                  <div className="text-xs sm:text-sm text-[#6366F1] font-medium whitespace-nowrap">
                    {getFeeLabel(toilet)}
                  </div>

                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                  <span className="font-medium text-gray-700">
                    {toilet.toiletDistance.toFixed(2)} km
                  </span>

                  {toilet.toilet_paper_accessibility && <span>🧻</span>}
                </div>

            
                <div className="mt-1.5 mb-2 text-xs">
                  {toilet.reviewCount > 0 ? (
                    <div className="flex items-center gap-1 text-[#f1c40f]">
                      {renderStarAverageRatingCount(
                        toilet.averageRating,
                        toilet.reviewCount
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      No reviews yet
                    </span>
                  )}
                </div>


        
                <div className="mt-2.5 flex flex-row gap-2.5">
               
                  <button
                    className="flex-1 basis-1/2 inline-flex items-center justify-center h-8 px-3 rounded-lg bg-gradient-to-r from-[#1E40AF] to-[#6366F1] text-[11px] sm:text-xs font-semibold text-white shadow-sm hover:from-[#1D4ED8] hover:to-[#4F46E5] focus:outline-none transition whitespace-nowrap"

                    onClick={() =>
                      window.open(
                        userToToiletNavigation(
                          userLocation.lat,
                          userLocation.lng,
                          toilet.location.coordinates[1],
                          toilet.location.coordinates[0]
                        ),
                        '_blank'
                      )
                    }
                  >
                    Navigate
                  </button>

              
                  <button
                    className="flex-1 basis-1/2 inline-flex items-center justify-center h-8 px-3 rounded-lg border border-[#C7D2FE] bg-[#EEF2FF] text-[11px] sm:text-xs font-medium text-[#3730A3] hover:bg-[#E0E7FF] focus:outline-none transition whitespace-nowrap"

                    onClick={() => navigate(rateAndReviewClick(toilet.place_id))}
                  >
                    Rate &amp; Review
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AllToilet;
