const handleUpgrade = (ev) => {
    const db = ev.target.result;
    db.createObjectStore("username", { keyPath: "id", autoIncrement: true });
    console.log("Upgraded object store");
};

const handleSuccess = () => {
    const usernameIDB = requestIDB.result;
    const transaction = usernameIDB.transaction(["username"], "readwrite");
    const usernameStore = transaction.objectStore("username")
    const getRequest = usernameStore.getAll()
    getRequest.addEventListener("success", () => {
        res = getRequest.result[0];
        if (res === undefined) {
            console.log(res);
        } else {
            console.log(`Found: ${res.username}`);
        }
    })

    const usernameForm = document.getElementById("usernameForm");

    usernameForm.addEventListener("submit", handleUsernameEntered)
}

const handleUsernameEntered = () => {
    const username = document.getElementById("username").value;
    if (username != "") {
        const usernameIDB = requestIDB.result;
        const transaction = usernameIDB.transaction(["username"], "readwrite");
        const usernameStore = transaction.objectStore("username")
        const addRequest = usernameStore.add({ username: username })

        addRequest.addEventListener("success", () => {
            console.log("Added username")
        });
    }
};

const requestIDB = indexedDB.open("plant");
requestIDB.addEventListener("upgradeneeded", handleUpgrade);
requestIDB.addEventListener("success", handleSuccess);
requestIDB.addEventListener("error", (err) => {
    console.log("Error: " + JSON.stringify(err));
});
