import React, { useState, useEffect, useCallback } from 'react';
import useScript from './useScript';
import './Map.css';
import { calculateDistance, userToToiletNavigation, fetchRatingAndCount, renderStarAverageRatingCount, rateAndReviewClick } from './utils';  // 引入 getAverageRatingFromDB
import ReactDOM from 'react-dom/client';

const Map = ({ center }) => {
  const [toilets, setToilets] = useState([]);
  const [map, setMap] = useState(null);
  //load google api key
  const [scriptLoaded] = useScript('https://maps.googleapis.com/maps/api/js?key=REMOVED');


  //intialize map
  const initMap = useCallback((center, toilets) => {
    const newMap = new window.google.maps.Map(document.getElementById('map-container'), {
      center: center,
      zoom: 14.5,
    });

    // Add a marker at current location
    new window.google.maps.Marker({
      map: newMap,
      position: center,
    });

  //add markers for each toilet
    for (let i = 0; i < toilets.length; i++) {
      addMarker(newMap, center, toilets[i]);
    }

    setMap(newMap);
  }, [scriptLoaded]);


  //function of adding markers
  const addMarker = (map, center, toilet) => {
    const marker = new window.google.maps.Marker({
      map: map,
      position: { lat: toilet.location.coordinates[1], lng: toilet.location.coordinates[0] },
      icon: {
        url: toilet.type === 'public' ? '/toilet.png' : '/sharedtoilet.png',
        scaledSize: new window.google.maps.Size(50, 50),// Scale the icon to the desired size
        anchor: new window.google.maps.Point(20, 20),// Adjust the anchor point for correct positioning
      },
    });
    popupboxAction(marker, center, toilet);
  };


  //function of open popuo box when a marker is clicked
  const popupboxAction = async (marker, center, toilet) => {
    const { averageRating, reviewCount } = await fetchRatingAndCount(toilet.place_id);
    const infoWindowContent = popupboxContent(toilet, center, averageRating, reviewCount, toilet.price ? toilet.price.toFixed(2) : '?');
    const popupbox = new window.google.maps.InfoWindow();

    //add listener to marker
    marker.addListener('click', () => {
      const div = document.createElement('div');
      ReactDOM.createRoot(div).render(infoWindowContent);
      popupbox.setContent(div);
      popupbox.open(marker.getMap(), marker);
    });
  };




  // for render popupbox content
  const popupboxContent = (toilet, center, averageRating, reviewCount, price) => {
    return (
      <div className="popupbox">
        <div className="popupbox-card">
          <h4 className="popupbox-title">{toilet.toilet_name}</h4>
          <h5 className="popupbox-description">{toilet.toilet_description}</h5>
          <p className="popupbox-rating">{renderStarAverageRatingCount(averageRating, reviewCount)}</p>

          <div>
            <h6>Price: €{price}</h6>
            <h6>Type:{toilet.type}</h6>
            <h6>
              Distance: {`${calculateDistance(center.lat, center.lng, toilet.location.coordinates[1], toilet.location.coordinates[0]).toFixed(2)} km`}
            </h6>
          </div>

          <div className="popupbox-buttons">
            <button
              className="navigate-button"
              onClick={() => window.open(userToToiletNavigation(center.lat, center.lng, toilet.location.coordinates[1], toilet.location.coordinates[0]), '_blank')}
            >
              Navigate
            </button>
            <button
              className="review-button"
              onClick={() => window.location.href = rateAndReviewClick(toilet.place_id)}
            >
              Rate and Review
            </button>
          </div>
        </div>
      </div>
    );
  };


// for intialize map, make sure scriptLoaded & center loaded first
  useEffect(() => {
    if (scriptLoaded && center) {
      initMap(center, toilets);
    } 
  }, [scriptLoaded, center, toilets, initMap]);


 //for reset center in current location function 
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    } 
  }, [center, map]);


 //fetch toilet data from google when center and script are loaded
  useEffect(() => {
    if (center && scriptLoaded) {
      const fetchToiletDataFromGoogle = async () => {
        try {
          const toiletDataRes = await fetch(`/routes/toiletRoute/fetch-toilets?lat=${center.lat}&lng=${center.lng}`);

        // check status code and make sure it is json format
        if (!toiletDataRes.ok || !toiletDataRes.headers.get("content-type")?.includes("application/json")) {
          throw new Error(`Fetch failed with status: ${toiletDataRes.status}`);
        }

          setToilets(await toiletDataRes.json());
        } catch (error) {
          console.error(error);
        }
      };

      fetchToiletDataFromGoogle();
    } 
  }, [center, scriptLoaded]);

  return <div id="map-container" className="map"></div>;
};

export default Map;