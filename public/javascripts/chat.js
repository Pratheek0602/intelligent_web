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



    // chat.querySelector(".chat-screen #send-message").addEventListener("click", function() {
    //     let message = chat.querySelector(".chat-screen #message-input").value;
    //     if (message.length == 0) {
    //         return;
    //     }
    //     renderMessage("my", {
    //         username:uname,
    //         text:message
    //     });
    //     socket.emit("chat",{
    //         username:uname,
    //         text:message
    //     });
    //     chat.querySelector(".chat-screen #message-input").value = "";
    // });

    // function renderMessage(type, message) {
    //     let messageContainer = chat.querySelector(".chat-screen .messages");        
    //     if (type == "my") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class","message my-message");
    //         el.innerHTML += `
    //             <div>
    //                 <div class="name">You</div>
    //                 <div class="text">${message.text}</div>
    //             </div>
    //         `;
    //         messageContainer.appendChild(el);

    //     } else if (type == "other") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class", "message other-message");
    //         el.innerHTML += `
    //             <div>
    //                 <div class="name">${message.username}</div>
    //                 <div class="text">${message.text}</div>
    //             </div>
    //         `;
    //         messageContainer.appendChild(el);

    //     } else if (type == "update") {
    //         let el = document.createElement("div");
    //         el.setAttribute("class", "update");
    //         el.innerText = message;
    //         messageContainer.appendChild(el);
    //     }
    //     // scroll chat to end
    //     messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight;
    // }
    
})(); 


