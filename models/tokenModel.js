const { Schema, model } = require('mongoose');

const schema = new Schema({
    accessToken: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    },
    expiryTimestamp: {
        type: Number,
        default: 0,
    }
})

module.exports = model('token', schema);