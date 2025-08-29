/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   roomHandler.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/29 15:30:42 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/29 16:14:38 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const { gameRoom } = require('./gameRoom.js');

function genId(prefix = "id", len = 8) {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let id = prefix + "_";
	for (let i = 0; i < len; i++) id += chars[(Math.random() * chars.length) | 0];
	return id;
}

class roomHandler {
  
	constructor({ deathTime = 10 * 60 * 1000 } = {}) {
		this.rooms = new Map();
		this.deathTime = deathTime;
		this._cleanTimer = setInterval(() => this.roomCleaner(), 60 * 1000).unref?.();
	}

	create(mode) {
		const id = genId();
		const room = new gameRoom({ id, mode, onEmpty: () => this._markEmpty(room) });
		this.rooms.set(id, room);
		return room;
	}

	get(id) {
		return this.rooms.get(id);
	}

	delete(id) {
		const room = this.rooms.get(id);
		if (!room) return false;
		room.destroy?.();
		return this.rooms.delete(id);
	}

	_markEmpty(room) {
		room._lastEmptyAt = Date.now();
	}

	roomCleaner() {
		const now = Date.now();

		for (const [id, room] of this.rooms) {
			let empty = false;

			if (typeof room.isEmpty === "function") {
				empty = room.isEmpty();
			} else if (room.sockets && room.sockets.size === 0) {
				empty = true;
			}

			if (empty) {
				if (!room._lastEmptyAt)
					room._lastEmptyAt = now;
				if (now - room._lastEmptyAt >= this.deathTime)
					this.delete(id);
			} else
				room._lastEmptyAt = undefined;
		}
	}
}

module.exports = { roomHandler };
