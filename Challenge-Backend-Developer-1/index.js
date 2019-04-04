require('dotenv').config({  
    path: (process.env.NODE_ENV) ? `./environment/${process.env.NODE_ENV}.env` : "./environment/production.env"
});

let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let app = express();
let routes = require("./api/routes")

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_IP}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {useNewUrlParser: true});
var db = mongoose.connection;

var port = process.env.APP_PORT || 8080;
app.use('/', routes);
app.use(express.static("public"));
app.listen(port, function () {
    console.log("Running challenge on port " + port);
});

module.exports = app;