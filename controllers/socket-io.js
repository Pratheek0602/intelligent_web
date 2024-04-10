const users = [];
const chatMsg = require('../models/chat_model');

exports.init = function(io) {

    io.on('connection', function (socket) {      
        try {
            chatMsg.find().then(result => {
                socket.emit("output-messages",result)
            })
            socket.on("newuser", (name) => {
                !users.some((user) => user.name === name) &&
                    users.push({ name, sockeId: socket.id });
                io.emit("global:message", `${name} just joined !`);
            });

            socket.on("exituser", (username) => {
                // Find the user and remove them from the array
                const index = users.findIndex(user => user.name === username);
                if (index !== -1) {
                    const user = users.splice(index, 1)[0];
                    io.emit("global:message", `${user.name} just left!`);
                }
            });

            socket.on("chat:send", function(data) {
                const { name, plantIds, message } = data; // Destructure the incoming object
                const newMessage = new chatMsg({
                    sender: name, 
                    plantID: plantIds,
                    msg: message 
                });
                newMessage.save().then(() => {
                    socket.broadcast.emit("chat:receive", data); // Broadcast the message object as received
                }).catch(e => console.error(e)); // Log any errors
            });

            
        } catch (e) {
        }
    });

}
