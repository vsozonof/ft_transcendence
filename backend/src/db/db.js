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
      password TEXT NOT NULL,
      avatar TEXT NOT NULL,
      secret2fa TEXT,
      is2fa BOOLEAN DEFAULT FALSE,
      friend_list TEXT DEFAULT '[]',
      loose INTEGER DEFAULT 0,
      win INTEGER DEFAULT 0,
      activated BOOLEAN DEFAULT TRUE,
      last_activity INTEGER DEFAULT CURRENT_TIMESTAMP,
      last_logout INTEGER DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err)
      console.error('error:', err.message);
	else
      console.log('TOUT EST OK');
  });
});

module.exports = db;
