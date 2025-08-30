/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   2falogin.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 14:50:02 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/29 16:24:58 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground } from "../main";

import { profileHandler } from "./profil"

import { loginHandler } from "./login";

// Form de login basique, présent uniquement pour faire le lien en auth
// et redirection vers le main menu
// -> il te reste pas mal de chose à faire dessus:
// (ex: design, liaison backend, redirection propre vers main menu, gestion d'erreur...)

export async function tfa_handler(): Promise<void> {
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
		title.textContent = 'Two-Factor Authentication';
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
				resolve();
				return;
			}
			const res = await fetch('http://127.0.0.1:3000/tfaLogin',{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({ key })
			} )
			if (res.ok)	{
				const data = await res.json();
				console.log('Login successful, token:', data.token);
				background.removeChild(tfaWrapper);
				profileHandler();
				resolve();
				return
			}
			else {
				errorMessage.classList.remove('hidden');
				errorMessage.textContent = 'Invalid Key';
			}
			})

		backButton.addEventListener('click', async () => {
		localStorage.removeItem('token');
		background.removeChild(tfaWrapper);
		await loginHandler();
		resolve();
		return;
		})
	});


}
