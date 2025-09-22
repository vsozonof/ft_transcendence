// LE BACKEND COMMENCE ICI HEHEHEHEHEHE

const fastify = require('fastify')({
	bodyLimit: 10 * 1024 * 1024
});

const {loginUser, createUser, getUserByUsername, is2faEnabled, ChangePassword, create2faqrcode, disable2fa, updateUser, majAvatar, deleteUser, verifActivity, updateActivity, addFriend } = require('./user.js');

const webSocketPlugin = require('@fastify/websocket')

const cors = require('@fastify/cors');

const db = require('./db/db.js');

const dotenv = require('dotenv');
const speakeasy = require('speakeasy');
dotenv.config({path: './src/.env'});

// ! MultiPlayer handler

const rooms = require('./game/rooms.js');

const { Tournament } = require('./game/Tournament.js');
const tournaments = new Map();

fastify.register(webSocketPlugin);
// ! -------------------
// ? Fix the trade of usernames and avatars between players for multiplayer games
// ? Fix player name on end screen
// ? Fix avatar and name on header
// ? Fix exiting queue and sending back to main menu on error or timeout
// ? Add a spinner for queue waiting
// ? DONE Do tournament logic
// ? DONE: Design tournament UI
// ? DONE: start first round of games
// ? DONE: update bracket after round 1
// ? DONE: return button
// ? DONE: start semi finals
// ? DONE: send back to tournament page after game
// ? DONE: Display the winner
// ? DONE: Give 10s before starting 1st round of tournament
// ? DONE: Same for finals (so ppl can actually see the bracket)
// ? DONE: Client will force-ready after 20s if not ready yet


// ? DONE: Do GAME profile page
// ? DONE: Design the page
// ? DONE: Fetch stats from backend
// ? DONE: Display stats
// ? DONE: Add canvas for graphs
// ? DONE: Back to main menu button in game profile page
// ? DONE: Write game results to db
// ? DONE: match history
// ? DONE: meme img when stats non clicked

// ? DONE: fix header and end screen missmatch:
// ? DONE: side 1 on header is shown on the left but should be on the right.
// ? DONE: both users are declared winner on end screen

// TODO: Invesitage this error:
// tournament.ts:40 Failed to parse WS message: SyntaxError: Unexpected token 'o', "[object Blob]" is not valid JSON
// at JSON.parse (<anonymous>)
// at ws_tournament.onmessage (tournament.ts:38:17)z
// TODO: 

// TODO: Dockerize the app


// ! fix at the end :
// ! why cant i change avatar?
// ! investigate why back and forward arrows in browser cause issues
// ! check if disconnecting during tournament is handled properly and does not block
// ! gg its over

