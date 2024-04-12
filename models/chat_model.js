const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    sender: {
        type: String, 
        required: true
    },

    plantID: {
        type: String, 
        required: true
    },

    msg: {
        type: String,
        required: true
    }
}, { timestamps: true }); 

const chatMsg = mongoose.model('chatMsg', msgSchema);
module.exports = chatMsg;