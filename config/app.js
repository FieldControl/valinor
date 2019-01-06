const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const Estabelecimento = require('../models/Estabelecimento');
const routes = require('../routes/index');

const app = express();

//Extrai o body de uma requisição HTTP e expõe no req.body
app.use(bodyParser.json());

/*Realiza o parse das informações que vem no corpo das requisições, para o req.body 
**sendo somente aceito codificação UTF-8. a Opção extended: false indica que os objetos
que serão passados para o req.body somente serão Strings ou arrays.
*/
app.use(bodyParser.urlencoded({ extended: false }));

//Conjunto de middlewares que tem funções de validação e sanitização
app.use(expressValidator());

app.use('/', routes);

module.exports = app;