let waitingPlayer = null; 
let tournamentQueue = [];
fastify.post("/api/queue", async (request, reply) => {
	return new Promise(async (resolve) => {
		const { mode, token } = request.body || {};
		let user;
		
		try {
			const decoded = fastify.jwt.verify(token);
			user = await getUserByUsername(decoded.username);
			if (!user) {
				return reply.send({ error: 'User not found' });
			}
		} catch (err) {
			console.error('Error verifying token:', err);
			return reply.send({ error: 'Invalid token' });
		}

		if (!["pvp", "tournament"].includes(mode))
			return reply.send({ error: "Invalid game mode" });

		if (["pvp"].includes(mode)) {
			if (!waitingPlayer) {
				const timeout = setTimeout(() => { 
					reply.send({ error: "timeout" });
					waitingPlayer = null;
					resolve();
				}, 10 * 1000);

				waitingPlayer = { reply, timeout, resolve, user };

				reply.raw.on("close", () => {
					clearTimeout(timeout);
					waitingPlayer = null;
					resolve();
				});

			} else {
				const room = rooms.create("pvp");
				clearTimeout(waitingPlayer.timeout);

				waitingPlayer.reply.send({
					roomId: room.id,
					side: 0,
					self: { username: waitingPlayer.user.username, avatar: waitingPlayer.user.avatar },
					opponent: { username: user.username, avatar: user.avatar }
				});
				waitingPlayer.resolve();

				reply.send({
					roomId: room.id,
					side: 1,
					self: { username: user.username, avatar: user.avatar },
					opponent: { username: waitingPlayer.user.username, avatar: waitingPlayer.user.avatar }
				});
				resolve();
				waitingPlayer = null;
			}
		}
		else if (["tournament"].includes(mode)) {
			if (tournamentQueue.length < 3) {
				const timeoutTournament = setTimeout(() => { 
					reply.send({ error: "timeout" });
					tournamentQueue = tournamentQueue.filter(p => p.reply !== reply);
					resolve();
				}, 60 * 1000);

				tournamentQueue.push({ reply, timeoutTournament, resolve, user });

				reply.raw.on("close", () => {
					clearTimeout(timeoutTournament);
					tournamentQueue = tournamentQueue.filter(p => p.reply !== reply);
					resolve();
				});

			} else {
				
				tournamentQueue.push({ reply, timeoutTournament: null, resolve, user });
				tournamentQueue.forEach(p => clearTimeout(p.timeoutTournament));

				const id = "t_" + Math.random().toString(36).slice(2, 10);
				const players = tournamentQueue.map((p, i) => ({
					id: i,
					username: p.user.username,
					avatar: p.user.avatar
				}));
				
				const tournament = new Tournament(id, players);
				tournaments.set(id, tournament);


				tournamentQueue.forEach((p, index) => {
					p.reply.send(JSON.stringify(({
						tournamentId: tournament.id,
						playerNumber: index,
						players,
					})));
					p.resolve();
				});

				tournamentQueue = [];
			}
		}

	});
});

fastify.post("/api/rooms", async (request, reply) => {
	const { mode } = request.body || {};
	if (!["ai", "pvp", "tournament", "local"].includes(mode))
		return reply.code(400).send({ error: "Invalid game mode" });

	const room = rooms.create(mode);
	(`Room created: ${room.id} (mode: ${room.mode})`);
  	return reply.send({ roomId: room.id, mode: room.mode });
});

fastify.register(async function (fastify) {
fastify.get("/ws/game", { websocket: true}, (conn) => {
	let joinedRoom = null;

	conn.on("message", (raw) => {
		let msg;
		
		try { 
			msg = JSON.parse(raw.toString())
		} catch (e) {
			console.error("Failed to parse message:", e); return;
		}


		if (!joinedRoom && msg.type === 'join_room' && msg.roomId) {
			const room = rooms.get(msg.roomId);
			if (!room)
				return conn.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
			const you = room.join(conn, msg.side);
			joinedRoom = room;

			conn.send(JSON.stringify({
				type: "lobby_joined",
				id: room.id,
				mode: room.mode,
				you,
				players: room.playersList(),
			}));
		}
		
		if (joinedRoom)
			joinedRoom.handleMessage(conn, msg);

		return ;
	})


	conn.on("close", () => {
		if (joinedRoom)
			joinedRoom.leave(conn.socket);
	});
});
})

fastify.register(async function (fastify) {
fastify.get("/ws/tournament", { websocket: true}, (conn) => {
	let joinedTournament =	null;

	conn.on("message", (raw) => {
		let msg;
		
		try { 
			msg = JSON.parse(raw.toString())
		} catch (e) {
			console.error("Failed to parse message:", e); return;
		}


		if (!joinedTournament && msg.type === 'join_tournament') {
			
			const tournament = tournaments.get(msg.tournamentId);
			if (!tournament)
				return conn.send(JSON.stringify({ type: 'error', message: 'Tournament not found' }));
			
			const player = tournament.players.find(p => p.id === msg.playerNumber);
			if (!player)
				return conn.send(JSON.stringify({ type: 'error', message: 'Player not found in tournament' }));
			player.socket = conn;
			joinedTournament = tournament;

			conn.send(JSON.stringify({
				type: "tournament_joined",
				tournamentId: tournament.id,
				playerNumber: player.id
			}));

			if (tournament.allPlayersJoined()) {
				tournament.startRound1();
			}
		}
		
		if (joinedTournament)
			joinedTournament.handleMessage(conn, msg);

		return ;
	})


	conn.on("close", () => {
	});
});
})

