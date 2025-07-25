/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   login.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 14:50:02 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/21 16:08:48 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main"

import { registerHandler } from "./register"

// Form de login basique, présent uniquement pour faire le lien en auth
// et redirection vers le main menu
// -> il te reste pas mal de chose à faire dessus:
// (ex: design, liaison backend, redirection propre vers main menu, gestion d'erreur...)

export async function loginHandler(): Promise<void> {
	return new Promise((resolve, reject) => {
		const loginWrapper = document.createElement('div');
		loginWrapper.className = `
			h-screen w-screen
			flex items-center justify-center
		`;


		const tabContainer = document.createElement('div');
		tabContainer.className = `
			absolute -top-1 left-0 w-full
			flex z-30
		`;

		const loginTab = document.createElement('button');
		loginTab.textContent = 'Login';
		loginTab.className = `
			flex-1
			bg-white px-4 py-2 rounded-t-md
			border border-gray-300 border-b-0
			font-bold text-center
		`;

		const registerTab = document.createElement('button');
		registerTab.textContent = 'Register';
		registerTab.className = `
			flex-1
			bg-gray-200 px-4 py-2 rounded-t-md shadow
			border border-gray-300
			hover:bg-gray-100 transition-colors
		`;

		const loginPrompt = document.createElement('div');
		loginPrompt.id = 'loginPrompt';

		loginPrompt.className = `
		relative
		bg-white p-8 rounded-lg shadow-md w-80
		flex flex-col justify-self-center
		`;

		const title = document.createElement('h2');
		title.textContent = ' ';
		title.className = 'text-2xl font-bold mb-6 text-center';

		const usernameInput = document.createElement('input');
		usernameInput.type = 'text';
		usernameInput.placeholder = 'Username';
		usernameInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-4 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const passwordInput = document.createElement('input');
		passwordInput.type = 'password';
		passwordInput.placeholder = 'Password';
		passwordInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-6 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const errorMessage = document.createElement('div');
		errorMessage.className = 'text-red-500 text-sm mb-2 hidden';
		errorMessage.textContent = 'Invalid username or password';

		const loginButton = document.createElement('button');
		loginButton.textContent = 'Log In';
		loginButton.className = `
		bg-blue-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-blue-700 transition-colors
		`;

		tabContainer.appendChild(loginTab);
		tabContainer.appendChild(registerTab);
		loginPrompt.appendChild(tabContainer);
		loginPrompt.appendChild(title);
		loginPrompt.appendChild(usernameInput);
		loginPrompt.appendChild(passwordInput);
		loginPrompt.appendChild(errorMessage);
		loginPrompt.appendChild(loginButton);
		loginWrapper.appendChild(loginPrompt);


		background.appendChild(loginWrapper);

		loginButton.addEventListener('click', async () => {
			const username = usernameInput.value;
			const password = passwordInput.value;
			console.log('Login attempt');
			if (!username || !password) {
				errorMessage.classList.remove('hidden');
				errorMessage.textContent = 'Please fill in all fields';
				return;
			}
			const res = await fetch('http://127.0.0.1:3000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			})
			console.log('Response status:', res.status);
			if (res.ok) {
				const data = await res.json();
				console.log('Login successful, Token: ', data.token);
				resolve();
				background.removeChild(loginWrapper);
			} else {
				errorMessage.classList.remove('hidden');
				errorMessage.textContent = (await res.json()).error || 'Login failed';
			}
		});

		registerTab.addEventListener('click', async () => {
			background.removeChild(loginWrapper);
			await registerHandler();
			resolve();
			return;
		});

	});
}
