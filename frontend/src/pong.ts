/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: vsozonof <vsozonof@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/03 23:46:04 by vsozonof          #+#    #+#             */
/*   Updated: 2025/07/18 16:06:13 by vsozonof         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { background } from "./main";

export interface PongGame {
  canvas: HTMLCanvasElement;
  start: () => void;
  stop: () => void;
}

export function createPongGame(): PongGame {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  canvas.className = 'bg-black border-4 border-white mx-auto block';
  const ctx = canvas.getContext('2d')!;
  let animationId: number;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(100, 100, 20, 20);
  }

  function update() {
    draw();
    animationId = requestAnimationFrame(update);
  }

  function start() {
    update();
  }

  function stop() {
    cancelAnimationFrame(animationId);
  }

  return {
    canvas,
    start,
    stop,
  };
}
