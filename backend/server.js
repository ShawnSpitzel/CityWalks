require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const geolib = require('geolib');
const app = express();
const port = process.env.PORT || 4000;
const citiesDb = new sqlite3.Database('./us_cities.db');
const walkabilityDb = new sqlite3.Database('./walkability.db');
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint to get walkability index for all cities within a radius
app.get('/walkability', async (req, res) => {
  const { city, state, radius } = req.query;

  console.log(`Query parameters - City: ${city}, State: ${state}, Radius: ${radius}`);

  if (!city || !state || !radius) {
    return res.status(400).json({ error: 'Missing required query parameters: city, state, radius' });
  }

  try {
    const cityCoords = await getCityCoordinates(city, state);

    // Get all cities within the radius
    const nearbyCities = await getNearbyCities(cityCoords, radius);

    // Fetch walkability index for each city
    const citiesWithWalkability = await Promise.all(
      nearbyCities.map(async city => {
        const index = await fetchWalkabilityIndex(city.lat, city.lng);
        return { ...city, walkability_index: index };
      })
    );

    res.json(citiesWithWalkability);
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
    const latRange = 1000;
    const lonRange = 1000;

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
async function getCityCoordinates(city, state) {
  return new Promise((resolve, reject) => {
    citiesDb.get('SELECT latitude, longitude FROM cities WHERE LOWER(city) = LOWER(?) AND (LOWER(state_code) = LOWER(?) OR LOWER(state_name) = LOWER(?)) LIMIT 1', [city, state, state], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else if (row) {
        resolve({ lat: row.latitude, lon: row.longitude });
      } else {
        reject(new Error('City not found'));
      }
    });
  });
}

// Function to get nearby cities using the cities database
async function getNearbyCities(coords, radius) {
  return new Promise((resolve, reject) => {
    citiesDb.all('SELECT city, state_code, state_name, latitude, longitude FROM cities', [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        const nearbyCities = rows.filter(row => {
          const distance = geolib.getDistance(
            { latitude: coords.lat, longitude: coords.lon },
            { latitude: row.latitude, longitude: row.longitude }
          );
          return distance <= radius * 1609.34; // Convert miles to meters
        }).map(row => ({
          name: row.city,
          state: row.state_code, // or row.state_name, depending on your preference
          lat: row.latitude,
          lng: row.longitude,
        }));
        resolve(nearbyCities);
      }
    });
  });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});