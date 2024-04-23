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
                            serviceWorkerRegistration.showNotification("Todo App",
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
        fetch('http://localhost:3000/todos')
            .then(function(res) {
                return res.json();
            }).then(function(newTodos) {
                openTodosIDB().then((db) => {
                    insertTodoInList(db, newTodos)
                    deleteAllExistingTodosFromIDB(db).then(() => {
                        addNewTodosToIDB(db, newTodos).then(() => {
                            console.log("All new todos added to IDB")
                        })
                    });
                });
            });

    } else {
        console.log("Offline mode")
        openTodosIDB().then((db) => {
            getAllTodos(db).then((todos) => {
                for (const todo of todos) {
                    insertTodoInList(todo)
                }
            });
        });

    }
}

const addPlantListings = () => {
    fetch("http://localhost:3000/plants")
        .then(function(res) {
            return res.json();
        }).then(function(data) {
            const plants = data;
            const element = document.getElementxByClassName("plant-cards-container");

            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }

            for (const plant of plants) {
                element.appendChild(createPlantCard(plant));
            }
        });
}

const createPlantCard = (plant) => {
    console.log(plant)
    const newDiv = document.createElement("div");
    newDiv.setAttribute("class", "plant-card");

    newDiv.addEventListener("onclick", () => {
        location.href = `plant?id=${plant._id}`;
    });

    const img = document.createElement("img");
    img.setAttribute("src", plant.photo);

    const caption = document.createElement("figcaption");
    caption.innerHTML = plant.identification.name;

    newDiv.appendChild(img);
    newDiv.appendChild(caption);

    return newDiv;
}

addPlantListings();

