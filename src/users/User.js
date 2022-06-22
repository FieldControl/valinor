const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    avatar: {
        type: String,
        required: true,
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;