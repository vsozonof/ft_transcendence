/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameRoom.js                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/29 15:46:03 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 10:30:46 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const { createBall } = require('./ball.js');
const { createPaddles } = require('./paddles.js');
const { decideAction } = require('./ai.js');
const db = require('../db/db.js');

class gameRoom {

	constructor({ id, mode, onEmpty }) {
		this.id = id;
		this.mode = mode;
		this.onEmpty = onEmpty;
		this.paddleInterval = Math.round(144 / 60);
		this.paddleCounter = 0;
		this.score1 = 0;
		this.score2 = 0;
		if (mode !== "ai") {
			this.players = [
				{ side: 0, socket: null, ready: false, name: "Player 1", avatar: null },
				{ side: 1, socket: null, ready: false, name: "Player 2", avatar: null },
			];
		} else {
			this.players = [
				{ side: 0, socket: null, ready: false, name: "Player 1", avatar: null },
				{ side: 1, socket: null, ready: true, name: "LA GRANDE IA", avatar: null },
			];
			this.aiAction = { direction: "stop", stepsRemaining: 0 };
		}
	}

	join(socket, side = null ) {
		let slot = null;

		if (this.mode === "ai")
			slot = 0;
		else if (side !== null) {
			if (!this.players[side] || this.players[side].socket !== null)
				throw new Error("Invalid side chosen");
			slot = side;
		}
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

	playersList() {
		return this.players.map(p => ({
			ready: p.ready,
			name: p.name,
			avatar: p.avatar,
		}));
	}

	broadcast(msg) {
		for (const p of this.players) {
			if (p.socket) {
				try {
					p.socket.send(JSON.stringify(msg));
				} catch (err) {
					console.error("Error sending message to player:", err);
				}
			}
		}
	}

	allRequiredReady() {
		if (this.mode === "ai")
			return !!this.players[0]?.ready;
		if (this.mode === "local")
			return true;
		return this.players.every(p => !!p.ready);
	}

	startCountdown(seconds = 3) {
		return new Promise((resolve) => {
			this.paddle1.locked = true;
			this.paddle2.locked = true;
			
			let left = seconds;

			const timer = setInterval(() => {
				this.broadcast({ type: "countdown", secondsLeft: left });
				left -= 1;

				if (left < 0) {
					clearInterval(timer);
					this.paddle1.locked = false;
					this.paddle2.locked = false;
					resolve();
				}
			}, 1000);
		});
	}

	movePaddle(paddle, direction, gameHeight) {
		if (direction === "up" && (paddle.y - paddle.speed) >= 0 && !paddle.locked)
    		paddle.moveUp();
  		else if (direction === "down" && (paddle.y + paddle.height + paddle.speed) <= gameHeight && !paddle.locked)
    		paddle.moveDown();
		else
			console.log("Invalid paddle movement");
	}

	handleScore(scorer) {
		if (scorer === "p1") 
			this.score1++;
		else 
			this.score2++;

		clearInterval(this.stateTick);
		if (this.aiTick) 
			clearInterval(this.aiTick);

		this.ball.reset();
		this.paddle1.reset();
		this.paddle2.reset();

		this.broadcast({
			type: "game_state",
			p1y: this.paddle1.y,
			p2y: this.paddle2.y,
			ballx: this.ball.x,
			bally: this.ball.y,
			score1: this.score1,
			score2: this.score2,
		})

		if (this.score1 >= 3 || this.score2 >= 3) {
			this.broadcast({ type: "game_over", scores: { p1: this.score1, p2: this.score2 }, winner: scorer });
			this.addScoretoDb();
			return;
		}

		this.startCountdown(3).then(() => {
			this.ball.start();
			this.paddleCounter = 0;
			this.startRoundLoop();
		});
	}

	addScoretoDb() {
		const mode = this.mode;
		const p1_score = this.score1;
		const p2_score = this.score2;
		const p1_name = this.players[0].name;
		const p2_name = this.players[1].name;
		let winner;

		if (mode === "local")
			return ;

		const getColNames = (mode) => {
			if (mode === "ai")
				return { winCol: "wins_ai", lossCol: "losses_ai" };
			if (mode === "pvp")
				return { winCol: "wins_pvp", lossCol: "losses_pvp" };
			if (mode === "tournament")
				return { winCol: "wins_tournament", lossCol: "losses_tournament" };
			return {};
		};

		const { winCol, lossCol } = getColNames(mode);
		let p1Result;
		let p2Result;
		
		if (p1_score > p2_score) {
			p1Result = "win";
			p2Result = "loss";
		}
		else {
			p1Result = "loss";
			p2Result = "win";
		}

		if (mode === "ai") {
			const query = `
				UPDATE users
				SET ${p1Result === "win" ? winCol : lossCol} = ${p1Result === "win" ? winCol : lossCol} + 1,
					goals_scored = goals_scored + ?,
					goals_conceded = goals_conceded + ?
				WHERE username = ?
			`;
			
			db.run(query, [p1_score, p2_score, p1_name], (err) => {
				if (err)
					console.error ("Error: ", err);
				else
					console.log("Updated score of ", p1_name, " score: ", p1_score, p2_score);
			});
			
			return ;
		}
		else if (mode === "pvp" || mode === "tournament") {
			const updates = [
				{ name: p1_name, result: p1Result, scored: p1_score, conceded: p2_score },
				{ name: p2_name, result: p2Result, scored: p2_score, conceded: p1_score },
			];

			for (const { name, result, scored, conceded } of updates) {
				const query = `
					UPDATE users
					SET ${result === "win" ? winCol : lossCol} = ${result === "win" ? winCol : lossCol} + 1,
						goals_scored = goals_scored + ?,
						goals_conceded = goals_conceded + ?
					WHERE username = ?
				`;
					
				db.run(query, [scored, conceded, name], (err) => {
					if (err)
						console.error ("Error: ", err);
					else
						console.log("Updated score of ", name, " score: ", scored, conceded);
				});		
			}
		}

		console.log("Recording match:", p1_name, "vs", p2_name);
		db.all(
			`SELECT id, username
			FROM users
			WHERE username = ? OR username = ?`,
			[p1_name, p2_name],
		 	(err, rows) => {
				if (err)
					return (console.error("Error fetching user IDs: ", err));

				const player1_id = rows.find(r => r.username === p1_name).id;
				const player2_id = rows.find(r => r.username === p2_name).id;
		
				if (!player1_id || !player2_id) {
					return ;
				}

				if (p1_score > p2_score)
					winner = player1_id;
				else
					winner = player2_id;
		
				const query = `
					INSERT INTO matches (
						mode, player1_name, player2_name, player1_id, 
						player2_id, score1, 
						score2, winner
					)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				`;

				db.run(query, [mode, p1_name, p2_name, player1_id, player2_id, p1_score, p2_score, winner], (err) => {
					if (err)
						console.error ("Error: ", err);
					else
						console.log("Inserted match record for ", p1_name, " vs ", p2_name);
				});
			}
		);
	}

	async startGameLoop() {
		this.paddle1 = createPaddles().paddle1;
		this.paddle2 = createPaddles().paddle2;
		this.ball = createBall(this.paddle1, this.paddle2);
		this.ball.start();
		
		await this.startCountdown(3);
		this.startRoundLoop();
	}
	
	startRoundLoop() {
		this.stateTick = setInterval(() => {
			const scorer = this.ball.update(this.paddle1, this.paddle2);
			
			if (this.paddleCounter++ % this.paddleInterval === 0) {
				if (this.mode === "ai" && this.aiAction.stepsNeeded > 0) {
					const moveMsg = { type: "move", player: 1, direction: this.aiAction.direction };
					this.handleMessage(this.players[1].socket, moveMsg);
					this.aiAction.stepsNeeded--;
				}
			}
			
			this.broadcast({
				type: "game_state",
				p1y: this.paddle1.y,
				p2y: this.paddle2.y,
				ballx: this.ball.x,
				bally: this.ball.y,
				score1: this.score1,
				score2: this.score2,
			})

			if (scorer) {
				this.handleScore(scorer);
				return ;
			}

		}, 1000 / 144);

		if (this.mode === "ai") {
			this.aiTick = setInterval(() => {
				this.aiAction = decideAction(this.ball, this.paddle2);
			}, 1000);
		}
	}
	
	handleMessage(socket, msg) {
		if (msg.type === "ready") {
			const player = this.players.find(p => p.socket === socket);

			if (msg.username) {
				player.name = msg.username;
			}

			if (!player.ready) {
				player.ready = true;
				this.broadcast({ type: "lobby_update", mode: this.mode, players: this.playersList() });
				
				if (this.allRequiredReady()) {
					this.startGameLoop();
				}
			}
		}
		else if (msg.type === "move") {
			const player = this.players.find(p => p.socket === socket);
			if (player) {
				if (msg.player === 0)
					this.movePaddle(this.paddle1, msg.direction, 600);
				else if (msg.player === 1)
					this.movePaddle(this.paddle2, msg.direction, 600);
			}
		}
	}
}


module.exports = { gameRoom };