/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/28 14:28:44 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/28 14:29:01 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ? _______________
// ? createBall()
// ? -> Creates the Pong game's ball and returns it
// ? -> The ball has properties for position, velocity, radius, and color
// ? -> It also has methods to draw itself, reset its position, and update its state
// ? -> The ball handles collisions with the paddles and walls, and scoring
function createBall(ctx, paddle1, paddle2, gameState) {
	const ball = {
		x: ctx.canvas.width / 2,
		y: ctx.canvas.height / 2,
		vx: 0.5,
		vy: 0.5,
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
				gameState.score2++;
				this.reset();
			}
			if (this.x - this.radius > ctx.canvas.width) {
				gameState.score1++;
				this.reset();
			}
		}
	};

	return ball;
}

export { createBall };