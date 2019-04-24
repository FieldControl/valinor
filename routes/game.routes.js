module.exports = (app) => {
	const games = require('../controller/game.controller.js');

	app.post('/games', games.create);

	app.get('/games', games.findAll);
	
	app.get('/games/:gameId', games.findOne);

	app.put('/games/:gameId', games.update);

	app.delete('/games/:gameId', games.delete);
}
