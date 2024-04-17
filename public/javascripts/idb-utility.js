// // This function opens (and creates, if necessary) the IndexedDB for chat messages
// // function openChatIDB() {
// //     return new Promise((resolve, reject) => {
// //       const request = indexedDB.open('chat-messages', 1);
  
// //       request.onupgradeneeded = function(event) {
// //         const db = event.target.result;
// //         // Create an object store called 'messages' with an auto-incrementing key
// //         db.createObjectStore('messages', { autoIncrement: true });
// //       };
  
// //       request.onerror = function(event) {
// //         console.error('Database error:', event.target.errorCode);
// //         reject(event.target.errorCode);
// //       };
  
// //       request.onsuccess = function(event) {
// //         resolve(event.target.result);
// //       };
// //     });
// // }
// function openChatIDB() {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('chat-messages', 1);

//         request.onupgradeneeded = function(event) {
//             const db = event.target.result;
//             if (!db.objectStoreNames.contains('messages')) {
//                 const objectStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
//                 objectStore.createIndex('name', 'name', { unique: false });
//                 objectStore.createIndex('plantId', 'plantId', { unique: false });
//             }
//         };

//         request.onerror = function(event) {
//             console.error('Database error:', event.target.errorCode);
//             reject(event.target.errorCode);
//         };

//         request.onsuccess = function(event) {
//             resolve(event.target.result);
//         };
//     });
// }


// // This function would be called to save messages when offline
// export function addMessageToSync (messageData){
//     return new Promise((resolve, reject) => { // Ensure a promise is always returned
//         openChatIDB().then((db) => {
//             const transaction = db.transaction(['messages'], 'readwrite');
//             const store = transaction.objectStore('messages');
//             const request = store.add(messageData);

//             request.onsuccess = () => {
//                 console.log('Message added to the sync store:', messageData);
//                 resolve(request.result); // Resolve the promise with the result
//             };

//             request.onerror = () => {
//                 console.error('Failed to add message to the sync store:', request.error);
//                 reject(request.error); // Reject the promise with the error
//             };
//         }).catch((error) => {
//             console.error('Failed to open IndexedDB:', error);
//             reject(error); // Ensure any DB opening errors are also caught and handled
//         });
//     });
// };
  
// // Retrieve all messages to sync when coming back online
// export function getAllMessagesToSync(){
//     return new Promise((resolve, reject) => {
//       openChatIDB().then((db) => {
//         const transaction = db.transaction(['messages'], 'readonly');
//         const store = transaction.objectStore('messages');
//         const getAllRequest = store.getAll(); // This method is not supported in IE/Edge
  
//         getAllRequest.onsuccess = function(event) {
//           resolve(event.target.result);
//         };
  
//         getAllRequest.onerror = function(event) {
//           reject(event.target.error);
//         };
//       }).catch((error) => {
//         reject(error);
//       });
//     });
// };

// // Function to delete a message from the sync store in IndexedDB

// // const deleteSyncedMessage = (messageIDB, messageId) => {
// //     return new Promise((resolve, reject) => {
// //         const transaction = messageIDB.transaction(['messages'], 'readwrite');
// //         const store = transaction.objectStore('messages');
// //         const deleteRequest = store.delete(messageId);

// //         deleteRequest.onsuccess = () => {
// //             console.log(`Message with id ${messageId} deleted successfully.`);
// //             resolve();
// //         };

// //         deleteRequest.onerror = (event) => {
// //             console.error(`Error deleting message with id ${messageId}:`, event.target.error);
// //             reject(event.target.error);
// //         };
// //     });
// // };

// const deleteSyncedMessage = (messageIDB, messageId) => {
//   return new Promise((resolve, reject) => {
//       const transaction = messageIDB.transaction(['messages'], 'readwrite');
//       const store = transaction.objectStore('messages');
//       const deleteRequest = store.delete(messageId);

//       deleteRequest.onsuccess = () => {
//           console.log(`Message with id ${messageId} deleted successfully.`);
//           resolve();
//       };

//       deleteRequest.onerror = (event) => {
//           console.error(`Error deleting message with id ${messageId}:`, event.target.error);
//           reject(event.target.error);
//       };
//   });
// };


// // Example usage within syncMessages function
// function syncMessages() {
//     getAllMessagesToSync().then((messagesToSync) => {
//         messagesToSync.forEach((messageData) => {
//             // Attempt to send the message to the server
//             socket.emit('chat:send', messageData, (acknowledgement) => {
//                 // If the message is acknowledged by the server, delete it from IndexedDB
//                 if (acknowledgement.success) {
//                     deleteSyncedMessage(messageIDB, messageData.id);
//                 }
//             });
//         });
//     }).catch((error) => {
//         console.error('Error getting messages to sync:', error);
//     });
// }


// // const openChatIDB = () => {
// //     return new Promise((resolve, reject) => {
// //       // This is the name of your database and the version
// //       const request = indexedDB.open('chat-messages', 1);
  
// //       request.onerror = function(event) {
// //         // Handle errors when opening IndexedDB
// //         console.error('Database error: ', event.target.errorCode);
// //         reject(event.target.errorCode);
// //       };
  
// //       request.onupgradeneeded = function(event) {
// //         // Create an object store for this database
// //         const db = event.target.result;
// //         const objectStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
  
// //         // Create an index to search messages by name
// //         objectStore.createIndex('name', 'name', { unique: false });
// //         // Create an index to search messages by plantId
// //         objectStore.createIndex('plantId', 'plantId', { unique: false });
  
// //         console.log('Database setup complete');
// //       };
  
// //       request.onsuccess = function(event) {
// //         // Database opened successfully
// //         console.log('Database opened successfully');
// //         resolve(event.target.result);
// //       };
// //     });
// //   };



// Directly define functions without using export
export function openChatIDB() {
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

export function addMessageToSync(messageData) {
    return new Promise((resolve, reject) => {
        openChatIDB().then(db => {
            const transaction = db.transaction(['messages'], 'readwrite');
            const store = transaction.objectStore('messages');
            const request = store.add(messageData);
            request.onsuccess = () => {
                console.log('Message added to the sync store:', messageData);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('Failed to add message:', request.error);
                reject(request.error);
            };
        }).catch(error => {
            console.error('Failed to open IndexedDB:', error);
            reject(error);
        });
    });
}

export function getAllMessagesToSync() {
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
}

export function deleteSyncedMessage(db, messageId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const request = store.delete(messageId);
        request.onsuccess = () => {
            console.log(`Message with id ${messageId} deleted successfully.`);
            resolve();
        };
        request.onerror = (event) => {
            console.error(`Error deleting message with id ${messageId}:`, event.target.error);
            reject(event.target.error);
        };
    });
}