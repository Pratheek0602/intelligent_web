/**
 * Handles the database upgrade event by creating an object store for user data.
 * @param {Event} ev - The upgrade event.
 */
const handleUpgrade = (ev) => {
    const db = ev.target.result;
    db.createObjectStore("user");
    console.log("Upgraded object store");
};

/**
 * Handles the success event of opening the IndexedDB and retrieves the username if it exists.
 */
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

/**
 * Handles the submission of the username form and adds the username to the IndexedDB.
 */
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

// Open the IndexedDB
const requestIDB = indexedDB.open("plant");

// Event listeners for handling different IndexedDB events
requestIDB.addEventListener("upgradeneeded", handleUpgrade);
requestIDB.addEventListener("success", handleSuccess);
requestIDB.addEventListener("error", (err) => {
    console.log("Error: " + JSON.stringify(err));
});