fastify.get('/api/matches/:id', async (request, reply) => {
	const { id } = request.params;
	try {
		const rows = await new Promise((resolve, reject) => {
			db.all(`
				SELECT m.*,
					u1.username AS player1_username, u1.avatar AS player1_avatar,
					u2.username AS player2_username, u2.avatar AS player2_avatar,
					uw.username AS winner_username
				FROM matches m
				JOIN users u1 ON m.player1_id = u1.id
				JOIN users u2 ON m.player2_id = u2.id
				JOIN users uw ON m.winner = uw.id
				WHERE m.player1_id = ? OR m.player2_id = ?
				ORDER BY m.played_at DESC
				LIMIT 10
			`, [id, id], (err, rows) => {
				if (err) {
					console.error('❌ Failed to fetch matches:', err.message);
					return reject(err);
				} else
					resolve(rows);
			});
		});

		reply.send({ matches: rows });
	}
	catch (err) {
		console.error('Error fetching matches:', err);
		reply.code(500).send({ error: 'Database error' });
	}
});

fastify.get('/api/stats/:username', async (request, reply) => {
	const { username } = request.params;
	return new Promise((resolve, reject) => {
		db.get(
			`SELECT
				id,
				wins_pvp, losses_pvp,
				wins_ai, losses_ai,
				wins_tournament, losses_tournament,
				goals_scored, goals_conceded
			FROM users WHERE username = ?`,
			[username],
			(err, row) => {
				if (err)
					return (reply.code(500).send({ error: 'Database error' }));
				else if (!row) {
					return (reply.code(404).send({ error: 'User not found' }));
				}
				else {
					reply.send({
						username,
						stats: {
							id: row.id,
							pvp: { wins: row.wins_pvp, losses: row.losses_pvp },
							ai: { wins: row.wins_ai, losses: row.losses_ai },
							tournament: { wins: row.wins_tournament, losses: row.losses_tournament },
							goals: { scored: row.goals_scored, conceded: row.goals_conceded }
						}
					});
					resolve(row);
				}
		});
	});
});

// ! -------------------

fastify.register(cors, {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
});

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
});

fastify.get('/api/test', async (request, reply) => {
	return { message: 'prout' };
});

fastify.get('/api/db', async (request, reply) => {
	db.run(`
  		INSERT OR IGNORE INTO users (username, email, password)
  		VALUES ('Victor', 'victor@test.com', 'prout');
	`);

	return new Promise((resolve, reject) => {
		db.all('SELECT id, username, email FROM users', (err, rows) => {
			if (err) {
				console.error('❌ Failed to fetch users:', err.message);
				reject(reply.code(500).send({ error: 'Database error' }));
			}
			else
				resolve(rows);
    	});
	});
});


fastify.post('/api/register', async (request, reply) => {
	const { mail, username,  password, verifPassword } = request.body;

	if (password !== verifPassword) {
		console.log('Passwords do not match');
		reply.code(401).send({ error: 'Passwords do not match' });
	}
	else if (password.length < 6) {
		console.log('Password must be at least 6 characters long');
		reply.code(401).send({ error: 'Password must be at least 6 characters long' });
	}
	else if (username.length < 3) {
		console.log('Username must be at least 3 characters long');
		reply.code(401).send({ error: 'Username must be at least 3 characters long' });
	}
	else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
		console.log('Invalid email format');
		reply.code(401).send({ error: 'Invalid email format' });
	}
	else {
		try {
			await createUser(mail, password, username);
			console.log('User created successfully');
			reply.send({ message: 'User created successfully' });
		} catch (err) {
			console.error('Error creating user:', err);
			reply.code(500).send({ error: err.message });
		}
	}
})

fastify.post('/api/login', async (request, reply) => {
	const {username, password} = request.body;
	console.log(' received data:', { username, password });
	if (await loginUser(username, password) == true)
	{
		const user = await getUserByUsername(username);
		const token = fastify.jwt.sign({ id: user.id, username: user.username });
		console.log('Login successful');
		reply.send({ token });
	}
	else
		reply.code(401).send({'error': 'Invalid credentials'});
})

