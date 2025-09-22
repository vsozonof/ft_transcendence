/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/22 13:55:24 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 14:40:46 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { initHistory, navigate } from './historyManager';
import { loginHandler } from './views/login';


const app = document.getElementById('app');

export function getBackground(): HTMLDivElement {
  let bg = document.getElementById('background') as HTMLDivElement | null;
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'background';
    document.body.appendChild(bg);
  }
  return bg;
}

import bgImg from './assets/bg.jpg';

function setupBackground() {
	const bg = getBackground();
	bg.className = 'fixed inset-0 bg-cover bg-center flex items-center justify-center';
	bg.style.backgroundImage = `url(${bgImg})`;

	app?.appendChild(bg);
}

export async function launchApp() {
	if (!app)
		return;

	setupBackground();
	const background = getBackground();
	console.log('Launching app...');
	if (!localStorage.getItem('token'))
		await loginHandler();
	initHistory();
	navigate('main');
}

document.addEventListener('DOMContentLoaded', () => {
	launchApp();
});




