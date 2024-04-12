const users = [];
const rooms = {};
const Plant = require('../models/plants'); 

exports.init = function(io) {

    io.on('connection', function (socket) {      
        try {
            // chatMsg.find().then(result => {
            //     socket.emit("output-messages",result)
            // })

            socket.on("joinPlantChat", async (plantId) => {
                const plant = await Plant.findById(plantId);
                if (plant && plant.chatMessages) {
                    socket.emit("output-messages", plant.chatMessages);

                    // Add the client to the room
                    if (!rooms[plantId]) {
                        rooms[plantId] = [];
                    }
                    rooms[plantId].push(socket.id);
                    
                }
            });

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

                    // Remove the client from the room
                    for (const [roomId, clientIds] of Object.entries(rooms)) {
                        const clientIndex = clientIds.indexOf(socket.id);
                        if (clientIndex !== -1) {
                        clientIds.splice(clientIndex, 1);
                        break;
                        }
                    }

                    io.emit("global:message", `${user.name} just left!`);
                }
            });

            socket.on("chat:send", async (data) => {
                const { name, plantId, message } = data;
              
                try {
                  // Create a new messageSchema object
                  const newMessage = { sender: name, message: message };
              
                  // Find the plant and update its chatMessages array
                  const updatedPlant = await Plant.findByIdAndUpdate(
                    plantId,
                    { $push: { chatMessages: newMessage } },
                    { new: true }
                  );
              
                  if (updatedPlant) {
                    // Broadcast the message to all clients
                    if (rooms[plantId]) {
                        rooms[plantId].forEach(clientId => {
                          io.to(clientId).emit("chat:receiver", {
                            name,
                            message,
                            plantId: plantId,
                          });
                        });
                      }
                    } else {
                    console.error(`Plant with ID ${plantId} not found`);
                  }
                } catch (error) {
                  console.error('Error saving chat message:', error);
                }
              });


            
        } catch (e) {
        }
    });

}
