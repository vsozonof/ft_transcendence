/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/28 14:30:51 by vsozonof          #+#    #+#             */
/*   Updated: 2025/08/17 16:34:32 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main";

// ? _______________
// ? createCanvas()
// ? -> Creates the canvas element for the Pong game
// ? -> Sets its dimensions and appends it to the background
function createCanvas() {
	const canvasContainer = document.createElement('div');
	canvasContainer.className = '';

	const canvas = document.createElement('canvas');
	canvas.width = 800;
	canvas.height = 600;
	canvas.className = 'bg-black border-4 border-white mx-auto block';

	canvas.style.left = '200px';
	canvasContainer.style.left = '200px';
	canvasContainer.appendChild(canvas);
	background.appendChild(canvasContainer);
	return canvas;
}

// ? _______________
// ? drawScore()
// ? -> Draws the current score on the canvas
// ? and updates it as the game progresses
function drawScore(ctx, gameState) {
	ctx.fillStyle = 'white';
	ctx.font = '48px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(`${gameState.score1} - ${gameState.score2}`, ctx.canvas.width / 2, 50);
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

// ? _______________
// ? checkKeyPresses()
// ? -> Checks for key presses to move the paddles
// ? -> Updates the paddles' positions based on the keys pressed
// ? -> Will lock paddle2 if gamemode is not 'local'
// ? -> The function will handle the AI movements aswell
function checkKeyPresses(keysPressed, paddle1, paddle2, ctx, gameState, aiAction) {
	if (!paddle1.locked && !paddle2.locked) {
		if ((keysPressed['s'] || keysPressed['S']) && paddle1.y + paddle1.height < ctx.canvas.height) 
			paddle1.y += paddle1.speed;

		if ((keysPressed['w'] || keysPressed['W']) && paddle1.y > 0)
			paddle1.y -= paddle1.speed;
		
		if (gameState.gameMode === 'local') {
			if (keysPressed['ArrowDown'] && paddle2.y + paddle2.height < ctx.canvas.height)
				paddle2.y += paddle2.speed;

			if (keysPressed['ArrowUp'] && paddle2.y > 0)
				paddle2.y -= paddle2.speed;
		}
		else if (gameState.gameMode === 'AI') {
			console.log("i pass here");
			console.log(`Steps remaining: ${aiAction.stepsRemaining}`);
			if (aiAction.stepsRemaining > 0) {
				console.log("i enter here");
				console.log(`AI is moving ${aiAction.direction} for ${aiAction.stepsRemaining} steps`);
				if (aiAction.direction === "up" && paddle2.y > 0) {
					console.log("i move up");
					paddle2.y -= paddle2.speed;
				}
				else if (aiAction.direction === "down" && paddle2.y + paddle2.height < ctx.canvas.height) {
					console.log("i move down");
					paddle2.y += paddle2.speed;
				}
				aiAction.stepsRemaining -= 1;
			}
		}
		else if (gameState.gameMode === 'multiplayer') {
			// define multiplayer controls here
			}
		}
}

function showReadyScreen(ctx, gameState): Promise<void> {
  return new Promise((resolve) => {
    const readyWrapper = document.createElement('div');
    readyWrapper.className = `
      absolute top-1/2 left-1/2 
      -translate-x-1/2 -translate-y-1/2 
      bg-white text-black rounded-lg shadow-lg
      p-6 w-80 text-center z-50
    `;

    const title = document.createElement('h2');
    title.textContent = 'Are you ready?';
    title.className = 'text-2xl font-bold mb-4';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'flex justify-center gap-4 mt-4';

    const readyP1 = document.createElement('button');
    readyP1.className = 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-32';
    readyP1.textContent = 'Ready';

    const readyP2 = document.createElement('button');
    readyP2.className = 'bg-blue-600 text-white px-4 py-2 rounded w-32 hover:bg-blue-700';
    readyP2.textContent = 'Ready';

    readyP1.onclick = () => {
      gameState.player1Ready = true;
      readyP1.disabled = true;
      readyP1.textContent = '✅';
      checkBothReady();
    };

    if (gameState.gameMode === 'local') {
      readyP2.onclick = () => {
        gameState.player2Ready = true;
        readyP2.disabled = true;
        readyP2.textContent = '✅';
        checkBothReady();
      };
    } else if (gameState.gameMode === 'AI') {
      gameState.player2Ready = true;
      readyP2.disabled = true;
      readyP2.textContent = '✅';
    } else if (gameState.gameMode === 'multiplayer') {
      readyP2.disabled = true;
      readyP2.textContent = 'Waiting for Player 2...';
    }

    buttonContainer.append(readyP1, readyP2);
    readyWrapper.append(title, buttonContainer);
    ctx.canvas.parentElement?.appendChild(readyWrapper);

    function checkBothReady() {
      if (gameState.player1Ready && gameState.player2Ready) {
        readyWrapper.remove();
        resolve();
      }
    }
  });
}


// ? _______________
// ? checkForWinner()
// ? -> Checks if either player has reached the score limit
// ? -> If so, it shows the win screen and stops the game
function checkForWinner(ctx, gameState): boolean {
	if (gameState.score1 >= gameState.scoreLimit) {
		showWinScreen('Player 1', ctx);
		return true;
	}
	if (gameState.score2 >= gameState.scoreLimit) {
		showWinScreen('Player 2', ctx);
		return true;
	}
	return false;
}

// ? _______________
// ? showWinScreen()
// ? -> Displays a win message when a player reaches the score limit
// ? -> Stops the game and shows the winner
// ? -> Provides buttons to play again or return to the main menu
function showWinScreen(winner: string, ctx) {
	const winWrapper = document.createElement('div');
	winWrapper.className = `
		absolute top-1/2 left-1/2 
		-translate-x-1/2 -translate-y-1/2 
		bg-white text-black rounded-lg shadow-lg
		p-6 w-80 text-center z-50
	`;

	const winMessage = document.createElement('h2');
	winMessage.className = 'text-2xl font-bold mb-4';
	winMessage.textContent = `${winner} wins!`;

	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'flex gap-4 justify-center mt-4';

	const restartButton = document.createElement('button');
	restartButton.className = `bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1`;
	restartButton.textContent = 'Play Again';

	const returnButton = document.createElement('button');
	returnButton.className = `bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1`;
	returnButton.textContent = 'Return to Menu';

	buttonContainer.appendChild(restartButton);
	buttonContainer.appendChild(returnButton);

	winWrapper.appendChild(winMessage);
	winWrapper.appendChild(buttonContainer);
	ctx.canvas.parentElement?.appendChild(winWrapper);

	stop();
}

export { createCanvas, drawScore, checkKeyPresses, keyHandler, checkForWinner,
		showReadyScreen };