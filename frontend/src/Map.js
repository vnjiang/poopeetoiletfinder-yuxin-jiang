import React, { useState, useEffect, useCallback } from 'react';
import useScript from './useScript';
import './App.css';
import './PopupBox.css';
import { calculateDistance, fetchToiletsAverageRatingDistance, userToToiletNavigation } from './utils'; 
import 'bootstrap/dist/css/bootstrap.min.css';

const Map = ({ center }) => {
  const [toilets, setToilets] = useState([]);
  const [map, setMap] = useState(null);

  const [scriptLoaded, scriptError] = useScript('https://maps.googleapis.com/maps/api/js?key=REMOVED');

  const initializeMap = useCallback((center, toilets) => {
    if (!scriptLoaded || !window.google || !center) return;

    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    const newMap = new window.google.maps.Map(mapContainer, {
      center: center,
      zoom: 15,
    });

    new window.google.maps.Marker({
      map: newMap,
      position: center,
      title: 'Your Current Location',
    });

    setMap(newMap);

    toilets.forEach((toilet) => {
      const iconUrl = toilet.type === 'public' ? '/toilet.png' : '/sharedtoilet.png';
      const marker = new window.google.maps.Marker({
        map: newMap,
        position: { lat: toilet.location.coordinates[1], lng: toilet.location.coordinates[0] },
        title: toilet.toilet_name,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(50, 50),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 20),
        },
      });

      window.handleNavigateClick = (lat, lng) => {
        const url = userToToiletNavigation(center.lat, center.lng, lat, lng);
        window.open(url, '_blank');
      };

      window.handleRateAndReviewClick = (toiletId) => {
        window.location.href = `/reviewRoute/${toiletId}`;
      };

      const content = `
      <div class="info-window">
        <div class="info-window-card">
          <h4 class="info-window-title">${toilet.toilet_name}</h4>
          <p class="info-window-description">${toilet.toilet_description}</p>
          <p class="info-window-rating"><strong>Rating:</strong> ${toilet.averageRating !== null ? toilet.averageRating.toFixed(1) : 'Not available'}</p>
          <p class="info-window-price"><strong>Price:</strong> €${toilet.price.toFixed(2)}</p>
          <p class="info-window-type"><strong>Type:</strong> ${toilet.type}</p>
          ${center ? `<p class="info-window-distance"><strong>Distance:</strong> ${calculateDistance(center.lat, center.lng, toilet.location.coordinates[1], toilet.location.coordinates[0]).toFixed(2)} km</p>` : ''}
          <div class="info-window-buttons">
            <button class="info-window-button navigate-button" onclick="window.handleNavigateClick(${toilet.location.coordinates[1]}, ${toilet.location.coordinates[0]})">Navigate</button>
            <button class="info-window-button review-button" onclick="window.handleRateAndReviewClick('${toilet.toilet_id}')">Rate and Review</button>
          </div>
        </div>
      </div>
    `;
    
    

      const infoWindow = new window.google.maps.InfoWindow({
        content: content,
      });

      marker.addListener('click', () => {
        if (window.currentInfoWindow) {
          window.currentInfoWindow.close();
        }
        infoWindow.open(newMap, marker);
        window.currentInfoWindow = infoWindow;
      });
    });
  }, [scriptLoaded]);

  useEffect(() => {
    if (center && scriptLoaded) {
      const fetchData = async () => {
        const toilets = await fetchToiletsAverageRatingDistance(center);
        setToilets(toilets);
      };

      fetchData();
    }
  }, [center, scriptLoaded]);

  useEffect(() => {
    if (scriptLoaded && center && toilets.length > 0) {
      initializeMap(center, toilets);
    }
  }, [scriptLoaded, center, toilets, initializeMap]);

  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [center, map]);

  return (
    <div id="map-container" className="map"></div>
  );
}

export default Map;

