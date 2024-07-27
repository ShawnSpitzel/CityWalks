const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const fs = require('fs');

const db = new sqlite3.Database('./worldcities.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS cities (
    city TEXT,
    city_ascii TEXT,
    lat REAL,
    lng REAL,
    country TEXT,
    iso2 TEXT,
    iso3 TEXT,
    admin_name TEXT,
    capital TEXT,
    population INTEGER,
    id INTEGER PRIMARY KEY
  )`);

  const stmt = db.prepare(`INSERT INTO cities (city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  fs.createReadStream('worldcities.csv')
    .pipe(csv())
    .on('data', (row) => {
      stmt.run(row.city, row.city_ascii, row.lat, row.lng, row.country, row.iso2, row.iso3, row.admin_name, row.capital, row.population, row.id);
    })
    .on('end', () => {
      stmt.finalize();
      db.close();
      console.log('CSV file successfully processed and data inserted into SQLite database.');
    });
});
