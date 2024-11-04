import axios from 'axios';
import { FaStar } from 'react-icons/fa';


// Calculate the distance between two points
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};



// open a navigation window from the user's location to the toilet's location
export const userToToiletNavigation = (userLat, userLng, toiletLat, toiletLng) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${toiletLat},${toiletLng}`;
};


//navigate to rate and review page
export const rateAndReviewClick = (place_id) => {
  return `/reviewRoute/${place_id}`;
};


//navigator.geolocation.getCurrentPosition(success, error, options)
export const getUserLocation = (setCenter) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // add hint for user whose device have problem in access location
        if (error.code === error.PERMISSION_DENIED) {
          alert('Unable to access location. Please check the browser\'s location permission in system settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert('Unable to access location. Please check your internet connection or GPS settings.');
        } else {
          alert('Unknown error');
        }
      },
      {
        enableHighAccuracy: true,  
        timeout: 5000,  
        maximumAge: 0,  
      }
    );
  } else {
 // add hint for user whose browser have problem in access location
    alert('Your browser does not support location services. Please upgrade or use a different browser.');
  }
};


// fetch averageRating and count from review route
export const fetchRatingAndCount = async (place_id) => {
  try {
    const { averageRating, reviewCount } = (await axios.get(`/routes/reviewRoute/${place_id}/average-rating`)).data;
    return { averageRating, reviewCount };
  } catch (error) {
    console.log(error)
  }
};


// fetch averagerating,review count and distance
export const fetchToiletsWithRatingAndDistance = async (center) => {
  try {
    // Fetch all toilets data near the user's current location
    const { data: toiletAllData } = await axios.get('/routes/toiletRoute/fetch-toilets', {
      params: { lat: center.lat, lng: center.lng },
    });

    const toiletsDataWithDetails = [];
    for (let i = 0; i < toiletAllData.length; i++) {
      const toilet = toiletAllData[i];

      //make sure the data are valid
       if (toilet.place_id && toilet.location && toilet.location.coordinates.length >= 2) {
      try {
        // fetch average rating and review count
        const { averageRating = 0, reviewCount = 0 } = await fetchRatingAndCount(toilet.place_id);
        // calculate distance
        const toiletDistance = calculateDistance(center.lat, center.lng, toilet.location.coordinates[1], toilet.location.coordinates[0]);
        // push data to array
        toiletsDataWithDetails.push({
          ...toilet,
          averageRating,
          reviewCount,
          toiletDistance,
        });
      } catch (error) {
        console.log(error)
      }
     }
    }
    return toiletsDataWithDetails;
  } catch (error) {
    console.log(error)
    return []; 
  }
};



// for render star only
export const renderStarWithoutCount = (rating) => {
  return Array(5).fill(0).map((_, index) => (
    <FaStar key={index} size={14} color={index < rating ? '#F2C265' : '#a9a9a9'} />
  ));
};


//render starwith average rating and count
export const renderStarAverageRatingCount = (rating, reviewCount) => {
  return (
    <div>
      {renderStarWithoutCount(Math.floor(rating))}
      <span style={{ marginLeft: '5px' }}>{rating.toFixed(1)}</span>
      <span style={{ marginLeft: '10px' }}>({reviewCount})</span>
    </div>
  );
};


//change date string format to the local date format
export const changeDateFormat = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

