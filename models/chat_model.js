const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    sender: {
        type: String, 
        required: true
    },
    // This is for when we have the plant model database setup
    // plantId: {
    //     type: mongoose.Schema.Types.ObjectId, // Assuming you have a Plant model
    //     required: true,
    //     ref: 'Plant' // This assumes your plant model is named 'Plant'
    // },

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