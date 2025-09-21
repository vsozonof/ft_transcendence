/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   paddles.js                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/08/27 16:06:55 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/06 02:44:50 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ? _______________
// ? createPaddles()
// ? -> Creates the Pong game's paddles and returns them
// ? -> Both paddles have their properties and methods defined
// ? to handle drawing and movement
function createPaddles() {
	const paddleWidth = 10;
	const paddleHeight = 100;
	const paddleSpeed = 9;

	const paddle1 = {
		x: 20,
		y: 600 / 2 - paddleHeight / 2,
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		locked: false,
		
		moveUp() {
			this.y -= this.speed;
		},

		moveDown() {
			this.y += this.speed;
		},

		reset() {
			this.x = 20;
			this.y = 600 / 2 - paddleHeight / 2;
		},
	};

	const paddle2 = {
		x: 800 - 20 - paddleWidth,
		y: 600 / 2 - paddleHeight / 2,
		width: paddleWidth,
		height: paddleHeight,
		speed: paddleSpeed,
		color: 'white',
		locked: false,
		
		moveUp() {
			this.y -= this.speed;
		},

		moveDown() {
			this.y += this.speed;
		},
		
		reset() {
			this.x = 800 - 20 - paddleWidth;
			this.y = 600 / 2 - paddleHeight / 2;
		},
	};

	return { paddle1, paddle2 };
}

module.exports = { createPaddles };