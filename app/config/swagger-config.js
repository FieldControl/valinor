const SwaggerParser = require('swagger-parser');
const swaggerRoutes = require('swagger-routes-express');

const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');


const swaggerConfig = async (app) => {
    const parser = new SwaggerParser();
    const apiDescription = await parser.validate('./my-api.yml');
    //const connect = swaggerRoutes(api, apiDescription);
    // do any other app stuff,
    // such as wire in passport, use cors etc.
    // then connect the routes
    //connect(app);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDescription));
    // add any error handlers last


    return app
};
module.exports = swaggerConfig;