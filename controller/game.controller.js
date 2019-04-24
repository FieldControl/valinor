const Game = require('../model/game.js');

// Add a new game into the Database
exports.create = (req, res) => {
	// Request validation
	if(!req.body) {
		return res.status(400).send({
			message: "Game content can not be empty"
		});
	}

	// Create a game	
	const game = new Game({
		title: req.body.title || "No game title",
		description: req.body.description,
		score: req.body.score,
		company: req.body.company
	});

	// Save game in the database
	game.save()
	.then(data => {
		res.send(data);
	}).catch(err => {
		res.status(500).send({
			message: err.message || "Something wrong while adding the game."
		});
	});
};

// Retrieve all games from the database.
exports.findAll = (req, res) => {
	Game.find()
	.then(games => {
		res.send(games);
	}).catch(err => {
		res.status(500).send({
			message: err.message || "Something went wrong while retrieving games."
		});
	});
}

// Find a silngle game with gameId
exports.findOne = (req, res) => {
	Game.findById(req.params.gameId)
	.then(game => {
		if(!game) {
			return res.status(404).send({
				message: "Game not found with id: " + req.paramas.gameId
			});
		}
		res.send(game);
	}).catch(err => {
		if(err.kind === 'ObjectId') {
			return res.status(400).send({
				message: "Game not found with id: " + req.params.gameId
			});
		}
		return res.status(500).send({
			message: "Something went wrong retrieving game with id " + req.params.gameId
		});
	})
}

// Update game
exports.update = (req, res) => {
	// validate Request
	if(!req.body) {
		return res.status(400).send({
			message: "Game content can not be empty"
		});
	}

	// find and update game with the request body
	Game.findByIdAndUpdate(req.params.gameId, {
		title: req.body.title || "No game title",
		description: req.body.description,
		score: req.body.score,
		company: req.body.company
	}, {new:true})
	.then(game => {
		if(!game) {
			return res.status(404).send({
				message: "Game not found with id " + req.params.gameId
			});
		}
		res.send(game);
	}).catch(err => {
		if(err.kind === 'ObjectId') {
			return res.status(404).send({
				message: "Game not found with id " + req.params.gameId
			});
		}	
		return res.status(500).send({
			message: "Something went wrong updating game with id " + req.params.gameId
		});
	});
}

// Delete a game with the specific gameId in the request
exports.delete = (req, res) => {
	Game.findByIdAndRemove(req.params.gameId)
	.then(game => {
		if(!game) {
			return res.status(404).send({
				message: "Game not found with id " + req.params.gameId
			});
		}

		res.send({message: "Game deleted successfully!"});
	}).catch(err => {
		if(err.kind === 'ObjectId' || err.name === 'NotFound') {
			return res.status(404).send({
				message: "Game not found with id " + req.params.gameId
			});
		}
		return res.status(500).send({
			message: "Could not delete game with id " + req.params.gameId
		});
	});
}