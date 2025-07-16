import { loginHandler } from "./views/login";
import { createMainMenu } from "./views/mainMenu";
import { startPongGame } from "./pong";


const app = document.getElementById('app');
export const background = document.createElement('div');

function setupBackground() {
	background.id = 'background';
	background.className = 'fixed inset-0 bg-cover bg-center';
	background.style.backgroundImage = "url('/assets/bg.jpg')";

	app?.appendChild(background);
}

async function launchApp() {
	if (!app)
		return;
	console.log('Launching app...');
	setupBackground();
	await loginHandler();

	const mainMenu = createMainMenu(() => {
		mainMenu.remove();
		launchApp();
	});

	background.appendChild(mainMenu);

}


document.addEventListener('DOMContentLoaded', () => {
	launchApp();
});




