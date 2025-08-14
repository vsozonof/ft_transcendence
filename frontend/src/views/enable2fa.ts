/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   enable2fa.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: rostrub <rostrub@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/31 11:27:53 by rostrub           #+#    #+#             */
/*   Updated: 2025/08/11 13:20:21 by rostrub          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "../main"

import { profileHandler } from "./profil"

export async function enable2faHandler(): Promise<void> {
	const token = localStorage.getItem('token');
	if (!token) {
		alert("Token manquant, veuillez vous reconnecter.");
		return;
	}
		const enable2faWrapper = document.createElement('div');
		enable2faWrapper.className = `
			h-screen w-screen
			flex items-center justify-center
		`;

		const enable2faPrompt = document.createElement('div');
		enable2faPrompt.id = 'enable2faPrompt';

		enable2faPrompt.className = `
			relative
			bg-white p-8 rounded-lg shadow-md w-80
			flex flex-col items-center gap-4
		`;

		const title = document.createElement('h2');
		title.textContent = 'Enable 2FA';
		title.className = 'text-xl font-bold mb-4';

		const infoText = document.createElement('p');
		infoText.textContent = 'Scan the QR code with your authenticator app to enable 2FA.';

		const coderes = await fetch('http://127.0.0.1:3000/create2faqrcode', {
			headers: { Authorization: `Bearer ${token}` }
	});
	let code = null;
	if (coderes.ok)
	{
		const bruh = await coderes.json();
		code = bruh.qrcode;
	} else {
		alert('Erreur lors de la récupération du QR code ❌');
		// background.removeChild(enable2faWrapper);
		await profileHandler();
		return;
	}

		const qrCodeImage = document.createElement('img');
		qrCodeImage.src = code.qrcode;
		qrCodeImage.alt = 'QR Code for 2FA';
		qrCodeImage.className = 'w-64 h-64 mb-4';

		const qrCodeUrl = document.createElement('a');
		qrCodeUrl.textContent = code.url;
		qrCodeUrl.target = '_blank';
		qrCodeUrl.className = 'hover:underline mb-3 truncate max-w-xs block';

		const inputOTP = document.createElement('input');
		inputOTP.type = 'text';
		inputOTP.placeholder = 'Code à 6 chiffres';
		inputOTP.className = 'border px-3 py-2 rounded w-full mb-2 text-center';

		const confirmButton = document.createElement('button');
		confirmButton.textContent = 'Confirm';
		confirmButton.className = `
			bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors
		`;

		const backButton = document.createElement('button');
		backButton.textContent = 'Retour';
		backButton.className = `
			bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-800 transition-colors
		`;

		enable2faPrompt.appendChild(title);
		enable2faPrompt.appendChild(infoText);
		enable2faPrompt.appendChild(qrCodeImage);
		enable2faPrompt.appendChild(qrCodeUrl);
		enable2faPrompt.appendChild(inputOTP);
		enable2faWrapper.appendChild(enable2faPrompt);

		enable2faPrompt.appendChild(confirmButton);
		enable2faPrompt.appendChild(backButton);

		background.appendChild(enable2faWrapper);

confirmButton.addEventListener('click', async () => {
	const token = localStorage.getItem('token');
	const OTP = inputOTP.value;
	console.log('OTP entered:', OTP);
	if (!token) {
		alert("Non connecté");
		return;
	}

	const res = await fetch('http://localhost:3000/activation-2fa', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify({ OTP })
	});

	if (res.ok) {
		alert('2FA activé avec succès ✅');
		background.removeChild(enable2faWrapper);
		await profileHandler();
	} else {
		alert('Code invalide ❌');
	}
});

backButton.addEventListener('click', async () => {
	background.removeChild(enable2faWrapper);
	await profileHandler();
});

}

