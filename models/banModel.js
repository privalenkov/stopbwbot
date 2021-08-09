const { Schema, model } = require('mongoose');

const schema = new Schema({
    userName: {
        type: String,
        required: true,
    },
    squadName: {
        type: String,
        required: true,
    },
})

module.exports = model('ban', schema);