const users = [];
exports.init = function(io) {

    io.on('connection', function (socket) {        

        socket.on("newuser", (name) => {
			!users.some((user) => user.name === name) &&
				users.push({ name, sockeId: socket.id });
			io.emit("global:message", `${name} just joined !`);
		});

        // socket.on("exituser", function(username) {
        //     socket.broadcast.emit("disconnect", username + " left the conversation");
        // });

        socket.on("exituser", (username) => {
            // Find the user and remove them from the array
            const index = users.findIndex(user => user.name === username);
            if (index !== -1) {
                const user = users.splice(index, 1)[0];
                io.emit("global:message", `${user.name} just left!`);
            }
        });

        socket.on("chat:send", function(message) {
            socket.broadcast.emit("chat:receive", message);
        });
    });

}
