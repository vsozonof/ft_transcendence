/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   matchHandler.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/30 20:26:41 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/12 11:07:48 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { pongSessionHandler } from "./pong";
import { updateUserInfos } from "./utils";
import { launchApp } from "../main";
import { getBackground } from "../main";
import { tournamentHandler } from "./tournament";

export function matchHandler(mode) {
	switch (mode) {
		case 'local':
			createAndJoinAiOrLocalRoom(mode);
			break;
		case 'ai':
			createAndJoinAiOrLocalRoom(mode);
			break;
		case 'pvp':
			queueForPvp(mode);
			break;
		case 'tournament':
			queueForTournament(mode);
			break;
		default:
			throw new Error('Invalid game mode');
	}
}

async function queueForTournament(mode: string) {
	showQueueScreen();

	const lobbyKey = {
		mode,
		tournamentId: undefined,
		playerId: undefined,
		players: undefined
	}

		try {
		const res = await fetch("http://localhost:3000/queue", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mode, token: localStorage.getItem('token') })
		});

		const data = await res.json();

		if (data.error) {
			console.log("Error queuing for PVP or tournament:", data.error);
			alert(`Error: queue ${data.error}`);
			
			const background = getBackground();
			background.innerHTML = '';
			
			launchApp();
			return;
		}
		const { tournamentId, playerNumber, players } = data;
		lobbyKey.tournamentId = tournamentId;
		lobbyKey.playerId = playerNumber;
		lobbyKey.players = players;
		
		const ws = new WebSocket("ws://localhost:3000/tournament");
		
		ws.onopen = () => {
			ws.send(JSON.stringify({ type: "join_tournament", tournamentId, playerNumber }));
        };

        ws.onmessage = (msg) => {
			let data;
			try {
				data = JSON.parse(msg.data);
			} catch (e) {
				console.error("Failed to parse WS message:", e);
				return;
			}

			if (data.type === "tournament_joined") {
				console.log("Joined tournament:", data);
				tournamentHandler(lobbyKey, ws);
			}

		};

        ws.onclose = () => console.log("WS closed");
        ws.onerror = (e) => console.log("WS error " + e);
	} catch (err) {
		console.error("Error caught:", err);
	}
}

async function queueForPvp(mode: string) {
	showQueueScreen();

	const lobbyKey = {
		mode,
		roomId: undefined,
		player: undefined,
		username1: null as string | null,
		avatar1: null as string | null,
		username2: null as string | null,
		avatar2: null as string | null
	}

	try {
		const res = await fetch("http://localhost:3000/queue", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mode, token: localStorage.getItem('token') })
		});

		const data = await res.json();

		if (data.error) {
			console.log("Error queuing for PVP or tournament:", data.error);
			alert(`Error: queue ${data.error}`);
			
			const background = getBackground();
			background.innerHTML = '';
			
			launchApp();
			return;
		}

		const { roomId, side, self, opponent } = data;
		lobbyKey.username1 = self.username;
		lobbyKey.avatar1 = self.avatar;
		lobbyKey.username2 = opponent.username;
		lobbyKey.avatar2 = opponent.avatar;

		console.log(lobbyKey.username1, lobbyKey.username2);
		
		const ws = new WebSocket("ws://localhost:3000/game");
		
		ws.onopen = () => {
			ws.send(JSON.stringify({ type: "join_room", roomId, side }));
        };

        ws.onmessage = (msg) => {
			let data;
			try {
				data = JSON.parse(msg.data);
			} catch (e) {
				console.error("Failed to parse WS message:", e);
				return;
			}

			console.log("Received WS message:", data);

			if (data.type === "lobby_joined") {
				lobbyKey.roomId = data.id;
				lobbyKey.player = data.you;

				pongSessionHandler(lobbyKey, ws);
			}
		};

        ws.onclose = () => console.log("WS closed");
        ws.onerror = (e) => console.log("WS error " + e);
	} catch (err) {
		console.error("Error caught:", err);
	}
}

function showQueueScreen() {
	const background = getBackground();
	background.innerHTML = '';

	const wrapper = document.createElement("div");
	wrapper.className = `
		flex flex-col items-center justify-center
		h-full text-white gap-4
	`;

	const spinner = document.createElement("div");
	spinner.className = `
		animate-spin inline-block h-16 w-16
		border-[6px] border-current border-t-transparent
		text-blue-500 rounded-full
	`;

	const text = document.createElement("p");
	text.className = "text-lg font-semibold";
	text.textContent = "Searching for an opponent…";

	wrapper.appendChild(spinner);
	wrapper.appendChild(text);
	background.appendChild(wrapper);
}


async function createAndJoinAiOrLocalRoom(mode: string) {
	const lobbyKey = {
		mode,
		roomId: undefined,
		player: undefined,
		username1: null as string | null,
		avatar1: null as string | null,
		username2: null as string | null,
		avatar2: null as string | null
	}

	updateUserInfos().then(() => {
		lobbyKey.username1 = localStorage.getItem('username');
		lobbyKey.avatar1 = localStorage.getItem('avatar');
	}).catch((err) => {
		console.error("Error getting user by token:", err);
	});

	try {
		const res = await fetch("http://localhost:3000/rooms", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mode })
			});
		const data = await res.json();
		console.log("Created room:", data);
		const ws = new WebSocket("ws://localhost:3000/game");
		
		ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join_room", roomId: data.roomId }));
        };

        ws.onmessage = (msg) => {
			let data;
			try {
				data = JSON.parse(msg.data);
			} catch (e) {
				console.error("Failed to parse WS message:", e);
				return;
			}

			if (data.type === "lobby_joined") {
				lobbyKey.roomId = data.id;
				lobbyKey.player = data.you;

				pongSessionHandler(lobbyKey, ws);
			}
		};

        ws.onclose = () => console.log("WS closed");
        ws.onerror = (e) => console.log("WS error " + e);

	} catch (err) {
		console.error("Error creating game:", err);
	}
}