import { openUsernameIDB, getUsername } from './idb-utility.js';

document.addEventListener('DOMContentLoaded', () => {
    openUsernameIDB().then((db) => {
        return getUsername(db);
    }).then((username) => {
        if (username) {
            document.getElementById('username-placeholder').textContent = username;
        } else {
            document.getElementById('username-placeholder').textContent = 'Unknown User';
        }
    }).catch((error) => {
        console.error('Failed to fetch username:', error);
        document.getElementById('username-placeholder').textContent = 'Unknown User';
    });
});