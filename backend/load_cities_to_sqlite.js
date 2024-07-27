const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');
const fs = require('fs');
const db = new sqlite3.Database('./us_cities.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY,
      city TEXT,
      state_code TEXT,
      state_name TEXT,
      county TEXT,
      latitude REAL,
      longitude REAL
    )
  `);

  const stmt = db.prepare(`
    INSERT INTO cities (id, city, state_code, state_name, county, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  fs.createReadStream('us_cities.csv')
    .pipe(csv())
    .on('data', (row) => {
      stmt.run(row.ID, row.CITY, row.STATE_CODE, row.STATE_NAME, row.COUNTY, parseFloat(row.LATITUDE), parseFloat(row.LONGITUDE));
    })
    .on('end', () => {
      stmt.finalize();
      db.close();
      console.log('CSV file successfully processed and data inserted into SQLite database.');
    });
});
