/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   profil.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/24 13:03:37 by rostrub           #+#    #+#             */
/*   Updated: 2025/09/22 13:37:25 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground, launchApp } from "../main"

import { enable2faHandler } from "./enable2fa"

import { tfa_disHandler } from "./2fadisable";

import { gameProfile } from "./gameProfile";


import { loginHandler } from "./login";

export async function profileHandler(): Promise<void> {
	const background = getBackground();
	const token = localStorage.getItem('token');
	if (!token) {
		alert("Token manquant, veuillez vous reconnecter.");
		launchApp();
		return;
	}
	else {
		const res = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!res.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			launchApp();
			return;
		}
		const user = await fetch('/api/getUserByToken', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
			});
		if (!user.ok) {
			alert("Erreur lors de la récupération des informations utilisateur.");
		}
		else {
			const data = await user.json();
			localStorage.setItem('username', data.username);
			localStorage.setItem('email', data.email);
			localStorage.setItem('avatar', data.avatar);
			console.log(localStorage.getItem('avatar'));
		}
	}

	const wrapper = document.createElement('div');
	wrapper.className = `
		flex flex-col justify-center items-center gap-10 p-10 w-full h-screen bg-gray-100
	`;
	// ---- Bloc Validation Suppresission Compte
	const Validation_suppression = document.createElement('div');
	Validation_suppression.className = `bg-white p-6 rounded-lg flex flex-col shadow-md flex gap-6 items-center`;

	const valTitle = document.createElement('h2');
	valTitle.textContent = 'Validation de la suppression du compte';
	valTitle.className = 'text-xl font-bold mb-4';

	const valInput = document.createElement('input');
	valInput.type = 'password';
	valInput.placeholder = "Supprimer";
	valInput.className = 'w-full mb-4 px-3 py-2 border rounded';

	const btnBox = document.createElement('div');
	btnBox.className = 'flex gap-4';

	const valBtn = document.createElement('button');
	valBtn.textContent = "Supprimer"
	valBtn.className = 'bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700';

	const errorMessageb = document.createElement('div');
	errorMessageb.className = 'text-red-500 text-sm mb-2 hidden';
	errorMessageb.textContent = 'Invalid key';

	const valBBtn = document.createElement('button');
	valBBtn.textContent = 'Annuler';
	valBBtn.className = 'bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400';

	Validation_suppression.appendChild(valTitle);
	Validation_suppression.appendChild(valInput);
	Validation_suppression.appendChild(errorMessageb);
	Validation_suppression.appendChild(btnBox);
	btnBox.appendChild(valBtn);
	btnBox.appendChild(valBBtn);

	valBtn.addEventListener('click', async () => {
		const inputValue = valInput.value;
		const activ = await fetch('/api/verifActivity', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		const is2fa = await fetch('/api/isit2fa', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (is2fa.ok){
			const data = await is2fa.json();
			if (data.is2fa) {
				const code = await fetch('/api/tfaLogin', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ key:valInput.value })
				});
				if (code.ok) {
					const supp =await fetch('/api/deleteAccount', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
					if (supp.ok) {
						alert("Compte supprimé avec succès");
						localStorage.removeItem('token');
						background.removeChild(wrapper);
						background.removeChild(overlay);
						launchApp();
					}
					else
						alert("Erreur lors de la suppression du compte");
				}
			} else {
				const supp = await fetch('/api/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ username: localStorage.getItem('username'), password: valInput.value })
				});
				if (supp.ok) {
					const supp =await fetch('/api/deleteAccount', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});
					if (supp.ok) {
						alert("Compte supprimé avec succès");
						localStorage.removeItem('token');
						background.removeChild(wrapper);
						background.removeChild(overlay);
						launchApp();
					}
					else
						alert("Erreur lors de la suppression du compte");
				}
			}
		}
		errorMessageb.classList.remove('hidden');
	});

	valBBtn.addEventListener('click', async () => {
		const activ = await fetch('/api/verifActivity', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		overlay.classList.add('hidden');
	});

	// ---- Bloc infos utilisateur (gauche)
	const userBox = document.createElement('div');
	userBox.className = `bg-white p-6 rounded-lg shadow-md flex gap-6 items-center`;

	//colone avatar
	const avatarBox = document.createElement('div');
	avatarBox.className = 'flex flex-col items-center gap-3';

	const avatarImg = document.createElement('img');
	avatarImg.src = localStorage.getItem('avatar') ?? "default-avatar.png";
	avatarImg.alt = 'Avatar';
	avatarImg.className = 'w-56 h-56 rounded-full object-cover border-2 border-blue-500';

	const avButton = document.createElement('button');
	avButton.textContent = 'Changer l\'avatar';
	avButton.className = 'mt-2 bg-blue-600 text-white py-2 px-4 rounded';

	//colone user info
	const userInfo = document.createElement('div');
	userInfo.className = 'flex flex-col flex-1';

	const userTitle = document.createElement('h2');
	userTitle.textContent = 'Profil';
	userTitle.className = 'text-xl font-bold mb-4';

	const usernameP = document.createElement('p');
	const emailP = document.createElement('p');

	usernameP.innerHTML = `<strong>Username:</strong> <span id="profile-username">...</span>`;
	emailP.innerHTML = `<strong>Email:</strong> <span id="profile-email">...</span>`;

	const userSubtitle = document.createElement('text');
	userSubtitle.textContent = 'Username :';
	userSubtitle.className = 'text-lg font-semibold mb-4';

	const username = document.createElement('input');
	username.type = 'text';
	username.value = (localStorage.getItem('username') || 'Unknown');
	username.className = 'w-full mb-4 px-3 py-2 border rounded';

	const mailSubtitle = document.createElement('text');
	mailSubtitle.textContent = 'Email :';
	mailSubtitle.className = 'text-lg font-semibold mb-4';

	const mail = document.createElement('input');
	mail.type = 'email';
	mail.value = localStorage.getItem('email') || 'Unknown';
	mail.className = 'w-full mb-4 px-3 py-2 border rounded';

	const errorMessage = document.createElement('div');
	errorMessage.className = 'text-red-500 text-sm mb-2 hidden';
	errorMessage.textContent = 'Invalid username or password';

	const updatebutton = document.createElement('button');
	updatebutton.textContent = 'Sauvegarder';
	updatebutton.className = 'mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 block ml-auto';

	userInfo.appendChild(userTitle);
	userInfo.appendChild(userSubtitle);
	userInfo.appendChild(username);
	userInfo.appendChild(mailSubtitle);
	userInfo.appendChild(mail);
	userInfo.appendChild(errorMessage);
	userInfo.appendChild(updatebutton);

	avatarBox.appendChild(avatarImg);
	avatarBox.appendChild(avButton);
	userBox.appendChild(avatarBox);
	userBox.appendChild(userInfo);

	updatebutton.addEventListener('click', async () => {
		const activ = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		const res = await fetch('/api/updateUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				username: username.value,
				email: mail.value
			})
		});
		if (res.ok) {
			alert("Informations mises à jour !");
		} else {
			errorMessage.classList.remove('hidden');
			errorMessage.textContent = (await res.json()).error || 'Update failed';
		}
	});

	avButton.addEventListener('dragover', (e) => {
		e.preventDefault();
		avButton.classList.add('bg-blue-700');
	});

	avButton.addEventListener('dragleave', (e) => {
		avButton.classList.remove('bg-blue-700');
	});

	avButton.addEventListener('drop', async (e) => {
		e.preventDefault();
		const file = e.dataTransfer?.files[0];
		const activ = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		if (!file) {
			alert("No file dropped");
			return;
		}

		if (!file.type.startsWith('image/')) {
			alert("Please drop an image file");
			return;
		}

		const reader = new FileReader();
		reader.onload = async () => {
		const base64 = reader.result; // ex: "data:image/png;base64,iVBORw0KG..."

		const res = await fetch("/api/uploadAvatar", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify({ avatar: base64 as string })
		});

		if (res.ok) {
			console.log(base64 as string);
			avatarImg.src = base64 as string;
			localStorage.setItem('avatar', base64 as string);
			alert("Avatar mis à jour !");
		} else {
			alert("Erreur lors de l'upload de l'avatar");
		}
	};
		reader.readAsDataURL(file); // convertit le fichier en base64
	});

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
	pwdBtn.className = 'mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 block ml-auto';

	pwdBtn.addEventListener('click', async () => {
		const activ = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		const res = await fetch('/api/changePassword', {
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
		const activ = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		const res = await fetch('/api/isit2fa', {
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

		// ---- Bloc suppression
	const supBox = document.createElement('div');
	supBox.className = 'bg-white p-6 rounded-lg shadow-md';

	const supTitle = document.createElement('h2');
	supTitle.textContent = 'Suppression de compte';
	supTitle.className = 'text-lg font-semibold mb-4';

	const supBtn = document.createElement('button');
	supBtn.textContent = 'Supprimer le compte';
	supBtn.className = 'w-full bg-red-600 text-white py-2 rounded hover:bg-red-700';

	supBtn.addEventListener('click', async () => {
		const activ = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
		if (!activ.ok) {
			alert("vous avez ete deconnecte pour inactivite")
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
			return;
		}
		const res = await fetch('/api/isit2fa', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (res.ok) {
			const data = await res.json();
			if (data.is2fa === 1) {

				valInput.placeholder = "Taper votre code 2FA";
			} else {
				valInput.placeholder = "Taper votre mot de passe";
			}
		}
		overlay.classList.remove('hidden');
	});

	supBox.appendChild(supTitle);
	supBox.appendChild(supBtn);

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

	const gameProfileBtn = document.createElement('button');
	gameProfileBtn.textContent = 'Accéder au profil de jeu';
	gameProfileBtn.className = `
		bg-green-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-green-700 transition-colors mt-6
	`;

	gameProfileBtn.onclick = async () => {
		background.removeChild(wrapper);
		gameProfile();
	}
	
	backBox.appendChild(gameProfileBtn);
	backBox.appendChild(backBtn);

		backBtn.addEventListener('click', async () => {
			const res = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (res.ok) {
				background.removeChild(wrapper);
				launchApp();
			}
			else {
				localStorage.removeItem('token');
				background.removeChild(wrapper);
				launchApp();
			}
		});

	// ---- Colonne de gauche (2 blocs)
	const leftCol = document.createElement('div');
	leftCol.className = 'flex flex-col gap-10 w-1/2';

		// ---- Colonne de droite (2 blocs)
	const rightCol = document.createElement('div');
	rightCol.className = 'flex flex-col gap-6 w-1/2';

	// ---- Overlay
		const overlay = document.createElement('div');
	overlay.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden`;

	// ---- Build page
	const topRow = document.createElement('div');
	topRow.className = 'flex gap-10 w-full mx-auto items-start';

	overlay.appendChild(Validation_suppression);

	rightCol.appendChild(pwdBox);
	rightCol.appendChild(twofaBox);
	leftCol.appendChild(userBox);
	leftCol.appendChild(supBox);
	backCol.appendChild(backBox);

	topRow.appendChild(leftCol);
	topRow.appendChild(rightCol);
	wrapper.appendChild(topRow);
	wrapper.appendChild(backCol);

	background.appendChild(overlay);
	background.appendChild(wrapper);
}
