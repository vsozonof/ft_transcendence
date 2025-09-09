/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   matchHandler.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/30 20:26:41 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/08 15:14:25 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { pongSessionHandler } from "./pong";

export function matchHandler(mode) {
	switch (mode) {
		case 'local':
			console.log('Local mode not implemented yet');
			break;
		case 'ai':
			createAndJoinAiRoom();
			break;
		case 'pvp':
			console.log('PVP mode not implemented yet');
			break;
		case 'tournament':
			console.log('Tournament mode not implemented yet');
			break;
		default:
		throw new Error('Invalid game mode');
	}
}

async function createAndJoinAiRoom() {
	const lobbyKey = {
		mode: 'ai',
		roomId: undefined,
		player: undefined
	}

	try {
		const res = await fetch("http://localhost:3000/rooms", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ mode: "ai" })
			});
		const data = await res.json();
		
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
		console.error("Error creating AI game:", err);
	}
}