/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/03 11:01:05 by rostrub           #+#    #+#             */
/*   Updated: 2025/09/22 11:17:43 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground, launchApp } from "../main";
import { launchApp } from "../main";

export async function friendsHandler(): Promise<void> {
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
	}

	// ---- Overlay
	const overlay = document.createElement('div');
	overlay.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden`;

	// ---- block add friend
	const add_friend = document.createElement('div');
	add_friend.className = `bg-white p-6 rounded-lg flex flex-col shadow-md flex gap-6 items-center`;

	const friend_title = document.createElement('h2');
	friend_title.textContent = 'Ajouter un ami';
	friend_title.className = 'text-xl font-bold mb-4';

	const friendInput = document.createElement('input');
	friendInput.type = 'text';
	friendInput.placeholder = "Nom d'utilisateur";
	friendInput.className = 'w-full mb-4 px-3 py-2 border rounded';

	const addButton = document.createElement('button');
	addButton.textContent = "Ajouter";
	addButton.className = 'bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700';

	friendInput.placeholder = "Friend's username";
	friendInput.className = 'w-full mb-4 px-3 py-2 border rounded';

	const btnnBox = document.createElement('div');
	btnnBox.className = 'flex gap-4';

	const friend_Btn = document.createElement('button');
	friend_Btn.textContent = "Ajouter"
	friend_Btn.className = 'bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700';

	const errorMessageb = document.createElement('div');
	errorMessageb.className = 'text-red-500 text-sm mb-2 hidden';
	errorMessageb.textContent = 'Invalid key';

	const friend_BBtn = document.createElement('button');
	friend_BBtn.textContent = 'Back';
	friend_BBtn.className = 'bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700';

	add_friend.appendChild(friend_title);
	add_friend.appendChild(friendInput);
	add_friend.appendChild(errorMessageb);
	add_friend.appendChild(btnnBox);
	btnnBox.appendChild(friend_Btn);
	btnnBox.appendChild(friend_BBtn);

	friend_BBtn.addEventListener('click', async () => {
		const res = await fetch('/api/verifActivity', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (!res.ok) {
			overlay.classList.add('hidden');
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
		}
		else {
			overlay.classList.add('hidden');
		}
	});

	friend_Btn.addEventListener('click', async () => {
		const friendName = friendInput.value;
		const act = await fetch('/api/verifActivity', {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});
		if (!act.ok) {
			localStorage.removeItem('token');
			background.removeChild(wrapper);
			launchApp();
		}
		if (!friendName) {
			errorMessageb.classList.remove('hidden');
			errorMessageb.textContent = 'Please enter a username';
			return;
		}
		const res = await fetch('/api/addfriend', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ friendName })
		});
		if (res.ok) {
			const data = await res.json();
			console.log('Friend added:', data);
			friendInput.value = '';
			overlay.classList.add('hidden');
			loadFriends();
		} else {
			errorMessageb.classList.remove('hidden');
			errorMessageb.textContent = 'Failed to add friend';
		}
	});

	//friend_list

	const friend_container = document.createElement('div');
	friend_container.className = 'mt-4 max-h-64 overflow-y-auto space-y-2';

	async function loadFriends() {
		friend_container.innerHTML = "";
		try {
			const res = await fetch("/api/getFriends", {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				}
			});

			if (!res.ok) {
				throw new Error("Impossible de récupérer la liste d'amis");
			}

			const friends = await res.json();

			if (friends.length === 0) {
				const emptyMsg = document.createElement("p");
				emptyMsg.textContent = "Aucun ami pour l'instant.";
				emptyMsg.className = "text-gray-500 text-sm";
				friend_container.appendChild(emptyMsg);
				return;
			}

			friends.forEach(friends => {
				// bloc ami
				const friendItem = document.createElement("div");
				friendItem.className = "flex items-center p-2 border rounded shadow-sm";

				// avatar
				const avatar = document.createElement("img");
				avatar.src = friends.avatar || "default-avatar.png"; // fallback si pas d'avatar
				avatar.className = "w-10 h-10 rounded-full mr-3";

				// bloc texte
				const info = document.createElement("div");
				const name = document.createElement("p");
				name.textContent = friends.username;
				name.className = "font-semibold";


				info.appendChild(name);

				// status dot
				const statusDot = document.createElement("span");
				statusDot.className = `ml-auto w-3 h-3 rounded-full ${friends.isOnline ? "bg-green-500" : "bg-gray-400"}`;

				friendItem.appendChild(avatar);
				friendItem.appendChild(info);
				friendItem.appendChild(statusDot);

				friend_container.appendChild(friendItem);
	});
		} catch (error) {
			console.error("Erreur loadFriends:", error);
			const errMsg = document.createElement("p");
			errMsg.textContent = "Erreur lors du chargement des amis.";
			errMsg.className = "text-red-500 text-sm";
			friend_container.appendChild(errMsg);
		}
	}


	//block principal
	const wrapper = document.createElement('div');
	wrapper.className = `h-screen w-screen flex items-center justify-center`;

	const friendsList = document.createElement('div');
	friendsList.className = `bg-white p-6 rounded-lg shadow-md w-80`;

	const tempo = document.createElement('h2');
	tempo.textContent = 'Liste d\'amis';
	tempo.className = 'text-2xl font-bold';

	const btnBox = document.createElement('div');
	btnBox.className = 'flex gap-4';

	const addBtn = document.createElement('button');
	addBtn.textContent = 'Ajouter un ami';
	addBtn.className = `bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700`;

	const backBtn = document.createElement('button');
	backBtn.textContent = 'Retour';
	backBtn.className = `bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700`;

	overlay.appendChild(add_friend);

	friendsList.appendChild(tempo);
	friendsList.appendChild(friend_container);
	await loadFriends();
	btnBox.appendChild(addBtn);
	btnBox.appendChild(backBtn);
	friendsList.appendChild(btnBox);
	wrapper.appendChild(friendsList);

	background.appendChild(overlay);
	background.appendChild(wrapper);


	addBtn.addEventListener('click', async () => {
		const res = await fetch('/api/verifActivity', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});
			if (!res.ok) {
				localStorage.removeItem('token');
				overlay.classList.remove('hidden');
				background.removeChild(wrapper);
				launchApp();
			}
			else {
				overlay.classList.remove('hidden');
			}
	});

	backBtn.addEventListener('click', async () => {
		background.removeChild(wrapper);
		launchApp();
		return;
	});

}
