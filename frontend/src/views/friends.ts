/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/03 11:01:05 by rostrub           #+#    #+#             */
/*   Updated: 2025/09/03 19:39:52 by rostrub          ###   ########.fr       */
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
		const res = await fetch('http://127.0.0.1:3000/verifActivity', {
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

	friendsList.appendChild(tempo);
	btnBox.appendChild(addBtn);
	btnBox.appendChild(backBtn);
	friendsList.appendChild(btnBox);
	wrapper.appendChild(friendsList);
	background.appendChild(wrapper);

	backBtn.addEventListener('click', async () => {
		background.removeChild(wrapper);
		launchApp();
		return;
	});

}
