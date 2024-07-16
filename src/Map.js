import React, { useState, useEffect } from 'react';
import useScript from './useScript';

const containerStyle = {
  width: '100%',
  height: '100vh',
  margin: '0 auto' 
};

const initialPlaces = [
  { id: 1, lat: 51.8985, lng: -8.4776, name: 'UCC toilet', description: 'Best toilet', rating: 4.5 },
  { id: 2, lat: 51.8953, lng: -8.4907, name: 'Cork City Toilet', description: 'Nice toilet', rating: 4.0 },
  { id: 3, lat: 51.9009, lng: -8.4666, name: 'Cathedral toilet', description: 'Good toilet', rating: 4.2 },
];

function Map() {
  const [center, setCenter] = useState(null);
  //const [infoWindow, setInfoWindow] = useState(null);

  useScript(`https://maps.googleapis.com/maps/api/js?key=REMOVED`);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location: ", error.message);
        setCenter({ lat: 51.8975, lng: -8.4706 });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, []);

  useEffect(() => {
    if (center && window.google) {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 15,
        mapId: 'DEMO_MAP_ID',
      });

      initialPlaces.forEach((place) => {
        const marker = new window.google.maps.Marker({
          map,
          position: { lat: place.lat, lng: place.lng },
          title: place.name,
          icon: {
            url: 'toilet.png', 
            scaledSize: new window.google.maps.Size(50, 50), 
            origin: new window.google.maps.Point(0, 0), 
            anchor: new window.google.maps.Point(20, 20) 
          }
        });

        const content = `
          <div>
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p>Rating: ${place.rating}</p>
            ${center ? `<p>Distance: ${calculateDistance(center.lat, center.lng, place.lat, place.lng).toFixed(2)} km</p>` : ''}
            <button onclick="window.handleNavigateClick(${place.lat}, ${place.lng})">Navigate</button>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: content
        });

        marker.addListener('click', () => {
          if (window.currentInfoWindow) {
            window.currentInfoWindow.close();
          }
          infoWindow.open(map, marker);
          window.currentInfoWindow = infoWindow;
        });
      });
    }
  }, [center]);

  useEffect(() => {
    window.handleNavigateClick = (lat, lng) => {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${lat},${lng}`;
      window.open(url, '_blank');
    };
  }, [center]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
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

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="map" style={containerStyle}></div>
    </div>
  );
}

export default Map;
