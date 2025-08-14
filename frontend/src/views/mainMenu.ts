/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mainMenu.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/05 19:25:37 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/28 15:11:32 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main";
import { profileHandler } from "./profil";

interface MainMenuCallbacks {
	onPlay: () => void;
	onProfile: () => void;
	onRankings: () => void;
	onSettings: () => void;
	onLogout: () => void;
}

export function createMainMenu(callbacks: MainMenuCallbacks): HTMLElement {

	const mainMenuWrapper = document.createElement('div');
	mainMenuWrapper.className = `
	h-screen w-screen
	flex items-center justify-center
	`;

	const mainMenu = document.createElement('div');
	mainMenu.id = 'mainMenu';

	mainMenu.className = `
	bg-white p-8 rounded-lg shadow-md w-80
	flex flex-col justify-self-center
	`;

	const title = document.createElement('h2');
	title.textContent = 'Main Menu';
	title.className = 'text-2xl font-bold mb-6 text-center';

	const playButton = document.createElement('button');
	playButton.textContent = 'Play';
	playButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const rankingsButton = document.createElement('button');
	rankingsButton.textContent = 'Rankings';
	rankingsButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const profileButton = document.createElement('button');
	profileButton.textContent = 'Profile';
	profileButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const settingsButton = document.createElement('button');
	settingsButton.textContent = 'Settings';
	settingsButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const logOut = document.createElement('button');
	logOut.textContent = 'Log Out';
	logOut.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;



	mainMenu.appendChild(title);
	mainMenu.appendChild(playButton);
	mainMenu.appendChild(profileButton);
	mainMenu.appendChild(rankingsButton);
	mainMenu.appendChild(settingsButton);
	mainMenu.appendChild(logOut);

	mainMenuWrapper.appendChild(mainMenu);

	playButton.onclick = callbacks.onPlay;
	profileButton.onclick = callbacks.onProfile;
	rankingsButton.onclick = callbacks.onRankings;
	settingsButton.onclick = callbacks.onSettings;
	logOut.onclick = callbacks.onLogout;

	return mainMenuWrapper;
}
