const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	swaggerDefinition: {
		info: {
			title: 'Games API',
			version: '1.0.0',
			description: 'Documentation for the API developed in the BackEnd challenge 1 for FieldControl.'
		},
		basePath: '/'
	},
	apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
	app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}