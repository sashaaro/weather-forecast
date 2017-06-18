const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    }
});

module.exports = mongoose.model('User', UserSchema);