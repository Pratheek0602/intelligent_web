(function() {
    const chat = document.querySelector(".chat-box");
    const socket = io();
    let uname;
    let plant_id = 'somePlantId';

    const messages = document.getElementById("messages");
    const form = document.getElementById("form");
    const input = document.getElementById("input");


    chat.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = chat.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return alert("Please enter your username!")
        }
        socket.emit("newuser", username);
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
        messages.innerHTML += `          
        <div class="sent_message_container" >
            <div class="name" >You</div>
            <div class="sent_message" >${input.value}</div>
        </div>
        `;
        socket.emit("chat:send", { name: uname, plantIds: plant_id, message: input.value });
        input.value = "";
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

    socket.on("chat:receive", (message) => {
        messages.innerHTML += `          
        <div class="receive_message_container" >
            <p class="receiver_name" >${message.name}</p>
            <p class="sent_message" >${message.message}</p>
        </div>
        `;
    });

    socket.on("output-messages", data => {
        console.log(data)
        if (data.length){
            data.forEach(message => {
                // Check if the sender is the current user
                const senderName = message.sender === uname ? "You" : message.sender;
                appendMessages(senderName, message.msg);
            });
        }   
    })

    document.getElementById('exit-chat').addEventListener('click', function() {
        socket.emit('exituser', uname); // Emit an event when a user wants to leave
        chat.querySelector('.join-screen').classList.add('active');
        chat.querySelector('.chat-screen').classList.remove('active');
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });


    function appendMessages(sender, message) {
        let messageElement;
        if (sender === "You") {
            // Message was sent by the current user
            messageElement = `
                <div class="sent_message_container">
                    <div class="name">${sender}</div>
                    <div class="sent_message">${message}</div>
                </div>
            `;
        } else {
            // Message was received from someone else
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


