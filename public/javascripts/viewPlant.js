import { openUsernameIDB, getUsername } from "./idb-utility.js";

window.onload = function(){
    openUsernameIDB().then((db) => {
        getUsername(db).then((res) => {
            const sessionAuthor = res.value
            const plantAuthor = document.getElementById("plant-user").innerText;
            console.log(plantAuthor)
            if (plantAuthor === sessionAuthor) {
                // Append the update button to the page
                const heading = document.getElementById("update_button_heading");

                // or retrieve the button element by giving it an id
                // and use remove/set attribute to enable/disable it
                const update_button = document.getElementById("update_button");
                update_button.removeAttribute("disabled");
            } else {
                // Don't append the update button to the page

                // Leave the update button disabled
            }
        })
    })
}
