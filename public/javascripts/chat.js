/**
 * Initializes the chat functionality.
 * - Registers service worker
 * - Handles joining the chat
 * - Sends and receives chat messages
 * - Syncs messages when back online
 * @module Chat
*/

import { addMessageToSync, getAllMessagesToSync, deleteSyncedMessage,openUsernameIDB, getUsername } from './idb-utility.js'; 

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
    const messages = document.getElementById("messages");
    const form = document.getElementById("form");
    const input = document.getElementById("input");

    /**
     *Event listener for joining the chat room.
     Retrieves the username from IndexedDB and emits joinPlantChat and newuser events to the server.
     * @function
    */
    chat.querySelector(".join-screen #join-user").addEventListener("click", function() {
        openUsernameIDB().then((db) => {
        getUsername(db).then((username) => {
            uname = username.value;

            socket.emit("joinPlantChat", plant_id);
            socket.emit("newuser", uname, plant_id);

            chat.querySelector(".join-screen").classList.remove("active");
            chat.querySelector(".chat-screen").classList.add("active");
        });
    }).catch((err) => {
        console.error("Failed to retrieve username:", err);
    });
    });

    socket.on("global:message", (message) => {
        messages.innerHTML += `<p class="join_message">${message}</p>`;
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });
    
    /**
     * Event listener for form submission (sending a message).
     * Emits chat:send event to the server with the message data.
     * If the browser is offline, stores the message in IndexedDB
     * @function
     *  @param {Event} e - The submit event.
    * */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (input.value.trim() === "") {
            return; 
        }
        const messageData = { name: uname, plantId: plant_id, message: input.value };
      
        if (!navigator.onLine) {
            // The browser is offline, store the message in IndexedDB
            addMessageToSync(messageData),
            navigator.serviceWorker.ready
                .then(function (serviceWorkerRegistration) {
                    serviceWorkerRegistration.showNotification("System is offline!", {
                        body: "Your messages will appear when back online..."
                    });
                });
        } else {
            deleteSyncedMessage();
            socket.emit('chat:send', messageData);
        }
        input.value = "";
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

    /**
     * Event listener for online event.
     * Syncs messages stored in IndexedDB when the browser goes back online.
     * @function
    */
    function syncMessages() {
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

    // Event listener for receiving chat messages
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

    // Event listener for receiving chat history
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

    /**
     * Appends a message to the chat window.
     * Determines if the message is sent by the current user or another user.
     * @function
     * @param {string} sender - The sender of the message.
     * @param {string} message - The content of the message.
     */
    function appendMessages(sender, message) {
        let messageElement = sender === uname ?
          `<div class="sent_message_container"><div class="name">You</div><div class="sent_message">${message}</div></div>` :
          `<div class="receive_message_container"><div class="receiver_name">${sender}</div><div class="sent_message">${message}</div></div>`;
          messages.innerHTML += messageElement;
    }

})();