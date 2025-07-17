/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   register.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/16 23:46:36 by rostrub           #+#    #+#             */
/*   Updated: 2025/07/17 17:11:33 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main"

import { loginHandler } from "./login"

// Form de login basique, présent uniquement pour faire le lien en auth
// et redirection vers le main menu
// -> il te reste pas mal de chose à faire dessus:
// (ex: design, liaison backend, redirection propre vers main menu, gestion d'erreur...)

export async function registerHandler(): Promise<void> {
	return new Promise((resolve, reject) => {
		const registerWrapper = document.createElement('div');
		registerWrapper.className = `
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
			bg-gray-200 px-4 py-2 rounded-t-md shadow
			border border-gray-300
			hover:bg-gray-100 transition-colors
		`;

		const registerTab = document.createElement('button');
		registerTab.textContent = 'Register';
		registerTab.className = `
			flex-1
			bg-white px-4 py-2 rounded-t-md
			border border-gray-300 border-b-0
			font-bold text-center
		`;

		const registerPrompt = document.createElement('div');
		registerPrompt.id = 'loginPrompt';

		registerPrompt.className = `
		relative
		bg-white p-8 rounded-lg shadow-md w-80
		flex flex-col justify-self-center
		`;

		const title = document.createElement('h2');
		title.textContent = ' ';
		title.className = 'text-2xl font-bold mb-6 text-center';

		const mailInput = document.createElement('input');
		mailInput.type = 'text';
		mailInput.placeholder = 'Mail';
		mailInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-4 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const usernameInput = document.createElement('input');
		usernameInput.type = 'text';
		usernameInput.placeholder = 'Username';
		usernameInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-4 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const passInput = document.createElement('input');
		passInput.type = 'text';
		passInput.placeholder = 'Password';
		passInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-4 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const verifPassInput = document.createElement('input');
		verifPassInput.type = 'text';
		verifPassInput.placeholder = 'Retype Password';
		verifPassInput.className = `
		border border-gray-300 rounded-md px-3 py-2 mb-4 w-full
		focus:outline-none focus:ring-2 focus:ring-blue-500
		`;

		const registerButton = document.createElement('button');
		registerButton.textContent = 'Register';
		registerButton.className = `
		bg-blue-600 text-white rounded-md py-2 w-full font-semibold
		hover:bg-blue-700 transition-colors
		`;

		tabContainer.appendChild(loginTab);
		tabContainer.appendChild(registerTab);
		registerPrompt.appendChild(tabContainer);
		registerPrompt.appendChild(title);
		registerPrompt.appendChild(mailInput);
		registerPrompt.appendChild(usernameInput);
		registerPrompt.appendChild(passInput);
		registerPrompt.appendChild(verifPassInput);
		registerPrompt.appendChild(registerButton);
		registerWrapper.appendChild(registerPrompt);

		background.appendChild(registerWrapper);

		registerButton.addEventListener('click', async () => {
			const mail = mailInput.value;
			const username = usernameInput.value;
			const password = passInput.value;
			const verifPassword = verifPassInput.value;
		});

		loginTab.addEventListener('click', async () => {
			background.removeChild(registerWrapper);
			await loginHandler();
			resolve();
			return;
		});
	});
}
