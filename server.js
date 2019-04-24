const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse request
app.use(bodyParser.urlencoded({ extend: false}))
app.use(bodyParser.json())

//Enable CORS for all HTTP methods
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// configuring the database
const config = require('./config.js');
const mongoose = require('mongoose');
require('./routes/game.routes.js')(app);

mongoose.Promise = global.Promise;

mongoose.connect(config.db_url, {
	useNewUrlParser: true
}).then(() => {
	console.log("Successfully connected to the database");
}).catch(err => {
	console.log('Could not connect to the database. Exiting now...', err);
	process.exit();
});

//default route
app.get('/', (req, res) => {
	res.json({"message":"Welcome to Not-Metacritic."});
});

// listen on port 3000
app.listen(config.serverport, () => {
	console.log("Server is listening on port 3000");
});