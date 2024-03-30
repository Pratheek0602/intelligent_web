const users = [];
exports.init = function(io) {

    io.on('connection', function (socket) {        

        // socket.on("newuser", function(username) {
        //     socket.broadcast.emit("update", username + " joined the conversation");
        // });

        socket.on("newuser", (name) => {
			!users.some((user) => user.name === name) &&
				users.push({ name, sockeId: socket.id });
			io.emit("global:message", `${name} just joined !`);
		});

        socket.on("exituser", function(username) {
            socket.broadcast.emit("disconnect", username + " left the conversation");
        });

        socket.on("chat:send", function(message) {
            socket.broadcast.emit("chat:receive", message);
        });
    });

}
