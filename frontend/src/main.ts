import { loginHandler } from "./views/login";
import { profileHandler } from "./views/profil";
import { createMainMenu } from "./views/mainMenu";
import { createPongGame } from "./game/pong";

const ws = new WebSocket('ws://localhost:3000/game');

ws.onopen = () => {
  console.log("Connected to WS server");
  ws.send(JSON.stringify({ type: "hello", msg: "Ping from client" }));
};

ws.onmessage = (event) => {
  const data = event.data;
  console.log("Message from server:", data);
};

ws.onerror = (err) => {
  console.log("WebSocket error:", err);
};

ws.onclose = () => {
  console.log("Disconnected from WS server");
};


const app = document.getElementById('app');
export const background = document.createElement('div');

function setupBackground() {
	background.id = 'background';
	background.className = 'fixed inset-0 bg-cover bg-center flex items-center justify-center';
	background.style.backgroundImage = "url('/assets/bg.jpg')";

	app?.appendChild(background);
}

export async function launchApp() {
	if (!app)
		return;
	console.log('Launching app...');
	setupBackground();
	if (!localStorage.getItem('token')) {
		await loginHandler();
	}

	const mainMenu = createMainMenu({
		onPlay: () => {
    		mainMenu.remove();
			const game = createPongGame();
			background.appendChild(game.canvas);
			game.initGame();
  		},
		onProfile: () => {
			mainMenu.remove();
			profileHandler();
		},
		onRankings: () => {
			mainMenu.remove();
		},
		onSettings: () => {
			mainMenu.remove();
		},
		onLogout: () => {
			localStorage.removeItem('token');
			location.reload(); // Reload the page to reset the app state
		},
	});

	background.appendChild(mainMenu);

}


document.addEventListener('DOMContentLoaded', () => {
	launchApp();
});




