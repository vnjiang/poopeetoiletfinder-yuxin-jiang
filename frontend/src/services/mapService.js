// src/services/mapService.js

import { fetchRatingsBatch } from '../utils/utils';


export const fetchNearbyToilets = async ({ lat, lng }) => {
  const res = await fetch(
    `/routes/toiletRoute/fetch-toilets?lat=${lat}&lng=${lng}`
  );

  if (
    !res.ok ||
    !res.headers.get('content-type')?.includes('application/json')
  ) {
    throw new Error(`Fetch toilets failed: ${res.status}`);
  }

  const toilets = await res.json();
  return toilets;
};


export const fetchToiletRatings = async (toilets) => {
  if (!Array.isArray(toilets) || toilets.length === 0) {
    return {};
  }

  const placeIds = [
    ...new Set(
      toilets
        .map(t => t.place_id)
        .filter(Boolean)
    ),
  ];

  if (placeIds.length === 0) {
    return {};
  }

  const ratingsMap = await fetchRatingsBatch(placeIds);
  return ratingsMap || {};
};

export const fetchMapData = async ({ lat, lng }) => {
  const toilets = await fetchNearbyToilets({ lat, lng });
  const ratingsMap = await fetchToiletRatings(toilets);

  return {
    toilets,
    ratingsMap,
  };
};
