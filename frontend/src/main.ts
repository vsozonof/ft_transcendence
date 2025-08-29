import { loginHandler } from "./views/login";
import { profileHandler } from "./views/profil";
import { createMainMenu } from "./views/mainMenu";
import { createPongGame } from "./game/pong";

// const ws = new WebSocket('ws://localhost:3000/game');

// ws.onopen = () => {
//   console.log("Connected to WS server");
//   ws.send(JSON.stringify({ type: "hello", msg: "Ping from client" }));
// };

// ws.onmessage = (event) => {
//   const data = event.data;
//   console.log("Message from server:", data);
// };

// ws.onerror = (err) => {
//   console.log("WebSocket error:", err);
// };

// ws.onclose = () => {
//   console.log("Disconnected from WS server");
// };


const app = document.getElementById('app');
// export const background = document.createElement('div');

export function getBackground(): HTMLDivElement {
  let bg = document.getElementById('background') as HTMLDivElement | null;
  if (!bg) {
    bg = document.createElement('div');
    bg.id = 'background';
    document.body.appendChild(bg);
  }
  return bg;
}

function setupBackground() {
	const bg = getBackground();
	bg.className = 'fixed inset-0 bg-cover bg-center flex items-center justify-center';
	bg.style.backgroundImage = "url('/assets/bg.jpg')";

	app?.appendChild(bg);
}

export async function launchApp() {
	if (!app)
		return;
	console.log('Launching app...');
	setupBackground();
	const background = getBackground();
	if (!localStorage.getItem('token')) {
		await loginHandler();
	}

	const mainMenu = createMainMenu({
		onPlay: () => {
    		mainMenu.remove();
			const game = createPongGame();
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
			location.reload();
		},
	});

	background.appendChild(mainMenu);

}


document.addEventListener('DOMContentLoaded', () => {
	launchApp();
});




