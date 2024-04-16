
// import { addMessageToSync, getAllMessagesToSync } from './idb-utility.js'; 

// Use the install event to pre-cache all initial resources.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing....');
    event.waitUntil((async () => {
        console.log('Service Worker: Caching App Shell at the moment......');
        try {
            const cache = await caches.open("chat-app-shell");
            await cache.addAll([
                '/', // Assuming this serves your chat app's main HTML
                '/stylesheets/form.css', 
                '/stylesheets/plant-details.css',
                '/stylesheets/style.css',
                '/javascripts/chat.js', 
                '/javascripts/idb-utility.js',
                // '../controllers/socket.io.js', 
                // '../views/plant_details.ejs',
                // '../images/app-icon.png', // Any icons or images used in the UI
                // '../manifest.json' // Web app manifest
            ]);
            console.log('Service Worker: App Shell Cached');
        } catch (error) {
            console.error("Error occurred while caching:", error);
        }
    })());
});

// Use this event to activate and clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== "chat-app-shell")
                          .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});

// Fetch event to serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Return cached response if found, fetch from network otherwise
            return cachedResponse || fetch(event.request);
        })
    );
});


self.addEventListener('sync', event => {
    if (event.tag === 'messages') {
        event.waitUntil(syncChatMessages());
    }
    
});

// Function to handle the synchronization of chat messages
// async function syncChatMessages() {
//     try {
//         const db = await openChatIDB();
//         const transaction = db.transaction('messages', 'readwrite');
//         const store = transaction.objectStore('messages');
//         const getAllMessages = store.getAll();

//         getAllMessages.onsuccess = async () => {
//             const messages = getAllMessages.result;
//             for (const message of messages) {
//                 // Attempt to send each message to the server
//                 const response = await fetch('/api/chat/send', {
//                     method: 'POST',
//                     headers: {'Content-Type': 'application/json'},
//                     body: JSON.stringify(message)
//                 });

//                 if (response.ok) {
//                     // If the message is successfully sent, delete it from the store
//                     store.delete(message.id);
//                 }
//             }
//             await transaction.complete;
//         };

//         getAllMessages.onerror = (error) => {
//             console.error('Failed to retrieve stored messages:', error);
//         };
//     } catch (error) {
//         console.error('Failed to open IndexedDB or sync messages:', error);
//     }
// }

// async function syncChatMessages() {
//     console.log("Syncing todos");
//     openChatIDB().then()
//     const db = await openChatIDB();
//     const transaction = db.transaction('messages', 'readwrite');
//     const store = transaction.objectStore('messages');
//     const getAllMessages = store.getAll();

//     getAllMessages.onsuccess = () => {
//         const messages = getAllMessages.result;
//         messages.forEach(message => {
//             fetch('/api/chat/send', {
//                 method: 'POST',
//                 headers: {'Content-Type': 'application/json'},
//                 body: JSON.stringify(message)
//             }).then(response => {
//                 deleteSyncedMessage()
//                 // if (response.ok) {
//                     // If the message is successfully sent, delete it from the store
//                     store.delete(message.id).onsuccess = () => {
//                         console.log(`Message with id ${message.id} sent and deleted from IDB.`);
//                     };
//                 // }
//             }).catch(error => {
//                 console.error('Failed to send message:', error);
//             });
//         });
//     };

//     getAllMessages.onerror = (error) => {
//         console.error('Failed to retrieve stored messages:', error);
//     };

//     // Ensure the transaction completes
//     transaction.oncomplete = () => {
//         console.log('All pending messages have been processed.');
//     };
//     transaction.onerror = (error) => {
//         console.error('Transaction failed:', error);
//     };
// }

async function syncChatMessages() {
    console.log("Hhihihihihihihihihi");
    try {
        const db = await openChatIDB();
        const transaction = db.transaction('messages', 'readwrite');
        const store = transaction.objectStore('messages');
        const getAllMessages = store.getAll();

        getAllMessages.onsuccess = async () => {
            const messages = getAllMessages.result;
            for (const message of messages) {
                try {
                    const response = await fetch('/api/chat/send', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(message)
                    });
                    if (response.ok) {
                        // If the message is successfully sent, delete it from the store
                        await deleteSyncedMessage(db, message.id);
                        console.log(`Message with id ${message.id} sent and deleted from IDB.`);
                        // Optional: Notify the user a message was synced
                        self.registration.showNotification('Message Synced', {
                            body: 'Your chat message was synced successfully!'
                        });
                    }
                } catch (error) {
                    console.error('Failed to send message:', error);
                }
            }
        };

        getAllMessages.onerror = (error) => {
            console.error('Failed to retrieve stored messages:', error);
        };

        // Ensure the transaction completes
        transaction.oncomplete = () => {
            console.log('All pending messages have been processed.');
        };
        transaction.onerror = (error) => {
            console.error('Transaction failed:', error);
        };
    } catch (error) {
        console.error('Failed to open IndexedDB or sync messages:', error);
    }
}
