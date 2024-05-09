import { openPlantsIDB, addNewPlantsToIDB, deleteAllExistingPlantsFromIDB, getAllPlants, syncPlants } from "./idb-utility.js";

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
    if (!navigator.onLine) {
        console.log("Offline mode")
        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                addPlantListings(plants);
            });
        });

    }
    if (navigator.onLine) {
        console.log("Online mode")

        syncPlants()
        
        // var addedPlant = syncPlants()

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

            // console.log("added", addedPlant)
            // if (addedPlant) {
            //     location.reload();
            // }

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

const createQuery = (items) => {
    const query = {
        characteristics: {}
    };


    // TODO:Change this to be a for loop that iterates throught the items
    // and changes the strings to be the related key values in the plants object
    //
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

document.getElementById("plant-features").addEventListener("change", () => {
    const category = document.getElementById("plant-features").value;
    console.log(category);

    if (category !== "select") {
        let items = [category]
        const query = createQuery(items);

        console.log(`Query: ${query}`);

        openPlantsIDB().then((db) => {
            getAllPlants(db).then((plants) => {
                plants = plants.filter((plant) => {
                    for (const obj in query.characteristics) {
                        if (query.characteristics[obj] !== plant.characteristics[obj]) {
                            return false;
                        }
                    }
                    if (query.sunExposure !== plant.sunExposure && query.sunExposure !== undefined) {
                        return false;
                    }
                    return true;
                });

                console.log(`Chosen plants: ${plants}`)

                addPlantListings(plants);
            });
        });

    }
});
