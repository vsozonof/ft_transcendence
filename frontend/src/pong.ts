/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/03 23:46:04 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/14 02:21:13 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "./main";

export function launchGame(mode) {
	
}

export function startPongGame() {

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.className = 'bg-black mx-auto my-20 border-8 border-white items-center justify-center';
  
	return canvas;
}

export function createCanvas() {
	
}
