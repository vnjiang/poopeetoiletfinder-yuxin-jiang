import React, { useState, useEffect } from 'react';
import { fetchToiletsAverageRatingDistance , userToToiletNavigation, getUserLocation, rateAndReviewClick } from './utils';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; 
import './AllToilet.css'; 

const AllToilet = () => {
  const [toilets, setToilets] = useState([]);
  const [center, setCenter] = useState(null);

  useEffect(() => {
    getUserLocation(setCenter);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (center) {
        const toilets = await fetchToiletsAverageRatingDistance(center);
        setToilets(toilets.slice(0, 10)); 
      }
    };
  
    fetchData();
  }, [center]);

  const renderStars = (rating, reviewCount) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className="star-rating">
        {Array.from({ length: fullStars }, (_, index) => (
          <FaStar key={`full-${index}`} />
        ))}
        {halfStar && <FaStarHalfAlt key="half" />}
        {Array.from({ length: emptyStars }, (_, index) => (
          <FaRegStar key={`empty-${index}`} />
        ))}
        <span className="rating-number">{rating.toFixed(1)}</span>
        <span> ({reviewCount || 0})</span> 
      </div>
    );
  };

  return (
    <div className="all-toilet-container">
      <ul className="toilet-list">
        {toilets.map(toilet => (
          <li key={toilet._id} className="toilet-item">
            <div className="toilet-info">
              <div className="toilet-header">
                <h4 className="toilet-name">{toilet.toilet_name}</h4>
                <div className="toilet-price"> €{toilet.price} / use</div>
              </div>
              <div className="toilet-details">
                <p>{toilet.toiletDistance.toFixed(2)} km • {toilet.type} • {toilet.toilet_paper_accessibility ? 'Toilet Paper Available' : 'No Toilet Paper'}</p>
              </div>
              <div className="toilet-rating">
  {renderStars(toilet.averageRating || 0, toilet.reviewCount)}
</div>

              <div className="toilet-actions">
                <button
                  onClick={() => window.open(userToToiletNavigation(toilet.location.coordinates[1], toilet.location.coordinates[0]), '_blank')}
                >
                  Navigate
                </button>
                <button
                  onClick={() => window.open(rateAndReviewClick(toilet.toilet_id))}
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
