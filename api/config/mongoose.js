const mongoose = require('mongoose');

const options = {
    useNewUrlParser: true,
    useFindAndModify: false
}
const uri = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;
mongoose.connect(uri, options);