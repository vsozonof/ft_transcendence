	let aiAction = {
		direction: undefined as 'up' | 'down' | 'stop' | undefined,
		stepsRemaining: 0,
	}
	
	if (gameState.gameMode === 'AI') {
		setInterval(() => {
			const decision = decideAction(ball, paddle2, ctx);
			aiAction.direction = decision.direction;
			aiAction.stepsRemaining = Math.abs(decision.stepsNeeded);
			console.log(`AI decided to move: ${aiAction.direction} for ${aiAction.stepsRemaining} steps`);
		}, 1000);
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