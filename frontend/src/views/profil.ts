/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   profil.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/24 13:03:37 by rostrub           #+#    #+#             */
/*   Updated: 2025/08/19 10:21:19 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background, launchApp } from "../main"

import { enable2faHandler } from "./enable2fa"

import { tfa_disHandler } from "./2fadisable";

import { loginHandler } from "./login";

export async function profileHandler(): Promise<void> {
	const token = localStorage.getItem('token');
	if (!token) {
		alert("Token manquant, veuillez vous reconnecter.");
		await loginHandler();
		return;
	}

	const wrapper = document.createElement('div');
	wrapper.className = `
		flex flex-col justify-center items-center gap-10 p-10 w-full h-screen bg-gray-100
	`;

	// ---- Bloc infos utilisateur (gauche)
	const userBox = document.createElement('div');
	userBox.className = `
		w-1/3 bg-white p-6 rounded-lg shadow-md
	`;

	const userTitle = document.createElement('h2');
	userTitle.textContent = 'Profil';
	userTitle.className = 'text-xl font-bold mb-4';



	const usernameP = document.createElement('p');
	const emailP = document.createElement('p');

	usernameP.innerHTML = `<strong>Username:</strong> <span id="profile-username">...</span>`;
	emailP.innerHTML = `<strong>Email:</strong> <span id="profile-email">...</span>`;

	const updatebutton = document.createElement('button');
	updatebutton.textContent = 'Mettre à jour';
	updatebutton.className = 'mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700';

	userBox.appendChild(userTitle);
	userBox.appendChild(usernameP);
	userBox.appendChild(emailP);
	userBox.appendChild(updatebutton);

	// ---- Colonne de droite (2 blocs)
	const rightCol = document.createElement('div');
	rightCol.className = 'flex flex-col gap-6 w-1/3';

	// ---- Bloc changement de mot de passe
	const pwdBox = document.createElement('div');
	pwdBox.className = 'bg-white p-6 rounded-lg shadow-md';

	const pwdTitle = document.createElement('h2');
	pwdTitle.textContent = 'Changer le mot de passe';
	pwdTitle.className = 'text-lg font-semibold mb-4';

	const oldPwd = document.createElement('input');
	oldPwd.type = 'password';
	oldPwd.placeholder = 'Ancien mot de passe';
	oldPwd.className = 'w-full mb-3 px-3 py-2 border rounded';

	const newPwd = document.createElement('input');
	newPwd.type = 'password';
	newPwd.placeholder = 'Nouveau mot de passe';
	newPwd.className = 'w-full mb-4 px-3 py-2 border rounded';

	const newPwd2 = document.createElement('input');
	newPwd2.type = 'password';
	newPwd2.placeholder = 'Confirmer le nouveau mot de passe';
	newPwd2.className = 'w-full mb-4 px-3 py-2 border rounded';

	const pwdBtn = document.createElement('button');
	pwdBtn.textContent = 'Changer';
	pwdBtn.className = 'w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700';

	pwdBtn.addEventListener('click', async () => {
		const res = await fetch('http://127.0.0.1:3000/changePassword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				oldPassword: oldPwd.value,
				newPassword: newPwd.value,
				confirmPassword: newPwd2.value
			})
		});
		if (res.ok) {
			alert("Mot de passe mis à jour !");
		} else {
			alert("Erreur lors du changement de mot de passe");
		}
	});

	pwdBox.appendChild(pwdTitle);
	pwdBox.appendChild(oldPwd);
	pwdBox.appendChild(newPwd);
	pwdBox.appendChild(newPwd2);
	pwdBox.appendChild(pwdBtn);

	// ---- Bloc 2FA
	const twofaBox = document.createElement('div');
	twofaBox.className = 'bg-white p-6 rounded-lg shadow-md';

	const twofaTitle = document.createElement('h2');
	twofaTitle.textContent = 'Double authentification';
	twofaTitle.className = 'text-lg font-semibold mb-4';

	const twofaBtn = document.createElement('button');
	twofaBtn.textContent = 'Activer/Désactiver la 2FA';
	twofaBtn.className = 'w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700';

	twofaBtn.addEventListener('click', async () => {
		const res = await fetch('http://127.0.0.1:3000/isit2fa', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (res.ok) {
			const data = await res.json();
			console.log("Réponse 2FA:", data.is2fa);
			if (data.is2fa === 1) {
				alert("2FA est activée");
				background.removeChild(wrapper);
				await tfa_disHandler();
			}
			else {
				console.log("2FA n'est pas activée, activation en cours...");
				background.removeChild(wrapper);
				await enable2faHandler();
				return;
			}
		} else {
			alert("Erreur 2FA");
		}
	});

	twofaBox.appendChild(twofaTitle);
	twofaBox.appendChild(twofaBtn);

	// ---- retour au menu
	const backCol = document.createElement('div');
	backCol.className = 'flex flex-col gap-6 w-full';

	const backBox = document.createElement('div');
	backBox.className = 'bg-white p-6 rounded-lg shadow-md';

	const backBtn = document.createElement('button');
	backBtn.textContent = 'Retour au menu principal';
	backBtn.className = `
		bg-red-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-red-700 transition-colors mt-6
	`;
	backBox.appendChild(backBtn);

		backBtn.addEventListener('click', () => {
			background.removeChild(wrapper);
			launchApp();
			return;
		});

	// ---- Build page
	const topRow = document.createElement('div');
	topRow.className = 'flex gap-10 w-full mx-auto items-start';
	rightCol.appendChild(pwdBox);
	rightCol.appendChild(twofaBox);
	backCol.appendChild(backBox);

	topRow.appendChild(userBox);
	topRow.appendChild(rightCol);
	wrapper.appendChild(topRow);
	wrapper.appendChild(backCol);

	background.appendChild(wrapper);

	// ---- Récupération info user
	const userRes = await fetch('http://127.0.0.1:3000/getUser', {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (userRes.ok) {
		const user = await userRes.json();
		document.getElementById('profile-username')!.textContent = localStorage.getItem('username');
		document.getElementById('profile-email')!.textContent = localStorage.getItem('email');
	}
}
