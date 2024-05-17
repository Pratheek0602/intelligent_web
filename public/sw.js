/**
 * Opens the IndexedDB for chat messages.
 * Creates the necessary object store if it doesn't exist.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the IndexedDB database.
 */
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

/**
 * Deletes a synced message from the IndexedDB.
 * @param {IDBDatabase} db - The IndexedDB database.
 * @param {number} messageId - The ID of the message to delete.
 * @returns {Promise<void>} A promise that resolves when the message is deleted successfully.
 */
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
      const cache = await caches.open("app-shell-cache");
      await cache.addAll([
        '/',
        '/stylesheets/form.css',
        '/stylesheets/plant-details.css',
        '/stylesheets/style.css',
        '/javascripts/chat.js',
        '/javascripts/index.js',
        '/javascripts/username.js',
        '/javascripts/idb-utility.js',
        '/javascripts/viewPlant.js',
        '/javascripts/formSubmission.js',
        '/images/plant-image.png',
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

/*
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;  // Serve from cache
      }
      return fetch(event.request).catch(() => {
        // Redirect to offline page when the request fails
        return caches.match('/');
      });
    })
  );
});

*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Try the network
    fetch(event.request)
      .then(function(res) {
        return caches.open("dynamic-cache")
          .then(function(cache) {
            // Put in cache if succeeds
            cache.put(event.request.url, res.clone());
            return res;
          })
      })
      .catch(function() {
        // Fallback to cache
        return caches.match(event.request)
          .then(function(res) {
            if (res === undefined) {
              return caches.match('/');
            }
            return res;
          }
          );
      })
  );
})


/*
self.addEventListener('sync', event => {
  if (event.tag === 'messages') {
    event.waitUntil(syncChatMessages());
  }
  if (event.tag === "listings") {
    // sync chat listings
  }
});
*/

/**
 * Syncs chat messages by sending them to the main application and deleting them from IndexedDB.
 * @returns {Promise<void>} A promise that resolves when all pending messages are processed.
 */
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
