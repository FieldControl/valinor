const express = require('express');
const bodyParser = require('body-parser');
const filmeRoutes = require('../routes/filme');
require('dotenv').config();
require('./mongoose');

module.exports = () => {
    app = express();

    app.use(bodyParser.json());

    app.use('/filmes', filmeRoutes);

    return app;
}