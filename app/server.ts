import express from 'express';

import { CarroController } from './controllers';

const app: express.Application = express();

const port: string = process.env.PORT || '3000';

const bodyParser = require('body-parser');
var helmet = require('helmet');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

app.disable('x-powered-by');
app.use(helmet());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/Carro', CarroController);

app.listen(port, () => {
    
    console.log(`Listening at http://localhost:${port}/`);
}).setTimeout(360000);
