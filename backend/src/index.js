// LE BACKEND COMMENCE ICI HEHEHEHEHEHE

const Fastify = require('fastify');
const fastify = Fastify();

const db = require('./db/db.js');

fastify.get('/api/test', async (request, reply) => {
	return { message: 'prout' };
});

fastify.get('/api/db', async (request, reply) => {
	db.run(`
  		INSERT OR IGNORE INTO users (username, email, password)
  		VALUES ('Victor', 'victor@test.com', 'prout')
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

fastify.listen({ port: 3000, host: '0.0.0.0'}, (err) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	else
		console.log('SERVER LANCE');
});