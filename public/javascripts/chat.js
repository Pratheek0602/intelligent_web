{/* <script src="./idb-utility.js" type="module"></script>
import { addMessageToSync, getAllMessagesToSync } from './idb-utility.js'; */}

import { addMessageToSync, getAllMessagesToSync } from './idb-utility.js'; 
(function() {
  // import idb-utility.js;
  
    const chat = document.querySelector(".chat-box");
    const socket = io();
    let uname;
    var plant_id = document.getElementById('plant_id').value;

    console.log(plant_id); // Now should output the plant_id or null
    

    const messages = document.getElementById("messages");
    const form = document.getElementById("form");
    const input = document.getElementById("input");


    chat.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = chat.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return alert("Please enter your username!")
        }
        socket.emit("joinPlantChat", plant_id);
        socket.emit("newuser", username, plant_id);
        uname = username;
        chat.querySelector(".join-screen").classList.remove("active");
        chat.querySelector(".chat-screen").classList.add("active");
    });

    socket.on("global:message", (message) => {
        messages.innerHTML += `
        <p class="join_message" >${message}</p>
        `;
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (input.value.trim() === "") {
            return; 
        }
        const messageData = { name: uname, plantId: plant_id, message: input.value };

        if (!navigator.onLine) {
          // The browser is offline, store the message in IndexedDB
          addMessageToSync(messageData);
          // syncChatMessages(messageData);
        } else {
          // The browser is online, emit the message via socket
          socket.emit('chat:send', messageData);
        }
        input.value = "";
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

    // Define the syncMessages function here
    function syncMessages() {
      getAllMessagesToSync().then((messagesToSync) => {
          messagesToSync.forEach((messageData) => {
              // Logic to send messages to the server
              socket.emit('chat:send', messageData);

              // Optionally, delete the message from the store after it's been sent
              // deleteMessageFromSyncStore(messageData.id);
          });
      }).catch((error) => {
          console.error('Error getting messages to sync:', error);
      });
    }
    // Register the event listener for coming back online
    window.addEventListener('online', syncMessages);


    socket.on("chat:receiver", (data) => {
        if (data && data.name && data.message) {
          appendMessages(data.name, data.message);
        } else {
          console.error('Received data is not in the expected format:', data);
        }
    });

    socket.on("output-messages", (data) => {
      console.log(data);
      if (data.length) {
          // Clear the current messages before appending to avoid duplication
          messages.innerHTML = '';
          data.forEach((message) => {
              // Check if the sender is the current user
              const senderName = message.sender === uname ? "You" : message.sender;
              appendMessages(senderName, message.message);
          });
        }
    });

    function appendMessages(sender, message) {

        let messageElement;
        if (sender === uname) {
          messageElement = `
            <div class="sent_message_container">
              <div class="name">You</div>
              <div class="sent_message">${message}</div>
            </div>
          `;
        } else {
          messageElement = `
            <div class="receive_message_container">
              <div class="receiver_name">${sender}</div>
              <div class="sent_message">${message}</div>
            </div>
          `;
        }
        messages.innerHTML += messageElement;
    }
    
  


})(); 


