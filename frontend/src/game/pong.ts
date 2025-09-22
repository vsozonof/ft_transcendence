/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/03 23:46:04 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 04:15:27 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { createPaddles } from "./paddles";
import { createBall } from "./ball";
import { 	createCanvas, 
			drawScore, 
			checkKeyPresses, 
			keyHandler, 
			showWinScreen, showReadyScreen } from "./utils";


export function pongSessionHandler(lobbyKey, ws) {
	
	const renderer = createPongRenderer();
	const keysPressed = keyHandler();

	if (lobbyKey.mode === 'local') {
		lobbyKey.username2 = "Guest";
		lobbyKey.avatar2 = "../assets/default.png";
	}
	else if (lobbyKey.mode === 'ai') {
		lobbyKey.username2 = "Moulinette";
		lobbyKey.avatar2 = "../assets/moulinette.png";
	}
	
	const latestState = {
		p1y: 250,
		p2y: 250,
		ballx: 400,
		bally: 300,
		countDown: 0,
		score1: 0,
		score2: 0,
		animationId: 0,
	};

	async function start() {
		renderer.setupCanvas();
		renderer.setupHeader(lobbyKey.mode, lobbyKey.username1, lobbyKey.avatar1, lobbyKey.username2, lobbyKey.avatar2, lobbyKey.player);
		await showReadyScreen(renderer.returnCtx(), lobbyKey.mode, ws, lobbyKey.player, lobbyKey);
		gameLoop();
	}

	ws.onmessage = (message: any) => {
		const data = JSON.parse(message.data);
		if (data.type === 'game_state') {
			latestState.p1y = data.p1y;
			latestState.p2y = data.p2y;
			latestState.ballx = data.ballx;
			latestState.bally = data.bally;
			latestState.score1 = data.score1;
			latestState.score2 = data.score2;
		}
		else if (data.type === 'countdown')
			latestState.countDown = data.secondsLeft;
		else if (data.type === 'game_over') {
			latestState.score1 = data.scores.p1;
			latestState.score2 = data.scores.p2;
			
			renderer.update(latestState.p1y,
				latestState.p2y,
				latestState.ballx,
				latestState.bally,
				latestState.countDown,
				latestState.score1,
				latestState.score2);
				
			cancelAnimationFrame(latestState.animationId);
			showWinScreen(data.winner, renderer.returnCtx(), ws, lobbyKey);
		}
	};

	function gameLoop() {
		checkKeyPresses(keysPressed, ws, lobbyKey.mode, lobbyKey.player);
		renderer.update(latestState.p1y,
						latestState.p2y,
						latestState.ballx,
						latestState.bally,
						latestState.countDown,
						latestState.score1,
						latestState.score2);
		latestState.animationId = requestAnimationFrame(gameLoop);		
	}
	 
	start();
}

// ? _______________
// ? createPongGame()
// ? -> Initializes the Pong game's canvas, paddles logic and ball logic
// ? -> Returns an object with methods to start, stop, and restart the game
export function createPongRenderer() {
	
	const state = {
		canvas: null as HTMLCanvasElement | null,
		ctx: null as CanvasRenderingContext2D | null,
		ui: null as any,
		paddles: null as { p1: any; p2: any } | null,
		ball: null as any,
		animationId: 0,
		countDown: 0,
		score1: 0,
		score2: 0,
	};
	
	function setupCanvas() {
		state.canvas = createCanvas();
		state.ui = (state.canvas as any)._ui;
		state.ctx = state.canvas.getContext('2d')!;

		const { paddle1, paddle2 } = createPaddles(state.ctx);
		state.paddles = { p1: paddle1, p2: paddle2 };
		state.ball = createBall(state.ctx);

		draw();
	}

	function setupHeader(mode: string, name1: string, img1: string, name2: string | null, img2: string | null, player: number) {
		
		if (player === 0) {
			state.ui.p1.name.textContent = name1;
			state.ui.p1.img.src = img1;

			state.ui.p2.name.textContent = name2;
			state.ui.p2.img.src = img2;
		} else {
			state.ui.p1.name.textContent = name2;
			state.ui.p1.img.src = img2;

			state.ui.p2.name.textContent = name1;
			state.ui.p2.img.src = img1;
		}
	}

	// ? _________________
	// ? draw()
	// ? -> Clears the canvas and redraws the paddles, ball, and score
	// ? -> This function is called in the update() loop to refresh the game state
	function draw() {
		state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
		
		drawScore(state.ctx, state.score1, state.score2);
		state.paddles.p1.draw();
		state.paddles.p2.draw();
		state.ball.draw();

		if (state.countDown > 0) {
			drawCountdown(state.countDown);
			return;
		}
	}

	function drawCountdown(n: number) {
		state.ctx.fillStyle = "white";
		state.ctx.font = "80px Arial";
		state.ctx.textAlign = "center";
		state.ctx.fillText(n.toString(), state.canvas.width / 2, state.canvas.height / 2 - 50);
	}

	
	function update(p1y: number, p2y: number, ballx: number, bally: number, countDown: number, score1: number, score2: number) {
		state.paddles.p1.y = p1y;
		state.paddles.p2.y = p2y;
		state.ball.x = ballx;
		state.ball.y = bally;
		state.countDown = countDown;
		state.score1 = score1;
		state.score2 = score2;
		draw();
	}

	function returnCtx() {
		return state.ctx;
	}

	return {
		setupCanvas,
		returnCtx,
		update,
		drawCountdown,
		setupHeader,
	};
}
