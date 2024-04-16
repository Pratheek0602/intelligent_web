const handleUpgrade = (ev) => {
    const db = ev.target.result;
    db.createObjectStore("user");
    console.log("Upgraded object store");
};

// TODO: Very janky way of doing this need to figure out a better method
// watch some videos on indexedDB
// In actual version will place the username view code in the index view and just hide if username is found
// Maybe just include it in every page actually as a public view?

const handleSuccess = () => {
    const usernameIDB = requestIDB.result;
    const transaction = usernameIDB.transaction(["user"], "readwrite");
    const usernameStore = transaction.objectStore("user")
    const getRequest = usernameStore.getAll()
    getRequest.addEventListener("success", () => {
        res = getRequest.result[0];
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
