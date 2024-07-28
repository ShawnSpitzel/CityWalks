import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ coordinates, radius, cities }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    console.log('Initializing map with coordinates:', coordinates);
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [coordinates.lng, coordinates.lat],
      zoom: 8,
    });

    map.current.on('load', () => {
      console.log('Map loaded successfully');
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });
  }, [coordinates]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    console.log('Updating map center to:', coordinates);
    map.current.setCenter([coordinates.lng, coordinates.lat]);

    // Remove existing circle layer and source if they exist
    if (map.current.getLayer('circle')) {
      map.current.removeLayer('circle');
    }
    if (map.current.getLayer('circle-outline')) {
      map.current.removeLayer('circle-outline');
    }
    if (map.current.getSource('circle')) {
      map.current.removeSource('circle');
    }

    if (radius) {
      console.log(`Drawing circle with radius: ${radius} miles`);

      const center = [coordinates.lng, coordinates.lat];
      const circle = turf.circle(center, radius, { steps: 64, units: 'miles' });

      console.log('Circle data:', circle);

      map.current.addSource('circle', {
        type: 'geojson',
        data: circle,
      });

      map.current.addLayer({
        id: 'circle',
        type: 'fill',
        source: 'circle',
        layout: {},
        paint: {
          'fill-color': '#FF0000',
          'fill-opacity': 0.2,
        },
      });

      map.current.addLayer({
        id: 'circle-outline',
        type: 'line',
        source: 'circle',
        layout: {},
        paint: {
          'line-color': '#FF0000',
          'line-width': 2,
        },
      });
    }
  }, [coordinates, radius]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    console.log('Updating markers with cities:', cities);

    // Remove existing markers
    const markers = document.getElementsByClassName('mapboxgl-marker');
    while (markers.length > 0) {
      markers[0].remove();
    }

    // Add markers for cities
    cities.forEach(city => {
      console.log(`Adding marker for city: ${city.name}, ${city.state} at (${city.lat}, ${city.lng})`);
      const marker = new mapboxgl.Marker()
        .setLngLat([city.lng, city.lat])
        .addTo(map.current);

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div>
          <h3>${city.name}, ${city.state}</h3>
          <p>Walkability Index: ${city.walkability_index !== null ? city.walkability_index : 'N/A'}</p>
        </div>
      `);

      marker.getElement().addEventListener('click', () => {
        popup.addTo(map.current);
        marker.togglePopup(); // Open the popup on marker click
      });

      marker.setPopup(popup);
    });
  }, [cities]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
