/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/14 12:31:31 by rostrub           #+#    #+#             */
/*   Updated: 2025/07/16 11:28:56 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// const db = require('./db/db.js');
// const argon2 = require('argon2');

async function getUserByUsername(username) {
	return new Promise((resolve, reject) => {
	db.serialize(() => {
		db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
			if (err) {
				console.error('Error fetching user:', err.message);
				reject(null);
			}
			else
				resolve(row);
		});
	})
	});
}

async function createUser(mail, mdp, username) {
  const user = {
	username: username,
	email: mail,
	password: await argon2.hash(mdp),
  };
  db.serialize(() => {
	db.run(`INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)`, [user.username, user.email, user.password],
	(err) => {
		if (err) {
			console.error('Error creating user:', err.message);
			throw new Error('Database error');
		} else {
			console.log('User created successfully:', user);
		}
	});

});
}

function getUserById(userId) {
	return new Promise((resolve, reject) => {
	db.serialize(() => {
		db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
			if (err) {
				console.error('Error fetching user:', err.message);
				reject(null);
			}
			else
				resolve(row);
		});
	})
	});
}

function getUserByMail(mail) {
		return new Promise((resolve, reject) => {
	db.serialize(() => {
		db.get(`SELECT * FROM users WHERE email = ?`, [mail], (err, row) => {
			if (err) {
				console.error('Error fetching user:', err.message);
				reject(null);
			}
			else
				resolve(row);
		});
	})
	});
}

async function loginUser(email, password) {
	console.log('test');
	const user = getUserByUsername(email);
	if (!user) {
		console.error('User not found');
		return false;
	}
	if (!user.activated) {
		console.error('User not activated');
		return false;
	}
	if (await argon2.verify(user.password, password))
		return true;
	return false;
}

async function main(){
	await createUser("rom-2001@hotmail.fr", "123456", "rostrub");
	const user = await getUserByUsername("rostrub");
		if (!user) {
			console.log('Utilisateur non trouvé');
			return;
		}
		else
			console.log('Utilisateur récupéré :', user);
	const userById = await getUserById(1);
	if (!userById) {
		console.log('Utilisateur non trouvé par ID');
		return;
	}
	else
		console.log('Utilisateur récupéré par ID :', userById);
}

module.exports= {
	loginUser
};
