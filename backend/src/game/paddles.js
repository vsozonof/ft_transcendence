/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddles.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/27 16:06:55 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/27 16:06:56 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
		locked: false,
		
		draw() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		},

		reset() {
			this.x = 20;
			this.y = ctx.canvas.height / 2 - paddleHeight / 2;
		},
	};

	const paddle2 = {
		x: ctx.canvas.width - 20 - paddleWidth,
		y: ctx.canvas.height / 2 - paddleHeight / 2,
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		color: 'white',
		locked: false,
		
		draw() {
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		},

		reset() {
			this.x = ctx.canvas.width - 20 - paddleWidth;
			this.y = ctx.canvas.height / 2 - paddleHeight / 2;
		},
	};

	return { paddle1, paddle2 };
}