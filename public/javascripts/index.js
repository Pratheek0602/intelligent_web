import { openPlantsIDB, deleteSyncedPlants, addNewPlantsToIDB, deleteAllExistingPlantsFromIDB, getAllPlants, syncPlants } from "./idb-utility.js";

let currentSort = "date-asc";
/**
 * Variable to store the current query for filtering plants.
 * @type {Object}
 */
let currentQuery;

// Register service worker to control making site work offline
window.onload = function() {
    if (navigator.onLine) {
        syncPlants().then(() => {
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
            deleteSyncedPlants()
        });
    }
    else {
        // Retrieve plant data from IndexedDB when offline
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                addPlantListings(plants);
            });
        });

    }

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: './' })
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
}

/**
 * Adds plant listings to the DOM based on provided plant data.
 * @param {Array<Object>} plants - An array of plant objects.
 */
const addPlantListings = (plants) => {
    const element = document.getElementById("plant-cards-container");
    if (currentQuery != undefined) {
        plants = plants.filter((plant) => {
            for (const obj in currentQuery.characteristics) {
                if (currentQuery.characteristics[obj] !== plant.characteristics[obj]) {
                    return false;
                }
            }
            if (currentQuery.sunExposure !== plant.sunExposure && currentQuery.sunExposure !== undefined) {
                return false;
            }
            return true;
        });
    }

    if (currentSort === "date-desc") {
        plants.sort((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            return aDate - bDate
        });
    } else if (currentSort === "date-asc") {
        plants.sort((b, a) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            return aDate - bDate
        });
    }

    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    for (const plant of plants) {
        element.appendChild(createPlantCard(plant));
    }

};

/**
 * Creates a plant card element based on plant data.
 * @param {Object} plant - Plant data object.
 * @returns {HTMLElement} The plant card element.
 */
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

/**
 * Creates a query object based on selected plant features.
 * @param {Array<string>} items - An array of selected plant features.
 * @returns {Object} The query object.
 */
const createQuery = (items) => {
    const query = {
        characteristics: {}
    };
    // Set characteristics based on selected items
    if (items.includes("with_flower")) {
        query.characteristics.flowers = true;
    } else if (items.includes("without_flower")) {
        query.characteristics.flowers = false;
    };

    if (items.includes("with_leaves")) {
        query.characteristics.leaves = true;
    } else if (items.includes("without_leaves")) {
        query.characteristics.leaves = false;
    };

    if (items.includes("with_fruits")) {
        query.characteristics.fruits = true;
    } else if (items.includes("without_fruits")) {
        query.characteristics.fruits = false;
    };

    if (items.includes("with_thorns")) {
        query.characteristics.thorns = true;
    } else if (items.includes("without_thorns")) {
        query.characteristics.thorns = false;
    };

    if (items.includes("with_seeds")) {
        query.characteristics.seeds = true;
    } else if (items.includes("without_seeds")) {
        query.characteristics.seeds = false;
    };

    if (items.includes("full_sun")) {
        query.sunExposure = "full_sun";
    } else if (items.includes("partial_shade")) {
        query.sunExposure = "partial_shade";
    } else if (items.includes("full_shade")) {
        query.sunExposure = "full_shade";
    };

    return query;
}

// Event listener for sorting by date ascending
document.getElementById("sort-date-asc").addEventListener("click", () => {
    currentSort = "date-asc";
    openPlantsIDB().then((db) => {
        getAllPlants(db).then((plants) => {
            addPlantListings(plants);
        });
    });
})

// Event listener for sorting by date descending
document.getElementById("sort-date-desc").addEventListener("click", () => {
    currentSort = "date-desc";
    openPlantsIDB().then((db) => {
        getAllPlants(db).then((plants) => {
            addPlantListings(plants);
        });
    });
})

// Event listener for filtering by plant features
document.getElementById("plant-features").addEventListener("change", () => {
    const category = document.getElementById("plant-features").value;
    console.log(category);

    if (category !== "select") {
        let items = [category]
        currentQuery = createQuery(items);

        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                addPlantListings(plants);
            });
        });

    }
});
