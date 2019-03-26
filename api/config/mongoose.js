const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true
}

mongoose.connect(process.env.MONGODB_URI, options);