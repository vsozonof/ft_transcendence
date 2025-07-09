/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/05 19:16:21 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/05 19:29:47 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createPromptLogin } from "./views/login";
import { createMainMenu } from "./views/mainMenu";


const app = document.getElementById('app');
export const background = document.createElement('div');

function setupBackground() {
	background.id = 'background';

	background.className = 'fixed inset-0 bg-cover bg-center';
	background.style.backgroundImage = "url('/assets/bg.jpg')";

	app.appendChild(background);
}

if (app) {
	setupBackground();
	
	const loginPrompt = createPromptLogin();
	background.appendChild(loginPrompt);	
}