fastify.post('/api/changePassword', async (request, reply) => {
	const { oldPassword, newPassword, confirmPassword } = request.body;
	const token = request.headers.authorization?.split(' ')[1];
	if (!token)
		return reply.code(401).send({ error: 'Token is required' });
	const decoded = fastify.jwt.verify(token);
	const user = await getUserByUsername(decoded.username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	try {
		await ChangePassword(user.id, oldPassword, newPassword, confirmPassword);
		reply.send({ message: 'Password changed successfully' });
	} catch (error) {
		reply.code(401).send({ error: 'Invalid old password or new passwords do not match' });
	}
});

fastify.get('/api/getUser', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		reply.send({ id: user.id, username: user.username, email: user.email});
	} catch (err) {
		console.error('Error verifying token:', err);
		reply.code(401).send({ error: 'Invalid token' });
	}
});

fastify.post('/api/getUserByUsername', async (request, reply) => {
	const { username } = request.body;
	console.log('Received request to get user by username:', username);
	if (!username) {
		return reply.code(400).send({ error: 'Username is required' });
	}
	const user = await getUserByUsername(username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	reply.send({ id: user.id, username: user.username, email: user.email, is2fa: user.is2fa });
});

fastify.get('/api/getUserByToken', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		reply.send({ id: user.id, username: user.username, email: user.email, is2fa: user.is2fa, avatar: user.avatar });
	} catch (err) {
		console.error('Error verifying token:', err);
		reply.code(401).send({ error: 'Invalid token' });
	}
});

fastify.get('/api/isit2fa', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		console.log('Verifying token:', token);
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		let is2fa = await is2faEnabled(user.username);
		console.log('2FA status:', is2fa);
		reply.send({ is2fa });
	}catch (err) {
		console.error('Error verifying token:', err);
		reply.code(401).send({ error: 'Invalid token' });
	}
});

fastify.get('/api/create2faqrcode', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		if (user.is2fa) {
			return reply.code(400).send({ error: '2FA is already enabled' });
		}
		const qrcode = await create2faqrcode(user.username);
		console.log('2FA QR code created for user:', user.username);
		reply.send({ qrcode });
	} catch (err) {
		console.error('Error creating 2FA QR code:', err);
		reply.code(500).send({ error: 'Failed to create 2FA QR code' });
	}
});

fastify.post('/api/activation-2fa', async (request, reply) => {
	const { OTP } = request.body;
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		console.log('Received OTP:', OTP);
		console.log('user secret2fa:', user.secret2fa);
		const isValid = speakeasy.totp.verify({
			secret: user.secret2fa,
			encoding: 'base32',
			token: OTP,
			window: 1 // Allow a small time window for clock drift
		});
		console.log('2FA verification result:', isValid);
		if (isValid) {
		{
			console.log('2FA verification successful for user:', user.username);
			reply.send({ message: '2FA verification successful' });
			db.serialize(() => {
				db.run(`UPDATE users SET is2fa = 1 WHERE id = ?`, [user.id], (err) => {
					if (err) {
						console.error('Error updating user 2FA status:', err.message);
					} else {
						console.log('User 2FA status updated successfully');
					}
				});
			});
			return;
		}
		} else {
			reply.code(401).send({ error: 'Invalid OTP' });
		}
	}
	catch (err) {
		console.error('Error during 2FA activation:', err);
		reply.code(500).send({ error: 'Failed to activate 2FA' });
	}
});

fastify.post('/api/disable2fa' , async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	const key = request.body.key;
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	const user = await getUserByUsername(fastify.jwt.verify(token).username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	try {
		await disable2fa(user, key);
		reply.send({ message: '2FA disabled successfully' });
	} catch (err) {
		reply.code(500).send({ error: 'Failed to disable 2FA' });
	}
});

