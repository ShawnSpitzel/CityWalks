import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { circle as turfCircle } from '@turf/turf';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Map = ({ coordinates, radius }) => {
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
  }, []);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    console.log('Updating map center to:', coordinates);
    map.current.setCenter([coordinates.lng, coordinates.lat]);

    // Remove existing circle layer if it exists
    if (map.current.getSource('circle')) {
      map.current.removeLayer('circle');
      map.current.removeSource('circle');
    }

    if (radius) {
      const milesToMeters = radius * 1609.34;
      const circleData = turfCircle([coordinates.lng, coordinates.lat], milesToMeters, { steps: 64, units: 'meters' });

      map.current.addSource('circle', {
        type: 'geojson',
        data: circleData,
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
    }
  }, [coordinates, radius]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
