/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ai.ts                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/29 15:38:28 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/1
+7 16:33:24 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ? _______________
// ? decideAction()
// ? This AI will calculate the ball's trajectory every seconds due to the
// ? subject's requirements.
// ? Based on the trajectory prediction, the AI will adjust the paddle's position
// ? to intercept the ball.
// ?
// ? If the ball is moving toward the player, the AI will simply stop it's paddle.
// ? Else, the AI will calculate the ball's trajectory and determine
// ? where the AI paddle should be moved.
// ?
// ? In order to simulate key strokes, this function returns a direction, and
// ? a number of keystrokes needed to reach the optimal paddle position.
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
		return calculateBallTrajectory(gameData);
	}
	else if (gameData.ballVx < 0)
		return { direction: 'stop', stepsNeeded: 0 };
}

// ? _______________
// ? calculateBallTrajectory()
// ? This recursive function calculates the trajectory of the ball.
// ?
// ? Firstly we generate an incrementFactor that will be used in our calculs,
// ? We need this factor to be big enough to reach ONE obstacle : 
// ? Either a wall or the paddle's point line.
// ?
// ? Then we multiply the ball X and Y axis by our increment factor to determine
// ? WHERe the ball will be, we then do two different things based on the ball's
// ? new Y and X axis.
// ?
// ? -> if we detect that the ball goes throug the paddle's point line :
// ? we know exactly where the ball will hit, so we calculate the direction
// ? our paddle needs to take, and how many steps it needs to reflect the ball.
// ? A random offset is applied to the paddle movement to simulate a more realistic AI.
// ?
// ? -> if we detect that the ball goes through a wall :
// ? we calculate where exactly our ball will hit the wall, update it's velocity caused
// ? by the wall bounce, and then we call the function again with these new values.
function calculateBallTrajectory(gameData) {
	const incrementFactor = calculateIncrementFactor(gameData);
	gameData.newBallX = gameData.ballX + (gameData.ballVx * incrementFactor);
	gameData.newBallY = gameData.ballY + (gameData.ballVy * incrementFactor);

	if ((gameData.newBallY > gameData.topWall && gameData.newBallY < gameData.bottomWall) 
			&& gameData.newBallX >= gameData.paddleX) {
		
		gameData.impactY = gameData.newBallY;
		const delta = gameData.impactY - gameData.paddleCenter;
		let stepsNeeded = Math.round(delta / gameData.paddleSpeed);
		const offset = Math.floor(Math.random() * 41) - 20;
		stepsNeeded += offset;
		
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

// ? __________________
// ? calculateIncrementFactor()
// ? This function calculates an increment factor based on ball's
// ? current position.
// ?
// ? The returned increment factor is used to determine the ball's trajectory.
function calculateIncrementFactor(gameData) {
	return (gameData.paddleX - gameData.ballX) / gameData.ballVx;
}

export { decideAction };