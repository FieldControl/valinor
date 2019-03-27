const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useFindAndModify: false
}

mongoose.connect(process.env.MONGODB_URI, options);