import { addPlantToSync, getAllAddedPlantsToSync, deleteSyncedPlants, syncPlants } from './idb-utility.js';

document.getElementById("add_plant").addEventListener("submit", function(e) {
    e.preventDefault();
    let imageUpload = document.getElementById("upload_photo");
    let image = imageUpload.files[0];

    if (image) {
        let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = () => {
            let base64 = reader.result;
            console.log(base64);
            let base64Input = document.createElement("input");
            base64Input.setAttribute("type", "hidden");
            base64Input.setAttribute("name", "base64Image");
            base64Input.setAttribute("id", "base64Image");
            base64Input.setAttribute("value", base64);
            document.getElementById("add_plant").appendChild(base64Input);

            // Check if the user is online
            if (navigator.onLine) {
				// syncPlants()
                
				document.getElementById("add_plant").submit()
            } else {
                // If offline, store the data in IndexedDB
                storePlantInIDB();
				
				navigator.serviceWorker.ready
				.then(function (serviceWorkerRegistration) {
					serviceWorkerRegistration.showNotification("Plant added while offline!",
						{body: "Please refresh the page when back online..."})
				});

				window.location.href = '/';
            }
        };
        reader.onerror = () => {
            console.log("Error converting image");
        };
    }
});

function storePlantInIDB() {
    let plantData = {
        date: document.getElementById('date_time_seen').value,
		longitude:  document.getElementById('longitude').value,
		latitude:  document.getElementById('latitude').value,
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
