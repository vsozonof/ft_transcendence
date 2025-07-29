/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/03 23:46:04 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/29 14:38:48 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main";
import { createPaddles } from "./paddles";
import { createBall } from "./ball";
import { 	createCanvas, 
			drawScore, 
			checkKeyPresses, 
			keyHandler, 
			checkForWinner, showReadyScreen } from "./utils";

export interface PongGame {
	canvas: HTMLCanvasElement;
	initGame: () => void;
}


// ? _______________
// ? createPongGame()
// ? -> Initializes the Pong game's canvas, paddles logic and ball logic
// ? -> Returns an object with methods to start, stop, and restart the game
export function createPongGame(): PongGame {
	const canvas = createCanvas();
	
	const ctx = canvas.getContext('2d')!;
	let animationId: number;

	const gameState = {
		score1: 0,
		score2: 0,
		scoreLimit: 5,
		gameMode: 'local' as 'local' | 'AI' | 'multiplayer',
		player1Ready: false,
		player2Ready: false,
	};

	
	const { paddle1,
			paddle2 } 		= createPaddles(ctx);
	const 	ball 			= createBall(ctx, paddle1, paddle2, gameState, onScore);
	const 	keysPressed 	= keyHandler();
	
	
	// ? _________________
	// ? draw()
	// ? -> Clears the canvas and redraws the paddles, ball, and score
	// ? -> This function is called in the update() loop to refresh the game state
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawScore(ctx, gameState);
		paddle1.draw();
		paddle2.draw();
		ball.draw();
	}
	
	// ? _________________
	// ? startCountdown()
	// ? -> Displays a countdown before the game starts or after a score
	// ? -> if flag is true, will start the update() loop
	// ? -> if flag is false, will start the ball movement
	function startCountdown(flag) {
		let count = 3;

		const countdown = document.createElement('div');
		countdown.className = `
			absolute top-1/3 left-1/2 
			-translate-x-1/2 -translate-y-1/2 
			text-white text-6xl font-bold z-50
		`;
		countdown.textContent = count.toString();
		ctx.canvas.parentElement?.appendChild(countdown);

		const interval = setInterval(() => {
			count--;
			if (count > 0) {
				countdown.textContent = count.toString();
			} else {
				clearInterval(interval);
				countdown.remove();
				if (flag)
					update();
				else {
					paddle1.locked = false;
					paddle2.locked = false;
					ball.start();
				}
			}
		}, 1000);
	}

	async function initGame() {
		await showReadyScreen(ctx, gameState);
		startCountdown(1);
	}

	function onScore() {
		ball.reset();
		paddle1.reset();
		paddle2.reset();
		paddle1.locked = true;
		paddle2.locked = true;
		startCountdown(0);
	}

	function update() {
		if	(checkForWinner(ctx, gameState))
			return;
		checkKeyPresses(keysPressed, paddle1, paddle2, ctx, gameState);
		ball.update();
		draw();
		animationId = requestAnimationFrame(update);
	}

	return {
		canvas,
		initGame,
	};
}
