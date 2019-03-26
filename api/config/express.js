express = require('express');
index = require('../routes/index');

module.exports = () => {
    app = express();

    app.use('/', index);

    return app;
}