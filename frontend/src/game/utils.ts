/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/28 14:30:51 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/09 15:40:30 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground, launchApp } from "../main";

// ? _______________
// ? createCanvas()
// ? -> Creates the canvas element for the Pong game
// ? -> Sets its dimensions and appends it to the background
function createCanvas() {
	const background = getBackground();
	background.replaceChildren();

	const canvasContainer = document.createElement("div");
	canvasContainer.className =
		"w-[800px] flex flex-col items-center gap-3";

	const header = document.createElement("div");
	header.className =
		"w-full min-h-[105px] flex items-center justify-between px-4 " +
		"rounded-xl border border-white/20 bg-white/5 backdrop-blur text-white";

	const p1 = document.createElement("div");
	p1.className = "flex items-center gap-3";
	const p1Name = document.createElement("span");
	p1Name.className = "font-semibold";
	p1Name.textContent = "Waiting..";
	const p1Img = document.createElement("img");
	p1Img.className = "h-20 w-20 rounded-full object-cover bg-white/10";
	p1Img.alt = "P1 avatar";
	p1Img.src = "./assets/pfp_placeholder.png";
	p1.append(p1Img, p1Name);

	const p2 = document.createElement("div");
	p2.className = "flex items-center gap-3";
	const p2Name = document.createElement("span");
	p2Name.className = "font-semibold";
	p2Name.textContent = "Waiting..";
	const p2Img = document.createElement("img");
	p2Img.className = "h-20 w-20 rounded-full object-cover bg-white/10";
	p2Img.alt = "P2 avatar";
	p2Img.src = "./assets/pfp_placeholder.png";
	p2.append(p2Name, p2Img);
	
	const canvas = document.createElement("canvas");
	
	canvas.width = 800;
	canvas.height = 600;
	canvas.className =
	"w-full bg-black border-4 border-white rounded-xl block";
	
	header.append(p1, p2);
	canvasContainer.appendChild(header);
	canvasContainer.appendChild(canvas);
	background.appendChild(canvasContainer);
	
	(canvas as any)._ui = { p1: { nameEl: p1Name, img: p1Img }, p2: { nameEl: p2Name, img: p2Img } };
	return canvas;
}


// ? _______________
// ? drawScore()
// ? -> Draws the current score on the canvas
// ? and updates it as the game progresses
function drawScore(ctx, score1: number, score2: number) {
	ctx.fillStyle = 'white';
	ctx.font = '48px Arial';
	ctx.textAlign = 'center';
	ctx.fillText(`${score1} - ${score2}`, ctx.canvas.width / 2, 50);
}

// ? _______________
// ? keyHandler() ✅
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
let lastMoveSent = 0;
function checkKeyPresses(keysPressed, ws: WebSocket) {

	const now = performance.now();
	if (now - lastMoveSent < 16) return;
		lastMoveSent = now;

	if ((keysPressed['s'] || keysPressed['S'])) {
		console.log("Sending move down");
		ws.send(JSON.stringify({ type: 'move', direction: 'down' }) );
	}
		
	if ((keysPressed['w'] || keysPressed['W'])) {
		console.log("Sending move up");
		ws.send(JSON.stringify({ type: 'move', direction: 'up' }) );
	}
	
	// if (keysPressed['ArrowDown'])
		// paddle2.y += paddle2.speed;

	// if (keysPressed['ArrowUp'])
		// paddle2.y -= paddle2.speed;

}

function showReadyScreen(ctx: CanvasRenderingContext2D, mode: "local" | "multiplayer" | "ai", ws: WebSocket, side: number): Promise<void> {
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
      readyP1.disabled = true;
      readyP1.textContent = '✅';
	  ws.send(JSON.stringify({ type: 'ready', side: side }) );
    };

    if (mode === 'local') {
		buttonContainer.append(readyP1);
		readyP2.onclick = () => {
       		readyP2.disabled = true;
        	readyP2.textContent = '✅';
    	};
    }
	else if (mode === "multiplayer") {
		buttonContainer.append(readyP1, readyP2);
		readyP2.disabled = true;
		readyP2.textContent = 'Opponent: ⏳ Waiting…';
	}
	else if (mode === "ai") {
		buttonContainer.append(readyP1, readyP2);
		readyP2.disabled = true;
		readyP2.textContent = '🤖 AI is always ready';

	const onMsg = (ev: MessageEvent) => {
		let msg;
		
		try { 
			msg = JSON.parse(ev.data); 
		} catch {
			return;
		}

		if (msg.type === "lobby_update") {
			if (msg.mode === "multiplayer") {
				const other = side ^ 1;
				const otherReady = !!msg.players?.[other]?.ready;
			
				if (otherReady) {
					readyP2.textContent = "Opponent: ✅ Ready";
				} else {
					readyP2.textContent = "Opponent: ⏳ Waiting…";
				}
			}
		}

		if (msg.type === "countdown") {
			title.textContent = `Starting in ${msg.secondsLeft}…`;
			if (msg.secondsLeft <= 0) {
				cleanup();
				resolve();
			}
		}
    };

    ws.addEventListener("message", onMsg);

    function cleanup() {
      ws.removeEventListener("message", onMsg);
      readyWrapper.remove();
    }

    readyWrapper.append(title, buttonContainer);
    ctx.canvas.parentElement?.appendChild(readyWrapper);

  }});
}

// ? _______________
// ? showWinScreen()
// ? -> Displays a win message when a player reaches the score limit
// ? -> Stops the game and shows the winner
// ? -> Provides buttons to play again or return to the main menu
function showWinScreen(winner: string, ctx, ws: WebSocket) {
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

	const returnButton = document.createElement('button');
	returnButton.className = `bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1`;
	returnButton.textContent = 'Return to Menu';

	returnButton.addEventListener('click', () => {
		winWrapper.remove();
		ws.close();

		const background = getBackground();
		background.innerHTML = '';

		launchApp();
	});

	buttonContainer.appendChild(returnButton);
	winWrapper.appendChild(winMessage);
	winWrapper.appendChild(buttonContainer);
	ctx.canvas.parentElement?.appendChild(winWrapper);
}

export { createCanvas, drawScore, checkKeyPresses, keyHandler, showWinScreen,
		showReadyScreen };