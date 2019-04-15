"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var controllers_1 = require("./controllers");
var app = express_1.default();
var port = process.env.PORT || '3000';
var bodyParser = require('body-parser');
var helmet = require('helmet');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.disable('x-powered-by');
app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use('/Carro', controllers_1.CarroController);
app.listen(port, function () {
    console.log("Listening at http://localhost:" + port + "/");
}).setTimeout(360000);
//# sourceMappingURL=server.js.map