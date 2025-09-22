/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   db.js                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/21 18:08:48 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 04:08:17 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'transcendence.db');

const db = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error('🗃️ ❌ [1] Database error:', err.message);
	} else {
		console.log('🗃️ ✅ [1] Database file was successfully loaded or created.\n -> path:', dbPath);
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
		activated BOOLEAN DEFAULT TRUE,
		last_activity INTEGER DEFAULT CURRENT_TIMESTAMP,
      last_logout INTEGER DEFAULT CURRENT_TIMESTAMP,
		losses_pvp INTEGER DEFAULT 0,
		wins_pvp INTEGER DEFAULT 0,
		losses_ai INTEGER DEFAULT 0,
		wins_ai INTEGER DEFAULT 0,
		losses_tournament INTEGER DEFAULT 0,
		wins_tournament INTEGER DEFAULT 0,
		goals_scored INTEGER DEFAULT 0,
		goals_conceded INTEGER DEFAULT 0
		)
		`,
		(err) => {
			if (err)
				console.error('🗃️ ❌ [2] Database error:', err.message);
			else
				console.log('🗃️ ✅ [2] USER table was successfully loaded or created.');
		});
	
	db.run(`
		CREATE TABLE IF NOT EXISTS matches (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		mode TEXT NOT NULL,
		player1_name TEXT NOT NULL,
		player2_name TEXT NOT NULL,
		player1_id INTEGER NOT NULL,
		player2_id INTEGER NOT NULL,
		score1 INTEGER NOT NULL,
		score2 INTEGER NOT NULL,
		winner INTEGER NOT NULL,
		played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
		`,
		(err) => {
			if (err)
				console.error('🗃️ ❌ [3] Database error:', err.message);
			else 
				console.log('🗃️ ✅ [3] MATCHES table was successfully loaded or created.');
		}
	);
});

module.exports = db;
