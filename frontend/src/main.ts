/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/05 19:16:21 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/14 03:49:30 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { loginHandler } from "./views/login";
import { createMainMenu } from "./views/mainMenu";
import { startPongGame } from "./pong";


const app = document.getElementById('app');
export const background = document.createElement('div');

function setupBackground() {
	background.id = 'background';
	background.className = 'fixed inset-0 bg-cover bg-center';
	background.style.backgroundImage = "url('/assets/bg.jpg')";

	app?.appendChild(background);
}

async function launchApp() {
	if (!app)
		return;
	
	setupBackground();
	await loginHandler();

	const mainMenu = createMainMenu(() => {
		mainMenu.remove();
		launchApp();
	});
	
	background.appendChild(mainMenu);
	
}


document.addEventListener('DOMContentLoaded', () => {
	launchApp();
});




