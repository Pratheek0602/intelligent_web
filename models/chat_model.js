/**
 * Module representing a mongoose model for chat messages.
 * @module chatMsg
 */

const mongoose = require('mongoose');

/**
 * Mongoose schema for chat messages.
 * @type {mongoose.Schema<MessageSchema>}
 */
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