const env = require('./environment');
const expressConfig = require("./config/express-config");
const automovelRoute = require("./routes/automovel-route");
const makeApp = require("./config/make-app");
const swaggerConfig = require("./config/swagger-config");

makeApp()
    .then(app => {
        return swaggerConfig(app)
    })
    .then(app => {
        return expressConfig(app)
    })
    .then(app => {
        return automovelRoute(app)
    })
    .then(app => {
        return app.listen(env.app.port);
    })
    .then(app => {
        console.log(`server running at ${env.app.url}`);
    })
    .catch(error => {
        throw error;
    });
