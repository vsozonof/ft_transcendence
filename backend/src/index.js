// LE BACKEND COMMENCE ICI HEHEHEHEHEHE

const Fastify = require('fastify');

const {loginUser, createUser, getUserByUsername, is2faEnabled, ChangePassword, create2faqrcode, disable2fa } = require('./user.js');

const fastify = Fastify();
// const webSocketPlugin = require('@fastify/websocket')

const cors = require('@fastify/cors');

const db = require('./db/db.js');

const dotenv = require('dotenv');
const speakeasy = require('speakeasy');
dotenv.config();

// // ! MultiPlayer handler

// const { roomHandler } = require('./game/roomHandler.js');
// const rooms = new roomHandler();

// fastify.register(webSocketPlugin);

// fastify.post("/rooms", async (request, reply) => {
// 	const { mode } = request.body || {};
// 	if (!["ai", "pvp", "tournament"].includes(mode))
// 		return reply.code(400).send({ error: "Invalid game mode" });

// 	const room = rooms.create(mode);
//   	return reply.send({ roomId: room.id, mode: room.mode });
// });

// fastify.get("/game", { websocket: true}, (conn) => {
// 	let joinedRoom = null;

// 	conn.on("message", (raw) => {
// 		let msg;
// 		try { msg = JSON.parse(raw.toString())}
// 		catch (e) { console.error("Failed to parse message:", e); return; }

// 		if (!joinedRoom && msg.type === 'join_room' && msg.roomId) {
// 			const room = rooms.get(msg.roomId);
// 			if (!room)
// 				return conn.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
// 			const you = room.join(conn);
// 			joinedRoom = room;
			
// 			conn.send(JSON.stringify({
// 				type: "lobby_update",
// 				you,
// 				mode: room.mode,
// 				// players: room.playersList(),
// 			}));
// 		}

// 		return ;
// 	})

// 	if (joinedRoom) joinedRoom.handleMessage(conn, msg);
	
// 	conn.on("close", () => {
// 	  if (joinedRoom) joinedRoom.leave(conn.socket);
// 	});
// });



// // ! -------------------

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


fastify.post('/register', async (request, reply) => {
	const { mail, username,  password, verifPassword } = request.body;

	console.log(' received data:', { username, mail, password, verifPassword});
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
	else if (!mail.includes('@') || !mail.includes('.')) {
		console.log('Invalid email format');
		reply.code(401).send({ error: 'Invalid email format' });
	}
	else {
		try {
			await createUser(mail, password, username);
			console.log('User created successfully');
			reply.send({ message: 'User created successfully' });
		} catch (error) {
			console.error('Error creating user:', error);
			reply.code(500).send({ error: 'Failed to create user' });
		}
	}

})

fastify.post('/login', async (request, reply) => {
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

fastify.post('/changePassword', async (request, reply) => {
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

fastify.get('/getUser', async (request, reply) => {
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
		reply.send({ id: user.id, username: user.username, email: user.email });
	} catch (err) {
		console.error('Error verifying token:', err);
		reply.code(401).send({ error: 'Invalid token' });
	}
});

fastify.post('/getUserByUsername', async (request, reply) => {
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

fastify.get('/isit2fa', async (request, reply) => {
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

fastify.get('/create2faqrcode', async (request, reply) => {
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

fastify.post('/activation-2fa', async (request, reply) => {
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

fastify.post('/disable2fa' , async (request, reply) => {
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

fastify.post('/tfaLogin', async (request, reply) => {
	const token = request.headers.authorization?.split(' ')[1];
	const { key } = request.body;
	console.log('Received 2FA login request with key:', key);
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
			reply.send({ message: '2FA login successful' });
		} else {
			reply.code(401).send({ error: 'Invalid 2FA key' });
		}
	} catch (err) {
		console.error('Error during 2FA login:', err);
		reply.code(500).send({ error: 'Failed to login with 2FA' });
	}
});

// fastify.post('2faSetup', async (request, reply) => {
// 	const { username } = request.body;


fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	else {
		console.log('SERVER LANCE');
	}
});
