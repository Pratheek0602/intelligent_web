function openChatIDB() {
    console.log("OPEN IDB")
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('chat-messages', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('messages')) {
                db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onerror = function(event) {
            console.error('Database error:', event.target.errorCode);
            reject(event.target.errorCode);
        };
        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
    });
}
// Used to open indexedDB containing plant listings
export function openPlantsIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plants", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('plants', { keyPath: '_id' });
        };

        request.onsuccess = function(event) {
            const db = event.target.result; resolve(db);
        };
    });
}

// Used to open indexedDB containing plant listings
function openAddPlantsIDB() {
    console.log("OPEN PLANT IDB")
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("addPlants", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target.errorCode}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            // Create an object store with autoIncrement set to true
            if (!db.objectStoreNames.contains('addPlants')) {
                db.createObjectStore('addPlants', {autoIncrement: true });
            }
        };

        request.onsuccess = function(event) {
            resolve(event.target.result);
        };
    });
}

export function openUsernameIDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("plant", 1);

        request.onerror = function(event) {
            reject(new Error(`Database error: ${event.target}`));
        };

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            db.createObjectStore('user');
        };

        request.onsuccess = function(event) {
            const db = event.target.result; resolve(db);
        };
    });
}

export function addNewPlantsToIDB(plantIDB, plants) {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"], "readwrite");
        const plantStore = transaction.objectStore("plants");

        const addPromises = plants.map(plant => {
            return new Promise((resolveAdd, rejectAdd) => {
                const addRequest = plantStore.add(plant);
                addRequest.addEventListener("success", () => {
                    console.log("Added " + "#" + addRequest.result + ": " + plant.identification.name);
                    const getRequest = plantStore.get(addRequest.result);
                    getRequest.addEventListener("success", () => {
                        console.log("Found " + JSON.stringify(getRequest.result));
                        resolveAdd(); // Resolve the add promise
                    });
                    getRequest.addEventListener("error", (event) => {
                        rejectAdd(event.target.error); // Reject the add promise if there's an error
                    });
                });
                addRequest.addEventListener("error", (event) => {
                    rejectAdd(event.target.error); // Reject the add promise if there's an error
                });
            });
        });

        // Resolve the main promise when all add operations are completed
        Promise.all(addPromises).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};


