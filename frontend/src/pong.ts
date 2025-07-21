/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/03 23:46:04 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/21 16:03:04 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "./main";


// ? _______________
// ? Game Modes
// ? -> Defines the game modes available for the Pong game
// ? -> 'single' for single player mode
// ? -> 'AI' for AI mode
// ? -> 'multiplayer' for multiplayer mode
// ? -> The game mode can be changed based on user selection
let gameMode: 'local' | 'AI' | 'multiplayer' = 'AI'; 
let 	score1 = 0;
let 	score2 = 0;
const 	scoreLimit = 5;

export interface PongGame {
	canvas: HTMLCanvasElement;
	start: () => void;
	stop: () => void;
}

// ? _______________
// ? createCanvas()
// ? -> Creates the canvas element for the Pong game
// ? -> Sets its dimensions and appends it to the background
function createCanvas() {
	const canvas = document.createElement('canvas');
	canvas.width = 800;
	canvas.height = 600;
	canvas.className = 'bg-black border-4 border-white mx-auto block';
	background.appendChild(canvas);
	return canvas;
}

// ? _______________
// ? createPaddles()
// ? -> Creates the Pong game's paddles and returns them
// ? -> Both paddles have their properties and methods defined
// ? to handle drawing and movement
function createPaddles(ctx) {
	const paddleWidth = 10;
	const paddleHeight = 100;
	const paddleSpeed = 2;

	const paddle1 = {
		x: 20,
		y: ctx.canvas.height / 2 - paddleHeight / 2,
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		color: 'white',
		
		draw() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		},
	};

	const paddle2 = {
		x: ctx.canvas.width - 20 - paddleWidth,
		y: ctx.canvas.height / 2 - paddleHeight / 2,
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		color: 'white',
		
		draw() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		},
	};

	return { paddle1, paddle2 };
}

// ? _______________
// ? createBall()
// ? -> Creates the Pong game's ball and returns it
// ? -> The ball has properties for position, velocity, radius, and color
// ? -> It also has methods to draw itself, reset its position, and update its state
// ? -> The ball handles collisions with the paddles and walls, and scoring
function createBall(ctx, paddle1, paddle2) {
	const ball = {
		x: ctx.canvas.width / 2,
		y: ctx.canvas.height / 2,
		vx: 1,
		vy: 1,
		radius: 10,
		color: 'white',
		
		// ? Draws the ball on the canvas
		draw() {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
		},
		
		// ? Resets the ball's position to the center of the canvas
		// ! Should add a timer to delay the ball respawn
		reset() {
			this.x = ctx.canvas.width / 2;
			this.y = ctx.canvas.height / 2;
		},

		update() {
			// ? Updates the ball's position based on its velocity
			this.x += this.vx;
			this.y += this.vy;

			// ? Handles the ball's collision with the walls
			if (this.y - this.radius <= 0) {
				this.y = this.radius;
				this.vy *= -1;
			}
			if (this.y + this.radius >= ctx.canvas.height) {
				this.y = ctx.canvas.height - this.radius;
				this.vy *= -1;
			}

			// ? Handles the ball's collision with the paddles
			const isBallApproachingPaddle1 = this.vx < 0;
			const collidesWithPaddle1 =
				this.x - this.radius <= paddle1.x + paddle1.width &&
				this.x > paddle1.x &&
				this.y + this.radius >= paddle1.y &&
				this.y - this.radius <= paddle1.y + paddle1.height;

			if (isBallApproachingPaddle1 && collidesWithPaddle1) {
				this.x = paddle1.x + paddle1.width + this.radius;
				this.vx = -this.vx;
			}

			const isBallApproachingPaddle2 = this.vx > 0;
			const collidesWithPaddle2 =
				this.x + this.radius >= paddle2.x &&
				this.x < paddle2.x + paddle2.width &&
				this.y + this.radius >= paddle2.y &&
				this.y - this.radius <= paddle2.y + paddle2.height;

			if (isBallApproachingPaddle2 && collidesWithPaddle2) {
				this.x = paddle2.x - this.radius;
				this.vx = -this.vx;
			}

			// ? Handles scoring
			if (this.x + this.radius < 0) {
				score2++;
				this.reset();
			}
			if (this.x - this.radius > ctx.canvas.width) {
				score1++;
				this.reset();
			}
		}
	};

	return ball;
}

// ? _______________
// ? drawScore()
// ? -> Draws the current score on the canvas
// ? and updates it as the game progresses
function drawScore(ctx) {
	ctx.fillStyle = 'white';
	ctx.font = '48px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(`${score1} - ${score2}`, ctx.canvas.width / 2, 50);
}

// ? _______________
// ? showWinScreen()
// ? -> Displays a win message when a player reaches the score limit
// ? -> Stops the game and shows the winner
function showWinScreen(winner: string, ctx) {
	const winMessage = document.createElement('div');
	winMessage.className = `
		text-white text-4xl font-bold
		text-center mt-10
	`;
	winMessage.textContent = `${winner} wins!`;

	ctx.canvas.insertAdjacentElement('afterend', winMessage);

	stop();
}

// ? _______________
// ? checkForWinner()
// ? -> Checks if either player has reached the score limit
// ? -> If so, it shows the win screen and stops the game
function checkForWinner(ctx): boolean {
	if (score1 >= scoreLimit) {
		showWinScreen('Player 1', ctx);
		return true;
	}
	if (score2 >= scoreLimit) {
		showWinScreen('Player 2', ctx);
		return true;
	}
	return false;
}

// ? _______________
// ? checkKeyPresses()
// ? -> Checks for key presses to move the paddles
// ? -> Updates the paddles' positions based on the keys pressed
// ? -> Will lock paddle2 if gamemode is not 'local'
function checkKeyPresses(keysPressed, paddle1, paddle2, ctx) {
	if (keysPressed['s'] && paddle1.y + paddle1.height < ctx.canvas.height)
		paddle1.y += paddle1.speed;
	
	if (keysPressed['w'] && paddle1.y > 0)
		paddle1.y -= paddle1.speed;

	if (keysPressed['ArrowDown'] && paddle2.y + paddle2.height < ctx.canvas.height && gameMode === 'local')
		paddle2.y += paddle2.speed;
	
	if (keysPressed['ArrowUp'] && paddle2.y > 0 && gameMode === 'local')
		paddle2.y -= paddle2.speed;
}

// ? _______________
// ? keyHandler()
// ? -> Handles key presses for paddle movement
function keyHandler() {
	const keysPressed: Record<string, boolean> = {};
	window.addEventListener('keyup', (event) => {
		keysPressed[event.key] = false;
	});

	window.addEventListener('keydown', (event) => {
		keysPressed[event.key] = true;
	});

	return keysPressed;
}

export function createPongGame(): PongGame {
	const canvas = createCanvas();
	
	const ctx = canvas.getContext('2d')!;
	let animationId: number;

	const { paddle1,
		paddle2 } = createPaddles(ctx);
	const ball = createBall(ctx, paddle1, paddle2);
	const keysPressed = keyHandler();

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawScore(ctx);
		paddle1.draw();
		paddle2.draw();
		ball.draw();
	}
	
	function update() {
		if	(checkForWinner(ctx))
			return;
		checkKeyPresses(keysPressed, paddle1, paddle2, ctx);
		ball.update();
		draw();
		animationId = requestAnimationFrame(update);
	}

	function start() {
		ball.reset();
		update();
	}

	function stop() {
		cancelAnimationFrame(animationId);
	}

	return {
		canvas,
		start,
		stop,
	};
}
