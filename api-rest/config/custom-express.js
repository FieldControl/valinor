var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var morgan = require('morgan');
var logger = require('../services/Logger.js');

module.exports = function() {
    var app = express();

    // Configuração de Log de acordo com Apache Commons
    app.use(morgan("[:date[clf]] (:remote-addr) :method :url :status :response-time ms - :res[content-length]", {
        stream: {
            write: (mensagem) => {
                logger.info(mensagem);
            }
        }
    }));

    // Configuração Body Parser para JSON
    app.use(bodyParser.json());

    // Configuração Body Parser para urlencoded
    app.use(bodyParser.urlencoded({extended: true}));

    // Configuração validator
    app.use(expressValidator());

    consign()
        .include('controllers')
        .then('services')
        .then('dao')
        .into(app);

    return app;
}