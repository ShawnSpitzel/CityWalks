import React, { useState } from "react";
import Map from "./Map";
import SearchBar from "./SearchBar";

const App = () => {
  const [coordinates, setCoordinates] = useState({ lat: 40.730610, lng: -73.935242 }); // Default to New York City
  const [radius, setRadius] = useState(0);
  const [cities, setCities] = useState([]);

  const handleSearch = async (cityState, radius) => {
    try {
      console.log(`Searching for: ${cityState}`);
      const [city, state] = cityState.split(',').map(s => s.trim());
      if (!city || !state) {
        alert('Please enter a valid city and state separated by a comma.');
        return;
      }
      const response = await fetch(`http://localhost:3000/cities?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&radius=${radius}`);
      const data = await response.json();
      console.log('API Response:', data);

      if (data.length > 0) {
        const searchedCity = data.find(c => c.name.toLowerCase() === city.toLowerCase() && c.state.toLowerCase() === state.toLowerCase());
        if (searchedCity) {
          setCoordinates({ lng: searchedCity.lng, lat: searchedCity.lat });
        }
        setRadius(radius);
        setCities(data); // Set the nearby cities
      } else {
        console.error('No cities found in response');
        alert('No nearby cities found');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      alert('Error fetching nearby cities');
    }
  };

  return (
    <div id="container">
      <div id="form-container">
        <SearchBar onSearch={handleSearch} />
      </div>
      <div id="map-container">
        <Map coordinates={coordinates} radius={radius} cities={cities} />
      </div>
    </div>
  );
};

export default App;
