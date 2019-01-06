const mongoose = require('mongoose');

//flags de configuração para remover warnings do MongoDB
const options = {
    useNewUrlParser: true, 
    useFindAndModify: false
}

mongoose.connect(process.env.DATABASE, options);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (error) => {console.error(error)});

// const connection = mongoose.connection;
// module.exports = connection;