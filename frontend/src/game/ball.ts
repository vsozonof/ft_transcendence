/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/28 14:28:44 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/27 15:55:56 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ? _______________
// ? createBall()
// ? -> Creates the Pong game's ball and returns it
// ? -> The ball has properties for position, velocity, radius, and color
// ? -> It also has methods to draw itself, reset its position, and update its state
// ? -> The ball handles collisions with the paddles and walls, and scoring
function createBall(ctx) {
	const ball = {
		x: ctx.canvas.width / 2,
		y: ctx.canvas.height / 2,
		radius: 10,
		color: 'white',
		
		// ? Draws the ball on the canvas
		draw() {
			ctx.fillStyle = this.color;
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
		},
	};

	return ball;
}

export { createBall };