import { addMessageToSync, getAllMessagesToSync, deleteSyncedMessage } from './idb-utility.js'; 

(function() {
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
        console.error('Service Worker registration failed:', error);
    });
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
        console.log("GOING HERE", messageData);
        addMessageToSync(messageData)

      } 
      else {
        // The   is online, emit the message via socket
        deleteSyncedMessage();
        socket.emit('chat:send', messageData);
      }
      input.value = "";
      messages.scrollTop = messages.scrollHeight - messages.clientHeight;
  });

  function syncMessages() {
    console.log("suncing");
    
    getAllMessagesToSync().then((messagesToSync) => {
        messagesToSync.forEach((messageData) => {
            socket.emit('chat:send', messageData);
        });
        deleteSyncedMessage();
    }).catch((error) => {
        console.error('Error getting messages to sync:', error);
    });
  }
  window.addEventListener('online', syncChatMessages);

  function syncChatMessages() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('messages');
      }).then(() => {
        console.log('Sync event registered');
      }).catch(err => {
        console.error('Error registering sync', err);
      });
    } else {
      console.error('Service worker or SyncManager not supported');
    }
  }
  
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'sync-messages') {
      sendStoredMessages(event.data.messages);
    }
  });
  
  async function sendStoredMessages(messages) {
    for (const message of messages) {
      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
  
        if (response.ok) {
          // Delete the message from IndexedDB
          await deleteSyncedMessage(message.id);
        } else {
          console.error('Failed to send message:', message);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

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
