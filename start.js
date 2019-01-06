require('dotenv').config({path: './config/variables.env'});
require('./config/connection');
require('./models/Estabelecimento');

const app = require('./config/app');
app.set('port', process.env.PORT);

const server = app.listen(app.get('port'), () => {
    console.log(`Server running at ${server.address().port}`);
});