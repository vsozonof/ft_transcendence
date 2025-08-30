/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameRoom.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/29 15:46:03 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/29 16:14:00 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

class gameRoom {

	constructor({ id, mode, onEmpty }) {
		this.id = id;
		this.mode = mode;
		this.onEmpty = onEmpty;

		this.players = [
		{ side: 0, socket: null, ready: false, name: "Player 1", avatar: null },
		{ side: 1, socket: null, ready: false, name: "Player 2", avatar: null },
		];
	}

	join(socket) {
		let slot = null;

		if (this.mode === "ai")
			slot = 0;
		else {
			const empty = this.players.find(p => p.socket === null);
			if (empty) slot = empty.side;
		}

		if (slot === null) throw new Error("Room full");

		this.players[slot].socket = socket;
		return slot;
	}

	leave(socket) {
		const player = this.players.find(p => p.socket === socket);
		if (player) {
			player.socket = null;
			player.ready = false;
		}

		if (this.isEmpty())
			this.onEmpty?.();
	}

	isEmpty() {
  		return this.players.every(p => p.socket === null);
	}

	playersPublic() {
		return this.players.map(p => ({
			ready: p.ready,
			name: p.name,
			avatar: p.avatar,
		}));
	}

	handleMessage(socket, msg) {
		if (msg.type === "ready") {
			const player = this.players.find(p => p.socket === socket);
			if (player) player.ready = true;
		}
    // more cases later...
  }

	destroy() {
	}
}


module.exports = { gameRoom };