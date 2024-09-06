import axios from 'axios';

const BASE_URL = process.env.BASE_URL || '';

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export const calculateAverage = (ratings) => {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return sum / ratings.length;
};

export const userToToiletNavigation = (userLat, userLng, toiletLat, toiletLng) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${toiletLat},${toiletLng}`;
};

export const rateAndReviewClick = (toiletId) => {
  window.location.href = `${BASE_URL}/reviewRoute/${toiletId}`;
};

export const getUserLocation = (setCenter) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    (error) => {
      console.error("Error getting location: ", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
};

export const fetchToiletsRating = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/models/toilets`);
    console.log('fetchToiletsRating response:', res.data);  
    
    if (!Array.isArray(res.data)) {
      throw new Error('Expected an array but got: ' + JSON.stringify(res.data));
    }
    
    const toilets = res.data;

    const toiletRatings = await Promise.all(toilets.map(async (toilet) => {
      const ratingRes = await axios.get(`${BASE_URL}/routes/reviewRoute/${toilet.toilet_id}/average-rating`);
      return { ...toilet, averageRating: ratingRes.data.averageRating };
    }));

    return toiletRatings;
  } catch (error) {
    console.error('Error fetching toilets:', error);
    throw error;
  }
};

export const fetchToiletsAverageRatingDistance = async (center) => {
  if (!center) {
    throw new Error('User location is required');
  }

  const res = await axios.get(`${BASE_URL}/routes/toiletRoute`);
  if (!Array.isArray(res.data)) {
    throw new Error('Expected an array but got: ' + JSON.stringify(res.data));
  }

  const toilets = await Promise.all(res.data.map(async (toilet) => {
    const ratingRes = await axios.get(`${BASE_URL}/routes/reviewRoute/${toilet.toilet_id}/average-rating`);
    const { averageRating, reviewCount } = ratingRes.data;
    const toiletDistance = calculateDistance(
      center.lat, center.lng,
      toilet.location.coordinates[1], toilet.location.coordinates[0]
    );
    return { ...toilet, toiletDistance, averageRating, reviewCount };
  }));

  return toilets.sort((a, b) => a.toiletDistance - b.toiletDistance);
};


// utils.js
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(); 
};
