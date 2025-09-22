/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameProfile.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/18 15:05:09 by vsozonof          #+#    #+#             */
/*   Updated: 2025/09/22 14:21:10 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getBackground } from "../main";
import { launchApp } from "../main";
import imgPfp from '../assets/pic.jpg';

import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, PieController);

export async function gameProfile(){
	const background = getBackground();

	const profileWrapper = document.createElement('div');
	profileWrapper.className = `
		flex items-center justify-center
		w-full h-screen
	`;

	const profileContainer = document.createElement('div');
	profileContainer.className = `
		bg-white rounded-lg shadow-lg
		h-[800px] w-[1000px] 
		p-6 flex flex-col
	`;

	const title = document.createElement('h2');
	title.textContent = 'Game Profile';
	title.className = 'text-3xl font-bold mb-4 text-center';

	const tabContainer = document.createElement('div');
	tabContainer.className = `
		flex gap-4 mb-4 justify-center
	`;

	const statsTab = document.createElement('button');
	statsTab.textContent = 'Game Stats';
	statsTab.className = `
		px-4 py-2 bg-blue-600 text-white rounded-md
		hover:bg-blue-700 transition-colors
	`;

	const historyTab = document.createElement('button');
	historyTab.textContent = 'Match History';
	historyTab.className = `
		px-4 py-2 bg-gray-200 rounded-md
		hover:bg-gray-300 transition-colors
	`;

	const contentArea = document.createElement('div');
	contentArea.className = `
		grid grid-cols-3 gap-6 p-4
 		bg-gray-100 rounded-md
 		overflow-y-auto
	`;
	contentArea.textContent = '';
	const img = document.createElement("img");
	img.src = imgPfp;
	img.className = "col-span-3 mx-auto mt-10 opacity-50 max-w-[300px] max-h-[300px]";
	contentArea.appendChild(img);

	const backBtn = document.createElement("button");
	backBtn.textContent = "Return to Main Menu";
	backBtn.className = `
		mt-4 bg-red-600 text-white py-2 px-4 rounded-md
		hover:bg-red-700 transition-colors self-center
	`;
	backBtn.onclick = () => {
		background.removeChild(profileWrapper);
		launchApp();
	};
	
	statsTab.onclick = (async () => {
		statsTab.className = `
			px-4 py-2 bg-blue-700 text-white rounded-md
			hover:bg-blue-800 transition-colors
		`;
		historyTab.className = `
			px-4 py-2 bg-gray-200 rounded-md
			hover:bg-gray-300 transition-colors
		`;
		contentArea.textContent = 'Loading game statistics...';

		try {
			const username = localStorage.getItem('username');
			const res = await fetch(`/api/stats/${username}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			if (!res.ok)
				throw new Error('Failed to fetch stats');

			const data = await res.json();
			contentArea.innerHTML = "";

			function makePieChart(canvasId: string, labels: string[], values: number[], colors: string[]) {
				const ctx = (document.getElementById(canvasId) as HTMLCanvasElement).getContext("2d");
				if (!ctx) return;
				new Chart(ctx, {
					type: "pie",
					data: {
						labels,
						datasets: [
							{
								data: values,
								backgroundColor: colors,
							},
						],
					},
					options: {
						responsive: true,
						plugins: {
							legend: { position: "bottom" },
						},
					},
			});
		}
			function createChartBlock(label: string, id: string) {
				const block = document.createElement("div");
				block.className = "mb-6 flex flex-col items-center";

				const heading = document.createElement("h4");
				heading.textContent = label;
				heading.className = "mb-2 font-semibold";

				const canvas = document.createElement("canvas");
				canvas.id = id;
				canvas.className = "max-w-[200px] max-h-[200px]";

				block.appendChild(heading);
				block.appendChild(canvas);
				contentArea.appendChild(block);

				return canvas;
			}
			
			const canvasAI = createChartBlock("AI: Wins vs Losses", "chartAI");
			const canvasPVP = createChartBlock("PvP: Wins vs Losses", "chartPVP");
			const canvasTournament = createChartBlock("Tournament: Wins vs Losses", "chartTournament");
			const canvasGlobal = createChartBlock("Overall: Wins vs Losses", "chartGlobal");
			const canvasGoals = createChartBlock("Goals Scored vs Conceded", "chartGoals");

			makePieChart("chartAI", ["Wins", "Losses"], [data.stats.ai.wins, data.stats.ai.losses], ["#4ade80", "#f87171"]);
			makePieChart("chartPVP", ["Wins", "Losses"], [data.stats.pvp.wins, data.stats.pvp.losses], ["#60a5fa", "#fbbf24"]);
			makePieChart("chartTournament", ["Wins", "Losses"], [data.stats.tournament.wins, data.stats.tournament.losses], ["#a78bfa", "#f87171"]);

			const totalWins = data.stats.pvp.wins + data.stats.ai.wins + data.stats.tournament.wins;
			const totalLosses = data.stats.pvp.losses + data.stats.ai.losses + data.stats.tournament.losses;
			makePieChart("chartGlobal", ["Wins", "Losses"], [totalWins, totalLosses], ["#34d399", "#f87171"]);

			makePieChart("chartGoals", ["Scored", "Conceded"], [data.stats.goals.scored, data.stats.goals.conceded], ["#3b82f6", "#f43f5e"]);

			
		} catch (error) {
			console.error(error);
			contentArea.textContent = 'Error loading statistics.';
		}
	});

	historyTab.onclick = (async () => {
		historyTab.className = `
			px-4 py-2 bg-blue-700 text-white rounded-md	
			hover:bg-blue-800 transition-colors
		`;
		statsTab.className = `
			px-4 py-2 bg-gray-200 rounded-md
			hover:bg-gray-300 transition-colors
		`;
		contentArea.textContent = 'Match history will be displayed here.';

		try {
			const username = localStorage.getItem('username');
			const res = await fetch(`/api/stats/${username}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			if (!res.ok)
				throw new Error('Failed to fetch stats');

			const data = await res.json();
			contentArea.innerHTML = "";

			const userId = data.stats.id;

			const matchesRes = await fetch(`/api/matches/${userId}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			const { matches } = await matchesRes.json();


			if (!matches.length) {
				contentArea.textContent = 'No match history available.';
				return;
			}

			contentArea.innerHTML = "";

			matches.forEach(match => {
				const isWinner = (match.winner === userId);
				let winnerName;

				if (match.winner === match.player1_id)
					winnerName = match.player1_name;
				else if (match.winner === match.player2_id)
					winnerName = match.player2_name;
				
				const card = document.createElement("div");
				card.className = `
					p-3 rounded-md mb-3 text-white
					${isWinner ? "bg-green-600" : "bg-red-600"}
				`;

				const dateEl = document.createElement("div");
				dateEl.className = "font-semibold";
				dateEl.textContent = `${new Date(match.played_at).toLocaleString()} – ${match.mode.toUpperCase()}`;

				const playersEl = document.createElement("div");
				playersEl.textContent = `${match.player1_name} (${match.score1}) vs ${match.player2_name} (${match.score2})`;

				const winnerEl = document.createElement("div");
				winnerEl.className = "italic";
				winnerEl.textContent = `Winner: ${winnerName}`;

				card.appendChild(dateEl);
				card.appendChild(playersEl);
				card.appendChild(winnerEl);

				contentArea.appendChild(card);
			});
		}
		catch (error) {
			console.error(error);
			contentArea.textContent = 'Error loading match history.';
		}
	});

	tabContainer.appendChild(statsTab);
	tabContainer.appendChild(historyTab);
	profileContainer.appendChild(title);
	profileContainer.appendChild(tabContainer);
	profileContainer.appendChild(contentArea);
	profileContainer.appendChild(backBtn);
	profileWrapper.appendChild(profileContainer);
	background.appendChild(profileWrapper);
}