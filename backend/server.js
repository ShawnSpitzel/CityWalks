require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const geolib = require('geolib'); // Importing the geolib package
const app = express();
const port = process.env.PORT || 3000;
const citiesDb = new sqlite3.Database('./worldcities.db');
const walkabilityDb = new sqlite3.Database('./walkability.db');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to get walkability index for all cities within a radius
app.get('/walkability', async (req, res) => {
  const { city, radius } = req.query;

  try {
    // Get coordinates for the city
    const cityCoords = await getCityCoordinates(city);
    console.log(`City Coordinates: ${JSON.stringify(cityCoords)}`);

    // Get all cities within the radius
    const nearbyCities = await getNearbyCities(cityCoords, radius);
    console.log(`Nearby Cities: ${JSON.stringify(nearbyCities)}`);

    // Fetch walkability index for each city
    const walkabilityIndexes = await Promise.all(
      nearbyCities.map(async city => {
        const index = await fetchWalkabilityIndex(city.lat, city.lng);
        return { city: city.name, lat: city.lat, lon: city.lng, walkability_index: index };
      })
    );

    res.json(walkabilityIndexes);
  } catch (error) {
    console.error('Error fetching walkability indexes:', error);
    res.status(500).json({ error: 'Failed to fetch walkability indexes' });
  }
});

// Function to fetch walkability index from the walkability database
async function fetchWalkabilityIndex(lat, lon) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT walkability_index 
      FROM walkability 
      WHERE lat BETWEEN ? AND ? 
      AND lon BETWEEN ? AND ?
      ORDER BY ABS(lat - ?) + ABS(lon - ?)
      LIMIT 1
    `;
    
    // Calculate a dynamic range based on the latitude
    const latRange = 1000; // This can be adjusted to a smaller number if your data points are close together
    const lonRange = 1000; // This can be adjusted to a smaller number if your data points are close together

    walkabilityDb.get(query, [lat - latRange, lat + latRange, lon - lonRange, lon + lonRange, lat, lon], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(row ? row.walkability_index : null);
      }
    });
  });
}

// Function to get city coordinates using the cities database
async function getCityCoordinates(city) {
  return new Promise((resolve, reject) => {
    citiesDb.get('SELECT lat, lng FROM cities WHERE LOWER(city) = LOWER(?) LIMIT 1', [city], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else if (row) {
        resolve({ lat: row.lat, lon: row.lng });
      } else {
        reject(new Error('City not found'));
      }
    });
  });
}

// Function to get nearby cities using the cities database
async function getNearbyCities(coords, radius) {
  return new Promise((resolve, reject) => {
    citiesDb.all('SELECT city, lat, lng FROM cities', [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        const nearbyCities = rows.filter(row => {
          const distance = geolib.getDistance(
            { latitude: coords.lat, longitude: coords.lon },
            { latitude: row.lat, longitude: row.lng }
          );
          return distance <= radius * 1609.34; // Convert miles to meters
        }).map(row => ({
          name: row.city,
          lat: row.lat,
          lng: row.lng,
        }));
        resolve(nearbyCities);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
