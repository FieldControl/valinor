const SwaggerParser = require('swagger-parser');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swagger.json');


const swaggerConfig = async (app) => {
    const parser = new SwaggerParser();
    const apiDescription = await parser.validate('./my-api.yml');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDescription));

    //index redireciona para api-docs
    app.get("/", (req, res) => {
        res.redirect("/api-docs")
    });

    return app
};
module.exports = swaggerConfig;