/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/14 12:31:31 by rostrub           #+#    #+#             */
/*   Updated: 2025/08/14 09:48:07 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const db = require('./db/db.js');
const argon2 = require('argon2');
const qrcode = require('qrcode');
const speakeasy = require('speakeasy');

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
	const user = await getUserByUsername(email);
	if (!user || user.activated === false) {
		console.log('User not found or not activated');
		return false;
	}
	if (await argon2.verify(user.password, password)) {
		console.log('Password is correct');
		return user.activated;;
	} else {
		console.log('Invalid password');
		return false;
	}
	return false;
}

async function is2faEnabled(username) {
	const user = await getUserByUsername(username);
	if (!user) {
		console.log('User not found');
		return false;
	}
	return user.is2fa;
}

async function ChangePassword(userId, oldPassword, newPassword, confirmPassword) {
	const user = await getUserById(userId);
	if (!user)
		throw new Error('User not found');
	if (newPassword !== confirmPassword)
		throw new Error('New passwords do not match');
	if (!await argon2.verify(user.password, oldPassword))
		throw new Error('Invalid old password');
	const hashedPassword = await argon2.hash(newPassword);
	return new Promise((resolve, reject) => {
		db.serialize(() => {
			db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
				if (err) {
					console.error('Error updating password:', err.message);
					reject(err);
				} else {
					console.log('Password updated successfully');
					resolve();
				}
			});
		});
	});

}

async function create2faqrcode(username) {
	const user = await getUserByUsername(username);
	const code = {
		qrcode: "NULL",
		url: "NULL"
	};

	if (!user) {
		console.log('User not found');
		return null;
	}
	const secret = speakeasy.generateSecret({ length: 20 });
	console.log('2FA secret generated:', secret.base32);
	code.qrcode = await qrcode.toDataURL(secret.otpauth_url, { errorCorrectionLevel: 'H' });
	code.url = secret.otpauth_url;
	db.serialize(() => {
		db.run(`UPDATE users SET secret2fa = ? WHERE username = ?`, [secret.base32, username], (err) => {
			if (err) {
				console.error('Error updating user for 2FA:', err.message);
				return null;
			}
			console.log('User updated for 2FA successfully');
		});
	});
	return code;

}

async function disable2fa(user, key) {
	console.log('Disabling 2FA for user:', user.secret2fa);
	console.log('Received 2FA key:', key);
	const isValid = speakeasy.totp.verify({
		secret: user.secret2fa,
		encoding: 'base32',
		token: key,
		window: 1
	});
	if (isValid) {
		console.log('2FA key verified successfully for user:', user.username);
		db.serialize(() => {
			db.run(`UPDATE users SET secret2fa = NULL, is2fa = 0 WHERE id = ?`, [user.id], (err) => {
				if (err) {
					console.error('Error disabling 2FA for user:', err.message);
				} else {
					console.log('User 2FA disabled successfully');
				}
			});
		});
		return;
	} else {
		console.log('Invalid 2FA key provided');
		throw new Error('Invalid OTP');
	}
}

// async function main(){
// 	const code = await create2faqrcode('rostrub');
// 	console.log('QR Code:', code.qrcode);
// 	console.log('2FA URL:', code.url);
// }

module.exports= {
	loginUser,
	createUser,
	getUserByUsername,
	is2faEnabled,
	ChangePassword,
	create2faqrcode,
	disable2fa
};

// main();
