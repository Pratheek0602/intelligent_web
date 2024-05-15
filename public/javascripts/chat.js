import { addMessageToSync, getAllMessagesToSync, deleteSyncedMessage } from './idb-utility.js'; 

(function() {
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js')
          .then((reg) => console.log('Service Worker registered', reg))
          .catch((err) => console.error('Service Worker registration failed', err));
  }

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
      messages.innerHTML += `<p class="join_message">${message}</p>`;
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
        // console.log("GOING HERE", messageData);
        addMessageToSync(messageData),
        navigator.serviceWorker.ready
            .then(function (serviceWorkerRegistration) {
                serviceWorkerRegistration.showNotification("System is offline!", {
                    body: "Your messages will appear when back online..."
                });
            });
      } 
      else {
        // The   is online, emit the message via socket
        deleteSyncedMessage();
        socket.emit('chat:send', messageData);
        // self.registration.showNotification('Plant Synced!', {
        //     body: 'Welcome back online, the plants you added have synced successfully!',
        // });

      }
      input.value = "";
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });

  function syncMessages() {
    // console.log("suncing");
    
    getAllMessagesToSync().then((messagesToSync) => {
        messagesToSync.forEach((messageData) => {
            socket.emit('chat:send', messageData);
        });
        deleteSyncedMessage();
        self.registration.showNotification('Messages Synced!', {
            body: 'Welcome back online, your chats have synced successfully!',
        });
    }).catch((error) => {
        console.error('Error getting messages to sync:', error);
    });
  }
  window.addEventListener('online', syncMessages);

//   socket.on("chat:receiver", (data) => {
//       if (data && data.name && data.message) {
//           appendMessages(data.name, data.message);
//       } else {
//           console.error('Received data is not in the expected format:', data);
//       }
//   });

socket.on("chat:receiver", (data) => {
    if (data && data.name && data.message) {
        appendMessages(data.name, data.message);
        
        // Check if the current user is the one who uploaded the plant
        const plantUser = document.getElementById("plant-user").textContent.trim();
        if (plantUser === uname) {
            // If the current user uploaded the plant, trigger a notification
            self.registration.showNotification('You got a message!', {
                body: 'Check your chat!',
            });
        }
    } else {
        console.error('Received data is not in the expected format:', data);
    }
});

  socket.on("output-messages", (data) => {
      console.log(data);
      if (data.length) {
          messages.innerHTML = ''; // Clear current messages to avoid duplication
          data.forEach((message) => {
              const senderName = message.sender === uname ? "You" : message.sender;
              appendMessages(senderName, message.message);
          });
      }
  });

  function appendMessages(sender, message) {
      let messageElement = sender === uname ?
          `<div class="sent_message_container"><div class="name">You</div><div class="sent_message">${message}</div></div>` :
          `<div class="receive_message_container"><div class="receiver_name">${sender}</div><div class="sent_message">${message}</div></div>`;
      
      messages.innerHTML += messageElement;
  }
})();