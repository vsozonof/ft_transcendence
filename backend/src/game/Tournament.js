/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/12 09:27:42 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/12 09:37:06 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const { roomHandler } = require('./roomHandler.js');
const rooms = new roomHandler();

class Tournament {
	constructor(id, players) {
		this.id = id;
		this.players = players;
		this.matches = [];
		this.currentRound = 1;
		this.status = "waiting";
		this.finalists = [];
		this.losers = [];
		this.results = [];
	}

	startRound1() {
		const m1 = rooms.create("pvp", [this.players[0], this.players[1]]);
		const m2 = rooms.create("pvp", [this.players[2], this.players[3]]);
		this.matches.push(m1, m2);

		this.status = "running";
	}

	handleMatchResult(matchId, winner, loser) {
		if (this.currentRound === 1) {
		this.finalists = [winner];
		this.losers = [loser];
		if (this.finalists.length === 2 && this.losers.length === 2) {
			this.startRound2();
		}
		} else if (this.currentRound === 2) {
		this.results.push({ winner, loser });
		if (this.results.length === 2) {
			this.status = "finished";
			this.broadcastResults();
		}
		}
	}

	startRound2() {
		const m3 = rooms.create("pvp", this.finalists);
		const m4 = rooms.create("pvp", this.losers);
		this.matches.push(m3, m4);
		this.currentRound = 2;
	}

	broadcastResults() {
	}
}

module.exports = { Tournament };
