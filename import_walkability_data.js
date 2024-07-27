const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const csv = require('csv-parser');

// Paths to the CSV file and SQLite database
const csvFilePath = path.join(__dirname, 'EPA_SmartLocationDatabase_V3_Jan_2021_Final.csv');
const dbFilePath = path.join(__dirname, 'walkability.db');

// Connect to the SQLite database
const db = new sqlite3.Database(dbFilePath);

// Function to create the walkability table if it doesn't exist
const createTable = () => {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS walkability (
        GEOID TEXT,
        lat REAL,
        lon REAL,
        walkability_index REAL
      )
    `;
    db.run(createTableQuery, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to insert data into the walkability table
const insertData = (data) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO walkability (GEOID, lat, lon, walkability_index)
      VALUES (?, ?, ?, ?)
    `;
    const stmt = db.prepare(insertQuery);
    data.forEach((row, index) => {
      stmt.run(row.GEOID, row.lat, row.lon, row.walkability_index, (err) => {
        if (err) {
          console.error(`Error inserting row ${index}:`, err);
        }
      });
    });
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Function to read the CSV file and process data
const processCSV = () => {
  return new Promise((resolve, reject) => {
    const data = [];
    let rowCount = 0;
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Dummy latitude and longitude values for demonstration purposes
        const lat = rowCount * 0.01 + 30;
        const lon = rowCount * 0.01 - 90;
        data.push({
          GEOID: row.GEOID10,
          lat: lat,
          lon: lon,
          walkability_index: row.NatWalkInd
        });
        rowCount++;
        if (rowCount % 1000 === 0) {
          console.log(`${rowCount} rows processed`);
        }
      })
      .on('end', () => {
        console.log(`CSV file processing completed. Total rows: ${rowCount}`);
        resolve(data);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

// Main function to orchestrate the CSV import process
const importWalkabilityData = async () => {
  try {
    await createTable();
    const data = await processCSV();
    await insertData(data);
    console.log('Walkability data import completed successfully.');
    db.close();
  } catch (error) {
    console.error('Error importing walkability data:', error);
    db.close();
  }
};

// Run the import function
importWalkabilityData();
