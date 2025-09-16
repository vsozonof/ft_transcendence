/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Tournament.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/12 09:27:42 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/15 13:08:23 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const rooms = require('./rooms.js');

class Tournament {
	constructor(id, players) {
		this.id = id;
		this.players = players;
		this.semiWinners = [null, null];
		this.winner = null;

	}

	startRound1() {
		const m1 = rooms.create("tournament", [this.players[0], this.players[1]]);
		const m2 = rooms.create("tournament", [this.players[2], this.players[3]]);

		setTimeout(() => {
			this.players[0].socket.send(JSON.stringify({ type: "start_match", game: "r1g1", roomId: m1.id, side: 0, opponent: 1 }));
			this.players[1].socket.send(JSON.stringify({ type: "start_match", game: "r1g1", roomId: m1.id, side: 1, opponent: 0 }));

			this.players[2].socket.send(JSON.stringify({ type: "start_match", game: "r1g2", roomId: m2.id, side: 0, opponent: 3 }));
			this.players[3].socket.send(JSON.stringify({ type: "start_match", game: "r1g2", roomId: m2.id, side: 1, opponent: 2 }));
		}, 10 * 1000);		
	}

	handleMatchResult(game, winner) {
		if (game === "r1g1" || game === "r1g2") {
			if (game === "r1g1") {
				if (winner === 0 && !this.semiWinners[0]) {
					this.semiWinners[0] = this.players[0];
				} else if (winner === 1 && !this.semiWinners[0]) {
					this.semiWinners[0] = this.players[1];
				}
			}
			else if (game === "r1g2") {
				if (winner === 0 && !this.semiWinners[1]) {
					this.semiWinners[1] = this.players[2];
				} else if (winner === 1 && !this.semiWinners[1]) {
					this.semiWinners[1] = this.players[3];
				}
			}

			if (this.semiWinners[0] && this.semiWinners[1]) {
				console.log("Tournament", this.id, "Round 1 complete. Semi-final winners:", this.semiWinners[0].id, this.semiWinners[1].id);
				this.broadcastResults({
					type: "tournament_update",
					g1Winner: this.semiWinners[0].id,
					g2Winner: this.semiWinners[1].id
				})

				this.startRound2();
			}
		}
		else if (game === "final") {
			if (winner === 0 && !this.winner) {
				this.winner = this.semiWinners[0];
			}
			else if (winner === 1) {
				this.winner = this.semiWinners[1];
			}

			if (this.winner) {
				console.log("Tournament", this.id, "Winner is:", this.winner.id);
				this.broadcastResults({
					type: "tournament_finished",
					winner: this.winner.id
				})
			}
		}
	}

	startRound2() {
		const m3 = rooms.create("tournament", [this.semiWinners[0], this.semiWinners[1]]);
		
		setTimeout(() => {
			this.semiWinners[0].socket.send(JSON.stringify({
				type: "start_match", 
				game: "final", 
				roomId: m3.id, 
				side: 0, 
				opponent: this.semiWinners[1].id 
			}));

			this.semiWinners[1].socket.send(JSON.stringify({
				type: "start_match", 
				game: "final", 
				roomId: m3.id, 
				side: 1, 
				opponent: this.semiWinners[0].id 
			}));
		}, 10 * 1000);		
		
	}

	allPlayersJoined() {
		return this.players.every(p => p.socket);
	}

	handleMessage(conn, msg) {

		console.log("Tournament", this.id, "received message:", msg);

		if (msg.type === "match_result" && msg.game && (msg.game === "r1g1" || msg.game === "r1g2")) {
			this.handleMatchResult(msg.game, msg.winner);
			conn.send(JSON.stringify({ type: "show_bracket" }));
		}
		else if (msg.type === "match_result" && msg.game && msg.game === "final") {
			console.log("Tournament", this.id, "FINAL MATCH ENDED. WINNER:", msg.winner, msg.playerId);
			this.handleMatchResult(msg.game, msg.winner);
			conn.send(JSON.stringify({ type: "show_bracket" }));
		}
		else
			console.log("TOURNAMENT ENDED!!");
	}


	broadcastResults(msg) {
		this.players.forEach(player => {
			if (player.socket) {
				player.socket.send(JSON.stringify(msg) );
			}
		});
	}
}

module.exports = { Tournament };
