/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/14 12:31:31 by rostrub           #+#    #+#             */
/*   Updated: 2025/07/14 14:53:55 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const db = require("./db/db");
const argon2 = require('argon2');

function getUserByUsername(username) {
}

function createUser(mail, mdp, username) {
  const user = {
	username: username,
	email: mail,
	password: mdp,
  };
  db.serialize(() => {
	db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [user.username, user.email, user.password],
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
  // This function should retrieve a user by their ID from the database
  // and return the user object.
}

function achingMdp(mdp) {

}

function loginUser(email, password) {
  // This function should authenticate a user by checking their email
  // and password against the database, returning the user object if successful.
}

createUser("rom-2001@hotmail.fr", "123456", "rostrub");
db.all(`SELECT * FROM users`, [], (err, rows) => {
  if (err) return console.error('Erreur de lecture :', err.message);
  console.log('Tous les utilisateurs :');
  rows.forEach(user => console.log(user));
});
const mdp = achingMdp("123456");
console.log("avant mdp :", mdp);
mdp = argon2.hash(mdp);
console.log("après mdp :", mdp);
