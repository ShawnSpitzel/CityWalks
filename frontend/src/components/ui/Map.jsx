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
      updateMapLayers(); // Call the function to update layers once the map is loaded
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });
  }, [coordinates]);

  const updateMapLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

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

    // Remove existing sources and layers if they exist
    if (map.current.getLayer('city-labels')) {
      map.current.removeLayer('city-labels');
    }
    if (map.current.getSource('cities')) {
      map.current.removeSource('cities');
    }

    // Create GeoJSON source for cities
    const cityFeatures = cities.map(city => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [city.lng, city.lat]
      },
      properties: {
        name: city.name,
        state: city.state,
        walkability_index: city.walkability_index !== null ? (city.walkability_index * 5).toFixed(0) : 'N/A'
      }
    }));

    const cityGeoJSON = {
      type: 'FeatureCollection',
      features: cityFeatures
    };

    map.current.addSource('cities', {
      type: 'geojson',
      data: cityGeoJSON,
    });

    // Add symbol layer to display city walkability index
    map.current.addLayer({
      id: 'city-labels',
      type: 'symbol',
      source: 'cities',
      layout: {
        'text-field': ['get', 'walkability_index'],
        'text-size': 12,
        'text-offset': [0, 0.6],
        'text-font': ['Open Sans Bold'], // Use a bold font
        'text-halo-width': 1 // Add halo to make text more legible
      },
      paint: {
        'text-color': [
          'interpolate',
          ['linear'],
          ['to-number', ['get', 'walkability_index']],
          0, '#FF0000', // Deep red
          50, '#FFA500', // Orange
          100, '#00FF00' // Deep green
        ],
        'text-halo-color': '#000000', // Color of the halo
        'text-halo-width': 1 // Width of the halo
      }
    });

    // Add click event listener for city labels
    map.current.on('click', 'city-labels', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['city-labels'] });
      if (features.length) {
        const feature = features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const { name, state, walkability_index } = feature.properties;

        // Ensure the popup appears over the clicked point
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`<h3>${name}, ${state}</h3><p>Walkability Index: ${walkability_index}</p>`)
          .addTo(map.current);
      }
    });
  };

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    console.log('Updating map center to:', coordinates);
    map.current.setCenter([coordinates.lng, coordinates.lat]);
    updateMapLayers();
  }, [coordinates, radius]);

  useEffect(() => {
    if (!map.current) return; // wait for map to initialize
    console.log('Updating city labels with cities:', cities);
    updateMapLayers();
  }, [cities]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  );
};

export default Map;
