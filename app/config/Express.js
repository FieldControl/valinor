const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

module.exports = function () {
    const app = express();

    // definir bodyparser antes das rotas
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    app.use(bodyParser.json());

    // enable cors
    app.use(cors());

    // definir body parser antes das rotas
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    app.use(bodyParser.json());

    app.set("view engine", "ejs");
    app.set("views", "./app/views");

    return app;
};
