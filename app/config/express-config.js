const bodyParser = require("body-parser");
const cors = require("cors");

const expressConfig = async (app) => {


    // definir bodyparser antes das rotas
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    app.use(bodyParser.json());

    // enable cors
    app.use(cors());

    // definir body parser antes das rotas
    app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
    app.use(bodyParser.json());

    return app;
};

module.exports = expressConfig;