export function deleteAllExistingPlantsFromIDB(plantIDB) {
    const transaction = plantIDB.transaction(["plants"], "readwrite");
    const plantStore = transaction.objectStore("plants");
    const clearRequest = plantStore.clear();

    return new Promise((resolve, reject) => {
        clearRequest.addEventListener("success", () => {
            resolve();
        });

        clearRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
};

export function getAllPlants(plantIDB) {
    return new Promise((resolve, reject) => {
        const transaction = plantIDB.transaction(["plants"]);
        const plantStore = transaction.objectStore("plants");
        const getAllRequest = plantStore.getAll();

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

export function getUsername(usernameIDB) {
    return new Promise((resolve, reject) => {
        const transaction = usernameIDB.transaction(["user"]);
        const userStore = transaction.objectStore("user");
        const getAllRequest = userStore.get("username");

        // Handle success event
        getAllRequest.addEventListener("success", (event) => {
            resolve(event.target.result); // Use event.target.result to get the result
        });

        // Handle error event
        getAllRequest.addEventListener("error", (event) => {
            reject(event.target.error);
        });
    });
}

// This function would be called to save messages when offline
export function addMessageToSync(messageData) {
    openChatIDB().then((db) => {
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        store.add(messageData);

        transaction.oncomplete = () => {
            console.log('Message added to the sync store:', messageData);
        };

        transaction.onerror = (event) => {
            console.error('Transaction error:', event.target.errorCode);
        };
    }).catch((error) => {
        console.error('openChatIDB error:', error);
    });
};

// Retrieve all messages to sync when coming back online
export function getAllMessagesToSync() {
    console.log("Gettingg all messages");
    return new Promise((resolve, reject) => {
        openChatIDB().then(db => {
            const transaction = db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('Failed to retrieve messages:', event.target.error);
                reject(event.target.error);
            };
        }).catch(error => {
            console.error('Failed to open IndexedDB:', error);
            reject(error);
        });
    });
};


export function deleteSyncedMessage() {
    console.log("Clearing all messages from IndexedDB");
    return new Promise((resolve, reject) => { // Return a new promise to handle success or error states
        openChatIDB().then((db) => {
            const transaction = db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const clearRequest = store.clear(); // This clears all entries in the 'messages' store.

            clearRequest.onsuccess = () => {
                console.log("All messages have been successfully deleted.");
                resolve(); // Resolve the promise when clearing is successful
            };

            clearRequest.onerror = (event) => {
                console.error("Error clearing messages:", event.target.error);
                reject(event.target.error); // Reject the promise when an error occurs
            };
        }).catch((error) => {
            console.error('Error opening IndexedDB:', error);
            reject(error); // Reject the promise when opening DB fails
        })
    });
};

export function addPlantToSync(plantData) {
    console.log("Attempting to add plant data:", plantData, JSON.stringify(plantData, null, 2));
    openAddPlantsIDB().then(db => {
        const transaction = db.transaction(['addPlants'], 'readwrite');
        const store = transaction.objectStore('addPlants');
        const request = store.add(plantData);

        request.onsuccess = () => {
            console.log('Plant data added to the sync store:', request.result);
        };

        request.onerror = (event) => {
            console.error('Failed to add plant data to the sync store:', event.target.error);
        };
    }).catch(error => {
        console.error('Failed to open IndexedDB:', error);
    });
}

// Retrieve all plants to sync when coming back online
export function getAllAddedPlantsToSync() {
    return new Promise((resolve, reject) => {
        openAddPlantsIDB().then(db => {
            const transaction = db.transaction(['addPlants'], 'readonly');
            const store = transaction.objectStore('addPlants');
            const request = store.getAll();
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('Failed to retrieve messages:', event.target.error);
                reject(event.target.error);
            };
        }).catch(error => {
            console.error('Failed to open IndexedDB:', error);
            reject(error);
        });
    });
};

export function deleteSyncedPlants() {
    console.log("Clearing all messages from IndexedDB");
    return new Promise((resolve, reject) => { // Return a new promise to handle success or error states
        openAddPlantsIDB().then((db) => {
            const transaction = db.transaction(['addPlants'], 'readwrite');
            const store = transaction.objectStore('addPlants');
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => {
                console.log("All new plants have been successfully deleted.");
                resolve(); // Resolve the promise when clearing is successful
            };

            clearRequest.onerror = (event) => {
                console.error("Error clearing messages:", event.target.error);
                reject(event.target.error); // Reject the promise when an error occurs
            };
        }).catch((error) => {
            console.error('Error opening IndexedDB:', error);
            reject(error); // Reject the promise when opening DB fails
        })
    });
};

export function syncPlants(){
    getAllAddedPlantsToSync().then((plantsToSync) => {
        for (const plantData of plantsToSync) {
            const formData = new URLSearchParams();
            
            // let photoUrl;
            // console.log()
            // if (plantData.photo.files.length > 0) {
            //     const filename = plantData.photo.files[0].name;
            //     photoUrl = `/uploads/${filename}`; // Assuming '/uploads' is the URL where images are served
            // }

            formData.append("date_time_seen", plantData.date);
            formData.append("longitude", plantData.longitude);
            formData.append("latitude", plantData.latitude);
            formData.append("description", plantData.description);
            formData.append("plant_height", plantData.size.height);
            formData.append("plant_spread", plantData.size.spread);
            formData.append("checkbox1", plantData.characteristics.flowers);
            formData.append("checkbox2", plantData.characteristics.leaves);
            formData.append("checkbox3", plantData.characteristics.fruits);
            formData.append("checkbox4", plantData.characteristics.thorns);
            formData.append("checkbox5", plantData.characteristics.seeds);
            formData.append("sun_exposure", plantData.sunExposure);
            formData.append("identification_name", plantData.identification.name);
            formData.append("base64Image", plantData.photo);
            formData.append("user_nickname", plantData.user);

            fetch('http://localhost:3000/add-plant', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then(() => {
                console.log('Service Worker: Syncing new Plant: ', formData, ' done');
            }).catch((err) => {
                console.log('Service Worker: Syncing new Plant: ', formData, ' failed');
            });
        };
    },)
    deleteSyncedPlants()
    
}

