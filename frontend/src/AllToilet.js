
import React, { useState, useEffect } from 'react';
import { userToToiletNavigation, rateAndReviewClick, fetchToiletsWithRatingAndDistance, renderStarAverageRatingCount } from './utils';
import './AllToilet.css';
import { useNavigate } from 'react-router-dom';


//userLocation is defined in App.js
const AllToilet = ({ userLocation }) => {
  const [toilets, setToilets] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    //make sure location data exist
    if (userLocation && userLocation.lat && userLocation.lng) {
      const fetchToiletData = async () => {
        try {
          const toiletDetailData = await fetchToiletsWithRatingAndDistance(userLocation);
          // Sort toilets by distance
          const sortToiletByDistance = toiletDetailData.sort((a, b) => a.toiletDistance - b.toiletDistance);
          //only nearest 10 items will be displayed
          setToilets(sortToiletByDistance.slice(0, 10));
        } catch (error) {
          console.error(error);
        }
      };
      //execute toilet data fetch
      fetchToiletData();
    } 
  }, [userLocation]);



//for all function below, you can view it in utils.js
  return (
    <div className="container">
      <ul className="list">
        {toilets.map(toilet => (
          <li key={toilet._id || toilet.place_id} className="item">
            <div className="info">
              <div className="name-price">
                <div className="name">{toilet.toilet_name}</div>
                <div className="price"> €{toilet.price}</div>
              </div>

              <div className="detail-info">
                <p>
                  {`${toilet.toiletDistance.toFixed(2)} km - ${toilet.type} - ${toilet.toilet_paper_accessibility ? 'Toilet Paper Available' : 'No Toilet Paper'}`}
                </p>
                <p>{toilet.toilet_description}</p>
              </div>

              <div className="rating-star">
                {renderStarAverageRatingCount(toilet.averageRating, toilet.reviewCount)}
              </div>

              <div className="button">
                <button
                  onClick={() => window.open(userToToiletNavigation(userLocation.lat, userLocation.lng, toilet.location.coordinates[1], toilet.location.coordinates[0]), '_blank')}
                >
                  Navigate
                </button>
                <button
                  onClick={() => navigate(rateAndReviewClick(toilet.place_id))}
                >
                  Rate & Review
                </button>
              </div>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllToilet;
