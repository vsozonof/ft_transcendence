// LE BACKEND COMMENCE ICI HEHEHEHEHEHE

const Fastify = require('fastify');

const {loginUser, createUser, getUserByUsername } = require('./user.js');

const fastify = Fastify();

const cors = require('@fastify/cors');

const db = require('./db/db.js');

const dotenv = require('dotenv');
dotenv.config();


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
	const { username, email,  password} = request.body;

	console.log(' received data:', { username, email, password });

})

fastify.post('/login', async (request, reply) => {
	const {username, password} = request.body;
	console.log(' received data:', { username, password });
	await createUser("rom-2001@hotmail.fr", "123456", "rostrub");
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

// fastify.post('/changePassword', async (request, reply) => {
// 	const { oldPass, newPass,  newPass2} = request.body;
// })

fastify.listen({ port: 3000, host: 'localhost'}, (err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	else
		console.log('SERVER LANCE');
});
