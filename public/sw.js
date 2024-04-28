// sw.js
// TODO: Can change this to import all idb functions instead of having in both files.
function openChatIDB() {
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

function deleteSyncedMessage(db, messageId) {
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

self.addEventListener('install', event => {
  console.log('Service Worker: Installing....');

  event.waitUntil((async () => {
    console.log('Service Worker: Caching App Shell at the moment......');

    try {
      const cache = await caches.open("chat-app-shell");
      await cache.addAll([
        '/',
        '/stylesheets/form.css',
        '/stylesheets/plant-details.css',
        '/stylesheets/style.css',
        '/javascripts/chat.js',
        '/javascripts/index.js',
        '/javascripts/username.js',
      ]);
      console.log('Service Worker: App Shell Cached');
    } catch (error) {
      console.error("Error occurred while caching:", error);
    }
  })());
});

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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'messages') {
    event.waitUntil(syncChatMessages());
  }
  if (event.tag === "listings") {
    // sync chat listings
  }
});

async function syncChatMessages() {
  console.log("Starting message synchronization...");

  try {
    const db = await openChatIDB();
    const transaction = db.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const getAllMessages = store.getAll();

    await new Promise((resolve, reject) => {
      getAllMessages.onsuccess = async () => {
        try {
          const messages = getAllMessages.result;
          if (messages.length > 0) {
            // Notify the main application to send the messages
            self.clients.matchAll().then((clients) => {
              for (const client of clients) {
                client.postMessage({
                  type: 'sync-messages',
                  messages: messages,
                });
              }
            });

            // Delete the sent messages from IndexedDB
            for (const message of messages) {
              await deleteSyncedMessage(db, message.id);
              console.log(`Message with id ${message.id} sent and deleted from IDB.`);
            }
          }
          resolve();
        } catch (error) {
          console.error('Error processing messages:', error);
          reject(error);
        }
      };

      getAllMessages.onerror = (error) => {
        console.error('Failed to retrieve stored messages:', error);
        reject(error);
      };
    });

    console.log('All pending messages have been processed.');
  } catch (error) {
    console.error('Failed to open IndexedDB or sync messages:', error);
  }
}


//Create function to sync plant listings
