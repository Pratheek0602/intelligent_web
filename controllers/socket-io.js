exports.init = function(io) {

    io.on('connection', function (socket) {        

        socket.on("newuser", function(username) {
            socket.broadcast.emit("update", username + " joined the conversation");
        });

        socket.on("exituser", function(username) {
            socket.broadcast.emit("update", username + " left the conversation");
        });

        socket.on("chat:send", function(message) {
            socket.broadcast.emit("chat:receive", message);
        });
    });

}