fastify.post('/api/tfaLogin', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	const { key } = request.body;
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		const user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		const isValid = speakeasy.totp.verify({
			secret: user.secret2fa,
			encoding: 'base32',
			token: key,
			window: 1
		});
		if (isValid) {
			console.log('2FA login successful for user:', user.username);
			updateActivity(user);
			reply.send({ message: '2FA login successful' });
		} else {
			reply.code(401).send({ error: 'Invalid 2FA key' });
		}
	} catch (err) {
		console.error('Error during 2FA login:', err);
		reply.code(500).send({ error: 'Failed to login with 2FA' });
	}
});

fastify.post('/api/updateUser', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	const { username, email } = request.body;
	try {
		const decoded = fastify.jwt.verify(token);
		let user = await getUserByUsername(decoded.username);
		if (!user) {
			return reply.code(404).send({ error: 'User not found' });
		}
		await updateUser(user.id, { username, email });
		console.log('Updating user:', user.username);
		user = getUserByUsername(user.username);
		reply.send({ user});
	} catch (err) {
		console.error('Error updating user:', err);
		reply.code(500).send({ error: err.message });
	}

});

fastify.post('/api/uploadAvatar', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	const avatar = request.body.avatar;
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	try {
		const decoded = fastify.jwt.verify(token);
		await majAvatar(decoded.id, avatar);
		reply.send({ message: 'Avatar updated successfully' });
	}
	catch (err){
		console.log('Error updating avatar:', err);
		reply.code(500).send({ error: 'Failed to update avatar' });
	}

});

fastify.post('/api/deleteAccount', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	const user = await getUserByUsername(fastify.jwt.verify(token).username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	try {
		await deleteUser(user.id);
		reply.send({ message: 'Account deleted successfully' });
	} catch (err) {
		console.error('Error deleting account:', err);
		reply.code(500).send({ error: 'Failed to delete account' });
	}
});

fastify.get('/api/verifActivity', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	const user = await getUserByUsername(fastify.jwt.verify(token).username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	const isActive = await verifActivity(user);
	if (isActive) {
		await updateActivity(user);
		reply.send({ message: 'User is active' });
	} else {
		reply.code(500).send({ message: 'User is inactive' });
	}
});

fastify.post('/api/updateActivity', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	console.log('Token received for activity update:', token);
	if (!token) {
		return reply.code(401).send({ error: 'Token is required' });
	}
	const user = await getUserByUsername(fastify.jwt.verify(token).username);
	if (!user) {
		return reply.code(404).send({ error: 'User not found' });
	}
	try {
		await updateActivity(user);
		reply.send({ message: 'Activity updated successfully' });
	} catch (err) {
		console.error('Error updating activity:', err);
		reply.code(500).send({ error: 'Failed to update activity' });
	}
});

fastify.post('/api/addfriend', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	const { friendName } = request.body;
	if (!token)
		return reply.code(401).send({ error: 'Token is required' });
	const user = await getUserByUsername(fastify.jwt.verify(token).username);
	if (!user)
		return reply.code(404).send({ error: 'User not found' });
	try {
		await addFriend(user.id, friendName);
		reply.send({ message: 'Friend added successfully' });
	} catch (err) {
		console.error('Error adding friend:', err);
		reply.code(500).send({ error: 'Failed to add friend' });
	}
});

fastify.get('/api/getFriends', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	if (!token)
		return reply.code(401).send({ error: 'Token is required' });
	const user = await getUserByUsername(fastify.jwt.verify(token).username);

	let friends = [];
	if (!user && !user.friend_list)
		return reply.code(404).send({ error: 'User not found' });
	try {
		let friend;
		let friends_list = [];
		friends_list = await JSON.parse(user.friend_list);
		for (let i = 0; i < friends_list.length; i++) {
			friend = await getUserByUsername(friends_list[i]);
			if (friend)
			{
				const time = Date.now()
				console.log('Friend found:', friend.username);
				friend.isOnline = time - lastActivity <= 5 * 60 * 1000 ? true : false;
				friends.push(friend);
			}
			else
				console.error('Friend not found:', friends_list[i]);
		}
	}
	catch (err) {
		console.error('Error fetching friends:', err);
		return reply.code(500).send({ error: 'Failed to fetch friends' });
	}
	reply.send(friends);
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	else {
		console.log('Backend started on port 3000');
	}
});


module.exports = { rooms};