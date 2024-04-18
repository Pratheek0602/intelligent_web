(function() {
    const chat = document.querySelector(".chat-box");
    const socket = io();
    let uname;
    plant_id = document.getElementById('plant_id').value;

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
        socket.emit("chat:send", { name: uname, plantId: plant_id, message: input.value });
        input.value = "";
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

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


