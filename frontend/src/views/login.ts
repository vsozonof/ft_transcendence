/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   login.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 14:50:02 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/05 19:29:27 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main"

export function createPromptLogin() {
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

	const loginButton = document.createElement('button');
	loginButton.textContent = 'Log In';
	loginButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	loginPrompt.appendChild(title);
	loginPrompt.appendChild(usernameInput);
	loginPrompt.appendChild(passwordInput);
	loginPrompt.appendChild(loginButton);
	loginWrapper.appendChild(loginPrompt);
	
	loginButton.addEventListener('click', () => {
		background.removeChild(loginWrapper);
	});

	return loginWrapper;
}