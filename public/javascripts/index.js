import { openPlantsIDB, addNewPlantsToIDB, deleteAllExistingPlantsFromIDB, getAllPlants } from "./idb-utility.js";

// Register service worker to control making site work offline
window.onload = function() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(function(reg) {
                console.log('Service Worker Registered!', reg);
            })
            .catch(function(err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    // Check if the browser supports the Notification API
    if ("Notification" in window) {
        // Check if the user has granted permission to receive notifications
        if (Notification.permission === "granted") {
            // Notifications are allowed, you can proceed to create notifications
            // Or do whatever you need to do with notifications
        } else if (Notification.permission !== "denied") {
            // If the user hasn't been asked yet or has previously denied permission,
            // you can request permission from the user
            Notification.requestPermission().then(function(permission) {
                // If the user grants permission, you can proceed to create notifications
                if (permission === "granted") {
                    navigator.serviceWorker.ready
                        .then(function(serviceWorkerRegistration) {
                            serviceWorkerRegistration.showNotification("Plant Identification App",
                                { body: "Notifications are enabled!" })
                                .then(r =>
                                    console.log(r)
                                );
                        });
                }
            });
        }
    }
    if (navigator.onLine) {
        fetch('http://localhost:3000/plants')
            .then(function(res) {
                return res.json();
            }).then(function(plants) {
                openPlantsIDB().then((db) => {
                    addPlantListings(plants);
                    deleteAllExistingPlantsFromIDB(db).then(() => {
                        addNewPlantsToIDB(db, plants).then(() => {
                            console.log("All new plants added to IDB")
                        })
                    });
                });
            });

    } else {
        console.log("Offline mode")
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                addPlantListings(plants);
            });
        });

    }
}

const addPlantListings = (plants) => {

    const element = document.getElementById("plant-cards-container");

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    for (const plant of plants) {
        element.appendChild(createPlantCard(plant));
    }
};

const createPlantCard = (plant) => {
    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "plant-card");

    newDiv.setAttribute("onclick", `location.href="/plant?id=${plant._id}"`);

    const img = document.createElement("img");
    img.setAttribute("src", plant.photo);

    const caption = document.createElement("figcaption");
    caption.innerHTML = plant.identification.name;

    newDiv.appendChild(img);
    newDiv.appendChild(caption);

    return newDiv;
}

/*
    <button id="sort-date-asc">Date/Time Ascending</button>
    <button id="sort-date-desc">Date/Time Descending</button>
    <button id="sort-distance">Distance (closest to furthest)</button>
*/


document.getElementById("sort-date-asc").addEventListener("click", () => {
    openPlantsIDB().then((db) => {
        getAllPlants(db).then((plants) => {
            plants.sort((a, b) => {
                const aDate = new Date(a.date);
                const bDate = new Date(b.date);
                return bDate - aDate
            });
            addPlantListings(plants);
        });
    });
})

document.getElementById("sort-date-desc").addEventListener("click", () => {
    openPlantsIDB().then((db) => {
        getAllPlants(db).then((plants) => {
            plants.sort((a, b) => {
                const aDate = new Date(a.date);
                const bDate = new Date(b.date);
                return aDate - bDate
            });
            addPlantListings(plants);
        });
    });
})

