const { Schema, model } = require('mongoose');

const schema = new Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    modListener: {
        type:  Object,
        default: null,
    },
    squadName: {
        type: String,
        required: true,
    } 
})

module.exports = model('streamer', schema);