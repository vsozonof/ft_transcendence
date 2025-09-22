/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   2fadisable.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 14:50:02 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 09:18:35 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground } from "../main";
import { profileHandler } from "./profil"

export async function tfa_disHandler(): Promise<void> {
	return new Promise((resolve, reject) => {
		const background = getBackground();
		const tfaWrapper = document.createElement('div');
		tfaWrapper.className = `
			h-screen w-screen
			flex items-center justify-center
		`;

		const tfaPrompt = document.createElement('div');
		tfaPrompt.id = 'tfaPrompt';
		tfaPrompt.className = `
		relative
		bg-white p-8 rounded-lg shadow-md w-80
		flex flex-col justify-self-center
		`;

		const title = document.createElement('h2');
		title.textContent = 'Two-Factor Disable';
		title.className = 'text-2xl font-bold mb-6 text-center';

		const keyInput = document.createElement('input');
		keyInput.type = 'text';
		keyInput.placeholder = 'Authentication Key';
		keyInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-6 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const errorMessage = document.createElement('div');
		errorMessage.className = 'text-red-500 text-sm mb-2 hidden';
		errorMessage.textContent = 'Invalid Key';

		const loginButton = document.createElement('button');
		loginButton.textContent = 'Send';
		loginButton.className = `
		bg-blue-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-blue-700 transition-colors
		`;

		const backButton = document.createElement('button');
		backButton.textContent = 'Back';
		backButton.className = `
		bg-red-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-blue-700 transition-colors
		mt-2
		`;

		tfaPrompt.appendChild(title);
		tfaPrompt.appendChild(keyInput);
		tfaPrompt.appendChild(errorMessage);
		tfaPrompt.appendChild(loginButton);
		tfaPrompt.appendChild(backButton);
		tfaWrapper.appendChild(tfaPrompt);


		background.appendChild(tfaWrapper);

		loginButton.addEventListener('click', async () => {
			const key = keyInput.value;
			if (!key) {
				errorMessage.classList.remove('hidden');
				errorMessage.textContent = 'Please enter a key';
				return;
			}
			const res = await fetch('/api/disable2fa',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({ key })
			} )
			if (res.ok)	{
				alert("2FA désactivée avec succès !");
				background.removeChild(tfaWrapper);
				await profileHandler();
				resolve();
				return
			}
			else {
				errorMessage.classList.remove('hidden');
				errorMessage.textContent = 'Invalid Key';
			}
			})

		backButton.addEventListener('click', async () => {
			background.removeChild(tfaWrapper);
			await profileHandler();
			resolve();
			return;
		})
	});


}
