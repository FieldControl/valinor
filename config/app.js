const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const routes = require('../routes/index');

const app = express();

//Extrai o body de uma requisição HTTP e expõe no req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Conjunto de middlewares que tem funções de validação e sanitização
app.use(expressValidator());

app.use('/', routes);

module.exports = app;