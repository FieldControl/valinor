app = require('./config/express')();
require('dotenv').config();
require('./config/mongoose');

app.listen(process.env.PORT, function(){
    console.log(`servidor rodando na porta ${process.env.PORT}`);
});