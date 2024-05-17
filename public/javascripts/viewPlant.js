import { openUsernameIDB, getUsername } from "./idb-utility.js";


/**
 * Handles actions when the window is loaded.
 */
window.onload = function() {
    openUsernameIDB().then((db) => {
        getUsername(db).then((res) => {
            const sessionAuthor = res.value;
            const plantAuthor = document.getElementById("plant-user").innerText.trim();
            console.log(`Plant author: ${plantAuthor}`)
            console.log(`Session author: ${sessionAuthor}`)
            if (plantAuthor === sessionAuthor) {
                
                // Append the update button to the page
                const heading = document.getElementById("update_button_heading");
                const update_button = document.getElementById("update_button");
                update_button.removeAttribute("hidden");
            } 
        })
    })
}


