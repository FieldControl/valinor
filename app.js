const express = require('express');
const mongoose = require('mongoose');
const promisify = require('es6-promisify');
const routes = require('./routes/index');

const app = express();

app.use('/', routes);

module.exports = app;