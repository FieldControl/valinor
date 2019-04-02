let express = require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let app = express();
let routes = require("./api/routes")

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/challenge1', {useNewUrlParser: true});
var db = mongoose.connection;

var port = process.env.PORT || 8080;
app.use('/', routes)
app.listen(port, function () {
    console.log("Running challenge on port " + port);
});