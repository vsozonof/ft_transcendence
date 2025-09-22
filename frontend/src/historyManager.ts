/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   historyManager.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/22 13:48:24 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 14:11:35 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { loginHandler } from "./views/login";
import { profileHandler } from "./views/profil";
import { createMainMenu } from "./views/mainMenu";
import { friendsHandler } from "./views/friends";
import { matchHandler } from "./game/matchHandler";
import { getBackground } from "./main";

export function initHistory() {
	history.replaceState({ page: 'main' }, "", "/");

	window.onpopstate = (event) => {
		const page = event.state?.page || 'main';
		renderPage(page);
	};
}

export function navigate(page: string) {
	history.pushState({ page }, "", `/${page}`);
	renderPage(page);
}

function renderPage(page: string) {
	const background = getBackground();
	if (!background) return;

	background.innerHTML = '';

	switch (page) {
		case "main": {
		const mainMenu = createMainMenu({
			onPlay: () => navigate("ai"),
			onLocalPlay: () => navigate("local"),
			onOnlinePlay: () => navigate("pvp"),
			onTournament: () => navigate("tournament"),
			onProfile: () => navigate("profile"),
			onFriends: () => navigate("friends"),
			onLogout: () => {
			localStorage.removeItem("token");
			location.reload();
			},
		});
			background.appendChild(mainMenu);
			break;
		}

		case "ai":
		case "local":
		case "pvp":
		case "tournament":
			matchHandler(page);
			break;

		case "profile":
			profileHandler();
			break;

		case "friends":
			friendsHandler();
			break;

		default: {
			const fallbackMenu = createMainMenu({});
			background.appendChild(fallbackMenu);
			break;
		}
	}
}

