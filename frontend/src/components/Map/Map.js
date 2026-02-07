import React, { useState, useEffect, useRef, useCallback } from 'react';
import useScript from '../../hooks/useScript';

import { fetchMapData } from '../../services/mapService';


import ReactDOM from 'react-dom/client';
import MapPopup from './MapPopup';
import { useGoogleMap } from '../../hooks/useGoogleMap';




const Map = ({ center }) => {
  const [toilets, setToilets] = useState([]);

  const [ratingsMap, setRatingsMap] = useState({});
  const popupRootRef = useRef(null);

  const GOOGLE_MAPS_API_KEY =
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const [scriptLoaded] = useScript(`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`);

  const makePinIcon = useCallback((fill = '#2F80ED', stroke = '#1B5DBF', size = 40) => {

    const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <path
      d="
        M32 62
        C30 58 26 52 22 47
        C18 42 14 36 14 28
        C14 16 22 6 32 6
        C42 6 50 16 50 28
        C50 36 46 42 42 47
        C38 52 34 58 32 62
      "
      fill="${fill}" stroke="${stroke}" stroke-width="2" />
    <circle cx="32" cy="28" r="9" fill="white" opacity="0.95"/>
  </svg>`.trim();

    const b64 = btoa(unescape(encodeURIComponent(svg)));

    return {
      url: `data:image/svg+xml;base64,${b64}`,
      scaledSize: new window.google.maps.Size(size, size),   
      anchor: new window.google.maps.Point(size / 2, size),    
    };
}, []);


const makeDotIcon = useCallback(
  (fill = '#2563EB', stroke = '#1E40AF', size = 25) => {
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle
    cx="32"
    cy="32"
    r="15"
    fill="${fill}"
    stroke="${stroke}"
    stroke-width="4"
  />
</svg>`.trim();

    const b64 = btoa(unescape(encodeURIComponent(svg)));

    return {
      url: `data:image/svg+xml;base64,${b64}`,
      scaledSize: new window.google.maps.Size(size, size),
      anchor: new window.google.maps.Point(size / 2, size / 2),
    };
  },
  []
);



const renderPopup = useCallback(
  (toilet, center, rating) => {
    if (!popupRootRef.current) {
      const container = document.createElement('div');
      popupRootRef.current = {
        container,
        root: ReactDOM.createRoot(container),
      };
    }

    popupRootRef.current.root.render(
      <MapPopup
        toilet={toilet}
        center={center}
        averageRating={rating.averageRating}
        reviewCount={rating.reviewCount}
        price={toilet.price}
      />
    );

    return popupRootRef.current.container;
  },
  []
);


useEffect(() => {
  return () => {
    popupRootRef.current?.root?.unmount();
    popupRootRef.current = null;
  };
}, []);


  const { containerRef } = useGoogleMap({
    center,
    scriptLoaded,
    toilets,
    ratingsMap,
    renderPopup,
    makePinIcon,
    makeDotIcon,
  });


  useEffect(() => {
    if (!center || !scriptLoaded) return;

    const run = async () => {
      try {
        const { toilets, ratingsMap } = await fetchMapData({
          lat: center.lat,
          lng: center.lng,
        });

        setToilets(toilets);
        setRatingsMap(ratingsMap);
      } catch (error) {
        console.error('Map data fetch failed:', error);
      }
    };

    run();
  }, [center, scriptLoaded]);


  

if (!GOOGLE_MAPS_API_KEY) {
  console.error('Missing Google Maps API key');
  return null; 
}




  return <div ref={containerRef} className="map"></div>;

};

export default Map;