import { loginHandler } from "./views/login";
import { profileHandler } from "./views/profil";
import { createMainMenu } from "./views/mainMenu";
import { friendsHandler } from "./views/friends";
import { matchHandler } from "./game/matchHandler";

const app = document.getElementById('app');

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
			matchHandler('ai');
  		},
		onLocalPlay: () => {
			mainMenu.remove();
			matchHandler('local');
		},
		onOnlinePlay: () => {
			mainMenu.remove();
			matchHandler('pvp');
		},
		onTournament: () => {
			mainMenu.remove();
			matchHandler('tournament');
		},
		onProfile: () => {
				mainMenu.remove();
				profileHandler();
		},
		onRankings: () => {
			mainMenu.remove();
		},
		onFriends: () => {
			mainMenu.remove();
			friendsHandler();
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




