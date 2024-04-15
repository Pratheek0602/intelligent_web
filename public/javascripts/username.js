function handleUpgrade() {
}

function handleSuccess() {
}

const requestIDB = indexedDB.open("todo");
requestIDB.addEventListener("upgradeneeded", handleUpgrade);
requestIDB.addEventListener("success", handleSuccess);
requestIDB.addEventListener("error", (err) => {
    console.log("Error: " + JSON.stringify(err));
});
