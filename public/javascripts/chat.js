(function() {
    const chat = document.querySelector(".chat-box");
    const socket = io();
    let uname;

    const messages = document.getElementById("messages");
    const form = document.getElementById("form");
    const input = document.getElementById("input");


    chat.querySelector(".join-screen #join-user").addEventListener("click", function() {
        let username = chat.querySelector(".join-screen #username").value;
        if (username.length == 0) {
            return;
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
            return; // Don't send empty messages
        }
        messages.innerHTML += `          
        <div class="sent_message_container" >
            <div class="name" >You</div>
            <div class="sent_message" >${input.value}</div>
        </div>
        `;
        socket.emit("chat:send", { name: uname, message: input.value });
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

    document.getElementById('exit-chat').addEventListener('click', function() {
        socket.emit('exituser', uname); // Emit an event when a user wants to leave
        chat.querySelector('.join-screen').classList.add('active');
        chat.querySelector('.chat-screen').classList.remove('active');
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
    });

})(); 


