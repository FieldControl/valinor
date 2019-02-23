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

    app.set("view engine", "ejs");
    app.set("views", "./app/views");

    return app;
};

module.exports = expressConfig;