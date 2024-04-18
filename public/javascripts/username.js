const handleUpgrade = (ev) => {
    const db = ev.target.result;
    db.createObjectStore("user");
    console.log("Upgraded object store");
};

const handleSuccess = () => {
    const usernameIDB = requestIDB.result;
    const transaction = usernameIDB.transaction(["user"], "readwrite");
    const usernameStore = transaction.objectStore("user")
    const getRequest = usernameStore.get("username")
    getRequest.addEventListener("success", () => {
        res = getRequest.result;
        if (res === undefined) {
            if (location.pathname == '/login') {
                const usernameForm = document.getElementById("usernameForm");
                usernameForm.addEventListener("submit", handleUsernameEntered)
            } else {
                window.location.replace(location.origin + '/login');
            }
        } else {
            console.log(`Username: ${res.value}`);
        }
    }
    )
}

const handleUsernameEntered = () => {
    const username = document.getElementById("username").value;
    if (username != "") {
        const usernameIDB = requestIDB.result;
        const transaction = usernameIDB.transaction(["user"], "readwrite");
        const usernameStore = transaction.objectStore("user");
        const addRequest = usernameStore.add({ value: username }, "username");

        addRequest.addEventListener("success", () => {
            window.location.replace(location.origin);
        });
    }
};

const requestIDB = indexedDB.open("plant");
requestIDB.addEventListener("upgradeneeded", handleUpgrade);
requestIDB.addEventListener("success", handleSuccess);
requestIDB.addEventListener("error", (err) => {
    console.log("Error: " + JSON.stringify(err));
});
