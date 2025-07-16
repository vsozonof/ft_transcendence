// LE BACKEND COMMENCE ICI HEHEHEHEHEHE

const Fastify = require('fastify');

const {loginUser} = require('./user.js');

const fastify = Fastify();

const cors = require('@fastify/cors');

const db = require('./db/db.js');


// 🛠️ Configure CORS ici
fastify.register(cors, {
  origin: 'http://localhost:5173', // ⚠️ ton frontend (Vite ou autre)
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
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
	if (loginUser(username, password))
	{
		console.log('Login successful');
		reply.code(200).send({'token': 'fake-jwt-token'});
	}
	else
	{
		reply.code(401).send({'error': 'Invalid credentials'});
		console.log('Invalid credentials');
	}

})

fastify.listen({ port: 3000, host: '0.0.0.0'}, (err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	else
		console.log('SERVER LANCE');
});
