const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'transcendence.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('error:', err.message);
  } else {
    console.log('TOUT EST OK', dbPath);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `, (err) => {
    if (err)
      console.error('error:', err.message);
	else
      console.log('TOUT EST OK');
  });
});

module.exports = db;
