const Plant = require('../models/plants');
const rooms = {};

/**
 * Initialize socket.io functionality.
 * @param {SocketIO.Server} io - Socket.io server instance.
 * @returns {void}
 */
exports.init = function(io) {
    io.on('connection', function (socket) {      
        try {
            /**
             * Event handler for joining a plant chat room.
             * @param {string} plantId - ID of the plant to join chat room.
             */
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

            /**
             * Event handler for a new user joining a plant chat room.
             * @param {string} name - Name of the user.
             * @param {string} plantId - ID of the plant chat room.
             * @returns {void}
             */
            socket.on("newuser", (name, plantId) => {
              // Add the socket to the plant room
              socket.join(plantId);
  
              // Broadcast to others in the room that a new user has joined
              socket.to(plantId).emit("global:message", `${name} just joined the chat!`);
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
