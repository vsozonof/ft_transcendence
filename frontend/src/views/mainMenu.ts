/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mainMenu.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/05 19:25:37 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 13:36:52 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main";
import { profileHandler } from "./profil";

interface MainMenuCallbacks {
	onPlay: () => void;
	onLocalPlay: () => void;
	onOnlinePlay: () => void;
	onTournament: () => void;
	onProfile: () => void;
	onFriends: () => void;
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
	playButton.textContent = 'Play vs AI';
	playButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const playLocalButton = document.createElement('button');
	playLocalButton.textContent = 'Play Local';
	playLocalButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const playOnlineButton = document.createElement('button');
	playOnlineButton.textContent = 'Play Online';
	playOnlineButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const playTournamentButton = document.createElement('button');
	playTournamentButton.textContent = 'Play Tournament';
	playTournamentButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const profileButton = document.createElement('button');
	profileButton.textContent = 'Profile';
	profileButton.className = `
	bg-blue-600 text-white rounded-md py-2 w-full font-semibold
	hover:bg-blue-700 transition-colors
	`;

	const friendsButton = document.createElement('button');
	friendsButton.textContent = 'Friends';
	friendsButton.className = `
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
	mainMenu.appendChild(playLocalButton);
	mainMenu.appendChild(playOnlineButton);
	mainMenu.appendChild(playTournamentButton);
	mainMenu.appendChild(profileButton);
	mainMenu.appendChild(friendsButton);
	mainMenu.appendChild(logOut);

	mainMenuWrapper.appendChild(mainMenu);

	playButton.onclick = callbacks.onPlay;
	playLocalButton.onclick = callbacks.onLocalPlay;
	playOnlineButton.onclick = callbacks.onOnlinePlay;
	playTournamentButton.onclick = callbacks.onTournament;
	profileButton.onclick = callbacks.onProfile;
	friendsButton.onclick = callbacks.onFriends;
	logOut.onclick = callbacks.onLogout;

	return mainMenuWrapper;
}
