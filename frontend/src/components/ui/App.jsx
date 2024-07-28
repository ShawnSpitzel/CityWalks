import React, { useState } from "react";
import Map from "./Map";
import SearchBar from "./SearchBar";

const App = () => {
  const [coordinates, setCoordinates] = useState({ lat: 40.730610, lng: -73.935242 }); // Default to New York City
  const [radius, setRadius] = useState(0);

  const handleSearch = async (cityState, radius) => {
    try {
      console.log(`Searching for: ${cityState}`);
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityState)}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`);
      const data = await response.json();
      console.log('API Response:', data);

      if (data.features && data.features.length > 0) {
        const { center } = data.features[0];
        setCoordinates({ lng: center[0], lat: center[1] });
        setRadius(radius); // Set the radius
      } else {
        console.error('No features found in response');
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      alert('Error fetching location data');
    }
  };

  return (
    <div id="container">
      <div id="form-container">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div id="map-container">
        <Map coordinates={coordinates} radius={radius} />
      </div>
    </div>
  );
};

export default App;
