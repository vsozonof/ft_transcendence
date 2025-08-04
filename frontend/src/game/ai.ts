/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ai.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/29 15:38:28 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/04 12:14:06 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ? AI works
// * TODO: Clean up the code (remove unused vars, make vars local if needed),
// * add comments, make code more readable if possible
// * Add AI difficulty levels, current level is easy
// * Hard level will be randomizing the paddle's position when reflecting the ball
// * (easy mode = always reflecting the ball in the center of the paddle)
function decideAction(ball, paddle2, ctx) {
	const gameData = {
		ballX: ball.x,
		ballY: ball.y,

		ballVx: ball.vx,
		ballVy: ball.vy,

		paddleY: paddle2.y,
		paddleX: paddle2.x - ball.radius,
		paddleCenter: paddle2.y + (paddle2.height / 2),
		paddleSpeed: paddle2.speed,
		
		topWall: ball.radius,
		bottomWall: ctx.canvas.height - ball.radius,

		newBallX: 0,
		newBallY: 0,

		impactY: 0,

		stepsNeeded: 0,
		direction: undefined as 'up' | 'down' | 'stop' | undefined,
	}

	if (gameData.ballVx > 0) {
		console.log('Ball is moving towards paddle2');
		return calculateBallTrajectory(gameData);
	}
	else if (gameData.ballVx < 0) {
		console.log('Ball is moving towards paddle1');
		return { direction: 'stop', stepsNeeded: 0 };
	}
	
}

function calculateBallTrajectory(gameData) {
	const incrementFactor = calculateIncrementFactor(gameData);
	gameData.newBallX = gameData.ballX + (gameData.ballVx * incrementFactor);
	gameData.newBallY = gameData.ballY + (gameData.ballVy * incrementFactor);

	if ((gameData.newBallY > gameData.topWall && gameData.newBallY < gameData.bottomWall) 
			&& gameData.newBallX >= gameData.paddleX) {
		
		gameData.impactY = gameData.newBallY;
		const delta = gameData.impactY - gameData.paddleCenter;
		const stepsNeeded = Math.round(delta / gameData.paddleSpeed);
		
		if (stepsNeeded > 0)
			gameData.direction = 'down';
		else if (stepsNeeded < 0)
			gameData.direction = 'up';
		else
			gameData.direction = 'stop';

		return {
			direction: gameData.direction,
			stepsNeeded: stepsNeeded,
		}
	}
	else if ((gameData.newBallY < gameData.topWall || gameData.newBallY > gameData.bottomWall) 
				&& gameData.newBallX >= gameData.paddleX) {
		let WallY;
		
		if (gameData.newBallY < gameData.topWall) {
			WallY = gameData.topWall;
		}
		else if (gameData.newBallY > gameData.bottomWall) {
			WallY = gameData.bottomWall;
		}
		
		const tToWall = (WallY - gameData.ballY) / gameData.ballVy;
		const xAtWall = gameData.ballX + (gameData.ballVx * tToWall);

		gameData.ballY = WallY;
		gameData.ballX = xAtWall;
		gameData.ballVy *= -1;

		return calculateBallTrajectory(gameData);
	}
	else
		return { direction: 'stop', stepsNeeded: 0 };
}

function calculateIncrementFactor(gameData) {
	return (gameData.paddleX - gameData.ballX) / gameData.ballVx;
}

export { decideAction };