/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   login.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 14:50:02 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/16 15:45:10 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main"

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

		const loginPrompt = document.createElement('div');
		loginPrompt.id = 'loginPrompt';

		loginPrompt.className = `
		bg-white p-8 rounded-lg shadow-md w-80
		flex flex-col justify-self-center
		`;

		const title = document.createElement('h2');
		title.textContent = 'Login';
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

			if (password == "f" && username == "f")
				resolve();

			const res = await fetch('http://localhost:3000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			})
			if (res.ok) {
				const data = await res.json();
				console.log('Login successful, Token: ', data.token);
				background.removeChild(loginWrapper);
				resolve();
			} else {
				errorMessage.classList.remove('hidden');
			}
		});
	});
}
