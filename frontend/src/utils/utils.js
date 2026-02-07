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
  return `/rate-and-review/${place_id}`;
};


//navigator.geolocation.getCurrentPosition(success, error, options)
export const getUserLocation = (setCenter) => {
  const fallback = { lat: 51.8985, lng: -8.4756 };

  const tryOnce = (opts) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });

  (async () => {
    if (!navigator.geolocation) return setCenter(fallback);

    try {
      const p1 = await tryOnce({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
      return setCenter({ lat: p1.coords.latitude, lng: p1.coords.longitude });
    } catch (e1) {
      console.warn("Low accuracy failed, retry high accuracy:", e1);

      try {
        
        const p2 = await tryOnce({ enableHighAccuracy: true, timeout: 25000, maximumAge: 0 });
        return setCenter({ lat: p2.coords.latitude, lng: p2.coords.longitude });
      } catch (e2) {
        console.error("High accuracy failed:", e2);
        return setCenter(fallback);
      }
    }
  })();
};




// fetch averageRating and count from review route
/*
export const fetchRatingAndCount = async (place_id) => {
  try {
    const { averageRating, reviewCount } = (await axios.get(`/routes/reviewRoute/${place_id}/average-rating`)).data;
    return { averageRating, reviewCount };
  } catch (error) {
    console.log(error)
  }
};
*/

export const fetchRatingsBatch = async (placeIds) => {
  try {
    const res = await axios.post('/routes/reviewRoute/ratings-batch', { placeIds });
    return res.data || {};
  } catch (e) {
    console.log(e);
    return {}; 
  }
};





// fetch averagerating,review count and distance
export const fetchToiletsWithRatingAndDistance = async (center) => {
  try {
    const { data: toilets } = await axios.get('/routes/toiletRoute/fetch-toilets', {
      params: { lat: center.lat, lng: center.lng },
    });

    const valid = (toilets || []).filter(
      (t) => t?.place_id && t?.location?.coordinates?.length >= 2
    );

    const placeIds = [...new Set(valid.map((t) => String(t.place_id)))];

  
    const ratingMap = await fetchRatingsBatch(placeIds);

    return valid.map((toilet) => {
      const r = ratingMap?.[toilet.place_id] || { averageRating: 0, reviewCount: 0 };

      const averageRating = Number.isFinite(r.averageRating) ? r.averageRating : 0;
      const reviewCount = Number.isFinite(r.reviewCount) ? r.reviewCount : 0;

      const toiletDistance = calculateDistance(
        center.lat,
        center.lng,
        toilet.location.coordinates[1],
        toilet.location.coordinates[0]
      );

      return {
        ...toilet,
        averageRating,
        reviewCount,
        toiletDistance,
      };
    });
  } catch (error) {
    console.log(error);
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
/*
export const renderStarAverageRatingCount = (rating, reviewCount) => {
  return (
    <div>
      {renderStarWithoutCount(Math.floor(rating))}
      <span style={{ marginLeft: '5px' }}>{rating.toFixed(1)}</span>
      <span style={{ marginLeft: '10px' }}>({reviewCount})</span>
    </div>
  );
};
*/
export const renderStarAverageRatingCount = (rating, reviewCount) => {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const safeCount = Number.isFinite(reviewCount) ? reviewCount : 0;

  return (
        <span style={{ display: 'inline-flex',alignItems: 'center',gap: '8px',}}>
      {renderStarWithoutCount(Math.floor(safeRating))}
      <span style={{ marginLeft: '5px' }}>{safeRating.toFixed(1)}</span>
      <span style={{ marginLeft: '10px' }}>({safeCount})</span>
    </span>
  );
};



//change date string format to the local date format
export const changeDateFormat = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

