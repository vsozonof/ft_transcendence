/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   tournament.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/12 10:58:29 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 04:15:33 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { launchApp } from "../main";
import { getBackground } from "../main";
import { pongSessionHandler } from "./pong";

function tournamentHandler(lobbyKey, ws_tournament) {
	const tournament = createTournamentUI(lobbyKey);
	const background = getBackground();
	const _ui = (tournament as any)._ui;

	const roomKey = {
		ws_tournament: ws_tournament,
		tournament: tournament,
		mode: "tournament",
		game: undefined as string | undefined,
		roomId: undefined,
		player: undefined,
		username1: null as string | null,
		username2: null as string | null,
		avatar1: null as string | null,
		avatar2: null as string | null
	};
	
	ws_tournament.onmessage = (msg) => {
		let tData;
		try {
			tData = JSON.parse(msg.data);
		} catch (e) {
			console.error("Failed to parse WS message:", e);
			return;
		}
		console.log("Received WS message:", tData);
		if (tData.type === "start_match") {
			roomKey.roomId = tData.roomId;
			roomKey.player = tData.side;

			const self = lobbyKey.players[lobbyKey.playerId];
			const opponent = lobbyKey.players[tData.opponent];
			
			roomKey.game = tData.game;
			roomKey.username1 = self.username;
			roomKey.avatar1 = self.avatar;
			roomKey.username2 = opponent.username;
			roomKey.avatar2 = opponent.avatar;
			
			const ws_game = new WebSocket("ws://localhost:3000/game");

			ws_game.onopen = () => {
				ws_game.send(JSON.stringify({ type: "join_room", roomId: roomKey.roomId, side: roomKey.player }));
			};

			ws_game.onmessage = (msg) => {
				let gData;
				try {
					gData = JSON.parse(msg.data);
				} catch (e) {
					console.error("Failed to parse WS message:", e);
					return;
				}

				if (gData.type === "lobby_joined")
					pongSessionHandler(roomKey, ws_game);
			};
			
			ws_game.onclose = () => console.log("WS Game closed");
			ws_game.onerror = (e) => console.log("WS Game error " + e);
		}
		else if (tData.type === "show_bracket") {
			if (!background.contains(tournament)) {
				background.replaceChildren();
				background.appendChild(tournament);
			}
		}
		else if (tData.type === "tournament_update") {
			const semi1Winner = tData.g1Winner;
			const semi2Winner = tData.g2Winner;

			const semi1 = _ui.game1;
			const winner1 = semi1.p1.id === semi1Winner ? semi1.p1 : semi1.p2;
			const loser1  = semi1.p1.id === semi1Winner ? semi1.p2 : semi1.p1;

			winner1.wrapper.classList.add("bg-green-200");
			loser1.wrapper.classList.add("bg-red-200");
			loser1.span.classList.add("line-through");

			const semi2 = _ui.game2;
			const winner2 = semi2.p1.id === semi2Winner ? semi2.p1 : semi2.p2;
			const loser2  = semi2.p1.id === semi2Winner ? semi2.p2 : semi2.p1;

			winner2.wrapper.classList.add("bg-green-200");
			loser2.wrapper.classList.add("bg-red-200");
			loser2.span.classList.add("line-through");

			const final = _ui.final;
			final.p1.span.textContent = lobbyKey.players[semi1Winner].username;
			final.p1.img.src = lobbyKey.players[semi1Winner].avatar;
			final.p2.span.textContent = lobbyKey.players[semi2Winner].username;
			final.p2.img.src = lobbyKey.players[semi2Winner].avatar;
		}
		else if (tData.type === "tournament_finished") {
			const final = _ui.final;
			const winner = tData.winner;
			const loser = final.p1.span.textContent === winner ? final.p2 : final.p1;
			const winBlock = final.p1.span.textContent === winner ? final.p1 : final.p2;
			
			winBlock.wrapper.classList.add("bg-green-200");
			loser.wrapper.classList.add("bg-red-200");
			loser.span.classList.add("line-through");
		}

	};

	ws_tournament.onclose = () => console.log("WS Tourney closed");
	ws_tournament.onerror = (e) => console.log("WS Tourney error " + e);
}

function createTournamentUI(lobbyKey) {
	const background = getBackground();
	background.replaceChildren();

	const container = document.createElement("div");
	container.className =
		`w-[800px] h-[400px] bg-white text-black rounded-xl
		 shadow-lg flex flex-col items-center p-6`;

	const title = document.createElement("h2");
	title.className = "text-2xl font-bold mb-8";
	title.textContent = "Tournament Bracket";
	container.appendChild(title);

	const bracket = document.createElement("div");
	bracket.className = "flex flex-col gap-12 w-full items-center";

	const makePlayerBlock = (name, avatar, id) => {
		const wrapper = document.createElement("div");
		wrapper.className =
			"flex items-center gap-2 p-2 border rounded bg-gray-100";

		const img = document.createElement("img");
		img.className = "w-8 h-8 rounded-full object-cover";
		img.src = avatar || "./assets/pfp_placeholder.png";
		img.alt = `${name} avatar`;

		const span = document.createElement("span");
		span.className = "text-sm font-medium";
		span.textContent = name;

		wrapper.appendChild(img);
		wrapper.appendChild(span);

		return { wrapper, img, span, id };
	};

	const makeMatch = (leftName, leftAvatar, leftId, rightName, rightAvatar, rightId) => {
		const row = document.createElement("div");
		row.className = "grid grid-cols-3 items-center gap-2 w-2/3";

		const p1 = makePlayerBlock(leftName, leftAvatar, leftId);
		const vs = document.createElement("div");
		vs.className = "text-center font-bold text-gray-500";
		vs.textContent = "VS";
		const p2 = makePlayerBlock(rightName, rightAvatar, rightId);

		row.appendChild(p1.wrapper);
		row.appendChild(vs);
		row.appendChild(p2.wrapper);

		return { row, p1, p2 };
	};

	const game1 = makeMatch(lobbyKey.players[0].username, lobbyKey.players[0].avatar, lobbyKey.players[0].id, lobbyKey.players[1].username, lobbyKey.players[1].avatar, lobbyKey.players[1].id);
	const game2 = makeMatch(lobbyKey.players[2].username, lobbyKey.players[2].avatar, lobbyKey.players[2].id, lobbyKey.players[3].username, lobbyKey.players[3].avatar, lobbyKey.players[3].id);
	const final = makeMatch("?", null, null, "?", null, null);

	const returnButton = document.createElement("button");
	returnButton.className = `bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1`;
	returnButton.textContent = 'Return to Menu';

	returnButton.onclick = () => {
		const background = getBackground();
		background.innerHTML = '';

		launchApp();
	};

	bracket.appendChild(game1.row);
	bracket.appendChild(game2.row);
	bracket.appendChild(final.row);

	container.appendChild(bracket);
	container.appendChild(returnButton);
	background.appendChild(container);

	(container as any)._ui = { game1, game2, final };

	return container;
}



export { tournamentHandler, createTournamentUI };