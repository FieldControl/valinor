const app = require("./config/Express")();
const env = require('./environment');
const automovelRoute = require("./routes/AutomovelRoute");

automovelRoute(app);

app.listen(env.app.port, function () {
    console.log(`server running at ${env.app.url}`);
});
