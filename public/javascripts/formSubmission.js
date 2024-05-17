/**
 * Handles form submission for adding a new plant.
 * - Retrieves image data and base64 encodes it
 * - Stores plant data in IndexedDB if offline
 * - Submits form if online
 * @module AddPlant
*/

import { addPlantToSync, openUsernameIDB, getUsername } from './idb-utility.js';

document.getElementById("add_plant").addEventListener("submit", function(e) {
    e.preventDefault();
    let imageUpload = document.getElementById("upload_photo");
    let image = imageUpload.files[0];

    if (image) {
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            let base64 = reader.result;
            
            let base64Input = document.createElement("input");
            base64Input.setAttribute("type", "hidden");
            base64Input.setAttribute("name", "base64Image");
            base64Input.setAttribute("id", "base64Image");
            base64Input.setAttribute("value", base64);
            document.getElementById("add_plant").appendChild(base64Input);
            const simulatedFilePath= `/public/images/uploads/${image.name}`;

            if (document.getElementById('identification_name').value === "") {
                document.getElementById('identification_name').value = " "
            };

            openUsernameIDB().then((db) => {
                getUsername(db).then((res) => {
                    const sessionAuthor = res.value;

                    let username = document.createElement("input");
                    username.setAttribute("type", "hidden");
                    username.setAttribute("name", "user_nickname");
                    username.setAttribute("id", "user_nickname");
                    username.setAttribute("value", sessionAuthor);
                    document.getElementById("add_plant").appendChild(username);

                    // Check if the user is online
                    if (navigator.onLine) {
                        document.getElementById("add_plant").submit();
                    } else {
                        // If offline, store the data in IndexedDB
                        storePlantInIDB(simulatedFilePath);

                        navigator.serviceWorker.ready
                            .then(function(serviceWorkerRegistration) {
                                serviceWorkerRegistration.showNotification("Plant added while offline!", {
                                    body: "Please refresh the page when back online..."
                                });
                            });

                        window.location.href = '/';
                    }
                });
            });
        };
        reader.onerror = () => {
            console.log("Error converting image");
        };
    }
});

/**
 * Stores plant data in IndexedDB when offline.
 * @function
 * @param {string} simulatedFilePath - The simulated file path for the image.
 */
function storePlantInIDB(simulatedFilePath) {

    // Construct plantData inside the promise
    let plantData = {
        date: document.getElementById('date_time_seen').value,
        longitude: document.getElementById('longitude').value,
        latitude: document.getElementById('latitude').value,
        description: document.getElementById('description').value,
        size: {
            height: document.getElementById('plant_height').value,
            spread: document.getElementById('plant_spread').value
        },
        characteristics: {
            flowers: document.querySelector('[name="flowers"]').checked,
            leaves: document.querySelector('[name="leaves"]').checked,
            fruits: document.querySelector('[name="fruits"]').checked,
            thorns: document.querySelector('[name="thorns"]').checked,
            seeds: document.querySelector('[name="seeds"]').checked
        },
        sunExposure: document.getElementById('sun_exposure').value,
        identification: {
            name: document.getElementById('identification_name').value,
            status: "In Progress",
        },
        photo: document.getElementById('base64Image').value,
        user: document.getElementById('user_nickname').value,
        chatMessages: []
    };

    // Use the IndexedDB utility to store the plant
    addPlantToSync(plantData);

}
