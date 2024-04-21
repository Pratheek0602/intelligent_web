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

// This function would be called to save messages when offline
export function addMessageToSync (messageData){
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
export function getAllMessagesToSync(){
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
