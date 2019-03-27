const express = require('express');
const bodyParser = require('body-parser');
const filmeRoutes = require('../routes/filme');

module.exports = () => {
    app = express();

    app.use(bodyParser.json());

    app.use('/filmes', filmeRoutes);

    return app;
}